# SPIDEY APP — handoff canônico

Atualizado em 28/09/2026.

## Decisão de produto

O destino principal do projeto deixou de ser um canal público de WhatsApp/Discord. O produto passa a ser um **aplicativo/PWA público Spidey Pokémon GO**.

O Discord permanece como **painel editorial de aprovação humana**, não como produto final.

Fluxo alvo:

`Fontes → coleta → curadoria → arte Premium → aprovação humana no Discord → banco de eventos → Spidey App → notificações`

Nada deve entrar no app público sem aprovação editorial válida.

## Produto desejado

O app deve concentrar:

- calendário mensal de eventos;
- dias destacados quando há evento;
- abertura do evento ao tocar no dia/card;
- arte Premium aprovada;
- horários locais e conversão para Brasil;
- coordenadas em formato copiável `latitude, longitude`;
- GPX para download quando houver coordenadas reais/adequadas;
- bônus, Pokémon em destaque, raids, pesquisas, recompensas e demais informações;
- fonte oficial;
- notificações;
- filtros/favoritos e demais evoluções depois do MVP.

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

A importação HQ foi feita pelo workflow temporário `Spidey Import HQ Art` e terminou com sucesso.

Commit que publicou a arte HQ no app:

`edd317d956da053dee5b1b4ac859216dec2d08e0`

O deploy correspondente no Vercel concluiu com sucesso.

## PENDÊNCIA VISUAL IMEDIATA — RETOMAR DAQUI

No último teste em celular, a qualidade ficou boa, mas a arte está **recortada na tela de detalhe**.

Causa técnica provável já identificada no CSS:

`.detail-hero { max-height: 440px; object-fit: cover; }`

Isso força o poster vertical 2:3 a preencher uma área horizontal/limitada e corta partes da arte.

Próxima correção:

- no detalhe, exibir a arte inteira;
- usar `object-fit: contain` ou altura automática compatível com 2:3;
- preservar 100% do poster sem crop;
- manter card/lista podendo usar thumbnail recortada se visualmente fizer sentido;
- validar no celular antes de declarar concluído.

## Outra pendência visual

A arte HQ ainda mostra a coordenada como:

`20.5937° N, 78.9629° E`

Preferência atual do usuário:

`20.5937, 78.9629`

Remover `N` e `E` também **da própria arte**, sem reduzir qualidade nem alterar o restante do layout.

## Regras para próxima retomada

Quando o usuário escrever `SPIDEYNEXUS`:

1. ler `SPIDEY_NEXUS.md`;
2. ler este `SPIDEY_APP_STATUS.md`;
3. conferir a `main` atual;
4. preservar o pipeline editorial V2 que já funciona;
5. NÃO voltar para o conceito de WhatsApp como produto principal;
6. retomar primeiro a correção do **recorte da arte HQ na tela de detalhe**;
7. depois corrigir a coordenada da arte para remover N/E;
8. validar o deploy no Vercel e no celular;
9. só então avançar em banco de eventos, notificações e conexão automática das fontes.

## Princípio de continuidade

Não recomeçar o projeto.

Não pedir ao usuário para refazer Vercel/GitHub: as integrações já foram configuradas.

Não declarar que algo está pronto sem verificar deploy e comportamento real.
