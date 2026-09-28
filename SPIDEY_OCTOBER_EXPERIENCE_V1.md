# Spidey — Outubro Experience v1

## Prioridade editorial

A partir de 28/09/2026, o foco do produto passa a ser **Outubro → Novembro → Dezembro**. Setembro permanece disponível como histórico e para os últimos eventos ainda válidos, mas não deve consumir esforço de refinamento visual completo.

## Nova hierarquia da tela inicial

O Spidey deixa de abrir como um calendário puro e passa a priorizar a pergunta: **o que vale fazer agora?**

Ordem da experiência:

1. **Agora** — melhor evento ativo ou próximo destaque relevante.
2. **Hoje** — o que ainda pode ser feito no dia.
3. **Esta semana** — próximos sete dias com navegação rápida.
4. **Calendário** — visão mensal completa, agora como ferramenta de planejamento.
5. **Próximos eventos** — lista cronológica complementar.

Quando o mês corrente já estiver no fim (dia 25 em diante), o calendário deve abrir no mês seguinte. O mês anterior continua acessível pela navegação.

## Regras visuais

- arte específica do evento sempre que disponível;
- fallback individual somente como contingência;
- nunca ampliar o logo oficial como arte de evento;
- logo oficial permanece intacto na identidade do app;
- visual conduzido por imagens, com menos caixas repetidas;
- mobile-first e leitura rápida;
- português do Brasil como idioma predominante.

## Nomenclatura pt-BR preferida

- Spotlight Hour → **Hora do Holofote**;
- Raid Hour → **Hora de Reides**;
- Community Day → **Dia Comunitário**;
- Max Monday → **Segunda Max**;
- Max Battle Day → **Dia de Batalhas Max**;
- Shadow Raids → **Reides Sombrosas**.

Nomes próprios, marcas e termos oficiais sem tradução adequada podem permanecer no original.

## Integração de artes

`premium-event-art.js` deve ser carregado na aplicação pública. Isso garante que artes específicas cadastradas por `event_id` tenham prioridade no calendário, na tela individual e na Semana.

## Critério de aceite

A atualização não é considerada concluída apenas porque o código passa. Deve ser revisada no celular verificando:

- destaque Agora;
- rolagem Hoje/Esta semana;
- abertura de outubro como mês prioritário no fim de setembro;
- arte correta nos eventos;
- navegação Início / Semana / Selos / Mapa;
- leitura e espaçamento em tela pequena;
- cache/PWA entregando a versão nova.

Norte do produto: **“Não quero consultar o Spidey. Quero abrir o Spidey.”**
