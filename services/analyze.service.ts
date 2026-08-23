import { validateAndSecureUrl } from '@/lib/security/url-validator';
import { providerRegistry } from '@/providers/registry';
import { VideoMetadata } from '@/types/video';
import { AnalyzeResponse } from '@/types/api';

export class AnalyzeService {
  public async analyze(rawUrl: string): Promise<AnalyzeResponse> {
    // 1. Validação estrita de URL e proteção contra SSRF
    const { url } = await validateAndSecureUrl(rawUrl);

    // 2. Identificação do Provider compatível
    const provider = providerRegistry.findProvider(url);

    // 3. Obtenção segura dos metadados
    const metadata: VideoMetadata = await provider.getMetadata(url);

    return {
      success: true,
      platform: metadata.platform,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
      durationFormatted: metadata.durationFormatted,
      author: metadata.author,
      formats: metadata.formats,
    };
  }
}

export const analyzeService = new AnalyzeService();
