# Spidey Stamps — piloto SPS

Data: 28/09/2026
Branch: `spidey-stamps-sps-pilot`

## Objetivo

Provar o fluxo real de um GO Stamp Rally usando SPS como fonte operacional de coordenadas e Pokémon GO como confirmação oficial do evento, sem inventar pontos.

## Rally escolhido

**The Pokémon Centre Stamp Rally — Japão**

Período oficial: 01/07/2026 a 31/08/2027.

Fonte oficial:
- Pokémon GO Japão: `https://pokemongo.com/ja/news/assistant_pikachu`

Fontes de validação de coordenadas:
- SPS → canal `STAMPS` → BPost222 → post de 08/09/2026 marcado como **Updated exact coords!**
- Tomchun → lista independente de Pokémon Centers e coordenadas: `https://tomchun.tw/tomchun/2026/06/26/happy-birthday-professor-willow-2026/`

## Resultado do piloto

Foram cadastrados **17 pontos** correspondentes aos Pokémon Centers / ponto participante listados no cruzamento.

Validações:
- 17/17 pontos com latitude/longitude válida;
- 17/17 com `coordinate_type = exact_pokestop`;
- 17/17 com `coordinate_confidence = community_verified`;
- 17/17 com GPX individual habilitado;
- 17 IDs únicos;
- 17 pares de coordenadas únicos;
- `stamp_count` corresponde ao total de pontos;
- GPX completo do rally gera XML válido.

## Regra de segurança aplicada

O SPS contém também o ponto `35.729167, 139.718678` no complexo Sunshine City. Ele não foi promovido a 18º selo, pois a fonte de cruzamento o descreve como ponto adicional/área especial do mesmo complexo do Mega Tokyo. O piloto permanece com 17 pontos até existir confirmação de que esse ponto representa um selo independente.

## Comportamento esperado no app

Com o JSON desta branch:
- aba Selos mostra 2 rallies;
- Pokémon Centre Japão mostra 17/17 coordenadas exatas;
- cada Stop oferece **Copiar** e **Baixar GPX desta Stop**;
- o rally oferece **Baixar GPX completo** porque todos os pontos estão confirmados;
- os 17 pontos entram no Mapa;
- PokéXciting! continua fail-closed nos locais ainda sem PokéStop exata.

## Status

**PILOTO VALIDADO TECNICAMENTE — NÃO MERGEADO NA MAIN.**

O próximo passo é QA visual/funcional antes de publicar.
