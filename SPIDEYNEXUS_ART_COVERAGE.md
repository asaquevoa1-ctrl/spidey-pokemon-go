# SPIDEYNEXUS — Cobertura visual total dos eventos

Este arquivo é extensão canônica de `SPIDEY_NEXUS.md`, `SPIDEY_PREMIUM_STANDARD.md` e das diretrizes `SPIDEYNEXUS_APP_V2*`.

## Regra soberana

Todo evento público exibido no Spidey App deve ter representação visual.

Não existe mais a regra operacional de que apenas alguns eventos principais recebem arte enquanto os demais ficam sem imagem.

A cobertura pública obedece a três níveis, nesta ordem:

1. **Premium aprovado** — arte editorial definitiva já aprovada no padrão `spidey-premium-v1`.
2. **Arte pública curada** — peça limpa, factual e visualmente aceitável já vinculada ao evento.
3. **Cobertura visual Spidey** — composição pública do app com identidade Spidey, fundo temático por categoria e Pokémon oficial quando o evento permitir identificação confiável.

A cobertura visual do nível 3 existe para garantir 100% de presença visual no app. Ela não recebe selo Premium e não substitui a necessidade de uma futura arte Premium para publicação editorial ou para eventos prioritários.

## Fail-closed continua valendo

É proibido mostrar ao público:

- `assets/events/generated/`;
- placeholder técnico;
- vetor automático antigo;
- preview de pipeline;
- texto como `arte em preparação`, `visual automático` ou `arte Premium ainda não disponível`;
- imagem com defeito visual conhecido;
- imagem de resolução insuficiente quando uma cobertura limpa estiver disponível.

Se uma arte vinculada falhar, for técnica, estiver quebrada, tiver qualidade insuficiente ou estiver bloqueada, a interface deve substituí-la pela cobertura visual Spidey em vez de deixar buraco ou remover completamente a presença visual do evento.

## Artes Premium soberanas

Artes Premium aprovadas nunca devem ser rebaixadas por uma cobertura genérica.

Xerneas, Seedot, Sizzlipede e Zorua permanecem como referências Premium já aprovadas. Xerneas deve usar a mesma arte aprovada tanto na Hora de Reides quanto na rotação de Reides correspondente.

## Festival das Luzes

A peça atual com artefatos residuais `E/N` não é considerada apta para exibição pública.

Enquanto uma versão limpa não existir, o Festival das Luzes usa cobertura visual Spidey limpa, com Pikachu oficial quando aplicável. A peça defeituosa não deve reaparecer via cache, fallback ou outro renderer.

## Qualidade nos cards

A miniatura pública precisa continuar nítida no celular. Arte muito pequena, borrada ou comprimida abaixo do aceitável pode ser substituída pela cobertura visual do app, mesmo quando tecnicamente existir um arquivo de imagem.

O objetivo é consistência visual, não apenas presença de arquivo.

## Identidade da cobertura

A cobertura do app deve:

- evitar linguagem de slide, pôster corporativo ou PowerPoint;
- não repetir dentro da arte o título, horário e resumo que já estão na interface;
- usar cena abstrata, luz, profundidade, movimento e identidade Spidey;
- usar Pokémon oficial como protagonista quando o evento tiver um Pokémon claramente identificável;
- usar tema abstrato por categoria quando não houver um único Pokémon protagonista;
- permanecer legível em modo claro e escuro;
- ser responsiva para Home, Agenda do mês, Semana, cards e detalhe.

## Cobertura total

A regra vale para todas as categorias públicas, incluindo, sem limitar:

- Reides e Hora de Reides;
- Mega-Reides;
- Reides Sombrosas;
- Segunda Max e Dias Max;
- Hora do Holofote;
- Community Day;
- GO Fest;
- eventos sazonais;
- GO Pass e pesquisas;
- eventos da Equipe GO Rocket;
- eventos regionais;
- eventos especiais;
- descobertas diárias e demais eventos publicados no calendário.

## Critério de validação

A validação deve ser feita na experiência real do celular.

Um evento é considerado coberto quando aparece visualmente em todos os contextos públicos onde for exibido, sem fallback técnico e sem perda indevida de uma arte Premium melhor.
