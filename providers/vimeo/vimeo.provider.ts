import { BaseProvider, ProgressCallback } from '../base.provider';
import { VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';
import { extractYtDlpMetadata, downloadWithYtDlp } from '../ytdlp-runner';

export class VimeoProvider extends BaseProvider {
  readonly id: PlatformId = 'vimeo';
  readonly name = 'Vimeo';
  readonly supportedDomains = ['vimeo.com', 'player.vimeo.com'];

  async getMetadata(url: string): Promise<VideoMetadata> {
    return extractYtDlpMetadata(url, this.id);
  }

  async download(
    url: string,
    options: DownloadOptions,
    onProgress?: ProgressCallback
  ): Promise<DownloadResult> {
    const meta = await this.getMetadata(url);
    return downloadWithYtDlp(url, options, meta.title, onProgress);
  }
}
