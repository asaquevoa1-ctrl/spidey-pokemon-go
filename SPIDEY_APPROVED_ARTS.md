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
## Verificação de integridade — 01/10/2026

O catálogo executável `spidey-app/premium-approved-master.js` foi alinhado ao registro: Xerneas e Festival das Luzes (aprovação documentada em `SPIDEY_APP_STATUS.md`). O módulo deixa de marcar automaticamente Seedot/Zorua/Sizzlipede como aprovados; os binários permanecem preservados, sem nova aprovação inferida. Harvest revogado não entra no catálogo.

| eventId | Arquivo | SHA-256 |
|---|---|---|
| `2026-10-xerneas-raids` | `assets/events/premium/xerneas-premium-approved-v1.avif` | `458dab7343a16b75b2d64a25fef6476140895384495e1f4d9d3ff6ae3d0b94ee` |
| `festival-of-lights-2026-pokeminers-e2` | `assets/festival-das-luzes-approved.png` | `6a4bc24f09a72ad7e0836197277b581207ccba6be2562c814585e50387a6acda` |
| `2026-09-raids-xerneas` | `assets/events/premium/xerneas-premium-approved-v1.avif` | `458dab7343a16b75b2d64a25fef6476140895384495e1f4d9d3ff6ae3d0b94ee` |
| `2026-09-30-raid-hour-xerneas` | `assets/events/premium/xerneas-premium-approved-v1.avif` | `458dab7343a16b75b2d64a25fef6476140895384495e1f4d9d3ff6ae3d0b94ee` |


## Recuperação materializada — 01/10/2026, revisão para uso público

Os 11 binários do lote original reenviado em 30/09 foram recuperados sem alterações e preservados em `spidey-app/assets/events/recovered/`. Hashes e dimensões estão em `manifest.json` dessa pasta. A ausência de arquivo deixou de ser o bloqueio desse lote; o bloqueio agora é factual.

Verificação visual dos originais: Seedot diz Community Day em 11/10, 14–17h, shiny aumentado e golpe exclusivo; não corresponde ao Holofote de 01/10, 18–19h, 2× PE. Zorua diz 3–9/10; o catálogo oficial registra Community Day 10/10. Cinderace diz 10–20h; o anúncio registra 14–17h. Hatch traz Togepi em lugar de Sandile. Xerneas recuperado diz 14–26/10, incompatível com a rotação atual; NÃO substitui o AVIF aprovado. Harvest/Pumpkaboo permanece revogado. Não publicar integralmente essas informações incorretas.

No candidato da branch, `preview-art.js` usa apenas a área pictórica dos originais de Seedot, Zorua e Cinderace, por recorte CSS (arquivos binários intactos). Informações ficam em HTML, vindas do evento existente. Isto é uma proposta `PENDING_REVIEW`, separada do master aprovado; não é novo APPROVED nem poster corrigido. As demais peças permanecem preservadas fora da UI enquanto os conflitos factuais são resolvidos. A tentativa de edição factual de Seedot pela ferramenta de imagem foi bloqueada por limite da conta; nenhum substituto foi declarado aprovado.

## Correção de QA — Xerneas vazio, 01/10/2026
Os prints do editor e a reprodução no preview revelaram que a imagem vinculada não era visível. A validação anterior de URL/dimensões não comprovou renderização; a declaração de preservação visual deve ser lida com esta correção. O AVIF aprovado é truncado: 15.008 bytes presentes; caixa mdat termina no byte 54.559. FFmpeg e libavif falham ao decodificar. Original e SHA permanecem intactos; aprovação editorial não é revogada. Disponibilidade de renderização bloqueada até recuperar o binário completo exato (APPROVED_PENDING_ASSET operacional). Não usar o Xerneas recuperado de 14–26/10 nem Elite Raids de 18/10 como substituto. Candidato remove o espaço vazio e exibe aviso curto no detalhe; Home não cria miniatura vazia nem usa arte concorrente. Isto é contenção da falha, não cobertura artística concluída, e continua sendo bloqueio da entrega visual. Produção não promovida.
