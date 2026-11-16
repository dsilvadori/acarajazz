# Acarabet — Especificação técnica

> O que é preciso, em tecnologia, para o jogo rodar em qualquer navegador: simples, bonito e funcional.
> Complementa o [briefing de arte do jogo](https://claude.ai/artifact/7z2pXWuYi4hDxWdmSoq6Ap) e a seção 4.7 do [BRIEFING.md](BRIEFING.md).
> Última atualização: 16/11/2026 · ✅ **primeira versão jogável implementada** (ver seção 10).

---

## 1. Resumo do jogo (do briefing de arte)

- Jogo em **pixel art**, tela **em pé** (formato story), jogado com toque ou clique.
- A Bia faz um acarajé do começo ao fim em **10 minijogos** curtos (20–40 s cada), até **30 estrelas**: lavar o feijão, triturar, temperos, vatapá, caruru, salada, bater a massa, **fritar**, **montar** e **servir** (processos definidos com a equipe em nov/2026, ver seção 10).
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
| Girar em círculo | Vatapá (mexer) | Variação do ângulo do dedo em volta do centro |
| Ligar e parar no ponto | Triturar (multiprocessador) | Um toque no botão liga, outro para; parar com o ponteiro na faixa verde |
| Tocar no tempo certo | Salada, fritar | Toque dentro de uma janela de tempo |
| Tocar rápido | Bater a massa | Toques por segundo |
| Arrastar e soltar | Montar (na ordem), caruru | Arraste até a zona de destino |

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
| **Página de validação** (`/admin/cupons`) | Para a equipe, dentro do painel (mesmo login do `/admin`); funciona no celular do balcão. Busca o código, mostra nome e status e tem o botão "Marcar como usado". |
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
- [ ] Valor do desconto: **em uso a proposta de 10%** (trocar em `src/lib/acarabet.ts`, constante `DESCONTO`), aguardando aprovação.
- [ ] Validade do cupom: **em uso a proposta de 30 dias** (`VALIDADE_DIAS` no mesmo arquivo), aguardando aprovação.
- [x] Hospedagem + banco: Cloudflare Workers + D1, junto com o site.
- [x] Acesso à validação: quem tem login do painel `/admin` (aba **Cupons Acarabet**).
- [x] Nome do jogo: **Acarabet**.

---

## 10. Como ficou a implementação (16/11/2026)

| Parte | Onde | Observação |
|---|---|---|
| Página do jogo | `src/pages/acarabet/index.astro` | Apresentação, "como funciona" e **regulamento visível**. O jogo abre em tela cheia por cima da página (`/acarabet#jogar`); botão ✕ ou "voltar" do celular fecham. |
| Chamada na Home | `src/components/ChamadaAcarabet.astro` | Faixa vinho com a Bia comemorando, antes de Eventos. Link "Acarabet" também no menu. |
| Motor | Phaser **3.90.0** | Carregado só quando a pessoa toca em **Jogar** (import dinâmico): a página em si continua leve. |
| Código do jogo | `src/jogo/` | `main.ts` (liga o Phaser), `estado.ts` (etapas, estrelas, satisfação, medição), `cenas/` (título, pedido, 9 minijogos de preparo, servir, prêmio e cupom), `cupom.ts` (formulário, compartilhar, plano C do Instagram), `som.ts`. |
| Close dos preparos | `cenas/Etapa.ts` | Nas etapas de preparo a câmera chega perto: parede de chita de girassol, a **Bia ampliada 2× da cintura pra cima** reagindo (mexendo, batendo, comemorando, preocupada) e a bancada de madeira com os objetos. |
| Arte | `tools/sprites/*.py` → `public/jogo/` | Tudo gerado por script: `atlas.png` + `atlas.json` (todas as animações e objetos numa imagem só, ~40 KB), fontes em pixel (`fonte_clara`, `fonte_escura`), cenário do salão e do close. Para refazer: `python3 tools/sprites/atlas.py` (e `cenario.py`, `fonte.py`). |
| Escala sem borrar | `main.ts` | O fator de ampliação é **inteiro em pixels do aparelho** (ex.: ×1,5 em CSS num celular 2× = 3 pixels reais por pixel do jogo). Sobra de tela vira moldura listrada. Celular deitado mostra "vire o celular". **No computador** (sem tela de toque) o jogo ocupa a altura toda: o Phaser fica invisível no tamanho exato (pros cliques) e uma cópia nítida em N× é reduzida suavemente por cima, então os pixels não ficam de tamanhos diferentes. |
| Sons | `som.ts` | Sintetizados na hora com Web Audio (**nenhum arquivo de som pra baixar**), mudos até o primeiro toque, botão de som em todas as telas. |
| API do cupom | `src/pages/api/acarabet/cupom.ts` | 1 cupom por WhatsApp (quem repete recebe o mesmo), código `ACJ-XXXXXX`, Turnstile, limite de 10 pedidos por IP por hora. |
| Medição | `src/pages/api/acarabet/evento.ts` | Eventos da seção 8 gravados na tabela `jogo_eventos` (migração `0003_acarabet.sql`). |
| Validação no balcão | `src/pages/admin/cupons.astro` | Em vez de uma página separada com PIN, fica **dentro do painel** (já tem login): buscar código → ver nome, validade e status → **Marcar como usado**. Mostra também o funil dos últimos 30 dias. |
| Imagem dos Stories | `cenas/Premio.ts` | Desenhada em 180 × 320 e ampliada 6× → **1080 × 1920**. Compartilhar → baixar → mostrar na tela (Instagram). |

**Regras de jogo implementadas**
- Cada etapa dá 1 a 3 estrelas; refazer guarda sempre a melhor nota.
- O casal fica satisfeito com **2/3 das estrelas** (20 de 30). Se não ficar, a Bia refaz as etapas mais fracas e serve de novo; na terceira rodada o casal aceita de qualquer jeito (ninguém sai sem cupom).
- O pedido é sorteado a cada partida e aparece no balão do casal e na faixa da montagem: **com pimenta** (ícone de foguinho) ou **pouca pimenta** (ícone de friozinho), e **tradicional** (camarão por cima, ícone de camarão) ou **vegetariano** (shimeji por cima, ícone de shimeji).

**Processos de cada etapa (definidos com a equipe)**
1. **Lavar o feijão:** feijão-fradinho (branco com o olhinho preto), que já vem quebrado da loja; o processo é só lavar, com a torneira aberta caindo água na bacia.
2. **Triturar:** no multiprocessador industrial, com um botão só. Três levas: um toque liga, e a pessoa tem que parar na hora certa (ponteiro na faixa verde).
3. **Temperos:** picar cebola e pimentão (toques na faca) e fazer a pimenta: jogar as pimentas no dendê e mexer em círculos.
4. **Vatapá:** castanha de caju, amendoim, gengibre, temperos naturais triturados, farinha de trigo e um pouco de dendê, nessa ordem; depois mexer até dar o ponto. O nome de cada ingrediente aparece na tela ("PRÓXIMO: …" e ao tocar).
5. **Caruru:** cortar o quiabo, juntar os ingredientes do vatapá (**menos a farinha**) e mexer.
6. **Salada:** tomate picado, misturando verde, meio amarelado (quase vermelho) e vermelho.
7. **Bater a massa:** toquinhos na tela simulam a batida; a massa vai crescendo na bacia até ficar bem branquinha e levinha.
8. **Fritar** no dendê: um toque na massa joga os 4 bolinhos de uma vez no tacho (ou um por um, tocando no tacho); quem frita é o lado de baixo, então por cima só a **borda** vai dourando (é o aviso de virar); virado, aparece o lado frito e o outro lado frita até o ponto final, quando tira. A janela do ponto é larga (5 s) pra dar conta dos 4 sem queimar.
9. **Montar, nesta ordem:** pimenta no bolinho, vatapá, caruru, salada e, por cima, camarão (tradicional) ou shimeji (vegetariano). Pimenta errada, camarão no vegetariano, shimeji no tradicional ou fora de ordem contam como erro.
10. **Servir** na mesa do casal.
- Tocar nos personagens do salão (Eliana, gêmeas, Valentina, tios, Pôr do Sol) faz eles acenarem/brindarem: são os easter eggs.

**Atalho de teste (só em desenvolvimento):** `/acarabet?cena=Fritar#jogar` abre direto numa cena (Titulo, Pedido, Lavar, Triturar, Temperos, Vatapa, Caruru, Salada, Bater, Fritar, Montar, Servir, Premio, Cupom).
