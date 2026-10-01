# Spidey Art System v1

Status: EM IMPLEMENTAÇÃO.

Objetivo: impedir que eventos sem arte Premium apareçam com o logo do Spidey ampliado/embaçado e separar corretamente as necessidades visuais de calendário, semana, card e detalhe.

## Papéis de arte

Cada evento pode ter quatro papéis visuais independentes:

- `thumb`: lista compacta / miniatura;
- `card`: cards de resumo e semana;
- `hero`: tela individual/detalhe;
- `poster`: arte completa/compartilhável.

Estrutura alvo:

```json
"art": {
  "standard": "spidey-premium-v1",
  "status": "ready",
  "thumb": {"url":"...","width":720,"height":900,"sha256":"..."},
  "card": {"url":"...","width":1080,"height":1350,"sha256":"..."},
  "hero": {"url":"...","width":1080,"height":1620,"sha256":"..."},
  "poster": {"url":"...","width":1440,"height":2160,"sha256":"..."}
}
```

O app continuará aceitando temporariamente o formato legado `art.url`, desde que a imagem seja válida e tenha metadados de resolução adequados.

## Qualidade mínima

- nunca usar `data:`/base64 em evento publicado;
- nunca usar o logo oficial como arte principal de evento;
- `thumb/card`: imagem real do evento ou fallback vetorial/event-specific do app;
- `hero/poster`: não esticar thumbnail pequena;
- `hero/poster` Premium: mínimo recomendado `800x1200`, orientação vertical;
- hash/versionamento para impedir cache de arte antiga;
- falha de imagem não pode cair de volta para o logo ampliado.

## Fallback correto

Se um evento ainda não tiver arte Premium pronta, o app deve mostrar um placeholder nítido gerado em CSS/HTML com:

- título do próprio evento;
- categoria;
- data/período;
- identidade Spidey;
- indicação discreta de que a arte Premium ainda não está disponível.

Esse fallback é temporário e não substitui a criação de arte individual.

## Contextos

### Calendário / dia

Ao abrir um único evento de um dia, usar `hero`/`poster` de alta resolução. Nunca reutilizar uma miniatura pequena em tela cheia.

### Lista de eventos

Usar `thumb` e, na falta, `card`. O recorte pode ser `cover` porque a miniatura é apenas navegação.

### Spidey Weekly

Usar `card`/`thumb` individual por evento. A arte do Weekly não deve depender do logo como imagem dos eventos.

### Compartilhamento

Usar `poster` quando disponível.

## Prioridade

1. Corrigir a lógica do app para resolver arte por papel.
2. Eliminar fallback para logo ampliado.
3. Criar auditoria automática de cobertura/qualidade das artes.
4. Atualizar os eventos prioritários de setembro/outubro com arte individual.
5. Ligar a geração automática de artes ao pipeline de autopublicação.
6. Reusar o mesmo sistema no Spidey Weekly.

## Exceção explícita de revisão — 01/10/2026
`preview-art.js` concentra a decisão de mostrar a candidata de correção de um original indisponível. A exceção exige o mesmo eventId, `PENDING_REVIEW`, `full_poster` e `restoresUnavailableArt` igual ao arquivo indisponível. Original aprovado íntegro sempre tem precedência; rascunhos não relacionados não substituem aprovação. Home e resolver de Semana/detalhe consomem a mesma decisão. A candidata não é adicionada ao catálogo aprovado nem recebe o padrão Premium automaticamente.

## Transição após aprovação humana — 01/10/2026
A rotação Xerneas recebeu decisão explícita do editor sobre o PNG corrigido. A cópia final conserva hash/dimensões da candidata, integra o master como APPROVED e sai do registro de preview. `display: full_poster` mantém a composição já validada do detalhe, com proporção reservada e pôster inteiro; não constitui um renderer concorrente. Fonte de aprovação: `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`. Hora de Reides permanece um asset distinto. Histórico original e candidata são preservados.
