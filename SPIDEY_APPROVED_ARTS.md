# SPIDEY — REGISTRO CANÔNICO DE ARTES

Status: FONTE DE VERDADE EDITORIAL
Data-base: 2026-09-30

## Regra absoluta
Nenhuma arte é considerada aprovada apenas porque existe no repositório, foi gerada, aparece no App ou possui nome semelhante a Premium.

Para ser `APPROVED`, a arte deve ter aprovação humana explícita e validação factual. O arquivo exato deve ser preservado e vinculado ao `eventId`.

Arte `APPROVED` não pode ser substituída por fallback, thumbnail, heurística, IA, script de confiança ou atualização não relacionada.

## Estados
- APPROVED — aprovação humana + factual, arquivo exato preservado.
- APPROVED_PENDING_ASSET — aprovação humana conhecida, mas arquivo final ainda precisa ser consolidado/identificado no repositório. Não publicar substituto.
- REVOKED_FACTUAL — visual previamente aceito, mas retirado por erro factual.
- REJECTED — não usar.
- PENDING_REVIEW — ainda sem aprovação final.

## Registro recuperado/consolidado

### Xerneas
- eventId: `2026-10-xerneas-raids`
- status: `APPROVED`
- asset conhecido: `spidey-app/assets/events/premium/xerneas-premium-approved-v1.avif`
- regra: esta é a referência visual aprovada; nenhuma miniatura/fallback concorrente pode substituí-la.

### Harvest Festival / Festival da Colheita
- status: `REVOKED_FACTUAL`
- motivo: a arte apresentada com Pumpkaboo como protagonista não representa corretamente o destaque oficial centrado em Applin/estreia shiny.
- regra: NÃO tratar a arte antiga como aprovada. Nova arte deve ter Applin como protagonista e passar por nova aprovação humana.

### Lote de artes enviado novamente pelo editor em 30/09/2026
O editor reenviou um conjunto de 10 imagens como referências visuais aprovadas/históricas para recuperação do catálogo. A associação exata de cada binário ao eventId e o transporte dos arquivos ao repositório ainda não estão completos. Portanto, para impedir falsos positivos, os itens não consolidados ficam `APPROVED_PENDING_ASSET` até o arquivo exato estar preservado.

Associações explicitamente reconhecidas durante a recuperação incluem:
- Invasão Team GO Rocket — existe referência horizontal detalhada separada; preservar variações aprovadas como assets distintos.
- Cinderace Gigantamax — referência do lote.
- evento misterioso — referência do lote.
- Zorua — referência do lote.
- Seedot — referência do lote.
- Hatch Day — referência do lote.
- Xerneas — consolidado separadamente acima.
- Halloween — referência do lote.
- Harvest Festival — REMOVIDO do conjunto aprovado por erro factual; ver seção própria.

IMPORTANTE: não inferir automaticamente que uma imagem atual do App de Yveltal, Dialga ou Sableye é aprovada. O editor afirmou explicitamente que Yveltal, Dialga, Sableye e outras artes vistas na preview estavam FORA DO PADRÃO.

## Gold Standard / padrão visual
O padrão visual canônico continua sendo `spidey-premium-v1`, complementado por `SPIDEY_PREMIUM_STANDARD.md`, `SPIDEY_ART_SYSTEM.md` e pela Constituição do App.

Uma arte nova deve ser factual, mobile-first, forte, claramente Spidey, não genérica, organizada, compartilhável e de leitura rápida.

## Regra de recuperação
Se o arquivo binário exato de uma arte aprovada não estiver no repositório, NÃO gerar uma substituta e chamá-la de aprovada. O estado correto é `APPROVED_PENDING_ASSET` até recuperar/consolidar o arquivo original.

## Próxima auditoria obrigatória
1. Materializar/consolidar no repositório os binários exatos das artes aprovadas reenviadas em 30/09.
2. Associar cada arquivo a um `eventId` único.
3. Registrar hash SHA-256, dimensões e finalidade (thumb/card/hero/poster).
4. Atualizar este documento para `APPROVED` somente após a associação inequívoca.
5. Fazer o catálogo master do App consumir exclusivamente este conjunto aprovado.