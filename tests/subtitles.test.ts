import { describe, it, expect } from 'vitest';
import {
  srtTimeToSeconds,
  secondsToSrtTime,
  parseSrt,
  stringifySrt,
  sliceAndOffsetSubtitles,
  analyzeSuggestedClips,
} from '../lib/media/subtitles';

describe('Manipulação e Análise de Legendas / Cortes', () => {
  it('deve converter corretamente timestamps SRT e segundos', () => {
    expect(srtTimeToSeconds('00:01:23,456')).toBeCloseTo(83.456, 2);
    expect(secondsToSrtTime(83.456)).toBe('00:01:23,456');
  });

  it('deve fazer o parse de arquivo SRT corretamente', () => {
    const sampleSrt = `1
00:00:10,000 --> 00:00:15,000
Olá pessoal, bem-vindos ao canal!

2
00:00:16,000 --> 00:00:20,000
Hoje vamos falar sobre cortes de vídeos.
`;

    const cues = parseSrt(sampleSrt);
    expect(cues).toHaveLength(2);
    expect(cues[0].start).toBe(10);
    expect(cues[0].end).toBe(15);
    expect(cues[0].text).toBe('Olá pessoal, bem-vindos ao canal!');
    expect(cues[1].start).toBe(16);
  });

  it('deve recortar e reajustar timestamps (offset para 0) para um trecho específico', () => {
    const sampleSrt = `1
00:00:10,000 --> 00:00:20,000
Fala inicial fora do corte.

2
00:00:30,000 --> 00:00:40,000
Trecho que deve entrar no corte.

3
00:00:45,000 --> 00:00:55,000
Segunda fala que deve entrar no corte.

4
00:01:20,000 --> 00:01:30,000
Fala posterior fora do corte.
`;

    // Corte de 25s até 60s (duração: 35s)
    const sliced = sliceAndOffsetSubtitles(sampleSrt, 25, 60);
    const parsed = parseSrt(sliced);

    expect(parsed).toHaveLength(2);
    // 30s - 25s = 5s
    expect(parsed[0].start).toBe(5);
    // 40s - 25s = 15s
    expect(parsed[0].end).toBe(15);
    expect(parsed[0].text).toContain('Trecho que deve entrar');

    // 45s - 25s = 20s
    expect(parsed[1].start).toBe(20);
    // 55s - 25s = 30s
    expect(parsed[1].end).toBe(30);
  });

  it('deve sugerir cortes automaticamente com base nas legendas ou fallback de duração', () => {
    const cues = [
      { id: 1, start: 0, end: 15, text: 'Introdução do podcast sobre tecnologia' },
      { id: 2, start: 16, end: 40, text: 'Essa ferramenta mudou completamente a produtividade' },
      { id: 3, start: 41, end: 65, text: 'Vejam só os resultados obtidos' },
    ];

    const clips = analyzeSuggestedClips(cues, 120);
    expect(clips.length).toBeGreaterThan(0);
    expect(clips[0].start).toBeGreaterThanOrEqual(0);
    expect(clips[0].duration).toBeGreaterThanOrEqual(25);
    expect(clips[0].duration).toBeLessThanOrEqual(65);
    expect(clips[0].tag).toBeDefined();
  });

  it('deve gerar cortes de 30s a 50s mesmo no fallback sem legendas', () => {
    const clips = analyzeSuggestedClips([], 180);
    expect(clips.length).toBeGreaterThanOrEqual(3);
    for (const clip of clips) {
      expect(clip.duration).toBeGreaterThanOrEqual(25);
      expect(clip.duration).toBeLessThanOrEqual(55);
      expect(clip.tag).toBeDefined();
    }
  });
});

