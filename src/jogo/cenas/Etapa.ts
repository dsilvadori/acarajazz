/**
 * Base dos minijogos de preparo: o "close" da cozinha.
 * A câmera chega perto: parede de chita de girassol, a Bia ampliada 2× da cintura pra cima e a bancada na frente.
 * Cada minijogo monta seus objetos na bancada (y ≥ 116) e chama terminar(estrelas).
 */
import Phaser from 'phaser';
import { ETAPAS, estado, infoEtapa, nivelSatisfacao, numeroEtapa, proximaEtapa, reduzirMovimento, registrarEstrelas } from '../estado';
import { fritando, tocar } from '../som';
import { COR, L, animBia, botao, botaoSom, faixa, painel, texto } from '../ui';

export const BANCADA = 116; // onde começa a área de jogo
export const CENTRO_X = L / 2;

export abstract class Etapa extends Phaser.Scene {
  protected abstract readonly id: string;
  protected tempoTotal = 30000;
  protected tempo = 0;
  protected rodando = false;
  protected acabou = false;
  protected bia!: Phaser.GameObjects.Sprite;
  protected animTrabalho = 'mexendo';
  private barraTempo!: Phaser.GameObjects.Graphics;
  private carinha!: Phaser.GameObjects.Image;
  private tutorial: Phaser.GameObjects.GameObject[] = [];

  /** Monta os objetos do minijogo. */
  protected abstract montar(): void;
  /** Chamado a cada quadro enquanto o minijogo roda. */
  protected passo(_dt: number) {}
  /** Tempo acabou: decide as estrelas (padrão: 1). */
  protected tempoEsgotado() {
    this.terminar(1);
  }
  /** Onde a mãozinha do tutorial aparece e como ela se mexe. */
  protected abstract demonstrar(mao: Phaser.GameObjects.Image): void;

  create() {
    this.acabou = false;
    this.rodando = false;
    this.tempo = this.tempoTotal;
    this.add.image(0, 0, 'close_parede').setOrigin(0, 0);
    this.bia = this.add.sprite(CENTRO_X, 38, 'atlas').setOrigin(0.5, 0).setScale(2);
    animBia(this.bia, estado.roupa, 'parada');
    this.add.image(0, 0, 'close_bancada').setOrigin(0, 0);

    // Faixa de cima: etapa, nome e satisfação do casal
    faixa(this, 0, 0, 18).setDepth(900);
    const info = infoEtapa(this.id);
    texto(this, 4, 4, `${numeroEtapa(this.id)}/${ETAPAS.length} ${info.nome}`, { esquerda: true }).setDepth(901);
    this.carinha = this.add.image(L - 26, 9, 'atlas', `carinha_${nivelSatisfacao()}_0`).setDepth(901);
    botaoSom(this);
    this.barraTempo = this.add.graphics().setDepth(901);
    this.desenhaTempo();

    this.montar();
    this.mostrarTutorial(info.instrucao);
    this.events.once('shutdown', () => fritando(false));
  }

  private mostrarTutorial(instrucao: string) {
    const fundo = this.add.rectangle(0, 18, L, 302, COR.contorno, 0.55).setOrigin(0).setDepth(1000).setInteractive();
    const t = texto(this, L / 2, 134, instrucao, { fonte: 'escura', largura: 150 }).setDepth(1002);
    const p = painel(this, 10, 128, L - 20, Math.max(74, Math.ceil(t.height) + 14)).setDepth(1001); // cresce com o texto
    const toque = texto(this, L / 2, 300, 'TOQUE PRA COMEÇAR').setDepth(1002);
    this.tweens.add({ targets: toque, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    const mao = this.add.image(0, 0, 'atlas', 'maozinha_0').setOrigin(0.35, 0).setDepth(1003);
    this.demonstrar(mao);
    this.tutorial = [fundo, p, t, toque, mao];
    fundo.once('pointerup', () => {
      this.tutorial.forEach((o) => o.destroy());
      this.rodando = true;
      animBia(this.bia, estado.roupa, this.animTrabalho);
    });
  }

  /** Mãozinha indo e voltando entre pontos (pra mostrar o gesto). */
  protected maoEntre(mao: Phaser.GameObjects.Image, pontos: [number, number][], dur = 500, toque = false) {
    mao.setPosition(...pontos[0]);
    const passos = pontos.slice(1).map(([x, y]) => ({ x, y, duration: dur, scale: toque ? 0.85 : 1 }));
    this.tweens.chain({ targets: mao, tweens: passos.length ? passos : [{ scale: 0.8, duration: dur, yoyo: true }], loop: -1 });
  }

  private desenhaTempo() {
    const p = Math.max(0, this.tempo / this.tempoTotal);
    this.barraTempo.clear();
    this.barraTempo.fillStyle(COR.contorno).fillRect(0, 18, L, 3);
    this.barraTempo.fillStyle(p > 0.3 ? COR.amarelo : COR.dende).fillRect(0, 18, Math.round(L * p), 2);
  }

  update(_t: number, dt: number) {
    if (!this.rodando || this.acabou) return;
    this.tempo -= dt;
    this.desenhaTempo();
    this.passo(dt);
    if (this.tempo <= 0 && !this.acabou) this.tempoEsgotado();
  }

  /** Fim do minijogo: mostra as estrelas e segue. */
  protected terminar(estrelas: number) {
    if (this.acabou) return;
    this.acabou = true;
    this.rodando = false;
    fritando(false);
    estrelas = Phaser.Math.Clamp(Math.round(estrelas), 1, 3);
    registrarEstrelas(this.id, estrelas);
    this.carinha.setFrame(`carinha_${nivelSatisfacao()}_0`);
    animBia(this.bia, estado.roupa, estrelas === 3 ? 'comemorando' : estrelas === 2 ? 'provando' : 'preocupada');

    this.time.delayedCall(500, () => {
      this.add.rectangle(0, 18, L, 302, COR.contorno, 0.45).setOrigin(0).setDepth(1000).setInteractive();
      painel(this, 20, 140, L - 40, 92).setDepth(1001);
      const frase = estrelas === 3 ? 'CAPRICHOU!' : estrelas === 2 ? 'TÁ BOM!' : 'DÁ PRA MELHORAR...';
      texto(this, L / 2, 146, frase, { fonte: 'escura' }).setDepth(1002);
      for (let i = 0; i < 3; i++) {
        const e = this.add.image(L / 2 - 26 + i * 26, 172, 'atlas', 'estrela_vazia_0').setScale(2).setDepth(1002);
        if (i < estrelas) {
          this.time.delayedCall(250 + i * 260, () => {
            e.setFrame('estrela_cheia_0');
            tocar('estrela');
            if (!reduzirMovimento()) this.tweens.add({ targets: e, scale: 3, duration: 120, yoyo: true });
          });
        }
      }
      this.time.delayedCall(250 + estrelas * 260, () => {
        botao(this, L / 2, 212, 90, 14, 'PRÓXIMO', () => this.seguir()).setDepth(1003);
      });
    });
  }

  private seguir() {
    const prox = proximaEtapa();
    this.scene.start(prox ?? 'Servir');
  }

  // ─── utilidades pros minijogos ─────────────────────────────────────────────
  /** Segundos desde que o minijogo começou. */
  protected segundos() {
    return (this.tempoTotal - this.tempo) / 1000;
  }

  protected tremer(alvo: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject) {
    if (reduzirMovimento()) return;
    const x = alvo.x;
    this.tweens.add({ targets: alvo, x: x + 2, duration: 40, yoyo: true, repeat: 2, onComplete: () => (alvo.x = x) });
  }

  /** Ângulo acumulado de um dedo girando em volta de um centro (gesto "girar em círculo"). */
  protected rastreadorGiro(cx: number, cy: number, raioMin = 6) {
    let anterior: number | null = null;
    return (ponteiro: Phaser.Input.Pointer) => {
      if (!ponteiro.isDown) { anterior = null; return 0; }
      const dx = ponteiro.x - cx, dy = ponteiro.y - cy;
      if (Math.hypot(dx, dy) < raioMin) return 0;
      const a = Math.atan2(dy, dx);
      if (anterior === null) { anterior = a; return 0; }
      let d = a - anterior;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      anterior = a;
      return Math.abs(d); // qualquer sentido vale
    };
  }
}
