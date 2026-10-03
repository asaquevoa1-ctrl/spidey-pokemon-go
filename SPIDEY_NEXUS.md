# SPIDEYNEXUS — handoff canônico do projeto Spidey Pokémon GO

## Palavra-chave única

**SPIDEYNEXUS**

Quando o usuário escrever somente `SPIDEYNEXUS` em um novo chat, isso significa:

1. Retomar o projeto Spidey Pokémon GO do ponto atual, sem reiniciar o projeto.
2. Usar `asaquevoa1-ctrl/spidey-pokemon-go` como fonte técnica oficial e ler este arquivo primeiro.
3. Conferir o estado atual do `main` antes de editar qualquer coisa, porque o repositório pode ter avançado desde este handoff.
4. Preservar tudo que já funciona e trabalhar incrementalmente.
5. Nunca declarar sucesso sem validação real. Classificar com clareza como FUNCIONA / PARCIAL / QUEBRADO / NÃO IMPLEMENTADO.
6. A decisão editorial humana é soberana. Arte reprovada nunca pode ser publicada.

---

## Estado macro

**Spidey Premium v1 — EM SANEAMENTO / ESTABILIZAÇÃO.**

Não tratar o projeto como 100% operacional enquanto o fluxo positivo completo ainda não tiver sido validado com uma arte realmente aprovada pelo editor humano.

Pipeline alvo:

`Fontes → coleta → queue/pending → curadoria → arte Premium → queue/curated → Discord aprovação → ✅/❌ humano → publicação ou revisão`

Fontes previstas:

- Pokémon GO Oficial
- G47IX
- PokeMiners
- SPS

O canal público só pode receber conteúdo depois de aprovação humana real e válida para a revisão/arte corrente.

---

## Visual oficial

Padrão: `spidey-premium-v1`

Documento: `SPIDEY_PREMIUM_STANDARD.md`

A existência de um arquivo de imagem não significa que a arte está aprovada nem que é Premium de verdade.

Critério editorial desejado:

- visual forte;
- mobile-first;
- identidade claramente Spidey;
- não genérico;
- não com aparência de template automático;
- factual;
- organizado;
- compartilhável;
- leitura rápida.

Problema atual principal: o mecanismo de revisão R2/R3/R4/R5 já existe mecanicamente, mas as revisões anteriores não resolveram a qualidade visual. O gerador ainda precisa evoluir para produzir melhoria editorial real, não apenas uma nova composição.

---

## E2E conhecido

Item técnico: `spidey-e2e-20260924-2126`

O fluxo negativo foi comprovado anteriormente:

- item chegou a pending;
- passou por curadoria;
- gerou arte;
- foi enviado ao Discord;
- o editor humano rejeitou com ❌;
- backend sincronizou `rejected_art`;
- `needs_art_revision: true` foi registrado;
- não houve publicação pública.

O ciclo de revisão foi posteriormente implementado e exercitado por várias revisões. R1, R2, R3 e R4 ficaram preservadas no histórico. No momento deste handoff, o item havia avançado para R5 e estava novamente em `sent`, aguardando decisão humana. Sempre conferir o JSON atual antes de assumir que continua assim.

Fluxo positivo ainda precisa de validação real completa:

`✅ humano → approved → canal público → published → discord_public_id → rerun sem duplicação`

---

## Blindagem editorial implementada em 25/09/2026

A publicação deixou de depender apenas de `status == approved`.

Arquivos alterados:

- `scripts/sync_approval_state.py`
- `scripts/discord_publish_bridge.py`
- `scripts/revise_rejected_art.py`

Binding atual: `spidey-approval-binding-v1`.

Para uma aprovação poder virar publicação, o sistema deve vincular e validar:

- revisão atual (`art_revision`);
- revisão aprovada (`approved_revision`);
- `discord_approval_id` corrente;
- `approved_discord_approval_id`;
- `image_url` corrente;
- `approved_image_url`;
- SHA-256 do arquivo de arte exibido na mensagem de aprovação;
- `needs_art_revision != true`;
- `status == approved`.

O sync compara a arte normalizada atual com o anexo de imagem do Discord antes de gravar a aprovação. Se não forem o mesmo arquivo, a decisão vira bloqueio/conflito e não publicação.

O publisher recalcula e revalida o hash antes de publicar. Se revisão, URL, mensagem ou hash divergirem, falha fechado e grava o motivo de bloqueio.

A reconciliação/antiduplicação pública também deve exigir correspondência do conteúdo e do hash da arte, não apenas título/texto/URL.

A publicação automática de mensagens legadas sem item editorial corrente foi desativada. Mensagens antigas não podem furar o novo vínculo editorial.

Ao criar uma nova revisão após rejeição, os campos de aprovação/publicação da revisão anterior são limpos para impedir reutilização de um ✅ antigo.

Commits iniciais dessa blindagem:

- `6c29edd0dd60b8b4354165dcd216b35d75d94910` — vínculo de aprovação à revisão/arte exatas;
- `d6d553c5c0a17366fbf9ab1a6f3140192f892eff` — publisher fail-closed por revisão, mensagem e hash;
- `4f53802e467f3603d26c4b75820f1aadd0a6700b` — limpeza dos vínculos ao criar nova revisão.

Antes de usar estes SHAs como referência absoluta, verificar o `main` atual.

---

## Regras de estado editorial

Estados relevantes:

- `pending`
- `sent`
- `approved`
- `rejected`
- `rejected_art`
- `decision_conflict`
- `blocked_art_standard`
- `published`

Estados rejeitados/terminais nunca devem retornar automaticamente para aprovação ou publicação.

Uma nova revisão deve ter nova arte, novo envio ao canal de aprovação e nova decisão humana. Aprovações antigas não podem valer para revisão nova.

Histórico R1/R2/R3/... deve ser preservado.

---

## Backlog prioritário

### CRÍTICO

1. Validar a blindagem nova em Actions e confirmar que não houve regressão de import/sintaxe/runtime.
2. Testar cenário de segurança: aprovação antiga ou arte/revisão divergente precisa ser bloqueada.
3. Corrigir o gerador visual Premium de verdade. Revisões anteriores foram mecanicamente novas, mas editorialmente insuficientes.
4. Fazer regressão controlada: R1 ❌ → R2 ❌ → R3 ✅, preservando histórico e impedindo reutilização de aprovação velha.
5. Fazer E2E positivo real: ✅ → approved → publicação pública → `published` → `discord_public_id`.
6. Rodar publisher novamente e provar zero duplicação.

### IMPORTANTE

1. Validar individualmente Oficial, G47IX, PokeMiners e SPS.
2. Para cada fonte: novo item → captura → pending → cursor avança → rerun sem duplicação.
3. Confirmar bridge SPS externo → canal intermediário. Não declarar SPS operacional sem esse feed real.
4. Confirmar persistência dos cursores sob runs concorrentes/commits.
5. Validar retry/429 e idempotência de aprovação/publicação.
6. Integrar `scripts/world_event_times.py` em todos os caminhos que realmente precisem dos horários mundiais.
7. Nunca inventar hora/timezone ausente.

### FUTURO

- novos formatos de card;
- refinamentos visuais depois de obter um Premium realmente aprovado;
- novas fontes;
- feedback estruturado de rejeição;
- métricas/observabilidade.

---

## SPS

O bot não deve usar self-bot nem token de usuário.

Como ele não lê diretamente o servidor Discord externo GO-NEWS/SPS, precisa de bridge para um canal intermediário controlado.

Cursores relevantes:

- `last_discord_source.txt`
- `last_sps_weekly.txt`

No último auditado:

- `last_discord_source.txt` tinha estado;
- `last_sps_weekly.txt` estava vazio;
- monitor SPS tinha proteções para falhar se o canal intermediário estivesse vazio ou desatualizado;
- bridge ao vivo ainda precisava ser provada.

---

## Horários mundiais

Referência oficial Ásia do projeto:

- **Taipei, Taiwan 🇹🇼**
- timezone IANA: `Asia/Taipei`

Não usar Singapura como referência asiática.

Arquivos:

- `config/world_event_points.json`
- `scripts/world_event_times.py`

Conversão brasileira: `America/Sao_Paulo`.

O módulo/configuração existe, porém sua integração em todos os monitores relevantes deve ser verificada antes de declarar concluído.

---

## Discord

Canal de aprovação: `1550963072464715997`

Canal público: `1550963136519999658`

---

## Princípio de trabalho

Não recomeçar.

Não reescrever o que já funciona sem motivo.

Não confiar apenas neste documento: ele é o mapa de continuidade, mas o código atual do repositório é a verdade técnica final.

Ao receber `SPIDEYNEXUS`, ler este arquivo, conferir commits/estado atual, localizar a primeira pendência crítica ainda aberta e continuar dali.

---

## Atualização canônica — 27/09/2026 — V2 Clean + decisão de custo zero

### Decisão de produto

O canal público será gratuito e a orientação explícita do usuário é **priorizar custo zero** sempre que possível.

Consequência: **não usar a API paga da OpenAI como dependência obrigatória de produção**. A assinatura do ChatGPT não deve ser confundida com créditos de API. O workflow experimental que usa `OPENAI_API_KEY` pode permanecer como prova técnica, mas não é o caminho de produção enquanto exigir cobrança adicional.

### Branch de saneamento

Branch ativa de teste: `spidey-v2-clean`.

Objetivo do V2: provar um fluxo mínimo e confiável antes de religar todas as fontes:

`1 item → 1 arte → Discord aprovação → ✅/❌ humano → publicação ou bloqueio`

### O que o V2 já provou

O E2E positivo do núcleo mínimo foi validado com Sandile:

- arte enviada ao canal de aprovação;
- ✅ humano reconhecido;
- mesma arte validada por SHA-256;
- publicação no canal público;
- estado final `published`;
- mensagem pública validada: `1553525839411421235`;
- rerun posterior resultou em NOOP, sem duplicação.

Portanto, **aprovação → publicação com idempotência = FUNCIONA no V2**.

### Padrão visual atual

O usuário reafirmou que o Gold Standard já existia antes do Sandile. A arte final de Sandile produzida no chat em 27/09 foi aprovada visualmente, com:

- composição vertical mobile-first;
- português consistente;
- data `17 de outubro de 2026`;
- horário `11h às 17h`, horário local;
- identidade visual Spidey;
- qualidade considerada correta pelo usuário.

Essa aprovação visual não redefine o padrão; apenas confirma o padrão já estabelecido.

### Gargalo real atual

O problema recorrente não é mais a lógica de ✅/publicação. O gargalo é **transportar/produzir a arte final full-size dentro do ambiente operacional sem reduzir, corromper ou quebrar o arquivo**.

Tentativas por base64 fragmentado e assets reduzidos geraram arte pequena/instável e não devem ser tratadas como solução definitiva.

O V2 já possui guarda de resolução mínima no `v2/spidey_core.py`:

- mínimo `800x1200`;
- orientação vertical obrigatória;
- bloqueio de arquivo pequeno demais;
- validação de SHA-256 antes de publicar.

### Estado atual do Sandile V2

Item: `v2/queue/sandile.json`.

No último estado conhecido antes desta atualização, ele estava em `asset_loading`, preparando teste full-size.

Foi criado `v2/generate_gold_art.py` e o workflow V2 foi adaptado para gerar arte no próprio GitHub Actions antes do Discord.

Run de teste: `36317620236`.

Resultado: **falhou antes do Discord porque `OPENAI_API_KEY` estava ausente**. Isso não é mais considerado ação a ser pedida ao usuário, pois a nova decisão é evitar custo.

### Próxima direção técnica

A próxima solução deve manter o V2 simples e sem custo adicional:

1. remover a API paga da OpenAI como dependência obrigatória;
2. preservar o core que já funciona para Discord/✅/publicação;
3. resolver geração/montagem full-size por rota gratuita;
4. usar mídia oficial/licenciada/permitida e composição determinística quando necessário;
5. aplicar o logo oficial real e textos/dados de forma determinística;
6. bloquear qualquer arte abaixo do padrão/resolução antes do Discord;
7. só depois religar Oficial, G47IX, PokeMiners e SPS.

### Regra de retomada

Ao receber `SPIDEYNEXUS`, **não pedir OPENAI_API_KEY por padrão**. Primeiro verificar se já existe uma rota gratuita operacional para gerar/compor a arte full-size. O objetivo atual é fechar esse gargalo mantendo custo zero.

---

## Atualização canônica — 28/09/2026 — Art System v1

### Nova prioridade visual do app

O usuário identificou um problema real no calendário: ao abrir eventos sem arte própria, o app mostrava o **logo do Spidey ampliado e em baixa qualidade**.

Isso passa a ser tratado como defeito de produto, não como fallback aceitável.

### Regra nova

O logo oficial do Spidey **não deve ser usado como arte principal de evento**.

Cada evento deve resolver arte por contexto:

- `thumb` = miniatura/lista;
- `card` = cards e resumo semanal;
- `hero` = tela individual do evento;
- `poster` = arte completa/compartilhável.

Documento técnico: `SPIDEY_ART_SYSTEM.md`.

### Padrão mínimo

- sem `data:`/base64 em evento publicado;
- sem logo ampliado como pôster;
- `hero/poster` real: mínimo recomendado `800x1200`, vertical;
- `weekly/card`: mínimo recomendado `720x900`;
- não esticar thumbnail pequena para tela cheia;
- falha de imagem deve cair para um fallback event-specific, nunca para o logo borrado.

### Fallback individual automático

Enquanto um evento ainda não possuir arte Premium real, o Spidey gera um **visual vetorial individual 1080×1620** com:

- título do evento;
- categoria;
- data/horário;
- tags;
- fonte;
- identidade Spidey.

Esses visuais são gerados por `scripts/generate_event_vector_art.py` em:

`spidey-app/assets/events/generated/`

Eles são fallback editorial de alta qualidade e **não devem ser chamados de Premium**.

Quando uma arte Premium real existir e passar no gate de qualidade, ela tem prioridade sobre o visual vetorial automático.

### Auditoria comprovada

Script: `scripts/audit_event_art.py`.

Primeira auditoria antes do fallback vetorial:

- 120 eventos no escopo setembro/outubro de 2026;
- 0 com Hero real pronto;
- 0 com Weekly real pronto;
- Festival das Luzes continuava aprovado e válido fora desse escopo mensal.

Após gerar os visuais individuais:

- 120/120 eventos setembro/outubro com cobertura `hero`;
- 120/120 com cobertura `weekly`;
- 120 usando fallback vetorial nesse escopo;
- 0 faltando arte funcional;
- Festival das Luzes preservado como arte real HQ e continua passando o gate.

Isso resolve o problema imediato de logo borrado, mas **não encerra o trabalho de arte Premium individual**.

### Próxima evolução visual

Prioridade após a entrada do Art System v1:

1. revisar no celular a aparência dos visuais individuais em lista/dia/detalhe;
2. substituir progressivamente os fallbacks dos eventos principais por artes Premium reais;
3. ligar a geração Premium ao fluxo de autopublicação de novos eventos;
4. usar os mesmos papéis de arte no `Spidey Weekly`;
5. nunca reduzir a qualidade do Festival das Luzes, que já é referência HQ aprovada.

### Regra de retomada

Ao receber `SPIDEYNEXUS`, conferir se `spidey-art-system-v1` já foi incorporado à `main`.

Se já estiver na `main`, considerar **logo borrado como fallback = corrigido** e continuar a evolução das artes Premium individuais.

---

## Atualização canônica — 28/09/2026 — Horários, locais e coordenadas

### Padrão visual obrigatório

Toda nova tela, mockup ou módulo do Spidey deve manter o **logo oficial existente no projeto**, sem redesenhar, reinterpretar ou criar uma variação parecida. O cabeçalho, cores-base e linguagem visual devem permanecer coerentes entre Calendário, Semana, Stamps, Mapa e futuras guias.

### Bloco padrão no detalhe do evento

Eventos que dependam de horário mundial, região ou local devem ter um bloco **Horários e locais** no detalhe. Esse bloco deve mostrar, quando aplicável:

- cidade/região e país;
- horário local do evento;
- conversão para `America/Sao_Paulo`;
- coordenada somente quando houver referência válida;
- tipo/confiança da coordenada;
- ações disponíveis para aquela coordenada.

Para eventos globais por horário local, como Community Day, Spotlight Hour e Raid Hour, a prioridade é mostrar a tabela mundial de horários. Esses eventos não devem receber uma coordenada única artificial.

### Política de coordenadas

Nunca inventar coordenada exata.

Tipos relevantes continuam separados:

- `exact_pokestop` = Stop confirmada e apta a GPX;
- `venue_reference` = referência aproximada de venue;
- `city_reference` = referência aproximada de cidade.

GPX de PokéStop só pode existir para `exact_pokestop` confirmado. Referências aproximadas devem ser identificadas como tal e não podem ser promovidas silenciosamente a ponto exato.

### Ações da interface

Quando uma coordenada válida existir, a interface deve oferecer, conforme compatibilidade:

- **Copiar coordenada**;
- **Abrir em aplicativo compatível** usando mecanismos padrão do sistema operacional/deep link geográfico quando disponíveis;
- **Compartilhar coordenada**;
- **Baixar GPX**, apenas quando permitido pela política de precisão.

O Spidey não deve prometer ou implementar como requisito um teleporte automático específico em PGSharp, iPoGo ou Fake GPS. A integração deve permanecer genérica e baseada em mecanismos suportados pelo sistema/aplicativo receptor. Se um app instalado aceitar coordenadas via Intent/deep link, o sistema operacional poderá oferecê-lo ao usuário.

### Regra de retomada

Ao receber `SPIDEYNEXUS`, preservar esta lógica ao construir Community Day, Spotlight Hour, Raid Hour, Stamps, City Safari e demais eventos com localizações: **horário mundial correto primeiro; coordenada apenas quando verdadeira; ações universais e seguras; nunca inventar precisão.**


## Checkpoint de continuidade — 01/10/2026

Continuação da branch `spidey-fly-v1`, sem promoção a main/produção. Código do candidato: `8fac1edb4a24c2474d89e8c9e311892153ed6c87`. FLY dinâmico, Command Center, Selos e Novidades foram trabalhados preservando decisões canônicas. QA responsivo 390/1280 e 33 testes passaram. O estado concreto, preview, evidências e limites estão em `SPIDEY_PUBLIC_RELEASE.md`; lê-lo na próxima retomada. Não interpretar este checkpoint como lançamento público aprovado: cobertura Premium pendente, Android/PWA/push e Amigos/Chat continuam em aberto.


### Direção do editor — 01/10 manhã
O candidato anterior foi considerado funcional, mas a identidade e arquitetura foram criticadas como corporativas/PowerPoint; não tomar esse visual como aprovado. Artes são essenciais para lançamento. FLY deve incluir peculiaridades, bônus e arte do evento. Linguagem técnica/bastidores deve sair da experiência pública. Trabalho concreto e evidências adicionais em `SPIDEY_PUBLIC_RELEASE.md` e recuperação factual em `SPIDEY_APPROVED_ARTS.md`. Entrega alvo 02/10, núcleo antes de Amigos/Chat.


### Checkpoint testado — Home/FLY, 01/10 manhã
Código observado na preview: `d7028d672abff8995f4b55e64157ab3d8f5d54f9`. Arquivos `player-ui.js/css` compõem Home e dados específicos no FLY. `preview-art.js` é proposta separada do master; usa recortes pictóricos de originais, sem aprovação automática. 11 binários recuperados, com manifesto de hashes. 36 testes passaram; QA 390/1280 e Xerneas preservado. Ler limites e provas em `SPIDEY_PUBLIC_RELEASE.md`; não declarar toda a cobertura Premium concluída. Main/produção sem promoção.

## Correção de QA — Xerneas vazio, 01/10/2026
Os prints do editor e a reprodução no preview revelaram que a imagem vinculada não era visível. A validação anterior de URL/dimensões não comprovou renderização; a declaração de preservação visual deve ser lida com esta correção. O AVIF aprovado é truncado: 15.008 bytes presentes; caixa mdat termina no byte 54.559. FFmpeg e libavif falham ao decodificar. Original e SHA permanecem intactos; aprovação editorial não é revogada. Disponibilidade de renderização bloqueada até recuperar o binário completo exato (APPROVED_PENDING_ASSET operacional). Não usar o Xerneas recuperado de 14–26/10 nem Elite Raids de 18/10 como substituto. Candidato remove o espaço vazio e exibe aviso curto no detalhe; Home não cria miniatura vazia nem usa arte concorrente. Isto é contenção da falha, não cobertura artística concluída, e continua sendo bloqueio da entrega visual. Produção não promovida.

## Originais de Xerneas reenviados — 01/10/2026, 07:24 BRT
Quatro arquivos recebidos diretamente do editor e preservados sem modificação; manifesto `docs/qa/xerneas-originals-20261001.json`. `1000426235.png` recupera a peça completa de Hora de Reides de 30/09, 18–19h, associada exclusivamente a `2026-09-30-raid-hour-xerneas`, coerente com o catálogo. Não copiar essa data para a rotação geral. `1000426215.png` é variante sem data, ainda intitulada Hora de Reides; preservar sem inferir associação à rotação. `1000431444.png` traz 14–26/10 e bônus divergentes; `1000431181.png` traz Elite Raids 18/10. Preservar referências, não publicar para a rotação 30/09–06/10. O AVIF truncado permanece intacto para rastreabilidade; bloqueio da rotação geral ainda não resolvido. Nenhuma promoção de produção.

## Detalhe público simplificado — 01/10/2026
Removida rota mundial paralela do detalhe; única ação Ver rota mundial abre FLY e fecha o dialog, permitindo usar seleção, horários e coordenadas. Ausência de GPX deixa de gerar aviso sem ação; downloads existentes e regras de Selos preservados. Tentativa de corrigir poster da rotação de Xerneas bloqueada por quota da ferramenta de imagem; nenhum novo APPROVED criado.

## Correção de rotação Xerneas — candidato 01/10/2026
Ferramenta de imagens voltou a permitir edição. Candidato `assets/events/review/xerneas-rotation-correction-v1.png`, SHA256 `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`, 1121×1403, gerado a partir do original reenviado `1000431444.png`. Data 30/09–06/10; painéis de bônus sem confirmação e horários retirados. PENDING_REVIEW: não declarado aprovado. Master AVIF e originais preservados. `preview-art.js` autoriza explicitamente este candidato apenas para os dois IDs da rotação com asset indisponível; nenhuma heurística de fallback nem troca da Hora de Reides recuperada. Necessária revisão humana do desenho/textos antes de promoção. O detalhe tem uma ação Ver rota mundial que fecha o modal e abre FLY; remove duplicata de horários mundiais e aviso sem ação sobre GPX.

## HANDOFF OBRIGATÓRIO — limite de conversa, 01/10/2026 07:40 BRT
Continuar na branch spidey-fly-v1; não reiniciar. Última preview VALIDADA da simplificação: código 0ebd6a2a54fc3764350befc5590a1323a996d19c, https://spidey-pokemon-h0o1npdq1-spidey3.vercel.app. Mobile 390 e desktop 1280: uma ação Ver rota mundial fecha modal e abre FLY; removido aviso de GPX indisponível e horários mundiais duplicados. 37 testes nessa revisão passaram. Hora de Reides Xerneas de 30/09 usa original 1000426235.png e foi confirmada no Android pelo editor.
Novo checkpoint contém PNG corrigido de rotação Xerneas e integração EXCLUSIVA para revisão: PENDING_REVIEW, master original preservado. 10 testes Node passam; nova integração de arte ainda NÃO foi conferida em preview/mobile/desktop. Próxima ação: validar candidata da branch, imagem realmente visível na Home e no detalhe Reides 5★: Xerneas, preservar Hora de Reides e simplificação; obter revisão visual do editor antes de qualquer aprovação de arte ou produção. Não confundir commit de checkpoint com release aprovado. Produção/main sem promoção. Retomar depois cobertura de artes/bonificações, identidade Command Center e linguagem pública; Selos, Novidades; Amigos/Chat só depois núcleo estável.

## RETOMADA VALIDADA — 01/10/2026
Retomado exatamente `f32ae6e439d1e04443933c97da0f5dd6dfaa5685` na branch `spidey-fly-v1`, sem reiniciar. Base de código final desta rodada: `62c86a4936079023c3881d6e52ec7a8c2953401f`. Preview direto verificado: https://spidey-pokemon-o8gs3th9c-spidey3.vercel.app/spidey-app/index.html

Rotação Xerneas corrigida realmente renderizada em 390×850 e 1280×850, inclusive Semana. Exceção de revisão agora é compartilhada entre os renderers; master e hashes preservados. Detalhe abre no topo com Fechar acessível; dimensões do pôster reservadas durante carregamento. Hora de Reides usa exclusivamente `1000426235.png`, 1229×1536; uma ação Ver rota mundial fecha o diálogo e abre FLY com o evento correto. Arte da rotação permanece `PENDING_REVIEW`; renderização comprovada não é aprovação editorial.

Preparação pública: cache versionado inclui candidata/originais usados no preview; fonte com linguagem legível; títulos localizados; Selos apresenta resumo/observações próprios do jogador, mantendo notas técnicas no dado original. FLY 20/28, Taipei, horários local/Brasília e progresso de Selos foram conferidos no navegador. 10 testes Node e 28 Python passaram; 18 scripts ativos com sintaxe válida. Evidências, comandos e limites: `docs/qa/XERNEAS_ROTATION_20261001.md`.

Próximas ações: revisão humana da candidata Xerneas; completar cobertura e revisão factual das demais artes prioritárias; revisar tags/textos restantes; comprovar Android físico, instalação/upgrade/offline PWA e entrega push na versão corrente. Clipboard real e conteúdo do GPX baixado não comprovados nesta rodada. Novidades ainda deriva do catálogo, não é feed independente. Amigos/Chat continua NÃO IMPLEMENTADO e posterior ao núcleo. Nenhuma promoção a main/produção nesta rodada.

## APROVAÇÃO XERNEAS — 01/10/2026, 09:08 BRT
O editor respondeu “Sim, aprovo” à candidata exata da rotação mostrada no preview e nos prints do checkpoint `24add19`. PNG `b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738`, 1121×1403, agora APPROVED para `2026-09-raids-xerneas` e `2026-10-xerneas-raids`. Consolidado sem mudança de bytes em `assets/events/premium/xerneas-rotation-approved-v1.png`; registro vinculando decisão, arquivo, eventIds e revisão factual em `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`.

Master é autoridade ativa do PNG; Xerneas saiu de preview-art. AVIF truncado e candidata preservados como histórico. Hora de Reides mantém exclusivamente seu original `1000426235.png`. A composição do detalhe é mantida com full_poster/dimensões reservadas; cache e versões do shell foram atualizados. Cinco etiquetas restantes da Semana foram localizadas em pt-BR. Esta aprovação não se estende a Seedot/Cinderace/Zorua, às demais artes nem à produção; continuar cobertura factual/visual e Android/PWA/push. Confirmação do novo caminho em preview deve ser registrada no relatório de QA antes do próximo handoff.

### QA pós-aprovação e continuidade
Base de código `641463d5f98e47b0396f2971928e9ce0be92615c`, preview direto verificado https://spidey-pokemon-3dtankvqz-spidey3.vercel.app/spidey-app/index.html. Master aprovado realmente renderizado em 390×850 e 1280×850, Home/Semana/detalhe. Hora de Reides preservada, 1229×1536, ação única para FLY mantendo seleção. Provas novas no relatório `docs/qa/XERNEAS_ROTATION_20261001.md`. 11 testes Node e sintaxe dos 18 scripts passaram, incluindo vínculo aos bytes aprovados e proteção da Hora de Reides.

Preparação pública avançou nas etiquetas pt-BR e inventário de cobertura. Ler `docs/qa/PUBLIC_ART_READINESS_20261001.md`: 23 eventos entre 01–07/10, 1 master APPROVED, 2 recortes PENDING_REVIEW, 20 sem arquivo no compositor Home/FLY. Próximo trabalho artístico: Applin/A Invasão, Cinderace; continuar demais eventos sem presumir novas aprovações. Android/PWA/push e clipboard/GPX real ainda sem prova nesta versão. Nenhuma promoção a main/produção; Amigos/Chat continua posterior ao núcleo.

## Continuação autorizada — artes prioritárias, 01/10/2026
Após “Ok / Bora”, preparados dois pôsteres corrigidos de Invasão e Cinderace, ambos PENDING_REVIEW, 1121×1403, originais e masters preservados. Registro factual/arquivos/prompts em `docs/qa/PRIORITY_ART_REVIEW_20261001.json`. Applin teve geração recusada pela ferramenta, sem arquivo; Pumpkaboo revogado não foi reutilizado. Os três eventos agora possuem detalhes/bônus/condições de acesso conferidos em fontes oficiais pt-BR; título Pomar de Applin e referências da Semana alinhados. Integração das duas candidatas explícitas na Home/FLY/detalhe/Semana, cache versionado. Próximo: QA dessa revisão em mobile/desktop, consolidar provas e obter aprovação humana destas duas peças. Xerneas mantém APPROVED, não reabrir sua revisão. Sem promoção a main/produção.

QA inicial encontrou Cinderace sem tag Global, bloqueando FLY e gerando aviso incorreto de local pendente. Corrigida identificação global no catálogo e na Semana; nenhuma coordenada de Ponto de Energia inventada. Teste da rota real de 03/10, 14–17h locais, incluindo Taipei, cobre esta regressão. Cache `priority-art-review-v2`. Applin e Invasão continuam eventos de vários dias fora do conjunto atual de categorias FLY; não alegar rota mundial dessas duas categorias.

### QA final e handoff desta revisão
Código `684d80e794cecaecf66991f96b4d74c963fb444c`; preview direto https://spidey-pokemon-6a6143fc8-spidey3.vercel.app/spidey-app/index.html. Invasão/Cinderace realmente decodificados e exibidos inteiros em mobile/desktop, Home/detalhe/Semana; action FLY de Cinderace fechou modal, manteve seleção e arte/bônus/fonte, rota 20/28 com Taipei correta. Xerneas aprovado preservado e renderizado pela Semana. Applin conferido com detalhes oficiais e sem arte recuperada revogada. 14 testes Node, sintaxe dos 18 scripts/SW e integridade passaram. Provas e limites em `docs/qa/PRIORITY_ART_20261001.md`.

Dois PNGs PENDING_REVIEW aguardam aprovação humana exata, não produção. Arte de Applin não foi entregue pela ferramenta. Próximo continuar esse bloqueio/cobertura restante e Android/PWA/push; não repetir trabalho aprovado de Xerneas nem reiniciar arquitetura. Inventário atualizado para 23 eventos: 1 APPROVED, 2 pôsteres PENDING_REVIEW, 1 recorte, 19 sem arquivo Home/FLY. Nenhuma promoção a main/produção nesta rodada.

## APROVAÇÃO INVASÃO + CINDERACE — 01/10/2026, 15:45 BRT

Editor respondeu “Sim, aprovo” aos dois PNGs exatos apresentados no checkpoint `df9d050`, QA `684d80e`. Invasão `918d1a6735191636a5f26cee9d3a8ae61c8fc6a1d2c09e70e894bb6f70570165` e Cinderace `b8f9b02488e8817bdb250c676a04e6503f4492d84a55836124f7ae94bd34e470`, ambas 1121×1403, agora APPROVED no master para seus eventIds exclusivos. Cópias premium idênticas às candidatas, sem regeneração. Registro auditável `docs/qa/PRIORITY_ART_APPROVAL_20261001.json`. Originais, candidatas, prompts e Xerneas/Hora de Reides/Festival das Luzes preservados.

Entradas de Invasão/Cinderace removidas do preview-art; full_poster e resolução soberana mantidos. Shell/cache atualizados, teste de aprovação liga decisão aos bytes/eventIds e preserva as pendências de Applin/Seedot/Zorua. Próximo nesta rodada: testar, publicar checkpoint de branch e confirmar novos caminhos no preview mobile/desktop/Semana/FLY; registrar evidências antes do handoff.

Inventário corrente: 23 eventos entre 01–07/10, 3 masters APPROVED, 1 recorte pendente, 19 sem arquivo Home/FLY. Applin/cobertura restante e Android/PWA/push continuam pendentes; aprovação não inclui lançamento completo nem produção. Não reiniciar nem reabrir artes já aprovadas.

### QA pós-aprovação concluído e handoff

Código validado `a242f88cbe575902c064110883d71e1ef12778b4`, tree local/remoto idêntico, deploy READY `dpl_EHiVvMsaDnwNeXGHPsofynKN6UDd`. Preview seguro verificado https://spidey-pokemon-huc1kneau-spidey3.vercel.app/spidey-app/index.html. Invasão e Cinderace APPROVED realmente decodificados 1121×1403, paths premium/hashes corretos, completos no mobile Claro e desktop Escuro. Home/Semana/detalhe, duas ocorrências de Cinderace na Semana; Xerneas aprovado preservado. Fechar acessível, scroll inicial zero, sem overflow horizontal nas medidas observadas. FLY de Cinderace: ação única fecha diálogo e mantém seleção, arte/fonte/bônus, 20/28 pontos e Taipei corretos. App direto também conferido, aba com Cinderace deixada disponível.

14 testes Node, sintaxe de 18 scripts/SW, JSON/precaches/hashes/diff passaram. Quatro provas novas e limites em `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`; decisão e provas vinculadas em JSON homônimo. Checkpoint documental que contém este handoff não altera código validado.

Próximo: Applin/cobertura restante (23 eventos: 3 APPROVED, 1 recorte pendente, 19 sem arquivo Home/FLY), Android físico/instalação/upgrade/offline PWA/push, clipboard/GPX real. Applin bloqueado pela tentativa de geração documentada, sem arquivo, Pumpkaboo revogado não substitui. Não reabrir Xerneas/Invasão/Cinderace aprovados; continuar nesta branch sem reinício. Nenhuma promoção a main/produção e Amigos/Chat posterior ao núcleo.

## Continuação — Seedot corrigido e bloqueios persistidos, 01/10/2026

Após “Ok, e agora?”, preservado checkpoint `aaaedd1` na branch spidey-fly-v1. Repetido o pedido exato de Applin, mesmos prompt/inputs: nova recusa de saída, sem arquivo. Preparada Semana do Espaço com referência visual oficial e marca, também recusada, sem arquivo. Requests/prompts no manifesto `docs/qa/NEXT_ART_REVIEW_20261001.json`; não alterar prompts para contornar nem inferir arte Premium de fallback.

Seedot foi entregue por edição do original recuperado: novo full_poster PENDING_REVIEW, 1121×1403, SHA256 `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`. Correção 01/10, 18–19h locais, 2× PE por captura; removidos Community Day/11/10/14–17h/golpe exclusivo/shiny boost/pesquisas genéricas. Fonte comunidade GO Hub + Leek Duck; dados/Semana alinhados. Original e master aprovados preservados; apenas Seedot muda de recorte provisório para candidata integral. Shell/cache atualizados. Dados de Espaço incluem fonte pt-BR oficial/reides uma estrela/pesquisa gratuita e prazo 12/10, mantendo evento 04–10/10.

Próximo desta rodada: testes e QA mobile/desktop/Home/Semana/detalhe/FLY de Seedot; registrar provas antes da revisão humana exata. Inventário corrente 23 eventos: 3 APPROVED, 1 pôster PENDING_REVIEW, 19 sem arquivo. Applin/Espaço/cobertura restante, Android/PWA/push e clipboard/GPX real continuam pendentes. Nenhuma promoção a main/produção.


### QA Seedot e handoff — 01/10/2026

Código conferido `2ed7ef81b43d728e421e12e4888543d5155a5510`, deploy READY `dpl_AV7yjHyCzHJkfBVUFzDgaEMw6hio`, preview seguro https://spidey-pokemon-1v45kgmxg-spidey3.vercel.app/spidey-app/index.html. Seedot integral 1121×1403, hash exato do manifesto, renderizado na Home/detalhe/Semana/FLY. Mobile Claro 390×850 e desktop Escuro 1280×850, sem overflow nas medidas conferidas, detalhe no topo, Fechar acessível. Uma ação de rota fecha o diálogo e mantém Seedot; Essenciais 20 / Todos 28, Taipei 07–08h e Pago Pago 02/10 02–03h Brasília. Clique na Semana comprovado no app direto desktop e Enter no iframe; toque Android ainda pendente. Masters Xerneas/Invasão/Cinderace intactos e renderizados. Espaço mostra dados oficiais/prazo pesquisa até 12/10, sem arte Premium nova.

15 testes Node e sintaxe/JSON/cache/hashes/diff passaram na base de código; duas provas e limites em `docs/qa/NEXT_ART_20261001.md`, hashes no manifesto `NEXT_ART_REVIEW_20261001.json`. Checkpoint documental posterior não muda o código conferido. Seedot **PENDING_REVIEW**: próxima decisão humana apenas sobre esse PNG exato. Applin/Espaço recusados sem imagem, não contornar; seguir cobertura/restantes e Android/PWA/push/clipboard/GPX real. Não reabrir artes já aprovadas, não reiniciar arquitetura e não promover main/produção.


## APROVAÇÃO SEEDOT — 01/10/2026, 19:07 BRT

Editor respondeu “Sim, aprovo” ao PNG exato de Seedot apresentado no checkpoint `8d5541e`/QA `2ed7ef8`. Hash `6ac0ebbd5b6032f731efd3edbd4209443b7df6ba7e9c1ed098485feefa2d882f`, 1121×1403, agora APPROVED exclusivamente para `2026-10-01-spotlight-seedot`. Cópia premium idêntica à candidata em `assets/events/premium/seedot-spotlight-approved-v1.png`; original/candidata e registros históricos preservados. Registro `docs/qa/SEEDOT_APPROVAL_20261001.json`, confirmação pós-aprovação em `docs/qa/SEEDOT_APPROVAL_20261001.md`.

Master soberano/full_poster, mesmos papéis de imagem, cache/shell versionados. Fonte Seedot permanece comunidade; nenhuma alteração factual nesta consolidação. Somente a entrada Seedot sai do preview; todas as entradas aprovadas anteriores preservadas. Inventário corrente 23 eventos: 4 APPROVED, 19 sem arquivo Home/FLY; Zorua pendente fora da janela. QA pós-aprovação concluído em `b310f5a`, provas em `docs/qa/SEEDOT_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push. Applin/Espaço recusados, sem novo arquivo. Nenhuma promoção a main/produção; aprovação não inclui lançamento completo.


Handoff pós-aprovação Seedot: código `b310f5a`, preview seguro https://spidey-pokemon-5uir2c532-spidey3.vercel.app/spidey-app/index.html, mobile/desktop/Semana/detalhe/FLY conferidos, 16 testes passaram e duas provas preservadas. Home passou a Xerneas após o encerramento local de Seedot às 19h; masters anteriores preservados. Relatório `docs/qa/SEEDOT_APPROVAL_20261001.md`. Brief factual da próxima peça `docs/qa/MEGA_VICTREEBEL_BRIEF_20261001.json` (comunidade, sem arte/sem aprovação) e roteiro de teste físico `docs/qa/PUBLIC_ANDROID_QA_20261001.md` preparados. Continuar nesta branch sem reiniciar; não reabrir Xerneas/Invasão/Cinderace/Seedot aprovados. Checkpoint documental posterior não altera o código conferido; nenhuma promoção a main/produção.


## Novidades de 01/10 e candidata Mega Victreebel — continuação de 887a2cd

Anúncios primários Minior e trio Dinamax coletados em main `6045937` e incorporados editorialmente ao catálogo único da branch, sem merge de main. Catálogo 121→124: três períodos de Minior, um anúncio agrupado em Novidades; mesmo ID do Dia Max de 24/10 atualizado para Uxie/Mesprit/Azelf, cinco estrelas, distribuição regional e bônus. Indonésia enriquecida na fonte primária. FLY indica Pokémon em 25/28 linhas, mantém 20/28 referências; três ilhas sem atribuição inferida. Detalhes/limites/fontes: `docs/qa/NEWS_UPDATE_20261001.md` e JSON homônimo.

Mega Victreebel candidata v2 PENDING_REVIEW, 1121×1403, hash `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`, `assets/events/review/mega-victreebel-rotation-v2.png`. Datas de comunidade e aparência primária; v1 preservada, torres Max removidas na v2. Registro exato/prompts `docs/qa/MEGA_VICTREEBEL_REVIEW_20261001.json`; master aprovado intacto. 21 testes Node e sintaxe de 19 scripts + SW passaram. QA de preview desta rodada pendente; não confundir com o QA Seedot anterior. Próximo: conferir mobile/desktop, depois decisão humana sobre PNG Mega Victreebel v2. Demais artes e Android/PWA/push continuam pendentes; nenhuma promoção de produção.


QA da rodada Novidades/Mega Victreebel concluído em `282ea97`, preview direto https://spidey-pokemon-8hxqv2mhj-spidey3.vercel.app/spidey-app/index.html. Mobile 390 Claro/desktop 1280 Escuro sem overflow; um anúncio Minior/três períodos, trio regional/detalhe/FLY 20/28 com seleção preservada; candidata Mega v2 inteira 1121×1403 em Home/Semana/detalhe. Cliques e clipboard Taipei exato comprovados no app direto desktop. 21 testes passaram; masters anteriores intactos. Quatro prints/observações/hashes em `docs/qa/NEWS_UPDATE_20261001.md` e `docs/qa/MEGA_VICTREEBEL_REVIEW_20261001.json`. Candidata v2 PENDING_REVIEW até decisão humana específica; 23 eventos de 01–07/10 agora 4 APPROVED + 1 pôster em revisão + 18 sem arquivo Home/FLY. Demais artes, Android/PWA/push e GPX continuam pendentes; coleta de notícias observada, ingestão do app foi editorial, sem nova prova automática. Nenhuma promoção a main/produção. Continuar da branch/checkpoint documental, preservando o código validado `282ea97`.


## Aprovação Mega Victreebel v2 — 01/10/2026, 22:09 BRT

Editor respondeu “Sim, aprovo” ao PNG v2 completo mostrado diretamente no chat após o reenvio da imagem. APPROVED exclusivamente para `2026-09-mega-victreebel-raids`; hash `6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22`, 1121×1403. Cópia byte a byte em `assets/events/premium/mega-victreebel-rotation-approved-v1.png`, sem regeneração. Vínculo da decisão/arquivo/eventId: `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json`. Datas permanecem identificadas como comunidade; aparência primária não é prova da rotação.

Somente Mega Victreebel sai do preview e entra no master; sete entradas anteriores, arquivos e históricos preservados. Shell/cache versionados. Inventário 01–07/10: 23 eventos, 5 APPROVED, 18 sem arquivo no compositor Home/FLY; Zorua pendente fora da janela. QA pós-aprovação confirmado no código `4b0f319`, Home/Semana/detalhe, mobile Claro 390×850 e desktop Escuro 1280×850; duas provas e observações no relatório `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push; Applin/Espaço seguem sem arquivo por recusas documentadas. Nenhuma promoção a main/produção.


### Handoff pós-aprovação Mega Victreebel

Código `4b0f319` conferido no preview https://spidey-pokemon-lf6sw9hcz-spidey3.vercel.app/spidey-app/index.html; duas provas preservadas, 21 testes e sintaxe dos 19 scripts + SW passaram. Home/Semana/detalhe usam PNG APPROVED idêntico ao recebido, mobile Claro/desktop Escuro sem overflow; clique no app direto confirmado. Detalhe no topo/Fechar acessível; masters anteriores e Novidades preservados. Registro completo `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.json`, relatório MD homônimo e evidência DOM `docs/qa/mega-victreebel-approved-browser-4b0f319-20261001.json`.

Continuar nesta branch sem reiniciar nem reabrir as cinco peças aprovadas. Prioridades: Applin/Espaço bloqueados pela ferramenta, cobertura Yveltal/Hora de Reides/Mega Blastoise e demais eventos; roteiro físico Android/PWA/push e GPX continuam pendentes. Inventário 23 eventos, 5 APPROVED, 18 sem arquivo Home/FLY. Checkpoint posterior de documentos/provas preserva o código validado. Amigos/Chat posterior ao núcleo, sem promoção a main/produção.


## Sprint para 02/10 — lote de reides para revisão

Prazo de 2h20 informado às 22:41:59 BRT, alvo aproximado 02/10 01:02 BRT; não é garantia de conclusão. Três candidatas integrais geradas pela ferramenta de imagens: rotação Yveltal v1, Hora de Reides Yveltal v2 (estruturas Max removidas, v1 preservada) e Mega Blastoise v1. Datas/fontes da comunidade conferidas, sem bônus inferidos. Registro de prompts, hashes e eventIds `docs/qa/OCTOBER_RAIDS_REVIEW_20261001.json`; todas PENDING_REVIEW, aprovação humana não inferida. Integração explícita no preview/Home/Semana/detalhe, cache/shell versionados; QA de preview em andamento.

Catálogo de 124 eventos e oito entradas anteriores do master preservados; apenas fontes/notas dos três eventos alinhadas à conferência e título Hora de Reides localizado. Inventário 01–07/10: 23 eventos, 5 APPROVED + 3 pôsteres em revisão + 15 sem arquivo Home/FLY. Applin/Espaço continuam sem arquivo por recusas documentadas; padrão Premium permanece obrigatório. Plano e bloqueios `docs/qa/RELEASE_SPRINT_20261001.json`. Android físico/PWA/push e GPX ainda pendentes; sem promoção a main/produção, Amigos/Chat posterior ao núcleo.


## QA do lote de reides — 02/10/2026, continuação de 10e28fc

Preview artístico conferido no código `10e28fc`: https://spidey-pokemon-k2g2780qx-spidey3.vercel.app/spidey-app/index.html. Três candidatas PENDING_REVIEW, nenhuma aprovação humana inferida. Calendário → 7/10 → detalhes: mobile 390 Claro/desktop 1280 Escuro, PNGs 1121×1403 integrais, rodapé visível, sem overflow horizontal no detalhe; foco Fechar/scrollTop 0. FLY Hora de Reides Yveltal usa v2 própria e eventId correto, 20 essenciais, 18–19h local/Brasília dinâmica. Home seis próximos e Semana 28/09–04/10 ainda não incluem novo lote; não registrar prova visual nessas superfícies.

Master/arquivos aprovados intactos, 22 testes do código passaram. Seedot encontrou redirecionamento ao login Vercel; acesso temporário renovado pelo conector restaurou o mesmo PNG dentro do app, sem mudar arte/código. Nove provas/hashes/observações e limites em `docs/qa/OCTOBER_RAIDS_REVIEW_20261001.json` e MD homônimo; dados DOM `docs/qa/october-raids-browser-10e28fc-20261002.json`.

Selos: progresso 0→1/17 persistiu ao fechar/reabrir, teste restaurado; GPX incompleto 0/5 bloqueado. GPX Japão mostrou toast, mas arquivo/XML não capturado em duas tentativas, continua PENDING_DOWNLOAD_PROOF (`docs/qa/stamps-browser-10e28fc-20261002.json`). Android físico/instalação/atualização/offline/push pendentes; roteiro corrente `docs/qa/PUBLIC_ANDROID_QA_20261001.md`. Preview protegido; leitura de endpoint push sem conclusão de configuração.

Janela 01–07/10 continua 23 eventos: 5 APPROVED + 3 candidatas + 15 sem arquivo Home/FLY. Applin/Espaço recusados pela ferramenta, não substituir por falso Premium. Prazo alvo 02/10 01:02 BRT não significa lançamento completo: bloqueios registrados no sprint. Próximo: decisão humana exata das três peças, cobertura restante e QA físico; sem main/produção, Amigos/Chat posterior. Checkpoint documental posterior preserva código `10e28fc`; continuar sem reiniciar.


## Aprovação das três artes de reides — 02/10/2026, 07:16 BRT

Editor respondeu “Aprovo todas as três” após reenvio separado dos PNGs integrais no checkpoint `1824d8b`, QA prévio `10e28fc`. APPROVED exclusivamente: `2026-10-raids-yveltal` (rotação v1, hash `dbed7399b3e32400db94db90f98c7b23af0029c91a55b568e18948cd828e5328`); `2026-10-07-raid-hour-yveltal` (candidata v2, hash `a3881d22755b5c326f02f45ab456af3eaa024ad99427be36c9ff1bfd9c8d436b`); `2026-10-mega-blastoise-raids` (v1, hash `474fa9a793959d9dcac7a8f42840267695f12b2d561d8e16bb0129b9182bf321`). Todos 1121×1403; cópias premium aprovadas byte a byte, sem regeneração. Registro `docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.json` e MD homônimo. Fonte/datas permanecem comunidade.

Três entradas retiradas do preview, agora no master/full_poster; oito entradas anteriores preservadas com arquivos/histórico. Candidatas/revisão anterior da Hora de Reides/prompts/provas intactos. Shell/cache/master versionados. Catálogo de 124 IDs/janelas inalterado. QA pós-aprovação do novo preview pendente; não atribuir prova do preview antigo ao código novo.

Inventário 01–07/10: 23 eventos, 8 APPROVED e 15 sem arquivo Home/FLY; Zorua pendente fora da janela. Applin/Espaço continuam recusados, sem peça nova; Android físico/PWA/push e download/XML GPX Japão pendentes. Prazo alvo anterior 01:02 BRT passou; lançamento completo não está pronto. A aprovação destas três peças não autoriza main/produção. Continuar branch/NEXUS, sem reiniciar nem reabrir artes aprovadas.

## Retomada após limite de conversa — 02/10/2026

Código retomado e conferido: `18fba5b2269a9e74510d096a9d4e794107517aa4`, branch `spidey-fly-v1`. Deploy READY `dpl_Errd7CNihkycUzVQus3FZgJva3CW`; preview https://spidey-pokemon-gdp8kfe9l-spidey3.vercel.app/spidey-app/index.html. Conferência registrada em 2026-10-02T17:04:13.643Z. Decisão “Aprovo todas as três” de 07:16 BRT permanece válida; nenhuma nova aprovação foi solicitada ou inferida.

QA pós-aprovação dos três pôsteres concluído: mobile responsivo 390×850 Claro e desktop 1280×850 Escuro, PNGs integrais 1121×1403, caminhos premium corretos, foco Fechar/scrollTop 0 e sem overflow horizontal nas medidas observadas. Downloads reais das três imagens servidas têm SHA-256 e bytes idênticos ao registro aprovado. FLY da Hora de Reides fecha o diálogo, mantém eventId e imagem própria, 20 essenciais/28 completos; Taipei 07/10 07–08h e Pago Pago 08/10 02–03h Brasília. Clique calendário→Hora de Reides conferido também no app direto desktop. Xerneas aprovado observado na Home durante a retomada; não foi substituído.

Provas/limites: `docs/qa/OCTOBER_RAIDS_APPROVAL_20261002.md`, JSON homônimo e `docs/qa/october-raids-approved-browser-18fba5b-20261002.json`; cinco screenshots dos pôsteres e uma do FLY preservadas. Screenshot desktop da Hora de Reides foi inspecionado, mas sua transferência falhou; não há arquivo dessa captura no checkpoint. 22 testes/sintaxe são os resultados anteriores do commit de aprovação, não uma execução nova nesta rodada. Mudanças desta rodada são exclusivamente documentos e provas; código, artes e catálogo permanecem iguais.

Próxima frente: cobertura das artes restantes e QA físico Android/PWA/atualização/offline/push, além da prova de download/XML GPX Japão. Último inventário 01–07/10 continua 23 eventos, 8 APPROVED e 15 sem arquivo Home/FLY; Applin/Espaço sem geração aceita. Home seis próximos/Semana 28/09–04/10 não contêm as peças de 07/10, sem prova nova dessas superfícies. Lançamento completo ainda não pronto; esta retomada não promove main/produção. Amigos/Chat posterior ao núcleo. Continuar da branch/NEXUS e preservar todas as aprovações já consolidadas.

## GPX, alertas e Zorua — continuação de 21a0c6e, 02/10/2026

Código `a2b56386e2eed9ba5cd173c7fb3590e8aa122f88` conferido no preview READY https://spidey-pokemon-cg9922frj-spidey3.vercel.app/spidey-app/index.html. 31 testes Node passaram, sintaxe de 25 scripts ativos/JSON e diff check passaram. Link GPX Japão agora é âncora nativa persistente, 17/17 pontos exatos; rota incompleta 0/5 permanece bloqueada. A captura do download expirou em duas tentativas e não retornou arquivo/XML: PENDING_DOWNLOAD_PROOF. GPXs antigos encontrados foram excluídos da prova; downloadMedia da imagem também expirou.

Push deixou de retornar 404: raiz API/rewrites/dependência implantadas. GET public-key respondeu HTTP 503 `push_not_configured`, no-store; configuração de produção incompleta. Clique real mostrou “Notificações indisponíveis no momento.” e botão reabilitado. Fluxo só declara ativo após cadastro remoto, sem toast/notificação de boas-vindas enganosa. Nenhuma configuração secreta, inscrição ou envio push alterado. SW atualiza apenas caches Spidey, mantém escrita viva, ignora API e resolve destino na pasta do app; offline validado por testes, sem nova prova física.

Zorua candidato PENDING_REVIEW/full_poster: `assets/events/review/zorua-community-day-correction-v1.png`, 1121×1403, SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`. Original preservado; fatos primários corrigidos para 10/10 14–17h locais, 3× PE, 2× Doces, Soco Enganador ao evoluir até 21h. QA real calendário→detalhe no app direto, mobile responsivo 390 Claro e desktop 1280 Escuro, pôster inteiro/fonte visível/object-fit contain, sem overflow observado e scrollTop 0; mobile focou Fechar. FLY seleciona mesmo eventId e PNG, fecha detalhe, 20/28 locais. Brasília: Kiritimati 09/10 21h→10/10 00h; Taipei 10/10 03–06h; Pago Pago 10/10 22h→11/10 01h, conferidos com IANA. Quatro screenshots e DOM preservados. Home/Semana atual não incluem Zorua de 10/10; bytes servidos não capturados, sem hash servido comprovado.

Relatório `docs/qa/DOWNLOAD_PUSH_ZORUA_QA_20261002.json` e MD homônimo; manifesto exato/prompts `docs/qa/ZORUA_REVIEW_20261002.json`. Sizzlipede foi recusado na saída pela ferramenta, request `b4adb8ce-c10c-4fbd-a61a-52e9b82ddf09`, sem arquivo; não contornar. Applin/Espaço seguem bloqueados. Próximo: decisão humana sobre este PNG Zorua exato, configuração/recebimento real de alertas, captura GPX e Android físico/instalação/atualização/offline. Inventário anterior 01–07/10 permanece 23 eventos, 8 aprovados, 15 sem arquivo Home/FLY; Zorua fora dessa janela. Sem promoção a main/produção. Checkpoint documental posterior preserva o código `a2b5638` e todas as aprovações anteriores; continuar sem reiniciar.

## Zorua aprovado e pausa solicitada — 02/10/2026, 18:38:35 BRT

Editor aprovou explicitamente o PNG completo: “Eu adorei a imagem, com certeza eu aprovo.” SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`, 1121×1403. Cópia byte a byte em `assets/events/premium/zorua-community-day-approved-v1.png`, candidata/original preservados, 11 masters anteriores intactos; Zorua sai do preview e integra o master APPROVED/full_poster. Registro `docs/qa/ZORUA_APPROVAL_20261002.json`. Bônus do pôster rechecados na fonte primária: 3× PE e 2× Doces por captura, 10/10 14–17h locais; Soco Enganador ao evoluir durante o evento ou até quatro horas depois, prazo 21h. Bônus adicionais oficiais incorporados ao mesmo eventId, sem modificar as janelas. FLY já conferido no código a2b5638: 20 essenciais/28 completos, horários local/Brasília, coordenadas e mesmo pôster. QA do novo preview pós-aprovação PENDING_NEW_PREVIEW até prova específica; não atribuir QA antigo ao código novo.

Editor pediu processamento por até cinco minutos e então pausa, por viagem/possível perda de sinal. Encerrar a rodada com checkpoint e pausar; próxima retomada somente quando ele acionar. Captura/XML do GPX, configuração/recebimento de alertas e Android físico continuam pendentes; demais artes/recusas inalterados. Sem promoção a main/produção, nenhuma publicação/mensagem externa. Não reabrir a aprovação do Zorua nem regenerar a peça.


Pausa consolidada ao fim desta rodada: 31 testes passaram após consolidação, cópia exata e 11 entradas anteriores preservadas. QA pós-aprovação no novo preview ainda pendente. Retomar da branch/checkpoint corrente quando Anderson acionar; não processar em segundo plano durante a pausa.

## Retomada com sinal — Zorua aprovado e GPX verificados, 02/10/2026

Editor retornou às 20:49:18 BRT: “Opa / Voltei, temos sinal”. Pausa anterior encerrada por esse acionamento. Código conferido `0433c322c43839f13a36996d52e511475c8739ae`, branch `spidey-fly-v1`, deploy READY `dpl_8EsSkfWnfXqbB9rLNPTHUfXfEJpB`; preview https://spidey-pokemon-bwb814dm8-spidey3.vercel.app/spidey-app/index.html. QA registrado em 2026-10-03T00:03:06.669Z; 02/10 em Brasília, 03/10 em UTC. Esta rodada altera apenas documentos/provas, preservando código, catálogo, binários e todas as aprovações.

Zorua: QA pós-aprovação PASSED_PREVIEW no novo deploy. Calendário → 10/10 → detalhe no app direto; mobile responsivo 390×850 Claro e desktop 1280×850 Escuro. PNG premium aprovado 1121×1403 inteiro, object-fit contain, foco Fechar e scrollTop 0, sem overflow horizontal nas medidas observadas. Download real da imagem servida: 2.299.199 bytes e SHA256 `9bdb113f3e0c2c6d837797b6ee951778f9605c2ba38d74967837885ebe72778b`, idênticos à aprovação de 18:38:35 BRT. Bônus oficiais novamente conferidos e presentes no detalhe/FLY. FLY seleciona `2026-10-zorua-community-day`, fecha diálogo, usa o mesmo PNG, 20 essenciais e 28 hotspots, coordenadas e relógios local/Brasília. Referências: Kiritimati 09/10 21h→10/10 00h; Taipei 10/10 03–06h; Pago Pago 10/10 22h→11/10 01h Brasília. Home seis próximos/Semana 28/09–04/10 não incluem Zorua de 10/10, sem nova prova dessas superfícies.

GPX Japão: PASSED_DOWNLOADED_XML. Clique no link nativo “Baixar GPX completo” criou arquivo novo às 23:58:30.916905Z. A espera de evento do navegador expirou, mas o download real foi recuperado pela pasta compartilhada, sem usar os três arquivos antigos. XML GPX 1.1 válido, 17 waypoints, nomes/latitudes/longitudes/ordem idênticos ao catálogo do commit; 1.890 bytes, SHA256 `8870435145133c11894b923dad8dead2bff056e78a7c79104346fb1e7e12382a`. Prova e arquivo: `docs/qa/japan-rally-browser-download-0433c32-20261002.json` e GPX homônimo. Coordenadas comunitárias exatas do catálogo não são promovidas a fonte oficial. PokéXciting 0/5 continua sem link GPX completo. Isso encerra a pendência de captura/XML no navegador; teste físico Android permanece pendente.

Relatório `docs/qa/ZORUA_APPROVAL_20261002.md`, registro canônico JSON homônimo, DOM `docs/qa/zorua-approved-browser-0433c32-20261002.json` e cinco screenshots preservados. 31 testes/sintaxe são resultados anteriores válidos da consolidação `0433c32`; não foram executados novamente nesta rodada sem alteração de código. Logs consultados registraram erros da extensão de metadados do navegador, sem erro do app no lote retornado; não confundir isso com prova de ausência de erros fora desse lote.

Push: novo endpoint do preview respondeu HTTP 503 `push_not_configured`, Cache-Control no-store. Configuração do servidor e recebimento real permanecem bloqueios; nenhuma inscrição/configuração secreta/envio foi alterado. Android físico/instalação/atualização/offline continuam pendentes. Último inventário 01–07/10: 23 eventos, 8 APPROVED, 15 sem arquivo Home/FLY; Zorua fora da janela. Applin/Espaço/Sizzlipede continuam com recusas registradas. Lançamento completo/produção não aprovados; sem promoção a main e sem mensagens externas. Próxima frente: cobertura restante, configuração push e QA físico. Não reabrir a aprovação nem regenerar Zorua.


## Thundurus e Elgyem — preview verificado, 03/10/2026

Continuação autorizada por “Maravilha / Bora”, retomada com “Bom dia / Travou?”. Código `a17f6d45535758ff2b5a36ef0e4e6e476af933e8`, branch `spidey-fly-v1`, deploy READY `dpl_57gGY2xz7ksHTXjZzQSPtudp2V2g`; preview https://spidey-pokemon-ko9ywdo8h-spidey3.vercel.app/spidey-app/index.html. QA anotado em 2026-10-03T10:20:58Z. Duas novas candidatas **PENDING_REVIEW**, sem decisão humana inferida: Thundurus Sombroso v1 (`eb8141c8220c4acf4c3a962aaf12ee07b7c37085d5e8f6a1f1d233e25b6a4439`) e Elgyem v2 (`2ab5e183a146654848b962d4e02603561cccfa5b20ad34ddbeacdaef3b913df9`), ambas 1121×1403. Elgyem v1 omitira o nome; preservada como histórico, sem integração/precache. Prompts e referências exatos em `docs/qa/THUNDURUS_ELGYEM_REVIEW_20261002.json`.

Fonte de comunidade GO Hub reaberta em 03/10: Thundurus Encarnado Sombroso de 5 estrelas em fins de semana até 6/10, janela 3–4/10 derivada do calendário; Elgyem 8/10 18–19h locais e 2× Doces por captura. Não classificar como fonte oficial. Nenhum bônus/horário diário de reide inventado. Apenas os títulos dos dois eventos foram traduzidos, e o bônus já existente do Elgyem foi incluído no campo estruturado. 124 IDs e horários, 12 masters e todos os arquivos premium protegidos byte a byte. 31 testes/sintaxe passaram.

QA real responsivo 390×850 Claro e 1280×850 Escuro dos dois detalhes: pôster completo, fonte/rodapé visíveis, object-fit contain, foco Fechar e scrollTop 0, largura do diálogo igual à de rolagem. Downloads das duas imagens servidas têm bytes/hashes idênticos às candidatas. Thundurus visto na Home e Semana 28/09–04/10; imagem correta carregada 1121×1403. Elgyem está fora desta semana e dos seis próximos da Home. FLY Elgyem mantém ID/PNG/bônus, 20 essenciais/28 completos e sem overflow horizontal medido; local 8/10 18–19h. Brasília: Kiritimati 8/10 01–02h; Taipei 8/10 07–08h; Pago Pago 9/10 02–03h, com coordenadas. Thundurus não integra o seletor horário global, conforme elegibilidade atual; nenhuma janela artificial foi criada. QA/DOM/seis screenshots em `THUNDURUS_ELGYEM_QA_20261002.json` e `thundurus-elgyem-browser-a17f6d4-20261003.json`.

Inventário recalculado 01–07/10 pelo compositor Home/FLY: 23 eventos, 8 APPROVED, 1 pôster em revisão (Thundurus) e 14 sem arquivo. Elgyem em revisão fora da janela. Push: GET da nova prévia retornou 503 `push_not_configured`, no-store, em 03/10 10:20:58Z. Connector não expõe operações env; runtime sem CLI/token; painel de variáveis observado na rodada redirecionou a login. Estado das variáveis não foi inspecionado. Nenhum segredo, configuração, assinatura ou disparo alterado. Zorua APPROVED e GPX Japão verificados anteriormente permanecem válidos. Recusas Applin/Espaço/Sizzlipede preservadas, sem contorno.

Próximo: aprovação visual específica dos dois PNGs completos, cobertura restante, acesso/configuração push e QA físico Android/PWA/atualização/offline/recebimento. Não reabrir artes aprovadas nem reiniciar o projeto. Nenhuma promoção para main/produção; lançamento completo continua pendente.

## Thundurus e Elgyem APPROVED — 03/10/2026, 07:30 BRT

Anderson: “Com certeza, eu aprovo as duas novas artes”, às 07:30:21 BRT. Decisão ligada exclusivamente aos PNGs completos anteriormente exibidos: Thundurus v1 (`2026-10-shadow-thundurus`, SHA256 `eb8141c8220c4acf4c3a962aaf12ee07b7c37085d5e8f6a1f1d233e25b6a4439`) e Elgyem v2 (`2026-10-08-spotlight-elgyem`, SHA256 `2ab5e183a146654848b962d4e02603561cccfa5b20ad34ddbeacdaef3b913df9`), ambos 1121×1403. Cópias premium byte a byte, sem regeneração. Elgyem v1 e registros de candidatas/prompts/QA anteriores preservados como histórico. Registro canônico `docs/qa/THUNDURUS_ELGYEM_APPROVAL_20261003.json` e MD homônimo.

Código `29c1aecf53742de581ea0fc036793d91a859bc60`, branch `spidey-fly-v1`, deploy READY `dpl_t2ntTxATK4wiqFBowy8YLWTtdPkw`; prévia verificada https://spidey-pokemon-7whircohq-spidey3.vercel.app/spidey-app/index.html. QA pós-aprovação PASSED_PREVIEW em 2026-10-03T10:45:32.263Z, 32 testes passaram. Mobile responsivo 390×850 Claro e desktop 1280×850 Escuro: dois detalhes com PNG integral, object-fit contain, rodapé visível, foco Fechar/scrollTop 0 e sem overflow horizontal medido. Downloads reais dos dois PNGs aprovados no novo deploy têm hashes e bytes exatos. Cinco screenshots/observações em `docs/qa/thundurus-elgyem-approved-browser-29c1aec-20261003.json`. Semana carrega o novo PNG de Thundurus. Elgyem FLY usa o aprovado com 20 essenciais/28 hotspots e seleção correta: local 8/10 18–19h, Brasília Kiritimati 8/10 01–02h, Ibirapuera 8/10 18–19h, Pago Pago 9/10 02–03h, com coordenadas. Elgyem fora da Home seis próximos/Semana 28/09–04/10; não atribuir prova nessas superfícies. Thundurus segue fora do seletor global conforme elegibilidade atual.

Master agora 14 entradas APPROVED/full_poster, 12 anteriores preservadas; preview ativo vazio. 124 IDs/janelas e catálogo inalterados nesta consolidação. Fonte de ambos permanece comunidade; janela 3–4/10 de Thundurus mantém inferência documentada, sem bônus novos. Inventário 01–07/10 recalculado pelo compositor `SpideyPlayer.art`: 23 eventos, 9 APPROVED, 0 candidatas, 14 sem arquivo Home/FLY. Elgyem aprovado fora da janela.

Próximo: cobertura restante e QA físico Android/PWA/instalação/atualização/offline/recebimento push. Configuração push ainda bloqueada, último GET observado no código a17f6d4 retornou 503 `push_not_configured`; variáveis do servidor não inspecionadas. Nenhum segredo, assinatura ou disparo alterado nesta rodada. Applin/Espaço/Sizzlipede mantêm recusas registradas, sem contorno. GPX Japão 17 pontos e Zorua aprovados/verificados permanecem válidos. Sem promoção a main/produção ou mensagem externa; lançamento completo continua pendente. Não reabrir a aprovação destas duas peças. Checkpoint documental posterior preserva integralmente o código `29c1aec`; continuar dele/NEXUS, sem reiniciar. Nenhuma pausa ativa.

## Handoff — 03/10/2026 — Passe GO em revisão e acesso de testadores

Código de interface: `97c6823f1efb180782550ef22bf660416a1aebdc`, branch `spidey-fly-v1`. Preview conferido: https://spidey-pokemon-9oklrwpv9-spidey3.vercel.app/spidey-app/index.html.

Passe GO/Kyogre v1 está **PENDING_REVIEW**; aprovação humana segue nula. Fonte primária PT-BR rechecada: https://pokemongo.com/pt-BR/news/go-pass-october-2026. Texto distingue o Globo da Sorte pago (Deluxe) e 2× duração do Incenso de Aventura Diário ao atingir o Ranque 50. Datas 06/10 10h–03/11 10h locais preservadas. Não foi criada uma janela FLY para este passe de progressão. Os outros 123 eventos e todos os horários do catálogo permanecem iguais ao código anterior.

33 testes passaram antes da publicação do código. Novo preview READY conferido visualmente em 390 × 850 Claro e 1280 × 850 Escuro: arquivo íntegro, `contain`, sem overflow horizontal no diálogo; SHA256 servido igual ao candidato. Evidências: `docs/qa/GO_PASS_REVIEW_20261003.json`, `docs/qa/go-pass-browser-97c6823-20261003.json` e respectivos JPEGs em `docs/qa/proofs/`. Aprovações anteriores não foram alteradas.

A URL normal solicita conta Vercel. Um link temporário nativo com `_vercel_share` abriu a interface e o PNG em cliente sem autenticação e com cookies inicialmente vazios (HTTP 200). Compartilhar o link completo emitido, sem copiar o endereço pós-redirecionamento da barra. Expiração nativa informada: 10/4/2026, 10:30:31 AM; prazo do recurso: 23h. Token efêmero omitido do repositório. Proteções do projeto não foram alteradas; não há URL pública permanente nova.

Inventário recalculado pelo compositor real: 23 eventos na janela 01–07/10, 9 APPROVED, 1 PENDING_REVIEW e 13 sem arquivo. São **14 ainda sem conclusão/aprovação**, sendo a candidata do Passe GO já gerada. Master: 14 entradas, intacto. As recusas Applin/Espaço/Sizzlipede continuam registradas, sem novas tentativas de contorno.

Núcleo apto a teste: eventos, FLY/horários/fusos/coordenadas, Selos e GPX confirmado. Ainda pendentes: configuração/recebimento real de alertas, Android físico/instalação PWA/atualização/offline, demais artes e validação final. Amigos/Chat permanece depois do núcleo. Sem promoção para main/produção, configuração push ou dispatch. Próximo passo editorial: decisão do editor sobre o PNG exato do Passe GO; preservar todos os masters.

## Correção de continuidade — 03/10/2026 — compartilhamento bloqueado no celular

Às 08:47:23 BRT, o editor informou que o link completo continuava exigindo acesso e enviou foto de tela de login do Vercel. O teste HTTP anônimo anteriormente registrado permanece uma evidência restrita àquele cliente; não comprovou acesso real dos testadores no celular. **Compartilhamento externo: BLOCKED_USER_PHONE_LOGIN**, sem solução confirmada. Não reapresentar o link efêmero anterior como acesso público garantido.

Consulta conectada confirmou `ssoProtection.enabled=true`, `deploymentType=all_except_custom_domains` e senha desabilitada. O conector disponível não modifica a permissão de Share. Abertura do painel redirecionou para login; o formulário seguro retornou `declined`. Nenhuma proteção, segredo, deploy de produção ou permissão foi modificada. Acesso administrativo necessário para ajustar Share da prévia segue não concluído. Não reiniciar a autenticação sem nova solicitação do editor.

Às 08:48:33 BRT, o editor informou que o Passe GO/Kyogre não chegou para avaliação. Foi disponibilizado no chat o PNG integral já existente e um link para o original, conferido byte a byte pelo SHA256 `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`. O print anterior da interface não constitui recebimento confirmado nem aprovação. **Passe GO v1 continua PENDING_REVIEW; approval=null.** Aguardar decisão específica; não gerar outra versão nem promover esta por inferência.

Arte e QA responsivo continuam no código `97c6823`, 33 testes passados; masters 14 APPROVED, janela 01–07/10 com 9 APPROVED, 1 candidata e 13 sem arquivo. Estes fatos não equivalem à liberação para testadores, nem a Android físico ou lançamento aprovado.

## Passe GO/Kyogre v1 APPROVED — 03/10/2026, 09:04:55 BRT

Decisão explícita “Fantástico / Eu aprovo” após entrega do PNG integral no chat e link para o original. Registro canônico: `docs/qa/GO_PASS_APPROVAL_20261003.json`. A aprovação encerra a pendência de entrega/revisão para este PNG exato; o registro pré-aprovação JSON permanece histórico e íntegro.

Evento `2026-10-go-pass`: cópia final `assets/events/premium/go-pass-october-kyogre-approved-v1.png`, 1122 × 1402, 2.848.940 bytes, SHA256 `c194eee09b62380da61a5dfa8a2f804685fff6b0f2882b32435fc4225cc51a67`, byte a byte igual à candidata v1. APPROVED/full_poster no master; entrada removida do preview. As 14 entradas anteriores permanecem idênticas, total 15. Nenhum arquivo anterior removido ou alterado; 192 blobs de assets/revisões/aprovações protegidos preservados na comparação completa de árvores.

Código: `ff37843208635a0923adc1996371aaacd2a430f6`, branch `spidey-fly-v1`; Vercel READY `dpl_3AtDzJtXDBQvJcgpwTtvQuw4pnHw`. Preview conferido internamente: https://spidey-pokemon-i6523e1iy-spidey3.vercel.app/spidey-app/index.html. Shell/master/preview/cache versionados; precache usa o caminho aprovado. Catálogo inteiro permaneceu byte a byte igual, 124 eventos; nenhum horário, bônus ou elegibilidade FLY foi alterado por esta aprovação.

33 testes passaram, sintaxe dos três scripts alterados passou e os 75 paths do cache existem. QA novo: diálogo do Passe GO pela Home em 390 × 850 Claro e 1280 × 850 Escuro, PNG inteiro em `contain`, foco Fechar, scrollTop 0 e sem overflow horizontal. Download real pelo navegador do arquivo servido no caminho premium: SHA256/bytes exatos da aprovação. Relatório `docs/qa/go-pass-approved-browser-ff37843-20261003.json` e dois JPEGs em `docs/qa/proofs/`. A captura visual pode coincidir com a candidata porque os pixels aprovados não mudaram; DOM/caminho e arquivo servido vinculam esta prova ao novo código. Teste responsivo não substitui Android físico.

Inventário pelo compositor real: 23 eventos entre 01 e 07/10, **10 APPROVED**, **0 candidatas** e **13 sem arquivo Home/FLY**. Registro `docs/qa/go-pass-approved-inventory-ff37843-20261003.json`. Elgyem e outros masters fora da janela não entram neste número.

Compartilhamento público continua **BLOCKED_USER_PHONE_LOGIN**, conforme prova do editor às 08:47 BRT. O acesso temporário usado apenas para QA do novo deployment não resolve nem comprova acesso dos testadores no celular; token efêmero não foi persistido. Proteção Vercel permaneceu ativa, e o login administrativo anterior não foi concluído; não repetir autenticação sem nova solicitação. Push/configuração/recebimento real, Android/PWA/atualização/offline e 13 artes restantes seguem pendentes. Applin/Espaço/Sizzlipede permanecem com recusas registradas. Sem promoção para main/produção, dispatch, mensagens externas ou alteração de segredo/configuração. Não regenerar nem reabrir a aprovação do Passe GO.


## Latios / Passe GO de setembro v1 em revisão — 03/10/2026

PNG novo integral para `2026-09-go-pass`: `spidey-app/assets/events/review/go-pass-september-latios-v1.png`, 1122 × 1402, 2.757.480 bytes, SHA256 `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`. **PENDING_REVIEW**, sem decisão humana; não regenerar apenas para reenvio. Prompt exato, referências, dados anteriores e verificação factual: `docs/qa/LATIOS_REVIEW_20261003.json`. Logo oficial + Kyogre aprovado usados somente como referências de marca/estilo, sem editar seus bytes.

Fonte primária PT-BR: https://pokemongo.com/pt-BR/news/go-pass-september-2026. Passe gratuito 08/09 10h → 06/10 10h locais; Latios depende da progressão. Pontos GO ilimitados apenas em 3 e 4/10; 2× duração do Incenso de Aventura Diário ao atingir Ranque 50. Detalhe diferencia Deluxe pago/Ranque 20 para Incubadora Temporária, resgate até 08/10 10h e expiração da incubadora em 13/10 10h. Brilhante com sorte, sem boost inferido. Apenas este eventId mudou editorialmente; período/calendário/localizações/GPX intactos, outros 123 eventos idênticos.

Código `760b1179e8fd1b76076cd947fc91388c12b52442`, Vercel READY `dpl_7EMe954ujCBBSvtvnnAi87mbob46`. Preview conferido internamente: https://spidey-pokemon-m4vhhogwm-spidey3.vercel.app/spidey-app/index.html. 33 testes passaram; sintaxe de preview/SW e 76 paths do cache conferidos. Todos os 15 masters, 14 arquivos aprovados, helper de revisão e 218 blobs anteriores de assets/testes/revisões/aprovações preservados. Resolver resolve a candidata inteira em thumb/card/weekly/hero/poster, com `preview_candidate:poster`, sem aprovação/Premium automático. Não foi criada elegibilidade FLY para passe mensal.

QA do novo código: Home → detalhe, mobile 390 × 850 Claro e desktop 1280 × 850 Escuro; pôster completo em contain, foco Fechar, scrollTop 0, sem overflow horizontal. Download real do PNG servido pelo navegador corresponde exatamente ao hash/bytes da candidata. Provas/DOM: `docs/qa/latios-browser-760b117-20261003.json`, JPEGs em `docs/qa/proofs/`. Responsividade não comprova Android físico.

Inventário de 01–07/10: 23 eventos, **10 APPROVED**, **1 PENDING_REVIEW (Latios)** e **12 sem arquivo Home/FLY**; `docs/qa/latios-inventory-760b117-20261003.json`. Passe GO de outubro/Kyogre permanece APPROVED com a decisão e os pixels intactos. Compartilhamento externo continua **BLOCKED_USER_PHONE_LOGIN**: acesso temporário de QA não comprova acesso dos testadores; token não persistido. Sem autenticação administrativa nova, mudança de proteção/configuração/secrets/push, main/produção, dispatch ou mensagens externas. Applin/Espaço/Sizzlipede continuam com recusas registradas. Próximo: decisão humana sobre esta peça, cobertura restante e desbloqueios/QA Android/PWA/push.


## APROVAÇÃO LATIOS / PASSE GO SETEMBRO — 03/10/2026, 13:01 BRT

Editor: **“Eu aprovo, com certeza”**, `2026-10-03T13:01:11-03:00`, sobre a candidata Latios v1 exibida integralmente no chat com link individual e prova desktop. Manifesto `docs/qa/LATIOS_APPROVAL_20261003.json`, revisão histórica congelada `docs/qa/LATIOS_REVIEW_20261003.json` com SHA256 `f91c20b70862fd69cd3470f20cdb48040a95a051f91681ce31b6018d4ff5b807`. Não inferir aprovação de outra arte nem autorização de lançamento.

Cópia premium `spidey-app/assets/events/premium/go-pass-september-latios-approved-v1.png`, 1122 × 1402, 2.757.480 bytes, SHA256 `d7363225369300a593e4154019bf2b12a1aae056d1157e8a902fe7e9eacc4f50`, byte a byte igual à candidata. EventId `2026-09-go-pass` APPROVED/full_poster no master; apenas sua entrada sai do preview (agora vazio). Master soma 16 entradas, 15 anteriores idênticas, 212 blobs anteriores de assets/revisões/aprovações preservados na comparação completa de árvores, sem remoções. Catálogo inteiro continua inalterado: 124 eventos, SHA256 `184d3b2843c3a566d9f791adbb7ccc1fce6adefecdbfb2f5766af18c4678cd15`. Datas/bônus/fonte oficial e elegibilidade FLY não mudaram; passe mensal não recebe janela diária mundial.

Código `d14897bc27c1ac021f9871b487600c4305bf8703`, Vercel READY `dpl_HXxaPscxWGFaMVrLwYKBagetLYhR`. Preview conferido internamente: https://spidey-pokemon-nviok0edm-spidey3.vercel.app/spidey-app/index.html. Master/preview/shell/cache versionados; precache mantém 76 paths e usa o aprovado, sem duplicar a candidata. Resolver comum entrega os mesmos pixels em todos os cinco papéis, agora com autoridade Premium do master; helper de revisão inalterado. 33 testes passaram, sintaxe dos três scripts/cache/whitespace passaram.

QA pós-aprovação: Home → detalhe, 390 × 850 Claro e 1280 × 850 Escuro; PNG inteiro em contain, foco Fechar, scrollTop 0 e sem overflow horizontal. Download real pelo navegador no caminho premium possui hash/bytes exatos da aprovação. Relatório `docs/qa/latios-approved-browser-d14897b-20261003.json` e JPEGs em `docs/qa/proofs/`. Pixels dos prints podem coincidir com as provas da candidata, pois a imagem/layout foram preservados; captura real nova, código/caminho/DOM e download servido vinculam as provas ao novo deployment. Android físico ainda pendente.

Inventário pelo compositor real: 23 eventos de 01–07/10, **11 APPROVED**, **0 candidatas** e **12 sem arquivo Home/FLY**; `docs/qa/latios-approved-inventory-d14897b-20261003.json`. Este número não cobre todos os 124 eventos. Compartilhamento público segue **BLOCKED_USER_PHONE_LOGIN**, com autenticação administrativa anterior não concluída. Acesso temporário interno de QA não comprova abertura pelos testadores; token efêmero não persistido. Não repetir login sem nova solicitação. Sem promoção a main/produção, mudança de proteção/secrets/push, dispatch ou mensagens externas. Recusas Applin/Espaço/Sizzlipede preservadas. Próximo: artes restantes, acesso público e validação Android/PWA/atualização/offline/alertas.
