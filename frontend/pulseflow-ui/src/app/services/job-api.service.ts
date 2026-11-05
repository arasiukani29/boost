import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, CreateJobRequest, CancelJobRequest } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/jobs';

  getJobs(status?: string): Observable<Job[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<Job[]>(this.baseUrl, options);
  }

  triggerJob(request?: CreateJobRequest): Observable<Job> {
    return this.http.post<Job>(this.baseUrl, request ?? {});
  }

  cancelJob(id: string, request?: CancelJobRequest): Observable<Job> {
    return this.http.post<Job>(`${this.baseUrl}/${id}/cancel`, request ?? {});
  }
}

