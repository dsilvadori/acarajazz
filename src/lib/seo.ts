/** Dados estruturados (schema.org) das páginas públicas. */
import type { Horario } from './db';

const DIAS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const NEGOCIO = {
  nome: 'Acarajazz',
  telefone: '+55 11 97956-4494',
  rua: 'Rua Dona Inácia Uchôa, 89',
  bairro: 'Vila Mariana',
  cidade: 'São Paulo',
  estado: 'SP',
  instagram: 'https://www.instagram.com/o_acarajazz/',
};

const organizacao = (site: URL | string) => ({
  '@type': 'Organization',
  name: NEGOCIO.nome,
  url: new URL('/', site).href,
  logo: new URL('/img/logo-512.png', site).href,
  sameAs: [NEGOCIO.instagram],
});

/** Home: o restaurante, com endereço e horários vindos do painel. */
export function schemaRestaurante(site: URL | string, origem: string, horarios: Horario[]) {
  const abertos = horarios.filter((h) => h.abre && h.fecha);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: NEGOCIO.nome,
      description: 'Boteco de baianos. Para todos. Acarajé, moquecas e comidas típicas, regionais e autorais com a chef Bia Souza.',
      url: new URL('/', site).href,
      image: [new URL('/og/home.jpg', origem).href, new URL('/img/pratos/acaraje.webp', origem).href],
      logo: new URL('/img/logo-512.png', origem).href,
      telephone: NEGOCIO.telefone,
      servesCuisine: ['Baiana', 'Brasileira', 'Nordestina'],
      hasMenu: new URL('/#cardapio', site).href,
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${NEGOCIO.rua} - ${NEGOCIO.bairro}`,
        addressLocality: NEGOCIO.cidade,
        addressRegion: NEGOCIO.estado,
        addressCountry: 'BR',
      },
      sameAs: [NEGOCIO.instagram],
      ...(abertos.length && {
        openingHoursSpecification: abertos.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${DIAS_SCHEMA[h.dia_semana]}`,
          opens: h.abre,
          closes: h.fecha,
        })),
      }),
    },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: NEGOCIO.nome, url: new URL('/', site).href, inLanguage: 'pt-BR' },
  ];
}

export const schemaCurso = (site: URL | string, origem: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Acarajé Além da Receita',
  description: 'Imersão na cultura do acarajé: história, ancestralidade, técnica e prática com a chef Bia Souza, do Acarajazz.',
  url: new URL('/acaraje-alem-da-receita', site).href,
  image: new URL('/og/curso.jpg', origem).href,
  inLanguage: 'pt-BR',
  provider: organizacao(site),
});

export const schemaJogo = (site: URL | string, origem: string) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Acarabet',
  description: 'Jogo grátis em pixel art: faça um acarajé com a chef Bia, do feijão até a mesa, e conheça de um jeito lúdico o preparo do acarajé.',
  url: new URL('/acarabet', site).href,
  image: new URL('/og/acarabet.jpg', origem).href,
  inLanguage: 'pt-BR',
  genre: ['Casual', 'Culinária'],
  gamePlatform: ['Navegador no celular', 'Navegador no computador'],
  applicationCategory: 'Game',
  operatingSystem: 'Web',
  isAccessibleForFree: true,
  publisher: organizacao(site),
});
