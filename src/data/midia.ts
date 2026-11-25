// Acarajazz na mídia. Só aparecem no site os itens com `link` confirmado.
export interface Materia {
  veiculo: string;
  tipo: 'TV' | 'YouTube' | 'Portal' | 'Jornal' | 'Instagram';
  titulo: string;
  link: string;
  data?: string; // texto livre, ex.: 'out/2025'
  imagem?: string;
  /** Enquadramento da capa (CSS object-position), ex.: 'center 25%' */
  posicao?: string;
}

export const MATERIAS: Materia[] = [
  {
    veiculo: 'TV Globo · Antena Paulista',
    tipo: 'TV',
    titulo: 'Gastronomia ancestral reverencia a consciência negra',
    link: 'https://g1.globo.com/sp/sao-paulo/antena-paulista/video/gastronomia-ancestral-reverencia-a-consciencia-negra-15276504.ghtml',
    data: 'nov/2026',
    imagem: '/img/midia/globo-antena-paulista.webp',
    posicao: 'center 30%',
  },
  {
    veiculo: 'Band · Melhor da Tarde',
    tipo: 'TV',
    titulo: 'Surpresa culinária: Pamela Lucciola recebe os acarajés da chef Bia Souza',
    link: 'https://www.youtube.com/watch?v=D1tSDp2GX_U',
    data: 'out/2025',
    imagem: '/img/midia/band.webp',
  },
  {
    veiculo: 'Estadão · Paladar',
    tipo: 'YouTube',
    titulo: 'AcaraJazz: o boteco de baianos com acarajé | Achadinhos ep.13',
    link: 'https://www.youtube.com/watch?v=AUyr4Tn6-Jw',
    data: 'jun/2026',
    imagem: 'https://i.ytimg.com/vi/AUyr4Tn6-Jw/maxresdefault.jpg',
  },
  {
    veiculo: 'g1',
    tipo: 'Portal',
    titulo: 'Cozinheira que doou acarajés deixa garagem para abrir primeiro restaurante',
    link: 'https://g1.globo.com/sp/sao-paulo/noticia/2022/07/14/cozinheira-que-doou-acarajes-a-evento-do-mtst-com-presenca-de-wagner-moura-deixara-garagem-para-montar-restaurante-em-sp.ghtml',
    data: 'jul/2022',
    imagem: '/img/midia/g1-2022-bia-placa.webp',
  },
  {
    veiculo: 'Agência Mural',
    tipo: 'Portal',
    titulo: 'Entrevista: mulheres negras foram empurradas pelo desemprego para o empreendedorismo',
    link: 'https://agenciamural.org.br/mulheres-negras-foram-empurradas-pelo-desemprego-para-o-empreendedorismo/',
    data: 'jul/2021',
    imagem: '/img/bia-laranja.webp',
    posicao: 'center 30%',
  },
  {
    veiculo: 'Panelaço do João Gordo',
    tipo: 'YouTube',
    titulo: 'Acarajé vegano com a chef Bia Souza e Daniel Ganjaman',
    link: 'https://www.youtube.com/watch?v=WmwgxqWTDv0',
    data: 'dez/2016',
    imagem: 'https://i.ytimg.com/vi/WmwgxqWTDv0/hqdefault.jpg',
  },
];

/*
 * PENDENTES (sem link confirmado — não aparecem no site):
 * - g1: matéria(s) sobre o Acarajazz
 * - UOL: matéria gravada no Acarajazz com a chef Debinha (dez/2025)
 * - Canais de gastronomia no Instagram: @ e links dos posts/reels
 * - Metrópoles (nov/2021): doação de acarajés ao MTST — dispensável, a matéria do g1 (jul/2022) já conta a história
 */
