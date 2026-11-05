import { TestBed } from '@angular/core/testing';
import { SignalRService } from './signalr.service';
import { Job } from '../models/job.model';

describe('SignalRService', () => {
  let service: SignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignalRService]
    });
    service = TestBed.inject(SignalRService);
  });

  afterEach(async () => {
    await service.stopConnection();
  });

  it('should be created with initial state', () => {
    expect(service).toBeTruthy();
    expect(service.connectionStatus()).toBe('Disconnected');
    expect(service.jobs()).toEqual([]);
  });

  it('should set and sort jobs by createdAt descending', () => {
    const jobs: Job[] = [
      {
        id: '1',
        name: 'Job 1',
        status: 'Queued',
        progress: 0,
        createdAt: '2026-11-03T08:00:00Z'
      },
      {
        id: '2',
        name: 'Job 2',
        status: 'Running',
        progress: 50,
        createdAt: '2026-11-03T10:00:00Z'
      }
    ];

    service.setJobs(jobs);
    const result = service.jobs();
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('2'); // newer job first
    expect(result[1].id).toBe('1');
  });

  it('should upsert a new job by prepending to the list', () => {
    const initialJob: Job = {
      id: '1',
      name: 'Initial Job',
      status: 'Queued',
      progress: 0,
      createdAt: '2026-11-03T08:00:00Z'
    };
    service.setJobs([initialJob]);

    const newJob: Job = {
      id: '2',
      name: 'New Job',
      status: 'Running',
      progress: 10,
      createdAt: '2026-11-03T09:00:00Z'
    };
    service.upsertJob(newJob);

    expect(service.jobs().length).toBe(2);
    expect(service.jobs()[0].id).toBe('2');
  });

  it('should upsert an existing job by updating in place', () => {
    const initialJob: Job = {
      id: 'job-1',
      name: 'Job 1',
      status: 'Running',
      progress: 20,
      createdAt: '2026-11-03T08:00:00Z'
    };
    service.setJobs([initialJob]);

    service.upsertJob({
      ...initialJob,
      status: 'Succeeded',
      progress: 100
    });

    expect(service.jobs().length).toBe(1);
    expect(service.jobs()[0].status).toBe('Succeeded');
    expect(service.jobs()[0].progress).toBe(100);
  });

  it('should update progress on tick data', () => {
    const initialJob: Job = {
      id: 'job-tick',
      name: 'Tick Job',
      status: 'Running',
      progress: 10,
      createdAt: '2026-11-03T08:00:00Z'
    };
    service.setJobs([initialJob]);

    service.updateProgress({
      jobId: 'job-tick',
      progress: 70,
      status: 'Running'
    });

    expect(service.jobs()[0].progress).toBe(70);
  });

  it('should deduplicate upsertJob and updateProgress to avoid redundant array allocations', () => {
    const initialJob: Job = {
      id: 'job-dedup',
      name: 'Dedup Job',
      status: 'Running',
      progress: 50,
      createdAt: '2026-11-03T08:00:00Z',
      errorMessage: null,
      completedAt: null
    };
    service.setJobs([initialJob]);
    const refBeforeUpsert = service.jobs();

    // Call upsert with identical data
    service.upsertJob({ ...initialJob });
    const refAfterUpsert = service.jobs();
    expect(refBeforeUpsert).toBe(refAfterUpsert); // Exact same array reference

    // Call updateProgress with identical data
    service.updateProgress({
      jobId: 'job-dedup',
      progress: 50,
      status: 'Running'
    });
    const refAfterTick = service.jobs();
    expect(refAfterTick).toBe(refBeforeUpsert); // Still exact same reference
  });

  it('should notify reconnected$ stream on reconnect', () => {
    let reconnectedFired = false;
    service.reconnected$.subscribe(() => {
      reconnectedFired = true;
    });

    service.reconnected$.next();
    expect(reconnectedFired).toBe(true);
  });
});

