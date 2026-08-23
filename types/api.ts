import { VideoFormat, PlatformId } from './video';
import { JobStatus } from './job';

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  platform?: PlatformId;
  title?: string;
  thumbnail?: string;
  duration?: number;
  durationFormatted?: string;
  author?: string;
  formats?: VideoFormat[];
  error?: string;
  code?: string;
}

export interface DownloadRequest {
  url: string;
  format: string;
  quality: string;
  formatId?: string;
}

export interface DownloadResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;
  message?: string;
  fileName?: string;
  fileSizeFormatted?: string;
  downloadUrl?: string;
  error?: string;
}
