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

## Pôsteres novos no preview — 01/10/2026
Invasão e Cinderace são entradas explícitas por eventId em `preview-art.js`, `PENDING_REVIEW`/`full_poster`, com dimensões e hashes reais. O resolver comum e a Semana aceitam somente essas candidatas integrais explícitas, identificadas como `preview_candidate:poster`, sem conceder `spidey-premium-v1`, aprovação ou inscrição em `SPIDEY_PREMIUM_EVENT_ART`. Qualquer master existente conserva precedência, inclusive sua regra de indisponibilidade. Recortes, vetores e placeholders não ganham autorização na Semana por esta alteração. Applin continua sem candidata.

## Transição editorial — Invasão/Cinderace APPROVED, 01/10 15:45 BRT

Aprovação humana explícita dos dois PNGs exatos da rodada `df9d050`. Cópias byte a byte em `assets/events/premium/harvest-invasion-approved-v1.png` e `assets/events/premium/cinderace-max-day-approved-v1.png`; hashes/dimensões/eventIds/decisão em `docs/qa/PRIORITY_ART_APPROVAL_20261001.json`. `premium-approved-master.js` é autoridade única; mesmas imagens em todos os papéis, `display: full_poster` e dimensões reservadas no detalhe. Removidas somente estas duas entradas de preview; Seedot/Zorua continuam pendentes. Originais/candidatas e masters anteriores preservados. Cache/shell versionados para novos paths aprovados; sem mudança de composição nem regeneração.

QA pós-aprovação `a242f88`: Home/Semana/detalhe e FLY de Cinderace renderizam os arquivos premium completos 1121×1403 em mobile/desktop. Quatro provas e resultado dos 14 testes em `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`; registro também vincula hashes dos prints.

## Seedot integral para revisão — 01/10

`preview-art.js` passa a mapear explicitamente Seedot para `assets/events/review/seedot-spotlight-correction-v1.png`, hash `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`, 1121×1403, full_poster PENDING_REVIEW; não é master nem Premium aprovado. Original/crop preservados como histórico. Mesmo arquivo por contexto via resolver de candidatas; cache/shell versionados. Nenhuma entrada Applin/Espaço porque ferramenta não entregou binário. Catálogo aprovado inalterado. Manifesto `docs/qa/NEXT_ART_REVIEW_20261001.json`.


## APROVAÇÃO SEEDOT — 01/10/2026, 19:07 BRT

Editor respondeu “Sim, aprovo” ao PNG exato de Seedot apresentado no checkpoint `8d5541e`/QA `2ed7ef8`. Hash `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`, 1121×1403, agora APPROVED exclusivamente para `2026-10-01-spotlight-seedot`. Cópia premium idêntica à candidata em `assets/events/premium/seedot-spotlight-approved-v1.png`; original/candidata e registros históricos preservados. Registro `docs/qa/SEEDOT_APPROVAL_20261001.json`, confirmação pós-aprovação em `docs/qa/SEEDOT_APPROVAL_20261001.md`.

Master soberano/full_poster, mesmos papéis de imagem, cache/shell versionados. Fonte Seedot permanece comunidade; nenhuma alteração factual nesta consolidação. Somente a entrada Seedot sai do preview; todas as entradas aprovadas anteriores preservadas. Inventário corrente 23 eventos: 4 APPROVED, 19 sem arquivo Home/FLY; Zorua pendente fora da janela. QA pós-aprovação concluído em `b310f5a`, provas em `docs/qa/SEEDOT_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push. Applin/Espaço recusados, sem novo arquivo. Nenhuma promoção a main/produção; aprovação não inclui lançamento completo.


Handoff pós-aprovação Seedot: código `b310f5a`, preview seguro https://spidey-pokemon-5uir2c532-spidey3.vercel.app/spidey-app/index.html, mobile/desktop/Semana/detalhe/FLY conferidos, 16 testes passaram e duas provas preservadas. Home passou a Xerneas após o encerramento local de Seedot às 19h; masters anteriores preservados. Relatório `docs/qa/SEEDOT_APPROVAL_20261001.md`. Brief factual da próxima peça `docs/qa/MEGA_VICTREEBEL_BRIEF_20261001.json` (comunidade, sem arte/sem aprovação) e roteiro de teste físico `docs/qa/PUBLIC_ANDROID_QA_20261001.md` preparados. Continuar nesta branch sem reiniciar; não reabrir Xerneas/Invasão/Cinderace/Seedot aprovados. Checkpoint documental posterior não altera o código conferido; nenhuma promoção a main/produção.


## Mega Victreebel v2 APPROVED — 01/10, 22:09 BRT

Decisão humana sobre o PNG completo recebido no chat, hash/dimensões/eventId em `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json`. Novo caminho premium preserva bytes da candidata; autoridade única no master, `full_poster` em todos os papéis. Apenas esta entrada é removida do preview; Zorua e sete masters anteriores preservados. Composição/resolver/dados/Novidades não mudam. Shell e cache versionados; QA pós-aprovação em `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.md`.

QA pós-aprovação `4b0f319`: novo master integral confirmado em Home/Semana/detalhe, mobile/desktop e clique direto. Duas provas e 21 testes em `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.md`; sete masters anteriores preservados.

## Thundurus e Elgyem consolidados no master — 03/10/2026

Aprovação explícita dos PNGs exatos em `docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json`. Cópias premium byte a byte das candidatas Thundurus v1 e Elgyem v2, master soberano APPROVED/full_poster, IDs separados e fontes comunitárias mantidas. As duas entradas saem do preview; agora 14 entradas no master e nenhuma candidata ativa. Os 12 masters anteriores, catálogos e originais/histórico permanecem intactos. Shell/master/preview/cache versionados; precache aponta para os caminhos aprovados, sem duplicar os mesmos cinco MB de candidatas. Resolvers e composição comuns preservados.

32 testes da consolidação e QA pós-aprovação no código `29c1aec` passaram. Provas específicas do novo deploy em `docs/qa/thundurus-elgyem-approved-browser-29c1aec-20261003.json`; mobile responsivo não comprova Android físico. Esta consolidação não autoriza main/produção.

## Passe GO de outubro/Kyogre v1 aprovado — 03/10, 09:04 BRT

Master soberano APPROVED/full_poster para `2026-10-go-pass`, fonte oficial mantida. Cópia premium idêntica à candidata, 1122 × 1402, hash `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`. Master 15 entradas, 14 anteriores intactas; preview vazio. Resolver/Weekly/detalhe usam o mesmo asset aprovado e recebem `spidey-premium-v1`. Fonte, datas e condições Deluxe/Ranque 50 preservadas; aprovação não cria janela FLY nem concede lançamento completo. Registro `docs/qa/GO_PASS_APPROVAL_20261003.json`; QA novo `ff37843`, 33 testes, mobile Claro/desktop Escuro e bytes servidos exatos. Arquivos/revisões anteriores protegidos.


## Latios v1 no resolver de preview — 03/10

Entrada explícita somente para `2026-09-go-pass` em `preview-art.js`, PENDING_REVIEW/full_poster, 1122 × 1402, hash `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50` e registro `docs/qa/LATIOS_REVIEW_20261003.json`. Resolver comum fornece os mesmos pixels em todos os cinco papéis, sem padrão Premium automático nem catálogo aprovado. Helper existente inteiro preservado e master continua soberano (15 entradas intactas). Cache `spidey-app-20261003-latios-review-v1`, 76 paths; somente query de preview versionada. Período/calendário/elegibilidade FLY inalterados. 33 testes e QA mobile Claro/desktop Escuro `760b117` passaram, servido hash exato.


## Latios v1 aprovado — 03/10, 13:01 BRT

Aprovação humana consolidada exclusivamente para `2026-09-go-pass`, full_poster 1122 × 1402, hash `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`. Cópia premium idêntica à candidata, master soberano APPROVED; mesmos pixels nos cinco papéis, sem alteração de composição/helper. 16 entradas master, 15 anteriores intactas; preview vazio. Cache `spidey-app-20261003-latios-approved-v1`, 76 paths, aprovado no precache. Catálogo/fatos/FLY inalterados. 33 testes e QA mobile Claro/desktop Escuro/servido hash exato `d14897b` passaram. Registro `docs/qa/LATIOS_APPROVAL_20261003.json`; originais/revisões protegidos, sem main/produção.
