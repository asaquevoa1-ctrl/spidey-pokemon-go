# SPIDEY POKÉMON GO — GUIA MESTRE DE CONTINUIDADE

> **Conferência adicional em 22/10/2026, após criação do guia:** `main` HEAD `38678e28519754ac0000a13c11826c0233a3be1a` (atualização automática da Semana, `[skip ci]`) sucedeu o merge `6f936e270f11d06b5181c35da3cfed4be8469b5a` da PR #129. O último pacote de sucesso de Actions citado abaixo corresponde à PR #129, não necessariamente ao novo HEAD; verificar SHA de deploy e a URL pública antes de declarar QA. PRs ainda abertas: #84 National Trust, #71 Into the Wild, #65 Caçador/Feed, #32 Push+Social, #26 Weekly, #24 Halloween/GO Lab/Wild Area, #23 Amigos/Chat. A central Notion foi lida em 22/10 e seu conteúdo principal ainda é de 18/10. Este guia foi recuperado da Biblioteca ChatGPT e agora incluído no repositório para retomada entre chats, preservando o texto de consolidação integral.



**Data da consolidação:** 22 de outubro de 2026 (horário de Brasília).  
**Objetivo:** permitir que um novo chat, ChatGPT Work, Codex ou colaborador retome o mesmo projeto **sem reiniciar, desfazer diretrizes ou declarar entregas sem prova**.

> **IMPORTANTE:** este arquivo é um retrato auditado do momento da consolidação. **A fonte técnica canônica continua sendo a `main` atual do GitHub**, as decisões mais recentes do responsável e os arquivos de governança. Antes de qualquer nova ação, reconsultar o repositório, PRs e implantação; hashes e estados deste guia podem envelhecer.

## 1. Identificação, missão e endereços

- **Produto público:** Spidey Pokémon GO; aplicativo comunitário brasileiro gratuito, mobile-first e em português (PT-BR), reunindo notícias, agenda, roteiros, arte Premium e ações úteis para jogadores. **O aplicativo é o produto**, não um canal social separado.
- **Repositório:** https://github.com/asaquevoa1-ctrl/spidey-pokemon-go
- **Produção GitHub Pages:** https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/
- **Branch canônica:** `main`.
- **HEAD conferido nesta consolidação:** `6f936e270f11d06b5181c35da3cfed4be8469b5a` — merge da **PR #129** (restauração da base geográfica FLY). No GitHub Actions, os workflows da `main` para testes, proteção das decisões, hospedagem Pages, monitor, QA Samsung simulado e Caçador Samsung simulado foram observados com conclusão **success** para esse commit. Isto **não** certifica uso físico no Samsung nem recebimento de notificações.
- **Central Notion existente:** https://app.notion.com/p/3fd44d7b5e2e81f8a549da17e6d3f872 — *Spidey — Central de decisões e continuidade*. A página foi encontrada e lida; última edição conferida: **18/10/2026**. Ela própria declara GitHub como fonte canônica e serve como índice de documentos/decisões. Algumas pendências listadas ali estão desatualizadas (ex.: PR #95 original ANA já integrada, mudanças de 19–22/10 não refletidas integralmente). O ícone de aranha dessa página **não** substitui a identidade cósmica aprovada mais tarde.
- **Nome interno de retomada:** `SPIDEYNEXUS` é uma palavra-chave histórica para a conversa/projeto. **É PROIBIDO escrever “SpideyNexus” dentro de pôsteres ou artes**.
- **Hospedagem:** endereço permanente é **GitHub Pages**. Antigos links Vercel nos históricos são obsoletos; não contratar plano pago nem trocar o endereço público por prévias protegidas.

## 2. Ordem obrigatória de autoridade e documentos

**Precedência:** (1) instrução mais recente do responsável; (2) `SPIDEY_DECISIONS_CURRENT.md` e `AGENTS.md`; (3) código, dados, histórico de PRs, testes e deploy efetivo da `main` atual; (4) governança e padrões ativos; (5) índice Notion e registros históricos de NEXUS. Em conflitos de identidade, a aprovação recente do **S cósmico** prevalece sobre regras históricas do logotipo com aranha.

Ler nesta ordem no GitHub:

1. [`AGENTS.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/AGENTS.md): instruções de trabalho dos agentes.
2. [`SPIDEY_DECISIONS_CURRENT.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_DECISIONS_CURRENT.md): decisões correntes, incluindo atualizações de 19–22/10 e FLY.
3. [`config/spidey-governance.json`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/config/spidey-governance.json): bloqueios/reprovações, mas campos históricos (incluindo logo aranha e PR ANA) podem estar desatualizados; reconciliar com decisões correntes.
4. [`SPIDEY_GOLD_STANDARD.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_GOLD_STANDARD.md), [`SPIDEY_PREMIUM_STANDARD.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_PREMIUM_STANDARD.md), [`SPIDEY_APPROVED_ARTS.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_APPROVED_ARTS.md), [`SPIDEY_ART_SYSTEM.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_ART_SYSTEM.md).
5. [`SPIDEY_PRODUCT_EXPERIENCE.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_PRODUCT_EXPERIENCE.md), [`SPIDEY_APP_CONSTITUTION.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_APP_CONSTITUTION.md), [`SPIDEY_STAMPS_V2.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_STAMPS_V2.md).
6. [`SPIDEY_NEXUS_INDEX.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_NEXUS_INDEX.md), [`SPIDEY_NEXUS.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_NEXUS.md), [`SPIDEYNEXUS_CONTINUIDADE.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEYNEXUS_CONTINUIDADE.md), [`SPIDEY_PUBLIC_RELEASE.md`](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_PUBLIC_RELEASE.md): **histórico**, não substituir o estado mais recente.
7. [**Issue #59 — Prioridades e decisões**](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/issues/59): backlog ativo priorizado em 13/10.
8. Central Notion acima: índice para consulta; não escrever regras paralelas divergentes.

## 3. Acordos permanentes com o responsável

- **Autonomia:** trabalhar diretamente em GitHub/app, do diagnóstico à PR, CI, integração e validação. Não insistir em aprovações já delegadas, não pedir que o usuário faça upload/deploy/manual ou repita escolhas existentes. Se estiver bloqueado, documentar o impedimento exato sem inventar entrega.
- **Comunicação:** português natural, simples, direto, sem jargão excessivo, tom humano. O usuário costuma dizer “Bora” para autorizar continuidade do que já foi combinado. Não confundir andamento, PR, merge, Pages, disponibilidade pública ou teste físico.
- **Privacidade e custos:** aplicativo gratuito, sem cobrança de Vercel ou plataforma extra; não coletar credenciais, código de treinador, mensagens privadas, dados pessoais desnecessários nem incorporar rastreadores sem motivo/autorização. Nunca usar scraping ou dados licenciados sem permissão.
- **Qualidade de dados:** fonte oficial tem prioridade; reportar claramente rumor/comunidade. Nunca inventar horário, bônus, spawn, Shiny, taxa de chance, item de avatar, ataque, coordenada exata de PokéStop/Ginásio ou duração. Dados de fundo de localização/pesquisa somente se confirmados.
- **Imutabilidade:** não excluir nem sobrescrever artes Premium aprovadas; novas versões com arquivos novos, mantendo hash/histórico. Arte rejeitada pelo responsável é **rejeitada**, mesmo que testes técnicos ou metadados a chamem de `APPROVED`.
- **Verificações separadas:** `criado` ≠ `QA aprovado` ≠ `PR mesclada` ≠ `GitHub Pages concluído` ≠ `HTTP público confirmado` ≠ `Samsung físico verificado`. Não confundir em relatórios.

## 4. Identidade visual atual — não regressar

- **Logo atual aprovado em 19/10:** **emblema “S” cósmico/dourado**; **não** voltar à aranha nos splash/ícones/cartazes novos nem desenhar uma cópia aproximada do S.
- Binários originais: `spidey-app/assets/branding/20261019/`; `spidey-icon-cosmic-512.png` SHA-256 `4ee0ae8587bf3a60e2b4750b16b86a88472232c1627b737efea4d472dcfff0f8`, mais variante 192 e arquivos de abertura, carregamento, wallpaper, símbolo e fundo. Manifesto `spidey-app/data/cosmic-brand-assets-20261019.json`. **PR #108 foi mesclada**.
- O padrão das artes é **cinematográfico, gamer, editorial, premium**, alto contraste, cenário profundo, iluminação marcante, protagonista correto, tipografia clara em celular e acabamento de campanha. Paleta-base azul profundo/ciano/dourado, com liberdade temática. **Não:** aparência de PowerPoint, dashboard de empresa, cards genéricos, screenshots emolduradas, sprites colados, personagens deformados, textos pequenos ilegíveis, marcas inventadas.
- **Nunca escrever “SpideyNexus” no pôster**; preservar identidade correta do Spidey e marca oficial aplicada do arquivo original.
- **Delegação de QA visual:** `docs/qa/ART_CONTINUATION_AUTHORIZATION_20261003.json`; elimina aprovação individual repetitiva, não elimina conferência real das espécies, anatomia, texto, smartphone e consistência. Os quatro SVGs simplificados ANA/Seoul/Trust rejeitados em 17/10 continuam bloqueados (`docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json`).
- **Solgaleo e Lunala:** o usuário gostou da composição cósmica, mas **NÃO** podem estar no pôster do roteiro de 24/10 (não fazem parte dos eventos). Proposta de usá-los na **tela de carregamento** em composição separada, deixando o centro para o S original. A integração dessa nova tela **ainda não está comprovada**; não dizer que está concluída.
- Regras específicas: **City Safari Boston: SOMENTE Eevee tem chapéu de explorador; Pikachu não usa chapéu.** Em Night Out, Pikachu sem chapéu. FC Seoul: não gerar miniaturas distorcidas de Growlithe, Flareon, Torchic, Houndour, Litleo e Litten; nos quadros informativos, listar espécies em texto, mantendo Charmander e Charizard relevantes apenas onde oficialmente aplicável. Pikachu feminino nos visuais de eventos coreanos quando for o caso, cauda correta; não inventar figurinos.

## 5. Experiência do aplicativo

- **Mobile-first**, uso principal em Samsung Android, PWA instalável e desktop. Temas claro/escuro/sistema.
- **No celular:** botão **☰ abre menu lateral cósmico**, todas as áreas acessíveis ali; **barra inferior deve ficar oculta**. A decisão de retirá-la em 21/10 substituiu orientação anterior de mantê-la. No desktop, manter navegação e layout próprios. PRs #121 (drawer) e #123 (retirar barra inferior) mescladas; #122 limpou rótulos Caçador/ANA/Trust.
- Áreas: Início, AGORA/HOJE, Calendário, Semana/Weekly, Novidades, **FLY Rota Mundial**, Caçador, Selos/PokéLids, PvP, ANA, National Trust, Privacidade e detalhes. Não remover recursos existentes por acidente.
- Visual do produto: deve dar vontade de **abrir** o app, não consultar uma tabela; arte como parte da navegação, resumos acionáveis, cópia de coordenadas, abertura de mapa, download de arte/GPX **somente quando precisão permitir**.
- **Divulgação orgânica:** PR #109 mesclada; compartilhamento por WhatsApp/Android, deep links, Open Graph, sem trackers invasivos. Estratégia de divulgação orgânica continua e não autoriza publicidade paga ou coleta de dados.
- Samsung físico: gravações reais já confirmaram menu e algumas áreas; houve correções de abertura/splash (#110) e menu; isto **não prova todas as telas/versões atuais**. Alguns ícones de WebAPK podem ficar em cache, sem relação direta com os assets da web.

## 6. FLY — CONTRATO INEGOCIÁVEL

**Regra existente desde o início, reafirmada enfaticamente pelo usuário:** TODO evento global elegível com horário local confirmado (Hora do Holofote, Hora/Dia de Reides, Dia Comunitário, Segunda Max/Max Battles e análogos) **tem de estar na aba FLY** com rota geográfica, locais/países, coordenadas copiáveis, estados agora/próximo/encerrado/última chance, **horário do local + horário de Brasília**. Uma entrada apenas no calendário NÃO cumpre o combinado. `America/Sao_Paulo` é a referência brasileira. **Nunca exibir coluna de horário de Portugal no FLY**; locais situados em Portugal podem permanecer como coordenadas de referência.

- Núcleo: `spidey-app/fly-core.js`, interface `spidey-app/fly-v1.js`, CSS e dataset `spidey-app/data/world-event-points.json`. Converter fusos via IANA em função da data específica, respeitando horário de verão local e diferenças de meia hora. Não usar horas copiadas de listas antigas.
- A lista geográfica original fornecida pelo responsável é **10/11/2023**, revisão **06/11/2023**, 67 pontos, com exigência **“NÃO EDITE OU TIRE OS CRÉDITOS”**, autores **LendáriosBrasil · FlyGPS · PokemonTrail**, horários revistos por **👻 Fantasma 👻**. O texto de créditos foi incorporado sem apagar aviso em `source_list_2023.credits` do arquivo. Em 22/10, **PR #129 mesclada** restaurou os dados: atualmente **70 localidades únicas**, com 67 pontos da lista de origem (e outras referências históricas do produto), sem duplicar ponto quase idêntico do Ibirapuera.
- A UI mostra rota automática de eventos ativos/próximos, não só um hardcode para Morelull. Primeiro selecione o evento; veja janelas cronológicas; filtros de essenciais/todos, botões copiar e mapa. GPX de lugares urbanos **não** está autorizado como conjunto de spawns ou PokéStops.
- **Morelull — 22/10/2026, 18h–19h local:** 2× Poeira Estelar/captura, aparece em Calendário e FLY. Exemplos Brasília 22/10: Kiritimati 01–02h; Auckland 02–03h; Sydney 04–05h; Japão 06–07h; São Paulo 18–19h; últimos 23/10: Honolulu 01–02h, Pago Pago 02–03h. As datas e cidades usam hora local + Brasil calculadas, sem ajustar relógio do aparelho. Primeiro acesso ao Holofote deve oferecer rota inteira.
- **Proteção permanente:** `tests/fly-core.test.cjs`, `tests/fly-contract-global-events-20261021.test.cjs`, `tests/morelull-fly-route-20261021.test.cjs`, `tests/fly-historical-list-dst-20261022.test.cjs`; cobrindo créditos, localidades, horário de verão, janelas, categorias e acesso visível. **Se falharem, investigar antes de publicação.** Eventos apenas com data, sem horário comprovado, não recebem janela fictícia.
- Diferenças DST históricas para 22/10: Londres 14h Brasília, Roma 13h, Nova York 19h, Chicago 20h, para o início de evento 18h local. Checar a timezone IANA da cidade e a data, nunca a tabela impressa de novembro/2023.

## 7. Eventos e artes mais recentes

### 24 de outubro de 2026 — roteiro integrado

- Roteiro editorial único de **FC Seoul**, **City Safari Boston**, **Trio do Lago Dinamax**, **Night Out Los Angeles/Twitch** e atividade relacionada de Minior.
- **FC Seoul**: 24/10, 09h–20h Coreia = **23/10 21h a 24/10 08h Brasília**. Local presencial: Seoul World Cup Stadium. Charmander reide 1★ **sem passe remoto**, Charizard em Pesquisa Temporária, encontros na natureza Growlithe, Flareon, Torchic, Houndour, Litleo e Litten. Espécies pequenas no painel devem aparecer por nomes claros, sem caricaturas deformadas.
- **City Safari Boston:** 24/10 **10h–18h horário local de cada jogador**, benefício global condicionado a **ingresso já adquirido**; a cidade Boston é apenas coordenada de referência, não requisito geográfico. Eevee com chapéu, Flabébé Flor Laranja, Hawlucha, Mudbray e Komala segundo as modalidades verificadas. Pikachu NÃO recebe chapéu.
- **Trio do Lago Dinamax**: Uxie, Mesprit, Azelf conforme regiões; Brasil janela local Azelf **14h–17h**, **NÃO prioridade máxima** porque o trio poderá voltar. Não inventar uma coordenada única de reide.
- **Night Out Los Angeles:** Intuit Dome físico, Pikachu sem chapéu, Gengar e Toxtricity conforme pesquisas/reides presenciais. No Brasil, foco possível na transmissão/Twitch Drops a partir de **23h30 Brasília**, mediante regras do Drop. Não fingir que eventos físicos são reides acessíveis globalmente.
- **Minior Orionids** no mesmo período, janela de maior interesse no fim do dia conforme calendário; não confundir com os quatro blocos.
- Roteiro Premium publicado via PRs #120, #125 (Eevee chapéu), #126 (Seul em texto), #127 (arte final + coordenadas + Pawniard). `spidey-app/data/events.json`: ID `2026-10-24-spidey-full-day-guide`; arte principal `assets/events/premium/spidey-2026-10-24-full-day-community-share-v4.webp`, extra `.../spidey-2026-10-24-coordinates-reference-v1.webp`.
- **Referências geográficas, não Ginásios verificados:** Seoul World Cup Stadium `37.568250,126.897240`; Boston Common `42.355090,-71.067910`; Intuit Dome `33.943770,-118.342290`. **GPX desativado.**

### Pawniard — Dia Comunitário de novembro

- **21/11/2026, 14h–17h hora local**; espécie e bônus confirmados no anúncio oficial Pokémon GO. Shiny, 1/4 da distância de ovos colocados em incubadoras durante janela, 2× Doces, 2× chance Doces GG para nível 31+, e benefícios estendidos até 21h. Bisharp→Kingambit com **Kowtow Cleave** ao evoluir até 21h, evolução temporariamente facilitada conforme regra oficial. Detalhes exatos no evento e anúncio oficial.
- **ID existente preservado** `2026-11-21-community-day-preview` apesar do nome histórico “preview”; é evento confirmado publicado, sem duplicação. Arte Premium `assets/events/premium/spidey-2026-11-21-pawniard-community-day-v1.webp`; PR #124 confirmou dados, #127 integrou arte.

### Outros eventos, notícias e calendários

- Outubro/novembro: Mega Chandelure, Halloween Parte II, GO Wild Area Sendai/México/Global com Duraludon Gigamax, Zacian/Zamazenta Coroados, Kyurem Fusion, Pikachu temático, GO Lab Japão, Xurkitree, eventos ANA/National Trust/Adidas/TCG/APAC, GO Battle League, atividades diárias.
- O catálogo de `spidey-app/data/events.json` tinha **173 eventos** na revisão de 22/10. O catálogo de Premium `spidey-app/premium-approved-master.js` continha **80 entradas marcadas APPROVED**; **entradas não significam necessariamente 80 imagens originais distintas, e aprovação técnica não significa aprovação estética final**.
- Consultar `spidey-app/data/local-events.json` para experiências locais e fontes oficiais/regionais. Eventos passados somem de próximas/ativas, mas o histórico não deve ser apagado.

## 8. Caçador, fontes de dados e integridade

- Interface do **Caçador Global** existe, com filtros IV 100%/0%, PvP, possibilidade de Shiny/Shundo/Shnundo e leitura/cópia de coordenadas. Parte da UI pode direcionar a serviços externos opcionais.
- **Não há feed mundial em tempo real autorizado integrado**: `spidey-app/data/hunter-feed.json` sem registros reais, estado `awaiting_authorization` nas decisões. Não inventar aparições, tempos de expiração ou garantias de Shiny/IV. Entendimento com fornecedor/licença/API permanece pendente; PR #65 ainda aberta. Não fazer scraping, contornar login, republicar dados privados ou usar código de treinador.
- Fontes de notícias/filas: Pokémon GO oficial, G47IX, PokeMiners, SPS, fontes da comunidade claramente rotuladas; pipeline editorial deduplica → confirma data/fatos → PT-BR → coord/fuso quando cabível → arte Gold → QA visual → registros de aprovação → publicação. **Aprovação no Discord não deve ser presumida se não for prova atual e exata**. Erros/picos isolados nos workflows SPS já ocorreram; ver logs recentes.
- Monitores e tarefas agendadas do GitHub devem ser conferidos com resultados atuais. Workflow bem-sucedido pode significar “execução técnica” sem novos registros (não afirmar que dados chegam ao vivo). Sem licença, Caçador permanece sem feed.

## 9. Selos, PvP, GPX, ANA e Trust

- **Selos/PokéLids e Japão:** preservar conjuntos, estados localmente, ordem da rota, imagem oficial apenas se obtida e validada. `SPIDEY_STAMPS_V2.md`: `exact_pokestop` para cópia em lote/GPX, ordenação por rota/numeração; apenas gerar GPX completo se **todos os pontos** têm coordenadas exatas confirmadas. GPX de pontos de referência aproximada **bloqueado**.
- **ANA:** duas artes originais restauradas e integradas na **PR #95** byte a byte; não aceitar informações do Notion antigo que digam “ainda em rascunho”. As fases ficam na área ANA; não substituir pelos quatro SVGs rejeitados.
- **National Trust:** 27 locais/referências e Night Out em PR #84 aberta; coordenada física/venue não é confirmação de Ginásio PokéStop. Verificar escopo PR antes de integração.
- **PvP:** antigo “Mapa” foi substituído pela seção PvP, com referência a PvPoke. Não restaurar mapa como menu concorrente, nem remover PvP.

## 10. Backlog e prioridades atuais — decisão Issue #59

**Prioridades explicitamente fixadas no GitHub:**

1. **P1 Alertas/Web Push:** entregar serviço seguro gratuito, consentimento, VAPID, cron e prova **real de notificação recebida no Android**. PR #32 é proposta de backend misturado com recursos sociais: **não mesclar Amigos/Chat**. Cloudflare Workers Free era candidato; não pagar plataforma, não criar conta do usuário sem autorização.
2. **P2 Caçador Global:** UI e filtros presentes; falta **feed licenciado real**, QA no Samsung e verificação de confiança/privacidade. PR #65 continua aberta como pesquisa/implementação pendente.
3. **P3 Cobertura de artes Premium:** inventário atualizado a partir da `main`, tratar peças futuras mantendo revisões e Gold Standard. Pendentes/revisões históricas incluem FC Seoul **peça individual** (não confundir com quadro já corrigido do roteiro 24/10), National Trust, Adidas, TCG 30 anos, shopping/APAC, Regional Nice, itens da fila editorial; ver estado atual de cada arte.
4. **P4 GPX:** inventariar conjuntos; validar URLs/precisão e baixar apenas GPX completos reais, preservando GPX Centers Japão já comprovado no histórico, bloqueando PokéLids incompletos.

**Fora da prioridade atual:** Amigos/Chat — planejar depois, **não mesclar automaticamente** PRs sociais #23 ou #32. Comunicação orgânica do app é relevante, mas não substituir prioridades técnicas acima.

**PRs abertas verificadas nesta consolidação:** #84 National Trust; #71 Into the Wild aguardando arte; #65 Caçador/Filtro aparições automáticas; #32 push+social (separar push); #26 ajuste Weekly; #24 Halloween Parte II/GO Lab/Wild Area; #23 Amigos/chat. Abertura de PR **não é publicação**; avaliar divergências com `main` antes de reaproveitar.

## 11. Histórico recente de PRs confirmadas como mescladas

| PR | Conteúdo | Situação conferida |
|----|----------|--------------------|
| #95 | Restaurar dois originais ANA | Mesclada |
| #108 | Cinco peças de identidade cósmica e PWA | Mesclada |
| #109 | Divulgação orgânica, links profundos/compartilhamento | Mesclada |
| #110 | Correção de splash no Samsung | Mesclada |
| #120 | Guia Premium dos eventos de 24/10 | Mesclada |
| #121 | Drawer/menu lateral mobile | Mesclada |
| #122 | Melhorias no menu e fontes do roteiro | Mesclada |
| #123 | **Remover a barra inferior do celular** | Mesclada |
| #124 | Pawniard oficialmente confirmado | Mesclada |
| #125 | Eevee de chapéu no Boston; Pikachu sem chapéu | Mesclada |
| #126 | Eliminar miniaturas deformadas do FC Seoul | Mesclada |
| #127 | Três artes Premium — roteiro, coordenadas e Pawniard | Mesclada |
| #128 | Contrato geral FLY e Morelull | Mesclada |
| #129 | Restaurar 67 coordenadas originais; fusos e créditos; total 70 pontos únicos | Mesclada; último HEAD conferido |

## 12. Estado de publicação e regra de qualidade

- Para o HEAD `6f936e270f11d06b5181c35da3cfed4be8469b5a`, GitHub Actions informou sucesso de hospedagem Pages, testes, proteção de decisões, monitor e QA Samsung **simulado**. Inspecionar novamente a versão pública e caches quando for executar nova tarefa.
- **Não houve nesta consolidação um teste físico novo no Samsung** da versão atual, nem prova física de push recebido. Histórico de vídeos do usuário validou operações em versões anteriores.
- Qualquer nova PR exige conferir `AGENTS.md`, decisões correntes e escopo; mudar só o necessário; tests Node (`node --test tests/*.test.cjs`), testes de navegador/recursos afetados, QA responsivo 360/390/1280px, Claro/Escuro, assets/hash, integridade editorial, preservação de artes e links; verificar deploy Pages pelo SHA exato. Falhas de workflow devem ser identificadas por log, não interpretadas automaticamente como falhas funcionais.

## 13. Notion — o que existe e o que não existe lá

A busca no Notion conectado por “SpideyNexus”, “Spidey Pokémon GO”, “SPIDEY_DECISIONS_CURRENT”, “FLY Rota Mundial” e “Spidey Command Center” recuperou uma página relevante: **[Spidey — Central de decisões e continuidade](https://app.notion.com/p/3fd44d7b5e2e81f8a549da17e6d3f872)**. Ela reúne atalhos para documentos oficiais, confirma políticas de arte, de não repetição e de preservação, e elenca pendências segundo 18/10. **Não é uma especificação independente completa**, não contém todos os diálogos, e alguns estados dela envelheceram. Se o Notion conflitar com commits/PRs recentes, prevalecem as decisões atuais e o GitHub, conforme declaração expressa da própria página.

## 14. Como o próximo chat deve começar

1. Não recomeçar o projeto, não criar repositório novo, não reverter logo/menu nem pedir aprovações passadas.
2. Abrir `https://github.com/asaquevoa1-ctrl/spidey-pokemon-go` e consultar **HEAD atual** da `main`, PRs abertas e GitHub Actions antes de declarar status.
3. Ler **`AGENTS.md` e `SPIDEY_DECISIONS_CURRENT.md` integralmente**; este guia é índice/consolidação, não substituto.
4. Abrir a **Central do Notion** e comparar decisões de 18/10 com as decisões mais novas de 19–22/10 e posteriores.
5. Reler `config/spidey-governance.json` e padrões Gold/Premium, respeitando as mudanças mais recentes. Não tomar o logo antigo do arquivo de governança como ordem para revogar o S cósmico.
6. Verificar necessidade da tarefa ativa. Na continuidade do FLY, confirmar dados **70 pontos** (ou total atualizado), créditos originais, rota completa, DST, Portugal sem coluna horária, evento no calendário **E** na interface FLY, e testes. Não repetir a falha Morelull.
7. Atuar no repositório com PR pequena, testes de regressão e publicação comprovada, comunicando resultado natural em PT-BR, sem status fictício.

### Mensagem curta para colar no novo chat

> **Retome integralmente o projeto Spidey Pokémon GO sem reiniciar.** Repositório `asaquevoa1-ctrl/spidey-pokemon-go`, produção `https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/`. Leia `AGENTS.md`, `SPIDEY_DECISIONS_CURRENT.md`, este `SPIDEY_GUIA_MESTRE_CONTINUIDADE_2026-10-22.md`, padrões Gold/Premium, o estado atual da `main` e as PRs abertas. Consulte o Notion `https://app.notion.com/p/3fd44d7b5e2e81f8a549da17e6d3f872`, lembrando que ele é índice e o GitHub é canônico. Regras irrevogadas: logo S cósmico original; nada de “SpideyNexus” nas artes; estilo Premium cinematográfico factual; preservar artes aprovadas; celular só com menu lateral ☰, sem barra inferior; FLY obrigatório para eventos globais de horário confirmado, com rotas/coordenadas e horário local + Brasília (DST IANA), sem coluna Portugal; 67 referências históricas com créditos originais, 70 localidades únicas após #129; nada de coordenadas falsas, GPX de referência ou Shiny/spawns garantidos. Prioridades #59: alertas reais gratuitos, Caçador com feed licenciado, artes Premium e GPX verificado; Amigos/Chat adiados. Não peça aprovações repetidas. Verifique CI, PR, Pages e Samsung separadamente. Comece conferindo o estado atual, e siga do ponto exato da última tarefa, sem regressões.

---

**Fim do guia — links/estados são um snapshot de 22/10/2026 e devem ser revalidados no GitHub.**