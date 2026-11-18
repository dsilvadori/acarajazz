/** Estado da partida do Acarabet, etapas e utilidades (armazenamento e medição). */

export type Roupa = 'baiana' | 'dolma' | 'preta';
/** Casais de clientes sorteados a cada partida (o público do Acarajazz é diverso): quem senta à esquerda_quem senta à direita.
 * Homem e mulher, dois homens e duas mulheres; de várias etnias e mesclados. Ver tools/sprites/personagens.py (CASAIS). */
export const CASAIS = [
  'negro_negra', 'branco_branca', 'asiatico_asiatica', 'pardo_parda',
  'branco_negra', 'negro_branca', 'asiatico_negra', 'negro_asiatica', 'pardo_negra', 'negro_parda', 'pardo_asiatica',
  'negro_branco', 'pardo_negro', 'asiatico_pardo',
  'negra_branca', 'parda_negra', 'asiatica_parda',
] as const;

export const ROUPAS: { id: Roupa; nome: string }[] = [
  { id: 'baiana', nome: 'BAIANA' },
  { id: 'dolma', nome: 'DÓLMÃ' },
  { id: 'preta', nome: 'DESPOJADA' },
];

export interface InfoEtapa {
  id: string;
  cena: string;
  nome: string;
  instrucao: string;
}

/** As etapas, na ordem do preparo de verdade (definida com a equipe em nov/2026). */
export const ETAPAS: InfoEtapa[] = [
  { id: 'lavar', cena: 'Lavar', nome: 'LAVAR O FEIJÃO', instrucao: 'O FEIJÃO-FRADINHO JÁ VEM QUEBRADO. ESFREGUE NA ÁGUA PRA DEIXAR ELE LIMPINHO!' },
  { id: 'triturar', cena: 'Triturar', nome: 'TRITURAR', instrucao: 'TOQUE NO BOTÃO VERDE PRA LIGAR O MULTIPROCESSADOR. TOQUE DE NOVO PRA PARAR QUANDO O PONTEIRO ESTIVER NA FAIXA VERDE!' },
  { id: 'temperos', cena: 'Temperos', nome: 'TEMPEROS', instrucao: 'TOQUE NO ALHO, NA CEBOLA, NO PIMENTÃO, NO CHEIRO-VERDE E NA PIMENTA PRA PICAR. DEPOIS MEXA A PIMENTA NO DENDÊ EM CÍRCULOS!' },
  { id: 'vatapa', cena: 'Vatapa', nome: 'VATAPÁ', instrucao: 'TOQUE NOS INGREDIENTES NA ORDEM DA RECEITA. DEPOIS MEXA EM CÍRCULOS ATÉ DAR O PONTO.' },
  { id: 'caruru', cena: 'Caruru', nome: 'CARURU', instrucao: 'ARRASTE O QUIABO PRA TÁBUA. DEPOIS TOQUE NOS INGREDIENTES PRA IREM PRA PANELA E MEXA EM CÍRCULOS.' },
  { id: 'salada', cena: 'Salada', nome: 'SALADA', instrucao: 'TOQUE PRA PICAR QUANDO A FACA ESTIVER EM CIMA DO TOMATE: VERDE, MEIO AMARELADO E VERMELHO. CUIDADO COM O DEDO!' },
  { id: 'bater', cena: 'Bater', nome: 'BATER A MASSA', instrucao: 'TOQUE RAPIDINHO NA TELA PRA BATER. A MASSA VAI CRESCENDO ATÉ FICAR BRANQUINHA E LEVINHA!' },
  { id: 'fritar', cena: 'Fritar', nome: 'FRITAR', instrucao: 'TOQUE NA MASSA PRA JOGAR OS 4 BOLINHOS NO DENDÊ. QUEM FRITA É O LADO DE BAIXO: QUANDO A BORDA DOURAR, TOQUE PRA VIRAR. QUANDO O OUTRO LADO FICAR NO PONTO, TOQUE PRA TIRAR.' },
  { id: 'montar', cena: 'Montar', nome: 'MONTAR', instrucao: 'ARRASTE NA ORDEM: PIMENTA NO BOLINHO, VATAPÁ, CARURU, SALADA E, POR CIMA, CAMARÃO (OU SHIMEJI NO VEGETARIANO). OLHE O PEDIDO!' },
  { id: 'servir', cena: 'Servir', nome: 'SERVIR', instrucao: 'TOQUE NA MESA DO CASAL PRA BIA LEVAR O ACARAJÉ QUENTINHO.' },
];

/** Ordem da montagem (a pimenta varia: com pimenta ou pouca pimenta; por cima, camarão no tradicional e shimeji no vegetariano). */
export const ORDEM_MONTAGEM = ['pimenta', 'vatapa', 'caruru', 'salada', 'camarao'] as const;

const MAX_ESTRELAS = ETAPAS.length * 3;
export const META_SATISFACAO = Math.ceil((MAX_ESTRELAS * 2) / 3); // 2/3 das estrelas: o casal fica satisfeito

/** Regras da promoção, vindas do servidor (src/lib/acarabet.ts) pela página. */
export interface Config {
  siteKey: string;
  desconto: string;
  validadeDias: number;
  endereco: string;
}
export const config: Config = { siteKey: '', desconto: '10%', validadeDias: 30, endereco: 'Rua Dona Inácia Uchôa, 89 · Vila Mariana' };

export interface CupomInfo {
  codigo: string;
  nome: string;
  status: 'emitido' | 'usado';
  validade: string; // yyyy-mm-dd
  novo?: boolean;
}

export const estado = {
  roupa: 'baiana' as Roupa,
  /** Pedido do casal: 'forte' (foguinho) = com pimenta · 'pouca' (friozinho) = pouca pimenta. */
  pimenta: 'forte' as 'forte' | 'pouca',
  /** Tradicional leva camarão por cima; vegetariano leva shimeji. */
  vegetariano: false,
  /** Qual casal está à mesa nesta partida. */
  casal: 'negro_negra' as (typeof CASAIS)[number],
  estrelas: {} as Record<string, number>,
  fila: [] as string[], // etapas que faltam (na primeira vez, todas; depois, as que vai refazer)
  rodada: 0,
  inicio: 0,
  /** Easter egg: se quem fez o jogo aparece nesta visita (sorteado na tela inicial, vale também pra comemoração). */
  espiao: false,
};

export function novaPartida() {
  estado.pimenta = Math.random() < 0.5 ? 'forte' : 'pouca';
  estado.vegetariano = Math.random() < 0.35;
  estado.casal = CASAIS[Math.floor(Math.random() * CASAIS.length)];
  estado.estrelas = {};
  estado.fila = ETAPAS.map((e) => e.id);
  estado.rodada = 0;
  estado.inicio = Date.now();
}

export const totalEstrelas = () => Object.values(estado.estrelas).reduce((a, b) => a + b, 0);

/** 0 bravo · 1 sério · 2 ok · 3 feliz · 4 apaixonado (usa a média das etapas já feitas). */
export function nivelSatisfacao(): number {
  const feitas = Object.keys(estado.estrelas).length;
  if (!feitas) return 2;
  const proporcao = totalEstrelas() / (feitas * 3);
  return proporcao < 0.4 ? 0 : proporcao < 0.55 ? 1 : proporcao < 0.67 ? 2 : proporcao < 0.85 ? 3 : 4;
}

/** Texto do pedido, ex.: "TRADICIONAL, COM CAMARÃO E PIMENTA" / "VEGETARIANO, COM SHIMEJI E POUCA PIMENTA". */
export const textoPedido = () =>
  `${estado.vegetariano ? 'VEGETARIANO, COM SHIMEJI' : 'TRADICIONAL, COM CAMARÃO'} E ${estado.pimenta === 'pouca' ? 'POUCA ' : ''}PIMENTA`;

export const satisfeito = () => totalEstrelas() >= META_SATISFACAO; // abaixo da meta o casal não gosta e é preciso recomeçar
export const infoEtapa = (id: string) => ETAPAS.find((e) => e.id === id)!;
export const numeroEtapa = (id: string) => ETAPAS.findIndex((e) => e.id === id) + 1;
export { MAX_ESTRELAS };

/** Guarda a melhor nota de cada etapa (refazer nunca piora). */
export function registrarEstrelas(id: string, n: number) {
  estado.estrelas[id] = Math.max(estado.estrelas[id] ?? 0, n);
  medir('etapa_concluida', { etapa: id, estrelas: n });
}

/** Próxima cena da fila (ou null quando acabou). */
export function proximaEtapa(): string | null {
  const id = estado.fila.shift();
  return id ? infoEtapa(id).cena : null;
}

/** O casal não gostou: recomeça o acarajé do zero (a partir de lavar o feijão), com o mesmo casal e o mesmo pedido. */
export function recomecar() {
  estado.rodada++;
  estado.estrelas = {};
  estado.fila = ETAPAS.map((e) => e.id);
}

// ─── Armazenamento no aparelho (se falhar, o jogo segue) ─────────────────────
export function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem('acarabet:' + chave);
    return v === null ? padrao : (JSON.parse(v) as T);
  } catch {
    return padrao;
  }
}
export function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem('acarabet:' + chave, JSON.stringify(valor));
  } catch {
    /* modo anônimo, armazenamento cheio… */
  }
}

// ─── Medição (eventos do doc técnico, seção 8) ───────────────────────────────
export function medir(nome: string, dados?: Record<string, unknown>) {
  try {
    const corpo = JSON.stringify({ nome, dados });
    if (!navigator.sendBeacon?.('/api/acarabet/evento', corpo)) {
      fetch('/api/acarabet/evento', { method: 'POST', body: corpo, keepalive: true }).catch(() => {});
    }
  } catch {
    /* sem medição, sem problema */
  }
}

export const reduzirMovimento = () => {
  try {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};
