import { db } from '../db.js';

function tableExists(name) {
  return (
    db
      .prepare(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name = ?`)
      .get(name).count > 0
  );
}

function columnExists(table, column) {
  const pragma = db.prepare(`PRAGMA table_info(${table})`).all();
  return pragma.some((c) => c.name === column);
}

function indexExists(name) {
  return (
    db
      .prepare(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='index' AND name = ?`)
      .get(name).count > 0
  );
}

function createDropsTables() {
  if (!tableExists('drops')) {
    console.log('[migration] Creating drops table');
    db.exec(`
      CREATE TABLE drops (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'draft',
        publishAt TEXT,
        releasedAt TEXT,
        description TEXT,
        highlightBanner TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }

  if (!tableExists('drop_products')) {
    console.log('[migration] Creating drop_products table');
    db.exec(`
      CREATE TABLE drop_products (
        dropId TEXT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
        productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (dropId, productId)
      );
    `);
  } else if (!columnExists('drop_products', 'position')) {
    console.log('[migration] Adding position column to drop_products');
    db.exec(`ALTER TABLE drop_products ADD COLUMN position INTEGER NOT NULL DEFAULT 0;`);
  }
}

function extendProductsTable() {
  if (!columnExists('products', 'status')) {
    console.log('[migration] Adding status column to products');
    db.exec(`ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'published';`);
    db.exec(`UPDATE products SET status = 'published' WHERE status IS NULL OR status = '';`);
  }

  if (!columnExists('products', 'publishAt')) {
    console.log('[migration] Adding publishAt column to products');
    db.exec(`ALTER TABLE products ADD COLUMN publishAt TEXT;`);
  }

  if (!columnExists('products', 'publishedAt')) {
    console.log('[migration] Adding publishedAt column to products');
    db.exec(`ALTER TABLE products ADD COLUMN publishedAt TEXT;`);
    db.exec(`UPDATE products SET publishedAt = createdAt WHERE publishedAt IS NULL;`);
  }

  if (!columnExists('products', 'dropId')) {
    console.log('[migration] Adding dropId column to products');
    db.exec(`ALTER TABLE products ADD COLUMN dropId TEXT REFERENCES drops(id) ON DELETE SET NULL;`);
  }

  if (!indexExists('idx_products_status_publishAt')) {
    db.exec(`CREATE INDEX idx_products_status_publishAt ON products(status, publishAt);`);
  }
}

function createDropIndexes() {
  if (!indexExists('idx_drops_status_publishAt')) {
    db.exec(`CREATE INDEX idx_drops_status_publishAt ON drops(status, publishAt);`);
  }
}

export function migrateDropsAndSchedule() {
  try {
    createDropsTables();
    extendProductsTable();
    createDropIndexes();
    console.log('[migration] Drops & schedule migration completed');
  } catch (err) {
    console.error('[migration] Failed to migrate drops & schedule:', err);
    throw err;
  }
}
