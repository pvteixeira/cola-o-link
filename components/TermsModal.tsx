'use client';

import React from 'react';
import { X, ShieldAlert, CheckCircle2, Lock, Scale, AlertOctagon } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface border border-gray-700 p-6 sm:p-8 shadow-2xl shadow-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Termos de Uso & Diretrizes Éticas</h2>
            <p className="text-xs text-gray-400">Conformidade legal e limites operacionais do VideoFetch</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
            <span>
              O <strong>COLA O LINK</strong> foi projetado para download de vídeos de domínio público ou conteúdos próprios criados pelo usuário em plataformas compatíveis.
            </span>
          </div>

          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 pt-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            O que a aplicação NÃO FAZ:
          </h3>
          <ul className="space-y-2 pl-2">
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Não contorna DRM:</strong> Não remove criptografia Widevine, FairPlay ou PlayReady.</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Não acessa conteúdo privado:</strong> Não faz login em contas de terceiros nem burla senhas.</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Não burla paywalls:</strong> Conteúdos pagos ou assinaturas de membros são bloqueados.</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Não quebra proteções ativas:</strong> Respeitamos limitações técnicas impostas pelos criadores.</span>
            </li>
          </ul>

          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 pt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Privacidade e Armazenamento Temporário
          </h3>
          <p className="text-gray-400 text-xs">
            Nenhum arquivo de vídeo permanece guardado em nossos discos permanentemente. O sistema executa uma limpeza contínua que exclui qualquer arquivo temporário após 15 minutos de sua geração.
          </p>

          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 pt-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Responsabilidade do Usuário
          </h3>
          <p className="text-gray-400 text-xs">
            O usuário declara que possui a autorização necessária ou os direitos sobre as mídias requeridas para download, isentando a plataforma de qualquer uso indevido de materiais protegidos por direitos autorais.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs sm:text-sm transition-all"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};
