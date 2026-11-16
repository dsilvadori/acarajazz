#!/usr/bin/env python3
"""
Easter eggs do Acarabet: personagens que aparecem no cenário.

  Eliana      → chef e sócia: lenço mostarda, corpo curvilíneo, camisa estampada com gola vermelha, calça preta
  Gêmeas      → mãe e tia da Bia (da foto): cabelo grisalho comprido e ondulado, blusas brancas;
                uma com colar de contas vermelhas e pulseiras, a outra com cordão preto e pingente de madeira
  Valentina   → filha da Bia (da foto): cachos escuros com mecha loira, óculos rosados, camiseta vermelha, colete preto
  Pôr do Sol  → gatinho laranja e branco (peito, meias, focinho, listra na testa e ponta do rabo brancos) (sentado balançando o rabo e dormindo)

Mesmo estilo da Bia (tools/sprites/bia.py): 32×48 por quadro (gato: 24×16), contorno marrom-dendê.
Uso:  python3 tools/sprites/personagens.py [--previa arquivo.png]
Gera: public/jogo/sprites/npc_<nome>_<animacao>_<n>q.png e gato_<animacao>_<n>q.png
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bia import C, CURVAS, H, W, Parte, compor, hx, quadro_vazio, salvar_png, tira  # noqa: E402

C.update({
    'pele_clara': hx('f2cdb0'), 'pele_clara_sombra': hx('d6a587'),
    'pele_media': hx('c48d63'), 'pele_media_sombra': hx('9c6a45'),
    'pele_bia': C['pele'], 'pele_bia_sombra': C['pele_sombra'],
    'pele_val': hx('eec3a0'), 'pele_val_sombra': hx('cf9c78'),
    'grisalho_escuro': hx('8f8a84'), 'grisalho_escuro_luz': hx('bdb8b1'), 'grisalho_escuro_sombra': hx('615c57'),
    'grisalho': hx('dedad3'), 'grisalho_sombra': hx('a9a39c'),
    'mostarda': hx('e2b43c'), 'mostarda_sombra': hx('b8892a'),
    'castanho': hx('4a2c1c'), 'castanho_luz': hx('7a4a2a'),
    'jeans': hx('3f6ea8'),
    'verde': hx('2e9e4f'),
    'vermelho': hx('d9473e'), 'vermelho_sombra': hx('a8322b'),
})


# ─── Peças comuns ─────────────────────────────────────────────────────────────
def rosto(p, dy, pele, sombra, boca='batom_sombra', olhos='abertos', sobrancelha='castanho', oculos=False, feliz=False, cor_oculos='olho'):
    p.ret(14, 22 + dy, 17, 24 + dy, pele)  # pescoço
    p.elipse(16, 17 + dy, 6.2, 6.2, pele, ymin=11 + dy)
    for y in range(13 + dy, 22 + dy):
        if (21, y) in p.px:
            p.d(21, y, sombra)
    for x in (12, 13, 18, 19):
        p.d(x, 14 + dy, sobrancelha)
    if olhos == 'abertos' and not feliz:
        for x in (13, 18):
            p.d(x, 16 + dy, 'olho'); p.d(x, 17 + dy, 'olho')
    elif feliz:
        for x0 in (12, 17):
            p.d(x0, 17 + dy, 'olho'); p.d(x0 + 1, 16 + dy, 'olho'); p.d(x0 + 2, 17 + dy, 'olho')
    else:
        for x in (12, 13, 18, 19):
            p.d(x, 17 + dy, 'olho')
    if oculos:
        for x0 in (11, 17):
            for x in range(x0, x0 + 4):
                p.d(x, 15 + dy, cor_oculos); p.d(x, 18 + dy, cor_oculos)
            for y in (16, 17):
                p.d(x0, y + dy, cor_oculos); p.d(x0 + 3, y + dy, cor_oculos)
        p.d(15, 16 + dy, cor_oculos); p.d(16, 16 + dy, cor_oculos)
    p.d(11, 19 + dy, 'blush'); p.d(20, 19 + dy, 'blush')
    # sorriso
    p.d(13, 19 + dy, boca); p.d(18, 19 + dy, boca)
    for x in range(14, 18):
        p.d(x, 20 + dy, boca)
    if feliz:
        p.d(15, 21 + dy, boca); p.d(16, 21 + dy, boca)


def braco(p, ombro, cotovelo, mao, pele, manga=None, manga_ate=0.5):
    (ox, oy), (cx, cy), (mx, my) = ombro, cotovelo, mao
    p.linha(ox, oy, cx, cy, pele, 2)
    p.linha(cx, cy, mx, my, pele, 2)
    p.ret(mx, my, mx + 1, my + 1, pele)
    if manga:
        ex, ey = round(ox + (cx - ox) * manga_ate), round(oy + (cy - oy) * manga_ate)
        p.linha(ox, oy, ex, ey, manga, 2)
        p.ret(ox - 1, oy, ox + 1, oy + 1, manga)


def bracos(dy, pele, manga, acenando=0, manga_ate=0.5):
    """Braços parados; acenando = 1 ou 2 (quadros do tchauzinho com a mão direita)."""
    e, d = Parte(), Parte()
    braco(e, (8, 25 + dy), (5, 30 + dy), (5, 34 + dy), pele, manga, manga_ate)
    if acenando:
        mx = 26 if acenando == 1 else 28
        braco(d, (22, 25 + dy), (25, 22 + dy), (mx, 17 + dy), pele, manga, manga_ate)
    else:
        braco(d, (22, 25 + dy), (25, 30 + dy), (25, 34 + dy), pele, manga, manga_ate)
    return [e, d]


def tronco(dy, padrao, gola=None, curvas=False):
    """Tronco com cintura; padrao(x, y) → cor. curvas=True usa a silhueta da Bia (busto, cintura fina, quadril)."""
    p = Parte()
    larg = {24: (9, 22), 25: (9, 22), 26: (8, 23), 27: (8, 23), 28: (9, 22), 29: (10, 21),
            30: (10, 21), 31: (10, 21), 32: (10, 21), 33: (9, 22)}
    if curvas:
        larg = {y: CURVAS[y] for y in range(24, 34)}
    for y, (x0, x1) in larg.items():
        for x in range(x0, x1 + 1):
            p.p(x, y + dy, padrao(x, y))
    if gola:
        for x in (12, 13, 18, 19):
            p.d(x, 24 + dy, gola)
        p.d(13, 25 + dy, gola); p.d(18, 25 + dy, gola)
    return p


def calca(dy, cor, sapato, passo=0, quadril=False):
    p = Parte()
    p.ret(8 if quadril else 9, 34 + dy, 23 if quadril else 22, 36 + dy, cor)
    for x0 in (10, 16):
        p.ret(x0, 34 + dy, x0 + 5, 44 + dy, cor)
    s = Parte()
    for x0 in (10, 17):
        s.ret(x0, 45 + dy, x0 + 4, 46 + dy, sapato)
    return [p, s]


def vestido(dy, cor, sombra, barra):
    p = Parte()
    for y in range(34, 44):
        t = (y - 34) / 9
        meia = 6.5 + 3.5 * t
        x0, x1 = round(15.5 - meia), round(15.5 + meia)
        for x in range(x0, x1 + 1):
            p.p(x, y + dy, sombra if x >= x1 - 1 else cor)
    for x in range(5, 27):
        if (x, 43 + dy) in p.px:
            p.p(x, 43 + dy, barra)
    pernas = Parte()
    for x0 in (12, 17):
        pernas.ret(x0, 44 + dy, x0 + 2, 45 + dy, 'pele_media')
        pernas.ret(x0 - 1, 46 + dy, x0 + 2, 46 + dy, 'marrom')  # sandália
    return [pernas, p]


def bolinhas_cabelo(p, centros, dy, base, luz, sombra, r=2.0):
    for cx, cy in centros:
        for y in range(int(cy + dy - r) - 1, int(cy + dy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                ddx, ddy = x + 0.5 - cx, y + 0.5 - (cy + dy)
                if ddx * ddx + ddy * ddy <= r * r:
                    cor = base
                    if ddx + ddy < -r * 0.6:
                        cor = luz
                    elif ddx + ddy > r * 0.9:
                        cor = sombra
                    p.p(x, y, cor)


def montar(partes):
    """Compõe as partes em ordem; (parte, False) entra sem contorno (ex.: franja por cima do cabelo)."""
    q = quadro_vazio()
    for parte in partes:
        if isinstance(parte, tuple):
            compor(q, parte[0], contorno=parte[1])
        else:
            compor(q, parte)
    return q


# ─── Eliana ───────────────────────────────────────────────────────────────────
def eliana(respira=0, olhos='abertos', acenando=0):
    dy = respira
    xadrez = ('batom', 'amarelo', 'verde', 'preto', 'amarelo', 'batom')

    def camisa(x, y):  # estampa geométrica: vermelho, amarelo, verde e preto em diagonal
        return xadrez[((x + y) // 2 + (x - y) // 3) % len(xadrez)]

    lenco = Parte()
    lenco.elipse(16, 11.0 + dy, 7.0, 3.4, 'mostarda', ymax=12 + dy)
    for (x, y) in list(lenco.px):
        if x >= 21 or (x + y) % 5 == 0:
            lenco.p(x, y, 'mostarda_sombra')
    no = Parte()  # nozinho na frente
    no.ret(15, 7 + dy, 17, 9 + dy, 'mostarda')
    no.p(14, 7 + dy, 'mostarda'); no.p(18, 7 + dy, 'mostarda')
    no.d(16, 8 + dy, 'mostarda_sombra')
    cabeca = Parte()
    rosto(cabeca, dy, 'pele_clara', 'pele_clara_sombra', boca='batom_sombra', olhos=olhos,
          sobrancelha='castanho_luz', feliz=acenando > 0)
    cabelo = Parte()  # cabelo castanho preso, aparecendo atrás das orelhas
    cabelo.ret(9, 12 + dy, 10, 16 + dy, 'castanho_luz'); cabelo.ret(21, 12 + dy, 22, 16 + dy, 'castanho_luz')
    t = tronco(dy, camisa, gola='batom', curvas=True)
    b = bracos(dy, 'pele_clara', 'batom', acenando, manga_ate=0.45)
    for parte in b:  # manga estampada
        for (x, y), cor in list(parte.px.items()):
            if cor == C['batom'] and (x + y) % 3:
                parte.px[(x, y)] = C[camisa(x, y)]
    pernas = calca(0, 'preto', 'contorno', quadril=True)
    return montar(pernas + [t] + b + [cabelo, cabeca, lenco, no])


# ─── Cabelo comprido ondulado (gêmeas e Valentina) ────────────────────────────
def cabelo_comprido(dy, base, luz, sombra, mecha=None, ate=27, volume=0, suave=False):
    """Cabelo até os ombros, ondulado, repartido no meio. Volta (atrás) + franja (na frente)."""
    atras = Parte()
    atras.elipse(16, 13 + dy, 7.6 + volume, 6.4, base, ymax=16 + dy)
    for y in range(14, ate + 1):
        onda = 1 if (y // 2) % 2 else 0
        for x in range(8 - volume - onda, 11):
            atras.p(x, y + dy, base)
        for x in range(21, 24 + volume + onda):
            atras.p(x, y + dy, base)
    for (x, y) in list(atras.px):
        if suave:  # grisalho liso-ondulado: mechas verticais suaves
            if x in (9, 22) and (y - dy) % 3 == 0:
                atras.p(x, y, luz)
            elif x in (8, 23) or (x in (10, 21) and (y - dy) > 22):
                atras.p(x, y, sombra)
        elif (x + (y - dy)) % 4 == 0:
            atras.p(x, y, luz)
        elif (x - (y - dy)) % 5 == 0:
            atras.p(x, y, sombra)
    if suave:  # pontas mais finas: tira os cantos de baixo
        for x in (8, 23):
            for y in range(ate - 2, ate + 1):
                atras.px.pop((x, y + dy), None)
            atras.px.pop((7, y + dy), None); atras.px.pop((24, y + dy), None)
    if mecha:
        for y in range(14, ate - 2):
            atras.p(22 + ((y // 2) % 2), y + dy, mecha)
    frente = Parte()
    frente.elipse(16, 12.5 + dy, 6.8, 2.8, base, ymax=12 + dy)
    for x in range(10, 23):
        if (x, 11 + dy) in frente.px and x % 3 == 0:
            frente.d(x, 11 + dy, luz)
    frente.d(16, 10 + dy, sombra); frente.d(16, 11 + dy, sombra)  # risca no meio
    frente.p(10, 13 + dy, base); frente.p(9, 14 + dy, base)  # cai pelos lados do rosto
    frente.p(21, 13 + dy, base); frente.p(22, 14 + dy, base)
    if mecha:
        frente.p(21, 13 + dy, mecha); frente.d(20, 11 + dy, mecha)
    return atras, frente


def pernas_calca(cor, sapato):
    p = Parte()
    p.ret(9, 34, 22, 36, cor)
    for x0 in (10, 16):
        p.ret(x0, 34, x0 + 5, 44, cor)
    s = Parte()
    for x0 in (10, 17):
        s.ret(x0, 45, x0 + 4, 46, sapato)
    return [p, s]


def saia_longa(cor, sombra):
    p = Parte()
    for y in range(34, 45):
        meia = 6.5 + 2.5 * (y - 34) / 10
        x0, x1 = round(15.5 - meia), round(15.5 + meia)
        for x in range(x0, x1 + 1):
            p.p(x, y, sombra if x >= x1 - 1 or (x - x0) % 4 == 3 else cor)
    s = Parte()
    for x0 in (11, 17):
        s.ret(x0, 45, x0 + 3, 46, 'marrom')
    return [s, p]


# ─── Gêmeas (mãe e tia da Bia), da foto ──────────────────────────────────────
#   gemea_mae: blusa branca de renda, colar de contas vermelhas e pulseiras, saia vinho
#   gemea_tia: camiseta branca, cordão preto comprido com pingente de madeira, calça jeans
GEMEAS = ('gemea_mae', 'gemea_tia')


def gemea(qual, respira=0, olhos='abertos', acenando=0):
    dy = respira
    atras, frente = cabelo_comprido(dy, 'grisalho_escuro', 'grisalho_escuro_luz', 'grisalho_escuro_sombra', ate=26, volume=0, suave=True)
    cabeca = Parte()
    rosto(cabeca, dy, 'pele_media', 'pele_media_sombra', boca='batom_sombra', olhos=olhos,
          sobrancelha='grisalho_escuro_sombra', feliz=acenando > 0)

    def blusa(x, y):
        if x >= 21:
            return 'branco_sombra'
        if qual == 'gemea_mae' and (x + 2 * y) % 5 == 0 and y > 26:
            return 'renda'
        return 'branco'

    t = tronco(dy, blusa)
    if qual == 'gemea_mae':
        for x in range(12, 20):  # colar de contas vermelhas
            t.d(x, 25 + dy + (1 if 14 <= x <= 17 else 0), 'batom' if x % 2 else 'barra')
        pernas = saia_longa('vinho', 'batom_sombra')
    else:
        for y in range(25, 30):  # cordão preto comprido
            t.d(14 + (y - 25) // 3, y + dy, 'contorno'); t.d(17 - (y - 25) // 3, y + dy, 'contorno')
        t.d(15, 30 + dy, 'madeira'); t.d(16, 30 + dy, 'madeira'); t.d(15, 31 + dy, 'madeira_luz'); t.d(16, 31 + dy, 'contorno')
        pernas = pernas_calca('jeans', 'preto')
    b = bracos(dy, 'pele_media', 'branco', acenando, manga_ate=0.9 if qual == 'gemea_mae' else 0.35)
    if qual == 'gemea_mae':  # pulseiras no braço esquerdo
        b[0].d(5, 33 + dy, 'branco'); b[0].d(6, 33 + dy, 'batom'); b[0].d(5, 32 + dy, 'ouro')
    return montar(pernas + [t] + b + [atras, cabeca, (frente, False)])


# ─── Valentina (filha), da foto ──────────────────────────────────────────────
def valentina(respira=0, olhos='abertos', acenando=0):
    dy = respira
    atras, frente = cabelo_comprido(dy, 'olho', 'castanho_luz', 'contorno', mecha='mostarda', ate=26, volume=1)
    cabeca = Parte()
    rosto(cabeca, dy, 'pele_val', 'pele_val_sombra', boca='batom_sombra', olhos=olhos,
          sobrancelha='castanho', oculos=True, cor_oculos='cabelo_rosa', feliz=acenando > 0)

    def roupa(x, y):
        if x <= 11 or x >= 20:
            return 'preto'  # colete preto aberto
        return 'vermelho_sombra' if x == 19 else 'vermelho'

    t = tronco(dy, roupa)
    for y in (26, 28, 30, 32):  # rebites do colete
        t.d(11, y + dy, 'metal_luz'); t.d(20, y + dy, 'metal_luz')
    t.d(12, 24 + dy, 'cabelo_rosa'); t.d(19, 24 + dy, 'cabelo_rosa')  # alças da mochila
    t.d(12, 25 + dy, 'cabelo_rosa'); t.d(19, 25 + dy, 'cabelo_rosa')
    for x in (14, 15, 16, 17):  # colarzinho de miçangas
        t.d(x, 25 + dy, 'ouro_sombra' if x % 2 else 'contorno')
    t.ret(14, 28 + dy, 17, 30 + dy, 'vermelho')  # estampa branca da camiseta
    t.d(15, 28 + dy, 'branco'); t.d(16, 28 + dy, 'branco'); t.d(14, 29 + dy, 'branco'); t.d(17, 29 + dy, 'branco')
    t.d(14, 30 + dy, 'branco'); t.d(15, 30 + dy, 'branco'); t.d(16, 30 + dy, 'branco'); t.d(17, 30 + dy, 'branco')
    b = bracos(dy, 'pele_val', 'preto', acenando, manga_ate=0.4)
    pernas = pernas_calca('tatuagem', 'preto')
    return montar(pernas + [t] + b + [atras, cabeca, (frente, False)])


# ─── Pôr do Sol (gato laranja e branco), quadro 24×16 ─────────────────────────
GX, GY, GW, GH = 4, 32, 24, 16  # recorte do quadro 32×48


def gato_sentado(rabo=0, piscando=False):
    rabo_p = Parte()
    pontas = [(4, 41), (3, 43), (4, 39), (3, 44)]
    px, py = pontas[rabo]
    rabo_p.linha(10, 46, 6, 46, 'laranja', 1)
    rabo_p.linha(6, 46, px + 1, py + 1, 'laranja', 2)
    rabo_p.d(px, py, 'branco'); rabo_p.d(px + 1, py + 1, 'branco'); rabo_p.d(px + 1, py, 'branco')  # ponta branca
    corpo = Parte()
    corpo.elipse(13, 42.5, 5.2, 4.2, 'laranja')
    for x in (10, 12):
        corpo.d(x, 39, 'laranja_sombra'); corpo.d(x, 40, 'laranja_sombra')
    corpo.elipse(15.0, 43.8, 3.4, 3.0, 'branco')  # peito e barriga brancos
    corpo.ret(9, 45, 11, 46, 'branco')  # pata de trás branca
    corpo.ret(14, 45, 16, 46, 'branco'); corpo.ret(18, 45, 19, 46, 'branco')  # meias brancas
    cabeca = Parte()
    cabeca.elipse(18.5, 36.5, 3.8, 3.2, 'laranja')
    cabeca.p(15, 33, 'laranja'); cabeca.p(16, 32, 'laranja')  # orelhas
    cabeca.p(20, 33, 'laranja'); cabeca.p(21, 32, 'laranja')
    cabeca.d(16, 33, 'cabelo_rosa'); cabeca.d(21, 33, 'cabelo_rosa')
    cabeca.ret(16, 37, 21, 39, 'branco')  # focinho e queixo brancos
    cabeca.d(18, 34, 'branco'); cabeca.d(19, 34, 'branco'); cabeca.d(18, 35, 'branco'); cabeca.d(19, 35, 'branco')
    cabeca.d(18, 36, 'branco'); cabeca.d(19, 36, 'branco')  # listra branca entre os olhos
    cabeca.d(16, 35, 'laranja_sombra'); cabeca.d(21, 35, 'laranja_sombra')
    if piscando:
        cabeca.d(17, 36, 'olho'); cabeca.d(20, 36, 'olho')
    else:
        cabeca.d(17, 35, 'verde'); cabeca.d(17, 36, 'olho'); cabeca.d(20, 35, 'verde'); cabeca.d(20, 36, 'olho')
    cabeca.d(18, 37, 'cabelo_rosa'); cabeca.d(19, 37, 'cabelo_rosa')  # narizinho
    return montar([rabo_p, corpo, cabeca])


def gato_dormindo(respira=0):
    corpo = Parte()
    corpo.elipse(13.5, 43.5 - respira * 0.5, 7.5, 3.2 + respira * 0.4, 'laranja', ymax=46)
    for x in (9, 12, 15):
        corpo.d(x, 41, 'laranja_sombra')
    corpo.ret(10, 44, 18, 46, 'branco')  # barriga branca
    corpo.linha(6, 46, 13, 46, 'laranja', 1)  # rabo enrolado na frente
    corpo.ret(5, 46, 7, 46, 'branco')  # ponta branca do rabo
    corpo.ret(15, 46, 18, 46, 'branco')  # patinhas
    cabeca = Parte()
    cabeca.elipse(20.5, 42.5, 3.4, 2.8, 'laranja')
    cabeca.p(19, 39, 'laranja'); cabeca.p(22, 39, 'laranja')
    cabeca.ret(19, 43, 23, 45, 'branco')
    cabeca.d(21, 40, 'branco'); cabeca.d(21, 41, 'branco'); cabeca.d(21, 42, 'branco')  # listra branca
    cabeca.d(19, 42, 'olho'); cabeca.d(20, 42, 'olho')  # olhinhos fechados
    cabeca.d(22, 42, 'olho'); cabeca.d(23, 42, 'olho')
    cabeca.d(21, 43, 'cabelo_rosa')
    q = montar([corpo, cabeca])
    zs = [(24, 36), (26, 34)] if respira else [(24, 37)]
    for x, y in zs:
        q[y][x] = C['branco']
    return q


def recorte_gato(q):
    return [row[GX:GX + GW] for row in q[GY:GY + GH]]


# ─── Saída ────────────────────────────────────────────────────────────────────
def animacoes():
    A = {
        'npc_eliana_parada': [eliana(), eliana(1, 'fechados')],
        'npc_eliana_acenando': [eliana(acenando=1), eliana(acenando=2)],
        'npc_valentina_parada': [valentina(), valentina(1, 'fechados')],
        'npc_valentina_acenando': [valentina(acenando=1), valentina(acenando=2)],
        'gato_sentado': [recorte_gato(gato_sentado(i, piscando=(i == 2))) for i in range(4)],
        'gato_dormindo': [recorte_gato(gato_dormindo(0)), recorte_gato(gato_dormindo(1))],
    }
    for g in GEMEAS:
        A[f'npc_{g}_parada'] = [gemea(g), gemea(g, 1, 'fechados')]
        A[f'npc_{g}_acenando'] = [gemea(g, acenando=1), gemea(g, acenando=2)]
    return A


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, 'public', 'jogo', 'sprites')
    os.makedirs(saida, exist_ok=True)
    A = animacoes()
    for nome, quadros in A.items():
        salvar_png(os.path.join(saida, f'{nome}_{len(quadros)}q.png'), tira(quadros) if len(quadros[0]) == H else
                   [sum((q[y] for q in quadros), []) for y in range(GH)])
        print(nome, len(quadros), 'quadros')
    if '--previa' in sys.argv:
        destino = sys.argv[sys.argv.index('--previa') + 1]
        fila = [A['npc_eliana_parada'][0], A['npc_eliana_acenando'][1], A['npc_gemea_mae_parada'][0],
                A['npc_gemea_tia_parada'][0], A['npc_valentina_parada'][0], A['npc_valentina_acenando'][1]]
        gato = [[None] * 4 + r + [None] * 4 for r in ([[None] * GW] * 32 + A['gato_sentado'][0])]
        gato2 = [[None] * 4 + r + [None] * 4 for r in ([[None] * GW] * 32 + A['gato_dormindo'][1])]
        salvar_png(destino, tira(fila + [gato, gato2]), escala=6, fundo=(254, 245, 226, 255))


if __name__ == '__main__':
    main()
