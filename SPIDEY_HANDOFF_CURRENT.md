# SPIDEY — GUIA DE RETOMADA ENTRE CHATS (22/10/2026)

> **Leia antes de tocar no projeto:** este é um índice de retomada, não substitui a instrução mais recente do responsável nem os arquivos `AGENTS.md`, `SPIDEY_DECISIONS_CURRENT.md` e o código/CI atuais. Conferir branch `main`, PRs e implantação no momento da retomada. Nunca continuar de um checkpoint velho sem verificar o estado novo.

## 1. Endereços e estado comprovado
- Produto: aplicativo público **Spidey Pokémon GO**, PT-BR, gratuito, mobile-first; foco no app, não em canal isolado.
- Repositório: https://github.com/asaquevoa1-ctrl/spidey-pokemon-go
- Produção: https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/
- Notion: [Spidey — Central de decisões e continuidade](https://app.notion.com/p/3fd44d7b5e2e81f8a549da17e6d3f872); **índice de 18/10**, não fonte técnica mais atual.
- `main` vista na consolidação: `6f936e270f11d06b5181c35da3cfed4be8469b5a`, merge [PR #129](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/pull/129). Actions Pages, testes, monitor e guardrails concluíram com sucesso para o SHA conferido. **Não é garantia de reteste físico Samsung/push**.
- Catálogo `spidey-app/data/events.json`: **173 eventos**. Base `data/world-event-points.json`: **70 localidades únicas**. `premium-approved-master.js`: **80 entradas marcadas APPROVED** na revisão; links ≠ imagens únicas e aprovação técnica ≠ aceitação estética.

## 2. Fontes canônicas (ordem de leitura)
1. `AGENTS.md` e `SPIDEY_DECISIONS_CURRENT.md`: instruções e decisões atuais, sempre primeiro.
2. `config/spidey-governance.json`: proteções; alguns metadados históricos estão desatualizados frente a decisões recentes.
3. `SPIDEY_GOLD_STANDARD.md`, `SPIDEY_PREMIUM_STANDARD.md`, `SPIDEY_APPROVED_ARTS.md`, `SPIDEY_ART_SYSTEM.md`.
4. `SPIDEY_PRODUCT_EXPERIENCE.md`, `SPIDEY_APP_CONSTITUTION.md`, `SPIDEY_STAMPS_V2.md`.
5. `SPIDEY_NEXUS_INDEX.md`, `SPIDEY_NEXUS.md`, `SPIDEYNEXUS_CONTINUIDADE.md`, `SPIDEY_PUBLIC_RELEASE.md`: histórico; não assumir estado antigo como atual.
6. [Issue #59](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/issues/59): prioridades P1–P4.
7. Notion: índice para as fontes acima; conferir divergências e não criar governança concorrente.
A instrução **mais recente** do responsável prevalece sobre regras anteriores; decisões antigas continuam como histórico e não podem restaurar opções rejeitadas.

## 3. Premissas permanentes — NUNCA regressar
- **Autonomia:** fazer mudanças no app/GitHub por conta própria, com PR, testes e publicação; não pedir repetidamente arte/aprovação/upload manual nem empurrar serviço técnico ao usuário. Dizer exatamente onde houver bloqueio.
- **Tom:** português simples, humano, sem discurso técnico excessivo, sem aparência de produto corporativo; “Bora” normalmente significa executar o próximo passo já definido.
- **Branding atualizado em 19/10:** usar **emblema S cósmico dourado original**, não a aranha antiga. Assets imutáveis em `spidey-app/assets/branding/20261019/`; `spidey-icon-cosmic-512.png` SHA-256 `4ee0ae8587bf3a60e2b4750b16b86a88472232c1627b737efea4d472dcfff0f8`. Nunca inventar/recriar logo. **Jamais escrever “SpideyNexus” dentro de qualquer pôster**; esse nome serve apenas como chave interna de continuidade.
- **Artes Premium** cinematográficas e factuais: protagonista correto, profundidade, iluminação editorial, legíveis em celular; nunca PowerPoint, card genérico, sprites colados, screenshot em moldura, imagens deformadas, bônus/horários/Pokémon/figurinos inventados. Não reusar material de terceiros como arte própria. Artes aprovadas preservadas por versões, hashes e QA visual comparativo. Delegação de aprovação individual registrada em `docs/qa/ART_CONTINUATION_AUTHORIZATION_20261003.json` não dispensa QA real. Reprovação de quatro SVGs ANA/Seoul/Trust em `docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json` continua válida.
- **Mobile:** somente menu lateral ☰ (cósmico), **sem barra inferior**; desktop mantém menu/layout próprio. PRs #121 e #123 mescladas. Preservar temas claro/escuro/sistema, voltar, FLY, Caçador, Semana, Calendário, Novidades, Selos, PvP, ANA, Trust.
- **Dados:** oficial ≠ rumor/comunidade. Não inventar Shiny boost, recompensa, hora, coordenada de PokéStop/Ginásio, GPS de spawn ou item de avatar. GPX só com waypoints exatos/verificados. Não pedir mudança manual do fuso do aparelho.
- **Privacidade/gratuidade:** não contratar servidor/plano pago nem coletar senhas/códigos de treinador; sem scraping de feeds privados, trackers invasivos ou redistribuição sem licença.

## 4. FLY — contrato inegociável de produto
Todo evento global elegível e publicado com **horário local confirmado** (Holofote, Dia Comunitário, Horas/Dias de Reides, Max Monday e similares) tem de aparecer **realmente na aba FLY**, não apenas no Calendário. Deve trazer rota ordenada, cidade/país, coordenada urbana para copiar, hora local e conversão **`America/Sao_Paulo`**, estados ativo/próximo/finalizado e regras de horário de verão/offsets conforme timezone IANA por data. **Não exibir coluna de horário de Portugal**; Portugal pode constar como ponto geográfico. Rota de referência NÃO é coordenada de Ginásio, PokéStop ou spawn verificado.

Arquivos: `spidey-app/fly-core.js`, `fly-v1.js`, `fly-v1.css`, `data/world-event-points.json`. O usuário havia fornecido desde o início a lista de **67 pontos** intitulada “HORA DO HOLOFOTE 18H”, de **10/11/2023**, revisada **06/11/2023**. Conservar os créditos completos, inclusive aviso **NÃO EDITE OU TIRE OS CRÉDITOS**, **LendáriosBrasil / FlyGPS / PokemonTrail**, revisão por **Fantasma** (propriedade `source_list_2023.credits`). **Não copiar horários de 2023 para 2026**: usar os mesmos locais/coords como referências e recalcular na data de cada evento.

- [PR #128](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/pull/128): Morelull no FLY, descoberta automática de rotas próximas e 10 eventos anteriormente sem a marca Global corrigidos.
- [PR #129](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/pull/129): restaurou pontos da lista antiga e horários de verão, **70 localidades únicas**. Não voltar a reduzir para 20/28 pontos.
- Verificar sempre `tests/fly-core.test.cjs`, `tests/fly-contract-global-events-20261021.test.cjs`, `tests/morelull-fly-route-20261021.test.cjs`, `tests/fly-historical-list-dst-20261022.test.cjs` e scripts de UI. Novas categorias/eventos globais não podem escapar do contrato.
- **Morelull 22/10**, 18–19h horário local, 2× Poeira Estelar/captura; rota mundial desde Kiritimati (01h Brasília) até Samoa Americana (última janela 23/10 02–03h BRT), respeitando DST. Sem mudança de relógio.

## 5. Artes e eventos específicos: correções que NÃO podem voltar
- **Roteiro 24/10:** FC Seoul, City Safari Boston, Uxie/Mesprit/Azelf Dinamax, Night Out presencial/Twitch; Minior como atividade complementar.
- **Seul:** Charmander 1★ no local **sem remoto**, Charizard em pesquisa e na natureza Growlithe, Flareon, Torchic, Houndour, Litleo, Litten. Não inventar miniaturas de espécies deformadas; listar por nome no quadro. 24/10 09h–20h Coreia = 23/10 21h a 24/10 08h Brasília.
- **Boston:** City Safari global apenas para quem já tem ingresso; 10–18h horário local do jogador. **Eevee é o Pokémon com chapéu de explorador; Pikachu NÃO usa chapéu**. Flabébé Flor Laranja, Hawlucha, Mudbray, Komala associados a pesquisas.
- **Trio do Lago:** não é prioridade máxima; pode retornar; Brasil Azelf 14–17h; não inventar ponto exato de Batalha Max.
- **Night Out:** Pikachu sem chapéu e Gengar em reides presenciais, Toxtricity em pesquisa local; Twitch desde 23h30 Brasília, sob regras do Drop.
- **Solgaleo e Lunala:** o usuário gosta dos dois, mas **não fazem parte desses eventos**; podem inspirar uma **tela de carregamento separada** usando o S original; integração ainda precisa de prova.
- Cartazes e coordenadas do 24/10 publicados com versões anteriores preservadas em `spidey-app/assets/events/premium/`; evento `2026-10-24-spidey-full-day-guide`, arte principal `spidey-2026-10-24-full-day-community-share-v4.webp` e complemento `spidey-2026-10-24-coordinates-reference-v1.webp`.
- Referências físicas (não ginásios confirmados): Seoul World Cup Stadium `37.568250,126.897240`; Boston Common `42.355090,-71.067910` (Boston global não depende da presença lá); Intuit Dome `33.943770,-118.342290`. GPX desses pontos desativado.
- **Pawniard 21/11** Dia Comunitário confirmado 14–17h local, até 21h evolução facilitada de Bisharp para Kingambit com `Kowtow Cleave`, bônus oficiais e shiny. ID mantido `2026-11-21-community-day-preview`, apesar do rótulo histórico; arte Premium `spidey-2026-11-21-pawniard-community-day-v1.webp`. PRs #124 e #127 mescladas. Não voltar a dizer “rumor” nem reproduzir arte GO Hub de terceiros.
- **ANA:** arquivos originais aprovados restaurados na **PR #95**. Não confiar no Notion de 18/10 que dizia rascunho. National Trust, TCG 30 anos, Adidas, APAC/Shopping e Nice exigem conferir estado e qualidade atual.

## 6. Funcionalidades e bloqueios
- **Caçador Global:** interface e filtros IV100/0, PvP, Shiny/Shundo/Shnundo, cópia de coordenadas; **feed de Pokémon ao vivo NÃO está licenciado/integrado**. `hunter-feed.json` permanece sem aparições autênticas; não inventar dados, usuários ou tempos. PR #65 aberta.
- **Selos/PokéLids:** exigir `exact_pokestop` para GPX e rotas completas. Pontos de referência não certificam PokéStops. Progresso local, galeria real, cuidado com escala 100+ selos.
- **PvP:** manter seção no lugar do antigo Mapa, integração de conhecimento com PvPoke, não restaurar Mapa como navegação padrão.
- **Push:** P1 e principal pendência; serviço gratuito seguro com consentimento e prova de notificação real recebida no Samsung, não somente HTTP 200. PR #32 mistura alertas e Amigos/chat, **não mesclar tudo**.
- **Amigos/Chat:** adiados expressamente no [issue #59](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/issues/59); PR #23 também aberta, NÃO integrar sem novo pedido.
- **Automação de notícias/curadoria:** fontes oficiais, G47IX, PokeMiners, SPS, Discord editorial, deduplicação, Gold art, autopublicação/alertas. Sucesso do GitHub Action não comprova chegada de fonte nova nem push. SPS teve falha recente; diagnosticar por logs.
- **Plano gratuito / GitHub Pages** mantido; versões Vercel são referência histórica ultrapassada.

## 7. Prioridades em [Issue #59](https://github.com/asaquevoa1-ctrl/spidey-pokemon-go/issues/59)
P1 **Alertas reais gratuitos** com consentimento e teste físico; P2 **Caçador** com feed real autorizado; P3 **artes Premium faltantes** e curadoria contínua; P4 **GPX correto** e inventário de rotas. Amigos/Chat fora do escopo atual.

**PRs abertas na revisão:** #84 National Trust; #71 Into the Wild; #65 Caçador; #32 backend push+social; #26 Weekly; #24 notícias Halloween/GO Lab/Wild; #23 Amigos/Chat. Não declarar nada disso publicado por existir uma PR.

**PRs mescladas recentemente:** #95 ANA, #108 identidade cósmica, #109 compartilhamento, #110 splash Samsung, #120 roteiro 24/10, #121 menu lateral, #122 ajustes de fonte/rótulos, #123 remoção da barra inferior, #124 Pawniard confirmado, #125 Eevee de chapéu, #126 Seul sem miniaturas, #127 três artes+coordenadas+Pawniard, #128 FLY permanente e Morelull, #129 67 referências históricas e DST.

## 8. Checklist para qualquer novo chat/agente
1. Verificar `main` HEAD, PRs abertas, workflow de deploy (SHA exato) e status público.
2. Ler integralmente `AGENTS.md`, `SPIDEY_DECISIONS_CURRENT.md`, este guia, Gold/Premium e autorizações/reprovações.
3. Consultar a [Central no Notion](https://app.notion.com/p/3fd44d7b5e2e81f8a549da17e6d3f872), **sem tratá-la como mais recente**.
4. Respeitar **S cósmico**, artes Premium originais, mobile ☰ sem barra inferior, privacidade/gratuidade e premissa FLY para todos eventos globais elegíveis.
5. Para eventos: verificar fonte, data/hora locais e Brasília, bônus, Shiny, coordenada de referência versus exata e participação local/global. Para imagens: conferir espécies/anatomia/figurino, texto legível, uso do logo exato, hash e telas.
6. Trabalhar em PR isolada, executar `node --test tests/*.test.cjs` e workflows/QA responsivo, validar merge, Pages e Samsung separadamente; não alegar testes que não foram realizados.
7. Informar entrega e pendência de forma humana, sem pedir novamente decisões antigas.

**Palavra de retomada:** `SPIDEYNEXUS` (só interno). **Última exigência FLY:** a lista histórica de 67 pontos com créditos preservados e horários recalculados por DST, integrados na PR #129. **Não reiniciar; continuar.**
