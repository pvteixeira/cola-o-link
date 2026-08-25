'use client';

import React from 'react';
import { Link2, Sliders, ArrowDownCircle, ShieldCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Cole o Link',
      description: 'Copie a URL pública do vídeo que deseja salvar e cole na barra de busca do COLA O LINK.',
      icon: Link2,
      accent: 'from-cyan-500/20 to-cyan-500/5',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      step: '02',
      title: 'Escolha a Qualidade',
      description: 'Selecione entre resolução máxima (1080p, 720p) ou extração exclusiva da faixa de áudio MP3.',
      icon: Sliders,
      accent: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      step: '03',
      title: 'Baixe Instantaneamente',
      description: 'Nossa fila segura processa o fluxo sem DRM e entrega o arquivo limpo diretamente no seu dispositivo.',
      icon: ArrowDownCircle,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 border-t border-gray-800/80 bg-background/50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Fluxo Transparente
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 tracking-tight">
            Como o <span className="text-gradient">COLA O LINK</span> Funciona
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Desenvolvido para entregar máxima velocidade com uma arquitetura modular e segura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`relative rounded-2xl bg-gradient-to-b ${item.accent} p-6 sm:p-8 border ${item.border} backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-gray-700/60 flex items-center justify-center shadow-md">
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <span className="text-2xl font-black text-gray-700 select-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-4 rounded-xl bg-surface-elevated/40 border border-gray-800 max-w-2xl mx-auto flex items-center gap-3 text-xs text-gray-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Não armazenamos vídeos permanentemente em nossos servidores. Arquivos temporários são excluídos automaticamente após 15 minutos.
          </span>
        </div>
      </div>
    </section>
  );
};
