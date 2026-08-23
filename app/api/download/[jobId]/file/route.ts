import { NextResponse } from 'next/server';
import fs from 'fs';
import { storageService } from '@/services/storage.service';
import { assertSafeFilePath } from '@/lib/security/sanitize';

export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const fileMeta = storageService.getFile(jobId);

    if (!fileMeta) {
      return NextResponse.json(
        {
          success: false,
          error: 'O arquivo solicitado não foi encontrado ou seu link de download expirou.',
        },
        { status: 404 }
      );
    }

    const safePath = assertSafeFilePath(fileMeta.filePath);

    if (!fs.existsSync(safePath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'O arquivo não está mais disponível no servidor temporário.',
        },
        { status: 404 }
      );
    }

    // Leitura síncrona do buffer completo para entrega instantânea e segura
    const fileBuffer = fs.readFileSync(safePath);

    // Sanitização de cabeçalho RFC 5987 / RFC 6266
    const asciiSafeFilename = fileMeta.fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '_');

    const encodedFilename = encodeURIComponent(fileMeta.fileName);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': fileMeta.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${asciiSafeFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err) {
    console.error('[API /file] Erro ao servir arquivo:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao disponibilizar o arquivo para download.',
      },
      { status: 500 }
    );
  }
}
