// Vitrine do Instagram na Home: reels e fotos do @o_acarajazz (da exportação do Instagram).
// Só conteúdo atemporal (sem eventos com data) e só fotos do próprio Acarajazz (sem repost de clientes).
//   reel → public/reels/<arquivo>.mp4 + capa public/reels/<arquivo>.webp (540×960)
//   foto → public/img/feed/<arquivo>.webp (540×960)
export type ItemFeed =
  | { tipo: 'reel'; arquivo: string; titulo: string }
  | { tipo: 'foto'; arquivo: string; titulo: string };

export const FEED: ItemFeed[] = [
  { tipo: 'reel', arquivo: 'comida-de-verdade', titulo: 'Comida de verdade tem nome, tem cheiro e tem história.' },
  { tipo: 'foto', arquivo: 'manjubinha', titulo: 'Manjubinha com farofa, vinagrete e maionese.' },
  { tipo: 'reel', arquivo: 'bahia-nao-e-tema', titulo: 'A Bahia não é tema. É origem, é vivência, é identidade.' },
  { tipo: 'foto', arquivo: 'vatapa', titulo: 'Vatapá com camarão.' },
  { tipo: 'reel', arquivo: 'raizes-africanas', titulo: 'O acarajé tem raízes africanas, mas foi na Bahia que virou celebridade.' },
  { tipo: 'foto', arquivo: 'caldo', titulo: 'Caldinho pra esquentar.' },
  { tipo: 'reel', arquivo: 'kit-lazaro-ramos', titulo: 'Ó pra isso… Kit Lázaro Ramos.' },
  { tipo: 'foto', arquivo: 'bar', titulo: 'A casa, do jeito que ela é.' },
  { tipo: 'reel', arquivo: 'direto-pra-bahia', titulo: 'Comidas que te transportam… direto pra Bahia.' },
  { tipo: 'reel', arquivo: 'simplesmente-acaraje', titulo: 'Simplesmente acarajé.' },
  { tipo: 'reel', arquivo: 'boteco-na-vila-mariana', titulo: 'O boteco baiano na Vila Mariana que te leva pra Bahia na primeira mordida.' },
];

export const PERFIL_INSTAGRAM = 'https://www.instagram.com/o_acarajazz/';
