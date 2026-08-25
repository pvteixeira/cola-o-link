import dns from 'dns/promises';
import { APP_CONFIG } from '@/config/app.config';
import { AppError } from '@/lib/errors/app-error';

// Faixas de IP privadas e reservadas (IPv4 e IPv6)
const PRIVATE_IP_RANGES = [
  /^127\./,                         // Loopback
  /^10\./,                          // RFC 1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC 1918 Class B
  /^192\.168\./,                    // RFC 1918 Class C
  /^169\.254\./,                    // Link-local / AWS / GCP metadata
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 Loopback
  /^fc00:/i,                        // IPv6 Unique local
  /^fe80:/i,                        // IPv6 Link-local
];

export function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((pattern) => pattern.test(ip));
}

export interface ValidatedUrlResult {
  url: string;
  hostname: string;
  normalizedUrl: string;
}

export async function validateAndSecureUrl(rawUrl: string): Promise<ValidatedUrlResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw AppError.invalidUrl('A URL não pode estar vazia.');
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw AppError.invalidUrl('O formato do link informado é inválido.');
  }

  // Apenas HTTP e HTTPS são aceitos
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw AppError.invalidUrl('Apenas URLs com protocolo http:// ou https:// são permitidas.');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Bloqueio imediato de localhost e termos de metadados
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.includes('169.254.169.254') ||
    hostname.includes('metadata.google.internal')
  ) {
    throw AppError.ssrfAttempt('Acesso a endereços locais ou internos não é permitido.');
  }

  // Verifica allowlist de domínios conhecidos
  const isAllowed = APP_CONFIG.security.allowedHostnames.some((allowed) => {
    return hostname === allowed || hostname.endsWith(`.${allowed}`);
  });

  if (!isAllowed) {
    throw AppError.unsupportedPlatform('Esta plataforma ainda não é compatível com o COLA O LINK.');
  }

  // Anti-SSRF: Resolução de DNS para evitar DNS rebinding para IP privado
  try {
    const lookup = await dns.lookup(hostname, { all: true });
    for (const record of lookup) {
      if (isPrivateIp(record.address)) {
        throw AppError.ssrfAttempt('O endereço do domínio resolve para uma rede privada interna.');
      }
    }
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    // Se a resolução DNS falhar, o host não existe
    throw AppError.invalidUrl('Não foi possível resolver o domínio informado.');
  }

  return {
    url: parsed.href,
    hostname,
    normalizedUrl: parsed.origin + parsed.pathname + parsed.search,
  };
}
