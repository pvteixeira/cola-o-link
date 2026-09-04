import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateAndSecureUrl } from '@/lib/security/url-validator';
import { downloadSubtitles, parseSrt, analyzeSuggestedClips } from '@/lib/media/subtitles';
import { isYtDlpAvailable } from '@/providers/ytdlp-runner';
import { APP_CONFIG } from '@/config/app.config';

const requestSchema = z.object({
  url: z.string().url(),
  duration: z.number().optional().default(180),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'URL inválida.' }, { status: 400 });
    }

    const { url } = await validateAndSecureUrl(parsed.data.url);
    const hasYtDlp = await isYtDlpAvailable();

    let srtText: string | null = null;
    if (hasYtDlp) {
      const ytDlpBin = process.env.YT_DLP_PATH || 'yt-dlp';
      srtText = await downloadSubtitles(url, ytDlpBin, APP_CONFIG.storage.tempDir);
    }

    const cues = srtText ? parseSrt(srtText) : [];
    const clips = analyzeSuggestedClips(cues, parsed.data.duration);

    return NextResponse.json({
      success: true,
      hasSubtitles: cues.length > 0,
      clips,
    });
  } catch (err) {
    console.error('[API /api/clips/suggest] Erro:', err);
    return NextResponse.json(
      { success: false, error: 'Não foi possível analisar os cortes do vídeo.' },
      { status: 500 }
    );
  }
}
