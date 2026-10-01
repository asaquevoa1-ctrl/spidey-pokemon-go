# Spidey — candidato público para 02/10/2026

Estado atual: XERNEAS, INVASÃO e CINDERACE APPROVED por decisões humanas explícitas; PNGs exatos preservados no master. Arte de Applin pendente por recusa da ferramenta. Liberação pública depende de cobertura/revisão das demais artes e QA Android/PWA/push da versão corrente.
Branch: `spidey-fly-v1`, retomada de `f32ae6e`. Base de código mais recente validada: `a242f88` (pós-aprovação). Os registros anteriores abaixo são históricos; consultar a última seção para o estado atual.

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
