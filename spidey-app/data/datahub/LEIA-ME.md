# Exportação de selos em TXT — DataHub (Spidey)

## Arquivos persistentes
- `pokemon-center-japan-18-pokestops.txt`: 18 pontos registrados como PokéStops na base do Spidey com confirmação comunitária. Não são resultados verificados ao vivo dentro do jogo.
- `pokelids-japan-482-lid-locations.txt`: 482 locais físicos de tampas Pokémon no Japão. **Não são coordenadas exatas verificadas das PokéStops**.
- `catalogo.json`: tipos, quantidades, confiabilidade e distribuição por 42 prefeituras.

Formato dos TXT: UTF-8, sem cabeçalho; cada linha é `latitude,longitude` com seis casas decimais, preservando a ordem do catálogo. O Spidey permite baixar os dois arquivos diretamente na aba **Selos** e filtrar os 482 locais por prefeitura para gerar um TXT regional sem contato com servidor.

**DataHub:** este é o padrão textual genérico, não um formato proprietário atestado. Importar um TXT em qualquer cliente externo não confirma que os selos aparecerão no jogo. Os selos exigem PokéStops participantes e proximidade conforme as regras do Pokémon GO.

## Imagens individuais
- 482 PokéLids: imagens das tampas fornecidas pelo catálogo oficial `local.pokemon.jp`, já exibidas em cada card/selo. Nenhuma é reapresentada como arte gerada do Spidey.
- Pokémon Center: 17 selos com desenhos individuais documentados na [referência Serebii](https://www.serebii.net/pokemongo/stamprally/pokemoncenterstamprally.shtml). Mapeamento de imagem por ID incorporado ao `stamps-v2.js`, URLs remotas usadas sem copiar os arquivos. A arte individual de **Yokohama** não estava disponível nessa referência; manter campo visual pendente para não mostrar imagem errada.
- PokéXciting e Nagasaki: sem coordenadas exatas e sem artes individuais verificadas no catálogo atual; não gerar arquivo vazio nem inventar ilustrações.

## Manutenção
- Sempre regenerar os TXT a partir de `spidey-app/data/stamps.json` ao mudar coordenadas; atualizar o catálogo JSON e os testes de correspondência exata.
- Não confundir `venue_reference` com `exact_pokestop` e não habilitar GPX em PokéLids apenas por ter a posição da tampa.
- Manter a identidade Premium Spidey do aplicativo; imagens de selos são conteúdos de coleção e não substituem cartazes de eventos.
