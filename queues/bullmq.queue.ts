import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { IQueueManager, ProcessFunction } from './queue.interface';
import { JobData, JobState } from '@/types/job';
import { APP_CONFIG } from '@/config/app.config';

export class BullMQManager implements IQueueManager {
  private queue: Queue;
  private redisConnection: IORedis;
  private workerRedisConnection: IORedis;
  private worker?: Worker;
  private stateCache = new Map<string, JobState>();

  constructor(redisUrl: string) {
    this.redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    this.redisConnection.on('error', (err) => {
      console.error('[BullMQManager] Erro na conexão do Redis (Fila):', err.message);
    });

    this.workerRedisConnection = this.redisConnection.duplicate();
    this.workerRedisConnection.on('error', (err) => {
      console.error('[BullMQManager] Erro na conexão do Redis (Worker):', err.message);
    });

    this.queue = new Queue(APP_CONFIG.queue.name, {
      connection: this.redisConnection,
    });
  }

  public setProcessor(fn: ProcessFunction): void {
    if (this.worker) {
      return;
    }

    console.log(`🚀 [BullMQManager] Iniciando Worker BullMQ para fila "${APP_CONFIG.queue.name}" com concorrência ${APP_CONFIG.queue.concurrency}`);

    this.worker = new Worker(
      APP_CONFIG.queue.name,
      async (job: Job<JobData>) => {
        const jobData = job.data;
        await this.updateJobState(jobData.jobId, {
          status: 'processing',
          progress: 5,
          message: 'Iniciando processamento do arquivo...',
        });

        try {
          const updateProgress = async (pct: number, msg?: string) => {
            try {
              await job.updateProgress(pct);
            } catch {
              // Ignora erro em progresso intermediário
            }
            await this.updateJobState(jobData.jobId, {
              progress: pct,
              message: msg,
            });
          };

          const result = await fn(jobData, updateProgress);

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

          return result;
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Falha durante o processamento do vídeo.';
          await this.updateJobState(jobData.jobId, {
            status: 'failed',
            progress: 0,
            error: errorMsg,
            message: errorMsg,
          });
          throw err;
        }
      },
      {
        connection: this.workerRedisConnection,
        concurrency: APP_CONFIG.queue.concurrency,
      }
    );

    this.worker.on('error', (err) => {
      console.error('[BullMQManager] Erro interno do Worker:', err.message);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[BullMQManager] Job ${job?.id} falhou:`, err.message);
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

    try {
      await this.redisConnection.set(
        `colaolink:job:${jobData.jobId}`,
        JSON.stringify(initialState),
        'EX',
        Math.ceil(APP_CONFIG.storage.fileTTLMs / 1000)
      );
    } catch (e) {
      console.warn('[BullMQManager] Erro ao persistir estado inicial no Redis:', e);
    }

    await this.queue.add('download-video', jobData, {
      jobId: jobData.jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });

    return jobData.jobId;
  }

  async getJobState(jobId: string): Promise<JobState | null> {
    try {
      const raw = await this.redisConnection.get(`colaolink:job:${jobId}`);
      if (raw) {
        const state = JSON.parse(raw) as JobState;
        this.stateCache.set(jobId, state);
        return state;
      }
    } catch {
      // Fallback para cache local se Redis falhar na consulta
    }
    return this.stateCache.get(jobId) || null;
  }

  async updateJobState(jobId: string, partial: Partial<JobState>): Promise<void> {
    const current = (await this.getJobState(jobId)) || this.stateCache.get(jobId);
    if (current) {
      const updated: JobState = {
        ...current,
        ...partial,
        updatedAt: Date.now(),
      };
      this.stateCache.set(jobId, updated);

      try {
        await this.redisConnection.set(
          `colaolink:job:${jobId}`,
          JSON.stringify(updated),
          'EX',
          Math.ceil(APP_CONFIG.storage.fileTTLMs / 1000)
        );
      } catch (e) {
        console.warn('[BullMQManager] Erro ao sincronizar atualização no Redis:', e);
      }
    }
  }

  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    await this.queue.close();
    await this.redisConnection.quit();
    await this.workerRedisConnection.quit();
  }
}

