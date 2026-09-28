from __future__ import annotations

import html
import json
import re
import textwrap
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS_FILE = ROOT / "spidey-app" / "data" / "events.json"
OUTPUT_DIR = ROOT / "spidey-app" / "assets" / "events" / "generated"

WIDTH = 1080
HEIGHT = 1620

CATEGORY = {
    "spotlight_hour": ("SPOTLIGHT HOUR", "#43D6FF"),
    "raid_hour": ("RAID HOUR", "#56A8FF"),
    "raid_rotation": ("REIDES", "#56A8FF"),
    "mega_raid_rotation": ("MEGA REIDES", "#8E7CFF"),
    "shadow_raids": ("SHADOW RAIDS", "#B983FF"),
    "max_monday": ("MAX MONDAY", "#E253FF"),
    "max_battle_day": ("MAX BATTLE DAY", "#E253FF"),
    "community_day": ("COMMUNITY DAY", "#48D597"),
    "go_battle_league": ("GO BATTLE LEAGUE", "#48A9D5"),
    "evento_especial": ("EVENTO ESPECIAL", "#F3C75A"),
    "regional_event": ("EVENTO REGIONAL", "#F3A75A"),
    "daily_discovery": ("DESCOBERTA DIÁRIA", "#43D6FF"),
    "go_fest": ("GO FEST", "#F3C75A"),
    "timed_research": ("PESQUISA TEMPORÁRIA", "#65D5C6"),
    "team_go_rocket": ("TEAM GO ROCKET", "#FF6B78"),
    "hatch_day": ("HATCH DAY", "#F3C75A"),
    "raid_day": ("RAID DAY", "#56A8FF"),
}


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    return value.strip("-") or "evento"


def esc(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def wrap_lines(text: str, width: int, max_lines: int) -> list[str]:
    clean = " ".join(str(text or "").split())
    if not clean:
        return []
    lines = textwrap.wrap(clean, width=width, break_long_words=False, break_on_hyphens=False)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        if lines[-1] and not lines[-1].endswith("…"):
            lines[-1] = lines[-1].rstrip(" .") + "…"
    return lines


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def event_range(event: dict) -> str:
    schedule = event.get("schedule") or {}
    start = parse_dt(schedule.get("start_brazil") or schedule.get("start_local"))
    end = parse_dt(schedule.get("end_brazil") or schedule.get("end_local"))
    if not start or not end:
        return "Horário a confirmar"
    if start.date() == end.date():
        return f"{start:%d/%m/%Y} • {start:%H:%M}–{end:%H:%M}"
    return f"{start:%d/%m %H:%M} → {end:%d/%m %H:%M}"


def svg_text_lines(lines: list[str], x: int, y: int, size: int, weight: int, line_height: int, fill: str, max_width: int | None = None) -> str:
    spans = []
    for index, line in enumerate(lines):
        yy = y + index * line_height
        attrs = f' x="{x}" y="{yy}"'
        spans.append(f'<text{attrs} font-size="{size}" font-weight="{weight}" fill="{fill}" font-family="Inter,Arial,sans-serif">{esc(line)}</text>')
    return "\n".join(spans)


def build_svg(event: dict) -> str:
    category_key = str(event.get("category") or "evento")
    category_label, accent = CATEGORY.get(category_key, (category_key.replace("_", " ").upper(), "#43D6FF"))
    title_lines = wrap_lines(event.get("title") or "Evento Pokémon GO", 25, 4)
    summary_lines = wrap_lines(event.get("summary") or "", 48, 3)
    tags = [str(tag) for tag in (event.get("tags") or [])[:3]]
    range_text = event_range(event)
    source_name = ((event.get("source") or {}).get("name") or "Spidey Pokémon GO")

    title_y = 590
    title = svg_text_lines(title_lines, 84, title_y, 76, 900, 86, "#F7FBFF")
    summary_y = title_y + max(1, len(title_lines)) * 86 + 54
    summary = svg_text_lines(summary_lines, 84, summary_y, 31, 500, 44, "#C0CEE0")
    tags_y = 1288

    tag_chunks = []
    cursor = 84
    for tag in tags:
        label = tag[:24]
        width = max(116, min(300, 26 + len(label) * 15))
        tag_chunks.append(
            f'<rect x="{cursor}" y="{tags_y}" width="{width}" height="54" rx="27" fill="{accent}" fill-opacity="0.12" stroke="{accent}" stroke-opacity="0.32"/>'
            f'<text x="{cursor + 18}" y="{tags_y + 35}" font-size="22" font-weight="700" fill="#DCEBFA" font-family="Inter,Arial,sans-serif">{esc(label)}</text>'
        )
        cursor += width + 14
        if cursor > 920:
            break

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-labelledby="title desc">
<title id="title">{esc(event.get("title") or "Evento Pokémon GO")}</title>
<desc id="desc">Arte vetorial automática Spidey para {esc(category_label)}. Não é a arte Premium final.</desc>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#10234A"/>
    <stop offset="0.55" stop-color="#07162D"/>
    <stop offset="1" stop-color="#050B16"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.82" cy="0.08" r="0.62">
    <stop offset="0" stop-color="{accent}" stop-opacity="0.38"/>
    <stop offset="1" stop-color="{accent}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<rect width="1080" height="1620" fill="url(#bg)"/>
<rect width="1080" height="1620" fill="url(#glow)"/>
<circle cx="888" cy="190" r="250" fill="none" stroke="{accent}" stroke-opacity="0.20" stroke-width="3"/>
<circle cx="888" cy="190" r="190" fill="none" stroke="{accent}" stroke-opacity="0.12" stroke-width="2"/>
<circle cx="888" cy="190" r="125" fill="none" stroke="{accent}" stroke-opacity="0.10" stroke-width="2"/>
<path d="M0 1180 L1080 840" stroke="{accent}" stroke-opacity="0.07" stroke-width="3"/>
<path d="M0 1260 L1080 920" stroke="#F3C75A" stroke-opacity="0.05" stroke-width="3"/>
<circle cx="130" cy="220" r="80" fill="{accent}" fill-opacity="0.10" filter="url(#soft)"/>

<text x="84" y="105" font-size="28" font-weight="900" letter-spacing="8" fill="#43D6FF" font-family="Inter,Arial,sans-serif">SPIDEY</text>
<text x="84" y="148" font-size="20" font-weight="700" letter-spacing="4" fill="#98ABC7" font-family="Inter,Arial,sans-serif">POKÉMON GO • EVENTO</text>

<rect x="84" y="240" width="{min(780, 48 + len(category_label) * 17)}" height="64" rx="32" fill="{accent}" fill-opacity="0.15" stroke="{accent}" stroke-opacity="0.45"/>
<text x="112" y="282" font-size="25" font-weight="900" letter-spacing="2" fill="{accent}" font-family="Inter,Arial,sans-serif">{esc(category_label)}</text>

<text x="84" y="410" font-size="28" font-weight="800" letter-spacing="3" fill="#F3C75A" font-family="Inter,Arial,sans-serif">{esc(range_text)}</text>
{title}
{summary}

<line x1="84" y1="1210" x2="996" y2="1210" stroke="#43D6FF" stroke-opacity="0.18"/>
{''.join(tag_chunks)}

<text x="84" y="1455" font-size="20" font-weight="700" fill="#98ABC7" font-family="Inter,Arial,sans-serif">FONTE</text>
<text x="84" y="1494" font-size="24" font-weight="700" fill="#DCE7F5" font-family="Inter,Arial,sans-serif">{esc(source_name[:62])}</text>
<text x="84" y="1560" font-size="18" font-weight="700" letter-spacing="2" fill="#F3C75A" font-family="Inter,Arial,sans-serif">VISUAL AUTOMÁTICO • ARTE PREMIUM AINDA NÃO DISPONÍVEL</text>
</svg>'''


def main() -> int:
    doc = json.loads(EVENTS_FILE.read_text(encoding="utf-8"))
    events = [event for event in doc.get("events", []) if event.get("status") == "published" and event.get("id")]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    expected = set()
    for event in events:
        filename = f"{slugify(str(event['id']))}.svg"
        expected.add(filename)
        path = OUTPUT_DIR / filename
        content = build_svg(event)
        if not path.exists() or path.read_text(encoding="utf-8") != content:
            path.write_text(content, encoding="utf-8")
    for stale in OUTPUT_DIR.glob("*.svg"):
        if stale.name not in expected:
            stale.unlink()
    print(json.dumps({"generated": len(events), "directory": str(OUTPUT_DIR.relative_to(ROOT))}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
