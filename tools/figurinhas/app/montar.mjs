// Monta os arquivos do app de figurinhas do Acarajazz (Android), em cima do app de exemplo oficial do WhatsApp
// (github.com/WhatsApp/stickers). Quem compila é o GitHub Actions: .github/workflows/figurinhas.yml.
//
// Uso:  node tools/figurinhas/gerar.mjs && node tools/figurinhas/app/montar.mjs <pasta-de-saida>
// Saída: <pasta>/assets/contents.json + <pasta>/assets/<pacote>/*.webp  (vão para app/src/main/assets)
//        <pasta>/res/mipmap-*/ic_launcher*.png                          (ícone do app)
// Antes de gravar, confere as mesmas regras que o app do WhatsApp confere (StickerPackValidator.java).
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const RAIZ = new URL('../../../', import.meta.url).pathname;
const PACOTES = join(RAIZ, 'tools/figurinhas/saida');
const SPRITES = join(RAIZ, 'public/jogo/sprites');
const destino = process.argv[2];
if (!destino) {
  console.error('Uso: node tools/figurinhas/app/montar.mjs <pasta-de-saida>');
  process.exit(1);
}

// Ordem em que os pacotes aparecem no app
const ORDEM = ['bia-baiana', 'bia-dolma', 'bia-preta', 'turma', 'clientes-1', 'clientes-2'];

// Emojis (1 a 3) e descrição de cada animação: é por eles que o WhatsApp sugere a figurinha
const ACOES = {
  andando_costas: [['🚶', '👋'], 'indo embora'],
  andando_lado: [['🚶', '💨'], 'andando de lado'],
  servindo_lado: [['🍽️', '🏃'], 'levando um prato'],
  andando: [['🚶', '😊'], 'andando'],
  batendo: [['💪', '🥣'], 'batendo a massa do acarajé'],
  comemorando: [['🎉', '🥳', '🙌'], 'comemorando de braços para cima'],
  mexendo: [['🍲', '🥄'], 'mexendo a panela'],
  parada: [['🙂', '👀'], 'parada, esperando'],
  preocupada: [['😟', '😬'], 'preocupada'],
  provando: [['😋', '🥄'], 'provando a comida'],
  servindo: [['🍽️', '😋'], 'servindo um prato'],
  acenando: [['👋', '😊'], 'acenando'],
  brindando: [['🥂', '🍻', '🎉'], 'brindando'],
  esperando: [['⏳', '🙄'], 'esperando o pedido'],
  lavando: [['🧽', '🍽️'], 'lavando a louça'],
  feliz: [['😍', '😄'], 'felizes com a comida'],
  comendo: [['😋', '🍽️'], 'comendo'],
  sentado: [['🐱', '😺'], 'sentado'],
  dormindo: [['😴', '💤', '🐱'], 'dormindo'],
};
const ACOES_ORDEM = Object.keys(ACOES).sort((a, b) => b.length - a.length);

const GENTE = {
  bia_baiana: 'Bia vestida de baiana', bia_dolma: 'Bia de dólmã', bia_preta: 'Bia de roupa preta',
  npc_eliana: 'Eliana', npc_gemea_mae: 'Gêmea, a mãe', npc_gemea_tia: 'Gêmea, a tia', npc_tios_mesa: 'Os tios na mesa',
  npc_valentina: 'Valentina', npc_vic: 'Vic', gato: 'O gato da casa',
};

function descrever(arquivo) {
  const nome = arquivo.replace(/^\d+_/, '').replace(/\.webp$/, '');
  const acao = ACOES_ORDEM.find((a) => nome.endsWith('_' + a));
  if (!acao) throw new Error(`Animação desconhecida em ${arquivo}: inclua em ACOES`);
  const quem = nome.slice(0, -(acao.length + 1));
  const pessoa = GENTE[quem] ?? (quem.startsWith('cliente_casal_') ? 'Casal de clientes' : quem);
  const [emojis, texto] = ACOES[acao];
  return { emojis, accessibility_text: `${pessoa} ${texto}, em pixel art do jogo do Acarajazz` };
}

const erros = [];
const confere = (ok, msg) => ok || erros.push(msg);

rmSync(destino, { recursive: true, force: true });
const contents = { android_play_store_link: '', ios_app_store_link: '', sticker_packs: [] };

for (const pasta of ORDEM) {
  const origem = join(PACOTES, pasta);
  const identificador = 'acarajazz_' + pasta.replace(/-/g, '_');
  const figurinhas = readdirSync(origem).filter((f) => f.endsWith('.webp')).sort();
  const titulo = readFileSync(join(origem, 'title.txt'), 'utf8').trim();
  confere(figurinhas.length >= 3 && figurinhas.length <= 30, `${pasta}: ${figurinhas.length} figurinhas (precisa de 3 a 30)`);

  const saida = join(destino, 'assets', identificador);
  mkdirSync(saida, { recursive: true });
  const hash = createHash('sha1');
  const stickers = [];
  for (const f of figurinhas) {
    const caminho = join(origem, f);
    const m = await sharp(caminho, { animated: true }).metadata();
    const kb = statSync(caminho).size / 1024;
    const total = (m.delay ?? []).reduce((a, b) => a + b, 0);
    confere(m.width === 512 && m.pageHeight === 512, `${f}: precisa ter 512×512`);
    confere(kb <= 500, `${f}: ${kb.toFixed(0)} KB (máximo 500)`);
    confere((m.pages ?? 1) > 1, `${f}: precisa ter mais de 1 quadro`);
    confere((m.delay ?? []).every((d) => d >= 8), `${f}: quadro com menos de 8 ms`);
    confere(total <= 10000, `${f}: ${total} ms de animação (máximo 10 s)`);
    copyFileSync(caminho, join(saida, f));
    hash.update(readFileSync(caminho));
    stickers.push({ image_file: f, ...descrever(f) });
  }
  const bandeja = join(origem, 'bandeja.png');
  const mb = await sharp(bandeja).metadata();
  confere(statSync(bandeja).size <= 50 * 1024 && mb.width >= 24 && mb.width <= 512, `${pasta}: ícone fora do padrão`);
  copyFileSync(bandeja, join(saida, 'bandeja.png'));

  contents.sticker_packs.push({
    identifier: identificador,
    name: titulo,
    publisher: 'Acarajazz',
    tray_image_file: 'bandeja.png',
    // muda quando as figurinhas mudam, para o WhatsApp atualizar o pacote já instalado
    image_data_version: hash.digest('hex').slice(0, 12),
    avoid_cache: false,
    publisher_email: '',
    publisher_website: 'https://oacarajazz.com',
    privacy_policy_website: '',
    license_agreement_website: '',
    animated_sticker_pack: true,
    stickers,
  });
}

if (erros.length) {
  console.error('Figurinhas fora das regras do WhatsApp:\n- ' + erros.join('\n- '));
  process.exit(1);
}
writeFileSync(join(destino, 'assets', 'contents.json'), JSON.stringify(contents, null, 2));

// Ícone do app: Bia de baiana comemorando sobre o laranja do site, nos tamanhos do Android
const [, n] = 'bia_baiana_comemorando_4q.png'.match(/_(\d+)q\.png$/);
const sheet = join(SPRITES, 'bia_baiana_comemorando_4q.png');
const { width, height } = await sharp(sheet).metadata();
const w = width / Number(n);
const TAMANHOS = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [densidade, lado] of Object.entries(TAMANHOS)) {
  const escala = Math.max(1, Math.floor((lado * 0.8) / height));
  const bia = await sharp(sheet)
    .extract({ left: 0, top: 0, width: w, height })
    .resize(w * escala, height * escala, { kernel: 'nearest' })
    .png()
    .toBuffer();
  const pasta = join(destino, 'res', `mipmap-${densidade}`);
  mkdirSync(pasta, { recursive: true });
  const fundo = (raio) =>
    Buffer.from(`<svg width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${raio}" fill="#ff9a2e"/></svg>`);
  for (const [nome, raio] of [['ic_launcher.png', lado * 0.18], ['ic_launcher_round.png', lado / 2]]) {
    await sharp(fundo(raio)).composite([{ input: bia, gravity: 'center' }]).png().toFile(join(pasta, nome));
  }
}

const total = contents.sticker_packs.reduce((a, p) => a + p.stickers.length, 0);
console.log(`${contents.sticker_packs.length} pacotes, ${total} figurinhas, conferidas e montadas em ${destino}`);
