export type PlatformId = 'youtube' | 'vimeo' | 'tiktok' | 'reddit' | 'instagram' | 'x' | 'unknown';

export interface VideoFormat {
  id: string;
  format: string; // 'mp4' | 'webm' | 'mp3' | 'm4a'
  quality: string; // '1080p' | '720p' | '480p' | '360p' | 'audio_only'
  label: string;
  filesize?: number; // em bytes
  filesizeFormatted?: string; // ex: "24.5 MB"
  ext: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isAudioOnly?: boolean;
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number; // em segundos
  durationFormatted: string; // ex: "03:45"
  author?: string;
  authorUrl?: string;
  platform: PlatformId;
  formats: VideoFormat[];
  isRestricted?: boolean;
  restrictionReason?: string;
}

export interface ClipOptions {
  clipStart?: number; // em segundos
  clipEnd?: number; // em segundos
  burnSubtitles?: boolean;
  aspectRatio?: 'original' | 'vertical_9_16';
}

export interface SuggestedClip {
  id: string;
  title: string;
  start: number;
  end: number;
  duration: number;
  snippet?: string;
  tag?: string; // ex: "🔥 Alta Energia", "⚡ Viral 20s", "🎯 Gancho 15s"
  score?: number; // pontuação de relevância / engajamento
}

export interface DownloadOptions {
  formatId: string;
  format: string; // 'mp4', 'mp3', etc.
  quality: string; // '1080p', etc.
  clipOptions?: ClipOptions;
}

export interface DownloadResult {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

