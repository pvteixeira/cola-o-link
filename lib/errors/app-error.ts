export type ErrorCode =
  | 'INVALID_URL'
  | 'UNSUPPORTED_PLATFORM'
  | 'PRIVATE_CONTENT'
  | 'RESTRICTED_CONTENT'
  | 'DRM_PROTECTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SSRF_ATTEMPT'
  | 'DOWNLOAD_FAILED'
  | 'JOB_NOT_FOUND'
  | 'FILE_EXPIRED'
  | 'SIZE_LIMIT_EXCEEDED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(code: ErrorCode, userMessage: string, statusCode = 400, originalError?: unknown) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;

    if (originalError && originalError instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }

  static invalidUrl(msg = 'A URL fornecida é inválida ou não pôde ser analisada.') {
    return new AppError('INVALID_URL', msg, 400);
  }

  static unsupportedPlatform(msg = 'Esta plataforma ainda não é compatível com o VideoFetch.') {
    return new AppError('UNSUPPORTED_PLATFORM', msg, 422);
  }

  static privateContent(msg = 'Este conteúdo é privado ou exige autenticação para acesso.') {
    return new AppError('PRIVATE_CONTENT', msg, 403);
  }

  static restrictedContent(msg = 'Este conteúdo possui restrições que impedem o download.') {
    return new AppError('RESTRICTED_CONTENT', msg, 403);
  }

  static drmProtected(msg = 'Este vídeo possui proteção por DRM e não pode ser baixado.') {
    return new AppError('DRM_PROTECTED', msg, 403);
  }

  static rateLimitExceeded(msg = 'Muitas requisições. Por favor, aguarde alguns instantes antes de tentar novamente.') {
    return new AppError('RATE_LIMIT_EXCEEDED', msg, 429);
  }

  static ssrfAttempt(msg = 'O endereço fornecido aponta para uma rede interna ou não permitida.') {
    return new AppError('SSRF_ATTEMPT', msg, 403);
  }

  static downloadFailed(msg = 'Não foi possível processar o download deste link.') {
    return new AppError('DOWNLOAD_FAILED', msg, 500);
  }

  static jobNotFound(msg = 'Tarefa de download não encontrada ou já expirada.') {
    return new AppError('JOB_NOT_FOUND', msg, 404);
  }

  static fileExpired(msg = 'O link de download expirou. Por favor, gere o download novamente.') {
    return new AppError('FILE_EXPIRED', msg, 410);
  }

  static sizeLimitExceeded(msg = 'O arquivo excede o limite máximo permitido de tamanho.') {
    return new AppError('SIZE_LIMIT_EXCEEDED', msg, 413);
  }
}
