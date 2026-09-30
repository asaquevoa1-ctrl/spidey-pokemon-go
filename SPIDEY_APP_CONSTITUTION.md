# SPIDEY APP — CONSTITUIÇÃO DO PRODUTO

Status: BASE ESTRATÉGICA CONGELADA
Data: 2026-09-30
Prioridade máxima: APP

## 1. Objetivo
O Spidey é um aplicativo para a comunidade Pokémon GO com foco em transformar eventos, horários, localizações e informações confiáveis em uma experiência operacional rápida no celular. O canal não é o produto principal.

## 2. Diferencial
O Spidey não deve ser apenas um calendário ou agregador de notícias. Deve responder rapidamente:
- O que está acontecendo agora?
- O que começa depois?
- Em qual lugar do mundo?
- Qual é o horário local e o equivalente em Brasília?
- Quais são as coordenadas?
- O que está oficialmente confirmado?
- O que o jogador precisa fazer/aproveitar?

## 3. Fonte e confiança
- Fonte primária/oficial tem precedência.
- Informação secundária, datamine ou não confirmada deve ser identificada explicitamente.
- Nunca transformar hipótese em fato oficial.
- Nunca inventar horário, Pokémon, bônus, traje, forma, coordenada ou local.
- Informação oficial nova pode atualizar dados, mas não pode silenciosamente destruir elementos já aprovados que continuam válidos.

## 4. Eventos
- Cada evento possui eventId estável e único.
- Eventos simultâneos continuam eventos distintos.
- Eventos relacionados podem ser vinculados sem serem fundidos.
- Eventos globais e locais devem ser diferenciados.
- Estado temporal: acontecendo agora, próximo, futuro ou encerrado.

## 5. Horários mundiais e coordenadas
Para eventos locais/mundiais, preservar quando disponível:
- cidade e país;
- horário original/local;
- timezone IANA;
- conversão para America/Sao_Paulo (Brasília);
- indicação de mudança de dia quando ocorrer;
- latitude/longitude verificadas;
- ação de copiar/abrir localização;
- GPX quando aplicável e validado.
Taipei/Taiwan é a referência asiática definida no lugar de Singapura quando aplicável ao sistema previamente planejado.

## 6. Artes Premium — regra de autoridade única
- Existe uma única autoridade visual: catálogo master de artes aprovadas por eventId.
- Arte APPROVED é imutável por módulos secundários.
- Nenhum fallback, heurística, thumbnail, IA, script de confiança ou correção posterior pode substituir uma arte APPROVED.
- A mesma arte aprovada deve ser reutilizada em Hoje, Semana, Calendário e Detalhes, respeitando apenas crop/layout apropriado.
- Variações horizontal/vertical são assets distintos quando aprovadas separadamente.
- Uma arte só recebe APPROVED após validação factual e aprovação visual humana.
- Uma arte factualmente incorreta perde o estado APPROVED, mesmo que visualmente boa.

## 7. Identidade visual
- Preservar identidade Spidey consistente: marca, tipografia visual, hierarquia, linguagem e padrão Premium.
- Modos claro, escuro e sistema são requisitos permanentes.
- Mobile é a referência principal de QA.

## 8. Home
A Home deve priorizar utilidade imediata:
1. acontecendo agora;
2. próximos eventos;
3. destaques relevantes;
4. acesso ao calendário;
5. eventos pelo mundo;
6. raids e demais módulos relevantes.
Evitar poluição visual, duplicação de informação e cards sem função clara.

## 9. Eventos pelo Mundo
Cada card deve poder exibir, quando confirmado:
- evento;
- cidade/país;
- horário local;
- horário de Brasília;
- coordenadas;
- fonte/status de confiança;
- acesso à localização.

## 10. Automação
Fluxo alvo:
fontes -> coleta -> normalização -> validação -> dados do App.
Automação não possui autoridade para aprovar arte nem promover informação duvidosa a oficial.

## 11. Arquitetura
Deve existir um único dono para cada domínio:
- dados/eventos;
- horários/localização;
- artes;
- confiança/editorial.
Módulos não podem competir pela mesma decisão.
Scripts legados concorrentes devem ser progressivamente removidos após equivalência comprovada.

## 12. Preview, QA e produção
Fluxo obrigatório:
branch de trabalho -> preview Vercel -> QA mobile -> validação factual -> validação visual -> aprovação -> produção/main.
Build READY não significa produto aprovado.
Main não deve receber mudanças antes da aprovação da preview.

## 13. REGRA MÁXIMA DE NÃO REGRESSÃO
Nenhuma versão nova pode regredir algo já aprovado.
Exemplos:
- atualizar coordenadas não pode remover Xerneas Premium;
- alterar calendário não pode quebrar modo escuro;
- adicionar confiança editorial não pode esconder artes aprovadas;
- atualizar um evento não pode reintroduzir fallback antigo.
Antes de promover uma versão, verificar explicitamente as funcionalidades e assets aprovados anteriormente.

## 14. Estados de controle
Toda frente relevante deve ser classificada como:
- APROVADO
- IMPLEMENTADO
- PARCIAL
- PENDENTE
- DESCARTADO
A existência de código não equivale a APROVADO.

## 15. Harvest Festival — correção factual conhecida
O material visual anteriormente tratado como Harvest Festival, com Pumpkaboo em protagonismo, não deve ser considerado aprovado para representar o evento se os dados oficiais exigirem Applin como protagonista/destaque. Conteúdo factual tem precedência sobre estética.

## 16. Próxima etapa técnica
1. Inventariar os assets visuais aprovados reais.
2. Validar cada um contra os dados oficiais correspondentes.
3. Consolidar arquivos no repositório.
4. Vincular cada asset exclusivamente por eventId no catálogo master.
5. Remover autoridade visual dos scripts concorrentes.
6. Executar teste de não regressão.
7. Só então gerar nova preview para aprovação.