import { VideoFormat, VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';

export interface ProgressCallback {
  (progress: number, message?: string): void;
}

export interface VideoProvider {
  readonly id: PlatformId;
  readonly name: string;
  readonly supportedDomains: string[];
  readonly isFullySupported: boolean;
  readonly restrictionNote?: string;

  /**
   * Verifica se o provider pode tratar a URL informada.
   */
  canHandle(url: string): boolean;

  /**
   * Obtém os metadados do vídeo (título, autor, thumbnail, duração, formatos).
   */
  getMetadata(url: string): Promise<VideoMetadata>;

  /**
   * Retorna a lista de formatos disponíveis para download.
   */
  getAvailableFormats(url: string): Promise<VideoFormat[]>;

  /**
   * Executa o download/processamento seguro do vídeo para o disco temporário.
   */
  download(
    url: string,
    options: DownloadOptions,
    onProgress?: ProgressCallback
  ): Promise<DownloadResult>;
}

export abstract class BaseProvider implements VideoProvider {
  abstract readonly id: PlatformId;
  abstract readonly name: string;
  abstract readonly supportedDomains: string[];
  readonly isFullySupported: boolean = true;
  readonly restrictionNote?: string;

  canHandle(url: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return this.supportedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  }

  abstract getMetadata(url: string): Promise<VideoMetadata>;

  async getAvailableFormats(url: string): Promise<VideoFormat[]> {
    const metadata = await this.getMetadata(url);
    return metadata.formats;
  }

  abstract download(
    url: string,
    options: DownloadOptions,
    onProgress?: ProgressCallback
  ): Promise<DownloadResult>;
}
