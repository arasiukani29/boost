using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using PulseFlow.Api.Models;
using PulseFlow.Api.Services;

namespace PulseFlow.Tests;

public class PulseHubTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public PulseHubTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PulseHub_ConnectsSuccessfully()
    {
        var hubConnection = new HubConnectionBuilder()
            .WithUrl("http://localhost/pulseHub", options =>
            {
                options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
            })
            .Build();

        await hubConnection.StartAsync();
        Assert.Equal(HubConnectionState.Connected, hubConnection.State);

        await hubConnection.StopAsync();
    }

    [Fact]
    public async Task PulseHub_ReceivesStatusTransitionsAndProgressTicks()
    {
        var hubConnection = new HubConnectionBuilder()
            .WithUrl("http://localhost/pulseHub", options =>
            {
                options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
            })
            .Build();

        var statusTcs = new TaskCompletionSource<JobStatus>(TaskCreationOptions.RunContinuationsAsynchronously);
        var progressTcs = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);

        hubConnection.On<Job>("JobStatusChanged", job =>
        {
            if (job.Status == JobStatus.Running)
            {
                statusTcs.TrySetResult(job.Status);
            }
        });

        hubConnection.On<Job>("JobProgressUpdated", job =>
        {
            if (job.Progress == 50)
            {
                progressTcs.TrySetResult(job.Progress);
            }
        });

        await hubConnection.StartAsync();

        using (var scope = _factory.Services.CreateScope())
        {
            var notifier = scope.ServiceProvider.GetRequiredService<IJobNotificationService>();
            var testJob = new Job
            {
                Id = Guid.NewGuid(),
                Name = "Live SignalR Test Job",
                Status = JobStatus.Running,
                Progress = 50,
                StartedAt = DateTime.UtcNow
            };

            await notifier.NotifyStatusChangedAsync(testJob);
            await notifier.NotifyProgressAsync(testJob);
        }

        var completedStatusTask = await Task.WhenAny(statusTcs.Task, Task.Delay(5000));
        var completedProgressTask = await Task.WhenAny(progressTcs.Task, Task.Delay(5000));

        Assert.Same(statusTcs.Task, completedStatusTask);
        Assert.Same(progressTcs.Task, completedProgressTask);

        Assert.Equal(JobStatus.Running, await statusTcs.Task);
        Assert.Equal(50, await progressTcs.Task);

        await hubConnection.StopAsync();
    }

    [Fact]
    public async Task PulseHub_GroupSubscription_ReceivesJobSpecificUpdates()
    {
        var hubConnection = new HubConnectionBuilder()
            .WithUrl("http://localhost/pulseHub", options =>
            {
                options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
            })
            .Build();

        var jobId = Guid.NewGuid();
        var groupProgressTcs = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);

        hubConnection.On<Job>("JobProgressUpdated", job =>
        {
            if (job.Id == jobId && job.Progress == 100)
            {
                groupProgressTcs.TrySetResult(job.Progress);
            }
        });

        await hubConnection.StartAsync();
        await hubConnection.InvokeAsync("SubscribeToJob", jobId.ToString());

        using (var scope = _factory.Services.CreateScope())
        {
            var notifier = scope.ServiceProvider.GetRequiredService<IJobNotificationService>();
            var testJob = new Job
            {
                Id = jobId,
                Name = "Group Test Job",
                Status = JobStatus.Succeeded,
                Progress = 100,
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow
            };

            await notifier.NotifyProgressAsync(testJob);
        }

        var completed = await Task.WhenAny(groupProgressTcs.Task, Task.Delay(5000));
        Assert.Same(groupProgressTcs.Task, completed);
        Assert.Equal(100, await groupProgressTcs.Task);

        await hubConnection.InvokeAsync("UnsubscribeFromJob", jobId.ToString());
        await hubConnection.StopAsync();
    }
}
