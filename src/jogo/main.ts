/**
 * Acarabet: liga o Phaser dentro do elemento da página.
 * Mundo de 180×320 ampliado sem borrar: no celular o fator é inteiro em pixels do aparelho; no computador ocupa a altura toda (ver abaixo).
 */
import Phaser from 'phaser';
import { Carregando } from './cenas/Carregando';
import { Titulo } from './cenas/Titulo';
import { Pedido } from './cenas/Pedido';
import { Lavar, Triturar, Temperos, Vatapa, Caruru, Salada } from './cenas/etapas1';
import { Bater, Fritar, Montar } from './cenas/etapas2';
import { Servir } from './cenas/Servir';
import { Premio, Cupom } from './cenas/Premio';
import { CASAIS, config, estado, type Config } from './estado';
import { definirRaiz } from './cupom';
import { fritando } from './som';

export function iniciarJogo(raiz: HTMLElement, cfg: Partial<Config> = {}) {
  Object.assign(config, cfg);
  definirRaiz(raiz);
  const tela = raiz.querySelector<HTMLElement>('.aj-tela') ?? raiz;

  // Celular: fator inteiro (cada pixel do jogo = N pixels da tela, nítido).
  // Computador (mouse): ocupa a altura toda. O Phaser fica invisível no tamanho exato (pros cliques),
  // e uma cópia nítida em N× é reduzida suavemente por cima, pra não ficar com pixels de tamanhos diferentes.
  const computador = !matchMedia('(pointer: coarse)').matches;
  const ajuste = () => {
    const r = tela.getBoundingClientRect();
    return Math.min((r.width - 16) / 180, (r.height - 16) / 320);
  };
  const zoom = () => {
    const dpr = window.devicePixelRatio || 1;
    if (computador) return Math.max(1, ajuste());
    const fator = Math.floor(ajuste() * dpr);
    return Math.max(1, fator) / dpr;
  };

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: tela,
    width: 180,
    height: 320,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#3b1408',
    banner: false,
    audio: { noAudio: true }, // os sons são sintetizados em som.ts
    input: { activePointers: 1 },
    render: { preserveDrawingBuffer: computador },
    scale: { mode: Phaser.Scale.NONE, zoom: zoom() },
    scene: [Carregando, Titulo, Pedido, Lavar, Triturar, Bater, Temperos, Vatapa, Caruru, Salada, Fritar, Montar, Servir, Premio, Cupom],
  });

  let nitido: HTMLCanvasElement | null = null;
  let posiciona = () => {};
  if (computador) {
    nitido = document.createElement('canvas');
    nitido.className = 'aj-nitido';
    nitido.setAttribute('aria-hidden', 'true');
    tela.appendChild(nitido);
    const ctx = nitido.getContext('2d')!;
    game.canvas.style.opacity = '0';
    game.canvas.style.boxShadow = 'none';
    posiciona = () => {
      const c = game.canvas.getBoundingClientRect(), t = tela.getBoundingClientRect();
      const n = Math.max(1, Math.ceil((c.height / 320) * (window.devicePixelRatio || 1)));
      if (nitido!.width !== 180 * n) { nitido!.width = 180 * n; nitido!.height = 320 * n; }
      Object.assign(nitido!.style, { left: `${c.left - t.left}px`, top: `${c.top - t.top}px`, width: `${c.width}px`, height: `${c.height}px` });
    };
    game.events.on('postrender', () => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(game.canvas, 0, 0, nitido!.width, nitido!.height);
    });
    game.events.once('ready', posiciona);
  }

  const ajusta = () => {
    game.scale.setZoom(zoom());
    requestAnimationFrame(posiciona);
  };
  const ro = new ResizeObserver(ajusta);
  ro.observe(tela);
  const visibilidade = () => {
    if (document.hidden) {
      fritando(false);
      game.loop.sleep();
    } else {
      game.loop.wake();
    }
  };
  document.addEventListener('visibilitychange', visibilidade);

  // Atalho de teste (só em desenvolvimento): /acarabet?cena=Fritar
  const cena = new URLSearchParams(location.search).get('cena');
  if (import.meta.env.DEV && cena) {
    const q = new URLSearchParams(location.search);
    if (q.get('veg') === '1') estado.vegetariano = true;
    if (q.get('pimenta') === 'pouca') estado.pimenta = 'pouca';
    const casal = q.get('casal') as (typeof CASAIS)[number] | null;
    if (casal && CASAIS.includes(casal)) estado.casal = casal;
    game.events.once('ready', () => {
      const carregar = game.scene.getScene('Carregando');
      carregar.events.once('shutdown', () => {
        game.scene.stop('Titulo');
        game.scene.start(cena, { cupom: { codigo: 'ACJ-TESTE1', nome: 'Teste', status: 'emitido', validade: '2026-12-16' } });
      });
    });
  }

  return () => {
    ro.disconnect();
    document.removeEventListener('visibilitychange', visibilidade);
    fritando(false);
    nitido?.remove();
    game.destroy(true);
  };
}
