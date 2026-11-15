import type { Horario } from './db';

export const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** Data/hora atual no fuso de São Paulo, independente do servidor. */
export function agoraSP(now = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday);
  return {
    dia,
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
    dataISO: `${partes.year}-${partes.month}-${partes.day}`,
  };
}

const paraMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "17:00" → "17h", "23:30" → "23h30" */
export const formatarHora = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

export type Status =
  | { tipo: 'aberto'; texto: string; detalhe: string }
  | { tipo: 'delivery'; texto: string; detalhe: string }
  | { tipo: 'fechado'; texto: string; detalhe: string };

export function statusAgora(horarios: Horario[], now = new Date()): Status {
  const { dia, minutos } = agoraSP(now);
  const hoje = horarios.find((h) => h.dia_semana === dia);

  if (hoje?.abre && hoje.fecha) {
    const abre = paraMin(hoje.abre);
    const fecha = paraMin(hoje.fecha);
    if (minutos >= abre && minutos < fecha) {
      const cozinha = hoje.cozinha_fecha ? ` · cozinha até ${formatarHora(hoje.cozinha_fecha)}` : '';
      return { tipo: 'aberto', texto: 'Casa aberta', detalhe: `até ${formatarHora(hoje.fecha)}${cozinha}` };
    }
    if (minutos < abre) {
      return { tipo: 'fechado', texto: 'Abre hoje', detalhe: `às ${formatarHora(hoje.abre)}` };
    }
  }
  if (hoje?.so_delivery) {
    return { tipo: 'delivery', texto: 'Hoje é dia de delivery', detalhe: 'peça no iFood ou no Keeta' };
  }
  // Próxima abertura
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7;
    const h = horarios.find((x) => x.dia_semana === d);
    if (h?.abre) {
      const quando = i === 1 ? 'amanhã' : DIAS_CURTOS[d];
      return { tipo: 'fechado', texto: 'Fechado agora', detalhe: `abre ${quando} às ${formatarHora(h.abre)}` };
    }
  }
  return { tipo: 'fechado', texto: 'Fechado agora', detalhe: '' };
}

/** 3000 → "30" · 4250 → "42,50" */
export const formatarPreco = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: centavos % 100 ? 2 : 0, maximumFractionDigits: 2 });
