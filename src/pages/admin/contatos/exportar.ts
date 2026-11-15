import type { APIRoute } from 'astro';
import { dataBR, dataISOparaBR, ehStatus, ehTipo, lerDados, listarLeads, LOCAIS, STATUS, telefoneBR, TIPOS_EVENTO } from '../../../lib/admin';
import { FORMATOS, PERFIS } from '../../../lib/curso';

// CSV para Excel/Google Planilhas em português: separador ";" e BOM UTF-8 (acentos corretos).
const celula = (v: unknown) => {
  const s = String(v ?? '');
  // Evita que o Excel interprete o conteúdo como fórmula
  const seguro = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${seguro.replace(/"/g, '""')}"`;
};

export const GET: APIRoute = async ({ url }) => {
  const tipo = url.searchParams.get('tipo') ?? 'evento';
  if (!ehTipo(tipo)) return new Response('Tipo inválido', { status: 400 });
  const st = url.searchParams.get('status') ?? '';
  const busca = (url.searchParams.get('busca') ?? '').trim().slice(0, 80);
  const leads = await listarLeads({ tipo, status: ehStatus(st) ? st : undefined, busca: busca || undefined }, 10000);

  const cabecalho =
    tipo === 'evento'
      ? ['Nº', 'Recebido em', 'Nome', 'WhatsApp', 'E-mail', 'Tipo de evento', 'Onde', 'Endereço', 'Data do evento', 'Convidados', 'Mensagem', 'Status', 'Anotações', 'Origem']
      : ['Nº', 'Recebido em', 'Nome', 'WhatsApp', 'WhatsApp (só números)', 'E-mail', 'Perfil', 'Formato preferido', 'Cidade', 'Aceita novidades', 'Status', 'Anotações', 'Origem'];

  const linhas = leads.map((l) => {
    const d = lerDados(l);
    return tipo === 'evento'
      ? [l.id, dataBR(l.criado_em), l.nome, telefoneBR(l.whatsapp), l.email, TIPOS_EVENTO[String(d.tipo_evento)] ?? '', LOCAIS[String(d.local)] ?? '', d.endereco, dataISOparaBR(d.data), d.convidados, d.mensagem, STATUS[l.status], l.notas, l.origem]
      : [l.id, dataBR(l.criado_em), l.nome, telefoneBR(l.whatsapp), l.whatsapp?.replace(/\D/g, ''), l.email, PERFIS[String(d.perfil)] ?? '', FORMATOS[String(d.formato)] ?? '', d.cidade, l.consentimento_marketing ? 'Sim' : 'Não', STATUS[l.status], l.notas, l.origem];
  });

  const csv = '\uFEFF' + [cabecalho, ...linhas].map((r) => r.map(celula).join(';')).join('\r\n');
  const hoje = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="acarajazz-${tipo === 'evento' ? 'eventos' : 'curso'}-${hoje}.csv"`,
    },
  });
};
