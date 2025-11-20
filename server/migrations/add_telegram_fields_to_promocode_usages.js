import { db } from '../db.js'

export function migrateAddTelegramFieldsToPromocodeUsages() {
  try {
    const pragma = db.prepare("PRAGMA table_info(promocode_usages)").all()
    const hasUserId = pragma.some(column => column.name === 'telegramUserId')
    const hasUsername = pragma.some(column => column.name === 'telegramUsername')

    if (!hasUserId) {
      db.prepare('ALTER TABLE promocode_usages ADD COLUMN telegramUserId TEXT').run()
    }

    if (!hasUsername) {
      db.prepare('ALTER TABLE promocode_usages ADD COLUMN telegramUsername TEXT').run()
    }

    const indexInfo = db
      .prepare("SELECT sql FROM sqlite_master WHERE type='index' AND name='idx_promocode_usages_code_user'")
      .get()

    if (!indexInfo || !indexInfo.sql?.includes('telegramUserId')) {
      if (indexInfo) {
        db.prepare('DROP INDEX IF EXISTS idx_promocode_usages_code_user').run()
      }
      db.prepare('CREATE UNIQUE INDEX idx_promocode_usages_code_user ON promocode_usages(code, telegramUserId)').run()
    }
  } catch (error) {
    console.error('[migration] Failed to add telegram fields to promocode_usages:', error)
    throw error
  }
}
