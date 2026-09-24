#!/usr/bin/env python3
import argparse
import json
from datetime import date, datetime, time
from pathlib import Path
from zoneinfo import ZoneInfo

DEFAULT_CONFIG = Path("config/world_event_points.json")


def parse_hhmm(value: str) -> time:
    return datetime.strptime(value.strip(), "%H:%M").time()


def fmt_hora(dt: datetime) -> str:
    return dt.strftime("%Hh%M")


def fmt_data_br(d: date) -> str:
    meses = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
    ]
    return f"{d.day:02d} DE {meses[d.month - 1]}"


def calcular(event_date: date, inicio: time, fim: time, config_path: Path = DEFAULT_CONFIG):
    config = json.loads(config_path.read_text(encoding="utf-8"))
    ref_tz = ZoneInfo(config["reference_timezone"])
    rows = []
    for point in config["points"]:
        local_tz = ZoneInfo(point["timezone"])
        local_start = datetime.combine(event_date, inicio, tzinfo=local_tz)
        local_end = datetime.combine(event_date, fim, tzinfo=local_tz)
        br_start = local_start.astimezone(ref_tz)
        br_end = local_end.astimezone(ref_tz)
        rows.append({
            **point,
            "local_start": local_start.isoformat(),
            "local_end": local_end.isoformat(),
            "brasilia_start": br_start.isoformat(),
            "brasilia_end": br_end.isoformat(),
            "brasilia_date": br_start.date().isoformat(),
            "brasilia_time": br_start.strftime("%H:%M"),
        })
    rows.sort(key=lambda x: (x["brasilia_start"], x.get("order", 999)))
    return config, rows


def texto(event_date: date, inicio: time, fim: time, config_path: Path = DEFAULT_CONFIG) -> str:
    config, rows = calcular(event_date, inicio, fim, config_path)
    out = [config.get("display_title", "🇧🇷 HORÁRIOS DE BRASÍLIA")]
    current_date = None
    for row in rows:
        dt = datetime.fromisoformat(row["brasilia_start"])
        if dt.date() != current_date:
            if current_date is not None:
                out.append("")
                out.append(f"📅 DIA SEGUINTE • {fmt_data_br(dt.date())}")
            else:
                out.append("")
                out.append(f"📅 {fmt_data_br(dt.date())}")
            current_date = dt.date()
        out += [
            "",
            f"{fmt_hora(dt)} — {row['flag']} {row['name']}",
            f"📍 {row['lat']:.6f},{row['lon']:.6f}",
        ]
    return "\n".join(out).strip()


def main():
    ap = argparse.ArgumentParser(description="Converte um evento de horário local para a grade mundial do Spidey em horário de Brasília.")
    ap.add_argument("--date", required=True, help="Data local do evento: YYYY-MM-DD")
    ap.add_argument("--start", required=True, help="Hora inicial local: HH:MM")
    ap.add_argument("--end", required=True, help="Hora final local: HH:MM")
    ap.add_argument("--config", default=str(DEFAULT_CONFIG))
    ap.add_argument("--json", action="store_true", help="Imprime JSON em vez do texto pronto para postagem")
    args = ap.parse_args()

    event_date = date.fromisoformat(args.date)
    inicio = parse_hhmm(args.start)
    fim = parse_hhmm(args.end)
    config_path = Path(args.config)

    if args.json:
        config, rows = calcular(event_date, inicio, fim, config_path)
        print(json.dumps({"reference_timezone": config["reference_timezone"], "rows": rows}, ensure_ascii=False, indent=2))
    else:
        print(texto(event_date, inicio, fim, config_path))


if __name__ == "__main__":
    main()
