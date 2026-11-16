import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { cupomPorWhatsapp, novoCodigo, validade } from '../../../lib/acarabet';
import { formulariosAbertos, normalizarWhatsapp, respostaFormularioFechado, verificarTurnstile } from '../../../lib/leads';

const LIMITE_POR_HORA = 10;

/** Libera o cupom do Acarabet: 1 por WhatsApp. Quem já tem recebe o MESMO cupom de antes. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!formulariosAbertos()) return respostaFormularioFechado();
  const erro = (erros: Record<string, string>, status = 400) => Response.json({ ok: false, erros }, { status });

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return erro({ geral: 'Pedido inválido.' });
  }
  const txt = (k: string) => String(corpo[k] ?? '').trim();
  if (txt('site')) return Response.json({ ok: true }); // armadilha para robôs

  const ip = clientAddress ?? 'desconhecido';
  const { n } = (await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM cupom_tentativas WHERE ip = ?1 AND criado_em > datetime('now', '-1 hour')`,
  ).bind(ip).first<{ n: number }>())!;
  if (n >= LIMITE_POR_HORA) return erro({ geral: 'Muitos pedidos daqui. Espere um pouquinho e tente de novo.' }, 429);
  await env.DB.prepare(`INSERT INTO cupom_tentativas (ip) VALUES (?1)`).bind(ip).run();

  const nome = txt('nome').slice(0, 80);
  const whatsapp = normalizarWhatsapp(txt('whatsapp'));
  const erros: Record<string, string> = {};
  if (nome.length < 2) erros.nome = 'Conta pra gente seu nome.';
  if (!whatsapp) erros.whatsapp = 'Informe um WhatsApp com DDD.';
  if (corpo.aceite !== true) erros.aceite = 'Para liberar o cupom, aceite o regulamento.';
  if (Object.keys(erros).length) return erro(erros);

  const humano = await verificarTurnstile(txt('turnstile') || null, clientAddress ?? null);
  if (!humano) return erro({ geral: 'Não conseguimos confirmar que você não é um robô. Tente de novo.' });

  let cupom = await cupomPorWhatsapp(whatsapp!);
  let novo = false;
  if (!cupom) {
    for (let tentativa = 0; tentativa < 5 && !cupom; tentativa++) {
      const codigo = novoCodigo();
      const r = await env.DB.prepare(
        `INSERT INTO cupons (codigo, nome, whatsapp, consentimento_marketing) VALUES (?1, ?2, ?3, ?4) ON CONFLICT DO NOTHING`,
      ).bind(codigo, nome, whatsapp, corpo.marketing === true ? 1 : 0).run();
      if (r.meta.changes) novo = true;
      cupom = await cupomPorWhatsapp(whatsapp!); // também cobre dois pedidos ao mesmo tempo do mesmo número
    }
    if (!cupom) return erro({ geral: 'Não deu pra gerar o cupom agora. Tente de novo.' }, 500);
  }

  return Response.json({
    ok: true,
    cupom: { codigo: cupom.codigo, nome: cupom.nome, status: cupom.status, validade: validade(cupom.emitido_em), novo },
  });
};
