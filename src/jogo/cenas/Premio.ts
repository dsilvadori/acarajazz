import Phaser from 'phaser';
import { config, estado, ler, reduzirMovimento, type CupomInfo } from '../estado';
import { baixar, compartilhar, noInstagram, pedirCupom } from '../cupom';
import { tocar } from '../som';
import { COR, L, botao, botaoSom, painel, texto } from '../ui';

/** Bilhete de aposta de brincadeira: "chance de ganhar: 100%" e o carimbo GANHOU! */
export class Premio extends Phaser.Scene {
  constructor() {
    super('Premio');
  }

  create() {
    this.cameras.main.setBackgroundColor(COR.vinho);
    this.add.sprite(0, 0, 'fitas').setOrigin(0, 0).play('fitas');
    botaoSom(this);
    if (!reduzirMovimento()) {
      for (let i = 0; i < 6; i++) this.add.sprite(15 + i * 30, 50 + (i % 3) * 90, 'atlas').setScale(2).play('confete');
    }

    painel(this, 14, 46, L - 28, 150, COR.creme);
    const g = this.add.graphics();
    for (let x = 16; x < L - 16; x += 4) g.fillStyle(COR.dende).fillRect(x, 48, 2, 1).fillRect(x, 193, 2, 1);
    texto(this, L / 2, 54, 'BILHETE DE APOSTA', { fonte: 'escura' });
    texto(this, L / 2, 66, 'ACARABET', { fonte: 'escura', tamanho: 2 });
    const linhas = [
      ['APOSTA:', 'UM ACARAJÉ'],
      ['', 'CAPRICHADO'],
      ['CHANCE DE GANHAR:', '100%'],
      ['SORTE NECESSÁRIA:', 'ZERO'],
    ];
    linhas.forEach(([a, b], i) => {
      texto(this, 22, 96 + i * 13, a, { fonte: 'escura', esquerda: true });
      texto(this, L - 22, 96 + i * 13, b, { fonte: 'escura', origem: [1, 0] });
    });

    // carimbo
    const carimbo = this.add.container(L / 2, 168).setScale(4).setAlpha(0).setAngle(-8);
    carimbo.add(this.add.sprite(0, 0, 'atlas', 'carimbo_2'));
    carimbo.add(texto(this, 0, -6, 'GANHOU!', { tamanho: 1 }).setOrigin(0.5, 0));
    this.tweens.add({
      targets: carimbo, scale: 1, alpha: 1, delay: 500, duration: 260, ease: 'Back.Out',
      onStart: () => tocar('vitoria'),
      onComplete: () => { if (!reduzirMovimento()) this.cameras.main.shake(120, 0.01); },
    });

    texto(this, L / 2, 206, `PRÊMIO: ${config.desconto} DE DESCONTO NA SUA PRIMEIRA COMPRA, NA LOJA DO ACARAJAZZ.`, { largura: 160 });

    this.time.delayedCall(900, () => {
      const jaTem = ler<CupomInfo | null>('cupom', null);
      botao(this, L / 2, 262, 130, 18, jaTem ? 'VER MEU CUPOM' : 'PEGAR MEU CUPOM', async () => {
        const c = jaTem ?? (await pedirCupom());
        if (c) this.scene.start('Cupom', { cupom: c });
      }, 'verde');
      botao(this, L / 2, 290, 130, 14, 'JOGAR DE NOVO', () => this.scene.start('Titulo'), 'creme');
    });
  }
}

/** O cupom na tela + a imagem 1080×1920 pros Stories. */
export class Cupom extends Phaser.Scene {
  private cupom!: CupomInfo;
  private png: Blob | null = null;

  constructor() {
    super('Cupom');
  }

  init(d: { cupom: CupomInfo }) {
    this.cupom = d.cupom;
    this.png = null;
  }

  create() {
    this.cameras.main.setBackgroundColor(COR.vinho);
    this.add.sprite(0, 0, 'fitas').setOrigin(0, 0).play('fitas');
    botaoSom(this);
    const c = this.cupom;
    const validade = c.validade.split('-').reverse().join('/');

    texto(this, L / 2, 44, c.status === 'usado' ? 'SEU CUPOM' : 'SEU CUPOM TÁ AQUI!');
    this.add.image(L / 2, 98, 'atlas', 'cupom_0').setScale(2.5);
    texto(this, 108, 80, c.codigo, { fonte: 'escura', origem: [0.5, 0] });
    texto(this, 108, 95, `${config.desconto} OFF`, { fonte: 'escura', tamanho: 2, origem: [0.5, 0] });

    const status = c.status === 'usado'
      ? 'ESSE CUPOM JÁ FOI USADO. MAS JOGAR É SEMPRE DE GRAÇA!'
      : `${config.desconto} NA PRIMEIRA COMPRA, SÓ NA LOJA. VÁLIDO ATÉ ${validade}. MOSTRE O STORIES E O CÓDIGO NO BALCÃO.`;
    texto(this, L / 2, 144, status, { largura: 164 });

    this.add.sprite(26, 196, 'atlas').setOrigin(0.5, 0).play(`bia_${estado.roupa}_comemorando`);
    texto(this, 48, 204, 'VEM PROVAR O DE VERDADE NO ACARAJAZZ!', { largura: 126, esquerda: true });

    const insta = noInstagram();
    botao(this, L / 2, 262, 150, 18, 'POSTAR NOS STORIES', async () => compartilhar(await this.imagem()), 'verde');
    botao(this, L / 2, 286, 72, 14, insta ? 'VER IMAGEM' : 'BAIXAR', async () => baixar(await this.imagem()), 'creme').setX(L / 2 - 38);
    botao(this, L / 2 + 38, 286, 72, 14, 'DE NOVO', () => this.scene.start('Titulo'), 'creme');
    texto(this, L / 2, 304, '@O_ACARAJAZZ');
  }

  /** Desenha a arte dos Stories em 180×320 e amplia 6× (1080×1920) sem borrar. */
  private imagem(): Promise<Blob> {
    if (this.png) return Promise.resolve(this.png);
    const rt = this.add.renderTexture(0, 0, L, 320).setVisible(false);
    rt.fill(COR.vinho);
    rt.fill(COR.dende, 1, 0, 200, L, 120);
    rt.draw(this.make.sprite({ key: 'fitas', frame: 0 }, false).setOrigin(0, 0), 0, 0);
    const txt = (y: number, s: string, tamanho: 1 | 2 | 3, fonte: 'clara' | 'escura' = 'clara') => {
      const t = this.make.bitmapText({ font: fonte, text: s, size: 11 * tamanho }, false).setOrigin(0.5, 0);
      rt.draw(t, L / 2, y);
      t.destroy();
    };
    txt(44, 'APOSTEI NO', 2);
    txt(68, 'ACARAJÉ', 3);
    txt(104, 'E GANHEI!', 2);
    rt.draw(this.make.image({ key: 'atlas', frame: `bia_${estado.roupa}_comemorando_1` }, false).setScale(2).setOrigin(0.5, 0), 62, 128);
    rt.draw(this.make.image({ key: 'atlas', frame: 'embrulho_0' }, false).setScale(3).setOrigin(0.5), 128, 186);
    const g = this.make.graphics({}, false);
    g.fillStyle(COR.contorno).fillRect(19, 229, 142, 50);
    g.fillStyle(COR.creme).fillRect(20, 230, 140, 48);
    rt.draw(g);
    g.destroy();
    txt(235, `CUPOM ${config.desconto} OFF`, 1, 'escura');
    txt(250, this.cupom.codigo, 2, 'escura');
    txt(284, '@O_ACARAJAZZ', 1);
    txt(296, 'VÁLIDO NA LOJA · VILA MARIANA', 1);
    txt(307, 'RUA DONA INÁCIA UCHÔA, 89', 1);

    return new Promise((resolve) => {
      rt.snapshot((img) => {
        const cv = document.createElement('canvas');
        cv.width = 1080;
        cv.height = 1920;
        const ctx = cv.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img as HTMLImageElement, 0, 0, 1080, 1920);
        rt.destroy();
        cv.toBlob((b) => {
          this.png = b!;
          resolve(b!);
        }, 'image/png');
      });
    });
  }
}
