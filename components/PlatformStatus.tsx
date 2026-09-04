'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const PlatformStatus: React.FC = () => {
  const platforms = [
    {
      name: 'YouTube',
      category: 'Vídeos & Shorts',
      status: 'Compatível',
      statusType: 'success',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      description: 'Vídeos públicos e Shorts em alta definição (até 1080p) e extração de áudio MP3 de alta fidelidade.',
      restrictions: 'Não suporta conteúdos de membros, transmissões ao vivo privadas ou vídeos com DRM.',
    },
    {
      name: 'Vimeo',
      category: 'Criadores & Portfólios',
      status: 'Compatível',
      statusType: 'success',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4c-.66-2.529-1.391-3.793-2.193-3.793-.176 0-.791.378-1.847 1.134L0 7.235c1.188-1.042 2.357-2.083 3.507-3.125 1.584-1.365 2.766-2.094 3.545-2.188 1.849-.221 2.99.98 3.424 3.606.46 2.809.774 4.562.946 5.257.514 2.38 1.077 3.57 1.691 3.57.481 0 1.196-.732 2.148-2.198.95-1.465 1.465-2.593 1.543-3.385.137-1.366-.395-2.05-1.597-2.05-.59 0-1.218.136-1.884.408 1.222-3.999 3.52-5.94 6.892-5.826 2.502.083 3.687 1.637 3.553 4.664z" />
        </svg>
      ),
      description: 'Vídeos públicos abertos da plataforma Vimeo com metadados e áudio preservados.',
      restrictions: 'Vídeos protegidos por senha ou restrições de incorporação por domínio não são baixados.',
    },
    {
      name: 'TikTok',
      category: 'Vídeos Verticais',
      status: 'Compatível',
      statusType: 'success',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      description: 'Vídeos públicos em formato vertical MP4 com áudio original completo.',
      restrictions: 'Apenas perfis e vídeos públicos sem restrições regionais ou configurações de privacidade.',
    },
    {
      name: 'Reddit',
      category: 'Comunidades',
      status: 'Compatível',
      statusType: 'success',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      description: 'Vídeos nativos hospedados no v.redd.it com áudio e vídeo mesclados automaticamente.',
      restrictions: 'Subreddits privados ou conteúdos que exigem autenticação não são acessíveis.',
    },
    {
      name: 'Instagram',
      category: 'Reels & Vídeos',
      status: 'Apenas Público',
      statusType: 'warning',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      description: 'Reels e vídeos públicos de perfis abertos com processamento direto.',
      restrictions: 'Perfis privados, Stories efêmeros ou conteúdos restritos por login não são suportados.',
    },
    {
      name: 'X / Twitter',
      category: 'Mídia em Tweets',
      status: 'Apenas Público',
      statusType: 'warning',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      description: 'Vídeos públicos anexados a tweets de perfis totalmente abertos.',
      restrictions: 'Contas com tweets protegidos (cadeado) ou conteúdos com restrição etária são bloqueados.',
    },
  ];

  return (
    <section id="plataformas" className="py-24 border-t border-white/[0.06] bg-[#0B0F17] relative overflow-hidden">
      {/* Ambient subtle glow behind the platforms section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.14] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/25 text-xs font-medium text-cyan-300 mb-3 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transparência & Conformidade</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.02em] mb-4">
            Plataformas e <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Compatibilidade</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            O COLA O LINK opera em estrita conformidade técnica e ética. Apenas vídeos públicos sem restrições de DRM são processados.
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((p) => {
            const isSuccess = p.statusType === 'success';

            return (
              <div
                key={p.name}
                className="relative rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.5)] group overflow-hidden"
              >
                {/* Subtle top hover glow border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/0 group-hover:via-cyan-400/40 to-transparent transition-all duration-300" />

                <div>
                  {/* Card Header: Icon + Title + Status Pill */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors shadow-sm shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base tracking-tight leading-tight">{p.name}</h3>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    {/* Clean Status Pill with Dot indicator */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        isSuccess
                          ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-950/50 border border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSuccess ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                        }`}
                      />
                      {p.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <p className="text-xs text-slate-300/80 mb-5 leading-relaxed font-normal">
                    {p.description}
                  </p>
                </div>

                {/* Card Restrictions Footer */}
                <div className="pt-3.5 border-t border-slate-800/70 text-[11px] text-slate-400 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5 group-hover:text-cyan-400/80 transition-colors" />
                  <span className="leading-relaxed">{p.restrictions}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

