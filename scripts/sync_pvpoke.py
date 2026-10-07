"""Import a validated PvPoke snapshot; visitors only request Spidey files."""
from __future__ import annotations

import hashlib
import json
import math
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'spidey-app/data/pvp.json'
REPO = 'https://api.github.com/repos/pvpoke/pvpoke'
LEAGUES = [('great', 'Grande', 1500), ('ultra', 'Ultra', 2500), ('master', 'Mestra', 10000)]


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'SpideyNexus-PvP-sync', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read(6_000_001)
    if len(raw) > 6_000_000:
        raise ValueError('Upstream file too large')
    return raw


def build(sha, game, rankings, checksums):
    if len(sha) != 40 or any(c not in '0123456789abcdef' for c in sha):
        raise ValueError('Invalid upstream commit')
    pokemon = {p['speciesId']: p for p in game['pokemon']}
    moves = {m['moveId']: m for m in game['moves']}
    used_species, used_moves, leagues = set(), set(), []
    for key, name, cp in LEAGUES:
        rows = rankings[key]
        if len(rows) < 100:
            raise ValueError(f'Incomplete rankings: {key}')
        seen, entries = set(), []
        for row in rows:
            species = row['speciesId']
            score = row['score']
            if species in seen or species not in pokemon or not isinstance(score, (int, float)) or not math.isfinite(score) or not 0 <= score <= 100:
                raise ValueError(f'Invalid ranking: {species}')
            seen.add(species)
            moveset = [m for m in row['moveset'] if m != 'none']
            if not 2 <= len(moveset) <= 3 or any(m not in moves for m in moveset):
                raise ValueError(f'Invalid moveset: {species}')
            opponents = {label: [m['opponent'] for m in row.get(label, [])[:5]] for label in ['matchups', 'counters']}
            if any(p not in pokemon for group in opponents.values() for p in group):
                raise ValueError(f'Unknown opponent: {species}')
            used_species.update([species, *opponents['matchups'], *opponents['counters']])
            used_moves.update(moveset)
            entries.append({'id': species, 'score': score, 'moveset': moveset, **opponents})
        leagues.append({'id': key, 'name': name, 'cp': cp, 'entries': entries})
    metadata = {species: {'name': pokemon[species]['speciesName'], 'dex': pokemon[species]['dex'], 'types': pokemon[species]['types'], 'elite': pokemon[species].get('eliteMoves', [])} for species in sorted(used_species)}
    move_data = {move: {'name': moves[move]['name'], 'type': moves[move]['type']} for move in sorted(used_moves)}
    return {'schema_version': 'spidey-pvp-v1', 'source': {'name': 'PvPoke', 'url': 'https://pvpoke.com/', 'repository': 'https://github.com/pvpoke/pvpoke', 'commit': sha, 'license': 'MIT', 'files_sha256': checksums}, 'updated_at': datetime.now(timezone.utc).isoformat(), 'pokemon': metadata, 'moves': move_data, 'leagues': leagues}


def main():
    sha = json.loads(download(REPO + '/branches/master'))['commit']['sha']
    base = f'https://raw.githubusercontent.com/pvpoke/pvpoke/{sha}/'
    paths = {'game': 'src/data/gamemaster.json', **{key: f'src/data/rankings/all/overall/rankings-{cp}.json' for key, _, cp in LEAGUES}}
    raw = {key: download(base + path) for key, path in paths.items()}
    parsed = {key: json.loads(value) for key, value in raw.items()}
    snapshot = build(sha, parsed['game'], parsed, {paths[key]: hashlib.sha256(value).hexdigest() for key, value in raw.items()})
    # Avoid daily commits and deployments when the upstream content is unchanged.
    if OUTPUT.exists():
        previous = json.loads(OUTPUT.read_text())
        if previous['source']['files_sha256'] == snapshot['source']['files_sha256']:
            print('PvPoke content unchanged; keeping the last verified snapshot.')
            return
    OUTPUT.write_text(json.dumps(snapshot, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print('PvPoke verified:', sha, ', '.join(f"{l['name']}: {len(l['entries'])}" for l in snapshot['leagues']))


if __name__ == '__main__':
    main()
