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
| Login do admin | **Cloudflare Access** (código por e-mail, até 50 usuários grátis) |
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
5. Configurar o Cloudflare Access para `/admin` com os e-mails da equipe.
6. `npm run build && npx wrangler deploy`.

## 6. Limites do plano gratuito (conferir antes do lançamento)

Workers: cerca de 100 mil requisições por dia · D1: 5 GB e milhões de leituras por dia · Access: até 50 usuários · Turnstile: ilimitado. Isso é bem acima da demanda prevista para o Acarajazz.
