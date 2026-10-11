# Spidey — alertas e Amigos/chat no serviço adicional

Estado de 11/10/2026: candidato implementado na branch `feat/free-backend-20261011`. Não é uma migração do endereço do app. O aplicativo permanece em https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/ .

O novo serviço está em [`services/spidey-backend`](services/spidey-backend/README.md), isolado para implantação pelo botão oficial da Cloudflare no plano Workers Free. Usa SQLite privado, cron nativo e alarmes para continuar lotes de push. VAPID é gerado dentro do servidor; nenhum segredo precisa ser colado no GitHub. Amigos/chat foi recuperado da branch anterior e adaptado ao runtime novo, com ações assinadas, consentimento, aceite e mensagens cifradas entre perfis.

## O que foi implementado

- `config/spidey-backend.json` mantém a conexão **desativada** até existir endereço permanente verificado. O build gera configuração pública e política de conexão para a origem exata.
- Push passa a usar o servidor configurado; ativação continua opcional. Os registros anteriores não são migrados e não foram consultados. O novo botão de teste confirma aceite pelo serviço de entrega, sem dizer que um celular recebeu.
- Amigos só aparece quando o serviço estiver configurado. A criação do perfil verifica disponibilidade antes de mostrar o formulário. A chave privada é persistida no IndexedDB do navegador; limpar o navegador perde acesso.
- Respostas privadas não entram no cache offline. Apagar o perfil também invalida as conversas guardadas no histórico de modais desta sessão.
- O monitor `github-pages` pode conferir saúde pública e agendamento do backend, com atraso máximo de 45 minutos, sem ler dados pessoais. O workflow de alertas deixa de disparar no host anterior e passa a verificar disponibilidade pública quando ativado; enquanto não ativado, registra esse estado sem alegar entrega.

Os catálogos, 137 eventos, três ligas PvP, quatro coleções de Selos e 35 entradas de artes aprovadas/34 originais permanecem intactos. Não foram geradas ou substituídas artes, coordenadas ou agendas.

## Provas e limites

101 testes Node do app, oito testes do servidor/runtime/SQLite e 19 testes Python de pacote e saúde passaram, além da compilação Wrangler sem publicação. A continuação nativa do lote confirmou 24 + 6 destinos fictícios, sem duplicações. Registro: [`FREE_BACKEND_20261011.json`](docs/qa/FREE_BACKEND_20261011.json).

Os testes locais abrangem HTTP no runtime Workers, SQLite, atomicidade das alterações, autenticação, repetição de ações, convites, acesso às conversas, bloqueio, remoção, criptografia de push, recibos e expiração de assinaturas. Os destinos de push são interceptados por um serviço fictício; não há envio real.

A prévia local Chromium usa dois perfis fictícios em contextos separados. Cadastro com consentimento, convite, aceite, mensagem nos dois sentidos, persistência da identidade após recarregar, bloqueio e exclusão passaram. Mobile390 claro/escuro e desktop1280 foram conferidos sem overflow e sem erros JavaScript. As capturas mostram dados fictícios de QA. Registro: [`FREE_BACKEND_BROWSER_20261011.json`](docs/qa/FREE_BACKEND_BROWSER_20261011.json).

Este registro não certifica Android físico, instalação PWA, atualização/offline no aparelho ou recebimento de notificações. Não houve implantação permanente do Worker porque não há acesso de publicação à conta Cloudflare nesta sessão. O código permanece candidato, sem declarar Amigos ou push disponíveis na produção. A publicação em main depende da revisão da prévia prevista no projeto; ativar a configuração também exige comprovar a primeira execução saudável do servidor.

## Continuidade

1. Revisar a prévia e concluir o PR do candidato.
2. Anderson publica o serviço na própria conta Workers Free pelo [botão e instruções](services/spidey-backend/README.md#ativação-na-conta-de-anderson) e ativa `DISPATCH_ENABLED`.
3. Conferir `/health`, origem permitida, disponibilidade e primeira execução normal do cron; conectar somente o endereço permanente pelo script `configure_spidey_backend.py` e publicar Pages.
4. No Android, **Ativar alertas → Testar alerta**, registrar recebimento real, conferir um evento agendado e a desativação. Essa etapa só é realizada no aparelho com participação de Anderson.
