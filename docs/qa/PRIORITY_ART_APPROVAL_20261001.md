# Invasão e Cinderace — consolidação pós-aprovação, 01/10/2026

Invasão e Cinderace estão **APPROVED** por “Sim, aprovo”, 01/10/2026 15:45:53 BRT, sobre os dois PNGs exatos apresentados no checkpoint `df9d050` (QA `684d80e`). Cópias byte a byte no master, sem regeneração. Decisão/arquivos/eventIds/hashes/provas em [PRIORITY_ART_APPROVAL_20261001.json](PRIORITY_ART_APPROVAL_20261001.json). Geração/fatos/prompts históricos preservados em [PRIORITY_ART_REVIEW_20261001.json](PRIORITY_ART_REVIEW_20261001.json).

Código pós-aprovação validado: `a242f88cbe575902c064110883d71e1ef12778b4`, branch `spidey-fly-v1`. Deploy `dpl_EHiVvMsaDnwNeXGHPsofynKN6UDd`, READY, preview: https://spidey-pokemon-huc1kneau-spidey3.vercel.app/spidey-app/index.html. Nenhuma promoção a main/produção.

## Resultado observado

| Evento | Arquivo ativo | SHA256 |
|---|---|---|
| A Invasão | `assets/events/premium/harvest-invasion-approved-v1.png` | `918d1a6735191636a5f26cee9d3a8ae61c8fc6a1d2c09e70e894bb6f70570165` |
| Cinderace | `assets/events/premium/cinderace-max-day-approved-v1.png` | `b8f9b02488e8817bdb250c676a04e6503f4492d84a55836124f7ae94bd34e470` |

- Preview responsivo com 390×850 (Claro) e 1280×850 (Escuro). Ambos os pôsteres realmente decodificados: `complete=true`, naturais 1121×1403, paths premium e queries dos hashes corretos. Peças inteiras, datas/painéis/assinatura visíveis.
- Home, Semana e detalhe mantêm a autoridade do master. As duas ocorrências de Cinderace na Semana e Invasão carregaram os PNGs aprovados; Xerneas continua no PNG aprovado `b9e3b4629234`, naturais 1121×1403.
- Detalhes iniciam em `scrollTop=0`, Fechar acessível. Sem overflow horizontal nas medidas documentais: 375/375 mobile e 1265/1265 desktop. O app foi conferido em iframe responsivo; isto não equivale a teste em Android físico.
- Cinderace conserva 03/10, 14–17h locais, fonte oficial e bônus/condições pagos separados. Uma ação Ver rota mundial fecha o diálogo e seleciona o eventId correto no FLY. Arte premium carregada no painel; 20 essenciais e 28 pontos completos, incluindo as duas referências preservadas de Taipei com a mesma conversão 03/10 14–17 local → 03/10 03–06 Brasília. Nenhuma referência aproximada promovida a Ponto de Energia exato.
- App direto aberto, código master5 conferido e Cinderace realmente decodificado; endereço seguro pós-redirecionamento acima e aba deixada disponível.
- Cache/shell versionados para `priority-art-approved-v1`; precache aponta para os novos arquivos aprovados. Candidatas, originais e prompts históricos preservados. Testes verificam igualdade de bytes e exclusividade da decisão. Xerneas/Hora de Reides/Festival das Luzes conservam aprovação e hashes.

## Provas pós-aprovação

| Arquivo | Prova |
|---|---|
| [invasion-mobile-approved-a242f88-20261001.jpg](invasion-mobile-approved-a242f88-20261001.jpg) | Mobile claro, Invasão completa e Fechar acessível |
| [cinderace-mobile-approved-a242f88-20261001.jpg](cinderace-mobile-approved-a242f88-20261001.jpg) | Mobile claro, Cinderace completo e horário correto |
| [cinderace-desktop-approved-a242f88-20261001.jpg](cinderace-desktop-approved-a242f88-20261001.jpg) | Desktop escuro, Cinderace completo, aberto pelo FLY |
| [invasion-desktop-approved-a242f88-20261001.jpg](invasion-desktop-approved-a242f88-20261001.jpg) | Desktop escuro, Invasão completa, aberta pela Semana |

Capturas JPEG em contexto, sem edição, vinculadas por SHA256 no registro de aprovação. Provas anteriores das candidatas continuam preservadas em [PRIORITY_ART_20261001.md](PRIORITY_ART_20261001.md).

## Verificações e continuidade pública

`node --test tests/fly-core.test.cjs tests/player-ui.test.cjs tests/priority-art.test.cjs`: **14 passaram**. Sintaxe dos 18 scripts ativos e SW, JSON, caminhos do precache, hashes de aprovação/originais/provas e `git diff --check`: passaram. Tree remoto idêntico ao tree staged local (`7fd71120f89b4a8e40175055e0d173561c0bdac9`); HEAD de branch consolidado por atualização sem force. Backend inalterado; testes Python anteriores não contados como nova prova.

Inventário: 23 eventos de 01–07/10, **3 no master APPROVED**, **1 recorte pendente**, **19 sem arquivo Home/FLY**; cobertura técnica de interface não conta como Premium. Applin continua sem nova imagem após recusa da ferramenta. Seedot/Zorua não recebem aprovação nesta decisão; Harvest/Pumpkaboo continua revogado. Invasão/Applin seguem fora das categorias atuais da rota FLY.

Próximos: arte de Applin/cobertura restante; QA Android físico/instalação/upgrade/offline PWA/push; prova de clipboard/GPX. Nenhuma dessas verificações foi concluída nesta rodada. Aprovação dos dois PNGs não aprova o lançamento público completo. Amigos/Chat permanece posterior ao núcleo e NÃO IMPLEMENTADO.
