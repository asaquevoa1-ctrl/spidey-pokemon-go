# Spidey — candidato público para 02/10/2026

Estado atual: Zorua APPROVED e QA pós-aprovação PASSED_PREVIEW; GPX Japão baixado e XML/17 pontos validados. Cobertura restante, push/configuração e Android físico pendentes; lançamento público não concluído.
Branch: `spidey-fly-v1`. Código conferido: `0433c322c43839f13a36996d52e511475c8739ae`. Preview: https://spidey-pokemon-bwb814dm8-spidey3.vercel.app/spidey-app/index.html. Registros abaixo são históricos; consultar a última seção para o estado corrente.

## Escopo e ordem do trabalho
1. Estabilidade e não regressão.
2. FLY funcional, integrado ao catálogo existente.
3. Spidey Command Center, identidade oficial e temas.
4. Selos.
5. Novidades.
6. Amigos/Chat depois do núcleo público estabilizado.

Este documento não substitui Constituição, registro de artes nem regras de precisão. Sexta-feira da solicitação: 02/10/2026 (America/Sao_Paulo).

## Implementado no candidato
- Cálculo único de janelas por data real + timezone IANA, compartilhado por FLY e detalhes.
- Linha do tempo cronológica, Agora/Próximo/Futuro/Encerrado/Última Chance e contagem regressiva.
- Seleção de evento; 20 pontos essenciais e base consolidada de 28 referências (preserva ambas as bases anteriores).
- Taipei nos essenciais. Horário local + Brasília; mudança de data explícita.
- Copiar coordenada e abrir mapa; nenhuma referência geográfica é promovida a PokéStop/GPX.
- Entrada FLY nos cards elegíveis e detalhe, atalhos na Home.
- Command Center: navegação lateral desktop, seis guias acessíveis no mobile, logo original e temas preservados.
- Novidades: eventos vigentes/futuros do catálogo com detalhes, fonte e distinção oficial/secundária/datamine. Ainda não é um feed externo independente de notícias.
- Selos: progresso local, restante/filtro, ordem da rota e GPX completo apenas para set integralmente confirmado; indicador de GPX agora conta rallies, não Stops.
- Catálogo de aprovação visual exclusivo com hashes, Xerneas e Festival das Luzes preservados. Harvest revogado permanece fora.
- Service worker com versão nova, arquivos novos no cache e fallback offline que ignora query de versão.

## Validação automatizada
- `node --test tests/fly-core.test.cjs`: 5 testes passados.
- `python -m unittest test_spidey_geo test_world_event_times test_spidey_approval test_editorial_state test_pipeline_stability`: 28 testes passados.
- Sintaxe dos 22 scripts do shell ativo: passou.
- Cache: todos os arquivos locais listados existem.
- Hashes das artes aprovadas: passaram; binários não foram editados.
- Não foram alterados monitores, filas, cursores nem workflows de publicação existentes.

## QA real de preview
Registrar abaixo apenas o que foi observado no navegador; build READY não é aprovação.
A página `spidey-app/qa-responsive.html` permite carregar o app real em iframes de 390 e 1280 pixels. Isto valida viewport/CSS responsivo, não substitui teste em Android físico ou instalação PWA.

### Evidência de 01/10/2026
- Código validado: `8fac1edb4a24c2474d89e8c9e311892153ed6c87` na branch `spidey-fly-v1`.
- Vercel READY: https://spidey-pokemon-2h77ya50c-spidey3.vercel.app/spidey-app/
- Desktop no navegador e iframe de 1280 × 850; mobile em iframe de 390 × 850. Home, FLY, Selos e Novidades inspecionados visualmente. As seis guias cabem no mobile.
- Tema claro e escuro aplicados; navegação lateral desktop e inferior mobile preservadas.
- FLY inicial selecionou a janela vigente de Xerneas. Ao selecionar Seedot, primeiro início em Kiritimati 01/10 01:00 Brasília e última janela em Pago Pago até 02/10 03:00. Alternância Essentials/Todos mostrou 20/28 locais. Taipei preservada.
- Selos: indicador 2 rallies / 22 Stops / 1 GPX pronto. Em rodada anterior desta mesma série, marcar/desmarcar Japão, próxima Stop, cópia de restantes com toast e persistência após recarga foram observados. PokéXciting sem Stops exatas ficou bloqueado para GPX.
- Novidades mostrou fonte oficial e secundária separadas, com links originais.
- Scripts legados receberam escritas idempotentes de textos/hidden para evitar mutações recorrentes. Navegação por cliques observada após correção.
- Log recente consultado mostrou erros da extensão do navegador, sem erro do app nessa amostra. Isto não prova ausência de todos os erros.
- Não foi conferido o conteúdo do clipboard nem o arquivo GPX baixado no navegador; não alegar essas provas.
- Android físico, PWA instalada, push, upgrade real do service worker e aprovação humana continuam pendentes.

## Pendências para lançamento
- Aprovação visual da preview pelo editor, após QA mobile/desktop.
- Recuperar binários exatos de `APPROVED_PENDING_ASSET`; não gerar substitutos e declará-los aprovados.
- Cobertura Premium de todos os eventos continua pendente. Visuais automáticos existentes são contingência e não Premium aprovado.
- Completar prova em Android físico/PWA instalada, atualização de cache e notificações de produção.
- Amigos/Chat: NÃO IMPLEMENTADO. Especificação de produto básica existe em `SPIDEY_PRODUCT_EXPERIENCE.md`; falta backend de identidade pseudônima, conexão bilateral, mensagens persistentes, bloqueio/denúncia e limites de abuso. Não simular chat público com armazenamento apenas local.
- SPS live bridge e notificações automáticas mantêm os estados prévios, sem alegação nova de funcionamento.

## Regra de promoção
Preview revisável -> QA -> aprovação visual humana -> main/produção.
Não promover apenas porque a Vercel mostra READY. Não abrir custos/dependências pagas.


## Revisão solicitada pelo editor — 01/10/2026 pela manhã
Prioridade explícita: artes e arquitetura de app (evitar PowerPoint corporativo), detalhes específicos no FLY, linguagem para o jogador, entrega de núcleo público em 02/10. Amigos/Chat depois.

- Nova Home substitui a exibição de cabeçalhos/card grids/rails duplicados por destaque do dia e listas de eventos. Calendário, Selos, Semana e Mapa preservados.
- Componente compartilhado mostra resumo, todos os bônus, Pokémon, observações, horários e link da fonte no FLY e no destaque. Não cria catálogo concorrente.
- Rota não mostra timezone IANA; aproximação explicada como “Local aproximado”.
- 11 originais recuperados e persistidos; conflitos factuais estão no registro de artes. Três ilustrações em recorte CSS no preview, sem conceder aprovação visual. Poster integral corrigido continua pendente.
- Referências pesquisadas: Campfire (https://campfire.scopely.com/en/), Leek Duck (https://leekduck.com/events/), PoGO Calendar (https://www.pogocalendar.com/). Direção aplicada: acesso operacional, imagem contextual e listas compactas; nenhuma cópia da identidade desses produtos.
- Prova factual Seedot: https://pokemongohub.net/post/event/seedot-spotlight-hour-october-2026-last-minute-guide/ — 01/10, 18–19h local, 2× PE por captura. Continua identificada como fonte da comunidade.
- Antes de considerar lançamento: QA da nova composição e aprovação humana; não tratar o QA da composição anterior como suficiente para esta mudança.


### Evidência da revisão visual — 01/10/2026 07h (Brasília)
Código observado: `d7028d672abff8995f4b55e64157ab3d8f5d54f9`.
Preview: https://spidey-pokemon-mp4065t8f-spidey3.vercel.app/spidey-app/
- Home: destaque Seedot com ilustração original recuperada (recorte da cena), 01/10 18–19h local e 2× PE. Lists de Agora e Próximos substituem cards/rails antigos duplicados. Calendário permanece disponível.
- Viewports reais do iframe: 390 × 850 e 1280 × 850; temas claro e escuro aplicados. Navegação de seis guias acessível no mobile. Android físico não foi testado.
- Home -> FLY preservou a seleção Seedot. Painel compacto mostrou arte, horário, bônus e fonte da comunidade. Agora Japão/Osaka e próxima Taipei correspondem ao relógio observado. Essenciais 20 / Todos 28.
- Detalhe Xerneas: src observado `assets/events/premium/xerneas-premium-approved-v1.avif?v=458dab7343a1`; original preservado, não substituído pelo poster recuperado com datas antigas.
- Selos: 2 rallies, 22 Stops, 1 GPX pronto. Novidades continua diferenciando fontes. Nesta rodada não repetir como novo teste a persistência/GPX feita na rodada anterior.
- 8 testes Node e 28 Python passaram. Teste novo cobre campos específicos do evento, conversão de evento regional de vários dias e precedência do aprovado sobre preview.
- Evidência visual: `docs/qa/home-mobile-20261001.jpg`.
- Limites: não cobre todos os eventos com artes finais, não cria novos bônus ausentes das fontes, não implementa Amigos/Chat. Recuperação concluiu transporte dos originais, não concluiu a correção factual de seus posters. Não promover a produção como se essas pendências estivessem resolvidas.

## Correção de QA — Xerneas vazio, 01/10/2026
Os prints do editor e a reprodução no preview revelaram que a imagem vinculada não era visível. A validação anterior de URL/dimensões não comprovou renderização; a declaração de preservação visual deve ser lida com esta correção. O AVIF aprovado é truncado: 15.008 bytes presentes; caixa mdat termina no byte 54.559. FFmpeg e libavif falham ao decodificar. Original e SHA permanecem intactos; aprovação editorial não é revogada. Disponibilidade de renderização bloqueada até recuperar o binário completo exato (APPROVED_PENDING_ASSET operacional). Não usar o Xerneas recuperado de 14–26/10 nem Elite Raids de 18/10 como substituto. Candidato remove o espaço vazio e exibe aviso curto no detalhe; Home não cria miniatura vazia nem usa arte concorrente. Isto é contenção da falha, não cobertura artística concluída, e continua sendo bloqueio da entrega visual. Produção não promovida.

## Correção de rotação Xerneas — candidato 01/10/2026
Ferramenta de imagens voltou a permitir edição. Candidato `assets/events/review/xerneas-rotation-correction-v1.png`, SHA256 `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`, 1121×1403, gerado a partir do original reenviado `1000431444.png`. Data 30/09–06/10; painéis de bônus sem confirmação e horários retirados. PENDING_REVIEW: não declarado aprovado. Master AVIF e originais preservados. `preview-art.js` autoriza explicitamente este candidato apenas para os dois IDs da rotação com asset indisponível; nenhuma heurística de fallback nem troca da Hora de Reides recuperada. Necessária revisão humana do desenho/textos antes de promoção. O detalhe tem uma ação Ver rota mundial que fecha o modal e abre FLY; remove duplicata de horários mundiais e aviso sem ação sobre GPX.

## HANDOFF OBRIGATÓRIO — limite de conversa, 01/10/2026 07:40 BRT
Continuar na branch spidey-fly-v1; não reiniciar. Última preview VALIDADA da simplificação: código 0ebd6a2a54fc3764350befc5590a1323a996d19c, https://spidey-pokemon-h0o1npdq1-spidey3.vercel.app. Mobile 390 e desktop 1280: uma ação Ver rota mundial fecha modal e abre FLY; removido aviso de GPX indisponível e horários mundiais duplicados. 37 testes nessa revisão passaram. Hora de Reides Xerneas de 30/09 usa original 1000426235.png e foi confirmada no Android pelo editor.
Novo checkpoint contém PNG corrigido de rotação Xerneas e integração EXCLUSIVA para revisão: PENDING_REVIEW, master original preservado. 10 testes Node passam; nova integração de arte ainda NÃO foi conferida em preview/mobile/desktop. Próxima ação: validar candidata da branch, imagem realmente visível na Home e no detalhe Reides 5★: Xerneas, preservar Hora de Reides e simplificação; obter revisão visual do editor antes de qualquer aprovação de arte ou produção. Não confundir commit de checkpoint com release aprovado. Produção/main sem promoção. Retomar depois cobertura de artes/bonificações, identidade Command Center e linguagem pública; Selos, Novidades; Amigos/Chat só depois núcleo estável.

## Retomada do checkpoint f32ae6e — 01/10/2026
PNG da rotação comprovado na Home/detalhe em mobile 390 e desktop 1280; original da Hora de Reides preservado. Encontrados foco inicial no rodapé do detalhe e vínculo antigo da rotação na Semana. Correção incremental compartilha a exceção de revisão entre telas, mantém Fechar antes do conteúdo, reinicia o detalhe no topo e atualiza cache. 10 testes Node, 28 Python e sintaxe dos 18 scripts ativos passaram. Nova preview da correção ainda precisa de QA; evidência detalhada em `docs/qa/XERNEAS_ROTATION_20261001.md`. Aprovação humana da arte e promoção permanecem pendentes.

## Estado consolidado após QA — 01/10/2026
Código `62c86a4936079023c3881d6e52ec7a8c2953401f`, preview direto verificado: https://spidey-pokemon-o8gs3th9c-spidey3.vercel.app/spidey-app/index.html

- FUNCIONA nesta prova: candidata Xerneas inteira em mobile/desktop; Home, Semana e detalhe com o PNG correto; foco inicial no Fechar e rolagem zero. Original da Hora de Reides preservado e ação única para FLY com seleção correta.
- FUNCIONA nesta prova: temas claro/escuro/sistema, sem overflow horizontal nas medidas conferidas; FLY 20/28, Taipei e conversões; marcar/desmarcar e reabrir progresso local de Selos.
- Preparação incremental: service worker com cache `spidey-app-20261001-public-review-v4`, assets necessários incluídos e busca de asset ignorando query de hash; tamanho do pôster reservado durante carregamento. Isto não comprova upgrade/offline num PWA físico.
- Linguagem: fontes legíveis no detalhe/Novidades; títulos básicos localizados; textos públicos próprios de Selos, busca por PokéStop/cidade/selo e rótulo Copiar e baixar. Notas técnicas e coordenadas originais permanecem no dado. Tags e termos remanescentes devem continuar sendo revisados.
- PARCIAL: cópia e download mostraram toast, mas clipboard e arquivo GPX não foram comprovados; Novidades usa o catálogo, sem novo feed externo; cobertura visual/Premium incompleta; candidata Xerneas ainda `PENDING_REVIEW`.
- PENDENTE: aprovação visual humana, cobertura/revisão factual de artes, Android físico e instalação/upgrade/offline/push da versão corrente. Amigos/Chat NÃO IMPLEMENTADO, conforme prioridade existente.
- 10 testes Node + 28 Python passaram; sintaxe dos 18 scripts ativos e hashes do master passaram. Relatório e prints versionados em `docs/qa/XERNEAS_ROTATION_20261001.md`.

Nenhuma promoção a main/produção nesta rodada. O próximo passo editorial é revisar exatamente o PNG `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`, sem aprovar por inferência nem reutilizar aprovação do AVIF anterior.

## Aprovação humana consolidada — 01/10/2026 09:08 BRT
A decisão “Sim, aprovo” aprova a arte corrigida da rotação Xerneas. PNG aprovado agora no master para os dois IDs da rotação, byte a byte igual ao revisado; original da Hora de Reides, candidata e AVIF histórico preservados. A exceção de preview deixou de ser necessária para Xerneas. Registro: `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`.

Versão do app `2026-10-01-xerneas-approved-v1`; cache inclui o novo caminho aprovado. Detalhe mantém o full_poster já validado e dimensões reservadas. Etiquetas Harvest, Astronaut Pikachu, Space Week, Shadow Raid e GO Battle League recebem equivalentes pt-BR. Confirmar integração pós-aprovação no preview, sem assumir que troca de status dispensa QA. Demais artes e Android/PWA/push continuam pendentes; aprovação de uma peça não equivale à aprovação do lançamento completo. Nenhuma promoção a main/produção nesta rodada.

### Integração pós-aprovação confirmada
Código `641463d5f98e47b0396f2971928e9ce0be92615c`; preview direto: https://spidey-pokemon-3dtankvqz-spidey3.vercel.app/spidey-app/index.html
Home/Semana/detalhe resolvem o novo PNG aprovado. Mobile 390×850 e desktop 1280×850 renderizam 1121×1403, mantendo pôster inteiro, Fechar focado e detalhe no topo. Hora de Reides ainda usa o original 1229×1536 e ação única que fecha o diálogo e seleciona o evento correto no FLY. Etiquetas pt-BR foram observadas na Semana. 11 testes Node passaram; sintaxe dos 18 scripts ativos e integridade dos masters passaram. Provas em `docs/qa/XERNEAS_ROTATION_20261001.md`.

Auditoria de preparação: entre 01 e 07/10, 23 eventos no catálogo; 1 com master APPROVED (Xerneas), 2 com recortes PENDING_REVIEW e 20 sem arquivo no compositor Home/FLY. Coberturas da Semana não equivalem a Premium aprovado. Inventário e sequência para 02/10 em `docs/qa/PUBLIC_ART_READINESS_20261001.md`, começando por Applin/A Invasão e Cinderace. O lançamento completo continua pendente dessas artes e das provas Android/PWA/push.

## Artes prioritárias conferidas — 01/10/2026
Código `684d80e794cecaecf66991f96b4d74c963fb444c`, preview direto verificado https://spidey-pokemon-6a6143fc8-spidey3.vercel.app/spidey-app/index.html. Invasão e Cinderace têm pôsteres corrigidos 1121×1403, ambos PENDING_REVIEW, presentes na Home/detalhe/Semana, mobile/desktop, claro/escuro. Invasão 02/10 00h → 05/10 20h locais, Zekrom com Giovanni e remoção de Frustração; Cinderace 03/10 14–17h locais, seis estrelas e estreia do Brilhante. Fontes primárias pt-BR verificadas e três eventos com bônus/condições detalhados no app.

Cinderace estava sem identificação Global: corrigido acesso ao FLY e removido aviso indevido de local pendente. A ação única Ver rota mundial fecha o modal e mantém Cinderace selecionado; arte/fonte/bônus, 20/28 pontos e conversões de Taipei conferidos. Nenhum Ponto de Energia exato inventado. Applin/Invasão ainda fora das categorias FLY atuais.

Applin teve geração recusada, sem arquivo. Dados oficiais e condições do Passe GO estão atualizados, mas a cobertura técnica vetorial/CSS não constitui Premium; Harvest/Pumpkaboo continua revogado. Xerneas e demais masters/originais íntegros, aprovados preservados. Relatório/provas: `docs/qa/PRIORITY_ART_20261001.md`; vínculos de bytes/prompts: `docs/qa/PRIORITY_ART_REVIEW_20261001.json`. 14 testes Node e sintaxe dos 18 scripts ativos/SW passaram. Novo inventário: 23 eventos, 1 master aprovado, 2 pôsteres em revisão, 1 recorte em revisão, 19 sem arquivo no compositor Home/FLY.

Próximo: aprovação humana específica das duas peças, solução da arte de Applin e cobertura restante. Android/PWA/offline/push e clipboard/GPX real permanecem sem nova prova; Amigos/Chat posterior ao núcleo. Nenhuma promoção a main/produção nesta rodada.

## Aprovação de Invasão e Cinderace — 01/10, 15:45 BRT

Decisão explícita “Sim, aprovo” sobre os dois PNGs apresentados em `df9d050`; status APPROVED, sem regeneração/alteração de bytes. Registro `docs/qa/PRIORITY_ART_APPROVAL_20261001.json`. Master, cache e entradas de revisão alinhados à nova autoridade; confirmações pós-aprovação em `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`.

Inventário corrente: 23 eventos, 3 no master APPROVED, 1 recorte PENDING_REVIEW, 19 sem arquivo Home/FLY. Aprovação restrita a Invasão e Cinderace; Xerneas já aprovado preservado. Próximos: Applin/cobertura restante, Android físico/instalação/upgrade/offline PWA/push e prova de clipboard/GPX. Amigos/Chat posterior ao núcleo. Nenhuma promoção a main/produção.

QA pós-aprovação confirmado em `a242f88`: mobile/desktop Claro/Escuro, Home/Semana/detalhe e FLY de Cinderace com caminhos premium/hashes/naturais corretos. Uma ação de rota mantém seleção, 20/28 pontos e Taipei; Xerneas preservado. 14 testes Node, sintaxe/integridade passaram; quatro prints preservados. Preview https://spidey-pokemon-huc1kneau-spidey3.vercel.app/spidey-app/index.html. Relatório e limites `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`. Pendências públicas acima continuam abertas.

## Próxima peça disponível — Seedot, 01/10

Pôster corrigido do Holofote de Seedot, 01/10 18–19h locais e 2× PE por captura, PENDING_REVIEW. Não registra aprovação nem altera master. GO Hub/Leek Duck identificados como comunidade; original preservado. Applin repetido com mesmo pedido foi recusado novamente e Semana do Espaço também recusada, sem imagens. Dados oficiais de Espaço agora incluem reides de uma estrela/pesquisa gratuita/prazo de pesquisa separado de 12/10. Registro `docs/qa/NEXT_ART_REVIEW_20261001.json`; QA `docs/qa/NEXT_ART_20261001.md`. Inventário 3 aprovados, 1 pôster corrigido pendente, 19 sem arquivo. QA de preview Seedot concluído abaixo; decisão humana e demais bloqueios públicos continuam pendentes.


### QA Seedot concluído — código 2ed7ef8

Preview seguro verificado https://spidey-pokemon-1v45kgmxg-spidey3.vercel.app/spidey-app/index.html. Pôster exato decodificado 1121×1403 na Home/detalhe/Semana/FLY; mobile Claro 390×850 e desktop Escuro 1280×850. Sem overflow horizontal medido, detalhe inicia no topo, ação única fecha diálogo e seleciona Seedot no FLY. 20/28 referências, Taipei 07–08h e Pago Pago 02/10 02–03h Brasília observados. Masters Xerneas/Invasão/Cinderace intactos e carregados no app direto. Fontes de Seedot continuam comunidade; detalhes de Espaço mostram prazo da pesquisa separado até 12/10.

15 testes Node e verificações locais já concluídos; provas e limites específicos em `docs/qa/NEXT_ART_20261001.md` e manifesto JSON homônimo de revisão. Clique via Enter no iframe e clique no app direto desktop comprovados; toque físico Android ainda pendente. Nova arte Seedot **PENDING_REVIEW**, decisão humana não inferida. Applin/Espaço sem arte por recusa; 23 eventos, 3 APPROVED, 1 pôster pendente, 19 sem arquivo Home/FLY. Lançamento público continua condicionado à cobertura/revisão e provas Android/PWA/push; nenhuma promoção a main/produção.


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


## Estado corrente — duas novas artes em revisão, 03/10/2026

Código `a17f6d4`, preview https://spidey-pokemon-ko9ywdo8h-spidey3.vercel.app/spidey-app/index.html: Thundurus v1 e Elgyem v2 PENDING_REVIEW. 31 testes, dois pôsteres completos em mobile Claro/desktop Escuro, hashes servidos exatos e FLY Elgyem 20/28/horários/coords conferidos. Thundurus presente Home/Semana; 12 masters e 124 IDs/janelas preservados. QA em `docs/qa/THUNDURUS_ELGYEM_QA_20261002.json`.

Inventário 01–07/10: 23 eventos, 8 APPROVED, 1 em revisão e 14 sem arquivo Home/FLY. Elgyem em revisão fora da janela. Push no novo preview continua 503; painel exige login e variáveis não inspecionadas. Android físico e lançamento completo continuam pendentes. Próximo: decisão humana das duas peças, restante da cobertura e configuração/QA físico. Sem main/produção nem disparos externos.
