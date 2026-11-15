/**
 * Login fixo do /admin: e-mail + senha (guardada só como hash PBKDF2) e sessão em cookie assinado.
 *
 * Segredos (nunca no código):
 *   ADMIN_SENHA_HASH     → gerado por `node scripts/gerar-hash-senha.mjs`
 *   ADMIN_SESSAO_SEGREDO → texto aleatório longo, usado para assinar o cookie
 */
import { env } from 'cloudflare:workers';

export const COOKIE = 'acarajazz_admin';
const DURACAO_SESSAO_S = 12 * 60 * 60; // 12 horas
const MAX_FALHAS = 5;
const JANELA_MIN = 15;

interface Segredos {
  ADMIN_EMAIL?: string;
  ADMIN_SENHA_HASH?: string;
  ADMIN_SESSAO_SEGREDO?: string;
}
const segredos = () => env as unknown as Segredos;

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64url = (buf: ArrayBuffer | Uint8Array) => b64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

/** Comparação em tempo constante (não vaza onde a diferença está) */
function iguais(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

/** Hash no formato pbkdf2$<iterações>$<sal base64>$<hash base64> */
async function confereSenha(senha: string, guardado: string) {
  const [alg, iter, sal, hash] = guardado.split('$');
  if (alg !== 'pbkdf2' || !iter || !sal || !hash) return false;
  const chave = await crypto.subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: deB64(sal), iterations: Number(iter) },
    chave,
    256,
  );
  return iguais(new Uint8Array(bits), deB64(hash));
}

async function chaveHmac() {
  const segredo = segredos().ADMIN_SESSAO_SEGREDO;
  if (!segredo || segredo.length < 32) throw new Error('ADMIN_SESSAO_SEGREDO ausente ou curto demais');
  return crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** Cria o valor do cookie de sessão: base64url(json).assinatura */
export async function criarSessao(email: string) {
  const dados = b64url(enc.encode(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + DURACAO_SESSAO_S })));
  const assinatura = await crypto.subtle.sign('HMAC', await chaveHmac(), enc.encode(dados));
  return { valor: `${dados}.${b64url(assinatura)}`, maxAge: DURACAO_SESSAO_S };
}

/** Retorna o e-mail da sessão se o cookie for válido e não tiver expirado */
export async function lerSessao(cookie: string | undefined): Promise<string | null> {
  if (!cookie) return null;
  const [dados, assinatura] = cookie.split('.');
  if (!dados || !assinatura) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await chaveHmac(), deB64(assinatura), enc.encode(dados));
    if (!ok) return null;
    const { email, exp } = JSON.parse(new TextDecoder().decode(deB64(dados))) as { email: string; exp: number };
    if (!exp || exp < Date.now() / 1000) return null;
    if (email !== segredos().ADMIN_EMAIL) return null; // e-mail mudou → sessões antigas caem
    return email;
  } catch {
    return null;
  }
}

/** Quantas falhas recentes este IP tem (para bloquear depois de MAX_FALHAS) */
export async function bloqueado(ip: string) {
  const r = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM login_tentativas WHERE ip = ?1 AND sucesso = 0 AND criado_em > datetime('now', ?2)`,
  ).bind(ip, `-${JANELA_MIN} minutes`).first<{ n: number }>();
  return (r?.n ?? 0) >= MAX_FALHAS;
}

async function registrar(ip: string, sucesso: boolean) {
  await env.DB.batch([
    env.DB.prepare('INSERT INTO login_tentativas (ip, sucesso) VALUES (?1, ?2)').bind(ip, sucesso ? 1 : 0),
    // limpeza: guarda só o último dia
    env.DB.prepare(`DELETE FROM login_tentativas WHERE criado_em < datetime('now', '-1 day')`),
  ]);
}

export type ResultadoLogin = { ok: true } | { ok: false; motivo: 'bloqueado' | 'invalido' | 'configuracao' };

export async function tentarLogin(email: string, senha: string, ip: string): Promise<ResultadoLogin> {
  const s = segredos();
  if (!s.ADMIN_EMAIL || !s.ADMIN_SENHA_HASH || !s.ADMIN_SESSAO_SEGREDO) return { ok: false, motivo: 'configuracao' };
  if (await bloqueado(ip)) return { ok: false, motivo: 'bloqueado' };

  const emailOk = email.trim().toLowerCase() === s.ADMIN_EMAIL.toLowerCase();
  // confere a senha mesmo com e-mail errado, para o tempo de resposta não revelar qual dos dois falhou
  const senhaOk = await confereSenha(senha, s.ADMIN_SENHA_HASH);
  const ok = emailOk && senhaOk;
  await registrar(ip, ok);
  return ok ? { ok: true } : { ok: false, motivo: 'invalido' };
}

export const emailAdmin = () => segredos().ADMIN_EMAIL ?? '';
