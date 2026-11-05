using PulseFlow.Api.Services;

namespace PulseFlow.Tests;

public class JobCancellationManagerTests
{
    [Fact]
    public void Cancel_CancelsLinkedToken()
    {
        var manager = new JobCancellationManager();
        var jobId = Guid.NewGuid();
        using var cts = new CancellationTokenSource();

        var token = manager.Register(jobId, cts.Token);
        Assert.False(token.IsCancellationRequested);

        var result = manager.Cancel(jobId);
        Assert.True(result);
        Assert.True(token.IsCancellationRequested);
    }

    [Fact]
    public void Cancel_NonExistentJob_ReturnsFalse()
    {
        var manager = new JobCancellationManager();
        var result = manager.Cancel(Guid.NewGuid());
        Assert.False(result);
    }

    [Fact]
    public void Unregister_DisposesAndRemovesSource()
    {
        var manager = new JobCancellationManager();
        var jobId = Guid.NewGuid();
        using var cts = new CancellationTokenSource();

        manager.Register(jobId, cts.Token);
        manager.Unregister(jobId);

        var result = manager.Cancel(jobId);
        Assert.False(result);
    }
}
