#!/usr/bin/env python3
"""Prevent a GitHub merge if the user-approved ANA PNGs were not uploaded byte-for-byte."""
import hashlib, json, pathlib, struct, unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'spidey-app/data/ana-pokemon-jet-approved-originals.json'
class OriginalArtworkGate(unittest.TestCase):
    def test_manifest_and_exact_bytes(self):
        m=json.loads(MANIFEST.read_text(encoding='utf8'))
        self.assertEqual(m['status'],'USER_APPROVED_ORIGINALS__BINARY_UPLOAD_PENDING')
        self.assertEqual(len(m['user_assets']),2)
        for a in m['user_assets']:
            path=ROOT/'spidey-app'/a['file']
            self.assertTrue(path.is_file(),f"Missing exact approved file: {path}. Do not replace with an AI-generated alternative.")
            raw=path.read_bytes()
            self.assertEqual(len(raw),a['size_bytes'])
            self.assertEqual(hashlib.sha256(raw).hexdigest(),a['sha256'],f"Do not redraw or recompress: {path}")
            self.assertTrue(raw.startswith(b'\x89PNG\r\n\x1a\n'))
            self.assertEqual(struct.unpack('>II',raw[16:24]),(a['width'],a['height']))
    def test_integrated_app_uses_manifest_not_rejected_art(self):
        js=(ROOT/'spidey-app/ana-airports.js').read_text(encoding='utf8')
        self.assertIn('ana-pokemon-jet-approved-originals.json',js)
        self.assertIn('anaEventPoster',js)
        self.assertIn('anaPosterEnlarge',js)
        self.assertIn('Ginásio NÃO verificado',js)
        registry=(ROOT/'spidey-app/premium-approved-master.js').read_text(encoding='utf8')
        for event_id in ('2026-ana-pokemon-jet-red','2026-ana-pokemon-jet-green'):
            self.assertNotIn('"'+event_id+'":',registry)
if __name__=='__main__': unittest.main()
