import { db } from '../db.js'

export function migrateSizeToProducts() {
  try {
    const columns = db.prepare("PRAGMA table_info(products)").all()
    const hasSize = columns.some(col => col.name === 'size')

    if (!hasSize) {
      console.log('[migration] Adding size column to products table...')
      db.prepare("ALTER TABLE products ADD COLUMN size TEXT").run()
      console.log('[migration] size column added successfully')
    } else {
      console.log('[migration] size column already exists on products table')
    }
  } catch (error) {
    console.error('[migration] Failed to add size column to products table:', error)
    throw error
  }
}
