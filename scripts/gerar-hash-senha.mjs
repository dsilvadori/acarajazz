// Gera o hash da senha do /admin (PBKDF2-SHA256) sem gravar a senha em lugar nenhum.
// Uso:  node scripts/gerar-hash-senha.mjs        (pede a senha no terminal)
// Saída: pbkdf2$100000$<sal>$<hash>  → colar em ADMIN_SENHA_HASH (.dev.vars) e `npx wrangler secret put ADMIN_SENHA_HASH`
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline';

const ITERACOES = 100000; // máximo aceito pelo PBKDF2 do Cloudflare Workers

async function lerSenha() {
  if (process.env.SENHA) return process.env.SENHA;
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // não mostra a senha enquanto digita
  rl._writeToOutput = (s) => rl.output.write(s.includes('\n') ? s : '*');
  return new Promise((ok) =>
    rl.question('Senha do admin: ', (r) => {
      rl.close();
      process.stdout.write('\n');
      ok(r);
    }),
  );
}

const senha = await lerSenha();
if (!senha || senha.length < 8) {
  console.error('A senha precisa ter pelo menos 8 caracteres.');
  process.exit(1);
}
const sal = crypto.getRandomValues(new Uint8Array(16));
const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: ITERACOES }, chave, 256);
const b64 = (b) => Buffer.from(b).toString('base64');
console.log(`pbkdf2$${ITERACOES}$${b64(sal)}$${b64(bits)}`);
