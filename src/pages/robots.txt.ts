import type { APIRoute } from 'astro';

/** robots.txt: libera o site e esconde o painel, a API e as prévias internas do jogo. */
export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? url.origin;
  const corpo = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /acarabet/sprites',
    '',
    `Sitemap: ${new URL('/sitemap.xml', base).href}`,
    '',
  ].join('\n');
  return new Response(corpo, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};
