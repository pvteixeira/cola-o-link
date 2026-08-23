import { execFile } from 'child_process';
import { promisify } from 'util';
import { AppError } from '@/lib/errors/app-error';
import { APP_CONFIG } from '@/config/app.config';

const execFileAsync = promisify(execFile);

export interface SafeExecOptions {
  timeoutMs?: number;
  maxBuffer?: number;
}

export interface SafeExecResult {
  stdout: string;
  stderr: string;
}

/**
 * Executa comandos de forma segura sem invocar o shell (shell: false).
 * Previne ataques de Command Injection ao passar argumentos estritamente em array.
 */
export async function safeExec(
  command: string,
  args: string[],
  options: SafeExecOptions = {}
): Promise<SafeExecResult> {
  const timeout = options.timeoutMs || APP_CONFIG.security.processTimeoutMs;
  const maxBuffer = options.maxBuffer || 50 * 1024 * 1024; // 50 MB buffer

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      timeout,
      maxBuffer,
      shell: false, // CRÍTICO: Não passa por interpretador bash/cmd
      windowsHide: true,
    });

    return { stdout, stderr };
  } catch (error: unknown) {
    const err = error as {
      code?: string | number;
      killed?: boolean;
      signal?: string;
      stderr?: string;
      stdout?: string;
      message?: string;
    };

    if (err.killed || err.signal === 'SIGTERM') {
      throw new AppError('TIMEOUT', 'O tempo limite de processamento foi atingido.', 408);
    }

    const stderrMsg = (err.stderr || err.message || '').toLowerCase();

    // Mapeamento semântico de erros de plataformas/yt-dlp para respostas amigáveis e legais
    if (stderrMsg.includes('drm') || stderrMsg.includes('protected')) {
      throw AppError.drmProtected('Este vídeo possui proteção DRM ou criptografia e não pode ser baixado.');
    }
    if (stderrMsg.includes('private video') || stderrMsg.includes('login required') || stderrMsg.includes('sign in')) {
      throw AppError.privateContent('Este conteúdo é privado ou exige autenticação/login.');
    }
    if (stderrMsg.includes('age-restricted') || stderrMsg.includes('members-only') || stderrMsg.includes('paywall')) {
      throw AppError.restrictedContent('Este conteúdo possui restrições de acesso (ex: membros ou paywall).');
    }
    if (stderrMsg.includes('video unavailable') || stderrMsg.includes('not available')) {
      throw AppError.restrictedContent('Este conteúdo não está disponível publicamente.');
    }

    throw new AppError('DOWNLOAD_FAILED', 'Falha ao executar operação com o conteúdo solicitado.', 500, error);
  }
}
