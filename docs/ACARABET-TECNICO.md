# Acarabet — Especificação técnica

> O que é preciso, em tecnologia, para o jogo rodar em qualquer navegador: simples, bonito e funcional.
> Complementa o [briefing de arte do jogo](https://claude.ai/artifact/7z2pXWuYi4hDxWdmSoq6Ap) e a seção 4.7 do [BRIEFING.md](BRIEFING.md).
> Última atualização: 15/11/2026

---

## 1. Resumo do jogo (do briefing de arte)

- Jogo em **pixel art**, tela **em pé** (formato story), jogado com toque ou clique.
- A Bia faz um acarajé do começo ao fim em **10 minijogos** curtos (20–40 s cada): lavar, moer, vatapá, caruru, vinagrete, camarão, bater a massa, **fritar**, **montar** e **servir**.
- Cada etapa dá de 1 a 3 estrelas → enche o **medidor de satisfação** do cliente.
- Não tem sorte: quem completa e satisfaz o cliente **sempre ganha** o cupom.
- Final: bilhete de aposta de brincadeira ("chance de ganhar: 100%") + cupom + **imagem 1080 × 1920 para os Stories**.

## 2. Regra do cupom (decidida)

- O desconto vale **apenas na primeira compra** do cliente.
- **Cada cliente recebe um único cupom.** Quem jogar de novo pode jogar à vontade, mas o jogo **não gera outro cupom**.
- A validação é **presencial**: no balcão, o cliente mostra o Stories publicado e o código do cupom. A equipe confere e marca o cupom como usado.

- ✅ O cupom vale **somente na loja física** (balcão do Acarajazz). Não vale no iFood nem no Keeta.

> Ajuste pendente no briefing de arte: trocar "para usar no balcão ou no pedido" e "mostrar no balcão ou usar no iFood" por "para usar na loja".

Isso exige identificar o cliente → ver seção 5.

---

## 3. Tecnologia do jogo (frontend)

### 3.1 Base
| Item | Escolha | Por quê |
|---|---|---|
| Renderização | **HTML5 Canvas 2D** | Funciona em todos os navegadores modernos; perfeito para pixel art. WebGL não é necessário. |
| Motor | **Phaser 3** (recomendado) | Já resolve escala, toque/mouse, cenas, animação de sprites, áudio no iOS e carregamento. Carregado **só na página `/acarabet`**, sem pesar o resto do site. |
| Alternativa | JavaScript puro + Canvas | Mais leve, mas exige refazer o que o Phaser já entrega (áudio no iOS, escala, input). Só vale se o jogo ficar bem menor que o previsto. |
| Linguagem | TypeScript | Evita erros nos 10 minijogos e no fluxo do cupom. |

### 3.2 Tela e pixel art
- Mundo do jogo com **180 × 320 px**, ampliado sempre por **número inteiro** (×2, ×3, ×4, ×6…) para não borrar.
- Suavização desligada: `pixelArt: true` no Phaser (equivale a `imageSmoothingEnabled = false` + `image-rendering: pixelated`).
- Sobra de tela (quando a ampliação inteira não preenche) vira **moldura decorativa** com as cores da marca, nunca distorção.
- **Celular em pé:** ocupa a tela toda, respeitando *safe areas* (notch, barra de gestos).
- **Celular deitado:** mostra o aviso "Vire o celular" com animação da Bia.
- **Computador:** coluna central em pé, jogável com o mouse.

### 3.3 Controles (toque e mouse)
Usar **Pointer Events**, que unificam toque, mouse e caneta. Cada minijogo usa um dos gestos:

| Gesto | Etapas | Como detectar |
|---|---|---|
| Esfregar | Lavar o feijão | Distância percorrida pelo dedo sobre a área |
| Girar em círculo | Moer (manivela), vatapá (mexer) | Variação do ângulo do dedo em volta do centro |
| Tocar no tempo certo | Vinagrete, camarão, fritar | Toque dentro de uma janela de tempo |
| Tocar rápido | Bater a massa | Toques por segundo |
| Arrastar e soltar | Montar, caruru | Arraste até a zona de destino |

- `touch-action: none` na área do jogo → sem rolagem, zoom ou "puxar para atualizar" durante o jogo.
- Alvos de toque grandes (mínimo de ~44 px na tela real).
- Mão de tutorial animada no primeiro uso de cada gesto.

### 3.4 Animação e desempenho
- Laço com `requestAnimationFrame` a 60 fps; sprites animados a ~8 quadros por segundo (como pede o briefing de arte).
- **Pausa automática** quando o usuário troca de aba ou de app (`visibilitychange`).
- Meta: rodar liso em **Android de entrada** (ex.: aparelhos com 2–3 GB de RAM).

### 3.5 Arquivos de arte e som
- Sprites em **PNG** com fundo transparente, juntados num **atlas de texturas** (uma imagem só) → menos downloads.
- **Fonte em pixel como fonte bitmap** (imagem), sem depender de fonte web dentro do canvas.
- Sons curtos em **MP3** (formato aceito em todos os navegadores atuais).
- Áudio começa **mudo até o primeiro toque** (exigência do iOS/Chrome) e tem botão de som visível.
- Tela de carregamento com barra de progresso.
- **Orçamento de peso:** jogo completo abaixo de **3 MB**; a primeira etapa jogável abaixo de 1 MB.

### 3.6 Salvar progresso
- Progresso da partida e preferência de som no `localStorage` do navegador (se falhar, o jogo continua normalmente).
- O que importa de verdade (o cupom) fica no **servidor**, não no navegador — ver seção 5.

---

## 4. Imagem para os Stories

- Gerada no próprio navegador: o canvas 180 × 320 é redesenhado ×6 → **1080 × 1920 px** (tamanho exato do Stories), sem borrar.
- Contém: acarajé pronto, a Bia, a frase "Apostei no acarajé e ganhei", o @ do Acarajazz, o **código do cupom** e o aviso "válido na loja: Rua Dona Inácia Uchoa, 89 — Vila Mariana", que também divulga o endereço para quem vê o Stories.
- **Compartilhar:**
  1. **Web Share API com arquivo** (`navigator.share({ files })`): abre a folha de compartilhar do celular, de onde dá para escolher o Instagram. Funciona no Safari iOS 15+ e no Chrome Android.
  2. **Plano B:** botão "Baixar imagem".
  3. **Plano C:** mostrar a imagem na tela com o aviso "Toque e segure para salvar".

> ⚠️ **Navegador interno do Instagram:** quem chega pelo link da bio abre o jogo dentro do app do Instagram, onde compartilhar e baixar costumam falhar. O jogo precisa **detectar esse caso** e mostrar o plano C, mais o botão "Abrir no navegador".
>
> Não existe API para postar direto nos Stories pela web: o cliente sempre salva/compartilha a imagem e posta pelo app.

---

## 5. Um cupom por cliente (backend)

Como o cupom é único por cliente, o navegador sozinho não basta (é só limpar os dados ou trocar de aparelho para "zerar"). É preciso um **servidor mínimo**.

### 5.1 Fluxo
```
Termina o jogo e satisfaz o cliente
        ↓
"Pra liberar seu cupom": nome + WhatsApp + aceite LGPD
        ↓
Servidor verifica o WhatsApp (normalizado, ex.: +55 11 9XXXX-XXXX)
   ├─ número novo       → gera código único (ex.: ACJ-7K3Q), salva, mostra o cupom
   └─ número já existe  → mostra o MESMO cupom de antes (ou "cupom já usado")
        ↓
Tela do prêmio + imagem do Stories com o código
        ↓
No balcão: equipe abre a página de validação, digita o código
   ├─ válido   → aplica o desconto e marca como USADO
   └─ usado ou inexistente → recusa
```

### 5.2 Componentes
| Peça | O que faz |
|---|---|
| **API do cupom** (função serverless) | Recebe nome + WhatsApp, garante 1 cupom por número, gera um código impossível de adivinhar. |
| **Banco de dados** | Tabela `cupons`: código, nome, WhatsApp, data de emissão, status (emitido/usado), data de uso. Os dados também viram **leads** de clientes. |
| **Página de validação** (`/acarabet/validar`) | Para a equipe, protegida por senha/PIN; funciona no celular do balcão. Busca o código, mostra nome e status e tem o botão "Marcar como usado". |
| **Trava no aparelho** | Marca no `localStorage` que o cupom já foi gerado, para não pedir os dados de novo (só conforto; a regra vale no servidor). |
| **Anti-abuso** | Limite de pedidos por IP e verificação anti-robô invisível (ex.: Cloudflare Turnstile). |

### 5.3 Limitações aceitas
- Alguém pode usar outro número de WhatsApp. Para um desconto de primeira compra, o risco é baixo e a equipe confere no balcão.
- Se ficar necessário no futuro: confirmação por código no WhatsApp/SMS (tem custo por mensagem).

### 5.4 LGPD
- Texto claro: "Usamos seu nome e WhatsApp para gerar seu cupom e, se você autorizar, enviar novidades do Acarajazz."
- O aceite do cupom e o aceite de marketing devem ser **caixas separadas**.
- Como o briefing de arte lembra que crianças vão jogar, o jogo deve ser **livre para todos**, e só a etapa do cupom pede dados (com aviso de "maiores de 18 ou com autorização do responsável").

---

## 6. Compatibilidade — onde precisa funcionar

| Navegador | Versões |
|---|---|
| Safari iOS / iPadOS | 15 ou mais recente |
| Chrome Android | últimas 2 versões |
| Samsung Internet | últimas 2 versões |
| Navegador interno do Instagram (iOS e Android) | obrigatório — principal porta de entrada |
| Chrome, Edge, Firefox, Safari (computador) | últimas 2 versões |

**Testes mínimos antes de lançar:** um iPhone, um Android de entrada, o navegador interno do Instagram nos dois sistemas e um computador.

---

## 7. Acessibilidade e cuidado

- Cores nunca são a única pista (ex.: o acarajé "no ponto" também muda de forma/brilho, além da cor).
- Respeitar `prefers-reduced-motion`: menos tremidas e confete.
- Som desligável a qualquer momento; o jogo deve ser 100% jogável sem som.
- Etapas sem punição pesada: errar só diminui estrelas, e o jogador pode repetir até ganhar (como pede o briefing de arte).

## 8. Medição

Eventos de analytics: `jogo_iniciado`, `etapa_concluida` (com estrelas), `jogo_concluido`, `cupom_gerado`, `imagem_compartilhada`, `imagem_baixada`, `cupom_usado` (registrado pela página de validação).
Com isso dá para ver em que etapa as pessoas desistem e quantos cupons viram visita real.

---

## 9. Pendências

- [x] Cupom vale só na loja física.
- [ ] Ajustar o texto do briefing de arte (remover a menção ao iFood).
- [ ] Valor do desconto (proposta: 10% na primeira compra).
- [ ] Validade do cupom após a emissão (proposta: 30 dias).
- [ ] Definir hospedagem + banco (junto com a stack do site).
- [ ] Quem da equipe terá acesso à página de validação.
- [ ] Nome final do jogo ("Acarabet" é provisório no briefing de arte).
