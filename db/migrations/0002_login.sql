-- Tentativas de login no /admin (limite contra adivinhação de senha)
CREATE TABLE login_tentativas (
  id        INTEGER PRIMARY KEY,
  ip        TEXT NOT NULL,
  sucesso   INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_login_ip ON login_tentativas(ip, criado_em);
