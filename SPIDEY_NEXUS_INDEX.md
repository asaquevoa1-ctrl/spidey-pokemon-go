# SPIDEYNEXUS — ÍNDICE MESTRE DE CONTINUIDADE

Status: OBRIGATÓRIO
Data: 2026-10-04

Estado corrente — 04/10: Sete novos pôsteres APPROVED por USER_DELEGATED_VISUAL_QA, sob a autorização explícita de 03/10 23:13 BRT para seguir sem confirmação individual. QA de artes PASSED_PREVIEW_ART_BATCH no código `e766dde`: 33 testes, sete peças abertas em mobile Claro 390×850 e desktop Escuro 1280×850, 14 capturas e sete PNGs servidos idênticos aos arquivos aprovados. Master com 25 entradas; todas as 18 entradas/17 arquivos anteriores preservados. Janela 01–07/10: 23 eventos, 20 APPROVED, 0 candidatas e 3 sem arte (Applin/Espaço/Sizzlipede, recusas anteriores mantidas). Público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registros: `docs/qa/REMAINING_ART_BATCH_20261003.json` e `docs/qa/remaining-art-batch-browser-e766dde-20261004.json`.

## Função
Este índice existe para impedir perda de decisões entre chats, branches e versões.

A palavra-chave `SPIDEYNEXUS` significa: retomar o projeto pelo estado persistido no repositório, nunca reconstruir o projeto apenas de memória ou de conversa.

## Leitura obrigatória na retomada
Ao receber `SPIDEYNEXUS`, consultar nesta ordem:
1. `SPIDEY_NEXUS.md` — histórico/handoff técnico.
2. `SPIDEY_NEXUS_INDEX.md` — este índice e regra de continuidade.
3. `SPIDEY_APP_CONSTITUTION.md` — produto, UX, FLY, não regressão e decisões congeladas.
4. `SPIDEY_APPROVED_ARTS.md` — registro editorial canônico de artes aprovadas/revogadas/pendentes.
5. `SPIDEY_PREMIUM_STANDARD.md` — padrão visual Premium.
6. `SPIDEY_ART_SYSTEM.md` — resolução e uso de assets por contexto.
7. `SPIDEY_PUBLIC_RELEASE.md` — candidato público, prioridades, QA e bloqueios atuais.
8. `SPIDEY_PRODUCT_EXPERIENCE.md` e `SPIDEY_STAMPS_V2.md` — experiência e regras de Selos/Amigos.
9. Código e dados atuais da branch/main aplicável — verdade técnica da implementação.

## Regra de consolidação
Uma decisão relevante NÃO está consolidada apenas porque foi discutida em chat.

Para ser considerada permanente, deve ser persistida em documento canônico ou código/dado versionado e alcançável por este índice.

Registrar obrigatoriamente:
- objetivo e prioridade do produto;
- público-alvo e proposta de valor;
- UX aprovada;
- funcionalidades aprovadas/funcionais;
- regras editoriais;
- artes aprovadas e reprovadas;
- identidade visual;
- fontes e níveis de confiança;
- horários/fusos/coordenadas/GPX;
- FLY/Eventos pelo Mundo;
- arquitetura e autoridades de dados;
- automações;
- claro/escuro/sistema;
- decisões descartadas, para não serem reintroduzidas;
- estado real: APPROVED/FUNCIONA/PARCIAL/PENDENTE/REPROVADO/DESCARTADO;
- regressões conhecidas e bloqueios.

## Regra de não regressão documental
Antes de uma mudança importante:
1. verificar os documentos canônicos afetados;
2. preservar decisões aprovadas;
3. implementar/testar;
4. atualizar o documento canônico se houver nova decisão;
5. somente então considerar a mudança consolidada.

## Estado atual que não pode ser perdido
- APP é prioridade máxima; canal não é o produto principal.
- Público prioritário inclui jogadores FLY.
- FLY deve oferecer horário local + Brasília, sem coluna de Portugal, coordenadas copiáveis, rota mundial e GPX somente quando validado.
- Conversões de horário são dinâmicas pela data/timezone; horários históricos de 2023 não são fonte atual.
- Taipei/Taiwan é referência estratégica asiática no lugar de Singapura para a rota rápida.
- Artes Premium possuem autoridade única por eventId.
- Arte APPROVED não pode ser substituída por fallback/heurística/script concorrente.
- Xerneas possui referência aprovada conhecida; Yveltal/Dialga/Sableye vistos na preview não devem ser presumidos aprovados.
- Harvest Festival com Pumpkaboo protagonista teve aprovação revogada por erro factual; Applin deve ser tratado conforme dados oficiais e nova arte precisa de aprovação.
- Claro/escuro/sistema são requisitos permanentes.
- Preview + QA mobile + aprovação precedem main.
- Nenhuma versão nova pode regredir algo já aprovado.

## Regra das artes
O arquivo `SPIDEY_APPROVED_ARTS.md` é a autoridade editorial de aprovação visual. Se o binário exato ainda não estiver consolidado, usar `APPROVED_PENDING_ASSET`; nunca gerar substituto e chamá-lo de aprovado.

## Manutenção
Toda nova decisão estrutural deve atualizar o documento especializado correspondente. Se surgir um novo documento canônico, adicioná-lo à seção 'Leitura obrigatória na retomada' deste índice.
Último handoff: APROVAÇÃO XERNEAS — 01/10/2026 09:08 BRT no `SPIDEY_NEXUS.md`, branch `spidey-fly-v1`, continuidade de `f32ae6e`/`24add19`. Rotação Xerneas agora APPROVED por decisão explícita do editor; PNG íntegro consolidado no master, Hora de Reides separada e preservada. Vínculo auditável: `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`. Provas de renderização e confirmação pós-aprovação: `docs/qa/XERNEAS_ROTATION_20261001.md`. Próximo: cobertura das demais artes e QA Android/PWA/push da versão corrente; aprovação desta arte não aprova o lançamento completo.

QA pós-aprovação confirmado no código `641463d`, mobile/desktop, incluindo Semana e ação FLY da Hora de Reides. Inventário atual e prioridades para 02/10: `docs/qa/PUBLIC_ART_READINESS_20261001.md`; próximo Applin/A Invasão e Cinderace. Não voltar ao estado PENDING_REVIEW de Xerneas nem usar o AVIF histórico como asset ativo.

Continuação anterior (histórico): código `684d80e`, 01/10, Invasão/Cinderace corrigidos, PENDING_REVIEW, preview mobile/desktop e FLY de Cinderace conferidos. Relatório `docs/qa/PRIORITY_ART_20261001.md`, arquivos/hashes/prompts em `docs/qa/PRIORITY_ART_REVIEW_20261001.json`. Applin permanece sem arte nova por recusa da ferramenta; dados oficiais atualizados. Inventário corrente: 1 aprovado, 2 pôsteres em revisão, 1 recorte, 19 sem arquivo. Próximo: decisão editorial dessas duas peças, arte de Applin/cobertura restante e Android/PWA/push. Xerneas continua APPROVED. Sem promoção de produção.

Decisão anterior: APROVAÇÃO INVASÃO + CINDERACE — 01/10/2026 15:45 BRT. “Sim, aprovo” vinculado aos dois PNGs exatos mostrados no checkpoint `df9d050`, QA `684d80e`. Agora APPROVED no master, cópias premium byte a byte, candidatas/originais preservados; não reabrir revisão destas peças nem de Xerneas. Registro `docs/qa/PRIORITY_ART_APPROVAL_20261001.json`; QA pós-aprovação `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`. Inventário corrente 23 eventos: 3 aprovados, 1 recorte pendente, 19 sem arquivo Home/FLY. QA pós-aprovação concluído em `a242f88`, mobile/desktop/Semana/FLY de Cinderace, quatro provas e 14 testes. Preview https://spidey-pokemon-huc1kneau-spidey3.vercel.app/spidey-app/index.html. Próximo: continuar Applin/cobertura restante e Android/PWA/push. A aprovação não aprova produção.

Continuação corrente após `aaaedd1`: nova candidata Seedot, PENDING_REVIEW, pôster integral factual de 01/10 18–19h e 2× PE por captura, preservando master aprovado. Manifesto `docs/qa/NEXT_ART_REVIEW_20261001.json`, relatório `docs/qa/NEXT_ART_20261001.md`. Applin repetido com mesmo pedido novamente recusado; Semana do Espaço recusada, sem imagens. Dados de Espaço/fonte oficial/prazo pesquisa atualizados. QA desta rodada concluído no código `2ed7ef8`, provas em `docs/qa/NEXT_ART_20261001.md`; preview https://spidey-pokemon-1v45kgmxg-spidey3.vercel.app/spidey-app/index.html. Próximo: revisão humana do PNG Seedot exato; depois demais coberturas e Android/PWA/push. PENDING_REVIEW preservado, masters anteriores não reabertos.


## APROVAÇÃO SEEDOT — 01/10/2026, 19:07 BRT

Editor respondeu “Sim, aprovo” ao PNG exato de Seedot apresentado no checkpoint `8d5541e`/QA `2ed7ef8`. Hash `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`, 1121×1403, agora APPROVED exclusivamente para `2026-10-01-spotlight-seedot`. Cópia premium idêntica à candidata em `assets/events/premium/seedot-spotlight-approved-v1.png`; original/candidata e registros históricos preservados. Registro `docs/qa/SEEDOT_APPROVAL_20261001.json`, confirmação pós-aprovação em `docs/qa/SEEDOT_APPROVAL_20261001.md`.

Master soberano/full_poster, mesmos papéis de imagem, cache/shell versionados. Fonte Seedot permanece comunidade; nenhuma alteração factual nesta consolidação. Somente a entrada Seedot sai do preview; todas as entradas aprovadas anteriores preservadas. Inventário corrente 23 eventos: 4 APPROVED, 19 sem arquivo Home/FLY; Zorua pendente fora da janela. QA pós-aprovação concluído em `b310f5a`, provas em `docs/qa/SEEDOT_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push. Applin/Espaço recusados, sem novo arquivo. Nenhuma promoção a main/produção; aprovação não inclui lançamento completo.


Handoff pós-aprovação Seedot: código `b310f5a`, preview seguro https://spidey-pokemon-5uir2c532-spidey3.vercel.app/spidey-app/index.html, mobile/desktop/Semana/detalhe/FLY conferidos, 16 testes passaram e duas provas preservadas. Home passou a Xerneas após o encerramento local de Seedot às 19h; masters anteriores preservados. Relatório `docs/qa/SEEDOT_APPROVAL_20261001.md`. Brief factual da próxima peça `docs/qa/MEGA_VICTREEBEL_BRIEF_20261001.json` (comunidade, sem arte/sem aprovação) e roteiro de teste físico `docs/qa/PUBLIC_ANDROID_QA_20261001.md` preparados. Continuar nesta branch sem reiniciar; não reabrir Xerneas/Invasão/Cinderace/Seedot aprovados. Checkpoint documental posterior não altera o código conferido; nenhuma promoção a main/produção.


## Novidades de 01/10 e candidata Mega Victreebel — continuação de 887a2cd

Anúncios primários Minior e trio Dinamax coletados em main `6045937` e incorporados editorialmente ao catálogo único da branch, sem merge de main. Catálogo 121→124: três períodos de Minior, um anúncio agrupado em Novidades; mesmo ID do Dia Max de 24/10 atualizado para Uxie/Mesprit/Azelf, cinco estrelas, distribuição regional e bônus. Indonésia enriquecida na fonte primária. FLY indica Pokémon em 25/28 linhas, mantém 20/28 referências; três ilhas sem atribuição inferida. Detalhes/limites/fontes: `docs/qa/NEWS_UPDATE_20261001.md` e JSON homônimo.

Mega Victreebel candidata v2 PENDING_REVIEW, 1121×1403, hash `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`, `assets/events/review/mega-victreebel-rotation-v2.png`. Datas de comunidade e aparência primária; v1 preservada, torres Max removidas na v2. Registro exato/prompts `docs/qa/MEGA_VICTREEBEL_REVIEW_20261001.json`; master aprovado intacto. 21 testes Node e sintaxe de 19 scripts + SW passaram. QA de preview desta rodada pendente; não confundir com o QA Seedot anterior. Próximo: conferir mobile/desktop, depois decisão humana sobre PNG Mega Victreebel v2. Demais artes e Android/PWA/push continuam pendentes; nenhuma promoção de produção.


QA da rodada Novidades/Mega Victreebel concluído em `282ea97`, preview direto https://spidey-pokemon-8hxqv2mhj-spidey3.vercel.app/spidey-app/index.html. Mobile 390 Claro/desktop 1280 Escuro sem overflow; um anúncio Minior/três períodos, trio regional/detalhe/FLY 20/28 com seleção preservada; candidata Mega v2 inteira 1121×1403 em Home/Semana/detalhe. Cliques e clipboard Taipei exato comprovados no app direto desktop. 21 testes passaram; masters anteriores intactos. Quatro prints/observações/hashes em `docs/qa/NEWS_UPDATE_20261001.md` e `docs/qa/MEGA_VICTREEBEL_REVIEW_20261001.json`. Candidata v2 PENDING_REVIEW até decisão humana específica; 23 eventos de 01–07/10 agora 4 APPROVED + 1 pôster em revisão + 18 sem arquivo Home/FLY. Demais artes, Android/PWA/push e GPX continuam pendentes; coleta de notícias observada, ingestão do app foi editorial, sem nova prova automática. Nenhuma promoção a main/produção. Continuar da branch/checkpoint documental, preservando o código validado `282ea97`.


## Aprovação Mega Victreebel v2 — 01/10/2026, 22:09 BRT

Editor respondeu “Sim, aprovo” ao PNG v2 completo mostrado diretamente no chat após o reenvio da imagem. APPROVED exclusivamente para `2026-09-mega-victreebel-raids`; hash `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`, 1121×1403. Cópia byte a byte em `assets/events/premium/mega-victreebel-rotation-approved-v1.png`, sem regeneração. Vínculo da decisão/arquivo/eventId: `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json`. Datas permanecem identificadas como comunidade; aparência primária não é prova da rotação.

Somente Mega Victreebel sai do preview e entra no master; sete entradas anteriores, arquivos e históricos preservados. Shell/cache versionados. Inventário 01–07/10: 23 eventos, 5 APPROVED, 18 sem arquivo no compositor Home/FLY; Zorua pendente fora da janela. QA pós-aprovação confirmado no código `4b0f319`, Home/Semana/detalhe, mobile Claro 390×850 e desktop Escuro 1280×850; duas provas e observações no relatório `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push; Applin/Espaço seguem sem arquivo por recusas documentadas. Nenhuma promoção a main/produção.


### Handoff pós-aprovação Mega Victreebel

Código `4b0f319` conferido no preview https://spidey-pokemon-lf6sw9hcz-spidey3.vercel.app/spidey-app/index.html; duas provas preservadas, 21 testes e sintaxe dos 19 scripts + SW passaram. Home/Semana/detalhe usam PNG APPROVED idêntico ao recebido, mobile Claro/desktop Escuro sem overflow; clique no app direto confirmado. Detalhe no topo/Fechar acessível; masters anteriores e Novidades preservados. Registro completo `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json`, relatório MD homônimo e evidência DOM `docs/qa/mega-victreebel-approved-browser-4b0f319-20261001.json`.

Continuar nesta branch sem reiniciar nem reabrir as cinco peças aprovadas. Prioridades: Applin/Espaço bloqueados pela ferramenta, cobertura Yveltal/Hora de Reides/Mega Blastoise e demais eventos; roteiro físico Android/PWA/push e GPX continuam pendentes. Inventário 23 eventos, 5 APPROVED, 18 sem arquivo Home/FLY. Checkpoint posterior de documentos/provas preserva o código validado. Amigos/Chat posterior ao núcleo, sem promoção a main/produção.


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

## Retomada após limite de conversa — 02/10/2026

Código retomado e conferido: `18fba5b2269a9e74510d096a9d4e794107517aa4`, branch `spidey-fly-v1`. Deploy READY `dpl_Errd7CNihkycUzVQus3FZgJva3CW`; preview https://spidey-pokemon-gdp8kfe9l-spidey3.vercel.app/spidey-app/index.html. Conferência registrada em 2026-10-02T17:04:13.643Z. Decisão “Aprovo todas as três” de 07:16 BRT permanece válida; nenhuma nova aprovação foi solicitada ou inferida.

QA pós-aprovação dos três pôsteres concluído: mobile responsivo 390×850 Claro e desktop 1280×850 Escuro, PNGs integrais 1121×1403, caminhos premium corretos, foco Fechar/scrollTop 0 e sem overflow horizontal nas medidas observadas. Downloads reais das três imagens servidas têm SHA-256 e bytes idênticos ao registro aprovado. FLY da Hora de Reides fecha o diálogo, mantém eventId e imagem própria, 20 essenciais/28 completos; Taipei 07/10 07–08h e Pago Pago 08/10 02–03h Brasília. Clique calendário→Hora de Reides conferido também no app direto desktop. Xerneas aprovado observado na Home durante a retomada; não foi substituído.

Provas/limites: `docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.md`, JSON homônimo e `docs/qa/october-raids-approved-browser-18fba5b-20261002.json`; cinco screenshots dos pôsteres e uma do FLY preservadas. Screenshot desktop da Hora de Reides foi inspecionado, mas sua transferência falhou; não há arquivo dessa captura no checkpoint. 22 testes/sintaxe são os resultados anteriores do commit de aprovação, não uma execução nova nesta rodada. Mudanças desta rodada são exclusivamente documentos e provas; código, artes e catálogo permanecem iguais.

Próxima frente: cobertura das artes restantes e QA físico Android/PWA/atualização/offline/push, além da prova de download/XML GPX Japão. Último inventário 01–07/10 continua 23 eventos, 8 APPROVED e 15 sem arquivo Home/FLY; Applin/Espaço sem geração aceita. Home seis próximos/Semana 28/09–04/10 não contêm as peças de 07/10, sem prova nova dessas superfícies. Lançamento completo ainda não pronto; esta retomada não promove main/produção. Amigos/Chat posterior ao núcleo. Continuar da branch/NEXUS e preservar todas as aprovações já consolidadas.

## GPX, alertas e Zorua — continuação de 21a0c6e, 02/10/2026

Código `a2b56386e2eed9ba5cd173c7fb3590e8aa122f88` conferido no preview READY https://spidey-pokemon-cg9922frj-spidey3.vercel.app/spidey-app/index.html. 31 testes Node passaram, sintaxe de 25 scripts ativos/JSON e diff check passaram. Link GPX Japão agora é âncora nativa persistente, 17/17 pontos exatos; rota incompleta 0/5 permanece bloqueada. A captura do download expirou em duas tentativas e não retornou arquivo/XML: PENDING_DOWNLOAD_PROOF. GPXs antigos encontrados foram excluídos da prova; downloadMedia da imagem também expirou.

Push deixou de retornar 404: raiz API/rewrites/dependência implantadas. GET public-key respondeu HTTP 503 `push_not_configured`, no-store; configuração de produção incompleta. Clique real mostrou “Notificações indisponíveis no momento.” e botão reabilitado. Fluxo só declara ativo após cadastro remoto, sem toast/notificação de boas-vindas enganosa. Nenhuma configuração secreta, inscrição ou envio push alterado. SW atualiza apenas caches Spidey, mantém escrita viva, ignora API e resolve destino na pasta do app; offline validado por testes, sem nova prova física.

Zorua candidato PENDING_REVIEW/full_poster: `assets/events/review/zorua-community-day-correction-v1.png`, 1121×1403, SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`. Original preservado; fatos primários corrigidos para 10/10 14–17h locais, 3× PE, 2× Doces, Soco Enganador ao evoluir até 21h. QA real calendário→detalhe no app direto, mobile responsivo 390 Claro e desktop 1280 Escuro, pôster inteiro/fonte visível/object-fit contain, sem overflow observado e scrollTop 0; mobile focou Fechar. FLY seleciona mesmo eventId e PNG, fecha detalhe, 20/28 locais. Brasília: Kiritimati 09/10 21h→10/10 00h; Taipei 10/10 03–06h; Pago Pago 10/10 22h→11/10 01h, conferidos com IANA. Quatro screenshots e DOM preservados. Home/Semana atual não incluem Zorua de 10/10; bytes servidos não capturados, sem hash servido comprovado.

Relatório `docs/qa/DOWNLOAD_PUSH_ZORUA_QA_20261002.json` e MD homônimo; manifesto exato/prompts `docs/qa/ZORUA_REVIEW_20261002.json`. Sizzlipede foi recusado na saída pela ferramenta, request `b4adb8ce-c10c-4fbd-a61a-52e9b82ddf09`, sem arquivo; não contornar. Applin/Espaço seguem bloqueados. Próximo: decisão humana sobre este PNG Zorua exato, configuração/recebimento real de alertas, captura GPX e Android físico/instalação/atualização/offline. Inventário anterior 01–07/10 permanece 23 eventos, 8 aprovados, 15 sem arquivo Home/FLY; Zorua fora dessa janela. Sem promoção a main/produção. Checkpoint documental posterior preserva o código `a2b5638` e todas as aprovações anteriores; continuar sem reiniciar.

## Zorua aprovado e pausa solicitada — 02/10/2026, 18:38:35 BRT

Editor aprovou explicitamente o PNG completo: “Eu adorei a imagem, com certeza eu aprovo.” SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`, 1121×1403. Cópia byte a byte em `assets/events/premium/zorua-community-day-approved-v1.png`, candidata/original preservados, 11 masters anteriores intactos; Zorua sai do preview e integra o master APPROVED/full_poster. Registro `docs/qa/ZORUA_APPROVAL_20261002.json`. Bônus do pôster rechecados na fonte primária: 3× PE e 2× Doces por captura, 10/10 14–17h locais; Soco Enganador ao evoluir durante o evento ou até quatro horas depois, prazo 21h. Bônus adicionais oficiais incorporados ao mesmo eventId, sem modificar as janelas. FLY já conferido no código a2b5638: 20 essenciais/28 completos, horários local/Brasília, coordenadas e mesmo pôster. QA do novo preview pós-aprovação PENDING_NEW_PREVIEW até prova específica; não atribuir QA antigo ao código novo.

Editor pediu processamento por até cinco minutos e então pausa, por viagem/possível perda de sinal. Encerrar a rodada com checkpoint e pausar; próxima retomada somente quando ele acionar. Captura/XML do GPX, configuração/recebimento de alertas e Android físico continuam pendentes; demais artes/recusas inalterados. Sem promoção a main/produção, nenhuma publicação/mensagem externa. Não reabrir a aprovação do Zorua nem regenerar a peça.


Pausa consolidada ao fim desta rodada: 31 testes passaram após consolidação, cópia exata e 11 entradas anteriores preservadas. QA pós-aprovação no novo preview ainda pendente. Retomar da branch/checkpoint corrente quando Anderson acionar; não processar em segundo plano durante a pausa.

## Retomada com sinal — Zorua aprovado e GPX verificados, 02/10/2026

Editor retornou às 20:49:18 BRT: “Opa / Voltei, temos sinal”. Pausa anterior encerrada por esse acionamento. Código conferido `0433c322c43839f13a36996d52e511475c8739ae`, branch `spidey-fly-v1`, deploy READY `dpl_8EsSkfWnfXqbB9rLNPTHUfXfEJpB`; preview https://spidey-pokemon-bwb814dm8-spidey3.vercel.app/spidey-app/index.html. QA registrado em 2026-10-03T00:03:06.669Z; 02/10 em Brasília, 03/10 em UTC. Esta rodada altera apenas documentos/provas, preservando código, catálogo, binários e todas as aprovações.

Zorua: QA pós-aprovação PASSED_PREVIEW no novo deploy. Calendário → 10/10 → detalhe no app direto; mobile responsivo 390×850 Claro e desktop 1280×850 Escuro. PNG premium aprovado 1121×1403 inteiro, object-fit contain, foco Fechar e scrollTop 0, sem overflow horizontal nas medidas observadas. Download real da imagem servida: 2.299.199 bytes e SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`, idênticos à aprovação de 18:38:35 BRT. Bônus oficiais novamente conferidos e presentes no detalhe/FLY. FLY seleciona `2026-10-zorua-community-day`, fecha diálogo, usa o mesmo PNG, 20 essenciais e 28 hotspots, coordenadas e relógios local/Brasília. Referências: Kiritimati 09/10 21h→10/10 00h; Taipei 10/10 03–06h; Pago Pago 10/10 22h→11/10 01h Brasília. Home seis próximos/Semana 28/09–04/10 não incluem Zorua de 10/10, sem nova prova dessas superfícies.

GPX Japão: PASSED_DOWNLOADED_XML. Clique no link nativo “Baixar GPX completo” criou arquivo novo às 23:58:30.916905Z. A espera de evento do navegador expirou, mas o download real foi recuperado pela pasta compartilhada, sem usar os três arquivos antigos. XML GPX 1.1 válido, 17 waypoints, nomes/latitudes/longitudes/ordem idênticos ao catálogo do commit; 1.890 bytes, SHA256 `8870435145133c11894b923dad8dead2bff056e78a7c79104346fb1e7e12382a`. Prova e arquivo: `docs/qa/japan-rally-browser-download-0433c32-20261002.json` e GPX homônimo. Coordenadas comunitárias exatas do catálogo não são promovidas a fonte oficial. PokéXciting 0/5 continua sem link GPX completo. Isso encerra a pendência de captura/XML no navegador; teste físico Android permanece pendente.

Relatório `docs/qa/ZORUA_APPROVAL_20261002.md`, registro canônico JSON homônimo, DOM `docs/qa/zorua-approved-browser-0433c32-20261002.json` e cinco screenshots preservados. 31 testes/sintaxe são resultados anteriores válidos da consolidação `0433c32`; não foram executados novamente nesta rodada sem alteração de código. Logs consultados registraram erros da extensão de metadados do navegador, sem erro do app no lote retornado; não confundir isso com prova de ausência de erros fora desse lote.

Push: novo endpoint do preview respondeu HTTP 503 `push_not_configured`, Cache-Control no-store. Configuração do servidor e recebimento real permanecem bloqueios; nenhuma inscrição/configuração secreta/envio foi alterado. Android físico/instalação/atualização/offline continuam pendentes. Último inventário 01–07/10: 23 eventos, 8 APPROVED, 15 sem arquivo Home/FLY; Zorua fora da janela. Applin/Espaço/Sizzlipede continuam com recusas registradas. Lançamento completo/produção não aprovados; sem promoção a main e sem mensagens externas. Próxima frente: cobertura restante, configuração push e QA físico. Não reabrir a aprovação nem regenerar Zorua.


## Duas novas candidatas conferidas — 03/10/2026

Thundurus Sombroso v1 (`2026-10-shadow-thundurus`) e Elgyem v2 (`2026-10-08-spotlight-elgyem`) estão **PENDING_REVIEW**, aprovação null. Código `a17f6d45535758ff2b5a36ef0e4e6e476af933e8`, deploy READY `dpl_57gGY2xz7ksHTXjZzQSPtudp2V2g`, preview https://spidey-pokemon-ko9ywdo8h-spidey3.vercel.app/spidey-app/index.html. Registro completo/prompts/hashes: `docs/qa/THUNDURUS_ELGYEM_REVIEW_20261002.json`; QA e seis provas: `docs/qa/THUNDURUS_ELGYEM_QA_20261002.json`. Elgyem v1 sem nome permanece só no histórico. Os 12 masters e todos os IDs/horários foram preservados.

Próximo: decisão humana específica sobre os dois PNGs completos mostrados no chat. Elgyem integra FLY 20/28, relógios local/Brasília e coordenadas; Thundurus aparece na Home/Semana e não recebe janela global inventada. Janela 01–07/10: 23 eventos, 8 APPROVED, 1 em revisão, 14 sem arquivo Home/FLY. Push continua 503 e o painel bloqueia a inspeção de variáveis por login; Android físico pendente. Nenhuma promoção main/produção nem envio externo. Detalhes no último handoff de `SPIDEY_NEXUS.md`.

## Handoff corrente — Thundurus e Elgyem aprovados, 03/10/2026

Decisão explícita de 07:30:21 BRT ligada aos dois PNGs exatos, Thundurus v1 e Elgyem v2. Registro `docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json`; QA pós-aprovação PASSED_PREVIEW no código `29c1aecf53742de581ea0fc036793d91a859bc60`, 32 testes e cinco provas em `docs/qa/thundurus-elgyem-approved-browser-29c1aec-20261003.json`. Prévia: https://spidey-pokemon-7whircohq-spidey3.vercel.app/spidey-app/index.html. Master 14 entradas; 12 anteriores, candidatas e catálogo preservados. Nenhuma candidata ativa. Janela 01–07/10: 23 eventos, 9 APPROVED, 0 pendentes, 14 sem arquivo Home/FLY; Elgyem aprovado fora da janela.

FLY Elgyem usa PNG aprovado, 20/28 locais, horas locais/Brasília e coordenadas conferidos; Thundurus aprovado confirmado no detalhe/Home e asset da Semana. Cobertura restante, acesso/configuração push e Android físico são a próxima frente. Sem main/produção, disparo ou pausa ativa. Não pedir novamente a aprovação já concedida. Último handoff de `SPIDEY_NEXUS.md` contém limites e provas; checkpoint posterior altera somente documentação.


## Handoff — 03/10/2026 — Passe GO em revisão e acesso de testadores

Código de interface: `97c6823f1efb180782550ef22bf660416a1aebdc`, branch `spidey-fly-v1`. Preview conferido: https://spidey-pokemon-9oklrwpv9-spidey3.vercel.app/spidey-app/index.html.

Passe GO/Kyogre v1 está **PENDING_REVIEW**; aprovação humana segue nula. Fonte primária PT-BR rechecada: https://pokemongo.com/pt-BR/news/go-pass-october-2026. Texto distingue o Globo da Sorte pago (Deluxe) e 2× duração do Incenso de Aventura Diário ao atingir o Ranque 50. Datas 06/10 10h–03/11 10h locais preservadas. Não foi criada uma janela FLY para este passe de progressão. Os outros 123 eventos e todos os horários do catálogo permanecem iguais ao código anterior.

33 testes passaram antes da publicação do código. Novo preview READY conferido visualmente em 390 × 850 Claro e 1280 × 850 Escuro: arquivo íntegro, `contain`, sem overflow horizontal no diálogo; SHA256 servido igual ao candidato. Evidências: `docs/qa/GO_PASS_REVIEW_20261003.json`, `docs/qa/go-pass-browser-97c6823-20261003.json` e respectivos JPEGs em `docs/qa/proofs/`. Aprovações anteriores não foram alteradas.

A URL normal solicita conta Vercel. Um link temporário nativo com `_vercel_share` abriu a interface e o PNG em cliente sem autenticação e com cookies inicialmente vazios (HTTP 200). Compartilhar o link completo emitido, sem copiar o endereço pós-redirecionamento da barra. Expiração nativa informada: 10/4/2026, 10:30:31 AM; prazo do recurso: 23h. Token efêmero omitido do repositório. Proteções do projeto não foram alteradas; não há URL pública permanente nova.

Inventário recalculado pelo compositor real: 23 eventos na janela 01–07/10, 9 APPROVED, 1 PENDING_REVIEW e 13 sem arquivo. São **14 ainda sem conclusão/aprovação**, sendo a candidata do Passe GO já gerada. Master: 14 entradas, intacto. As recusas Applin/Espaço/Sizzlipede continuam registradas, sem novas tentativas de contorno.

Núcleo apto a teste: eventos, FLY/horários/fusos/coordenadas, Selos e GPX confirmado. Ainda pendentes: configuração/recebimento real de alertas, Android físico/instalação PWA/atualização/offline, demais artes e validação final. Amigos/Chat permanece depois do núcleo. Sem promoção para main/produção, configuração push ou dispatch. Próximo passo editorial: decisão do editor sobre o PNG exato do Passe GO; preservar todos os masters.

## Correção de continuidade — 03/10/2026 — compartilhamento bloqueado no celular

Às 08:47:23 BRT, o editor informou que o link completo continuava exigindo acesso e enviou foto de tela de login do Vercel. O teste HTTP anônimo anteriormente registrado permanece uma evidência restrita àquele cliente; não comprovou acesso real dos testadores no celular. **Compartilhamento externo: BLOCKED_USER_PHONE_LOGIN**, sem solução confirmada. Não reapresentar o link efêmero anterior como acesso público garantido.

Consulta conectada confirmou `ssoProtection.enabled=true`, `deploymentType=all_except_custom_domains` e senha desabilitada. O conector disponível não modifica a permissão de Share. Abertura do painel redirecionou para login; o formulário seguro retornou `declined`. Nenhuma proteção, segredo, deploy de produção ou permissão foi modificada. Acesso administrativo necessário para ajustar Share da prévia segue não concluído. Não reiniciar a autenticação sem nova solicitação do editor.

Às 08:48:33 BRT, o editor informou que o Passe GO/Kyogre não chegou para avaliação. Foi disponibilizado no chat o PNG integral já existente e um link para o original, conferido byte a byte pelo SHA256 `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`. O print anterior da interface não constitui recebimento confirmado nem aprovação. **Passe GO v1 continua PENDING_REVIEW; approval=null.** Aguardar decisão específica; não gerar outra versão nem promover esta por inferência.

Arte e QA responsivo continuam no código `97c6823`, 33 testes passados; masters 14 APPROVED, janela 01–07/10 com 9 APPROVED, 1 candidata e 13 sem arquivo. Estes fatos não equivalem à liberação para testadores, nem a Android físico ou lançamento aprovado.

## Passe GO/Kyogre v1 APPROVED — 03/10/2026, 09:04:55 BRT

Decisão explícita “Fantástico / Eu aprovo” após entrega do PNG integral no chat e link para o original. Registro canônico: `docs/qa/GO_PASS_APPROVAL_20261003.json`. A aprovação encerra a pendência de entrega/revisão para este PNG exato; o registro pré-aprovação JSON permanece histórico e íntegro.

Evento `2026-10-go-pass`: cópia final `assets/events/premium/go-pass-october-kyogre-approved-v1.png`, 1122 × 1402, 2.848.940 bytes, SHA256 `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`, byte a byte igual à candidata v1. APPROVED/full_poster no master; entrada removida do preview. As 14 entradas anteriores permanecem idênticas, total 15. Nenhum arquivo anterior removido ou alterado; 192 blobs de assets/revisões/aprovações protegidos preservados na comparação completa de árvores.

Código: `ff37843208635a0923adc1996371aaacd2a430f6`, branch `spidey-fly-v1`; Vercel READY `dpl_3AtDzJtXDBQvJcgpwTtvQuw4pnHw`. Preview conferido internamente: https://spidey-pokemon-i6523e1iy-spidey3.vercel.app/spidey-app/index.html. Shell/master/preview/cache versionados; precache usa o caminho aprovado. Catálogo inteiro permaneceu byte a byte igual, 124 eventos; nenhum horário, bônus ou elegibilidade FLY foi alterado por esta aprovação.

33 testes passaram, sintaxe dos três scripts alterados passou e os 75 paths do cache existem. QA novo: diálogo do Passe GO pela Home em 390 × 850 Claro e 1280 × 850 Escuro, PNG inteiro em `contain`, foco Fechar, scrollTop 0 e sem overflow horizontal. Download real pelo navegador do arquivo servido no caminho premium: SHA256/bytes exatos da aprovação. Relatório `docs/qa/go-pass-approved-browser-ff37843-20261003.json` e dois JPEGs em `docs/qa/proofs/`. A captura visual pode coincidir com a candidata porque os pixels aprovados não mudaram; DOM/caminho e arquivo servido vinculam esta prova ao novo código. Teste responsivo não substitui Android físico.

Inventário pelo compositor real: 23 eventos entre 01 e 07/10, **10 APPROVED**, **0 candidatas** e **13 sem arquivo Home/FLY**. Registro `docs/qa/go-pass-approved-inventory-ff37843-20261003.json`. Elgyem e outros masters fora da janela não entram neste número.

Compartilhamento público continua **BLOCKED_USER_PHONE_LOGIN**, conforme prova do editor às 08:47 BRT. O acesso temporário usado apenas para QA do novo deployment não resolve nem comprova acesso dos testadores no celular; token efêmero não foi persistido. Proteção Vercel permaneceu ativa, e o login administrativo anterior não foi concluído; não repetir autenticação sem nova solicitação. Push/configuração/recebimento real, Android/PWA/atualização/offline e 13 artes restantes seguem pendentes. Applin/Espaço/Sizzlipede permanecem com recusas registradas. Sem promoção para main/produção, dispatch, mensagens externas ou alteração de segredo/configuração. Não regenerar nem reabrir a aprovação do Passe GO.


## Retomada corrente — Latios, 03/10/2026

Candidata v1 PENDING_REVIEW e aprovação humana ainda pendente. QA novo `760b117`, relatório `docs/qa/latios-browser-760b117-20261003.json`; fonte/fatos/prompt/referências/hashes em `docs/qa/LATIOS_REVIEW_20261003.json`. Inventário `docs/qa/latios-inventory-760b117-20261003.json`. Mesma peça em todos os papéis via resolver de preview; não é master aprovado e não cria janela FLY. Publicação restrita à branch `spidey-fly-v1`; acesso dos testadores continua bloqueado. Não repetir login administrativo recusado sem nova solicitação nem substituir qualquer master.


## Aprovação corrente — Latios, 03/10 13:01 BRT

A decisão humana está consolidada no master e em `docs/qa/LATIOS_APPROVAL_20261003.json`; revisão original congelada pelo SHA256. Pós-aprovação conferida no código `d14897b`, mesmo PNG inteiro em mobile/desktop e hash servido exato. Inventário `docs/qa/latios-approved-inventory-d14897b-20261003.json`: 11 APPROVED/0 candidatas/12 sem arquivo na janela 01–07/10. Preservar todos os 16 masters, incluindo Kyogre, e não regenerar/reabrir esta aprovação. Acesso dos testadores continua bloqueado; main/produção/configuração/push sem alteração.

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
