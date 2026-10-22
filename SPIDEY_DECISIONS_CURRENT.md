# SPIDEY — DECISÕES ATUAIS E REGRAS DE CONTINUIDADE

**Reconciliado em 22/10/2026.** Fonte de referência operacional para qualquer agente, chat, Work, CI ou colaboração neste repositório.

## Como resolver divergências
1. A **instrução mais recente do responsável** para o projeto prevalece sobre decisões históricas.
2. Este documento registra essas decisões correntes. `AGENTS.md` obriga sua leitura na retomada e antes de qualquer alteração.
3. `SPIDEY_APP_CONSTITUTION.md`, `SPIDEY_GOLD_STANDARD.md`, `SPIDEY_PREMIUM_STANDARD.md`, `SPIDEY_APPROVED_ARTS.md` e `docs/SPIDEY_ART_STANDARD.md` detalham regras que continuam vigentes onde não houver conflito.
4. Histórico/índices e relatórios antigos são **evidências da época**, não o estado atual de produção. O **código da `main` e o CI/deploy efetivamente executados** determinam o estado técnico.
5. Se houver dúvida, investigar repositório, registros e fontes antes de perguntar. Não inventar o conteúdo de um arquivo, aprovação, deploy ou evento.

## Decisões permanentes (solicitações explícitas)
- **Produto principal:** aplicativo público Spidey Pokémon GO, mobile-first, tema claro/escuro/sistema, link público permanente https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/.
- **Autonomia:** o usuário não deve ser obrigado a fazer upload, alterar GitHub/Vercel, aprovar repetidamente artes dentro do padrão já delegado, copiar arquivos entre serviços ou publicar manualmente. O trabalho esperado é direto no **aplicativo**, não enviar artes soltas no chat. Se uma ferramenta estiver indisponível, registrar o bloqueio verdadeiro e manter a entrega pendente — jamais transferir tarefas ao usuário, inventar êxito ou trocar por material inadequado.
- **Identidade:** usar o arquivo de logotipo **oficial já aprovado**, sem reinterpretá-lo; proibição de escrever a palavra **SpideyNexus** em qualquer cartaz/arte. Referências anteriores aprovadas continuam válidas.
- **Padrão de arte:** cinematográfico/editorial Premium, protagonista Pokémon expressivo e dominante, cenário imersivo com profundidade, iluminação de campanha, composição marcante, identidade Spidey, títulos fortes e legíveis no celular, informações factuais integradas. **Proibido** aparência de PowerPoint/dashboard corporativo, fundo genérico, sprite básico colado, card genérico, cartaz artificial e encaixe de captura de tela.
- **Delegação existente:** decisão registrada em `docs/qa/ART_CONTINUATION_AUTHORIZATION_20261003.json` dispensa **pedidos de aprovação individual** para próximas artes realmente conformes. **Não é licença para declarar qualquer arquivo aprovado**: evidência visual comparativa com referências de qualidade, conferência factual, render em celular e verificação de integração são indispensáveis. Teste HTTP, teste Playwright ou hash correto sozinho **não prova qualidade estética**.
- **Imutabilidade:** não substituir/apagar uma arte anteriormente aprovada por fallback, reprocessamento ou geração nova. Se surgir versão melhor, preservar a original como histórico e usar apenas a versão objetivamente validada. Reprovação do usuário prevalece inclusive sobre rótulo antigo `APPROVED`.
- **Dados:** somente informações oficiais confirmadas podem ser apresentadas como oficiais; separar fontes comunitárias. Não inventar bônus, datas, Shiny, coordenadas ou recompensas. Coordenadas da sede/aeroportos não são Ginásios/Poképaradas verificadas e **não geram GPX** de pontos exatos.
- **Eventos:** os encerrados saem das vistas de próximos/ativos por data, sem apagar histórico; horas locais e Brasília sempre calculadas usando fuso correto; preservar calendário, FLY, PvP, selos, notificações, botão voltar e URL pública.
- **Progresso real:** não dizer que a arte está publicada porque foi criada, que há aprovação porque renderizou ou que existe monitoramento porque há workflow. Distinguir **arquivo**, **PR**, **CI**, **merge**, **deploy**, **disponibilidade HTTP** e **teste físico**.

## Correção obrigatória de 17–18/10/2026
O responsável **reprovou explicitamente** quatro artes simplificadas introduzidas por PR #91 e retiradas em PR #93:
1. `2026-ana-pokemon-jet-red`
2. `2026-ana-pokemon-jet-green`
3. `2026-10-24-fc-seoul`
4. `2026-national-trust-27-sites`

Os SVGs dessas versões e seus SHA-256 estão no registro histórico `docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json`, marcado `REJECTED_BY_USER_AFTER_PUBLICATION`. **Nunca restaurar esses bytes, SVGs, títulos `APPROVED` ou substituições equivalentes de aparência genérica.** Preservar evento FC Seoul, guia Trust com 27 localidades e ANA com referências de 7 pontos/6 aeroportos vermelhos e 14 verdes.

Duas peças **originais** ANA, enviadas pelo responsável em 18/10, são **referências visuais aprovadas**. Há uma PR #95 em rascunho preparada para restaurá-las exatamente; o upload binário ao GitHub ainda estava bloqueado na última verificação. Atribuir nomes e hashes conforme `spidey-app/data/ana-pokemon-jet-approved-originals.json` **na PR #95**; essa PR não é entrega publicada e **não autoriza substituição por SVG**. Se o acesso aos bytes estiver bloqueado, deixar PR em rascunho e buscar fluxo de transferência pela infraestrutura conectada, sem exigir ação do usuário.

## Próximas prioridades editoriais
**Primeiro** ANA originais (ou novos pôsteres equivalentes *somente* se tecnicamente impossível recuperar e com qualidade comparativa real); **depois** FC Seoul e National Trust; em seguida Adidas, shopping/APAC, 30 anos TCG, Nice e demais eventos sem arte Premium. Não tocar em um pôster anteriormente aprovado só para aumentar número de artes.

## Sequência obrigatória para cada trabalho
1. Ler `AGENTS.md`, este arquivo, `config/spidey-governance.json` e documentos relevantes. Ler a `main` e PRs abertos; não recomeçar projeto.
2. Conferir se a tarefa já foi feita, reprovada, supersedida ou está em andamento; preservar o que funciona.
3. Para nova arte: confirmar fatos, comparar visualmente com referências aprovadas, conferir marca/textos, registrar arquivo real/hash, validar no contexto do app. QA delegado é possível **sem nova intervenção do usuário**, mas precisa ser real.
4. Executar testes, revisar diffs, verificar status de PR e deploy. Não provocar regressão de recursos alheios.
5. Só registrar `CONCLUÍDO` com prova do nível efetivo; documentar pendências reais. Se tool não suporta transferência binária, não inventar uma publicação e não pedir ao responsável um procedimento manual.

**Esta política vale em toda conversa e toda retomada, não só quando o usuário disser uma palavra-chave.** O Github não substitui memória automaticamente: o agente precisa consultar a política em cada nova sessão.

## Ajuste de tom e selos — 18/10/2026
- Priorizar linguagem natural e direta no app; evitar avisos internos como “arte original aprovada pelo usuário”, “Arte Premium pendente” em telas de selo, notas técnicas de QA e mensagens repetidas de sistema.
- A galeria de selos deve exibir suas próprias imagens oficiais já referenciadas (PokéLids e Pokémon Center). Não deixar o controlador geral de pôsteres ocultar imagens de selos.
- Onde não houver desenho individual verificado, usar indicação discreta, sem inventar artes e sem reservar grandes espaços vazios.
- Downloads DataHub: manter TXT de 18 PokéStops Pokémon Center e 482 locais físicos PokéLids **em categorias separadas**. Não confundir tampas com PokéStops confirmadas.

- **Nagasaki:** único selo Ampharos documentado para a campanha, exibido nas 8 paradas sem inventar 8 artes diferentes; fonte Serebii. PokéXciting segue sem desenho individual verificado. Um link externo de imagem não garante carregamento no Android.


## Identidade cósmica autorizada pelo responsável — 19/10/2026
- O responsável aprovou explicitamente **cinco peças distintas** do pacote visual: (1) abertura, (2) carregamento, (3) ícone/logo do aplicativo, (4) fundo sem textos e (5) versão limpa para uso interno.
- O **emblema dourado em S** dessa nova identidade pode substituir o ícone e o logo de abertura antigos, por autorização posterior e explícita do responsável. Não tratar a regra antiga de manter o logo como impedimento a essa decisão nova. **Preservar** os bytes dos arquivos de identidade anteriores no Git e não substituir artes editoriais previamente aprovadas.
- Legendaries solicitados: Rayquaza, Giratina, Xerneas (4 pernas), Hoopa em ambas as formas e Yveltal Shiny. Sem a palavra SpideyNexus na arte.
- A arte de abertura transmite “O mundo Pokémon GO na palma da mão”. O carregamento deve manter saída rápida, animar apenas quando necessário e nunca segurar a navegação esperando as imagens.
- Os arquivos finais otimizados, hashes e destinos estão em `spidey-app/data/cosmic-brand-assets-20261019.json`. Em 20/10 os sete binários originais foram recuperados do acervo da conversa, conferidos por SHA-256 e preparados no GitHub; a habilitação `window.SPIDEY_COSMIC_ASSETS_VERIFIED=true` depende da presença dos sete arquivos na mesma árvore Git e da aprovação do CI. Publicação na URL pública e teste físico no Samsung são verificações independentes.
- Não dizer “aplicado” ou “publicado” só com PR/manifesto. O ZIP gerado na conversa não está automaticamente disponível ao navegador de GitHub Pages. A conexão GitHub não oferece transferência direta de arquivo local binário; manter pendência se essa etapa não tiver mecanismo confiável. Não exigir que o responsável faça upload manual.


## Continuidade de divulgação orgânica — 20/10/2026
- PR #109 incluiu compartilhamento nativo Android/WhatsApp, deep links para eventos públicos, Open Graph, privacidade sem rastreadores, e foi integrado na `main` em 20/10/2026.
- Preservar essas funcionalidades ao integrar o PR #108. Identidade cósmica pode atualizar prévia social oficial, sem alterar links diretos e sem rastreamento invasivo.
- Validar separadamente CI, publicação GitHub Pages e Samsung físico; não alegar validação física sem execução no aparelho.

## Samsung físico — gravação recebida em 20/10/2026, correção de inicialização
- Vídeo real de aproximadamente 27s enviado pelo responsável mostra a sequência de ícone/logo anterior, Splash antigo e a imagem cósmica de 'Carregando...' por cerca de 14s até a home aparecer. É observação física de lentidão; NÃO equivale a aprovação da experiência.
- Conservar as cinco artes originais e novo emblema dourado; eliminar referência visual antiga na abertura, cabeçalho e hero sem apagar o arquivo histórico do repositório.
- A tela de abertura deve terminar independentemente de demora da agenda: JavaScript até 1,4s, fallback HTML até 2,1s, CSS 2,05s; compositor/estados do navegador podem variar. Ícone novo desde o primeiro frame; arte cósmica não deve reaparecer após fechar.
- Adicionar QA de catálogo atrasado, Android 390px simulado e validação de tema/compartilhamento. CI só prova navegador simulado: novo teste físico depois do deploy permanece pendente.

## Segunda gravação física do Samsung — ícone nativo WebAPK — 20/10/2026
- Vídeo de ~61,5 s recebido após PR #110. A primeira abertura mostra o logo antigo na tela nativa do Android por ~2,5 s, depois a imagem cósmica aprovada e o app em ~4 s. A segunda abertura repete o ícone nativo antigo antes do conteúdo novo. A lentidão anterior de ~14 s na tela web de carregamento deixou de ocorrer; não confundir tempo total de inicialização nativa com o timeout do loader JavaScript.
- O HTML/manifesto da nova identidade já apresentam o ícone cósmico. O splash inicial antigo pertence ao **WebAPK instalado no Android** e não pode ser redesenhado instantaneamente por JavaScript ou GitHub Pages. O Chrome verifica mudanças de manifesto periodicamente e pode aguardar condições do aparelho para atualizar ícone/instalação. Não alegar atualização física concluída sem uma gravação que mostre a mudança.
- Correção técnica: remover apenas do **manifesto** os ícones alternativos antigos, mantendo os arquivos no Git, trocar versão do link do manifesto, e buscá-lo por rede preferencialmente no Service Worker; testar atualizações/offline. Preservar ID e escopo para não duplicar instalações. Não exigir nova aprovação de artes nem confundir atualização WebAPK com atualização de conteúdo web.
- Push verificado separadamente: configuração publica Worker Cloudflare e permite testar a assinatura remota; monitor HTTP do GitHub Pages reportar `push: false` não constitui prova de falha do Worker remoto. Não retirar ou prometer push sem teste real de entrega.

## Caçador — 20/10/2026, integração progressiva reutilizando PR #65
- O código da PR #65 foi transportado para a main atual por uma PR de integração separada, sem substituir a identidade cósmica, alterações do Samsung, Push, FLY, selos ou PvP. Guia 'Filtro' funciona como Caçador global e acessa uma tela própria, mais atalho em Início.
- **Operacional nesta entrega**: seis filtros, busca manual externa opcional, leitura de coordenadas e IV, autoatualização do JSON de fontes a cada 60 segundos enquanto a tela estiver aberta, cartões de cópia em um toque **somente quando houver feed real**, controles de expiração/deduplicação, página de fonte SPS/PGAN/PoGoCoordinates acessível por escolha do jogador.
- **Não operacional/sem autorização**: feed mundial integrado de Pokémon vivos, verificação pessoal de shiny/shundo/shnundo e alertas baseados nesse feed. O arquivo `hunter-feed.json` permanece vazio com status `awaiting_authorization`. A tela informa corretamente, sem falsificar registros históricos como ativos.
- Pesquisa SPS/PGAN: SPS fornece mapa autenticado pelo Discord e alertas pessoais vinculados a treinador, **sem API de republicação autorizada no momento**. PGAN diz explicitamente na sua FAQ que não possui API pública e oferece apenas webhooks de comunidade mediante pagamento e análise; verificar sublicenciamento separado. Não transmitir login/código do treinador para o site Spidey.
- Aceitação de novos fornecedores requer autorização, dados reais, cobertura, expiração e monitoramento contínuo. No PR #65 há evidências de pesquisa e integração futura. Esta entrega não liquida a etapa de dados ao vivo.

## 20/10/2026 — Captação autorizada para o Caçador
- Contato de parceria enviado pelo Gmail conectado ao `contact@pogoalerts.net`, perguntando sobre feed/API licenciado, preço, abrangência e piloto gratuito. Não há resposta nem contrato confirmados até esta edição.
- Criado importador e ação opt-in no repositório. `HUNTER_FEED_LICENSE_APPROVED` ausente => nenhuma execução externa, nenhuma redistribuição de dados de terceiros. O Pages só faz publicação extra de feeds se essa licença for explicitamente habilitada.
- Caçador preserva funcionalidade de interface, sem promessa de feed ao vivo. Nenhuma confirmação personalizada de Shiny pode ser inferida do IV.
- Instruções de ativação em `docs/HUNTER_PROVIDER_ACTIVATION_20261020.md`.

## 20/10/2026 — Caçador: interface pública sem informações internas
- Captura real do Samsung às 15:05 revela texto longo sobre feed autorizado, links de fornecedores em destaque e explicações técnicas; esses detalhes não fazem parte da experiência que deve ser exibida a todos.
- Publicar uma mensagem curta **“Nenhuma aparição disponível no momento.”** quando não houver dados reais atuais. Erros de conexão mantêm aviso breve, sem mostrar explicações de backend.
- Preservar os seis filtros e o botão Atualizar; links externos e ferramentas manuais permanecem disponíveis apenas ao expandir **“Outras opções de busca”**. Remover da abertura do Caçador referências a “Sem busca automática”, “Pesquisa externa” e textos de negociação; manter toda documentação e bloqueios na área técnica do repositório.
- É permitido mostrar aparições apenas com feed atual e autorizado; não inventar coordenadas, IV ou Shinies. A mudança é de apresentação e não resolve o bloqueio do fornecedor.

## 20/10/2026 — Radar externo: integração adaptável sem autorização presumida
- Investigar iFlowGo PoGo Radar e Moonani como fontes potenciais. Descoberto cliente MIT em `KernelX-debug/Discord-Bot_Lucario_Moonaniphp` documentando campos técnicos reais; licença do código não concede acesso/licença aos dados. O envio de issue ao repositório de terceiros retornou 403 e não foi realizado.
- Implementado adaptador de fornecedor `HUNTER_PROVIDER_FORMAT=iflowgo`, preservando os filtros, controle de licença, ausência de coleta e validação de expiração/PII. Nenhuma consulta/credencial iFlowGo ou Moonani ativada no Spidey; exigir acordo de redistribuição.

## 20/10/2026 — Passe GO de novembro Groudon confirmado
- O anúncio encaminhado pelo editor em captura está confirmado pelo Pokémon GO: https://pokemongo.com/en/news/go-pass-november-2026. Período de 03/11 às 10h a 01/12 às 10h, horário local; prazo de resgate 03/12 às 10h.
- Novos dados no calendário: 400 PokéMoedas no gratuito, mais 1.000 somente no Deluxe pago (total 1.400), Groudon com possibilidade de Brilhante, bônus por ranque, 28–29/11 sem limite diário de Pontos GO. Não confundir com Passe GO Into the Wild.
- Eventos existentes e arte aprovada de Outubro/Setembro/Halloween devem permanecer intactos. Como arte Premium original de novembro não está aprovada, usar somente visual de calendário de data (sem mídia/fallback genérico) e preservar a fila pendente de arte, com proibição de reaproveitar a captura ou cartaz de outro mês como peça Premium.
- O registro factual e a notícia no app não certificam arte Premium final. Não fazer divulgação orgânica externa como se o pôster estivesse aprovado.

## 20/10/2026 — Correção crítica na fila do Passe GO de novembro
- A auto-curadoria marcou falsamente a notícia de Groudon/PokéMoedas como duplicata da notícia oficial de Minior por aceitar qualquer palavra de seis caracteres compartilhada. O registro publicado no calendário continua correto; a curadoria de arte não foi realizada.
- A deduplicação agora prioriza o mesmo artigo oficial (URL canônica, incluindo variantes de idioma). Com URLs diferentes não rejeita notícia por similaridade de palavras; sem URLs, exige quatro palavras relevantes e alta similaridade.
- Itens com arte obrigatória e `proibir_render_arte`/`proibir_fallback` ficam `aguardando_arte_chatgpt`. É proibido a automação antiga renderizar uma imagem de fonte/PIL, rotulá-la como Premium e submetê-la como peça aprovada.
- A notícia de Groudon foi preservada na fila editorial, com fatos oficiais, sem imagem Premium publicada e sem pedir novamente aprovações individuais de artes já aceitas. Falta gerar, inspecionar e integrar uma arte premium original seguindo o Gold Standard.


## 21/10/2026 — Roteiro Premium integrado do dia 24
- O responsável confirmou a integração no aplicativo do fluxo premium de 24/10 com destaque FC Seoul, sem Holofote Morelull no pôster. Horário FC Seoul 23/10 21h → 24/10 08h em Brasília, com Charmander e Charizard como protagonistas; evento presencial sem reides remotas de Charmander.
- Preservar a identidade cósmica aprovada em 19/10: **imagem original exata** do ícone dourado S `spidey-app/assets/branding/20261019/spidey-icon-cosmic-512.png`, sem aranha, foi aplicada ao pôster final. Registro de arte e SHA-256 em `docs/qa/DAY24_FLOW_ART_APPROVAL_20261021.json`.
- Pôster do fluxo é peça editorial única do **guia do dia** (`2026-10-24-spidey-full-day-guide`), e **não substitui** as artes Premium aprovadas dos eventos individuais. Source e original preservados.
- Divulgação geral cobre Uxie/Mesprit remotos apenas quando permitidos com recursos e amigos, Azelf local 14h–17h, Minior 17h–21h e Twitch 23h30; City Safari Boston depende de ingresso original. O Morelull continua no calendário de 22/10, mas não aparece no guia ou pôster de 24/10.
- Documento e commit no GitHub demonstram somente integração técnica. Merge, GitHub Pages e Samsung precisam de verificação independente.


## 21/10/2026 — Menu lateral para celular
- O responsável perguntou sobre replicar a navegação lateral do computador no celular e autorizou o estudo da melhoria. Implementada uma primeira versão reversível, **sem substituir a barra inferior**: botão ☰ na barra superior abre painel lateral em telas até 760px.
- Navegação mantém as rotas e ações já existentes, clonando **somente os botões visuais** da aba original: Início, Novidades, Semana, FLY, Caçador, Selos, PvP, ANA, Trust e quaisquer novas abas futuras. O botão original recebe o clique, preservando o carregamento de cada seção.
- O painel possui emblema S cósmico oficial (arquivo original, sem redesenho), tema claro/escuro/sistema, Privacidade, botão ×, toque externo, Escape, foco de teclado, suporte a gestos para fechar e safe areas Android. Não cria contas, rastreadores nem coleta dados.
- **Desktop não muda**; bottom nav móvel permanece disponível como atalho rápido. Publicação e teste físico no Samsung são verificações independentes do CI.


## 21/10/2026 — Decisão posterior: retirar barra inferior do celular
- Após validar o menu lateral por vídeo no Samsung, o responsável determinou **“Não quero mais a barra inferior”**. Esta decisão **substitui** a orientação anterior de manter os atalhos inferiores no celular.
- Em telas até 760px, **o único menu de navegação principal visível será o menu lateral ☰**. As abas antigas continuam invisíveis no DOM para manter suas ações e links dinâmicos (FLY, Caçador, Novidades, PvP, ANA, Trust etc.), mas não são exibidas na parte inferior. O ocultamento ocorre após inicialização do drawer, preservando uma rota alternativa se JavaScript falhar.
- Corrigir o espaço vazio antes ocupado pela barra; preservar o menu lateral, a marca cósmica S, o botão voltar e todos os recursos e temas existentes.
- No desktop, **não alterar** a navegação lateral atual. Preservar as artes Premium, registros de fontes, push, rotas, catálogo e privacidade. Validar GitHub Actions, deploy e observar o Samsung separadamente antes de declarar verificação física.


## 21/10/2026 — Pawniard confirmado para Dia Comunitário de novembro
- O responsável encaminhou uma arte GO Hub/FlareBlaze e uma legenda que ainda tratava Pawniard como rumor para o sábado 21/11. Em 21/10, a publicação **oficial** https://pokemongo.com/en/news/communityday-november-2026-pawniard já confirmou Pawniard, das 14h às 17h no horário local, com Shiny/Fundo Especial, 1/4 de distância de Ovos incubados durante o evento, 2× Doces, 2× chance de Doces GG para nível 31+, Incenso de 3h, Módulos Atrair de 1h, trocas e bônus até 21h.
- Kingambit recebe o ataque carregado **Kowtow Cleave** (75 de potência PvP; 85 Ginásios/reides) se Bisharp for evoluído durante o Dia Comunitário ou até quatro horas após, ou seja, até 21h locais; evolução temporariamente facilitada após vencer um chefe de reide Sombrio/Aço, para todos os Bisharp independentemente de companheiro.
- Atualizar **o mesmo cadastro** `2026-11-21-community-day-preview` com fonte oficial e o artigo de Novidades para evitar duplicar a programação pública ou quebrar links existentes. Usar hora brasileira 14h–17h com benefícios estendidos corretamente indicados até 21h.
- **Não reproduzir o infográfico de terceiros como pôster oficial Spidey**, nem copiar arte, logo GO Hub, dados de PvP/CP e ícones sem revisão. Por enquanto visual de data, sem exigir poster Premium; a peça cinematográfica **original e revisada** continua na fila editorial, sem pedir reaprovação recorrente.
- Mudanças no conteúdo devem passar por QA, CI, merge e deploy comprovados separadamente. Publicação no GitHub não equivale a teste físico Samsung.


## 21/10/2026 — Correção Safari: somente Eevee usa chapéu
- O responsável identificou um erro nas novas prévias do pôster do dia 24: **Pikachu NÃO usa chapéu**. No bloco **City Safari Boston**, o único Pokémon caracterizado com chapéu de explorador é **Eevee**, conforme recompensa específica. Pokémon válidos de Boston incluem Flabébé Flor Laranja, Hawlucha, Mudbray e Komala; não inserir Pikachu caracterizado nessa seção.
- Para Pokémon Night Out Los Angeles, Pikachu e Gengar participam das reides presenciais e Toxtricity aparece nas pesquisas locais; Pikachu aparece **sem chapéu** no pôster do roteiro. Para FC Seoul, Charmander e Charizard são os protagonistas. Trio do Lago Dinamax: Uxie, Mesprit, Azelf; **não dar prioridade máxima**, pois retornam em outras ocasiões.
- Substituir a peça ativa de 24/10 por um **novo arquivo v2**, sem sobrescrever/apagar a arte v1; confirmar WebP/sha256, fonte oficial, cache do Android e identidade original cósmica S aprovada. Para Boston, bônus globais são das **10h às 18h no horário local do jogador** e exigem ingresso existente. Não apresentar como evento acessível a quem não tem ingresso.
- **Solgaleo e Lunala não fazem parte dos quatro eventos**; o responsável gostou dos lendários na direção artística, mas determinou que sua presença no roteiro geraria confusão. Eles são candidatos à **tela de carregamento** como elemento visual independente, sem divulgar capturas; não declarar carregamento atualizado antes de arte exclusiva + integração + QA.


## 21/10/2026 — FC Seoul: não criar miniaturas distorcidas de Pokémon
- Após o pôster v2, o responsável indicou que **Houndour, Litleo e Litten** estavam distorcidos/misturados nos quadrinhos do FC Seoul. Nova decisão prevalente: **não desenhar miniaturas de espécies em tamanho minúsculo na composição do roteiro; apresentar o elenco com nomes por tipo de encontro**.
- Oficial FC Seoul: `https://pokemongo.com/ko/news/fc-seoul-2026`. Reide 1★ presencial com **Charmander**, sem Passe de Reide Remota; Pesquisa Temporária com **Charizard** de Fundo de Localização; na natureza **Growlithe, Flareon, Torchic, Houndour, Litleo e Litten**.
- **Arte v3** preserva as representações principais de Charmander e Charizard, todos os outros painéis e o emblema S cósmico original; substitui SOMENTE o bloco de miniaturas de Seul por textos claros. Corrige também a orientação desnecessária de alterar o fuso horário do celular: agora `Confira as janelas dos eventos.`. O público usa o módulo FLY e precisa de horários de Brasília bem apresentados, não de instrução para mudar relógio.
- Arquivos anteriores v1/v2 são preservados; usar o novo WebP e o SHA registrado em `docs/qa/DAY24_FC_SEOUL_TEXT_REPLACEMENT_20261021.json` no catálogo do evento, versão PWA e testes. Não considerar merge/deploy/Android como concluídos sem verificação independente.


## 21/10/2026 — Publicar artes do roteiro, coordenadas e Pawniard
- O responsável aprovou as **três artes** geradas para compartilhar nos grupos e pediu que fossem publicadas no aplicativo: (1) pôster do roteiro 24/10, (2) quadro visual de coordenadas de referência do dia 24 e (3) Dia Comunitário de Pawniard, 21/11.
- Usar os **três arquivos WebP originais com o emblema S cósmico oficial de 19/10 aplicado exatamente a partir do arquivo aprovado**, sem desenhar novo emblema. Os PNGs equivalentes ficam como arquivos para compartilhamento; todos os hashes registrados em `docs/qa/DAY24_AND_PAWNIARD_ART_PUBLISH_20261021.json`.
- A peça principal de 24/10 conserva o quadro FC Seoul **sem miniaturas deformadas**, com espécies listadas por nome, preserva Eevee com chapéu só no Boston e Pikachu sem chapéu na Night Out, e mantém Trio do Lago como opcional.
- O quadro de coordenadas é **complementar ao mesmo guia**, disponível dentro dos detalhes da programação para baixar, nunca anunciado como coordenada oficial de Ginásio ou spawn garantido: Seoul World Cup Stadium `37.568250,126.897240`; Boston Common `42.355090,-71.067910` (evento principal de Boston é global só para quem já tem ingresso); Intuit Dome `33.943770,-118.342290`; Trio Dinamax **sem coordenada única**. GPX **desabilitado** porque não são PokéStops/Pontos de Poder exatos.
- A arte Pawniard deve ser registrada no catálogo Premium sob o cadastro existente `2026-11-21-community-day-preview`, **sem criar novo evento nem mudar seu ID**. Manter bônus oficiais e os horários de 14h–17h e extensão de evolução e benefícios até 21h.
- Exibir botão para baixar as artes do roteiro/Pawniard e o quadro de coordenadas no detalhe do evento, com cache Samsung versionado; preservar outras artes, navegação ☰ exclusiva no celular, desktop e privacidade. Testar CI, merge, Pages e Samsung físico separadamente.


## 21/10/2026 — Morelull deve estar em destaque na aba FLY
- Orientação explícita e prioritária do responsável: **Morelull (22/10) não deve ser tratado somente como notícia/calendário; é essencial ter roteiro mundial na aba FLY com coordenadas corretas e janelas por fuso**. Não responder apenas com hora local sem conferir a interface FLY.
- O core FLY existente já possui **28 pontos de referência urbanos georreferenciados** com timezones IANA e estados de atividade; preservar estes dados e renderizadores, sem criar PokéStops, Ginásios ou spawns não verificados.
- Colocar **destaque temporário do Morelull** na tela FLY e seleção automática do evento ao abrir o FLY no período relevante, de 12h antes da primeira janela global (Kiritimati 22/10 01h em Brasília) até a última janela (Pago Pago 23/10 03h em Brasília). Mostrar **Todos os 28 locais** por padrão, permitir filtrar essenciais, copiar coordenadas e abrir mapa.
- O evento permanece corretamente em 22/10, das **18h às 19h locais**, 2× Poeira Estelar por captura; a aba FLY calcula Brasília com horário de verão regional. Exemplos: Kiritimati 01h–02h, Auckland 02h–03h, Sydney 04h–05h, Japão 06h–07h, Ibirapuera 18h–19h, Honolulu 23/10 01h–02h e Samoa Americana 23/10 02h–03h.
- No calendário Morelull, criar botão direto **“Ver rota mundial no FLY”**. Nunca orientar mudar manualmente o fuso do aparelho; coordenadas são referências urbanas, **não** ponto de spawn garantido. Não há GPX habilitado.
- Versionar JS/CSS e cache Android, preservar menu lateral ☰, arte premium existente, Pawniard, coordenadas dos outros eventos e desktop. Validar CI, merge, Pages e smartphone separadamente.


## 21/10/2026 — CONTRATO OBRIGATÓRIO FLY: regra permanente, não apenas Morelull
- O responsável alertou que foi **falha grave** deixar um Holofote fora da experiência visível no FLY. Essa premissa já existia e **não pode voltar a ocorrer**: todo evento global publicado de janela local conhecida de Holofote, Dia Comunitário, Hora de Reides, Dia de Reides, Segunda Max, Dia de Batalhas Max e categorias equivalentes deve estar **automaticamente** na aba FLY, com **roteiro cronológico**, pontos reais de referência, horários locais e Brasília convertidos por timezone IANA.
- A garantia não depende de cadastrar Pokémon individualmente no componente UI. O FLY possui descoberta **genérica de “ROTAS ATIVAS E PRÓXIMAS”**, que apresenta automaticamente os próximos eventos dentro de 7 dias, com botão para abrir a rota e os 28 pontos; o destaque do Morelull é complementar, não a única solução.
- Corrigidas 10 entradas já publicadas com horários oficiais/editoriais mas sem `Global`, incluindo Teddiursa/Noibat em novembro, Giratina/Cresselia/Darkrai/Deoxys, Staraptor e Segundas Max confirmadas. **Eventos sem horário exato ficam fora da rota temporariamente, sem inventar janelas.**
- Contrato QA que bloqueia regressões: `tests/fly-contract-global-events-20261021.test.cjs`. Ele percorre **TODOS os eventos publicados e globais elegíveis**, exige inscrição no FLY, 28 coordenadas urbanas, conversão temporal válida, ordem cronológica e prova de acesso nas telas, incluindo eventos futuros. Alterar a lista de eventos exige rodar esses testes, assim como Node geral/GitHub Actions.
- Pontos e coordenadas são referências de cidades/áreas públicas, nunca spawns, PokéStops ou pontos de reide garantidos. Não ativar GPX fictício ou alterar o fuso do celular. A diretriz é transversal e não deve ser tratada como exceção de Morelull.


## 22/10/2026 — Recuperar base geográfica original do FLY, SEM criar nova premissa
- O responsável REAFIRMOU a lista-base original do projeto `✨HORA DO HOLOFOTE 18H✨`, datada de 10/11/2023 e revisada em 06/11/2023, com **67 pontos geográficos** e a exigência expressa **`❌NÃO EDITE OU TIRE OS CRÉDITOS❌`**. Crédito de origem: **LendáriosBrasil**, **FlyGPS**, **PokemonTrail**; revisão de horários **👻 Fantasma 👻**. O aviso original completo, inclusive de plágio, foi preservado no arquivo de referência `spidey-app/data/world-event-points.json` na propriedade `source_list_2023.credits` e pode ser lido expandindo **“Créditos e origem da lista mundial”** no FLY.
- Esta regra **já existia desde o início** e aparece em `SPIDEY_APP_CONSTITUTION.md` no commit `e08cf8eb7c6fd5b6df87dcf1a467c286a0c5295f` de **01/10/2026**, bem como no guia `SPIDEYNEXUS_Continuidade_05-10-2026.md`: **horário local do destino + horário de Brasília, NUNCA horário de Portugal**. Localidades portuguesas podem permanecer na lista geográfica. **Não reutilizar horários de Brasília do material de novembro de 2023 em eventos de outubro de 2026.** Foram acrescentados 43 pontos novos e reaproveitados 24 coincidentes com a referência anterior, com uma duplicata quase idêntica do Parque Ibirapuera eliminada: **70 localidades únicas** no total. Preservados pontos adicionais existentes e os 67 fornecidos.
- Para **qualquer evento global elegível** publicado, o Spidey calcula **18h–19h no fuso local de cada ponto**, ou o intervalo local próprio do evento, convertendo dinamicamente para **America/Sao_Paulo** por IDs de fusos IANA. No Morelull de 22/10/2026, os horários de Roma, Londres, Jerusalém, Nova York e Chicago diferem dos horários históricos porque ainda há horário de verão.
- Premissa permanente antirregressão: `tests/fly-historical-list-dst-20261022.test.cjs` verifica todos os **67 pontos e créditos**, duplicatas, chaves timezone, hora local e conversão para Brasília e diferenças de horário de verão entre outubro e novembro. `tests/fly-core.test.cjs`, `tests/morelull-fly-route-20261021.test.cjs` e `tests/fly-contract-global-events-20261021.test.cjs` acompanham dinamicamente o total em vez de aceitar apenas 28.
- A correção é **restauração da base antiga incompleta**, não uma regra ou recurso inventado nesta data. O FLY deve exibir os **70 pontos** ao abrir o roteiro pelo calendário e manter botões de copiar coordenadas/mapa. Em celulares, atualizar scripts, CSS e Service Worker; manter menu ☰ sem barra inferior, identidade cósmica e artes Premium. **Coordenadas são referências históricas informadas pelo usuário, não garantias de spawns, Ginásios ou PokéStops**.


## 22/10/2026 — Proteção da continuidade entre chats, Work, Projeto, GitHub e Notion
**Fato auditado:** esses ambientes não possuem sincronização automática integral de decisões. O Notion serve como índice complementar; o histórico de conversa, documentos antigos, ações agendadas e relatórios de CI podem refletir momentos diferentes. Não prometer que todos os chats foram integralmente recuperados sem auditoria cruzada.

**Ordem permanente:** (1) decisão explícita mais recente do responsável; (2) este registro e AGENTS.md para regras duráveis; (3) estado técnico real de `main`, GitHub Actions, deployment, registros de artes e fontes; (4) guias históricos/Notion somente como evidência auxiliar. Havendo conflito, registrar qual regra foi substituída, nunca restaurar silenciosamente padrão antigo.

**Obrigação de atualização:** toda decisão duradoura dada em qualquer chat, Work ou Projeto deve ser promovida a ESTE arquivo por alteração rastreável no GitHub, contendo data, redação curta da regra, decisão anterior substituída (quando houver), origem verificável ou indicação “recuperado de conversa”, arquivos/testes impactados e nível real da entrega. Não copiar conversa privada, identificadores pessoais ou credenciais para o repositório público. Se a origem não puder ser confirmada, marcar para investigação em vez de inventar aprovação.

**Regressões comprovadas e protegidas em 22/10:** o antigo logo aranha ainda constava em instruções e no gerador Gold após o novo S cósmico ser aprovado em 19/10; correções mescladas em [PR #132](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/pull/132) e [PR #133](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/pull/133), com testes específicos. Esses exemplos mostram que texto novo sem atualização dos agentes/código não é proteção suficiente.

**Outras decisões explícitas resgatadas de conversas anteriores (não são afirmações de implantação atual):**
- 25/09: identificar recursos individualmente como **FUNCIONA / PARCIAL / QUEBRADO / NÃO IMPLEMENTADO**; não chamar de pronto porque existe arquivo, render ou PR; revisão rejeitada bloqueia publicação e não herda aprovação de versão/hash anterior.
- 30/09: o **aplicativo público** passou a ser o produto prioritário, não canal de distribuição separado; preservar uma única arte vigente por evento sem sobreposição, e manter as versões aprovadas no acervo.
- 13/10: solicitado relatório automático **a cada três horas** com **somente progresso real**, PRs, testes, bloqueios e lacunas, sem trabalho inventado. Esse registro **não atesta** que o agendamento está ativo; verificar agendamentos separadamente.
- 19–22/10: S cósmico aprovado, celular com menu lateral ☰ sem barra inferior, FLY global obrigatório, base original de 67 coordenadas/70 localidades únicas, créditos preservados e janelas IANA — todos exigem código + testes, não só anotação no Notion.
- Prioridades vigentes: push **recebido fisicamente** no Android, Caçador com feed **autorizado**, artes Premium pendentes, FLY e integridade do aplicativo; Amigos/Chat não têm prioridade de execução.

**Agentes automáticos antigos:** antes de qualquer tarefa devem ler a `main` e os dois documentos canônicos atuais; nenhuma automação antiga tem poder de restaurar identidade histórica, afirmar push recebido, gerar GPX inexato, liberar artes rejeitadas ou publicar dados não autorizados. Relatório de saúde técnico ≠ validação do Samsung.

**Limite honesto:** o acervo de decisões aqui é rastreável, mas não comprovadamente exaustivo sobre todos os chats/Work. Continuar comparação retroativa de lacunas sem sobrescrever o histórico anterior.
