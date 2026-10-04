# SPIDEY — REGISTRO CANÔNICO DE ARTES

Estado corrente — 04/10: ajustes dos prints Android publicados no código `23929e8`, produção READY em https://spidey-pokemon-go.vercel.app/spidey-app/ . Coordenadas de Selos separadas em latitude/longitude, sem quebra de dígitos; Semana usa os masters aprovados, a ilustração oficial do Pikachu Astronauta com crédito e datas/estado em Brasília. Cards sem arte aprovada usam data simples; zero capas genéricas. QA desktop Escuro e mobile390 Claro/Escuro sem overflow; 59 testes Node e gate automático passaram. Oito arquivos públicos alterados exatos; GPX Japão preservado, HTTP200,1.890 bytes/17 pontos e hash igual à prova anterior. Clipboard exibiu sucesso, mas a API do browser retornou vazio: conteúdo exato/Android físico não certificados nesta rodada. Catálogo124,25 masters,sete fundos e FLY20/28/Taipei preservados; nenhuma mudança em catálogo/assets/filas. Push remoto continua indisponível por configuração; Android/PWA/offline/push físicos e três recusas Premium permanecem registrados. Missões fixas e GPX de área dos museus continuam dispensados. Registro corrente: `docs/qa/PHONE_FINALIZATION_20261004.md/json`; históricos anteriores preservados.

Status: FONTE DE VERDADE EDITORIAL
Data-base: 2026-10-01

## Regra absoluta
Nenhuma arte é considerada aprovada apenas porque existe no repositório, foi gerada, aparece no App ou possui nome semelhante a Premium.

Para ser `APPROVED`, a arte deve ter validação factual e aprovação humana explícita ou QA visual delegado por autorização explícita vigente do responsável. A origem da decisão deve ser auditável. O arquivo exato deve ser preservado e vinculado ao `eventId`.

Arte `APPROVED` não pode ser substituída por fallback, thumbnail, heurística, IA, script de confiança ou atualização não relacionada.

## Estados
- APPROVED — validação factual e decisão humana explícita ou QA visual delegado por autorização explícita vigente; arquivo exato preservado e origem registrada.
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

Editor pediu processamento por até cinco minutos e então pausa, por viagem/possível perda de sinal. Encerrar a rodada com checkpoint e pausar; próxima retomada somente quando ele acionar. Captura/XML do GPX, configuração/recebimento de alertas e Android físico continuam pendentes; demais artes/recusas inalterados. Sem promoção a main/produção, nenhuma publicação/mensagem externa. Não reabrir a aprovação do Zorua nem regenerar a peça.

## Retomada com sinal — Zorua aprovado e GPX verificados, 02/10/2026

Editor retornou às 20:49:18 BRT: “Opa / Voltei, temos sinal”. Pausa anterior encerrada por esse acionamento. Código conferido `0433c322c43839f13a36996d52e511475c8739ae`, branch `spidey-fly-v1`, deploy READY `dpl_8EsSkfWnfXqbB9rLNPTHUfXfEJpB`; preview https://spidey-pokemon-bwb814dm8-spidey3.vercel.app/spidey-app/index.html. QA registrado em 2026-10-03T00:03:06.669Z; 02/10 em Brasília, 03/10 em UTC. Esta rodada altera apenas documentos/provas, preservando código, catálogo, binários e todas as aprovações.

Zorua: QA pós-aprovação PASSED_PREVIEW no novo deploy. Calendário → 10/10 → detalhe no app direto; mobile responsivo 390×850 Claro e desktop 1280×850 Escuro. PNG premium aprovado 1121×1403 inteiro, object-fit contain, foco Fechar e scrollTop 0, sem overflow horizontal nas medidas observadas. Download real da imagem servida: 2.299.199 bytes e SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`, idênticos à aprovação de 18:38:35 BRT. Bônus oficiais novamente conferidos e presentes no detalhe/FLY. FLY seleciona `2026-10-zorua-community-day`, fecha diálogo, usa o mesmo PNG, 20 essenciais e 28 hotspots, coordenadas e relógios local/Brasília. Referências: Kiritimati 09/10 21h→10/10 00h; Taipei 10/10 03–06h; Pago Pago 10/10 22h→11/10 01h Brasília. Home seis próximos/Semana 28/09–04/10 não incluem Zorua de 10/10, sem nova prova dessas superfícies.

GPX Japão: PASSED_DOWNLOADED_XML. Clique no link nativo “Baixar GPX completo” criou arquivo novo às 23:58:30.916905Z. A espera de evento do navegador expirou, mas o download real foi recuperado pela pasta compartilhada, sem usar os três arquivos antigos. XML GPX 1.1 válido, 17 waypoints, nomes/latitudes/longitudes/ordem idênticos ao catálogo do commit; 1.890 bytes, SHA256 `8870435145133c11894b923dad8dead2bff056e78a7c79104346fb1e7e12382a`. Prova e arquivo: `docs/qa/japan-rally-browser-download-0433c32-20261002.json` e GPX homônimo. Coordenadas comunitárias exatas do catálogo não são promovidas a fonte oficial. PokéXciting 0/5 continua sem link GPX completo. Isso encerra a pendência de captura/XML no navegador; teste físico Android permanece pendente.

Relatório `docs/qa/ZORUA_APPROVAL_20261002.md`, registro canônico JSON homônimo, DOM `docs/qa/zorua-approved-browser-0433c32-20261002.json` e cinco screenshots preservados. 31 testes/sintaxe são resultados anteriores válidos da consolidação `0433c32`; não foram executados novamente nesta rodada sem alteração de código. Logs consultados registraram erros da extensão de metadados do navegador, sem erro do app no lote retornado; não confundir isso com prova de ausência de erros fora desse lote.

Push: novo endpoint do preview respondeu HTTP 503 `push_not_configured`, Cache-Control no-store. Configuração do servidor e recebimento real permanecem bloqueios; nenhuma inscrição/configuração secreta/envio foi alterado. Android físico/instalação/atualização/offline continuam pendentes. Último inventário 01–07/10: 23 eventos, 8 APPROVED, 15 sem arquivo Home/FLY; Zorua fora da janela. Applin/Espaço/Sizzlipede continuam com recusas registradas. Lançamento completo/produção não aprovados; sem promoção a main e sem mensagens externas. Próxima frente: cobertura restante, configuração push e QA físico. Não reabrir a aprovação nem regenerar Zorua.


## Histórico pré-aprovação — Thundurus e Elgyem, 03/10/2026, PENDING_REVIEW

Duas candidatas novas, **sem aprovação humana**: `2026-10-shadow-thundurus` → `assets/events/review/thundurus-shadow-weekend-v1.png`, SHA256 `eb8141c8220c4acf4c3a962aaf12ee07b7c37085d5e8f6a1f1d233e25b6a4439`; `2026-10-08-spotlight-elgyem` → `assets/events/review/elgyem-spotlight-v2.png`, SHA256 `2ab5e183a146654848b962d4e02603561cccfa5b20ad34ddbeacdaef3b913df9`. Ambas 1121×1403/full_poster, fonte comunidade. Elgyem v1 preservada como revisão interna sem nome, fora da UI. Os 12 masters aprovados continuam intactos, inclusive Zorua.

Registro/prompts: `docs/qa/THUNDURUS_ELGYEM_REVIEW_20261002.json`. QA de preview `a17f6d4` com 31 testes, mobile/desktop, hashes servidos idênticos e FLY Elgyem 20/28: `docs/qa/THUNDURUS_ELGYEM_QA_20261002.json`. Este QA não concede APPROVED. Próximo é decisão do editor sobre os dois PNGs exatos; produção não promovida.

## Thundurus v1 e Elgyem v2 APPROVED — 03/10/2026, 07:30 BRT

“Com certeza, eu aprovo as duas novas artes” aprova os PNGs completos exibidos anteriormente, com eventIds/revisões/hashes vinculados em `docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json`. Caminhos finais `assets/events/premium/thundurus-shadow-weekend-approved-v1.png` e `assets/events/premium/elgyem-spotlight-approved-v1.png`, 1121×1403, idênticos às candidatas v1/v2. Elgyem v1 incompleta preservada só no histórico. Os dois IDs entram no master APPROVED/full_poster e saem do preview; 12 entradas anteriores preservadas, total 14. Fonte permanece comunidade, sem mudança factual na aprovação.

QA pós-aprovação PASSED_PREVIEW no código `29c1aecf53742de581ea0fc036793d91a859bc60`: 32 testes, mobile Claro/desktop Escuro, dois PNGs integrais e downloads servidos com hashes exatos, asset de Thundurus na Semana, FLY Elgyem 20/28. Cinco provas/DOM no relatório `docs/qa/thundurus-elgyem-approved-browser-29c1aec-20261003.json`. Prévia https://spidey-pokemon-7whircohq-spidey3.vercel.app/spidey-app/index.html. Android físico/push e lançamento completo ainda pendentes; nenhuma promoção a produção.

## Handoff — 03/10/2026 — Passe GO em revisão e acesso de testadores

Código de interface: `97c6823f1efb180782550ef22bf660416a1aebdc`, branch `spidey-fly-v1`. Preview conferido: https://spidey-pokemon-9oklrwpv9-spidey3.vercel.app/spidey-app/index.html.

Passe GO/Kyogre v1 está **PENDING_REVIEW**; aprovação humana segue nula. Fonte primária PT-BR rechecada: https://pokemongo.com/pt-BR/news/go-pass-october-2026. Texto distingue o Globo da Sorte pago (Deluxe) e 2× duração do Incenso de Aventura Diário ao atingir o Ranque 50. Datas 06/10 10h–03/11 10h locais preservadas. Não foi criada uma janela FLY para este passe de progressão. Os outros 123 eventos e todos os horários do catálogo permanecem iguais ao código anterior.

33 testes passaram antes da publicação do código. Novo preview READY conferido visualmente em 390 × 850 Claro e 1280 × 850 Escuro: arquivo íntegro, `contain`, sem overflow horizontal no diálogo; SHA256 servido igual ao candidato. Evidências: `docs/qa/GO_PASS_REVIEW_20261003.json`, `docs/qa/go-pass-browser-97c6823-20261003.json` e respectivos JPEGs em `docs/qa/proofs/`. Aprovações anteriores não foram alteradas.

A URL normal solicita conta Vercel. Um link temporário nativo com `_vercel_share` abriu a interface e o PNG em cliente sem autenticação e com cookies inicialmente vazios (HTTP 200). Compartilhar o link completo emitido, sem copiar o endereço pós-redirecionamento da barra. Expiração nativa informada: 10/4/2026, 10:30:31 AM; prazo do recurso: 23h. Token efêmero omitido do repositório. Proteções do projeto não foram alteradas; não há URL pública permanente nova.

Inventário recalculado pelo compositor real: 23 eventos na janela 01–07/10, 9 APPROVED, 1 PENDING_REVIEW e 13 sem arquivo. São **14 ainda sem conclusão/aprovação**, sendo a candidata do Passe GO já gerada. Master: 14 entradas, intacto. As recusas Applin/Espaço/Sizzlipede continuam registradas, sem novas tentativas de contorno.

Núcleo apto a teste: eventos, FLY/horários/fusos/coordenadas, Selos e GPX confirmado. Ainda pendentes: configuração/recebimento real de alertas, Android físico/instalação PWA/atualização/offline, demais artes e validação final. Amigos/Chat permanece depois do núcleo. Sem promoção para main/produção, configuração push ou dispatch. Próximo passo editorial: decisão do editor sobre o PNG exato do Passe GO; preservar todos os masters.

## Passe GO/Kyogre v1 APPROVED — 03/10/2026, 09:04:55 BRT

Decisão explícita “Fantástico / Eu aprovo” após entrega do PNG integral no chat e link para o original. Registro canônico: `docs/qa/GO_PASS_APPROVAL_20261003.json`. A aprovação encerra a pendência de entrega/revisão para este PNG exato; o registro pré-aprovação JSON permanece histórico e íntegro.

Evento `2026-10-go-pass`: cópia final `assets/events/premium/go-pass-october-kyogre-approved-v1.png`, 1122 × 1402, 2.848.940 bytes, SHA256 `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`, byte a byte igual à candidata v1. APPROVED/full_poster no master; entrada removida do preview. As 14 entradas anteriores permanecem idênticas, total 15. Nenhum arquivo anterior removido ou alterado; 192 blobs de assets/revisões/aprovações protegidos preservados na comparação completa de árvores.

Código: `ff37843208635a0923adc1996371aaacd2a430f6`, branch `spidey-fly-v1`; Vercel READY `dpl_3AtDzJtXDBQvJcgpwTtvQuw4pnHw`. Preview conferido internamente: https://spidey-pokemon-i6523e1iy-spidey3.vercel.app/spidey-app/index.html. Shell/master/preview/cache versionados; precache usa o caminho aprovado. Catálogo inteiro permaneceu byte a byte igual, 124 eventos; nenhum horário, bônus ou elegibilidade FLY foi alterado por esta aprovação.

33 testes passaram, sintaxe dos três scripts alterados passou e os 75 paths do cache existem. QA novo: diálogo do Passe GO pela Home em 390 × 850 Claro e 1280 × 850 Escuro, PNG inteiro em `contain`, foco Fechar, scrollTop 0 e sem overflow horizontal. Download real pelo navegador do arquivo servido no caminho premium: SHA256/bytes exatos da aprovação. Relatório `docs/qa/go-pass-approved-browser-ff37843-20261003.json` e dois JPEGs em `docs/qa/proofs/`. A captura visual pode coincidir com a candidata porque os pixels aprovados não mudaram; DOM/caminho e arquivo servido vinculam esta prova ao novo código. Teste responsivo não substitui Android físico.

Inventário pelo compositor real: 23 eventos entre 01 e 07/10, **10 APPROVED**, **0 candidatas** e **13 sem arquivo Home/FLY**. Registro `docs/qa/go-pass-approved-inventory-ff37843-20261003.json`. Elgyem e outros masters fora da janela não entram neste número.

Compartilhamento público continua **BLOCKED_USER_PHONE_LOGIN**, conforme prova do editor às 08:47 BRT. O acesso temporário usado apenas para QA do novo deployment não resolve nem comprova acesso dos testadores no celular; token efêmero não foi persistido. Proteção Vercel permaneceu ativa, e o login administrativo anterior não foi concluído; não repetir autenticação sem nova solicitação. Push/configuração/recebimento real, Android/PWA/atualização/offline e 13 artes restantes seguem pendentes. Applin/Espaço/Sizzlipede permanecem com recusas registradas. Sem promoção para main/produção, dispatch, mensagens externas ou alteração de segredo/configuração. Não regenerar nem reabrir a aprovação do Passe GO.


## Latios / Passe GO de setembro v1 — PENDING_REVIEW, 03/10

EventId `2026-09-go-pass`, arquivo `spidey-app/assets/events/review/go-pass-september-latios-v1.png`, 1122 × 1402, SHA256 `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`. Nova candidata completa gerada no padrão visual da marca, validada factualmente na fonte oficial e conferida em mobile/desktop `760b117`. **Aprovação humana ainda pendente**; não adicionar ao master nem inferir aprovação do “Ok / E agora?” ou de aprovações anteriores. Manifesto `docs/qa/LATIOS_REVIEW_20261003.json`; QA `docs/qa/latios-browser-760b117-20261003.json`.

15 entradas master/14 arquivos anteriores intactos, incluindo Kyogre aprovado; nenhuma revisão histórica foi sobrescrita. Inventário 01–07/10: 10 APPROVED, 1 candidata e 12 sem arquivo. O arquivo exato foi entregue por geração de imagem e oferecido integralmente para revisão.


## Latios / Passe GO de setembro v1 — APPROVED, 03/10 13:01 BRT

Decisão explícita **“Eu aprovo, com certeza”** sobre o PNG completo entregue na resposta anterior, candidata v1 para `2026-09-go-pass`. Registro `docs/qa/LATIOS_APPROVAL_20261003.json` vincula decisão/timestamp, hash da revisão histórica congelada, referências, fatos e cópia premium idêntica. Asset aprovado `spidey-app/assets/events/premium/go-pass-september-latios-approved-v1.png`, SHA256 `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`, 1122 × 1402. Status APPROVED/full_poster no master; preview removido somente deste ID. Nenhuma regeneração/revisão nova.

QA pós-aprovação `d14897b` passou: 33 testes, mobile Claro/desktop Escuro e PNG servido exato. Todos os 15 masters anteriores e todos os assets/registros históricos preservados; agora 16 entradas. Catálogo/fatos/FLY inalterados. Janela 01–07/10: 11 APPROVED e 12 sem arquivo. Lançamento e acesso público continuam pendentes.

## Domingo Pitoresco v2 para revisão — 03/10/2026

Domingo Pitoresco de 4/10: candidata v2 PENDING_REVIEW, revisão humana ainda pendente. QA PASSED_PREVIEW no código `14fa3ad`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido idêntico à candidata. 16 masters aprovados/15 arquivos preservados. Janela 01–07/10: 23 eventos, 11 APPROVED, 1 candidata e 11 sem arquivo Home/FLY. Fonte atual Leek Duck identificada como comunidade; bônus condicionados a Rotas/companheiro. Acesso público BLOCKED_USER_PHONE_LOGIN e Android/PWA/push pendentes. Registro: `docs/qa/SCENIC_SUNDAY_REVIEW_20261003.json`.

PNG integral `assets/events/review/scenic-sunday-20261004-v2.png`, 1122 × 1402, 2739274 bytes, SHA256 `0ecff3534586f2387869aaf343298dab7377c421c598e5591f2e27133f6ba977`. V1 preservada para histórico; ícone de rosto não validado substituído por presente via imagegen na v2. Eevee é ilustrativo, sem promessa de encontro destacado. A vigência nesta temporada vem do guia comunitário; anúncio oficial de junho confirma a mecânica da temporada anterior e não prova outubro isoladamente. Fonte/datas/bônus/observações enriquecidos somente para `2026-10-04-scenic-sunday`; outros 123 eventos e horários/calendário/coordenadas/GPX preservados.

Integração explícita PENDING_REVIEW/full_poster, resolver comum nos cinco papéis, sem inclusão no master ou concessão de `spidey-premium-v1`. Helper inteiro preservado; cache 77 paths e query de preview versionados. Home e detalhe renderizam a mesma candidata; Semana mostra o evento em linha textual de 4/10, sem miniatura de pôster observada. Não cria nova elegibilidade FLY. Provas e limites: `docs/qa/scenic-sunday-browser-14fa3ad-20261003.json`, auditoria `docs/qa/scenic-sunday-local-audit-20261003.json`. Sem promoção a main/produção ou alteração de proteção/push. Próximo: entregar PNG completo para decisão humana específica; depois artes restantes e frentes públicas/físicas pendentes.

## Domingo Pitoresco aprovado — 03/10/2026, 16:52 BRT

Domingo Pitoresco de 4/10 APPROVED pela decisão “Aprovo” de 03/10, 16:52:31 BRT. Cópia premium idêntica à candidata v2, sem regeneração. QA PASSED_PREVIEW no código `bfeeb24`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Master com 17 entradas; 16 anteriores/15 arquivos preservados. Janela 01–07/10: 23 eventos, 12 APPROVED, nenhuma candidata ativa e 11 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SCENIC_SUNDAY_APPROVAL_20261003.json`.

EventId `2026-10-04-scenic-sunday`; arquivo `assets/events/premium/scenic-sunday-20261004-approved-v1.png`, 1122 × 1402, 2.739.274 bytes, SHA256 `0ecff3534586f2387869aaf343298dab7377c421c598e5591f2e27133f6ba977`. Decisão corresponde ao PNG integral v2 mostrado no checkpoint `9671458`, código revisado `14fa3ad`. Registro de revisão permanece congelado, SHA256 `aff543fb8f435ffb6602efcfe4892e4a137c3d5f91b9eab50e3232ab4f3f0efd`; candidatas v1/v2 e demais revisões/aprovações preservadas. Somente uma entrada adicionada ao master, preview agora vazio; helper preservado, mesmo PNG nos cinco papéis e cache `spidey-app-20261003-scenic-approved-v1`, 77 paths.

Fonte atual continua comunitária (Leek Duck); condições de Rotas/companheiro explícitas, Eevee ilustrativo e nenhum multiplicador de doces inventado. Anúncio oficial de junho corrobora a mecânica da temporada anterior e não comprova sozinho outubro. Catálogo inteiro de 124 eventos inalterado na aprovação, SHA256 `90b3af70743455216a020e65df7dab4a0c7c461f22356f886ec04886cff479ef`; horários/calendário/coordenadas/GPX/elegibilidade FLY preservados. Domingo não ganha nova janela FLY.

Nova conferência Home → detalhe em mobile/desktop: pôster inteiro/contain, foco Fechar, scrollTop 0 e sem overflow horizontal; PNG servido byte a byte igual ao aprovado. Provas: `docs/qa/scenic-sunday-approved-browser-bfeeb24-20261003.json`, auditoria `docs/qa/scenic-sunday-approved-local-audit-20261003.json`. Semana: resolver conferido localmente; a linha textual de 4/10 foi observada no QA histórico da candidata, sem nova alegação visual de miniatura. O detalhe mantém o placeholder genérico de local.

Preview de QA verificado: https://spidey-pokemon-jtmdvu1t9-spidey3.vercel.app/spidey-app/index.html. Cookie temporário usado somente nesta conferência, sem validar acesso público de terceiros. Sem promoção a main/produção ou alteração de proteção/segredos/push. Próximo: cobertura das 11 artes restantes e resolução independente das pendências de acesso/Android.

## Terça de Vitrine — candidata v1 conferida em 03/10/2026

Terça de Vitrine de 6/10 v1 PENDING_REVIEW, aprovação humana ainda nula. QA PASSED_PREVIEW no código `dbf6956`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Todos os 17 masters/16 arquivos aprovados anteriores preservados, incluindo Domingo Pitoresco. Janela 01–07/10: 23 eventos, 12 APPROVED, 1 candidata e 10 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SHOWCASE_TUESDAY_REVIEW_20261003.json`.

EventId `2026-10-06-showcase-tuesday`; arquivo `spidey-app/assets/events/review/showcase-tuesday-20261006-v1.png`, 1122×1402, 2.636.843 bytes, SHA256 `ac11ef360b595bfad180c918d6c655c08863d7f01ff36dca4a667ad0e8334c19`. PNG integral novo, vinculado exclusivamente pelo preview/full_poster, sem adicioná-lo ao master ou conceder aprovação. As mensagens “Bora” de continuação não são decisão visual sobre esta nova peça. Candidata original e prompt exato preservados no registro de revisão.

Fatos: 6/10, 00h–23h59 locais; até cinco Vitrines de Poképarada para participar no dia e mais Poképaradas poderão ter Vitrines. Fonte atual comunitária Leek Duck; anúncio oficial de junho corrobora a mecânica anterior, não comprova sozinho a vigência em outubro. Snorlax ilustrativo; nenhuma espécie específica, recompensa, multiplicador ou chance de Brilhante prometida. Catálogo de 124 eventos: somente resumo/fonte/bônus/notas desta terça enriquecidos; os outros 123 eventos e todas as janelas/calendário/coordenadas/GPX/eligibilidade FLY preservados. SHA256 corrente `01b81b8daa9d8bc3aeda730aecb76c1884e6153bd021d6b9fc8e6ce4511827d9`. Nenhuma nova entrada FLY.

QA: Home → detalhe mobile Claro/desktop Escuro, pôster inteiro/contain, rodapé visível, foco Fechar, scrollTop 0, sem overflow horizontal. Download real do PNG servido idêntico à candidata. Provas/medidas: `docs/qa/showcase-tuesday-browser-dbf6956-20261003.json`; auditoria local: `docs/qa/showcase-tuesday-local-audit-20261003.json`. Semana: resolver conferido localmente, sem nova prova visual nesta rodada. Placeholder genérico de local conhecido permanece no detalhe. Cache `spidey-app-20261003-showcase-review-v1`, 78 paths.

Preview próprio conferido: https://spidey-pokemon-1bo7i1q0p-spidey3.vercel.app/spidey-app/index.html. Acesso temporário restrito à própria conferência; não comprova acesso público de testadores. Nenhuma alteração de main/produção, proteção, segredos ou push. Próximo: entregar o PNG integral e obter decisão humana específica sobre esta candidata; dez eventos continuam sem arte e as frentes de acesso/Android seguem pendentes. Registros e decisões visuais anteriores permanecem congelados.

## Terça de Vitrine aprovada — 03/10/2026, 20:56 BRT

Terça de Vitrine de 6/10 v1 APPROVED pela decisão “Aprovo” de 03/10, 20:56:01 BRT. Cópia premium idêntica à candidata, sem regeneração. QA PASSED_PREVIEW no código `c3bb225`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Master com 18 entradas; 17 anteriores/16 arquivos preservados. Janela 01–07/10: 23 eventos, 13 APPROVED, nenhuma candidata ativa e 10 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SHOWCASE_TUESDAY_APPROVAL_20261003.json`.

EventId `2026-10-06-showcase-tuesday`; asset `spidey-app/assets/events/premium/showcase-tuesday-20261006-approved-v1.png`, 1122×1402, 2.636.843 bytes, SHA256 `ac11ef360b595bfad180c918d6c655c08863d7f01ff36dca4a667ad0e8334c19`. Decisão corresponde ao PNG v1 integral reexibido diretamente no chat a partir do checkpoint `81b026d`, código conferido `dbf6956`. Registro de revisão congelado, SHA256 `e9ebc5bcccc4f314b0a14870d8f7b69766ea72ef89c2cab54df05760aa0237a0`. Candidata, prompt, fontes e registros visuais anteriores preservados. Somente esta entrada adicionada ao master; preview agora vazio e helper inalterado. Mesmo PNG nos cinco papéis; cache `spidey-app-20261003-showcase-approved-v1`, 78 paths.

Fonte atual continua comunitária (Leek Duck), com “até cinco Vitrines” e “mais Poképaradas poderão ter Vitrines”; Snorlax ilustrativo. Anúncio oficial da temporada anterior não comprova sozinho outubro. Aprovação preserva o catálogo inteiro de 124 eventos, SHA256 `01b81b8daa9d8bc3aeda730aecb76c1884e6153bd021d6b9fc8e6ce4511827d9`, horários/calendário/coordenadas/GPX/eligibilidade FLY. Nenhuma nova entrada FLY.

Nova conferência Home → detalhe no código aprovado: mobile Claro/desktop Escuro, PNG premium inteiro/contain e rodapé visível, foco Fechar, scrollTop 0, sem overflow horizontal; download real do PNG servido exato. Provas/DOM: `docs/qa/showcase-tuesday-approved-browser-c3bb225-20261003.json`; auditoria: `docs/qa/showcase-tuesday-approved-local-audit-20261003.json`. Semana: resolver aprovado conferido localmente, sem nova prova visual de miniatura nesta rodada. Placeholder genérico de local conhecido permanece. As cinco listas de aprovações posteriores nos testes históricos foram atualizadas para incluir a decisão terça; demais asserts preservados, 33 testes passaram.

Preview conferido: https://spidey-pokemon-4et5ix99r-spidey3.vercel.app/spidey-app/index.html. Cookie temporário usado somente na própria conferência, sem comprovar acesso público de terceiros. Sem promoção a main/produção, alteração de proteção/segredos/push ou novo desenvolvimento de Amigos/Chat. Próximo: cobertura dos dez eventos sem arte e resolução independente das pendências de acesso público/Android. Aprovação desta imagem não aprova o lançamento completo.

## Continuação das artes sem confirmação individual — 03/10/2026, 23:13 BRT

O responsável declarou: “As artes já estão todas saindo no padrão correto. Pode seguir sem minha aprovação.” Autorização explícita em `docs/qa/ART_CONTINUATION_AUTHORIZATION_20261003.json`, recebida às 23:13:44 BRT. A aprovação visual individual deixa de ser bloqueio para as próximas peças no padrão Premium já validado. O agente pode consolidar o PNG exato após revisão factual, visual e técnica, registrando `USER_DELEGATED_VISUAL_QA`; não apresentar essa decisão como uma aprovação humana individual de uma imagem ainda não mostrada.

Continuam obrigatórios fontes corretas, identificação de comunidade/oficial, padrão Premium, marca, texto legível, integridade/hash/eventId, prévia responsiva e preservação das artes anteriores. Se uma peça falhar, corrigir ou manter bloqueada; não promover fallback ou recusa de geração a Premium. As recusas anteriores de Applin, Espaço e Sizzlipede permanecem registradas. Esta autorização não modifica decisões passadas nem concede aprovação ao lançamento completo, proteção Vercel ou configuração push.

## Lote de sete artes com QA delegado — 04/10/2026

Sete novos pôsteres APPROVED por USER_DELEGATED_VISUAL_QA, sob a autorização explícita de 03/10 23:13 BRT para seguir sem confirmação individual. QA de artes PASSED_PREVIEW_ART_BATCH no código `e766dde`: 33 testes, sete peças abertas em mobile Claro 390×850 e desktop Escuro 1280×850, 14 capturas e sete PNGs servidos idênticos aos arquivos aprovados. Master com 25 entradas; todas as 18 entradas/17 arquivos anteriores preservados. Janela 01–07/10: 23 eventos, 20 APPROVED, 0 candidatas e 3 sem arte (Applin/Espaço/Sizzlipede, recusas anteriores mantidas). Público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registros: `docs/qa/REMAINING_ART_BATCH_20261003.json` e `docs/qa/remaining-art-batch-browser-e766dde-20261004.json`.

| eventId | Arquivo Premium | SHA256 |
|---|---|---|
| `2026-09-twilight-trails-season` | `assets/events/premium/twilight-trails-season-2026-approved-v1.png` | `5814ead04c51ae826f4ececeaa9bb74d00b510f7b53a4e01d426076aef74f657` |
| `2026-09-gbl-29-1006` | `assets/events/premium/gbl-20260929-1006-approved-v1.png` | `feb2ba30decb85082116b216ae7c8096950e015ded97434d3540c7517057cafb` |
| `2026-10-gbl-06-13` | `assets/events/premium/gbl-mega-20261006-13-approved-v1.png` | `16bd92ceae7a725965c1236b09583ec3be9fbcc41f284eab9e108555d02b71bd` |
| `2026-09-iit-delhi-rendezvous` | `assets/events/premium/iit-delhi-rendezvous-2026-approved-v1.png` | `f7432657d170f1fbfae39a60198bd26edfba030b3ab266d16b96c46b38e90848` |
| `2026-10-patterns-of-the-wild-indonesia` | `assets/events/premium/patterns-wild-indonesia-20261002-approved-v1.png` | `6c16bdcfaf7d56582f0c60bdb2da37f67ba175d588278713ae419f7decba62c8` |
| `2026-10-01-go-battle-thursday` | `assets/events/premium/go-battle-thursday-20261001-approved-v1.png` | `6e0b6477b336ddf827741986ed2f07df6d779436906beaeec27f80c496ca257e` |
| `2026-10-02-friendship-friday` | `assets/events/premium/friendship-friday-20261002-approved-v1.png` | `2254345286060be310fbee286d00c78ce317da26feec3c6767469d6bceedb31f` |

Fontes: seis peças verificadas em anúncios/temporada oficial de Pokémon GO; Sexta da Amizade usa o guia comunitário atual da Leek Duck, identificado como comunidade no pôster e no detalhe. Os prompts, referências, hashes e condições estão no registro do lote. Nenhuma aprovação humana individual fictícia foi atribuída.

Na rotação 29/9–6/10, 4× Poeira vale somente para vitórias na Mega Copa das Cores, excluindo fim de série. As Megaedições 6–13/10 usam 17h Brasília para a troca global. Quinta refere-se a 50 batalhas; Sexta mantém trocas presenciais e nível 31+ nos Doces GG. Indonésia conserva fuso de Jacarta como referência e chance de Fundo Especial, com camisa batik baseada na imagem oficial.

As 124 identidades/janelas/calendários/coords/GPX/notificações permanecem preservadas; 117 outros eventos inteiramente iguais. Nenhuma das sete peças adiciona elegibilidade à rota FLY. Resolver único fornece o mesmo PNG para thumb/card/weekly/hero/poster; Weekly validado localmente. Cache com 85 arquivos `spidey-app-20261004-remaining-approved-v1`, master query `20261004-master15`, preview vazio. Cinco expectativas de conjuntos de IDs nos testes históricos foram ampliadas, sem remover suas verificações de decisões/binários congelados. As datas originais dos anúncios foram preservadas para evitar deslocamento da aba Novidades.

Preview verificado: https://spidey-pokemon-hwhcvl3n1-spidey3.vercel.app/spidey-app/index.html. Deployment `dpl_FPMEiWuoeg1Vm1RSk55RsqFda5R6` READY, target null, código `e766dde20f5ec838f212de67e0584e75310509cf`. Acesso temporário próprio foi usado para QA; o link ainda não está confirmado como público para testadores. Android físico/instalação/atualização/offline/push permanecem pendentes. Produção não aprovada.

Limitações observadas no QA: detalhes ainda exibem o texto genérico de local quando locations[] está vazio. A agenda do calendário com cabeçalho 01/10 mostrou algumas linhas com início exibido 02/10 na sessão cloud; fronteiras de data precisam de verificação separada. O PASS desta rodada certifica as sete artes e seus arquivos, não o calendário inteiro ou lançamento público.
