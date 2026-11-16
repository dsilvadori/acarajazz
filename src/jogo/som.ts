/**
 * Sons do Acarabet, sintetizados na hora com Web Audio (zero arquivo pra baixar).
 * Começa mudo até o primeiro toque (exigência do iOS/Chrome) e tem botão pra desligar.
 */
import { gravar, ler } from './estado';

type Tipo = 'clique' | 'acerto' | 'erro' | 'estrela' | 'vitoria' | 'agua' | 'pop' | 'corte' | 'motor';

let ctx: AudioContext | null = null;
let ligado = ler('som', true);
let chiado: { fonte: AudioBufferSourceNode; ganho: GainNode } | null = null;

export const somLigado = () => ligado;

export function alternarSom() {
  ligado = !ligado;
  gravar('som', ligado);
  if (!ligado) fritando(false);
  return ligado;
}

/** Chamar no primeiro toque do jogador. */
export function destravarAudio() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx && AC) ctx = new AC();
    if (ctx?.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function nota(freq: number, inicio: number, dur: number, forma: OscillatorType = 'square', vol = 0.06, freqFim?: number) {
  if (!ctx) return;
  const t = ctx.currentTime + inicio;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = forma;
  o.frequency.setValueAtTime(freq, t);
  if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function ruido(dur: number, vol: number, filtro = 1200) {
  if (!ctx) return null;
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const f = ctx.createBufferSource();
  f.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = filtro;
  const g = ctx.createGain();
  g.gain.value = vol;
  f.connect(bp).connect(g).connect(ctx.destination);
  return { fonte: f, ganho: g };
}

export function tocar(tipo: Tipo) {
  if (!ligado || !ctx) return;
  switch (tipo) {
    case 'clique': nota(660, 0, 0.05, 'square', 0.04); break;
    case 'pop': nota(520, 0, 0.07, 'triangle', 0.08, 900); break;
    case 'corte': nota(180, 0, 0.06, 'square', 0.05, 90); break;
    case 'motor': nota(78, 0, 0.14, 'sawtooth', 0.03, 92); break;
    case 'acerto': nota(880, 0, 0.08, 'triangle', 0.08); nota(1320, 0.07, 0.12, 'triangle', 0.08); break;
    case 'erro': nota(220, 0, 0.18, 'sawtooth', 0.05, 140); break;
    case 'estrela': [784, 988, 1175].forEach((f, i) => nota(f, i * 0.09, 0.14, 'triangle', 0.07)); break;
    case 'vitoria': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => nota(f, i * 0.11, 0.18, 'square', 0.05)); break;
    case 'agua': {
      const r = ruido(0.25, 0.08, 900);
      if (r) { r.ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25); r.fonte.start(); }
      break;
    }
  }
}

/** Chiado contínuo do dendê enquanto tem bolinho fritando. */
export function fritando(ligar: boolean) {
  if (!ctx) return;
  if (ligar && ligado && !chiado) {
    chiado = ruido(2, 0.025, 3000);
    if (chiado) {
      chiado.fonte.loop = true;
      chiado.fonte.start();
    }
  } else if (!ligar && chiado) {
    try { chiado.fonte.stop(); } catch { /* já parou */ }
    chiado = null;
  }
}
