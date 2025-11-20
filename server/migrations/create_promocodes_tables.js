import { db } from '../db.js'

export function migratePromocodesTables() {
  try {
    const hasTable = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='promocodes'")
      .get()

    if (!hasTable) {
      console.log('[migration] Creating promocodes tables...')
      db.exec(`
        CREATE TABLE IF NOT EXISTS promocodes (
          code TEXT PRIMARY KEY,
          description TEXT,
          discountType TEXT NOT NULL,
          discountValue REAL NOT NULL,
          minSubtotal INTEGER NOT NULL DEFAULT 0,
          maxUses INTEGER,
          usageCount INTEGER NOT NULL DEFAULT 0,
          isActive INTEGER NOT NULL DEFAULT 1,
          expiresAt TEXT,
          lastUsedAt TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS promocode_usages (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL REFERENCES promocodes(code) ON DELETE CASCADE,
          usedAt TEXT NOT NULL,
          cartTotal INTEGER NOT NULL,
          discountApplied INTEGER NOT NULL,
          metadata TEXT,
          telegramUserId TEXT,
          telegramUsername TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_promocode_usages_code ON promocode_usages(code);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_promocode_usages_code_user ON promocode_usages(code, telegramUserId);
      `)
      console.log('[migration] Promocodes tables created successfully')
    } else {
      console.log('[migration] Promocodes tables already exist')
    }
  } catch (error) {
    console.error('[migration] Failed to create promocodes tables:', error)
    throw error
  }
}
