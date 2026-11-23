/**
 * /whatsapp: todos os botões do WhatsApp do site passam por aqui.
 *
 * - Fora do Brasil: página avisando que o atendimento pelo WhatsApp é só no Brasil.
 * - No Brasil: verificação de robô do Turnstile (quase sempre invisível) e então
 *   redireciona para o wa.me. O token é conferido no servidor (POST) antes de liberar o número.
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verificarTurnstile } from '../lib/leads';
import { PERFIL_INSTAGRAM as INSTAGRAM } from '../data/reels';
import { WHATSAPP, foraDoBrasil } from '../lib/whatsapp';

const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function pagina(titulo: string, corpo: string, status = 200, cabecalho = '') {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${titulo} · Acarajazz</title>
<link rel="icon" href="/favicon-64.png">
${cabecalho}
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box;
    background: #fef5e2; color: #3a1a10; font: 1.0625rem/1.55 Nunito, system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { max-width: 30rem; text-align: center; }
  img { width: 72px; height: 72px; }
  h1 { color: #7a0000; font-size: 1.75rem; line-height: 1.2; margin: .5rem 0 .75rem; }
  p { margin: 0 0 1rem; }
  .en { color: #7a5444; font-size: .9375rem; border-top: 1px solid #ffc03f; padding-top: 1rem; margin-top: 1.5rem; }
  a { color: #7a0000; font-weight: 700; }
  .botao { display: inline-block; margin-top: .5rem; padding: .8rem 1.4rem; border-radius: 999px; border: 0;
    background: #7a0000; color: #fef5e2; font: inherit; font-weight: 700; cursor: pointer; }
  .erro { color: #d0142c; }
  .cf-turnstile { display: flex; justify-content: center; margin: 1rem 0; min-height: 65px; }
</style>
</head>
<body><main><img src="/favicon-64.png" alt="">${corpo}</main></body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

const paginaForaDoBrasil = () =>
  pagina(
    'Atendimento só no Brasil',
    `<h1>Atendimento pelo WhatsApp só no Brasil</h1>
<p>O contato pelo WhatsApp do Acarajazz está disponível apenas para quem acessa o site do Brasil.
Se você estiver viajando, fale com a gente pelo Instagram <a href="${INSTAGRAM}" rel="noopener">@o_acarajazz</a>.</p>
<p class="en">WhatsApp contact is only available to visitors in Brazil.
You can reach us on Instagram at <a href="${INSTAGRAM}" rel="noopener">@o_acarajazz</a>.</p>
<p><a href="/">Voltar para o site</a></p>`,
    403,
  );

const paginaVerificacao = (erro = '') =>
  pagina(
    'Abrindo o WhatsApp',
    `<h1>Abrindo o WhatsApp…</h1>
<p>Só uma verificação rápida de segurança e a conversa com o Acarajazz abre em seguida.</p>
${erro ? `<p class="erro" role="alert">${erro}</p>` : ''}
<form method="post" action="${WHATSAPP.link}" id="f">
  <div class="cf-turnstile" data-sitekey="${escapar(env.TURNSTILE_SITE_KEY ?? '')}" data-action="whatsapp"
    data-language="pt-br" data-theme="light" data-callback="ajAprovado" data-refresh-expired="auto"></div>
  <noscript><p class="erro">Ative o JavaScript para continuar.</p></noscript>
  <button class="botao" type="submit" id="b" hidden>Abrir o WhatsApp</button>
</form>
<script>
  function ajAprovado() { document.getElementById('f').submit(); }
  // Se o envio automático não acontecer, o botão aparece.
  setTimeout(function () { document.getElementById('b').hidden = false; }, 6000);
</script>`,
    erro ? 400 : 200,
    '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>',
  );

const abrir = () =>
  new Response(null, {
    status: 303,
    headers: { location: `https://wa.me/${WHATSAPP.numero}`, 'cache-control': 'no-store' },
  });

const verificacaoLigada = () => Boolean(env.TURNSTILE_SITE_KEY);

export const GET: APIRoute = ({ request }) => {
  if (foraDoBrasil(request)) return paginaForaDoBrasil();
  return verificacaoLigada() ? paginaVerificacao() : abrir();
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (foraDoBrasil(request)) return paginaForaDoBrasil();
  if (!verificacaoLigada()) return abrir();
  const form = await request.formData().catch(() => null);
  const token = form?.get('cf-turnstile-response');
  const humano = await verificarTurnstile(typeof token === 'string' && token ? token : null, clientAddress ?? null);
  return humano ? abrir() : paginaVerificacao('Não conseguimos confirmar a verificação. Tente de novo.');
};
