import { defineMiddleware } from 'astro:middleware';
import { COOKIE, lerSessao } from './lib/auth';

const PUBLICAS = new Set(['/admin/entrar', '/admin/entrar/']);

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (!pathname.startsWith('/admin')) return next();

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
