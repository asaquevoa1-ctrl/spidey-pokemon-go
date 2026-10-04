# Spidey Art System v1

Estado corrente — 04/10: versão web pública finalizada no código `a7e34e2`, produção READY em https://spidey-pokemon-go.vercel.app/spidey-app/ , sem login ou link temporário, sob a autorização explícita de publicação do editor e a continuidade “Bora finalizar”. GPX de Selos do Japão agora usa download HTTP direto; arquivo novo baixado pelo browser em `e220251`, 1.890 bytes, 17 pontos e conteúdo idêntico à prova anterior. Endpoint preservado e reconferido em `a7e34e2`. Alertas consultados assim que a interface fica pronta; botão desabilitado “Alertas indisponíveis” confirmado em desktop e viewport390, sem pedido de permissão. 52 testes Node e gate automático passaram; 32 testes Python pertencem à verificação anterior do lançamento. 44 arquivos públicos exatos em `e220251`; os três arquivos públicos alterados depois foram reconferidos em `a7e34e2`. Catálogo124,25 masters,sete fundos originais e FLY20/28/Taipei preservados. Push remoto continua503/push_not_configured; faltam armazenamento, chaves e agendamento. Android físico/instalação/atualização/offline/push não certificados. Missões fixas e GPX de área dos museus seguem dispensados; recusas Premium Applin/Espaço/Sizzlipede mantidas, sem nova tentativa. Registro corrente: `docs/qa/FINALIZATION_20261004.md/json`.

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

## Domingo Pitoresco v2 para revisão — 03/10/2026

Domingo Pitoresco de 4/10: candidata v2 PENDING_REVIEW, revisão humana ainda pendente. QA PASSED_PREVIEW no código `14fa3ad`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido idêntico à candidata. 16 masters aprovados/15 arquivos preservados. Janela 01–07/10: 23 eventos, 11 APPROVED, 1 candidata e 11 sem arquivo Home/FLY. Fonte atual Leek Duck identificada como comunidade; bônus condicionados a Rotas/companheiro. Acesso público BLOCKED_USER_PHONE_LOGIN e Android/PWA/push pendentes. Registro: `docs/qa/SCENIC_SUNDAY_REVIEW_20261003.json`.

PNG integral `assets/events/review/scenic-sunday-20261004-v2.png`, 1122 × 1402, 2739274 bytes, SHA256 `0ecff3534586f2387869aaf343298dab7377c421c598e5591f2e27133f6ba977`. V1 preservada para histórico; ícone de rosto não validado substituído por presente via imagegen na v2. Eevee é ilustrativo, sem promessa de encontro destacado. A vigência nesta temporada vem do guia comunitário; anúncio oficial de junho confirma a mecânica da temporada anterior e não prova outubro isoladamente. Fonte/datas/bônus/observações enriquecidos somente para `2026-10-04-scenic-sunday`; outros 123 eventos e horários/calendário/coordenadas/GPX preservados.

Integração explícita PENDING_REVIEW/full_poster, resolver comum nos cinco papéis, sem inclusão no master ou concessão de `spidey-premium-v1`. Helper inteiro preservado; cache 77 paths e query de preview versionados. Home e detalhe renderizam a mesma candidata; Semana mostra o evento em linha textual de 4/10, sem miniatura de pôster observada. Não cria nova elegibilidade FLY. Provas e limites: `docs/qa/scenic-sunday-browser-14fa3ad-20261003.json`, auditoria `docs/qa/scenic-sunday-local-audit-20261003.json`. Sem promoção a main/produção ou alteração de proteção/push. Próximo: entregar PNG completo para decisão humana específica; depois artes restantes e frentes públicas/físicas pendentes.

## Domingo Pitoresco aprovado — 03/10/2026, 16:52 BRT

Domingo Pitoresco de 4/10 APPROVED pela decisão “Aprovo” de 03/10, 16:52:31 BRT. Cópia premium idêntica à candidata v2, sem regeneração. QA PASSED_PREVIEW no código `bfeeb24`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Master com 17 entradas; 16 anteriores/15 arquivos preservados. Janela 01–07/10: 23 eventos, 12 APPROVED, nenhuma candidata ativa e 11 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SCENIC_SUNDAY_APPROVAL_20261003.json`.

EventId `2026-10-04-scenic-sunday`; arquivo `assets/events/premium/scenic-sunday-20261004-approved-v1.png`, 1122 × 1402, 2.739.274 bytes, SHA256 `0ecff3534586f2387869aaf343298dab7377c421c598e5591f2e27133f6ba977`. Decisão corresponde ao PNG integral v2 mostrado no checkpoint `9671458`, código revisado `14fa3ad`. Registro de revisão permanece congelado, SHA256 `aff543fb8f435ffb6602efcfe4892e4a137c3d5f91b9eab50e3232ab4f3f0efd`; candidatas v1/v2 e demais revisões/aprovações preservadas. Somente uma entrada adicionada ao master, preview agora vazio; helper preservado, mesmo PNG nos cinco papéis e cache `spidey-app-20261003-scenic-approved-v1`, 77 paths.

Fonte atual continua comunitária (Leek Duck); condições de Rotas/companheiro explícitas, Eevee ilustrativo e nenhum multiplicador de doces inventado. Anúncio oficial de junho corrobora a mecânica da temporada anterior e não comprova sozinho outubro. Catálogo inteiro de 124 eventos inalterado na aprovação, SHA256 `90b3af70743455216a020e65df7dab4a0c7c461f22356f886ec04886cff479ef`; horários/calendário/coordenadas/GPX/elegibilidade FLY preservados. Domingo não ganha nova janela FLY.

Nova conferência Home → detalhe em mobile/desktop: pôster inteiro/contain, foco Fechar, scrollTop 0 e sem overflow horizontal; PNG servido byte a byte igual ao aprovado. Provas: `docs/qa/scenic-sunday-approved-browser-bfeeb24-20261003.json`, auditoria `docs/qa/scenic-sunday-approved-local-audit-20261003.json`. Semana: resolver conferido localmente; a linha textual de 4/10 foi observada no QA histórico da candidata, sem nova alegação visual de miniatura. O detalhe mantém o placeholder genérico de local.

Preview de QA verificado: https://spidey-pokemon-jtmdvu1t9-spidey3.vercel.app/spidey-app/index.html. Cookie temporário usado somente nesta conferência, sem validar acesso público de terceiros. Sem promoção a main/produção ou alteração de proteção/segredos/push. Próximo: cobertura das 11 artes restantes e resolução independente das pendências de acesso/Android.

## Terça de Vitrine — candidata v1 conferida em 03/10/2026

Terça de Vitrine de 6/10 v1 PENDING_REVIEW, aprovação humana ainda nula. QA PASSED_PREVIEW no código `dbf6956`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Todos os 17 masters/16 arquivos aprovados anteriores preservados, incluindo Domingo Pitoresco. Janela 01–07/10: 23 eventos, 12 APPROVED, 1 candidata e 10 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SHOWCASE_TUESDAY_REVIEW_20261003.json`.

EventId `2026-10-06-showcase-tuesday`; arquivo `spidey-app/assets/events/review/showcase-tuesday-20261006-v1.png`, 1122×1402, 2.636.843 bytes, SHA256 `ac11ef360b595bfad180c918d6c655c08863d7f01ff36dca4a667ad0e8334c19`. PNG integral novo, vinculado exclusivamente pelo preview/full_poster, sem adicioná-lo ao master ou conceder aprovação. As mensagens “Bora” de continuação não são decisão visual sobre esta nova peça. Candidata original e prompt exato preservados no registro de revisão.

Fatos: 6/10, 00h–23h59 locais; até cinco Vitrines de Poképarada para participar no dia e mais Poképaradas poderão ter Vitrines. Fonte atual comunitária Leek Duck; anúncio oficial de junho corrobora a mecânica anterior, não comprova sozinho a vigência em outubro. Snorlax ilustrativo; nenhuma espécie específica, recompensa, multiplicador ou chance de Brilhante prometida. Catálogo de 124 eventos: somente resumo/fonte/bônus/notas desta terça enriquecidos; os outros 123 eventos e todas as janelas/calendário/coordenadas/GPX/eligibilidade FLY preservados. SHA256 corrente `01b81b8daa9d8bc3aeda730aecb76c1884e6153bd021d6b9fc8e6ce4511827d9`. Nenhuma nova entrada FLY.

QA: Home → detalhe mobile Claro/desktop Escuro, pôster inteiro/contain, rodapé visível, foco Fechar, scrollTop 0, sem overflow horizontal. Download real do PNG servido idêntico à candidata. Provas/medidas: `docs/qa/showcase-tuesday-browser-dbf6956-20261003.json`; auditoria local: `docs/qa/showcase-tuesday-local-audit-20261003.json`. Semana: resolver conferido localmente, sem nova prova visual nesta rodada. Placeholder genérico de local conhecido permanece no detalhe. Cache `spidey-app-20261003-showcase-review-v1`, 78 paths.

Preview próprio conferido: https://spidey-pokemon-1bo7i1q0p-spidey3.vercel.app/spidey-app/index.html. Acesso temporário restrito à própria conferência; não comprova acesso público de testadores. Nenhuma alteração de main/produção, proteção, segredos ou push. Próximo: entregar o PNG integral e obter decisão humana específica sobre esta candidata; dez eventos continuam sem arte e as frentes de acesso/Android seguem pendentes. Registros e decisões visuais anteriores permanecem congelados.

## Terça de Vitrine aprovada — 03/10/2026, 20:56 BRT

Terça de Vitrine de 6/10 v1 APPROVED pela decisão “Aprovo” de 03/10, 20:56:01 BRT. Cópia premium idêntica à candidata, sem regeneração. QA PASSED_PREVIEW no código `c3bb225`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Master com 18 entradas; 17 anteriores/16 arquivos preservados. Janela 01–07/10: 23 eventos, 13 APPROVED, nenhuma candidata ativa e 10 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SHOWCASE_TUESDAY_APPROVAL_20261003.json`.

EventId `2026-10-06-showcase-tuesday`; asset `spidey-app/assets/events/premium/showcase-tuesday-20261006-approved-v1.png`, 1122×1402, 2.636.843 bytes, SHA256 `ac11ef360b595bfad180c918d6c655c08863d7f01ff36dca4a667ad0e8334c19`. Decisão corresponde ao PNG v1 integral reexibido diretamente no chat a partir do checkpoint `81b026d`, código conferido `dbf6956`. Registro de revisão congelado, SHA256 `e9ebc5bcccc4f314b0a14870d8f7b69766ea72ef89c2cab54df05760aa0237a0`. Candidata, prompt, fontes e registros visuais anteriores preservados. Somente esta entrada adicionada ao master; preview agora vazio e helper inalterado. Mesmo PNG nos cinco papéis; cache `spidey-app-20261003-showcase-approved-v1`, 78 paths.

Fonte atual continua comunitária (Leek Duck), com “até cinco Vitrines” e “mais Poképaradas poderão ter Vitrines”; Snorlax ilustrativo. Anúncio oficial da temporada anterior não comprova sozinho outubro. Aprovação preserva o catálogo inteiro de 124 eventos, SHA256 `01b81b8daa9d8bc3aeda730aecb76c1884e6153bd021d6b9fc8e6ce4511827d9`, horários/calendário/coordenadas/GPX/eligibilidade FLY. Nenhuma nova entrada FLY.

Nova conferência Home → detalhe no código aprovado: mobile Claro/desktop Escuro, PNG premium inteiro/contain e rodapé visível, foco Fechar, scrollTop 0, sem overflow horizontal; download real do PNG servido exato. Provas/DOM: `docs/qa/showcase-tuesday-approved-browser-c3bb225-20261003.json`; auditoria: `docs/qa/showcase-tuesday-approved-local-audit-20261003.json`. Semana: resolver aprovado conferido localmente, sem nova prova visual de miniatura nesta rodada. Placeholder genérico de local conhecido permanece. As cinco listas de aprovações posteriores nos testes históricos foram atualizadas para incluir a decisão terça; demais asserts preservados, 33 testes passaram.

Preview conferido: https://spidey-pokemon-4et5ix99r-spidey3.vercel.app/spidey-app/index.html. Cookie temporário usado somente na própria conferência, sem comprovar acesso público de terceiros. Sem promoção a main/produção, alteração de proteção/segredos/push ou novo desenvolvimento de Amigos/Chat. Próximo: cobertura dos dez eventos sem arte e resolução independente das pendências de acesso público/Android. Aprovação desta imagem não aprova o lançamento completo.

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
