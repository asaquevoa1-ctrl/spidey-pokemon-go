# Spidey — recuperação gratuita em GitHub Pages

## Publicado e acessível em 08/10/2026

Endereço público verificado sem login: https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/ . Pages já foi ativado pelo editor. A execução [37781681069](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/actions/runs/37781681069) publicou o main `1d8adba72cd3e206e97f651f5594651d8076abba` às 10:06 BRT, após a primeira recuperação das 09:15 BRT. Calendário, Semana, FLY, Selos, PvP, três novas artes do GO Wild Area e um novo download GPX completo foram conferidos no navegador. Evidências e limites em [docs/qa/PAGES_RECOVERY_20261008.json](docs/qa/PAGES_RECOVERY_20261008.json).

`spidey-app-health.yml` acompanha esse link com `--hosting github-pages`. A indisponibilidade declarada de push é uma limitação do pacote, e arquivos ausentes, semana atrasada ou arte divergente continuam sendo falhas. O resultado real de cada execução fica no artefato `app-health.json`. O cron mantém a frequência existente; atrasos do GitHub Actions não são garantia de pontualidade. Auditoria completa: `--all-images` ou entrada manual `all_images`; ciclos usuais usam amostragem leve.

As instruções de ativação abaixo explicam o procedimento realizado. Não é necessário habilitar Pages novamente. A origem Vercel permanece pausada; nenhum upgrade pago foi contratado.

Preparado em 08/10/2026 a partir do main `5f84f37f1f75e8afa13eaee7d5c9c9fdd8ba0f17`. A Vercel continua pausada por cotas excedidas; a alternativa não contrata plano, remove versões nem altera a conta Vercel.

## Publicação

O workflow `spidey-pages.yml` valida e empacota somente `spidey-app`, sem APIs de servidor, filas ou dados de usuários. GitHub Pages é gratuito para este repositório público. Limites oficiais: site até 1GB e banda com limite flexível de 100GB/mês; não é hospedagem ilimitada. https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Ativação administrativa: Settings → Pages → Build and deployment → Source → GitHub Actions. O conector disponível não configura Pages. A ação oficial de configuração exige token administrativo diferente do GITHUB_TOKEN para ativar um serviço ainda desabilitado; nenhum token adicional é solicitado ou copiado. Depois de ativar, executar `Spidey - hospedagem gratuita` ou repetir a execução que aguardou configuração. Somente uma implantação concluída e um teste público permitem declarar recuperação.

O app fica em `/spidey-pokemon-go/spidey-app/` no domínio Pages da conta; o endereço Vercel pertence à Vercel e não pode ser transferido para GitHub Pages. O URL final deve ser obtido do resultado do deploy antes de divulgar. PWA e progresso local pertencem ao novo endereço; migração automática do armazenamento do endereço anterior não é alegada.

## Comportamento

Calendário, Semana, FLY, Novidades, catálogos, PvP e artes usam os mesmos arquivos públicos do main. As artes aprovadas são verificadas pelo SHA256. A cópia publicada carrega catálogos JSON diretamente; mudanças em main publicam por push, conclusão do Weekly e conferência horária para commits de bots. Catálogos não publicados não aparecem antes da publicação.

GPX completo usa o Blob já implementado no cliente, mantendo a exigência de todos os pontos confirmados. PokéLids incompletos continuam sem GPX integral. O app exibe alertas indisponíveis: a hospedagem estática não fornece armazenamento de assinaturas nem envio de push. Amigos/chat e teste físico Android/PWA não são certificados. Não ler ou transferir perfis, mensagens ou assinaturas para esta recuperação.

O service worker publicado mantém caminhos relativos, compatíveis com o subdiretório do projeto. Somente referências a candidatas de arte em revisão são removidas da lista de pré-cache, pois esses arquivos não são publicados; todos os demais itens devem existir ou o empacotamento falha. Isso evita falha de instalação por arquivo ausente, sem certificar uso offline no aparelho.

GitHub Pages não permite personalizar todos os cabeçalhos HTTP da Vercel. A cópia recebe política de conteúdo em meta com conexões somente ao próprio domínio e referrer-policy no-referrer; isso não equivale aos cabeçalhos de permissões e de enquadramento do servidor anterior.

GitHub registra IPs de acesso para segurança na infraestrutura; o app não adiciona telemetria ou coleta de visitantes. https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

