// Private SQLite per Durable Object. One request commits all documents together.
export class DocumentStore {
  constructor(ctx) {
    this.ctx = ctx;
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS documents (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  }
  read(key) {
    const row = this.sql.exec('SELECT value FROM documents WHERE key = ?', key).toArray()[0];
    return row ? JSON.parse(row.value) : undefined;
  }
  write(key, value) {
    if (value === undefined) this.sql.exec('DELETE FROM documents WHERE key = ?', key);
    else this.sql.exec('INSERT INTO documents (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, JSON.stringify(value));
  }
  rows(prefix) {
    return this.sql.exec('SELECT key,value FROM documents WHERE key LIKE ?', prefix + '%').toArray().map(r => [r.key, JSON.parse(r.value)]);
  }
  async transaction(callback) {
    const pending = new Map();
    const view = {
      read: async key => structuredClone(pending.has(key) ? pending.get(key) : this.read(key)),
      mutate: async (key, fn) => {
        const next = fn(await view.read(key));
        pending.set(key, structuredClone(next));
        return structuredClone(next);
      },
    };
    const result = await callback(view);
    this.ctx.storage.transactionSync(() => { for (const [key, value] of pending) this.write(key, value); });
    return result;
  }
  reserveBudget(max, now = Date.now()) {
    const day = new Date(now).toISOString().slice(0, 10);
    const saved = this.read('_budget');
    const next = saved?.day === day ? saved : { day, count: 0 };
    if (next.count >= max) throw Object.assign(new Error('daily_limit'), { status: 429 });
    next.count++;
    this.write('_budget', next);
  }
}

export const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
export function errorResponse(error) {
  return json({ error: error.status ? error.message : 'service_error' }, error.status || 500);
}
export const fail = (code, status = 400) => { throw Object.assign(new Error(code), { status }); };

export class SerializedHub {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.store = new DocumentStore(ctx);
    this.tail = Promise.resolve();
  }
  serialized(fn) {
    const next = this.tail.then(fn);
    this.tail = next.catch(() => {});
    return next;
  }
}
