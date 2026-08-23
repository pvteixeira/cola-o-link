import { describe, it, expect } from 'vitest';
import { MemoryQueueManager } from '../queues/memory.queue';
import { JobData } from '../types/job';

describe('Sistema de Filas (MemoryQueue)', () => {
  it('deve enfileirar, processar e atualizar o status de um job com sucesso', async () => {
    const queue = new MemoryQueueManager();

    // Configura processador mock com relatório de progresso
    queue.setProcessor(async (jobData, updateProgress) => {
      await updateProgress(50, 'Processando teste...');
      return {
        fileName: 'teste-video.mp4',
        fileSize: 1024 * 1024 * 5,
        fileSizeFormatted: '5.0 MB',
        downloadUrl: `/api/download/${jobData.jobId}/file`,
      };
    });

    const jobData: JobData = {
      jobId: 'test-job-uuid-1234',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      format: 'mp4',
      quality: '1080p',
      createdAt: Date.now(),
    };

    const returnedId = await queue.addJob(jobData);
    expect(returnedId).toBe('test-job-uuid-1234');

    // Aguarda o processamento assíncrono
    await new Promise((resolve) => setTimeout(resolve, 100));

    const state = await queue.getJobState('test-job-uuid-1234');
    expect(state).not.toBeNull();
    expect(state?.status).toBe('completed');
    expect(state?.progress).toBe(100);
    expect(state?.fileName).toBe('teste-video.mp4');
    expect(state?.downloadUrl).toBe('/api/download/test-job-uuid-1234/file');

    await queue.close();
  });
});
