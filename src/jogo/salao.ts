/** Monta o salão do Acarajazz (camadas e personagens) e leva a Bia pelas rotas de salao.json. */
import Phaser from 'phaser';
import salao from '../data/acarabet/salao.json';
import { estado, medir } from './estado';
import { animBia } from './ui';

type Ponto = { x: number; y: number; camada: string };
const pos = salao.posicoes;
const pontos = pos.pontos as Record<string, Ponto>;

const profundidade = (y: number, h = 48) => 10 + y + h;

export interface Salao {
  bia: Phaser.GameObjects.Sprite;
  casal: Phaser.GameObjects.Sprite;
  andar: (rota: string[], bandeja: boolean) => Promise<void>;
  /** Todo mundo comemora junto: tchauzinho de Eliana, gêmeas e Valentina, brinde dos tios. */
  festa: (ms?: number) => void;
}

export function montaSalao(cena: Phaser.Scene, { easterEggs = true } = {}): Salao {
  cena.add.image(0, 0, 'salao_fundo').setOrigin(0, 0).setDepth(0);
  cena.add.image(0, 0, 'salao_balcao').setOrigin(0, 0).setDepth(2);
  cena.add.sprite(0, 0, 'fitas').setOrigin(0, 0).setDepth(1000).play('fitas');

  const b0 = pontos.bancada;
  const bia = cena.add.sprite(b0.x, b0.y, 'atlas').setOrigin(0, 0).setDepth(1);
  animBia(bia, estado.roupa, 'parada');

  const reacoes: { s: Phaser.GameObjects.Sprite; parada: string; reage: string }[] = [];
  const npc = (x: number, y: number, parada: string, reage: string | null, h = 48) => {
    const s = cena.add.sprite(x, y, 'atlas').setOrigin(0, 0).setDepth(profundidade(y, h)).play(parada);
    if (reage && reage !== parada) reacoes.push({ s, parada, reage });
    if (easterEggs && reage) {
      s.setInteractive({ useHandCursor: true, pixelPerfect: false });
      s.on('pointerup', () => {
        s.play(reage);
        s.once('animationrepeat', () => s.once('animationrepeat', () => s.play(parada)));
        medir('easter_egg', { quem: parada.replace(/_parada|_sentado|_dormindo/, '') });
        coracao(cena, s.x + s.width / 2, s.y + 4);
      });
    }
    return s;
  };
  npc(pos.eliana.x, pos.eliana.y, 'npc_eliana_parada', 'npc_eliana_acenando');
  npc(pos.tios_mesa.x, pos.tios_mesa.y, 'npc_tios_mesa_parada', 'npc_tios_mesa_brindando');
  npc(pos.gemea_mae.x, pos.gemea_mae.y, 'npc_gemea_mae_parada', 'npc_gemea_mae_acenando');
  npc(pos.gemea_tia.x, pos.gemea_tia.y, 'npc_gemea_tia_parada', 'npc_gemea_tia_acenando');
  npc(pos.valentina.x, pos.valentina.y, 'npc_valentina_parada', 'npc_valentina_acenando');
  // sorteia o cantinho do Pôr do Sol (em desenvolvimento dá pra forçar: ?gato=dormindo ou ?gato=sentado)
  const forcar = import.meta.env.DEV ? new URLSearchParams(location.search).get('gato') : null;
  const g = pos.por_do_sol.find((p) => forcar && p.sprite === `gato_${forcar}`) ?? Phaser.Utils.Array.GetRandom(pos.por_do_sol);
  npc(g.x, g.y, g.sprite, g.sprite === 'gato_sentado' ? 'gato_sentado' : null, 17);
  const casal = cena.add.sprite(pos.casal.x, pos.casal.y, 'atlas').setOrigin(0, 0)
    .setDepth(profundidade(pos.casal.y)).play('cliente_casal_esperando');

  const andar = async (rota: string[], bandeja: boolean) => {
    for (let i = 1; i < rota.length; i++) {
      const de = pontos[rota[i - 1]];
      const para = pontos[rota[i]];
      const dx = para.x - de.x;
      const dy = para.y - de.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        animBia(bia, estado.roupa, bandeja ? 'servindo_lado' : 'andando_lado');
        bia.setFlipX(dx < 0);
      } else {
        animBia(bia, estado.roupa, dy > 0 ? (bandeja ? 'servindo' : 'andando') : 'andando_costas');
        bia.setFlipX(false);
      }
      const dur = (Math.hypot(dx, dy) / 40) * 1000;
      await new Promise<void>((fim) => {
        cena.tweens.add({
          targets: bia, x: para.x, y: para.y, duration: dur,
          onUpdate: (tw) => bia.setDepth(tw.progress < 0.5 && de.camada === 'atras_do_balcao' ? 1
            : para.camada === 'atras_do_balcao' && tw.progress >= 0.5 ? 1 : profundidade(Math.round(bia.y))),
          onComplete: () => fim(),
        });
      });
    }
    bia.setFlipX(false);
    animBia(bia, estado.roupa, 'parada');
  };

  const festa = (ms = 4000) => {
    reacoes.forEach(({ s, reage }, i) => cena.time.delayedCall(i * 120, () => s.play(reage)));
    cena.time.delayedCall(ms, () => reacoes.forEach(({ s, parada }) => s.play(parada)));
  };

  return { bia, casal, andar, festa };
}

export function coracao(cena: Phaser.Scene, x: number, y: number) {
  const g = cena.add.graphics().setDepth(1500);
  g.fillStyle(0xff4d6d);
  [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(([a, b]) => g.fillRect(a, b, 1, 1));
  g.setPosition(Math.round(x - 1), Math.round(y));
  cena.tweens.add({ targets: g, y: y - 14, alpha: 0, duration: 900, onComplete: () => g.destroy() });
}
