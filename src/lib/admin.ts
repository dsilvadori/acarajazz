import { env } from 'cloudflare:workers';

export const STATUS = {
  novo: 'Novo',
  em_contato: 'Em contato',
  orcamento: 'Orçamento enviado',
  fechado: 'Fechado',
  perdido: 'Perdido',
} as const;
export type Status = keyof typeof STATUS;

export const TIPOS = { evento: 'Evento', curso: 'Curso' } as const;
export type Tipo = keyof typeof TIPOS;

export interface Lead {
  id: number;
  tipo: Tipo;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  dados: string | null;
  consentimento_marketing: number;
  origem: string | null;
  status: Status;
  notas: string | null;
  criado_em: string;
  atualizado_em: string;
}

export const TIPOS_EVENTO: Record<string, string> = {
  aniversario: 'Aniversário',
  corporativo: 'Corporativo / confraternização',
  casamento: 'Casamento',
  outro: 'Outro',
};
export const LOCAIS: Record<string, string> = { acarajazz: 'No Acarajazz', cliente: 'No local do cliente (buffet)' };
/** "2026-12-12" → "12/12/2026" */
export const dataISOparaBR = (iso: unknown) => (typeof iso === 'string' && iso ? iso.split('-').reverse().join('/') : '');

export const ehStatus = (s: string): s is Status => s in STATUS;
export const ehTipo = (t: string): t is Tipo => t in TIPOS;

/** Datas do SQLite estão em UTC ("AAAA-MM-DD HH:MM:SS"); exibe no fuso de São Paulo. */
export function dataBR(utc: string, comHora = true) {
  const d = new Date(utc.replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: comHora ? '2-digit' : 'numeric',
    ...(comHora ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** (11) 98765-4321 a partir de +5511987654321 */
export function telefoneBR(t: string | null) {
  if (!t) return '';
  const d = t.replace(/^\+55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export const linkWhatsapp = (t: string | null, nome = '') =>
  t ? `https://wa.me/${t.replace(/\D/g, '')}?text=${encodeURIComponent(`Oi${nome ? `, ${nome.split(' ')[0]}` : ''}! Aqui é do Acarajazz 🧡`)}` : '';

export interface Filtros {
  tipo?: Tipo;
  status?: Status;
  busca?: string;
}

function where(f: Filtros) {
  const cond: string[] = [];
  const args: unknown[] = [];
  if (f.tipo) { cond.push(`tipo = ?${args.length + 1}`); args.push(f.tipo); }
  if (f.status) { cond.push(`status = ?${args.length + 1}`); args.push(f.status); }
  if (f.busca) {
    const n = args.length + 1;
    cond.push(`(nome LIKE ?${n} OR email LIKE ?${n} OR whatsapp LIKE ?${n} OR dados LIKE ?${n})`);
    args.push(`%${f.busca}%`);
  }
  return { sql: cond.length ? `WHERE ${cond.join(' AND ')}` : '', args };
}

export async function listarLeads(f: Filtros, limite = 200): Promise<Lead[]> {
  const w = where(f);
  const { results } = await env.DB.prepare(`SELECT * FROM leads ${w.sql} ORDER BY criado_em DESC, id DESC LIMIT ${limite}`)
    .bind(...w.args)
    .all<Lead>();
  return results;
}

export async function buscarLead(id: number) {
  return env.DB.prepare('SELECT * FROM leads WHERE id = ?1').bind(id).first<Lead>();
}

export async function atualizarLead(id: number, status: Status, notas: string) {
  await env.DB.prepare(`UPDATE leads SET status = ?2, notas = ?3, atualizado_em = datetime('now') WHERE id = ?1`)
    .bind(id, status, notas || null)
    .run();
}

export async function excluirLead(id: number) {
  await env.DB.prepare('DELETE FROM leads WHERE id = ?1').bind(id).run();
}

export async function resumo() {
  const [porTipoStatus, cupons] = await env.DB.batch([
    env.DB.prepare(`SELECT tipo, status, COUNT(*) AS n FROM leads GROUP BY tipo, status`),
    env.DB.prepare(`SELECT status, COUNT(*) AS n FROM cupons GROUP BY status`),
  ]);
  const contagem = { evento: {} as Record<string, number>, curso: {} as Record<string, number> };
  for (const r of porTipoStatus.results as { tipo: Tipo; status: Status; n: number }[]) {
    contagem[r.tipo][r.status] = r.n;
  }
  const total = (t: Tipo) => Object.values(contagem[t]).reduce((a, b) => a + b, 0);
  const cup = Object.fromEntries((cupons.results as { status: string; n: number }[]).map((r) => [r.status, r.n]));
  return {
    eventosNovos: contagem.evento.novo ?? 0,
    eventosAbertos: (contagem.evento.novo ?? 0) + (contagem.evento.em_contato ?? 0) + (contagem.evento.orcamento ?? 0),
    eventosFechados: contagem.evento.fechado ?? 0,
    eventosTotal: total('evento'),
    cursoTotal: total('curso'),
    cuponsEmitidos: (cup.emitido ?? 0) + (cup.usado ?? 0),
    cuponsUsados: cup.usado ?? 0,
  };
}

/** Lê o JSON de `dados` com segurança */
export function lerDados(l: Pick<Lead, 'dados'>): Record<string, unknown> {
  try {
    return l.dados ? JSON.parse(l.dados) : {};
  } catch {
    return {};
  }
}
