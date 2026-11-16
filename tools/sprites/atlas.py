#!/usr/bin/env python3
"""
Junta todos os desenhos do Acarabet num atlas só (uma imagem + JSON no formato do Phaser), pra baixar rápido.

Entram: as animações da Bia (3 roupas, de frente, de lado, de costas e servindo), os personagens e clientes,
o gato, e os objetos/interface de tools/sprites/objetos.py. Os fundos (salão e close) ficam em arquivos próprios.
Nome de cada quadro: <animação>_<n>, ex.: bia_dolma_batendo_2, acaraje_ponto_0, gato_sentado_3.
meta.animacoes lista quantos quadros cada animação tem.

Uso: python3 tools/sprites/atlas.py   → public/jogo/atlas.png e public/jogo/atlas.json
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bia as B  # noqa: E402
import bia_lado as L  # noqa: E402
import cenario  # noqa: E402,F401  (cores do cenário)
import objetos as O  # noqa: E402
import personagens as P  # noqa: E402
from bia import salvar_png  # noqa: E402


def recorta(q):
    """Tira as bordas vazias? Não: mantém o tamanho do quadro (as animações dependem do alinhamento)."""
    return q


def coleta():
    anims = {}
    for roupa in B.ROUPAS:
        for nome, qs in {**B.animacoes(roupa), **L.animacoes(roupa)}.items():
            anims[f'bia_{roupa}_{nome}'] = qs
    for nome, qs in P.animacoes().items():
        anims[nome] = qs
    for nome, f in O.ITENS.items():
        anims[nome] = f()
    return anims


LARGURA = 1024  # 1024 de largura mantém a altura em 2048 (textura segura até em celular antigo)


def empacota(anims, largura=LARGURA):
    quadros = []
    for nome, qs in anims.items():
        for k, q in enumerate(qs):
            quadros.append((f'{nome}_{k}', q))
    quadros.sort(key=lambda t: (-len(t[1]), -len(t[1][0])))
    x = y = linha = 0
    pos = {}
    for nome, q in quadros:
        h, w = len(q), len(q[0])
        if x + w > largura:
            x, y, linha = 0, y + linha + 1, 0
        pos[nome] = (x, y, w, h, q)
        x += w + 1
        linha = max(linha, h)
    altura = y + linha
    altura = 1 << (altura - 1).bit_length()  # potência de 2
    img = [[None] * largura for _ in range(altura)]
    for nome, (px, py, w, h, q) in pos.items():
        for yy in range(h):
            for xx in range(w):
                if q[yy][xx]:
                    img[py + yy][px + xx] = q[yy][xx]
    return img, pos, altura


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, 'public', 'jogo')
    anims = coleta()
    img, pos, altura = empacota(anims)
    salvar_png(os.path.join(saida, 'atlas.png'), img)
    frames = {nome: {'frame': {'x': x, 'y': y, 'w': w, 'h': h}, 'rotated': False, 'trimmed': False,
                     'spriteSourceSize': {'x': 0, 'y': 0, 'w': w, 'h': h}, 'sourceSize': {'w': w, 'h': h}}
              for nome, (x, y, w, h, _) in pos.items()}
    meta = {'image': 'atlas.png', 'size': {'w': LARGURA, 'h': altura}, 'scale': '1',
            'animacoes': {nome: len(qs) for nome, qs in anims.items()}}
    with open(os.path.join(saida, 'atlas.json'), 'w') as f:
        json.dump({'frames': frames, 'meta': meta}, f, separators=(',', ':'))
    print(f'atlas: {len(frames)} quadros, {LARGURA}×{altura}')


if __name__ == '__main__':
    main()
