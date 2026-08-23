'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, PlaySquare, Video, MessageSquare } from 'lucide-react';

export const PlatformStatus: React.FC = () => {
  const platforms = [
    {
      name: 'YouTube',
      status: 'Compatível',
      statusType: 'success',
      icon: PlaySquare,
      color: 'text-red-400',
      description: 'Vídeos públicos e Shorts em alta definição (até 1080p) e extração de áudio MP3.',
      restrictions: 'Não suporta vídeos com restrição de membros, filmes pagos ou conteúdos protegidos por DRM.',
    },
    {
      name: 'Vimeo',
      status: 'Compatível',
      statusType: 'success',
      icon: Video,
      color: 'text-sky-400',
      description: 'Vídeos públicos abertos da plataforma Vimeo com metadados completos.',
      restrictions: 'Vídeos privados com senha ou restrições de domínio específicas do criador não são baixados.',
    },
    {
      name: 'TikTok',
      status: 'Compatível',
      statusType: 'success',
      icon: Video,
      color: 'text-pink-400',
      description: 'Vídeos públicos em formato vertical MP4.',
      restrictions: 'Apenas contas públicas sem restrições geográficas ou privadas.',
    },
    {
      name: 'Reddit',
      status: 'Compatível',
      statusType: 'success',
      icon: MessageSquare,
      color: 'text-orange-400',
      description: 'Vídeos nativos hospedados no v.redd.it com áudio mesclado automaticamente.',
      restrictions: 'Comunidades privadas (NSFW restrito ou quarentenadas) não são acessíveis.',
    },
    {
      name: 'Instagram',
      status: 'Apenas Conteúdo 100% Público',
      statusType: 'warning',
      icon: Video,
      color: 'text-purple-400',
      description: 'Reels e vídeos de perfis totalmente abertos.',
      restrictions: 'Perfis privados, Stories temporários e posts que exigem autenticação/login não são suportados.',
    },
    {
      name: 'X / Twitter',
      status: 'Apenas Vídeos Públicos',
      statusType: 'warning',
      icon: MessageSquare,
      color: 'text-gray-300',
      description: 'Vídeos públicos anexados a tweets de contas abertas.',
      restrictions: 'Tweets de contas protegidas/trancadas não são acessíveis.',
    },
  ];

  return (
    <section id="plataformas" className="py-20 border-t border-gray-800/80 bg-surface/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Transparência & Conformidade
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 tracking-tight">
            Plataformas e Compatibilidade
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            O VideoFetch opera em estrita conformidade técnica e ética. Veja abaixo as diretrizes de cada provedor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="rounded-2xl bg-surface-elevated/60 border border-gray-800/80 p-6 flex flex-col justify-between hover:border-gray-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-5 h-5 ${p.color}`} />
                      <h3 className="font-bold text-white text-base">{p.name}</h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        p.statusType === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                          : 'bg-amber-950/60 border border-amber-800/60 text-amber-400'
                      }`}
                    >
                      {p.statusType === 'success' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-800/60 text-[11px] text-gray-400 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                  <span>{p.restrictions}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
