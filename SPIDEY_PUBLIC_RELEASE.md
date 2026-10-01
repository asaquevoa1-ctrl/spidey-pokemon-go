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
