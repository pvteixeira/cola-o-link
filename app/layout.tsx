import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'COLA O LINK | Baixe vídeos públicos de forma rápida e simples',
  description: 'Cole o link de um vídeo do YouTube, TikTok, Vimeo, Reddit ou Instagram e baixe em alta qualidade (MP4/MP3).',
  keywords: ['cola o link', 'baixar video', 'youtube', 'tiktok', 'vimeo', 'reddit', 'instagram', 'mp4', 'mp3'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} bg-[#0B0F17] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}

