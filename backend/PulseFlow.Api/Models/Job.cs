namespace PulseFlow.Api.Models;

public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public JobStatus Status { get; set; } = JobStatus.Queued;
    public int Progress { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
}

public record CreateJobRequest(string? Name);
public record CancelJobRequest(string? Reason);
