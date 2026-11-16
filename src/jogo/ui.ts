/** Peças de interface em pixel: textos (fonte bitmap), painéis, botões e o botão de som. */
import Phaser from 'phaser';
import { alternarSom, somLigado, tocar } from './som';

export const L = 180; // largura do mundo
export const A = 320; // altura do mundo

export const COR = {
  contorno: 0x3b1408,
  creme: 0xfef5e2,
  massa: 0xecdcb0,
  dende: 0xd9601a,
  dendeLuz: 0xec9344,
  vinho: 0x7a0000,
  vinhoLuz: 0xa8320f,
  amarelo: 0xffc03f,
  verde: 0x3f7f3a,
  verdeLuz: 0x8cc152,
  sombra: 0x2a2238,
  branco: 0xffffff,
};

/** A fonte só tem maiúsculas e alguns símbolos: normaliza o texto. */
export function T(s: string) {
  return s
    .toUpperCase()
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/º/g, 'O')
    .replace(/ª/g, 'A');
}

interface OpTexto {
  fonte?: 'clara' | 'escura';
  tamanho?: 1 | 2 | 3;
  largura?: number;
  origem?: [number, number];
  esquerda?: boolean;
}

export function texto(cena: Phaser.Scene, x: number, y: number, s: string, op: OpTexto = {}) {
  const t = cena.add.bitmapText(x, y, op.fonte ?? 'clara', T(s), 11 * (op.tamanho ?? 1));
  if (op.largura) t.setMaxWidth(op.largura);
  if (!op.esquerda) t.setCenterAlign();
  t.setOrigin(...(op.origem ?? (op.esquerda ? [0, 0] : [0.5, 0])));
  return t;
}

/** Painel com contorno dendê, sombrinha embaixo à direita (luz de cima à esquerda). */
export function painel(cena: Phaser.Scene, x: number, y: number, w: number, h: number, cor = COR.creme) {
  const g = cena.add.graphics();
  g.fillStyle(COR.contorno, 0.35).fillRect(x + 2, y + 2, w, h);
  g.fillStyle(COR.contorno).fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(cor).fillRect(x, y, w, h);
  return g;
}

export function botao(
  cena: Phaser.Scene, x: number, y: number, w: number, h: number, rotulo: string, acao: () => void,
  cor: 'dende' | 'vinho' | 'verde' | 'creme' = 'dende',
) {
  const cores = {
    dende: [COR.dende, COR.dendeLuz, COR.vinhoLuz],
    vinho: [COR.vinho, COR.vinhoLuz, 0x4a0000],
    verde: [COR.verde, COR.verdeLuz, 0x2b5a28],
    creme: [COR.creme, COR.branco, COR.massa],
  }[cor];
  const c = cena.add.container(x, y);
  const g = cena.add.graphics();
  const desenha = (apertado: boolean) => {
    g.clear();
    const dy = apertado ? 1 : 0;
    g.fillStyle(COR.contorno).fillRect(-w / 2 - 1, -h / 2 - 1 + dy, w + 2, h + 2 - dy);
    g.fillStyle(cores[2]).fillRect(-w / 2, -h / 2 + dy, w, h - dy);
    g.fillStyle(cores[0]).fillRect(-w / 2, -h / 2 + dy, w, h - 2 - dy);
    if (!apertado) g.fillStyle(cores[1]).fillRect(-w / 2, -h / 2, w, 1);
  };
  desenha(false);
  const t = cena.add.bitmapText(0, 0, cor === 'creme' ? 'escura' : 'clara', T(rotulo), 11).setOrigin(0.5).setCenterAlign();
  t.y = Math.round(-1);
  c.add([g, t]);
  c.setSize(w + 6, h + 6);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => { desenha(true); t.y = 0; tocar('clique'); });
  c.on('pointerout', () => { desenha(false); t.y = -1; });
  c.on('pointerup', () => { desenha(false); t.y = -1; acao(); });
  return c;
}

/** Botão de som no canto (aparece em todas as telas). */
export function botaoSom(cena: Phaser.Scene, x = L - 10, y = 9) {
  const icone = cena.add.image(x, y, 'atlas', somLigado() ? 'som_on_0' : 'som_off_0').setDepth(2000);
  icone.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-6, -6, 28, 28), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
  icone.on('pointerup', () => {
    const on = alternarSom();
    icone.setFrame(on ? 'som_on_0' : 'som_off_0');
    tocar('clique');
  });
  return icone;
}

/** Faixa de cima com fundo escuro translúcido. */
export function faixa(cena: Phaser.Scene, y: number, h: number, alfa = 0.75) {
  return cena.add.rectangle(0, y, L, h, COR.contorno, alfa).setOrigin(0, 0);
}

export function animBia(sprite: Phaser.GameObjects.Sprite, roupa: string, anim: string) {
  const chave = `bia_${roupa}_${anim}`;
  if (sprite.anims.currentAnim?.key !== chave) sprite.play(chave);
}

/** Pequeno "pulo" de texto que sobe e some (ex.: "+1", "AI!"). */
export function flutua(cena: Phaser.Scene, x: number, y: number, s: string) {
  const t = texto(cena, x, y, s).setDepth(1500);
  cena.tweens.add({ targets: t, y: y - 16, alpha: 0, duration: 700, onComplete: () => t.destroy() });
}
