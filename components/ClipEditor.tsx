'use client';

import React, { useState, useEffect } from 'react';
import { VideoMetadata, SuggestedClip, ClipOptions } from '@/types/video';
import { Scissors, Sparkles, Smartphone, Monitor, Subtitles, Clock, Play, Check, AlertCircle } from 'lucide-react';

interface ClipEditorProps {
  metadata: VideoMetadata;
  onGenerateClip: (clipOptions: ClipOptions) => Promise<void>;
  isProcessing: boolean;
}

export const ClipEditor: React.FC<ClipEditorProps> = ({
  metadata,
  onGenerateClip,
  isProcessing,
}) => {
  const [clipMode, setClipMode] = useState<'auto' | 'manual'>('auto');
  const [suggestedClips, setSuggestedClips] = useState<SuggestedClip[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Estados do corte manual
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(() => Math.min(60, metadata.duration || 60));

  // Opções de estilo
  const [burnSubtitles, setBurnSubtitles] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'vertical_9_16' | 'original'>('vertical_9_16');

  // Busca sugestões automáticas ao montar
  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch('/api/clips/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: metadata.url, duration: metadata.duration }),
        });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.clips)) {
          setSuggestedClips(data.clips);
          if (data.clips.length > 0) {
            setSelectedClipId(data.clips[0].id);
            setStartSec(data.clips[0].start);
            setEndSec(data.clips[0].end);
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar sugestões:', e);
      } finally {
        if (isMounted) setIsLoadingSuggestions(false);
      }
    }

    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, [metadata.url, metadata.duration]);

  const handleSelectAutoClip = (clip: SuggestedClip) => {
    setSelectedClipId(clip.id);
    setStartSec(clip.start);
    setEndSec(clip.end);
  };

  const formatSeconds = (totalSeconds: number) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSecChange = (val: number) => {
    const safeVal = Math.max(0, Math.min(val, metadata.duration - 5));
    setStartSec(safeVal);
    if (safeVal >= endSec) {
      setEndSec(Math.min(metadata.duration, safeVal + 30));
    }
    setSelectedClipId(null);
  };

  const handleEndSecChange = (val: number) => {
    const safeVal = Math.max(startSec + 5, Math.min(val, metadata.duration || 999999));
    setEndSec(safeVal);
    setSelectedClipId(null);
  };

  const currentDuration = Math.max(1, endSec - startSec);

  const handleSubmit = async () => {
    await onGenerateClip({
      clipStart: startSec,
      clipEnd: endSec,
      burnSubtitles,
      aspectRatio,
    });
  };

  return (
    <div className="flex flex-col gap-5 pt-2 animate-fade-in">
      {/* Seletor de Modo: Automático vs Manual */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-elevated/70 border border-gray-800 w-fit">
        <button
          type="button"
          onClick={() => setClipMode('auto')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            clipMode === 'auto'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 shadow-md font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Cortes Automáticos com IA</span>
        </button>
        <button
          type="button"
          onClick={() => setClipMode('manual')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            clipMode === 'manual'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 shadow-md font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Corte Manual (Timeline)</span>
        </button>
      </div>

      {/* Conteúdo do Modo Automático */}
      {clipMode === 'auto' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Momentos Virais Sugeridos</span>
              <span className="text-[10px] lowercase text-cyan-400 font-normal">(15s a 30s)</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {suggestedClips.length} cortes identificados
            </span>
          </div>

          {isLoadingSuggestions ? (
            <div className="p-6 rounded-xl border border-gray-800 bg-surface-elevated/30 flex items-center justify-center gap-3 text-sm text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Analisando transcrição e áudio do vídeo para cortes virais...</span>
            </div>
          ) : suggestedClips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {suggestedClips.map((clip) => {
                const isSelected = selectedClipId === clip.id;
                return (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => handleSelectAutoClip(clip)}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                        : 'bg-surface-elevated/40 border-gray-800 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {clip.title}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>

                    {clip.tag && (
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {clip.tag}
                        </span>
                      </div>
                    )}

                    {clip.snippet && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-2">
                        {clip.snippet}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono mt-auto pt-1.5 border-t border-gray-800/60">
                      <span>{formatSeconds(clip.start)} → {formatSeconds(clip.end)}</span>
                      <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        {clip.duration}s
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-gray-800 bg-surface-elevated/20 text-xs text-gray-400">
              Nenhum momento automático detectado. Use o modo manual abaixo para escolher qualquer trecho.
            </div>
          )}
        </div>
      )}

      {/* Inputs de Corte (Início e Fim) */}
      <div className="p-4 rounded-xl bg-surface-elevated/40 border border-gray-800 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-300">Trecho do Vídeo Selecionado</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Ajuste rápido:</span>
            {[30, 45, 60].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => {
                  setEndSec(Math.min(metadata.duration || 999999, startSec + dur));
                  setSelectedClipId(null);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all border ${
                  currentDuration === dur
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-sm'
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                {dur}s
              </button>
            ))}
            <span className="text-xs text-cyan-400 font-mono font-bold ml-1">
              ({currentDuration}s)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Ponto Inicial (Início)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={Math.max(0, endSec - 5)}
                value={startSec}
                onChange={(e) => handleStartSecChange(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                {formatSeconds(startSec)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Ponto Final (Fim)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={startSec + 5}
                max={metadata.duration || 999999}
                value={endSec}
                onChange={(e) => handleEndSecChange(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                {formatSeconds(endSec)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Opções de Formato e Legenda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Formato / Aspect Ratio */}
        <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-gray-800 flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-300">Formato do Vídeo</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAspectRatio('vertical_9_16')}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all ${
                aspectRatio === 'vertical_9_16'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold">9:16 Vertical</span>
              <span className="text-[10px] text-gray-400">Reels / Shorts</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('original')}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all ${
                aspectRatio === 'original'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-xs font-bold">Original 16:9</span>
              <span className="text-[10px] text-gray-400">Horizontal</span>
            </button>
          </div>
        </div>

        {/* Legendas Embutidas */}
        <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-gray-800 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Subtitles className="w-4 h-4 text-cyan-400" />
                <span>Legendas no Vídeo</span>
              </label>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                TikTok Style
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              Queima legendas automáticas em amarelo e branco com contorno preto nítido.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
            <input
              type="checkbox"
              checked={burnSubtitles}
              onChange={(e) => setBurnSubtitles(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-950"
            />
            <span className="text-xs font-medium text-gray-200">
              {burnSubtitles ? 'Legendas automáticas ativadas' : 'Sem legendas'}
            </span>
          </label>
        </div>
      </div>

      {/* Botão de Geração */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-blue-400 text-gray-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <Scissors className="w-4 h-4" />
          <span>
            {isProcessing ? 'PROCESSANDO CORTE...' : `GERAR E BAIXAR CORTE (${formatSeconds(currentDuration)})`}
          </span>
        </button>
      </div>
    </div>
  );
};
