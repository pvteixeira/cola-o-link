'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h2>
      <p className="text-sm text-gray-400 max-w-md mb-8">
        {error?.message || 'Ocorreu um erro inesperado ao renderizar a página.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Tentar novamente</span>
      </button>
    </div>
  );
}
