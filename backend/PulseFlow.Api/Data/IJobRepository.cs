using PulseFlow.Api.Models;

namespace PulseFlow.Api.Data;

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Job>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Job>> GetByStatusAsync(JobStatus status, CancellationToken ct = default);
    Task<Job?> GetNextQueuedJobAsync(CancellationToken ct = default);
    Task<Job> CreateAsync(Job job, CancellationToken ct = default);
    Task UpdateAsync(Job job, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
