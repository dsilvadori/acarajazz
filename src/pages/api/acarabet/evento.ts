import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EVENTOS_JOGO } from '../../../lib/acarabet';

/** Medição do jogo (navigator.sendBeacon). Só aceita os eventos da lista e guarda um JSON curtinho. */
export const POST: APIRoute = async ({ request }) => {
  const bruto = (await request.text()).slice(0, 600);
  try {
    const { nome, dados } = JSON.parse(bruto) as { nome?: string; dados?: unknown };
    if (!nome || !EVENTOS_JOGO.has(nome)) return new Response(null, { status: 204 });
    const json = dados ? JSON.stringify(dados).slice(0, 300) : null;
    await env.DB.prepare(`INSERT INTO jogo_eventos (nome, dados) VALUES (?1, ?2)`).bind(nome, json).run();
  } catch {
    /* ignora lixo */
  }
  return new Response(null, { status: 204 });
};
