# Spidey — ajustes finais dos prints Android, 04/10/2026

Produção READY: `23929e805a976e8fe68fa17ac1dcbca4ca0c8dc2` · https://spidey-pokemon-go.vercel.app/spidey-app/

## 04/10/2026 — finalização dos ajustes mostrados no Android

A continuidade “Bora finalizar” e os sete prints mostraram coordenadas quebradas no modal do Japão e covers genéricas na Semana. Código `23929e8` está READY em produção, sob a autorização de publicação já existente.

Latitude e longitude agora ocupam uma linha própria do card, com números inteiros visíveis e botão para copiar o par completo. Fontes/coordenadas/GPX não mudaram. Mobile390 Claro/Escuro: modal360px, scroll360px; ambos os códigos16px de altura e nowrap. Toast de cópia confirmado; a leitura de clipboard da ferramenta ficou vazia, portanto não há nova certificação do conteúdo copiado nem do Android físico.

A Semana resolve a mesma arte original aprovada do Início. Pikachu Astronauta usa a imagem oficial já existente, com crédito, sem promover esse anúncio a Premium. Cards sem arte aprovada mostram uma data simples; Sobble, Malamar e outras entradas anteriores mostram Encerrado. Datas e estados seguem o catálogo em Brasília. O QA encontrou um display:block legado que alargava o selo de data; o grid foi corrigido e reconferido na produção final. Zero covers genéricas, todos os cards sem overflow; Xerneas, Mega Victreebel e GBL carregados dos arquivos aprovados.

59 testes Node e gate automático passaram. Oito arquivos públicos alterados foram comparados byte a byte; GPX Japão HTTP200,1.890 bytes/17 pontos, SHA2568870435145133c11894b923dad8dead2bff056e78a7c79104346fb1e7e12382a. Catálogo124,25 masters e sete fundos não receberam alterações. Push e validação física seguem com os limites anteriores. Nenhuma nova imagem Premium gerada, recusa contornada, missão fixa ou GPX de museu reintroduzido. Provas atuais: `docs/qa/PHONE_FINALIZATION_20261004.md/json` e `phone-final-http-23929e8-20261004.json`.

Provas visuais preservadas:

- `proofs/spidey-phone-coordinates-light-5da35bf-20261004.jpg` — coordenadas Claro no primeiro commit, cujo renderer permanece igual.
- `proofs/spidey-phone-coordinates-dark-23929e8-20261004.jpg` — coordenadas Escuro na versão final.
- `proofs/spidey-phone-weekly-dark-23929e8-20261004.jpg` — Semana Escuro na versão final, datas compactas e astronauta oficial.

A contagem de59 testes é desta rodada. Os32 testes Python de produção pertencem ao lançamento anterior e não foram repetidos para CSS/JavaScript. A certificação ampla de44 arquivos em `e220251` continua histórica; a nova verificação HTTP cobre os oito arquivos públicos alterados nesta rodada.
