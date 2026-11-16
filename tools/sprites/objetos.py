#!/usr/bin/env python3
"""
Objetos dos minijogos e da interface do Acarabet (mesmo estilo dos personagens: contorno dendê, luz de cima à esquerda).

Cada item é uma lista de quadros (matrizes de cores). Tamanhos seguem o briefing de arte:
64×64 utensílios grandes · 32×32 médios · 16×16 ingredientes e ícones.
Não grava arquivos sozinho: quem junta tudo no atlas é tools/sprites/atlas.py.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bia import C, Parte, hx  # noqa: E402
from personagens import compor_em  # noqa: E402

C.update({
    'agua': hx('8fd3f0'), 'agua_sombra': hx('5fb0e0'), 'agua_luz': hx('d4f1fb'),
    'massa': hx('ecdcb0'), 'massa_luz': hx('fef9e4'), 'massa_sombra': hx('c9b083'), 'casca': hx('8a6f4d'),
    'vatapa': hx('e8b13a'), 'vatapa_sombra': hx('c48a1e'), 'dende': hx('d9601a'), 'dende_luz': hx('ec9344'),
    'frito': hx('a8320f'), 'dourado': hx('f5c26b'), 'queimado': hx('4a1e0c'),
    'quiabo': hx('3f7f3a'), 'quiabo_luz': hx('8cc152'), 'tomate': hx('c8282d'), 'tomate_luz': hx('f06a5a'),
    'camarao': hx('ff8a65'), 'camarao_cru': hx('e8b4a6'), 'papel': hx('f3ead8'), 'papel_sombra': hx('d8c9a8'),
    'aluminio': hx('c3cbd3'), 'aluminio_sombra': hx('8e99a5'),
    'agua_marinha': hx('7cc8b8'), 'agua_marinha_sombra': hx('4f9c8c'),
    'ouro_luz': hx('ffe07a'),
    'agua_suja': hx('9a8866'), 'agua_suja_sombra': hx('7d6c4c'),
    'tomate_verde': hx('6fa83e'), 'tomate_verde_luz': hx('b5dc76'), 'tomate_verde_sombra': hx('47802a'),
    'tomate_meio': hx('e8582a'), 'tomate_meio_luz': hx('ffc84a'), 'tomate_meio_sombra': hx('b8361c'),
    'tomate_maduro': hx('d8322c'), 'tomate_maduro_luz': hx('ff7a62'), 'tomate_maduro_sombra': hx('9c1a18'),
    'gengibre': hx('d9b27a'), 'gengibre_sombra': hx('a8804a'),
    'fogo_amarelo': hx('ffd23f'), 'gelo': hx('bfe8ff'),
    'shimeji': hx('b08a66'), 'shimeji_luz': hx('dcc2a0'), 'shimeji_talo': hx('f4ecdc'),
})
C.setdefault('teto_sombra', hx('ddd0b6'))


def faz(w, h, partes):
    """partes: lista de Parte ou (Parte, contorno)."""
    q = [[None] * w for _ in range(h)]
    for pt in partes:
        if isinstance(pt, tuple):
            compor_em(q, pt[0], 0, pt[1])
        else:
            compor_em(q, pt)
    return q


def disco(cx, cy, r, cor, ry=None):
    p = Parte()
    p.elipse(cx, cy, r, ry or r, cor)
    return p


# ─── Lavar ────────────────────────────────────────────────────────────────────
def bacia_agua(suja=False):
    agua, sombra = ('agua_suja', 'agua_suja_sombra') if suja else ('agua', 'agua_sombra')
    b = disco(32, 32, 30, 'aluminio')
    for (x, y) in list(b.px):
        if (x - 32) ** 2 + (y - 32) ** 2 < 25 ** 2:
            b.p(x, y, agua)
            if suja and (x * 5 + y * 11) % 19 == 0:
                b.d(x, y, sombra)
        elif x + y > 70:
            b.d(x, y, 'aluminio_sombra')
    for (x, y) in list(b.px):
        if b.px[(x, y)] == C[agua] and (x * 3 + y * 7) % 23 == 0:
            b.d(x, y, 'agua_luz')
    return [faz(64, 64, [b])]


def feijao(sujo):
    """Feijão-fradinho já quebrado (vem assim da loja): branquinho com o olhinho preto. Sujo: encardido."""
    p = Parte()
    p.elipse(4, 4, 3.3, 2.6, 'massa' if sujo else 'massa_luz')
    p.d(4, 4, 'olho')
    p.d(5, 4, 'olho')
    if sujo:
        p.d(2, 3, 'casca'); p.d(6, 5, 'casca')
    else:
        p.d(2, 3, 'branco')
    return [faz(8, 8, [p])]


def bolha():
    p = Parte()
    p.elipse(4, 4, 2.6, 2.6, 'agua_luz'); p.d(3, 3, 'branco')
    return [faz(8, 8, [(p, False)])]


# ─── Triturar (multiprocessador industrial) ───────────────────────────────────
def processador(conteudo, k=0):
    """Multiprocessador industrial de inox, de frente: copo com visor mostrando o feijão virando massa."""
    dx = (1 if k == 1 else -1 if k == 2 else 0)
    base = Parte()
    base.ret(8, 44, 55, 62, 'aluminio')
    base.ret(50, 44, 55, 62, 'aluminio_sombra')
    base.ret(8, 44, 55, 45, 'metal_luz')
    base.ret(14, 49, 30, 57, 'metal_sombra')  # painel
    base.d(17, 52, 'fita'); base.d(20, 52, 'batom'); base.ret(23, 52, 27, 53, 'metal_luz')
    base.ret(10, 61, 14, 63, 'metal_sombra'); base.ret(49, 61, 53, 63, 'metal_sombra')  # pés
    copo = Parte()
    copo.ret(14 + dx, 10, 49 + dx, 43, 'aluminio')
    copo.ret(45 + dx, 10, 49 + dx, 43, 'aluminio_sombra')
    copo.ret(11 + dx, 6, 52 + dx, 9, 'metal')  # tampa
    copo.ret(11 + dx, 6, 52 + dx, 6, 'metal_luz')
    copo.ret(28 + dx, 2, 35 + dx, 5, 'metal_sombra')  # pegador da tampa
    copo.ret(19 + dx, 14, 41 + dx, 39, 'agua_luz')  # visor
    if conteudo != 'vazio':
        cor, pinta = {'feijao': ('massa_luz', 'olho'), 'grosso': ('massa', 'massa_sombra'), 'massa': ('massa_luz', 'massa')}[conteudo]
        topo = {'feijao': 26, 'grosso': 24, 'massa': 21}[conteudo]
        for y in range(topo, 40):
            for x in range(19, 42):
                if k and y == topo and (x + k) % 3 == 0:
                    continue  # mexendo lá dentro
                copo.p(x + dx, y, cor)
                h = ((x * 73856093) ^ (y * 19349663) ^ (k * 83492791)) % 97
                if conteudo == 'feijao' and h < 9:
                    copo.p(x + dx, y, pinta)
                elif conteudo == 'feijao' and h < 22:
                    copo.p(x + dx, y, 'massa_sombra')
                elif conteudo == 'grosso' and h < 20:
                    copo.p(x + dx, y, pinta)
                elif conteudo == 'massa' and h < 5:
                    copo.p(x + dx, y, pinta)
    copo.ret(20 + dx, 15, 21 + dx, 22, 'branco')  # reflexo do visor
    return [faz(64, 64, [base, copo])]


def botao_liga(apertado):
    p = Parte()
    p.ret(1, 9, 22, 15, 'metal_sombra')
    p.elipse(11.5, 9 if apertado else 7, 8, 5, 'fita')
    p.elipse(9, 7 if apertado else 5, 3, 1.5, 'quiabo_luz')
    return [faz(24, 16, [p])]


def tigela(estado):
    p = Parte()
    p.elipse(16, 18, 13, 10, 'agua_marinha')
    p.elipse(16, 15, 11, 6, 'agua_marinha_sombra')
    if estado > 0:
        m = Parte()
        m.elipse(16, 15 - estado, 10, 4 + estado, 'massa')
        m.d(12, 13 - estado, 'massa_luz'); m.d(14, 12 - estado, 'massa_luz')
        return [faz(32, 32, [p, (m, False)])]
    return [faz(32, 32, [p])]


# ─── Panela (vatapá), colher, ingredientes ────────────────────────────────────
def panela(conteudo):
    """Panela vista de cima com o vatapá: 'ralo', 'ponto', 'queimado' ou 'vazia'."""
    p = disco(32, 32, 29, 'metal')
    for (x, y) in list(p.px):
        if (x - 32) ** 2 + (y - 32) ** 2 < 24 ** 2:
            cor = {'ralo': 'massa_luz', 'ponto': 'vatapa', 'queimado': 'frito', 'vazia': 'metal_sombra'}[conteudo]
            p.p(x, y, cor)
        elif x + y > 70:
            p.d(x, y, 'metal_sombra')
    for (x, y) in list(p.px):
        if p.px[(x, y)] in (C['vatapa'], C['massa_luz']) and (x * 5 + y * 3) % 17 == 0:
            p.d(x, y, 'dende' if conteudo == 'ponto' else 'vatapa')
        if conteudo == 'queimado' and p.px[(x, y)] == C['frito'] and (x + y) % 5 == 0:
            p.d(x, y, 'queimado')
    cabo = Parte()
    cabo.ret(58, 29, 63, 35, 'madeira')
    return [faz(64, 64, [cabo, p])]


def colher():
    p = Parte()
    p.linha(6, 26, 22, 8, 'madeira', 2)
    p.elipse(24.5, 6.5, 4, 3, 'madeira_luz')
    return [faz(32, 32, [p])]


def ingrediente(nome):
    p = Parte()
    if nome == 'castanha':
        for x, y in ((5, 6), (10, 9)):
            p.elipse(x, y, 3.5, 2.6, 'madeira_luz'); p.d(x - 2, y - 1, 'massa_luz')
            p.ret(x + 1, y + 1, x + 3, y + 2, 'madeira')
    elif nome == 'amendoim':
        for x, y in ((4, 6), (9, 5), (6, 10), (11, 10)):
            p.elipse(x + 1, y + 1, 2.3, 1.8, 'madeira_luz')
    elif nome == 'gengibre':
        p.elipse(7, 9, 5, 3, 'gengibre'); p.elipse(12, 7, 2.5, 2.2, 'gengibre'); p.elipse(4, 6, 2, 2, 'gengibre')
        p.d(6, 10, 'gengibre_sombra'); p.d(9, 9, 'gengibre_sombra'); p.d(5, 8, 'massa_luz')
    elif nome == 'temperos':
        p.elipse(8, 10, 7, 4.5, 'agua_marinha')
        p.elipse(8, 8.5, 5.5, 2.4, 'quiabo')
        for x, y in ((5, 8), (8, 7), (10, 9), (7, 9)):
            p.d(x, y, 'quiabo_luz')
        p.d(11, 8, 'massa_luz'); p.d(4, 9, 'cabelo_lilas')
    elif nome == 'farinha':
        p.ret(3, 4, 12, 14, 'papel'); p.ret(11, 4, 12, 14, 'papel_sombra')
        p.ret(4, 2, 11, 4, 'branco'); p.d(6, 1, 'branco'); p.d(9, 1, 'branco')
        p.ret(5, 8, 10, 10, 'dende')  # rótulo
    elif nome == 'dende':
        p.ret(6, 2, 9, 4, 'vinho'); p.ret(4, 5, 11, 14, 'dende'); p.ret(5, 6, 6, 12, 'dende_luz')
    return [faz(16, 16, [p])]


# ─── Caruru e salada ───────────────────────────────────────────────────────
def quiabo(rodelas=False):
    p = Parte()
    if rodelas:
        for (x, y) in ((3, 4), (8, 3), (12, 6), (5, 9), (10, 10)):
            p.elipse(x, y, 2.2, 2.2, 'quiabo_luz'); p.d(x, y, 'massa_luz')
    else:
        p.linha(2, 12, 12, 3, 'quiabo', 3)
        p.ret(12, 1, 13, 3, 'quiabo_luz')
        p.d(5, 9, 'quiabo_luz'); p.d(8, 6, 'quiabo_luz')
    return [faz(16, 16, [p])]


def tabua():
    p = Parte()
    p.ret(2, 4, 61, 29, 'madeira_luz')
    p.ret(2, 26, 61, 29, 'madeira')
    for y in (10, 18):
        for x in range(6, 58, 5):
            p.d(x, y, 'madeira')
    return [faz(64, 32, [p])]


def faca():
    p = Parte()
    p.ret(14, 2, 17, 12, 'madeira')  # cabo
    p.ret(13, 13, 18, 28, 'aluminio')  # lâmina pra baixo
    p.ret(17, 13, 18, 28, 'aluminio_sombra')
    p.d(13, 29, 'aluminio')
    return [faz(32, 32, [p])]


def tomate(cubos=False, cor='tomate_verde'):
    """Tomate da salada: verde, meio amarelado (quase vermelho) ou vermelho."""
    p = Parte()
    if cubos:
        for (x, y) in ((3, 4), (8, 3), (12, 7), (5, 9), (10, 11)):
            p.ret(x, y, x + 2, y + 2, cor); p.d(x, y, cor + '_luz')
    else:
        p.elipse(8, 9, 6, 5.5, cor); p.d(5, 6, cor + '_luz'); p.d(6, 6, cor + '_luz')
        p.d(10, 12, cor + '_sombra'); p.d(11, 11, cor + '_sombra')
        if cor == 'tomate_meio':  # ainda amarelando perto do cabinho
            for (x, y) in ((6, 5), (7, 5), (8, 5), (9, 5), (10, 6), (7, 6), (9, 6)):
                p.d(x, y, 'tomate_meio_luz')
        p.ret(7, 2, 9, 3, 'fita')
    return [faz(16, 16, [p])]


def cebola(picada=False):
    p = Parte()
    if picada:
        for (x, y) in ((4, 9), (8, 10), (11, 8), (6, 6), (10, 5), (3, 5)):
            p.ret(x, y, x + 2, y + 1, 'massa_luz')
            p.d(x, y, 'cabelo_lilas')
    else:
        p.elipse(8, 9, 5.5, 5, 'cabelo_lilas')
        p.ret(7, 2, 8, 4, 'fita')
        for y in range(6, 13, 3):
            p.d(6, y, 'massa_luz')
    return [faz(16, 16, [p])]


def pimentao(picado=False):
    p = Parte()
    if picado:
        for (x, y) in ((3, 4), (8, 3), (12, 7), (5, 9), (10, 11), (2, 12)):
            p.ret(x, y, x + 2, y + 1, 'fita'); p.d(x, y, 'quiabo_luz')
    else:
        p.elipse(8, 9.5, 5.5, 5, 'fita')
        p.linha(8, 5, 8, 14, 'quiabo', 1)  # gomos
        p.d(5, 7, 'quiabo_luz'); p.d(5, 8, 'quiabo_luz')
        p.ret(7, 1, 8, 4, 'quiabo')  # cabinho
    return [faz(16, 16, [p])]


def malagueta():
    p = Parte()
    p.linha(4, 12, 10, 5, 'batom', 2)
    p.d(10, 4, 'batom'); p.d(5, 10, 'tomate_luz')
    p.ret(11, 2, 12, 4, 'fita')
    return [faz(16, 16, [p])]


def mao():
    """Dedos da Bia segurando (na tábua), pra não cortar."""
    p = Parte()
    p.ret(2, 6, 13, 14, 'pele')
    for x in (3, 6, 9, 12):
        p.ret(x, 2, x + 1, 6, 'pele')
    p.d(5, 10, 'tatuagem')
    return [faz(16, 16, [p])]


def salada():
    """Tigela com os três tomates picados misturados."""
    p = Parte()
    p.elipse(16, 18, 13, 10, 'agua_marinha')
    p.elipse(16, 15, 11, 6, 'tomate_verde')
    cores = ('tomate_verde', 'tomate_meio', 'tomate_maduro')
    for i, (x, y) in enumerate(((10, 14), (14, 12), (19, 15), (22, 13), (16, 17), (12, 16), (8, 15), (18, 11), (24, 15), (14, 18))):
        c = cores[i % 3]
        p.d(x, y, c); p.d(x + 1, y, c + '_sombra')
    return [faz(32, 32, [p])]


def fumaca():
    quadros = []
    for k in range(3):
        p = Parte()
        for i in range(3):
            p.elipse(4 + i * 3 + (k % 2), 12 - i * 4 - k, 1.5 + i * 0.3, 1.5, 'branco')
        quadros.append(faz(16, 16, [(p, False)]))
    return quadros


# ─── Bater a massa ────────────────────────────────────────────────────────────
N_MASSA = 6  # quadros da massa crescendo


def bacia_massa(estado):
    """Bacia de madeira vista de lado; a massa cresce e fica mais branquinha e aerada a cada batida (0 a 5)."""
    t = estado / (N_MASSA - 1)
    cores = ['massa_sombra', 'massa_sombra', 'massa', 'massa', 'massa_luz', 'branco']
    luzes = ['massa', 'massa', 'massa_luz', 'massa_luz', 'branco', 'branco']
    cor, luz = cores[estado], luzes[estado]
    m = Parte()
    topo = 34 - round(t * 22)  # a massa sobe acima da borda
    m.elipse(32, 38, 24 + t * 3, 38 - topo, cor, ymax=38)
    m.ret(8, 36, 56, 40, cor)
    for (x, y) in list(m.px):
        h = ((x * 73856093) ^ (y * 19349663)) % 97
        if h < 6 + estado * 4:
            m.d(x, y, luz)  # bolhinhas de ar
        elif estado <= 1 and h < 14:
            m.d(x, y, 'casca')  # ainda pesada
    if estado >= 3:
        m.d(24, topo + 3, 'branco'); m.d(25, topo + 3, 'branco'); m.d(26, topo + 4, 'branco')
    b = Parte()
    b.elipse(32, 40, 30, 20, 'madeira', ymin=40)  # bacia
    b.ret(2, 38, 61, 41, 'madeira_luz')  # borda
    for (x, y) in list(b.px):
        if y > 41 and x > 32 and ((x - 32) / 30) ** 2 + ((y - 40) / 20) ** 2 > 0.55:
            b.d(x, y, 'tatuagem')
    return [faz(64, 64, [(m, True), b])]


# ─── Lavar: torneira ──────────────────────────────────────────────────────────
def torneira():
    p = Parte()
    p.ret(0, 4, 4, 13, 'metal_sombra')  # vem da parede
    p.ret(4, 6, 20, 10, 'metal')  # cano
    p.ret(4, 6, 20, 6, 'metal_luz')
    p.ret(17, 10, 22, 16, 'metal')  # bico pra baixo
    p.ret(17, 10, 17, 16, 'metal_luz')
    p.ret(9, 1, 13, 5, 'metal_sombra')  # registro
    p.ret(6, 0, 16, 1, 'batom')
    return [faz(24, 18, [p])]


def jato_agua():
    quadros = []
    for k in range(3):
        p = Parte()
        p.ret(1, 0, 4, 47, 'agua')
        for y in range(0, 48):
            if (y + k * 3) % 7 == 0:
                p.d(2, y, 'agua_luz'); p.d(3, y, 'agua_luz')
            if (y + k * 3) % 9 == 4:
                p.d(1, y, 'agua_sombra')
        p.elipse(2.5, 47, 4 + (k % 2), 1.5, 'agua_luz')  # respingo
        quadros.append(faz(8, 50, [(p, False)]))
    return quadros


# ─── Fritar ───────────────────────────────────────────────────────────────────
def tacho():
    quadros = []
    for k in range(3):
        b = disco(32, 32, 30, 'metal_sombra')
        for (x, y) in list(b.px):
            if (x - 32) ** 2 + (y - 32) ** 2 < 26 ** 2:
                b.p(x, y, 'dende')
                if (x * 3 + y * 5 + k * 7) % 19 == 0:
                    b.d(x, y, 'dende_luz')  # borbulhando
                elif (x * 5 + y * 3 + k * 11) % 29 == 0:
                    b.d(x, y, 'dourado')
        quadros.append(faz(64, 64, [b]))
    return quadros


def acaraje_fritando(estado):
    """Visto de cima no dendê: cru (claro), dourando, no ponto (dourado com brilho e maior), queimado (escuro e murcho)."""
    cor, borda, r = {
        'cru': ('massa', 'massa_sombra', 6.0), 'dourando': ('dourado', 'dende_luz', 6.2),
        'ponto': ('dende_luz', 'frito', 6.6), 'queimado': ('frito', 'queimado', 5.6),
    }[estado]
    p = Parte()
    p.elipse(8, 8, r, r * 0.85, cor)
    for (x, y) in list(p.px):
        if x + y > 18:
            p.d(x, y, borda)
    if estado == 'ponto':
        p.d(5, 5, 'ouro_luz'); p.d(6, 5, 'ouro_luz'); p.d(5, 6, 'ouro_luz')  # brilho: forma e luz mudam, não só a cor
    if estado == 'queimado':
        p.d(7, 7, 'queimado'); p.d(10, 6, 'queimado')
    return [faz(16, 16, [p])]


def respingo():
    quadros = []
    for k in range(3):
        p = Parte()
        for a in range(0, 360, 60):
            r = 2 + k * 2
            p.p(8 + round(r * math.cos(math.radians(a))), 8 + round(r * math.sin(math.radians(a))), 'dende_luz')
        quadros.append(faz(16, 16, [(p, False)]))
    return quadros


# ─── Montar e servir ──────────────────────────────────────────────────────────
def acaraje_lado(estado):
    """32×32 de lado: 'fechado', 'aberto' ou 'montado'."""
    partes = []
    if estado == 'fechado':
        p = Parte()
        p.elipse(16, 18, 13, 8, 'dende_luz')
        for (x, y) in list(p.px):
            if y > 20:
                p.d(x, y, 'frito')
        p.d(10, 13, 'ouro_luz'); p.d(11, 13, 'ouro_luz')
        partes.append(p)
    else:
        baixo = Parte()
        baixo.elipse(16, 23, 13, 5, 'frito', ymin=21)
        baixo.ret(4, 20, 28, 22, 'massa')
        cima = Parte()
        cima.elipse(16, 13, 13, 6, 'dende_luz', ymax=14)
        cima.ret(4, 14, 28, 15, 'massa')
        cima.d(10, 9, 'ouro_luz')
        partes += [baixo, cima]
    return [faz(32, 32, partes)]


RECHEIOS = ('pimenta', 'pimenta_pouca', 'vatapa', 'caruru', 'salada', 'camarao', 'shimeji')


def camada(nome):
    """Uma camada de recheio pra empilhar dentro do acarajé aberto (24×4)."""
    p = Parte()
    if nome == 'vatapa':
        p.ret(0, 1, 23, 3, 'vatapa'); p.d(5, 1, 'dende'); p.d(15, 2, 'dende')
    elif nome == 'caruru':
        p.ret(0, 1, 23, 3, 'quiabo')
        for x in range(2, 23, 4):
            p.d(x, 2, 'quiabo_luz')
    elif nome == 'salada':
        cores = ('tomate_verde', 'tomate_meio', 'tomate_maduro')
        for i, x in enumerate(range(0, 24, 3)):
            p.ret(x, 1, x + 1, 2, cores[i % 3])
    elif nome == 'camarao':
        for x in (2, 9, 16):
            p.ret(x, 0, x + 4, 2, 'camarao'); p.d(x + 4, 1, 'olho')
    elif nome == 'shimeji':  # cogumelinhos por cima (versão vegetariana)
        for x in (2, 7, 12, 17):
            p.d(x + 1, 2, 'shimeji_talo'); p.d(x + 1, 3, 'shimeji_talo')
            p.ret(x, 0, x + 2, 1, 'shimeji'); p.d(x, 0, 'shimeji_luz')
    elif nome == 'pimenta':
        p.ret(1, 2, 22, 3, 'batom')
        for x in range(2, 22, 3):
            p.d(x, 1, 'batom_sombra')
    elif nome == 'pimenta_pouca':
        for x in (4, 11, 18):
            p.ret(x, 2, x + 1, 3, 'batom')
    return [faz(24, 4, [(p, False)])]


def potinho(nome):
    cor = {'vatapa': 'vatapa', 'caruru': 'quiabo', 'salada': 'tomate_verde', 'camarao': 'camarao', 'shimeji': 'shimeji_talo',
           'pimenta': 'batom', 'pimenta_pouca': 'batom'}[nome]
    p = Parte()
    branco = nome.startswith('pimenta')
    p.elipse(8, 10, 7, 5, 'branco' if branco else 'agua_marinha')
    if nome == 'pimenta_pouca':
        p.elipse(8, 8.5, 3, 1.4, cor)  # só um pouquinho
    else:
        p.elipse(8, 8, 5.5, 2.6, cor)
    if nome == 'pimenta':
        p.d(6, 7, 'tomate_luz'); p.d(10, 8, 'fita')
    elif nome == 'camarao':
        p.d(6, 8, 'olho'); p.d(10, 7, 'olho')
    elif nome == 'shimeji':
        for x in (5, 8, 11):
            p.ret(x - 1, 6, x, 7, 'shimeji'); p.d(x - 1, 6, 'shimeji_luz')
    elif nome == 'caruru':
        p.d(7, 8, 'quiabo_luz')
    elif nome == 'salada':
        p.d(6, 7, 'tomate_maduro'); p.d(10, 8, 'tomate_meio'); p.d(8, 9, 'tomate_maduro_luz')
    return [faz(16, 16, [p])]


def embrulho():
    p = Parte()
    p.elipse(16, 20, 13, 9, 'papel')
    p.ret(5, 11, 27, 15, 'dende_luz')  # acarajé aparecendo
    p.ret(9, 9, 23, 11, 'vatapa')
    p.d(12, 9, 'camarao'); p.d(18, 9, 'quiabo')
    for (x, y) in list(p.px):
        if p.px[(x, y)] == C['papel'] and x + y > 40:
            p.d(x, y, 'papel_sombra')
    return [faz(32, 32, [p])]


# ─── Interface ────────────────────────────────────────────────────────────────
def estrela(cheia):
    p = Parte()
    pts = []
    for k in range(10):
        r = 7 if k % 2 == 0 else 3
        a = -math.pi / 2 + k * math.pi / 5
        pts.append((8 + r * math.cos(a), 8.5 + r * math.sin(a)))
    for y in range(16):
        for x in range(16):
            dentro, j = False, len(pts) - 1
            for i in range(len(pts)):
                xi, yi = pts[i]; xj, yj = pts[j]
                if (yi > y + 0.5) != (yj > y + 0.5) and x + 0.5 < (xj - xi) * (y + 0.5 - yi) / (yj - yi) + xi:
                    dentro = not dentro
                j = i
            if dentro:
                p.p(x, y, 'amarelo' if cheia else 'teto_sombra')
    if cheia:
        p.d(7, 5, 'ouro_luz'); p.d(6, 7, 'ouro_luz')
    return [faz(16, 16, [p])]


def carinha(nivel):
    """Medidor de satisfação do cliente: 0 bravo, 1 sério, 2 ok, 3 feliz, 4 apaixonado."""
    cor = ('frito', 'dende', 'amarelo', 'amarelo', 'cabelo_rosa')[nivel]
    p = Parte()
    p.elipse(8, 8, 7, 7, cor)
    olho = 'contorno'
    if nivel == 4:
        for x0 in (4, 9):  # olhos de coração
            p.d(x0, 5, 'batom'); p.d(x0 + 2, 5, 'batom'); p.ret(x0, 6, x0 + 2, 6, 'batom'); p.d(x0 + 1, 7, 'batom')
    else:
        p.d(5, 6, olho); p.d(10, 6, olho)
    if nivel == 0:
        p.d(4, 4, olho); p.d(11, 4, olho)
        p.ret(5, 11, 10, 11, olho); p.d(4, 12, olho); p.d(11, 12, olho)
    elif nivel == 1:
        p.ret(5, 11, 10, 11, olho)
    elif nivel == 2:
        p.ret(5, 11, 10, 11, olho); p.d(4, 10, olho); p.d(11, 10, olho)
    else:
        p.ret(5, 10, 10, 10, olho); p.ret(6, 11, 9, 11, 'batom'); p.d(4, 9, olho); p.d(11, 9, olho)
    return [faz(16, 16, [p])]


def maozinha():
    """Mãozinha de tutorial apontando pra cima (dedo em 6, 0)."""
    p = Parte()
    p.ret(5, 1, 7, 8, 'branco')
    p.ret(3, 7, 12, 14, 'branco')
    for x in (8, 10):
        p.ret(x, 5, x + 1, 8, 'branco')
    p.d(11, 13, 'branco_sombra'); p.d(12, 12, 'branco_sombra')
    return [faz(16, 16, [p])]


def som(ligado):
    p = Parte()
    p.ret(2, 6, 4, 10, 'branco')
    p.linha(4, 6, 8, 2, 'branco'); p.linha(4, 10, 8, 14, 'branco'); p.ret(5, 5, 8, 11, 'branco')
    p.ret(8, 2, 8, 14, 'branco')
    if ligado:
        p.d(10, 6, 'branco'); p.d(11, 8, 'branco'); p.d(10, 10, 'branco')
        p.d(12, 4, 'branco'); p.d(13, 8, 'branco'); p.d(12, 12, 'branco')
    else:
        p.linha(10, 5, 14, 11, 'batom'); p.linha(14, 5, 10, 11, 'batom')
    return [faz(16, 16, [p])]


def icone(nome):
    p = Parte()
    if nome == 'fogo':
        p.elipse(8, 10, 5, 4.5, 'batom')
        p.linha(8, 2, 6, 7, 'batom', 3); p.linha(11, 4, 11, 8, 'batom', 2); p.d(4, 5, 'batom')
        p.elipse(8, 11, 3, 2.6, 'dende_luz'); p.elipse(8, 12, 1.5, 1.4, 'fogo_amarelo')
    elif nome == 'frio':
        for (x0, y0, x1, y1) in ((8, 2, 8, 14), (3, 5, 13, 11), (3, 11, 13, 5)):
            p.linha(x0, y0, x1, y1, 'gelo', 2)
        p.d(8, 8, 'branco'); p.d(8, 2, 'branco'); p.d(8, 14, 'branco')
    elif nome == 'camarao':
        for k in range(6):
            a = math.pi * (0.1 + k * 0.25)
            p.elipse(8 + 4.2 * math.cos(a), 8 - 4.2 * math.sin(a) + 1, 2.2, 2.2, 'camarao')
        p.d(12, 6, 'olho'); p.d(5, 5, 'tomate_luz')
    elif nome == 'shimeji':  # buquê de shimeji: três chapeuzinhos marrons em talos branquinhos
        partes = []
        for (x, y, xb) in ((8, 4, 8), (4, 7, 7), (12, 7, 9)):  # o do meio fica atrás
            m = Parte()
            m.linha(x, y + 1, xb, 14, 'shimeji_talo', 1)
            m.elipse(x, y, 2.8, 1.9, 'shimeji', ymax=y + 1)
            m.d(x - 1, y, 'shimeji_luz'); m.d(x, y, 'shimeji_luz')
            partes.append(m)
        return [faz(16, 16, partes)]
    elif nome == 'veg':
        p.elipse(8, 7, 5, 4, 'fita')
        p.linha(4, 13, 11, 4, 'quiabo', 1); p.d(6, 5, 'quiabo_luz'); p.d(7, 5, 'quiabo_luz')
    return [faz(16, 16, [p])]


def cupom():
    """Ticket com picote e espaço pro código (64×32)."""
    p = Parte()
    p.ret(1, 2, 62, 29, 'massa_luz')
    for y in range(4, 28, 3):
        p.d(16, y, 'massa_sombra')  # picote
    for y in (2, 29):
        for x in range(2, 62, 4):
            p.d(x, y, 'dende_luz')
    p.elipse(8.5, 15.5, 5, 5, 'dende_luz')
    p.elipse(8.5, 15, 3, 1.6, 'frito'); p.elipse(8.5, 16.5, 3, 1.2, 'amarelo')
    return [faz(64, 32, [p])]


def carimbo():
    """'GANHOU!' entrando (3 quadros: grande, médio, no lugar)."""
    quadros = []
    for k in range(3):
        p = Parte()
        m = 2 - k
        p.ret(2 - m, 4 - m, 61 + m, 27 + m, 'batom')
        p.ret(4 - m, 6 - m, 59 + m, 25 + m, 'massa_luz')
        p.ret(6 - m, 8 - m, 57 + m, 23 + m, 'batom')
        quadros.append(faz(64, 32, [(p, False)]))
    return quadros


def confete():
    cores = ('amarelo', 'batom', 'azul', 'fita', 'cabelo_rosa', 'dende_luz')
    quadros = []
    for k in range(4):
        p = Parte()
        for i in range(10):
            x = (i * 7 + k * 2) % 30 + 1
            y = (i * 11 + k * 6) % 30 + 1
            p.ret(x, y, x + (1 if (i + k) % 2 else 0), y + (0 if (i + k) % 2 else 1), cores[i % len(cores)])
        quadros.append(faz(32, 32, [(p, False)]))
    return quadros


def brilho():
    quadros = []
    for k in range(4):
        p = Parte()
        r = (1, 2, 3, 2)[k]
        p.ret(4, 4 - r, 4, 4 + r, 'ouro_luz'); p.ret(4 - r, 4, 4 + r, 4, 'ouro_luz')
        quadros.append(faz(9, 9, [(p, False)]))
    return quadros


def bandeja_vazia():
    p = Parte()
    p.ret(0, 4, 23, 4, 'metal_luz'); p.ret(1, 5, 22, 5, 'metal')
    return [faz(24, 8, [p])]


ITENS = {
    'bacia_agua': lambda: bacia_agua(False), 'bacia_agua_suja': lambda: bacia_agua(True),
    'feijao_sujo': lambda: feijao(True), 'feijao': lambda: feijao(False), 'bolha': bolha,
    **{f'processador_{c}': (lambda c=c: processador(c, 0)) for c in ('vazio', 'feijao', 'grosso', 'massa')},
    **{f'processador_{c}_ligado': (lambda c=c: [processador(c, 1)[0], processador(c, 2)[0]]) for c in ('feijao', 'grosso', 'massa')},
    'botao_liga': lambda: botao_liga(False), 'botao_apertado': lambda: botao_liga(True),
    'tigela_0': lambda: tigela(0), 'tigela_1': lambda: tigela(1), 'tigela_2': lambda: tigela(2),
    'panela_vazia': lambda: panela('vazia'), 'panela_ralo': lambda: panela('ralo'), 'panela_ponto': lambda: panela('ponto'),
    'panela_queimado': lambda: panela('queimado'), 'colher': colher,
    **{f'ing_{n}': (lambda n=n: ingrediente(n)) for n in ('castanha', 'amendoim', 'gengibre', 'temperos', 'farinha', 'dende')},
    'quiabo': lambda: quiabo(False), 'quiabo_rodelas': lambda: quiabo(True), 'tabua': tabua, 'faca': faca,
    **{f'{c}': (lambda c=c: tomate(False, c)) for c in ('tomate_verde', 'tomate_meio', 'tomate_maduro')},
    **{f'{c}_cubos': (lambda c=c: tomate(True, c)) for c in ('tomate_verde', 'tomate_meio', 'tomate_maduro')}, 'mao': mao, 'salada': salada,
    'fumaca': fumaca,
    **{f'bacia_massa_{n}': (lambda n=n: bacia_massa(n)) for n in range(N_MASSA)},
    'torneira': torneira, 'jato_agua': jato_agua,
    'cebola': lambda: cebola(False), 'cebola_picada': lambda: cebola(True),
    'pimentao': lambda: pimentao(False), 'pimentao_picado': lambda: pimentao(True), 'malagueta': malagueta,
    'tacho': tacho, 'respingo': respingo,
    **{f'acaraje_{e}': (lambda e=e: acaraje_fritando(e)) for e in ('cru', 'dourando', 'ponto', 'queimado')},
    'acaraje_fechado': lambda: acaraje_lado('fechado'), 'acaraje_aberto': lambda: acaraje_lado('aberto'),
    **{f'camada_{n}': (lambda n=n: camada(n)) for n in RECHEIOS},
    **{f'pote_{n}': (lambda n=n: potinho(n)) for n in RECHEIOS},
    'embrulho': embrulho, 'bandeja': bandeja_vazia,
    'estrela_cheia': lambda: estrela(True), 'estrela_vazia': lambda: estrela(False),
    **{f'carinha_{n}': (lambda n=n: carinha(n)) for n in range(5)},
    'maozinha': maozinha, 'som_on': lambda: som(True), 'som_off': lambda: som(False),
    **{f'icone_{n}': (lambda n=n: icone(n)) for n in ('fogo', 'frio', 'camarao', 'veg', 'shimeji')},
    'cupom': cupom, 'carimbo': carimbo, 'confete': confete, 'brilho': brilho,
}
