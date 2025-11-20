import express from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { normalizePromoCode, mapPromoRow, evaluatePromoAvailability, promoError } from '../utils/promocodes.js';

function normalizeTelegramUser(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const rawId = payload.id ?? payload.userId ?? payload.user_id;
  if (rawId === undefined || rawId === null || rawId === '') return null;
  return {
    id: String(rawId),
    username: payload.username ? String(payload.username) : null
  };
}

function ensureTelegramUser(telegramUser) {
  if (!telegramUser) {
    const err = new Error('telegram_user_required');
    err.code = 'telegram_user_required';
    throw err;
  }
}

function ensurePromoNotUsedByUser(promoCode, telegramUserId) {
  const existing = db
    .prepare('SELECT id FROM promocode_usages WHERE code = ? AND telegramUserId = ?')
    .get(promoCode, telegramUserId);
  if (existing) {
    throw promoError('already_used_by_user', 400);
  }
}

export const publicRouter = express.Router();

publicRouter.get('/api/categories', (req, res) => {
  // Получаем все категории с информацией о количестве товаров
  const stmt = db.prepare(`
    SELECT c.id, c.slug, c.name, c.[order], c.hide_empty, COUNT(p.id) as productCount
    FROM categories c
    LEFT JOIN products p ON c.id = p.categoryId
    GROUP BY c.id, c.slug, c.name, c.[order], c.hide_empty
    ORDER BY c.[order] ASC, c.name ASC
  `);
  const allCategories = stmt.all();
  
  // Фильтруем категории: исключаем те, у которых hide_empty=1 и нет товаров
  const categories = allCategories.filter(cat => {
    if (cat.hide_empty === 1 && cat.productCount === 0) {
      return false; // Скрываем пустые категории если включена настройка
    }
    return true;
  });
  
  // Убираем служебные поля перед отправкой
  const publicCategories = categories.map(({ hide_empty, productCount, ...cat }) => cat);
  
  res.json(publicCategories);
});

publicRouter.get('/api/banners', (req, res) => {
  const rows = db.prepare('SELECT id, image, href, active, [order], openInNewTab FROM banners WHERE active = 1 ORDER BY [order] ASC').all();
  res.json(rows);
});

publicRouter.get('/api/products', (req, res) => {
  const { category, sort } = req.query;

  // Pagination params (defaults aligned with frontend)
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(req.query.offset ?? '0', 10) || 0, 0);

  // Build WHERE by category slug
  let where = '';
  const whereParams = [];
  if (category) {
    const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(String(category));
    if (!cat) {
      return res.json({ products: [], total: 0, hasMore: false });
    }
    where = 'WHERE p.categoryId = ?';
    whereParams.push(cat.id);
  }

  // Sorting
  const sizeEmptyExpression = `CASE WHEN p.size IS NULL OR TRIM(p.size) = '' THEN 1 ELSE 0 END`;
  const sizeOrderExpression = `CASE
    WHEN p.size IS NULL OR TRIM(p.size) = '' THEN 99
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'XXS' THEN 1
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'XS' THEN 2
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'S' THEN 3
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'M' THEN 4
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'L' THEN 5
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'XL' THEN 6
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'XXL' THEN 7
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'XXXL' THEN 8
    WHEN REPLACE(UPPER(p.size), ' ', '') = 'ONESIZE' THEN 9
    ELSE 50
  END`;
  let orderBy = 'ORDER BY p.priceRub ASC';
  switch (String(sort || 'price_asc')) {
    case 'price_desc': orderBy = 'ORDER BY p.priceRub DESC'; break;
    case 'newest': orderBy = 'ORDER BY p.createdAt DESC'; break;
    case 'oldest': orderBy = 'ORDER BY p.createdAt ASC'; break;
    case 'size_asc': orderBy = `ORDER BY ${sizeEmptyExpression} ASC, ${sizeOrderExpression} ASC, p.size COLLATE NOCASE ASC`; break;
    case 'size_desc': orderBy = `ORDER BY ${sizeEmptyExpression} ASC, ${sizeOrderExpression} DESC, p.size COLLATE NOCASE DESC`; break;
    default: orderBy = 'ORDER BY p.priceRub ASC';
  }


  // Fetch products with pagination
  const sql = `
    SELECT p.id, p.categoryId, p.title, p.priceRub, p.description, p.size, p.createdAt
    FROM products p
    ${where}
    ${where ? 'AND' : 'WHERE'} p.status = 'published'
    ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const countSql = `SELECT COUNT(*) as total FROM products p ${where}
    ${where ? 'AND' : 'WHERE'} p.status = 'published'`;

  const paramsWithLimit = whereParams.length ? [...whereParams, limit, offset] : [limit, offset];
  const products = db.prepare(sql).all(...paramsWithLimit);
  const total = whereParams.length
    ? db.prepare(countSql).get(...whereParams).total
    : db.prepare(countSql).get().total;

  const stmtImgs = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC');
  const enriched = products.map(p => ({ ...p, images: stmtImgs.all(p.id).map(r => r.url) }));

  res.json({ products: enriched, total, hasMore: offset + limit < total });
});

publicRouter.get('/api/product/:id', (req, res) => {
  const id = req.params.id;
  const p = db.prepare(
    `SELECT id, categoryId, title, priceRub, description, size, status, createdAt, publishAt, publishedAt
     FROM products WHERE id = ?`
  ).get(id);
  if (!p || p.status !== 'published') return res.status(404).json({ error: 'Not found' });
  const images = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC').all(id).map(r => r.url);
  res.json({ ...p, images });
});

publicRouter.post('/api/promocodes/apply', (req, res) => {
  try {
    const { code, amount, telegramUser } = req.body || {};
    const normalizedCode = normalizePromoCode(code);
    if (!normalizedCode) {
      return res.status(400).json({ error: 'code_required' });
    }

    const total = Math.max(Math.round(Number(amount) || 0), 0);
    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ error: 'amount_required' });
    }

    let normalizedTelegramUser;
    try {
      normalizedTelegramUser = normalizeTelegramUser(telegramUser);
      ensureTelegramUser(normalizedTelegramUser);
    } catch (validationError) {
      return res.status(validationError.status || 400).json({ error: validationError.code || 'telegram_user_required' });
    }

    const row = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(normalizedCode);
    if (!row) {
      return res.status(404).json({ error: 'not_found' });
    }

    const promo = mapPromoRow(row);

    try {
      ensurePromoNotUsedByUser(promo.code, normalizedTelegramUser.id);
    } catch (usageError) {
      return res.status(usageError.status || 400).json({ error: usageError.code || 'already_used_by_user' });
    }

    const validation = evaluatePromoAvailability(promo, total);
    if (!validation.ok) {
      const response = { error: validation.code };
      if (validation.meta) response.meta = validation.meta;
      return res.status(400).json(response);
    }

    const discount = validation.discount;
    const newTotal = Math.max(total - discount, 0);

    res.json({
      code: promo.code,
      discount,
      total,
      newTotal,
      promo,
      telegramUser: normalizedTelegramUser
    });
  } catch (error) {
    console.error('[public] Failed to validate promocode:', error);
    res.status(500).json({ error: 'promo_apply_failed' });
  }
});

publicRouter.post('/api/promocodes/redeem', (req, res) => {
  const { code, cartTotal, metadata, telegramUser } = req.body || {};
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) {
    return res.status(400).json({ error: 'code_required' });
  }

  const total = Math.max(Math.round(Number(cartTotal) || 0), 0);
  if (!Number.isFinite(total) || total <= 0) {
    return res.status(400).json({ error: 'amount_required' });
  }

  const normalizedTelegramUser = normalizeTelegramUser(telegramUser);
  if (!normalizedTelegramUser) {
    return res.status(400).json({ error: 'telegram_user_required' });
  }

  let metadataJson = null;
  if (metadata !== undefined) {
    try {
      metadataJson = JSON.stringify(metadata);
    } catch (e) {
      return res.status(400).json({ error: 'invalid_metadata' });
    }
  }

  const now = new Date().toISOString();
  let discount = 0;
  let usageId = null;

  try {
    const tx = db.transaction(() => {
      const row = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(normalizedCode);
      if (!row) {
        throw promoError('not_found', 404);
      }

      const promo = mapPromoRow(row);
      ensurePromoNotUsedByUser(promo.code, normalizedTelegramUser.id);

      const validation = evaluatePromoAvailability(promo, total);
      if (!validation.ok) {
        throw promoError(validation.code, 400, validation.meta);
      }

      discount = validation.discount;
      usageId = randomUUID();

      db.prepare(`
        INSERT INTO promocode_usages (id, code, usedAt, cartTotal, discountApplied, metadata, telegramUserId, telegramUsername)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .run(usageId, promo.code, now, total, discount, metadataJson, normalizedTelegramUser.id, normalizedTelegramUser.username);

      db.prepare('UPDATE promocodes SET usageCount = usageCount + 1, lastUsedAt = ?, updatedAt = ? WHERE code = ?')
        .run(now, now, promo.code);
    });

    tx();

    const updatedRow = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(normalizedCode);
    const updatedPromo = mapPromoRow(updatedRow);
    const newTotal = Math.max(total - discount, 0);

    res.json({
      ok: true,
      code: updatedPromo.code,
      usageId,
      discount,
      total,
      newTotal,
      promo: updatedPromo,
      telegramUser: normalizedTelegramUser
    });
  } catch (error) {
    if (error?.status) {
      const payload = { error: error.code };
      if (error.meta) payload.meta = error.meta;
      return res.status(error.status).json(payload);
    }
    console.error('[public] Failed to redeem promocode:', error);
    res.status(500).json({ error: 'promo_redeem_failed' });
  }
});

// Public settings (only specific settings that are safe to expose)
publicRouter.get('/api/settings', (req, res) => {
  try {
    const managerTelegram = db.prepare('SELECT value FROM settings WHERE key = ?').get('manager_telegram');
    
    res.json({
      manager_telegram: managerTelegram?.value || 'dmitriy_mityuk'
    });
  } catch (error) {
    console.error('[public] Failed to get settings:', error);
    // Возвращаем дефолтные значения в случае ошибки
    res.json({
      manager_telegram: 'dmitriy_mityuk'
    });
  }
});
