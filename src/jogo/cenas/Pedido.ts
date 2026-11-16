import Phaser from 'phaser';
import salao from '../../data/acarabet/salao.json';
import { estado, proximaEtapa } from '../estado';
import { montaSalao } from '../salao';
import { L, botao, botaoSom, painel, texto } from '../ui';

/** O casal faz o pedido num balão: um acarajé, com ou sem pimenta. */
export class Pedido extends Phaser.Scene {
  constructor() {
    super('Pedido');
  }

  create() {
    montaSalao(this);
    botaoSom(this);
    const c = salao.posicoes.casal;

    // Balão de pedido em cima do casal
    const bx = c.x + 8, by = c.y - 34;
    const g = this.add.graphics().setDepth(1200);
    g.fillStyle(0x3b1408).fillRect(bx - 1, by - 1, 50, 28);
    g.fillStyle(0xffffff).fillRect(bx, by, 48, 26);
    g.fillStyle(0x3b1408).fillRect(bx + 14, by + 27, 6, 1).fillRect(bx + 15, by + 28, 4, 1).fillRect(bx + 16, by + 29, 2, 1);
    g.fillStyle(0xffffff).fillRect(bx + 15, by + 26, 4, 1).fillRect(bx + 16, by + 27, 2, 1);
    this.add.image(bx + 13, by + 13, 'atlas', 'acaraje_fechado_0').setDepth(1201).setScale(1);
    this.add.image(bx + 37, by + 13, 'atlas', estado.comPimenta ? 'pimenta_sim_0' : 'pimenta_nao_0').setDepth(1201);
    this.tweens.add({ targets: g, y: -1, duration: 500, yoyo: true, repeat: -1 });

    const y0 = 8;
    painel(this, 8, y0, L - 16, 74).setDepth(1300);
    texto(this, L / 2, y0 + 5, 'CHEGOU CLIENTE!', { fonte: 'escura' }).setDepth(1301);
    texto(this, L / 2, y0 + 20,
      `O CASAL QUER UM ACARAJÉ ${estado.comPimenta ? 'COM' : 'SEM'} PIMENTA. A BIA VAI FAZER DO ZERO: DO FEIJÃO ATÉ A MESA!`,
      { fonte: 'escura', largura: 156 }).setDepth(1301);
    botao(this, L / 2, y0 + 64, 90, 14, 'BORA!', () => this.scene.start(proximaEtapa()!)).setDepth(1302);
  }
}
