using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using PulseFlow.Api.Models;

namespace PulseFlow.Tests;

public class JobApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public JobApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task TriggerJob_CreatesAndReturnsQueuedJob()
    {
        var request = new CreateJobRequest("Test Trigger Job");
        var response = await _client.PostAsJsonAsync("/api/jobs", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var job = await response.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(job);
        Assert.Equal("Test Trigger Job", job.Name);
        Assert.True(job.Status == JobStatus.Queued || job.Status == JobStatus.Running);
    }

    [Fact]
    public async Task TriggerJobAlias_CreatesAndReturnsJob()
    {
        var request = new CreateJobRequest("Trigger Alias Job");
        var response = await _client.PostAsJsonAsync("/api/jobs/trigger", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var job = await response.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(job);
        Assert.Equal("Trigger Alias Job", job.Name);
    }

    [Fact]
    public async Task GetJobs_ReturnsAllJobs()
    {
        var response = await _client.GetAsync("/api/jobs");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var jobs = await response.Content.ReadFromJsonAsync<List<Job>>();
        Assert.NotNull(jobs);
    }

    [Fact]
    public async Task GetJobHistory_ReturnsHistory()
    {
        var response = await _client.GetAsync("/api/jobs/history");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var jobs = await response.Content.ReadFromJsonAsync<List<Job>>();
        Assert.NotNull(jobs);
    }

    [Fact]
    public async Task GetJobById_ReturnsJob_WhenExists()
    {
        var triggerResp = await _client.PostAsJsonAsync("/api/jobs", new CreateJobRequest("Lookup Job"));
        var created = await triggerResp.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(created);

        var getResp = await _client.GetAsync($"/api/jobs/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResp.StatusCode);

        var retrieved = await getResp.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(retrieved);
        Assert.Equal(created.Id, retrieved.Id);
    }

    [Fact]
    public async Task GetJobById_ReturnsNotFound_WhenDoesNotExist()
    {
        var response = await _client.GetAsync($"/api/jobs/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CancelJob_CancelsActiveOrQueuedJob()
    {
        // Create a new job
        var triggerResp = await _client.PostAsJsonAsync("/api/jobs", new CreateJobRequest("Job to Cancel"));
        var created = await triggerResp.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(created);

        // Cancel the job
        var cancelResp = await _client.PostAsJsonAsync($"/api/jobs/{created.Id}/cancel", new CancelJobRequest("Test cancellation"));
        
        // If not yet finished, cancellation succeeds with OK
        if (cancelResp.StatusCode == HttpStatusCode.OK)
        {
            var canceledJob = await cancelResp.Content.ReadFromJsonAsync<Job>();
            Assert.NotNull(canceledJob);
            Assert.Equal(JobStatus.Canceled, canceledJob.Status);

            // Attempting to cancel again should return BadRequest (terminal state)
            var secondCancelResp = await _client.PostAsJsonAsync($"/api/jobs/{created.Id}/cancel", new CancelJobRequest("Again"));
            Assert.Equal(HttpStatusCode.BadRequest, secondCancelResp.StatusCode);
        }
        else
        {
            // If the job already completed before cancel arrived, it returns BadRequest
            Assert.Equal(HttpStatusCode.BadRequest, cancelResp.StatusCode);
        }
    }

    [Fact]
    public async Task CancelJob_ReturnsNotFound_ForNonExistentJob()
    {
        var response = await _client.PostAsJsonAsync($"/api/jobs/{Guid.NewGuid()}/cancel", new CancelJobRequest("Not found"));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Cors_ReturnsExpectedHeaders_ForAllowedOrigin()
    {
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/jobs");
        request.Headers.Add("Origin", "http://localhost:4200");
        request.Headers.Add("Access-Control-Request-Method", "POST");
        request.Headers.Add("Access-Control-Request-Headers", "content-type");

        var response = await _client.SendAsync(request);

        Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.Equal("http://localhost:4200", response.Headers.GetValues("Access-Control-Allow-Origin").FirstOrDefault());
        Assert.True(response.Headers.Contains("Access-Control-Allow-Credentials"));
        Assert.Equal("true", response.Headers.GetValues("Access-Control-Allow-Credentials").FirstOrDefault());
    }

    [Fact]
    public async Task CancelJob_PreservesCustomReasonInDatabase()
    {
        var triggerResp = await _client.PostAsJsonAsync("/api/jobs", new CreateJobRequest("Reason Test Job"));
        var created = await triggerResp.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(created);

        const string customReason = "Special custom abort reason 42";
        var cancelResp = await _client.PostAsJsonAsync($"/api/jobs/{created.Id}/cancel", new CancelJobRequest(customReason));
        Assert.Equal(HttpStatusCode.OK, cancelResp.StatusCode);

        // Allow background service to process the cancellation
        await Task.Delay(800);

        var getResp = await _client.GetAsync($"/api/jobs/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResp.StatusCode);
        var refreshed = await getResp.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(refreshed);
        Assert.Equal(JobStatus.Canceled, refreshed.Status);
        Assert.Equal(customReason, refreshed.ErrorMessage);
    }

    [Fact]
    public async Task GetJobs_WithInvalidStatus_ReturnsBadRequest()
    {
        var response = await _client.GetAsync("/api/jobs?status=NoSuchStatus");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetJobHistory_WithStatusFilter_ReturnsFilteredJobs()
    {
        var response = await _client.GetAsync("/api/jobs/history?status=Queued");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var jobs = await response.Content.ReadFromJsonAsync<List<Job>>();
        Assert.NotNull(jobs);
        Assert.All(jobs, j => Assert.Equal(JobStatus.Queued, j.Status));
    }

    [Fact]
    public async Task TriggerJob_WithEmptyBody_DefaultsName()
    {
        var emptyContent = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
        var response = await _client.PostAsync("/api/jobs", emptyContent);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var job = await response.Content.ReadFromJsonAsync<Job>();
        Assert.NotNull(job);
        Assert.StartsWith("Job-", job.Name);
    }
}
