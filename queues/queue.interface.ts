import { JobData, JobState } from '@/types/job';

export type ProcessFunction = (
  jobData: JobData,
  updateProgress: (pct: number, msg?: string) => Promise<void>
) => Promise<{
  fileName: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  downloadUrl: string;
}>;

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
   * Define a função processadora de tarefas (Worker).
   */
  setProcessor?(fn: ProcessFunction): void;

  /**
   * Fecha conexões e finaliza listeners.
   */
  close(): Promise<void>;
}

