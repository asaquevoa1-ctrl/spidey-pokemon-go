# Serviço gratuito de alertas — Spidey

**Somente Web Push.** Este serviço **não implementa Amigos, Chat, perfis, identificadores de treinador ou localização**.

O aplicativo público continua hospedado no GitHub Pages:
https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/

A base é o componente de notificações da PR #32, isolado nesta branch para não ativar a parte social.

## Implantação no Cloudflare Workers Free

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/tree/feat/push-only-free-20261013/services/spidey-backend)

**Na primeira implantação pelo celular:** abra o botão, autorize a conexão GitHub/Cloudflare e confira que o plano continua Workers Free. O sistema copiará somente esta pasta para um novo projeto e criará o Worker. Ao concluir, mantenha o nome e envie **apenas a URL pública `*.workers.dev`**, nunca senha, token nem capturas contendo chaves. O servidor não envia notificações antes de `DISPATCH_ENABLED=true`.

1. Entre em sua própria conta Cloudflare gratuita. O titular precisará autorizar a primeira implantação.
2. Publique **a pasta `services/spidey-backend` desta branch** no Workers, com configuração do arquivo `wrangler.jsonc`. Com um ambiente de desenvolvimento autenticado, é possível usar `npm ci && npx wrangler deploy` dentro dessa pasta. Não compartilhar senha/token no chat ou repositório.
3. O servidor começa com **`DISPATCH_ENABLED=false`** e não envia alertas.
4. No painel do Worker, depois de validar implantação gratuita, habilite `DISPATCH_ENABLED=true` nas variáveis de produção. Aguarde cron e confirme que `https://<seu-worker>.workers.dev/health` apresenta `push.available=true` e `scheduler.status=ok` com data recente.
5. Só depois, conectar a URL pública do Worker no repositório do Spidey com `python scripts/configure_spidey_push.py --url https://<seu-worker>.workers.dev`. **Não registrar dados privados.**
6. Publicar o app pelo GitHub Pages após a aprovação e comprovar no Android: ativar → testar recebimento real → notificação agendada → abertura do evento → desativar.

A Cloudflare pode modificar cotas ou exigir verificação adicional. **Não habilitar faturamento nem plano pago.** Workers Free + Durable Objects SQLite estão sujeitos a limites; não garantir entrega em tempo exato ou volume ilimitado.

## Privacidade
O servidor guarda assinaturas técnicas de Web Push em SQLite privado, com expiração/revogação; não publica endpoints, chaves privadas ou destinos de envio. VAPID é gerado dentro do armazenamento privado. Origin dos POSTs é restrita ao endereço do app. O serviço de push do navegador também recebe metadados técnicos necessários ao envio.

`GET /health` retorna apenas disponibilidade e data/status do agendamento, sem dados pessoais.
`GET /api/push/public-key` retorna só a chave pública quando ativado.
`POST /api/push/subscribe` registra assinatura consentida.
`POST /api/push/test` envia teste limitado por frequência.
`POST /api/push/unsubscribe` revoga assinatura.
`/dispatch` não tem endpoint público, apenas cron do Cloudflare e alarmes internos.

Os testes usam destinos e assinaturas fictícios. Um HTTP 2xx do serviço de push **não comprova recebimento no Samsung**.
