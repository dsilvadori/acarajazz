// Avaliações do Google exibidas no site. Copiar o texto EXATAMENTE como está no Google, com o nome do autor.
export interface Avaliacao {
  autor: string;
  nota: 1 | 2 | 3 | 4 | 5;
  texto: string;
  quando?: string; // ex.: 'há 2 meses'
}

export const AVALIACOES: Avaliacao[] = [
  // Aguardando prints das avaliações escolhidas pela equipe.
];

// Link para avaliar. Ideal: link direto de "escrever avaliação" do Perfil da Empresa no Google
// (https://search.google.com/local/writereview?placeid=...). Enquanto isso, a busca do Google.
export const LINK_AVALIAR = 'https://www.google.com/search?q=Acarajazz+Vila+Mariana+avalia%C3%A7%C3%B5es';
