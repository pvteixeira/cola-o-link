import { storageService } from '@/services/storage.service';

let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupWorker(intervalMs = 5 * 60 * 1000): void {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(async () => {
    try {
      const cleaned = await storageService.cleanupExpiredFiles();
      if (cleaned > 0) {
        console.log(`[CleanupWorker] ${cleaned} arquivo(s) temporário(s) expirado(s) foram removidos com segurança.`);
      }
    } catch (err) {
      console.error('[CleanupWorker] Erro ao executar limpeza de arquivos temporários:', err);
    }
  }, intervalMs);
}

// Inicia o worker de limpeza
startCleanupWorker();
