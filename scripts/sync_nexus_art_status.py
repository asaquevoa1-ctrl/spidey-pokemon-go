from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "SPIDEY_NEXUS.md"
MARKER = "## Atualização canônica — 28/09/2026 — Art System v1"

SECTION = r'''

---

## Atualização canônica — 28/09/2026 — Art System v1

### Nova prioridade visual do app

O usuário identificou um problema real no calendário: ao abrir eventos sem arte própria, o app mostrava o **logo do Spidey ampliado e em baixa qualidade**.

Isso passa a ser tratado como defeito de produto, não como fallback aceitável.

### Regra nova

O logo oficial do Spidey **não deve ser usado como arte principal de evento**.

Cada evento deve resolver arte por contexto:

- `thumb` = miniatura/lista;
- `card` = cards e resumo semanal;
- `hero` = tela individual do evento;
- `poster` = arte completa/compartilhável.

Documento técnico: `SPIDEY_ART_SYSTEM.md`.

### Padrão mínimo

- sem `data:`/base64 em evento publicado;
- sem logo ampliado como pôster;
- `hero/poster` real: mínimo recomendado `800x1200`, vertical;
- `weekly/card`: mínimo recomendado `720x900`;
- não esticar thumbnail pequena para tela cheia;
- falha de imagem deve cair para um fallback event-specific, nunca para o logo borrado.

### Fallback individual automático

Enquanto um evento ainda não possuir arte Premium real, o Spidey gera um **visual vetorial individual 1080×1620** com:

- título do evento;
- categoria;
- data/horário;
- tags;
- fonte;
- identidade Spidey.

Esses visuais são gerados por `scripts/generate_event_vector_art.py` em:

`spidey-app/assets/events/generated/`

Eles são fallback editorial de alta qualidade e **não devem ser chamados de Premium**.

Quando uma arte Premium real existir e passar no gate de qualidade, ela tem prioridade sobre o visual vetorial automático.

### Auditoria comprovada

Script: `scripts/audit_event_art.py`.

Primeira auditoria antes do fallback vetorial:

- 120 eventos no escopo setembro/outubro de 2026;
- 0 com Hero real pronto;
- 0 com Weekly real pronto;
- Festival das Luzes continuava aprovado e válido fora desse escopo mensal.

Após gerar os visuais individuais:

- 120/120 eventos setembro/outubro com cobertura `hero`;
- 120/120 com cobertura `weekly`;
- 120 usando fallback vetorial nesse escopo;
- 0 faltando arte funcional;
- Festival das Luzes preservado como arte real HQ e continua passando o gate.

Isso resolve o problema imediato de logo borrado, mas **não encerra o trabalho de arte Premium individual**.

### Próxima evolução visual

Prioridade após a entrada do Art System v1:

1. revisar no celular a aparência dos visuais individuais em lista/dia/detalhe;
2. substituir progressivamente os fallbacks dos eventos principais por artes Premium reais;
3. ligar a geração Premium ao fluxo de autopublicação de novos eventos;
4. usar os mesmos papéis de arte no `Spidey Weekly`;
5. nunca reduzir a qualidade do Festival das Luzes, que já é referência HQ aprovada.

### Regra de retomada

Ao receber `SPIDEYNEXUS`, conferir se `spidey-art-system-v1` já foi incorporado à `main`.

Se já estiver na `main`, considerar **logo borrado como fallback = corrigido** e continuar a evolução das artes Premium individuais.
'''


def main() -> int:
    text = PATH.read_text(encoding="utf-8")
    if MARKER in text:
        print("SPIDEY_NEXUS já contém Art System v1")
        return 0
    PATH.write_text(text.rstrip() + SECTION + "\n", encoding="utf-8")
    print("SPIDEY_NEXUS atualizado com Art System v1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
