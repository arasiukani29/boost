using PulseFlow.Api.Data;
using PulseFlow.Api.Models;

namespace PulseFlow.Api.Services;

public class JobProcessorBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IJobCancellationManager _cancellationManager;
    private readonly ILogger<JobProcessorBackgroundService> _logger;

    public JobProcessorBackgroundService(
        IServiceScopeFactory scopeFactory,
        IJobCancellationManager cancellationManager,
        ILogger<JobProcessorBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _cancellationManager = cancellationManager;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("JobProcessorBackgroundService started.");

        await RecoverOrphanedRunningJobsAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var processed = await ProcessNextJobAsync(stoppingToken);
                if (!processed)
                {
                    await Task.Delay(500, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in JobProcessorBackgroundService loop.");
                await Task.Delay(1000, stoppingToken);
            }
        }

        _logger.LogInformation("JobProcessorBackgroundService stopped.");
    }

    private async Task RecoverOrphanedRunningJobsAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<IJobRepository>();
            var notifier = scope.ServiceProvider.GetRequiredService<IJobNotificationService>();

            var runningJobs = await repository.GetByStatusAsync(JobStatus.Running, stoppingToken);
            foreach (var runningJob in runningJobs)
            {
                _logger.LogWarning("Found orphaned running job {JobId} on startup. Marking as Failed.", runningJob.Id);
                JobStateMachine.TransitionTo(runningJob, JobStatus.Failed, "Job execution was interrupted by server restart.");
                await repository.UpdateAsync(runningJob, stoppingToken);
                await notifier.NotifyStatusChangedAsync(runningJob, stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // shutdown requested
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while recovering orphaned running jobs on startup.");
        }
    }

    private async Task<bool> ProcessNextJobAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IJobRepository>();
        var notifier = scope.ServiceProvider.GetRequiredService<IJobNotificationService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<PulseFlowDbContext>();

        var job = await repository.GetNextQueuedJobAsync(stoppingToken);
        if (job == null)
        {
            return false;
        }

        _logger.LogInformation("Picked up queued job: {JobId} ({JobName})", job.Id, job.Name);

        // Transition from Queued to Running
        JobStateMachine.TransitionTo(job, JobStatus.Running);
        await repository.UpdateAsync(job, stoppingToken);
        await notifier.NotifyStatusChangedAsync(job, stoppingToken);

        var jobToken = _cancellationManager.Register(job.Id, stoppingToken);

        try
        {
            // Simulate workload dispatching progress updates every 500ms
            for (int step = 1; step <= 10; step++)
            {
                await Task.Delay(500, jobToken);
                jobToken.ThrowIfCancellationRequested();

                // Check simulated failure condition
                if (job.Name.Contains("fail", StringComparison.OrdinalIgnoreCase) && step == 5)
                {
                    JobStateMachine.TransitionTo(job, JobStatus.Failed, "Simulated workload execution failed.");
                    await repository.UpdateAsync(job, CancellationToken.None);
                    await notifier.NotifyStatusChangedAsync(job, CancellationToken.None);
                    return true;
                }

                int progress = step * 10;
                if (progress >= 100)
                {
                    JobStateMachine.TransitionTo(job, JobStatus.Succeeded);
                    await repository.UpdateAsync(job, stoppingToken);
                    await notifier.NotifyProgressAsync(job, stoppingToken);
                    await notifier.NotifyStatusChangedAsync(job, stoppingToken);
                }
                else
                {
                    JobStateMachine.UpdateProgress(job, progress);
                    await repository.UpdateAsync(job, stoppingToken);
                    await notifier.NotifyProgressAsync(job, stoppingToken);
                }
            }
        }
        catch (OperationCanceledException) when (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Job {JobId} execution was canceled.", job.Id);

            try
            {
                await dbContext.Entry(job).ReloadAsync(CancellationToken.None);
                if (job.Status != JobStatus.Canceled)
                {
                    JobStateMachine.TransitionTo(job, JobStatus.Canceled, "Job execution was canceled.");
                    await repository.UpdateAsync(job, CancellationToken.None);
                    await notifier.NotifyStatusChangedAsync(job, CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update cancellation state for job {JobId}.", job.Id);
            }
        }
        catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogError(ex, "Unexpected error occurred during execution of job {JobId}.", job.Id);
            try
            {
                await dbContext.Entry(job).ReloadAsync(CancellationToken.None);
                if (!JobStateMachine.IsTerminal(job.Status))
                {
                    JobStateMachine.TransitionTo(job, JobStatus.Failed, ex.Message);
                    await repository.UpdateAsync(job, CancellationToken.None);
                    await notifier.NotifyStatusChangedAsync(job, CancellationToken.None);
                }
            }
            catch (Exception innerEx)
            {
                _logger.LogError(innerEx, "Failed to persist failure status for job {JobId}.", job.Id);
            }
        }
        finally
        {
            _cancellationManager.Unregister(job.Id);
        }

        return true;
    }
}
