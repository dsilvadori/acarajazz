// Exporta cada sprite do jogo como GIF animado (512×512, fundo transparente, mesma velocidade do jogo).
// GIF aparece na galeria do celular e os apps de figurinhas importam direto como figurinha animada.
// Uso:  node tools/figurinhas/gifs.mjs
// Saída: tools/figurinhas/saida/gifs/<animação>/<sprite>.gif  + gifs.zip  (transparentes, para app de figurinhas)
//        tools/figurinhas/saida/gifs-conversa/...  + gifs-conversa.zip  (fundo branco e ≥3 s, para mandar em conversa:
//        o WhatsApp trata animação muito curta ou transparente como imagem parada)
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import sharp from 'sharp';

const RAIZ = new URL('../../', import.meta.url).pathname;
const SPRITES = join(RAIZ, 'public/jogo/sprites');
const SAIDA = join(RAIZ, 'tools/figurinhas/saida/gifs');
const SAIDA_CONVERSA = join(RAIZ, 'tools/figurinhas/saida/gifs-conversa');
const DURACAO_MIN = 3000; // ms
const LADO = 512;
const MARGEM = 16;
// Mesma velocidade do jogo (src/jogo/cenas/Carregando.ts); nomes mais longos primeiro
const FPS = {
  andando_costas: 8, andando_lado: 10, servindo_lado: 10, parada: 2, andando: 8, mexendo: 8, batendo: 10, provando: 3,
  comemorando: 8, preocupada: 4, servindo: 8, acenando: 4, brindando: 4, esperando: 2, lavando: 4, feliz: 5, comendo: 4,
  sentado: 4, dormindo: 1,
};

rmSync(SAIDA, { recursive: true, force: true });
rmSync(SAIDA_CONVERSA, { recursive: true, force: true });
let n = 0;
for (const arquivo of readdirSync(SPRITES).filter((f) => f.endsWith('q.png')).sort()) {
  const nome = arquivo.replace(/_\d+q\.png$/, '');
  const acao = Object.keys(FPS).find((a) => nome.endsWith('_' + a)) ?? 'outras';
  const total = Number(arquivo.match(/_(\d+)q\.png$/)[1]);
  const { width, height } = await sharp(join(SPRITES, arquivo)).metadata();
  const w = width / total;
  const escala = Math.floor(Math.min((LADO - 2 * MARGEM) / w, (LADO - 2 * MARGEM) / height));
  const quadros = [];
  for (let i = 0; i < total; i++) {
    const q = await sharp(join(SPRITES, arquivo))
      .extract({ left: i * w, top: 0, width: w, height })
      .resize(w * escala, height * escala, { kernel: 'nearest' })
      .png()
      .toBuffer();
    quadros.push(
      await sharp({ create: { width: LADO, height: LADO, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: q, gravity: 'center' }])
        .png()
        .toBuffer(),
    );
  }
  mkdirSync(join(SAIDA, acao), { recursive: true });
  const atraso = Math.round(1000 / (FPS[acao] ?? 8));
  await sharp(quadros, { join: { animated: true } })
    .gif({ loop: 0, delay: quadros.map(() => atraso), dither: 0, effort: 10 })
    .toFile(join(SAIDA, acao, nome + '.gif'));
  // versão para conversa: fundo branco e o ciclo repetido até passar de 3 s
  const brancos = await Promise.all(quadros.map((q) => sharp(q).flatten({ background: '#ffffff' }).png().toBuffer()));
  const vezes = Math.ceil(DURACAO_MIN / (Math.floor(atraso / 10) * 10 * total)); // GIF guarda o tempo em centésimos
  const longos = Array.from({ length: vezes }, () => brancos).flat();
  mkdirSync(join(SAIDA_CONVERSA, acao), { recursive: true });
  await sharp(longos, { join: { animated: true } })
    .gif({ loop: 0, delay: longos.map(() => atraso), dither: 0, effort: 10 })
    .toFile(join(SAIDA_CONVERSA, acao, nome + '.gif'));
  n++;
}
execFileSync('zip', ['-qr', '../gifs.zip', '.'], { cwd: SAIDA });
execFileSync('zip', ['-qr', '../gifs-conversa.zip', '.'], { cwd: SAIDA_CONVERSA });
console.log(`${n} GIFs em ${SAIDA.replace(RAIZ, '')}`);
