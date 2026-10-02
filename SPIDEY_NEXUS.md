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

Somente Mega Victreebel sai do preview e entra no master; sete entradas anteriores, arquivos e históricos preservados. Shell/cache versionados. Inventário 01–07/10: 23 eventos, 5 APPROVED, 18 sem arquivo no compositor Home/FLY; Zorua pendente fora da janela. QA dos novos caminhos em andamento, relatório `docs/qa/MEGA_VICTREEBEL_APPROVAL_20261001.md`. Próximo: cobertura restante e Android/PWA/push; Applin/Espaço seguem sem arquivo por recusas documentadas. Nenhuma promoção a main/produção.
