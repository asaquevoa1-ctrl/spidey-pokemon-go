# Novidades e Mega Victreebel — 01/10/2026

Continuação de `887a2cd`, branch `spidey-fly-v1`. Monitores de main observados em `6045937`, sem merge/reset/importação das artes/cursores/filas automáticas. Pedido do editor: conferir e colocar as novidades no app, continuando a preparação pública de 02/10.

## Atualização factual

- Minior: três períodos novos no calendário (Orionidas 19–24/10, Leônidas 14–19/11, Geminidas 11–16/12), um anúncio em Novidades. Eventos começam às 17h e terminam às 23h59 locais; aparições aumentadas diariamente das 17h às 21h. Sem inventar cores por chuva, quantidade de Poeira Estelar ou bônus Brilhante. Fonte primária: https://pokemongo.com/news/minior-meteor-showers-2026.
- Trio Dinamax: mesmo ID `2026-10-dynamax-max-battle-day`, agora Uxie/Mesprit/Azelf, 24/10 14–17h locais, cinco estrelas. Distribuição regional, bônus gratuitos e benefícios do ingresso separados; limite global de Reides a Distância convertido para 23/10 21h até 25/10 00h em Brasília. Fonte primária: https://pokemongo.com/en/news/dynamax-uxie-mesprit-azelf-max-battle-day-2026.
- Indonésia: mesmo ID, Pikachu batik/Fundo Especial, Incenso de duas horas, Brilhantes e prazo separado da pesquisa; Jacarta continua referência da conversão, sem alegar um só fuso para toda a Indonésia. Fonte: https://pokemongo.com/news/patterns-of-the-wild-2026.
- Mega Victreebel: fonte alinhada a Leek Duck/comunidade; datas/horários preexistentes preservados. Fontes e limites em `MEGA_VICTREEBEL_BRIEF_20261001.json`.

Catálogo único: 121 → 124 eventos; nenhum ID antigo renomeado. Novidades deriva do catálogo, agrupa somente artigos oficiais equivalentes e oferece uma ação para cada período. Calendários da comunidade com URL compartilhada continuam eventos separados. Registro rastreável: `NEWS_UPDATE_20261001.json`.

## FLY

Trio: indica Pokémon por região em 25/28 linhas, mantendo Essenciais 20 / Todos 28 e coordenadas antigas. Índia é Mesprit, não Uxie. Atribuição operacional deriva das regiões oficiais e da geografia dos pontos; não é uma confirmação primária cidade a cidade. Kiritimati/Honolulu/Pago Pago permanecem sem Pokémon atribuído, com aviso, porque o anúncio não identifica limites das ilhas. Horários seguem calculados por data/IANA e incluem DST.

## Arte

Mega Victreebel candidata v2 PENDING_REVIEW, 1121×1403, SHA256 `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`. Pôster completo, 30/09–06/10/2026, fonte comunidade, sem bônus não confirmados. Geração built-in imagegen; v1 preservada, v2 remove torres/ícones de Batalhas Max inadequados. Prompts, inputs, hashes e histórico em `MEGA_VICTREEBEL_REVIEW_20261001.json`. Master APPROVED byte a byte intacto. Nenhuma nova aprovação.

## Verificação local

21 testes Node passaram. Sintaxe dos 19 scripts ativos + SW, unicidade dos 124 IDs, arquivos de cache e hashes passaram. Cache local: 66 arquivos / 18.906.598 bytes, não medição de download. Preview mobile/desktop concluído no código `282ea97`; evidência e limites abaixo.

## Limites públicos

Linha de frente: cobertura Premium ainda incompleta; Applin/Espaço recusados sem arquivo novo. Android físico/PWA/upgrade/offline/push e GPX real permanecem pendentes; clipboard comprovado somente no app direto desktop desta rodada. Novidades atualizado editorialmente nesta branch, sem nova prova de ingestão automática do feed. Lineups Rocket coletados de G47IX não foram misturados a alegações oficiais. Nenhuma promoção a main/produção ou envio ao Discord.


## QA concluído — código 282ea97

Preview direto verificado: https://spidey-pokemon-8hxqv2mhj-spidey3.vercel.app/spidey-app/index.html (Vercel READY `dpl_5z7TiyUrGzgErZSe9ttfvR4vRy7B`). A correção entre `2eeb5c2` e `282ea97` reutiliza a apresentação de horários do jogador em Novidades; elimina a etiqueta ambígua de local + Brasília. Nenhum PNG/dado factual mudou nesse ajuste.

- Mobile: iframe 390×850, conteúdo/scroll 375px, Claro. Um anúncio Minior, três ações; Geminidas abre o ID de dezembro com datas e nota de hemisférios. Trio mantém horário local regional, fonte/bônus/ingresso separados.
- Novidades → detalhe do trio → ação única FLY: fecha modal, mantém `2026-10-dynamax-max-battle-day` selecionado; Essenciais 20 / Todos 28. Taipei Uxie 24/10 03–06h Brasília; Chennai Mesprit 05h30–08h30; Londres Mesprit 10–13h; Nova York Azelf 15–18h; Pago Pago sem Pokémon inferido, 24/10 22h→25/10 01h.
- Desktop: iframe 1280×850, conteúdo/scroll 1265px, Escuro. Novidades legível e agrupado; Mega Victreebel v2 carregado completo 1121×1403 no detalhe, inteiro com contain; mesmo PNG na Home/Semana. Mobile pôster 360×450,55px, detalhe inicia em zero e foco no Fechar.
- App direto: cliques em Novidades/evento/rota comprovados; cópia de Taipei conferida no clipboard `25.033964,121.564468`. API de clipboard do iframe retornou vazio apesar do toast; somente a prova direta é considerada válida. Isto não comprova clipboard Android.
- Masters Xerneas/Invasão/Cinderace carregados íntegros 1121×1403 na Home direta. Seedot e demais masters/originais preservados byte a byte e cobertos pelos testes; não reabertos para aprovação.
- 21 testes Node passaram após o ajuste; sintaxe/JSON/cache/hashes/IDs já conferidos. Sem novo teste Android físico/PWA/offline/push/GPX.

Provas JPEG (mesmos bytes conferidos e salvos):

- [Mega Victreebel mobile](mega-victreebel-mobile-review-282ea97-20261001.jpg)
- [Mega Victreebel desktop responsivo](mega-victreebel-desktop-review-282ea97-20261001.jpg)
- [Mega Victreebel app direto — peça apresentada](mega-victreebel-direct-review-282ea97-20261001.jpg)
- [Novidades desktop](news-desktop-282ea97-20261001.jpg)

Dados da observação em `news-browser-evidence-282ea97-20261001.json`; hashes em `NEWS_UPDATE_20261001.json`/`MEGA_VICTREEBEL_REVIEW_20261001.json`. Nova candidata segue PENDING_REVIEW, sem decisão humana. Inventário 01–07/10: 23 eventos, 4 APPROVED, 1 pôster PENDING_REVIEW, 18 sem arquivo Home/FLY. Checkpoint documental posterior apenas grava evidência; código/artes conferidos são os de `282ea97`. Próximo: decisão humana do PNG Mega Victreebel v2, demais coberturas e Android/PWA/push. Nenhuma promoção a main/produção.
