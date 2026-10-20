# Filtro — estrutura para aparições autorizadas

**Objetivo do produto:** o jogador abre a guia Filtro e vê cartões com Pokémon e botão **Copiar coordenadas**, sem colar textos.

A interface consome `spidey-app/data/hunter-feed.json`. O arquivo atual está deliberadamente **vazio** e declara `awaiting_authorization`: nenhum fornecedor entregou autorização para leitura e redistribuição de coordenadas. Não inventar aparições nem publicar um post histórico do Shieldon como se estivesse ativo.

## Contrato (v1)
```json
{
  "schema": "spidey-hunter-feed-v1",
  "source_status": "connected",
  "generated_at": "2026-10-13T22:30:00Z",
  "items": [
    {
      "pokemon": "Shieldon", "iv_percent": 100,
      "cp": 827, "level": 35, "gender": "Macho",
      "coordinates": "50.105208,8.7271780",
      "reported_at": "2026-10-13T22:29:00Z",
      "expires_at": "2026-10-13T22:40:00Z",
      "source": "Fornecedor autorizado", "pvp_rank": null,
      "shiny_eligible": false
    }
  ]
}
```

Esse exemplo é **somente documentação**, jamais inserido no arquivo público. A fonte deve fornecer `reported_at` e `expires_at` comprováveis. Ausência ou expiração => não exibir. O frontend recusa arquivo desatualizado (30 minutos), coordenadas inválidas, anúncios expirados e duplicatas. Consultas são de leitura e ficam no navegador, atualizadas a cada 60 s enquanto Filtro está aberto.

### Fontes e permissões
- O canal de Telegram indicado pelo usuário ainda **não** fornece Bot API autorizada ao Spidey. Para captar automaticamente suas mensagens é preciso ser admitido pelo responsável do canal com as permissões necessárias, ou receber uma API/feed com permissão de republicação. Nenhuma chave deve ser enviada por chat ou publicada no GitHub.
- Pokedex100/Discord idem: o acesso humano do usuário a um servidor não equivale ao acesso de leitura e republicação de um bot.
- O site de busca PoGoCoordinates não deve ser extraído automaticamente contra seus termos; manter links externos como alternativa.
- A primeira integração deve ser isolada do Web Push existente; não quebrar alertas já funcionando. Usar somente infraestrutura gratuita depois de validação.
- Não coletar códigos de treinador ou perfis de jogadores. Shiny, Shundo e Shnundo **não são garantidos**. Indicar apenas elegibilidade reportada pela fonte.

### Gate para ativar um feed
1. Identificar fornecedor e canal específicos e obter permissão.
2. Criar coletor com acesso autorizado, credenciais secretas e limites de taxa.
3. Validar formato, timestamps reais, deduplicação, expiração e atribuição da fonte.
4. Publicar automaticamente JSON de leitura sem dados pessoais.
5. Confirmar atualização sem intervenção no Android, em produção.


## Fontes pesquisadas em 20/10/2026
- SPS PoGoMapper (map-s.spsmapping.eu): mapas e sistema Shundo pessoal via Discord; documentação pública de API e licença de redistribuição não localizadas.
- PoGO Alerts Network: [FAQ técnico](https://www.pogoalerts.net/help/faq-technical) declara **não oferecer API pública para terceiros**. [Community Webhook](https://www.pogoalerts.net/help/webhook-setup) é um serviço pago destinado à publicação em canais Discord, não uma licença presumida para republicar JSON no Spidey; negociar separadamente.
- Fontes abertas existentes de mapeamento como `pokelyzer` oferecem software e contratos de webhook, mas NÃO fornecem automaticamente dados atuais nem licença de um fornecedor de scans.
- Requisito de licença + teste real de timestamps/IV/lat/lng + segurança/privacidade permanece obrigatório antes de marcar como conectado.
