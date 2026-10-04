# Pikachu Astronauta e museus — QA 04/10/2026

**PASSED_PREVIEW** no código `d5e667dc05340e6fcaaf6a062b5ffcadad2db28f`, branch `spidey-fly-v1`. A entrega inclui imagens dos anúncios oficiais, não novas artes Premium ou capturas dos Fundos de Localização no jogo. As recusas de geração anteriores permanecem bloqueadas.

## Comportamento entregue

O evento global em andamento passa a ser o destaque de Início enquanto não houver um evento FLY elegível hoje. “Ver museus e fundos” abre a colaboração europeia pelo destaque, detalhe global, Eventos pelo Mundo e FLY. O painel reúne seis museus, imagens oficiais integrais com crédito, condições de obtenção, fontes, relógios local/Brasília e seis mapas. Quatro locais têm coordenadas verificadas de referência do museu; Londres e Valência usam endereço verificado. Nenhum ponto é declarado uma PokéStop exata e nenhum GPX é oferecido.

O evento global ocorre de 04 a 10/10 no horário de cada região, com Pikachu Astronauta em Reides de uma estrela e Pesquisa temporária gratuita; resgate até 12/10 às 23h59 locais. A colaboração dos museus tem prazo próprio de 04/10/2026 a 30/04/2027. Reides presenciais podem render Fundo de Localização; alguns encontros das pesquisas temporárias também. Pesquisa de Campo e encontros aumentados limitam-se a 04–10/10. Fundo/Brilhante não são garantidos. Unidades da ESA oferecem atividades de 04–10/10 sem Fundos de Localização. Fontes e georreferências em `SPACE_WEEK_SOURCES_20261004.json`.

## Validação

40 testes Node passaram, além de sintaxe/diff check. As três regressões novas cobrem mudança do horário europeu, fronteiras de Brasília, mapas por coordenadas/endereço e escape HTML. Browser desktop Escuro 1348 e mobile Claro 390×850: ambas imagens completas 1920×1080; seis cartões, quatro botões de coordenadas e dois de endereço; sem overflow horizontal; fechamento acessível e modal inicia no topo. Detalhe global mostra prazo 12/10 e somente a ilustração oficial. FLY preserva 20 essenciais/28 pontos e Taipei, e sua entrada abre o painel de museus.

Cliques de cópia exibiram os retornos de sucesso de coordenadas/endereço. O leitor de clipboard da ferramenta devolveu vazio; colagem nativa no Android permanece sem prova. Os seis hrefs dos mapas foram conferidos no DOM e nos testes, sem afirmar navegação externa em todos eles.

Catálogo mantém 124 IDs, 123 outros objetos idênticos e os mesmos horários/localizações/notificações do evento global.A comparação da árvore confirmou 702 blobs anteriores intocados, além dos 13 arquivos da implementação, incluindo 25 masters e todos os assets aprovados. A colaboração possui dado próprio separado, evitando duplicação no calendário. Janela 01–07/10 continua 23 eventos, 20 APPROVED, 0 candidatas e 3 sem Premium. A imagem oficial de Espaço não muda seu estado Premium.

## Prévia e limites

https://spidey-pokemon-ijs2y7r8s-spidey3.vercel.app/spidey-app/index.html — deployment `dpl_BEMqhYaVsZLXUpttidS7Q99LXyws` READY, target null, commit exato validado. Novo link nativo temporário passou com cliente HTTP sem cookies iniciais/credenciais: HTML, ambos JSONs e ambas imagens 200, bytes servidos iguais aos locais. O link sem parâmetro continua pedindo login. Token efêmero não armazenado. Acesso do celular do usuário/testadores e URL durável ainda pendentes.

Push continua 503 `push_not_configured`. Android físico/PWA/atualização/offline/recebimento push e lançamento completo não certificados. Não houve promoção para main/produção, mudança de proteção, novo login administrativo, geração bloqueada, dispatch ou mensagem externa.

Registros: `SPACE_WEEK_QA_20261004.json`, `SPACE_WEEK_SOURCES_20261004.json`, `space-browser-d5e667d-20261004.json`, `space-share-anonymous-d5e667d-20261004.json`; quatro capturas em `proofs/`, com hashes/tamanhos no JSON principal.
