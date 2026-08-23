import { VideoProvider } from './base.provider';
import { YouTubeProvider } from './youtube/youtube.provider';
import { VimeoProvider } from './vimeo/vimeo.provider';
import { TikTokProvider } from './tiktok/tiktok.provider';
import { RedditProvider } from './reddit/reddit.provider';
import { InstagramProvider } from './instagram/instagram.provider';
import { XProvider } from './x/x.provider';
import { AppError } from '@/lib/errors/app-error';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: VideoProvider[] = [];

  private constructor() {
    this.registerDefaultProviders();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  private registerDefaultProviders(): void {
    this.register(new YouTubeProvider());
    this.register(new VimeoProvider());
    this.register(new TikTokProvider());
    this.register(new RedditProvider());
    this.register(new InstagramProvider());
    this.register(new XProvider());
  }

  public register(provider: VideoProvider): void {
    this.providers.push(provider);
  }

  public getProviders(): readonly VideoProvider[] {
    return [...this.providers];
  }

  /**
   * Encontra o provedor adequado para a URL fornecida.
   */
  public findProvider(url: string): VideoProvider {
    const provider = this.providers.find((p) => p.canHandle(url));
    if (!provider) {
      throw AppError.unsupportedPlatform('Esta plataforma ainda não é compatível.');
    }
    return provider;
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
