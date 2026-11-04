# Auditoria editorial oficial — 2026-11-04

## Escopo

- Base consultada: `origin/main` em `e65e71dea2269e6fb693b9281497f013f84b8e15`.
- PRs abertos revisados antes da edição; nenhum continha a mesma atualização editorial.
- Itens do coletor com `editorial_detail_pending` revisados pela publicação completa.
- Nenhuma arte, coordenada, catálogo, Pokédex, PvP, GPX ou configuração de Push/Amigos foi alterada.
- A prioridade temporária Trust 27 já estava expirada e não foi reaberta.

## Fontes oficiais conferidas

| História | URL canônica | Decisão editorial |
| --- | --- | --- |
| Chamados do Crepúsculo | https://pokemongo.com/news/twilight-wishes-2026 | Previsão existente confirmada no mesmo ID; datas, bônus, Pokémon e duas janelas de Pesquisa de Campo adicionados. A manchete automática duplicada foi arquivada e vinculada ao registro confirmado. |
| Caças aos Selos para sempre | https://pokemongo.com/news/forever-stamp-rally-go-wild-area-2026 | História automática completada. As duas caças contínuas foram mantidas separadas das Caças aos Selos de sete pontos do evento. Locais e recompensas são oficiais; coordenadas continuam marcadas apenas como referências comunitárias, sem GPX/PokéParada exata. |
| Prepare-se para a Área Selvagem | https://pokemongo.com/news/get-ready-for-gowildarea-2026 | História automática completada com caminhos de pesquisa, bônus, fundos de perfil, grupos Dynamax privados e transferência da Bola Safári GO. O teaser comunitário anterior foi arquivado e vinculado ao anúncio. |
| Dispositivo Explorador | https://pokemongo.com/news/pgo-explorer-gadget-2026-update | Guia existente completado; manchete automática duplicada arquivada e vinculada. A disponibilidade continua descrita sem prometer comportamento idêntico para todas as contas. |
| Área Selvagem — Cidade do México | https://pokemongo.com/gowildarea/mexico-city/gameplay | Página completa relida. Não havia tarefas/recompensas individuais publicadas; essa ausência foi registrada sem inventar etapas. |
| Atividades adicionais na Cidade do México | https://pokemongo.com/news/gowa_cdmx_additional_info | Guia recebeu horários e atividades oficiais pela cidade, sem coordenadas novas nem alterações de ingresso/arte. |
| LAIC 2027 em São Paulo | https://pokemongo.com/news/pokemon-go-at-laic2027 | Anúncio encontrado pelo coletor foi lido por inteiro e publicado como uma única história/evento. As janelas de 20, 21 e 22/11, das 8h às 18h, foram preservadas separadamente; nenhuma mecânica no jogo foi inferida. |

## Identidade e histórico

- IDs existentes foram preservados.
- URLs canônicas foram agrupadas em uma única história ativa por assunto.
- Teasers e manchetes substituídos permanecem no catálogo como `archived`, com `superseded_by` apontando para o registro confirmado.
- Nenhum item permanece com `editorial_detail_pending: true`.
- O item do coletor `oficial-noticia-c0b30b540fab.json` foi vinculado ao ID `2026-11-20-laic-2027-sao-paulo`; endereço, transmissão e atividades vêm da publicação oficial completa.
- O fallback autorizado permanece em uso quando não existe arte aprovada; nenhum fallback foi rotulado como Premium.

## Geração e testes locais

- Semana regenerada: 2–8/11/2026, 18 eventos, 9 artes Premium e 7 selos.
- Fila pública regenerada: 10 itens pendentes; nenhum push foi disparado.
- `node scripts/check_editorial_integrity.cjs`: aprovado.
- JSON dos catálogos e da semana: válido.
- `python -m unittest scripts.test_spidey_pages scripts.test_spidey_weekly`: 11 testes aprovados.
- Testes editoriais focados: 41 testes aprovados.
- A suíte Node completa possui falhas legadas de expectativas de versões antigas do PWA, inclusive no `main` base; a mudança não altera `sw.js` nem artes. O CI do PR deve ser a verificação autoritativa desta revisão.

## Publicação

Este bloco deve ser completado somente após PR, CI, merge e confirmação do GitHub Pages. Resposta HTTP não será registrada como teste físico.
