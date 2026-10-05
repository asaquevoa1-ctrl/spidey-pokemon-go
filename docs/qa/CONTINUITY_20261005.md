# SPIDEYNEXUS — retomada e comprovação de 05/10/2026

Responsável pelo projeto: Anderson Luís Corrêa da Silva. Horários editoriais em Brasília.

## Versões e resultado

A retomada partiu de `main` em `29ad1de19d0e56f655e2947d5fb656b5d4e2f1d9`, igual à consulta do guia. As correções foram verificadas na prévia `bf0592486d822098f0682c013e956a7887047cf4`, publicadas pela [PR 21](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/pull/21) em `d08b6cd53fdbab9c0443dd15ffae1ccfd16b1d24` e atualizadas pelo próprio workflow semanal em `a48da342fdb3281d8503cac3a4ff9f2d15461275`.

Produção desse último commit: deployment `dpl_8kT8Nvmy5tGyUyLmPtawbbM8t61S`, READY, target `production`, com o domínio permanente associado. O app abriu sem login em **https://spidey-pokemon-go.vercel.app/spidey-app/**. Esse continua o endereço para os jogadores.

## Falhas corrigidas

O run semanal `37304877373` falhou em `2026-09-tcg-30th-us-retail sem weekly_art`, deixando o app na semana de 28/09 a 04/10. O novo gerador usa o arquivo exato do master aprovado e confere seu SHA256; a ilustração oficial da Semana do Espaço permanece separada de Premium. Entradas sem arquivo aprovado mantêm a data simples já usada na interface e continuam na agenda. Nenhuma capa substituta é gerada.

A Semana publicada mostra **05/10 a 11/10**, com 19 eventos: 11 com arte Premium, um com imagem oficial e sete sem arte. A validação confere o período, os sete dias, a elegibilidade dos eventos, a origem das imagens e as contagens reais. O pacote canônico, a cópia do app e o arquivo da semana são iguais.

No desktop, o menu lateral cobria o botão Voltar e a mensagem de atualização. Ambos passaram para a área do conteúdo. O botão possui altura mínima de 44 px. A versão do shell e do cache foi atualizada; isso não certifica a atualização de uma PWA instalada no Android.

## Provas

- 70 testes Node e quatro testes do gerador semanal passaram, sem falhas. Gate de autopublicação e `git diff --check` passaram.
- [Workflow semanal corrigido](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/actions/runs/37308191466): success, validou os dados e gravou automaticamente `a48da34` em `main`. [Pipeline curado](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/actions/runs/37308191375): success.
- 39 arquivos públicos responderam 200 e foram comparados byte a byte, incluindo o shell, os três catálogos, o master, seus 31 arquivos originais para 32 entradas e a ilustração oficial. As APIs dos catálogos também corresponderam aos dados de `a48da34`: 130 eventos, quatro coleções e a semana correta.
- Prévia: iframe de 390 × 850 nos temas Claro/Escuro; largura útil de 375 px e scroll de 375 px. Desktop de 1348 px, sem overflow da página. O botão Voltar recebeu o clique na sua própria área e retornou ao Início; o histórico do navegador fechou o detalhe de Xerneas.
- Xerneas: o PNG original aprovado apareceu completo no modal móvel de 360 px, com scroll de 360 px. Voltar fechou o modal. Não houve edição ou geração desse arquivo.
- Produção: Semana correta, botão acessível e retorno Semana → Início observados em desktop. A prova visual está em `proofs/continuity-production-weekly-a48da34-20261005.jpg`.

Relatórios estruturados: `CONTINUITY_20261005.json` e `continuity-public-http-a48da34-20261005.json`. Os horários de cada consulta e os hashes estão nesses arquivos. As capturas da prévia e da produção são versionadas em `proofs/`.

## Alertas: configuração comprovada, aparelho pendente

O diagnóstico antigo de servidor sem configuração ficou histórico. VAPID e armazenamento Blob privado estão presentes na configuração. `/api/push/public-key` respondeu 200; `/api/push/dispatch` sem credenciais respondeu 401, como esperado.

Uma execução automática autenticada, run `37304404859`, job `111744499690`, retornou em 05/10 às 08:40:13 de Brasília:

```json
{"ok":true,"dry_run":false,"due":0,"deliveries":0,"storage_configured":true}
```

Os logs de produção confirmaram POST com status 200 às 07:57:35, 08:19:34 e 08:40:12 de Brasília. A configuração prevê cron de cinco minutos, mas essas execuções não comprovam pontualidade. Com `due = 0`, esse retorno também não comprova leitura/gravação de uma assinatura no armazenamento nem envio ao provedor.

O navegador cloud informou que notificações estão bloqueadas. Nenhuma notificação de teste foi enviada nesta retomada, nenhuma assinatura artificial foi criada e não há prova de recebimento no Android. Para fechar essa frente, usar **Ativar alertas → Testar alerta** no aparelho e conferir o recebimento; depois verificar um alerta agendado, abertura do app pela notificação e desativação. Registrar horário, evento, versão e resultado real, sem guardar a chave privada ou a assinatura do aparelho no repositório.

## Datas, FLY e Japão

O catálogo mantém a rotação Xurkitree/Buzzwole/Pheromosa de 23 a 29/09. A referência consultada é da comunidade, identificada dessa forma no app; o limite legado das 22h no dia 29 não foi promovido a confirmação oficial de troca de chefe.

Na Hora de Reides das Ultracriaturas, FLY mostrou 23/09, 18h–19h locais, evento encerrado. Taipei mostrou 07h–08h de Brasília nessa data, e a última janela em Pago Pago terminou em 24/09 às 03h de Brasília. Os 20 locais essenciais, a base de 28, Taipei e as duas referências de horário foram preservados; não foi acrescentada coluna de Portugal. A localização desses pontos continua aproximada, sem promoção a PokéStop exata.

Selos mostrou quatro coleções, 513 locais e uma rota GPX pronta. A campanha dos Centers já contém 18 locais, incluindo Pokémon GO Lab.; o GPX respondeu 200 com 18 waypoints, 1.952 bytes, SHA256 `020ffdf31f736d6583d60b74d39c231ce3ffcb62b8af990fcc5f4af56fbcf606`. A prova antiga de 17 pontos permanece histórica.

PokéLids contém 482 referências oficiais dos locais das tampas em 42 prefeituras. Sua rota GPX respondeu 409 `exact_coordinates_required`. Isso não comprova todas as PokéStops ativas nem sua posição exata no jogo. Nagasaki mantém oito locais com precisão ainda a conferir. Datas, fontes, coordenadas e rotas desses catálogos não foram editadas nesta entrega.

## Pendências preservadas e próxima retomada

| Frente | Comprovação desta entrega | Próxima comprovação |
| --- | --- | --- |
| Publicação | READY, domínio permanente, acesso anônimo e arquivos exatos | Conferir novamente a versão após futuras entregas |
| Voltar | Desktop, abas/modal e histórico do navegador | Botão do Android e toque real entre todas as telas |
| Alertas | Configuração presente, agendamento executado e endpoint autenticado 200 | Cadastro/gravação, teste recebido, alerta agendado e desativação no aparelho |
| Agenda automática | Workflow corrigido, commit automático, API e UI na mesma semana | Novo anúncio oficial → calendário publicado → atualização no app aberto |
| Xurkitree | Datas preservadas, fonte da comunidade e janela FLY conferidas | Fonte oficial para eventual alteração; não atribuir certeza ao limite legado |
| Linguagem | Textos das telas visitadas observados | Revisão completa das telas, mensagens e estados de erro |
| Artes | Master exato preservado; cobertura semanal auditada | Cobertura restante, preservando as recusas de Applin, Espaço e Sizzlipede |
| Japão/PokéLids | Coleções visíveis, 482/42, GPX bloqueado; Centers com 18 pontos | Cobertura visual, locais ativos e precisão no jogo |
| PWA | Versão do shell/cache atualizada no código | Instalação, atualização, abertura e offline no Android |
| Amigos/chat | Proposta anterior preservada | Implementar perfil, amigos e conversa; verificar entre contas |
| Projeto no ChatGPT | Guia salvo e referenciado no repositório | Criar/organizar o Projeto e mover conversas pela opção do ChatGPT |

Primeiro fechar o recebimento dos alertas no aparelho e os testes de navegação/PWA no Android. Em paralelo, continuar revisão de linguagem, cobertura de artes e precisão dos locais. Amigos/chat permanece na lista após a estabilização do núcleo público.

Esta entrega atualiza os registros do projeto; não certifica o aparelho físico, cobertura Premium integral, pontualidade do cron nem todas as PokéStops do Japão.
