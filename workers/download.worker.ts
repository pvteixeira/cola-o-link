import { JobData } from '@/types/job';
import { providerRegistry } from '@/providers/registry';
import { storageService } from '@/services/storage.service';
import { formatBytes } from '@/lib/security/sanitize';

export async function processDownloadJob(
  jobData: JobData,
  updateProgress: (pct: number, msg?: string) => Promise<void>
): Promise<{
  fileName: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  downloadUrl: string;
}> {
  await updateProgress(15, 'Identificando provedor e preparando conexão...');
  const provider = providerRegistry.findProvider(jobData.url);

  await updateProgress(30, 'Processando fluxo de mídia seguro...');

  const result = await provider.download(
    jobData.url,
    {
      formatId: jobData.formatId || 'best',
      format: jobData.format,
      quality: jobData.quality,
    },
    (pct, msg) => {
      updateProgress(pct, msg);
    }
  );

  // Registra o arquivo gerado no serviço de storage seguro
  await storageService.registerFile(jobData.jobId, {
    jobId: jobData.jobId,
    filePath: result.filePath,
    fileName: result.fileName,
    mimeType: result.mimeType,
    fileSize: result.fileSize,
  });

  const downloadUrl = `/api/download/${jobData.jobId}/file`;

  return {
    fileName: result.fileName,
    fileSize: result.fileSize,
    fileSizeFormatted: formatBytes(result.fileSize),
    downloadUrl,
  };
}

export class DownloadWorker {
  private queueManager: any;

  constructor(queueManager: any) {
    this.queueManager = queueManager;
  }

  public start(): void {
    if (this.queueManager && typeof this.queueManager.setProcessor === 'function') {
      this.queueManager.setProcessor(processDownloadJob);
    }
  }
}

