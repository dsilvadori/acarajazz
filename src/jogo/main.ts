/**
 * Acarabet: liga o Phaser dentro do elemento da página.
 * Mundo de 180×320 ampliado sem borrar: o fator é inteiro em pixels do aparelho (cada pixel do jogo = N pixels da tela).
 */
import Phaser from 'phaser';
import { Carregando } from './cenas/Carregando';
import { Titulo } from './cenas/Titulo';
import { Pedido } from './cenas/Pedido';
import { Lavar, Moer, Vatapa, Caruru, Vinagrete } from './cenas/etapas1';
import { Camarao, Bater, Fritar, Montar } from './cenas/etapas2';
import { Servir } from './cenas/Servir';
import { Premio, Cupom } from './cenas/Premio';
import { config, type Config } from './estado';
import { definirRaiz } from './cupom';
import { fritando } from './som';

export function iniciarJogo(raiz: HTMLElement, cfg: Partial<Config> = {}) {
  Object.assign(config, cfg);
  definirRaiz(raiz);
  const tela = raiz.querySelector<HTMLElement>('.aj-tela') ?? raiz;

  const zoom = () => {
    const r = tela.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const fator = Math.floor(Math.min(r.width / 180, r.height / 320) * dpr);
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
    scale: { mode: Phaser.Scale.NONE, zoom: zoom() },
    scene: [Carregando, Titulo, Pedido, Lavar, Moer, Vatapa, Caruru, Vinagrete, Camarao, Bater, Fritar, Montar, Servir, Premio, Cupom],
  });

  const ajusta = () => game.scale.setZoom(zoom());
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
    game.destroy(true);
  };
}
