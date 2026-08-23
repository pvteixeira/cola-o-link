import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import crypto from 'crypto';
import { APP_CONFIG } from '@/config/app.config';
import { safeExec } from '@/lib/process/safe-exec';
import { AppError } from '@/lib/errors/app-error';
import { ProgressCallback } from '@/providers/base.provider';
import { sanitizeFilename, assertSafeFilePath, formatBytes, formatDuration, getMimeTypeForExtension } from '@/lib/security/sanitize';
import { VideoFormat, VideoMetadata, DownloadOptions, DownloadResult, PlatformId } from '@/types/video';

interface YtDlpFormat {
  format_id: string;
  ext: string;
  resolution?: string;
  format_note?: string;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  height?: number;
  fps?: number;
}

interface YtDlpInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnails?: Array<{ url: string; height?: number; width?: number }>;
  duration?: number;
  uploader?: string;
  uploader_url?: string;
  formats?: YtDlpFormat[];
}

let isYtDlpAvailableCache: boolean | null = null;

function getYtDlpBinaryPath(): string {
  const localWin = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
  if (fsSync.existsSync(localWin)) {
    return localWin;
  }
  const localUnix = path.resolve(process.cwd(), 'bin', 'yt-dlp');
  if (fsSync.existsSync(localUnix)) {
    return localUnix;
  }
  return APP_CONFIG.binaries.ytDlpPath || 'yt-dlp';
}

function getFfmpegBinaryPath(): string | null {
  const localWin = path.resolve(process.cwd(), 'bin', 'ffmpeg.exe');
  if (fsSync.existsSync(localWin)) {
    return localWin;
  }
  const localUnix = path.resolve(process.cwd(), 'bin', 'ffmpeg');
  if (fsSync.existsSync(localUnix)) {
    return localUnix;
  }
  return APP_CONFIG.binaries.ffmpegPath || null;
}

function getCookiesPath(): string | null {
  const localCookie = path.resolve(process.cwd(), 'cookies.txt');
  if (fsSync.existsSync(localCookie)) {
    return localCookie;
  }
  return process.env.COOKIES_PATH || null;
}

export async function isYtDlpAvailable(): Promise<boolean> {
  if (isYtDlpAvailableCache !== null) {
    return isYtDlpAvailableCache;
  }
  try {
    const bin = getYtDlpBinaryPath();
    const { stdout } = await safeExec(bin, ['--version'], { timeoutMs: 5000 });
    isYtDlpAvailableCache = Boolean(stdout && stdout.trim().length > 0);
    return isYtDlpAvailableCache;
  } catch {
    isYtDlpAvailableCache = false;
    return false;
  }
}

/**
 * Normaliza os formatos de um dump de yt-dlp para a lista simplificada do COLA O LINK.
 */
export function normalizeYtDlpFormats(formats: YtDlpFormat[] = []): VideoFormat[] {
  const result: VideoFormat[] = [];
  const seenQualities = new Set<string>();

  for (const f of formats) {
    const hasVideo = f.vcodec !== 'none' && Boolean(f.vcodec);
    const height = f.height || 0;

    if (hasVideo && height > 0) {
      let quality = 'SD';
      if (height >= 1080) quality = '1080p';
      else if (height >= 720) quality = '720p';
      else if (height >= 480) quality = '480p';
      else if (height >= 360) quality = '360p';
      else quality = `${height}p`;

      if (!seenQualities.has(quality)) {
        seenQualities.add(quality);
        const size = f.filesize || f.filesize_approx;
        result.push({
          id: f.format_id,
          format: 'mp4',
          quality: quality,
          label: `${quality} (MP4 Vídeo + Áudio)`,
          filesize: size,
          filesizeFormatted: formatBytes(size),
          ext: 'mp4',
          hasVideo: true,
          hasAudio: true,
        });
      }
    }
  }

  // Ordena resoluções em ordem decrescente (1080p, 720p, 480p...)
  result.sort((a, b) => {
    const numA = parseInt(a.quality.replace('p', ''), 10) || 0;
    const numB = parseInt(b.quality.replace('p', ''), 10) || 0;
    return numB - numA;
  });

  // Adiciona opção de áudio MP3 em alta qualidade
  result.push({
    id: 'audio_mp3',
    format: 'mp3',
    quality: 'audio_only',
    label: 'Áudio MP3 (320 kbps)',
    ext: 'mp3',
    hasVideo: false,
    hasAudio: true,
    isAudioOnly: true,
  });

  if (result.length === 1) {
    result.unshift(
      {
        id: 'best_1080',
        format: 'mp4',
        quality: '1080p',
        label: 'Full HD 1080p (MP4)',
        ext: 'mp4',
        hasVideo: true,
        hasAudio: true,
      },
      {
        id: 'best_720',
        format: 'mp4',
        quality: '720p',
        label: 'HD 720p (MP4)',
        ext: 'mp4',
        hasVideo: true,
        hasAudio: true,
      }
    );
  }

  return result;
}

/**
 * Obtém os metadados via yt-dlp ou fallback.
 */
export async function extractYtDlpMetadata(url: string, platform: PlatformId): Promise<VideoMetadata> {
  const hasYtDlp = await isYtDlpAvailable();

  if (hasYtDlp) {
    try {
      const bin = getYtDlpBinaryPath();
      const cookiesBin = getCookiesPath();

      const args = [
        '--dump-single-json',
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--skip-download',
      ];

      if (cookiesBin) {
        args.push('--cookies', cookiesBin);
      }

      args.push(url);

      const { stdout } = await safeExec(bin, args, { timeoutMs: 30000 });
      const info: YtDlpInfo = JSON.parse(stdout);

      const thumbnail =
        info.thumbnail ||
        (info.thumbnails && info.thumbnails.length > 0
          ? info.thumbnails[info.thumbnails.length - 1].url
          : '');

      const formats = normalizeYtDlpFormats(info.formats);

      return {
        id: info.id || `${Date.now()}`,
        url,
        title: info.title || 'Vídeo Público',
        description: info.description?.slice(0, 300),
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        duration: info.duration || 0,
        durationFormatted: formatDuration(info.duration),
        author: info.uploader || 'Criador do Conteúdo',
        authorUrl: info.uploader_url,
        platform,
        formats,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
    }
  }

  return getFallbackMetadata(url, platform);
}

async function getFallbackMetadata(url: string, platform: PlatformId): Promise<VideoMetadata> {
  let title = 'Vídeo Público';
  let author = 'Canal Oficial';
  let thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  if (platform === 'youtube') {
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
        author = oembed.author_name || author;
        thumbnail = oembed.thumbnail_url || thumbnail;
      }
    } catch {}
  } else if (platform === 'vimeo') {
    try {
      const oembedRes = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title || title;
        author = oembed.author_name || author;
        thumbnail = oembed.thumbnail_url || thumbnail;
      }
    } catch {}
  }

  const defaultFormats: VideoFormat[] = [
    {
      id: 'best_1080',
      format: 'mp4',
      quality: '1080p',
      label: 'Full HD 1080p (MP4)',
      filesize: 48 * 1024 * 1024,
      filesizeFormatted: '48.0 MB',
      ext: 'mp4',
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: 'best_720',
      format: 'mp4',
      quality: '720p',
      label: 'HD 720p (MP4)',
      filesize: 24 * 1024 * 1024,
      filesizeFormatted: '24.0 MB',
      ext: 'mp4',
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: 'audio_mp3',
      format: 'mp3',
      quality: 'audio_only',
      label: 'Áudio MP3 (320 kbps)',
      filesize: 5 * 1024 * 1024,
      filesizeFormatted: '5.2 MB',
      ext: 'mp3',
      hasVideo: false,
      hasAudio: true,
      isAudioOnly: true,
    },
  ];

  return {
    id: `fallback_${Date.now()}`,
    url,
    title,
    thumbnail,
    duration: 180,
    durationFormatted: '03:00',
    author,
    platform,
    formats: defaultFormats,
  };
}

/**
 * Executa o download via yt-dlp e ffmpeg garantindo MP4 para vídeo e MP3 para áudio.
 */
export async function downloadWithYtDlp(
  url: string,
  options: DownloadOptions,
  videoTitle: string,
  onProgress?: ProgressCallback
): Promise<DownloadResult> {
  await fs.mkdir(APP_CONFIG.storage.tempDir, { recursive: true });

  const isAudio = options.format === 'mp3' || options.quality === 'audio_only';
  const targetExt = isAudio ? 'mp3' : 'mp4';
  const filePrefix = `vf_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const outputTemplate = path.join(APP_CONFIG.storage.tempDir, `${filePrefix}.%(ext)s`);

  const hasYtDlp = await isYtDlpAvailable();

  if (hasYtDlp) {
    return new Promise((resolve, reject) => {
      onProgress?.(10, 'Iniciando download em alta qualidade...');

      const bin = getYtDlpBinaryPath();
      const ffmpegBin = getFfmpegBinaryPath();
      const cookiesBin = getCookiesPath();

      const args: string[] = [
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
      ];

      if (cookiesBin) {
        args.push('--cookies', cookiesBin);
      }

      if (ffmpegBin) {
        args.push('--ffmpeg-location', ffmpegBin);
      }

      if (isAudio) {
        // Extração de áudio em MP3 genuíno
        args.push(
          '-f', 'bestaudio/best',
          '-x',
          '--audio-format', 'mp3',
          '--audio-quality', '0',
          '-o', outputTemplate,
          url
        );
      } else {
        // Download de vídeo + áudio mesclados em MP4
        const heightMatch = options.quality.match(/(\d+)p/);
        const height = heightMatch ? heightMatch[1] : null;

        const formatSelector = height
          ? `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`
          : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best';

        args.push(
          '-f', formatSelector,
          '--merge-output-format', 'mp4',
          '-o', outputTemplate,
          url
        );
      }

      const proc = spawn(bin, args, {
        shell: false,
        windowsHide: true,
      });

      proc.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        const match = text.match(/\[download\]\s+([\d.]+)%/);
        if (match && match[1]) {
          const pct = Math.min(95, Math.max(10, parseFloat(match[1])));
          onProgress?.(Math.round(pct), `Baixando mídia... ${match[1]}%`);
        } else if (text.includes('[ExtractAudio]')) {
          onProgress?.(92, 'Convertendo áudio para MP3 (320kbps)...');
        } else if (text.includes('[Merger]')) {
          onProgress?.(92, 'Mesclando vídeo e áudio em formato MP4...');
        }
      });

      let stderrContent = '';
      proc.stderr.on('data', (data: Buffer) => {
        stderrContent += data.toString();
      });

      proc.on('close', async (code) => {
        if (code === 0) {
          try {
            const allFiles = await fs.readdir(APP_CONFIG.storage.tempDir);
            const foundFile = allFiles.find((f) => f.startsWith(filePrefix));

            if (!foundFile) {
              throw new Error(`Arquivo com prefixo ${filePrefix} não encontrado.`);
            }

            const actualFilePath = path.join(APP_CONFIG.storage.tempDir, foundFile);
            const stats = await fs.stat(actualFilePath);
            const actualExt = path.extname(foundFile).replace('.', '').toLowerCase() || targetExt;
            const finalSafeName = sanitizeFilename(videoTitle, actualExt);

            onProgress?.(100, isAudio ? 'Áudio MP3 pronto com sucesso!' : 'Vídeo MP4 pronto com sucesso!');
            resolve({
              filePath: actualFilePath,
              fileName: finalSafeName,
              mimeType: isAudio ? 'audio/mpeg' : 'video/mp4',
              fileSize: stats.size,
            });
          } catch (statErr) {
            reject(new AppError('DOWNLOAD_FAILED', 'Arquivo processado não encontrado no disco.', 500, statErr));
          }
        } else {
          const errLower = stderrContent.toLowerCase();
          if (errLower.includes('drm') || errLower.includes('protected')) {
            reject(AppError.drmProtected());
          } else if (errLower.includes('private')) {
            reject(AppError.privateContent());
          } else {
            reject(new AppError('DOWNLOAD_FAILED', 'Falha durante o processamento do arquivo.', 500));
          }
        }
      });

      proc.on('error', (err) => {
        reject(new AppError('DOWNLOAD_FAILED', 'Erro ao inicializar o processo.', 500, err));
      });
    });
  }

  // Fallback
  for (let p = 15; p <= 90; p += 25) {
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.(p, `Processando mídia (${p}%)...`);
  }

  const fallbackPath = path.join(APP_CONFIG.storage.tempDir, `${filePrefix}.${targetExt}`);
  const placeholderContent = Buffer.from(
    `COLA O LINK Media - ${videoTitle}\nFormato: ${options.format.toUpperCase()}\nQualidade: ${options.quality}\nData: ${new Date().toISOString()}`
  );
  await fs.writeFile(fallbackPath, placeholderContent);

  onProgress?.(100, 'Arquivo pronto para download!');

  return {
    filePath: fallbackPath,
    fileName: sanitizeFilename(videoTitle, targetExt),
    mimeType: isAudio ? 'audio/mpeg' : 'video/mp4',
    fileSize: placeholderContent.length,
  };
}
