// Gera as imagens de compartilhamento (Open Graph) em public/og/*.jpg a partir de tools/og/miniaturas.html.
// Uso: node tools/og/gerar.mjs   (precisa do Google Chrome instalado)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '../..');
const modelo = pathToFileURL(join(aqui, 'miniaturas.html')).href;
const CARDS = ['home', 'privacidade', 'curso', 'acarabet'];
const porta = 9341;
const perfil = mkdtempSync(join(tmpdir(), 'og-'));
const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

let alvo;
for (let i = 0; i < 50 && !alvo; i++) {
  await espera(200);
  try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); } };
const cmd = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });

await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
for (const card of CARDS) {
  await cmd('Page.navigate', { url: `${modelo}?${card}#${card}` });
  await espera(2500); // fontes e imagens
  const r = await cmd('Page.captureScreenshot', { format: 'jpeg', quality: 84 });
  writeFileSync(join(raiz, 'public/og', `${card}.jpg`), Buffer.from(r.data, 'base64'));
  console.log('ok', card);
}
ws.close();
chrome.kill();
await espera(500);
try { rmSync(perfil, { recursive: true, force: true }); } catch { /* o Chrome ainda solta arquivos */ }
