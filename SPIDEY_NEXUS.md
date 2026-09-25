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
