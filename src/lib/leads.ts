import { env } from 'cloudflare:workers';

/** Normaliza um telefone brasileiro para +55DDDNÚMERO. Retorna null se inválido. */
export function normalizarWhatsapp(bruto: string): string | null {
  let d = bruto.replace(/\D/g, '');
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  return `+55${d}`;
}

export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/** Confere o token do Turnstile no servidor. */
export async function verificarTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  const secret = (env as unknown as { TURNSTILE_SECRET?: string }).TURNSTILE_SECRET;
  if (!secret) {
    console.warn('TURNSTILE_SECRET ausente: verificação anti-robô desativada');
    return true;
  }
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const j = (await r.json()) as { success: boolean };
    return j.success;
  } catch (e) {
    console.error('Falha ao verificar Turnstile', e);
    return false;
  }
}

/** Avisa a equipe por e-mail. Falhas não impedem o lead de ser salvo. */
export async function avisarEquipe(assunto: string, linhas: [string, string][], responderPara?: string) {
  const texto = linhas.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:15px;border-collapse:collapse">${linhas
    .map(([k, v]) => `<tr><td style="color:#6d4c3a"><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table><p style="font-family:sans-serif;color:#6d4c3a">Veja e acompanhe no painel: /admin</p>`;
  // O binding EMAIL só existe depois do lançamento (domínio + Email Routing). Antes disso, só registra.
  const email = (env as unknown as { EMAIL?: SendEmail }).EMAIL;
  if (!email) {
    console.warn('Envio de e-mail ainda não configurado (sem binding EMAIL).');
    return false;
  }
  try {
    await email.send({
      from: { name: 'Site Acarajazz', email: env.EMAIL_REMETENTE },
      to: env.EMAIL_DESTINO,
      replyTo: responderPara,
      subject: assunto,
      text: texto,
      html,
    });
    return true;
  } catch (e) {
    console.error('Falha ao enviar e-mail de aviso', e);
    return false;
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Formulários (eventos, curso) só recebem contatos no lançamento, no domínio oficial.
 * Antes disso (AMBIENTE = "pre-lancamento" no endereço *.workers.dev) ficam fechados.
 * No desenvolvimento local continuam abertos para testes.
 */
export function formulariosAbertos() {
  if (import.meta.env.DEV) return true;
  return (env as unknown as { AMBIENTE?: string }).AMBIENTE === 'producao';
}

export const respostaFormularioFechado = () =>
  Response.json(
    { ok: false, erros: { geral: 'Os formulários abrem no lançamento do site. Fale com a gente pelo WhatsApp (11) 97956-4494.' } },
    { status: 503 },
  );
