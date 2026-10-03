# Thundurus Sombroso e Elgyem — aprovação de 03/10/2026

Anderson respondeu “Com certeza, eu aprovo as duas novas artes” às 07:30:21 BRT. A decisão aprova exclusivamente os dois PNGs completos apresentados diretamente na resposta anterior: Thundurus v1 e Elgyem v2.

| Evento | Arquivo aprovado | SHA256 |
|---|---|---|
| Thundurus Sombroso | `spidey-app/assets/events/premium/thundurus-shadow-weekend-approved-v1.png` | `eb8141c8220c4acf4c3a962aaf12ee07b7c37085d5e8f6a1f1d233e25b6a4439` |
| Hora do Holofote: Elgyem | `spidey-app/assets/events/premium/elgyem-spotlight-approved-v1.png` | `2ab5e183a146654848b962d4e02603561cccfa5b20ad34ddbeacdaef3b913df9` |

Ambas 1121×1403, cópias byte a byte das candidatas, sem regeneração. Elgyem v1 sem nome segue preservada só no histórico. Os dois IDs saem do registro de preview e entram no master como APPROVED/full_poster. Os 12 masters anteriores e os 124 IDs/horários do catálogo foram preservados. Fonte e programação continuam identificadas como comunidade. Aprovação não se estende ao lançamento completo.

32 testes passaram, incluindo vínculo entre a decisão, revisões exibidas, hashes dos PNGs e preservação dos masters anteriores. Sintaxe dos scripts alterados e integridade do catálogo/registro histórico passaram. Shell/master/preview/cache versionados para os caminhos finais.

Registro auditável: `THUNDURUS_ELGYEM_APPROVAL_20261003.json`; registro histórico das candidatas permanece `THUNDURUS_ELGYEM_REVIEW_20261002.json`, sem reescrever sua condição anterior. QA pré-aprovação no código `a17f6d4` foi concluído e preservado. QA pós-aprovação **PASSED_PREVIEW** no código `29c1aecf53742de581ea0fc036793d91a859bc60`, deploy READY `dpl_t2ntTxATK4wiqFBowy8YLWTtdPkw`, em 2026-10-03T10:45:32.263Z. Prévia conferida: https://spidey-pokemon-7whircohq-spidey3.vercel.app/spidey-app/index.html. Relatório e cinco screenshots: `thundurus-elgyem-approved-browser-29c1aec-20261003.json`.

Elgyem continua elegível para a FLY; Thundurus permanece na Home/Semana como fim de semana de Reides Sombrosas, sem janela horária global inventada. Android físico, instalação/atualização/offline e recebimento push continuam pendentes. Nenhuma configuração, envio push ou promoção a main/produção foi feita.

Detalhes dos dois eventos conferidos em mobile responsivo 390×850 Claro e desktop 1280×850 Escuro: PNGs completos, rodapé visível, object-fit contain, foco Fechar, scrollTop 0 e sem overflow horizontal medido. Downloads reais do novo deploy têm bytes e hashes idênticos aos dois masters. Semana carrega o novo asset de Thundurus; a miniatura mantém sua composição de capa. Elgyem FLY usa o PNG aprovado: 20 essenciais no desktop e 28 hotspots no mobile, com ID e seleção corretos. Local: 8/10 18–19h; Brasília: Kiritimati 8/10 01–02h, Ibirapuera 8/10 18–19h e Pago Pago 9/10 02–03h, com coordenadas observadas. Elgyem está fora da Semana 28/09–04/10 e dos seis próximos da Home.

Inventário 01–07/10 recalculado com `SpideyPlayer.art`: 23 eventos, 9 APPROVED, nenhuma candidata pendente e 14 sem arquivo Home/FLY. Master completo: 14 entradas, incluindo aliases anteriores; registro ativo de candidatas vazio. Os 32 testes são da consolidação deste código. O checkpoint posterior altera somente documentação/provas.
