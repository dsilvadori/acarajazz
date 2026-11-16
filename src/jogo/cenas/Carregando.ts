import Phaser from 'phaser';
import { COR } from '../ui';

/** Velocidade (quadros por segundo) de cada animação; o que não está aqui roda a 8. */
const FPS: Record<string, number> = {
  parada: 2, andando: 8, mexendo: 8, batendo: 10, provando: 3, comemorando: 8, preocupada: 4,
  andando_lado: 10, servindo_lado: 10, andando_costas: 8, acenando: 4, brindando: 4,
  esperando: 2, feliz: 5, comendo: 4, sentado: 4, dormindo: 1, tacho: 6, fumaca: 6, respingo: 14, ligado: 16,
  carimbo: 14, confete: 8, brilho: 12, 
};
const SEM_REPETIR = new Set(['carimbo', 'respingo']);

export class Carregando extends Phaser.Scene {
  constructor() {
    super('Carregando');
  }

  preload() {
    const barra = this.add.graphics();
    const w = 120;
    this.add.rectangle(30 - 1, 159 - 1, w + 2, 8, COR.contorno).setOrigin(0);
    this.load.on('progress', (p: number) => {
      barra.clear().fillStyle(COR.dende).fillRect(30, 159, Math.round(w * p), 6);
    });
    const v = '?v=5';
    this.load.atlas('atlas', '/jogo/atlas.png' + v, '/jogo/atlas.json' + v);
    this.load.bitmapFont('clara', '/jogo/fonte_clara.png' + v, '/jogo/fonte_clara.xml' + v);
    this.load.bitmapFont('escura', '/jogo/fonte_escura.png' + v, '/jogo/fonte_escura.xml' + v);
    for (const nome of ['salao_fundo', 'salao_balcao', 'close_parede', 'close_bancada']) {
      this.load.image(nome, `/jogo/cenario/${nome}.png${v}`);
    }
    this.load.spritesheet('fitas', '/jogo/cenario/salao_fitas_4q.png' + v, { frameWidth: 180, frameHeight: 40 });
  }

  create() {
    // Uma animação por grupo de quadros do atlas: "<nome>_<n>"
    const grupos = new Map<string, string[]>();
    for (const f of this.textures.get('atlas').getFrameNames()) {
      const m = f.match(/^(.*)_(\d+)$/);
      if (!m) continue;
      const lista = grupos.get(m[1]) ?? [];
      lista[Number(m[2])] = f;
      grupos.set(m[1], lista);
    }
    for (const [nome, quadros] of grupos) {
      const tipo = Object.keys(FPS).find((k) => nome.endsWith('_' + k) || nome === k);
      this.anims.create({
        key: nome,
        frames: quadros.map((frame) => ({ key: 'atlas', frame })),
        frameRate: tipo ? FPS[tipo] : 8,
        repeat: tipo && SEM_REPETIR.has(tipo) ? 0 : -1,
      });
    }
    this.anims.create({ key: 'fitas', frames: this.anims.generateFrameNumbers('fitas', { start: 0, end: 3 }), frameRate: 3, repeat: -1 });
    this.scene.start('Titulo');
  }
}
