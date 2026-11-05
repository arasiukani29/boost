import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JobApiService } from './job-api.service';
import { Job } from '../models/job.model';

describe('JobApiService', () => {
  let service: JobApiService;
  let httpMock: HttpTestingController;

  const mockJobs: Job[] = [
    {
      id: 'job-1',
      name: 'Process-Data',
      status: 'Running',
      progress: 45,
      createdAt: '2026-11-03T10:00:00Z'
    },
    {
      id: 'job-2',
      name: 'Generate-Report',
      status: 'Succeeded',
      progress: 100,
      createdAt: '2026-11-03T09:30:00Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(JobApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all jobs via GET /api/jobs', () => {
    service.getJobs().subscribe((jobs) => {
      expect(jobs.length).toBe(2);
      expect(jobs).toEqual(mockJobs);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/jobs');
    expect(req.request.method).toBe('GET');
    req.flush(mockJobs);
  });

  it('should fetch filtered jobs via GET /api/jobs?status=Running', () => {
    service.getJobs('Running').subscribe((jobs) => {
      expect(jobs.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/jobs?status=Running');
    expect(req.request.method).toBe('GET');
    req.flush([mockJobs[0]]);
  });

  it('should trigger a new job via POST /api/jobs', () => {
    const newJob: Job = {
      id: 'job-3',
      name: 'Triggered-Task',
      status: 'Queued',
      progress: 0,
      createdAt: '2026-11-03T11:00:00Z'
    };

    service.triggerJob({ name: 'Triggered-Task' }).subscribe((res) => {
      expect(res).toEqual(newJob);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/jobs');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Triggered-Task' });
    req.flush(newJob);
  });

  it('should cancel a job via POST /api/jobs/{id}/cancel', () => {
    const canceledJob: Job = {
      id: 'job-1',
      name: 'Process-Data',
      status: 'Canceled',
      progress: 45,
      createdAt: '2026-11-03T10:00:00Z'
    };

    service.cancelJob('job-1', { reason: 'User cancel' }).subscribe((res) => {
      expect(res.status).toBe('Canceled');
    });

    const req = httpMock.expectOne('http://localhost:5000/api/jobs/job-1/cancel');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'User cancel' });
    req.flush(canceledJob);
  });
});

