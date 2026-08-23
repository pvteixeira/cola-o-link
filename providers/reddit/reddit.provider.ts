import { BaseProvider, ProgressCallback } from '../base.provider';
import { VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';
import { extractYtDlpMetadata, downloadWithYtDlp } from '../ytdlp-runner';

export class RedditProvider extends BaseProvider {
  readonly id: PlatformId = 'reddit';
  readonly name = 'Reddit';
  readonly supportedDomains = ['reddit.com', 'www.reddit.com', 'v.redd.it'];

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
