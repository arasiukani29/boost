using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using PulseFlow.Api.Data;
using PulseFlow.Api.Models;

namespace PulseFlow.Tests;

public class JobRepositoryTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly PulseFlowDbContext _context;
    private readonly JobRepository _repository;

    public JobRepositoryTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<PulseFlowDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new PulseFlowDbContext(options);
        _context.Database.EnsureCreated();

        _repository = new JobRepository(_context);
    }

    [Fact]
    public async Task CreateAsync_And_GetByIdAsync_WorkCorrectly()
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            Name = "Batch Importer",
            Status = JobStatus.Queued,
            Progress = 0,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(job);
        Assert.Equal(job.Id, created.Id);

        var retrieved = await _repository.GetByIdAsync(job.Id);
        Assert.NotNull(retrieved);
        Assert.Equal("Batch Importer", retrieved.Name);
        Assert.Equal(JobStatus.Queued, retrieved.Status);
    }

    [Fact]
    public async Task GetNextQueuedJobAsync_ReturnsOldestQueuedJob()
    {
        var olderJob = new Job
        {
            Id = Guid.NewGuid(),
            Name = "Older Job",
            Status = JobStatus.Queued,
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        };

        var newerJob = new Job
        {
            Id = Guid.NewGuid(),
            Name = "Newer Job",
            Status = JobStatus.Queued,
            CreatedAt = DateTime.UtcNow.AddMinutes(-5)
        };

        var runningJob = new Job
        {
            Id = Guid.NewGuid(),
            Name = "Running Job",
            Status = JobStatus.Running,
            CreatedAt = DateTime.UtcNow.AddMinutes(-20)
        };

        await _repository.CreateAsync(newerJob);
        await _repository.CreateAsync(runningJob);
        await _repository.CreateAsync(olderJob);

        var next = await _repository.GetNextQueuedJobAsync();
        Assert.NotNull(next);
        Assert.Equal(olderJob.Id, next.Id);
        Assert.Equal("Older Job", next.Name);
    }

    [Fact]
    public async Task GetByStatusAsync_ReturnsOnlyMatchingStatus()
    {
        var queued1 = new Job { Id = Guid.NewGuid(), Name = "Q1", Status = JobStatus.Queued };
        var queued2 = new Job { Id = Guid.NewGuid(), Name = "Q2", Status = JobStatus.Queued };
        var succeeded = new Job { Id = Guid.NewGuid(), Name = "S1", Status = JobStatus.Succeeded, Progress = 100 };

        await _repository.CreateAsync(queued1);
        await _repository.CreateAsync(queued2);
        await _repository.CreateAsync(succeeded);

        var queuedList = await _repository.GetByStatusAsync(JobStatus.Queued);
        var succeededList = await _repository.GetByStatusAsync(JobStatus.Succeeded);
        var failedList = await _repository.GetByStatusAsync(JobStatus.Failed);

        Assert.Equal(2, queuedList.Count);
        Assert.Single(succeededList);
        Assert.Empty(failedList);
    }

    [Fact]
    public async Task UpdateAsync_PersistsStatusAndProgressChanges()
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            Name = "Updatable Job",
            Status = JobStatus.Queued,
            Progress = 0
        };

        await _repository.CreateAsync(job);

        job.Status = JobStatus.Running;
        job.Progress = 50;
        job.StartedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(job);

        var updated = await _repository.GetByIdAsync(job.Id);
        Assert.NotNull(updated);
        Assert.Equal(JobStatus.Running, updated.Status);
        Assert.Equal(50, updated.Progress);
        Assert.NotNull(updated.StartedAt);
    }

    [Fact]
    public async Task DeleteAsync_RemovesJobFromDatabase()
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            Name = "To Delete",
            Status = JobStatus.Queued
        };

        await _repository.CreateAsync(job);
        var deleted = await _repository.DeleteAsync(job.Id);
        var retrieved = await _repository.GetByIdAsync(job.Id);

        Assert.True(deleted);
        Assert.Null(retrieved);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
