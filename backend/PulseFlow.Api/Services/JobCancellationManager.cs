using System.Collections.Concurrent;

namespace PulseFlow.Api.Services;

public interface IJobCancellationManager
{
    CancellationToken Register(Guid jobId, CancellationToken stoppingToken);
    bool Cancel(Guid jobId);
    void Unregister(Guid jobId);
}

public class JobCancellationManager : IJobCancellationManager
{
    private readonly ConcurrentDictionary<Guid, CancellationTokenSource> _sources = new();

    public CancellationToken Register(Guid jobId, CancellationToken stoppingToken)
    {
        var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
        _sources[jobId] = linkedCts;
        return linkedCts.Token;
    }

    public bool Cancel(Guid jobId)
    {
        if (_sources.TryGetValue(jobId, out var cts))
        {
            try
            {
                cts.Cancel();
                return true;
            }
            catch (ObjectDisposedException)
            {
                return false;
            }
        }
        return false;
    }

    public void Unregister(Guid jobId)
    {
        if (_sources.TryRemove(jobId, out var cts))
        {
            cts.Dispose();
        }
    }
}
