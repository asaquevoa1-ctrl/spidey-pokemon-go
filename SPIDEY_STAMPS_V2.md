# Spidey Selos v2

## Objetivo
Transformar a área de GO Stamp Rally em uma ferramenta operacional de rota, preparada tanto para rallies pequenos quanto para campanhas japonesas com 100+ selos.

## Fluxo público
Campanha → Prefeitura/Região → Set → Selo/Stop.

A tela de um set deve priorizar:
1. progresso;
2. próximo selo;
3. anterior/próximo na ordem da rota;
4. coordenadas em lote para DataHub e apps compatíveis;
5. um único GPX completo;
6. galeria visual selo por selo;
7. filtros/busca para sets grandes.

## Regras de coordenadas
- Nunca gerar coordenada aproximada como PokéStop exata.
- `exact_pokestop` é obrigatório para copiar em lote/GPX.
- Ordem de exportação: `route_order`, depois `stamp_number`, depois ordem original.
- GPX individual por Stop não é usado.
- GPX completo só é liberado quando todas as Stops do set têm coordenada exata confirmada.
- “Copiar todas”, “Copiar só faltantes” e “Copiar filtradas” exportam uma coordenada por linha no formato `latitude,longitude`.

## Imagens de selos
O app aceita imagem real por Stop através de um destes campos:
- `stamp_image_url`
- `stamp_image`
- `image_url`
- `image`

Quando nenhuma imagem real/verificada estiver disponível, mostrar `imagem pendente`. Não inventar/recriar selo oficial.

As imagens devem ser carregadas com lazy loading para manter bom desempenho em sets com 100+ itens.

## Campos recomendados para campanhas grandes
No rally/campanha:
- `campaign_id`
- `campaign_title`
- `country`

No set:
- `set_id`
- `set_title`
- `prefecture`
- `region`

Na Stop:
- `id`
- `stamp_number`
- `route_order`
- `city`
- `prefecture`
- `region`
- `venue`
- `venue_detail`
- `latitude`
- `longitude`
- `coordinate_type`
- `coordinate_confidence`
- `coordinate_source`
- `stamp_image_url`
- `stamp_image_source`

## Progresso
O progresso permanece local no dispositivo por rally/set. Deve permitir:
- marcar feito/faltante;
- abrir inicialmente o primeiro selo ainda não concluído;
- copiar apenas as coordenadas restantes;
- navegar anterior/próximo sem sair da tela.

## Escalabilidade
A galeria usa grid responsivo, imagens lazy e `content-visibility` para suportar dezenas ou centenas de selos sem transformar a tela em uma lista longa de cards pesados.
