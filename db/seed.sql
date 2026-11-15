-- Dados iniciais: cardápio fixo e horários (fonte: docs/CONTEUDO-INSTAGRAM.md, preços confirmados em 15/11/2026)
DELETE FROM cardapio_itens;
DELETE FROM cardapio_categorias;
DELETE FROM horarios;

INSERT INTO cardapio_categorias (id, slug, nome, subtitulo, ordem) VALUES
  (1,  'quitutes',     'Quitutes',                    'Pra começar',      1),
  (2,  'belisquetes',  'Belisquetes',                 'Pra partilhar',    2),
  (3,  'porcoes',      'Porções',                     NULL,               3),
  (4,  'pratos',       'Pratos de todo dia',          NULL,               4),
  (5,  'fim-de-semana','Especiais do final de semana', NULL,              5),
  (6,  'caldos',       'Caldos',                      NULL,               6),
  (7,  'sobremesas',   'Sobremesas',                  NULL,               7),
  (8,  'alcoolicos',   'Alcoólicos',                  'Drinks da casa',   8),
  (9,  'cervejas',     'Cervejas',                    NULL,               9),
  (10, 'bebidas',      'Bebidas',                     'Sem álcool',      10);

-- (categoria_id, nome, descricao, preco_centavos, autoral, vegetariano, camarao, destaque, ordem)
INSERT INTO cardapio_itens (categoria_id, nome, descricao, preco_centavos, autoral, vegetariano, camarao, destaque, ordem) VALUES
  (1, 'Acarajé na mão', 'O tradicional, do jeito do tabuleiro', 3000, 0, 1, 0, 1, 1),
  (1, 'Acarajé no prato', NULL, 3500, 0, 1, 0, 0, 2),
  (1, 'Abará na mão', 'O tradicional', 3500, 0, 0, 0, 0, 3),
  (1, 'Abará no prato', NULL, 4000, 0, 1, 0, 0, 4),
  (1, 'Wagner Moura', '10 bolinhos de acarajé + recheios', 6000, 0, 1, 0, 1, 5),
  (1, 'Lázaro Ramos', 'Mix de acarajé e abará minis + recheios', 7000, 0, 1, 0, 1, 6),
  (1, 'Tacacá', NULL, 4000, 0, 0, 0, 0, 7),

  (2, 'Pastel empanado de carne seca', 'Carne-seca com abóbora e catupiry', 3700, 0, 0, 0, 0, 1),
  (2, 'Pastel empanado', 'Queijo ou calabresa', 3500, 0, 1, 0, 0, 2),
  (2, 'Torresminho com pó mágico', NULL, 1800, 0, 0, 0, 0, 3),
  (2, 'Passarinha com farofa e vinagrete', NULL, 2800, 0, 0, 0, 0, 4),
  (2, 'Moela ao molho com açafrão', 'Acompanha pão e vinagrete', 3800, 0, 0, 0, 0, 5),
  (2, 'Camarão praiano do Acarajazz', '12 camarões G ao alho e óleo com maionese da casa', 8500, 0, 0, 0, 1, 6),

  (3, 'Coxinha de paella', 'Com maionese de tacacá e molho lambão', 6000, 1, 0, 1, 1, 1),
  (3, 'Carne de sol artesanal', 'Acebolada, com mandioca', 8000, 0, 0, 0, 0, 2),
  (3, 'Manjubinha ou peixe do dia', 'Farofa, vinagrete e maionese', 7500, 0, 0, 0, 0, 3),
  (3, 'Batata rústica da casa', 'Com maionese artesanal', 3800, 0, 0, 0, 0, 4),
  (3, 'Dadinho de tapioca', 'Com goiabada picante', 4200, 0, 0, 0, 0, 5),
  (3, 'Dadinho de tapioca com carne seca', 'Com goiabada picante', 4700, 0, 0, 0, 0, 6),

  (4, 'Moqueca de peixe', NULL, 5800, 0, 0, 0, 1, 1),
  (4, 'Moqueca de frutos do mar', NULL, 6800, 0, 0, 0, 0, 2),
  (4, 'Moqueca de banana, shimeji ou ovo', NULL, 4300, 0, 0, 0, 0, 3),
  (4, 'Baião de dois', 'Com ovo pochê e torresmo', 4500, 0, 0, 0, 0, 4),
  (4, 'Xinxim de bofe', 'Arroz, farinha da Bahia e vinagrete', 3200, 0, 0, 0, 0, 5),

  (5, 'Cozido baiano', NULL, 5400, 0, 0, 0, 1, 1),
  (5, 'Quiabada', NULL, 5200, 0, 0, 0, 0, 2),
  (5, 'Caranguejo (unidade)', 'Caranguejada aos domingos', 1500, 0, 0, 0, 0, 3),
  (5, 'Acompanhamento da caranguejada', 'Pirão, caldo e legumes · aos domingos', 2500, 0, 0, 0, 0, 4),

  (6, 'Sururu', '250 ml', 2500, 0, 0, 0, 0, 1),
  (6, 'Mocotó', '300 ml', 2500, 0, 0, 0, 0, 2),
  (6, 'Pirãozinho de caranguejo', NULL, 2500, 0, 0, 0, 0, 3),

  (7, 'Renatinho', 'Mousse de tapioca e brigadeiro de dendê', 2500, 1, 0, 0, 1, 1),
  (7, 'Bolo gelado de coco', 'Recheio de creme belga e calda de leite de coco', 2200, 0, 0, 0, 0, 2),
  (7, 'Bolo cangaceiro', 'Massa e brigadeiro branco, calda de cachaça de canela, bananada de tacho caseira e rapadura', 2200, 1, 0, 0, 0, 3),
  (7, 'Bolinho de estudante', 'Bolinho de tapioca com coco frito, passado no açúcar e canela', 1000, 0, 0, 0, 0, 4),
  (7, 'Buttercotch', 'Torta amanteigada, caramelo salgado e chocolate nobre', 2400, 0, 0, 0, 0, 5),

  (8, 'Cangaceiro', 'Cachaça com limão e calda de rapadura', 2500, 1, 0, 0, 1, 1),
  (8, 'Maria Bonita', 'Batida de coco com mel de flores silvestres', 2500, 0, 0, 0, 0, 2),
  (8, 'Batidinha', 'Frutas típicas', 2800, 0, 0, 0, 0, 3),
  (8, 'Acaragin', NULL, 3400, 1, 0, 0, 0, 4),
  (8, 'Amazônia Sour', NULL, 3500, 1, 0, 0, 0, 5),

  (9, 'Heineken / Spaten', NULL, 1900, 0, 0, 0, 0, 1),
  (9, 'Original / Eisenbahn', NULL, 1700, 0, 0, 0, 0, 2),
  (9, 'Long neck Heineken', NULL, 1300, 0, 0, 0, 0, 3),
  (9, 'Long neck Amstel', NULL, 1300, 0, 0, 0, 0, 4),
  (9, 'Long neck Eisenbahn', NULL, 1200, 0, 0, 0, 0, 5),
  (9, 'Long neck Spaten', NULL, 1200, 0, 0, 0, 0, 6),

  (10, 'Água sem gás', NULL, 500, 0, 0, 0, 0, 1),
  (10, 'Água com gás', NULL, 600, 0, 0, 0, 0, 2),
  (10, 'Refri', NULL, 700, 0, 0, 0, 0, 3),
  (10, 'Coca KS', NULL, 800, 0, 0, 0, 0, 4),
  (10, 'Cangalivre', NULL, 1500, 0, 0, 0, 0, 5),
  (10, 'Suco de frutas típicas', NULL, 1800, 0, 0, 0, 0, 6);

-- 0 = domingo … 6 = sábado
INSERT INTO horarios (dia_semana, abre, fecha, cozinha_fecha, so_delivery) VALUES
  (0, '12:00', '17:30', '17:00', 0),
  (1, NULL,    NULL,    NULL,    0),
  (2, NULL,    NULL,    NULL,    0),
  (3, NULL,    NULL,    NULL,    1),
  (4, '17:00', '23:00', '22:00', 0),
  (5, '17:00', '23:00', '22:00', 0),
  (6, '12:00', '23:30', NULL,    0);
