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
  { src: '/img/equipe/gemeas.webp', alt: 'Duas mulheres da família, de cabelo grisalho, brindando atrás de um bolo', largura: 480, altura: 640 },
  { src: '/img/equipe/publico.webp', alt: 'Salão cheio, com público e roda de música', largura: 656, altura: 820 },
];
