# Invasão e Cinderace — consolidação pós-aprovação, 01/10/2026

O editor aprovou explicitamente os dois PNGs exatos em 01/10, 15:45:53 BRT, apresentados no checkpoint `df9d050`, QA de candidatas `684d80e`. Estado APPROVED, cópias byte a byte, sem regeneração. Decisão/arquivos/eventIds/hashes/provas em [PRIORITY_ART_APPROVAL_20261001.json](PRIORITY_ART_APPROVAL_20261001.json); geração/fatos/prompts históricos em [PRIORITY_ART_REVIEW_20261001.json](PRIORITY_ART_REVIEW_20261001.json).

Master e cache atualizados; revisão removida somente para estes dois eventIds. Xerneas/Hora de Reides/Festival das Luzes e candidatas/originais preservados. Applin, Seedot e Zorua não recebem aprovação. O inventário passa a 3 aprovados, 1 recorte pendente e 19 sem arquivo entre 23 eventos de 01–07/10.

## Estado de verificação

Testes locais: `node --test tests/fly-core.test.cjs tests/player-ui.test.cjs tests/priority-art.test.cjs`: **14 passaram**. Sintaxe dos 18 scripts ativos e SW, JSON, caminhos do precache, hashes de aprovação/originais/provas e `git diff --check`: passaram. Pendente nesta consolidação: confirmação dos novos paths aprovados no preview mobile/desktop/Semana/FLY. QA anterior, antes da decisão humana: [PRIORITY_ART_20261001.md](PRIORITY_ART_20261001.md). Não confundir aprovação editorial com prova de deploy ou liberação pública.

Arte de Applin/cobertura restante e Android físico/instalação/upgrade/offline PWA/push permanecem pendentes. Sem promoção a main/produção; Amigos/Chat posterior ao núcleo.
