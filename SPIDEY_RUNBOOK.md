# Spidey Pokémon GO — Runbook de Produção

## Objetivo

Centralizar novidades úteis de Pokémon GO, eliminar duplicatas, validar a fonte, produzir arte no padrão oficial `spidey-premium-v1`, enviar ao Discord para decisão humana e publicar somente após aprovação.

## Pipeline oficial

```text
Fontes
  ├─ Pokémon GO Oficial
  ├─ G47IX
  ├─ PokeMiners
  └─ SPS
        ↓
Monitores separados
        ↓
queue/pending/YYYY-MM-DD/*.json
        ↓
Auto-curadoria premium
  ├─ deduplicação
  ├─ prioridade para fonte oficial
  ├─ tradução/enriquecimento quando aplicável
  ├─ validação da mídia/referência visual
  ├─ regras específicas de evento
  └─ card premium 1080×1350 com identidade Spidey
        ↓
queue/curated/*.json + assets/generated/*.jpg
        ↓
Guard spidey-premium-v1
        ↓
Discord #aguardando-aprovacao
  ├─ ✅ aprovação humana
  └─ ❌ reprovação humana
        ↓
Sincronização da decisão
        ↓
Discord #publicadas-whatsapp somente se aprovado
```

## Padrão visual oficial

Documento mestre: `SPIDEY_PREMIUM_STANDARD.md`.

Versão atual: `spidey-premium-v1`.

Regras principais:

- o padrão oficial é premium;
- identidade Spidey forte, bonita e compartilhável;
- fonte factual validada antes da arte;
- não misturar imagem de uma fonte secundária em publicação rotulada como oficial;
- imagem preta, corrompida, truncada ou pequena é bloqueada;
- a arte final precisa estar persistida em `assets/generated/`;
- regras fixas de City Safari, Coreia e adidas fazem parte do guard;
- a reprovação humana prevalece e não pode ser republicada automaticamente.

## Estados da fila

Novos itens entram como:

- `status: aguardando_curadoria_premium`
- `pipeline: spidey_premium_editorial`
- `art_standard_version: spidey-premium-v1`

Estados antigos `aguardando_arte_chatgpt` e `aguardando_curadoria_midia` continuam aceitos pelo auto-curador apenas para compatibilidade, para que nenhum item antigo seja perdido.

## Fontes e controles

### Pokémon GO Oficial

- Workflow: `.github/workflows/spidey-official-curated.yml`
- Monitor: `scripts/official_curated_monitor.py`
- Estado: `last_news.txt`
- Origem: página oficial de notícias do Pokémon GO.
- Prioridade editorial: máxima.
- Quando um item G47IX corresponder a uma notícia oficial, manter a versão oficial e marcar a secundária como duplicada.
- A publicação oficial deve usar referência visual oficial; não herdar automaticamente arte G47IX.

### G47IX

- Workflow: `.github/workflows/spidey-g47ix-curated.yml`
- Monitor: `scripts/g47ix_curated_monitor.py`
- Estado: `last_g47ix.txt`
- Origem: feed G47IX via FxTwitter.
- Processar IDs não vistos em ordem cronológica e filtrar conteúdo irrelevante.

### PokeMiners

- Workflow: `.github/workflows/spidey-pokeminers-curated.yml`
- Monitor: `scripts/pokeminers_curated_monitor.py`
- Estado: `last_pokeminers.txt`
- Origem: canal Discord acessível pelo bot.
- Escopo: APK, atualização forçada, Game Master/datamine, assets, Campfire e mudanças operacionais.
- Notícias comuns do Pokémon GO oficial são ignoradas para evitar duplicação.
- O monitor pagina mensagens a partir do cursor; não depende apenas das últimas mensagens.
- A idade da mensagem mais recente do canal é registrada no log como diagnóstico de saúde.

### SPS

- Workflow: `.github/workflows/spidey-sps-curated.yml`
- Monitor: `scripts/sps_curated_monitor.py`
- Estado individual: `last_discord_source.txt`
- Estado semanal: `last_sps_weekly.txt`
- Origem disponível ao bot: canal intermediário do nosso servidor.
- O monitor pagina o backlog até reencontrar o cursor e não avança o estado se houver falha durante um item.
- Se a última mensagem da ponte tiver mais de 24 horas, o workflow falha com `FONTE SPS PARADA` em vez de aparentar saúde.

### Limitação conhecida do SPS

O bot não lê diretamente o servidor externo SPS/GO-NEWS. Portanto, um evento existente no GO-NEWS só entra no Spidey se a ponte para o canal intermediário estiver alimentando novas mensagens. Não usar self-bot ou automação com conta pessoal do Discord para contornar essa limitação.

## Deduplicação

Prioridade atual:

1. Pokémon GO Oficial
2. G47IX
3. PokeMiners para dados operacionais próprios
4. SPS para eventos/localizações que não tenham versão autoritativa melhor

Quando um item não oficial coincide com um item oficial, o não oficial recebe `status: duplicado` e `duplicate_of` aponta para a fonte oficial.

## Regras visuais fixas

### City Safari

- Pikachu sem chapéu.
- Eevee com chapéu de explorador/safari quando o visual fizer parte do evento.

### Coreia

- Pikachu fêmea.
- Respeitar cauda feminina.
- Só alegar shiny boost com base confiável/confirmada.

### adidas × Pokémon GO

Quando resumir recompensas oficiais, considerar:

- jaqueta adidas;
- boné adidas;
- Pesquisa Temporária;
- encontro com Lucario;
- Mega Energia de Lucario;
- XP e Poeira Estelar quando pertinentes.

Lucario é recompensa/encontro, não item de avatar.

## Coordenadas e GPX

- Aceitar latitude entre -90 e 90 e longitude entre -180 e 180.
- Remover coordenadas duplicadas preservando a ordem.
- Coordenadas ficam estruturadas no JSON e são mostradas no Discord sem repetição.
- Se `gerar_gpx=true` e houver coordenadas válidas, gerar GPX 1.1 e anexar à mensagem de aprovação.
- Nunca extrair números comuns como se fossem coordenadas.

## Horários e fusos

- Cada horário estruturado deve informar `timezone` IANA e `inicio`.
- Converter para `America/Sao_Paulo` no momento do envio.
- Informar corretamente quando a conversão cai no dia anterior ou seguinte.
- Não inventar fuso quando a fonte disser apenas “horário local”.

## Aprovação no Discord

Workflow: `.github/workflows/spidey-curated.yml`.

O `scripts/send_curated.py` envia ao Discord, anexa a arte e, quando aplicável, o GPX. O bot adiciona ✅ e ❌.

Workflow de sincronização: `.github/workflows/spidey-sync-approval-state.yml`.

- ✅ do bot sozinho não aprova.
- Mais de uma reação ✅ significa aprovação humana e muda o item para `approved`.
- Mais de uma reação ❌ significa reprovação e muda para `rejected_art`.
- ✅ e ❌ humanos simultâneos geram `decision_conflict`.

Workflow de publicação: `.github/workflows/spidey-publish-bridge.yml`.

O bridge só copia para o canal de publicadas quando detecta aprovação humana. Conteúdo reprovado não publica.

## Dependências de produção

O caminho de aprovação atual usa GitHub Actions + Discord API diretamente. Não depende de Render para enviar o item ao canal de aprovação. Whapi e outros fluxos antigos não fazem parte do caminho editorial oficial.

## Critério de pronto

O Spidey só é considerado operacional quando um item real consegue, sem intervenção manual na coleta:

1. aparecer em uma fonte monitorada;
2. entrar em `queue/pending`;
3. ser deduplicado e curado;
4. ter fonte factual validada;
5. gerar arte `spidey-premium-v1` persistida em `assets/generated`;
6. chegar ao Discord para aprovação;
7. respeitar coordenadas, GPX e fusos quando aplicáveis;
8. só chegar ao canal de publicadas após aprovação humana.

## Diagnóstico rápido

Se uma notícia não aparecer:

1. Conferir se o cursor da fonte avançou.
2. Conferir se existe JSON em `queue/pending`.
3. Se houver `status: duplicado`, conferir `duplicate_of`.
4. Se estiver pendente sem item curado, conferir mídia/referência visual e logs de `SEM_ARTE`.
5. Se houver JSON em `queue/curated` com `pending`, conferir o guard premium e o workflow editorial.
6. Se houver `sent`, conferir `discord_approval_id`.
7. Se houver `rejected_art`, não republicar automaticamente; revisar a arte.
8. Para SPS, verificar primeiro a idade da última mensagem da ponte e procurar `FONTE SPS PARADA`.
