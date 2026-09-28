# Spidey Push v1

Status: infraestrutura pronta no código, envio remoto fica fail-closed até os segredos e o armazenamento privado serem configurados no Vercel.

## Objetivo

Fluxo:

`notifications/queue.json → dispatcher seguro → Web Push → service worker → deep link do evento`

Ao tocar na notificação, o app abre diretamente o evento usando `?event=<id>` ou o Stamp Rally usando `?stamp=<id>`.

## Segurança

As assinaturas Web Push NÃO devem ser salvas no repositório público. O endpoint do navegador e suas chaves são armazenados apenas em Redis privado via API do Vercel.

O dispatcher também é fail-closed: sem `CRON_SECRET`, VAPID e Redis, ele responde 503/401 e não envia nada.

## Variáveis privadas necessárias no Vercel

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (ex.: `mailto:contato@dominio.com`)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`

Opcional:

- `SPIDEY_NOTIFICATION_QUEUE_URL` para substituir a URL padrão do `notifications/queue.json` público.

Nenhum desses valores deve ser commitado no GitHub.

## Rotas

- `GET /api/push/public-key` → expõe somente a chave VAPID pública.
- `POST /api/push/subscribe` → grava/atualiza a assinatura de um aparelho.
- `POST /api/push/unsubscribe` → remove a assinatura.
- `GET|POST /api/push/dispatch` → envia avisos vencendo na janela atual; exige `Authorization: Bearer <CRON_SECRET>`.

## Idempotência

Cada job enviado ganha uma marca privada `spidey:push:sent:<job_id>` com TTL de 30 dias. Isso evita envio duplicado quando o dispatcher rodar novamente.

Assinaturas 404/410 são removidas automaticamente.

## Estado do front-end

`push.js`:

- abre deep links de evento/Stamp;
- registra a assinatura quando o usuário toca em **Ativar notificações**;
- preserva a permissão local caso o backend ainda não esteja configurado;
- nunca envia chaves privadas ao navegador.

`sw.js`:

- recebe payload Web Push;
- mostra a notificação;
- abre/foca o Spidey no evento correto;
- renova assinatura em `pushsubscriptionchange` quando possível.

## Próximo passo operacional

Configurar uma única vez as variáveis privadas e um Redis compatível com Upstash no projeto Vercel. Depois habilitar um acionador autenticado para `/api/push/dispatch` e validar em aparelho real.
