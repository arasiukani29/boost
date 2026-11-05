using Microsoft.AspNetCore.SignalR;
using PulseFlow.Api.Hubs;
using PulseFlow.Api.Models;

namespace PulseFlow.Api.Services;

public class JobNotificationService : IJobNotificationService
{
    private readonly IHubContext<PulseHub> _hubContext;
    private readonly ILogger<JobNotificationService> _logger;

    public JobNotificationService(IHubContext<PulseHub> hubContext, ILogger<JobNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyStatusChangedAsync(Job job, CancellationToken ct = default)
    {
        _logger.LogInformation("Broadcasting status transition for job {JobId} -> {Status}", job.Id, job.Status);

        await _hubContext.Clients.All.SendAsync("JobStatusChanged", job, ct);
        await _hubContext.Clients.All.SendAsync("JobStatusUpdated", job, ct);
        await _hubContext.Clients.All.SendAsync("StatusChanged", job, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("JobStatusChanged", job, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("JobStatusUpdated", job, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("StatusChanged", job, ct);
    }

    public async Task NotifyProgressAsync(Job job, CancellationToken ct = default)
    {
        _logger.LogDebug("Broadcasting progress tick for job {JobId} -> {Progress}%", job.Id, job.Progress);

        var tickData = new { jobId = job.Id, progress = job.Progress, status = job.Status.ToString() };
        await _hubContext.Clients.All.SendAsync("JobProgressUpdated", job, ct);
        await _hubContext.Clients.All.SendAsync("JobProgressChanged", job, ct);
        await _hubContext.Clients.All.SendAsync("JobProgressTick", tickData, ct);
        await _hubContext.Clients.All.SendAsync("ProgressTick", tickData, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("JobProgressUpdated", job, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("JobProgressChanged", job, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("JobProgressTick", tickData, ct);
        await _hubContext.Clients.Group($"job-{job.Id}").SendAsync("ProgressTick", tickData, ct);
    }
}
