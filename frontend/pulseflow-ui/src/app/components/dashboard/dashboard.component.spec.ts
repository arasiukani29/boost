import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { SignalRService } from '../../services/signalr.service';
import { JobApiService } from '../../services/job-api.service';
import { of } from 'rxjs';
import { Job } from '../../models/job.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let signalRService: SignalRService;
  let jobApiService: JobApiService;

  const mockJobs: Job[] = [
    {
      id: 'job-active-1',
      name: 'ETL-Pipeline-1',
      status: 'Running',
      progress: 60,
      createdAt: '2026-11-03T10:00:00Z'
    },
    {
      id: 'job-queued-2',
      name: 'ETL-Pipeline-2',
      status: 'Queued',
      progress: 0,
      createdAt: '2026-11-03T10:05:00Z'
    },
    {
      id: 'job-success-3',
      name: 'Report-Export',
      status: 'Succeeded',
      progress: 100,
      createdAt: '2026-11-03T09:00:00Z'
    },
    {
      id: 'job-failed-4',
      name: 'Failed-Task',
      status: 'Failed',
      progress: 40,
      createdAt: '2026-11-03T08:00:00Z',
      errorMessage: 'Database connection failed'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SignalRService,
        JobApiService
      ]
    }).compileComponents();

    signalRService = TestBed.inject(SignalRService);
    jobApiService = TestBed.inject(JobApiService);

    // Mock initial getJobs to return mockJobs
    vi.spyOn(jobApiService, 'getJobs').mockReturnValue(of(mockJobs));
    // Spy on startConnection to prevent real network in test
    vi.spyOn(signalRService, 'startConnection').mockResolvedValue();
  });

  it('should create the dashboard and load initial jobs', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.jobs().length).toBe(4);
  });

  it('should correctly compute metric values', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.totalJobs()).toBe(4);
    expect(component.runningJobs()).toBe(1);
    expect(component.completedJobs()).toBe(1);
    expect(component.failedJobs()).toBe(1);
    expect(component.queuedJobs()).toBe(1);
  });

  it('should render live connection status badge', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    signalRService.connectionStatus.set('Connected');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.connection-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Connected');
  });

  it('should render metric cards with correct counts', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.metric-card');
    expect(cards.length).toBe(4);

    const totalVal = compiled.querySelector('.card-total .metric-value')?.textContent?.trim();
    const runningVal = compiled.querySelector('.card-running .metric-value')?.textContent?.trim();
    const completedVal = compiled.querySelector('.card-completed .metric-value')?.textContent?.trim();
    const failedVal = compiled.querySelector('.card-failed .metric-value')?.textContent?.trim();

    expect(totalVal).toBe('4');
    expect(runningVal).toBe('1');
    expect(completedVal).toBe('1');
    expect(failedVal).toBe('1');
  });

  it('should render action buttons for Trigger New Job and Trigger Batch (5 Jobs)', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.action-buttons-group button');
    expect(buttons.length).toBe(2);

    expect(buttons[0].textContent).toContain('Trigger New Job');
    expect(buttons[1].textContent).toContain('Trigger Batch (5 Jobs)');
  });

  it('should call triggerJob when clicking Trigger New Job', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const createdJob: Job = {
      id: 'new-job-1',
      name: 'Triggered-Via-UI',
      status: 'Queued',
      progress: 0,
      createdAt: '2026-11-03T11:00:00Z'
    };
    const triggerSpy = vi.spyOn(jobApiService, 'triggerJob').mockReturnValue(of(createdJob));

    component.triggerNewJob();

    expect(triggerSpy).toHaveBeenCalled();
    expect(component.jobs().some((j) => j.id === 'new-job-1')).toBe(true);
  });

  it('should call triggerJob 5 times when triggerBatch is executed', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const triggerSpy = vi.spyOn(jobApiService, 'triggerJob').mockImplementation((req) => {
      return of({
        id: `batch-${Math.random()}`,
        name: req?.name ?? 'Batch-Job',
        status: 'Queued',
        progress: 0,
        createdAt: new Date().toISOString()
      });
    });

    component.triggerBatch(5);

    expect(triggerSpy).toHaveBeenCalledTimes(5);
  });

  it('should render interactive table with job name, status badge, progress bar and cancel button', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.jobs-table tbody tr');
    expect(rows.length).toBe(4);

    // First row should have job title, status badge, progress bar
    const firstRow = rows[0];
    expect(firstRow.querySelector('.job-title')).toBeTruthy();
    expect(firstRow.querySelector('.badge')).toBeTruthy();
    expect(firstRow.querySelector('.progress-bar-fill')).toBeTruthy();
  });

  it('should call cancelJob when clicking Cancel on an active job', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const canceledJob: Job = {
      ...mockJobs[0],
      status: 'Canceled'
    };
    const cancelSpy = vi.spyOn(jobApiService, 'cancelJob').mockReturnValue(of(canceledJob));

    component.cancelJob(mockJobs[0]);

    expect(cancelSpy).toHaveBeenCalledWith('job-active-1', expect.anything());
  });

  it('should correctly count jobs with both Succeeded and Completed status variants', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    signalRService.setJobs([
      { id: '1', name: 'J1', status: 'Succeeded', progress: 100, createdAt: '2026-11-03T01:00:00Z' },
      { id: '2', name: 'J2', status: 'Completed', progress: 100, createdAt: '2026-11-03T02:00:00Z' },
      { id: '3', name: 'J3', status: 'Running', progress: 50, createdAt: '2026-11-03T03:00:00Z' },
      { id: '4', name: 'J4', status: 'Failed', progress: 20, createdAt: '2026-11-03T04:00:00Z' },
    ]);

    expect(component.completedJobs()).toBe(2);
    expect(component.runningJobs()).toBe(1);
    expect(component.failedJobs()).toBe(1);
    expect(component.totalJobs()).toBe(4);
  });

  it('should filter jobs correctly when selecting status filter chips', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.setFilter('RUNNING');
    expect(component.filteredJobs().length).toBe(1);
    expect(component.filteredJobs()[0].id).toBe('job-active-1');

    component.setFilter('COMPLETED');
    expect(component.filteredJobs().length).toBe(1);
    expect(component.filteredJobs()[0].id).toBe('job-success-3');

    component.setFilter('ALL');
    expect(component.filteredJobs().length).toBe(4);
  });

  it('should resync jobs when SignalR reconnects', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const getJobsSpy = vi.spyOn(jobApiService, 'getJobs');
    getJobsSpy.mockClear();

    // Trigger reconnection event
    signalRService.reconnected$.next();

    expect(getJobsSpy).toHaveBeenCalledTimes(1);
  });
});

