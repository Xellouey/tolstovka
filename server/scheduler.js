import { db } from './db.js';

const DEFAULT_INTERVAL_MS = Number(process.env.SCHEDULER_INTERVAL_MS || 30000);

function nowIso() {
  return new Date().toISOString();
}

function publishDrop(drop, publishedAt) {
  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE drops SET status = 'published', releasedAt = ?, updatedAt = ? WHERE id = ? AND status = 'scheduled'`
    ).run(publishedAt, publishedAt, drop.id);

    db.prepare(
      `UPDATE products
       SET status = 'published', publishedAt = ?, publishAt = NULL
       WHERE dropId = ? AND status = 'scheduled'`
    ).run(publishedAt, drop.id);
  });

  tx();
}

function publishStandaloneProduct(productId, publishedAt) {
  db.prepare(
    `UPDATE products
     SET status = 'published', publishedAt = ?, publishAt = NULL
     WHERE id = ? AND status = 'scheduled'`
  ).run(publishedAt, productId);
}

function fetchDueDrops(reference) {
  const rows = db.prepare(
    `SELECT id FROM drops WHERE status = 'scheduled' AND publishAt IS NOT NULL AND publishAt <= ?`
  ).all(reference);
  return rows || [];
}

function fetchDueStandaloneProducts(reference) {
  const rows = db.prepare(
    `SELECT id FROM products
     WHERE status = 'scheduled'
       AND publishAt IS NOT NULL
       AND publishAt <= ?
       AND (dropId IS NULL OR dropId = '')`
  ).all(reference);
  return rows || [];
}

export function initScheduler({ intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  const interval = Math.max(5000, intervalMs);

  const tick = () => {
    try {
      const reference = nowIso();
      const drops = fetchDueDrops(reference);
      if (drops.length) {
        console.info(`[scheduler] Found ${drops.length} drops ready for publication`);
        drops.forEach((drop) => publishDrop(drop, reference));
      }

      const standalone = fetchDueStandaloneProducts(reference);
      if (standalone.length) {
        console.info(`[scheduler] Found ${standalone.length} products ready for publication`);
        standalone.forEach((row) => publishStandaloneProduct(row.id, reference));
      }
    } catch (err) {
      console.error('[scheduler] Tick failed:', err);
    }
  };

  tick();
  const timer = setInterval(tick, interval);
  timer.unref?.();

  console.log(`[scheduler] Scheduler initialized (interval ${interval}ms)`);
  return timer;
}
