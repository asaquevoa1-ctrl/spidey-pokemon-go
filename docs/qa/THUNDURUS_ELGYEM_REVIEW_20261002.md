# Thundurus Sombroso e Elgyem — candidatas para revisão

Status: **PENDING_REVIEW**, sem aprovação humana nem promoção para produção. O master com as 12 artes aprovadas, incluindo Zorua, foi preservado.

| Evento | Arquivo ativo | Dados impressos | Fonte |
|---|---|---|---|
| Thundurus Sombroso (Forma Encarnada) | `spidey-app/assets/events/review/thundurus-shadow-weekend-v1.png` | Reides Sombrosas de 5 estrelas, 3 e 4/10/2026 | Pokémon GO Hub, comunidade |
| Hora do Holofote: Elgyem | `spidey-app/assets/events/review/elgyem-spotlight-v2.png` | 8/10/2026, 18–19h locais; 2× Doces por captura | Pokémon GO Hub, comunidade |

O calendário comunitário lista Thundurus nos fins de semana até 6/10; a janela 3–4/10 deriva dessa programação. Não foram adicionados bônus, horário diário fixo ou promessa de taxa de Brilhante. Elgyem permanece na data publicada de quinta-feira, 8/10. Sua v1, sem o nome no título, foi preservada como histórico e ficou fora do mapa e do precache; v2 corrige somente o título.

Fontes verificadas: https://pokemongohub.net/post/event/october-2026-events/ e https://pokemongohub.net/post/guide/shadow-thundurus-incarnate-raid-counters-guide/ . São fontes de comunidade, sem classificação oficial inferida.

Todos os 124 IDs e horários do catálogo foram preservados. Apenas os títulos dos dois eventos foram traduzidos para português e o bônus já existente no resumo de Elgyem foi incluído no campo estruturado. Os dois pôsteres resolvem nas cinco funções visuais e na Semana. Thundurus é um evento de fim de semana sem janela horária global na FLY; Elgyem é elegível para rota mundial.

QA local: 31/31 testes passaram, sintaxe verificada e integridade dos 12 masters confirmada. Conferência visual da nova prévia ainda pendente no checkpoint inicial. Detalhes, prompts completos, hashes e referências em `THUNDURUS_ELGYEM_REVIEW_20261002.json`; QA em `THUNDURUS_ELGYEM_QA_20261002.json`.

Push: painel de variáveis redirecionou para login, sem acesso às configurações. O connector disponível não oferece escrita de variáveis e não há CLI/credencial no runtime. Nenhum segredo, configuração ou envio push foi criado. Android físico continua pendente.
