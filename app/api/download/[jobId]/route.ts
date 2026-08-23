import { NextResponse } from 'next/server';
import { downloadService } from '@/services/download.service';
import { AppError } from '@/lib/errors/app-error';

export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const status = await downloadService.getJobStatus(jobId);
    return NextResponse.json(status);
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

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao consultar status da tarefa.',
      },
      { status: 500 }
    );
  }
}
