# SPIDEYNEXUS — ÍNDICE MESTRE DE CONTINUIDADE

Status: OBRIGATÓRIO
Data: 2026-09-30

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