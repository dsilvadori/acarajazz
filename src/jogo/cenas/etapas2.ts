/** Minijogos 6 a 9: camarão, bater a massa, fritar e montar. */
import Phaser from 'phaser';
import { estado } from '../estado';
import { fritando, tocar } from '../som';
import { COR, animBia, flutua, texto } from '../ui';
import { CENTRO_X, Etapa } from './Etapa';

// ─── 6. Camarão (tocar na hora certa) ─────────────────────────────────────────
interface Camaraozinho { s: Phaser.GameObjects.Image; pronto: number; estado: 'cru' | 'pronto' | 'queimado' | 'fora'; fumaca?: Phaser.GameObjects.Sprite }

export class Camarao extends Etapa {
  constructor() {
    super('Camarao');
  }

  protected readonly id = 'camarao';
  protected tempoTotal = 25000;
  private lista: Camaraozinho[] = [];
  private bons = 0;
  private crus = 0;
  private t = 0;
  private readonly JANELA = 1900;

  protected montar() {
    this.lista = [];
    this.bons = this.crus = this.t = 0;
    this.add.image(84, 210, 'atlas', 'frigideira_0').setScale(2);
    this.add.image(152, 292, 'atlas', 'pote_camarao_0').setScale(2);
    const prontos = Phaser.Utils.Array.Shuffle([2200, 3200, 4200, 5200, 6200, 7200]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const s = this.add.image(76 + Math.cos(a) * 24, 210 + Math.sin(a) * 24, 'atlas', 'camarao_cru_0').setScale(2)
        .setInteractive({ useHandCursor: true });
      const c: Camaraozinho = { s, pronto: prontos[i], estado: 'cru' };
      s.on('pointerdown', () => this.toca(c));
      this.lista.push(c);
    }
  }

  private toca(c: Camaraozinho) {
    if (!this.rodando || c.estado === 'fora' || c.estado === 'queimado') return;
    if (c.estado === 'cru') {
      this.crus++;
      flutua(this, c.s.x, c.s.y - 16, 'CRU!');
      tocar('erro');
      return;
    }
    c.estado = 'fora';
    this.bons++;
    tocar('acerto');
    this.tweens.add({ targets: c.s, x: 152, y: 288, scale: 1, duration: 300, onComplete: () => c.s.setVisible(false) });
    this.confere();
  }

  private confere() {
    if (this.lista.every((c) => c.estado === 'fora')) {
      this.terminar(this.bons === 6 && this.crus <= 1 ? 3 : this.bons >= 4 ? 2 : 1);
    }
  }

  protected passo(dt: number) {
    this.t += dt;
    for (const c of this.lista) {
      if (c.estado === 'cru' && this.t >= c.pronto) {
        c.estado = 'pronto';
        c.s.setFrame('camarao_pronto_0');
        this.tweens.add({ targets: c.s, scale: 2.3, duration: 120, yoyo: true });
      } else if (c.estado === 'pronto' && this.t >= c.pronto + this.JANELA) {
        c.estado = 'queimado';
        c.s.setFrame('camarao_queimado_0');
        c.fumaca = this.add.sprite(c.s.x, c.s.y - 14, 'atlas').setScale(2).play('fumaca');
        tocar('erro');
        this.time.delayedCall(900, () => {
          c.estado = 'fora';
          c.fumaca?.destroy();
          this.tweens.add({ targets: c.s, alpha: 0, duration: 250 });
          this.confere();
        });
      }
    }
  }

  protected tempoEsgotado() {
    this.terminar(this.bons >= 4 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[100, 214], [100, 206]], 300, true);
  }
}

// ─── 7. Bater a massa (tocar rápido) ──────────────────────────────────────────
export class Bater extends Etapa {
  constructor() {
    super('Bater');
  }

  protected readonly id = 'bater';
  protected tempoTotal = 15000;
  protected animTrabalho = 'batendo';
  private fofura = 0;
  private bacia!: Phaser.GameObjects.Image;
  private colher!: Phaser.GameObjects.Image;
  private barra!: Phaser.GameObjects.Graphics;
  private toques: number[] = [];

  protected montar() {
    this.fofura = 0;
    this.toques = [];
    this.bacia = this.add.image(CENTRO_X, 214, 'atlas', 'bacia_massa_0_0').setScale(2);
    this.colher = this.add.image(CENTRO_X + 20, 196, 'atlas', 'colher_0').setScale(2);
    this.barra = this.add.graphics();
    texto(this, 167, 124, 'FOFA', { origem: [0.5, 0] }).setScale(0.5);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.rodando || p.y < 116) return;
      this.fofura = Math.min(100, this.fofura + 4.2);
      this.toques.push(this.time.now);
      tocar('pop');
      this.colher.setPosition(p.x + 12, p.y - 16);
      this.tweens.add({ targets: this.colher, y: p.y - 8, duration: 50, yoyo: true });
      const b = this.add.sprite(p.x, p.y, 'atlas').setScale(1).play('brilho');
      this.time.delayedCall(300, () => b.destroy());
    });
  }

  protected passo(dt: number) {
    this.fofura = Math.max(0, this.fofura - dt * 0.006);
    this.toques = this.toques.filter((t) => this.time.now - t < 1000);
    this.bia.anims.timeScale = 0.4 + Math.min(2, this.toques.length / 4);
    this.bacia.setFrame(this.fofura > 66 ? 'bacia_massa_2_0' : this.fofura > 33 ? 'bacia_massa_1_0' : 'bacia_massa_0_0');
    const g = this.barra.clear();
    g.fillStyle(COR.contorno).fillRect(162, 134, 10, 102);
    g.fillStyle(0xd8c9a8).fillRect(163, 135, 8, 100);
    g.fillStyle(COR.massa).fillRect(163, 235 - Math.round(this.fofura), 8, Math.round(this.fofura));
    if (this.fofura >= 100) {
      this.bia.anims.timeScale = 1;
      this.terminar(this.segundos() <= 7 ? 3 : this.segundos() <= 11 ? 2 : 1);
    }
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[CENTRO_X, 220], [CENTRO_X, 212]], 140, true);
  }
}

// ─── 8. Fritar (o coração do jogo) ────────────────────────────────────────────
type FaseBolinho = 'cru' | 'dourando' | 'ponto' | 'queimado';
interface Bolinho { s: Phaser.GameObjects.Image; lado: 1 | 2; t: number; fase: FaseBolinho; brilho?: Phaser.GameObjects.Sprite; saindo?: boolean }

const TEMPOS = { dourando: 2600, ponto: 4300, queimado: 6400 };

export class Fritar extends Etapa {
  constructor() {
    super('Fritar');
  }

  protected readonly id = 'fritar';
  protected tempoTotal = 45000;
  private vagas: (Bolinho | null)[] = [];
  private bons = 0;
  private queimados = 0;
  private cedo = 0;
  private contador!: Phaser.GameObjects.BitmapText;
  private readonly VAGAS = [[68, 182], [112, 182], [68, 222], [112, 222]];
  private readonly META = 4;

  protected montar() {
    this.vagas = [null, null, null, null];
    this.bons = this.queimados = this.cedo = 0;
    this.add.sprite(CENTRO_X, 202, 'atlas').setScale(2).play('tacho');
    this.add.image(22, 292, 'atlas', 'bacia_massa_2_0');
    this.add.image(40, 282, 'atlas', 'colher_0');
    this.add.image(146, 294, 'atlas', 'bandeja_0').setScale(2);
    this.contador = texto(this, 146, 270, `0/${this.META}`);
    this.VAGAS.forEach(([x, y], i) => {
      const z = this.add.zone(x, y, 38, 36).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => this.toca(i));
    });
  }

  private toca(i: number) {
    if (!this.rodando) return;
    const b = this.vagas[i];
    const [x, y] = this.VAGAS[i];
    if (!b) { // joga a massa no dendê
      if (this.bons + this.vagas.filter(Boolean).length >= this.META + 1) return;
      const s = this.add.image(x, y, 'atlas', 'acaraje_cru_0').setScale(2).setDepth(20);
      this.vagas[i] = { s, lado: 1, t: 0, fase: 'cru' };
      const r = this.add.sprite(x, y, 'atlas').setScale(2).setDepth(21).play('respingo');
      r.once('animationcomplete', () => r.destroy());
      tocar('pop');
      fritando(true);
      return;
    }
    if (b.saindo || b.fase === 'queimado') return;
    if (b.fase === 'cru' || b.fase === 'dourando') {
      this.cedo++;
      flutua(this, x, y - 18, 'AINDA CRU!');
      tocar('erro');
      return;
    }
    // no ponto
    b.brilho?.destroy();
    b.brilho = undefined;
    if (b.lado === 1) {
      tocar('acerto');
      this.tweens.add({
        targets: b.s, scaleY: 0, duration: 110, yoyo: true,
        onYoyo: () => { b.lado = 2; b.t = 0; b.fase = 'cru'; b.s.setFrame('acaraje_cru_0').setFlipY(true); },
      });
    } else {
      b.saindo = true;
      tocar('acerto');
      this.bons++;
      this.contador.setText(`${this.bons}/${this.META}`);
      this.tweens.add({
        targets: b.s, x: 140 + (this.bons % 3) * 6, y: 290, scale: 1, duration: 320,
        onComplete: () => { this.vagas[i] = null; this.confereFim(); },
      });
    }
  }

  private confereFim() {
    if (!this.vagas.some(Boolean)) fritando(false);
    if (this.bons >= this.META) {
      this.terminar(this.queimados === 0 && this.cedo <= 2 ? 3 : this.queimados <= 1 && this.cedo <= 5 ? 2 : 1);
    }
  }

  protected passo(dt: number) {
    this.vagas.forEach((b, i) => {
      if (!b || b.saindo) return;
      b.t += dt;
      const fase: FaseBolinho = b.t >= TEMPOS.queimado ? 'queimado' : b.t >= TEMPOS.ponto ? 'ponto' : b.t >= TEMPOS.dourando ? 'dourando' : 'cru';
      if (fase === b.fase) return;
      b.fase = fase;
      b.s.setFrame(`acaraje_${fase}_0`);
      if (fase === 'ponto') {
        b.brilho = this.add.sprite(b.s.x - 6, b.s.y - 8, 'atlas').setDepth(22).play('brilho');
        this.tweens.add({ targets: b.s, scale: 2.25, duration: 140, yoyo: true });
      }
      if (fase === 'queimado') {
        b.brilho?.destroy();
        this.queimados++;
        tocar('erro');
        flutua(this, b.s.x, b.s.y - 18, 'QUEIMOU!');
        animBia(this.bia, estado.roupa, 'preocupada');
        const f = this.add.sprite(b.s.x, b.s.y - 14, 'atlas').setScale(2).setDepth(23).play('fumaca');
        b.saindo = true;
        this.time.delayedCall(900, () => {
          f.destroy();
          b.s.destroy();
          this.vagas[i] = null;
          animBia(this.bia, estado.roupa, 'mexendo');
          this.confereFim();
        });
      }
    });
  }

  protected tempoEsgotado() {
    this.terminar(this.bons >= 3 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[68, 186], [68, 178]], 300, true);
  }
}

// ─── 9. Montar (arrastar os recheios) ─────────────────────────────────────────
const RECHEIOS = ['vatapa', 'caruru', 'vinagrete', 'camarao', 'pimenta'] as const;

export class Montar extends Etapa {
  constructor() {
    super('Montar');
  }

  protected readonly id = 'montar';
  protected tempoTotal = 30000;
  private cima!: Phaser.GameObjects.Image;
  private postos = new Set<string>();
  private erros = 0;
  private readonly A = { x: CENTRO_X, y: 190 };

  protected montar() {
    this.postos = new Set();
    this.erros = 0;
    // o acarajé aberto: as metades separadas pra caber o recheio no meio
    this.add.image(this.A.x, this.A.y, 'atlas', 'acaraje_aberto_0').setScale(3).setCrop(0, 17, 32, 15);
    this.cima = this.add.image(this.A.x, this.A.y, 'atlas', 'acaraje_aberto_0').setScale(3).setCrop(0, 0, 32, 17).setDepth(10);
    // pedido do casal
    this.add.image(150, 128, 'atlas', estado.comPimenta ? 'pimenta_sim_0' : 'pimenta_nao_0');
    texto(this, 130, 124, 'PEDIDO:', { origem: [1, 0] });
    RECHEIOS.forEach((n, i) => {
      const x0 = 20 + i * 35, y0 = 292;
      const p = this.add.image(x0, y0, 'atlas', `pote_${n}_0`).setScale(2).setDepth(30)
        .setInteractive({ draggable: true, useHandCursor: true });
      p.on('drag', (_p: Phaser.Input.Pointer, x: number, y: number) => this.rodando && p.setPosition(x, y));
      p.on('dragend', () => this.solta(n, p, x0, y0));
    });
  }

  private solta(nome: string, p: Phaser.GameObjects.Image, x0: number, y0: number) {
    const volta = () => this.tweens.add({ targets: p, x: x0, y: y0, duration: 200 });
    const dentro = Math.abs(p.x - this.A.x) < 52 && Math.abs(p.y - this.A.y) < 56;
    if (!dentro || !this.rodando) return volta();
    if (nome === 'pimenta' && !estado.comPimenta) {
      this.erros++;
      tocar('erro');
      flutua(this, this.A.x, this.A.y - 50, 'SEM PIMENTA!');
      this.tremer(this.cima);
      return volta();
    }
    if (this.postos.has(nome)) return volta();
    this.postos.add(nome);
    tocar('pop');
    const k = this.postos.size - 1;
    this.add.image(this.A.x, this.A.y + 3 - k * 9, 'atlas', `camada_${nome}_0`).setScale(3).setDepth(5);
    this.tweens.add({ targets: this.cima, y: this.A.y - (k + 1) * 9, duration: 150 });
    volta();
    p.setAlpha(0.4).disableInteractive();
    const precisa = estado.comPimenta ? 5 : 4;
    if (this.postos.size === precisa) {
      this.time.delayedCall(250, () => {
        this.tweens.add({ targets: this.cima, y: this.A.y - this.postos.size * 7, duration: 150 });
        const emb = this.add.image(this.A.x, this.A.y - 10, 'atlas', 'embrulho_0').setScale(0).setDepth(40);
        this.tweens.add({ targets: emb, scale: 3, duration: 260, delay: 200 });
        this.terminar(this.erros === 0 && this.segundos() <= 16 ? 3 : this.erros <= 1 ? 2 : 1);
      });
    }
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[20, 294], [this.A.x, this.A.y]], 800);
  }
}
