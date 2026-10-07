# Amigos e chat — 07/10/2026

Versão: `spidey-social-v1`. Anderson escolheu perfil por apelido sem e-mail nesta retomada. A participação é opcional; consultar eventos, selos e PvP continua sem perfil.

## Experiência

Perfil com apelido, país, região aproximada e interesses. Código de Treinador opcional, visível apenas após o aceite da conexão. A busca inclui somente quem marca a opção de aparecer. Código Spidey permite convite direto, sem publicar o perfil na busca. Pedidos exigem aceite do destinatário. Chat privado de texto, ações rápidas, bloqueio e denúncia. Não há upload de imagens/arquivos nem abertura automática de links.

Perfil válido por 30 dias, com renovação e pausa. A exclusão remove os campos de perfil e o histórico dos pares, mantendo um identificador e a chave pública para impedir reativação indevida. A limpeza dos dados do navegador perde o acesso; esta versão não oferece recuperação por e-mail, backup das chaves ou transferência do mesmo perfil entre aparelhos. Perfis diferentes podem conversar em aparelhos diferentes.

## Dados e acesso

- Chaves ECDSA e ECDH P-256 distintas, privadas e não exportáveis, no IndexedDB do navegador. O servidor recebe somente chaves públicas.
- Toda leitura privada e alteração exige assinatura ECDSA do perfil, com prazo de cinco minutos. Alterações têm proteção contra repetição e limite por perfil. Não se usam cookies de sessão, IP, idioma, fuso, GPS ou user-agent para identificar jogadores.
- Mensagem criptografada antes do envio: ECDH + HKDF-SHA256 + AES-GCM de 256 bits, IV aleatório de 12 bytes e contexto vinculando o par e o ID da mensagem. O servidor guarda ciphertext, remetente/destinatário, ID e horário. O texto é escapado na apresentação.
- Armazenamento Vercel Blob privado já existente, sem token exposto ao navegador. Leituras sem cache e alterações condicionadas ao ETag impedem sobreposição silenciosa de gravações concorrentes. Preview e produção têm espaços separados.
- Até 50 conexões por perfil, 15 envios/minuto e 20 alterações/minuto. Cadastro tem limite agregado diário sem registrar IP. Conversa: últimas 60 mensagens dos últimos 30 dias; limpeza ao abrir o chat e em lotes na rotina autenticada de alertas. Denúncias guardam motivo e identificadores, sem o texto; limpeza após 30 dias. Não há atendimento de moderação em tempo real.
- Busca e respostas privadas não entram no cache da PWA. Chat atualiza a cada 15 segundos apenas enquanto a conversa está aberta e a página visível; eventos/PvP não enviam atividade dos jogadores.

Não afirmar que o app trata zero dados ou que esta implementação elimina todo risco. Hosting recebe informações técnicas da conexão. O chat depende de navegador/aparelho íntegro e das chaves preservadas; não foi realizado pentest independente.

## Verificação

Candidato local: 87 testes Node, 4 Weekly e 3 de saúde passam. Os 12 testes sociais cobrem consentimento, minimização, assinatura/alteração indevida, aceite, acesso por terceiro, criptografia entre dois perfis, repetição/concorrência, bloqueio, denúncia, prazo, renovação e exclusão. A publicação e a escrita/leitura real do Blob ainda precisam da comprovação da prévia e das contas de teste. Atualizar esta seção com as provas antes de declarar a entrega pública.

Preservadas as pendências do guia: alertas recebidos no Android, instalação/atualização/offline, revisão completa de linguagem/artes e precisão/cobertura de Selos. As artes exatas, coordenadas, GPX, horários FLY e Taipei permanecem intactos.
