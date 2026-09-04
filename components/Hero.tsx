'use client';

import React, { useState } from 'react';
import { Search, Loader2, Clipboard, ArrowRight, ShieldCheck, Flame, Captions, Smartphone, X } from 'lucide-react';


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
    {
      name: 'YouTube',
      sample: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'Vimeo',
      sample: 'https://vimeo.com/76979871',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4c-.66-2.529-1.391-3.793-2.193-3.793-.176 0-.791.378-1.847 1.134L0 7.235c1.188-1.042 2.357-2.083 3.507-3.125 1.584-1.365 2.766-2.094 3.545-2.188 1.849-.221 2.99.98 3.424 3.606.46 2.809.774 4.562.946 5.257.514 2.38 1.077 3.57 1.691 3.57.481 0 1.196-.732 2.148-2.198.95-1.465 1.465-2.593 1.543-3.385.137-1.366-.395-2.05-1.597-2.05-.59 0-1.218.136-1.884.408 1.222-3.999 3.52-5.94 6.892-5.826 2.502.083 3.687 1.637 3.553 4.664z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      sample: 'https://www.tiktok.com/@tiktok/video/7100000000000000000',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    {
      name: 'Reddit',
      sample: 'https://www.reddit.com/r/videos/comments/example',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      sample: 'https://www.instagram.com/reel/example/',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'X / Twitter',
      sample: 'https://x.com/user/status/123456789',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* 2. Hero Section: Subtle Background Glow (mesh/radial glow 10-15% opacity in deep blue-cyan behind central text) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[440px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.14)_0%,rgba(14,116,144,0.06)_45%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(circle,rgba(30,58,138,0.12)_0%,transparent_70%)] blur-[70px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.16] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* 2. Hero: Refined Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/25 text-xs font-medium text-slate-300 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.08)] backdrop-blur-md animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="text-cyan-300/90 font-semibold">Novo:</span>
          <span className="text-slate-300">Cortes Virais (15-30s), Legendas TikTok & Formato Vertical 9:16</span>
        </div>

        {/* 2. Hero: Headline Improvements (bolder font, tighter tracking -0.02em, glowing cyan-teal less noisy) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.02em] text-white mb-5 leading-[1.12]">
          Baixe vídeos e crie <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent [text-shadow:0_0_24px_rgba(6,182,212,0.2)]">cortes inteligentes</span>
        </h1>

        {/* 2. Hero: Body Copy (Subheadline) - Simplified, standardized, zero bolding, zero cyan, uniform grey text block */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Cole o link de qualquer vídeo público. Baixe em até 1080p, extraia áudio em MP3 320kbps ou gere cortes de 15s a 30s com legendas automáticas para Reels e TikTok.
        </p>

        {/* 2. Hero: Input & CTA Button (High-contrast vibrant solid cyan-teal CTA button with dark text) */}
        <form onSubmit={handleSubmit} className="max-w-2xl sm:max-w-3xl mx-auto mb-6">
          <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all duration-200">
            <div className="flex items-center flex-1 w-full px-3 gap-2.5">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                id="video-url-input"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole a URL do vídeo aqui (ex: https://...)"
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base outline-none py-2.5"
                disabled={isLoading}
              />
              {url ? (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors"
                >
                  Limpar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  title="Colar da área de transferência"
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors shrink-0"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              id="btn-analyze-video"
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] active:scale-[0.98] transition-all duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analisando vídeo...</span>
                </>
              ) : (
                <>
                  <span>Analisar vídeo</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* 3. Refined Feature Cards: Replaced emojis with clean monochrome SVG icons in brand cyan-teal, standardized body text, perfectly grid-aligned matching input bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl sm:max-w-3xl mx-auto mb-10 text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-sm flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Cortes de 15s a 30s</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-normal">
              IA que detecta picos de áudio, engajamento e falas virais automaticamente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-sm flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-2">
              <Captions className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Legendas TikTok Style</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-normal">
              Legendas sincronizadas em amarelo vibrante com contorno preto nítido de alto contraste.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-sm flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">9:16 Vertical para Shorts</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-normal">
              Conversão com fundo dinâmico desfocado para Reels, TikTok e YouTube Shorts.
            </p>
          </div>
        </div>

        {/* 4. Updated Platforms Bar: Simplified badges with uniform, monochrome icons */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Plataformas compatíveis
          </span>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 max-w-2xl">
            {samplePlatforms.map((plat) => (
              <button
                key={plat.name}
                type="button"
                onClick={() => setUrl(plat.sample)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/70 hover:border-slate-700 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
              >
                <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {plat.icon}
                </span>
                <span>{plat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Clean Footer / Bottom of Hero: Copyright disclaimer remains */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400/80 shrink-0" />
          <span>Respeitamos direitos autorais. Apenas mídias públicas sem DRM ou restrição de login são processadas.</span>
        </div>
      </div>

      {/* 5. Clean Footer / Bottom of Hero: Subtle background glow separating the hero section from 'FLUXO TRANSPARENTE' */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[60px] bg-cyan-500/5 blur-[50px] pointer-events-none -z-10" />
    </section>
  );
};

