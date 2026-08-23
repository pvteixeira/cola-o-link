import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-cyan-400 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
      <p className="text-sm text-gray-400 max-w-md mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm flex items-center gap-2 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Voltar para o início</span>
      </Link>
    </div>
  );
}
