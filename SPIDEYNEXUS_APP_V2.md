# SPIDEYNEXUS — Diretriz canônica do Spidey App v2

Este arquivo é uma extensão canônica de `SPIDEY_NEXUS.md`.

Quando a palavra-chave `SPIDEYNEXUS` for usada para retomar o projeto, estas regras devem ser tratadas como decisões já tomadas. Não reabrir por padrão; executar e preservar.

## Objetivo do App v2

O app deixa de seguir uma linguagem de apresentação/slides e passa a se comportar como um aplicativo vivo de eventos do Pokémon GO.

A referência mental é feed de eventos/esportes em tempo real, não PowerPoint.

## Regra 1 — menos PowerPoint, mais aplicativo

Evitar:

- sequência de caixas grandes isoladas;
- card dentro de card;
- excesso de bordas, molduras e sombras;
- blocos que ocupam uma tela inteira sem necessidade;
- repetir a mesma estrutura visual para todo tipo de evento;
- imagem tratada como slide dentro da interface.

Preferir:

- home em fluxo/feed vertical;
- destaque principal integrado à arte;
- rails horizontais para Hoje e Próximos dias;
- lista/timeline compacta para eventos seguintes;
- hierarquia visual diferente para evento grande, evento comum e informação auxiliar;
- arte Premium edge-to-edge quando fizer sentido;
- transições discretas e feedback de toque;
- detalhe de evento no celular com comportamento de bottom-sheet;
- conteúdo progressivo: primeiro o essencial, depois detalhes.

O usuário deve sentir que está usando um app, não lendo uma apresentação.

## Regra 2 — linguagem humana, de jogador para jogador

Tudo que for linguagem de sistema, IA, bastidor técnico ou curadoria fica fora da interface pública.

Não expor ao público expressões como:

- `Visual automático`;
- `Arte Premium ainda não disponível`;
- `Fonte preservada`;
- `Conteúdo factual`;
- `Curadoria automática`;
- `Sistema visual`;
- `Leitura gerencial automática`;
- qualquer mensagem que explique o funcionamento interno do pipeline.

`Premium` é classificação interna do projeto. O público não precisa ver esse termo.

A linguagem visível deve ser curta, natural e útil para um jogador.

Exemplos aprovados de direção:

- `O que está rolando agora?`
- `Hoje`
- `Próximos dias`
- `O que vem por aí`
- `Fonte: Pokémon GO`
- `Confirmado`

Evitar frases corporativas ou com tom de IA quando uma frase normal resolver.

Não alterar nomes oficiais de eventos quando isso prejudicar fidelidade factual.

## Regra 3 — modo escuro preservado; modo claro redesenhado

O modo escuro atual tem boa leitura e deve ser preservado como referência.

O modo claro não pode ser apenas o modo escuro com fundo branco.

No modo claro:

- texto principal deve usar quase-preto/azul-marinho;
- texto secundário deve usar cinza-azulado escuro;
- azul de ação deve ser mais fechado;
- dourado deve ser reservado a destaque curto, nunca texto longo;
- badges devem ter texto escuro e contraste real;
- transparência baixa não pode prejudicar leitura;
- nenhum texto importante pode depender de cor clara sobre fundo claro;
- contraste e legibilidade no celular têm prioridade sobre decoração.

As cores devem ter função clara: texto, secundário, ação, status, categoria e decoração.

## Regra 4 — artes Premium continuam soberanas

O redesign do app não redefine o padrão `spidey-premium-v1`.

A interface deve se adaptar às artes aprovadas, e não transformar essas artes novamente em templates.

Arte aprovada não deve ser redesenhada só para encaixar num card.

Se a peça ainda não atingir o padrão visual aprovado, vale a regra fail-closed já definida: é melhor não promover a arte do que baixar o padrão.

## Regra 5 — decisões visuais já aprovadas

- Seedot: data correta é **1 de outubro de 2026**.
- A arte do Seedot é considerada aprovada mesmo com pequeno borrão visual no algarismo `6`; não retrabalhar por isso.
- Xerneas: problema pendente é carregamento/integração da arte, não redefinição do estilo aprovado.
- Sizzlipede e Zorua: preservar direção visual Premium aprovada.

## Regra 6 — agenda mensal por faixas

A referência enviada pelo usuário em 29/09/2026 mostrou uma direção aprovada de organização: calendário mensal denso, porém estruturado por categoria, semelhante a uma tabela de calendário esportivo.

A regra é aproveitar **a hierarquia da informação**, não copiar o pôster estático.

No app:

- eventos recorrentes do mês devem ser agrupados por faixas de categoria;
- categorias prioritárias: Reides, Hora de Reides, Mega-Reides, Segunda Max, Holofote e Eventos;
- cada item deve mostrar primeiro **data + Pokémon/evento + bônus curto quando houver**;
- evitar transformar cada item em um card vertical completo;
- a leitura deve funcionar por varredura rápida, como agenda esportiva;
- tocar em um item abre o detalhe completo;
- a agenda mensal por faixas substitui a redundância de um segundo rail de “Próximos dias” quando ambos mostrarem a mesma informação;
- o calendário tradicional permanece disponível, porém pode ficar recolhido por padrão no celular;
- datas precisam ser visualmente fortes e fáceis de localizar;
- categorias podem usar cores próprias, mas cor deve indicar função, não apenas decorar;
- eventos sem arte adequada não devem ganhar placeholder chamativo só para preencher espaço.

A ideia central é: **mostrar, não explicar**.

## Regra 7 — validação visual em uso real

Screenshot isolado e CSS correto não bastam.

Mudanças relevantes do app devem ser julgadas pelo uso real no celular: rolagem com o dedo, densidade, leitura, abertura de detalhes, Semana, Selos e modo claro/escuro.

Se uma arte falhar no detalhe, o espaço visual deve colapsar; nunca manter uma grande área vazia.

## Implementação do App v2

Arquivos-base:

- `spidey-app/app-v2.css`
- `spidey-app/app-v2.js`
- `spidey-app/app-v2-1.css`
- `spidey-app/app-v2-1.js`
- `spidey-app/app-v2-2.css`
- `spidey-app/app-v2-2.js`

Objetivos implementados/dirigidos:

- abertura da Home sem card gigante de apresentação;
- status em faixa compacta;
- destaque principal mais integrado;
- rails horizontais menores;
- próximos eventos em formato de feed/timeline;
- telas secundárias com cabeçalho leve;
- detalhe mobile como bottom-sheet;
- movimento discreto com respeito a `prefers-reduced-motion`;
- limpeza automática de linguagem interna conhecida;
- paleta clara de maior contraste;
- preservação do modo escuro;
- agenda mensal categorizada por faixas;
- calendário completo recolhível no celular.

## Regra de retomada

Ao receber `SPIDEYNEXUS`, tratar este documento como decisão de produto vigente do app, juntamente com `SPIDEY_NEXUS.md` e `SPIDEY_PREMIUM_STANDARD.md`.

Não voltar ao visual de slides, não reintroduzir linguagem de IA, não enfraquecer contraste do modo claro e não voltar à pilha de cards quando uma agenda categorizada resolver melhor a informação, salvo decisão explícita do usuário.
