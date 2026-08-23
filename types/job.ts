import { PlatformId } from './video';

export type JobStatus =
  | 'queued'
  | 'analyzing'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'unavailable';

export interface JobData {
  jobId: string;
  url: string;
  platform: PlatformId;
  format: string;
  quality: string;
  formatId?: string;
  createdAt: number;
}

export interface JobState {
  jobId: string;
  status: JobStatus;
  progress: number; // 0 to 100
  message?: string;
  fileName?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  downloadUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}
