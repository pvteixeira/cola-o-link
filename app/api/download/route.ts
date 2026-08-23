import { NextResponse } from 'next/server';
import { z } from 'zod';
import { downloadService } from '@/services/download.service';
import { checkRateLimit, extractClientIp } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/errors/app-error';

const downloadSchema = z.object({
  url: z.string().url({ message: 'URL em formato inválido.' }).min(1),
  format: z.string().default('mp4'),
  quality: z.string().default('1080p'),
  formatId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting por IP
    const clientIp = extractClientIp(req);
    checkRateLimit(clientIp);

    // 2. Validação do corpo da requisição
    const body = await req.json();
    const parsed = downloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Parâmetros inválidos.',
        },
        { status: 400 }
      );
    }

    // 3. Enfileiramento do job
    const result = await downloadService.createDownloadJob(parsed.data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.userMessage,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    console.error('[API /api/download] Erro não tratado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Não foi possível agendar o download deste link.',
      },
      { status: 500 }
    );
  }
}
