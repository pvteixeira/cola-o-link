import { APP_CONFIG } from '@/config/app.config';
import { AppError } from '@/lib/errors/app-error';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Limpeza periódica dos IPs expirados da memória
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (now > record.resetAt) {
      ipRequestMap.delete(ip);
    }
  }
}, 60 * 1000);

export function checkRateLimit(clientIp: string): void {
  const now = Date.now();
  const { maxRequests, windowMs } = APP_CONFIG.security.rateLimit;
  const ip = clientIp || 'unknown-client';

  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (record.count >= maxRequests) {
    throw AppError.rateLimitExceeded();
  }

  record.count += 1;
}

export function extractClientIp(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}
