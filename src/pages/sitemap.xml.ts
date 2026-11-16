import type { APIRoute } from 'astro';

/** Páginas públicas do site (o painel, a API e as prévias do jogo ficam de fora). */
const PAGINAS = [
  { caminho: '/', frequencia: 'weekly', prioridade: '1.0' },
  { caminho: '/acarabet', frequencia: 'monthly', prioridade: '0.8' },
  { caminho: '/acaraje-alem-da-receita', frequencia: 'monthly', prioridade: '0.8' },
  { caminho: '/politica-de-privacidade', frequencia: 'yearly', prioridade: '0.2' },
  { caminho: '/politica-de-cookies', frequencia: 'yearly', prioridade: '0.2' },
];

export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? url.origin;
  const itens = PAGINAS.map(
    (p) => `  <url><loc>${new URL(p.caminho, base).href}</loc><changefreq>${p.frequencia}</changefreq><priority>${p.prioridade}</priority></url>`,
  ).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itens}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};
