# Artes prioritárias — QA de 01/10/2026

Código validado: `684d80e794cecaecf66991f96b4d74c963fb444c`, branch `spidey-fly-v1`, continuidade de `bf345c2`/`f32ae6e`. Preview direto conferido: https://spidey-pokemon-6a6143fc8-spidey3.vercel.app/spidey-app/index.html. Sem promoção a main/produção.

## Resultado concreto

Dois pôsteres corrigidos integrais, PNG 1121×1403, **PENDING_REVIEW**. Edição com a ferramenta built-in `image_gen`; originais preservados. Arquivos exatos, SHA256, fontes e prompts completos estão em [PRIORITY_ART_REVIEW_20261001.json](PRIORITY_ART_REVIEW_20261001.json). A resposta anterior “Sim, aprovo” continua exclusiva de Xerneas.

| Evento | Correção factual da peça | Estado |
|---|---|---|
| Festival da Colheita: A Invasão | 02/10 às 00h → 05/10 às 20h locais; Zekrom Sombroso com Giovanni; remoção de Frustração com MT carregada; removido Zekrom em reides e painéis não confirmados | PENDING_REVIEW |
| Cinderace Gigamax | 03/10, 14–17h locais; seis estrelas; estreia do Brilhante; removidos horário 10–20h e bônus incorretos | PENDING_REVIEW |
| Pomar de Applin | Fonte oficial, título e condições dos bônus atualizados no app; geração recusada pela ferramenta, sem imagem entregue | ARTE PENDENTE |

Fontes primárias verificadas em pt-BR em 01/10: [Pomar de Applin](https://pokemongo.com/pt-BR/news/harvest-festival-2026), [A Invasão](https://pokemongo.com/pt-BR/news/harvest-festival-tgr-2026), [Cinderace](https://pokemongo.com/pt-BR/news/gigantamax-cinderace-max-battle-day-2026). Fontes da Semana também alinhadas. Os bônus do Passe GO ficam condicionados aos ranques; PE de Cinderace com ingresso permanece identificado como pago. Nenhuma chance aumentada de Applin Brilhante inventada.

## Preview realmente observado

- Mobile configurado em 390×850 e desktop em 1280×850; temas claro e escuro. Ambos os pôsteres renderizam completos, `complete=true`, dimensões naturais 1121×1403, paths e queries correspondentes aos SHA256 do registro.
- Mobile: Invasão e Cinderace abertos a partir da Home/Semana; datas, painéis e assinatura visíveis, Fechar acessível e foco inicial nele; detalhe começa em `scrollTop=0`. Sem overflow horizontal nas medidas conferidas (375/375 e 390/390 no mobile; 1265/1265 no desktop).
- Desktop: pôster inteiro com proporção preservada, sem corte dos textos; Invasão aberta pela Semana e Cinderace pelo FLY/detalhe. As imagens reais dos cards da Semana também carregaram 1121×1403, inclusive as duas ocorrências de Cinderace.
- Cinderace estava sem tag Global no primeiro QA `7dc5a63`: faltavam FLY e explicação de horário local, e aparecia aviso incorreto de local pendente. Corrigido no catálogo e na Semana em `684d80e`; core/categorias existentes preservados.
- A ação única Ver rota mundial fecha o detalhe e seleciona Cinderace no FLY; arte, bônus e fonte presentes. Essenciais 20 / Todos 28. Taipei: 03/10 14–17 locais → 03/10 03–06 em Brasília. Kiritimati: início em 02/10 21h de Brasília; último fim Pago Pago em 04/10 01h. São referências aproximadas, não coordenadas inventadas de Pontos de Energia.
- Xerneas pela Semana continua usando exclusivamente `assets/events/premium/xerneas-rotation-approved-v1.png?v=b9e3b4629234`, íntegro 1121×1403. Master, Hora de Reides e Festival das Luzes conservam hashes originais.
- Applin no app direto mostrou bônus condicionais e observações oficiais. Nenhuma candidata de Applin registrada; sem Pumpkaboo recuperado/revogado ativo. O detalhe ainda tem cobertura técnica vetorial/CSS, não Premium. Fechar conferido no app direto.
- App direto aberto e conferido; Cinderace deixado disponível para revisão. Amostra de erros de console consultada: erros da extensão do navegador, sem nova falha de app identificada nessa amostra. Isso não comprova ausência total de erros.

## Provas preservadas

| Arquivo | Prova |
|---|---|
| `invasion-mobile-684d80e-20261001.jpg` | Moldura mobile e detalhe da Invasão no código final; captura da região do app, 393×852 |
| `invasion-desktop-dark-684d80e-20261001.jpg` | Desktop escuro, pôster da Invasão inteiro |
| `cinderace-mobile-684d80e-20261001.jpg` | Mobile claro, Cinderace inteiro e horário correto |
| `cinderace-mobile-review-684d80e-20261001.jpg` | Revisão pela Semana no mobile do código final |
| `cinderace-desktop-dark-684d80e-20261001.jpg` | Desktop escuro, Cinderace inteiro |
| `invasion-mobile-7dc5a63-20261001.jpg` | Prova histórica do primeiro código antes da correção da tag de Cinderace |

## Verificações e limites

`node --test tests/fly-core.test.cjs tests/player-ui.test.cjs tests/priority-art.test.cjs`: **14 passaram**. Incluem hashes dos masters e originais, candidatas sem aprovação, resolução consistente por contexto, prioridade do master e rota real de Cinderace/Taipei. Sintaxe dos 18 scripts ativos e `sw.js`, dados JSON, arquivos de precache e `git diff --check`: passaram. Backend Python não mudou; não repetir os 28 testes anteriores como nova prova desta revisão.

Arte de Applin bloqueada nesta tentativa (`moderation_blocked`, saída; request ID no manifesto), sem fallback CLI ou substituição pelo Harvest/Pumpkaboo. Dois pôsteres novos requerem decisão humana sobre os bytes exatos. Cobertura restante, Android físico, instalação/upgrade/offline PWA, entrega push e clipboard/arquivo GPX real seguem pendentes. Applin e Invasão, de vários dias, ainda não pertencem às categorias atuais da rota FLY. Amigos/Chat continua posterior ao núcleo e NÃO IMPLEMENTADO. Este QA não aprova o lançamento completo.
