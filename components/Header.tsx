'use client';

import React from 'react';
import { DownloadCloud, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenTerms: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTerms, onScrollToSection }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0B0F17]/40 backdrop-blur-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo with smoother, less glaring cyan-teal glow */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="logo-brand"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400/60 group-hover:bg-cyan-500/15 group-hover:shadow-[0_0_18px_rgba(6,182,212,0.25)] shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-300">
            <DownloadCloud className="w-4.5 h-4.5 group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 uppercase">
              COLA O <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">LINK</span>
            </span>
          </div>
        </div>

        {/* Menu Navigation with clean professional sans-serif typography */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            id="nav-inicio"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-cyan-400 transition-colors duration-150"
          >
            Início
          </button>
          <button
            id="nav-como-funciona"
            onClick={() => onScrollToSection('como-funciona')}
            className="hover:text-cyan-400 transition-colors duration-150"
          >
            Como funciona
          </button>
          <button
            id="nav-plataformas"
            onClick={() => onScrollToSection('plataformas')}
            className="hover:text-cyan-400 transition-colors duration-150"
          >
            Plataformas
          </button>
          <button
            id="nav-termos"
            onClick={onOpenTerms}
            className="hover:text-cyan-400 transition-colors duration-150 flex items-center gap-1.5 text-slate-300"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400/80" />
            Termos & Ética
          </button>
        </nav>

        {/* Action Button: High-priority CTA with subtler, integrated pill shape and glow */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onScrollToSection('como-funciona')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/25 hover:border-cyan-500/50 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:shadow-[0_0_16px_rgba(6,182,212,0.2)] transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cortes & Shorts com IA</span>
          </button>
          <button
            onClick={onOpenTerms}
            className="md:hidden text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800"
          >
            Termos
          </button>
        </div>
      </div>
    </header>
  );
};

