using PulseFlow.Api.Models;
using PulseFlow.Api.Services;

namespace PulseFlow.Tests;

public class JobStateMachineTests
{
    [Fact]
    public void Job_InitialState_IsQueuedWithZeroProgressAndNoTimestamps()
    {
        var job = new Job { Name = "Test Job" };

        Assert.NotEqual(Guid.Empty, job.Id);
        Assert.Equal("Test Job", job.Name);
        Assert.Equal(JobStatus.Queued, job.Status);
        Assert.Equal(0, job.Progress);
        Assert.Null(job.StartedAt);
        Assert.Null(job.CompletedAt);
        Assert.Null(job.ErrorMessage);
        Assert.True(job.CreatedAt <= DateTime.UtcNow);
    }

    [Theory]
    [InlineData(JobStatus.Queued, JobStatus.Running)]
    [InlineData(JobStatus.Queued, JobStatus.Canceled)]
    [InlineData(JobStatus.Queued, JobStatus.Failed)]
    [InlineData(JobStatus.Running, JobStatus.Succeeded)]
    [InlineData(JobStatus.Running, JobStatus.Failed)]
    [InlineData(JobStatus.Running, JobStatus.Canceled)]
    public void CanTransition_ValidTransitions_ReturnsTrue(JobStatus from, JobStatus to)
    {
        var result = JobStateMachine.CanTransition(from, to);
        Assert.True(result);
    }

    [Theory]
    [InlineData(JobStatus.Queued, JobStatus.Succeeded)]
    [InlineData(JobStatus.Queued, JobStatus.Queued)]
    [InlineData(JobStatus.Running, JobStatus.Queued)]
    [InlineData(JobStatus.Running, JobStatus.Running)]
    [InlineData(JobStatus.Succeeded, JobStatus.Queued)]
    [InlineData(JobStatus.Succeeded, JobStatus.Running)]
    [InlineData(JobStatus.Succeeded, JobStatus.Failed)]
    [InlineData(JobStatus.Succeeded, JobStatus.Canceled)]
    [InlineData(JobStatus.Failed, JobStatus.Queued)]
    [InlineData(JobStatus.Failed, JobStatus.Running)]
    [InlineData(JobStatus.Failed, JobStatus.Succeeded)]
    [InlineData(JobStatus.Failed, JobStatus.Canceled)]
    [InlineData(JobStatus.Canceled, JobStatus.Queued)]
    [InlineData(JobStatus.Canceled, JobStatus.Running)]
    [InlineData(JobStatus.Canceled, JobStatus.Succeeded)]
    [InlineData(JobStatus.Canceled, JobStatus.Failed)]
    public void CanTransition_InvalidTransitions_ReturnsFalse(JobStatus from, JobStatus to)
    {
        var result = JobStateMachine.CanTransition(from, to);
        Assert.False(result);
    }

    [Fact]
    public void TransitionTo_QueuedToRunning_SetsStartedAtAndStatus()
    {
        var job = new Job { Status = JobStatus.Queued };

        JobStateMachine.TransitionTo(job, JobStatus.Running);

        Assert.Equal(JobStatus.Running, job.Status);
        Assert.NotNull(job.StartedAt);
        Assert.Null(job.CompletedAt);
    }

    [Fact]
    public void TransitionTo_RunningToSucceeded_SetsCompletedAtAndProgressTo100()
    {
        var job = new Job { Status = JobStatus.Running, Progress = 40, StartedAt = DateTime.UtcNow };

        JobStateMachine.TransitionTo(job, JobStatus.Succeeded);

        Assert.Equal(JobStatus.Succeeded, job.Status);
        Assert.Equal(100, job.Progress);
        Assert.NotNull(job.CompletedAt);
    }

    [Fact]
    public void TransitionTo_RunningToFailed_SetsCompletedAtAndErrorMessage()
    {
        var job = new Job { Status = JobStatus.Running, StartedAt = DateTime.UtcNow };

        JobStateMachine.TransitionTo(job, JobStatus.Failed, "Out of memory exception");

        Assert.Equal(JobStatus.Failed, job.Status);
        Assert.Equal("Out of memory exception", job.ErrorMessage);
        Assert.NotNull(job.CompletedAt);
    }

    [Fact]
    public void TransitionTo_QueuedToCanceled_SetsCompletedAtAndDefaultErrorMessage()
    {
        var job = new Job { Status = JobStatus.Queued };

        JobStateMachine.TransitionTo(job, JobStatus.Canceled);

        Assert.Equal(JobStatus.Canceled, job.Status);
        Assert.Equal("Job was canceled.", job.ErrorMessage);
        Assert.NotNull(job.CompletedAt);
    }

    [Fact]
    public void TransitionTo_RunningToCanceled_WithCustomReason_SetsCustomReason()
    {
        var job = new Job { Status = JobStatus.Running, StartedAt = DateTime.UtcNow };

        JobStateMachine.TransitionTo(job, JobStatus.Canceled, "User requested cancellation");

        Assert.Equal(JobStatus.Canceled, job.Status);
        Assert.Equal("User requested cancellation", job.ErrorMessage);
        Assert.NotNull(job.CompletedAt);
    }

    [Theory]
    [InlineData(JobStatus.Queued, JobStatus.Succeeded)]
    [InlineData(JobStatus.Succeeded, JobStatus.Running)]
    [InlineData(JobStatus.Failed, JobStatus.Running)]
    [InlineData(JobStatus.Canceled, JobStatus.Running)]
    public void TransitionTo_InvalidTransitions_ThrowsInvalidOperationException(JobStatus from, JobStatus to)
    {
        var job = new Job { Status = from };

        var ex = Assert.Throws<InvalidOperationException>(() => JobStateMachine.TransitionTo(job, to));
        Assert.Contains(from.ToString(), ex.Message);
        Assert.Contains(to.ToString(), ex.Message);
    }

    [Fact]
    public void TransitionTo_NullJob_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => JobStateMachine.TransitionTo(null!, JobStatus.Running));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(50)]
    [InlineData(75)]
    [InlineData(100)]
    public void UpdateProgress_WhenRunning_UpdatesProgressSuccessfully(int progress)
    {
        var job = new Job { Status = JobStatus.Running, StartedAt = DateTime.UtcNow };

        JobStateMachine.UpdateProgress(job, progress);

        Assert.Equal(progress, job.Progress);
    }

    [Theory]
    [InlineData(JobStatus.Queued)]
    [InlineData(JobStatus.Succeeded)]
    [InlineData(JobStatus.Failed)]
    [InlineData(JobStatus.Canceled)]
    public void UpdateProgress_WhenNotRunning_ThrowsInvalidOperationException(JobStatus status)
    {
        var job = new Job { Status = status };

        var ex = Assert.Throws<InvalidOperationException>(() => JobStateMachine.UpdateProgress(job, 50));
        Assert.Contains("Progress can only be updated when Running", ex.Message);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-50)]
    [InlineData(101)]
    [InlineData(500)]
    public void UpdateProgress_OutOfBounds_ThrowsArgumentOutOfRangeException(int progress)
    {
        var job = new Job { Status = JobStatus.Running, StartedAt = DateTime.UtcNow };

        Assert.Throws<ArgumentOutOfRangeException>(() => JobStateMachine.UpdateProgress(job, progress));
    }

    [Fact]
    public void UpdateProgress_NullJob_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => JobStateMachine.UpdateProgress(null!, 50));
    }

    [Theory]
    [InlineData(JobStatus.Succeeded, true)]
    [InlineData(JobStatus.Failed, true)]
    [InlineData(JobStatus.Canceled, true)]
    [InlineData(JobStatus.Queued, false)]
    [InlineData(JobStatus.Running, false)]
    public void IsTerminal_IdentifiesTerminalStatesCorrectly(JobStatus status, bool expectedTerminal)
    {
        var result = JobStateMachine.IsTerminal(status);
        Assert.Equal(expectedTerminal, result);
    }
}
