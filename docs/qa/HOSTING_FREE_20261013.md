# Hospedagem gratuita — decisão de 13/10/2026

## Decisão de produto
O usuário não pretende pagar por Vercel e determinou que o projeto não dependa dessa plataforma.

- **Hospedagem web padrão:** GitHub Pages (repositório público, GitHub Free).
- **Endereço do Spidey para jogadores:** https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/
- **PR e QA:** GitHub Actions testa a aplicação e cria um pacote estático de prévia para download, sem custo de Vercel. Esse pacote não é, por si só, um link para abrir o app no navegador.
- **Publicação:** somente após validar e aprovar a PR; publicar pela action existente, preservando URLs e demais funcionalidades.
- **Limitações:** Pages é estático. Notificações push agendadas, armazenamento de contas e Amigos/chat exigem backend; não apresentar essas funções como operantes sem infraestrutura gratuita validada.
- **Dados Caçador Global:** filtros/links para provedor externo podem funcionar sem backend. Não hospedar nem redistribuir feeds de aparições de terceiros sem permissão. Não coletar código de treinador ou credenciais.
- **Segurança e privacidade:** os recursos que exigem identificação permanecem desativados até existir arquitetura revisada.
- **Sem cobrança:** não contratar planos, cadastrar cartão ou fazer upgrade sem aprovação explícita. Monitorar os limites do plano gratuito existente.

## Evidência e status
Registros de 11/10 mostram publicação e monitoramento de GitHub Pages bem-sucedidos. O fluxo atual foi verificado no arquivo `.github/workflows/spidey-pages.yml`: deploy apenas de `main`; em PR apenas build/QA.

Em 13/10, uma tentativa de prévia no Vercel retornou erro 402 `resource_creation_blocked` por limite de uso da equipe. Nenhuma publicação foi realizada por essa tentativa.

**Estado desta decisão no código:** proposta na PR #58; não implica que a nova função esteja disponível no endereço público até merge e publicação verificados.
