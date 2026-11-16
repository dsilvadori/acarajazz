# Acarabet — Cenário (a casa por dentro)

Referências levantadas da exportação do Instagram (`~/Downloads/instagram-o_acarajazz-2026-11-15-…/media/stories`) e das fotos que a equipe mandou.
As fotos **não** foram copiadas para o projeto (muitas são reposts de clientes): servem só de referência para a pixel art.

## 1. O que a casa tem (das fotos)

### Entrada
- Portão com **rede de fitinhas do Senhor do Bonfim** pendurada no alto, cobrindo o teto da entrada. — `202610/18089557229236980.webp`
- Bandô de **chita vermelha** amarrado em cima da porta, com flores de tecido nas pontas. — mesma foto
- Parede branca descascada, **peneira de palha** pendurada, vaso de espada-de-são-jorge.
- Banner laranja com o logo do Acarajazz (cursiva, acarajé e o "cachimbo/sax"). — `202609/18104480624524763.webp`

### Balcão e cozinha
- **Balcão de tábuas de madeira clara** com o logo pintado à mão em preto, e o acarajé em amarelo. — `202609/18104480624524763.webp`, `202607/18318674908273524.webp`
- Em cima do balcão: **busto de baiana** de cerâmica (turbante e decote de babado), gamela de madeira, garrafas de água.
- Atrás do balcão: parede forrada de **chita de girassol** em azul e amarelo, pia, **lousa** com frase escrita a giz ("…só sei que foi assim") e um cabideiro de colheres.
- Luminária **"sputnik" com lâmpadas coloridas** (branca, amarela, azul, vermelha) no teto.

### Salão principal
- Paredes **laranja** (barra de azulejo laranja embaixo em um dos ambientes) e outro ambiente **verde-sálvia**. — `202602/17867636505477257.webp`
- Porta para a salinha com **cortina de chita** (flores rosa, roxas, amarelas) e **peneiras de palha** e **chapéu de palha** na parede.
- **Mesas e cadeiras dobráveis de madeira**, com **toalha de chita** e plástico por cima e um caminho de juta no meio.
- Piso de **taco de madeira** em espinha de peixe (salão) e cerâmica branca (entrada).
- Quadros: foto em preto e branco, plaquinha "Se avexe não"; **placa de Xangô** e post-its com "O futuro é ancestral". — `202610/18108704513617047.webp`
- Lousa com o prato do dia ("Caranguejada e baião de dois") e **parede de fitinhas do Bonfim penduradas** atrás (foto das gêmeas).

### Salinha colorida
- Teto **rosa com arabescos vermelhos**, parede com **mural de pinceladas** laranja, amarelo, rosa e verde. — `202601/18095362508493657.webp`
- **Esteira de bambu** cobrindo a parte de baixo das paredes, banco de madeira com almofada de chita florida, **pilão de madeira** com planta.
- Plantas: palmeira-ráfis, espada-de-são-jorge, suculenta em **vaso de macramê** pendurado.
- Tapete laranja-mostarda. À noite, luz rosa e **velas** na mesa ("aquele jeitinho acarajístico"). — `202601/18087795407106975.webp`
- Outro canto: parede branca com **mural de labaredas laranja** e banco com chita. — `202609/17947127082451692.webp`

### Na mesa
- Cumbucas de cerâmica **verde-água**, toalhas com estampa africana em vermelho, amarelo e branco (do levantamento do Instagram), copos americanos, garrafa de cerveja no porta-garrafa térmico.

## 2. Proposta de cenário do jogo (tela em pé, 180 × 320)

Um **corte da casa**, como uma casinha de bonecas, em três faixas:

```
┌──────────────────────────────┐  0
│ rede de fitinhas do Bonfim   │     fitas balançando (animação sutil)
│ ~ luminária sputnik colorida │
├──────────────────────────────┤  48
│ parede laranja · banner logo │     lousa "prato do dia" · peneiras · chapéu
│ porta c/ cortina de chita →  │     espiando a salinha rosa com mural
│ chita de girassol atrás      │
│   ┌──────── BALCÃO ───────┐  │     balcão de tábuas c/ logo pintado
│   │ busto da baiana · Bia │  │     Bia cozinha aqui (minijogos)
├───┴───────────────────────┴──┤  200
│ salão: mesas de chita        │     mesa dos tios (Luizinho e Toninho)
│ taco de madeira              │     gêmeas numa mesa · Valentina na porta
│ plantas · Pôr do Sol dormindo│     Eliana passando com uma bandeja
└──────────────────────────────┘  320
```

- **Fundo fixo** (parede, balcão, piso) + **camadas animadas** (fitinhas, luzes, velas, plantas mexendo de leve).
- Os minijogos abrem num **close da bancada** (panela, pilão, tacho de dendê) com a mesma parede de girassol ao fundo.
- **Easter eggs:** cada personagem fica num lugar fixo do salão e reage ao toque. O Pôr do Sol muda de lugar a cada partida (no banco de chita, em cima do balcão, debaixo da mesa).
- **Paleta:** a mesma dos sprites (dendê, laranja, vinho, amarelo), mais o verde-sálvia e o rosa da salinha, e o azul da chita de girassol.

## 3. Decidido com a equipe (16/11/2026)
- O salão é **laranja**.
- A lousa mostra o **prato do dia** (o jogo escreve o nome do prato por cima, na área reservada).
- **Sem o busto da baiana** no balcão.

## 4. Arquivos
- Gerador: `tools/sprites/cenario.py` (mesmo estilo e paleta dos personagens).
- Camadas em `public/jogo/cenario/`, desenhadas nesta ordem:
  1. `salao_fundo.png`: teto, parede, lousa, banner, porta da salinha, chita de girassol, piso
  2. a Bia e quem fica atrás do balcão
  3. `salao_balcao.png`: o balcão de tábuas com o logo
  4. `salao_fitas_4q.png`: a rede de fitinhas balançando (4 quadros)
  5. os personagens do salão
- Posições de cada personagem e da área de texto da lousa: `src/data/acarabet/salao.json`.

## 5. A Bia andando pelo salão
- Animações extras (para cada roupa), geradas por `tools/sprites/bia_lado.py`:
  `andando_lado_6q` (de perfil, virada pra direita; o jogo espelha pra esquerda), `servindo_lado_6q` (com a bandeja: acarajé e cumbuca) e `andando_costas_4q`.
- O balcão tem uma **portinha na ponta direita** (x 123–136) por onde ela sai para o salão.
- Pontos de parada e rotas ficam em `src/data/acarabet/salao.json` (`pontos`, `rotas`, `regras_animacao`):
  - andando mais na horizontal → de lado (com a bandeja quando leva o prato);
  - descendo → de frente; subindo → de costas;
  - 40 px por segundo; atrás do balcão ela fica na camada de trás, no salão vale "quem está mais embaixo fica na frente".
- A prévia em `/acarabet/sprites` já mostra a Bia fazendo as duas rotas (mesa da frente e mesa dos tios), na roupa escolhida na aba.
