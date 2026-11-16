#!/usr/bin/env python3
"""
Bia andando pelo cenário: de lado (virada pra direita; o jogo espelha pra esquerda), de costas e servindo.

Gera, para cada roupa (baiana, dolma, preta):
  bia_<roupa>_andando_lado_6q.png     de perfil, 6 quadros
  bia_<roupa>_servindo_lado_6q.png    de perfil com a bandeja (acarajé e cumbuca), 6 quadros
  bia_<roupa>_andando_costas_4q.png   de costas, 4 quadros

Mesmo estilo de tools/sprites/bia.py (32×48, contorno dendê, peças com contorno próprio).
Uso:  python3 tools/sprites/bia_lado.py [--previa arquivo.png]
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bia as B  # noqa: E402
from bia import C, Parte, compor, hx, quadro_vazio, salvar_png, tira  # noqa: E402

C.setdefault('agua_marinha', hx('7cc8b8'))

ROUPAS = B.ROUPAS
# passada de 6 quadros: deslocamento do pé da frente (perna de cá) e de trás, e o sobe-desce do corpo
PASSOS = [(4, -4, 0), (2, -2, 0), (0, 0, -1), (-4, 4, 0), (-2, 2, 0), (0, 0, -1)]

# silhueta de perfil: busto na frente (direita), cintura fina, bumbum atrás (esquerda)
PERFIL = {24: (13, 19), 25: (13, 20), 26: (12, 21), 27: (12, 21), 28: (12, 20), 29: (13, 19),
          30: (13, 19), 31: (13, 19), 32: (12, 19), 33: (11, 20), 34: (11, 20), 35: (11, 20), 36: (12, 19)}


# ─── Perfil ───────────────────────────────────────────────────────────────────
def cabeca_lado(roupa, dy, olhos='abertos'):
    p = Parte()
    p.ret(15, 22 + dy, 18, 24 + dy, 'pele')  # pescoço
    p.elipse(16.5, 17 + dy, 5.6, 6.0, 'pele', ymin=11 + dy)
    for y in range(13 + dy, 22 + dy):  # nuca na sombra
        for x in (11, 12):
            if (x, y) in p.px:
                p.d(x, y, 'pele_sombra')
                break
    for x in (18, 19, 20):
        p.d(x, 14 + dy, 'sobrancelha')
    if olhos == 'abertos':
        p.d(19, 16 + dy, 'olho'); p.d(19, 17 + dy, 'olho'); p.d(20, 16 + dy, 'olho')  # olho com delineado
    else:
        p.d(19, 17 + dy, 'olho'); p.d(20, 17 + dy, 'olho')
    p.d(18, 19 + dy, 'blush')
    # boca de perfil, sutil: batom só na beirinha do rosto, sem sair pra fora
    p.d(21, 19 + dy, 'batom'); p.d(21, 20 + dy, 'batom'); p.d(20, 20 + dy, 'batom_sombra')
    p.d(21, 21 + dy, 'batom'); p.d(20, 21 + dy, 'batom')  # lábio de baixo
    p.d(14, 17 + dy, 'pele_sombra'); p.d(14, 18 + dy, 'pele_sombra')  # orelha
    luz, sombra = ('ouro', 'ouro_sombra') if roupa == 'baiana' else ('preto_luz', 'preto')
    p.p(14, 19 + dy, luz); p.p(14, 20 + dy, sombra)  # argola
    if roupa == 'preta':
        for x in range(15, 19):
            p.d(x, 23 + dy, 'ouro')
    return p


def cabelo_lado(roupa, dy):
    """Cachos atrás da orelha + turbante (baiana) ou lenço com as pontas caindo atrás."""
    partes = []
    atras = Parte()
    B.cachos(atras, [(10, 12), (9, 14), (10, 16), (11, 18)], dy)
    if roupa != 'baiana':
        partes.append(B.cachos_topo(dy))
    partes.append(atras)
    if roupa == 'baiana':
        partes.append(B.turbante(dy))
    else:
        l = B.lenco(dy, roupa)
        for (x, y) in [k for k in l.px if k[0] >= 22 and k[1] >= 13 + dy]:  # tira as pontas da frente
            l.px.pop((x, y)); l.detalhes.pop((x, y), None)
        fundo = 'branco' if roupa == 'dolma' else 'barra'
        l.ret(8, 13 + dy, 9, 16 + dy, fundo)  # pontas do nó caindo atrás
        l.d(8, 16 + dy, 'fita' if roupa == 'dolma' else 'amarelo')
        partes.append(l)
    return partes


def tronco_lado(roupa, dy):
    p = Parte()
    if roupa == 'baiana':
        p.ret(14, 24 + dy, 19, 24 + dy, 'pele')  # ombro de fora
        for y in range(25, 32):
            x0, x1 = PERFIL[y]
            for x in range(x0, x1 + 1):
                p.p(x, y + dy, 'branco_sombra' if x == x0 else ('renda' if (x + 2 * y) % 5 == 0 else 'branco'))
        for x in range(12, 22):
            if (x, 25 + dy) in p.px:
                p.d(x, 25 + dy, 'barra' if x % 2 == 0 else 'amarelo')
    elif roupa == 'dolma':
        for y in range(24, 37):
            x0, x1 = PERFIL[y]
            for x in range(x0, x1 + 1):
                p.p(x, y + dy, 'laranja_sombra' if x == x0 else 'laranja')
            p.d(x1 - 1, y + dy, 'vinho')  # debrum na frente
        p.d(17, 24 + dy, 'vinho'); p.d(18, 24 + dy, 'vinho')  # gola
        for y in (28, 31, 34):
            p.d(PERFIL[y][1] - 2, y + dy, 'bege')
    else:
        for y in range(24, 34):
            x0, x1 = PERFIL[y]
            for x in range(x0, x1 + 1):
                p.p(x, y + dy, 'preto_luz' if x == x0 else 'preto')
        p.d(18, 24 + dy, 'pele'); p.d(19, 24 + dy, 'pele')  # decote
    return p


def saia_lado(dy, balanco):
    p = Parte()
    topo, base = 32, 44
    for y in range(topo, base + 1):
        t = (y - topo) / (base - topo)
        x0 = round(12 - 4 * t ** 0.6 - balanco * t)  # bumbum e saia rodada atrás
        x1 = round(19 + 5 * t ** 0.7 + balanco * t)
        for x in range(x0, x1 + 1):
            cor = 'branco_sombra' if x <= x0 + 1 else 'branco'
            if y == base - 2 or y == base:
                cor = 'barra'
            elif y == base - 1:
                cor = 'amarelo'
            elif (x + y) % 4 == 0 and topo < y < base - 3:
                cor = 'renda'
            p.p(x, y + dy, cor)
    for x in range(11, 21):
        if (x, topo + dy) in p.px:
            p.d(x, topo + dy, 'barra')
    return p


def perna(roupa, desloc, dy, de_tras=False, levanta=0):
    """Uma perna de perfil, do quadril (16, 35) até o pé."""
    p = Parte()
    fx, fy = 16 + desloc, 44 - levanta
    if roupa != 'baiana':
        cor = {'dolma': 'tatuagem', 'preta': 'preto'}[roupa]
        if de_tras:
            cor = 'preto' if roupa == 'dolma' else 'preto_luz'
        p.linha(15, 35 + dy, fx - 1, fy + dy, cor, 3)
    else:
        p.linha(16, 41 + dy, fx, fy + dy, 'pele', 2)  # canela aparecendo embaixo da saia
    sapato = {'baiana': 'marrom', 'dolma': 'preto', 'preta': 'branco'}[roupa]
    p.ret(fx - 1, fy + 1 + dy, fx + 3, fy + 2 + dy, sapato)
    if roupa == 'preta':
        p.d(fx + 3, fy + 2 + dy, 'branco_sombra'); p.d(fx, fy + 2 + dy, 'barra')
    if roupa == 'baiana':
        p.d(fx + 1, fy + 1 + dy, 'pele')
    return p


def bandeja(dy):
    p = Parte()
    p.ret(19, 28 + dy, 30, 28 + dy, 'metal_luz')
    p.ret(20, 29 + dy, 29, 29 + dy, 'metal')
    p.elipse(23.5, 26.6 + dy, 2.6, 1.7, 'barra')  # acarajé
    p.d(22, 26 + dy, 'amarelo'); p.d(24, 26 + dy, 'amarelo')
    p.ret(26, 25 + dy, 29, 27 + dy, 'agua_marinha')  # cumbuca
    p.ret(26, 25 + dy, 29, 25 + dy, 'amarelo')  # vatapá dentro
    return p


def lado(roupa, i, servindo=False, olhos='abertos'):
    frente, tras, bob = PASSOS[i]
    dy = bob
    q = quadro_vazio()
    levanta_f = 1 if i == 2 else 0
    levanta_t = 1 if i == 5 else 0
    compor(q, perna(roupa, tras, 0, True, levanta_t))  # perna de lá
    if roupa == 'baiana':
        compor(q, saia_lado(dy, 1 if frente > 0 else (-1 if frente < 0 else 0)))
    elif roupa == 'preta':
        quadril = Parte()
        quadril.ret(11, 33 + dy, 20, 36 + dy, 'preto')
        compor(q, quadril)
    compor(q, tronco_lado(roupa, dy))
    compor(q, perna(roupa, frente, 0, False, levanta_f))  # perna de cá
    if roupa == 'baiana':  # a saia passa por cima da perna de cá
        compor(q, saia_lado(dy, 1 if frente > 0 else (-1 if frente < 0 else 0)))
    for parte in cabelo_lado(roupa, dy)[:1] if roupa != 'baiana' else []:
        compor(q, parte)  # volume de cachos atrás do rosto
    compor(q, cabeca_lado(roupa, dy, olhos))
    for parte in (cabelo_lado(roupa, dy)[1:] if roupa != 'baiana' else cabelo_lado(roupa, dy)):
        compor(q, parte)
    if servindo:
        compor(q, B.braco(roupa, (17, 25), (17, 30), (23, 28), dy))
        compor(q, bandeja(dy))
    else:
        s = -frente  # braço balança ao contrário da perna
        compor(q, B.braco(roupa, (17, 25), (17 + s // 2, 30), (17 + s, 34), dy))
    return q


# ─── Costas ───────────────────────────────────────────────────────────────────
def cabeca_costas(roupa, dy):
    """Parte de trás da cabeça: cachos roxos e rosa (bolinhas, com a borda ondulada) e a nuca."""
    p = Parte()
    p.ret(14, 21 + dy, 17, 24 + dy, 'pele')  # nuca
    pontos = []
    for y in range(11, 21, 2):
        meia = 6 if 13 <= y <= 17 else 5
        for x in range(16 - meia - (y // 2) % 2, 16 + meia, 2):
            pontos.append((x, y))
    B.cachos(p, pontos, dy)
    luz, sombra = ('ouro', 'ouro_sombra') if roupa == 'baiana' else ('preto_luz', 'preto')
    for x in (8, 23):
        p.p(x, 19 + dy, luz); p.p(x, 20 + dy, sombra)
    return p


def costas(roupa, i):
    passo, bal, dy, sw = ((-1, -1, 0, 1), (0, 0, -1, 0), (1, 1, 0, -1), (0, 0, -1, 0))[i]
    q = quadro_vazio()
    compor(q, B.pes(roupa, dy, passo))
    if roupa == 'baiana':
        compor(q, B.saia(dy, bal))
    else:
        compor(q, B.calca(roupa, dy, passo))
    t = B.torso(roupa, dy)
    if roupa == 'dolma':  # de costas: sem recorte, sem botões, sem transpasse
        for k, cor in list(t.px.items()):
            if cor == C['bege']:
                t.px[k] = C['laranja']
        t.detalhes = {k: v for k, v in t.detalhes.items() if v == C['vinho'] and k[1] == 24 + dy}
    elif roupa == 'preta':  # sem o acarajé do peito; gola alta atrás
        t.detalhes = {}
        for x in range(14, 18):
            t.px[(x, 24 + dy)] = C['preto']
    compor(q, t)
    for ombro, cot, mao in ((B.OMBRO_E, (5, 30), (5 - sw, 34)), (B.OMBRO_D, (25, 30), (25 - sw, 34))):
        compor(q, B.braco(roupa, ombro, cot, mao, dy))
    compor(q, cabeca_costas(roupa, dy))
    if roupa == 'baiana':
        compor(q, B.turbante(dy))
    else:
        compor(q, B.cachos_topo(dy))
        compor(q, B.lenco(dy, roupa))
    return q


def animacoes(roupa):
    return {
        'andando_lado': [lado(roupa, i) for i in range(6)],
        'servindo_lado': [lado(roupa, i, servindo=True) for i in range(6)],
        'andando_costas': [costas(roupa, i) for i in range(4)],
    }


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, 'public', 'jogo', 'sprites')
    todas = {}
    for roupa in ROUPAS:
        A = animacoes(roupa)
        todas[roupa] = A
        for nome, quadros in A.items():
            salvar_png(os.path.join(saida, f'bia_{roupa}_{nome}_{len(quadros)}q.png'), tira(quadros))
    print('perfil, servindo e costas gerados para', ', '.join(ROUPAS))
    if '--previa' in sys.argv:
        destino = sys.argv[sys.argv.index('--previa') + 1]
        linhas = []
        for roupa in ROUPAS:
            A = todas[roupa]
            linhas += tira(A['andando_lado'] + [A['servindo_lado'][0], A['andando_costas'][0], A['andando_costas'][2]])
        salvar_png(destino, linhas, escala=5, fundo=(254, 245, 226, 255))


if __name__ == '__main__':
    main()
