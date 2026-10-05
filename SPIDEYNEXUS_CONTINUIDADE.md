# SPIDEYNEXUS — Guia de continuidade

Atualizado em 05/10/2026, horário de Brasília. Responsável: Anderson Luís Corrêa da Silva.

Este guia reúne as decisões recuperadas, os documentos do projeto e as pendências de retomada. O código e os registros atuais no GitHub continuam sendo as fontes de referência. O guia registra uma consulta feita nesta data; deve ser atualizado quando houver novas entregas.

## 1. Organizar o projeto no ChatGPT

Nome recomendado: **SPIDEYNEXUS**.

1. Criar um Projeto no ChatGPT com esse nome.
2. Adicionar este guia aos arquivos/fontes do projeto.
3. Mover as conversas relacionadas quando a opção de movimentação estiver disponível. Priorizar “Testes retomados apartir”, “Retomar lançamento SpideyNexus”, “Validar arte Xerneas” e “Retomar projeto Spidey”.
4. Manter as próximas conversas dentro do projeto. Usar nomes por entrega: “Publicação e alertas”, “Eventos e artes”, “Selos e Japão” e “Amigos e chat”.
5. Adicionar as instruções sugeridas na seção 6 às instruções do projeto.

Chats de Chat e ChatGPT Work podem compartilhar um Projeto. O trabalho do Codex deve consultar também os documentos versionados do repositório; reunir conversas não substitui essa consulta.

Referência oficial: [Projetos e chats — OpenAI](https://learn.chatgpt.com/docs/projects).

## 2. Endereços e versão de referência

| Item | Referência |
| --- | --- |
| Aplicativo — endereço público registrado | https://spidey-pokemon-go.vercel.app/spidey-app/ |
| Repositório | https://github.com/asaquevoa1-ctrl/spidey-pokemon-go |
| Branch principal conferida nesta retomada | `main` |
| Commit principal conferido | `29ad1de19d0e56f655e2947d5fb656b5d4e2f1d9` |
| Última alteração desse commit | Atualização do calendário e das notícias oficiais; 04/10/2026 às 23h52 de Brasília |
| Branch usada em etapas anteriores | `spidey-fly-v1`, atualmente em `ece3090b2d4c74c11a29533df27de5a110c88f48` |

O endereço permanente acima é a referência de compartilhamento. Prévia protegida ou endereço temporário de um deployment não devem substituir o link público nas instruções aos jogadores.

Nesta retomada foram consultados o GitHub e seus documentos. Não foi executado um novo teste de publicação, instalação ou recebimento de notificações no celular. O commit de `main` foi confirmado; a correspondência com a produção deve ser reconferida antes de declarar uma nova entrega.

## 3. Onde estão as decisões

Os arquivos abaixo estão na raiz do repositório. A palavra-chave **SPIDEYNEXUS** significa retomar pelo estado persistido e consultar a versão atual, preservando decisões anteriores.

| Documento | O que consultar |
| --- | --- |
| [SPIDEY_NEXUS_INDEX.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_NEXUS_INDEX.md) | Índice, regras de continuidade e ordem de leitura |
| [SPIDEY_NEXUS.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_NEXUS.md) | Histórico técnico e registros de passagem entre etapas |
| [SPIDEY_APP_CONSTITUTION.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_APP_CONSTITUTION.md) | Regras do produto, prioridades, FLY e preservação do que foi aprovado |
| [SPIDEY_APPROVED_ARTS.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_APPROVED_ARTS.md) | Artes aprovadas, revisões e autorizações |
| [SPIDEY_PREMIUM_STANDARD.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_PREMIUM_STANDARD.md) | Padrão visual Premium |
| [SPIDEY_ART_SYSTEM.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_ART_SYSTEM.md) | Uso da mesma arte aprovada nas diferentes telas |
| [SPIDEY_PUBLIC_RELEASE.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_PUBLIC_RELEASE.md) | Publicação, verificações e limitações registradas |
| [SPIDEY_PRODUCT_EXPERIENCE.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_PRODUCT_EXPERIENCE.md) | Experiência, linguagem e proposta da área Amigos |
| [SPIDEY_STAMPS_V2.md](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/blob/main/SPIDEY_STAMPS_V2.md) | Regras de Selos, mapas, coordenadas e progresso |

Alguns resumos desses documentos ainda descrevem lançamentos anteriores. Na consulta de 05/10, `main` já contém navegação de retorno, controles de teste de alertas e atualização de conteúdo posteriores aos resumos de lançamento. Confrontar o registro com o código e a prova de publicação da mesma versão.

## 4. Decisões que devem ser preservadas

- O aplicativo é a prioridade do projeto. Público inclui jogadores FLY.
- Manter a identidade Spidey, o padrão Premium e os temas claro, escuro e sistema. A interface deve ter aparência de aplicativo para jogadores, com linguagem simples.
- Preservar os arquivos exatos das artes aprovadas, especialmente Xerneas. Não substituir artes aprovadas por novas gerações ou alternativas genéricas.
- Anderson autorizou continuar as próximas artes no padrão aprovado sem confirmação individual, em 03/10/2026 às 23h13 de Brasília. A autorização está registrada nos documentos; permanecem a conferência dos fatos, da imagem e do resultado no app.
- FLY usa horário local e horário de Brasília, calculados para a data do evento. Não adicionar coluna de Portugal. Preservar Taipei na seleção estratégica já definida.
- Coordenadas devem ter origem verificada. GPX exige dados completos e validados; localização de um ponto físico não comprova a coordenada exata de uma Poképarada.
- Diferenciar informação oficial de informação da comunidade. Datas, bônus, recompensas e a prévia de Halloween precisam respeitar essa distinção.
- Preservar a numeração dos eventos, as artes, os fundos, as rotas e as automações existentes ao atualizar o app.
- Registrar cada entrega no documento correspondente, com sua versão e o que foi realmente verificado.

## 5. Situação e próximos passos

“Presente no código” indica implementação encontrada em `main`. “A validar” indica ausência de comprovação suficiente na versão pública ou no celular. Essas situações não devem ser confundidas.

| Frente | Situação recuperada | Próxima comprovação necessária |
| --- | --- | --- |
| Link público | Domínio permanente registrado; lançamentos anteriores têm provas de acesso sem conta Vercel | Conferir a versão atual em acesso público e manter o mesmo endereço |
| Voltar | `navigation.js` e botões de retorno presentes, incluindo tratamento do histórico do navegador | Testar entre abas, detalhes e modais, com o botão do Android |
| Notificações | Cadastro, teste e desativação presentes no código; os últimos chats não encerraram a comprovação da entrega | Verificar servidor, agendamento e recebimento real no aparelho |
| Calendário automático | Fluxo de autopublicação existente; app contém atualização periódica e ao recuperar conexão/foco | Comprovar anúncio → calendário publicado → atualização no mesmo link |
| Xurkitree | Arte do trio registrada como publicada; a correção das datas foi informada nos últimos chats | Conferir datas, fusos e a apresentação no calendário e em FLY |
| Linguagem do app | Simplificação foi solicitada e há alterações nos textos do código | Revisar todas as telas e mensagens visíveis ao público |
| Artes | Registro de 32 entradas aprovadas após a rodada de 04/10, incluindo Malamar, trio e prévia de Halloween | Auditar cobertura atual; lacunas Applin, Semana do Espaço e Sizzlipede continuam registradas |
| Japão / PokéLids | Registro de importação de 482 locais em 42 prefeituras, 18 pontos da campanha Centers e 8 locais de Nagasaki | Validar visualização, cobertura e precisão; o registro não comprova todos os selos ativos no jogo |
| Instalar como app | Recursos de PWA existentes; instalação física permanece sem confirmação final | Testar instalação, atualização, abertura e uso sem conexão no Android |
| Amigos e chat | Proposta documentada; os últimos registros consultados indicam que a área não foi implementada | Implementar os fluxos de perfil, amigos e conversa e verificar o uso entre contas |

Prioridade sugerida para a retomada: fechar a verificação da publicação e dos alertas; conferir retorno, datas e atualização da agenda; revisar textos, cobertura de artes e Selos; concluir a experiência instalada e avançar em Amigos/chat. Todas as solicitações permanecem na lista.

Sobre PokéLids: o registro `docs/qa/POKELIDS_JAPAN_20261004.json` identifica as coordenadas como referência oficial do local da tampa, não como coordenadas exatas comprovadas da Poképarada. Ele também informa que não há comprovação de todos os pontos ativos no jogo e que o GPX desses locais está desabilitado.

## 6. Instruções sugeridas para o Projeto

> Este é o projeto SPIDEYNEXUS, de Anderson, para o aplicativo Spidey Pokémon GO. Retome o repositório asaquevoa1-ctrl/spidey-pokemon-go consultando o índice NEXUS e os documentos de referência. Confira a versão atual de main antes de trabalhar; 29ad1de é a referência da consulta de 05/10/2026, não um bloqueio para futuras atualizações. Preserve funcionalidades, artes exatas aprovadas, identidade visual, horários, coordenadas, rotas e automações. Mantenha o endereço público https://spidey-pokemon-go.vercel.app/spidey-app/ como referência. Use linguagem simples no app. A autorização para seguir as artes no padrão aprovado sem confirmação individual já está registrada. Mantenha todas as pendências deste guia, inclusive notificações, navegação de retorno, Xurkitree, calendário automático, PokéLids, instalação e Amigos/chat. Distinga implementação, publicação e teste real no celular. Atualize os registros após cada entrega e deixe claro o próximo passo.

## 7. Mensagem curta para uma nova conversa

> SPIDEYNEXUS. Retome pelo guia de continuidade e pelo índice NEXUS do repositório asaquevoa1-ctrl/spidey-pokemon-go. Consulte a versão atual de main e preserve as decisões e artes aprovadas. Primeiro feche a comprovação da publicação e dos alertas, depois prossiga pelas pendências registradas. Não reinicie o projeto a partir dos checkpoints antigos.


## 8. Entrega verificada nesta retomada — 05/10/2026

A consulta inicial de main `29ad1de` foi preservada como referência histórica. Os ajustes da retomada foram publicados pela PR 21 (`bf05924` → `d08b6cd`); o workflow semanal gerou `a48da34`, confirmado READY em produção. O endereço público continua o mesmo.

A Semana mostra 05–11/10 e 19 eventos. A geração deixou de exigir capas substitutas: 11 entradas usam o original Premium aprovado, uma usa a ilustração oficial e sete mostram data simples. A validação confere os hashes e as contagens reais. Nenhuma arte aprovada foi modificada. O botão Voltar ficou acessível fora do menu lateral no computador, com 44 px de altura; retornos entre telas/modal e histórico do navegador foram conferidos na prévia, além do retorno Semana→Início em produção.

Os alertas já possuem configuração de servidor e agendamento. Public-key respondeu 200 e uma execução automática autenticada retornou 200 com due = 0/deliveries = 0. Isso não prova que uma assinatura foi gravada ou que o aparelho recebeu uma notificação. O navegador cloud bloqueia notificações. Permanecem o teste Ativar alertas→Testar alerta no Android, o recebimento de um alerta agendado e a desativação. As execuções observadas não garantem intervalo de cinco minutos.

Os 31 arquivos originais das 32 entradas do master e os demais arquivos amostrados foram servidos exatamente; 39 arquivos 200. Catálogo com 130 eventos, datas, fontes, coordenadas, filas e automações preservados. Centers contém 18 locais e GPX HTTP 200/18 pontos. PokéLids continua 482 referências oficiais em 42 prefeituras, sem comprovação de todos os pontos ativos; seu GPX retorna 409.

Registro completo: [CONTINUITY_20261005.md](docs/qa/CONTINUITY_20261005.md) e JSON homônimo. Todos os próximos passos da seção 5 permanecem na lista, com os avanços acima. Instalação/atualização/offline e botão Android não foram certificados; Amigos/chat não foi implementado. Organizar o Projeto e mover conversas no ChatGPT não foi realizado por esta entrega no repositório.
