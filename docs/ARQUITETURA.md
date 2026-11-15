# Arquitetura — Site Acarajazz

> Decisões técnicas do site. Complementa o [BRIEFING.md](BRIEFING.md) e o [ACARABET-TECNICO.md](ACARABET-TECNICO.md).
> Última atualização: 15/11/2026

## 1. Decisões

| Tema | Decisão |
|---|---|
| Domínio | **oacarajazz.com** (a comprar; o DNS ficará na Cloudflare) |
| Hospedagem | **Cloudflare Workers** (plano gratuito) |
| Framework | **Astro 7** + adaptador `@astrojs/cloudflare` (renderização no servidor, com páginas estáticas quando possível) |
| Banco de dados | **Cloudflare D1** (SQLite) |
| Mini CRM | Páginas em `/admin` no próprio site |
| Login do admin | **Login fixo** (e-mail + senha). A senha fica só como hash PBKDF2 em segredo da Cloudflare; sessão de 12 h em cookie assinado; bloqueio após 5 erros em 15 min |
| Notificação de leads | **E-mail** para acarajazz.contato@gmail.com via Email Routing (`send_email`) |
| Anti-spam | **Cloudflare Turnstile** |
| Feed do Instagram | Instagram Graph API (conta Business) + Cron Trigger para atualizar o feed e renovar o token |
| Jogo Acarabet | Phaser 3, carregado só em `/acarabet` |
| E-mail marketing do curso | Fora da Cloudflare (ex.: Brevo); o CRM exporta CSV |

**Por que não WordPress:** exigiria hospedagem PHP/MySQL paga, plugins para cupom/CRM/jogo e um tema que lutaria contra o visual personalizado. Com o Astro na Cloudflare, tudo cabe no plano gratuito; o único custo é o domínio.

## 2. Estrutura do projeto

```
acarajazz/
├─ astro.config.mjs        Configuração do Astro + adaptador Cloudflare
├─ wrangler.jsonc          Configuração do Worker e das ligações (D1, e-mail…)
├─ db/
│  ├─ migrations/          Esquema do banco (SQL versionado)
│  └─ seed.sql             Dados iniciais: cardápio e horários
├─ public/                 Arquivos estáticos (favicon, imagens fixas)
├─ src/
│  ├─ components/          Hero, Cardápio, Horários…
│  ├─ layouts/             Layout base (HTML, fontes, tokens de cor)
│  ├─ lib/                 Acesso ao banco, regras de horário
│  ├─ pages/               Rotas: /, /acarabet, /curso, /admin…
│  └─ styles/              Tokens de design e estilos globais
└─ docs/                   Briefing, especificações e referências
```

## 3. Banco de dados (D1)

| Tabela | Conteúdo |
|---|---|
| `cardapio_categorias` | Seções do cardápio (Quitutes, Belisquetes…), com ordem |
| `cardapio_itens` | Nome, descrição, preço (em centavos), selos A/V/C, ordem, ativo |
| `horarios` | Um registro por dia da semana: abertura, fechamento, fechamento da cozinha, só delivery |
| `avisos` | Aviso opcional de mudança de horário, com data de início e de fim |
| `leads` | Contatos de eventos e do curso: tipo, dados, consentimentos, status no funil, notas |
| `cupons` | Cupons do Acarabet: código, nome, WhatsApp (único), status, datas |

O cardápio e os horários ficam no banco para serem editados pelo `/admin`, sem mexer em código.

## 4. Desenvolvimento local

```bash
npm install
npm run db:migrate   # cria as tabelas no D1 local (.wrangler/)
npm run db:seed      # carrega cardápio e horários
npm run dev          # http://localhost:4321
```

O D1 local é um SQLite em `.wrangler/state`, sem precisar de conta na Cloudflare.

## 5. Para publicar (quando o domínio existir)

1. Criar a conta Cloudflare e adicionar o domínio oacarajazz.com.
2. `npx wrangler d1 create acarajazz` → colocar o `database_id` no `wrangler.jsonc`.
3. `npx wrangler d1 migrations apply acarajazz --remote` e rodar o seed remoto.
4. Ativar o Email Routing e verificar acarajazz.contato@gmail.com como destino.
5. Configurar o login do `/admin` (segredos, nunca no código):
   - `node scripts/gerar-hash-senha.mjs` → digitar a senha → copiar o resultado.
   - `npx wrangler secret put ADMIN_SENHA_HASH` → colar o hash.
   - `npx wrangler secret put ADMIN_SESSAO_SEGREDO` → colar um texto aleatório longo (ex.: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`).
   - O e-mail de acesso fica em `ADMIN_EMAIL` no `wrangler.jsonc`.
   - Para **trocar a senha**: gerar um novo hash e repetir o `secret put ADMIN_SENHA_HASH`.
6. `npm run build && npx wrangler deploy`.

## 6. Limites do plano gratuito (conferir antes do lançamento)

Workers: cerca de 100 mil requisições por dia · D1: 5 GB e milhões de leituras por dia · Turnstile: ilimitado. Isso é bem acima da demanda prevista para o Acarajazz.

## 7. Status do desenvolvimento (15/11/2026)

**Pronto (local):** hero das fitinhas, cardápio e horários (D1), status "aberto agora", delivery com mapa do raio de 7 km e "Estou dentro do raio?", seção da chef Bia (rascunho), formulário de eventos (D1 + aviso por e-mail + Turnstile), feed do Instagram (com fotos de reserva), rodapé e política de privacidade (rascunho).

**Pendências antes de publicar:**
- [x] Logo oficial aplicado (PNG 2000 px em docs/referencias/marca/); um SVG ainda seria ideal para nitidez máxima
- [ ] Confirmar que a foto usada (story de 05/03/2026) é da Bia e revisar o texto da seção dela
- [ ] Link oficial do Keeta (keeta.com.br **não** é do app de delivery)
- [ ] Token da Instagram Graph API + renovação automática (Cron)
- [ ] Chaves reais do Turnstile (hoje: chaves de teste)
- [ ] Revisão jurídica da política de privacidade
- [ ] Mapa: os tiles do OpenStreetMap servem para pouco tráfego; avaliar um provedor (ex.: MapTiler, plano gratuito) se o acesso crescer

**Mini CRM `/admin` (pronto, local):** resumo, contatos de eventos e do curso (filtro, busca, status, anotações, excluir por LGPD), exportação CSV (Excel em português), edição do cardápio, horários e avisos. Acesso com login fixo (e-mail + senha) também no desenvolvimento local; a senha local fica em `.dev.vars` (fora do Git), como hash.

**Próximas etapas:** página `/acarabet` (jogo) e validação de cupons no `/admin`.

## 8. Identidade visual

Base: `docs/referencias/marca/` (logo-definitivo.png e banner-curva.pdf).
- **Cores:** vinho `#7a0000`, laranja do banner `#ff9a2e`, creme `#fef5e2`, laranja do acarajé `#f04a00`, amarelo `#ffc03f`.
- **Fontes:** Baloo 2 (títulos, arredondada como no banner) e Nunito (texto).
- **Formas:** ponta em V da flâmula do banner (hero → faixa vinho), arco/círculo do logo nas fotos.
- **Fitinhas do Bonfim:** só como detalhe: três linhas finas, paradas e curvadas (hero e rodapé), sem texto.
