import { IQueueManager } from './queue.interface';
import { MemoryQueueManager } from './memory.queue';
import { BullMQManager } from './bullmq.queue';
import { APP_CONFIG } from '@/config/app.config';
import { DownloadWorker } from '@/workers/download.worker';
import '@/workers/cleanup.worker'; // Garante inicialização da limpeza

declare global {
  // eslint-disable-next-line no-var
  var __colaOLinkQueueManager: IQueueManager | undefined;
}

export function getQueueManager(): IQueueManager {
  if (global.__colaOLinkQueueManager) {
    return global.__colaOLinkQueueManager;
  }

  let manager: IQueueManager;

  if (APP_CONFIG.queue.redisUrl && APP_CONFIG.queue.redisUrl.trim() !== '') {
    try {
      manager = new BullMQManager();
      console.log('📦 [QueueManager] Inicializado BullMQ com Redis em:', APP_CONFIG.queue.redisUrl);
    } catch (err) {
      console.warn('⚠️ [QueueManager] Falha ao conectar ao Redis, utilizando fallback MemoryQueue:', err);
      manager = new MemoryQueueManager();
    }
  } else {
    manager = new MemoryQueueManager();
    console.log('📦 [QueueManager] Inicializado MemoryQueue assíncrona (ambiente de desenvolvimento/standalone)');
  }

  // Inicializa o worker padrão de processamento
  const worker = new DownloadWorker(manager);
  worker.start();

  global.__colaOLinkQueueManager = manager;
  return manager;
}
