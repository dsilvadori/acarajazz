/**
 * Verificação do token do Cloudflare Access (cabeçalho Cf-Access-Jwt-Assertion).
 * O Access já bloqueia quem não está autorizado antes de chegar ao Worker; esta checagem
 * garante que ninguém acesse o /admin por outro caminho (ex.: URL *.workers.dev).
 * https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */

interface Jwk extends JsonWebKey {
  kid: string;
}

let chavesEmCache: { equipe: string; chaves: Jwk[]; buscadoEm: number } | null = null;

async function chavesPublicas(equipe: string): Promise<Jwk[]> {
  const agora = Date.now();
  if (chavesEmCache && chavesEmCache.equipe === equipe && agora - chavesEmCache.buscadoEm < 60 * 60 * 1000) {
    return chavesEmCache.chaves;
  }
  const r = await fetch(`https://${equipe}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`Falha ao buscar chaves do Access: ${r.status}`);
  const { keys } = (await r.json()) as { keys: Jwk[] };
  chavesEmCache = { equipe, chaves: keys, buscadoEm: agora };
  return keys;
}

const b64url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};
const json = (s: string) => JSON.parse(new TextDecoder().decode(b64url(s)));

/** Retorna o e-mail do usuário autenticado, ou null se o token for inválido. */
export async function verificarAccess(token: string | null, equipe: string, aud: string): Promise<string | null> {
  if (!token || !equipe || !aud) return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  const [h, p, assinatura] = partes;

  try {
    const cabecalho = json(h) as { kid?: string; alg?: string };
    if (cabecalho.alg !== 'RS256' || !cabecalho.kid) return null;

    const jwk = (await chavesPublicas(equipe)).find((k) => k.kid === cabecalho.kid);
    if (!jwk) return null;

    const chave = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valido = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chave, b64url(assinatura), new TextEncoder().encode(`${h}.${p}`));
    if (!valido) return null;

    const dados = json(p) as { aud?: string | string[]; exp?: number; iss?: string; email?: string };
    const auds = Array.isArray(dados.aud) ? dados.aud : [dados.aud];
    if (!auds.includes(aud)) return null;
    if (!dados.exp || dados.exp * 1000 < Date.now()) return null;
    if (dados.iss !== `https://${equipe}`) return null;
    return dados.email ?? null;
  } catch (e) {
    console.error('Token do Access inválido', e);
    return null;
  }
}
