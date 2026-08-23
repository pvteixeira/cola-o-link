import { describe, it, expect } from 'vitest';
import { validateAndSecureUrl, isPrivateIp } from '../lib/security/url-validator';
import { sanitizeFilename, assertSafeFilePath, formatDuration, formatBytes } from '../lib/security/sanitize';
import { generateDownloadToken, verifyDownloadToken } from '../lib/security/token';
import { AppError } from '../lib/errors/app-error';

describe('Camada de Segurança e Prevenção de SSRF', () => {
  it('deve identificar faixas de IP privadas e reservadas corretamente', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('169.254.169.254')).toBe(true);
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('1.1.1.1')).toBe(false);
  });

  it('deve rejeitar URLs com domínios locais ou tentativas de SSRF', async () => {
    await expect(validateAndSecureUrl('http://localhost:8080/admin')).rejects.toThrow(AppError);
    await expect(validateAndSecureUrl('http://127.0.0.1/secret')).rejects.toThrow(AppError);
    await expect(validateAndSecureUrl('http://169.254.169.254/latest/meta-data')).rejects.toThrow(AppError);
  });

  it('deve rejeitar plataformas não presentes na allowlist', async () => {
    await expect(validateAndSecureUrl('https://evil-site.com/exploit.mp4')).rejects.toThrow(
      'Esta plataforma ainda não é compatível com o VideoFetch.'
    );
  });

  it('deve aceitar e normalizar URLs válidas de plataformas permitidas', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const result = await validateAndSecureUrl(validUrl);
    expect(result.hostname).toBe('www.youtube.com');
    expect(result.url).toContain('https://www.youtube.com');
  });

  it('deve sanitizar nomes de arquivos removendo caracteres proibidos', () => {
    const dirtyTitle = 'Vídeo Legal <script>alert(1)</script> / \\ : * ? " |';
    const clean = sanitizeFilename(dirtyTitle, 'mp4');
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
    expect(clean).not.toContain('/');
    expect(clean).not.toContain('\\');
    expect(clean.endsWith('.mp4')).toBe(true);
  });

  it('deve gerar e validar tokens de download assinados com HMAC-SHA256', () => {
    const jobId = 'test-job-uuid-secure';
    const { token } = generateDownloadToken(jobId);

    expect(verifyDownloadToken(jobId, token)).toBe(true);
    expect(verifyDownloadToken('outro-job-id', token)).toBe(false);
    expect(verifyDownloadToken(jobId, 'token-falso.invalido')).toBe(false);
  });
});
