import { Injectable, OnDestroy, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { ConnectionStatus, Job, JobProgressTickData, JobStatus } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService implements OnDestroy {
  private hubConnection: HubConnection | null = null;
  private readonly hubUrl = 'http://localhost:5000/pulseHub';

  // Angular Signals for connection state and reactive jobs list
  readonly connectionStatus = signal<ConnectionStatus>('Disconnected');
  readonly jobs = signal<Job[]>([]);

  // Reconnection notification stream
  readonly reconnected$ = new Subject<void>();

  constructor() {
    this.initConnection();
  }

  private initConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    this.registerLifecycleHooks();
    this.registerMessageHandlers();
  }

  private registerLifecycleHooks(): void {
    if (!this.hubConnection) return;

    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error);
      this.connectionStatus.set('Reconnecting');
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.info('SignalR reconnected successfully. ID:', connectionId);
      this.connectionStatus.set('Connected');
      this.reconnected$.next();
    });

    this.hubConnection.onclose((error) => {
      console.warn('SignalR connection closed.', error);
      this.connectionStatus.set('Disconnected');
    });
  }

  private registerMessageHandlers(): void {
    if (!this.hubConnection) return;

    const handleJobUpdate = (job: Job) => {
      if (!job || !job.id) return;
      this.upsertJob(job);
    };

    const handleProgressTick = (tick: JobProgressTickData | any) => {
      if (!tick) return;
      const jobId = tick.jobId || tick.id;
      if (!jobId) return;
      this.updateProgress({
        jobId,
        progress: tick.progress,
        status: tick.status
      });
    };

    // Listen to all status and progress events broadcasted by backend
    this.hubConnection.on('JobStatusChanged', handleJobUpdate);
    this.hubConnection.on('JobStatusUpdated', handleJobUpdate);
    this.hubConnection.on('StatusChanged', handleJobUpdate);
    this.hubConnection.on('JobProgressUpdated', handleJobUpdate);
    this.hubConnection.on('JobProgressChanged', handleJobUpdate);
    this.hubConnection.on('JobProgressTick', handleProgressTick);
    this.hubConnection.on('ProgressTick', handleProgressTick);
  }

  async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.initConnection();
    }

    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.connectionStatus.set('Connected');
      return;
    }

    if (
      this.hubConnection?.state === HubConnectionState.Connecting ||
      this.hubConnection?.state === HubConnectionState.Reconnecting
    ) {
      return;
    }

    try {
      this.connectionStatus.set('Reconnecting');
      await this.hubConnection!.start();
      this.connectionStatus.set('Connected');
      console.info('SignalR connected to pulseHub');
    } catch (err) {
      console.error('SignalR failed to connect:', err);
      this.connectionStatus.set('Disconnected');
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      await this.hubConnection.stop();
    }
    this.connectionStatus.set('Disconnected');
  }

  setJobs(jobs: Job[]): void {
    const sorted = [...jobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.jobs.set(sorted);
  }

  upsertJob(job: Job): void {
    this.jobs.update((current) => {
      const index = current.findIndex(
        (j) => j.id.toLowerCase() === job.id.toLowerCase()
      );
      if (index >= 0) {
        const existing = current[index];
        // Deduplicate identical updates to prevent re-triggering signal consumers
        if (
          existing.status === job.status &&
          existing.progress === job.progress &&
          existing.name === job.name &&
          existing.errorMessage === job.errorMessage &&
          existing.completedAt === job.completedAt
        ) {
          return current;
        }

        const copy = [...current];
        copy[index] = { ...existing, ...job };
        return copy;
      }
      return [job, ...current];
    });
  }

  updateProgress(tick: JobProgressTickData): void {
    this.jobs.update((current) => {
      const index = current.findIndex(
        (j) => j.id.toLowerCase() === tick.jobId.toLowerCase()
      );
      if (index >= 0) {
        const existing = current[index];
        const newStatus = (tick.status as JobStatus) || existing.status;
        if (existing.progress === tick.progress && existing.status === newStatus) {
          return current;
        }

        const copy = [...current];
        copy[index] = {
          ...existing,
          progress: tick.progress,
          status: newStatus
        };
        return copy;
      }
      return current;
    });
  }

  ngOnDestroy(): void {
    this.reconnected$.complete();
    this.stopConnection().catch(() => {});
  }
}

