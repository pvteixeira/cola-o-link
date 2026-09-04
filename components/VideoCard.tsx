'use client';

import React, { useState } from 'react';
import { VideoMetadata, VideoFormat, ClipOptions } from '@/types/video';
import { Download, Clock, User, Film, Music, Check, Sparkles, HardDrive, Scissors } from 'lucide-react';
import { ClipEditor } from '@/components/ClipEditor';

interface VideoCardProps {
  metadata: VideoMetadata;
  onStartDownload: (format: string, quality: string, formatId?: string, clipOptions?: ClipOptions) => Promise<void>;
  isStartingDownload: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  metadata,
  onStartDownload,
  isStartingDownload,
}) => {
  const [selectedType, setSelectedType] = useState<'video' | 'audio' | 'clip'>('video');
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>(() => {
    // Escolhe por padrão o formato de maior resolução disponível (ex: 4K, 2K, 1080p ou 720p)
    const defaultFormat = metadata.formats.find(f => f.hasVideo) || metadata.formats[0];
    return defaultFormat;
  });

  const videoFormats = metadata.formats.filter(f => f.hasVideo);
  const audioFormats = metadata.formats.filter(f => !f.hasVideo || f.isAudioOnly);

  const currentList = selectedType === 'video' ? videoFormats : audioFormats;

  const handleTypeChange = (type: 'video' | 'audio' | 'clip') => {
    setSelectedType(type);
    if (type !== 'clip') {
      const firstOfCategory = (type === 'video' ? videoFormats : audioFormats)[0];
      if (firstOfCategory) {
        setSelectedFormat(firstOfCategory);
      }
    }
  };

  const handleDownloadClick = async () => {
    if (!selectedFormat) return;
    await onStartDownload(selectedFormat.format, selectedFormat.quality, selectedFormat.id);
  };

  const handleGenerateClip = async (clipOptions: ClipOptions) => {
    const bestVideo = videoFormats[0] || metadata.formats[0];
    await onStartDownload(
      bestVideo ? bestVideo.format : 'mp4',
      bestVideo ? bestVideo.quality : '1080p',
      bestVideo ? bestVideo.id : undefined,
      clipOptions
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-8 animate-fade-in" id="video-result-card">
      <div className="rounded-2xl bg-surface/90 border border-gray-700/70 p-5 sm:p-7 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Thumbnail Preview */}
          <div className="md:col-span-5 relative group overflow-hidden rounded-xl bg-gray-900 border border-gray-800 aspect-video flex items-center justify-center">
            {metadata.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={metadata.thumbnail}
                alt={metadata.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                <Film className="w-10 h-10" />
                <span className="text-xs">Prévia não disponível</span>
              </div>
            )}

            {/* Duration Badge */}
            {metadata.durationFormatted && (
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{metadata.durationFormatted}</span>
              </div>
            )}

            {/* Platform Badge */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-surface/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-cyan-300 border border-cyan-800/60 shadow-md">
              {metadata.platform}
            </div>
          </div>

          {/* Metadata & Controls */}
          <div className="md:col-span-7 flex flex-col justify-between h-full">
            <div>
              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2 mb-2">
                {metadata.title}
              </h2>

              {/* Author Info */}
              {metadata.author && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-5">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>Publicado por: <strong className="text-gray-200">{metadata.author}</strong></span>
                </div>
              )}

              {/* Media Type Tabs (Video MP4 / Audio MP3 / Cortes & Shorts) */}
              <div className="flex flex-wrap items-center gap-2 mb-4 p-1 rounded-xl bg-surface-elevated border border-gray-800 w-fit">
                <button
                  type="button"
                  id="tab-select-video"
                  onClick={() => handleTypeChange('video')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    selectedType === 'video'
                      ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Vídeo (MP4)</span>
                </button>
                <button
                  type="button"
                  id="tab-select-audio"
                  onClick={() => handleTypeChange('audio')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    selectedType === 'audio'
                      ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Áudio (MP3)</span>
                </button>
                <button
                  type="button"
                  id="tab-select-clip"
                  onClick={() => handleTypeChange('clip')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    selectedType === 'clip'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  <span>Cortes & Shorts</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400/20 text-emerald-300 uppercase tracking-wider font-bold">
                    Novo
                  </span>
                </button>
              </div>

              {/* Modo Cortes & Shorts */}
              {selectedType === 'clip' ? (
                <ClipEditor
                  metadata={metadata}
                  onGenerateClip={handleGenerateClip}
                  isProcessing={isStartingDownload}
                />
              ) : (
                <>
                  {/* Qualities Grid */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                      Qualidade Disponível
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {currentList.map((format) => {
                        const isSelected = selectedFormat?.id === format.id;
                        return (
                          <button
                            key={format.id}
                            type="button"
                            onClick={() => setSelectedFormat(format)}
                            className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50 shadow-md'
                                : 'bg-surface-elevated/40 border-gray-800 hover:border-gray-700 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                                {format.quality === 'audio_only'
                                  ? '320 kbps'
                                  : format.quality === '2160p'
                                  ? '4K (2160p)'
                                  : format.quality === '1440p'
                                  ? '2K (1440p)'
                                  : format.quality}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                            </div>
                            <span className="text-[11px] text-gray-400 mt-0.5">
                              {format.quality === '2160p' ? 'Ultra HD' : format.quality === '1440p' ? 'Quad HD' : format.ext.toUpperCase()} {format.filesizeFormatted ? `• ${format.filesizeFormatted}` : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estimated Size & Download CTA */}
                  <div className="pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      <span>
                        Tamanho estimado:{' '}
                        <strong className="text-gray-200">
                          {selectedFormat?.filesizeFormatted || 'Determinado durante o download'}
                        </strong>
                      </span>
                    </div>

                    <button
                      id="btn-trigger-download"
                      type="button"
                      onClick={handleDownloadClick}
                      disabled={isStartingDownload || !selectedFormat}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>BAIXAR ARQUIVO</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

