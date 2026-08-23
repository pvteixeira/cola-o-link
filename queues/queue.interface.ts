import { JobData, JobState } from '@/types/job';

export interface IQueueManager {
  /**
   * Adiciona um novo job de download à fila.
   */
  addJob(jobData: JobData): Promise<string>;

  /**
   * Obtém o estado atual de um job pelo ID.
   */
  getJobState(jobId: string): Promise<JobState | null>;

  /**
   * Atualiza o estado de um job (status, progresso, erro, downloadUrl).
   */
  updateJobState(jobId: string, partial: Partial<JobState>): Promise<void>;

  /**
   * Fecha conexões e finaliza listeners.
   */
  close(): Promise<void>;
}
