import json
import tempfile
import unittest
from pathlib import Path

from scripts.build_spidey_pages import ROOT, read_push, prepare_shell, read_analytics, build
from scripts.check_app_health import validate_shell


class PushOnlyPagesTests(unittest.TestCase):
    def test_disabled_by_default(self):
        with tempfile.TemporaryDirectory() as temp:
            disabled=read_push(Path(temp))
            self.assertEqual(disabled, {
                'enabled':False, 'url':None, 'hosting':'cloudflare-workers'})
        source=(ROOT/'spidey-app/index.html').read_text(encoding='utf-8')
        shell=prepare_shell(source,read_analytics(ROOT),disabled)
        self.assertEqual(validate_shell(shell,{},'github-pages'), [])
        self.assertIn('name="spidey-push" content="off"', shell)

    def test_source_contains_no_social_hooks(self):
        app=ROOT/'spidey-app'
        self.assertNotIn('friendsView', (app/'push-endpoint.js').read_text())
        self.assertNotIn('api/social', (app/'push.js').read_text())
        self.assertNotIn('friendsView', (ROOT/'services/spidey-backend/src/worker.js').read_text())
        self.assertNotIn('/api/social', (ROOT/'services/spidey-backend/src/worker.js').read_text())

    def test_forbid_malicious_worker_urls(self):
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/'config'
            path.mkdir()
            good='https://spidey-push.test-account.workers.dev'
            for url in ('http://spidey.workers.dev','https://evil.example',
                        'https://evil.workers.dev/bad','https://evil.workers.dev@evil.example',
                        'https://evil.workers.dev?token=1', 'https://EVIL.workers.dev'):
                (path/'spidey-push.json').write_text(json.dumps({'enabled':True,'url':url,'hosting':'cloudflare-workers'}))
                with self.assertRaises(ValueError):
                    read_push(Path(temp))
            (path/'spidey-push.json').write_text(json.dumps({'enabled':True,'url':good,'hosting':'cloudflare-workers'}))
            self.assertEqual(read_push(Path(temp))['url'],good)

    def test_enabled_shell_adds_only_exact_worker_origin(self):
        source=(ROOT/'spidey-app/index.html').read_text()
        analytics=read_analytics(ROOT)
        worker='https://spidey-push.example.workers.dev'
        shell=prepare_shell(source,analytics,{'enabled':True,'url':worker,'hosting':'cloudflare-workers'})
        self.assertEqual(validate_shell(shell,{},'github-pages'), [])
        self.assertIn(worker,shell)
        token="connect-src &#x27;self&#x27; " + worker
        self.assertIn(token, shell)
        extra=shell.replace(token, token + " https://thirdparty.example")
        self.assertNotEqual(extra,shell)
        self.assertIn('Política de conexões do app ausente ou ampliada',validate_shell(extra,{},'github-pages'))

    def test_package_has_exact_push_config_and_no_static_subscription_endpoint(self):
        info=json.loads((ROOT/'config/spidey-push.json').read_text())
        weekly=json.loads((ROOT/'spidey-app/data/weekly.json').read_text())
        from datetime import date
        with tempfile.TemporaryDirectory() as temp:
            output=Path(temp)/'pages'
            report=build(output,today=date.fromisoformat(weekly['week_start']))
            self.assertEqual(report['push']['configured'],info['enabled'])
            app=output/'spidey-app'
            self.assertEqual(json.loads((app/'push-config.json').read_text()),info)
            self.assertIn('SpideyPushBackend', (app/'push-endpoint.js').read_text())
            self.assertFalse(json.loads((app/'api/push/public-key').read_text())['available'])
            shell=(app/'index.html').read_text()
            if info['enabled']:
                self.assertIn('name="spidey-push" content="' + info['url'] + '"', shell)
            else:
                self.assertIn('name="spidey-push" content="off"', shell)


if __name__=='__main__':
    unittest.main()
