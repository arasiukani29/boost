import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApiService } from '../../services/job-api.service';
import { SignalRService } from '../../services/signalr.service';
import { Job, JobStatus } from '../../models/job.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly jobApi = inject(JobApiService);
  readonly signalR = inject(SignalRService);
  private reconnectSub?: Subscription;

  // Expose signals from SignalRService
  readonly connectionStatus = this.signalR.connectionStatus;
  readonly jobs = this.signalR.jobs;

  // Metric Signals - case-insensitive and supports both Succeeded and Completed
  readonly totalJobs = computed(() => this.jobs().length);
  readonly runningJobs = computed(() =>
    this.jobs().filter((j) => j.status?.toLowerCase() === 'running').length
  );
  readonly completedJobs = computed(() =>
    this.jobs().filter((j) => {
      const s = j.status?.toLowerCase();
      return s === 'succeeded' || s === 'completed';
    }).length
  );
  readonly failedJobs = computed(() =>
    this.jobs().filter((j) => j.status?.toLowerCase() === 'failed').length
  );
  readonly queuedJobs = computed(() =>
    this.jobs().filter((j) => j.status?.toLowerCase() === 'queued').length
  );
  readonly canceledJobs = computed(() =>
    this.jobs().filter((j) => j.status?.toLowerCase() === 'canceled').length
  );

  // Local action state
  readonly isTriggering = signal(false);
  readonly isBatchTriggering = signal(false);
  readonly cancelingJobIds = signal<Set<string>>(new Set<string>());
  readonly statusFilter = signal<string>('ALL');

  // Filtered jobs list - case-insensitive and aliases Succeeded <-> Completed
  readonly filteredJobs = computed(() => {
    const filter = this.statusFilter().toUpperCase();
    const all = this.jobs();
    if (filter === 'ALL') return all;
    if (filter === 'SUCCEEDED' || filter === 'COMPLETED') {
      return all.filter((j) => {
        const s = j.status?.toUpperCase();
        return s === 'SUCCEEDED' || s === 'COMPLETED';
      });
    }
    return all.filter((j) => j.status?.toUpperCase() === filter);
  });

  ngOnInit(): void {
    this.loadInitialJobs();
    this.signalR.startConnection();

    // Re-fetch jobs on SignalR reconnection to sync missed updates
    this.reconnectSub = this.signalR.reconnected$.subscribe(() => {
      this.loadInitialJobs();
    });
  }

  loadInitialJobs(): void {
    this.jobApi.getJobs().subscribe({
      next: (jobs) => {
        this.signalR.setJobs(jobs);
      },
      error: (err) => {
        console.error('Failed to load initial jobs:', err);
      }
    });
  }

  triggerNewJob(): void {
    if (this.isTriggering()) return;
    this.isTriggering.set(true);

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const jobName = `Job-${new Date().toISOString().slice(11, 19).replace(/:/g, '')}-${randomSuffix}`;

    this.jobApi.triggerJob({ name: jobName }).subscribe({
      next: (newJob) => {
        this.signalR.upsertJob(newJob);
        this.isTriggering.set(false);
      },
      error: (err) => {
        console.error('Failed to trigger new job:', err);
        this.isTriggering.set(false);
      }
    });
  }

  triggerBatch(count: number = 5): void {
    if (this.isBatchTriggering()) return;
    this.isBatchTriggering.set(true);

    const requests = Array.from({ length: count }, (_, i) => {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const jobName = `Batch-${i + 1}-${randomSuffix}`;
      return this.jobApi.triggerJob({ name: jobName }).pipe(
        catchError((err) => {
          console.error(`Batch item ${i + 1} failed:`, err);
          return of(null);
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((job) => {
          if (job) {
            this.signalR.upsertJob(job);
          }
        });
        this.isBatchTriggering.set(false);
      },
      error: (err) => {
        console.error('Error triggering batch jobs:', err);
        this.isBatchTriggering.set(false);
      }
    });
  }

  cancelJob(job: Job): void {
    if (!this.isActive(job) || this.isCanceling(job.id)) return;

    const normalizedId = job.id.toLowerCase();
    this.cancelingJobIds.update((set) => {
      const next = new Set(set);
      next.add(normalizedId);
      return next;
    });

    this.jobApi.cancelJob(job.id, { reason: 'User canceled from dashboard' }).subscribe({
      next: (updatedJob) => {
        this.signalR.upsertJob(updatedJob);
        this.removeCancelingId(job.id);
      },
      error: (err) => {
        console.error(`Failed to cancel job ${job.id}:`, err);
        this.removeCancelingId(job.id);
      }
    });
  }

  private removeCancelingId(jobId: string): void {
    const normalizedId = jobId.toLowerCase();
    this.cancelingJobIds.update((set) => {
      const next = new Set(set);
      next.delete(normalizedId);
      return next;
    });
  }

  isActive(job: Job): boolean {
    const s = job?.status?.toLowerCase();
    return s === 'queued' || s === 'running';
  }

  isCanceling(jobId: string): boolean {
    return this.cancelingJobIds().has(jobId.toLowerCase());
  }

  reconnect(): void {
    this.signalR.startConnection();
  }

  setFilter(filter: string): void {
    this.statusFilter.set(filter);
  }

  ngOnDestroy(): void {
    this.reconnectSub?.unsubscribe();
  }
}

