'use client';

import React, { useEffect, useState } from 'react';
import { JobStatusResponse } from '@/types/api';
import { Download, CheckCircle2, AlertCircle, Loader2, RefreshCw, FileVideo, Sparkles } from 'lucide-react';

interface DownloadProgressProps {
  jobId: string;
  onReset: () => void;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({ jobId, onReset }) => {
  const [jobState, setJobState] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggeredAutoDownload, setHasTriggeredAutoDownload] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/download/${jobId}`);
        const data: JobStatusResponse = await res.json();

        if (isCancelled) return;

        if (res.ok) {
          setJobState(data);

          if (data.status === 'completed') {
            clearInterval(interval);
            // Inicia download automaticamente quando pronto
            if (data.downloadUrl && !hasTriggeredAutoDownload) {
              setHasTriggeredAutoDownload(true);
              const link = document.createElement('a');
              link.href = data.downloadUrl;
              link.download = data.fileName || 'video.mp4';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } else if (data.status === 'failed' || data.status === 'unavailable') {
            clearInterval(interval);
            setError(data.error || 'Falha no processamento do download.');
          }
        } else {
          setError(data.error || 'Erro ao consultar status do download.');
          clearInterval(interval);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Erro de conexão ao acompanhar o download.');
          clearInterval(interval);
        }
      }
    };

    // Polling imediato e a cada 1000ms
    pollStatus();
    interval = setInterval(pollStatus, 1000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [jobId, hasTriggeredAutoDownload]);

  const progress = jobState?.progress ?? 5;
  const isCompleted = jobState?.status === 'completed';
  const isFailed = jobState?.status === 'failed' || Boolean(error);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 my-8 animate-fade-in" id="download-progress-card">
      <div className="rounded-2xl bg-surface/90 border border-gray-700/80 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
        
        {/* Header Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : isFailed ? (
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isCompleted
                  ? 'Seu arquivo está pronto!'
                  : isFailed
                  ? 'Não foi possível concluir o download'
                  : 'Preparando seu download...'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isCompleted
                  ? 'O download foi processado e iniciado no seu navegador.'
                  : isFailed
                  ? error || jobState?.error || 'Ocorreu um erro no processamento do vídeo.'
                  : jobState?.message || 'Processando nos servidores do COLA O LINK...'}
              </p>
            </div>
          </div>

          <span className="text-sm font-extrabold text-cyan-400 tabular-nums">
            {isCompleted ? '100%' : isFailed ? '0%' : `${progress}%`}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-3.5 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-gray-800 mb-6">
          <div
            className={`h-full rounded-full transition-all duration-500 relative overflow-hidden ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          >
            {!isCompleted && !isFailed && (
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
            )}
          </div>
        </div>

        {/* Completed Details / Actions */}
        {isCompleted && (
          <div className="p-4 rounded-xl bg-surface-elevated border border-gray-800/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <FileVideo className="w-8 h-8 text-cyan-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-sm">
                  {jobState?.fileName || 'video-baixado.mp4'}
                </p>
                <p className="text-xs text-gray-400">
                  Tamanho: {jobState?.fileSizeFormatted || 'Processado'}
                </p>
              </div>
            </div>

            {jobState?.downloadUrl && (
              <a
                id="btn-direct-download"
                href={jobState.downloadUrl}
                download={jobState.fileName || 'video.mp4'}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-gray-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-5 h-5 text-gray-950 stroke-[2.5]" />
                <span>CLIQUE AQUI PARA BAIXAR</span>
              </a>
            )}
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/80">
          <span className="text-xs text-gray-500">
            {isCompleted
              ? 'Arquivo temporário retido por 15 minutos.'
              : 'O arquivo será baixado diretamente no seu dispositivo.'}
          </span>

          <button
            type="button"
            id="btn-reset-download"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-surface-elevated/40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Baixar outro vídeo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
