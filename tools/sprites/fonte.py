#!/usr/bin/env python3
"""
Fonte em pixel do Acarabet (bitmap, formato AngelCode XML, que o Phaser lê com load.bitmapFont).

Letras maiúsculas 5×7 com acentos do português (o jogo passa todo texto pra maiúsculas), números e pontuação.
Duas versões:
  fonte_clara   creme com contorno marrom-dendê (lê em cima de qualquer fundo)
  fonte_escura  marrom-dendê sem contorno (pra painéis claros)
Uso: python3 tools/sprites/fonte.py   → public/jogo/fonte_clara.(png|xml) e fonte_escura.(png|xml)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bia import salvar_png  # noqa: E402

G = {
    'A': '.###. #...# #...# ##### #...# #...# #...#', 'B': '####. #...# #...# ####. #...# #...# ####.',
    'C': '.###. #...# #.... #.... #.... #...# .###.', 'D': '####. #...# #...# #...# #...# #...# ####.',
    'E': '##### #.... #.... ####. #.... #.... #####', 'F': '##### #.... #.... ####. #.... #.... #....',
    'G': '.###. #...# #.... #.### #...# #...# .####', 'H': '#...# #...# #...# ##### #...# #...# #...#',
    'I': '###. .#.. .#.. .#.. .#.. .#.. ###.', 'J': '..### ...#. ...#. ...#. ...#. #..#. .##..',
    'K': '#...# #..#. #.#.. ##... #.#.. #..#. #...#', 'L': '#.... #.... #.... #.... #.... #.... #####',
    'M': '#...# ##.## #.#.# #.#.# #...# #...# #...#', 'N': '#...# ##..# #.#.# #..## #...# #...# #...#',
    'O': '.###. #...# #...# #...# #...# #...# .###.', 'P': '####. #...# #...# ####. #.... #.... #....',
    'Q': '.###. #...# #...# #...# #.#.# #..#. .##.#', 'R': '####. #...# #...# ####. #.#.. #..#. #...#',
    'S': '.#### #.... #.... .###. ....# ....# ####.', 'T': '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
    'U': '#...# #...# #...# #...# #...# #...# .###.', 'V': '#...# #...# #...# #...# #...# .#.#. ..#..',
    'W': '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.', 'X': '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    'Y': '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', 'Z': '##### ....# ...#. ..#.. .#... #.... #####',
    '0': '.###. #...# #..## #.#.# ##..# #...# .###.', '1': '.#.. ##.. .#.. .#.. .#.. .#.. ###.',
    '2': '.###. #...# ....# ...#. ..#.. .#... #####', '3': '####. ....# ....# .###. ....# ....# ####.',
    '4': '...#. ..##. .#.#. #..#. ##### ...#. ...#.', '5': '##### #.... ####. ....# ....# #...# .###.',
    '6': '.###. #.... #.... ####. #...# #...# .###.', '7': '##### ....# ...#. ..#.. .#... .#... .#...',
    '8': '.###. #...# #...# .###. #...# #...# .###.', '9': '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . # #', ',': '.. .. .. .. .# .# #.', '!': '# # # # # . #', '?': '.###. #...# ....# ..##. ..#.. ..... ..#..',
    ':': '. # # . # # .', ';': '.. .# .# .. .# .# #.', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '=': '.... .... #### .... #### .... ....',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '/': '....# ...#. ...#. ..#.. .#... .#... #....',
    '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '#': '.#.#. ##### .#.#. .#.#. ##### .#.#. .....',
    '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#', '*': '..... #.#.# .###. ##### .###. #.#.# .....',
    '_': '..... ..... ..... ..... ..... ..... #####', '<': '...# ..#. .#.. #... .#.. ..#. ...#',
    '>': '#... .#.. ..#. ...# ..#. .#.. #...', '♥': '..... .#.#. ##### ##### .###. ..#.. .....',
    '×': '..... #...# .#.#. ..#.. .#.#. #...# .....', '·': '. . . # . . .', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
}
ACENTOS = {
    'Á': ('A', '...#. ..#..'), 'À': ('A', '.#... ..#..'), 'Â': ('A', '..#.. .#.#.'), 'Ã': ('A', '.##.# #.##.'),
    'É': ('E', '...#. ..#..'), 'Ê': ('E', '..#.. .#.#.'), 'Í': ('I', '..#. .#..'), 'Ó': ('O', '...#. ..#..'),
    'Ô': ('O', '..#.. .#.#.'), 'Õ': ('O', '.##.# #.##.'), 'Ú': ('U', '...#. ..#..'), 'Ü': ('U', '..... .#.#.'),
}
CEDILHA = '..#.. .##..'  # Ç = C com rabinho embaixo
TOPO, CORPO = 2, 7  # 2 linhas pra acento + 7 de letra + 2 pra cedilha
ALTURA = TOPO + CORPO + 2


def glifo(ch):
    """Matriz de 0/1 de altura ALTURA."""
    if ch == ' ':
        return [[0] * 3 for _ in range(ALTURA)]
    acento, base = None, ch
    if ch in ACENTOS:
        base, acento = ACENTOS[ch]
    cedilha = ch == 'Ç'
    if cedilha:
        base = 'C'
    linhas = G[base].split(' ')
    w = max(len(l) for l in linhas)
    m = [[0] * w for _ in range(ALTURA)]
    for y, l in enumerate(linhas):
        for x, c in enumerate(l):
            m[TOPO + y][x] = 1 if c == '#' else 0
    if acento:
        for y, l in enumerate(acento.split(' ')):
            for x, c in enumerate(l[:w]):
                m[y][x] = 1 if c == '#' else m[y][x]
    if cedilha:
        for y, l in enumerate(CEDILHA.split(' ')):
            for x, c in enumerate(l[:w]):
                m[TOPO + CORPO + y][x] = 1 if c == '#' else 0
    return m


CARACTERES = [' '] + list(G.keys()) + list(ACENTOS.keys()) + ['Ç']


def gera(nome, contorno, cor, cor_contorno, saida):
    pad = 1 if contorno else 0
    celulas = []
    for ch in CARACTERES:
        g = glifo(ch)
        w = len(g[0])
        cw, chh = w + 2 * pad, ALTURA + 2 * pad
        q = [[None] * cw for _ in range(chh)]
        for y in range(ALTURA):
            for x in range(w):
                if g[y][x]:
                    q[y + pad][x + pad] = cor
                    if contorno:
                        for dy in (-1, 0, 1):
                            for dx in (-1, 0, 1):
                                yy, xx = y + pad + dy, x + pad + dx
                                if q[yy][xx] is None:
                                    q[yy][xx] = cor_contorno
        # contorno não pode cobrir letra: repinta
        for y in range(ALTURA):
            for x in range(w):
                if g[y][x]:
                    q[y + pad][x + pad] = cor
        celulas.append((ch, q, w))
    largura = 256
    x = y = 0
    linha_h = ALTURA + 2 * pad
    pos = []
    for ch, q, w in celulas:
        cw = len(q[0])
        if x + cw > largura:
            x, y = 0, y + linha_h + 1
        pos.append((ch, x, y, q, w))
        x += cw + 1
    altura = y + linha_h
    img = [[None] * largura for _ in range(altura)]
    xml = [f'<?xml version="1.0"?>\n<font>\n<info face="{nome}" size="{ALTURA}"/>',
           f'<common lineHeight="{ALTURA + 2}" base="{TOPO + CORPO}" scaleW="{largura}" scaleH="{altura}" pages="1"/>',
           f'<pages><page id="0" file="{nome}.png"/></pages>', f'<chars count="{len(pos)}">']
    for ch, px, py, q, w in pos:
        for yy, row in enumerate(q):
            for xx, c in enumerate(row):
                if c:
                    img[py + yy][px + xx] = c
        avanco = w + 1 if ch != ' ' else 3
        xml.append(f'<char id="{ord(ch)}" x="{px}" y="{py}" width="{len(q[0])}" height="{len(q)}" '
                   f'xoffset="{-pad}" yoffset="{-pad}" xadvance="{avanco}" page="0"/>')
    xml.append('</chars>\n</font>\n')
    salvar_png(os.path.join(saida, f'{nome}.png'), img)
    with open(os.path.join(saida, f'{nome}.xml'), 'w') as f:
        f.write('\n'.join(xml))


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, 'public', 'jogo')
    creme, dende = (254, 245, 226, 255), (59, 20, 8, 255)
    gera('fonte_clara', True, creme, dende, saida)
    gera('fonte_escura', False, dende, None, saida)
    print('fontes geradas:', len(CARACTERES), 'caracteres')


if __name__ == '__main__':
    main()
