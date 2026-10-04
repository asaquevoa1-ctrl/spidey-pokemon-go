# Spidey Pokémon GO — Padrão Oficial Premium v1

Este documento é a regra visual e editorial oficial do projeto Spidey Pokémon GO.

## 1. Princípio central

O padrão visual oficial do Spidey é **premium**. A peça precisa ser bonita, impactante, organizada, compartilhável e claramente identificável como conteúdo do Spidey.

A arte não deve parecer genérica, improvisada, amadora, corporativa, farmacêutica, “caixa de remédio” ou um card sem personalidade.

## 2. O que toda peça precisa entregar

- hierarquia visual clara;
- leitura rápida no celular;
- identidade forte do Spidey;
- logo oficial do Spidey;
- informação factual correta;
- fonte identificada;
- composição coerente com o tema do evento/notícia;
- contraste suficiente;
- imagem íntegra, sem corrupção, corte acidental ou área preta indevida;
- resolução compatível com publicação vertical.

## 3. Tipos de peça

### 3.1 Premium editorial

Padrão preferencial para:

- grandes eventos;
- anúncios oficiais;
- collabs;
- City Safari;
- Hora do Holofote;
- Hora de Reides;
- eventos especiais;
- lançamentos e notícias de alto interesse.

Características:

- composição rica;
- visual forte;
- destaque claro para o tema/Pokémon/evento;
- acabamento cinematográfico/editorial;
- identidade Spidey evidente, sem cobrir informação importante.

### 3.2 Premium operacional

Usado para:

- coordenadas;
- raids locais;
- alertas rápidos;
- eventos de estádio;
- informações com necessidade de publicação ágil.

Características:

- mais direto;
- leitura imediata;
- ainda premium e visualmente forte;
- coordenadas e horários em destaque;
- sem excesso de texto na arte.

## 4. Hierarquia obrigatória

1. Tema principal / nome do evento.
2. Pokémon ou elemento visual central.
3. Data, horário e local quando aplicável.
4. Bônus/recompensas principais.
5. Coordenadas e GPX quando aplicável.
6. Fonte e assinatura Spidey.

## 5. Regras factuais

- Não inventar bônus.
- Não inventar horário.
- Não inventar local.
- Não inventar item de avatar.
- Não inventar shiny boost.
- Não transformar rumor em informação oficial.
- Quando houver fonte oficial primária, ela tem prioridade editorial.
- Conteúdo duplicado de fonte secundária deve ser descartado quando o equivalente oficial já estiver na fila.

## 6. Regras fixas por evento

### City Safari

- Pikachu **não usa chapéu**.
- Eevee é quem usa o chapéu de explorador/safari quando esse visual fizer parte do evento.

### Evento da Coreia

- Usar **Pikachu fêmea** quando representar o Pikachu temático do evento.
- A cauda precisa respeitar a forma da fêmea.
- Alegação de shiny boost só pode aparecer se houver base confiável/confirmada para a publicação.

### adidas × Pokémon GO

Quando resumir as recompensas oficiais, considerar corretamente:

- jaqueta adidas;
- boné adidas;
- Pesquisa Temporária;
- encontro com Lucario;
- Mega Energia de Lucario;
- XP e Poeira Estelar quando pertinentes.

Lucario é recompensa/encontro, não item de roupa.

## 7. Horários e fusos

- Nunca inventar fuso.
- Quando a fonte disser apenas “horário local”, manter como horário local se não houver localidade suficiente para conversão segura.
- Quando houver cidade/localidade conhecida, converter para `America/Sao_Paulo` corretamente.
- Informar quando o horário em Brasília cair no dia anterior ou no dia seguinte.

## 8. Coordenadas e GPX

- Latitude válida: -90 a 90.
- Longitude válida: -180 a 180.
- Deduplicar coordenadas preservando a ordem.
- Coordenadas devem aparecer em texto copiável no Discord.
- Gerar GPX quando `gerar_gpx=true` e houver coordenadas válidas.
- Não extrair números comuns como coordenadas.

## 9. Integridade técnica da arte

Uma peça deve ser bloqueada antes do Discord se:

- o arquivo estiver vazio ou corrompido;
- JPEG/PNG estiver truncado;
- a imagem estiver praticamente preta;
- a resolução for insuficiente;
- a imagem final não estiver persistida no GitHub;
- a fonte do conteúdo não estiver verificada.

### 9.1 Regra fail-closed de qualidade visual

Se o sistema não conseguir produzir uma arte que realmente atinja o padrão `spidey-premium-v1`, **ele deve parar e manter o item bloqueado/aguardando revisão**.

É proibido promover a Premium, liberar para aprovação ou publicar como substituto:

- fallback de mídia da fonte;
- arte vetorial automática;
- placeholder;
- key-art simples com personagem recortado sobre fundo genérico;
- composição automática abaixo do padrão visual já aprovado;
- qualquer peça que exista apenas porque “foi possível gerar”.

Esses materiais podem existir exclusivamente como apoio técnico e devem ser identificados como tal. Eles não podem registrar `art_ready_for_review=true`, `gold_standard_visual=true` nem usar `spidey-premium-v1` como se tivessem atingido o padrão.

**Ausência temporária de arte Premium é preferível a baixar o padrão.** Uma nova tentativa/revisão deve preservar o histórico R1/R2/R3/... e exigir nova decisão humana quando houver nova arte, salvo autorização explícita vigente para delegar o QA visual no padrão já validado.

## 10. Critérios de reprovação humana

Reprovar se:

- estiver abaixo do padrão visual já aprovado;
- tiver personagem/roupa/objeto errado;
- tiver informação factual incorreta;
- estiver poluída ou sem hierarquia;
- tiver texto importante ilegível;
- parecer arte genérica ou improvisada;
- fugir claramente da identidade Spidey.

A reprovação humana sempre prevalece. Um item reprovado não deve ser republicado automaticamente.

## 11. Regra de aceitação

O projeto não deve mudar de direção por causa de uma crítica isolada. A decisão deve considerar:

- aceitação geral;
- utilidade real;
- compartilhamento;
- clareza;
- identidade consolidada do canal;
- aprovação editorial do responsável pelo Spidey.

## 12. Identificador técnico

Versão atual do padrão: `spidey-premium-v1`.

Toda peça nova enviada ao Discord deve registrar esse padrão no item curado.

## Passe GO de outubro/Kyogre v1 aprovado — 03/10, 09:04 BRT

Master soberano APPROVED/full_poster para `2026-10-go-pass`, fonte oficial mantida. Cópia premium idêntica à candidata, 1122 × 1402, hash `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`. Master 15 entradas, 14 anteriores intactas; preview vazio. Resolver/Weekly/detalhe usam o mesmo asset aprovado e recebem `spidey-premium-v1`. Fonte, datas e condições Deluxe/Ranque 50 preservadas; aprovação não cria janela FLY nem concede lançamento completo. Registro `docs/qa/GO_PASS_APPROVAL_20261003.json`; QA novo `ff37843`, 33 testes, mobile Claro/desktop Escuro e bytes servidos exatos. Arquivos/revisões anteriores protegidos.


## Latios v1 para decisão humana — 03/10

Candidata raster integral, 1122 × 1402, cenário aéreo cinematográfico, Latios azul normal, marca oficial, título/datas/bônus legíveis. Dados oficiais e condições 3–4/10/Ranque 50 explícitas, sem prêmio pago tratado como gratuito. `docs/qa/LATIOS_REVIEW_20261003.json` vincula prompt/referências/hash. Status PENDING_REVIEW; os 15 masters continuam intactos e esta avaliação não concede aprovação visual humana. QA `760b117` mobile/desktop passou.


## Latios v1 aprovado — 03/10, 13:01 BRT

Aprovação humana consolidada exclusivamente para `2026-09-go-pass`, full_poster 1122 × 1402, hash `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`. Cópia premium idêntica à candidata, master soberano APPROVED; mesmos pixels nos cinco papéis, sem alteração de composição/helper. 16 entradas master, 15 anteriores intactas; preview vazio. Cache `spidey-app-20261003-latios-approved-v1`, 76 paths, aprovado no precache. Catálogo/fatos/FLY inalterados. 33 testes e QA mobile Claro/desktop Escuro/servido hash exato `d14897b` passaram. Registro `docs/qa/LATIOS_APPROVAL_20261003.json`; originais/revisões protegidos, sem main/produção.

## Domingo Pitoresco aprovado — 03/10/2026, 16:52 BRT

Domingo Pitoresco de 4/10 APPROVED pela decisão “Aprovo” de 03/10, 16:52:31 BRT. Cópia premium idêntica à candidata v2, sem regeneração. QA PASSED_PREVIEW no código `bfeeb24`: 33 testes, mobile Claro 390×850/desktop Escuro 1280×850 e PNG servido exato. Master com 17 entradas; 16 anteriores/15 arquivos preservados. Janela 01–07/10: 23 eventos, 12 APPROVED, nenhuma candidata ativa e 11 sem arte Home/FLY. Acesso público BLOCKED_USER_PHONE_LOGIN; Android/PWA/push pendentes. Registro: `docs/qa/SCENIC_SUNDAY_APPROVAL_20261003.json`.

EventId `2026-10-04-scenic-sunday`; arquivo `assets/events/premium/scenic-sunday-20261004-approved-v1.png`, 1122 × 1402, 2.739.274 bytes, SHA256 `0ecff3534586f2387869aaf343298dab7377c421c598e5591f2e27133f6ba977`. Decisão corresponde ao PNG integral v2 mostrado no checkpoint `9671458`, código revisado `14fa3ad`. Registro de revisão permanece congelado, SHA256 `aff543fb8f435ffb6602efcfe4892e4a137c3d5f91b9eab50e3232ab4f3f0efd`; candidatas v1/v2 e demais revisões/aprovações preservadas. Somente uma entrada adicionada ao master, preview agora vazio; helper preservado, mesmo PNG nos cinco papéis e cache `spidey-app-20261003-scenic-approved-v1`, 77 paths.

Fonte atual continua comunitária (Leek Duck); condições de Rotas/companheiro explícitas, Eevee ilustrativo e nenhum multiplicador de doces inventado. Anúncio oficial de junho corrobora a mecânica da temporada anterior e não comprova sozinho outubro. Catálogo inteiro de 124 eventos inalterado na aprovação, SHA256 `90b3af70743455216a020e65df7dab4a0c7c461f22356f886ec04886cff479ef`; horários/calendário/coordenadas/GPX/elegibilidade FLY preservados. Domingo não ganha nova janela FLY.

Nova conferência Home → detalhe em mobile/desktop: pôster inteiro/contain, foco Fechar, scrollTop 0 e sem overflow horizontal; PNG servido byte a byte igual ao aprovado. Provas: `docs/qa/scenic-sunday-approved-browser-bfeeb24-20261003.json`, auditoria `docs/qa/scenic-sunday-approved-local-audit-20261003.json`. Semana: resolver conferido localmente; a linha textual de 4/10 foi observada no QA histórico da candidata, sem nova alegação visual de miniatura. O detalhe mantém o placeholder genérico de local.

Preview de QA verificado: https://spidey-pokemon-jtmdvu1t9-spidey3.vercel.app/spidey-app/index.html. Cookie temporário usado somente nesta conferência, sem validar acesso público de terceiros. Sem promoção a main/produção ou alteração de proteção/segredos/push. Próximo: cobertura das 11 artes restantes e resolução independente das pendências de acesso/Android.

## Continuação das artes sem confirmação individual — 03/10/2026, 23:13 BRT

O responsável declarou: “As artes já estão todas saindo no padrão correto. Pode seguir sem minha aprovação.” Autorização explícita em `docs/qa/ART_CONTINUATION_AUTHORIZATION_20261003.json`, recebida às 23:13:44 BRT. A aprovação visual individual deixa de ser bloqueio para as próximas peças no padrão Premium já validado. O agente pode consolidar o PNG exato após revisão factual, visual e técnica, registrando `USER_DELEGATED_VISUAL_QA`; não apresentar essa decisão como uma aprovação humana individual de uma imagem ainda não mostrada.

Continuam obrigatórios fontes corretas, identificação de comunidade/oficial, padrão Premium, marca, texto legível, integridade/hash/eventId, prévia responsiva e preservação das artes anteriores. Se uma peça falhar, corrigir ou manter bloqueada; não promover fallback ou recusa de geração a Premium. As recusas anteriores de Applin, Espaço e Sizzlipede permanecem registradas. Esta autorização não modifica decisões passadas nem concede aprovação ao lançamento completo, proteção Vercel ou configuração push.
