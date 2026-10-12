import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const output = 'test-results/premium-calendar-visibility';
const cases = [
  { id: '2026-10-sandile-hatch-day', day: 17, file: 'assets/events/premium/sandile-hatch-day-20261017-approved-v1.png' },
  { id: '2026-10-dynamax-max-battle-day', day: 24, file: 'assets/events/premium/lake-trio-max-battle-day-20261024-approved-v1.png' },
  { id: '2026-10-halloween-go-pass', day: 27, file: 'assets/events/premium/halloween-go-pass-20261027-1105-approved-v1.png' },
];

fs.mkdirSync(output, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '4173', '--directory', '.'], { stdio: 'ignore' });
let ready = false;
for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    const response = await fetch('http://127.0.0.1:4173/spidey-app/index.html');
    if (response.ok) { ready = true; break; }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 250));
}
if (!ready) { server.kill('SIGTERM'); throw new Error('static preview server did not become ready'); }

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
const checks = [];
try {
  for (const width of [390, 1280]) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: 'America/Sao_Paulo' });
    await page.addInitScript(({ theme }) => localStorage.setItem('spidey-theme', theme), { theme });
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.state?.events?.length > 0);
    await page.evaluate(() => { state.month = new Date(2026, 9, 1); renderCalendar(); });

    for (const item of cases) {
      const index = await page.evaluate((day) => {
        const first = new Date(2026, 9, 1);
        const gridStart = new Date(2026, 9, 1 - first.getDay());
        return Math.round((new Date(2026, 9, day) - gridStart) / 86400000);
      }, item.day);
      await page.locator('#calendar .calendar-day').nth(index).click();
      const card = page.locator(`#eventDetail .v24-day-event[data-event-id="${item.id}"]`);
      await card.waitFor({ state: 'visible' });
      const image = card.locator('.v24-day-event-art');
      await image.waitFor({ state: 'visible' });
      await image.evaluate((img) => img.decode());
      const result = await image.evaluate((img, expected) => {
        const rect = img.getBoundingClientRect();
        return {
          src: img.getAttribute('src'), natural: [img.naturalWidth, img.naturalHeight],
          displayed: [Math.round(rect.width), Math.round(rect.height)],
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          expected,
        };
      }, item.file);
      if (!result.src.includes(item.file) || result.natural[0] !== 1024 || result.natural[1] !== 1536 || result.displayed[0] < 50 || result.displayed[1] < 75 || result.overflow) {
        throw new Error(`${item.id} calendar artwork failed ${JSON.stringify(result)}`);
      }
      checks.push({ width, theme, event_id: item.id, view: 'calendar', ...result });
      await page.screenshot({ path: `${output}/${width}-${theme}-${item.day}.png`, fullPage: true });
      await page.locator('#eventDialog').evaluate((dialog) => dialog.close());
    }
    await page.close();
  }
  fs.writeFileSync(`${output}/result.json`, `${JSON.stringify({ status: 'PASSED_PREVIEW', checks, physical_android_tested: false }, null, 2)}\n`);
  console.log(JSON.stringify({ status: 'PASSED_PREVIEW', checks: checks.length }));
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
