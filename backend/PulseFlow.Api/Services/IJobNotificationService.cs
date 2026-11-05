using PulseFlow.Api.Models;

namespace PulseFlow.Api.Services;

public interface IJobNotificationService
{
    Task NotifyStatusChangedAsync(Job job, CancellationToken ct = default);
    Task NotifyProgressAsync(Job job, CancellationToken ct = default);
}
