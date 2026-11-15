import { env } from 'cloudflare:workers';

export interface PostInstagram {
  id: string;
  imagem: string;
  legenda: string;
  link: string;
  video?: boolean;
}

export const PERFIL = 'https://www.instagram.com/o_acarajazz/';

// Usado enquanto não há token da Graph API (ou se a API falhar).
const RESERVA: PostInstagram[] = [
  { id: 'r1', imagem: '/instagram/quarta-acaraje.webp', legenda: 'Quarta-feira é dia de acarajé', link: PERFIL },
  { id: 'r2', imagem: '/instagram/camarao-praiano.webp', legenda: 'Camarão praiano do Acarajazz', link: PERFIL },
  { id: 'r3', imagem: '/instagram/cozido.webp', legenda: 'Cozido baiano, o especialíssimo do fim de semana', link: PERFIL },
  { id: 'r4', imagem: '/instagram/tradicao.webp', legenda: 'Na Bahia, quarta é dia de Xangô e Iansã', link: PERFIL },
  { id: 'r5', imagem: '/instagram/bola-de-fogo.webp', legenda: 'Acarajé: comer bola de fogo, do iorubá', link: PERFIL },
  { id: 'r6', imagem: '/instagram/peixe.webp', legenda: 'Manjubinha ou peixe do dia', link: PERFIL },
]

interface MidiaGraph {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
}

/**
 * Últimos posts do perfil via Instagram Graph API, com cache de 1 hora na borda.
 * TODO (produção): renovar o token de longa duração a cada ~50 dias (Cron Trigger).
 */
export async function getPosts(limite = 6): Promise<PostInstagram[]> {
  const token = (env as unknown as { INSTAGRAM_TOKEN?: string }).INSTAGRAM_TOKEN;
  if (!token) return RESERVA.slice(0, limite);

  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=${limite}&access_token=${token}`;
  try {
    const r = await fetch(url, { cf: { cacheTtl: 3600, cacheEverything: true } } as RequestInit);
    if (!r.ok) throw new Error(`Graph API ${r.status}`);
    const { data } = (await r.json()) as { data: MidiaGraph[] };
    return data.map((m) => ({
      id: m.id,
      imagem: m.media_type === 'VIDEO' ? (m.thumbnail_url ?? m.media_url) : m.media_url,
      legenda: (m.caption ?? '').split('\n')[0].slice(0, 120),
      link: m.permalink,
      video: m.media_type === 'VIDEO',
    }));
  } catch (e) {
    console.error('Falha ao buscar posts do Instagram', e);
    return RESERVA.slice(0, limite);
  }
}
