# SPIDEY APP — CONSTITUIÇÃO DO PRODUTO

Estado corrente — 04/10: Sete novos pôsteres APPROVED por USER_DELEGATED_VISUAL_QA, sob a autorização explícita de 03/10 23:13 BRT para seguir sem confirmação individual. QA de artes PASSED_PREVIEW_ART_BATCH no código `e766dde`: 33 testes, sete peças abertas em mobile Claro 390×850 e desktop Escuro 1280×850, 14 capturas e sete PNGs servidos idênticos aos arquivos aprovados. Master com 25 entradas; todas as 18 entradas/17 arquivos anteriores preservados. Janela 01–07/10: 23 eventos, 20 APPROVED, 0 candidatas e 3 sem arte (Applin/Espaço/Sizzlipede, recusas anteriores mantidas). Público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registros: `docs/qa/REMAINING_ART_BATCH_20261003.json` e `docs/qa/remaining-art-batch-browser-e766dde-20261004.json`.

Status: BASE ESTRATÉGICA CONGELADA
Data: 2026-09-30
Prioridade máxima: APP

## 1. Objetivo
O Spidey é um aplicativo para a comunidade Pokémon GO com foco em transformar eventos, horários, localizações e informações confiáveis em uma experiência operacional rápida no celular. O canal não é o produto principal.

O público prioritário inclui jogadores FLY que acompanham e participam de eventos em diferentes regiões do mundo. O App deve reduzir o trabalho de procurar fusos, converter horários e localizar hotspots.

## 2. Diferencial
O Spidey não deve ser apenas um calendário ou agregador de notícias. Deve responder rapidamente:
- O que está acontecendo agora?
- O que começa depois?
- Em qual lugar do mundo?
- Qual é o horário local e o equivalente em Brasília?
- Quais são as coordenadas?
- Existe rota GPX validada?
- O que está oficialmente confirmado?
- O que o jogador precisa fazer/aproveitar?

## 3. Fonte e confiança
- Fonte primária/oficial tem precedência.
- Informação secundária, datamine ou não confirmada deve ser identificada explicitamente.
- Nunca transformar hipótese em fato oficial.
- Nunca inventar horário, Pokémon, bônus, traje, forma, coordenada ou local.
- Informação oficial nova pode atualizar dados, mas não pode silenciosamente destruir elementos já aprovados que continuam válidos.

## 4. Eventos
- Cada evento possui eventId estável e único.
- Eventos simultâneos continuam eventos distintos.
- Eventos relacionados podem ser vinculados sem serem fundidos.
- Eventos globais e locais devem ser diferenciados.
- Estado temporal: acontecendo agora, próximo, futuro ou encerrado.

## 5. Horários mundiais e coordenadas
Para eventos locais/mundiais, preservar quando disponível:
- cidade e país;
- horário original/local;
- timezone IANA;
- conversão dinâmica para America/Sao_Paulo (Brasília) na data real do evento;
- indicação de mudança de dia quando ocorrer;
- latitude/longitude verificadas;
- ação de copiar coordenadas;
- acesso ao mapa;
- GPX quando aplicável e validado.

REGRA: o Spidey NÃO exibirá coluna/conversão de horário de Portugal. O padrão do produto é Horário Local + Horário de Brasília.

Taipei/Taiwan é a referência asiática definida no lugar de Singapura quando aplicável à rota rápida do sistema. Singapura pode permanecer na base geográfica completa se houver utilidade, mas não ocupa o lugar de Taipei na seleção estratégica previamente definida.

A lista histórica fornecida pelo projeto (Kiritimati, Samoa, Nova Zelândia, Austrália, Coreia, Japão, Taipei, Hong Kong, Indonésia, Índia, Maldivas, Oriente Médio, Europa, Brasil, Américas, Havaí, Samoa Americana e respectivos hotspots/coordenadas) é BASE GEOGRÁFICA, não tabela fixa de horários. Conversões antigas, inclusive as de 2023, nunca devem ser reutilizadas como horário atual: devem ser recalculadas por timezone/data.

## 6. Artes Premium — regra de autoridade única
- Existe uma única autoridade visual: catálogo master de artes aprovadas por eventId.
- Arte APPROVED é imutável por módulos secundários.
- Nenhum fallback, heurística, thumbnail, IA, script de confiança ou correção posterior pode substituir uma arte APPROVED.
- A mesma arte aprovada deve ser reutilizada em Hoje, Semana, Calendário e Detalhes, respeitando apenas crop/layout apropriado.
- Variações horizontal/vertical são assets distintos quando aprovadas separadamente.
- Uma arte recebe APPROVED após validação factual e aprovação visual humana ou QA visual delegado por autorização explícita vigente do responsável. Registrar a origem da decisão; a autorização de 03/10, 23:13 BRT dispensa confirmação individual para as próximas peças no padrão validado.
- Uma arte factualmente incorreta perde o estado APPROVED, mesmo que visualmente boa.

## 7. Identidade visual
- Preservar identidade Spidey consistente: marca, tipografia visual, hierarquia, linguagem e padrão Premium.
- Modos claro, escuro e sistema são requisitos permanentes.
- Mobile é a referência principal de QA.

## 8. Home
A Home deve priorizar utilidade imediata:
1. acontecendo agora;
2. próximos eventos;
3. destaques relevantes;
4. acesso ao calendário;
5. FLY/Eventos pelo Mundo;
6. raids e demais módulos relevantes.
Evitar poluição visual, duplicação de informação e cards sem função clara.

## 9. FLY / Eventos pelo Mundo — ESPECIFICAÇÃO CONGELADA
O FLY é função de primeira classe do Spidey e não deve ficar escondido em detalhes profundos do evento.

### 9.1 Eventos elegíveis
A rota mundial deve ser reutilizável para eventos com janela local que se propaga pelos fusos, incluindo quando aplicável:
- Hora do Holofote;
- Dia Comunitário e Dia Comunitário Clássico;
- Dia de Reides;
- Dia de Pesquisa;
- Hatch Day / Dia de Chocar Ovos;
- Dia de Incenso;
- eventos especiais equivalentes.

### 9.2 Card/entrada
Cards elegíveis devem tornar evidente a existência da ferramenta, por exemplo:
FLY — JOGAR PELO MUNDO
- quantidade de locais/hotspots;
- horários convertidos para Brasília;
- coordenadas prontas para copiar;
- ação VER ROTA MUNDIAL.

### 9.3 Rota Mundial
A experiência deve representar a progressão do evento pelo planeta, na ordem em que cada janela local começa.
Deve permitir entender visualmente a lógica: COMEÇA PRIMEIRO -> ROTA MUNDIAL -> ÚLTIMAS REGIÕES.

Não gravar números de fusos/horários fixos em uma imagem estática como fonte de verdade. O mapa pode ser visual; a ordem e os horários são dados dinâmicos calculados para a data do evento.

### 9.4 Linha do tempo
A lista deve ser ordenada cronologicamente pelo equivalente em Brasília e destacar:
- AGORA / ATIVO AGORA;
- PRÓXIMO;
- FUTURO;
- ENCERRADO;
- ÚLTIMA CHANCE.

Quando útil, exibir contagem regressiva para a próxima janela.

### 9.5 Cada etapa/local
Mostrar quando disponível:
- bandeira;
- cidade/país;
- hotspot;
- horário local do evento;
- data e horário equivalentes em Brasília;
- aviso quando a conversão cair no dia anterior/seguinte;
- coordenada latitude,longitude;
- botão COPIAR COORDENADAS;
- abrir localização/mapa;
- GPX quando validado.

Locais simultâneos podem ser agrupados por janela, preservando cada coordenada individual.

### 9.6 Essenciais x lista completa
A interface pode ter:
- ESSENCIAIS: hotspots estratégicos da rota rápida;
- TODOS OS HOTSPOTS: base geográfica completa.
Isso evita despejar dezenas de coordenadas na primeira tela sem remover informação do usuário avançado.

### 9.7 GPX
Coordenada principal e GPX são recursos distintos.
- GPX só é disponibilizado quando houver rota/pontos úteis e validados.
- Não gerar rota baseada em coordenadas aproximadas ou não verificadas.
- GPX incompleto deve permanecer bloqueado/indisponível.
- Eventos sem necessidade de rota podem oferecer somente coordenadas.

### 9.8 Onde jogar agora?
O FLY deve poder oferecer visão operacional imediata:
- região/local ativo agora;
- próximo hotspot/janela;
- tempo restante ou contagem para início;
- última janela mundial disponível.
O objetivo é o jogador não precisar fazer cálculo manual de fuso.

### 9.9 Mapa mental mundial
O mapa mundial fornecido pelo projeto é referência conceitual de UX: mostrar a progressão do evento acompanhando os fusos/amanhecer. Não deve ser tratado como tabela factual imutável. Samoa Americana representa conceitualmente uma das últimas oportunidades da sequência, mas o cálculo real deve vir dos timezones/dados do evento.

## 10. Automação
Fluxo alvo:
fontes -> coleta -> normalização -> validação -> dados do App.
Automação não possui autoridade para aprovar arte nem promover informação duvidosa a oficial.

## 11. Arquitetura
Deve existir um único dono para cada domínio:
- dados/eventos;
- horários/localização;
- artes;
- confiança/editorial.
Módulos não podem competir pela mesma decisão.
Scripts legados concorrentes devem ser progressivamente removidos após equivalência comprovada.

O FLY deve consumir os dados existentes de eventos e localização; não criar uma segunda fonte concorrente de eventos.

## 12. Preview, QA e produção
Fluxo obrigatório:
branch de trabalho -> preview Vercel -> QA mobile -> validação factual -> validação visual -> aprovação -> produção/main.
Build READY não significa produto aprovado.
Main não deve receber mudanças antes da aprovação da preview.

## 13. REGRA MÁXIMA DE NÃO REGRESSÃO
Nenhuma versão nova pode regredir algo já aprovado.
Exemplos:
- atualizar coordenadas não pode remover Xerneas Premium;
- alterar calendário não pode quebrar modo escuro;
- adicionar confiança editorial não pode esconder artes aprovadas;
- atualizar um evento não pode reintroduzir fallback antigo;
- desenvolver FLY não pode substituir/remover as coordenadas já existentes antes de comprovar equivalência;
- remover Portugal da interface não significa apagar localidades portuguesas úteis da base geográfica; significa não exibir a conversão de fuso portuguesa.
Antes de promover uma versão, verificar explicitamente as funcionalidades e assets aprovados anteriormente.

## 14. Estados de controle
Toda frente relevante deve ser classificada como:
- APROVADO
- IMPLEMENTADO
- PARCIAL
- PENDENTE
- DESCARTADO
A existência de código não equivale a APROVADO.

## 15. Harvest Festival — correção factual conhecida
O material visual anteriormente tratado como Harvest Festival, com Pumpkaboo em protagonismo, não deve ser considerado aprovado para representar o evento se os dados oficiais exigirem Applin como protagonista/destaque. Conteúdo factual tem precedência sobre estética.

## 16. Próximas etapas técnicas
### Artes
1. Inventariar os assets visuais aprovados reais.
2. Validar cada um contra os dados oficiais correspondentes.
3. Consolidar arquivos no repositório.
4. Vincular cada asset exclusivamente por eventId no catálogo master.
5. Remover autoridade visual dos scripts concorrentes.
6. Executar teste de não regressão.

### FLY
1. Inventariar a implementação de coordenadas/20 locais que já existe no App.
2. Localizar a fonte de dados atual e preservar o que funciona.
3. Consolidar timezone IANA por hotspot.
4. Remover a exibição/conversão de Portugal da UX.
5. Criar entrada FLY evidente nos cards elegíveis.
6. Implementar Rota Mundial/Agora/Próximo/Última Chance consumindo os dados existentes.
7. Manter GPX condicionado a dados validados.
8. Testar isoladamente sem alterar Home/artes Premium.
9. Gerar preview para aprovação antes de integração definitiva.

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
