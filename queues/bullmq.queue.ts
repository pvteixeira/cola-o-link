import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { IQueueManager } from './queue.interface';
import { JobData, JobState } from '@/types/job';
import { APP_CONFIG } from '@/config/app.config';

export class BullMQManager implements IQueueManager {
  private queue: Queue;
  private redisConnection: IORedis;
  private worker?: Worker;
  private stateCache = new Map<string, JobState>();

  constructor(redisUrl: string) {
    this.redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.queue = new Queue(APP_CONFIG.queue.name, {
      connection: this.redisConnection,
    });
  }

  async addJob(jobData: JobData): Promise<string> {
    const now = Date.now();
    const initialState: JobState = {
      jobId: jobData.jobId,
      status: 'queued',
      progress: 0,
      message: 'Na fila do Redis...',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + APP_CONFIG.storage.fileTTLMs,
    };

    this.stateCache.set(jobData.jobId, initialState);

    await this.queue.add('download-video', jobData, {
      jobId: jobData.jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });

    return jobData.jobId;
  }

  async getJobState(jobId: string): Promise<JobState | null> {
    return this.stateCache.get(jobId) || null;
  }

  async updateJobState(jobId: string, partial: Partial<JobState>): Promise<void> {
    const current = this.stateCache.get(jobId);
    if (current) {
      this.stateCache.set(jobId, {
        ...current,
        ...partial,
        updatedAt: Date.now(),
      });
    }
  }

  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    await this.queue.close();
    await this.redisConnection.quit();
  }
}
