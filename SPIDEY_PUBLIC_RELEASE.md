# Spidey — candidato público, estado de 04/10/2026

Estado corrente — 04/10: Málaga confirmado pela fonte oficial e fundo original 512×512 integrado no código `ff84fe8`. Home e FLY abrem o detalhe com os três locais, mapas por endereços oficiais/região, cópia de endereço, relógios locais e janela equivalente em Brasília; encerramento em 04/10 às 20h de Málaga / 15h de Brasília. 43 testes e QA desktop Escuro/mobile Claro passaram, sem overflow; 10 arquivos servidos via share temporário anônimo byte a byte exatos. FLY20/28/Taipei e seis museus/fundos anteriores preservados. Catálogo124, masters25 e 744 blobs anteriores fora do escopo intactos. Missões fixas/GPX continuam dispensados pelo editor, sem nova busca ou rota criada. Nenhuma promoção a main; acesso durável, Android físico/PWA/push e aprovação do lançamento continuam pendentes; recusas Premium preservadas. Registro corrente: `docs/qa/MALAGA_QA_20261004.md`.

Histórico — checkpoint Latios (03/10): Latios v1 APPROVED, QA `d14897b` PASSED_PREVIEW; janela 01–07/10 11 APPROVED/0 revisão/12 sem arquivo. Compartilhamento público BLOCKED_USER_PHONE_LOGIN. Ver última seção para o checkpoint corrente.
Histórico — checkpoint Kyogre: Passe GO de outubro/Kyogre v1 APPROVED por decisão explícita de 03/10 09:04:55 BRT; QA pós-aprovação PASSED_PREVIEW no código `ff37843` (33 testes, mobile Claro/desktop Escuro e arquivo servido idêntico ao PNG aprovado). Master com 15 entradas, 14 anteriores intactas; preview sem candidatas ativas. Janela 01–07/10: 23 eventos, 10 APPROVED e 13 sem arquivo Home/FLY. Acesso público para testadores BLOCKED_USER_PHONE_LOGIN; painel sem acesso administrativo concluído. Push/configuração e Android físico pendentes; lançamento completo não concluído.
Checkpoint histórico: branch `spidey-fly-v1`, código `ff37843208635a0923adc1996371aaacd2a430f6`. Preview interno: https://spidey-pokemon-i6523e1iy-spidey3.vercel.app/spidey-app/index.html. Acesso de testadores bloqueado; registros abaixo são históricos, consultar a última seção.

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

## Estado corrente — Thundurus e Elgyem aprovados, 03/10/2026

Master 14 entradas APPROVED, anteriores preservadas. Decisão explícita de 07:30:21 BRT em `docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json`. Código `29c1aecf53742de581ea0fc036793d91a859bc60`, preview https://spidey-pokemon-7whircohq-spidey3.vercel.app/spidey-app/index.html, 32 testes e QA pós-aprovação PASSED_PREVIEW: dois PNGs completos mobile Claro/desktop Escuro, hashes servidos exatos e FLY Elgyem 20/28 com horas/coordenadas. Cinco provas/observações no relatório `docs/qa/thundurus-elgyem-approved-browser-29c1aec-20261003.json`.

Inventário 01–07/10: 23 eventos, 9 APPROVED, nenhuma candidata, 14 sem arquivo Home/FLY. Elgyem aprovado fora da janela. Cobertura restante, configuração push e Android físico/PWA continuam pendentes. Último GET push observado no código a17f6d4: 503 push_not_configured; variáveis não inspecionadas. Nenhuma configuração/disparo nesta rodada. Zorua e GPX Japão preservados. Lançamento completo continua pendente, sem main/produção. Próxima frente não inclui nova aprovação destas duas artes.


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


## Latios / Passe GO de setembro v1 em revisão — 03/10/2026

PNG novo integral para `2026-09-go-pass`: `spidey-app/assets/events/review/go-pass-september-latios-v1.png`, 1122 × 1402, 2.757.480 bytes, SHA256 `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`. **PENDING_REVIEW**, sem decisão humana; não regenerar apenas para reenvio. Prompt exato, referências, dados anteriores e verificação factual: `docs/qa/LATIOS_REVIEW_20261003.json`. Logo oficial + Kyogre aprovado usados somente como referências de marca/estilo, sem editar seus bytes.

Fonte primária PT-BR: https://pokemongo.com/pt-BR/news/go-pass-september-2026. Passe gratuito 08/09 10h → 06/10 10h locais; Latios depende da progressão. Pontos GO ilimitados apenas em 3 e 4/10; 2× duração do Incenso de Aventura Diário ao atingir Ranque 50. Detalhe diferencia Deluxe pago/Ranque 20 para Incubadora Temporária, resgate até 08/10 10h e expiração da incubadora em 13/10 10h. Brilhante com sorte, sem boost inferido. Apenas este eventId mudou editorialmente; período/calendário/localizações/GPX intactos, outros 123 eventos idênticos.

Código `760b1179e8fd1b76076cd947fc91388c12b52442`, Vercel READY `dpl_7EMe954ujCBBSvtvnnAi87mbob46`. Preview conferido internamente: https://spidey-pokemon-m4vhhogwm-spidey3.vercel.app/spidey-app/index.html. 33 testes passaram; sintaxe de preview/SW e 76 paths do cache conferidos. Todos os 15 masters, 14 arquivos aprovados, helper de revisão e 218 blobs anteriores de assets/testes/revisões/aprovações preservados. Resolver resolve a candidata inteira em thumb/card/weekly/hero/poster, com `preview_candidate:poster`, sem aprovação/Premium automático. Não foi criada elegibilidade FLY para passe mensal.

QA do novo código: Home → detalhe, mobile 390 × 850 Claro e desktop 1280 × 850 Escuro; pôster completo em contain, foco Fechar, scrollTop 0, sem overflow horizontal. Download real do PNG servido pelo navegador corresponde exatamente ao hash/bytes da candidata. Provas/DOM: `docs/qa/latios-browser-760b117-20261003.json`, JPEGs em `docs/qa/proofs/`. Responsividade não comprova Android físico.

Inventário de 01–07/10: 23 eventos, **10 APPROVED**, **1 PENDING_REVIEW (Latios)** e **12 sem arquivo Home/FLY**; `docs/qa/latios-inventory-760b117-20261003.json`. Passe GO de outubro/Kyogre permanece APPROVED com a decisão e os pixels intactos. Compartilhamento externo continua **BLOCKED_USER_PHONE_LOGIN**: acesso temporário de QA não comprova acesso dos testadores; token não persistido. Sem autenticação administrativa nova, mudança de proteção/configuração/secrets/push, main/produção, dispatch ou mensagens externas. Applin/Espaço/Sizzlipede continuam com recusas registradas. Próximo: decisão humana sobre esta peça, cobertura restante e desbloqueios/QA Android/PWA/push.


## APROVAÇÃO LATIOS / PASSE GO SETEMBRO — 03/10/2026, 13:01 BRT

Editor: **“Eu aprovo, com certeza”**, `2026-10-03T13:01:11-03:00`, sobre a candidata Latios v1 exibida integralmente no chat com link individual e prova desktop. Manifesto `docs/qa/LATIOS_APPROVAL_20261003.json`, revisão histórica congelada `docs/qa/LATIOS_REVIEW_20261003.json` com SHA256 `f91c20b70862fd69cd3470f20cdb48040a95a051f91681ce31b6018d4ff5b807`. Não inferir aprovação de outra arte nem autorização de lançamento.

Cópia premium `spidey-app/assets/events/premium/go-pass-september-latios-approved-v1.png`, 1122 × 1402, 2.757.480 bytes, SHA256 `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`, byte a byte igual à candidata. EventId `2026-09-go-pass` APPROVED/full_poster no master; apenas sua entrada sai do preview (agora vazio). Master soma 16 entradas, 15 anteriores idênticas, 212 blobs anteriores de assets/revisões/aprovações preservados na comparação completa de árvores, sem remoções. Catálogo inteiro continua inalterado: 124 eventos, SHA256 `184d3b2843c3a566d9f791adbb7ccc1fce6adefecdbfb2f5766af18c4678cd15`. Datas/bônus/fonte oficial e elegibilidade FLY não mudaram; passe mensal não recebe janela diária mundial.

Código `d14897bc27c1ac021f9871b487600c4305bf8703`, Vercel READY `dpl_HXxaPscxWGFaMVrLwYKBagetLYhR`. Preview conferido internamente: https://spidey-pokemon-nviok0edm-spidey3.vercel.app/spidey-app/index.html. Master/preview/shell/cache versionados; precache mantém 76 paths e usa o aprovado, sem duplicar a candidata. Resolver comum entrega os mesmos pixels em todos os cinco papéis, agora com autoridade Premium do master; helper de revisão inalterado. 33 testes passaram, sintaxe dos três scripts/cache/whitespace passaram.

QA pós-aprovação: Home → detalhe, 390 × 850 Claro e 1280 × 850 Escuro; PNG inteiro em contain, foco Fechar, scrollTop 0 e sem overflow horizontal. Download real pelo navegador no caminho premium possui hash/bytes exatos da aprovação. Relatório `docs/qa/latios-approved-browser-d14897b-20261003.json` e JPEGs em `docs/qa/proofs/`. Pixels dos prints podem coincidir com as provas da candidata, pois a imagem/layout foram preservados; captura real nova, código/caminho/DOM e download servido vinculam as provas ao novo deployment. Android físico ainda pendente.

Inventário pelo compositor real: 23 eventos de 01–07/10, **11 APPROVED**, **0 candidatas** e **12 sem arquivo Home/FLY**; `docs/qa/latios-approved-inventory-d14897b-20261003.json`. Este número não cobre todos os 124 eventos. Compartilhamento público segue **BLOCKED_USER_PHONE_LOGIN**, com autenticação administrativa anterior não concluída. Acesso temporário interno de QA não comprova abertura pelos testadores; token efêmero não persistido. Não repetir login sem nova solicitação. Sem promoção a main/produção, mudança de proteção/secrets/push, dispatch ou mensagens externas. Recusas Applin/Espaço/Sizzlipede preservadas. Próximo: artes restantes, acesso público e validação Android/PWA/atualização/offline/alertas.

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

## Estado corrente — 04/10/2026 — calendário e agenda QA PASSED_PREVIEW

Código `d3d26e100a060b26b4731dc6aea2046b18e41662` validado em https://spidey-pokemon-n6qdbrhqj-spidey3.vercel.app/spidey-app/index.html; deployment `dpl_6TegdHKSHaAY5UAnuvaENWb8Fp5E` READY, target null. 37 testes passaram. Correção do calendário em Brasília: fronteiras de dia, Hoje, mês/ano e modo de início únicos independentes do fuso do aparelho. Agenda móvel sem capa genérica, título e fechamento sem sobreposição, scroll inicial zero. Detalhes sem localização mostram “Horários” sem inventar local pendente.

QA real: mobile Claro 390×850/desktop Escuro, quatro eventos corretos em 01/10; mobile quatro corretos em 02/10, detalhe Sexta da Amizade com PNG integral aprovado. Sem overflow. Catálogo124, master25, artes e sistemas de publicação/push preservados. Lote anterior de sete artes/14 capturas consolidado em `de88306`; a janela23 mantém20 aprovados/0candidatas/3recusas. Relatório `docs/qa/CALENDAR_BRASIL_20261004.md` e JSON homônimo.

Acesso: novo link temporário nativo verificado por HTTP anônimo com cookies vazios e sem credenciais; HTML/catálogo/PNG200, PNG servido idêntico. **Acesso físico pelos testadores: USER_PHONE_NOT_RETESTED**. O bloqueio de login relatado em03/10 não foi certificado como resolvido. URL sem parâmetro redireciona para login; link efêmero não é endereço público permanente. Token não persistido. A proteção Vercel permanece ativa e não houve autenticação administrativa nova.

Push público respondeu503 `push_not_configured`, sem ativação/envio. Android físico/instalação/atualização/offline/recebimento real continuam pendentes. Lançamento completo não concluído, produção não aprovada. Próxima frente: prova de abertura no celular e acesso durável, configuração push e QA físico. Recusas Applin/Espaço/Sizzlipede mantidas; sem promoção main/produção ou mensagens externas.

## Continuação — 04/10/2026 — Pikachu Astronauta e museus

O editor informou que o evento já está acontecendo e destacou os fundos. Código `d5e667dc05340e6fcaaf6a062b5ffcadad2db28f` em `spidey-fly-v1`: destaque global no Início, imagens oficiais sem edição de pixels e painel europeu acessível pelo Início, detalhe, FLY e Eventos pelo Mundo. Seis museus, quatro coordenadas verificadas de referência e dois endereços; relógios IANA local/Brasília e mapas. Museus não são PokéStops exatas; sem GPX. Períodos globais e da parceria separados; Fundo/Brilhante não garantidos e instalações da ESA sem fundo. Relatório corrente `docs/qa/SPACE_WEEK_QA_20261004.md`, JSON, fontes e quatro capturas versionadas.

40 testes e browser mobile Claro 390×850/desktop Escuro 1348 passaram, sem overflow. Ambas as imagens oficiais completas em 1920×1080; resgate global até 12/10 às 23h59 locais; parceria até 30/04/2027. FLY 20/28 e Taipei preservados. Cliques de cópia exibiram sucesso, mas clipboard nativo/Android não certificado. Catálogo com 124 IDs e 123 outros objetos intactos, 25 masters e todos os assets anteriores intocados; 702 blobs anteriores preservados na árvore de código. A ilustração oficial não consolida arte Premium: janela com 23 eventos, 20 APPROVED, 0 candidatas e 3 recusas mantida. Não repetir ou contornar recusas de geração.

Preview READY/target null: https://spidey-pokemon-ijs2y7r8s-spidey3.vercel.app/spidey-app/index.html, deployment `dpl_BEMqhYaVsZLXUpttidS7Q99LXyws`. Novo share nativo temporário passou em HTTP anônimo, ambos JSONs/JPEGs servidos idênticos; token não persistido. URL sem parâmetro exige login. Acesso durável e celular dos testadores continuam pendentes. Push 503, Android instalação/atualização/offline/recebimento push pendentes; sem produção/main, mudança de proteção, novo login, dispatch ou mensagens externas. Próximo: continuar do HEAD remoto atual e concluir esses gates sem declarar lançamento finalizado.


## 04/10/2026 — fundos por cidade, pesquisa com escopo e GPX pendente

Solicitação do editor: cobrir a área do evento de cada cidade em GPX, mostrar o fundo correspondente e buscar missões que recompensam Pokémon com fundo. Código `036e0c3b31eb8946270216aa8049b6e3ff5bcf12` integra seis fundos originais 512×512, sem edição, a partir do acervo comunitário de arquivos do jogo. Os três nomes de tarefas do relato direto de Valência aparecem somente naquele museu, com fonte e espécies por tarefa desconhecidas. Os demais locais e etapas temporárias permanecem a confirmar. As listas de encontros selvagens não foram usadas para inventar recompensas.

Não foram encontrados limites do evento nem rotas de cobertura integral verificáveis para os seis locais. A fonte de seis pontos isolados não atende ao pedido de cobertura total; nenhum GPX criado ou download habilitado. Mapas e relógios anteriores preservados. 43 testes e QA desktop Escuro/mobile Claro, seis fundos integrais, FLY20/28/Taipei e cliente HTTP anônimo com13 arquivos exatos passaram. Prévia `https://spidey-pokemon-50c311k5g-spidey3.vercel.app/spidey-app/index.html` READY/target null; share nativo temporário, sem token no repositório. 124 eventos/25 masters/716 blobs anteriores fora do escopo preservados; main intacta. Pendências físicas/push/acesso durável/produção e recusas Premium preservadas. Fontes, QA e cinco provas em `docs/qa/ESA_BACKGROUND_RESEARCH_QA_20261004.md` e respectivos JSONs.

## 04/10/2026 — fundos por cidade após dispensa de missões e GPX

Estado corrente — 04/10: Por orientação do editor, a busca de missões e GPX foi encerrada e esses itens saíram do escopo atual. Código `ae4fcd4` remove listas fixas de tarefas e avisos de GPX pendente; mantém os seis fundos originais 512×512, museus, endereços/mapas, relógios locais e orientações oficiais gerais para obter os fundos. 41 testes e QA desktop Escuro/mobile Claro passaram, seis imagens completas e sem overflow; 13 arquivos via share temporário anônimo byte a byte conferidos. Catálogo de 124 eventos, 25 masters e seis fundos preservados; 733 blobs anteriores fora do escopo intactos. Nenhum GPX de área total criado. Registros históricos de pesquisas preservados, sem nova busca pendente. Acesso durável, Android físico/PWA/push e promoção à produção continuam pendentes; recusas Premium de Applin/Espaço/Sizzlipede mantidas. Registro corrente: `docs/qa/ESA_FUNDS_SCOPE_QA_20261004.md`.

O editor dispensou as missões e autorizou deixar os GPX de lado se não fosse possível obtê-los. A decisão de 11:44:10 BRT está em `ESA_SCOPE_UPDATE_20261004.json`. A justificativa de reset diário é atribuída ao editor, sem nova garantia de gameplay publicada.

Código: `ae4fcd4a2e0d2b69c4ff74c8808d33352a7f4a32` na branch `spidey-fly-v1`, base `a23ebf4c6b9fe96f1b030011519620e512c37eb4`. Deploy `dpl_EktNZkCDq5d6vx95YTH6b3krnyEF` READY, target preview. URL verificada: https://spidey-pokemon-2fh3rg4cq-spidey3.vercel.app/spidey-app/index.html.

Verificações: 41 testes Node e sintaxe dos dois scripts passaram. Browser desktop 1348px / Escuro e wrapper móvel 390px / Claro: seis cartões, seis mapas, seis relógios, nenhuma seção fixa de missões ou aviso de GPX; seis imagens originais 512×512 completas após rolagem. Documento e diálogo sem overflow horizontal. Cliente HTTP com zero cookies iniciais, sem credenciais: 13 arquivos 200, bytes idênticos ao código local. Share nativo temporário; a informação de validade fornecida pela Vercel foi “10/5/2026, 1:52:13 PM”. Token não salvo no repositório.

Integridade: catálogo inteiro de 124 eventos, master com 25 entradas e todos os assets nele referenciados, seis fundos por cidade e registros históricos preservados. No commit de código, 733 blobs fora do escopo mantêm o mesmo SHA. O commit documental posterior preserva o código testado.

Esta entrega não promoveu produção e não alterou `main`; o SHA observado antes e depois foi `f35b25a145cb4ad1cbc8e1aa872d0e2fb9f4a96b`, que já era o estado lido nesta retomada. Não atribuir a esta entrega movimentos anteriores de `main`. Android físico, instalação/atualização/offline/colagem/push, URL permanente e aprovação de lançamento não foram certificados aqui. Último push anterior: 503 `push_not_configured`. Recusas de geração Premium permanecem.

Provas e registros: `ESA_FUNDS_SCOPE_QA_20261004.json`, `esa-scope-browser-ae4fcd4-20261004.json`, `esa-scope-anonymous-ae4fcd4-20261004.json` e quatro JPEGs em `proofs/`. As provas anteriores de tarefas/GPX permanecem históricas; não retomar essas buscas por causa delas.

## 04/10/2026 — Málaga oficial com fundo e locais

Estado corrente — 04/10: Málaga confirmado pela fonte oficial e fundo original 512×512 integrado no código `ff84fe8`. Home e FLY abrem o detalhe com os três locais, mapas por endereços oficiais/região, cópia de endereço, relógios locais e janela equivalente em Brasília; encerramento em 04/10 às 20h de Málaga / 15h de Brasília. 43 testes e QA desktop Escuro/mobile Claro passaram, sem overflow; 10 arquivos servidos via share temporário anônimo byte a byte exatos. FLY20/28/Taipei e seis museus/fundos anteriores preservados. Catálogo124, masters25 e 744 blobs anteriores fora do escopo intactos. Missões fixas/GPX continuam dispensados pelo editor, sem nova busca ou rota criada. Nenhuma promoção a main; acesso durável, Android físico/PWA/push e aprovação do lançamento continuam pendentes; recusas Premium preservadas. Registro corrente: `docs/qa/MALAGA_QA_20261004.md`.

Solicitação do editor em 04/10 às 12:03:50 BRT, seguida de “Bora” às 12:41:56 BRT. Evento local existente passa de aguardando confirmação a OFICIAL, usando `data/local-events.json` como fonte única para Home, FLY e detalhe. Não é inserido na propagação global por hotspots. O catálogo global permanece byte a byte igual.

Fonte primária: https://pokemongo.com/es/news/comic-con-malaga-2026 . Recompensa geral: Pikachu com fundo de Málaga por pesquisas de campo e temporária exclusivas. FYCMA exige ingresso para acesso à convenção; Larios e centro histórico são os demais locais anunciados. Datas do stand físico Larios mantêm 2–3/10,10–20h da fonte oficial, distintas da janela de gameplay até4/10,20h. Sem listas fixas de tarefas ou promessa de Brilhante/fundo garantido.

Fundo original: `lc_2026_ComicCon_Malaga.png`,538698 bytes,512×512,SHA256 `37bb7561eb4b942f30614bdae8f2e1daa95ead617794f291af37acad409581d5`. Arquivo exato do acervo PokeMiners, cidade/recompensa corroboradas no Serebii. Não houve edição de pixels ou promoção a arte Premium. Asset antigo Málaga e todos os masters anteriores preservados.

Código `ff84fe8b344d413d87548f4e083e72ad6ea00ad8`, base `3e02d5b6d9f5f6814d2bea5e6e0d6d89b34a147e`, branch `spidey-fly-v1`. Deploy `dpl_D93vSyZ3GNKmMTQ81HpSDYwCS2Qf` READY,target preview. URL verificada: https://spidey-pokemon-pa2fgluuu-spidey3.vercel.app/spidey-app/index.html . Compartilhamento nativo temporário com validade retornada “10/5/2026, 2:16:31 PM”; token não salvo no repositório.

43 testes Node e sintaxe passaram; limite exato20h/Málaga15h/Brasília e horários inválidos validados. Browser desktop1348/Escuro e wrapper390/Claro: fundo completo, três mapas, janela/relógios, botão de copiar endereço com toast observado e nenhum overflow lateral. Aberturas Home/FLY conferidas; FLY20/28/Taipei e seis museus com seis mapas preservados. Dez arquivos via cliente HTTP sem cookies iniciais e sem credenciais têm status200 e bytes exatos. Android físico, colagem no aparelho, instalação/atualização/offline/push e acesso durável não certificados.

Integridade: catálogo124,25 masters/todos os arquivos referenciados, seis fundos ESA e registros anteriores intactos;744 blobs fora do escopo preservados no commit de código. Commit documental posterior preserva esse código. Main observado `f35b25a145cb4ad1cbc8e1aa872d0e2fb9f4a96b`; esta entrega não promoveu produção. Recusas Applin/Espaço/Sizzlipede mantidas. Último push anterior503,push_not_configured;não rechecado aqui.

Provas: `MALAGA_QA_20261004.json`,`MALAGA_SOURCES_20261004.json`,`malaga-browser-ff84fe8-20261004.json`,`malaga-share-anonymous-ff84fe8-20261004.json` e quatro JPEGs em `proofs/`. Missões e GPX dispensados não voltam para o próximo lote.
