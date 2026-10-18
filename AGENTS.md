# Instruções do agente — repositório Spidey

**Leia primeiro `SPIDEY_DECISIONS_CURRENT.md` e `config/spidey-governance.json`.** Estas são as decisões atuais do responsável. Histórico em outras páginas pode estar desatualizado.

1. **Não reiniciar** nem reescrever código, arte, identidade e funcionalidades já aprovadas. Verifique `main`, PRs abertos e registros atuais antes de editar.
2. **Autonomia:** alterações GitHub, QA e deploy são responsabilidade do fluxo conectado, não do usuário. Não pedir upload nem aprovação individual recorrente. Se não há ferramenta viável, documentar a restrição concreta e não alegar entrega.
3. **Arte Premium:** seguir `SPIDEY_GOLD_STANDARD.md` e `SPIDEY_PREMIUM_STANDARD.md`. Nunca publicar sprite simples/card genérico como Premium. Inspecionar arte visualmente comparando com padrões aceitos. CI que só renderiza não prova aprovação estética.
4. **Logo:** reutilizar `assets/spidey-logo-oficial.jpg`; não escrever **SpideyNexus** nos cartazes; não inventar outra marca.
5. **Reprovações definitivas:** ver `docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json` e `config/spidey-governance.json`. Não reeditar/reaprovar os quatro SVGs rejeitados da PR #91.
6. **Manter referências exatas** de aeroportos/sedes separadas de Ginásios/Poképaradas confirmados; nunca habilitar GPX enganoso.
7. **Não enviar artes avulsas ao usuário** se a solicitação é integração no app; publicar somente depois de verificação de formato, conteúdo e funcionamento.
8. **Preservar funcionalidades:** FLY, calendário, Semana, selos, PvP, alertas, botão voltar, temas, link público.
9. **QA mínimo:** `node --test tests/*.test.cjs`, guardrails de governança, workflow do projeto; confrontar URL pública e SHA de deploy quando possível. Reportar exatamente o nível verificado.
10. **Manter decisões:** atualizar `SPIDEY_DECISIONS_CURRENT.md` se nova orientação mudar o comportamento. Usuário pode alterar prioridades; prevalece sua orientação mais recente. Anotar o que mudou e por quê.

Não transformar instruções antigas de aprovação manual em exigência de ação do usuário: a delegação de QA visual existe, mas não substitui análise real.
