import { SerializedHub, json, errorResponse } from './store.js';
import { createSocialService } from './social.js';

const DAY = 86400000;
export class SocialHub extends SerializedHub {
  async fetch(request) {
    return this.serialized(async () => {
      try {
        const path = new URL(request.url).pathname;
        if (path === '/cleanup') { this.cleanup(); return json({ ok: true }); }
        if (request.method === 'GET') return json({ available: true, version: 'spidey-social-v1' });
        this.store.reserveBudget(6000);
        const envelope = await request.json();
        const result = await this.store.transaction(store => createSocialService(store).handle(envelope));
        return json(result);
      } catch (error) { return errorResponse(error); }
    });
  }
  cleanup() {
    const now = Date.now();
    this.ctx.storage.transactionSync(() => {
      const directory = this.store.read('directory');
      for (const [key, p] of this.store.rows('profiles/')) {
        // Expired profiles may be renewed for 30 days; deleted profiles contain no nickname or trainer code.
        if (p.expires_at < now - 30 * DAY) {
          this.store.write(key, undefined);
          if (directory) delete directory.profiles[p.id];
        } else if (directory && (p.deleted || p.disabled || p.expires_at <= now)) delete directory.profiles[p.id];
      }
      if (directory) this.store.write('directory', directory);
      for (const [key, pair] of this.store.rows('pairs/')) {
        if (pair.members.some(id => !this.store.read(`profiles/${id}`))) { this.store.write(key, undefined); continue; }
        const recent = (pair.messages || []).filter(m => m.at > now - 30 * DAY);
        if (recent.length !== pair.messages.length) this.store.write(key, { ...pair, messages: recent });
      }
      for (const [key, report] of this.store.rows('reports/')) {
        const reports = report.reports.filter(r => r.at > now - 30 * DAY);
        this.store.write(key, reports.length ? { reports } : undefined);
      }
    });
  }
}
