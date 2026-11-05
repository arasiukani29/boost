export type JobStatus = 'Queued' | 'Running' | 'Succeeded' | 'Completed' | 'Failed' | 'Canceled';

export type ConnectionStatus = 'Connected' | 'Disconnected' | 'Reconnecting';

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
}

export interface CreateJobRequest {
  name?: string;
}

export interface CancelJobRequest {
  reason?: string;
}

export interface JobProgressTickData {
  jobId: string;
  progress: number;
  status?: string;
}

