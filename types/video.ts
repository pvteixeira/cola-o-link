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

export interface DownloadOptions {
  formatId: string;
  format: string; // 'mp4', 'mp3', etc.
  quality: string; // '1080p', etc.
}

export interface DownloadResult {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}
