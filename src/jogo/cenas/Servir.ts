import Phaser from 'phaser';
import salao from '../../data/acarabet/salao.json';
import {
  ETAPAS,
  estado, nivelSatisfacao, numeroEtapa, prepararRefazer, proximaEtapa, registrarEstrelas, satisfeito, totalEstrelas, medir, MAX_ESTRELAS,
} from '../estado';
import { montaSalao } from '../salao';
import { tocar } from '../som';
import { COR, L, animBia, botao, botaoSom, faixa, painel, texto } from '../ui';

const QUENTINHO_MS = 10000;

/** Etapa 10: a Bia leva o acarajé até a mesa do casal; o casal prova e reage. */
export class Servir extends Phaser.Scene {
  private calor = 1;
  private rodando = false;
  private barra!: Phaser.GameObjects.Graphics;

  constructor() {
    super('Servir');
  }

  create() {
    this.calor = 1;
    this.rodando = false;
    const s = montaSalao(this, { easterEggs: false });
    animBia(s.bia, estado.roupa, 'parada');
    faixa(this, 0, 0, 18).setDepth(1100);
    texto(this, 4, 4, `${numeroEtapa('servir')}/${ETAPAS.length} SERVIR`, { esquerda: true }).setDepth(1101);
    this.add.image(L - 26, 9, 'atlas', `carinha_${nivelSatisfacao()}_0`).setDepth(1101);
    botaoSom(this);

    const c = salao.posicoes.casal;
    this.barra = this.add.graphics().setDepth(1200);
    const alvo = this.add.zone(c.x + 32, c.y + 24, 70, 56).setInteractive({ useHandCursor: true });

    // instrução
    const fundo = this.add.rectangle(0, 18, L, 302, COR.contorno, 0.5).setOrigin(0).setDepth(1300).setInteractive();
    const p = painel(this, 10, 120, L - 20, 56).setDepth(1301);
    const t = texto(this, L / 2, 126, 'O ACARAJÉ TÁ PRONTO! TOQUE NA MESA DO CASAL PRA BIA LEVAR ENQUANTO TÁ QUENTINHO.', { fonte: 'escura', largura: 150 }).setDepth(1302);
    const toque = texto(this, L / 2, 300, 'TOQUE PRA COMEÇAR').setDepth(1302);
    fundo.once('pointerup', () => {
      [fundo, p, t, toque].forEach((o) => o.destroy());
      this.rodando = true;
    });

    let servido = false;
    alvo.on('pointerup', async () => {
      if (!this.rodando || servido) return;
      servido = true;
      this.rodando = false;
      const estrelas = this.calor > 0.6 ? 3 : this.calor > 0.3 ? 2 : 1;
      await s.andar(salao.posicoes.rotas.servir_mesa_frente, true);
      this.barra.clear();
      registrarEstrelas('servir', estrelas);
      this.reacao(s);
    });
  }

  update(_t: number, dt: number) {
    if (!this.rodando) return;
    this.calor = Math.max(0, this.calor - dt / QUENTINHO_MS);
    const c = salao.posicoes.casal;
    const g = this.barra.clear();
    g.fillStyle(COR.contorno).fillRect(c.x + 8, c.y - 9, 48, 5);
    g.fillStyle(this.calor > 0.3 ? COR.dende : 0x8e99a5).fillRect(c.x + 9, c.y - 8, Math.round(46 * this.calor), 3);
  }

  private reacao(s: ReturnType<typeof montaSalao>) {
    const total = totalEstrelas();
    if (satisfeito()) {
      s.casal.play(`cliente_casal_${estado.casal}_feliz`);
      animBia(s.bia, estado.roupa, 'comemorando');
      s.festa(6000); // o salão inteiro comemora: tchauzinho e brinde dos tios
      tocar('vitoria');
      this.time.delayedCall(1500, () => s.casal.play(`cliente_casal_${estado.casal}_comendo`));
      for (let i = 0; i < 4; i++) this.add.sprite(20 + i * 46, 60 + (i % 2) * 30, 'atlas').setScale(2).setDepth(1250).play('confete');
      this.time.delayedCall(900, () => {
        // no alto do salão, pra festa (tchauzinho e brinde) ficar à vista
        painel(this, 12, 24, L - 24, 78).setDepth(1301);
        texto(this, L / 2, 30, 'O CASAL AMOU!', { fonte: 'escura', tamanho: 2 }).setDepth(1302);
        texto(this, L / 2, 58, `${total} DE ${MAX_ESTRELAS} ESTRELAS`, { fonte: 'escura' }).setDepth(1302);
        botao(this, L / 2, 86, 120, 16, 'VER MEU PRÊMIO', () => {
          medir('jogo_concluido', { estrelas: total, rodadas: estado.rodada + 1, segundos: Math.round((Date.now() - estado.inicio) / 1000) });
          this.scene.start('Premio');
        }, 'verde').setDepth(1303);
      });
    } else {
      s.casal.play(`cliente_casal_${estado.casal}_comendo`);
      animBia(s.bia, estado.roupa, 'preocupada');
      this.time.delayedCall(900, () => {
        // no alto do salão e com a altura do texto (o botão não cobre a última linha)
        texto(this, L / 2, 30, 'QUASE!', { fonte: 'escura', tamanho: 2 }).setDepth(1302);
        const t = texto(this, L / 2, 54, 'O CASAL QUERIA MAIS CAPRICHO. BORA REFAZER AS ETAPAS MAIS FRACAS? AQUI NINGUÉM SAI SEM PRÊMIO!', { fonte: 'escura', largura: 150 }).setDepth(1302);
        const yBotao = 54 + Math.ceil(t.height) + 14;
        painel(this, 12, 24, L - 24, yBotao - 24 + 14).setDepth(1301);
        botao(this, L / 2, yBotao, 100, 16, 'REFAZER', () => {
          prepararRefazer();
          this.scene.start(proximaEtapa()!);
        }).setDepth(1303);
      });
    }
  }
}
