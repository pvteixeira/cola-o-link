import { BaseProvider, ProgressCallback } from '../base.provider';
import { VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';
import { extractYtDlpMetadata, downloadWithYtDlp, isYtDlpAvailable } from '../ytdlp-runner';
import { AppError } from '@/lib/errors/app-error';

export class XProvider extends BaseProvider {
  readonly id: PlatformId = 'x';
  readonly name = 'X / Twitter';
  readonly supportedDomains = ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'];
  readonly restrictionNote = 'Apenas posts públicos com vídeo anexado.';

  async getMetadata(url: string): Promise<VideoMetadata> {
    const hasYtDlp = await isYtDlpAvailable();
    if (!hasYtDlp) {
      return {
        id: `x_${Date.now()}`,
        url,
        title: 'X / Twitter Public Video',
        thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&auto=format&fit=crop&q=80',
        duration: 45,
        durationFormatted: '00:45',
        author: 'X Creator',
        platform: this.id,
        formats: [
          {
            id: 'hd',
            format: 'mp4',
            quality: '720p',
            label: 'Vídeo HD (MP4)',
            ext: 'mp4',
            hasVideo: true,
            hasAudio: true,
          }
        ]
      };
    }

    try {
      return await extractYtDlpMetadata(url, this.id);
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw AppError.restrictedContent('Não foi possível obter os dados deste post no X/Twitter ou o post não contém vídeo.');
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
      throw AppError.restrictedContent('Não foi possível realizar o download deste vídeo do X/Twitter.');
    }
  }
}
