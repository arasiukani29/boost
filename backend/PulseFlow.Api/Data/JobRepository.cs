using Microsoft.EntityFrameworkCore;
using PulseFlow.Api.Models;

namespace PulseFlow.Api.Data;

public class JobRepository : IJobRepository
{
    private readonly PulseFlowDbContext _context;

    public JobRepository(PulseFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Jobs.FindAsync([id], cancellationToken: ct);
    }

    public async Task<IReadOnlyList<Job>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Jobs
            .AsNoTracking()
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Job>> GetByStatusAsync(JobStatus status, CancellationToken ct = default)
    {
        return await _context.Jobs
            .AsNoTracking()
            .Where(j => j.Status == status)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Job?> GetNextQueuedJobAsync(CancellationToken ct = default)
    {
        return await _context.Jobs
            .Where(j => j.Status == JobStatus.Queued)
            .OrderBy(j => j.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<Job> CreateAsync(Job job, CancellationToken ct = default)
    {
        _context.Jobs.Add(job);
        await _context.SaveChangesAsync(ct);
        return job;
    }

    public async Task UpdateAsync(Job job, CancellationToken ct = default)
    {
        _context.Jobs.Update(job);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var job = await _context.Jobs.FindAsync([id], cancellationToken: ct);
        if (job == null)
        {
            return false;
        }

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
