import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeService } from '@/services/analyze.service';
import { checkRateLimit, extractClientIp } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/errors/app-error';

const analyzeSchema = z.object({
  url: z.string().url({ message: 'URL em formato inválido.' }).min(1),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting por IP
    const clientIp = extractClientIp(req);
    checkRateLimit(clientIp);

    // 2. Validação do corpo da requisição
    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Parâmetros inválidos.',
        },
        { status: 400 }
      );
    }

    // 3. Processamento via Serviço de Análise
    const result = await analyzeService.analyze(parsed.data.url);
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

    console.error('[API /api/analyze] Erro não tratado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Não foi possível analisar o link informado. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}
