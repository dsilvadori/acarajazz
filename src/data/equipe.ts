/**
 * Fotos do slide da seção "O Acarajazz" da Home: quem faz a casa e o público (sem nomes, a pedido da equipe).
 * Fotos em public/img/equipe/ (.webp). O slide é 4×5; `posicao` ajusta o enquadramento (object-position) de fotos de outro formato.
 * Só publique foto de quem autorizou.
 */
export interface FotoCasa {
  src: string;
  alt: string;
  largura: number;
  altura: number;
  posicao?: string;
}

export const FOTOS_CASA: FotoCasa[] = [
  { src: '/img/equipe/eliana-bolo.webp', alt: 'Chef da casa, de lenço branco e dólmã estampada, levando um bolo de aniversário', largura: 800, altura: 1000 },
  { src: '/img/equipe/eliana-calcada.webp', alt: 'Chef da casa, de óculos e cabelo ruivo, abraçada com uma amiga na porta do Acarajazz', largura: 800, altura: 1000 },
  { src: '/img/equipe/cabelo-rosa.webp', alt: 'Integrante da equipe de cabelo rosa e avental, fazendo sinal com a mão na porta da casa', largura: 592, altura: 740 },
  { src: '/img/equipe/mae-da-bia.webp', alt: 'Mãe da Bia, de blusa branca e calça jeans, com uma bolsa vermelha na mão', largura: 540, altura: 675 },
  { src: '/img/equipe/samba.webp', alt: 'Roda de samba na calçada em frente à casa, com público em volta das mesas', largura: 648, altura: 810 },
];
