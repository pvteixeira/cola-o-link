import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
      <span className="text-sm font-semibold text-gray-400">Carregando COLA O LINK...</span>
    </div>
  );
}
