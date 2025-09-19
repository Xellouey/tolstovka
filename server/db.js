import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.DATABASE_FILE || path.resolve(__dirname, './data/tolsovka.db');

// Ensure data dir exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(DB_FILE);

export function initDb() {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE,
      name TEXT NOT NULL,
      [order] INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      title TEXT,
      priceRub INTEGER NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (productId, position)
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      image TEXT NOT NULL,
      href TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      [order] INTEGER NOT NULL DEFAULT 0
    );
  `);

  seedIfEmpty();
}

function seedIfEmpty() {
  const countCat = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  const countProd = db.prepare('SELECT COUNT(*) as c FROM products').get().c;

  if (countCat === 0) {
    const categoriesPath = path.resolve(__dirname, './seed/categories.json');
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      const stmt = db.prepare('INSERT INTO categories (id, slug, name, [order]) VALUES (?, ?, ?, ?)');
      const tx = db.transaction((rows) => {
        for (const r of rows) {
          const slug = r.slug || slugify(r.name, { lower: true, strict: true, locale: 'ru' });
          stmt.run(r.id, slug, r.name, r.order ?? 0);
        }
      });
      tx(categories);
      console.log(`[tolsovka:db] Seeded categories: ${categories.length}`);
    }
  }

  if (countProd === 0) {
    const productsPath = path.resolve(__dirname, './seed/products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      const stmtProd = db.prepare('INSERT INTO products (id, categoryId, title, priceRub, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
      const stmtImg = db.prepare('INSERT INTO product_images (productId, url, position) VALUES (?, ?, ?)');
      const tx = db.transaction((rows) => {
        for (const p of rows) {
          const createdAt = new Date().toISOString();
          stmtProd.run(p.id, p.categoryId, p.title || null, p.priceRub, p.description || null, createdAt);
          if (Array.isArray(p.images)) {
            p.images.forEach((url, idx) => stmtImg.run(p.id, url, idx));
          }
        }
      });
      tx(products);
      console.log(`[tolsovka:db] Seeded products: ${products.length}`);
    }
  }

  // Seed banners
  const countBanners = db.prepare('SELECT COUNT(*) as c FROM banners').get().c;
  if (countBanners === 0) {
    const bannersPath = path.resolve(__dirname, './seed/banners.json');
    if (fs.existsSync(bannersPath)) {
      const banners = JSON.parse(fs.readFileSync(bannersPath, 'utf8'));
      const stmt = db.prepare('INSERT INTO banners (id, image, href, active, [order]) VALUES (?, ?, ?, ?, ?)');
      const tx = db.transaction((rows) => {
        for (const b of rows) {
          stmt.run(b.id, b.image, b.href || null, b.active ? 1 : 0, b.order || 0);
        }
      });
      tx(banners);
      console.log(`[tolsovka:db] Seeded banners: ${banners.length}`);
    }
  }
}