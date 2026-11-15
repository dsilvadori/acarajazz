# Briefing — Site Acarajazz

> Documento de referência do projeto. Define **o que** o site precisa ter e **por quê**, antes de qualquer decisão de implementação.
> Última atualização: 15/11/2026

---

## 1. Visão geral

**Acarajazz** é um restaurante de acarajé e culinária baiana comandado pela **chef Bia Souza**, localizado na **Rua Dona Inácia Uchoa, 89 — Vila Mariana, São Paulo/SP**.

O site tem quatro papéis:

1. **Vitrine da marca** — transmitir a identidade baiana com uma experiência visual bonita e única.
2. **Informação prática** — cardápio, dias e horários de funcionamento, localização e delivery.
3. **Geração de receita** — levar pedidos para iFood/Keeta e captar leads de eventos.
4. **Construção de audiência** — engajamento (jogo Acarabet, Instagram) e lista de pré-lançamento do curso.

### Objetivos mensuráveis (a validar)

| Objetivo | Métrica sugerida |
|---|---|
| Aumentar pedidos via delivery | Cliques nos botões iFood / Keeta |
| Captar eventos | Nº de formulários de evento enviados |
| Engajamento social | Partidas do Acarabet + resgates de cupom |
| Pré-venda do curso | Nº de inscritos na lista do curso |

---

## 2. Identidade visual e direção de arte

### Conceito central
**Fitinhas do Senhor do Bonfim.** O site deve parecer baiano sem cair no clichê — elegante, colorido e com movimento. O nome "Acara**jazz**" sugere também ritmo, improviso e musicalidade, que podem aparecer nas animações e na tipografia.

### Hero (primeira dobra)
- Layout com **formas curvas** (sem blocos retos/quadrados tradicionais).
- **Fitinhas do Bonfim curvadas e onduladas** atravessando a tela, nas cores **amarela, azul e vermelha**.
- Cada fitinha traz **texto impresso**, como nas fitas reais — ex.: *"Lembrança do Senhor do Bonfim da Bahia"* — seguindo a curva da fita.
- Movimento sutil (fitas balançando ao vento / ao rolar a página), respeitando `prefers-reduced-motion`.
- Logo, frase de impacto e chamadas principais: **Peça agora** (delivery) e **Ver cardápio**.

### Paleta (proposta inicial)
| Papel | Cor |
|---|---|
| Fitinha 1 | Amarelo |
| Fitinha 2 | Azul |
| Fitinha 3 | Vermelho |
| Apoio | Tons de dendê / laranja, branco, neutros quentes |

> Pendente: logo oficial, tipografia e paleta exata da marca (se já existirem).

### Princípios
- Mobile first — a maioria do público virá do Instagram, no celular.
- Elementos curvos e fitas como fio condutor entre as seções (divisores de seção em formato de fita).
- Fotos reais dos pratos e da chef, com boa qualidade.
- Acessibilidade: contraste adequado, textos alternativos, navegação por teclado.

---

## 3. Mapa do site

```
/                       Home (página única com seções)
│  ├─ Hero (fitinhas do Bonfim)
│  ├─ Cardápio
│  ├─ Dias e horários de funcionamento
│  ├─ Delivery (iFood + Keeta, raio de 7 km)
│  ├─ Sobre a chef Bia Souza
│  ├─ Eventos (formulário de orçamento)
│  ├─ Feed do Instagram
│  └─ Rodapé (endereço, mapa, contatos, redes)
│
/acarabet               Página do jogo Acarabet
/acaraje-alem-da-receita                  Landing page de captação — Curso "Acarajé além da receita"
/politica-de-privacidade   Exigida pela LGPD (formulários de lead)
```

---

## 4. Seções e páginas — requisitos

### 4.1 Cardápio
- Lista de pratos organizada por categoria (ex.: acarajés, abarás, bebidas, sobremesas…).
- Cada item: nome, descrição curta, preço, foto (quando houver) e marcações (vegano, picante etc.).
- **Fonte das informações:** levantamento do Instagram em [CONTEUDO-INSTAGRAM.md](CONTEUDO-INSTAGRAM.md#3-cardápio--o-que-aparece-no-instagram). ✅ Cardápio fixo completo, com preços confirmados (cerca de 60 itens em 10 categorias, com marcações A/V/C). Só o cardápio fixo entra no site.
- Deve ser **fácil de atualizar** (preços e itens mudam).

### 4.2 Dias e horários de funcionamento
- Tabela clara por dia da semana.
- Indicador "**Aberto agora / Fechado**" calculado pelo horário de São Paulo.
- Espaço opcional para avisos de mudança de horário (feriados), que fica vazio por padrão e é retirado depois.
- ✅ **Levantado** ([CONTEUDO-INSTAGRAM.md](CONTEUDO-INSTAGRAM.md#2-dias-e-horários-de-funcionamento)): Qua só delivery · Qui e Sex 17h–23h · Sáb 12h–23h30 · Dom 12h–17h30 · Seg e Ter fechado.

### 4.3 Delivery
- Seção de destaque divulgando que o Acarajazz está no **iFood** e no **Keeta**.
- ✅ **Decidido: sem link direto para a loja.** O site orienta: **"Abra o iFood ou o Keeta e busque por _Acarajazz_"**.
  - Botões "Abrir o iFood" e "Abrir o Keeta" levam para o app ou site de cada plataforma (página inicial), não para a loja.
  - Destaque visual para o nome a buscar, por exemplo um "campo de busca" ilustrado com *Acarajazz* digitado.
- Comunicar a **área de entrega: raio de 7 km** a partir da Rua Dona Inácia Uchoa, 89 — Vila Mariana.
- **Aviso obrigatório:** "Não encontrou o Acarajazz no app? Seu endereço pode estar fora do nosso raio de entrega de 7 km. Vem comer com a gente na casinha!", com link para o mapa e o endereço.
- Desejável: **mapa com o círculo de 7 km** e/ou campo "Verifique se entregamos no seu CEP", para a pessoa saber **antes** de abrir o app se está dentro do raio.
- Lembrar: **quarta-feira é só delivery**.

### 4.4 Eventos — formulário de captação de leads
Duas modalidades:
- **No Acarajazz** (evento no restaurante);
- **No local do cliente** (buffet / food service externo).

Campos sugeridos:
| Campo | Obrigatório |
|---|---|
| Nome | Sim |
| Telefone / WhatsApp | Sim |
| E-mail | Sim |
| Tipo de evento (aniversário, corporativo, casamento, outro) | Sim |
| Local: no Acarajazz ou no local do cliente | Sim |
| Endereço / bairro do evento (se for no local do cliente) | Condicional |
| Data prevista | Sim |
| Nº estimado de convidados | Sim |
| Mensagem / detalhes | Não |
| Consentimento LGPD | Sim |

- Leads devem ser **armazenados** (planilha, CRM ou banco) e gerar **notificação** para a equipe (e-mail e/ou WhatsApp).
- Mensagem de confirmação para quem enviou.

### 4.5 Sobre a chef Bia Souza
- Foto(s) da chef.
- História, trajetória, origem e relação com a culinária baiana.
- Filosofia da cozinha / do Acarajazz.
- Pode servir de ponte para a página do curso.

> Rascunho de história no [CONTEUDO-INSTAGRAM.md](CONTEUDO-INSTAGRAM.md#7-material-para-sobre-a-chef-bia-souza) (receita de família, começo no iFood de casa em 2021, barraca no metrô Jabaquara, Wagner Moura, UOL). Pendente: revisão da Bia e fotos oficiais.

### 4.6 Feed do Instagram integrado
- Exibir as publicações mais recentes do perfil do Acarajazz.
- Link "Siga a gente no Instagram".
- ✅ **Decidido:** o Acarajazz tem conta **Business** → integração oficial via *Instagram Graph API* (com renovação automática do token).

### 4.7 Página `/acarabet` — jogo Acarabet
> 📄 Briefing de arte (mecânica, etapas, personagens, paleta): https://claude.ai/artifact/7z2pXWuYi4hDxWdmSoq6Ap
> 🛠️ Especificação técnica: [ACARABET-TECNICO.md](ACARABET-TECNICO.md)

- Jogo em **pixel art**, tela em pé: a Bia faz um acarajé do começo ao fim em 10 minijogos rápidos.
- Não tem sorte: quem completa e satisfaz o cliente **sempre ganha** o cupom ("a bet em que todo mundo ganha").
- Ao final, gera uma **imagem 1080 × 1920 para os Stories**, com o código do cupom.
- Regras e termos da promoção visíveis na página.
- ✅ **Decidido:** a página deixa claro, de forma visível, que o jogo é **100% gratuito, sem dinheiro e sem aposta**.
- ✅ **Decidido:** a validação é **presencial**: o cliente mostra no balcão o Stories publicado e o código; a equipe confere e marca o cupom como usado.
- ✅ **Decidido:** o cupom vale **só na loja física**.
- ✅ **Decidido:** o desconto vale **só na primeira compra**. **Um cupom por cliente**: jogar de novo é permitido, mas não gera outro cupom. Para isso, o cupom é liberado com nome + WhatsApp (ver especificação técnica, seção 5).

#### Proposta de desconto (sugestão)
| Regra | Sugestão |
|---|---|
| Desconto | **10% na primeira compra** |
| Onde vale | ✅ **Somente na loja física** (não vale no iFood/Keeta) |
| Comprovação | Stories publicado marcando o @ do Acarajazz + código do cupom |
| Limite | 1 cupom por cliente (por número de WhatsApp) |
| Cumulatividade | Não cumulativo com outras promoções |
| Validade | 30 dias após a emissão do cupom |

**Por que 10%:** chama atenção sem pesar na margem. Como agora é um desconto único de boas-vindas, há espaço para subir para **15%** se quiser um gancho mais forte. O retorno real é a divulgação orgânica nos Stories e a primeira visita do cliente.

**Alternativa:** um brinde de primeira visita (ex.: uma cocada), com custo fixo e fácil de comunicar.

⚠️ O briefing de arte ainda cita "usar no iFood"; esse trecho deve ser ajustado para "na loja".

Pendente: a chef/equipe aprovar o valor.

### 4.8 Página `/acaraje-alem-da-receita` — Curso "Acarajé além da receita"
> ✅ **Implementada (15/11/2026)** com base no documento-base do curso. Sem data de lançamento: a página capta interessados (nome, e-mail, WhatsApp + perfil, formato preferido e cidade, opcionais). Conteúdo interno do documento (finanças, investimento, dívidas) **não** vai para o site.
Landing page de **pré-lançamento** para captar potenciais alunos.
- Apresentação do curso e da chef Bia Souza.
- Promessa / o que o aluno vai aprender (alto nível).
- Formulário de lista de espera:
  - **Nome** (obrigatório)
  - **E-mail** (obrigatório)
  - **Telefone / WhatsApp** (obrigatório)
  - Consentimento LGPD para receber comunicações (obrigatório)
- Possíveis reforços de conversão: "vagas limitadas na pré-venda", condição especial para a lista, contador de inscritos (opcional).
- Leads exportáveis para a ferramenta de e-mail marketing / WhatsApp da estratégia de lançamento.
- Rastreamento de origem (UTMs) para saber de onde vêm os inscritos.

### 4.9 Rodapé
- Endereço completo + mapa (Google Maps).
- Contatos públicos: telefone e **WhatsApp (11) 97956-4494** (botão para wa.me/5511979564494) e e-mail **acarajazz.contato@gmail.com**.
- Links para Instagram (@o_acarajazz), iFood, Keeta e WhatsApp.
- Link para o **Kangaça** ([kangaca.com.br](https://kangaca.com.br)), outro espaço da mesma equipe. É só um link, sem conteúdo do Kangaça no site.
- Link para a política de privacidade.

---

## 5. Requisitos não funcionais

- **Conteúdo atemporal:** eventos especiais e datas comemorativas (Halloween, Dia das Mães, Páscoa, Copa etc.) **não entram no site**, para ele não ficar datado. Novidades e eventos ficam no Instagram, que o site mostra pelo feed integrado.

- **Desempenho:** carregamento rápido no 4G; imagens otimizadas (WebP/AVIF, lazy load).
- **SEO local:** título/descrição por página, dados estruturados `Restaurant` (schema.org) com endereço, horários e cardápio; integração com Google Business Profile.
- **Compartilhamento:** imagens Open Graph para links no WhatsApp/Instagram.
- **Acessibilidade:** WCAG AA como meta.
- **LGPD:** consentimento explícito em todos os formulários, política de privacidade, finalidade clara dos dados.
- **Analytics:** medição dos eventos-chave da seção 1 (cliques no delivery, envios de formulário, partidas do jogo).
- **Anti-spam** nos formulários (honeypot ou captcha leve).

---

## 6. Considerações técnicas a decidir

| Tema | Pontos de atenção |
|---|---|
| **Feed do Instagram** | ✅ Conta **Business** disponível → *Instagram Graph API* com token de longa duração e renovação automática. |
| **Cardápio e horários "vindos do Instagram"** | ✅ **Manual:** levantamento feito uma única vez a partir do Instagram. Depois, as atualizações são feitas direto no site (arquivo de dados ou painel simples). |
| **Armazenamento de leads** | Opções: Google Sheets, banco próprio, CRM, ferramenta de e-mail marketing. Eventos e curso podem ir para listas separadas. |
| **Validação do desconto do Acarabet** | ✅ **Presencial**, mas com **1 cupom por cliente** → precisa de um backend mínimo (API do cupom + banco + página de validação para a equipe). Ver [ACARABET-TECNICO.md](ACARABET-TECNICO.md). |
| **Mapa do raio de 7 km** | Mapa estático com círculo vs. verificação por CEP (geocodificação). Ganha importância porque, fora do raio, a loja não aparece nos apps. |
| **Hospedagem e domínio** | Domínio existente? Onde hospedar? |
| **Stack** | A definir após aprovação do briefing. |

---

## 7. Conteúdos e insumos necessários (checklist)

- [x] Conta Business do Instagram (confirmado)
- [ ] @ do Instagram e conexão com um app da Meta (para a Graph API)
- [x] Levantamento do Instagram → [CONTEUDO-INSTAGRAM.md](CONTEUDO-INSTAGRAM.md) (@o_acarajazz)
- [x] Dias e horários de funcionamento
- [x] Cardápio fixo transcrito (seção 3.1 do CONTEUDO-INSTAGRAM.md)
- [x] Telefone e e-mail liberados para o site
- [x] iFood/Keeta: sem link direto; orientar a buscar "Acarajazz" no app
- [ ] Logo em vetor (SVG/AI/PDF) e identidade visual existente
- [ ] Fotos dos pratos, do espaço e da chef Bia Souza
- [ ] Texto biográfico da chef
- [x] WhatsApp / e-mail: (11) 97956-4494 · acarajazz.contato@gmail.com
- [x] Notificação de leads (eventos, curso, Acarabet): por **e-mail** para acarajazz.contato@gmail.com
- [ ] Aprovação das regras da promoção Acarabet (proposta: 10% na primeira compra — ver 4.7)
- [ ] Artes do jogo conforme o briefing de arte (começando pela Bia, a bancada e a etapa de fritar)
- [ ] Informações do curso "Acarajé além da receita" (proposta, previsão de lançamento, condição de pré-venda)
- [ ] Domínio do site

---

## 8. Perguntas em aberto

1. ~~**Acarabet:** qual é o jogo?~~ → Definido no briefing de arte: pixel art, 10 minijogos da receita do acarajé.
2. ~~**Acarabet:** qual o desconto e onde ele é usado?~~ → Validação presencial; proposta de 10% no local (aguardando aprovação).
3. **Eventos:** há cardápios/pacotes de eventos e faixas de preço para mostrar no site?
4. **Eventos no local do cliente:** existe limite de distância ou número mínimo de convidados?
5. **Curso:** formato (online, presencial, híbrido) e data prevista de lançamento?
6. **Curso:** haverá oferta especial para a lista de espera?
7. **Idioma:** apenas português ou também inglês (turistas)?
8. **Música/jazz:** o restaurante tem música ao vivo ou programação que deva aparecer no site?
9. Já existe alguma ferramenta de e-mail marketing ou CRM em uso?

---

## 9. Próximos passos

1. Revisar e aprovar este briefing; responder às perguntas em aberto.
2. Coletar os insumos da seção 7.
3. Definir stack, hospedagem e ferramentas de leads.
4. Wireframe / protótipo da Home (com foco na hero das fitinhas).
5. Desenvolvimento por fases:
   - **Fase 1:** Home completa (hero, cardápio, horários, delivery, chef, eventos, Instagram) + política de privacidade.
   - **Fase 2:** Landing page do curso.
   - **Fase 3:** Jogo Acarabet.
