import fs from 'fs';
import path from 'path';
import { BaseProvider, ProgressCallback } from '../base.provider';
import { VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';
import { extractYtDlpMetadata, downloadWithYtDlp, isYtDlpAvailable } from '../ytdlp-runner';
import { AppError } from '@/lib/errors/app-error';

export class InstagramProvider extends BaseProvider {
  readonly id: PlatformId = 'instagram';
  readonly name = 'Instagram';
  readonly supportedDomains = ['instagram.com', 'www.instagram.com'];
  readonly restrictionNote = 'Requer que o post seja público. A Meta/Instagram restringe downloads diretos que exigem autenticação.';

  private getCookiesPath(): string | undefined {
    const defaultCookie = path.resolve(process.cwd(), 'cookies.txt');
    if (fs.existsSync(defaultCookie)) {
      return defaultCookie;
    }
    return process.env.COOKIES_PATH || undefined;
  }

  async getMetadata(url: string): Promise<VideoMetadata> {
    try {
      return await extractYtDlpMetadata(url, this.id);
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw AppError.privateContent(
        'O Instagram exige login ou restringe o acesso externo a este vídeo. Para respeitar as políticas da plataforma, conteúdos com bloqueio de autenticação não são burlados.'
      );
    }
  }

  async download(
    url: string,
    options: DownloadOptions,
    onProgress?: ProgressCallback
  ): Promise<DownloadResult> {
    try {
      const meta = await this.getMetadata(url);
      return await downloadWithYtDlp(url, options, meta.title, onProgress);
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw AppError.restrictedContent(
        'Não foi possível baixar este vídeo do Instagram devido a restrições de sessão/login da plataforma.'
      );
    }
  }
}
