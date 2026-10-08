# Spidey — estatísticas gratuitas de acesso

## Estado de 08/10/2026

Anderson autorizou a configuração gratuita após perguntar como acompanhar o uso do link público e forneceu o trecho oficial de instalação em 08/10/2026 às 12:59 BRT. O identificador público do site está confirmado e a configuração está habilitada. Publicação e recebimento no painel ainda precisam de prova; não existe contagem anterior recuperada. O responsável concluiu o cadastro do site na própria conta Cloudflare. O agente não criou conta nem acessou credenciais; a falha de verificação anteriormente observada no login deste navegador não impede a publicação do trecho público fornecido.

A configuração versionada está `enabled: true`, com o identificador público extraído de `data-cf-beacon`. O pacote Pages habilita o carregador oficial e o aviso de privacidade correspondente. Habilitação versionada não equivale a métricas recebidas no painel.

O endereço continua https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/ . A hospedagem permanece GitHub Pages; não é necessário migrar o app, alterar DNS, contratar plano ou mudar de link.

## Ativação pela conta do responsável

1. Na conta gratuita Cloudflare, abrir **Web Analytics → Add a site**.
2. Usar o hostname `asaquevoa1-ctrl.github.io`, sem `https://` e sem o caminho do app.
3. Em **Manage site**, obter o trecho JavaScript público fornecido pelo Web Analytics.
4. Copiar apenas o identificador público de 32 caracteres hexadecimais presente em `data-cf-beacon` no campo `token`. Não é um API token de acesso à conta. Nunca solicitar senha, código de autenticação, API key ou credencial no chat/repositório.
5. Em `config/spidey-web-analytics.json`, definir `enabled: true` e preencher `site_token` com esse identificador confirmado. Hostname permanece igual.
6. Validar a branch, publicar e conferir o site e o recebimento no painel antes de declarar a medição ativa. A alteração deste arquivo dispara `spidey-pages.yml`.

Sem identificador confirmado não há ativação. Não substituir o identificador por exemplo de teste nem registrar falsa contagem zero.

## Limites de dados e medição

O carregador atua somente no hostname e caminho públicos do Spidey. Prévias, localhost e outros projetos ficam excluídos. Preferências Do Not Track e Global Privacy Control impedem o carregamento. O app não lê nem envia armazenamento local, times, progresso, buscas, coordenadas copiadas, perfis, contatos, assinaturas ou mensagens para esta medição. A medição automática de navegação interna SPA fica desativada com a opção oficial `spa: false`; não há eventos personalizados nem identificador persistente criado pelo Spidey.

O serviço mede visitas, visualizações e desempenho. Uma mesma pessoa pode produzir várias visitas; não equivale a pessoas únicas, usuários simultâneos ou instalações. Bloqueadores, preferência de privacidade, uso offline e perda de rede podem reduzir a amostra. A medição começa depois da ativação e não recompõe o histórico anterior.

A Cloudflare declara que o Web Analytics é gratuito e não coleta ou usa dados pessoais dos visitantes. O aviso do app identifica o serviço quando ativado. Isso não elimina o tratamento de dados técnicos pela infraestrutura de hospedagem e conexão.

O pacote ativo libera exclusivamente o script oficial `https://static.cloudflareinsights.com/beacon.min.js` e a conexão de estatísticas `https://cloudflareinsights.com`. A política de referência continua `no-referrer`. A compatibilidade real do recebimento com essa política deve ser conferida no painel; não ampliar a política de referência apenas para presumir sucesso.

O monitor confere configuração, política e disponibilidade do carregador público. Ele não executa JavaScript, não envia beacons e não lê estatísticas de usuários ou dados da conta Cloudflare. `web_analytics_configured: true` significa configuração publicada, não comprovação de recebimento ou quantidade de pessoas.

Push e Amigos/chat continuam indisponíveis nesta hospedagem. Testes de código ou publicação não certificam instalação Android, PWA/offline, recebimento de alertas ou funcionamento da medição em aparelho físico.

## Verificação

`python -m unittest scripts.test_spidey_pages scripts.test_app_health -v`

`node --test tests/web-analytics.test.cjs`

O empacotamento valida todos os originais aprovados e preserva catálogos, imagens e GPX. Os testes adicionais cobrem configuração ausente/inválida, destino inesperado, aviso de privacidade, política restrita, preferências de privacidade, exclusão de prévios e acesso indevido a estado pessoal. Nenhum teste envia medições reais.

Na preparação, 17 testes Python e quatro testes Node passaram, com builds desativado e ativado usando identificador fictício somente local. Registro histórico: [docs/qa/WEB_ANALYTICS_PREPARATION_20261008.json](docs/qa/WEB_ANALYTICS_PREPARATION_20261008.json). A ativação usa o identificador público fornecido por Anderson e a semana do main atual; provas de publicação e limites são registradas separadamente em [docs/qa/WEB_ANALYTICS_ACTIVATION_20261008.json](docs/qa/WEB_ANALYTICS_ACTIVATION_20261008.json).

## Referências oficiais consultadas em 08/10/2026

- Gratuidade e política de dados: https://developers.cloudflare.com/web-analytics/about/
- Instalação em sites externos à Cloudflare: https://developers.cloudflare.com/web-analytics/get-started/
- Desativação de medição SPA: https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/
- Origem e destino do beacon: https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
- Definição de visitas e visualizações: https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/
- Limites, amostragem e compatibilidade CSP/referência: https://developers.cloudflare.com/web-analytics/faq/
