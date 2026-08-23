import { IQueueManager } from './queue.interface';
import { MemoryQueueManager } from './memory.queue';
import { BullMQManager } from './bullmq.queue';
import { APP_CONFIG } from '@/config/app.config';
import { processDownloadJob } from '@/workers/download.worker';
import '@/workers/cleanup.worker'; // Garante inicialização da limpeza

declare global {
  // eslint-disable-next-line no-var
  var __videoFetchQueueManager: IQueueManager | undefined;
}

export function getQueueManager(): IQueueManager {
  if (global.__videoFetchQueueManager) {
    return global.__videoFetchQueueManager;
  }

  let manager: IQueueManager;

  if (APP_CONFIG.queue.redisUrl && APP_CONFIG.queue.redisUrl.trim() !== '') {
    try {
      manager = new BullMQManager(APP_CONFIG.queue.redisUrl);
      console.log('[QueueFactory] Utilizando BullMQ com Redis:', APP_CONFIG.queue.redisUrl);
    } catch (err) {
      console.warn('[QueueFactory] Falha ao conectar ao Redis, utilizando MemoryQueue:', err);
      const memManager = new MemoryQueueManager();
      memManager.setProcessor(processDownloadJob);
      manager = memManager;
    }
  } else {
    const memManager = new MemoryQueueManager();
    memManager.setProcessor(processDownloadJob);
    manager = memManager;
  }

  global.__videoFetchQueueManager = manager;
  return manager;
}
