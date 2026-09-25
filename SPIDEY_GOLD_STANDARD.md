# SPIDEY GOLD STANDARD — padrão visual oficial

Este documento registra a decisão editorial soberana do projeto Spidey Pokémon GO.

## Regra principal

Uma arte não é considerada pronta apenas porque existe um arquivo de imagem. Para entrar no canal de aprovação, precisa cumprir o Gold Standard visual do Spidey.

## Identidade obrigatória

- formato vertical e mobile-first;
- arte cinematográfica/gamer/editorial de alto impacto;
- Pokémon/evento integrado a um cenário completo, nunca uma screenshot ou mídia-fonte colocada dentro de uma moldura;
- composição rica, com profundidade, iluminação e acabamento de campanha premium;
- identidade de apoio em azul neon e dourado, sem impedir a paleta temática do evento;
- headline grande, forte e legível;
- informações factuais em blocos integrados à composição quando houver dados confirmados;
- cabeçalho editorial SPIDEY / POKÉMON GO / NOTÍCIAS • EVENTOS • COMUNIDADE;
- slogan SEMPRE UM PASSO À FRENTE quando aplicável;
- logotipo circular oficial Spidey Pokémon GO, usando o arquivo real `assets/spidey-logo-oficial.jpg`, aplicado pelo sistema e não recriado por IA;
- fonte editorial no rodapé;
- texto em PT-BR, preservando nomes oficiais, Pokémon e marcas quando necessário.

## Proibido

- card simples;
- card dentro de card;
- screenshot emoldurada;
- mídia oficial apenas encaixada em uma caixa com texto abaixo;
- template genérico;
- aparência de dashboard corporativo;
- estética de caixa de remédio;
- branding Spidey inventado pela IA;
- dados, datas, horários, bônus, shiny, recompensas ou locais inventados;
- publicação/entrada na aprovação se a etapa Gold falhar.

## Referência editorial aprovada pelo usuário

O padrão visual é o conjunto de referências fornecido pelo editor em 25/09/2026: City Safari, Autumn Picnic, Ultra Beasts, Pokémon GO × adidas, Hora do Holofote, alerta de coordenadas e a arte piloto do Sandile gerada no chat. Não copiar uma peça específica; reproduzir o mesmo nível de acabamento, impacto, hierarquia, integração de cenário e identidade Spidey.

A arte piloto do Sandile foi explicitamente aceita pelo editor como exemplo correto do padrão.

## Regra fail-closed

O fluxo automático só pode enviar uma arte ao Discord de aprovação quando o JSON corrente comprovar:

- `art_standard_version = spidey-premium-v1`;
- `gold_standard_visual = true`;
- `art_ready_for_review = true`;
- `art_generator_version = spidey-gold-openai-v1`;
- `visual_reference_set = spidey-gold-standard-2026-09-25`;
- `brand_logo_overlay = true`;
- arte persistida em `assets/generated`;
- mídia factual e fonte verificadas.

Se a geração Gold falhar, o item deve ficar em `awaiting_gold_art` e nunca seguir com a arte simplificada anterior.

## Motor

Arquivo: `scripts/gold_art_upgrade.py`

O motor usa a mídia factual como referência, reconstrói uma nova peça promocional completa via geração de imagem e aplica o logotipo oficial do repositório em pós-processamento.

O renderer PIL antigo pode preparar material/fonte, mas não é mais suficiente para liberar uma arte à aprovação.

## Estado em 25/09/2026

A proteção Gold já foi colocada no `scripts/spidey_art_guard.py` e no workflow `spidey-auto-curate.yml`.

No caso piloto Sandile, a tentativa automática entrou em fail-closed porque o GitHub Actions não encontrou o secret `OPENAI_API_KEY`. Enquanto esse secret não existir, o item permanece `awaiting_gold_art` e nenhuma arte antiga pode ser publicada.
