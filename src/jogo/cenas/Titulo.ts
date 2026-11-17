import Phaser from 'phaser';
import { ROUPAS, estado, gravar, ler, medir, novaPartida, type Roupa } from '../estado';
import { montaSalao } from '../salao';
import { destravarAudio } from '../som';
import { COR, L, animBia, botao, botaoSom, faixa, painel, texto } from '../ui';

export class Titulo extends Phaser.Scene {
  constructor() {
    super('Titulo');
  }

  create() {
    estado.roupa = ler<Roupa>('roupa', 'baiana');
    const { bia, semEspiao } = montaSalao(this, { espiao: true });
    this.input.once('pointerdown', destravarAudio);

    // Nome do jogo
    faixa(this, 0, 80, 0.8).setDepth(1100);
    texto(this, L / 2, 6, 'ACARABET', { tamanho: 3 }).setDepth(1101);
    texto(this, L / 2, 40, 'A APOSTA EM QUE TODO MUNDO GANHA', { largura: 120 }).setDepth(1101);
    texto(this, L / 2, 66, '100% GRÁTIS · SEM APOSTA', { fonte: 'clara' }).setDepth(1101).setTint(0xffc03f);
    botaoSom(this);

    // Painel de baixo: roupa + jogar
    const y0 = 218;
    painel(this, 3, y0, L - 6, 96).setDepth(1100);
    texto(this, L / 2, y0 + 4, 'ESCOLHA A ROUPA DA BIA', { fonte: 'escura' }).setDepth(1101);
    const molduras: Phaser.GameObjects.Graphics[] = [];
    ROUPAS.forEach((r, i) => {
      const x = 32 + i * 58;
      const m = this.add.graphics().setDepth(1101);
      molduras.push(m);
      const s = this.add.sprite(x, y0 + 16, 'atlas').setOrigin(0.5, 0).setDepth(1102).play(`bia_${r.id}_parada`);
      s.setCrop(0, 0, 32, 38); // da cintura pra cima, cabe no painel
      texto(this, x, y0 + 55, r.nome, { fonte: 'escura' }).setDepth(1102);
      s.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-6, 0, 44, 50), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
      s.on('pointerup', () => {
        semEspiao(); // escolheu a roupa: não aparece mais nessa tela
        estado.roupa = r.id;
        gravar('roupa', r.id);
        animBia(bia, r.id, 'parada');
        destaca();
      });
    });
    const destaca = () => ROUPAS.forEach((r, i) => {
      const m = molduras[i];
      m.clear();
      const x = 32 + i * 58;
      if (r.id === estado.roupa) {
        m.fillStyle(COR.dende).fillRect(x - 22, y0 + 13, 44, 54);
        m.fillStyle(COR.amarelo).fillRect(x - 21, y0 + 14, 42, 52);
      }
    });
    destaca();

    botao(this, L / 2, y0 + 80, 100, 16, 'JOGAR', () => {
      destravarAudio();
      novaPartida();
      medir('jogo_iniciado', { roupa: estado.roupa });
      this.scene.start('Pedido');
    }).setDepth(1103);

  }
}
