'use client';

import React, { useState } from 'react';
import { Search, Loader2, Clipboard, ArrowRight, CheckCircle2, PlaySquare, Video, MessageSquare, ShieldAlert } from 'lucide-react';

interface HeroProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  onSelectSampleUrl?: (url: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    await onAnalyze(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // Ignora caso permissão de clipboard seja negada
    }
  };

  const samplePlatforms = [
    { name: 'YouTube', icon: PlaySquare, color: 'text-red-400', sample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { name: 'Vimeo', icon: Video, color: 'text-sky-400', sample: 'https://vimeo.com/76979871' },
    { name: 'TikTok', icon: Video, color: 'text-pink-400', sample: 'https://www.tiktok.com/@tiktok/video/7100000000000000000' },
    { name: 'Reddit', icon: MessageSquare, color: 'text-orange-400', sample: 'https://www.reddit.com/r/videos/comments/example' },
    { name: 'Instagram', icon: Video, color: 'text-purple-400', sample: 'https://www.instagram.com/reel/example/' },
    { name: 'X / Twitter', icon: MessageSquare, color: 'text-gray-300', sample: 'https://x.com/user/status/123456789' },
  ];

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[350px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated/80 border border-gray-700/60 text-xs font-medium text-gray-300 mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Plataforma de alta velocidade para conteúdos públicos
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
          Baixe vídeos de forma <span className="text-gradient">simples</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Cole o link de um conteúdo público compatível e veja as opções disponíveis para download em alta resolução ou áudio.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="relative flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl bg-surface/90 border border-gray-700/80 shadow-2xl shadow-black/60 backdrop-blur-xl focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <div className="flex items-center flex-1 w-full px-3 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                id="video-url-input"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole a URL do vídeo aqui (ex: https://...)"
                className="w-full bg-transparent text-white placeholder-gray-500 text-sm sm:text-base outline-none py-2.5"
                disabled={isLoading}
              />
              {url ? (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800"
                >
                  Limpar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  title="Colar da área de transferência"
                  className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/80 rounded-lg transition-colors shrink-0"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              id="btn-analyze-video"
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-gray-950 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/40 active:scale-[0.98] transition-all shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analisando vídeo...</span>
                </>
              ) : (
                <>
                  <span>Analisar vídeo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Platforms Badges & Samples */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
            Plataformas compatíveis
          </span>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 max-w-2xl">
            {samplePlatforms.map((plat) => {
              const Icon = plat.icon;
              return (
                <button
                  key={plat.name}
                  type="button"
                  onClick={() => setUrl(plat.sample)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated border border-gray-800 hover:border-gray-700 text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer group"
                >
                  <Icon className={`w-3.5 h-3.5 ${plat.color} group-hover:scale-110 transition-transform`} />
                  <span>{plat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ethical Notice Disclaimer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldAlert className="w-4 h-4 text-gray-400" />
          <span>Respeitamos direitos autorais. Apenas mídias públicas sem DRM ou restrição de login são processadas.</span>
        </div>
      </div>
    </section>
  );
};
