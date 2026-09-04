import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { safeExec } from '@/lib/process/safe-exec';
import { APP_CONFIG } from '@/config/app.config';
import { SuggestedClip } from '@/types/video';

export interface SubtitleCue {
  id: number;
  start: number; // em segundos
  end: number;   // em segundos
  text: string;
}

/**
 * Converte timestamp SRT (00:01:23,456) para segundos (83.456)
 */
export function srtTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Converte segundos (83.456) para formato SRT (00:01:23,456)
 */
export function secondsToSrtTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const millis = Math.floor((s - Math.floor(s)) * 1000);

  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
}

/**
 * Faz o parse de uma string SRT ou WebVTT para uma lista de SubtitleCue.
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  // Limpa cabeçalho WebVTT caso esteja presente
  let normalized = srtContent
    .replace(/^WEBVTT[^\n]*\n+/i, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Converte formatações de tempo WebVTT (00:01.234 ou 00:01:23.456) para formato comum
  const blocks = normalized.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 2) {
      let timeLineIdx = 0;
      if (/^\d+$/.test(lines[0].trim()) || lines[0].includes('-->')) {
        timeLineIdx = lines[0].includes('-->') ? 0 : 1;
      }

      const timeLine = lines[timeLineIdx];
      if (timeLine && timeLine.includes('-->')) {
        const [startRaw, endRaw] = timeLine.split('-->');
        // Suporta tempos com ponto ou vírgula
        const cleanStart = startRaw.trim().replace(',', '.');
        const cleanEnd = (endRaw.split(' ')[0] || endRaw).trim().replace(',', '.');

        const parseTime = (t: string) => {
          const parts = t.split(':');
          if (parts.length === 3) {
            return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
          } else if (parts.length === 2) {
            return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
          }
          return 0;
        };

        const start = parseTime(cleanStart);
        const end = parseTime(cleanEnd);

        const textLines = lines.slice(timeLineIdx + 1);
        const text = textLines
          .map((l) =>
            l
              .replace(/<[^>]*>/g, '') // remove tags HTML como <font>, <i>, <c.color>
              .replace(/\{[^}]*\}/g, '') // remove tags ASS/SSA inline
              .trim()
          )
          .filter(Boolean)
          .join(' ');

        if (text && end > start) {
          cues.push({
            id: cues.length + 1,
            start,
            end,
            text,
          });
        }
      }
    }
  }

  return cues;
}

/**
 * Converte uma lista de SubtitleCue de volta para formato SRT.
 */
export function stringifySrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue, idx) => {
      const startStr = secondsToSrtTime(cue.start);
      const endStr = secondsToSrtTime(cue.end);
      return `${idx + 1}\n${startStr} --> ${endStr}\n${cue.text}\n`;
    })
    .join('\n');
}

/**
 * Converte lista de cues para formato ASS (Advanced SubStation Alpha) com estilo moderno TikTok.
 */
export function stringifyAss(cues: SubtitleCue[]): string {
  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  const formatAssTime = (sec: number) => {
    const s = Math.max(0, sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sc = Math.floor(s % 60);
    const cs = Math.floor((s - Math.floor(s)) * 100);
    return `${h}:${pad(m)}:${pad(sc)}.${pad(cs)}`;
  };

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTok,DejaVu Sans,54,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,5,3,2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = cues.map((cue) => {
    const startStr = formatAssTime(cue.start);
    const endStr = formatAssTime(cue.end);
    // Limpa pontuações repetidas e aplica destaque
    const safeText = cue.text.replace(/\\N/g, ' ').trim();
    return `Dialogue: 0,${startStr},${endStr},TikTok,,0,0,0,,{\\b1}${safeText}{\\b0}`;
  });

  return header + events.join('\n') + '\n';
}

/**
 * Tenta baixar a legenda/transcrição automática de um vídeo via yt-dlp.
 * Utiliza fallbacks resilientes para evitar bloqueios 429 de legendas traduzidas.
 */
export async function downloadSubtitles(url: string, ytDlpBin: string, baseTempDir: string): Promise<string | null> {
  const prefix = `subs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const outTemplate = path.join(baseTempDir, `${prefix}.%(ext)s`);
  const cacheDir = path.join(baseTempDir, '.cache');

  try {
    // Busca prioritariamente a faixa nativa/automática com clients resilientes
    await safeExec(
      ytDlpBin,
      [
        '--skip-download',
        '--write-auto-subs',
        '--write-subs',
        '--sub-lang', 'pt-orig,pt-BR,pt,en-orig,en',
        '--sub-format', 'vtt/srt/best',
        '--ignore-errors',
        '--no-playlist',
        '--no-warnings',
        '--extractor-args', 'youtube:player_client=android,web',
        '--cache-dir', cacheDir,
        '-o', outTemplate,
        url,
      ],
      { timeoutMs: 35000 }
    );

    const files = await fs.readdir(baseTempDir);
    const subFiles = files.filter(
      (f) => f.startsWith(prefix) && (f.endsWith('.vtt') || f.endsWith('.srt') || f.endsWith('.ass'))
    );

    // Prioriza arquivos em português e com conteúdo
    if (subFiles.length > 0) {
      const preferredFile =
        subFiles.find((f) => f.includes('pt') || f.includes('orig')) || subFiles[0];
      const fullPath = path.join(baseTempDir, preferredFile);
      const content = await fs.readFile(fullPath, 'utf-8');

      // Limpa todos os arquivos temporários de legenda gerados
      for (const f of subFiles) {
        await fs.unlink(path.join(baseTempDir, f)).catch(() => {});
      }

      if (content && content.trim().length > 10) {
        return content;
      }
    }
  } catch (err) {
    console.warn('[subtitles] Falha na extração de legendas:', err);
  }

  return null;
}

/**
 * Palavras e expressões com alto valor de retenção, ganchos emocionais e revelações.
 */
const HIGH_IMPACT_KEYWORDS = [
  'olha isso', 'veja bem', 'inacreditavel', 'segredo', 'na verdade', 'como assim',
  'voce sabia', 'o melhor', 'o pior', 'revelou', 'descobri', 'cuidado', 'dinheiro',
  'ganhar', 'erro', 'problema', 'absurdo', 'nunca', 'sempre', 'incrivel', 'resultado',
  'transformou', 'passo a passo', 'presta atencao', 'dica', 'exatamente', 'resenha',
  'galera', 'bom dia', 'pessoal', 'importante', 'olha so', 'verdade', 'aconteceu'
];

/**
 * Analisa as falas para identificar cortes dinâmicos de 30s a 60s (tempo ideal pedido pelo usuário).
 * Avalia densidade de fala, palavras de impacto e pausas naturais para fechar o clipe com sentido completo.
 */
export function analyzeSuggestedClips(cues: SubtitleCue[], videoDuration: number): SuggestedClip[] {
  const clips: SuggestedClip[] = [];

  // Fallback quando não há transcrição: divide o vídeo em cortes dinâmicos de 30s a 60s
  if (cues.length === 0) {
    const totalSecs = Math.max(40, Math.floor(videoDuration));
    const targetDur = totalSecs > 180 ? 45 : Math.max(30, Math.floor(totalSecs / 4));
    const step = Math.max(35, Math.floor((totalSecs - targetDur) / 5)) || 35;
    let idCounter = 1;

    const templates = [
      { tag: '🔥 Gancho de Abertura', title: 'Introdução & Revelação Principal', dur: Math.min(40, totalSecs) },
      { tag: '⚡ Ponto Alto / Viral', title: 'Momento Mais Marcante do Vídeo', dur: Math.min(45, totalSecs) },
      { tag: '💡 Destaque Chave', title: 'Explicação & Conceito Central', dur: Math.min(35, totalSecs) },
      { tag: '🎯 Conclusão de Impacto', title: 'Fechamento & Chamada Final', dur: Math.min(40, totalSecs) },
      { tag: '💥 Frase Marcante', title: 'Trecho Surpreendente', dur: Math.min(35, totalSecs) },
    ];

    for (let t = 0; t < totalSecs - 25 && clips.length < 5; t += step) {
      const tmpl = templates[clips.length % templates.length];
      const dur = Math.min(tmpl.dur, totalSecs - t);
      if (dur >= 25) {
        clips.push({
          id: `clip_${idCounter++}`,
          title: tmpl.title,
          tag: tmpl.tag,
          start: t,
          end: t + dur,
          duration: dur,
          score: 85 - clips.length * 2,
          snippet: `Corte de ${dur}s posicionado a partir de ${secondsToSrtTime(t)}. Ideal para Reels e Shorts com bom desenvolvimento.`,
        });
      }
    }

    return clips;
  }

  // ALGORITMO COM TRANSCRIÇÃO / LEGENDAS:
  // Janelas de 30s a 60s (com ponto ideal entre 35s e 50s)
  let i = 0;
  while (i < cues.length && clips.length < 6) {
    const startCue = cues[i];
    const clipStart = Math.max(0, startCue.start - 0.2);

    let collectedText: string[] = [];
    let bestEnd = startCue.end;
    let wordCount = 0;
    let impactBonus = 0;
    let lastCueIdx = i;

    // Busca janela de 30s a 60s
    for (let j = i; j < cues.length; j++) {
      const cue = cues[j];
      const potentialDuration = cue.end - clipStart;

      // Limite máximo de 60 segundos por corte
      if (potentialDuration > 60) {
        break;
      }

      collectedText.push(cue.text);
      const words = cue.text.toLowerCase().split(/\s+/);
      wordCount += words.length;

      // Pontua gatilhos de impacto
      for (const kw of HIGH_IMPACT_KEYWORDS) {
        if (cue.text.toLowerCase().includes(kw)) {
          impactBonus += 8;
        }
      }
      if (cue.text.includes('?') || cue.text.includes('!')) {
        impactBonus += 6;
      }

      lastCueIdx = j;
      bestEnd = cue.end;

      // Se já atingiu 35s a 50s e encontrou pausa de fala (respiro > 0.8s), este é o ponto ideal de corte!
      const nextCue = cues[j + 1];
      const hasNaturalPause = nextCue ? (nextCue.start - cue.end >= 0.8) : true;
      if (potentialDuration >= 35 && hasNaturalPause) {
        break;
      }
    }

    const duration = Math.round(bestEnd - clipStart);

    // Aceita cortes entre 30s e 65s
    if (duration >= 28 && duration <= 65) {
      const fullText = collectedText.join(' ').replace(/\s+/g, ' ').trim();
      const words = fullText.split(' ');
      const previewTitle = words.slice(0, 8).join(' ');
      const cleanTitle = previewTitle.length > 5 ? `"${previewTitle}..."` : `Corte ${clips.length + 1}`;

      const wps = wordCount / Math.max(1, duration);
      const score = Math.min(99, Math.round(wps * 20 + impactBonus));

      let tag = '⚡ Destaque 45s';
      if (duration <= 35) tag = '🎯 Direto ao Ponto (35s)';
      else if (score >= 80) tag = '🔥 Momento Viral & Engajamento';
      else if (impactBonus > 15) tag = '💡 Trecho Revelador';
      else if (duration >= 50) tag = '🚀 Explicação Completa (55s)';

      clips.push({
        id: `clip_${clips.length + 1}`,
        title: cleanTitle,
        tag,
        start: Math.round(clipStart),
        end: Math.round(bestEnd),
        duration,
        score,
        snippet: fullText.slice(0, 150) + (fullText.length > 150 ? '...' : ''),
      });

      // Pula para a frente para evitar cortes redundantes
      i = Math.max(i + 1, lastCueIdx + 1);
    } else {
      i++;
    }
  }

  // Se gerou poucos cortes devido às pausas estritas, complementa com trechos de 40s
  if (clips.length < 3 && cues.length > 0) {
    const totalTime = cues[cues.length - 1].end;
    const interval = Math.max(35, Math.floor(totalTime / 4));

    for (let t = 0; t < totalTime - 30 && clips.length < 5; t += interval) {
      const dur = Math.min(45, Math.round(totalTime - t));
      if (dur >= 30 && !clips.some((c) => Math.abs(c.start - t) < 15)) {
        clips.push({
          id: `clip_${clips.length + 1}`,
          title: `Trecho Selecionado ${clips.length + 1}`,
          tag: '⚡ Destaque Rápido',
          start: Math.round(t),
          end: Math.round(t + dur),
          duration: dur,
          score: 75,
          snippet: `Corte de ${dur}s selecionado entre ${secondsToSrtTime(t)} e ${secondsToSrtTime(t + dur)}.`,
        });
      }
    }
  }

  return clips.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Recorta as legendas para um trecho específico e ajusta o tempo para começar em 00:00:00.
 */
export function sliceAndOffsetSubtitles(srtContent: string, clipStart: number, clipEnd: number): string {
  const cues = parseSrt(srtContent);
  const sliced: SubtitleCue[] = [];

  for (const cue of cues) {
    // Ignora se estiver completamente fora do corte
    if (cue.end <= clipStart || cue.start >= clipEnd) {
      continue;
    }

    const newStart = Math.max(0, cue.start - clipStart);
    const newEnd = Math.min(clipEnd - clipStart, cue.end - clipStart);

    if (newEnd > newStart) {
      sliced.push({
        id: sliced.length + 1,
        start: newStart,
        end: newEnd,
        text: cue.text,
      });
    }
  }

  return stringifySrt(sliced);
}

