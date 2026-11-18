/** Minijogos: bater a massa, fritar e montar. */
import Phaser from 'phaser';
import { estado } from '../estado';
import { fritando, tocar } from '../som';
import { COR, L, animBia, flutua, texto } from '../ui';
import { CENTRO_X, Etapa } from './Etapa';

// ─── 3. Bater a massa (toquinhos: a massa cresce e fica branquinha) ───────────
const QUADROS_MASSA = 6;

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
  private lado = 1;

  protected montar() {
    this.fofura = 0;
    this.toques = [];
    this.bacia = this.add.image(CENTRO_X - 6, 252, 'atlas', 'bacia_massa_0_0').setScale(2).setOrigin(0.5, 0.75);
    this.colher = this.add.image(CENTRO_X - 42, 206, 'atlas', 'colher_0').setScale(2).setFlipY(true).setOrigin(0.2, 0.2).setDepth(5);
    this.barra = this.add.graphics();
    this.desenhaBarra();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.rodando || p.y < 116 || this.fofura >= 100) return;
      this.fofura = Math.min(100, this.fofura + 4.2);
      this.toques.push(this.time.now);
      tocar('pop');
      // a colher bate de um lado pro outro, e a massa dá uma sacudidinha
      this.lado = -this.lado;
      this.tweens.add({ targets: this.colher, angle: this.lado * 14, y: 216, duration: 60, yoyo: true });
      this.tweens.add({ targets: this.bacia, scaleY: 1.88, scaleX: 2.08, duration: 50, yoyo: true });
      const q = Math.min(QUADROS_MASSA - 1, Math.floor((this.fofura / 100) * QUADROS_MASSA));
      this.bacia.setFrame(`bacia_massa_${q}_0`);
      const b = this.add.sprite(CENTRO_X - 6 + Phaser.Math.Between(-30, 30), 228 - q * 7, 'atlas').setScale(1).play('brilho');
      this.time.delayedCall(300, () => b.destroy());
      this.desenhaBarra();
      if (this.fofura >= 100) {
        this.bia.anims.timeScale = 1;
        flutua(this, CENTRO_X, 140, 'BRANQUINHA E LEVINHA!');
        this.terminar(this.segundos() <= 7 ? 3 : this.segundos() <= 11 ? 2 : 1);
      }
    });
  }

  private desenhaBarra() {
    const g = this.barra.clear();
    g.fillStyle(COR.contorno).fillRect(162, 134, 10, 102);
    g.fillStyle(0xd8c9a8).fillRect(163, 135, 8, 100);
    g.fillStyle(COR.creme).fillRect(163, 235 - Math.round(this.fofura), 8, Math.round(this.fofura));
  }

  protected passo() {
    this.toques = this.toques.filter((t) => this.time.now - t < 1000);
    this.bia.anims.timeScale = 0.4 + Math.min(2, this.toques.length / 4);
  }

  protected tempoEsgotado() {
    this.terminar(this.fofura >= 70 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[CENTRO_X, 240], [CENTRO_X, 232]], 140, true);
  }
}

// ─── 7. Fritar (o coração do jogo) ────────────────────────────────────────────
type FaseBolinho = 'cru' | 'dourando' | 'ponto' | 'queimado';
interface Bolinho { s: Phaser.GameObjects.Image; lado: 1 | 2; t: number; fase: FaseBolinho; brilho?: Phaser.GameObjects.Sprite; saindo?: boolean }

const TEMPOS = { dourando: 2400, ponto: 3800, queimado: 8800 }; // janela larga: dá pra cuidar dos 4 de uma vez

export class Fritar extends Etapa {
  constructor() {
    super('Fritar');
  }

  protected readonly id = 'fritar';
  protected animTrabalho = 'fritando_parada';
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
    const massa = this.add.image(26, 288, 'atlas', 'bacia_massa_5_0').setScale(0.8).setInteractive({ useHandCursor: true });
    massa.on('pointerdown', () => this.VAGAS.forEach((_v, i) => !this.vagas[i] && this.toca(i)));
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
      const s = this.add.image(x, y, 'atlas', 'acaraje_l1_cru_0').setScale(2).setDepth(20);
      this.vagas[i] = { s, lado: 1, t: 0, fase: 'cru' };
      this.jogaMassa();
      const r = this.add.sprite(x, y, 'atlas').setScale(2).setDepth(21).play('respingo');
      r.once('animationcomplete', () => r.destroy());
      tocar('pop');
      fritando(true);
      return;
    }
    if (b.saindo || b.fase === 'queimado') return;
    if (b.fase === 'cru' || b.fase === 'dourando') {
      this.cedo++;
      flutua(this, x, y - 18, b.lado === 1 ? 'ESPERA A BORDA DOURAR!' : 'AINDA NÃO!');
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
        onYoyo: () => { b.lado = 2; b.t = 0; b.fase = 'cru'; b.s.setFrame('acaraje_l2_cru_0'); }, // o lado frito vem pra cima
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

  /** A Bia joga a colherada de massa no tacho (uma vez por toque) e volta a esperar com a colher cheia. */
  private jogaMassa() {
    const chave = `bia_${estado.roupa}_jogando_massa`;
    if (this.bia.anims.currentAnim?.key === chave && this.bia.anims.isPlaying) return; // vários bolinhos no mesmo toque
    this.bia.play({ key: chave, repeat: 0 });
    this.bia.once(`animationcomplete-${chave}`, () => {
      if (!this.acabou) animBia(this.bia, estado.roupa, 'fritando_parada');
    });
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
      b.s.setFrame(`acaraje_l${b.lado}_${fase}_0`);
      if (fase === 'ponto') {
        flutua(this, b.s.x, b.s.y - 18, b.lado === 1 ? 'VIRA!' : 'TIRA!');
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
          animBia(this.bia, estado.roupa, 'fritando_parada');
          this.confereFim();
        });
      }
    });
  }

  protected tempoEsgotado() {
    this.terminar(this.bons >= 3 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[26, 290], [26, 282]], 300, true);
  }
}

// ─── 8. Montar (na ordem certa e do jeito que o casal pediu) ──────────────────
/** Potinhos na bancada: as duas pimentas (com pimenta 🔥 / pouca pimenta ❄), vatapá, caruru, salada, camarão e shimeji. */
const POTES = ['pimenta', 'pimenta_pouca', 'vatapa', 'caruru', 'salada', 'camarao', 'shimeji'] as const;
const X_POTE = (i: number) => 13 + i * 25.7;
type Pote = (typeof POTES)[number];

export class Montar extends Etapa {
  constructor() {
    super('Montar');
  }

  protected readonly id = 'montar';
  protected animTrabalho = 'montando';
  protected tempoTotal = 30000;
  private cima!: Phaser.GameObjects.Image;
  private sequencia: Pote[] = [];
  private feitos = 0;
  private erros = 0;
  private marcas: Phaser.GameObjects.Image[] = [];
  private readonly A = { x: CENTRO_X, y: 196 };

  protected montar() {
    this.feitos = this.erros = 0;
    const pimenta: Pote = estado.pimenta === 'forte' ? 'pimenta' : 'pimenta_pouca';
    this.sequencia = [pimenta, 'vatapa', 'caruru', 'salada', estado.vegetariano ? 'shimeji' : 'camarao'];
    // o acarajé aberto: as metades separadas pra caber o recheio no meio
    this.add.image(this.A.x, this.A.y, 'atlas', 'acaraje_aberto_0').setScale(3).setCrop(0, 17, 32, 15);
    this.cima = this.add.image(this.A.x, this.A.y, 'atlas', 'acaraje_aberto_0').setScale(3).setCrop(0, 0, 32, 17).setDepth(10);
    // faixa do pedido: a ordem da montagem + o que o casal pediu
    this.add.rectangle(0, 118, L, 20, COR.contorno, 0.35).setOrigin(0);
    this.marcas = this.sequencia.map((n, i) => this.add.image(12 + i * 18, 128, 'atlas', `pote_${n}_0`));
    this.add.rectangle(108, 120, 1, 16, COR.creme, 0.6).setOrigin(0);
    this.add.image(124, 128, 'atlas', estado.pimenta === 'forte' ? 'icone_fogo_0' : 'icone_frio_0');
    this.add.image(144, 128, 'atlas', estado.vegetariano ? 'icone_shimeji_0' : 'icone_camarao_0');
    this.add.image(164, 128, 'atlas', 'acaraje_fechado_0').setScale(0.5);
    this.destacaProximo();

    POTES.forEach((n, i) => {
      const x0 = X_POTE(i), y0 = 294;
      if (n === 'pimenta') this.add.image(x0, y0 - 22, 'atlas', 'icone_fogo_0');
      if (n === 'pimenta_pouca') this.add.image(x0, y0 - 22, 'atlas', 'icone_frio_0');
      const p = this.add.image(x0, y0, 'atlas', `pote_${n}_0`).setScale(1.75).setDepth(30)
        .setInteractive({ draggable: true, useHandCursor: true });
      p.on('drag', (_p: Phaser.Input.Pointer, x: number, y: number) => this.rodando && p.setPosition(x, y));
      p.on('dragend', () => this.solta(n, p, x0, y0));
    });
  }

  private destacaProximo() {
    this.marcas.forEach((m, i) => m.setAlpha(i < this.feitos ? 0.3 : 1).setScale(i === this.feitos ? 1.25 : 1));
  }

  private erro(msg: string) {
    this.erros++;
    tocar('erro');
    flutua(this, this.A.x, this.A.y - 50, msg);
    this.tremer(this.cima);
  }

  private solta(nome: Pote, p: Phaser.GameObjects.Image, x0: number, y0: number) {
    const volta = () => this.tweens.add({ targets: p, x: x0, y: y0, duration: 200 });
    const dentro = Math.abs(p.x - this.A.x) < 52 && Math.abs(p.y - this.A.y) < 56;
    if (!dentro || !this.rodando) return volta();
    const esperado = this.sequencia[this.feitos];
    if (nome !== esperado) {
      if (nome === 'camarao' && estado.vegetariano) this.erro('É VEGETARIANO: SHIMEJI!');
      else if (nome === 'shimeji' && !estado.vegetariano) this.erro('É TRADICIONAL: CAMARÃO!');
      else if (nome === 'pimenta' && estado.pimenta === 'pouca') this.erro('É POUCA PIMENTA!');
      else if (nome === 'pimenta_pouca' && estado.pimenta === 'forte') this.erro('É COM PIMENTA!');
      else if (!this.sequencia.slice(0, this.feitos).includes(nome)) this.erro('NA ORDEM!');
      return volta();
    }
    tocar('pop');
    this.pegaRecheio(nome);
    const k = this.feitos;
    this.feitos++;
    this.add.image(this.A.x, this.A.y + 3 - k * 9, 'atlas', `camada_${nome}_0`).setScale(3).setDepth(5);
    this.tweens.add({ targets: this.cima, y: this.A.y - (k + 1) * 9, duration: 150 });
    volta();
    p.setAlpha(0.4).disableInteractive();
    this.destacaProximo();
    if (this.feitos === this.sequencia.length) {
      this.time.delayedCall(250, () => {
        this.tweens.add({ targets: this.cima, y: this.A.y - this.feitos * 7, duration: 150 });
        const emb = this.add.image(this.A.x, this.A.y - 10, 'atlas', 'embrulho_0').setScale(0).setDepth(40);
        this.tweens.add({ targets: emb, scale: 3, duration: 260, delay: 200 });
        this.terminar(this.erros === 0 && this.segundos() <= 18 ? 3 : this.erros <= 1 ? 2 : 1);
      });
    }
  }

  /** A Bia pega o recheio no pote com a colher e põe no acarajé, depois volta a esperar. */
  private pegaRecheio(nome: Pote) {
    const chave = `bia_${estado.roupa}_${nome}_recheando`;
    this.bia.play({ key: chave, repeat: 0 });
    this.bia.once(`animationcomplete-${chave}`, () => {
      if (!this.acabou) animBia(this.bia, estado.roupa, 'montando');
    });
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    const i = POTES.indexOf(this.sequencia[0]);
    this.maoEntre(mao, [[X_POTE(i), 296], [this.A.x, this.A.y]], 800);
  }
}
