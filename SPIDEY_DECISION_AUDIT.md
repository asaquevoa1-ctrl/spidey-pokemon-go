# SPIDEY — AUDITORIA DE DECISÕES RECUPERADAS

Status: EM VARREDURA
Data: 2026-09-30
Objetivo: recuperar decisões de produto/UX/técnicas tomadas em conversas anteriores e garantir que nenhuma funcionalidade aprovada ou regra permanente dependa apenas de memória de chat.

## Regra de consolidação
Um item recuperado deve ser classificado como APROVADO / FUNCIONA / PARCIAL / PENDENTE / REPROVADO / DESCARTADO. Não promover lembrança incerta a requisito definitivo sem evidência suficiente.

## Decisões recuperadas — produto/app

### Prioridade do produto — APROVADO
- APP é prioridade máxima e produto final.
- Canal deixou de ser prioridade principal.
- Diferencial: eventos Pokémon GO organizados, rápidos, confiáveis, visualmente fortes e úteis à comunidade.

### Idioma — APROVADO
- Usar o máximo possível de português do Brasil em toda a experiência.

### Navegação já implementada — FUNCIONA/PRESERVAR
- Início
- Semana
- Selos
- Mapa
- Estruturas já existentes: Agora, Hoje, Próximos 7 dias, Calendário e Próximos eventos.
- Não reconstruir sem auditar a implementação existente.

### Tema — APROVADO/PRESERVAR
- Claro
- Escuro
- Sistema
- Validar os três em preview mobile antes de promoção.

### PWA — IMPLEMENTADO/PRESERVAR
- App/PWA e cache já foram trabalhados.
- Alterações futuras não devem regredir instalação/atualização/cache.

## FLY / Eventos pelo Mundo — APROVADO
Detalhes canônicos estão em `SPIDEY_APP_CONSTITUTION.md`.
Resumo obrigatório:
- público prioritário inclui flys;
- horário local + Brasília;
- NÃO exibir conversão de Portugal;
- coordenadas copiáveis;
- mapa/localização;
- GPX somente quando validado;
- sequência mundial dinâmica por data/timezone;
- AGORA / PRÓXIMO / ENCERRADO / ÚLTIMA CHANCE;
- hotspots essenciais + lista completa;
- Taipei/Taiwan como referência asiática estratégica no lugar de Singapura;
- preservar e aproveitar a implementação existente de coordenadas (~20 locais nos cards), tornando-a mais visível.

## Stamp Rally / Selos — APROVADO/PARCIAL
- Stamp Rallies devem existir no App.
- Coordenadas copiáveis.
- Mapa integrado.
- Download GPX quando validado.
- Progresso em tempo real foi previsto na experiência visual.
- Regra de confiança: informação oficial confirma o evento; SPS/STAMPS pode fornecer coordenadas/GPX; Spidey valida quantidade, região e duplicações.
- `exact_pokestop` só pode ser publicado após checagem/cruzamento.

## Horários de eventos — APROVADO
- Eventos devem preservar início e término quando a fonte informar.
- Exibir horário local e equivalente em Brasília quando aplicável.
- Quando a conversão mudar a data no Brasil, deixar a data brasileira explícita.
- Se a fonte não informar um dado necessário, mostrar `não informado`; nunca inventar.

## Artes — APROVADO/EM SANEAMENTO
Fonte canônica: `SPIDEY_APPROVED_ARTS.md`.
- Artes aprovadas devem entrar exatamente no App e orientar o padrão futuro.
- Não regenerar/substituir silenciosamente arte aprovada.
- Logo oficial: aranha + pin/localização, azul neon e dourado, identidade premium/tecnológica.
- Málaga/Toyohashi: versões com logo/roupas inventados foram reprovadas.
- Yveltal, Dialga e Sableye vistos na preview em 30/09 estavam fora do padrão.
- Xerneas possui referência aprovada consolidada.
- Harvest/Pumpkaboo teve aprovação revogada por erro factual; Applin deve ser protagonista na nova arte do evento correspondente.

## Amigos / Trainer Code / Chat — DECISÃO RECUPERADA, PENDENTE DE CONSOLIDAÇÃO DETALHADA
Funcionalidade discutida anteriormente e ausente dos documentos canônicos até esta auditoria.
Direção recuperada:
- área/aba `Amigos`;
- perfil do jogador;
- campo para Trainer Code / código de treinador;
- descoberta/conexão entre jogadores por finalidade;
- conversa/chat privado dentro do ecossistema Spidey após conexão.
Status: PENDENTE. Antes de implementação, recuperar especificação mais detalhada do histórico e validar arquitetura/privacidade/moderação. Não inventar detalhes não recuperados.

## Fontes e automação — PARCIAL/PRESERVAR
Fluxo histórico:
Pokémon GO Oficial / G47IX / PokeMiners / SPS -> coleta -> pending -> curadoria -> arte -> aprovação humana -> publicação/revisão.
- Monitor Oficial deve ser preservado.
- G47IX possui monitor separado/antirrepetição planejado.
- SPS depende de bridge/fonte intermediária e não deve ser declarado operacional sem prova real.
- aprovação humana é soberana.
- não declarar funcionalidade pronta sem E2E real.

## Custo — APROVADO
- Priorizar custo zero sempre que possível.
- API paga da OpenAI não deve ser dependência obrigatória de produção.

## Pendências encontradas pela varredura
1. Recuperar especificação completa de Amigos/Trainer Code/Chat.
2. Auditar notificações, favoritos/lembretes e outras funções mencionadas em chats antigos; não classificá-las como aprovadas sem evidência.
3. Auditar navegação e telas atuais contra decisões antigas antes de redesenhar.
4. Consolidar binários exatos das artes aprovadas.
5. Auditar implementação real de Stamp Rally/Selos, Mapa e GPX.
6. Atualizar o índice NEXUS para apontar para esta auditoria.

## Regra de continuidade
Esta auditoria é incremental. Cada nova decisão antiga recuperada deve ser adicionada aqui e, quando consolidada, migrada para o documento canônico apropriado. `SPIDEYNEXUS` deve sempre levar a este registro enquanto houver itens em varredura.