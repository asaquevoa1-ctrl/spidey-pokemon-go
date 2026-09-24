# Padrão Oficial de Arte — Spidey Pokémon GO

Versão: `spidey-premium-v1`

Este documento é regra obrigatória do projeto. Uma publicação só pode chegar ao canal `aguardando-aprovação` quando a arte e o conteúdo obedecerem a este padrão.

## 1. Padrão visual obrigatório

- Referência de excelência: artes premium já aprovadas do Spidey (City Safari, Hora do Holofote, Ultra Beasts, MLB e demais peças aprovadas).
- Visual de campanha de game: cinematográfico, vibrante, premium, com profundidade, hierarquia clara e identidade própria.
- Identidade Spidey visível e coerente, sem dominar a informação principal.
- Texto legível no celular, com poucas mensagens principais e boa hierarquia.
- Não aceitar: card genérico, montagem simples sobre imagem de fonte, aparência de embalagem farmacêutica/caixa de remédio, mockup genérico, excesso de caixas, visual corporativo sem identidade, arte escura/preta, arquivo truncado ou baixa resolução.
- A imagem da fonte pode servir como referência factual, mas não é automaticamente a arte final.

## 2. Regra de fidelidade factual

Prioridade de fontes:
1. Pokémon GO oficial / página oficial do evento.
2. Parceiro oficial do evento.
3. G47IX, PokeMiners e SPS para descoberta e complementação.
4. Fontes secundárias apenas para corroborar, nunca para transformar alegação duvidosa em fato oficial.

Nenhum bônus, shiny boost, item, data, horário, coordenada, personagem, roupa ou recompensa deve aparecer na arte sem verificação.

## 3. Regras fixas de personagens

### City Safari
- Pikachu **nunca usa chapéu de Safari**.
- Eevee é quem usa o **chapéu de explorador/Safari**.
- Se Pikachu e Eevee aparecerem juntos, essa diferença é obrigatória.

### Eventos da Coreia — Pikachu de Hanbok Laranja
- Usar **Pikachu fêmea**.
- Quando a cauda estiver visível, deve ser a cauda correta da fêmea.
- Não escrever `Shiny boosted`, `chance aumentada de shiny` ou equivalente sem confirmação primária/oficial específica para o evento tratado.
- Se a confirmação primária não estiver disponível, omitir a alegação de boost em vez de inferir.

### adidas × Pokémon GO
Informações oficiais mínimas quando a arte resumir recompensas:
- jaqueta adidas para o avatar;
- boné adidas para o avatar;
- Pesquisa Temporária temática;
- encontro com Lucario;
- Lucario Mega Energy;
- XP e Poeira Estelar quando houver espaço editorial.

Lucario é recompensa/encontro da pesquisa, não item de avatar.
Não inventar peças de roupa além das confirmadas no anúncio oficial.

## 4. Datas, horários e coordenadas

- Horário local deve ser mantido como informado pela fonte.
- Conversão para `America/Sao_Paulo` deve ser calculada pelo sistema, nunca estimada manualmente.
- Tratar corretamente dia anterior/dia seguinte após conversão.
- Coordenadas devem ser válidas, deduplicadas e aparecer no texto quando forem relevantes.
- GPX deve usar exatamente as coordenadas validadas.

## 5. Fluxo editorial obrigatório

`Fonte → captura → deduplicação → checagem factual → arte premium → guard do padrão → Discord aguardando-aprovação → ✅/❌ → publicação`

- Arte automática simples de fallback **não pode** ir para aprovação.
- Item sem arte premium fica retido para correção.
- ✅ aprova; ❌ reprova.
- Uma reprovação por arte exige nova versão antes de novo envio.

## 6. Metadados exigidos em itens prontos para revisão

Todo JSON com `status: pending` deve conter:

- `art_standard_version: "spidey-premium-v1"`
- `art_ready_for_review: true`
- `art_rules`: lista das regras específicas aplicadas
- `fact_checks`: lista dos fatos relevantes verificados

Regras específicas usadas pelo guard:
- City Safari: `city_safari_pikachu_no_hat`, `city_safari_eevee_safari_hat`
- Coreia/Hanbok: `korea_female_pikachu`, e `shiny_claim` igual a `none` ou `verified_primary`
- adidas: `adidas_jacket`, `adidas_cap`, `lucario_encounter`, `lucario_mega_energy`

## 7. Princípio final

Passar tecnicamente não basta. Se a peça não estiver no padrão visual e factual do Spidey, ela não deve chegar ao usuário para aprovação.
