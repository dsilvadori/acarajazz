import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { agoraSP } from '../../lib/horario';
import { avisarEquipe, emailValido, normalizarWhatsapp, verificarTurnstile } from '../../lib/leads';

const TIPOS: Record<string, string> = {
  aniversario: 'Aniversário',
  corporativo: 'Corporativo / confraternização',
  casamento: 'Casamento',
  outro: 'Outro',
};
const LOCAIS: Record<string, string> = {
  acarajazz: 'No Acarajazz',
  cliente: 'No local do cliente (buffet)',
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const querJson = request.headers.get('accept')?.includes('application/json');
  const responder = (ok: boolean, erros: Record<string, string> = {}, status = ok ? 200 : 400) =>
    querJson
      ? Response.json({ ok, erros }, { status })
      : Response.redirect(new URL(`/?evento=${ok ? 'ok' : 'erro'}#eventos`, request.url), 303);

  const f = await request.formData();
  const campo = (k: string) => String(f.get(k) ?? '').trim();

  // Armadilha para robôs: campo invisível que pessoas não preenchem
  if (campo('site')) return responder(true);

  const erros: Record<string, string> = {};
  const nome = campo('nome');
  const email = campo('email').toLowerCase();
  const whatsapp = normalizarWhatsapp(campo('whatsapp'));
  const tipo = campo('tipo');
  const local = campo('local');
  const endereco = campo('endereco');
  const data = campo('data');
  const convidados = Number(campo('convidados'));
  const mensagem = campo('mensagem').slice(0, 2000);

  if (nome.length < 2) erros.nome = 'Conta pra gente seu nome.';
  if (!emailValido(email)) erros.email = 'Esse e-mail não parece certo.';
  if (!whatsapp) erros.whatsapp = 'Informe um WhatsApp com DDD.';
  if (!TIPOS[tipo]) erros.tipo = 'Escolha o tipo de evento.';
  if (!LOCAIS[local]) erros.local = 'Onde vai ser o evento?';
  if (local === 'cliente' && endereco.length < 3) erros.endereco = 'Informe o bairro ou endereço do evento.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < agoraSP().dataISO) erros.data = 'Escolha uma data a partir de hoje.';
  if (!Number.isInteger(convidados) || convidados < 1 || convidados > 5000) erros.convidados = 'Quantas pessoas, mais ou menos?';
  if (f.get('consentimento') !== 'on') erros.consentimento = 'Precisamos da sua autorização para entrar em contato.';

  if (Object.keys(erros).length) return responder(false, erros);

  const humano = await verificarTurnstile(campo('cf-turnstile-response') || null, clientAddress ?? null);
  if (!humano) return responder(false, { geral: 'Não conseguimos confirmar que você não é um robô. Tente de novo.' });

  const dados = {
    tipo_evento: tipo,
    local,
    endereco: local === 'cliente' ? endereco : null,
    data,
    convidados,
    mensagem: mensagem || null,
  };
  const origem = campo('origem').slice(0, 500) || request.headers.get('referer');

  const { meta } = await env.DB.prepare(
    `INSERT INTO leads (tipo, nome, email, whatsapp, dados, consentimento_contato, origem)
     VALUES ('evento', ?1, ?2, ?3, ?4, 1, ?5)`,
  )
    .bind(nome, email, whatsapp, JSON.stringify(dados), origem)
    .run();

  const [ano, mes, dia] = data.split('-');
  await avisarEquipe(
    `🎉 Novo pedido de evento: ${TIPOS[tipo]} em ${dia}/${mes} (${convidados} pessoas)`,
    [
      ['Nome', nome],
      ['WhatsApp', whatsapp!],
      ['E-mail', email],
      ['Tipo', TIPOS[tipo]],
      ['Onde', LOCAIS[local] + (dados.endereco ? ` · ${dados.endereco}` : '')],
      ['Data', `${dia}/${mes}/${ano}`],
      ['Convidados', String(convidados)],
      ['Mensagem', mensagem || '—'],
      ['Lead nº', String(meta.last_row_id)],
    ],
    email,
  );

  return responder(true, {}, 201);
};
