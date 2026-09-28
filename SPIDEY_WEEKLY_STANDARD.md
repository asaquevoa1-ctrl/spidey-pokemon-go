# SPIDEY WEEKLY — padrão oficial

Versão: `spidey-weekly-premium-v1`

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

Pacote estruturado gerado automaticamente:

- `weekly/current.json`
- `weekly/archive/YYYY-MM-DD.json`

Schema atual: `spidey-weekly-v1`.

Cada item de evento do pacote semanal deve incluir `weekly_art`, resolvida pelo **Spidey Art System v1**.

Prioridade visual por evento:

1. arte individual própria/Premium válida (`card`, `thumb`, `hero` ou `poster`);
2. arte legada válida em resolução suficiente;
3. fallback vetorial individual `1080×1620` em `spidey-app/assets/events/generated/`.

O fallback vetorial mantém o Weekly nítido e específico por evento, mas **não é classificado como arte Premium**. O logo oficial nunca pode ocupar o lugar de `weekly_art`.

Qualidade mínima de `weekly_art`: `720×900`.

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

Execução automática: toda segunda-feira, aproximadamente 07:05 no horário de Brasília.

Fluxo alvo:

`Calendário estruturado → Art System v1 → build_spidey_weekly.py → weekly/current.json → gerador de arte → validação → publicação/compartilhamento`

A geração dos dados e a resolução de arte individual já estão operacionais. A próxima etapa visual do Weekly é automatizar a renderização da peça final usando o padrão aprovado.
