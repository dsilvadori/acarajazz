import { env } from 'cloudflare:workers';

/** Regras da promoção do Acarabet (propostas do briefing; ajustar aqui se a equipe decidir outro valor). */
export const DESCONTO = '10%';
export const DESCONTO_TEXTO = '10% de desconto na primeira compra';
export const VALIDADE_DIAS = 30;
export const ENDERECO_LOJA = 'Rua Dona Inácia Uchôa, 89 · Vila Mariana';

export interface Cupom {
  codigo: string;
  nome: string;
  status: 'emitido' | 'usado';
  emitido_em: string;
  usado_em: string | null;
}

/** Data de validade (fim do dia, no fuso de SP) em ISO yyyy-mm-dd. */
export function validade(emitidoEm: string): string {
  const d = new Date(emitidoEm.replace(' ', 'T') + 'Z');
  d.setUTCDate(d.getUTCDate() + VALIDADE_DIAS);
  return d.toISOString().slice(0, 10);
}

export function vencido(c: Pick<Cupom, 'emitido_em'>, hojeISO: string) {
  return hojeISO > validade(c.emitido_em);
}

/** Código curto e impossível de adivinhar: ACJ- + 6 caracteres sem letras/números ambíguos. */
export function novoCodigo() {
  const alfabeto = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'ACJ-' + [...bytes].map((b) => alfabeto[b % alfabeto.length]).join('');
}

export async function cupomPorWhatsapp(whatsapp: string) {
  return env.DB.prepare(`SELECT codigo, nome, status, emitido_em, usado_em FROM cupons WHERE whatsapp = ?1`)
    .bind(whatsapp)
    .first<Cupom>();
}

export async function cupomPorCodigo(codigo: string) {
  return env.DB.prepare(`SELECT id, codigo, nome, whatsapp, status, emitido_em, usado_em, consentimento_marketing FROM cupons WHERE codigo = ?1`)
    .bind(codigo.trim().toUpperCase())
    .first<Cupom & { id: number; whatsapp: string; consentimento_marketing: number }>();
}

export const EVENTOS_JOGO = new Set([
  'jogo_iniciado', 'etapa_concluida', 'jogo_concluido', 'cupom_gerado', 'imagem_compartilhada', 'imagem_baixada', 'easter_egg',
]);
