# Spidey Caçador — ativação de fornecedor autorizado (20/10/2026)

## Estado e limite real
A guia Filtro já foi publicada. Nenhum terceiro forneceu ainda autorização para republicar coordenadas. Assim, a lista de aparições reais permanece vazia até haver contrato explícito, fonte verificada e credenciais legais. Não utilizar capturas privadas de Discord, scraping de mapas ou coordenadas históricas como feeds atuais.

## Primeira tentativa comercial
Contato de parceria enviado em 20/10/2026 a contact@pogoalerts.net usando o Gmail conectado, sem compromisso financeiro. Documentação: https://www.pogoalerts.net/help/faq-technical confirma ausência de API pública; https://www.pogoalerts.net/help/webhook-setup detalha webhooks de Discord. Um plano pago de alertas não equivale a uma licença de republicação.

## Outras fontes
SPS PoGoMapper: https://spsmapping.eu/, https://map-s.spsmapping.eu/ e https://discord.gg/DrPKEqa9Ms. Possui mapas e alertas Shundo por conta, mas nenhuma licença de feed/API foi encontrada. Pokémon GO Coordinates: https://pokemongocoordinates.com/ — acesso ao mapa não concede automaticamente direito de disponibilizar os dados no Spidey.

## Ativação técnica, condicionada a autorização escrita
O importador protegido está em scripts/hunter-provider-import.mjs; a automação GitHub em .github/workflows/spidey-hunter-provider.yml.
Configurar variáveis de repositório HUNTER_FEED_LICENSE_APPROVED=true e HUNTER_PROVIDER_NAME (atribuição) apenas depois da licença. Guardar URL de feed HTTPS no segredo HUNTER_PROVIDER_FEED_URL e eventual token no segredo HUNTER_PROVIDER_BEARER_TOKEN. Nenhum dado privado ou segredo deve entrar nos arquivos públicos.
O agendamento tenta buscar a cada 10 minutos, valida formato, IV/PC, coordenadas e prazos, remove dados de jogadores, deduplica e atualiza somente spidey-app/data/hunter-feed.json. O Pages recompila depois de workflow bem-sucedido. Latência real depende do GitHub Actions e do fornecedor: não prometer atualizações de segundos.
Contrato JSON: spidey-hunter-feed-v1, source_status connected, generated_at UTC e items com pokemon, iv_percent, coordinates, reported_at, expires_at, cp, level, gender, pvp_rank, shiny_eligible. A importação não publica confirmação de brilhante para uma conta específica. O fornecedor deve possuir mecanismo de consentimento separado caso venha a oferecer essa opção.

## Aceite
(1) autorização comprovada; (2) mínimo de uma captura real válida no feed; (3) verificação de 24h sem expirados ou registros fabricados; (4) testes mobile, sem regressão de FLY/Push/PvP; (5) clareza pública sobre tipo de Shiny e cobertura geográfica.
