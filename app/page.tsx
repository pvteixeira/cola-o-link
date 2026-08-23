'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { VideoCard } from '@/components/VideoCard';
import { DownloadProgress } from '@/components/DownloadProgress';
import { HowItWorks } from '@/components/HowItWorks';
import { PlatformStatus } from '@/components/PlatformStatus';
import { TermsModal } from '@/components/TermsModal';
import { Footer } from '@/components/Footer';
import { VideoMetadata } from '@/types/video';
import { AnalyzeResponse, DownloadResponse } from '@/types/api';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isStartingDownload, setIsStartingDownload] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // 1. Ação de Análise da URL
  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setMetadata(null);
    setCurrentJobId(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data: AnalyzeResponse = await res.json();

      if (res.ok && data.success) {
        setMetadata({
          id: `${Date.now()}`,
          url,
          title: data.title || 'Vídeo Público',
          thumbnail: data.thumbnail || '',
          duration: data.duration || 0,
          durationFormatted: data.durationFormatted || '00:00',
          author: data.author,
          platform: data.platform || 'youtube',
          formats: data.formats || [],
        });

        // Scroll suave até o card de resultado
        setTimeout(() => {
          document.getElementById('video-result-card')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setErrorMessage(data.error || 'Não foi possível analisar o link informado.');
      }
    } catch (err) {
      setErrorMessage('Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Ação de Início do Download
  const handleStartDownload = async (format: string, quality: string, formatId?: string) => {
    if (!metadata) return;
    setIsStartingDownload(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: metadata.url,
          format,
          quality,
          formatId,
        }),
      });

      const data: DownloadResponse = await res.json();

      if (res.ok && data.success && data.jobId) {
        setCurrentJobId(data.jobId);
        // Scroll até a barra de progresso
        setTimeout(() => {
          document.getElementById('download-progress-card')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setErrorMessage(data.error || 'Não foi possível iniciar o download.');
      }
    } catch (err) {
      setErrorMessage('Erro ao agendar o download com o servidor.');
    } finally {
      setIsStartingDownload(false);
    }
  };

  const handleReset = () => {
    setCurrentJobId(null);
    setMetadata(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-100">
      {/* Header */}
      <Header
        onOpenTerms={() => setIsTermsOpen(true)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        {/* Hero Section with URL Input */}
        <Hero
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 my-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Video Metadata Result Card */}
        {metadata && !currentJobId && (
          <VideoCard
            metadata={metadata}
            onStartDownload={handleStartDownload}
            isStartingDownload={isStartingDownload}
          />
        )}

        {/* Download Queue & Progress Tracker */}
        {currentJobId && (
          <DownloadProgress
            jobId={currentJobId}
            onReset={handleReset}
          />
        )}

        {/* How It Works Section */}
        <HowItWorks />

        {/* Platforms and Transparency Grid */}
        <PlatformStatus />
      </main>

      {/* Footer */}
      <Footer onOpenTerms={() => setIsTermsOpen(true)} />

      {/* Terms & Ethics Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
