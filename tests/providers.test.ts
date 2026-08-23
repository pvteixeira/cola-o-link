import { describe, it, expect } from 'vitest';
import { providerRegistry } from '../providers/registry';
import { AppError } from '../lib/errors/app-error';

describe('Provider Registry e Identificação Modular', () => {
  it('deve identificar o provedor YouTube para URLs do YouTube e YouTu.be', () => {
    const p1 = providerRegistry.findProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(p1.id).toBe('youtube');

    const p2 = providerRegistry.findProvider('https://youtu.be/dQw4w9WgXcQ');
    expect(p2.id).toBe('youtube');
  });

  it('deve identificar o provedor Vimeo para URLs do Vimeo', () => {
    const p = providerRegistry.findProvider('https://vimeo.com/76979871');
    expect(p.id).toBe('vimeo');
  });

  it('deve identificar o provedor TikTok para URLs do TikTok', () => {
    const p = providerRegistry.findProvider('https://www.tiktok.com/@tiktok/video/123456');
    expect(p.id).toBe('tiktok');
  });

  it('deve identificar o provedor Reddit para URLs do Reddit e v.redd.it', () => {
    const p1 = providerRegistry.findProvider('https://www.reddit.com/r/videos/comments/xyz');
    expect(p1.id).toBe('reddit');

    const p2 = providerRegistry.findProvider('https://v.redd.it/xyz123');
    expect(p2.id).toBe('reddit');
  });

  it('deve identificar o provedor Instagram para URLs do Instagram', () => {
    const p = providerRegistry.findProvider('https://www.instagram.com/reel/C7abcxyz/');
    expect(p.id).toBe('instagram');
  });

  it('deve identificar o provedor X / Twitter para URLs do X e Twitter', () => {
    const p1 = providerRegistry.findProvider('https://x.com/user/status/12345');
    expect(p1.id).toBe('x');

    const p2 = providerRegistry.findProvider('https://twitter.com/user/status/12345');
    expect(p2.id).toBe('x');
  });

  it('deve lançar AppError quando o domínio não tiver provedor', () => {
    expect(() => providerRegistry.findProvider('https://desconhecido.com/video')).toThrow(AppError);
  });
});
