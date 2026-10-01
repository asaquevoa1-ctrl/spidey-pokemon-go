# Xerneas — rotação corrigida, QA de 01/10/2026

## Continuidade
Branch `spidey-fly-v1`, checkpoint retomado `f32ae6e439d1e04443933c97da0f5dd6dfaa5685`.
Preview do checkpoint: https://spidey-pokemon-is9kph570-spidey3.vercel.app/spidey-app/qa-responsive.html

## Observado no navegador
- Mobile 390×850 e desktop 1280×850: Home mostrou a miniatura da rotação; detalhe decodificou o PNG corrigido em 1121×1403. Pôster inteiro foi inspecionado depois de rolar o detalhe para o topo.
- URL observada: `assets/events/review/xerneas-rotation-correction-v1.png?v=b9e3b4629234`; `complete=true`, dimensões naturais 1121×1403.
- Período visível na peça: 30 de setembro a 6 de outubro de 2026. Sem os painéis de bônus/horários retirados na correção.
- A candidata continua `PENDING_REVIEW`. QA de renderização não concede aprovação editorial.
- Hora de Reides: detalhe continuou usando `assets/events/recovered/1000426235.png?v=2b97e5ae1478`, íntegro em 1229×1536.
- Uma ação `Ver rota mundial` fechou o diálogo e abriu FLY mantendo a seleção Hora de Reides: Xerneas; sem tabela mundial paralela nem aviso de GPX sem ação.
- Não foi observado overflow horizontal no desktop: largura de documento/conteúdo 1265 pixels dentro do iframe de 1280.

## Defeitos encontrados e correção incremental
- Diálogo abria focando o link Fonte e rolava além da arte. Controle Fechar foi movido para antes do conteúdo, com autofocus e área de 44px; detalhe reinicia no topo.
- Semana ainda resolvia o AVIF truncado para a rotação. A exceção explícita de revisão agora é compartilhada por Home, Semana e detalhe, sem alterar o catálogo aprovado ou permitir substituição por rascunho genérico.
- Cache foi versionado e inclui candidata, original da Hora de Reides e ilustrações recuperadas usadas no preview; leitura de assets permite encontrar o arquivo pré-carregado quando o pedido tem query de hash.
- Fonte no detalhe/Novidades usa a classificação legível do jogador, sem rótulos de bastidor. Ausência de coordenada específica deixa de gerar aviso para eventos globais.

## Evidências do checkpoint
- `xerneas-home-mobile-f32ae6e-20261001.jpg`
- `xerneas-rotation-mobile-f32ae6e-20261001.jpg`
- `xerneas-rotation-desktop-f32ae6e-20261001.jpg`

## Verificação local da correção
10 testes Node e 28 testes Python passaram; sintaxe dos 18 scripts ativos passou. Hashes do catálogo aprovado passaram sem alteração. SHA256 da candidata permanece `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`.

Nova integração aguardando confirmação na preview após deploy. Android físico, instalação/upgrade PWA, offline real e entrega push não comprovados nesta rodada. Nenhuma promoção a main/produção. Cobertura completa de artes continua pendente.
