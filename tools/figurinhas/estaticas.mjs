// Exporta todos os quadros de cada sprite como imagens paradas do jogo, para animar em outras ferramentas (ex.: Meta AI).
// Uso:  node tools/figurinhas/estaticas.mjs
// Saída: tools/figurinhas/saida/estaticas/<animação>/<sprite>/quadro_N.png  (1024×1024, fundo branco, pixel art nítida)
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import sharp from 'sharp';

const RAIZ = new URL('../../', import.meta.url).pathname;
const SPRITES = join(RAIZ, 'public/jogo/sprites');
const SAIDA = join(RAIZ, 'tools/figurinhas/saida/estaticas');
const LADO = 1024;
const MARGEM = 64;
const ACOES = [
  'andando_costas', 'andando_lado', 'servindo_lado', 'parada', 'andando', 'mexendo', 'batendo', 'provando', 'comemorando',
  'preocupada', 'servindo', 'acenando', 'brindando', 'esperando', 'lavando', 'feliz', 'comendo', 'sentado', 'dormindo',
];

rmSync(SAIDA, { recursive: true, force: true });
const contagem = {};
for (const arquivo of readdirSync(SPRITES).filter((f) => f.endsWith('q.png')).sort()) {
  const nome = arquivo.replace(/_\d+q\.png$/, '');
  const acao = ACOES.find((a) => nome.endsWith('_' + a)) ?? 'outras';
  const total = Number(arquivo.match(/_(\d+)q\.png$/)[1]);
  const { width, height } = await sharp(join(SPRITES, arquivo)).metadata();
  const w = width / total;
  const escala = Math.floor(Math.min((LADO - 2 * MARGEM) / w, (LADO - 2 * MARGEM) / height));
  const pasta = join(SAIDA, acao, nome);
  mkdirSync(pasta, { recursive: true });
  for (let i = 0; i < total; i++) {
    const quadro = await sharp(join(SPRITES, arquivo))
      .extract({ left: i * w, top: 0, width: w, height })
      .resize(w * escala, height * escala, { kernel: 'nearest' })
      .png()
      .toBuffer();
    await sharp({ create: { width: LADO, height: LADO, channels: 3, background: '#ffffff' } })
      .composite([{ input: quadro, gravity: 'center' }])
      .png()
      .toFile(join(pasta, `quadro_${i + 1}.png`));
  }
  contagem[acao] = (contagem[acao] ?? 0) + 1;
}
execFileSync('zip', ['-qr', '../estaticas.zip', '.'], { cwd: SAIDA });
console.table(contagem);
