import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { avisarEquipe, emailValido, normalizarWhatsapp, verificarTurnstile } from '../../lib/leads';
import { FORMATOS, PERFIS } from '../../lib/curso';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const querJson = request.headers.get('accept')?.includes('application/json');
  const responder = (ok: boolean, erros: Record<string, string> = {}, extra: Record<string, unknown> = {}) =>
    querJson
      ? Response.json({ ok, erros, ...extra }, { status: ok ? 200 : 400 })
      : Response.redirect(new URL(`/acaraje-alem-da-receita?lista=${ok ? 'ok' : 'erro'}#lista`, request.url), 303);

  const f = await request.formData();
  const campo = (k: string) => String(f.get(k) ?? '').trim();

  if (campo('site')) return responder(true); // armadilha para robôs

  const nome = campo('nome');
  const email = campo('email').toLowerCase();
  const whatsapp = normalizarWhatsapp(campo('whatsapp'));
  const perfil = campo('perfil');
  const formato = campo('formato');
  const cidade = campo('cidade').slice(0, 80);

  const erros: Record<string, string> = {};
  if (nome.length < 2) erros.nome = 'Conta pra gente seu nome.';
  if (!emailValido(email)) erros.email = 'Esse e-mail não parece certo.';
  if (!whatsapp) erros.whatsapp = 'Informe um WhatsApp com DDD.';
  if (perfil && !PERFIS[perfil]) erros.perfil = 'Escolha uma opção da lista.';
  if (formato && !FORMATOS[formato]) erros.formato = 'Escolha uma opção.';
  if (f.get('consentimento') !== 'on') erros.consentimento = 'Precisamos da sua autorização para avisar você.';
  if (Object.keys(erros).length) return responder(false, erros);

  const humano = await verificarTurnstile(campo('cf-turnstile-response') || null, clientAddress ?? null);
  if (!humano) return responder(false, { geral: 'Não conseguimos confirmar que você não é um robô. Tente de novo.' });

  // Já está na lista? Não duplica.
  const existente = await env.DB.prepare(`SELECT id FROM leads WHERE tipo = 'curso' AND email = ?1 LIMIT 1`)
    .bind(email)
    .first<{ id: number }>();
  if (existente) return responder(true, {}, { jaInscrito: true });

  const dados = { perfil: perfil || null, formato: formato || null, cidade: cidade || null };
  const origem = campo('origem').slice(0, 500) || request.headers.get('referer');

  const { meta } = await env.DB.prepare(
    `INSERT INTO leads (tipo, nome, email, whatsapp, dados, consentimento_contato, consentimento_marketing, origem)
     VALUES ('curso', ?1, ?2, ?3, ?4, 1, 1, ?5)`,
  )
    .bind(nome, email, whatsapp, JSON.stringify(dados), origem)
    .run();

  await avisarEquipe(
    `📚 Novo interessado no curso Acarajé Além da Receita: ${nome}`,
    [
      ['Nome', nome],
      ['E-mail', email],
      ['WhatsApp', whatsapp!],
      ['Perfil', perfil ? PERFIS[perfil] : '—'],
      ['Formato preferido', formato ? FORMATOS[formato] : '—'],
      ['Cidade', cidade || '—'],
      ['Origem', origem || '—'],
      ['Lead nº', String(meta.last_row_id)],
    ],
    email,
  );

  return responder(true);
};
