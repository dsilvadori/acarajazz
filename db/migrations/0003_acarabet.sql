-- Acarabet: medição do jogo e limite de pedidos de cupom por IP
CREATE TABLE jogo_eventos (
  id        INTEGER PRIMARY KEY,
  nome      TEXT NOT NULL,          -- jogo_iniciado, etapa_concluida, jogo_concluido, cupom_gerado, imagem_compartilhada…
  dados     TEXT,                   -- JSON curto (ex.: {"etapa":"fritar","estrelas":3})
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_jogo_eventos ON jogo_eventos(nome, criado_em);

CREATE TABLE cupom_tentativas (
  id        INTEGER PRIMARY KEY,
  ip        TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cupom_ip ON cupom_tentativas(ip, criado_em);
