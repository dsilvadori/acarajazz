import Phaser from 'phaser';
import salao from '../../data/acarabet/salao.json';
import { estado, proximaEtapa, textoPedido } from '../estado';
import { montaSalao } from '../salao';
import { L, botao, botaoSom, painel, texto } from '../ui';

/** O casal faz o pedido num balão: acarajé tradicional (com camarão) ou vegetariano, com pimenta ou pouca pimenta. */
export class Pedido extends Phaser.Scene {
  constructor() {
    super('Pedido');
  }

  create() {
    montaSalao(this);
    botaoSom(this);
    const c = salao.posicoes.casal;

    // Balão de pedido centralizado em cima do casal: acarajé + pimenta (foguinho/friozinho) + camarão ou shimeji
    const larguras = [32, 16, 16], espaco = 6, margem = 6, bh = 30;
    const bw = larguras.reduce((a, b) => a + b, 0) + espaco * (larguras.length - 1) + margem * 2;
    const meio = c.x + 32; // o sprite do casal tem 64 px
    const bx = Math.round(meio - bw / 2), by = c.y - bh - 8;
    const g = this.add.graphics().setDepth(1200);
    g.fillStyle(0x3b1408).fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    g.fillStyle(0xffffff).fillRect(bx, by, bw, bh);
    // biquinho do balão, no meio
    const pb = Math.round(meio) - 3;
    g.fillStyle(0x3b1408).fillRect(pb, by + bh + 1, 6, 1).fillRect(pb + 1, by + bh + 2, 4, 1).fillRect(pb + 2, by + bh + 3, 2, 1);
    g.fillStyle(0xffffff).fillRect(pb + 1, by + bh, 4, 1).fillRect(pb + 2, by + bh + 1, 2, 1);
    const frames = [
      'acaraje_fechado_0',
      estado.pimenta === 'forte' ? 'icone_fogo_0' : 'icone_frio_0',
      estado.vegetariano ? 'icone_shimeji_0' : 'icone_camarao_0',
    ];
    let x = bx + margem;
    const icones = frames.map((f, i) => {
      const img = this.add.image(x + larguras[i] / 2, by + bh / 2, 'atlas', f).setDepth(1201);
      x += larguras[i] + espaco;
      return img;
    });
    this.tweens.add({ targets: [g, ...icones], y: '-=1', duration: 500, yoyo: true, repeat: -1 });

    // Painel: a altura acompanha o texto (o vegetariano com pouca pimenta ocupa uma linha a mais)
    const y0 = 8;
    const fundo = painel(this, 8, y0, L - 16, 10).setDepth(1300);
    texto(this, L / 2, y0 + 5, 'CHEGOU CLIENTE!', { fonte: 'escura' }).setDepth(1301);
    const t = texto(this, L / 2, y0 + 20, `O CASAL QUER UM ACARAJÉ ${textoPedido()}. FIQUE DE OLHO NO PEDIDO!`,
      { fonte: 'escura', largura: 156 }).setDepth(1301);
    const yBotao = y0 + 20 + Math.ceil(t.height) + 12;
    fundo.destroy();
    painel(this, 8, y0, L - 16, yBotao - y0 + 14).setDepth(1300);
    botao(this, L / 2, yBotao, 90, 14, 'BORA!', () => this.scene.start(proximaEtapa()!)).setDepth(1302);
  }
}
