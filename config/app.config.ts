import path from 'path';
import os from 'os';

export const APP_CONFIG = {
  app: {
    name: 'COLA O LINK',
    description: 'Plataforma moderna, rápida e segura para download de vídeos públicos compatíveis.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  security: {
    // Domínios públicos explicitamente permitidos
    allowedHostnames: [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'vimeo.com',
      'player.vimeo.com',
      'tiktok.com',
      'www.tiktok.com',
      'reddit.com',
      'www.reddit.com',
      'v.redd.it',
      'instagram.com',
      'www.instagram.com',
      'x.com',
      'www.x.com',
      'twitter.com',
      'www.twitter.com',
    ],
    // Limite de requisições por IP (janela de 60 segundos)
    rateLimit: {
      maxRequests: 30,
      windowMs: 60 * 1000,
    },
    // Limite de tamanho de arquivo permitido para download (ex: 500 MB)
    maxDownloadSizeBytes: 500 * 1024 * 1024,
    // Timeout para execução de subprocessos / fetches (em milissegundos)
    processTimeoutMs: 120 * 1000,
  },
  storage: {
    // Diretório temporário seguro para armazenamento de downloads dentro do projeto
    tempDir: process.env.TEMP_STORAGE_DIR || path.resolve(process.cwd(), 'temp_downloads'),
    // TTL de arquivos temporários em milissegundos (15 minutos)
    fileTTLMs: 15 * 60 * 1000,
  },
  queue: {
    redisUrl: process.env.REDIS_URL || '',
    name: 'videofetch-downloads-queue',
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10),
  },
  binaries: {
    ytDlpPath:
      process.env.YT_DLP_PATH ||
      (process.platform === 'win32' && path.resolve(process.cwd(), 'bin', 'yt-dlp.exe')) ||
      path.resolve(process.cwd(), 'bin', 'yt-dlp') ||
      'yt-dlp',
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  }
};
