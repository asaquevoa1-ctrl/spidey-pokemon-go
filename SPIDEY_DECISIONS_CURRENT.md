# SPIDEY — DECISÕES ATUAIS E REGRAS DE CONTINUIDADE

**Atualizado em 18/10/2026.** Fonte de referência operacional para qualquer agente, chat, Work, CI ou colaboração neste repositório.

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
