# SPIDEYNEXUS — validação mobile do App v2.1

Este arquivo complementa `SPIDEYNEXUS_APP_V2.md` e passa a valer junto da palavra-chave `SPIDEYNEXUS`.

## Origem

Decisões consolidadas após validação em vídeo de uso real no celular em 29/09/2026.

A validação visual do app não pode se limitar a código, screenshot isolado ou desktop. O fluxo real de rolagem no celular é critério obrigatório.

## O que o vídeo confirmou

O App v2 melhorou contraste e reduziu parte da aparência de slides, mas ainda apresentava problemas claros:

- títulos duplicados por `eyebrow + heading`, como `HOJE / Hoje` e `PRÓXIMOS DIAS / Próximos dias`;
- cards de Hoje/Próximos ainda altos demais e com aparência de mini-slide;
- tela Semana com título grande, KPIs e card de agenda ainda lembrando apresentação;
- tela de Selos com aparência de painel administrativo, especialmente pela repetição de `imagem pendente`;
- termos internos como `Com arte`, `DATAHUB / ROTA` e mensagens técnicas não pertencem à interface pública;
- arte quebrada não pode reservar uma área gigante vazia no detalhe do evento;
- controles ativos do modo claro precisam manter contraste forte.

## Regras v2.1

1. Hoje e Próximos dias usam cards horizontais compactos no celular.
2. Rótulo e título com o mesmo significado não devem aparecer juntos.
3. Semana deve privilegiar leitura rápida por dia, sem apresentação de KPIs em cards.
4. `Com arte` é estado técnico e não deve ser apresentado ao público.
5. Selos deve parecer rota/coleção do jogador, não dashboard de administração.
6. Quando não houver imagem de selo, mostrar representação neutra e o número; não repetir `imagem pendente` em todos os cards.
7. `DATAHUB`, `pipeline`, `Premium`, `visual automático`, `curadoria` e equivalentes ficam nos bastidores.
8. Se uma arte falhar no carregamento, a área da arte deve colapsar. Nunca deixar retângulo vazio ocupando uma tela.
9. No modo claro, estado ativo de filtro, aba e botão deve continuar legível sem texto branco lavado em fundo claro.
10. O modo escuro continua como referência de contraste já aprovada.
11. Artes Premium aprovadas continuam soberanas; o v2.1 altera interface e encaixe, não redesenha a peça aprovada.
12. Seedot permanece aprovado com data 2026; o pequeno borrão no algarismo 6 é aceitável e não exige retrabalho.

## Critério de aceite

Uma alteração visual do app só deve ser considerada concluída quando o uso real no celular mostrar:

- leitura rápida sem esforço;
- ausência de blocos vazios gigantes;
- rolagem com ritmo de feed/app;
- hierarquia visual evidente;
- linguagem natural de jogador;
- ausência de termos de bastidor;
- contraste suficiente em claro e escuro;
- nenhuma regressão nas artes já aprovadas.
