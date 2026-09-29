# SPIDEYNEXUS — Diretriz canônica do Spidey App v2.3

Este arquivo é uma extensão canônica de `SPIDEYNEXUS_APP_V2.md` e deve ser aplicado junto de `SPIDEY_NEXUS.md` e `SPIDEY_PREMIUM_STANDARD.md` quando a palavra-chave `SPIDEYNEXUS` for usada.

## Regra 8 — fallback técnico nunca aparece no app público

A validação em vídeo real no celular em 29/09/2026 confirmou que peças técnicas ainda podiam aparecer em detalhes de eventos, inclusive com linguagem interna como `VISUAL AUTOMÁTICO • ARTE PREMIUM AINDA NÃO DISPONÍVEL`.

Isso é proibido no app público.

Regras vigentes:

- arquivos de `spidey-app/assets/events/generated/` são fallback técnico e não devem ser exibidos como imagem pública;
- arte vetorial automática, placeholder, preview técnica ou composição abaixo do padrão aprovado não pode preencher um espaço visual só para evitar ausência de imagem;
- se não houver arte pública válida, o app deve usar um layout textual compacto e continuar funcional;
- se uma imagem falhar ao carregar, a área da imagem deve colapsar; nunca deixar retângulo vazio;
- enquanto a integração da arte aprovada de Xerneas estiver instável, é preferível mostrar o evento sem imagem a mostrar um bloco vazio ou fallback técnico;
- a agenda mensal por faixas substitui o feed longo antigo da Home quando ambos repetirem os mesmos eventos;
- linguagem de pipeline, IA, curadoria ou disponibilidade de arte não pertence à experiência pública.

A regra fail-closed continua soberana: ausência de arte aprovada é aceitável; arte técnica fingindo ser produto final não é.

## Regra 9 — densidade mobile, contraste e linguagem pública

A validação em vídeo real no celular definiu também:

- cards da Semana sem arte pública válida devem usar toda a largura para texto; nunca reservar uma coluna vazia onde existiria uma imagem;
- indicadores internos como `Com arte` ou `Com visual` não pertencem ao resumo público;
- o modo claro precisa manter contraste forte em estados de evento, chamadas para ação, horário, textos secundários e estados de coordenada;
- estados `pendente` e `confirmado` devem permanecer claramente legíveis em fundo claro, sem amarelo ou verde lavado;
- mensagens públicas devem ser curtas e naturais, por exemplo `Notificações ativadas.` em vez de frases de permissão/sistema;
- labels visíveis devem ser em português sempre que houver equivalente natural: `SELO` no lugar de `STAMP`;
- quando o destaque principal não tiver arte válida, o layout textual deve ser compacto e não ocupar altura de pôster;
- a validação final continua sendo a rolagem real no celular, não apenas inspeção de CSS.

### Regra geográfica — Taipei x Singapura

`Taipei, Taiwan` continua sendo a referência asiática oficial para horários/calendário do projeto, no timezone `Asia/Taipei`.

Isso **não** significa remover Singapura quando Singapura for uma localização real de um evento, Rally ou PokéStop oficial. Dados factuais de localização devem ser preservados. No `PokéXciting! Cross-Region GO Stamp Rally`, Singapura/Changi Airport é uma parada real do Rally e deve permanecer.

## Critério de validação

A validação final deve considerar o fluxo real no celular: Home, agenda do mês, abertura do evento, Semana, Selos, Mapa e alternância de tema.

O critério é simples: a pessoa deve enxergar informação útil e hierarquia clara, sem perceber mecanismos internos do projeto.
