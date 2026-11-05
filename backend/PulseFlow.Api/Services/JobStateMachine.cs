using PulseFlow.Api.Models;

namespace PulseFlow.Api.Services;

public static class JobStateMachine
{
    private static readonly HashSet<JobStatus> TerminalStatuses =
    [
        JobStatus.Succeeded,
        JobStatus.Failed,
        JobStatus.Canceled
    ];

    public static bool IsTerminal(JobStatus status) => TerminalStatuses.Contains(status);

    public static bool CanTransition(JobStatus currentStatus, JobStatus targetStatus)
    {
        if (currentStatus == targetStatus)
        {
            return false;
        }

        if (IsTerminal(currentStatus))
        {
            return false;
        }

        return (currentStatus, targetStatus) switch
        {
            (JobStatus.Queued, JobStatus.Running) => true,
            (JobStatus.Queued, JobStatus.Canceled) => true,
            (JobStatus.Queued, JobStatus.Failed) => true,
            (JobStatus.Running, JobStatus.Succeeded) => true,
            (JobStatus.Running, JobStatus.Failed) => true,
            (JobStatus.Running, JobStatus.Canceled) => true,
            _ => false
        };
    }

    public static void TransitionTo(Job job, JobStatus targetStatus, string? errorMessage = null)
    {
        ArgumentNullException.ThrowIfNull(job);

        if (!CanTransition(job.Status, targetStatus))
        {
            throw new InvalidOperationException(
                $"Invalid job state transition from '{job.Status}' to '{targetStatus}' for job {job.Id}.");
        }

        job.Status = targetStatus;

        switch (targetStatus)
        {
            case JobStatus.Running:
                job.StartedAt ??= DateTime.UtcNow;
                break;

            case JobStatus.Succeeded:
                job.Progress = 100;
                job.CompletedAt ??= DateTime.UtcNow;
                break;

            case JobStatus.Failed:
                job.CompletedAt ??= DateTime.UtcNow;
                job.ErrorMessage = errorMessage;
                break;

            case JobStatus.Canceled:
                job.CompletedAt ??= DateTime.UtcNow;
                job.ErrorMessage = errorMessage ?? "Job was canceled.";
                break;
        }
    }

    public static void UpdateProgress(Job job, int progress)
    {
        ArgumentNullException.ThrowIfNull(job);

        if (job.Status != JobStatus.Running)
        {
            throw new InvalidOperationException(
                $"Cannot update progress for job {job.Id} with status '{job.Status}'. Progress can only be updated when Running.");
        }

        if (progress < 0 || progress > 100)
        {
            throw new ArgumentOutOfRangeException(
                nameof(progress), progress, "Progress must be between 0 and 100.");
        }

        job.Progress = progress;
    }
}
