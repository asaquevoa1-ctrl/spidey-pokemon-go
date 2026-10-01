# Spidey — candidato público para 02/10/2026

Estado: PREVIEW COM QA RESPONSIVO CONCLUÍDO; promoção/main depende da aprovação visual do editor.
Branch: `spidey-fly-v1`, continuidade a partir de `6f0ff93`.

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
