/** Estado da partida do Acarabet, etapas e utilidades (armazenamento e medição). */

export type Roupa = 'baiana' | 'dolma' | 'preta';
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

/** As 10 etapas, na ordem da receita (briefing de arte). */
export const ETAPAS: InfoEtapa[] = [
  { id: 'lavar', cena: 'Lavar', nome: 'LAVAR O FEIJÃO', instrucao: 'ESFREGUE O FEIJÃO COM O DEDO PRA SOLTAR AS CASCAS.' },
  { id: 'moer', cena: 'Moer', nome: 'MOER', instrucao: 'GIRE A MANIVELA EM CÍRCULOS, NO RITMO. NEM DEVAGAR, NEM CORRENDO!' },
  { id: 'vatapa', cena: 'Vatapa', nome: 'VATAPÁ', instrucao: 'TOQUE NOS INGREDIENTES NA ORDEM DA RECEITA. DEPOIS MEXA EM CÍRCULOS PRA NÃO GRUDAR.' },
  { id: 'caruru', cena: 'Caruru', nome: 'CARURU', instrucao: 'ARRASTE CADA QUIABO PRA TÁBUA. A BIA CORTA E JOGA NA PANELA.' },
  { id: 'vinagrete', cena: 'Vinagrete', nome: 'VINAGRETE', instrucao: 'TOQUE PRA CORTAR QUANDO A FACA ESTIVER EM CIMA DO TOMATE. CUIDADO COM O DEDO!' },
  { id: 'camarao', cena: 'Camarao', nome: 'CAMARÃO', instrucao: 'TOQUE NO CAMARÃO QUANDO ELE FICAR ROSADO E BRILHANTE. ANTES DE QUEIMAR!' },
  { id: 'bater', cena: 'Bater', nome: 'BATER A MASSA', instrucao: 'TOQUE RAPIDINHO NA BACIA PRA MASSA FICAR FOFINHA!' },
  { id: 'fritar', cena: 'Fritar', nome: 'FRITAR', instrucao: 'TOQUE NO DENDÊ PRA JOGAR A MASSA. QUANDO DOURAR E BRILHAR, TOQUE PRA VIRAR. DOUROU DE NOVO? TOQUE PRA TIRAR.' },
  { id: 'montar', cena: 'Montar', nome: 'MONTAR', instrucao: 'ARRASTE OS RECHEIOS PRO ACARAJÉ. A PIMENTA SÓ SE O CASAL PEDIU!' },
  { id: 'servir', cena: 'Servir', nome: 'SERVIR', instrucao: 'TOQUE NA MESA DO CASAL PRA BIA LEVAR O ACARAJÉ QUENTINHO.' },
];

const MAX_ESTRELAS = ETAPAS.length * 3;
export const META_SATISFACAO = 20; // de 30 estrelas: o casal fica satisfeito

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
  comPimenta: false,
  estrelas: {} as Record<string, number>,
  fila: [] as string[], // etapas que faltam (na primeira vez, todas; depois, as que vai refazer)
  rodada: 0,
  inicio: 0,
};

export function novaPartida() {
  estado.comPimenta = Math.random() < 0.5;
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

export const satisfeito = () => totalEstrelas() >= META_SATISFACAO || estado.rodada >= 2; // ninguém sai sem cupom
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

/** O casal não ficou satisfeito: refaz as etapas mais fracas (as de 1 estrela; se não houver, as de 2). */
export function prepararRefazer() {
  estado.rodada++;
  const fracas = ETAPAS.filter((e) => e.id !== 'servir' && (estado.estrelas[e.id] ?? 0) <= 1).map((e) => e.id);
  const medias = ETAPAS.filter((e) => e.id !== 'servir' && (estado.estrelas[e.id] ?? 0) === 2).map((e) => e.id);
  estado.fila = [...(fracas.length ? fracas : medias.slice(0, 3)), 'servir'];
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
