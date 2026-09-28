# SPIDEY PRODUCT EXPERIENCE — Diretriz oficial de produto e UX

Versão: `spidey-product-experience-v1`

Data de definição: 28/09/2026

Este documento define a direção oficial de experiência do Spidey Pokémon GO. Ele deve orientar as próximas alterações do app, inclusive Calendário, Semana, Stamps, Mapa, Amigos, notificações e telas de detalhe.

## Objetivo

O Spidey não deve parecer apenas um painel, banco de dados ou calendário com muitas caixas iguais.

A experiência desejada é:

> **Não quero consultar o Spidey. Quero abrir o Spidey.**

O produto deve ser bonito, agradável de usar, rápido de entender e útil várias vezes ao dia.

## Diferenciação

O Spidey não deve competir apenas por quantidade de informações. A combinação que deve diferenciá-lo é:

1. **Arte específica como parte do produto** — cada evento importante deve ter visual próprio, com o Pokémon e a atmosfera corretos.
2. **Informação que leva a uma ação** — copiar, abrir, compartilhar, baixar GPX quando permitido, ativar lembrete e navegar para conteúdo relacionado.
3. **Mundo + Brasil na mesma tela** — horário local do evento e conversão para `America/Sao_Paulo`, evitando contas manuais de fuso.
4. **Semana como experiência editorial interativa** — o Weekly não deve ser apenas uma imagem; deve funcionar como uma agenda visual navegável.
5. **Personalização progressiva** — favoritos, preferências de eventos, notificações e Amigos devem fazer o app parecer cada vez mais pessoal.

## Hierarquia da tela inicial

A tela inicial deve evoluir para priorizar o que importa agora, sem obrigar o usuário a começar por uma grade de calendário.

### 1. AGORA

Bloco de maior destaque da tela.

Deve mostrar o evento mais relevante acontecendo agora ou prestes a começar, com:

- arte Premium específica;
- nome do evento;
- contagem regressiva quando aplicável;
- horário;
- ação principal, como **Ver detalhes**, **Ver horários mundiais** ou **Lembrar-me**.

### 2. HOJE

Lista compacta e agradável dos eventos do dia.

Priorizar cards horizontais ou compactos, com leitura rápida e sem excesso de informação.

### 3. ESTA SEMANA

Faixa visual baseada no Spidey Weekly, interativa e navegável.

Deve permitir abrir os eventos sem duplicar desnecessariamente a mesma informação do calendário.

### 4. CALENDÁRIO COMPLETO

O calendário continua importante, mas passa a ser uma ferramenta de exploração e planejamento, não necessariamente a primeira coisa que domina a experiência.

## Tela de detalhe do evento

A tela individual deve seguir uma ordem clara.

### Hero

- arte específica do evento, grande e de alta qualidade;
- nunca usar o logo oficial ampliado como arte do evento;
- nunca usar um visual genérico como padrão final quando houver Pokémon/evento identificável.

### Identificação

- nome em português do Brasil sempre que houver tradução oficial ou adequada;
- data;
- horário;
- contagem regressiva ou estado do evento quando fizer sentido.

### O que importa

Resumo curto com a informação principal do evento, sem parede de texto.

### Horários e locais

Quando aplicável:

- horário local;
- conversão para o Brasil;
- tabela mundial para Community Day, Hora do Holofote, Hora de Reides e eventos semelhantes;
- cidade/região e país para eventos presenciais;
- coordenadas somente quando verdadeiras e com nível de confiança identificado.

### Ações

Quando aplicável:

- **Copiar coordenada**;
- **Abrir em aplicativo compatível**;
- **Compartilhar coordenada**;
- **Baixar GPX** somente quando a precisão permitir;
- **Lembrar-me**;
- **Favoritar** quando o módulo estiver disponível.

### Conteúdo complementar

Depois das informações essenciais podem aparecer:

- Pokémon em destaque;
- bônus;
- ataques;
- dicas;
- recompensas;
- fonte e confiança dos dados.

## Sistema visual

### Identidade

- usar sempre o logo oficial existente no projeto;
- não redesenhar, reinterpretar ou criar uma variação parecida do logo;
- manter a base visual Spidey em azul-marinho profundo, ciano e dourado;
- vermelho pode ser usado como acento, não como substituição da identidade principal.

### Atmosfera por categoria

A identidade Spidey permanece constante, mas cada tipo de evento deve ter clima próprio.

Exemplos:

- **Hora de Reides**: energia, contraste, presença forte do chefe;
- **Hora do Holofote**: luz e foco no Pokémon em destaque;
- **Dia Comunitário**: celebração, cor e sensação de evento grande;
- **Max / Gigamax**: escala e impacto;
- **Rocket**: atmosfera mais escura e agressiva;
- **Stamps / eventos presenciais**: exploração, viagem e descoberta;
- **eventos sazonais**: identidade temática própria sem perder o Spidey.

### Composição

Evitar telas formadas por muitas caixas visualmente idênticas.

Preferir:

- uma hierarquia visual clara;
- mais espaço entre elementos;
- imagem/evento comandando a tela;
- cards com tamanhos e papéis diferentes conforme importância;
- menos informação visível de uma vez, sem esconder informação importante;
- leitura confortável em celular Android.

## Artes de eventos

O padrão final é **arte específica por evento**.

Exemplos:

- Xerneas → arte do Xerneas;
- Hora do Holofote → arte do Pokémon da semana;
- Dia Comunitário → arte do Pokémon do evento;
- Hora de Reides → arte do chefe;
- Max Monday / Max Battle Day → arte do Pokémon Max/Gigamax;
- evento sazonal → arte temática própria.

O fallback vetorial genérico existe somente como contingência temporária e não deve ser confundido com o padrão Premium final.

## Idioma

Aplicar `SPIDEY_PT_BR_STANDARD.md`.

O português do Brasil deve dominar interface, artes, datas, horários, notificações, rótulos, botões e textos editoriais.

Inglês só deve permanecer quando for nome próprio, marca, nome oficial sem tradução adequada ou termo necessário para reconhecimento do jogo.

## Stamps e Mapa

O mapa deve continuar fail-closed para precisão:

- só pontos exatos confirmados entram como coordenada exata;
- referências de cidade ou venue permanecem identificadas como aproximadas;
- não gerar GPX de PokéStop a partir de referência aproximada.

A experiência deve privilegiar ação: visualizar, copiar, abrir, compartilhar e baixar quando permitido.

## Amigos

A futura guia Amigos deve ir além de uma simples lista de códigos.

### Amigos v1

- perfil pseudônimo de treinador;
- código de amizade;
- país/região aproximada;
- interesses;
- busca e filtros;
- copiar código;
- pedido de conexão;
- bloquear e denunciar;
- expiração/renovação de perfil.

Não exibir telefone, e-mail, idade nem localização exata.

### Amigos v2

Depois de conexão aceita:

- conversa privada;
- texto e ações rápidas;
- sem mídia/arquivos/links no início;
- bloquear e denunciar;
- controle de abuso e limite de envio.

## Próxima atualização do app

A próxima atualização funcional/visual do Spidey deve considerar esta diretriz como requisito de produto, não como melhoria opcional.

Prioridades de aplicação:

1. preservar o que já funciona;
2. manter logo oficial e padrão pt-BR;
3. colocar artes específicas dos eventos prioritários acima de qualquer fallback;
4. começar a transformar a navegação em **Agora → Hoje → Esta semana → Calendário**;
5. melhorar o detalhe do evento com hierarquia **Hero → O que importa → Horários e locais → Ações → detalhes complementares**;
6. evitar interface genérica, excessivamente uniforme ou com aparência de painel técnico;
7. validar tudo no celular antes de declarar a experiência concluída.

## Critério de aceite visual

Uma atualização não deve ser considerada final apenas porque o código funciona.

Ela precisa passar por avaliação visual real no celular e responder positivamente a estas perguntas:

- o evento chama atenção pelo conteúdo correto?
- o Pokémon principal está claramente representado quando aplicável?
- a tela parece parte do mesmo Spidey?
- está agradável de navegar?
- a informação principal é entendida em poucos segundos?
- existe uma ação clara para o usuário?
- o português do Brasil está predominante?
- evitamos sensação de template genérico ou painel sem personalidade?

Se a resposta for não, a tela ainda está em evolução, mesmo que tecnicamente esteja funcionando.
