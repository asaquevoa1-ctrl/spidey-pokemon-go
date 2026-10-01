# SPIDEYNEXUS — ÍNDICE MESTRE DE CONTINUIDADE

Status: OBRIGATÓRIO
Data: 2026-10-01

## Função
Este índice existe para impedir perda de decisões entre chats, branches e versões.

A palavra-chave `SPIDEYNEXUS` significa: retomar o projeto pelo estado persistido no repositório, nunca reconstruir o projeto apenas de memória ou de conversa.

## Leitura obrigatória na retomada
Ao receber `SPIDEYNEXUS`, consultar nesta ordem:
1. `SPIDEY_NEXUS.md` — histórico/handoff técnico.
2. `SPIDEY_NEXUS_INDEX.md` — este índice e regra de continuidade.
3. `SPIDEY_APP_CONSTITUTION.md` — produto, UX, FLY, não regressão e decisões congeladas.
4. `SPIDEY_APPROVED_ARTS.md` — registro editorial canônico de artes aprovadas/revogadas/pendentes.
5. `SPIDEY_PREMIUM_STANDARD.md` — padrão visual Premium.
6. `SPIDEY_ART_SYSTEM.md` — resolução e uso de assets por contexto.
7. `SPIDEY_PUBLIC_RELEASE.md` — candidato público, prioridades, QA e bloqueios atuais.
8. `SPIDEY_PRODUCT_EXPERIENCE.md` e `SPIDEY_STAMPS_V2.md` — experiência e regras de Selos/Amigos.
9. Código e dados atuais da branch/main aplicável — verdade técnica da implementação.

## Regra de consolidação
Uma decisão relevante NÃO está consolidada apenas porque foi discutida em chat.

Para ser considerada permanente, deve ser persistida em documento canônico ou código/dado versionado e alcançável por este índice.

Registrar obrigatoriamente:
- objetivo e prioridade do produto;
- público-alvo e proposta de valor;
- UX aprovada;
- funcionalidades aprovadas/funcionais;
- regras editoriais;
- artes aprovadas e reprovadas;
- identidade visual;
- fontes e níveis de confiança;
- horários/fusos/coordenadas/GPX;
- FLY/Eventos pelo Mundo;
- arquitetura e autoridades de dados;
- automações;
- claro/escuro/sistema;
- decisões descartadas, para não serem reintroduzidas;
- estado real: APPROVED/FUNCIONA/PARCIAL/PENDENTE/REPROVADO/DESCARTADO;
- regressões conhecidas e bloqueios.

## Regra de não regressão documental
Antes de uma mudança importante:
1. verificar os documentos canônicos afetados;
2. preservar decisões aprovadas;
3. implementar/testar;
4. atualizar o documento canônico se houver nova decisão;
5. somente então considerar a mudança consolidada.

## Estado atual que não pode ser perdido
- APP é prioridade máxima; canal não é o produto principal.
- Público prioritário inclui jogadores FLY.
- FLY deve oferecer horário local + Brasília, sem coluna de Portugal, coordenadas copiáveis, rota mundial e GPX somente quando validado.
- Conversões de horário são dinâmicas pela data/timezone; horários históricos de 2023 não são fonte atual.
- Taipei/Taiwan é referência estratégica asiática no lugar de Singapura para a rota rápida.
- Artes Premium possuem autoridade única por eventId.
- Arte APPROVED não pode ser substituída por fallback/heurística/script concorrente.
- Xerneas possui referência aprovada conhecida; Yveltal/Dialga/Sableye vistos na preview não devem ser presumidos aprovados.
- Harvest Festival com Pumpkaboo protagonista teve aprovação revogada por erro factual; Applin deve ser tratado conforme dados oficiais e nova arte precisa de aprovação.
- Claro/escuro/sistema são requisitos permanentes.
- Preview + QA mobile + aprovação precedem main.
- Nenhuma versão nova pode regredir algo já aprovado.

## Regra das artes
O arquivo `SPIDEY_APPROVED_ARTS.md` é a autoridade editorial de aprovação visual. Se o binário exato ainda não estiver consolidado, usar `APPROVED_PENDING_ASSET`; nunca gerar substituto e chamá-lo de aprovado.

## Manutenção
Toda nova decisão estrutural deve atualizar o documento especializado correspondente. Se surgir um novo documento canônico, adicioná-lo à seção 'Leitura obrigatória na retomada' deste índice.
Último handoff: APROVAÇÃO XERNEAS — 01/10/2026 09:08 BRT no `SPIDEY_NEXUS.md`, branch `spidey-fly-v1`, continuidade de `f32ae6e`/`24add19`. Rotação Xerneas agora APPROVED por decisão explícita do editor; PNG íntegro consolidado no master, Hora de Reides separada e preservada. Vínculo auditável: `docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json`. Provas de renderização e confirmação pós-aprovação: `docs/qa/XERNEAS_ROTATION_20261001.md`. Próximo: cobertura das demais artes e QA Android/PWA/push da versão corrente; aprovação desta arte não aprova o lançamento completo.

QA pós-aprovação confirmado no código `641463d`, mobile/desktop, incluindo Semana e ação FLY da Hora de Reides. Inventário atual e prioridades para 02/10: `docs/qa/PUBLIC_ART_READINESS_20261001.md`; próximo Applin/A Invasão e Cinderace. Não voltar ao estado PENDING_REVIEW de Xerneas nem usar o AVIF histórico como asset ativo.

Continuação anterior (histórico): código `684d80e`, 01/10, Invasão/Cinderace corrigidos, PENDING_REVIEW, preview mobile/desktop e FLY de Cinderace conferidos. Relatório `docs/qa/PRIORITY_ART_20261001.md`, arquivos/hashes/prompts em `docs/qa/PRIORITY_ART_REVIEW_20261001.json`. Applin permanece sem arte nova por recusa da ferramenta; dados oficiais atualizados. Inventário corrente: 1 aprovado, 2 pôsteres em revisão, 1 recorte, 19 sem arquivo. Próximo: decisão editorial dessas duas peças, arte de Applin/cobertura restante e Android/PWA/push. Xerneas continua APPROVED. Sem promoção de produção.

Última decisão: APROVAÇÃO INVASÃO + CINDERACE — 01/10/2026 15:45 BRT. “Sim, aprovo” vinculado aos dois PNGs exatos mostrados no checkpoint `df9d050`, QA `684d80e`. Agora APPROVED no master, cópias premium byte a byte, candidatas/originais preservados; não reabrir revisão destas peças nem de Xerneas. Registro `docs/qa/PRIORITY_ART_APPROVAL_20261001.json`; QA pós-aprovação `docs/qa/PRIORITY_ART_APPROVAL_20261001.md`. Inventário corrente 23 eventos: 3 aprovados, 1 recorte pendente, 19 sem arquivo Home/FLY. Próximo: confirmar novos caminhos em preview, continuar Applin/cobertura restante e Android/PWA/push. A aprovação não aprova produção.
