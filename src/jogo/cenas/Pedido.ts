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

    // Balão de pedido em cima do casal: acarajé + pimenta (foguinho ou friozinho) + camarão ou folhinha
    const bx = c.x - 2, by = c.y - 34, bw = 66;
    const g = this.add.graphics().setDepth(1200);
    g.fillStyle(0x3b1408).fillRect(bx - 1, by - 1, bw + 2, 28);
    g.fillStyle(0xffffff).fillRect(bx, by, bw, 26);
    g.fillStyle(0x3b1408).fillRect(bx + 14, by + 27, 6, 1).fillRect(bx + 15, by + 28, 4, 1).fillRect(bx + 16, by + 29, 2, 1);
    g.fillStyle(0xffffff).fillRect(bx + 15, by + 26, 4, 1).fillRect(bx + 16, by + 27, 2, 1);
    const icones = [
      this.add.image(bx + 12, by + 13, 'atlas', 'acaraje_fechado_0'),
      this.add.image(bx + 33, by + 13, 'atlas', estado.pimenta === 'forte' ? 'icone_fogo_0' : 'icone_frio_0'),
      this.add.image(bx + 53, by + 13, 'atlas', estado.vegetariano ? 'icone_veg_0' : 'icone_camarao_0'),
    ].map((i) => i.setDepth(1201));
    this.tweens.add({ targets: [g, ...icones], y: '-=1', duration: 500, yoyo: true, repeat: -1 });

    const y0 = 8;
    painel(this, 8, y0, L - 16, 80).setDepth(1300);
    texto(this, L / 2, y0 + 5, 'CHEGOU CLIENTE!', { fonte: 'escura' }).setDepth(1301);
    texto(this, L / 2, y0 + 20,
      `O CASAL QUER UM ACARAJÉ ${textoPedido()}. FIQUE DE OLHO NO PEDIDO!`,
      { fonte: 'escura', largura: 156 }).setDepth(1301);
    botao(this, L / 2, y0 + 68, 90, 14, 'BORA!', () => this.scene.start(proximaEtapa()!)).setDepth(1302);
  }
}
