# SPIDEY WEEKLY — padrão oficial

Versão visual: `spidey-weekly-premium-v1`
Regras de dados e resolução de imagens atualizadas em 05/10/2026.

Aprovado pelo usuário em 28/09/2026.

## Objetivo

Transformar automaticamente o calendário estruturado do Spidey em um resumo semanal visual de leitura rápida, próprio para celular, compartilhamento e futura seção `Esta semana` do app.

## Período

- Semana padrão: segunda-feira a domingo.
- Timezone editorial principal: `America/Sao_Paulo`.
- O título deve mostrar claramente início e fim da semana.

## Identidade visual

- Marca principal: **SPIDEY WEEKLY**.
- Identidade Spidey: azul-marinho profundo, ciano e dourado.
- Logo oficial Spidey em posição de destaque apenas como **marca do Weekly**, nunca como substituto da arte individual de um evento.
- Visual Premium, forte e reconhecível, sem copiar layouts de terceiros.
- Formato principal para feed/WhatsApp/Telegram: 1080×1350.
- Formato secundário para Stories/Status: 1080×1920.
- Evitar excesso de caixas vazias. Se não houver conteúdo relevante em uma área, reduzir ou omitir a área.

## Hierarquia de conteúdo

A composição deve priorizar:

1. Cabeçalho `SPIDEY WEEKLY` + período.
2. Linha dos sete dias da semana com os destaques realmente úteis de cada dia.
3. `Eventos da semana` para os principais eventos globais.
4. `Raids / Max / PvP` quando houver conteúdo relevante.
5. `Também acontecendo` para eventos regionais, locais, colaborações e Stamps.
6. Rodapé Spidey discreto.

## Dados

Fonte canônica do Weekly:

- `spidey-app/data/events.json`
- `spidey-app/data/stamps.json`
- `spidey-app/premium-approved-master.js` (arquivos e hashes aprovados)

Pacote estruturado gerado automaticamente:

- `weekly/current.json`
- `spidey-app/data/weekly.json` (cópia idêntica para o app)
- `weekly/archive/YYYY-MM-DD.json`

Schema atual: `spidey-weekly-v1`.

Cada item de evento do pacote semanal deve incluir `weekly_art`, resolvida pelo **Spidey Art System v1**.

Prioridade visual por evento, alinhada ao app publicado:

1. Arquivo exato do master com status `APPROVED`, conferido pelo SHA256. O mesmo original serve Início, Semana, detalhes e FLY.
2. Na Semana do Espaço, a ilustração oficial original já registrada, com crédito. Essa imagem não é arte Premium aprovada.
3. Sem arquivo aprovado disponível, `weekly_art.kind = missing`, URL vazia e a data simples usada pela interface. O evento continua na agenda; não gerar ou selecionar capa substituta.

Não usar artes legadas concorrentes, logo ou fallback vetorial como substitutos do master. Uma referência Premium cujo arquivo falhou na conferência também não pode cair em outra imagem. A qualidade mínima dos pôsteres aprovados permanece `720×900`; a ilustração oficial possui seu formato original `1920×1080`.

A validação confere período de segunda a domingo, sete dias, eventos publicados e visíveis, arquivos/hashes e contagens de cobertura. `events_in_weekly` conta os IDs únicos realmente incluídos; `calendar_events_in_week` conta todos os eventos elegíveis no período. Contagens de Premium, imagem oficial e ausência de arte são separadas e não podem declarar cobertura integral quando faltam peças.

## Regras editoriais

- Não inventar evento, bônus, horário, local ou coordenada.
- Preferir fonte oficial; fonte `verified` só entra quando o calendário já passou pelo gate do Spidey.
- Eventos longos não devem ocupar todos os sete cards diários; devem ir para blocos de contexto.
- Raid rotations, Mega rotations, Shadow rotations e GBL devem ficar agrupadas para não poluir a faixa diária.
- Eventos de alta relevância como Community Day, GO Fest, Raid Day, Hatch Day e eventos globais especiais recebem prioridade visual.
- Stamps podem aparecer em `Também acontecendo`; GPX/coord só se mantêm as regras de confirmação já definidas no projeto.
- Nenhum evento do Weekly pode usar `data:`/base64, o logo oficial ou imagem abaixo do mínimo como sua arte individual.

## Automação

Workflow: `.github/workflows/spidey-weekly.yml`.

Execução automática: cron horário no minuto 29, além de alterações do catálogo, master ou gerador em `main` e execução manual. O horário de execução depende do GitHub Actions; conferir o resultado do run, sem prometer pontualidade.

Fluxo alvo:

`Calendário publicado + master aprovado → build_spidey_weekly.py → validação → current.json + weekly.json + arquivo semanal → commit → publicação do app`

A agenda semanal é exibida no app. A renderização automática de uma peça independente para compartilhamento continua uma etapa futura; o pacote `ready_for_art` não comprova a criação dessa peça.
