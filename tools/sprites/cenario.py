#!/usr/bin/env python3
"""
Cenário do Acarabet: o salão do Acarajazz por dentro (referências em docs/ACARABET-CENARIO.md).

Tela em pé de 180 × 320 px, em camadas (desenhar nesta ordem):
  salao_fundo.png        teto, parede laranja, lousa do prato do dia, banner, peneiras, porta da salinha rosa,
                         chita de girassol atrás do balcão, piso de taco, mesa de chita, plantas
  (Bia atrás do balcão)
  salao_balcao.png       balcão de tábuas com o logo pintado
  salao_fitas_4q.png     rede de fitinhas do Senhor do Bonfim balançando (4 quadros de 180 × 40)
  (personagens do salão)

Também grava src/data/acarabet/salao.json com a posição de cada personagem e a área de texto da lousa.
Uso:  python3 tools/sprites/cenario.py [--previa arquivo.png]
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bia import C, Parte, hx, salvar_png  # noqa: E402
import bia as B  # noqa: E402
import personagens as P  # noqa: E402

LW, LH = 180, 320
TETO, CHAO = 13, 200  # parede de y=13 até y=199; piso a partir de 200

C.update({
    'parede': hx('e3913f'), 'parede_sombra': hx('c4732c'), 'parede_luz': hx('eda65e'),
    'teto': hx('f3ead8'), 'teto_sombra': hx('ddd0b6'),
    'taco1': hx('9a6a3a'), 'taco2': hx('b4804c'), 'taco3': hx('7c5230'),
    'lousa': hx('2c3631'), 'giz': hx('eef0e6'),
    'salinha': hx('e2588f'), 'salinha_sombra': hx('b83f70'),
    'agua_marinha': hx('7cc8b8'), 'agua_marinha_sombra': hx('4f9c8c'),
    'folha': hx('3f9a4a'), 'folha_escura': hx('2b6b34'), 'vaso': hx('b5643a'),
})


def tela():
    return [[None] * LW for _ in range(LH)]


def pinta(q, x, y, cor):
    if 0 <= x < LW and 0 <= y < LH:
        q[y][x] = C[cor]


def ret(q, x0, y0, x1, y1, cor):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            pinta(q, x, y, cor)


def peca(q, parte, contorno=True):
    P.compor_em(q, parte, 0, contorno)


# ─── Letrinhas 3×5 (para a lousa) ─────────────────────────────────────────────
FONTE = {
    'P': ('111', '101', '111', '100', '100'), 'R': ('110', '101', '110', '101', '101'),
    'A': ('010', '101', '111', '101', '101'), 'T': ('111', '010', '010', '010', '010'),
    'O': ('010', '101', '101', '101', '010'), 'D': ('110', '101', '101', '101', '110'),
    'I': ('111', '010', '010', '010', '111'), ' ': ('000',) * 5,
}


def escreve(q, x, y, texto, cor):
    for ch in texto:
        for dy, linha in enumerate(FONTE[ch]):
            for dx, b in enumerate(linha):
                if b == '1':
                    pinta(q, x + dx, y + dy, cor)
        x += 4
    return x


# ─── Peças do fundo ───────────────────────────────────────────────────────────
def chita(x, y, fundo='batom'):
    """Estampa de chita: florzonas rosa/amarelas com miolo e folhinhas verdes sobre vermelho."""
    k = ((x // 7) * 3 + (y // 7) * 5) % 4
    cx, cy = x % 7, y % 7
    if (cx - 3) ** 2 + (cy - 3) ** 2 <= 2:
        return ('amarelo', 'cabelo_rosa', 'branco', 'cabelo_lilas')[k] if (cx, cy) != (3, 3) else 'barra'
    if (cx, cy) in ((0, 5), (1, 6), (6, 0)):
        return 'fita'
    return fundo


def girassol(x, y):
    """Chita de girassol: fundo azul, girassóis amarelos com miolo marrom."""
    cx, cy = (x + (y // 10) * 5) % 10, y % 10
    d = (cx - 5) ** 2 + (cy - 5) ** 2
    if d <= 2:
        return 'marrom'
    if d <= 9:
        return 'amarelo' if (cx + cy) % 3 else 'mostarda'
    if d <= 11 and (cx + cy) % 2:
        return 'fita'
    return 'azul'


def fundo():
    q = tela()
    # teto
    ret(q, 0, 0, LW - 1, TETO - 1, 'teto')
    ret(q, 0, TETO - 2, LW - 1, TETO - 1, 'teto_sombra')  # moldura
    # parede laranja, com sombrinha embaixo do teto e rodapé
    ret(q, 0, TETO, LW - 1, CHAO - 1, 'parede')
    ret(q, 0, TETO, LW - 1, TETO + 2, 'parede_sombra')
    for y in range(TETO + 3, CHAO - 4):  # textura leve de parede pintada
        for x in range((y * 7) % 13, LW, 13):
            pinta(q, x, y, 'parede_luz')
    ret(q, 0, CHAO - 4, LW - 1, CHAO - 1, 'taco3')  # rodapé de madeira

    # luminária "sputnik" com lâmpadas coloridas
    lum = Parte()
    LX = 132  # acima da porta da salinha
    lum.linha(LX, TETO, LX, 20, 'metal_sombra')
    lum.ret(LX - 2, 20, LX + 2, 22, 'ouro')
    for ang, cor in ((200, 'branco'), (250, 'amarelo'), (290, 'azul'), (340, 'batom'), (160, 'amarelo')):
        ex, ey = LX + round(9 * math.cos(math.radians(ang))), 21 - round(5 * math.sin(math.radians(ang)))
        lum.linha(LX, 21, ex, ey, 'ouro_sombra')
        lum.ret(ex - 1, ey, ex, ey + 1, cor)
    peca(q, lum)

    # banner laranja com o logo
    ban = Parte()
    ban.ret(64, 28, 116, 52, 'laranja')
    ban.ret(64, 50, 116, 52, 'laranja_sombra')
    ban.elipse(90, 39.5, 10, 10, 'teto')  # círculo claro do logo
    ban.elipse(90, 36.5, 6, 3.6, 'barra')  # acarajé
    ban.elipse(90, 38.5, 6, 2.0, 'amarelo', ymin=38)
    for x in range(78, 104):  # "Acarajazz" em cursiva (rabisco ondulado)
        y = 44 + round(1.6 * math.sin(x / 1.6))
        ban.d(x, y, 'contorno')
    ban.d(98, 30, 'contorno'); ban.d(99, 31, 'contorno'); ban.d(98, 32, 'contorno')  # fumacinha
    for x in (65, 115):
        ban.d(x, 29, 'metal_luz')  # ilhoses
    peca(q, ban)

    # lousa do prato do dia (o jogo escreve o prato na área reservada)
    lou = Parte()
    lou.ret(8, 40, 50, 84, 'madeira')
    lou.ret(10, 42, 48, 82, 'lousa')
    peca(q, lou)
    x = escreve(q, 13, 46, 'PRATO DO', 'giz')
    escreve(q, 21, 53, 'DIA', 'giz')
    for x in range(13, 46):  # risquinho embaixo
        if x % 3:
            pinta(q, x, 60, 'giz')
    prato = Parte()  # desenho de giz: pratinho
    prato.elipse(29, 77, 7, 2, 'giz')
    prato.elipse(29, 75.5, 4, 2, 'barra')
    peca(q, prato, contorno=False)

    # peneiras e chapéu de palha
    for cx, cy, r in ((124, 44, 6.5), (148, 50, 5.5)):
        pen = Parte()
        pen.elipse(cx, cy, r, r, 'madeira_luz')
        for (x, y) in list(pen.px):
            if (x + y) % 2 == 0:
                pen.d(x, y, 'bege')
        pen.d(round(cx), round(cy), 'madeira')
        peca(q, pen)
    cha = Parte()
    cha.elipse(30, 96, 10, 3, 'bege')  # embaixo da lousa
    cha.elipse(30, 93, 5, 3.4, 'bege', ymax=94)
    cha.ret(25, 94, 35, 94, 'vinho')  # fita do chapéu
    peca(q, cha)

    # porta para a salinha rosa, com cortina de chita
    ret(q, 136, 70, 167, CHAO - 5, 'branco')  # batente
    ret(q, 139, 74, 164, CHAO - 5, 'salinha')
    for y in range(74, CHAO - 30):  # mural de pinceladas
        for x in range(139, 165):
            v = math.sin(x / 3.0 + y / 5.0) + math.cos(y / 4.0 - x / 7.0)
            if v > 1.3:
                pinta(q, x, y, 'amarelo')
            elif v > 1.0:
                pinta(q, x, y, 'laranja')
            elif v < -1.4:
                pinta(q, x, y, 'fita')
    for y in range(CHAO - 30, CHAO - 4):  # esteira de bambu
        for x in range(139, 165):
            pinta(q, x, y, 'bege' if x % 3 else 'madeira_luz')
    banq = Parte()  # banquinho com almofada de chita
    banq.ret(143, CHAO - 22, 160, CHAO - 19, 'batom')
    for (x, y) in list(banq.px):
        banq.p(x, y, chita(x, y))
    banq.ret(144, CHAO - 18, 145, CHAO - 6, 'madeira'); banq.ret(158, CHAO - 18, 159, CHAO - 6, 'madeira')
    peca(q, banq)
    cor = Parte()  # bandô e laterais da cortina
    cor.ret(134, 66, 169, 75, 'batom')
    for x in range(134, 170, 5):
        cor.p(x, 76, 'batom'); cor.p(x + 1, 77, 'batom')
    cor.ret(136, 76, 141, 140, 'batom'); cor.ret(162, 76, 167, 140, 'batom')
    for (x, y) in list(cor.px):
        cor.p(x, y, chita(x, y))
    for x0 in (136, 162):  # amarração
        cor.ret(x0, 120, x0 + 5, 121, 'amarelo')
    peca(q, cor)

    # parede de chita de girassol atrás do balcão (cozinha)
    ret(q, 40, 128, 132, 175, 'azul')
    for y in range(128, 176):
        for x in range(40, 133):
            pinta(q, x, y, girassol(x, y))
    ret(q, 40, 126, 132, 127, 'madeira')  # prateleira
    ref = Parte()
    for i, x in enumerate(range(48, 125, 9)):  # potes e garrafas na prateleira
        if i % 3 == 0:
            ref.ret(x, 118, x + 3, 125, 'agua_marinha'); ref.ret(x, 118, x + 3, 118, 'agua_marinha_sombra')
        elif i % 3 == 1:
            ref.ret(x + 1, 117, x + 2, 119, 'folha_escura'); ref.ret(x, 120, x + 3, 125, 'folha')
        else:
            ref.ret(x, 121, x + 4, 125, 'barra'); ref.ret(x, 121, x + 4, 121, 'amarelo')
    peca(q, ref)

    # piso de taco em espinha de peixe
    for y in range(CHAO, LH):
        for x in range(LW):
            bloco = ((x // 4) + (y // 8)) % 2
            u = (x + (y if bloco else -y)) // 4
            cor = ('taco1', 'taco2')[u % 2]
            if (x + (y if bloco else -y)) % 4 == 0:
                cor = 'taco3'
            pinta(q, x, y, cor)

    # plantas
    for x0, alto, base in ((0, 30, 300), (160, 28, 304)):
        pl = Parte()
        pl.ret(x0 + 4, base, x0 + 15, base + 12, 'vaso')
        pl.ret(x0 + 3, base, x0 + 16, base + 1, 'laranja_sombra')
        for k in range(-5, 6):  # folhas de palmeira-ráfis
            topo = base - alto + abs(k) * 3
            pl.linha(x0 + 10, base, x0 + 10 + k * 2, topo, 'folha' if k % 2 else 'folha_escura')
        peca(q, pl)

    # (a mesa de chita da frente agora vem junto com o casal de clientes: cliente_casal_*.png)
    return q


def balcao():
    """Balcão de tábuas na altura da cintura, com o logo pintado à mão."""
    q = tela()
    T = 176  # tampo
    b = Parte()
    b.ret(34, T, 122, T + 3, 'madeira_luz')  # termina antes da portinha (passagem da Bia em x 123–136)
    b.ret(34, T + 3, 122, T + 3, 'madeira')
    b.ret(36, T + 4, 120, CHAO - 1, 'bege')  # tábuas
    for x in range(36, 121):
        if (x - 36) % 9 == 0:
            for y in range(T + 4, CHAO):
                b.d(x, y, 'madeira')
        elif (x - 36) % 9 == 4:
            for y in range(T + 4 + (x % 5), CHAO, 7):
                b.d(x, y, 'madeira_luz')  # veio da madeira
    # logo: acarajé (amarelo embaixo) com fumacinha, e a cursiva embaixo
    cx, cy = 72, T + 11
    for x in range(cx - 8, cx + 9):
        for y in range(cy - 4, cy + 5):
            d = ((x + 0.5 - cx) / 8) ** 2 + ((y + 0.5 - cy) / 4.5) ** 2
            if 0.7 < d <= 1.0:
                b.d(x, y, 'contorno')
            elif d <= 0.7 and y >= cy:
                b.d(x, y, 'amarelo')
    for x, y in ((cx + 9, cy - 4), (cx + 10, cy - 6), (cx + 9, cy - 8)):
        b.d(x, y, 'contorno')
    for x in range(84, 116):  # "Acarajazz" em cursiva
        y = cy + round(2.0 * math.sin(x / 1.8))
        b.d(x, y, 'contorno')
        if x % 6 == 0:
            b.d(x, y - 3, 'contorno'); b.d(x, y - 2, 'contorno')
    for x in range(96, 106):  # o "cachimbo/sax"
        b.d(x, cy + 5 + (1 if x > 105 else 0), 'contorno')
    peca(q, b)
    return q


BANCADA = 112  # no close, a bancada começa aqui (a Bia fica atrás, aparecendo da cintura pra cima)


def close_parede():
    """Close da cozinha: parede de chita de girassol, prateleira e fitinhas no alto."""
    q = tela()
    for y in range(LH):
        for x in range(LW):
            pinta(q, x, y, girassol(x, y))
    ret(q, 0, 26, LW - 1, 28, 'madeira')  # prateleira
    ref = Parte()
    for i, x in enumerate(range(6, LW - 8, 13)):
        if i % 3 == 0:
            ref.ret(x, 16, x + 5, 25, 'agua_marinha'); ref.ret(x, 16, x + 5, 16, 'agua_marinha_sombra')
        elif i % 3 == 1:
            ref.ret(x + 2, 13, x + 3, 17, 'folha_escura'); ref.ret(x, 18, x + 5, 25, 'folha')
        else:
            ref.ret(x, 19, x + 6, 25, 'barra'); ref.ret(x, 19, x + 6, 19, 'amarelo')
    peca(q, ref)
    return q


def close_bancada():
    """Tampo da bancada de madeira visto de cima (camada da frente do close)."""
    q = tela()
    for y in range(BANCADA, LH):
        for x in range(LW):
            faixa = (y - BANCADA) // 22
            cor = 'madeira_luz' if faixa % 2 == 0 else 'bege'
            if (y - BANCADA) % 22 == 0:
                cor = 'madeira'
            elif (x * 7 + y * 3 + faixa * 11) % 37 == 0:
                cor = 'madeira'  # veio da madeira
            pinta(q, x, y, cor)
    ret(q, 0, BANCADA, LW - 1, BANCADA + 2, 'madeira')  # borda de trás
    ret(q, 0, BANCADA + 3, LW - 1, BANCADA + 3, 'taco3')
    return q


FITAS = ('fita', 'amarelo', 'azul', 'batom', 'branco', 'cabelo_rosa', 'laranja', 'roxo', 'agua_marinha')


def fitas(quadro):
    """Rede de fitinhas do Bonfim no teto, balançando."""
    h = 40
    q = [[None] * LW for _ in range(h)]
    for x in range(LW):  # rede (malha)
        for y in range(1, 9):
            if (x + y) % 5 == 0 or (x - y) % 5 == 0:
                q[y][x] = C['metal_sombra']
    for i, x0 in enumerate(range(1, LW, 3)):
        cor = C[FITAS[(i * 4) % len(FITAS)]]
        comp = 10 + (i * 7) % 17
        fase = i * 0.9 + quadro * math.pi / 2
        for k in range(comp):
            x = x0 + round(math.sin(fase + k / 4) * (k / comp) * 2)
            if 0 <= x < LW and 4 + k < h:
                q[4 + k][x] = cor
    return q


# ─── Onde fica cada um (posição do canto de cima à esquerda do sprite) ────────
POSICOES = {
    'bia': {'x': 70, 'y': 146, 'camada': 'atras_do_balcao', 'sprite': 'bia_<roupa>_<animacao>'},
    'eliana': {'x': 2, 'y': 152, 'sprite': 'npc_eliana'},
    'vic': {'x': 38, 'y': 143, 'camada': 'atras_do_balcao', 'sprite': 'npc_vic', 'onde': 'atrás do balcão, lavando louça (não reage)'},
    'tios_mesa': {'x': 4, 'y': 214, 'sprite': 'npc_tios_mesa', 'largura': 64},
    'gemea_mae': {'x': 126, 'y': 196, 'sprite': 'npc_gemea_mae'},
    'gemea_tia': {'x': 148, 'y': 196, 'sprite': 'npc_gemea_tia'},
    'valentina': {'x': 146, 'y': 150, 'sprite': 'npc_valentina'},
    'por_do_sol': [  # sempre perto da Valentina; sorteia um dos dois cantinhos por partida
        {'x': 150, 'y': 184, 'sprite': 'gato_sentado', 'onde': 'aos pés da Valentina'},
        {'x': 152, 'y': 181, 'sprite': 'gato_dormindo', 'onde': 'dormindo aos pés da Valentina (na frente dela, pra aparecer)'},
    ],
    # Caminhos da Bia (posição do sprite 32×48). 'camada': atrás do balcão ou no salão (ordem pelo y).
    'pontos': {
        'bancada': {'x': 70, 'y': 146, 'camada': 'atras_do_balcao'},
        'portinha': {'x': 108, 'y': 146, 'camada': 'atras_do_balcao'},
        'saida': {'x': 108, 'y': 170, 'camada': 'salao'},
        'mesa_tios': {'x': 66, 'y': 200, 'camada': 'salao'},
        'mesa_frente': {'x': 124, 'y': 240, 'camada': 'salao'},
    },
    'rotas': {
        'servir_mesa_frente': ['bancada', 'portinha', 'saida', 'mesa_frente'],
        'servir_tios': ['bancada', 'portinha', 'saida', 'mesa_tios'],
    },
    'regras_animacao': {
        'mais_horizontal': 'andando_lado (servindo_lado se estiver com a bandeja); espelhar quando for pra esquerda',
        'descendo': 'andando (de frente)',
        'subindo': 'andando_costas',
        'velocidade_px_por_s': 40,
    },
    'casal': {'x': 56, 'y': 258, 'sprite': 'cliente_casal', 'largura': 64,
              'estados': ['esperando', 'feliz', 'comendo'], 'obs': 'feliz quando a Bia chega com a bandeja; depois comendo'},
    'lousa_texto': {'x': 12, 'y': 63, 'largura': 35, 'altura': 6, 'cor': '#eef0e6'},
}


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, 'public', 'jogo', 'cenario')
    os.makedirs(saida, exist_ok=True)
    f, bal = fundo(), balcao()
    quadros = [fitas(i) for i in range(4)]
    salvar_png(os.path.join(saida, 'salao_fundo.png'), f)
    salvar_png(os.path.join(saida, 'salao_balcao.png'), bal)
    salvar_png(os.path.join(saida, 'salao_fitas_4q.png'), [sum((q[y] for q in quadros), []) for y in range(40)])
    salvar_png(os.path.join(saida, 'close_parede.png'), close_parede())
    salvar_png(os.path.join(saida, 'close_bancada.png'), close_bancada())
    dados = os.path.join(raiz, 'src', 'data', 'acarabet')
    os.makedirs(dados, exist_ok=True)
    with open(os.path.join(dados, 'salao.json'), 'w') as arq:
        json.dump({'largura': LW, 'altura': LH, 'posicoes': POSICOES}, arq, ensure_ascii=False, indent=2)
    print('cenário: salão (fundo, balcão, fitas) e close (parede, bancada)')

    if '--previa' in sys.argv:  # composição com todo mundo no lugar
        destino = sys.argv[sys.argv.index('--previa') + 1]
        q = [row[:] for row in f]

        def cola(sprite, x0, y0):
            for y, row in enumerate(sprite):
                for x, c in enumerate(row):
                    if c and 0 <= x0 + x < LW and 0 <= y0 + y < LH:
                        q[y0 + y][x0 + x] = c

        A, N = B.animacoes('dolma'), P.animacoes()
        cola(A['parada'][0], 70, 146)
        cola(bal, 0, 0)
        cola(quadros[0], 0, 0)
        cola(N['npc_eliana_parada'][0], 2, 152)
        cola(N['npc_tios_mesa_parada'][0], 4, 214)
        cola(N['npc_gemea_mae_parada'][0], 126, 196)
        cola(N['npc_gemea_tia_parada'][0], 148, 196)
        cola(N['npc_valentina_parada'][0], 146, 150)
        cola(N['gato_sentado'][0], 150, 184)
        cola(N['cliente_casal_esperando'][0], 56, 258)
        salvar_png(destino, q, escala=3)


if __name__ == '__main__':
    main()
