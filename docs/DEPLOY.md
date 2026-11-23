# Publicar na Cloudflare

> Um único site. Primeiro ele vai ao ar no endereço provisório gratuito `acarajazz.<sua-conta>.workers.dev`
> (fora do Google), para testes. No lançamento, o domínio **oacarajazz.com** é ligado a esse mesmo site:
> o banco, os contatos e o cardápio continuam os mesmos.

---

## Parte 1 — Publicar agora (sem domínio)

### Antes de começar
- Conta gratuita na Cloudflare: https://dash.cloudflare.com/sign-up (sugestão: acarajazz.contato@gmail.com).
- No painel, abrir **Workers e Pages** uma vez e escolher o **subdomínio workers.dev** da conta (ex.: `acarajazz`).
  O site ficará em `acarajazz.acarajazz.workers.dev`.

### Passo a passo (terminal, na pasta do projeto)

1. **Conectar o terminal à conta** (abre o navegador para autorizar):
   ```bash
   npx wrangler login
   ```
2. **Criar o banco de dados** e colar o `database_id` mostrado no `wrangler.jsonc`:
   ```bash
   npx wrangler d1 create acarajazz
   ```
3. **Criar as tabelas e carregar cardápio e horários:**
   ```bash
   npm run db:migrate:remoto
   npm run db:seed:remoto
   ```
4. **Publicar:**
   ```bash
   npm run deploy
   ```
5. **Cadastrar os segredos** (cada comando pede o valor; nada fica no código):
   ```bash
   # Senha do painel: gerar o hash e colar no comando seguinte
   node scripts/gerar-hash-senha.mjs
   npx wrangler secret put ADMIN_SENHA_HASH

   # Segredo da sessão: gerar e colar no comando seguinte
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   npx wrangler secret put ADMIN_SESSAO_SEGREDO

   # Turnstile de teste até o lançamento (sempre aprova)
   npx wrangler secret put TURNSTILE_SECRET
   #   → valor: 1x0000000000000000000000000000000AA
   ```
6. **Testar:** abrir o endereço, enviar os formulários de eventos e do curso, entrar no `/admin`.

### Nova versão
O push na `main` já publica: a Cloudflare (Workers Builds) faz o build e o deploy sozinha em poucos minutos.
Para conferir, veja Workers & Pages → acarajazz → Deployments, ou o check "Workers Builds: acarajazz" no commit, no GitHub.

Se o push não disparar o build (já aconteceu uma vez), publique por aqui:
```bash
npm run deploy
```
Se houver migração nova no banco, rodar `npm run db:migrate:remoto` antes.
⚠️ **Não rodar `db:seed:remoto` de novo** depois que a equipe editar o cardápio pelo `/admin`: ele recria o cardápio do zero.

### Enquanto estiver no endereço provisório
- **Fora do Google** (`AMBIENTE = "pre-lancamento"` → cabeçalho `noindex`).
- **E-mail de aviso não sai** (precisa do domínio). Os contatos são salvos e aparecem no `/admin`.
- **Turnstile de teste**: a caixinha mostra "Somente para teste".

---

### Cardápio inicial pelo painel (alternativa ao terminal)
Banco de dados SQLite D1 → acarajazz → **Console** → colar o conteúdo de `db/seed-console.sql` (versão sem comentários) → Executar. **Só uma vez.**

### Formulários
`"FORMULARIOS": "abertos"` ou `"fechados"` no `wrangler.jsonc` (depois, push na `main`). Antes do domínio, os contatos são salvos e aparecem no `/admin`, mas o e-mail de aviso não sai.

## Parte 2 — Lançamento: ligar o oacarajazz.com

1. **Comprar o domínio** no Cloudflare Registrar (Domain Registration → Register Domains). Ele já fica com o DNS na Cloudflare.
2. **E-mail de aviso:** Email → Email Routing → ativar no domínio e **verificar** acarajazz.contato@gmail.com como destino.
3. **Turnstile de verdade:** Turnstile → Add widget → domínio `oacarajazz.com` → copiar a *Site Key* e a *Secret Key*.
4. **No `wrangler.jsonc`:**
   - descomentar `"routes"` (oacarajazz.com e www);
   - descomentar `"send_email"`;
   - `"TURNSTILE_SITE_KEY"` → a Site Key real;
   - `"AMBIENTE"` → `"producao"` (libera o Google).
5. **Segredos:**
   ```bash
   npx wrangler secret put TURNSTILE_SECRET       # Secret Key real do Turnstile
   node scripts/gerar-hash-senha.mjs              # recomendado: senha nova para o painel
   npx wrangler secret put ADMIN_SENHA_HASH
   ```
6. **Publicar:** `npm run deploy`. Em poucos minutos o site responde em https://oacarajazz.com.
7. **Conferir:** formulário de evento chega no e-mail? Turnstile sem o aviso de teste? `/admin` entra?
8. **Opcional:** desligar o endereço provisório (`"workers_dev": false`) e publicar de novo.

---

## WhatsApp: só Brasil e sem robôs

Os botões do WhatsApp apontam para `/whatsapp` (`src/pages/whatsapp.ts`), nunca direto para o `wa.me`:

- **Fora do Brasil** (país do Cloudflare diferente de `BR`, inclusive Tor): página avisando, em português e inglês, que o WhatsApp é só para o Brasil, com o link do Instagram. Os formulários (`/api/*`) também recusam envios de fora (`src/middleware.ts`).
- **No Brasil:** verificação do Turnstile (a mesma chave dos formulários) e redirecionamento para o `wa.me`.

Enquanto a chave do Turnstile for a de teste, a verificação sempre aprova: só o bloqueio por país vale de verdade. Trocar pelas chaves reais (passo 3 e 5 do lançamento) liga a proteção no WhatsApp e nos formulários ao mesmo tempo. O número continua escrito no rodapé, então quem o copiar dali não passa pela verificação.
