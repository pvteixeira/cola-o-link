import path from 'path';
import crypto from 'crypto';
import { APP_CONFIG } from '@/config/app.config';
import { AppError } from '@/lib/errors/app-error';

const SAFE_MIME_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
};

/**
 * Sanitiza o título do vídeo para criar um nome de arquivo seguro.
 */
export function sanitizeFilename(rawTitle: string, ext = 'mp4'): string {
  if (!rawTitle) {
    return `video_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  }

  // Remove caracteres proibidos em Windows/Linux/macOS e caracteres de controle
  const sanitized = rawTitle
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .slice(0, 120); // Limite de 120 caracteres

  const safeBase = sanitized || `video_${crypto.randomBytes(4).toString('hex')}`;
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mp4';

  return `${safeBase}.${cleanExt}`;
}

/**
 * Valida se um caminho de arquivo está estritamente dentro do diretório temporário permitido (anti-path-traversal).
 */
export function assertSafeFilePath(targetPath: string): string {
  const resolvedBase = path.resolve(APP_CONFIG.storage.tempDir);
  const resolvedTarget = path.resolve(targetPath);

  const relative = path.relative(resolvedBase, resolvedTarget);
  const isOutside = relative.startsWith('..') || path.isAbsolute(relative);

  if (isOutside) {
    throw new AppError('SSRF_ATTEMPT', 'Tentativa de acesso a diretório não autorizado detectada.', 403);
  }

  return resolvedTarget;
}

/**
 * Retorna o Content-Type apropriado baseado na extensão do arquivo.
 */
export function getMimeTypeForExtension(ext: string): string {
  const clean = ext.replace(/^\./, '').toLowerCase();
  return SAFE_MIME_TYPES[clean] || 'application/octet-stream';
}

/**
 * Converte bytes para formato legível (ex: "14.2 MB").
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return 'Tamanho desconhecido';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

/**
 * Converte segundos para formato legível MM:SS ou HH:MM:SS.
 */
export function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
