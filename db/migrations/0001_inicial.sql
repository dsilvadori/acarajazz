-- Esquema inicial do site Acarajazz

CREATE TABLE cardapio_categorias (
  id        INTEGER PRIMARY KEY,
  slug      TEXT NOT NULL UNIQUE,
  nome      TEXT NOT NULL,
  subtitulo TEXT,
  ordem     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE cardapio_itens (
  id           INTEGER PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES cardapio_categorias(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  descricao    TEXT,
  preco_centavos INTEGER NOT NULL,
  autoral      INTEGER NOT NULL DEFAULT 0,  -- selo A
  vegetariano  INTEGER NOT NULL DEFAULT 0,  -- selo V
  camarao      INTEGER NOT NULL DEFAULT 0,  -- selo C
  destaque     INTEGER NOT NULL DEFAULT 0,
  ativo        INTEGER NOT NULL DEFAULT 1,
  ordem        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_itens_categoria ON cardapio_itens(categoria_id, ordem);

-- dia_semana: 0 = domingo … 6 = sábado. Horários em "HH:MM", fuso America/Sao_Paulo.
-- fecha pode passar da meia-noite? Não no Acarajazz hoje; se precisar, usar "24:30".
CREATE TABLE horarios (
  dia_semana     INTEGER PRIMARY KEY CHECK (dia_semana BETWEEN 0 AND 6),
  abre           TEXT,             -- NULL = casa fechada
  fecha          TEXT,
  cozinha_fecha  TEXT,
  so_delivery    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE avisos (
  id      INTEGER PRIMARY KEY,
  texto   TEXT NOT NULL,
  inicio  TEXT NOT NULL,            -- data ISO (AAAA-MM-DD)
  fim     TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id          INTEGER PRIMARY KEY,
  tipo        TEXT NOT NULL CHECK (tipo IN ('evento', 'curso')),
  nome        TEXT NOT NULL,
  email       TEXT,
  whatsapp    TEXT,
  dados       TEXT,                 -- JSON com os campos específicos (data, convidados, local…)
  consentimento_contato   INTEGER NOT NULL DEFAULT 0,
  consentimento_marketing INTEGER NOT NULL DEFAULT 0,
  origem      TEXT,                 -- UTMs / página de origem
  status      TEXT NOT NULL DEFAULT 'novo'
              CHECK (status IN ('novo', 'em_contato', 'orcamento', 'fechado', 'perdido')),
  notas       TEXT,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_leads_tipo_status ON leads(tipo, status, criado_em);

CREATE TABLE cupons (
  id         INTEGER PRIMARY KEY,
  codigo     TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  whatsapp   TEXT NOT NULL UNIQUE,  -- normalizado (+55…); garante 1 cupom por cliente
  consentimento_marketing INTEGER NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'emitido' CHECK (status IN ('emitido', 'usado')),
  emitido_em TEXT NOT NULL DEFAULT (datetime('now')),
  usado_em   TEXT
);
