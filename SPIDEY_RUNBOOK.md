# Spidey Pokémon GO — Runbook de Produção

## Objetivo

Centralizar novidades úteis de Pokémon GO, eliminar duplicatas, preservar a fonte original, criar um card seguro a partir da mídia real da fonte, enviar ao Discord para decisão humana e publicar somente após aprovação.

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
Auto-curadoria por mídia da fonte
  ├─ deduplicação
  ├─ preferência pela fonte oficial
  ├─ tradução/enriquecimento quando aplicável
  ├─ validação da imagem original
  └─ card 1080×1350 com identidade Spidey
        ↓
queue/curated/*.json + assets/generated/*.jpg
        ↓
Guard de arte source-first
        ↓
Discord #aguardando-aprovacao
  ├─ ✅ aprovação humana
  └─ ❌ reprovação humana
        ↓
Sincronização da decisão
        ↓
Discord #publicadas-whatsapp somente se aprovado
```

## Regra de mídia

O padrão de produção é `spidey-source-v1`.

- A imagem-base deve vir da fonte real detectada.
- O card não deve inventar Pokémon, roupas, chapéus, objetos ou detalhes visuais com base apenas no texto.
- O Spidey aplica somente identidade editorial discreta: logo, categoria, título e rodapé.
- A imagem final fica persistida em `assets/generated/` no GitHub.
- Imagem vazia, corrompida, pequena ou praticamente preta é rejeitada antes do Discord.
- Não usar fallback improvisado quando a mídia da fonte estiver ausente.

O status interno legado `aguardando_arte_chatgpt` ainda pode aparecer em `queue/pending` por compatibilidade. A etapa editorial correta é `aguardando_curadoria_midia`, com pipeline `source_media_spidey` e política `source_first`.

## Fontes e controles

### Pokémon GO Oficial

- Workflow: `.github/workflows/spidey-official-curated.yml`
- Monitor: `scripts/official_curated_monitor.py`
- Estado: `last_news.txt`
- Origem: página oficial de notícias do Pokémon GO.
- Prioridade editorial: máxima. Quando um item G47IX corresponde a uma notícia oficial, manter a versão oficial e marcar a outra como duplicada.

### G47IX

- Workflow: `.github/workflows/spidey-g47ix-curated.yml`
- Monitor: `scripts/g47ix_curated_monitor.py`
- Estado: `last_g47ix.txt`
- Origem: feed G47IX via FxTwitter.
- Regra: processar IDs não vistos em ordem cronológica e filtrar conteúdo irrelevante.

### PokeMiners

- Workflow: `.github/workflows/spidey-pokeminers-curated.yml`
- Monitor: `scripts/pokeminers_curated_monitor.py`
- Estado: `last_pokeminers.txt`
- Origem: canal Discord acessível pelo bot.
- Escopo: APK, atualização forçada, Game Master/datamine, assets, Campfire e mudanças operacionais.
- Notícias comuns do Pokémon GO oficial são ignoradas para evitar duplicação.
- O monitor pagina mensagens a partir do cursor; não depende apenas das últimas 75 mensagens.
- A idade da mensagem mais recente do canal é registrada no log como diagnóstico de saúde.

### SPS

- Workflow: `.github/workflows/spidey-sps-curated.yml`
- Monitor: `scripts/sps_curated_monitor.py`
- Estado individual: `last_discord_source.txt`
- Estado semanal: `last_sps_weekly.txt`
- Origem disponível ao bot: canal intermediário do nosso servidor.
- O monitor pagina o backlog até reencontrar o cursor e não avança o estado se houver falha durante um item.
- Se a última mensagem da ponte tiver mais de 24 horas, o workflow deve falhar com `FONTE SPS PARADA` em vez de aparentar saúde.

### Limitação conhecida do SPS

O bot não lê diretamente o servidor externo SPS/GO-NEWS. Portanto, um evento existente no GO-NEWS só entra no Spidey se a ponte para o canal intermediário estiver alimentando novas mensagens. Não usar self-bot ou automação com conta pessoal do Discord para contornar essa limitação.

## Deduplicação

Prioridade atual:

1. Pokémon GO Oficial
2. G47IX
3. PokeMiners para dados operacionais próprios
4. SPS para eventos/localizações que não tenham versão autoritativa melhor

Quando um item não oficial coincide com um item oficial, o não oficial recebe `status: duplicado` e `duplicate_of` aponta para a fonte oficial.

## Coordenadas e GPX

- Aceitar apenas latitude entre -90 e 90 e longitude entre -180 e 180.
- Remover coordenadas duplicadas preservando a ordem.
- Coordenadas ficam estruturadas no JSON e são mostradas no Discord sem repetição.
- Se `gerar_gpx=true` e houver coordenadas válidas, gerar GPX 1.1 e anexar à mensagem de aprovação.
- Nunca extrair números comuns como se fossem coordenadas.

## Horários e fusos

- Cada horário estruturado deve informar `timezone` IANA e `inicio`.
- Converter para `America/Sao_Paulo` no momento do envio.
- Informar corretamente quando a conversão cai no dia anterior ou seguinte.
- Não inventar fuso quando a fonte disser apenas “horário local”; manter a informação como local até existir localidade/fuso suficiente para conversão segura.

## Aprovação no Discord

Workflow: `.github/workflows/spidey-curated.yml`

O `scripts/send_curated.py` envia diretamente ao Discord, anexa a arte e, quando aplicável, o GPX. O bot adiciona as reações ✅ e ❌.

Workflow de sincronização: `.github/workflows/spidey-sync-approval-state.yml`

- ✅ do bot sozinho não aprova.
- Mais de uma reação ✅ significa aprovação humana e muda o item para `approved`.
- Mais de uma reação ❌ significa reprovação e muda para `rejected_art`.
- ✅ e ❌ humanos simultâneos geram `decision_conflict`.

Workflow de publicação: `.github/workflows/spidey-publish-bridge.yml`

O bridge só copia para o canal de publicadas quando detecta aprovação humana. Conteúdo reprovado não publica.

## Dependências de produção

O caminho de aprovação atual usa GitHub Actions + Discord API diretamente. Não depende de Render para enviar o item ao canal de aprovação. Whapi e outros fluxos antigos não fazem parte do caminho editorial oficial descrito neste runbook.

## Critério de pronto

O Spidey só deve ser considerado operacional quando um item real consegue fazer, sem intervenção manual na coleta:

1. aparecer em uma das fontes monitoradas;
2. entrar em `queue/pending`;
3. ser deduplicado e curado;
4. usar mídia real válida da fonte;
5. gerar card persistido em `assets/generated`;
6. chegar ao Discord para aprovação;
7. respeitar coordenadas, GPX e fusos quando aplicáveis;
8. só chegar ao canal de publicadas após aprovação humana.

## Diagnóstico rápido

Se uma notícia não aparecer:

1. Conferir se o cursor da fonte avançou.
2. Conferir se existe JSON em `queue/pending`.
3. Se houver `status: duplicado`, conferir `duplicate_of`.
4. Se estiver pendente sem item curado, conferir mídia da fonte e logs de `SEM_ARTE`.
5. Se houver JSON em `queue/curated` com `pending`, conferir o workflow da fila editorial.
6. Se houver `sent`, conferir `discord_approval_id`.
7. Se houver `rejected_art`, não republicar automaticamente; revisar a arte.
8. Para SPS, verificar primeiro a idade da última mensagem da ponte e procurar `FONTE SPS PARADA`.
