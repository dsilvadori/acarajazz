// Avaliações do Google exibidas no site. Copiar o texto EXATAMENTE como está no Google, com o nome do autor.
export interface Avaliacao {
  autor: string;
  nota: 1 | 2 | 3 | 4 | 5;
  texto: string;
  quando?: string; // ex.: 'há 2 meses'
}

// Nota geral no Google (conferida em 15/11/2026). Atualizar de tempos em tempos.
export const NOTA_GOOGLE = { media: '4,6', total: 322 };

// Textos copiados dos prints do Google (15/11/2026), sem edição.
export const AVALIACOES: Avaliacao[] = [
  {
    autor: 'Talita Desserie',
    nota: 5,
    texto:
      'O acarajé é leve e crocante e os recheios super saborosos. Torresminho, sururu e cozido baiano estavam perfeitos. Conheci o Acarajazz faz dois meses e ja perdi a conta de quantas vezes voltei.',
  },
  {
    autor: 'Thainá Queiroz',
    nota: 5,
    texto:
      'Já pedi quase o cardápio todo e viciei! Meu pedacinho da Bahia aqui. O cozido é sensacional, assim como a passarinha, o caranguejo, acarajé e a moqueca. Volto sempre!',
  },
  {
    autor: 'Lygia',
    nota: 5,
    texto:
      'Todas as vezes que fui ao Acarajazz fui muito bem atendida!! E a comida é MUITO SABOROSA- tem acarajés e abarás nas versões tradicional e vegano, além de outras receitas baianas deliciosas. E ainda tem karaoke. Recomendadissimo!!',
  },
  {
    autor: 'Laira Castro',
    nota: 5,
    texto:
      'Um ambiente super acolhedor e lindo, com as maravilhosas cores da Bahia e também sua simpatia no atendimento. Música nacional de fundo bem gostosinha mas também twm a divertida opção de karaoke. A comida absolutamente maravilhosa, fresquinha, bem temperada. Porções bem servidas. Recomendo muito a limonada com rapadura.',
  },
  {
    autor: 'Luhanna Katheryne',
    nota: 5,
    texto:
      'O Acarajazz é um espaço rico de referências e que entrega uma proposta fiel a bandeira que levanta da cultura baiana. Ao entrar no ambiente você é imerso numa atmosfera perfumada por dendê aonde o laranja das paredes termina de te conectar ao levante sensorial de força e energia, que é onde a comida baiana de origem sustenta: no corpo e na alma. A chefe Bia elaborou através de muita pesquisa e origem um cardápio de alta gastronomia mesclando as técnicas de cozinha à sua essência e propósito. Ainda não terminei de experimentar o cardápio todo pois é extenso, intenso, criativo e autêntico. Gostaria de falar sobre o custo benefício que é garantido, pois você é imerso numa experiência profunda, alegre e intensamente baiana, no meio da Zona Sul de São Paulo, na Vila Mariana. Me senti acolhida, alimentada e restaurada. Obrigada chefe Bia!!',
  },
  {
    autor: 'Oscar Vasconcelos',
    nota: 5,
    texto:
      'Cheguei com a casa abrindo, apenas para almoçar rapidamente e conhecer a casa. Eu sonhei com um caranguejo de entrada mas infelizmente hoje não tinha. Comi uma excelente moqueca de peixe, prato individual bem saboroso e bebi um maravilhoso CANGALIVRE (suco de limão com melado de cana). Preços bem honestos como vocês podem ver no cardápio. Recomendo muito.',
  },
  {
    autor: 'Soraia',
    nota: 5,
    texto:
      "Estou apaixonada pelo local 😍, experiência incrível. Além de duas Chef's maravilhosas, super profissionais e dedicadas Bia e Eli, a composição da equipe (parte família), completam a harmonia e a sintonia dos sabores e tradições. As preparações, os ambientes tanto do AcaraJazz como do Kangaça, trazem uma experiência gastronômica incrível e imperdível (pratos, drink's e sobremesas), sabores típicos e originais, mantendo as tradições culturais de cada região. Cardápio bem variado, opções para veganos, viagem e muito mais. Se quiser se sentir na Bahia, estando em SP, e lá msm! Não percam tempo, vale mto a pena conferir... 😋😍",
  },
];

// Link para avaliar. Ideal: link direto de "escrever avaliação" do Perfil da Empresa no Google
// (https://search.google.com/local/writereview?placeid=...). Enquanto isso, a busca do Google.
// Abre a busca do Google já com o painel de avaliações do Acarajazz (lrd = código do Perfil da Empresa).
export const LINK_AVALIAR =
  'https://www.google.com/search?q=Acarajazz+Vila+Mariana+avalia%C3%A7%C3%B5es#lrd=0x94ce5b18fd43cb03:0x5f1ff0d2ee47ecc3,1,,,,';
