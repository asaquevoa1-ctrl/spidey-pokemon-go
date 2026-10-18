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
