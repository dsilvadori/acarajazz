import { env } from 'cloudflare:workers';

export interface ItemCardapio {
  id: number;
  nome: string;
  descricao: string | null;
  preco_centavos: number;
  autoral: number;
  vegetariano: number;
  camarao: number;
  destaque: number;
}

export interface CategoriaCardapio {
  id: number;
  slug: string;
  nome: string;
  subtitulo: string | null;
  itens: ItemCardapio[];
}

export interface Horario {
  dia_semana: number;
  abre: string | null;
  fecha: string | null;
  cozinha_fecha: string | null;
  so_delivery: number;
}

export async function getCardapio(): Promise<CategoriaCardapio[]> {
  const [cats, itens] = await env.DB.batch([
    env.DB.prepare('SELECT id, slug, nome, subtitulo FROM cardapio_categorias ORDER BY ordem'),
    env.DB.prepare(
      `SELECT id, categoria_id, nome, descricao, preco_centavos, autoral, vegetariano, camarao, destaque
       FROM cardapio_itens WHERE ativo = 1 ORDER BY ordem`,
    ),
  ]);
  const porCategoria = new Map<number, ItemCardapio[]>();
  for (const item of itens.results as (ItemCardapio & { categoria_id: number })[]) {
    const lista = porCategoria.get(item.categoria_id) ?? [];
    lista.push(item);
    porCategoria.set(item.categoria_id, lista);
  }
  return (cats.results as Omit<CategoriaCardapio, 'itens'>[])
    .map((c) => ({ ...c, itens: porCategoria.get(c.id) ?? [] }))
    .filter((c) => c.itens.length > 0);
}

export async function getHorarios(): Promise<Horario[]> {
  const { results } = await env.DB.prepare('SELECT * FROM horarios ORDER BY dia_semana').all<Horario>();
  return results;
}

export async function getAvisoAtivo(hojeISO: string): Promise<string | null> {
  const row = await env.DB.prepare(
    'SELECT texto FROM avisos WHERE inicio <= ?1 AND fim >= ?1 ORDER BY id DESC LIMIT 1',
  )
    .bind(hojeISO)
    .first<{ texto: string }>();
  return row?.texto ?? null;
}
