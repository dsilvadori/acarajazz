import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { COOKIE, lerSessao } from './lib/auth';
import { foraDoBrasil } from './lib/whatsapp';

const DOMINIO = 'oacarajazz.com';
const PUBLICAS =new Set(['/admin/entrar', '/admin/entrar/']);

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname, hostname } = ctx.url;

  // www.oacarajazz.com → oacarajazz.com (um endereço só para o Google, sem conteúdo duplicado)
  if (hostname === `www.${DOMINIO}`) {
    return Response.redirect(`https://${DOMINIO}${pathname}${ctx.url.search}`, 301);
  }

  // Formulários (eventos, curso, cupom do Acarabet) só aceitam envios do Brasil
  if (pathname.startsWith('/api/') && ctx.request.method === 'POST' && foraDoBrasil(ctx.request)) {
    return Response.json(
      { ok: false, erros: { geral: 'Os pedidos pelo site são só para quem está no Brasil. Fale com a gente pelo Instagram @o_acarajazz.' } },
      { status: 403 },
    );
  }

  if (!pathname.startsWith('/admin')) {
    const resposta = await next();
    // Só o domínio oficial aparece no Google; o endereço provisório (*.workers.dev) e o localhost ficam de fora
    const indexavel = hostname === DOMINIO || (env as unknown as { AMBIENTE?: string }).AMBIENTE === 'producao';
    if (!indexavel) resposta.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return resposta;
  }

  // Formulários do painel só podem vir do próprio site
  if (ctx.request.method !== 'GET' && ctx.request.method !== 'HEAD') {
    const origem = ctx.request.headers.get('origin');
    if (origem && origem !== ctx.url.origin) return new Response('Origem não permitida', { status: 403 });
  }

  if (!PUBLICAS.has(pathname)) {
    const email = await lerSessao(ctx.cookies.get(COOKIE)?.value);
    if (!email) {
      const volta = encodeURIComponent(pathname + ctx.url.search);
      return ctx.redirect(`/admin/entrar?volta=${volta}`, 303);
    }
    ctx.locals.usuario = email;
  }

  const resposta = await next();
  resposta.headers.set('X-Robots-Tag', 'noindex, nofollow');
  resposta.headers.set('Cache-Control', 'no-store');
  return resposta;
});
