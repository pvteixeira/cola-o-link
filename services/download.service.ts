import crypto from 'crypto';
import { validateAndSecureUrl } from '@/lib/security/url-validator';
import { providerRegistry } from '@/providers/registry';
import { getQueueManager } from '@/queues/queue.factory';
import { JobData, JobState } from '@/types/job';
import { DownloadRequest, DownloadResponse, JobStatusResponse } from '@/types/api';
import { AppError } from '@/lib/errors/app-error';

export class DownloadService {
  public async createDownloadJob(req: DownloadRequest): Promise<DownloadResponse> {
    // 1. Validação de segurança da URL
    const { url } = await validateAndSecureUrl(req.url);

    // 2. Confirmação de suporte do Provider
    const provider = providerRegistry.findProvider(url);

    // 3. Criação de identificador único seguro (UUID)
    const jobId = crypto.randomUUID();

    const jobData: JobData = {
      jobId,
      url,
      platform: provider.id,
      format: req.format || 'mp4',
      quality: req.quality || '1080p',
      formatId: req.formatId,
      createdAt: Date.now(),
    };

    const queue = getQueueManager();
    await queue.addJob(jobData);

    return {
      success: true,
      jobId,
    };
  }

  public async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    if (!jobId || typeof jobId !== 'string') {
      throw AppError.jobNotFound('ID de job inválido.');
    }

    const queue = getQueueManager();
    const state: JobState | null = await queue.getJobState(jobId);

    if (!state) {
      throw AppError.jobNotFound('Tarefa não encontrada ou expirada.');
    }

    return {
      jobId: state.jobId,
      status: state.status,
      progress: state.progress,
      message: state.message,
      fileName: state.fileName,
      fileSizeFormatted: state.fileSizeFormatted,
      downloadUrl: state.downloadUrl,
      error: state.error,
    };
  }
}

export const downloadService = new DownloadService();
