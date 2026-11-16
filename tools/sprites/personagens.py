#!/usr/bin/env python3
"""
Easter eggs do Acarabet: personagens que aparecem no cenário.

  Eliana      → chef e sócia: cabelo ruivo preso em rabo de cavalo, magrinha, camisa estampada com gola vermelha, calça preta
  Gêmeas      → mãe e tia da Bia (da foto): cabelo grisalho comprido e ondulado, blusas brancas;
                uma com colar de contas vermelhas e pulseiras, a outra com cordão preto e pingente de madeira
  Valentina   → filha da Bia (da foto): cachos escuros com mecha loira, óculos rosados, camiseta vermelha, colete preto
  Mesa dos tios → tio Luizinho (cabelo preto bem curtinho, polo cinza, relógio) e Toninho, pai da Bia (cabelo branco bem curtinho, camisa verde de palmeirense),
                  sentados à mesa com acarajé e cerveja; ao tocar, brindam. Quadro 64×48.
  Casal       → os clientes: ele negro de pele mais clara (barba, camisa vinho), ela retinta (black power,
                argolonas, blusa de estampa africana), na mesa de chita: esperando, feliz e comendo. Quadro 64×48.
  Pôr do Sol  → gatinho laranja listrado e branco (peito, patas e focinho brancos, rabo em anéis), da foto (sentado balançando o rabo e dormindo)

Mesmo estilo da Bia (tools/sprites/bia.py): 32×48 por quadro (gato: 24×17), contorno marrom-dendê.
Uso:  python3 tools/sprites/personagens.py [--previa arquivo.png]
Gera: public/jogo/sprites/npc_<nome>_<animacao>_<n>q.png e gato_<animacao>_<n>q.png
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bia import C, CURVAS, H, W, Parte, compor, hx, quadro_vazio, salvar_png, tira  # noqa: E402

C.update({
    'pele_clara': hx('f2cdb0'), 'pele_clara_sombra': hx('d6a587'),
    'pele_media': hx('c48d63'), 'pele_media_sombra': hx('9c6a45'),
    'pele_bia': C['pele'], 'pele_bia_sombra': C['pele_sombra'],
    'pele_val': hx('eec3a0'), 'pele_val_sombra': hx('cf9c78'), 'oculos_val': hx('6a2c8c'),
    'grisalho_escuro': hx('8f8a84'), 'grisalho_escuro_luz': hx('bdb8b1'), 'grisalho_escuro_sombra': hx('615c57'),
    'grisalho': hx('dedad3'), 'grisalho_sombra': hx('a9a39c'),
    'mostarda': hx('e2b43c'), 'mostarda_sombra': hx('b8892a'),
    'pele_vic': hx('dcae88'), 'pele_vic_sombra': hx('bb8a63'), 'boca_vic': hx('9a5a48'),
    'cachos_vic': hx('1e120c'), 'cachos_vic_luz': hx('4a2c1c'), 'cachos_vic_sombra': hx('0f0806'),
    'castanho': hx('4a2c1c'), 'castanho_luz': hx('7a4a2a'),
    'jeans': hx('3f6ea8'),
    'verde': hx('2e9e4f'),
    'gato': C['laranja'], 'gato_listra': C['laranja_sombra'], 'gato_creme': hx('f7d9b0'),  # laranja forte, como antes
    'ruivo': hx('c8572a'), 'ruivo_luz': hx('e8803f'), 'ruivo_sombra': hx('8a3518'),
    'pele_luiz': hx('5a3420'), 'pele_luiz_sombra': hx('3f2213'), 'boca_luiz': hx('5a2a20'),
    'pele_toninho': hx('dcab84'), 'pele_toninho_sombra': hx('b9875f'), 'boca_toninho': hx('9a5644'),
    'polo': hx('d6d1c3'), 'polo_sombra': hx('aea793'),
    'luiz_brilho': hx('8e5a39'), 'toninho_brilho': hx('f0c7a3'),
    'verde_palmeiras': hx('0f6b3c'), 'verde_palmeiras_sombra': hx('0a4c2a'),
    'cerveja': hx('f2b632'), 'espuma': hx('fff6dc'),
    'pele_cliente': hx('9c6641'), 'pele_cliente_sombra': hx('77492b'), 'boca_cliente': hx('6e3526'),
    'pele_retinta': hx('5b3424'), 'pele_retinta_sombra': hx('402316'), 'pele_retinta_luz': hx('7a4a32'),
    'boca_retinta': hx('7a1a24'), 'blush_retinta': hx('6e3428'),
    # variações do casal de clientes (o público do Acarajazz é bem diverso)
    'pele_branca': hx('f3d2b8'), 'pele_branca_sombra': hx('dba98a'), 'boca_branca': hx('b8645a'),
    'pele_asia': hx('efcfa4'), 'pele_asia_sombra': hx('d2a97c'), 'boca_asia': hx('b5615a'),
    'pele_parda': hx('c8936a'), 'pele_parda_sombra': hx('a3714b'), 'boca_parda': hx('84463a'),
    'cabelo_preto': hx('1c1614'), 'cabelo_preto_luz': hx('3d3532'),
    'cabelo_castanho_claro': hx('8a5a34'), 'cabelo_castanho_claro_luz': hx('b07a48'), 'cabelo_castanho_claro_sombra': hx('5e3a20'),
    'loiro': hx('e0b860'), 'loiro_luz': hx('f4d88c'), 'loiro_sombra': hx('b48a3a'),
    'camisa_azul': hx('3f7fc4'), 'camisa_azul_sombra': hx('2c5c93'),
    'camisa_verde': hx('3a8f55'), 'camisa_verde_sombra': hx('286a3d'),
    'camisa_mostarda': hx('e2b43c'), 'camisa_mostarda_sombra': hx('b48a26'),
    'blusa_coral': hx('ef7a5e'), 'blusa_coral_sombra': hx('c95a42'),
    'blusa_lilas': hx('b28ad8'), 'blusa_lilas_sombra': hx('8a64b4'),
    'blusa_vermelha': hx('d23a3a'), 'blusa_vermelha_sombra': hx('a12828'),
    'saia_azul': hx('2f5d9a'),
    'vermelho': hx('d9473e'), 'vermelho_sombra': hx('a8322b'),
})


# ─── Peças comuns ─────────────────────────────────────────────────────────────
def rosto(p, dy, pele, sombra, boca='batom_sombra', olhos='abertos', sobrancelha='castanho', oculos=False, feliz=False, cor_oculos='olho', blush='blush', brilho_olho=False):
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
            if brilho_olho:  # brilhinho no olho (pele bem escura)
                p.d(x - 1 if x == 13 else x + 1, 17 + dy, 'branco_sombra')
                p.d(x, 16 + dy, 'branco')
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
    if blush:
        p.d(11, 19 + dy, blush); p.d(20, 19 + dy, blush)
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


def bracos(dy, pele, manga, acenando=0, manga_ate=0.5, a=0):
    """Braços parados; acenando = 1 ou 2 (quadros do tchauzinho com a mão direita). a = aproxima do corpo (magra)."""
    e, d = Parte(), Parte()
    braco(e, (8 + a, 25 + dy), (5 + a, 30 + dy), (5 + a, 34 + dy), pele, manga, manga_ate)
    if acenando:
        mx = 26 if acenando == 1 else 28
        braco(d, (22 - a, 25 + dy), (25 - a, 22 + dy), (mx - a, 17 + dy), pele, manga, manga_ate)
    else:
        braco(d, (22 - a, 25 + dy), (25 - a, 30 + dy), (25 - a, 34 + dy), pele, manga, manga_ate)
    return [e, d]


MAGRA = {24: (10, 21), 25: (10, 21), 26: (10, 21), 27: (10, 21), 28: (11, 20), 29: (11, 20),
         30: (11, 20), 31: (11, 20), 32: (11, 20), 33: (11, 20)}


def tronco(dy, padrao, gola=None, curvas=False, magra=False):
    """Tronco com cintura; padrao(x, y) → cor. curvas=True usa a silhueta da Bia (busto, cintura fina, quadril)."""
    p = Parte()
    larg = {24: (9, 22), 25: (9, 22), 26: (8, 23), 27: (8, 23), 28: (9, 22), 29: (10, 21),
            30: (10, 21), 31: (10, 21), 32: (10, 21), 33: (9, 22)}
    if curvas:
        larg = {y: CURVAS[y] for y in range(24, 34)}
    if magra:
        larg = MAGRA
    for y, (x0, x1) in larg.items():
        for x in range(x0, x1 + 1):
            p.p(x, y + dy, padrao(x, y))
    if gola:
        for x in (12, 13, 18, 19):
            p.d(x, 24 + dy, gola)
        p.d(13, 25 + dy, gola); p.d(18, 25 + dy, gola)
    return p


def calca(dy, cor, sapato, passo=0, quadril=False, magra=False):
    p = Parte()
    p.ret(8 if quadril else 9, 34 + dy, 23 if quadril else 22, 36 + dy, cor)
    for x0 in ((9, 17) if quadril else (10, 16)):
        p.ret(x0, 34 + dy, x0 + 5, 44 + dy, cor)
    if magra:  # calça reta e fininha
        p = Parte()
        p.ret(11, 34 + dy, 20, 36 + dy, cor)
        for x0 in (11, 17):
            p.ret(x0, 34 + dy, x0 + 3, 44 + dy, cor)
        s = Parte()
        for x0 in (10, 17):
            s.ret(x0, 45 + dy, x0 + 4, 46 + dy, sapato)
        return [p, s]
    if quadril:  # vão entre as pernas
        for y in range(38, 45):
            p.px.pop((15, y + dy), None); p.px.pop((16, y + dy), None)
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

    rabo = Parte()  # rabo de cavalo ruivo, caindo atrás do ombro direito
    for k, y in enumerate(range(13, 25)):
        x = 22 + (1 if 15 <= y <= 21 else 0)
        rabo.ret(x, y + dy, x + 1, y + dy, 'ruivo')
        rabo.d(x + 1, y + dy, 'ruivo_sombra' if k % 3 == 0 else 'ruivo')
        if k % 3 == 1:
            rabo.d(x, y + dy, 'ruivo_luz')
    rabo.p(23, 25 + dy, 'ruivo_luz')
    cabelo = Parte()  # cabelo ruivo puxado pra trás, liso no alto da cabeça
    cabelo.elipse(16, 12.6 + dy, 6.9, 4.0, 'ruivo', ymax=13 + dy)
    for (x, y) in list(cabelo.px):
        if x >= 21:
            cabelo.p(x, y, 'ruivo_sombra')
        elif (x - (y - dy) // 2) % 3 == 0 and y < 12 + dy:
            cabelo.p(x, y, 'ruivo_luz')  # fios penteados pra trás
    for x in range(12, 21):  # linha do cabelo arredondada: testa aparece
        cabelo.px.pop((x, 13 + dy), None)
        if 13 <= x <= 19:
            cabelo.px.pop((x, 12 + dy), None)
    cabelo.p(9, 13 + dy, 'ruivo'); cabelo.p(22, 13 + dy, 'ruivo_sombra')
    cabelo.d(22, 12 + dy, 'batom'); cabelo.d(22, 13 + dy, 'batom')  # elástico
    cabeca = Parte()
    rosto(cabeca, dy, 'pele_clara', 'pele_clara_sombra', boca='batom_sombra', olhos=olhos,
          sobrancelha='ruivo_sombra', feliz=acenando > 0)
    t = tronco(dy, camisa, gola='batom', magra=True)
    b = bracos(dy, 'pele_clara', 'batom', acenando, manga_ate=0.45, a=1)
    for parte in b:  # manga estampada
        for (x, y), cor in list(parte.px.items()):
            if cor == C['batom'] and (x + y) % 3:
                parte.px[(x, y)] = C[camisa(x, y)]
    pernas = calca(0, 'preto', 'contorno', magra=True)
    return montar([rabo] + pernas + [t] + b + [cabeca, cabelo])


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
    atras, frente = cabelo_comprido(dy, 'olho', 'castanho_luz', 'contorno', mecha='mostarda', ate=20, volume=1)  # chanel na altura do queixo
    cabeca = Parte()
    rosto(cabeca, dy, 'pele_val', 'pele_val_sombra', boca='batom_sombra', olhos=olhos,
          sobrancelha='castanho', oculos=True, cor_oculos='oculos_val', feliz=acenando > 0)

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


# ─── Vic (irmão da Bia): adolescente, todo de preto alternativo, cabelo cacheado bem volumoso ─────
def cachos_vic(dy):
    """Cabelo cacheado escuro e cheio: volume em volta da cabeça (atrás) e cachinhos caindo na testa (frente)."""
    atras, frente = Parte(), Parte()
    centros = []
    for k in range(15):  # arco largo em volta da cabeça
        a = math.pi * (0.95 + k * 1.1 / 14)
        centros.append((16 + 8.2 * math.cos(a), 15.5 + 7.6 * math.sin(a)))
    centros += [(8.2, 18.5), (23.8, 18.5), (8.8, 21.5), (23.2, 21.5), (12, 8), (16, 7.2), (20, 8)]
    bolinhas_cabelo(atras, centros, dy, 'cachos_vic', 'cachos_vic_luz', 'cachos_vic_sombra', r=2.4)
    # cachinhos na testa, caindo um pouco por cima das sobrancelhas
    bolinhas_cabelo(frente, [(11.5, 12.2), (14.5, 11.6), (17.5, 11.6), (20.5, 12.2), (13, 13.6), (19, 13.6)], dy,
                    'cachos_vic', 'cachos_vic_luz', 'cachos_vic_sombra', r=1.8)
    for (x, y) in ((10, 10), (16, 9), (22, 10), (9, 16), (23, 16)):  # brilhinho dos cachos
        atras.d(x, y + dy, 'cachos_vic_luz')
    return atras, frente


def vic(k=0, olhos='abertos'):
    """Atrás do balcão lavando louça (k = quadro do movimento da esponja/prato)."""
    dy = 1  # um pouquinho mais baixo que os adultos
    atras, frente = cachos_vic(dy)
    cabeca = Parte()
    rosto(cabeca, dy, 'pele_vic', 'pele_vic_sombra', boca='pele_vic', olhos=olhos, sobrancelha='cachos_vic', blush=False)
    cabeca.d(15, 20 + dy, 'boca_vic'); cabeca.d(16, 20 + dy, 'boca_vic')  # cara séria, concentrado na louça

    def roupa(x, y):
        if x <= 11 or x >= 20:
            return 'preto_luz'  # casaco longo preto aberto por cima
        return 'preto'  # camiseta preta

    t = tronco(dy, roupa)
    # estampa branca da camiseta (de banda)
    for (x, y) in ((15, 27), (16, 27), (14, 28), (17, 28), (14, 29), (15, 29), (16, 29), (17, 29), (15, 30), (16, 30)):
        t.d(x, y + dy, 'branco')
    t.d(15, 28 + dy, 'preto'); t.d(16, 28 + dy, 'preto')
    t.d(11, 26 + dy, 'preto'); t.d(20, 26 + dy, 'preto')  # dobra da gola do casaco
    # braços pra frente, nas mangas compridas do casaco, mexendo o prato dentro da cuba
    hx_ = (11, 13, 15, 13)[k]
    e, d = Parte(), Parte()
    braco(e, (8, 25 + dy), (7, 29 + dy), (hx_, 30 + dy), 'pele_vic', 'preto_luz', manga_ate=1.0)
    braco(d, (22, 25 + dy), (24, 29 + dy), (hx_ + 7, 30 + dy), 'pele_vic', 'preto_luz', manga_ate=1.0)
    for b, mx in ((e, hx_), (d, hx_ + 7)):  # mãos aparecendo na ponta da manga
        b.p(mx, 30 + dy, 'pele_vic'); b.p(mx + 1, 30 + dy, 'pele_vic')
    prato = Parte()
    prato.elipse(hx_ + 4.5, 29.5 + dy, 3.6, 1.4, 'branco')
    prato.d(hx_ + 3, 29 + dy, 'branco_sombra')
    cuba = Parte()  # cuba de inox com espuma, em cima do tampo do balcão
    cuba.ret(7, 31 + dy, 25, 32 + dy, 'metal_luz')
    for i, x in enumerate(range(8, 25, 3)):
        cuba.elipse(x + (k % 2), 30.6 + dy - (i + k) % 2, 1.4, 1.1, 'branco')  # espuma
    pernas = pernas_calca('preto', 'preto')
    return montar(pernas + [t, atras, cabeca, (frente, False), e, d, prato, cuba])


# ─── Pôr do Sol (gato laranja e branco), quadro 24×17 ─────────────────────────
GX, GY, GW, GH = 4, 31, 24, 17  # recorte do quadro 32×48


def rabo_listrado(p, pontos):
    """Rabo em anéis laranja e creme (como na foto)."""
    for k, (x, y) in enumerate(pontos):
        p.p(x, y, 'gato_listra' if k % 2 else 'gato')
        p.p(x, y + 1, 'gato_listra' if k % 2 else 'gato')


def gato_sentado(rabo=0, piscando=False):
    rabo_p = Parte()
    pontas = [[(4, 41), (5, 42), (5, 43)], [(3, 43), (4, 44), (5, 44)], [(4, 39), (4, 40), (5, 42)], [(3, 44), (4, 45), (5, 45)]]
    rabo_listrado(rabo_p, [(9, 45), (8, 45), (7, 45), (6, 44)] + pontas[rabo])
    corpo = Parte()
    corpo.elipse(13, 42.5, 5.2, 4.2, 'gato')
    for x in (9, 11, 13):  # listras nas costas
        corpo.d(x, 39, 'gato_listra'); corpo.d(x, 40, 'gato_listra'); corpo.d(x - 1, 41, 'gato_listra')
    corpo.elipse(15.0, 44.0, 3.8, 3.2, 'branco')  # peito, barriga e patas brancos
    corpo.ret(9, 45, 12, 46, 'branco')
    corpo.d(16, 44, 'branco_sombra'); corpo.d(17, 45, 'branco_sombra')
    corpo.ret(14, 46, 16, 46, 'branco'); corpo.ret(18, 46, 19, 46, 'branco')
    cabeca = Parte()
    cabeca.elipse(18.5, 36.5, 3.8, 3.2, 'gato')
    cabeca.p(15, 33, 'gato'); cabeca.p(16, 32, 'gato')  # orelhas
    cabeca.p(20, 33, 'gato'); cabeca.p(21, 32, 'gato')
    cabeca.d(16, 33, 'cabelo_rosa'); cabeca.d(21, 33, 'cabelo_rosa')
    cabeca.d(17, 34, 'gato_listra'); cabeca.d(18, 34, 'gato_listra'); cabeca.d(20, 34, 'gato_listra')  # listrinhas na testa
    cabeca.ret(17, 38, 20, 39, 'branco')  # focinho e queixo brancos
    cabeca.d(16, 38, 'gato_creme'); cabeca.d(21, 38, 'gato_creme')
    if piscando:
        cabeca.d(17, 36, 'olho'); cabeca.d(20, 36, 'olho')
    else:
        cabeca.d(17, 35, 'verde'); cabeca.d(17, 36, 'olho'); cabeca.d(20, 35, 'verde'); cabeca.d(20, 36, 'olho')
    cabeca.d(18, 37, 'cabelo_rosa'); cabeca.d(19, 37, 'cabelo_rosa')  # narizinho
    return montar([rabo_p, corpo, cabeca])


def gato_dormindo(respira=0):
    """Enroladinho como na foto: costas laranja listradas, peito e patas brancos na frente, rabo listrado por baixo."""
    corpo = Parte()
    corpo.elipse(12.5, 43.5 - respira * 0.5, 7.5, 3.2 + respira * 0.4, 'gato', ymax=46)
    for x in (7, 10, 13, 16):
        corpo.d(x, 41, 'gato_listra'); corpo.d(x + 1, 42, 'gato_listra')
    corpo.ret(14, 44, 19, 46, 'branco')  # peito e patinhas brancos
    corpo.d(16, 45, 'branco_sombra')
    rabo = Parte()
    rabo_listrado(rabo, [(4, 45), (5, 45), (6, 45), (7, 45), (8, 45), (9, 45), (10, 45), (11, 45), (12, 45)])
    cabeca = Parte()
    cabeca.elipse(20.5, 42.5, 3.4, 2.8, 'gato')
    cabeca.p(19, 39, 'gato'); cabeca.p(22, 39, 'gato')
    cabeca.d(20, 40, 'gato_listra'); cabeca.d(21, 40, 'gato_listra')
    cabeca.ret(19, 44, 23, 45, 'branco')  # focinho e queixo brancos
    cabeca.d(19, 42, 'olho'); cabeca.d(20, 42, 'olho')  # olhinhos fechados
    cabeca.d(22, 42, 'olho'); cabeca.d(23, 42, 'olho')
    cabeca.d(21, 43, 'cabelo_rosa')
    q = montar([corpo, rabo, cabeca])
    zs = [(24, 36), (26, 34)] if respira else [(24, 37)]
    for x, y in zs:
        q[y][x] = C['branco']
    return q


def recorte_gato(q):
    return [row[GX:GX + GW] for row in q[GY:GY + GH]]


# ─── Mesa dos tios: tio Luizinho e Toninho (pai da Bia), quadro 64×48 ──────────
MW = 64


def compor_em(q, parte, ox=0, contorno=True):
    """Como compor(), mas num quadro de qualquer largura e com deslocamento horizontal."""
    h, w = len(q), len(q[0])
    px = {(x + ox, y): c for (x, y), c in parte.px.items()}
    if contorno:
        for (x, y) in px:
            for vx, vy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                v = (x + vx, y + vy)
                if v not in px and 0 <= v[0] < w and 0 <= v[1] < h:
                    q[v[1]][v[0]] = C['contorno']
    for (x, y), cor in list(px.items()) + [((x + ox, y), c) for (x, y), c in parte.detalhes.items()]:
        if 0 <= x < w and 0 <= y < h:
            q[y][x] = cor


def homem_sentado(quem, dy=0, olhos='abertos', feliz=False):
    """Busto de quem está sentado atrás da mesa (a mesa cobre da cintura pra baixo)."""
    if quem == 'luizinho':
        pele, sombra, boca = 'pele_luiz', 'pele_luiz_sombra', 'boca_luiz'
        camisa, camisa_s, larg = 'polo', 'polo_sombra', (7, 24)
    else:
        pele, sombra, boca = 'pele_toninho', 'pele_toninho_sombra', 'boca_toninho'
        camisa, camisa_s, larg = 'verde_palmeiras', 'verde_palmeiras_sombra', (9, 22)  # palmeirense
    tronco_p = Parte()
    for y in range(24, 35):
        x0, x1 = larg
        if y == 24:
            x0, x1 = x0 + 1, x1 - 1
        for x in range(x0, x1 + 1):
            tronco_p.p(x, y + dy, camisa_s if x >= x1 - 1 else camisa)
    # gola e botões
    tronco_p.d(14, 24 + dy, camisa_s); tronco_p.d(17, 24 + dy, camisa_s)
    for y in (26, 28) if quem == 'toninho' else (26,):
        tronco_p.d(16, y + dy, camisa_s)
    if quem == 'luizinho':  # gola de polo
        tronco_p.ret(13, 24 + dy, 14, 25 + dy, camisa_s); tronco_p.ret(17, 24 + dy, 18, 25 + dy, camisa_s)
    if quem == 'toninho':  # golinha branca
        tronco_p.d(14, 24 + dy, 'branco'); tronco_p.d(17, 24 + dy, 'branco')
    cabeca = Parte()
    cabeca.elipse(16, 14.5 + dy, 6.1, 5.2, pele)  # cabeça redondinha (cabelo raspadinho)
    if quem == 'luizinho':  # rosto mais cheinho
        cabeca.elipse(16, 18 + dy, 6.8, 6.0, pele, ymin=12 + dy)
    rosto(cabeca, dy, pele, sombra, boca=boca, olhos=olhos,
          sobrancelha='olho' if quem == 'luizinho' else 'grisalho_escuro_sombra', feliz=feliz)
    # cabelo bem curtinho, rente à cabeça (pintado por cima do couro, sem volume)
    cor, luz = ('olho', 'castanho') if quem == 'luizinho' else ('grisalho', 'branco')
    topo = 12 if quem == 'luizinho' else 11  # linha do cabelo na testa
    for (x, y) in list(cabeca.px):
        lado = x <= 10 or x >= 21
        limite = (topo + 3) if lado else topo
        if y - dy <= limite:
            cabeca.d(x, y, luz if (x * 3 + y) % 5 == 0 else cor)
    cabelo = Parte()  # (nada por cima: o cabelo já está na cabeça)
    return tronco_p, cabeca, cabelo, pele, camisa


def braco_mesa(p, ombro, cotovelo, mao, pele, manga):
    braco(p, ombro, cotovelo, mao, pele, manga, 0.4)


def copo(x, y):
    p = Parte()
    p.ret(x, y, x + 2, y + 3, 'cerveja')
    p.ret(x, y, x + 2, y, 'espuma')
    p.d(x, y + 1, 'espuma')  # brilho do vidro
    return p


def mesa_tios(brinde=0, respira=0, olhos='abertos'):
    """brinde: 0 = parados com os braços na mesa; 1 = levantando o copo; 2 = tim-tim!"""
    q = [[None] * MW for _ in range(H)]
    feliz = brinde > 0
    pessoas = []
    for quem, ox in (('luizinho', 0), ('toninho', 32)):
        t, cab, cabelo, pele, camisa = homem_sentado(quem, respira if quem == 'luizinho' else 0, olhos, feliz)
        pessoas.append((quem, ox, t, cab, cabelo, pele, camisa))
    # corpos e cabeças
    for quem, ox, t, cab, cabelo, pele, camisa in pessoas:
        compor_em(q, t, ox)
        compor_em(q, cab, ox)
        compor_em(q, cabelo, ox)
    # pernas e cadeiras (aparecem embaixo da mesa)
    for ox, calca_cor in ((0, 'metal_sombra'), (32, 'jeans')):
        cad = Parte()  # cadeira dobrável de madeira
        cad.linha(ox + 9, 36, ox + 11, 47, 'madeira'); cad.linha(ox + 23, 36, ox + 21, 47, 'madeira')
        cad.ret(ox + 9, 40, ox + 23, 40, 'madeira_luz')
        compor_em(q, cad)
        pernas = Parte()
        for x0 in (ox + 11, ox + 17):
            pernas.ret(x0, 36, x0 + 3, 45, calca_cor)
            pernas.ret(x0 - 1, 46, x0 + 3, 47, 'preto')  # sapato
        compor_em(q, pernas)
    # mesa de madeira
    mesa = Parte()
    mesa.ret(2, 34, 61, 36, 'madeira')
    mesa.ret(2, 34, 61, 34, 'madeira_luz')
    for x in range(4, 60, 7):
        mesa.d(x, 35, 'madeira_luz')
    mesa.ret(5, 37, 7, 47, 'madeira'); mesa.ret(56, 37, 58, 47, 'madeira')
    compor_em(q, mesa)
    prato = Parte()  # pratinho com acarajé no meio
    prato.ret(27, 33, 36, 33, 'branco'); prato.ret(26, 34, 37, 34, 'branco_sombra')
    prato.elipse(31.5, 32.0, 3.2, 1.6, 'barra')
    prato.d(30, 31, 'amarelo'); prato.d(32, 31, 'amarelo'); prato.d(31, 32, 'laranja_sombra')
    compor_em(q, prato)
    # braços: o de fora fica na mesa; o de dentro segura o copo (e brinda)
    for quem, ox, t, cab, cabelo, pele, camisa in pessoas:
        luiz = quem == 'luizinho'
        fora, dentro = Parte(), Parte()
        if luiz:
            braco_mesa(fora, (7, 25), (5, 30), (8, 33), pele, camisa)
            fora.d(7, 32, 'metal_luz'); fora.d(8, 32, 'metal')  # relógio
        else:
            braco_mesa(fora, (22, 25), (25, 30), (22, 33), pele, camisa)
        compor_em(q, fora, ox)
        if brinde == 0:
            mx, my = (21, 32) if luiz else (8, 32)
        elif brinde == 1:
            mx, my = (23, 26) if luiz else (6, 26)
        else:
            mx, my = (26, 22) if luiz else (3, 22)
        ombro = (24, 25) if luiz else (9, 25)
        cot = ((25, 30) if luiz else (6, 30)) if brinde < 2 else ((26, 27) if luiz else (5, 27))
        braco_mesa(dentro, ombro, cot, (mx, my), pele, camisa)
        compor_em(q, dentro, ox)
        cx = mx + ox + (1 if luiz else -2)
        compor_em(q, copo(cx, my - 3))
    if brinde == 2:  # brilhinho do tim-tim
        for x, y in ((31, 15), (30, 14), (33, 14), (32, 13)):
            q[y][x] = C['amarelo']
    return q


# ─── Clientes: casal na mesa de chita (64×48) ────────────────────────────────
def chita_px(x, y):
    """Mesma chita do cenário (flores sobre vermelho)."""
    k = ((x // 7) * 3 + (y // 7) * 5) % 4
    cx, cy = x % 7, y % 7
    if (cx - 3) ** 2 + (cy - 3) ** 2 <= 2:
        return ('amarelo', 'cabelo_rosa', 'branco', 'cabelo_lilas')[k] if (cx, cy) != (3, 3) else 'barra'
    if (cx, cy) in ((0, 5), (1, 6), (6, 0)):
        return 'fita'
    return 'batom'


# Quem pode sentar à mesa: pele, cabelo, olhos e roupa de cada um.
ELES = {
    'negro': dict(pele='pele_cliente', sombra='pele_cliente_sombra', boca='boca_cliente', blush=None, cabelo='crespo',
                  cab='olho', cab_luz='castanho', barba=True, camisa='vinho', camisa_sombra='batom_sombra', calca='jeans'),
    'branco': dict(pele='pele_branca', sombra='pele_branca_sombra', boca='boca_branca', blush='blush', cabelo='liso',
                   cab='cabelo_castanho_claro', cab_luz='cabelo_castanho_claro_luz', barba=False,
                   camisa='camisa_azul', camisa_sombra='camisa_azul_sombra', calca='bege'),
    'asiatico': dict(pele='pele_asia', sombra='pele_asia_sombra', boca='boca_asia', blush=None, cabelo='franja',
                     cab='cabelo_preto', cab_luz='cabelo_preto_luz', barba=False,
                     camisa='camisa_mostarda', camisa_sombra='camisa_mostarda_sombra', calca='jeans'),
    'pardo': dict(pele='pele_parda', sombra='pele_parda_sombra', boca='boca_parda', blush=None, cabelo='cacheado',
                  cab='castanho', cab_luz='castanho_luz', barba=True,
                  camisa='camisa_verde', camisa_sombra='camisa_verde_sombra', calca='jeans'),
}
ELAS = {
    'negra': dict(pele='pele_retinta', sombra='pele_retinta_sombra', luz='pele_retinta_luz', boca='boca_retinta',
                  blush='blush_retinta', brilho=True, cabelo='black', cab='olho', cab_luz='castanho', blusa='estampa',
                  brinco='argola', pernas='pele_retinta', saia='amarelo'),
    'branca': dict(pele='pele_branca', sombra='pele_branca_sombra', boca='batom_sombra', blush='blush', cabelo='ondulado',
                   cab='loiro', cab_luz='loiro_luz', cab_sombra='loiro_sombra', blusa='blusa_lilas', brinco='ponto',
                   pernas='pele_branca', saia='saia_azul'),
    'asiatica': dict(pele='pele_asia', sombra='pele_asia_sombra', boca='batom_sombra', blush='blush', cabelo='liso_franja',
                     cab='cabelo_preto', cab_luz='cabelo_preto_luz', cab_sombra='contorno',
                     blusa='blusa_vermelha', brinco='ponto', pernas='pele_asia', saia='preto'),
    'parda': dict(pele='pele_parda', sombra='pele_parda_sombra', boca='batom_sombra', blush=None, cabelo='cachos',
                  cab='castanho', cab_luz='cabelo_castanho_claro_luz', cab_sombra='olho', blusa='blusa_coral',
                  brinco='argola', pernas='pele_parda', saia='jeans'),
}
# Casais sorteados a cada partida: os da mesma etnia e os mesclados (diversidade é parte da marca).
CASAIS = {f'{a}_{b}': (a, b) for a, b in (
    # homem e mulher
    ('negro', 'negra'), ('branco', 'branca'), ('asiatico', 'asiatica'), ('pardo', 'parda'),
    ('branco', 'negra'), ('negro', 'branca'), ('asiatico', 'negra'), ('negro', 'asiatica'),
    ('pardo', 'negra'), ('negro', 'parda'), ('pardo', 'asiatica'),
    # dois homens
    ('negro', 'branco'), ('pardo', 'negro'), ('asiatico', 'pardo'),
    # duas mulheres
    ('negra', 'branca'), ('parda', 'negra'), ('asiatica', 'parda'),
)}


def cabelo_homem(estilo, cab, luz):
    """Cabelo curto masculino que acompanha a curva da cabeça (centro 16,17; raio ~6):
    entradas nas têmporas, costeletas até a orelha e textura própria de cada estilo."""
    p = Parte()
    vol = {'crespo': 1.6, 'cacheado': 1.4, 'liso': 0.9, 'franja': 1.0}[estilo]

    def linha_frente(x):  # até onde o cabelo desce na testa (y), por coluna
        dx = abs(x + 0.5 - 16)
        if estilo == 'franja':
            return 14 if dx < 5 else 16  # franja reta na testa e lateral cobrindo o alto da orelha
        if estilo == 'liso':
            return (13 if x >= 13 else 12) if dx < 4 else (14 if dx < 5.5 else 16)  # franja varrida pra direita
        return 12 if dx < 3.5 else (13 if dx < 5 else 15)  # crespo/cacheado: entradinha nas têmporas

    for y in range(4, 18):
        for x in range(8, 25):
            dentro = ((x + 0.5 - 16) / (6.6 + vol * 0.5)) ** 2 + ((y + 0.5 - 16.6) / (6.4 + vol)) ** 2 <= 1
            if dentro and y <= linha_frente(x):
                p.p(x, y, cab)
    # textura
    for (x, y) in list(p.px):
        h = ((x * 73856093) ^ (y * 19349663)) % 13
        if estilo == 'crespo':
            if (x + y) % 2 == 0 and h < 6:
                p.d(x, y, luz)  # crespinho miúdo
        elif estilo == 'cacheado':
            if h < 3 or (x * 2 + y * 3) % 7 == 0:
                p.d(x, y, luz)  # voltinhas dos cachos
        elif estilo == 'liso':
            if x > 13 and (x - y) % 3 == 0 and y < 13:
                p.d(x, y, luz)  # fios penteados pra direita, a partir da risca
        elif estilo == 'franja':
            if (y == 10 and 12 <= x <= 15) or (y == 11 and 13 <= x <= 14):
                p.d(x, y, luz)  # brilhinho do cabelo liso
    if estilo == 'crespo' or estilo == 'cacheado':  # borda de cima ondulada (não é capacete)
        topo = min(y for (_, y) in p.px)
        for x in range(8, 25):
            if (x, topo) in p.px and x % 2 == 0:
                p.px.pop((x, topo))
        if estilo == 'cacheado':
            for x in (10, 22):
                p.p(x, 12, cab); p.p(x - 1 if x == 10 else x + 1, 11, cab)  # cachinho escapando do lado
    if estilo == 'liso':
        for y in range(8, 12):
            p.d(13, y, 'castanho' if cab != 'castanho' else 'olho')  # risca do lado
        for (x, y) in ((11, 10), (12, 11), (11, 12)):
            p.d(x, y, luz)  # o ladinho penteado pra baixo
    if estilo == 'franja':
        for x in (12, 15, 18):
            p.px.pop((x, 14), None)  # pontinhas desfiadas da franja
    return p


def casal_mesa(estado='esperando', k=0, par=('negro', 'negra')):
    """Mesa de dois lugares. par = (quem senta à esquerda, quem senta à direita), cada um de ELES ou ELAS:
    casal de homem e mulher, de dois homens ou de duas mulheres.
    estado: 'esperando' (sem comida), 'feliz' (o acarajé chegou) ou 'comendo'. k = quadro."""
    q = [[None] * MW for _ in range(H)]
    feliz = estado == 'feliz'
    pisca = estado == 'esperando' and k == 1
    lugares = [(0, par[0], 1, (1, 2)), (32, par[1], 0, (3, 0))]  # (ox, quem, quadro do sorriso, quadros levando à boca)

    def dados(quem):
        return ('ele', ELES[quem]) if quem in ELES else ('ela', ELAS[quem])

    # ── cabelo de trás das mulheres (antes do corpo)
    franjas = {}
    for ox, quem, _, _ in lugares:
        tipo, P_ = dados(quem)
        if tipo != 'ela':
            continue
        if P_['cabelo'] == 'black':
            afro = Parte()
            afro.elipse(16, 12.5, 9.6, 8.6, P_['cab'])
            for (x, y) in list(afro.px):
                if (x * 3 + y * 5) % 7 == 0:
                    afro.d(x, y, 'castanho')
                elif (x + y) % 9 == 0:
                    afro.d(x, y, 'castanho_luz')
            compor_em(q, afro, ox)
            fr = Parte()  # o black power por cima da testa
            fr.elipse(16, 11.6, 6.9, 2.6, P_['cab'], ymax=12)
            for (x, y) in list(fr.px):
                if (x * 3 + y * 5) % 7 == 0:
                    fr.d(x, y, 'castanho')
            franjas[ox] = fr
        elif P_['cabelo'] == 'cachos':
            volume = Parte()
            centros = [(16 + 8 * math.cos(math.pi * (0.9 + i * 1.2 / 11)), 15 + 7 * math.sin(math.pi * (0.9 + i * 1.2 / 11))) for i in range(12)]
            centros += [(8.5, 20), (23.5, 20), (8.5, 24), (23.5, 24), (9.5, 27), (22.5, 27)]
            bolinhas_cabelo(volume, centros, 0, P_['cab'], P_['cab_luz'], P_['cab_sombra'], r=2.4)
            compor_em(q, volume, ox)
            fr = Parte()
            bolinhas_cabelo(fr, [(12, 11.5), (15, 10.8), (18, 10.8), (21, 11.5)], 0, P_['cab'], P_['cab_luz'], P_['cab_sombra'], r=1.8)
            franjas[ox] = fr
        else:  # ondulado ou liso com franja reta
            atras, fr = cabelo_comprido(0, P_['cab'], P_['cab_luz'], P_['cab_sombra'], ate=28,
                                        volume=1 if P_['cabelo'] == 'ondulado' else 0, suave=P_['cabelo'] == 'liso_franja')
            if P_['cabelo'] == 'liso_franja':
                fr.ret(11, 11, 21, 13, P_['cab'])  # franja reta na testa
                for x in range(11, 22, 2):
                    fr.d(x, 12, P_['cab_luz'])
            compor_em(q, atras, ox)
            franjas[ox] = fr

    # ── pernas e cadeiras embaixo da mesa
    for ox, quem, _, _ in lugares:
        tipo, P_ = dados(quem)
        cad = Parte()
        cad.linha(ox + 9, 36, ox + 11, 47, 'madeira'); cad.linha(ox + 23, 36, ox + 21, 47, 'madeira')
        cad.ret(ox + 9, 40, ox + 23, 40, 'madeira_luz')
        compor_em(q, cad)
        pernas = Parte()
        for x0 in (ox + 11, ox + 17):
            if tipo == 'ele':
                pernas.ret(x0, 36, x0 + 3, 45, P_['calca'])
                pernas.ret(x0 - 1, 46, x0 + 3, 47, 'branco')  # tênis
            else:
                pernas.ret(x0, 41, x0 + 2, 45, P_['pernas'])
                pernas.ret(x0, 36, x0 + 3, 40, P_['saia'])  # barra do vestido/saia
                pernas.ret(x0 - 1, 46, x0 + 3, 46, 'ouro_sombra')  # sandália
        compor_em(q, pernas)

    # ── tronco, rosto e cabelo
    for ox, quem, sorri, _ in lugares:
        tipo, P_ = dados(quem)
        alegre = feliz or (estado == 'comendo' and k % 2 == sorri)
        t = Parte()
        if tipo == 'ele':
            for y in range(24, 35):
                x0, x1 = (8, 23) if y > 24 else (9, 22)
                for x in range(x0, x1 + 1):
                    t.p(x, y, P_['camisa_sombra'] if x >= x1 - 1 else P_['camisa'])
            for (x, y) in ((15, 24), (16, 24), (15, 25), (16, 25)):
                t.p(x, y, P_['pele'])  # gola aberta
            t.d(14, 24, P_['camisa_sombra']); t.d(17, 24, P_['camisa_sombra'])
            for y in (28, 31):
                t.d(16, y, 'bege' if P_['camisa'] != 'bege' else 'madeira')
        else:
            if P_['blusa'] == 'estampa':
                estampa = ('barra', 'amarelo', 'preto', 'amarelo', 'fita', 'barra')
                cor_px = lambda x, y: estampa[((x - y) // 2 + (y // 3)) % len(estampa)]
            else:
                cor_px = lambda x, y, c=P_['blusa']: c + '_sombra' if x >= 21 else c
            for y in range(24, 35):
                x0, x1 = CURVAS[y] if y in CURVAS else (9, 22)
                for x in range(x0, x1 + 1):
                    t.p(x, y, cor_px(x, y))
            for x in range(13, 19):  # decote
                t.p(x, 24, P_['pele'])
            for x in range(14, 18):
                t.p(x, 25, P_['pele'])
            if P_['blusa'] == 'estampa':
                for x in (14, 16, 18):
                    t.d(x - 1, 26, 'ouro')  # colar
            else:
                t.d(15, 26, 'ouro'); t.d(16, 26, 'ouro')  # pingentinho
        compor_em(q, t, ox)

        cab = Parte()
        if tipo == 'ele':
            rosto(cab, 0, P_['pele'], P_['sombra'], boca=P_['boca'], olhos='fechados' if pisca else 'abertos',
                  sobrancelha=P_['cab'] if P_['cab'] != 'cabelo_castanho_claro' else 'castanho', feliz=alegre, blush=P_['blush'])
            if P_['barba']:
                for x in range(11, 21):  # barba curtinha no queixo
                    for y in (21, 22):
                        if (x, y) in cab.px and not (14 <= x <= 17 and y == 21):
                            cab.d(x, y, P_['cab'])
                for y in range(15, 20):  # costeleta
                    cab.d(10, y, P_['cab']); cab.d(21, y, P_['cab'])
            compor_em(q, cab, ox)
            compor_em(q, cabelo_homem(P_['cabelo'], P_['cab'], P_['cab_luz']), ox)
        else:
            rosto(cab, 0, P_['pele'], P_['sombra'], boca=P_['boca'], olhos='fechados' if pisca else 'abertos',
                  sobrancelha='olho', feliz=alegre, blush=P_['blush'], brilho_olho=P_.get('brilho', False))
            if P_.get('luz'):
                cab.d(12, 15, P_['luz']); cab.d(19, 15, P_['luz'])  # luz nas maçãs
            if P_['brinco'] == 'argola':  # argolonas douradas
                for x in (9, 22):
                    cab.p(x, 19, 'ouro'); cab.p(x, 22, 'ouro')
                    cab.p(x - 1 if x == 9 else x + 1, 20, 'ouro'); cab.p(x - 1 if x == 9 else x + 1, 21, 'ouro_sombra')
            else:  # brinquinho de ponto
                cab.p(9, 19, 'ouro'); cab.p(22, 19, 'ouro')
            compor_em(q, cab, ox)
            if ox in franjas:
                compor_em(q, franjas[ox], ox, contorno=False)

    # mesa com toalha de chita
    mesa = Parte()
    mesa.ret(1, 34, 62, 39, 'batom')
    for (x, y) in list(mesa.px):
        mesa.p(x, y, chita_px(x, y))
    for x in range(1, 63, 4):  # barra da toalha caindo
        mesa.p(x, 40, chita_px(x, 40)); mesa.p(x + 1, 40, chita_px(x + 1, 40))
    mesa.ret(28, 34, 35, 39, 'bege')  # caminho de juta
    mesa.ret(4, 41, 5, 47, 'madeira'); mesa.ret(58, 41, 59, 47, 'madeira')
    compor_em(q, mesa)

    # pratos (com acarajé quando a comida chegou)
    for cx in (17, 47):
        pr = Parte()
        pr.ret(cx - 4, 33, cx + 4, 33, 'branco'); pr.ret(cx - 5, 34, cx + 5, 34, 'branco_sombra')
        if estado != 'esperando':
            pr.elipse(cx, 31.6, 3.2, 1.8, 'barra')
            pr.d(cx - 1, 31, 'amarelo'); pr.d(cx + 1, 31, 'amarelo')
        compor_em(q, pr)
    compor_em(q, copo(29, 30))
    compor_em(q, copo(33, 30))

    # braços
    for ox, quem, _, leva_k in lugares:
        tipo, P_ = dados(quem)
        pele = P_['pele']
        manga = P_['camisa'] if tipo == 'ele' else ('barra' if P_['blusa'] == 'estampa' else P_['blusa'])
        e, d = Parte(), Parte()
        braco(e, (8, 25), (5, 30), (8, 33), pele, manga, 0.4)
        leva = estado == 'comendo' and k in leva_k
        if feliz:
            braco(d, (23, 25), (26, 21), (25 if k != 1 else 27, 16), pele, manga, 0.4)  # mão pra cima, comemorando
        elif leva:
            braco(d, (23, 25), (24, 29), (18, 22), pele, manga, 0.4)  # leva o acarajé à boca
        else:
            braco(d, (23, 25), (25, 30), (22, 33), pele, manga, 0.4)
        compor_em(q, e, ox); compor_em(q, d, ox)
        if leva:
            bolinho = Parte()
            bolinho.elipse(18.5 + ox, 21.5, 2.0, 1.4, 'barra')
            bolinho.d(18 + ox, 21, 'amarelo')
            compor_em(q, bolinho)

    if feliz:  # coraçõezinhos subindo
        for x, y in ((31, 10 - k), (30, 9 - k), (32, 9 - k), (31, 11 - k)):
            if 0 <= y < H:
                q[y][x] = C['coracao']
    return q


# ─── Saída ────────────────────────────────────────────────────────────────────
def animacoes():
    A = {
        'npc_eliana_parada': [eliana(), eliana(1, 'fechados')],
        'npc_eliana_acenando': [eliana(acenando=1), eliana(acenando=2)],
        'npc_valentina_parada': [valentina(), valentina(1, 'fechados')],
        'npc_valentina_acenando': [valentina(acenando=1), valentina(acenando=2)],
        'npc_vic_lavando': [vic(0), vic(1), vic(2, 'fechados'), vic(3)],
        'gato_sentado': [recorte_gato(gato_sentado(i, piscando=(i == 2))) for i in range(4)],
        'gato_dormindo': [recorte_gato(gato_dormindo(0)), recorte_gato(gato_dormindo(1))],
        'npc_tios_mesa_parada': [mesa_tios(), mesa_tios(respira=1, olhos='fechados')],
        'npc_tios_mesa_brindando': [mesa_tios(1), mesa_tios(2), mesa_tios(1)],
    }
    for v, par in CASAIS.items():  # cada partida sorteia um casal
        A[f'cliente_casal_{v}_esperando'] = [casal_mesa('esperando', 0, par), casal_mesa('esperando', 1, par)]
        A[f'cliente_casal_{v}_feliz'] = [casal_mesa('feliz', k, par) for k in range(3)]
        A[f'cliente_casal_{v}_comendo'] = [casal_mesa('comendo', k, par) for k in range(4)]
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
        gato = [[None] * 4 + r + [None] * 4 for r in ([[None] * GW] * 31 + A['gato_sentado'][0])]
        gato2 = [[None] * 4 + r + [None] * 4 for r in ([[None] * GW] * 31 + A['gato_dormindo'][1])]
        salvar_png(destino, tira(fila + [gato, gato2]), escala=6, fundo=(254, 245, 226, 255))


if __name__ == '__main__':
    main()
