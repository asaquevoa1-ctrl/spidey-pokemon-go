# Configurações operacionais do Spidey

Esta pasta concentra bases reutilizáveis que não devem depender do histórico de chats.

## `world_event_points.json`

Base mundial de localidades, fusos IANA e coordenadas representativas para conversão de eventos por horário local.

Regras principais:

- referência final: `America/Sao_Paulo`;
- calcular sempre usando a data real do evento;
- respeitar horário de verão de cada localidade;
- separar corretamente dia anterior/dia seguinte;
- coordenadas em `lat,lon`;
- Taipei/Taiwan substitui Singapura na posição 5 da base mundial.

## `event_time_templates.json`

Base de horários locais por tipo de evento, originada da referência operacional fornecida para o projeto.

Padrões cadastrados:

- eventos genéricos: 08:00, 09:00, 10:00, 11:00, 12:00 e 00:00;
- Dia Comunitário: 11:00–14:00 ou 14:00–17:00;
- Hora do Holofote: 18:00–19:00;
- evento especial: 18:00–21:00.

### Regra de precedência

A fonte oficial do evento sempre prevalece sobre o template. O template serve para conversão e automação quando o evento segue um dos padrões conhecidos; ele nunca deve sobrescrever um horário oficial diferente.

### Conversão

Para eventos globais por horário local:

1. identificar o tipo de evento e a janela local oficial;
2. usar `world_event_points.json` para obter localidade, timezone e coordenadas;
3. aplicar a data real do evento;
4. converter cada ponto para `America/Sao_Paulo`;
5. respeitar DST/fuso real daquela data;
6. agrupar por data em Brasília;
7. gerar coordenadas/GPX quando aplicável.
