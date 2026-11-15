import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { verificarAccess } from './lib/access';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (!pathname.startsWith('/admin')) return next();

  // POST só da própria origem (proteção extra contra envio de formulário de outro site)
  if (ctx.request.method !== 'GET' && ctx.request.method !== 'HEAD') {
    const origem = ctx.request.headers.get('origin');
    if (origem && origem !== ctx.url.origin) return new Response('Origem não permitida', { status: 403 });
  }

  if (import.meta.env.DEV) {
    ctx.locals.usuario = 'dev@local';
  } else {
    const e = env as unknown as { ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string };
    const email = await verificarAccess(
      ctx.request.headers.get('cf-access-jwt-assertion'),
      e.ACCESS_TEAM_DOMAIN ?? '',
      e.ACCESS_AUD ?? '',
    );
    // Sem configuração ou token inválido: bloqueia (nunca libera por padrão)
    if (!email) return new Response('Acesso restrito à equipe do Acarajazz.', { status: 403 });
    ctx.locals.usuario = email;
  }

  const resposta = await next();
  resposta.headers.set('X-Robots-Tag', 'noindex, nofollow');
  resposta.headers.set('Cache-Control', 'no-store');
  return resposta;
});
