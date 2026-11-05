using Microsoft.AspNetCore.SignalR;

namespace PulseFlow.Api.Hubs;

public class PulseHub : Hub
{
    private readonly ILogger<PulseHub> _logger;

    public PulseHub(ILogger<PulseHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("SignalR client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("SignalR client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SubscribeToJob(string jobId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}");
    }

    public async Task UnsubscribeFromJob(string jobId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job-{jobId}");
    }

    public async Task Subscribe(string jobId) => await SubscribeToJob(jobId);

    public async Task Unsubscribe(string jobId) => await UnsubscribeFromJob(jobId);
}
