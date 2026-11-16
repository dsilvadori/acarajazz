/** Minijogos 1 a 5: lavar, moer, vatapá, caruru e vinagrete. */
import Phaser from 'phaser';
import { tocar } from '../som';
import { COR, flutua, texto } from '../ui';
import { CENTRO_X, Etapa } from './Etapa';

// ─── 1. Lavar (esfregar) ──────────────────────────────────────────────────────
interface Feijao { s: Phaser.GameObjects.Image; esfregado: number; limpo: boolean }

export class Lavar extends Etapa {
  constructor() {
    super('Lavar');
  }

  protected readonly id = 'lavar';
  protected tempoTotal = 20000;
  private feijoes: Feijao[] = [];
  private limpos = 0;
  private ultimo: { x: number; y: number } | null = null;
  private somAgua = 0;

  protected montar() {
    this.feijoes = [];
    this.limpos = 0;
    const cx = CENTRO_X, cy = 214;
    this.add.image(cx, cy, 'atlas', 'bacia_agua_0').setScale(2);
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2, r = 6 + Math.sqrt(Math.random()) * 38;
      const s = this.add.image(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 'atlas', 'feijao_casca_0').setScale(2);
      this.feijoes.push({ s, esfregado: 0, limpo: false });
    }
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.rodando || !p.isDown) { this.ultimo = null; return; }
      const d = this.ultimo ? Math.hypot(p.x - this.ultimo.x, p.y - this.ultimo.y) : 0;
      this.ultimo = { x: p.x, y: p.y };
      for (const f of this.feijoes) {
        if (f.limpo || Math.hypot(f.s.x - p.x, f.s.y - p.y) > 16) continue;
        f.esfregado += d;
        if (f.esfregado > 34) this.limpa(f);
      }
    });
    this.input.on('pointerup', () => (this.ultimo = null));
  }

  private limpa(f: Feijao) {
    f.limpo = true;
    f.s.setFrame('feijao_0');
    this.limpos++;
    const c = this.add.image(f.s.x, f.s.y, 'atlas', 'casca_0').setScale(2);
    this.tweens.add({ targets: c, y: c.y - 18, alpha: 0, duration: 700, onComplete: () => c.destroy() });
    if (this.time.now - this.somAgua > 180) { tocar('agua'); this.somAgua = this.time.now; }
    if (this.limpos === this.feijoes.length) this.terminar(this.segundos() <= 11 ? 3 : 2);
  }

  protected tempoEsgotado() {
    this.terminar(this.limpos / this.feijoes.length >= 0.8 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[62, 206], [118, 222], [62, 238], [118, 206]], 350);
  }
}

// ─── 2. Moer (girar a manivela no ritmo) ──────────────────────────────────────
export class Moer extends Etapa {
  constructor() {
    super('Moer');
  }

  protected readonly id = 'moer';
  protected tempoTotal = 30000;
  private giro!: (p: Phaser.Input.Pointer) => number;
  private angulo = 0;
  private progresso = 0;
  private vel = 0;
  private manivela!: Phaser.GameObjects.Image;
  private tigela!: Phaser.GameObjects.Image;
  private saindo!: Phaser.GameObjects.Sprite;
  private medidor!: Phaser.GameObjects.Graphics;
  private readonly META = Math.PI * 2 * 7; // 7 voltas
  private readonly EIXO = { x: CENTRO_X, y: 196 };

  protected montar() {
    this.angulo = this.progresso = this.vel = 0;
    this.add.image(CENTRO_X, 200, 'atlas', 'moedor_0').setScale(2);
    this.add.image(CENTRO_X - 10, 146, 'atlas', 'feijao_0').setScale(2);
    this.add.image(CENTRO_X + 10, 146, 'atlas', 'cebola_picada_0').setScale(1);
    this.manivela = this.add.image(this.EIXO.x, this.EIXO.y, 'atlas', 'manivela_0').setScale(2);
    this.saindo = this.add.sprite(CENTRO_X, 250, 'atlas', 'massa_saindo_0').setScale(2).setVisible(false);
    this.tigela = this.add.image(CENTRO_X, 284, 'atlas', 'tigela_0_0').setScale(2);
    this.medidor = this.add.graphics();
    texto(this, 167, 124, 'RITMO', { origem: [0.5, 0] }).setScale(0.5);
    this.giro = this.rastreadorGiro(this.EIXO.x, this.EIXO.y, 8);
  }

  protected passo(dt: number) {
    const d = this.giro(this.input.activePointer);
    this.vel = Phaser.Math.Linear(this.vel, d / (dt / 1000), 0.15);
    const noRitmo = this.vel > 3.5 && this.vel < 15;
    this.angulo += d;
    this.progresso += d * (noRitmo ? 1 : 0.3);
    this.manivela.setFrame(`manivela_${Math.floor(this.angulo / (Math.PI / 2)) % 4}`);
    const girando = d > 0.01;
    this.saindo.setVisible(girando);
    if (girando && !this.saindo.anims.isPlaying) this.saindo.play('massa_saindo');
    const p = this.progresso / this.META;
    this.tigela.setFrame(p > 0.66 ? 'tigela_2_0' : p > 0.25 ? 'tigela_1_0' : 'tigela_0_0');
    // medidor de ritmo: verde no meio
    const g = this.medidor.clear();
    g.fillStyle(COR.contorno).fillRect(162, 134, 10, 102);
    g.fillStyle(0xd8c9a8).fillRect(163, 135, 8, 100);
    g.fillStyle(COR.verdeLuz).fillRect(163, 160, 8, 40);
    const y = 235 - Math.min(1, this.vel / 22) * 100;
    g.fillStyle(noRitmo ? COR.verde : COR.dende).fillRect(161, Math.round(y) - 1, 12, 3);
    if (p >= 1) this.terminar(this.segundos() <= 14 ? 3 : this.segundos() <= 22 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 8; k++) pts.push([this.EIXO.x + Math.cos(k * Math.PI / 4) * 24, this.EIXO.y + Math.sin(k * Math.PI / 4) * 24]);
    this.maoEntre(mao, pts, 120);
  }
}

// ─── 3. Vatapá (ordem dos ingredientes + mexer sem grudar) ────────────────────
const ORDEM_VATAPA = ['pao', 'leite_coco', 'amendoim', 'castanha', 'camarao_seco', 'dende'];

export class Vatapa extends Etapa {
  constructor() {
    super('Vatapa');
  }

  protected readonly id = 'vatapa';
  protected tempoTotal = 40000;
  private indice = 0;
  private erros = 0;
  private queimou = 0;
  private mexido = 0;
  private grudando = 0;
  private fase: 'ingredientes' | 'mexer' = 'ingredientes';
  private panela!: Phaser.GameObjects.Image;
  private colher!: Phaser.GameObjects.Image;
  private medidor!: Phaser.GameObjects.Graphics;
  private giro!: (p: Phaser.Input.Pointer) => number;
  private marcas: Phaser.GameObjects.Image[] = [];
  private readonly C = { x: CENTRO_X, y: 222 };

  protected montar() {
    this.indice = this.erros = this.queimou = this.mexido = this.grudando = 0;
    this.fase = 'ingredientes';
    this.panela = this.add.image(this.C.x, this.C.y, 'atlas', 'panela_vazia_0').setScale(2);
    // receita (ordem) em cima da bancada
    texto(this, 6, 121, 'RECEITA:', { esquerda: true });
    this.marcas = ORDEM_VATAPA.map((n, i) => this.add.image(62 + i * 19, 126, 'atlas', `ing_${n}_0`));
    const lugares = Phaser.Utils.Array.Shuffle([[16, 160], [164, 160], [16, 296], [164, 296], [56, 306], [124, 306]]);
    ORDEM_VATAPA.forEach((n, i) => {
      const [x, y] = lugares[i];
      const s = this.add.image(x, y, 'atlas', `ing_${n}_0`).setScale(2).setInteractive({ useHandCursor: true });
      s.on('pointerup', () => this.toca(n, s));
    });
    this.colher = this.add.image(0, 0, 'atlas', 'colher_0').setScale(2).setVisible(false).setDepth(50);
    this.medidor = this.add.graphics().setDepth(60);
    this.giro = this.rastreadorGiro(this.C.x, this.C.y, 10);
  }

  private toca(nome: string, s: Phaser.GameObjects.Image) {
    if (!this.rodando || this.fase !== 'ingredientes') return;
    if (nome !== ORDEM_VATAPA[this.indice]) {
      this.erros++;
      tocar('erro');
      this.tremer(s);
      flutua(this, s.x, s.y - 20, 'NA ORDEM!');
      return;
    }
    s.disableInteractive();
    this.marcas[this.indice].setAlpha(0.35);
    this.indice++;
    tocar('pop');
    this.tweens.add({ targets: s, x: this.C.x, y: this.C.y, scale: 1, duration: 260, onComplete: () => s.destroy() });
    this.panela.setFrame('panela_ralo_0');
    if (this.indice === ORDEM_VATAPA.length) {
      this.fase = 'mexer';
      flutua(this, this.C.x, this.C.y - 40, 'AGORA MEXE!');
    }
  }

  protected passo(dt: number) {
    if (this.fase !== 'mexer') return;
    const p = this.input.activePointer;
    const d = this.giro(p);
    this.colher.setVisible(p.isDown).setPosition(p.x + 10, p.y - 10);
    this.mexido += d;
    this.grudando = Phaser.Math.Clamp(this.grudando + (d > 0.02 ? -dt * 0.05 : dt * 0.022), 0, 100);
    if (this.grudando >= 100) {
      this.queimou++;
      this.grudando = 0;
      tocar('erro');
      this.panela.setFrame('panela_queimado_0');
      flutua(this, this.C.x, this.C.y - 40, 'GRUDOU!');
      this.time.delayedCall(600, () => this.panela.setFrame('panela_ralo_0'));
    } else if (this.mexido > Math.PI * 2 * 2.5 && this.panela.frame.name === 'panela_ralo_0') {
      this.panela.setFrame('panela_ponto_0');
    }
    const g = this.medidor.clear();
    g.fillStyle(COR.contorno).fillRect(162, 150, 10, 82);
    g.fillStyle(0xd8c9a8).fillRect(163, 151, 8, 80);
    g.fillStyle(this.grudando > 70 ? COR.dende : COR.amarelo).fillRect(163, 231 - Math.round(this.grudando * 0.8), 8, Math.round(this.grudando * 0.8));
    if (this.mexido >= Math.PI * 2 * 5) {
      const falhas = this.erros + this.queimou * 2;
      this.terminar(falhas === 0 ? 3 : falhas <= 2 ? 2 : 1);
    }
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[this.C.x, 300], [this.C.x, 292]], 300, true);
  }
}

// ─── 4. Caruru (arrastar o quiabo pra tábua) ──────────────────────────────────
export class Caruru extends Etapa {
  constructor() {
    super('Caruru');
  }

  protected readonly id = 'caruru';
  protected tempoTotal = 30000;
  private feitos = 0;
  private cortando = false;
  private faca!: Phaser.GameObjects.Image;
  private readonly TABUA = { x: CENTRO_X, y: 168, w: 128, h: 64 };
  private readonly PANELA = { x: 128, y: 270 };

  protected montar() {
    this.feitos = 0;
    this.cortando = false;
    this.add.image(this.TABUA.x, this.TABUA.y, 'atlas', 'tabua_0').setScale(2);
    this.add.image(this.PANELA.x, this.PANELA.y, 'atlas', 'panela_vazia_0');
    this.faca = this.add.image(this.TABUA.x + 30, this.TABUA.y - 40, 'atlas', 'faca_0').setScale(2).setVisible(false).setDepth(40);
    const lugares = [[22, 236], [22, 266], [22, 296], [56, 266], [56, 296]];
    for (const [x, y] of lugares) {
      const q = this.add.image(x, y, 'atlas', 'quiabo_0').setScale(2).setInteractive({ draggable: true, useHandCursor: true }).setDepth(30);
      q.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => this.rodando && q.setPosition(dx, dy));
      q.on('dragend', () => this.solta(q, x, y));
    }
  }

  private solta(q: Phaser.GameObjects.Image, x0: number, y0: number) {
    const t = this.TABUA;
    const naTabua = Math.abs(q.x - t.x) < t.w / 2 && Math.abs(q.y - t.y) < t.h / 2 + 10;
    if (!naTabua || this.cortando || !this.rodando) {
      this.tweens.add({ targets: q, x: x0, y: y0, duration: 200 });
      return;
    }
    this.cortando = true;
    q.disableInteractive().setPosition(t.x, t.y);
    this.faca.setVisible(true).setPosition(t.x + 4, t.y - 40);
    this.tweens.add({
      targets: this.faca, y: t.y - 26, duration: 90, yoyo: true, repeat: 2,
      onRepeat: () => tocar('corte'),
      onComplete: () => {
        this.faca.setVisible(false);
        q.setFrame('quiabo_rodelas_0');
        this.tweens.add({
          targets: q, x: this.PANELA.x + Phaser.Math.Between(-10, 10), y: this.PANELA.y + Phaser.Math.Between(-8, 8), scale: 1, duration: 300,
          onComplete: () => {
            tocar('pop');
            this.cortando = false;
            this.feitos++;
            if (this.feitos === 5) this.terminar(this.segundos() <= 15 ? 3 : this.segundos() <= 23 ? 2 : 1);
          },
        });
      },
    });
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[22, 268], [this.TABUA.x, this.TABUA.y + 4]], 700);
  }
}

// ─── 5. Vinagrete (tocar no tempo, sem acertar o dedo) ────────────────────────
const ITENS_VINAGRETE = ['tomate', 'cebola', 'coentro'];

export class Vinagrete extends Etapa {
  constructor() {
    super('Vinagrete');
  }

  protected readonly id = 'vinagrete';
  protected tempoTotal = 35000;
  private faca!: Phaser.GameObjects.Image;
  private item!: Phaser.GameObjects.Image;
  private mao!: Phaser.GameObjects.Image;
  private tigela!: Phaser.GameObjects.Image;
  private vel = 60;
  private dir = 1;
  private cortes = 0;
  private itemAtual = 0;
  private dedo = 0;
  private errou = 0;
  private espera = 0;
  private readonly Y = 196;

  protected montar() {
    this.vel = 60; this.dir = 1; this.cortes = this.itemAtual = this.dedo = this.errou = 0;
    this.add.image(CENTRO_X, this.Y, 'atlas', 'tabua_0').setScale(2);
    this.tigela = this.add.image(CENTRO_X, 282, 'atlas', 'tigela_0_0').setScale(2);
    this.item = this.add.image(0, this.Y, 'atlas', 'tomate_0').setScale(2);
    this.mao = this.add.image(0, this.Y + 2, 'atlas', 'mao_0').setScale(2);
    this.faca = this.add.image(40, this.Y - 30, 'atlas', 'faca_0').setScale(2).setDepth(30);
    this.posiciona();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => p.y > 116 && this.corta());
  }

  private posiciona() {
    const xi = Phaser.Math.Between(46, 134);
    let xm = Phaser.Math.Between(40, 140);
    while (Math.abs(xm - xi) < 40) xm = Phaser.Math.Between(40, 140);
    this.item.setPosition(xi, this.Y).setFrame(`${ITENS_VINAGRETE[this.itemAtual]}_0`).setVisible(true);
    this.mao.setX(xm);
  }

  private corta() {
    if (!this.rodando || this.time.now < this.espera) return;
    this.espera = this.time.now + 280;
    this.tweens.add({ targets: this.faca, y: this.Y - 18, duration: 70, yoyo: true });
    tocar('corte');
    const x = this.faca.x;
    if (Math.abs(x - this.mao.x) <= 12) {
      this.dedo++;
      tocar('erro');
      flutua(this, this.mao.x, this.Y - 30, 'AI!');
      this.tremer(this.mao);
    } else if (Math.abs(x - this.item.x) <= 13) {
      this.cortes++;
      tocar('acerto');
      this.vel += 7;
      if (this.cortes % 3 === 0) {
        this.item.setFrame(`${ITENS_VINAGRETE[this.itemAtual]}_${this.itemAtual === 0 ? 'cubos' : this.itemAtual === 1 ? 'picada' : ''}_0`.replace('__', '_'));
        const pedaco = this.add.image(this.item.x, this.item.y, this.item.texture.key, this.item.frame.name).setScale(2);
        this.item.setVisible(false);
        this.tweens.add({ targets: pedaco, x: CENTRO_X, y: 282, scale: 1, duration: 320, onComplete: () => pedaco.destroy() });
        this.itemAtual++;
        if (this.itemAtual === ITENS_VINAGRETE.length) {
          this.tigela.setFrame('vinagrete_0');
          this.terminar(this.dedo === 0 && this.errou <= 2 ? 3 : this.dedo <= 1 && this.errou <= 5 ? 2 : 1);
        } else {
          this.time.delayedCall(330, () => this.posiciona());
        }
      }
    } else {
      this.errou++;
      flutua(this, x, this.Y - 30, 'ERROU');
    }
  }

  protected passo(dt: number) {
    this.faca.x += this.dir * this.vel * (dt / 1000);
    if (this.faca.x > 150) { this.faca.x = 150; this.dir = -1; }
    if (this.faca.x < 30) { this.faca.x = 30; this.dir = 1; }
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[CENTRO_X, 252], [CENTRO_X, 244]], 300, true);
  }
}
