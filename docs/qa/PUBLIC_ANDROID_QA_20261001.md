# QA Android para preparação pública — 02/10/2026

**PENDENTE em aparelho físico.** Código conferido `10e28fc`; QA responsivo mobile/desktop em navegador remoto. App: https://spidey-pokemon-k2g2780qx-spidey3.vercel.app/spidey-app/index.html. Registrar aparelho/Android/Chrome, horário BRT, conexão e prova de cada resultado; iframe não comprova Android. Preview protegido pela Vercel; não alterar a proteção nem confundir acesso temporário com lançamento público.

| Caso | Ação no aparelho | Evidência necessária | Estado físico |
| --- | --- | --- | --- |
| Abertura | Abrir no Chrome, alternar Claro/Escuro/Sistema, navegar nas seis guias | Print legível, toque funcional | PENDENTE |
| Masters | Abrir Xerneas, Invasão, Cinderace, Seedot e Mega Victreebel | PNG original inteiro, Fechar acessível, detalhe no topo | PENDENTE |
| Novas candidatas | Calendário → Mostrar → 7/10 → Yveltal, Hora de Reides e Mega Blastoise | Arquivo correto completo; candidatas continuam PENDING_REVIEW | PENDENTE |
| FLY | Hora de Reides Yveltal e Cinderace, Essenciais/Todos | 20/28 referências, local/Brasília, Taipei e mudança de dia | PENDENTE |
| Coordenadas | Copiar, colar em campo de texto e abrir mapa | Valor copiado igual ao exibido | PENDENTE |
| Instalação | Adicionar à tela inicial/Instalar, abrir ícone | App abre e navega; conferir ícone e disponibilidade real de instalação | PENDENTE |
| Atualização | Abrir com rede, fechar e reabrir instalação anterior | Masters atuais corretos e dados novos; sem imagem vazia | PENDENTE |
| Offline | Após carregamento completo, fechar, modo avião, reabrir pelo ícone | Shell/dados/masters carregam; funções dependentes de rede identificadas | PENDENTE |
| Selos | Marcar/desmarcar, fechar/reabrir/recarregar | Progresso persiste no aparelho | PENDENTE |
| GPX | Japão 17/17: baixar GPX e inspecionar arquivo; PokéXciting 0/5 não oferece GPX completo | Arquivo XML válido e 17 pontos/ordem/coordenadas iguais ao catálogo | PENDENTE |
| Push | Conferir infraestrutura antes de permissão/envio autorizado | Recebimento real no aparelho; botão/arquivo de servidor não bastam | PENDENTE |

Prova de navegador nesta base: três candidatas no detalhe, mobile Claro/desktop Escuro, pôsteres completos; FLY Yveltal correto; masters preservados. A Home atual destaca Xerneas e só seis próximos, portanto as peças de 07/10 ficam no calendário. Semana 28/09–04/10 não mostra o novo lote. Seedot carregou após renovar acesso temporário Vercel; falha inicial e recuperação registradas no QA.

Progresso Selos foi 0→1/17 e persistiu ao fechar/reabrir; teste restaurado a 0/17. GPX Japão mostrou toast, mas o navegador remoto não retornou arquivo em duas tentativas: download/XML não aprovado. GPX incompleto PokéXciting bloqueado. Registro `stamps-browser-10e28fc-20261002.json`.

Precache: 70 arquivos locais, 28.777.950 bytes em disco; não é tráfego nem prova offline. Manifesto aponta logo JPEG 128×128 como `sizes:any`; confirmar instalação/ícone no aparelho. Configuração/recebimento push não comprovados; leitura do endpoint no conector retornou proteção Vercel.

Cobertura: 23 eventos, 5 APPROVED + 3 pôsteres em revisão + 15 sem arquivo Home/FLY. Applin/Espaço com recusas documentadas. Lançamento completo continua bloqueado; este roteiro não concede aprovação de arte/produção/funcionalidade sem evidência.
