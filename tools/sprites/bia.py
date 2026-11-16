#!/usr/bin/env python3
"""
Sprites da Bia em pixel art para o jogo Acarabet.

Segue o briefing de arte do jogo:
  - personagem 32×48 px por quadro, tiras horizontais, PNG com fundo transparente
  - contorno marrom-dendê (não preto), luz de cima à esquerda, sem antialias
Traços da Bia (das fotos): cabelo cacheado roxo e rosa, corpo curvilíneo, batom vermelho em destaque, sobrancelhas rosadas, delineado, piercing no septo,
argolas douradas e tatuagens nos braços.

Roupas (skins), mostrando a diversidade do Acarajazz:
  baiana  → turbante colorido, bata branca de renda, saia rodada com barra laranja
  dolma   → dólmã laranja com recorte bege e detalhes vinho, calça escura, cachinhos roxos e rosa e lencinho claro com detalhes coloridos e nozinho na frente
  preta   → camiseta preta com o acarajé do logo, calça preta, tênis branco, lenço estampado

Uso:  python3 tools/sprites/bia.py [--previa arquivo.png]
Gera: public/jogo/sprites/bia_<roupa>_<animacao>_<n>q.png
Só usa a biblioteca padrão do Python.
"""
import os
import struct
import sys
import zlib

W, H = 32, 48


# ─── Paleta ───────────────────────────────────────────────────────────────────
def hx(s):
    s = s.lstrip('#')
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), 255)


C = {
    'contorno': hx('3b1408'),
    # pele (mais clara, como nas fotos)
    'pele': hx('e0b08a'), 'pele_sombra': hx('bf8a63'), 'pele_luz': hx('f0caa8'), 'blush': hx('e8968a'),
    # rosto
    'batom': hx('d3122e'), 'batom_sombra': hx('8f0a1c'), 'batom_brilho': hx('ff7a8a'),
    'sobrancelha': hx('c2185b'), 'olho': hx('2b140b'),
    'ouro': hx('f4c430'), 'ouro_sombra': hx('b8860b'),
    'tatuagem': hx('3a2a35'),
    # tecidos
    'laranja': hx('f08a24'), 'laranja_sombra': hx('c4581a'), 'amarelo': hx('ffc03f'), 'vinho': hx('7a0000'),
    'azul': hx('2f6db5'),
    'branco': hx('fffaf0'), 'branco_sombra': hx('d9d0bd'), 'renda': hx('e9dfc8'),
    'barra': hx('f04a00'),
    'bege': hx('e8d6b4'), 'roxo': hx('5b2a86'),
    'preto': hx('26201f'), 'preto_luz': hx('4a3f3d'),
    'cabelo_lilas': hx('c4a3ec'), 'cabelo_rosa': hx('f5a9c8'), 'cabelo_sombra': hx('9273c4'),
    'marrom': hx('7a4a2a'),
    # objetos
    'madeira': hx('9a6a3a'), 'madeira_luz': hx('c9935a'),
    'metal': hx('7d8a96'), 'metal_luz': hx('b9c4cf'), 'metal_sombra': hx('4e5964'),
    'fita': hx('2e9e4f'),
    'gota': hx('6ec6ff'), 'coracao': hx('ff4d6d'),
}


# ─── Desenho por partes ("adesivos": cada parte ganha seu próprio contorno) ──
class Parte:
    def __init__(self):
        self.px = {}
        self.detalhes = {}

    def p(self, x, y, cor):
        self.px[(int(x), int(y))] = C[cor]

    def d(self, x, y, cor):
        self.detalhes[(int(x), int(y))] = C[cor]

    def ret(self, x0, y0, x1, y1, cor):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.p(x, y, cor)

    def elipse(self, cx, cy, rx, ry, cor, ymin=-99, ymax=99):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ymin <= y <= ymax and ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                    self.p(x, y, cor)

    def linha(self, x0, y0, x1, y1, cor, esp=1):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n)
            y = round(y0 + (y1 - y0) * i / n)
            for dy in range(esp):
                for dx in range(esp):
                    self.p(x + dx, y + dy, cor)


def compor(quadro, parte, contorno=True):
    if contorno:
        borda = set()
        for (x, y) in parte.px:
            for vx, vy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                v = (x + vx, y + vy)
                if v not in parte.px:
                    borda.add(v)
        for (x, y) in borda:
            if 0 <= x < W and 0 <= y < H:
                quadro[y][x] = C['contorno']
    for (x, y), cor in list(parte.px.items()) + list(parte.detalhes.items()):
        if 0 <= x < W and 0 <= y < H:
            quadro[y][x] = cor


def quadro_vazio():
    return [[None] * W for _ in range(H)]


# ─── Parte de baixo (pés, saia ou calça) ──────────────────────────────────────
def pes(roupa, dy=0, passo=0):
    p = Parte()
    ye = 45 + dy - (1 if passo == -1 else 0)
    yd = 45 + dy - (1 if passo == 1 else 0)
    for x0, y in ((11, ye), (17, yd)):
        if roupa == 'baiana':  # sandália
            p.ret(x0, y, x0 + 3, y + 2, 'marrom')
            p.ret(x0 + 1, y, x0 + 2, y, 'pele')
        elif roupa == 'dolma':  # sapato fechado
            p.ret(x0, y, x0 + 3, y + 2, 'preto')
            p.d(x0, y, 'preto_luz')
        else:  # tênis branco
            p.ret(x0, y, x0 + 3, y + 2, 'branco')
            p.ret(x0, y + 2, x0 + 3, y + 2, 'branco_sombra')
            p.d(x0 + 1, y + 1, 'barra')
    return p


def saia(dy=0, balanco=0):
    p = Parte()
    topo, base = 32, 44
    for y in range(topo, base + 1):
        t = (y - topo) / (base - topo)
        meia = 5.0 + 6.5 * t ** 0.5  # cintura fina → quadril → saia rodada
        x0 = round(15.5 - meia + balanco * t)
        x1 = round(15.5 + meia + balanco * t)
        for x in range(x0, x1 + 1):
            cor = 'branco'
            if x >= x1 - 1:
                cor = 'branco_sombra'
            if y == base - 2:
                cor = 'barra'
            elif y == base - 1:
                cor = 'amarelo'
            elif y == base:
                cor = 'barra'
            elif (x + y) % 4 == 0 and topo + 1 < y < base - 3:
                cor = 'renda'
            p.p(x, y + dy, cor)
    for x in (12, 16, 20):
        for y in range(topo + 3, base - 3):
            if (y - topo) % 2 == 0:
                p.d(x + round(balanco * (y - topo) / (base - topo)), y + dy, 'branco_sombra')
    for x in range(9, 23):
        if (x, topo + dy) in p.px:
            p.d(x, topo + dy, 'barra')
    return p


def calca(roupa, dy=0, passo=0):
    """Calça com duas pernas; no passo, uma perna sobe 1 px."""
    p = Parte()
    cor, sombra = ('preto', 'preto_luz') if roupa == 'preta' else ('tatuagem', 'preto')
    for x0, sobe in ((10, passo == -1), (16, passo == 1)):
        base = 44 - (1 if sobe else 0)
        larg = 5 if roupa == 'preta' else 4  # calça preta mais larguinha
        p.ret(x0, 34 + dy, x0 + larg, base + dy, cor)
        for y in range(34, base + 1):
            p.d(x0 + larg, y + dy, sombra)
    p.ret(9, 34 + dy, 22, 36 + dy, cor)  # quadril
    p.d(22, 35 + dy, sombra); p.d(22, 36 + dy, sombra)
    if roupa == 'preta':
        for x in range(10, 22):
            p.d(x, 34 + dy, 'preto_luz')  # cós
    return p


# ─── Tronco ───────────────────────────────────────────────────────────────────
# Silhueta: ombros, busto, cintura fina e quadril largo (x0, x1 por linha)
CURVAS = {
    24: (9, 22), 25: (9, 22), 26: (8, 23), 27: (8, 23), 28: (9, 22), 29: (10, 21),
    30: (11, 20), 31: (11, 20), 32: (10, 21), 33: (9, 22), 34: (8, 23), 35: (8, 23), 36: (8, 23),
}


def torso(roupa, dy=0):
    p = Parte()
    if roupa == 'baiana':
        p.ret(10, 24 + dy, 21, 24 + dy, 'pele')  # ombros de fora
        p.d(10, 24 + dy, 'pele_luz')
        for y in range(25, 32):
            x0, x1 = CURVAS[y]
            for x in range(x0, x1 + 1):
                cor = 'branco'
                if x >= x1 - 1:
                    cor = 'branco_sombra'
                elif (x + 2 * y) % 5 == 0 and 26 < y < 30:
                    cor = 'renda'
                p.p(x, y + dy, cor)
        for x in range(8, 24):
            if (x, 25 + dy) in p.px:
                p.d(x, 25 + dy, 'barra' if x % 2 == 0 else 'amarelo')
    elif roupa == 'dolma':
        # dólmã laranja acinturada até o quadril, recorte bege em diagonal e debrum vinho
        for y in range(24, 37):
            x0, x1 = CURVAS[y]
            for x in range(x0, x1 + 1):
                p.p(x, y + dy, 'laranja_sombra' if x >= x1 - 1 else 'laranja')
        for y in range(24, 33):  # recorte bege do peito (lado direito dela)
            for x in range(17 + max(0, (y - 26) // 2), CURVAS[y][1] - 1):
                p.p(x, y + dy, 'bege')
        for y in range(25, 37):  # debrum vinho do transpasse
            p.d(16 + max(0, (y - 26) // 2), y + dy, 'vinho')
        for x in (14, 15, 17, 18):
            p.d(x, 24 + dy, 'vinho')  # gola
        for y in (28, 31, 34):
            p.d(14, y + dy, 'bege')  # botões
    else:  # preta: camiseta por dentro da calça, marcando a cintura
        for y in range(24, 34):
            x0, x1 = CURVAS[y]
            for x in range(x0, x1 + 1):
                p.p(x, y + dy, 'preto_luz' if x == x0 else 'preto')
        p.ret(14, 24 + dy, 17, 24 + dy, 'pele')  # decote redondo
        p.d(13, 24 + dy, 'preto_luz'); p.d(18, 24 + dy, 'preto_luz')
        # acarajé do logo no peito
        for x in (17, 18, 19):
            p.d(x, 27 + dy, 'barra'); p.d(x, 29 + dy, 'barra')
        for x in (16, 17, 18, 19):
            p.d(x, 28 + dy, 'amarelo')
        p.d(20, 28 + dy, 'barra')
    return p


def braco(roupa, ombro, cotovelo, mao, dy=0):
    p = Parte()
    ox, oy = ombro
    cx, cy = cotovelo
    mx, my = mao
    oy += dy; cy += dy; my += dy
    p.linha(ox, oy, cx, cy, 'pele', 2)
    p.linha(cx, cy, mx, my, 'pele', 2)
    p.ret(mx, my, mx + 1, my + 1, 'pele')
    if roupa == 'baiana':  # manga bufante
        p.elipse(ox + 0.5, oy + 1.5, 2.2, 2.2, 'branco')
        p.d(ox, oy + 2, 'branco_sombra')
    elif roupa == 'dolma':  # manga 3/4 laranja, com punho vinho
        p.linha(ox, oy, cx, cy, 'laranja', 2)
        p.d(cx, cy, 'vinho'); p.d(cx + 1, cy, 'vinho')
    else:  # manga curta preta
        p.elipse(ox + 0.5, oy + 1.2, 2.0, 2.0, 'preto')
    def ponto(ax, ay, bx, by, t):
        return round(ax + (bx - ax) * t), round(ay + (by - ay) * t)

    def tinta(x, y, cor='tatuagem'):
        if (x, y) in p.px and p.px[(x, y)] == C['pele']:
            p.d(x, y, cor)

    # tatuagens no antebraço: traço diagonal + pontinho (lembra os desenhos dos braços dela)
    x, y = ponto(cx, cy, mx, my, 0.25)
    tinta(x, y); tinta(x + 1, y + 1)
    x, y = ponto(cx, cy, mx, my, 0.6)
    tinta(x + 1, y); tinta(x, y + 1)
    # e no braço, onde a manga deixa aparecer
    if roupa != 'dolma':
        x, y = ponto(ox, oy, cx, cy, 0.75)
        tinta(x, y); tinta(x + 1, y); tinta(x, y + 1)
    # fitinha do Senhor do Bonfim no pulso direito (baiana)
    if roupa == 'baiana' and ox > 16:
        x, y = ponto(cx, cy, mx, my, 0.9)
        y = min(y, my - 1)
        for xx in (x, x + 1):
            if (xx, y) in p.px:
                p.d(xx, y, 'fita')
        p.p(x + 2, y + 1, 'fita')  # pontinha do nó
    return p


# ─── Cabeça ───────────────────────────────────────────────────────────────────
def cabeca(dy=0, olhos='abertos', boca='sorriso', sobrancelha='normal', blush=True, colar=False, brinco='ouro'):
    p = Parte()
    p.ret(14, 22 + dy, 17, 24 + dy, 'pele')  # pescoço
    p.d(14, 23 + dy, 'pele_sombra')
    p.elipse(16, 17 + dy, 6.2, 6.2, 'pele', ymin=11 + dy)
    for y in range(13 + dy, 22 + dy):
        if (21, y) in p.px:
            p.d(21, y, 'pele_sombra')
    p.d(11, 15 + dy, 'pele_luz'); p.d(11, 16 + dy, 'pele_luz')
    if colar:  # gargantilha dourada
        for x in range(14, 18):
            p.d(x, 23 + dy, 'ouro')

    # sobrancelhas rosadas
    S = 'sobrancelha'
    if sobrancelha == 'normal':
        for x in (12, 13, 14, 17, 18, 19):
            p.d(x, 14 + dy, S)
    elif sobrancelha == 'preocupada':
        p.d(12, 14 + dy, S); p.d(13, 14 + dy, S); p.d(14, 13 + dy, S)
        p.d(17, 13 + dy, S); p.d(18, 14 + dy, S); p.d(19, 14 + dy, S)
    elif sobrancelha == 'focada':
        p.d(12, 13 + dy, S); p.d(13, 14 + dy, S); p.d(14, 14 + dy, S)
        p.d(17, 14 + dy, S); p.d(18, 14 + dy, S); p.d(19, 13 + dy, S)

    # olhos com delineado
    if olhos == 'abertos':
        for x in (13, 18):
            p.d(x, 16 + dy, 'olho'); p.d(x, 17 + dy, 'olho')
        p.d(12, 16 + dy, 'olho'); p.d(19, 16 + dy, 'olho')
    elif olhos == 'fechados':
        for x in (12, 13, 18, 19):
            p.d(x, 17 + dy, 'olho')
    elif olhos == 'felizes':
        for x0 in (12, 17):
            p.d(x0, 17 + dy, 'olho'); p.d(x0 + 1, 16 + dy, 'olho'); p.d(x0 + 2, 17 + dy, 'olho')

    if blush:
        p.d(11, 18 + dy, 'blush'); p.d(20, 18 + dy, 'blush')

    # BOCA — batom vermelho, lábios delicados (3 linhas):
    #   . X X X X .   lábio de cima
    #   s s s s s s   linha da boca, sorrindo até os cantinhos
    #   . X b X X .   lábio de baixo, mais cheio, com brilho
    yb = 19 + dy
    B, Bs, Bb = 'batom', 'batom_sombra', 'batom_brilho'
    if boca == 'sorriso':
        p.d(14, yb, B); p.d(15, yb, B); p.d(16, yb, B); p.d(17, yb, B)
        for x in range(13, 19):
            p.d(x, yb + 1, Bs)
        p.d(14, yb + 2, B); p.d(15, yb + 2, Bb); p.d(16, yb + 2, B); p.d(17, yb + 2, B)
    elif boca == 'aberta':  # sorrisão com dentes
        p.d(14, yb, B); p.d(17, yb, B)
        for x in range(13, 19):
            p.d(x, yb + 1, B)
        p.d(13, yb + 2, B); p.d(18, yb + 2, B)
        for x in range(14, 18):
            p.d(x, yb + 2, 'branco')
        p.d(14, yb + 3, B); p.d(15, yb + 3, Bb); p.d(16, yb + 3, B); p.d(17, yb + 3, B)
    elif boca == 'o':
        p.d(15, yb, B); p.d(16, yb, B)
        p.d(14, yb + 1, B); p.d(15, yb + 1, 'olho'); p.d(16, yb + 1, 'olho'); p.d(17, yb + 1, B)
        p.d(15, yb + 2, Bb); p.d(16, yb + 2, B)
    elif boca == 'firme':  # concentrada: boca cheia, lábio de cima mais marcado
        p.d(14, yb, B); p.d(15, yb, B); p.d(16, yb, B); p.d(17, yb, B)
        for x in range(13, 19):
            p.d(x, yb + 1, Bs if x in (13, 18) else B)
        for x in range(14, 18):
            p.d(x, yb + 2, Bs)
        p.d(14, yb + 3, B); p.d(15, yb + 3, Bb); p.d(16, yb + 3, B); p.d(17, yb + 3, B)
    elif boca == 'bico':  # provando: biquinho
        p.d(15, yb, B); p.d(16, yb, B)
        p.d(15, yb + 1, Bs); p.d(16, yb + 1, Bs)
        p.d(15, yb + 2, Bb); p.d(16, yb + 2, B)

    luz, sombra = ('ouro', 'ouro_sombra') if brinco == 'ouro' else ('preto_luz', 'preto')
    for x in (9, 22):  # argolas (douradas na baiana, pretas nas outras)
        p.p(x, 19 + dy, luz); p.p(x, 20 + dy, sombra)
    return p


def cachos(p, pontos, dy):
    """Cachos: bolinhas 2×2 alternando lilás e rosa, com um pontinho de sombra."""
    for i, (x, y) in enumerate(pontos):
        cor = 'cabelo_lilas' if i % 2 == 0 else 'cabelo_rosa'
        p.ret(x, y + dy, x + 1, y + 1 + dy, cor)
        p.d(x + (i % 2), y + 1 + dy, 'cabelo_sombra')


def cachos_laterais(dy=0):
    """Cachinhos coloridos escapando do turbante/lenço, dos lados do rosto."""
    p = Parte()
    cachos(p, [(9, 12), (8, 14), (9, 16), (21, 12), (22, 14), (21, 16)], dy)
    return p


def turbante(dy=0):
    """Ojá branco com detalhes azuis e amarelos."""
    p = Parte()
    p.elipse(16, 8.2 + dy, 8.0, 5.8, 'branco', ymax=12 + dy)
    for (x, y) in list(p.px):
        if x >= 22 and y <= 11 + dy:
            p.p(x, y, 'branco_sombra')
        elif y <= 10 + dy and (x - round((y - dy) * 0.9)) % 5 == 0:
            p.p(x, y, 'azul')  # voltas do pano, listras azuis
        elif y <= 10 + dy and (x - round((y - dy) * 0.9)) % 5 == 2 and (x + y) % 2 == 0:
            p.d(x, y, 'amarelo')  # bordadinho amarelo
    for x in range(8, 25):
        for y in (11 + dy, 12 + dy):
            if (x, y) in p.px:
                p.p(x, y, 'azul')
    for x in range(9, 24, 2):
        if (x, 11 + dy) in p.px:
            p.d(x, 11 + dy, 'amarelo')
    # laço no alto
    p.elipse(13.2, 3.0 + dy, 2.4, 1.7, 'amarelo')
    p.elipse(19.6, 3.0 + dy, 2.4, 1.7, 'amarelo')
    p.ret(15, 2 + dy, 17, 4 + dy, 'azul')
    p.d(16, 3 + dy, 'branco')
    p.d(12, 3 + dy, 'branco'); p.d(20, 3 + dy, 'branco')
    return p


def lenco(dy=0):
    """Lenço estampado amarrado, com os cachos estourando por cima e pontas caindo do lado."""
    fundo, b1, b2, barra, ponta = 'barra', 'amarelo', 'azul', 'vinho', 'amarelo'
    p = Parte()
    p.elipse(16, 11.0 + dy, 7.2, 4.2, fundo, ymax=13 + dy)
    for (x, y) in list(p.px):
        if x % 3 == 0 and y % 2 == 0:
            p.d(x, y, b1)
        elif x % 6 == 2 and y % 2 == 1:
            p.d(x, y, b2)
    for x in range(9, 24):
        if (x, 13 + dy) in p.px:
            p.p(x, 13 + dy, barra)
    # pontas do nó caindo do lado
    p.ret(22, 13 + dy, 23, 16 + dy, fundo)
    p.d(23, 16 + dy, ponta)
    return p


def cachos_topo(dy=0):
    """Volume de cachos saindo por cima do lenço."""
    p = Parte()
    cachos(p, [(10, 6), (12, 4), (14, 3), (16, 3), (18, 4), (20, 6), (11, 8), (13, 6), (15, 5), (17, 5), (19, 8)], dy)
    return p


# lenço claro: quase todo branco, com detalhezinhos coloridos
ESTAMPA = ('branco', 'branco', 'branco', 'azul', 'branco', 'branco', 'batom', 'branco', 'branco', 'branco',
           'amarelo', 'branco', 'branco', 'fita', 'branco', 'branco', 'branco', 'batom', 'branco', 'azul')


def estampa(p, dy, passo=None):
    """Estampa do lenço da foto: voltas em diagonal com faixas de larguras diferentes."""
    for (x, y) in list(p.px):
        u = x + round((y - dy) * 0.7)
        p.p(x, y, ESTAMPA[u % len(ESTAMPA)])


def lenco_amarrado(dy=0):
    """Lencinho estampado, pequeno e justo, deixando os cachos escaparem por cima."""
    p = Parte()
    p.elipse(16, 12.0 + dy, 6.8, 2.8, 'batom', ymax=12 + dy)
    estampa(p, dy)
    for (x, y) in list(p.px):
        if x >= 21 and p.px[(x, y)] == C['branco']:
            p.p(x, y, 'branco_sombra')
    for x in range(9, 24):
        if (x, 12 + dy) in p.px:
            p.d(x, 12 + dy, 'branco_sombra')  # barra na testa
    return p


def no_do_lenco(dy=0):
    """Nozinho na frente, no alto da testa, com as duas pontinhas."""
    p = Parte()
    p.ret(15, 8 + dy, 17, 10 + dy, 'branco')
    p.p(14, 8 + dy, 'branco'); p.p(18, 8 + dy, 'branco')
    p.p(13, 7 + dy, 'branco'); p.p(19, 7 + dy, 'branco')
    p.d(17, 10 + dy, 'branco_sombra'); p.d(16, 9 + dy, 'batom'); p.d(13, 7 + dy, 'azul'); p.d(19, 7 + dy, 'amarelo')
    return p


def cachos_escapando(dy=0):
    """Pouquinho de cachos roxos e rosa aparecendo por cima do lencinho."""
    p = Parte()
    cachos(p, [(10, 8), (12, 7), (14, 6), (17, 6), (19, 7), (21, 8)], dy)
    return p


# ─── Objetos ──────────────────────────────────────────────────────────────────
def colher(x0, y0, x1, y1):
    p = Parte()
    p.linha(x0, y0, x1, y1, 'madeira')
    p.ret(x1 - 1, y1, x1, y1 + 1, 'madeira_luz')
    return p


def panela(dy=0):
    p = Parte()
    p.ret(7, 36 + dy, 24, 42 + dy, 'metal')
    p.ret(7, 36 + dy, 24, 36 + dy, 'metal_luz')
    p.ret(8, 37 + dy, 23, 37 + dy, 'amarelo')
    p.ret(7, 42 + dy, 24, 42 + dy, 'metal_sombra')
    p.p(5, 38 + dy, 'metal'); p.p(6, 38 + dy, 'metal')
    p.p(25, 38 + dy, 'metal'); p.p(26, 38 + dy, 'metal')
    return p


def bacia(x0, y0):
    p = Parte()
    p.ret(x0, y0, x0 + 10, y0 + 4, 'madeira')
    p.ret(x0 - 1, y0, x0 + 11, y0, 'madeira_luz')
    p.ret(x0 + 1, y0 - 1, x0 + 9, y0 - 1, 'bege')  # massa de feijão
    p.d(x0 + 3, y0 + 2, 'madeira_luz')
    return p


# ─── Montagem ─────────────────────────────────────────────────────────────────
OMBRO_E, OMBRO_D = (8, 25), (22, 25)
BRACOS_PARADOS = [(OMBRO_E, (5, 30), (5, 34)), (OMBRO_D, (25, 30), (25, 34))]  # afastados: aparece a cintura


def bia(roupa, pose):
    q = quadro_vazio()
    dy = pose.get('dy', 0)
    dyc = pose.get('dy_corpo', 0)
    compor(q, pes(roupa, dy, pose.get('passo', 0)))
    if roupa == 'baiana':
        compor(q, saia(dy, pose.get('balanco', 0)))
    else:
        compor(q, calca(roupa, dy, pose.get('passo', 0)))
    compor(q, torso(roupa, dy + dyc))
    atras = pose.get('bracos_atras_da_cabeca')
    if atras:
        for b in pose['bracos']:
            compor(q, braco(roupa, *b, dy=dy + dyc))
    for f in pose.get('antes_bracos', []):
        compor(q, f(dy))
    if not atras:
        for b in pose['bracos']:
            compor(q, braco(roupa, *b, dy=dy + dyc))
    rosto = dict(pose.get('rosto', {}))
    if roupa == 'preta':
        rosto['colar'] = True
    if roupa != 'baiana':
        rosto['brinco'] = 'preto'
    compor(q, cabeca(dy + dyc, **rosto))
    if roupa == 'baiana':
        compor(q, cachos_laterais(dy + dyc))
        compor(q, turbante(dy + dyc))
    elif roupa == 'dolma':
        compor(q, cachos_escapando(dy + dyc))
        compor(q, cachos_laterais(dy + dyc))
        compor(q, lenco_amarrado(dy + dyc))
        compor(q, no_do_lenco(dy + dyc))
    else:
        compor(q, cachos_topo(dy + dyc))
        compor(q, cachos_laterais(dy + dyc))
        compor(q, lenco(dy + dyc))
    for f in pose.get('frente', []):
        compor(q, f(dy + dyc))
    for (x, y, cor) in pose.get('pixels', []):
        q[y + dy][x] = C[cor]
    return q


def animacoes(roupa):
    A = {}
    A['parada'] = [
        bia(roupa, {'bracos': BRACOS_PARADOS}),
        bia(roupa, {'bracos': BRACOS_PARADOS, 'dy_corpo': 1, 'rosto': {'olhos': 'fechados'}}),
    ]
    A['andando'] = [
        bia(roupa, {'passo': passo, 'balanco': bal, 'dy': dy,
                    'bracos': [(OMBRO_E, (5, 30), (5 + sw, 34)), (OMBRO_D, (25, 30), (25 + sw, 34))]})
        for passo, bal, dy, sw in ((-1, -1, 0, 1), (0, 0, -1, 0), (1, 1, 0, -1), (0, 0, -1, 0))
    ]
    A['mexendo'] = [
        bia(roupa, {
            'bracos': [(OMBRO_E, (9, 30), (hx_ - 1, hy)), (OMBRO_D, (22, 30), (hx_ + 1, hy))],
            'antes_bracos': [panela, lambda d, x=hx_, y=hy: colher(x + 1, y + 1, 16 + (x - 15) // 2, 39)],
            'rosto': {'boca': 'firme', 'sobrancelha': 'focada'},
        })
        for hx_, hy in ((13, 31), (16, 30), (18, 32), (15, 33))
    ]
    A['batendo'] = [
        bia(roupa, {
            'bracos': [(OMBRO_E, (8, 31), (9, 33)), (OMBRO_D, (24, 28), (18, hy))],
            'antes_bracos': [lambda d: bacia(6, 35)],
            'frente': [lambda d, y=hy: colher(18, y + 2, 14, 35 + d)],
            'rosto': {'boca': 'firme', 'sobrancelha': 'focada', 'olhos': olhos},
        })
        for hy, olhos in ((26, 'abertos'), (30, 'abertos'), (33, 'fechados'), (30, 'abertos'))
    ]
    A['provando'] = [
        bia(roupa, {'bracos': [BRACOS_PARADOS[0], (OMBRO_D, (24, 29), (19, 28))],
                    'frente': [lambda d: colher(19, 27, 17, 23)], 'rosto': {'boca': 'bico'}}),
        bia(roupa, {'bracos': [BRACOS_PARADOS[0], (OMBRO_D, (23, 28), (18, 24))],
                    'frente': [lambda d: colher(18, 23, 16, 21)], 'rosto': {'boca': 'bico', 'olhos': 'fechados'}}),
        bia(roupa, {'bracos': [BRACOS_PARADOS[0], (OMBRO_D, (24, 29), (21, 31))],
                    'rosto': {'boca': 'aberta', 'olhos': 'felizes'},
                    'pixels': [(25, 13, 'coracao'), (26, 12, 'coracao'), (27, 13, 'coracao'), (26, 14, 'coracao')]}),
    ]
    A['comemorando'] = [
        bia(roupa, {
            'dy': dy,
            'bracos': [(OMBRO_E, (5 - ab, 21), (4 - ab, 15)), (OMBRO_D, (26 + ab, 21), (27 + ab, 15))],
            'bracos_atras_da_cabeca': True,
            'rosto': {'boca': 'aberta', 'olhos': 'felizes'},
            'pixels': [(2, 9, 'amarelo'), (29, 11, 'amarelo'), (1, 12, 'barra')] if ab else
                      [(3, 11, 'amarelo'), (28, 9, 'amarelo'), (30, 13, 'barra')],
        })
        for dy, ab in ((0, 0), (-2, 1), (-1, 0), (0, 1))
    ]
    A['preocupada'] = [
        bia(roupa, {
            'bracos': [(OMBRO_E, (6, 25), (10, 19)), (OMBRO_D, (25, 25), (21, 19))],
            'rosto': {'boca': 'o', 'sobrancelha': 'preocupada', 'blush': False},
            'pixels': [(25, 9 + i, 'gota'), (25, 10 + i, 'gota'), (24, 10 + i, 'gota')],
        })
        for i in range(2)
    ]
    return A


ROUPAS = ('baiana', 'dolma', 'preta')


# ─── PNG (sem dependências) ───────────────────────────────────────────────────
def salvar_png(caminho, pixels, escala=1, fundo=None):
    h = len(pixels) * escala
    w = len(pixels[0]) * escala
    dados = bytearray()
    for row in pixels:
        linha = bytearray([0])
        for c in row:
            linha += bytes(c if c else (fundo or (0, 0, 0, 0))) * escala
        for _ in range(escala):
            dados += linha

    def bloco(tipo, conteudo):
        b = tipo + conteudo
        return struct.pack('>I', len(conteudo)) + b + struct.pack('>I', zlib.crc32(b) & 0xFFFFFFFF)

    png = b'\x89PNG\r\n\x1a\n' + bloco(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    png += bloco(b'IDAT', zlib.compress(bytes(dados), 9)) + bloco(b'IEND', b'')
    with open(caminho, 'wb') as f:
        f.write(png)


def tira(quadros):
    return [sum((q[y] for q in quadros), []) for y in range(H)]


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, 'public', 'jogo', 'sprites')
    os.makedirs(saida, exist_ok=True)
    # remove a versão antiga (sem roupa no nome)
    for f in os.listdir(saida):
        if f.startswith('bia_') and not any(f.startswith(f'bia_{r}_') for r in ROUPAS):
            os.remove(os.path.join(saida, f))
    todas = {}
    for roupa in ROUPAS:
        A = animacoes(roupa)
        todas[roupa] = A
        cores = {c for qs in A.values() for q in qs for row in q for c in row if c}
        for nome, quadros in A.items():
            salvar_png(os.path.join(saida, f'bia_{roupa}_{nome}_{len(quadros)}q.png'), tira(quadros))
        print(f'{roupa}: {len(A)} animações, {sum(len(q) for q in A.values())} quadros, {len(cores)} cores')
    if '--previa' in sys.argv:
        destino = sys.argv[sys.argv.index('--previa') + 1]
        linhas = []
        vazio = quadro_vazio()
        for roupa in ROUPAS:
            A = todas[roupa]
            fila = [A['parada'][0], A['andando'][0], A['mexendo'][1], A['batendo'][0], A['provando'][2],
                    A['comemorando'][1], A['preocupada'][0]]
            linhas += tira(fila) + [[None] * (W * len(fila))]
        salvar_png(destino, linhas, escala=6, fundo=(254, 245, 226, 255))
        # close do rosto (baiana, parada)
        rosto = [row[6:26] for row in todas['baiana']['parada'][0][10:26]]
        salvar_png(destino.replace('.png', '-rosto.png'), rosto, escala=16, fundo=(254, 245, 226, 255))


if __name__ == '__main__':
    main()
