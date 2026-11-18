/** Minijogos de preparo: lavar, triturar, vatapá, caruru e salada (bater, fritar e montar ficam em etapas2.ts). */
import Phaser from 'phaser';
import { tocar } from '../som';
import { estado } from '../estado';
import { COR, animBia, flutua, texto } from '../ui';
import { CENTRO_X, Etapa } from './Etapa';

// ─── 1. Lavar o feijão-fradinho (esfregar na água) ────────────────────────────
interface Feijao { s: Phaser.GameObjects.Image; esfregado: number; limpo: boolean }

export class Lavar extends Etapa {
  constructor() {
    super('Lavar');
  }

  protected readonly id = 'lavar';
  protected animTrabalho = 'lavando_feijao';
  protected tempoTotal = 20000;
  private feijoes: Feijao[] = [];
  private limpos = 0;
  private ultimo: { x: number; y: number } | null = null;
  private somAgua = 0;
  private bacia!: Phaser.GameObjects.Image;

  protected montar() {
    this.feijoes = [];
    this.limpos = 0;
    const cx = CENTRO_X, cy = 214;
    this.bacia = this.add.image(cx, cy, 'atlas', 'bacia_agua_suja_0').setScale(2);
    // torneira aberta caindo água na bacia
    this.add.sprite(120, 147, 'atlas').setOrigin(0.5, 0).setDepth(10).play('jato_agua');
    this.add.image(105, 133, 'atlas', 'torneira_0').setScale(2).setDepth(11);
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2, r = 6 + Math.sqrt(Math.random()) * 38;
      const s = this.add.image(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 'atlas', 'feijao_sujo_0').setScale(2);
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
    const b = this.add.image(f.s.x, f.s.y, 'atlas', 'bolha_0').setScale(2);
    this.tweens.add({ targets: b, y: b.y - 18, alpha: 0, duration: 700, onComplete: () => b.destroy() });
    if (this.time.now - this.somAgua > 180) { tocar('agua'); this.somAgua = this.time.now; }
    if (this.limpos === Math.round(this.feijoes.length * 0.6)) {
      this.bacia.setFrame('bacia_agua_0'); // trocou a água
      flutua(this, CENTRO_X, 160, 'ÁGUA LIMPA!');
    }
    if (this.limpos === this.feijoes.length) this.terminar(this.segundos() <= 11 ? 3 : 2);
  }

  protected tempoEsgotado() {
    this.terminar(this.limpos / this.feijoes.length >= 0.8 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[62, 206], [118, 222], [62, 238], [118, 206]], 350);
  }
}

// ─── 2. Triturar no multiprocessador industrial (um toque liga, outro para) ───
export class Triturar extends Etapa {
  constructor() {
    super('Triturar');
  }

  protected readonly id = 'triturar';
  protected tempoTotal = 35000;
  protected animTrabalho = 'parada';
  private ponto = 0; // 0 = feijão inteiro · 100 = virou papa
  private ligado = false;
  private leva = 0;
  private notas: number[] = [];
  private trocando = false;
  private ultimoSom = 0;
  private maquina!: Phaser.GameObjects.Sprite;
  private botaoImg!: Phaser.GameObjects.Image;
  private tigela!: Phaser.GameObjects.Image;
  private medidor!: Phaser.GameObjects.Graphics;
  private readonly LEVAS = 3;
  private readonly VERDE = [60, 85];
  private readonly VEL = [34, 44, 54]; // % por segundo: cada leva vai mais rápido

  protected montar() {
    this.ponto = this.leva = 0;
    this.ligado = this.trocando = false;
    this.notas = [];
    this.maquina = this.add.sprite(CENTRO_X - 6, 188, 'atlas', 'processador_feijao_0').setScale(2);
    this.botaoImg = this.add.image(CENTRO_X - 6, 288, 'atlas', 'botao_liga_0').setScale(2);
    this.tigela = this.add.image(26, 288, 'atlas', 'tigela_0_0').setScale(1.5);
    this.medidor = this.add.graphics();
    this.desenhaMedidor();
    const z = this.add.zone(CENTRO_X - 6, 288, 70, 44).setInteractive({ useHandCursor: true });
    z.on('pointerdown', () => (this.ligado ? this.desliga() : this.liga()));
  }

  private liga() {
    if (!this.rodando || this.trocando || this.ligado) return;
    this.ligado = true;
    this.botaoImg.setFrame('botao_apertado_0');
    animBia(this.bia, estado.roupa, 'segurando_tampa'); // segura a tampa enquanto o motor trepida
  }

  private desliga() {
    if (!this.ligado) return;
    this.ligado = false;
    this.botaoImg.setFrame('botao_liga_0');
    this.maquina.stop().setFrame(`processador_${this.conteudo()}_0`);
    animBia(this.bia, estado.roupa, 'parada');
    if (this.ponto < this.VERDE[0]) {
      flutua(this, CENTRO_X, 140, this.ponto < 30 ? 'TÁ INTEIRO!' : 'AINDA GROSSO!');
      return; // pode apertar de novo
    }
    if (this.ponto <= this.VERDE[1]) {
      tocar('acerto');
      flutua(this, CENTRO_X, 140, 'NO PONTO!');
      this.fimLeva(2);
    } else {
      tocar('erro');
      flutua(this, CENTRO_X, 140, 'PASSOU UM POUCO');
      this.fimLeva(1);
    }
  }

  private conteudo() {
    return this.ponto < 35 ? 'feijao' : this.ponto < this.VERDE[0] ? 'grosso' : 'massa';
  }

  private fimLeva(nota: number) {
    this.notas.push(nota);
    this.leva++;
    this.trocando = true;
    this.tigela.setFrame(this.leva >= 2 ? 'tigela_2_0' : 'tigela_1_0');
    const m = this.add.image(this.maquina.x, this.maquina.y, 'atlas', 'acaraje_cru_0').setScale(1);
    this.tweens.add({ targets: m, x: this.tigela.x, y: this.tigela.y, duration: 350, onComplete: () => m.destroy() });
    this.time.delayedCall(450, () => {
      if (this.leva >= this.LEVAS) {
        const soma = this.notas.reduce((a, b) => a + b, 0);
        this.terminar(soma >= 6 ? 3 : soma >= 4 ? 2 : 1);
        return;
      }
      this.ponto = 0;
      this.maquina.setFrame('processador_feijao_0');
      flutua(this, CENTRO_X, 140, `LEVA ${this.leva + 1}/${this.LEVAS}`);
      tocar('pop');
      this.trocando = false;
      this.desenhaMedidor();
    });
  }

  private desenhaMedidor() {
    const g = this.medidor.clear();
    const y0 = 134, h = 100;
    g.fillStyle(COR.contorno).fillRect(162, y0 - 1, 10, h + 2);
    g.fillStyle(0xd8c9a8).fillRect(163, y0, 8, h);
    g.fillStyle(COR.verdeLuz).fillRect(163, y0 + h - this.VERDE[1], 8, this.VERDE[1] - this.VERDE[0]);
    g.fillStyle(COR.dende).fillRect(163, y0, 8, h - 92);
    const y = y0 + h - Math.min(100, this.ponto);
    const naFaixa = this.ponto >= this.VERDE[0] && this.ponto <= this.VERDE[1];
    g.fillStyle(naFaixa ? COR.verde : COR.contorno).fillRect(160, Math.round(y) - 1, 14, 3);
  }

  protected passo(dt: number) {
    if (!this.ligado) return;
    this.ponto += (this.VEL[Math.min(this.leva, 2)] * dt) / 1000;
    const anim = `processador_${this.conteudo()}_ligado`;
    if (this.maquina.anims.currentAnim?.key !== anim || !this.maquina.anims.isPlaying) this.maquina.play(anim);
    if (this.time.now - this.ultimoSom > 130) { tocar('motor'); this.ultimoSom = this.time.now; }
    this.desenhaMedidor();
    if (this.ponto >= 100) { // virou papa: desliga sozinho
      this.ligado = false;
      this.botaoImg.setFrame('botao_liga_0');
      this.maquina.stop().setFrame('processador_massa_0');
      animBia(this.bia, estado.roupa, 'preocupada');
      tocar('erro');
      flutua(this, CENTRO_X, 140, 'VIROU PAPA!');
      this.fimLeva(0);
    }
  }

  protected tempoEsgotado() {
    const soma = this.notas.reduce((a, b) => a + b, 0);
    this.terminar(soma >= 4 ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[CENTRO_X - 6, 292], [CENTRO_X - 6, 286]], 300, true);
  }
}

// ─── 4. Temperos: picar alho, cebola, pimentão e cheiro-verde, e fazer a pimenta ──
const PICAR = [
  { nome: 'alho', picado: 'alho_picado', rotulo: 'ALHO' },
  { nome: 'cebola', picado: 'cebola_picada', rotulo: 'CEBOLA' },
  { nome: 'pimentao', picado: 'pimentao_picado', rotulo: 'PIMENTÃO' },
  { nome: 'cheiro_verde', picado: 'cheiro_verde_picado', rotulo: 'CHEIRO-VERDE' },
];

export class Temperos extends Etapa {
  constructor() {
    super('Temperos');
  }

  protected readonly id = 'temperos';
  protected animTrabalho = 'cortando';
  protected tempoTotal = 45000; // 4 temperos pra picar (eram 2): +10 s
  private atual = 0;
  private cortes = 0;
  private pimentas = 0;
  private fase: 'picar' | 'pimenta' | 'mexer' = 'picar';
  private giro!: (p: Phaser.Input.Pointer) => number;
  private mexido = 0;
  private colher!: Phaser.GameObjects.Image;
  private readonly VOLTAS = 3;
  private somMexer = 0;
  private item!: Phaser.GameObjects.Image;
  private faca!: Phaser.GameObjects.Image;
  private pote!: Phaser.GameObjects.Image;
  private legenda!: Phaser.GameObjects.BitmapText;
  private readonly T = { x: CENTRO_X, y: 186 };
  private readonly CORTES = 4;

  protected montar() {
    this.atual = this.cortes = this.pimentas = this.mexido = 0;
    this.fase = 'picar';
    this.add.image(this.T.x, this.T.y, 'atlas', 'tabua_0').setScale(2);
    this.add.image(36, 286, 'atlas', 'tigela_0_0').setScale(1.6);
    this.add.image(150, 300, 'atlas', 'ing_dende_0').setScale(1.5);
    this.pote = this.add.image(122, 286, 'atlas', 'pote_pimenta_pouca_0').setScale(2.5);
    this.item = this.add.image(this.T.x, this.T.y, 'atlas', `${PICAR[0].nome}_0`).setScale(3);
    // qualquer toque na tábua é uma facada (toquinhos rápidos no celular não se perdem)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (Math.abs(p.x - this.T.x) < 66 && Math.abs(p.y - this.T.y) < 40 && this.item.visible) this.pica();
    });
    this.faca = this.add.image(this.T.x + 16, this.T.y - 44, 'atlas', 'faca_0').setScale(2).setDepth(30).setVisible(false);
    this.legenda = texto(this, CENTRO_X, 224, PICAR[0].rotulo).setDepth(20);
    this.colher = this.add.image(0, 0, 'atlas', 'colher_0').setScale(2).setFlipY(true).setOrigin(0.2, 0.2).setVisible(false).setDepth(50);
    this.giro = this.rastreadorGiro(this.pote.x, this.pote.y, 6);
  }

  private pica() {
    if (!this.rodando || this.fase !== 'picar') return;
    this.cortes++;
    tocar('corte');
    this.faca.setVisible(true).setPosition(this.item.x + 10, this.T.y - 44);
    this.tweens.add({ targets: this.faca, y: this.T.y - 28, duration: 60, yoyo: true });
    this.tweens.add({ targets: this.item, scale: 3 - this.cortes * 0.35, duration: 60 });
    if (this.cortes < this.CORTES) return;
    // picou: vai pra tigela
    const pedaco = this.add.image(this.item.x, this.item.y, 'atlas', `${PICAR[this.atual].picado}_0`).setScale(2.5);
    this.item.setVisible(false);
    tocar('acerto');
    this.tweens.add({ targets: pedaco, x: 36, y: 284, scale: 1, duration: 320, onComplete: () => pedaco.destroy() });
    this.atual++;
    this.cortes = 0;
    this.time.delayedCall(360, () => {
      this.faca.setVisible(false);
      if (this.atual < PICAR.length) {
        this.item.setFrame(`${PICAR[this.atual].nome}_0`).setScale(3).setVisible(true);
        this.legenda.setText(PICAR[this.atual].rotulo);
      } else {
        this.comecaPimenta();
      }
    });
  }

  private comecaPimenta() {
    this.fase = 'pimenta';
    animBia(this.bia, estado.roupa, 'parada'); // largou a faca
    this.legenda.setText('PIMENTA: JOGUE NO DENDÊ');
    const lugares = [[46, 170], [78, 196], [104, 168], [132, 198], [92, 182]];
    lugares.forEach(([x, y], i) => {
      const p = this.add.image(x, y, 'atlas', 'malagueta_0').setScale(0).setAngle(Phaser.Math.Between(-30, 30)).setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: p, scale: 2, duration: 180, delay: i * 70 });
      p.on('pointerdown', () => {
        if (!this.rodando) return;
        p.disableInteractive();
        tocar('pop');
        this.tweens.add({
          targets: p, x: this.pote.x, y: this.pote.y - 4, scale: 0.8, duration: 260,
          onComplete: () => {
            p.destroy();
            this.pimentas++;
            if (this.pimentas === 3) this.pote.setFrame('pote_pimenta_0');
            if (this.pimentas === lugares.length) {
              this.fase = 'mexer';
              animBia(this.bia, estado.roupa, 'mexendo');
              this.legenda.setText('AGORA MEXE NO DENDÊ!');
              flutua(this, this.pote.x - 20, this.pote.y - 30, 'MEXE EM CÍRCULOS!');
            }
          },
        });
      });
    });
  }

  /** Mexer a pimenta no dendê: girar o dedo em volta do pote. */
  protected passo() {
    if (this.fase !== 'mexer') return;
    const p = this.input.activePointer;
    const d = this.giro(p);
    this.colher.setVisible(p.isDown).setPosition(p.x - 34, p.y - 36);
    this.mexido += d;
    if (d > 0.05 && this.time.now - this.somMexer > 300) { tocar('agua'); this.somMexer = this.time.now; }
    if (this.mexido >= Math.PI * 2 * this.VOLTAS) {
      this.fase = 'pimenta';
      this.colher.setVisible(false);
      flutua(this, this.pote.x - 20, this.pote.y - 30, 'PIMENTA PRONTA!');
      this.terminar(this.segundos() <= 23 ? 3 : this.segundos() <= 33 ? 2 : 1);
    }
  }

  protected tempoEsgotado() {
    this.terminar(this.fase === 'picar' ? 1 : 2);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[this.T.x, this.T.y + 6], [this.T.x, this.T.y]], 200, true);
  }
}

// ─── 4. Vatapá (ordem dos ingredientes + mexer sem grudar) ────────────────────
/** Castanha de caju, amendoim, gengibre, temperos naturais triturados, farinha de trigo e um pouco de dendê. */
export const ORDEM_VATAPA = ['castanha', 'amendoim', 'gengibre', 'temperos', 'farinha', 'dende'];
/** O caruru leva os mesmos ingredientes do vatapá, menos a farinha. */
const INGREDIENTES_CARURU = ORDEM_VATAPA.filter((n) => n !== 'farinha');
export const NOME_INGREDIENTE: Record<string, string> = {
  castanha: 'CASTANHA DE CAJU', amendoim: 'AMENDOIM', gengibre: 'GENGIBRE',
  temperos: 'TEMPEROS NATURAIS', farinha: 'FARINHA DE TRIGO', dende: 'DENDÊ',
};

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
  private proximo!: Phaser.GameObjects.BitmapText;
  private readonly C = { x: CENTRO_X, y: 222 };

  protected montar() {
    this.indice = this.erros = this.queimou = this.mexido = this.grudando = 0;
    this.fase = 'ingredientes';
    this.panela = this.add.image(this.C.x, this.C.y, 'atlas', 'panela_vazia_0').setScale(2);
    // receita (ordem) em cima da bancada
    texto(this, 6, 121, 'RECEITA:', { esquerda: true });
    this.marcas = ORDEM_VATAPA.map((n, i) => this.add.image(62 + i * 19, 126, 'atlas', `ing_${n}_0`));
    this.proximo = texto(this, CENTRO_X, 136, `PRÓXIMO: ${NOME_INGREDIENTE[ORDEM_VATAPA[0]]}`).setDepth(20);
    const lugares = Phaser.Utils.Array.Shuffle([[16, 160], [164, 160], [16, 296], [164, 296], [56, 306], [124, 306]]);
    ORDEM_VATAPA.forEach((n, i) => {
      const [x, y] = lugares[i];
      const s = this.add.image(x, y, 'atlas', `ing_${n}_0`).setScale(2).setInteractive({ useHandCursor: true });
      s.on('pointerup', () => this.toca(n, s));
    });
    this.colher = this.add.image(0, 0, 'atlas', 'colher_0').setScale(2).setFlipY(true).setOrigin(0.2, 0.2).setVisible(false).setDepth(50); // ponta pra baixo, dentro da panela
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
    flutua(this, s.x < 40 ? 50 : s.x > 140 ? 130 : s.x, s.y - 20, NOME_INGREDIENTE[nome]);
    this.indice++;
    const prox = ORDEM_VATAPA[this.indice];
    this.proximo.setText(prox ? `PRÓXIMO: ${NOME_INGREDIENTE[prox]}` : 'AGORA MEXE!');
    tocar('pop');
    this.tweens.add({ targets: s, x: this.C.x, y: this.C.y, scale: 1, duration: 260, onComplete: () => s.destroy() });
    this.panela.setFrame('panela_ralo_0');
    if (this.indice === ORDEM_VATAPA.length) {
      this.fase = 'mexer';
      flutua(this, this.C.x, this.C.y - 40, 'AGORA MEXE ATÉ DAR O PONTO!');
    }
  }

  protected passo(dt: number) {
    if (this.fase !== 'mexer') return;
    const p = this.input.activePointer;
    const d = this.giro(p);
    this.colher.setVisible(p.isDown).setPosition(p.x - 34, p.y - 36);
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

// ─── 5. Caruru (cortar o quiabo + os ingredientes do vatapá) ──────────────────
export class Caruru extends Etapa {
  constructor() {
    super('Caruru');
  }

  protected readonly id = 'caruru';
  protected animTrabalho = 'picando_quiabo';
  protected tempoTotal = 40000;
  private feitos = 0;
  private postos = 0;
  private cortando = false;
  private mexendo = false;
  private mexido = 0;
  private somMexer = 0;
  private colher!: Phaser.GameObjects.Image;
  private giro!: (p: Phaser.Input.Pointer) => number;
  private faca!: Phaser.GameObjects.Image;
  private readonly QUIABOS = 4;
  private readonly TABUA = { x: CENTRO_X, y: 168, w: 128, h: 64 };
  private readonly PANELA = { x: 126, y: 268 };

  protected montar() {
    this.feitos = this.postos = this.mexido = 0;
    this.cortando = this.mexendo = false;
    this.rodelas = [];
    this.colher = this.add.image(0, 0, 'atlas', 'colher_0').setScale(2).setFlipY(true).setOrigin(0.2, 0.2).setVisible(false).setDepth(50);
    this.giro = this.rastreadorGiro(this.PANELA.x, this.PANELA.y, 6);
    this.add.image(this.TABUA.x, this.TABUA.y, 'atlas', 'tabua_0').setScale(2);
    this.add.image(this.PANELA.x, this.PANELA.y, 'atlas', 'panela_vazia_0').setScale(1.3);
    this.faca = this.add.image(this.TABUA.x + 30, this.TABUA.y - 40, 'atlas', 'faca_0').setScale(2).setVisible(false).setDepth(40);
    const lugares = [[22, 236], [22, 266], [22, 296], [56, 280]];
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
            this.espalhaRodelas(5); // a panela vai enchendo de quiabo
            this.cortando = false;
            this.feitos++;
            if (this.feitos === this.QUIABOS) this.ingredientes();
          },
        });
      },
    });
  }

  private rodelas: (Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle)[] = [];

  /** Rodelinhas de quiabo espalhadas dentro da panela. */
  private espalhaRodelas(n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 25;
      const img = this.add.image(this.PANELA.x + Math.cos(a) * r, this.PANELA.y + Math.sin(a) * r * 0.85, 'atlas', 'quiabo_rodelas_0')
        .setScale(0).setAngle(Phaser.Math.Between(0, 359)).setDepth(2);
      this.tweens.add({ targets: img, scale: Phaser.Math.FloatBetween(0.7, 1), duration: 160, delay: i * 50 });
      this.rodelas.push(img);
    }
  }

  /** O dendê deixa o caruru verde com um toquezinho de laranja. */
  private pingaDende() {
    for (const r of this.rodelas) if (r instanceof Phaser.GameObjects.Image) r.setTint(0xffe2b0);
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, raio = Math.sqrt(Math.random()) * 24;
      const pingo = this.add.rectangle(this.PANELA.x + Math.cos(a) * raio, this.PANELA.y + Math.sin(a) * raio * 0.85, 2, 2, i % 3 ? COR.dende : 0xec9344)
        .setDepth(3).setAlpha(0);
      this.tweens.add({ targets: pingo, alpha: 0.9, duration: 200, delay: i * 25 });
      this.rodelas.push(pingo);
    }
  }

  /** Depois do quiabo: os mesmos ingredientes do vatapá, em qualquer ordem. */
  private ingredientes() {
    animBia(this.bia, estado.roupa, 'parada'); // largou a faca
    flutua(this, CENTRO_X, 150, 'AGORA OS INGREDIENTES!');
    const lugares = [[22, 150], [158, 150], [22, 236], [62, 236], [40, 292]];
    INGREDIENTES_CARURU.forEach((n, i) => {
      const [x, y] = lugares[i];
      const s = this.add.image(x, y, 'atlas', `ing_${n}_0`).setScale(0).setInteractive({ useHandCursor: true }).setDepth(30);
      this.tweens.add({ targets: s, scale: 2, duration: 200, delay: i * 60 });
      s.on('pointerup', () => {
        if (!this.rodando) return;
        s.disableInteractive();
        tocar('pop');
        flutua(this, Phaser.Math.Clamp(s.x, 50, 130), s.y - 18, NOME_INGREDIENTE[n]);
        this.tweens.add({
          targets: s, x: this.PANELA.x, y: this.PANELA.y, scale: 0.8, duration: 260,
          onComplete: () => {
            s.destroy();
            if (n === 'dende') this.pingaDende();
            this.postos++;
            if (this.postos === INGREDIENTES_CARURU.length) {
              this.mexendo = true;
              animBia(this.bia, estado.roupa, 'mexendo');
              flutua(this, CENTRO_X, 150, 'AGORA MEXE O CARURU!');
            }
          },
        });
      });
    });
  }

  /** Mexer o caruru: girar o dedo em volta da panela. */
  protected passo() {
    if (!this.mexendo) return;
    const p = this.input.activePointer;
    const d = this.giro(p);
    this.colher.setVisible(p.isDown).setPosition(p.x - 34, p.y - 36);
    this.mexido += d;
    if (d > 0) {  // o quiabo gira junto com a colher
      for (const r of this.rodelas) {
        const ax = r.x - this.PANELA.x, ay = (r.y - this.PANELA.y) / 0.85;
        const ang = Math.atan2(ay, ax) + d * 0.6, raio = Math.hypot(ax, ay);
        r.setPosition(this.PANELA.x + Math.cos(ang) * raio, this.PANELA.y + Math.sin(ang) * raio * 0.85).setAngle(r.angle + d * 40);
      }
    }
    if (d > 0.05 && this.time.now - this.somMexer > 300) { tocar('agua'); this.somMexer = this.time.now; }
    if (this.mexido >= Math.PI * 2 * 3) {
      this.mexendo = false;
      this.colher.setVisible(false);
      flutua(this, CENTRO_X, 150, 'CARURU NO PONTO!');
      this.terminar(this.segundos() <= 21 ? 3 : this.segundos() <= 30 ? 2 : 1);
    }
  }

  protected tempoEsgotado() {
    this.terminar(this.feitos === this.QUIABOS ? 2 : 1);
  }

  protected demonstrar(mao: Phaser.GameObjects.Image) {
    this.maoEntre(mao, [[22, 268], [this.TABUA.x, this.TABUA.y + 4]], 700);
  }
}

// ─── 6. Salada: tomate verde, meio amarelado e vermelho picados (tocar no tempo, sem acertar o dedo) ──
const TOMATES = ['tomate_verde', 'tomate_meio', 'tomate_maduro'];
export class Salada extends Etapa {
  constructor() {
    super('Salada');
  }

  protected readonly id = 'salada';
  protected animTrabalho = 'picando';
  protected tempoTotal = 30000;
  private faca!: Phaser.GameObjects.Image;
  private item!: Phaser.GameObjects.Image;
  private mao!: Phaser.GameObjects.Image;
  private tigela!: Phaser.GameObjects.Image;
  private vel = 60;
  private dir = 1;
  private cortes = 0;
  private tomates = 0;
  private dedo = 0;
  private errou = 0;
  private espera = 0;
  private readonly TOMATES = TOMATES.length;
  private readonly Y = 196;
  private readonly DIST_MAO = [40, 35, 31];

  protected montar() {
    this.vel = 60; this.dir = 1; this.cortes = this.tomates = this.dedo = this.errou = 0;
    this.add.image(CENTRO_X, this.Y, 'atlas', 'tabua_0').setScale(2);
    this.tigela = this.add.image(CENTRO_X, 282, 'atlas', 'tigela_0_0').setScale(2);
    this.item = this.add.image(0, this.Y, 'atlas', `${TOMATES[0]}_0`).setScale(2);
    this.mao = this.add.image(0, this.Y + 2, 'atlas', 'mao_0').setScale(2);
    this.faca = this.add.image(40, this.Y - 30, 'atlas', 'faca_0').setScale(2).setDepth(30);
    this.posiciona();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => p.y > 116 && this.corta());
  }

  private posiciona() {
    // a mão fica cada vez mais perto do tomate: o 1º um pouco afastado, o 2º mais perto e o 3º quase encostando
    // (faca acerta o dedo a 12 px da mão e o tomate a 13 px dele: abaixo de 25 px não sobraria lugar seguro)
    const dist = this.DIST_MAO[this.tomates];
    const xi = Phaser.Math.Between(46, 134);
    let lado = Phaser.Math.RND.sign();
    if (xi + lado * dist < 40 || xi + lado * dist > 140) lado = -lado;
    const xm = xi + lado * dist;
    this.item.setPosition(xi, this.Y).setFrame(`${TOMATES[this.tomates]}_0`).setVisible(true);
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
        const pedaco = this.add.image(this.item.x, this.item.y, 'atlas', `${TOMATES[this.tomates]}_cubos_0`).setScale(2);
        this.item.setVisible(false);
        this.tweens.add({ targets: pedaco, x: CENTRO_X, y: 282, scale: 1, duration: 320, onComplete: () => pedaco.destroy() });
        this.tomates++;
        if (this.tomates === this.TOMATES) {
          this.tigela.setFrame('salada_0');
          this.terminar(this.dedo === 0 && this.errou <= 2 ? 3 : this.dedo <= 1 && this.errou <= 5 ? 2 : 1);
        } else {
          this.tigela.setFrame('salada_0');
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
