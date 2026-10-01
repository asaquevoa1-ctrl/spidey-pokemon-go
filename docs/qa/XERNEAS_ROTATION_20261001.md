# Xerneas — rotação corrigida, QA de 01/10/2026

## Continuidade
Branch `spidey-fly-v1`, checkpoint retomado `f32ae6e439d1e04443933c97da0f5dd6dfaa5685`.
Preview do checkpoint: https://spidey-pokemon-is9kph570-spidey3.vercel.app/spidey-app/qa-responsive.html

Base de código final: `62c86a4936079023c3881d6e52ec7a8c2953401f`.
Preview direto verificado: https://spidey-pokemon-o8gs3th9c-spidey3.vercel.app/spidey-app/index.html
QA responsivo final: https://spidey-pokemon-o8gs3th9c-spidey3.vercel.app/spidey-app/qa-responsive.html

## Observado no navegador
- Mobile 390×850 e desktop 1280×850: Home mostrou a miniatura da rotação; detalhe decodificou o PNG corrigido em 1121×1403. Pôster inteiro foi inspecionado depois de rolar o detalhe para o topo.
- URL observada: `assets/events/review/xerneas-rotation-correction-v1.png?v=b9e3b4629234`; `complete=true`, dimensões naturais 1121×1403.
- Período visível na peça: 30 de setembro a 6 de outubro de 2026. Sem os painéis de bônus/horários retirados na correção.
- A candidata continua `PENDING_REVIEW`. QA de renderização não concede aprovação editorial.
- Hora de Reides: detalhe continuou usando `assets/events/recovered/1000426235.png?v=2b97e5ae1478`, íntegro em 1229×1536.
- Uma ação `Ver rota mundial` fechou o diálogo e abriu FLY mantendo a seleção Hora de Reides: Xerneas; sem tabela mundial paralela nem aviso de GPX sem ação.
- Não foi observado overflow horizontal no desktop: largura de documento/conteúdo 1265 pixels dentro do iframe de 1280.

## Defeitos encontrados e correção incremental
- Diálogo abria focando o link Fonte e rolava além da arte. Controle Fechar foi movido para antes do conteúdo, com autofocus e área de 44px; detalhe reinicia no topo.
- Semana ainda resolvia o AVIF truncado para a rotação. A exceção explícita de revisão agora é compartilhada por Home, Semana e detalhe, sem alterar o catálogo aprovado ou permitir substituição por rascunho genérico.
- Cache foi versionado e inclui candidata, original da Hora de Reides e ilustrações recuperadas usadas no preview; leitura de assets permite encontrar o arquivo pré-carregado quando o pedido tem query de hash.
- Fonte no detalhe/Novidades usa a classificação legível do jogador, sem rótulos de bastidor. Ausência de coordenada específica deixa de gerar aviso para eventos globais.
- Pôster recebe width/height reais para reservar sua proporção antes de decodificar. Títulos básicos usam a localização compartilhada.
- Selos separa `public_summary`/`public_notes` das notas técnicas preservadas no dado; procura por PokéStop/cidade/selo e rótulo Copiar e baixar substituem termos internos. Nenhuma coordenada, confiança ou regra de GPX foi alterada.

## Evidências do checkpoint
- `xerneas-home-mobile-f32ae6e-20261001.jpg`
- `xerneas-rotation-mobile-f32ae6e-20261001.jpg`
- `xerneas-rotation-desktop-f32ae6e-20261001.jpg`

## Verificação local da correção
10 testes Node e 28 testes Python passaram; sintaxe dos 18 scripts ativos passou. Hashes do catálogo aprovado passaram sem alteração. SHA256 da candidata permanece `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`.

## Confirmação das correções no preview

`5df4f6b`: integração da arte compartilhada, foco/posição inicial e fonte pública. `eaa3080`: proporção reservada e textos públicos de Selos. `62c86a4`: rótulo público final Copiar e baixar e cache v4; confirmado no navegador. A rodada final complementa as provas anteriores, não transforma build READY em aprovação.

| Fluxo | Resultado observado |
| --- | --- |
| Rotação mobile 390×850 | PNG 1121×1403, complete=true, pôster 360×451; Fechar focado e scrollTop=0; largura documento/scrollWidth 375/375 |
| Rotação desktop 1280×850 | Mesmo PNG, complete=true; imagem com contain, 620px de altura; largura documento/scrollWidth 1265/1265 |
| Semana | Mobile: miniatura 78×104, PNG 1121×1403 decodificado. Desktop: miniatura 92×116, mesmo PNG. Vínculo ao AVIF quebrado removido |
| Hora de Reides | Original 1000426235.png, 1229×1536 decodificado; período 30/09 18–19h local; uma ação Ver rota mundial fecha o diálogo e seleciona este evento no FLY |
| Temas | Sistema/claro e escuro observados; arte permanece inteira |
| FLY | Seedot com detalhes/bônus/fonte; Essenciais 20 / Todos 28; Taipei 25.033964,121.564468 preservada; horário local + Brasília e mudança de dia explícita |
| Selos | 2 rallies / 22 Stops / 1 GPX pronto. Japão marcou 1/17, reabriu em 1/17, avançou ao próximo faltante, depois desmarcou e voltou a 0/17. PokéXciting não ofereceu GPX completo. Textos públicos e 17 itens da galeria conferidos |
| Novidades | Anúncio oficial / Informação da comunidade distinguem as fontes; conteúdo continua sendo derivado do catálogo |

O relógio da primeira rodada mostrou Seedot com Jacarta ativa, Chennai seguinte e última janela em Pago Pago até 02/10 03:00 Brasília. No teste final da Hora de Reides de 30/09, todas as janelas estavam corretamente encerradas. Não fixar esses estados no código: mudam com o instante real.

## Evidências das correções

- `xerneas-rotation-mobile-5df4f6b-20261001.jpg`
- `xerneas-rotation-desktop-dark-5df4f6b-20261001.jpg`
- `xerneas-raid-hour-mobile-5df4f6b-20261001.jpg`
- `xerneas-week-mobile-5df4f6b-20261001.jpg` — primeira seção da Semana, complementar.
- `xerneas-rotation-mobile-eaa3080-20261001.jpg` — candidata inteira e detalhe abrindo no topo.
- `xerneas-rotation-desktop-dark-eaa3080-20261001.jpg` — candidata inteira no desktop escuro.
- `xerneas-week-mobile-62c86a4-20261001.jpg` — cards distintos de Hora de Reides e rotação corrigida.

## Comandos de verificação

```sh
node --test tests/fly-core.test.cjs tests/player-ui.test.cjs
python -m unittest test_spidey_geo test_world_event_times test_spidey_approval test_editorial_state test_pipeline_stability
git diff --check
```

Além dos 38 testes, `node --check` passou nos 18 scripts ativos. A última alteração foi apenas o rótulo de Selos e a versão de cache; sintaxe/diff foram novamente conferidos e o texto final foi observado no preview. SHA256 da candidata e original de Hora de Reides conferidos; todos os binários do master continuam intactos.

## Limites e preparação para 02/10

- Candidata de rotação continua PENDING_REVIEW. Falta decisão visual/factual humana sobre este PNG exato; QA não concede APPROVED nem reutiliza aprovação do AVIF anterior.
- Cobertura Premium e revisão factual das demais artes não concluídas. Restam tags/termos do catálogo a revisar. Selos ainda tem imagens de selos ausentes, sem inventar peças oficiais.
- Android físico, instalação/upgrade PWA, offline real e entrega push não comprovados na versão corrente.
- Cópia em Taipei mostrou toast, mas clipboard retornou vazio; não comprova conteúdo copiado. Download GPX mostrou toast, mas a captura do evento de download expirou; arquivo não foi inspecionado. Não declarar download end-to-end comprovado.
- Amostra de logs tinha erros da extensão do navegador, sem erro do app observado nessa amostra; não é prova de ausência de todos os erros.
- Novidades não virou um feed externo independente. Amigos/Chat permanece NÃO IMPLEMENTADO, posterior ao núcleo.
- Nenhuma promoção a main/produção nesta rodada. Alterações preexistentes do worktree foram preservadas em stash antes do avanço para f32ae6e.
