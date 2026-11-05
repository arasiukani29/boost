using System.Text.Json.Serialization;

namespace PulseFlow.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum JobStatus
{
    Queued,
    Running,
    Succeeded,
    Failed,
    Canceled
}
