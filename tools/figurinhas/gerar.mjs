// Gera figurinhas animadas para WhatsApp a partir dos sprites do jogo (public/jogo/sprites).
// Uso:  node tools/figurinhas/gerar.mjs
// Saída: tools/figurinhas/saida/<pacote>/NN_<sprite>.webp  (512×512, WebP animado, fundo transparente)
//        + bandeja.png (96×96, ícone do pacote) e um .wastickers por pacote (pronto para o app de figurinhas).
// Regras do WhatsApp: 3 a 30 figurinhas por pacote, até 500 KB cada, até 10 s de animação.
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import sharp from 'sharp';

const RAIZ = new URL('../../', import.meta.url).pathname;
const SPRITES = join(RAIZ, 'public/jogo/sprites');
const SAIDA = join(RAIZ, 'tools/figurinhas/saida');
const LADO = 512;
const MARGEM = 16; // o WhatsApp recomenda uma folga de 16 px em volta do desenho

// Mesma velocidade do jogo (src/jogo/cenas/Carregando.ts)
const FPS = {
  parada: 2, andando: 8, mexendo: 8, batendo: 10, provando: 3, comemorando: 8, preocupada: 4,
  andando_lado: 10, servindo_lado: 10, servindo: 8, andando_costas: 8, acenando: 4, brindando: 4,
  esperando: 2, lavando: 4, feliz: 5, comendo: 4, sentado: 4, dormindo: 1,
};

const PACOTES = [
  { nome: 'bia-baiana', titulo: 'Bia de baiana', filtro: (n) => n.startsWith('bia_baiana_') },
  { nome: 'bia-dolma', titulo: 'Bia de dólmã', filtro: (n) => n.startsWith('bia_dolma_') },
  { nome: 'bia-preta', titulo: 'Bia de preto', filtro: (n) => n.startsWith('bia_preta_') },
  { nome: 'turma', titulo: 'A turma', filtro: (n) => n.startsWith('npc_') || n.startsWith('gato_') },
  { nome: 'clientes', titulo: 'Clientes', filtro: (n) => n.startsWith('cliente_') },
];

async function quadros(arquivo) {
  const [, n] = arquivo.match(/_(\d+)q\.png$/);
  const total = Number(n);
  const { width, height } = await sharp(arquivo).metadata();
  const w = width / total;
  // escala inteira (pixel art nítida) que caiba no quadrado com margem
  const escala = Math.floor(Math.min((LADO - 2 * MARGEM) / w, (LADO - 2 * MARGEM) / height));
  const lista = [];
  for (let i = 0; i < total; i++) {
    const q = await sharp(arquivo)
      .extract({ left: i * w, top: 0, width: w, height })
      .resize(w * escala, height * escala, { kernel: 'nearest' })
      .png()
      .toBuffer();
    lista.push(
      await sharp({ create: { width: LADO, height: LADO, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: q, gravity: 'center' }])
        .png()
        .toBuffer(),
    );
  }
  return lista;
}

function fpsDe(nome) {
  const acao = Object.keys(FPS)
    .sort((a, b) => b.length - a.length)
    .find((k) => nome.includes('_' + k + '_'));
  return acao ? FPS[acao] : 8;
}

rmSync(SAIDA, { recursive: true, force: true });
const todos = readdirSync(SPRITES).filter((f) => f.endsWith('q.png')).sort();
const usados = new Set();

for (const pacote of PACOTES) {
  const nomes = todos.filter(pacote.filtro);
  nomes.forEach((n) => usados.add(n));
  // divide em partes de até 30
  for (let p = 0; p * 30 < nomes.length; p++) {
    const parte = nomes.slice(p * 30, p * 30 + 30);
    const pasta = join(SAIDA, nomes.length > 30 ? `${pacote.nome}-${p + 1}` : pacote.nome);
    mkdirSync(pasta, { recursive: true });
    for (const [i, nome] of parte.entries()) {
      const qs = await quadros(join(SPRITES, nome));
      const atraso = Math.round(1000 / fpsDe(nome));
      const destino = join(pasta, `${String(i + 1).padStart(2, '0')}_${nome.replace(/_\d+q\.png$/, '')}.webp`);
      await sharp(qs, { join: { animated: true } })
        .webp({ lossless: true, effort: 6, loop: 0, delay: qs.map(() => atraso) })
        .toFile(destino);
      const kb = statSync(destino).size / 1024;
      if (kb > 500) console.warn(`⚠ ${destino} tem ${kb.toFixed(0)} KB (limite 500)`);
      if (i === 0) {
        // ícone da bandeja: primeiro quadro da primeira figurinha
        await sharp(qs[0]).resize(96, 96, { kernel: 'nearest' }).png().toFile(join(pasta, 'bandeja.png'));
      }
    }
    // .wastickers = zip sem pastas com title.txt, author.txt, ícone e figurinhas (abre em apps como o Sticker Maker)
    const titulo = `Acarajazz · ${pacote.titulo}${nomes.length > 30 ? ` ${p + 1}` : ''}`;
    writeFileSync(join(pasta, 'title.txt'), titulo);
    writeFileSync(join(pasta, 'author.txt'), 'Acarajazz');
    execFileSync('zip', ['-qj', `${pasta}.wastickers`, ...readdirSync(pasta).map((f) => join(pasta, f))]);
    console.log(`${pasta.replace(RAIZ, '')}: ${parte.length} figurinhas`);
  }
}

const sobra = todos.filter((n) => !usados.has(n));
if (sobra.length) console.warn('Sprites fora de qualquer pacote:', sobra.join(', '));
