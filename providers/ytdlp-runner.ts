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
import { downloadSubtitles, sliceAndOffsetSubtitles, parseSrt, stringifyAss } from '@/lib/media/subtitles';

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
  width?: number;
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

let resolvedYtDlpBin: string | null = null;
let resolvedFfmpegBin: string | null = null;

function getYtDlpCandidates(): string[] {
  const candidates: string[] = [];
  if (process.env.YT_DLP_PATH) {
    candidates.push(process.env.YT_DLP_PATH);
  }
  const localWin = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
  if (fsSync.existsSync(localWin)) {
    candidates.push(localWin);
  }
  const localUnix = path.resolve(process.cwd(), 'bin', 'yt-dlp');
  if (fsSync.existsSync(localUnix)) {
    candidates.push(localUnix);
  }
  if (fsSync.existsSync('/usr/local/bin/yt-dlp')) {
    candidates.push('/usr/local/bin/yt-dlp');
  }
  if (fsSync.existsSync('/usr/bin/yt-dlp')) {
    candidates.push('/usr/bin/yt-dlp');
  }
  candidates.push('yt-dlp');
  return candidates;
}

function getYtDlpBinaryPath(): string {
  return resolvedYtDlpBin || 'yt-dlp';
}

function getFfmpegBinaryPath(): string | null {
  if (resolvedFfmpegBin) return resolvedFfmpegBin;
  if (process.env.FFMPEG_PATH) {
    resolvedFfmpegBin = process.env.FFMPEG_PATH;
    return resolvedFfmpegBin;
  }
  const localWin = path.resolve(process.cwd(), 'bin', 'ffmpeg.exe');
  if (fsSync.existsSync(localWin)) {
    resolvedFfmpegBin = localWin;
    return resolvedFfmpegBin;
  }
  const localUnix = path.resolve(process.cwd(), 'bin', 'ffmpeg');
  if (fsSync.existsSync(localUnix)) {
    resolvedFfmpegBin = localUnix;
    return resolvedFfmpegBin;
  }
  if (fsSync.existsSync('/usr/bin/ffmpeg')) {
    resolvedFfmpegBin = '/usr/bin/ffmpeg';
    return resolvedFfmpegBin;
  }
  if (fsSync.existsSync('/usr/local/bin/ffmpeg')) {
    resolvedFfmpegBin = '/usr/local/bin/ffmpeg';
    return resolvedFfmpegBin;
  }
  return 'ffmpeg';
}

function getCookiesPath(): string | null {
  const localCookie = path.resolve(process.cwd(), 'cookies.txt');
  if (fsSync.existsSync(localCookie)) {
    return localCookie;
  }
  return process.env.COOKIES_PATH || null;
}

export async function isYtDlpAvailable(): Promise<boolean> {
  if (resolvedYtDlpBin !== null) {
    return true;
  }
  const candidates = getYtDlpCandidates();
  for (const bin of candidates) {
    try {
      const { stdout } = await safeExec(bin, ['--version'], { timeoutMs: 15000 });
      if (stdout && stdout.trim().length > 0) {
        resolvedYtDlpBin = bin;
        console.log(`[ytdlp-runner] yt-dlp detectado e pronto: ${bin} (v${stdout.trim()})`);
        return true;
      }
    } catch (e: any) {
      console.warn(`[ytdlp-runner] Candidato yt-dlp ${bin} indisponível:`, e?.message || e);
    }
  }
  return false;
}

/**
 * Normaliza os formatos de um dump de yt-dlp para a lista simplificada do COLA O LINK.
 */
export function normalizeYtDlpFormats(formats: YtDlpFormat[] = []): VideoFormat[] {
  const result: VideoFormat[] = [];
  const seenQualities = new Set<string>();

  for (const f of formats) {
    const hasVideo = f.vcodec !== 'none' && Boolean(f.vcodec);
    // Para vídeos verticais (ex: Shorts, Reels, TikTok), a menor dimensão define a resolução (ex: 1080x1920 -> 1080p)
    const effectiveHeight = (f.height && f.width && f.height > f.width) ? f.width : (f.height || 0);

    if (hasVideo && effectiveHeight > 0) {
      let quality = `${effectiveHeight}p`;
      let label = `${effectiveHeight}p (MP4)`;

      if (effectiveHeight >= 2160) {
        quality = '2160p';
        label = '4K Ultra HD (2160p)';
      } else if (effectiveHeight >= 1440) {
        quality = '1440p';
        label = '2K Quad HD (1440p)';
      } else if (effectiveHeight >= 1080) {
        quality = '1080p';
        label = 'Full HD (1080p)';
      } else if (effectiveHeight >= 720) {
        quality = '720p';
        label = 'HD (720p)';
      } else if (effectiveHeight >= 480) {
        quality = '480p';
        label = 'SD (480p)';
      } else if (effectiveHeight >= 360) {
        quality = '360p';
        label = '360p (SD)';
      } else if (effectiveHeight >= 240) {
        quality = '240p';
        label = '240p';
      } else if (effectiveHeight >= 144) {
        quality = '144p';
        label = '144p';
      }

      if (!seenQualities.has(quality)) {
        seenQualities.add(quality);
        const size = f.filesize || f.filesize_approx;
        result.push({
          id: quality,
          format: 'mp4',
          quality: quality,
          label: label,
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

      const cacheDir = path.join(APP_CONFIG.storage.tempDir, '.cache');
      const args = [
        '--dump-single-json',
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--skip-download',
        '--no-audio-multistreams',
        '--cache-dir', cacheDir,
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
      console.error('[ytdlp-runner] Erro ao extrair metadados via yt-dlp:', err);
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

      const cacheDir = path.join(APP_CONFIG.storage.tempDir, '.cache');
      const clip = options.clipOptions;
      const isClip = typeof clip?.clipStart === 'number' && typeof clip?.clipEnd === 'number' && clip.clipEnd > clip.clipStart;

      const args: string[] = [
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--no-audio-multistreams',
        '--no-video-multistreams',
        '--cache-dir', cacheDir,
      ];

      if (isClip && clip) {
        args.push('--download-sections', `*${clip.clipStart}-${clip.clipEnd}`);
      }

      if (cookiesBin) {
        args.push('--cookies', cookiesBin);
      }

      if (ffmpegBin) {
        args.push('--ffmpeg-location', ffmpegBin);
      }

      if (isAudio) {
        // Extração de áudio em MP3 genuíno
        args.push(
          '-f', 'ba/b/bestaudio/best',
          '-x',
          '--audio-format', 'mp3',
          '--audio-quality', '0',
          '-o', outputTemplate,
          url
        );
      } else {
        // Download de vídeo + áudio garantidos e mesclados em MP4 com codecs universais
        const heightMatch = options.quality ? options.quality.match(/(\d+)p/) : null;
        const height = heightMatch ? parseInt(heightMatch[1], 10) : null;

        let formatSelector: string;
        if (height) {
          formatSelector = [
            `bv*[height<=${height}]+ba`,
            `b[height<=${height}]`,
            `bv*+ba`,
            `b`,
          ].join('/');
        } else {
          formatSelector = [
            `bv*+ba`,
            `b`,
          ].join('/');
        }

        args.push(
          '-f', formatSelector,
          '--merge-output-format', 'mp4',
          '--postprocessor-args', 'Merger:-c:v copy -c:a aac -b:a 192k',
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
            
            // Filtra apenas arquivos pertencentes a esta requisição que não sejam temporários de download
            const relatedFiles = allFiles.filter(
              (f) =>
                f.startsWith(filePrefix) &&
                !f.endsWith('.part') &&
                !f.endsWith('.ytdl') &&
                !f.endsWith('.temp')
            );

            if (relatedFiles.length === 0) {
              throw new Error(`Nenhum arquivo válido com prefixo ${filePrefix} foi encontrado.`);
            }

            // Seleciona o arquivo final correto (NUNCA seleciona fragmentos intermediários .f137 / .f140)
            let foundFile: string | undefined;

            if (isAudio) {
              // Para áudio: prioriza .mp3, depois outros formatos de áudio finais
              foundFile =
                relatedFiles.find((f) => f === `${filePrefix}.mp3`) ||
                relatedFiles.find((f) => /\.(mp3|m4a|aac|wav|ogg|opus)$/i.test(f) && !f.includes('.f'));
            } else {
              // Para vídeo: prioriza .mp4 mesclado final
              foundFile =
                relatedFiles.find((f) => f === `${filePrefix}.mp4`) ||
                relatedFiles.find((f) => /\.(mp4|mkv|webm|mov|avi)$/i.test(f) && !f.includes('.f'));
            }

            if (!foundFile) {
              console.error('[ytdlp-runner] Arquivos encontrados:', relatedFiles);
              throw new Error(`O arquivo final de vídeo/áudio mesclado não pôde ser gerado.`);
            }

            let actualFilePath = path.join(APP_CONFIG.storage.tempDir, foundFile);
            let stats = await fs.stat(actualFilePath);
            const actualExt = path.extname(foundFile).replace('.', '').toLowerCase() || targetExt;

            // Pós-processamento de Legendas e/ou Formato Vertical 9:16
            if (!isAudio && (clip?.burnSubtitles || clip?.aspectRatio === 'vertical_9_16')) {
              try {
                onProgress?.(93, 'Aplicando corte e formatação visual...');
                let subFilePath: string | null = null;

                if (clip.burnSubtitles) {
                  onProgress?.(95, 'Extraindo e sincronizando legendas automáticas...');
                  const rawSubs = await downloadSubtitles(url, bin, APP_CONFIG.storage.tempDir);
                  if (rawSubs) {
                    const slicedSrt = sliceAndOffsetSubtitles(rawSubs, clip.clipStart || 0, clip.clipEnd || 999999);
                    const cues = parseSrt(slicedSrt);
                    if (cues && cues.length > 0) {
                      // Converte para ASS com estilização avançada (fonte amarela, contorno preto, destaque)
                      const assContent = stringifyAss(cues);
                      subFilePath = path.join(APP_CONFIG.storage.tempDir, `${filePrefix}_temp.ass`);
                      await fs.writeFile(subFilePath, assContent, 'utf-8');
                      console.log(`[ytdlp-runner] Legendas ASS criadas com sucesso: ${cues.length} frases.`);
                    }
                  } else {
                    console.warn('[ytdlp-runner] Nenhuma legenda automática encontrada para este vídeo.');
                  }
                }

                const isVertical = clip.aspectRatio === 'vertical_9_16';
                const processedOutput = path.join(APP_CONFIG.storage.tempDir, `${filePrefix}_processed.mp4`);
                const ffmpegCmd = ffmpegBin || 'ffmpeg';

                const ffmpegArgs: string[] = ['-y', '-i', actualFilePath];

                // Escape seguro para caminhos de arquivo no libavfilter do FFmpeg:
                // No Windows e Linux: barras normais '/', ':' escapado como '\:', e aspas escapadas
                let filterComplex = '';
                const formatSubFilter = (filePath: string) => {
                  const sanitizedPath = filePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
                  // Usa o filtro 'ass' para arquivos .ass ou 'subtitles' com estilo
                  if (filePath.endsWith('.ass')) {
                    return `ass='${sanitizedPath}'`;
                  }
                  const fallbackStyle = "Fontname=DejaVu Sans,FontSize=24,Bold=1,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Alignment=2,MarginV=80";
                  return `subtitles='${sanitizedPath}':force_style='${fallbackStyle}'`;
                };

                if (isVertical) {
                  // Converte 16:9 para 9:16 com fundo desfocado e vídeo centralizado
                  const baseV = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2[v]`;
                  if (subFilePath && fsSync.existsSync(subFilePath)) {
                    const subFilter = formatSubFilter(subFilePath);
                    filterComplex = `${baseV};[v]${subFilter}[out]`;
                    ffmpegArgs.push('-filter_complex', filterComplex, '-map', '[out]', '-map', '0:a?');
                  } else {
                    filterComplex = baseV;
                    ffmpegArgs.push('-filter_complex', filterComplex, '-map', '[v]', '-map', '0:a?');
                  }
                } else if (subFilePath && fsSync.existsSync(subFilePath)) {
                  const subFilter = formatSubFilter(subFilePath);
                  ffmpegArgs.push('-vf', subFilter);
                }

                ffmpegArgs.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-c:a', 'aac', '-b:a', '192k', processedOutput);

                onProgress?.(97, 'Renderizando clipe final com legendas...');
                await safeExec(ffmpegCmd, ffmpegArgs, { timeoutMs: 180000 });

                if (fsSync.existsSync(processedOutput)) {
                  await fs.unlink(actualFilePath).catch(() => {});
                  actualFilePath = processedOutput;
                  stats = await fs.stat(actualFilePath);
                }

                if (subFilePath && fsSync.existsSync(subFilePath)) {
                  await fs.unlink(subFilePath).catch(() => {});
                }
              } catch (clipErr) {
                console.warn('[ytdlp-runner] Aviso: Falha na renderização de legendas/vertical, mantendo arquivo padrão:', clipErr);
              }
            }

            const titleSuffix = isClip ? (clip?.aspectRatio === 'vertical_9_16' ? '_shorts' : '_corte') : '';
            const finalSafeName = sanitizeFilename(`${videoTitle}${titleSuffix}`, actualExt);

            // Limpa eventuais arquivos temporários residuais (.f140.m4a, .f137.mp4) do mesmo prefixo
            for (const file of relatedFiles) {
              if (file !== foundFile && (file.includes('.f') || file.includes('.temp'))) {
                try {
                  await fs.unlink(path.join(APP_CONFIG.storage.tempDir, file));
                } catch {}
              }
            }

            onProgress?.(100, isAudio ? 'Áudio MP3 pronto com sucesso!' : isClip ? 'Clipe finalizado com sucesso!' : 'Vídeo MP4 pronto com sucesso!');
            resolve({
              filePath: actualFilePath,
              fileName: finalSafeName,
              mimeType: getMimeTypeForExtension(actualExt) || (isAudio ? 'audio/mpeg' : 'video/mp4'),
              fileSize: stats.size,
            });
          } catch (statErr) {
            reject(new AppError('DOWNLOAD_FAILED', 'Arquivo processado não encontrado no disco.', 500, statErr));
          }
        } else {
          console.error('[ytdlp-runner] Falha no processo yt-dlp:', stderrContent);
          const errLower = stderrContent.toLowerCase();
          if (errLower.includes('drm') || errLower.includes('protected')) {
            reject(AppError.drmProtected());
          } else if (errLower.includes('private')) {
            reject(AppError.privateContent());
          } else {
            reject(new AppError('DOWNLOAD_FAILED', 'Falha durante o processamento do arquivo de vídeo/áudio.', 500));
          }
        }
      });

      proc.on('error', (err) => {
        reject(new AppError('DOWNLOAD_FAILED', 'Erro ao inicializar o processo do yt-dlp.', 500, err));
      });
    });
  }

  throw AppError.downloadFailed('O utilitário yt-dlp não está instalado ou disponível no ambiente.');
}
