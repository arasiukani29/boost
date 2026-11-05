using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PulseFlow.Api.Data;
using PulseFlow.Api.Hubs;
using PulseFlow.Api.Models;
using PulseFlow.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization for enums
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Configure CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
    options.AddPolicy("PulseFlowCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure EF Core SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=pulseflow.db";
builder.Services.AddDbContext<PulseFlowDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

// Register services and repository
builder.Services.AddScoped<IJobRepository, JobRepository>();
builder.Services.AddScoped<IJobNotificationService, JobNotificationService>();
builder.Services.AddSingleton<IJobCancellationManager, JobCancellationManager>();

// Register SignalR
builder.Services.AddSignalR().AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Register background job processor
builder.Services.AddHostedService<JobProcessorBackgroundService>();

// Add OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure SQLite database is created and initialized
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PulseFlowDbContext>();
    dbContext.Database.EnsureCreated();
}

// Pipeline configuration
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("PulseFlowCorsPolicy");

// SignalR Hub endpoints
app.MapHub<PulseHub>("/pulseHub").RequireCors("PulseFlowCorsPolicy");
app.MapHub<PulseHub>("/hubs/pulse").RequireCors("PulseFlowCorsPolicy");

// API Endpoints
var jobsApi = app.MapGroup("/api/jobs");

// 1. Trigger job
jobsApi.MapPost("/", async (CreateJobRequest? request, IJobRepository repository, IJobNotificationService notifier) =>
{
    var jobName = string.IsNullOrWhiteSpace(request?.Name)
        ? $"Job-{DateTime.UtcNow:yyyyMMdd-HHmmss}"
        : request.Name.Trim();

    var job = new Job
    {
        Id = Guid.NewGuid(),
        Name = jobName,
        Status = JobStatus.Queued,
        Progress = 0,
        CreatedAt = DateTime.UtcNow
    };

    await repository.CreateAsync(job);
    await notifier.NotifyStatusChangedAsync(job);

    return Results.Created($"/api/jobs/{job.Id}", job);
}).WithName("TriggerJob");

jobsApi.MapPost("/trigger", async (CreateJobRequest? request, IJobRepository repository, IJobNotificationService notifier) =>
{
    var jobName = string.IsNullOrWhiteSpace(request?.Name)
        ? $"Job-{DateTime.UtcNow:yyyyMMdd-HHmmss}"
        : request.Name.Trim();

    var job = new Job
    {
        Id = Guid.NewGuid(),
        Name = jobName,
        Status = JobStatus.Queued,
        Progress = 0,
        CreatedAt = DateTime.UtcNow
    };

    await repository.CreateAsync(job);
    await notifier.NotifyStatusChangedAsync(job);

    return Results.Created($"/api/jobs/{job.Id}", job);
}).WithName("TriggerJobAlias");

// 2. Cancel job
jobsApi.MapPost("/{id:guid}/cancel", async (Guid id, CancelJobRequest? request, IJobRepository repository, IJobCancellationManager cancellationManager, IJobNotificationService notifier) =>
{
    var job = await repository.GetByIdAsync(id);
    if (job == null)
    {
        return Results.NotFound(new { message = $"Job with ID '{id}' was not found." });
    }

    if (JobStateMachine.IsTerminal(job.Status))
    {
        return Results.BadRequest(new { message = $"Cannot cancel job in terminal state '{job.Status}'." });
    }

    JobStateMachine.TransitionTo(job, JobStatus.Canceled, request?.Reason ?? "Canceled by user request.");
    await repository.UpdateAsync(job);
    cancellationManager.Cancel(id);
    await notifier.NotifyStatusChangedAsync(job);

    return Results.Ok(job);
}).WithName("CancelJob");

jobsApi.MapPut("/{id:guid}/cancel", async (Guid id, CancelJobRequest? request, IJobRepository repository, IJobCancellationManager cancellationManager, IJobNotificationService notifier) =>
{
    var job = await repository.GetByIdAsync(id);
    if (job == null)
    {
        return Results.NotFound(new { message = $"Job with ID '{id}' was not found." });
    }

    if (JobStateMachine.IsTerminal(job.Status))
    {
        return Results.BadRequest(new { message = $"Cannot cancel job in terminal state '{job.Status}'." });
    }

    JobStateMachine.TransitionTo(job, JobStatus.Canceled, request?.Reason ?? "Canceled by user request.");
    await repository.UpdateAsync(job);
    cancellationManager.Cancel(id);
    await notifier.NotifyStatusChangedAsync(job);

    return Results.Ok(job);
}).WithName("CancelJobPutAlias");

// 3. Query job history / all jobs
jobsApi.MapGet("/", async ([FromQuery] string? status, IJobRepository repository) =>
{
    if (!string.IsNullOrWhiteSpace(status))
    {
        if (Enum.TryParse<JobStatus>(status, true, out var parsedStatus))
        {
            var filteredJobs = await repository.GetByStatusAsync(parsedStatus);
            return Results.Ok(filteredJobs);
        }
        return Results.BadRequest(new { message = $"Invalid status '{status}'. Valid values are: {string.Join(", ", Enum.GetNames<JobStatus>())}" });
    }

    var allJobs = await repository.GetAllAsync();
    return Results.Ok(allJobs);
}).WithName("GetJobs");

jobsApi.MapGet("/history", async ([FromQuery] string? status, IJobRepository repository) =>
{
    if (!string.IsNullOrWhiteSpace(status))
    {
        if (Enum.TryParse<JobStatus>(status, true, out var parsedStatus))
        {
            var filteredJobs = await repository.GetByStatusAsync(parsedStatus);
            return Results.Ok(filteredJobs);
        }
        return Results.BadRequest(new { message = $"Invalid status '{status}'. Valid values are: {string.Join(", ", Enum.GetNames<JobStatus>())}" });
    }

    var history = await repository.GetAllAsync();
    return Results.Ok(history);
}).WithName("GetJobHistory");

// 4. Query job by ID
jobsApi.MapGet("/{id:guid}", async (Guid id, IJobRepository repository) =>
{
    var job = await repository.GetByIdAsync(id);
    return job != null
        ? Results.Ok(job)
        : Results.NotFound(new { message = $"Job with ID '{id}' was not found." });
}).WithName("GetJobById");

app.Run();

// Required for WebApplicationFactory in integration tests if needed
public partial class Program { }
