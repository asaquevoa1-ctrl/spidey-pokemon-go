# SPIDEY — REGISTRO CANÔNICO DE ARTES

Status: FONTE DE VERDADE EDITORIAL
Data-base: 2026-10-01

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

## Histórico — candidata de Seedot — 01/10/2026, após aprovação de Invasão/Cinderace

Pôster integral corrigido para `2026-10-01-spotlight-seedot`, **PENDING_REVIEW**, `assets/events/review/seedot-spotlight-correction-v1.png`, SHA256 `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`, 1121×1403. Fonte da comunidade (Pokémon GO Hub + Leek Duck): 01/10/2026, 18–19h locais, 2× PE por captura e mais Seedot na natureza. Removidos Community Day/11/10/14–17h, golpe exclusivo, maior chance de Brilhante e painéis sem confirmação. Original preservado byte a byte. Entrada explícita full_poster no preview substitui somente o recorte provisório de Seedot; master aprovado inalterado.

Applin foi recusado novamente com o mesmo prompt/inputs, request ID `4038e879-6ed2-4e02-a770-aae59e8e8855`; Semana Mundial do Espaço também foi recusada, request ID `e8330835-4c71-41fb-98eb-c3896d30b92f`. Nenhum arquivo entregue para essas duas peças e nenhuma aprovação inferida. Recusas, prompts exatos, fontes e candidata Seedot em `docs/qa/NEXT_ART_REVIEW_20261001.json`. Dados oficiais da Semana do Espaço atualizados: evento 04–10/10, pesquisa gratuita até 12/10 às 23h59 locais. Arte permanece pendente.

QA e provas da candidata Seedot concluídos no código `2ed7ef8`, mobile/desktop, Home/Semana/detalhe/FLY, em `docs/qa/NEXT_ART_20261001.md`. PNG exato continua PENDING_REVIEW até decisão humana explícita; limitações de toque Android/PWA permanecem no relatório. Xerneas/Invasão/Cinderace/Hora de Reides/Festival das Luzes mantêm APPROVED; esta rodada não os altera nem aprova produção.

## Aprovação de Invasão e Cinderace — 01/10/2026, 15:45 BRT

O editor respondeu “Sim, aprovo” aos dois PNGs exatos apresentados no checkpoint `df9d050`, código de QA `684d80e`. As peças passam de PENDING_REVIEW para **APPROVED** e entram no master. Cópias byte a byte; candidatas, originais e registro histórico de prompts preservados. Vínculo auditável da decisão/arquivos/eventIds/provas: `docs/qa/PRIORITY_ART_APPROVAL_20261001.json`. Histórico de geração: `docs/qa/PRIORITY_ART_REVIEW_20261001.json`.

| eventId | Asset aprovado | SHA256 | Estado |
|---|---|---|---|
| `2026-10-harvest-taken-over` | `assets/events/premium/harvest-invasion-approved-v1.png` | `918d1a6735191636a5f26cee9d3a8ae61c8fc6a1d2c09e70e894bb6f70570165` | APPROVED |
| `2026-10-gigantamax-cinderace-max-day` | `assets/events/premium/cinderace-max-day-approved-v1.png` | `b8f9b02488e8817bdb250c676a04e6503f4492d84a55836124f7ae94bd34e470` | APPROVED |

Ambas PNG 1121×1403, `display: full_poster`, mesmos bytes aprovados para thumb/card/weekly/hero/poster. Invasão: 02/10 às 00h → 05/10 às 20h locais; Giovanni com Zekrom Sombroso e remoção de Frustração. Cinderace: 03/10, 14–17h locais, Batalhas Max de seis estrelas e estreia do Brilhante. Fonte primária e correções factuais registradas no manifesto; nenhum bônus sem confirmação reintroduzido.

Master aprovado é soberano; estas duas entradas saem de `preview-art.js`. Xerneas, Hora de Reides e Festival das Luzes permanecem intactos. A decisão de 09:08 BRT foi exclusiva de Xerneas; a decisão de 15:45 BRT aprova somente estas duas peças. Não aprova Applin, Seedot, Zorua nem o lançamento completo.

QA anterior mobile/desktop/Semana e FLY de Cinderace está em `docs/qa/PRIORITY_ART_20261001.md`. Novos caminhos confirmados na revisão `a242f88`: mobile/desktop/Semana e FLY de Cinderace, 14 testes passaram. Evidências em `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`.

Applin: dados oficiais atualizados, mas ferramenta recusou a geração, sem novo arquivo. Arte permanece pendente. Harvest/Pumpkaboo continua REVOKED_FACTUAL e não é substituto. Android/PWA/push e cobertura restante continuam pendentes de prova.

## Registro recuperado/consolidado

### Xerneas
- eventIds da rotação: `2026-09-raids-xerneas` e `2026-10-xerneas-raids`
- status: `APPROVED`
- asset corrente: `spidey-app/assets/events/premium/xerneas-rotation-approved-v1.png`
- SHA256: `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`, 1121×1403.
- decisão humana: “Sim, aprovo”, 01/10/2026 09:08:35 BRT, em resposta ao PNG e preview da rodada `24add19`.
- registro do vínculo: `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`.
- regra: o arquivo aprovado corrente é soberano em Home, Semana, Calendário e detalhe; não usar fallback/arte concorrente.
- AVIF anterior truncado preservado como histórico, sem alterações de bytes/hash. Foi sucedido pela nova aprovação explícita; não é o asset ativo da rotação.
- Hora de Reides `2026-09-30-raid-hour-xerneas`: mantém `assets/events/recovered/1000426235.png` e sua aprovação anterior; não usa este PNG de rotação.

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
| `2026-10-xerneas-raids` | `assets/events/premium/xerneas-rotation-approved-v1.png` | `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738` |
| `festival-of-lights-2026-pokeminers-e2` | `assets/festival-das-luzes-approved.png` | `6a4bc24f09a72ad7e0836197277b581207ccba6be2562c814585e50387a6acda` |
| `2026-09-raids-xerneas` | `assets/events/premium/xerneas-rotation-approved-v1.png` | `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738` |
| `2026-09-30-raid-hour-xerneas` | `assets/events/recovered/1000426235.png` | `2b97e5ae1478060889cc4503e4a66c1fe5cb85be2b365062023851943312900c` |


## Recuperação materializada — 01/10/2026, revisão para uso público

Os 11 binários do lote original reenviado em 30/09 foram recuperados sem alterações e preservados em `spidey-app/assets/events/recovered/`. Hashes e dimensões estão em `manifest.json` dessa pasta. A ausência de arquivo deixou de ser o bloqueio desse lote; o bloqueio agora é factual.

Verificação visual dos originais: Seedot diz Community Day em 11/10, 14–17h, shiny aumentado e golpe exclusivo; não corresponde ao Holofote de 01/10, 18–19h, 2× PE. Zorua diz 3–9/10; o catálogo oficial registra Community Day 10/10. Cinderace diz 10–20h; o anúncio registra 14–17h. Hatch traz Togepi em lugar de Sandile. Xerneas recuperado diz 14–26/10, incompatível com a rotação atual; NÃO substitui o AVIF aprovado. Harvest/Pumpkaboo permanece revogado. Não publicar integralmente essas informações incorretas.

No candidato da branch, `preview-art.js` usa apenas a área pictórica dos originais de Seedot, Zorua e Cinderace, por recorte CSS (arquivos binários intactos). Informações ficam em HTML, vindas do evento existente. Isto é uma proposta `PENDING_REVIEW`, separada do master aprovado; não é novo APPROVED nem poster corrigido. As demais peças permanecem preservadas fora da UI enquanto os conflitos factuais são resolvidos. A tentativa de edição factual de Seedot pela ferramenta de imagem foi bloqueada por limite da conta; nenhum substituto foi declarado aprovado.

## Correção de QA — Xerneas vazio, 01/10/2026
Os prints do editor e a reprodução no preview revelaram que a imagem vinculada não era visível. A validação anterior de URL/dimensões não comprovou renderização; a declaração de preservação visual deve ser lida com esta correção. O AVIF aprovado é truncado: 15.008 bytes presentes; caixa mdat termina no byte 54.559. FFmpeg e libavif falham ao decodificar. Original e SHA permanecem intactos; aprovação editorial não é revogada. Disponibilidade de renderização bloqueada até recuperar o binário completo exato (APPROVED_PENDING_ASSET operacional). Não usar o Xerneas recuperado de 14–26/10 nem Elite Raids de 18/10 como substituto. Candidato remove o espaço vazio e exibe aviso curto no detalhe; Home não cria miniatura vazia nem usa arte concorrente. Isto é contenção da falha, não cobertura artística concluída, e continua sendo bloqueio da entrega visual. Produção não promovida.

## Originais de Xerneas reenviados — 01/10/2026, 07:24 BRT
Quatro arquivos recebidos diretamente do editor e preservados sem modificação; manifesto `docs/qa/xerneas-originals-20261001.json`. `1000426235.png` recupera a peça completa de Hora de Reides de 30/09, 18–19h, associada exclusivamente a `2026-09-30-raid-hour-xerneas`, coerente com o catálogo. Não copiar essa data para a rotação geral. `1000426215.png` é variante sem data, ainda intitulada Hora de Reides; preservar sem inferir associação à rotação. `1000431444.png` traz 14–26/10 e bônus divergentes; `1000431181.png` traz Elite Raids 18/10. Preservar referências, não publicar para a rotação 30/09–06/10. O AVIF truncado permanece intacto para rastreabilidade; bloqueio da rotação geral ainda não resolvido. Nenhuma promoção de produção.

## Correção de rotação Xerneas — candidato 01/10/2026
Ferramenta de imagens voltou a permitir edição. Candidato `assets/events/review/xerneas-rotation-correction-v1.png`, SHA256 `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`, 1121×1403, gerado a partir do original reenviado `1000431444.png`. Data 30/09–06/10; painéis de bônus sem confirmação e horários retirados. PENDING_REVIEW: não declarado aprovado. Master AVIF e originais preservados. `preview-art.js` autoriza explicitamente este candidato apenas para os dois IDs da rotação com asset indisponível; nenhuma heurística de fallback nem troca da Hora de Reides recuperada. Necessária revisão humana do desenho/textos antes de promoção. O detalhe tem uma ação Ver rota mundial que fecha o modal e abre FLY; remove duplicata de horários mundiais e aviso sem ação sobre GPX.

## QA de renderização da candidata — 01/10/2026
PNG corrigido decodificado e visível em Home/Semana/detalhe no preview, 390×850 e 1280×850. Hash e dimensões permanecem os acima. Provas em `docs/qa/XERNEAS_ROTATION_20261001.md`; base de código `62c86a4`. Hora de Reides manteve o original exclusivo `1000426235.png`, SHA256 `2b97e5ae1478060889cc4503e4a66c1fe5cb85be2b365062023851943312900c`. Nenhuma arte nova recebeu APPROVED. A candidata de rotação continua PENDING_REVIEW, aguardando decisão visual/factual explícita do editor sobre este arquivo exato.

## Aprovação explícita da rotação — 01/10/2026, 09:08 BRT
O editor respondeu “Sim, aprovo” à apresentação deste PNG exato. Estado corrente passa de PENDING_REVIEW a APPROVED exclusivamente para os dois IDs da rotação. A cópia em `assets/events/premium/xerneas-rotation-approved-v1.png` é byte a byte igual à candidata revisada. A candidata e o AVIF anterior continuam preservados para rastreabilidade. O master passa a resolver o PNG saudável sem exceção de revisão; as entradas de Xerneas foram retiradas de `preview-art.js`. A aprovação é da arte de Xerneas, não de outras peças nem do lançamento público completo.

Validação factual da peça: Xerneas em Reides 5★, 30/09–06/10/2026, corroborado por Leek Duck e GO Hub, mantendo classificação de comunidade. Sem painéis de bônus/horários não confirmados. Registro completo em `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`.


## APROVAÇÃO SEEDOT — 01/10/2026, 19:07 BRT

Editor respondeu “Sim, aprovo” ao PNG exato de Seedot apresentado no checkpoint `8d5541e`/QA `2ed7ef8`. Hash `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`, 1121×1403, agora APPROVED exclusivamente para `2026-10-01-spotlight-seedot`. Cópia premium idêntica à candidata em `assets/events/premium/seedot-spotlight-approved-v1.png`; original/candidata e registros históricos preservados. Registro `docs/qa/SEEDOT_APPROVAL_20261001.json`, confirmação pós-aprovação em `docs/qa/SEEDOT_APPROVAL_20261001.md`.

Master soberano/full_poster, mesmos papéis de imagem, cache/shell versionados. Fonte Seedot permanece comunidade; nenhuma alteração factual nesta consolidação. Somente a entrada Seedot sai do preview; todas as entradas aprovadas anteriores preservadas. Inventário corrente 23 eventos: 4 APPROVED, 19 sem arquivo Home/FLY; Zorua pendente fora da janela. QA pós-aprovação concluído em `b310f5a`, provas em `docs/qa/SEEDOT_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push. Applin/Espaço recusados, sem novo arquivo. Nenhuma promoção a main/produção; aprovação não inclui lançamento completo.


Handoff pós-aprovação Seedot: código `b310f5a`, preview seguro https://spidey-pokemon-5uir2c532-spidey3.vercel.app/spidey-app/index.html, mobile/desktop/Semana/detalhe/FLY conferidos, 16 testes passaram e duas provas preservadas. Home passou a Xerneas após o encerramento local de Seedot às 19h; masters anteriores preservados. Relatório `docs/qa/SEEDOT_APPROVAL_20261001.md`. Brief factual da próxima peça `docs/qa/MEGA_VICTREEBEL_BRIEF_20261001.json` (comunidade, sem arte/sem aprovação) e roteiro de teste físico `docs/qa/PUBLIC_ANDROID_QA_20261001.md` preparados. Continuar nesta branch sem reiniciar; não reabrir Xerneas/Invasão/Cinderace/Seedot aprovados. Checkpoint documental posterior não altera o código conferido; nenhuma promoção a main/produção.


## Mega Victreebel — candidata em revisão, 01/10/2026

Somente `2026-09-mega-victreebel-raids`: PNG v2 `assets/events/review/mega-victreebel-rotation-v2.png`, SHA256 `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`, 1121×1403, PENDING_REVIEW. Datas 30/09–06/10/2026 de Leek Duck/GO Hub (comunidade); referência de aparência Pokémon GO, sem transferir bônus/datas do Mega Finale. Geração built-in imagegen; v1 preservada, v2 elimina torres/símbolos de Batalhas Max. Registro exato `docs/qa/MEGA_VICTREEBEL_REVIEW_20261001.json`. Master APPROVED e todas as decisões anteriores intactos. Falta QA do novo preview e decisão humana específica; nenhuma aprovação ou produção inferida.


QA da rodada Novidades/Mega Victreebel concluído em `282ea97`, preview direto https://spidey-pokemon-8hxqv2mhj-spidey3.vercel.app/spidey-app/index.html. Mobile 390 Claro/desktop 1280 Escuro sem overflow; um anúncio Minior/três períodos, trio regional/detalhe/FLY 20/28 com seleção preservada; candidata Mega v2 inteira 1121×1403 em Home/Semana/detalhe. Cliques e clipboard Taipei exato comprovados no app direto desktop. 21 testes passaram; masters anteriores intactos. Quatro prints/observações/hashes em `docs/qa/NEWS_UPDATE_20261001.md` e `docs/qa/MEGA_VICTREEBEL_REVIEW_20261001.json`. Candidata v2 PENDING_REVIEW até decisão humana específica; 23 eventos de 01–07/10 agora 4 APPROVED + 1 pôster em revisão + 18 sem arquivo Home/FLY. Demais artes, Android/PWA/push e GPX continuam pendentes; coleta de notícias observada, ingestão do app foi editorial, sem nova prova automática. Nenhuma promoção a main/produção. Continuar da branch/checkpoint documental, preservando o código validado `282ea97`.


## Aprovação Mega Victreebel v2 — 01/10/2026, 22:09 BRT

Editor respondeu “Sim, aprovo” ao PNG v2 completo mostrado diretamente no chat após o reenvio da imagem. APPROVED exclusivamente para `2026-09-mega-victreebel-raids`; hash `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`, 1121×1403. Cópia byte a byte em `assets/events/premium/mega-victreebel-rotation-approved-v1.png`, sem regeneração. Vínculo da decisão/arquivo/eventId: `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json`. Datas permanecem identificadas como comunidade; aparência primária não é prova da rotação.

Somente Mega Victreebel sai do preview e entra no master; sete entradas anteriores, arquivos e históricos preservados. Shell/cache versionados. Inventário 01–07/10: 23 eventos, 5 APPROVED, 18 sem arquivo no compositor Home/FLY; Zorua pendente fora da janela. QA pós-aprovação confirmado no código `4b0f319`, Home/Semana/detalhe, mobile Claro 390×850 e desktop Escuro 1280×850; duas provas e observações no relatório `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push; Applin/Espaço seguem sem arquivo por recusas documentadas. Nenhuma promoção a main/produção.


## Sprint para 02/10 — lote de reides para revisão

Prazo de 2h20 informado às 22:41:59 BRT, alvo aproximado 02/10 01:02 BRT; não é garantia de conclusão. Três candidatas integrais geradas pela ferramenta de imagens: rotação Yveltal v1, Hora de Reides Yveltal v2 (estruturas Max removidas, v1 preservada) e Mega Blastoise v1. Datas/fontes da comunidade conferidas, sem bônus inferidos. Registro de prompts, hashes e eventIds `docs/qa/OCTOBER_RAIDS_REVIEW_20261001.json`; todas PENDING_REVIEW, aprovação humana não inferida. Integração explícita no preview/Home/Semana/detalhe, cache/shell versionados; QA de preview em andamento.

Catálogo de 124 eventos e oito entradas anteriores do master preservados; apenas fontes/notas dos três eventos alinhadas à conferência e título Hora de Reides localizado. Inventário 01–07/10: 23 eventos, 5 APPROVED + 3 pôsteres em revisão + 15 sem arquivo Home/FLY. Applin/Espaço continuam sem arquivo por recusas documentadas; padrão Premium permanece obrigatório. Plano e bloqueios `docs/qa/RELEASE_SPRINT_20261001.json`. Android físico/PWA/push e GPX ainda pendentes; sem promoção a main/produção, Amigos/Chat posterior ao núcleo.


## QA do lote de reides — 02/10/2026, continuação de 10e28fc

Preview artístico conferido no código `10e28fc`: https://spidey-pokemon-k2g2780qx-spidey3.vercel.app/spidey-app/index.html. Três candidatas PENDING_REVIEW, nenhuma aprovação humana inferida. Calendário → 7/10 → detalhes: mobile 390 Claro/desktop 1280 Escuro, PNGs 1121×1403 integrais, rodapé visível, sem overflow horizontal no detalhe; foco Fechar/scrollTop 0. FLY Hora de Reides Yveltal usa v2 própria e eventId correto, 20 essenciais, 18–19h local/Brasília dinâmica. Home seis próximos e Semana 28/09–04/10 ainda não incluem novo lote; não registrar prova visual nessas superfícies.

Master/arquivos aprovados intactos, 22 testes do código passaram. Seedot encontrou redirecionamento ao login Vercel; acesso temporário renovado pelo conector restaurou o mesmo PNG dentro do app, sem mudar arte/código. Nove provas/hashes/observações e limites em `docs/qa/OCTOBER_RAIDS_REVIEW_20261001.json` e MD homônimo; dados DOM `docs/qa/october-raids-browser-10e28fc-20261002.json`.

Selos: progresso 0→1/17 persistiu ao fechar/reabrir, teste restaurado; GPX incompleto 0/5 bloqueado. GPX Japão mostrou toast, mas arquivo/XML não capturado em duas tentativas, continua PENDING_DOWNLOAD_PROOF (`docs/qa/stamps-browser-10e28fc-20261002.json`). Android físico/instalação/atualização/offline/push pendentes; roteiro corrente `docs/qa/PUBLIC_ANDROID_QA_20261001.md`. Preview protegido; leitura de endpoint push sem conclusão de configuração.

Janela 01–07/10 continua 23 eventos: 5 APPROVED + 3 candidatas + 15 sem arquivo Home/FLY. Applin/Espaço recusados pela ferramenta, não substituir por falso Premium. Prazo alvo 02/10 01:02 BRT não significa lançamento completo: bloqueios registrados no sprint. Próximo: decisão humana exata das três peças, cobertura restante e QA físico; sem main/produção, Amigos/Chat posterior. Checkpoint documental posterior preserva código `10e28fc`; continuar sem reiniciar.


## Aprovação das três artes de reides — 02/10/2026, 07:16 BRT

Editor respondeu “Aprovo todas as três” após reenvio separado dos PNGs integrais no checkpoint `1824d8b`, QA prévio `10e28fc`. APPROVED exclusivamente: `2026-10-raids-yveltal` (rotação v1, hash `dbed7399b3e32400db94db90f98c7b23af0029c91a55b568e18948cd828e5328`); `2026-10-07-raid-hour-yveltal` (candidata v2, hash `a3881d22755b5c326f02f45ab456af3eaa024ad99427be36c9ff1bfd9c8d436b`); `2026-10-mega-blastoise-raids` (v1, hash `474fa9a793959d9dcac7a8f42840267695f12b2d561d8e16bb0129b9182bf321`). Todos 1121×1403; cópias premium aprovadas byte a byte, sem regeneração. Registro `docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.json` e MD homônimo. Fonte/datas permanecem comunidade.

Três entradas retiradas do preview, agora no master/full_poster; oito entradas anteriores preservadas com arquivos/histórico. Candidatas/revisão anterior da Hora de Reides/prompts/provas intactos. Shell/cache/master versionados. Catálogo de 124 IDs/janelas inalterado. QA pós-aprovação do novo preview pendente; não atribuir prova do preview antigo ao código novo.

Inventário 01–07/10: 23 eventos, 8 APPROVED e 15 sem arquivo Home/FLY; Zorua pendente fora da janela. Applin/Espaço continuam recusados, sem peça nova; Android físico/PWA/push e download/XML GPX Japão pendentes. Prazo alvo anterior 01:02 BRT passou; lançamento completo não está pronto. A aprovação destas três peças não autoriza main/produção. Continuar branch/NEXUS, sem reiniciar nem reabrir artes aprovadas.

## Zorua corrigido — candidato de 02/10/2026

PENDING_REVIEW exclusivamente para `2026-10-zorua-community-day`. PNG íntegro `assets/events/review/zorua-community-day-correction-v1.png`, 1121×1403, SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`. Original preservado, sem nova entrada APPROVED no master. Correções primárias: 10/10/2026 14–17h locais, 3× PE e 2× Doces por captura, Soco Enganador ao evoluir até 21h. QA real calendário/detalhe mobile Claro e desktop Escuro + FLY 20/28 concluído no código `a2b5638`. Arquivo/prompts/recusa Sizzlipede: `docs/qa/ZORUA_REVIEW_20261002.json`; provas/limites `docs/qa/DOWNLOAD_PUSH_ZORUA_QA_20261002.json`. Editor ainda não aprovou este PNG. Todas as aprovações anteriores preservadas, sem aprovação de produção.

## Zorua aprovado e pausa solicitada — 02/10/2026, 18:38:35 BRT

Editor aprovou explicitamente o PNG completo: “Eu adorei a imagem, com certeza eu aprovo.” SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`, 1121×1403. Cópia byte a byte em `assets/events/premium/zorua-community-day-approved-v1.png`, candidata/original preservados, 11 masters anteriores intactos; Zorua sai do preview e integra o master APPROVED/full_poster. Registro `docs/qa/ZORUA_APPROVAL_20261002.json`. Bônus do pôster rechecados na fonte primária: 3× PE e 2× Doces por captura, 10/10 14–17h locais; Soco Enganador ao evoluir durante o evento ou até quatro horas depois, prazo 21h. Bônus adicionais oficiais incorporados ao mesmo eventId, sem modificar as janelas. FLY já conferido no código a2b5638: 20 essenciais/28 completos, horários local/Brasília, coordenadas e mesmo pôster. QA do novo preview pós-aprovação PENDING_NEW_PREVIEW até prova específica; não atribuir QA antigo ao código novo.

Editor pediu processamento por até cinco minutos e então pausa, por viagem/possível perda de sinal. Encerrar a rodada com checkpoint e pausar; próxima retomada somente quando ele acionar. GPX capturado, configuração/recebimento de alertas e Android físico continuam pendentes; demais artes/recusas inalterados. Sem promoção a main/produção, nenhuma publicação/mensagem externa. Não reabrir a aprovação do Zorua nem regenerar a peça.
