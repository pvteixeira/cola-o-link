'use client';

import React from 'react';
import { DownloadCloud, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms }) => {
  return (
    <footer className="w-full border-t border-gray-800/80 bg-background py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.12)]">
            <DownloadCloud className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white uppercase">
            COLA O <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">LINK</span>
          </span>
          <span className="text-xs text-slate-500 ml-2">© {new Date().getFullYear()}</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <button onClick={onOpenTerms} className="hover:text-cyan-400 transition-colors">
            Termos de Serviço
          </button>
          <button onClick={onOpenTerms} className="hover:text-cyan-400 transition-colors">
            Política de Privacidade & DRM
          </button>
          <a 
            href="#como-funciona" 
            className="hover:text-cyan-400 transition-colors"
          >
            Como Funciona
          </a>
        </div>

        {/* Disclaimer note */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>Desenvolvido para conteúdos públicos permitidos</span>
        </div>

      </div>
    </footer>
  );
};
