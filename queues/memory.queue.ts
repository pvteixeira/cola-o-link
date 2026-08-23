import { IQueueManager } from './queue.interface';
import { JobData, JobState } from '@/types/job';
import { APP_CONFIG } from '@/config/app.config';

type ProcessFunction = (jobData: JobData, updateProgress: (pct: number, msg?: string) => Promise<void>) => Promise<{
  fileName: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  downloadUrl: string;
}>;

export class MemoryQueueManager implements IQueueManager {
  private jobs = new Map<string, JobState>();
  private pendingQueue: JobData[] = [];
  private activeCount = 0;
  private maxConcurrency = APP_CONFIG.queue.concurrency;
  private processor?: ProcessFunction;

  constructor() {
    // Limpeza de jobs antigos da memória a cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      for (const [id, state] of this.jobs.entries()) {
        if (state.expiresAt && now > state.expiresAt) {
          this.jobs.delete(id);
        }
      }
    }, 5 * 60 * 1000);
  }

  public setProcessor(fn: ProcessFunction): void {
    this.processor = fn;
  }

  async addJob(jobData: JobData): Promise<string> {
    const now = Date.now();
    const initialState: JobState = {
      jobId: jobData.jobId,
      status: 'queued',
      progress: 0,
      message: 'Na fila de processamento...',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + APP_CONFIG.storage.fileTTLMs,
    };

    this.jobs.set(jobData.jobId, initialState);
    this.pendingQueue.push(jobData);

    // Dispara processamento assíncrono sem travar a resposta HTTP
    setImmediate(() => this.processNext());

    return jobData.jobId;
  }

  async getJobState(jobId: string): Promise<JobState | null> {
    return this.jobs.get(jobId) || null;
  }

  async updateJobState(jobId: string, partial: Partial<JobState>): Promise<void> {
    const current = this.jobs.get(jobId);
    if (current) {
      this.jobs.set(jobId, {
        ...current,
        ...partial,
        updatedAt: Date.now(),
      });
    }
  }

  private async processNext(): Promise<void> {
    if (this.activeCount >= this.maxConcurrency || this.pendingQueue.length === 0 || !this.processor) {
      return;
    }

    const jobData = this.pendingQueue.shift();
    if (!jobData) return;

    this.activeCount++;
    await this.updateJobState(jobData.jobId, {
      status: 'processing',
      progress: 5,
      message: 'Iniciando processamento do arquivo...',
    });

    try {
      const updateProgress = async (pct: number, msg?: string) => {
        await this.updateJobState(jobData.jobId, {
          progress: pct,
          message: msg,
        });
      };

      const result = await this.processor(jobData, updateProgress);

      await this.updateJobState(jobData.jobId, {
        status: 'completed',
        progress: 100,
        message: 'Seu arquivo está pronto para download!',
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileSizeFormatted: result.fileSizeFormatted,
        downloadUrl: result.downloadUrl,
        expiresAt: Date.now() + APP_CONFIG.storage.fileTTLMs,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha durante o processamento do vídeo.';
      await this.updateJobState(jobData.jobId, {
        status: 'failed',
        progress: 0,
        error: errorMsg,
        message: errorMsg,
      });
    } finally {
      this.activeCount--;
      setImmediate(() => this.processNext());
    }
  }

  async close(): Promise<void> {
    this.jobs.clear();
    this.pendingQueue = [];
  }
}
