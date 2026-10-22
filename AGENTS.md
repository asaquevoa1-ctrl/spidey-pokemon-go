# Instruções do agente — repositório Spidey

**Leia primeiro `SPIDEY_DECISIONS_CURRENT.md` e `config/spidey-governance.json`.** Estas são as decisões atuais do responsável. Histórico em outras páginas pode estar desatualizado.

**Continuidade entre chats, Work, automações e Notion:** esses ambientes não sincronizam decisões automaticamente com o repositório. Trate `SPIDEY_DECISIONS_CURRENT.md` como registro canônico de decisões, a `main` como fonte técnica e o Notion apenas como índice. Antes de alterar qualquer coisa, confira o HEAD, as PRs, os arquivos correntes, a decisão mais recente do responsável e o estado real do CI/Pages/Samsung. Atualize o registro canônico quando houver uma nova decisão duradoura; nunca suponha que a memória do chat é completa.

1. **Não reiniciar** nem reescrever código, arte, identidade e funcionalidades já aprovadas. Verifique `main`, PRs abertos e registros atuais antes de editar.
2. **Autonomia:** alterações GitHub, QA e deploy são responsabilidade do fluxo conectado, não do usuário. Não pedir upload nem aprovação individual recorrente. Se não há ferramenta viável, documentar a restrição concreta e não alegar entrega.
3. **Arte Premium:** seguir `SPIDEY_GOLD_STANDARD.md` e `SPIDEY_PREMIUM_STANDARD.md`. Nunca publicar sprite simples/card genérico como Premium. Inspecionar arte visualmente comparando com padrões aceitos. CI que só renderiza não prova aprovação estética.
4. **Identidade atual (decisão posterior de 19/10):** usar exclusivamente o **emblema S cósmico dourado original** nos ícones, abertura e novas peças, com arquivo oficial `spidey-app/assets/branding/20261019/spidey-icon-cosmic-512.png` e manifesto `spidey-app/data/cosmic-brand-assets-20261019.json`. Não redesenhar o S. `assets/spidey-logo-oficial.jpg` é apenas patrimônio histórico preservado; **não voltar à aranha antiga**. Nunca escrever **SpideyNexus** em cartazes. A decisão recente supera instruções históricas dos padrões Gold/Premium.
5. **Reprovações definitivas:** ver `docs/qa/PRIORITY_ART_ANA_SEOUL_TRUST_20261017.json` e `config/spidey-governance.json`. Não reeditar/reaprovar os quatro SVGs rejeitados da PR #91.
6. **Manter referências exatas** de aeroportos/sedes separadas de Ginásios/Poképaradas confirmados; nunca habilitar GPX enganoso.
7. **Não enviar artes avulsas ao usuário** se a solicitação é integração no app; publicar somente depois de verificação de formato, conteúdo e funcionamento.
8. **Preservar funcionalidades:** FLY, calendário, Semana, selos, PvP, alertas, botão voltar, temas, link público.
9. **QA mínimo:** `node --test tests/*.test.cjs`, guardrails de governança, workflow do projeto; confrontar URL pública e SHA de deploy quando possível. Reportar exatamente o nível verificado.
10. **Manter decisões:** atualizar `SPIDEY_DECISIONS_CURRENT.md` se nova orientação mudar o comportamento. Usuário pode alterar prioridades; prevalece sua orientação mais recente. Anotar data, decisão exata, o que foi substituído, evidência/origem e quais testes/código a protegem. Sem fonte suficiente, registrar como não verificada, nunca como aprovada.
11. **Memória não é deploy:** não tratar Notion, guias históricos, resumos de chats/Work, automações antigas e PRs como prova de estado atual. Após cada tarefa reportar separadamente: decisão registrada, arquivo/PR, testes, merge, Pages/HTTP e Samsung físico. Não copiar conversas privadas nem segredos para o repositório público.

Não transformar instruções antigas de aprovação manual em exigência de ação do usuário: a delegação de QA visual existe, mas não substitui análise real.
