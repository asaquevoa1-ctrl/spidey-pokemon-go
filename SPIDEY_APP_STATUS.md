# SPIDEY APP — handoff canônico

Atualizado em 28/09/2026.

## Decisão de produto

O destino principal do projeto é um **aplicativo/PWA público Spidey Pokémon GO**.

WhatsApp/Discord não são o produto final. O Discord pode continuar existindo como painel editorial e de exceções, mas **a aprovação humana não deve ser obrigatória para todos os eventos**.

### Fluxo alvo revisado

`Fontes → captura → extração/estruturação → validações automáticas → geração de arte Premium → publicação no Spidey App → notificações`

Quando a fonte for confiável e todas as validações passarem, o evento pode ser publicado automaticamente.

A revisão humana fica reservada para exceções, por exemplo:

- conflito entre fontes;
- data/horário ambíguo;
- timezone ausente ou incoerente;
- coordenada não confirmada;
- arte fora do padrão;
- baixa confiança do conteúdo;
- qualquer dado que possa induzir o usuário ao erro.

A meta é eliminar o usuário como gargalo sem remover as travas de segurança editorial.

## Produto desejado

O app deve concentrar:

- calendário mensal de eventos;
- dias destacados quando há evento;
- abertura do evento ao tocar no dia/card;
- arte Premium;
- horários locais e conversão para Brasil;
- coordenadas em formato copiável `latitude, longitude`;
- GPX para download quando houver coordenadas reais/adequadas;
- bônus, Pokémon em destaque, raids, pesquisas, recompensas e demais informações;
- fonte oficial;
- notificações;
- filtros/favoritos;
- mapa;
- módulo de **GO Stamp Rally / Stamps**.

## Estado atual do app

**FUNCIONA — primeira versão pública real.**

Código do app: `spidey-app/` na `main`.

Hospedagem: Vercel.

URL pública atual:

`https://spidey-pokemon-go.vercel.app`

Vercel está conectado ao repositório `asaquevoa1-ctrl/spidey-pokemon-go` e faz deploy automático a partir da `main`.

A PWA já provou no celular:

- abertura pública;
- layout mobile;
- calendário mensal;
- navegação entre meses;
- listagem de próximos eventos;
- abertura do detalhe do evento;
- horários local/Brasil;
- estrutura de coordenadas copiáveis;
- geração de GPX quando habilitada;
- service worker/offline básico;
- base para permissão de notificações.

Push automático de produção ainda NÃO está implementado.

## Primeiro evento estruturado

Evento: Festival das Luzes 2026 — Índia.

Origem capturada via PokeMiners; fonte oficial Pokémon GO.

Horário Índia:

- 06/11/2026 10:00
- até 08/11/2026 20:00

Brasil (`America/Sao_Paulo`):

- 06/11/2026 01:30
- até 08/11/2026 11:30

Coordenada de referência usada no protótipo:

`20.5937, 78.9629`

Importante: isso é referência geográfica da Índia, não local oficial de evento. Não gerar GPX enganoso para essa referência.

## Arte aprovada / qualidade

Arte Gold Standard aprovada pelo usuário: Festival das Luzes com Pikachu saree + Pikachu kurta.

Arquivo original aprovado: 1024×1536, aproximadamente 2,2 MB.

A arte HQ foi publicada no app e validada no celular.

O problema de recorte da tela de detalhe foi corrigido. A arte agora aparece inteira em proporção 2:3, preservando topo, corpo, logo, rodapé e fonte.

### Pendência visual restante

A própria arte ainda mostra a coordenada como:

`20.5937° N, 78.9629° E`

Preferência atual do usuário:

`20.5937, 78.9629`

Remover `N` e `E` **da própria arte**, sem reduzir qualidade nem alterar o restante do layout.

## NOVO MÓDULO — STAMPS / GO STAMP RALLY

O app deve também suportar eventos mundiais de **Stamp Rally**.

Objetivo: além de informar o evento, ajudar o jogador a executar a rota de selos.

### Estrutura de dados desejada

`Stamp Rally → várias Stops → coordenadas → recompensa → período → progresso/rota`

Cada Stamp Rally deve poder conter:

- nome do rally;
- cidade/país;
- data de início/fim;
- quantidade de selos/stamps;
- recompensas;
- necessidade ou não de ingresso;
- fonte;
- lista de PokéStops participantes.

Cada Stop deve ter, quando disponível:

- nome;
- latitude;
- longitude;
- tipo da coordenada;
- nível/confiança da coordenada;
- botão para copiar coordenada;
- GPX individual.

### Funções previstas

- copiar coordenada de uma Stop com um toque;
- GPX individual da Stop;
- GPX completo do rally com todas as Stops confirmadas;
- mapa com os pontos;
- ordenar Stops por distância usando localização do aparelho;
- botão/próxima Stop;
- progresso do usuário, por exemplo `3/8 selos`;
- notificação para novo Stamp Rally ou término próximo.

### Regra crítica de coordenadas

Separar rigorosamente:

- `exact_pokestop` = coordenada exata confirmada da PokéStop;
- `venue_reference` / `city_reference` = referência aproximada do local.

Nunca gerar GPX como se fosse uma PokéStop exata quando só houver referência aproximada.

## Arquitetura de navegação desejada

Direção preferida para a navegação principal:

`Calendário | Stamps | Mapa`

Stamp Rally também deve poder aparecer no calendário mensal quando tiver período definido.

## Próxima etapa técnica recomendada

Antes de automatizar todas as fontes, adaptar o modelo de dados do app para suportar **eventos normais + Stamp Rallies**.

Depois unir o motor existente ao app:

`novo evento → validação automática → arte → registro estruturado → calendário/app → notificação`

Publicação automática deve ser idempotente e sem duplicação.

Revisão humana só entra quando alguma validação falhar ou houver ambiguidade.

## Regras para próxima retomada

Quando o usuário escrever `SPIDEYNEXUS`:

1. ler `SPIDEY_NEXUS.md`;
2. ler este `SPIDEY_APP_STATUS.md`;
3. conferir a `main` atual;
4. preservar tudo que já funciona;
5. NÃO voltar para WhatsApp como produto principal;
6. considerar o recorte da arte como RESOLVIDO;
7. manter pendente apenas o acabamento da coordenada da arte sem `N/E`;
8. priorizar a adaptação do modelo de dados para **eventos + Stamps**;
9. depois implementar o fluxo de autopublicação com validações automáticas;
10. manter revisão humana apenas como exceção;
11. validar deploy no Vercel e comportamento real antes de declarar concluído.

## Princípio de continuidade

Não recomeçar o projeto.

Não pedir ao usuário para refazer Vercel/GitHub: as integrações já foram configuradas.

Não declarar algo pronto sem verificar o deploy e o comportamento real.


## Checkpoint de continuidade — 01/10/2026

Continuação da branch `spidey-fly-v1`, sem promoção a main/produção. Código do candidato: `8fac1edb4a24c2474d89e8c9e311892153ed6c87`. FLY dinâmico, Command Center, Selos e Novidades foram trabalhados preservando decisões canônicas. QA responsivo 390/1280 e 33 testes passaram. O estado concreto, preview, evidências e limites estão em `SPIDEY_PUBLIC_RELEASE.md`; lê-lo na próxima retomada. Não interpretar este checkpoint como lançamento público aprovado: cobertura Premium pendente, Android/PWA/push e Amigos/Chat continuam em aberto.
