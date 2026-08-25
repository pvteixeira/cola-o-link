import crypto from 'crypto';

const SECRET_KEY = process.env.DOWNLOAD_SIGNING_SECRET || 'colaolink-default-secure-signing-salt-2026';

export interface SignedDownloadToken {
  token: string;
  expiresAt: number;
}

/**
 * Gera um token criptográfico assinado com HMAC-SHA256 para links de download temporários.a
 */
export function generateDownloadToken(jobId: string, ttlMs = 15 * 60 * 1000): SignedDownloadToken {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${jobId}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  const token = `${expiresAt}.${signature}`;
  return { token, expiresAt };
}

/**
 * Valida se a assinatura HMAC-SHA256 do download é autêntica e não está expirada.
 */
export function verifyDownloadToken(jobId: string, token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${jobId}:${expiresAt}`)
    .digest('hex');

  // Comparação em tempo constante para evitar ataques de temporização (Timing Attacks)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
