'use client';

import React from 'react';
import { DownloadCloud, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenTerms: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTerms, onScrollToSection }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="logo-brand"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
              <DownloadCloud className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 uppercase">
              COLA O <span className="text-gradient">LINK</span>
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <button
            id="nav-inicio"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-cyan-400 transition-colors"
          >
            Início
          </button>
          <button
            id="nav-como-funciona"
            onClick={() => onScrollToSection('como-funciona')}
            className="hover:text-cyan-400 transition-colors"
          >
            Como funciona
          </button>
          <button
            id="nav-plataformas"
            onClick={() => onScrollToSection('plataformas')}
            className="hover:text-cyan-400 transition-colors"
          >
            Plataformas
          </button>
          <button
            id="nav-termos"
            onClick={onOpenTerms}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Termos & Ética
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            v1.0 Funcional
          </span>
          <button
            onClick={onOpenTerms}
            className="md:hidden text-xs font-medium text-gray-400 hover:text-white px-2.5 py-1 rounded-lg border border-gray-800"
          >
            Termos
          </button>
        </div>
      </div>
    </header>
  );
};
