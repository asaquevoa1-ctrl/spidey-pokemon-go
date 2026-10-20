"""Regressions for editorial deduplication and fail-closed art policy."""
from pathlib import Path
import json
from auto_curate_pending import duplicate, canonical_source_url, requires_original_art

official_minior = {
    "_source_id": "oficial-https://pokemongo.com/pt-BR/news/minior-meteor-showers-2026",
    "url": "https://pokemongo.com/pt-BR/news/minior-meteor-showers-2026",
    "mensagem": "Encontros com Minior e Poeira Estelar durante chuvas em novembro.",
}
pogo_groudon = {
    "_source_id": "pokeminers-1562149576536760454",
    "url": "https://pokemongo.com/en/news/go-pass-november-2026",
    "mensagem": "Passe GO novembro: Groudon, 1400 PokéMoedas, 400 grátis, 1000 no Deluxe, Poeira Estelar.",
}
assert not duplicate(pogo_groudon, official_minior), "Minior must never block new Groudon GO Pass"
same_groudon = {
    "_source_id": "oficial-https://pokemongo.com/pt-BR/news/go-pass-november-2026",
    "url": "https://pokemongo.com/pt-BR/news/go-pass-november-2026",
    "mensagem": "GO Pass November and Groudon encounter",
}
assert duplicate(pogo_groudon, same_groudon), "Same article, different locales = duplicate"
assert canonical_source_url(pogo_groudon) == canonical_source_url(same_groudon)
unrelated_a={"_source_id":"pokeminers-123","mensagem":"Groudon PokéMoedas novembro novidades"}
unrelated_b={"_source_id":"oficial-456","mensagem":"Kyogre PokéMoedas novembro novidades"}
assert not duplicate(unrelated_a,unrelated_b), "Two common nouns are not strong evidence"
queue_file=Path("queue/pending/2026-10-20/earn-pokecoins-for-progressing-in-go-pass-november-2818d6f061e8.json")
queue=json.loads(queue_file.read_text(encoding="utf-8"))
assert requires_original_art(queue)
assert queue["status"] in {"aguardando_arte_chatgpt", "duplicado"}
official_file=Path("queue/pending/2026-10-20/oficial-noticia-899939c69e74.json")
official=json.loads(official_file.read_text(encoding="utf-8"))
assert official["_source_id"]=="oficial-https://pokemongo.com/pt-BR/news/go-pass-november-2026"
assert official["status"]=="aguardando_arte_chatgpt"
assert requires_original_art(official)
if queue["status"]=="duplicado":
    assert queue["duplicate_of"]==official["_source_id"], "Must dedupe against the exact official article, never Minior"
else:
    assert "duplicate_of" not in queue
print("PASS: Groudon deduplication, canonical source and Premium art guards")
