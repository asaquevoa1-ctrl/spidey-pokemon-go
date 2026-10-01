# Spidey — candidato público para 02/10/2026

Estado: PREVIEW EM QA; promoção/main depende da aprovação visual do editor.
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
