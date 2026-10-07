# PvP, Chicago, privacidade e monitoramento — 07/10/2026

PR 22 integrada em `d4c9c14d0a780b79f251782ed0dedf869a0e658b`. Produção Vercel `dpl_z7Gkp78eerqELxbSTXuVZd6EkwC7`, READY. Link público permanente: https://spidey-pokemon-go.vercel.app/spidey-app/ . Atualizações posteriores de calendário/Weekly devem ser preservadas.

Mapa substituído por PvP: Grande/Ultra/Mestra, busca, tipos, golpes, confrontos e time de três Pokémon salvo apenas no aparelho. Snapshot PvPoke com origem imutável, atribuição MIT e sincronização diária. Arquivos e rotas antigos de mapas/selos continuam disponíveis onde são necessários.

Chicago: Pokémon Fossil Museum no Field Museum, evento oficial de 22/05/2026 a 11/04/2027; atividades diárias 9h–21h no local, com conversão pela data em America/Chicago e America/Sao_Paulo. No navegador público, 07/10: local 9h–21h, Brasília 11h–23h. Horários do edifício/ingresso do museu são distintos. Nenhuma coordenada exata de Poképarada ou GPX foi inventada.

75 testes Node, 4 Weekly e 3 de saúde passam. Checks GitHub de app/pipeline passam para `1d524f4`. Prévia mobile: busca Azumarill, golpes, seleção de time, retorno e tema escuro; Chicago e horários visíveis. Acesso público sem login confirmado no domínio permanente. HTTP público: `PVP_PUBLIC_HEALTH_20261007.json`, 12 verificações, nenhuma falha.

Workflow de saúde programado `2/5 * * * *`, somente GET/HEAD públicos, sem telemetria de jogadores nem disparo de push. A primeira execução após publicação viu catálogo local ainda anterior e apontou Chicago ausente; execução agendada 37659778814 depois passou. Incluída repetição limitada após novas publicações para acomodar o cache de catálogo. GitHub pode atrasar cron: cinco minutos é a programação, não uma garantia. Acompanhamento ChatGPT “Saúde do Spidey” criado por hora, avisando falha/recuperação ou atraso persistente, sem mensagens a outras pessoas.

Privacidade explicita escolhas locais, assinatura opcional de push e logs técnicos do hosting. Removidos idioma/fuso do cadastro push e geração automática de imagens externas. Cabeçalhos de segurança presentes; originais Premium preservados. Não há afirmação de zero dados, segurança absoluta ou recebimento de push no Android.
