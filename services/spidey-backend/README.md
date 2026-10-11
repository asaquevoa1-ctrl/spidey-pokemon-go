# Spidey — serviço adicional gratuito

Este serviço fornece alertas Web Push e Amigos/chat. O aplicativo continua no endereço https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/ . Esta pasta é independente e pode ser importada pelo botão oficial da Cloudflare.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/tree/feat/free-backend-20261011/services/spidey-backend)

## Ativação na conta de Anderson

1. Abra o botão, entre na sua conta Cloudflare e mantenha o plano **Workers Free**. O projeto usa dois Durable Objects com SQLite, disponíveis nesse plano. Não é necessário comprar domínio, banco, Redis ou plano pago.
2. Publique o Worker mantendo `APP_URL` e `QUEUE_URL`. O botão cria os recursos vinculados; esta primeira publicação mantém `DISPATCH_ENABLED=false`.
3. No Worker, em **Settings → Variables and Secrets**, altere `DISPATCH_ENABLED` para o texto `true` e publique a configuração. Alternativamente, em um terminal autenticado, execute `npx wrangler deploy --var DISPATCH_ENABLED:true` nesta pasta.
4. Aguarde a primeira execução do cron. Abra `https://SEU-WORKER.SEUA-CONTA.workers.dev/health`: `push.available` precisa ser `true`, o agendamento precisa mostrar `status: ok` e uma data recente. Copie apenas esse endereço público para a continuidade do projeto. Não compartilhe senha, token ou chave privada.
5. Depois da revisão da prévia e da publicação do código do app, conecte esse endereço permanente com `python scripts/configure_spidey_backend.py --url https://SEU-WORKER.SEUA-CONTA.workers.dev`, no repositório original. O comando recusa ativar antes de conferir a saúde pública. O próximo build Pages passa a permitir somente essa origem nas conexões.

As chaves VAPID são geradas no próprio armazenamento privado na primeira utilização. Não entram no GitHub nem nas respostas públicas. Manter o nome do Worker e os namespaces nas atualizações preserva os cadastros; recriar esses recursos cria um serviço vazio com outras chaves.

## Operação e privacidade

O cron nativo consulta a fila pública de eventos a cada cinco minutos. Lotes de até 24 assinaturas por evento, dois eventos por execução e seis conexões simultâneas respeitam os limites do runtime. Alarmes privados retomam lotes restantes após 20 segundos; falhas de rede usam uma nova tentativa após cinco minutos. Recibos guardam confirmações por assinatura, removem destinos HTTP404/410 e evitam repetir confirmações já recebidas. Uma interrupção entre a entrega e o registro pode gerar repetição: não há promessa de entrega exatamente uma vez ou de pontualidade garantida.

Não existe endpoint público de disparo. Cadastro, teste e desativação exigem a origem do app; teste/desativação exigem as chaves da assinatura. Destinos são restritos aos serviços conhecidos dos navegadores, com HTTPS e sem seguir redirecionamentos. O teste informa aceite pelo serviço de push, sem afirmar recebimento físico.

Amigos exige perfil opcional e consentimento, assinatura ECDSA das ações e aceite do convite pelo destinatário. O código de Treinador aparece somente após o aceite. A chave privada permanece no navegador; o servidor guarda mensagens cifradas. Bloquear impede leitura e envio nos dois sentidos. Não há recuperação por e-mail nem moderação em tempo real. A denúncia registra identificadores, motivo e data, sem texto da conversa.

Perfil: vence em 30 dias e pode ser renovado por mais 30; perfis vencidos são removidos após 30 dias adicionais. Conversa: últimas 60 mensagens dos últimos 30 dias. Denúncias: 30 dias. Apagar remove perfil e conversas; a chave pública e um identificador técnico ficam no máximo 30 dias para impedir reaproveitamento imediato da identidade. Assinaturas de alertas: removidas ao desativar, ao vencer no serviço de entrega ou após 90 dias sem renovação ao abrir o app. Recibos de entrega: sete dias. A limpeza de conversas ocorre na leitura e a limpeza geral ocorre a cada hora.

O serviço não grava e-mail, GPS, contatos, idioma ou fuso do aparelho, nem associa alertas ao perfil social. A Cloudflare e os serviços de push recebem dados técnicos de conexão. Respostas são `no-store`; o Service Worker do app ignora APIs e origens externas. Logs de observabilidade do projeto estão desativados.

## Limites e verificação

Há limites iniciais de 100 novos perfis por dia, 500 perfis no diretório, 50 conexões por perfil, 6.000 ações sociais por dia no serviço, 20 mutações por minuto por perfil, 15 mensagens por minuto e 500 assinaturas de alerta. A API de cadastro/teste/remoção de push aceita no máximo 5.000 operações por dia. Estes limites reduzem o consumo, mas não substituem as cotas totais da conta Cloudflare ou a validação de carga. Atingir cotas do plano Free interrompe operações; este projeto não habilita cobrança ou upgrade automático.

Os testes usam apenas identidades, assinaturas e destinos fictícios. Nenhum teste lê dados de jogadores ou envia notificações reais.

```sh
npm ci
npm test
npm run check
```

`/health`, `/api/social` (GET) e `/api/push/public-key` (GET) são as únicas consultas usadas pelo monitor. Elas retornam disponibilidade e a última execução do cron, sem catálogos de usuários, assinaturas ou mensagens.

Fontes da plataforma conferidas em 11/10/2026: [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/), [Durable Objects Free/SQLite](https://developers.cloudflare.com/durable-objects/platform/pricing/), [limites do runtime e do armazenamento](https://developers.cloudflare.com/durable-objects/platform/limits/), [botão de implantação](https://developers.cloudflare.com/workers/platform/deploy-buttons/) e [alarmes](https://developers.cloudflare.com/durable-objects/api/alarms/).
