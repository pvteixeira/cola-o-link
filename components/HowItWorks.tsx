'use client';

import React from 'react';
import { Link2, Sliders, Scissors, ArrowDownCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Cole o Link',
      description: 'Copie a URL pública do vídeo que deseja baixar e cole na barra de busca do COLA O LINK.',
      icon: Link2,
      accent: 'from-cyan-500/10 to-transparent',
      border: 'border-slate-800/80 hover:border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      step: '02',
      title: 'Escolha a Resolução',
      description: 'Selecione entre 1080p Full HD, HD 720p ou áudio puro MP3 com 320 kbps de alta fidelidade.',
      icon: Sliders,
      accent: 'from-teal-500/10 to-transparent',
      border: 'border-slate-800/80 hover:border-teal-500/30',
      iconColor: 'text-teal-400',
    },
    {
      step: '03',
      title: 'Cortes & Shorts com IA',
      description: 'Gere automaticamente clipes de 15s a 30s dos pontos virais com legendas queimadas estilo TikTok e formato 9:16.',
      icon: Scissors,
      accent: 'from-cyan-500/10 to-transparent',
      border: 'border-slate-800/80 hover:border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      step: '04',
      title: 'Baixe Instantaneamente',
      description: 'Nossa fila segura processa o vídeo e entrega o arquivo pronto direto no seu celular ou computador.',
      icon: ArrowDownCircle,
      accent: 'from-emerald-500/10 to-transparent',
      border: 'border-slate-800/80 hover:border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <section id="como-funciona" className="py-24 border-t border-white/[0.06] bg-[#0B0F17]/50 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/25 text-xs font-medium text-cyan-300 mb-3 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fluxo Transparente</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.02em] mb-4">
            Como o <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">COLA O LINK</span> Funciona
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            Desenvolvido para entregar máxima velocidade com uma arquitetura modular, rápida e segura.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`relative rounded-2xl bg-gradient-to-b ${item.accent} bg-slate-900/50 hover:bg-slate-900/80 p-6 border ${item.border} backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.4)] group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <span className="text-2xl font-black text-slate-700/60 group-hover:text-slate-600 transition-colors select-none font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 max-w-2xl mx-auto flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="leading-relaxed">
            Não armazenamos vídeos permanentemente em nossos servidores. Arquivos temporários são excluídos automaticamente após 15 minutos.
          </span>
        </div>
      </div>
    </section>
  );
};
