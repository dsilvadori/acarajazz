# acarajazz

Site do Acarajazz — acarajé e culinária baiana da chef Bia Souza, na Vila Mariana (SP).
Astro + Cloudflare Workers + D1. Domínio previsto: **oacarajazz.com**.

## Rodar localmente

```bash
npm install
npm run db:migrate   # cria as tabelas no banco D1 local
npm run db:seed      # carrega cardápio e horários
npm run dev          # http://localhost:4321
```

`npm run db:reset` apaga o banco local e recria tudo do zero.

## Documentação

- 📋 [Briefing do projeto](docs/BRIEFING.md)
- 🏗️ [Arquitetura e decisões técnicas](docs/ARQUITETURA.md)
- 🚀 [Publicar na Cloudflare](docs/DEPLOY.md)
- 🎮 [Acarabet — especificação técnica](docs/ACARABET-TECNICO.md)
- 📸 [Conteúdo extraído do Instagram](docs/CONTEUDO-INSTAGRAM.md)
