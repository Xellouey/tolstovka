function ensureUniqueSlug(base) {
  let slug = slugify(base, { lower: true, strict: true }) || base.toLowerCase();
  const original = slug;
  let counter = 1;
  while (db.prepare('SELECT 1 FROM drops WHERE slug = ?').get(slug)) {
    slug = `${original}-${counter++}`;
  }
  return slug;
}

function fetchDropProducts(dropId) {
  const rows = db
    .prepare(
      `SELECT dp.productId, dp.position, p.title, p.priceRub, p.status, p.publishAt, p.publishedAt
       FROM drop_products dp
       JOIN products p ON p.id = dp.productId
       WHERE dp.dropId = ?
       ORDER BY dp.position ASC`
    )
    .all(dropId);
  return rows.map((row) => ({
    ...row,
    publishAt: row.publishAt || null,
    publishedAt: row.publishedAt || null,
  }));
}
import express from 'express';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { authMiddleware, issueToken, verifyPassword, changePassword, getAdminUsername } from '../auth.js';
import { normalizePromoCode, mapPromoRow } from '../utils/promocodes.js';

function toDropResponse(row, products = []) {
  return {
    ...row,
    publishAt: row.publishAt || null,
    releasedAt: row.releasedAt || null,
    highlightBanner: row.highlightBanner || null,
    products,
    productCount: 'productCount' in row ? row.productCount : products.length,
  };
}

function mapProductRow(row) {
  return {
    ...row,
    publishAt: row.publishAt || null,
    publishedAt: row.publishedAt || null,
    dropId: row.dropId || null,
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploads = path.resolve(__dirname, '../../uploads');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export const adminRouter = express.Router();


// Login
adminRouter.post('/api/admin/login', async (req, res) => {
  try {
    console.log('[login] Login attempt:', req.body);
    const { username, password } = req.body || {};
    if (!username || !password) {
      console.log('[login] Missing username or password');
      return res.status(400).json({ error: 'missing' });
    }
    const expectedUser = getAdminUsername();
    console.log('[login] Expected user:', expectedUser, 'Got:', username);
    if (username !== expectedUser) {
      console.log('[login] Username mismatch');
      return res.status(401).json({ error: 'unauthorized' });
    }
    console.log('[login] Verifying password...');
    const ok = await verifyPassword(password);
    console.log('[login] Password verification result:', ok);
    if (!ok) {
      console.log('[login] Password verification failed');
      return res.status(401).json({ error: 'unauthorized' });
    }
    console.log('[login] Issuing token...');
    const token = issueToken(username);
    console.log('[login] Token issued, setting cookie and returning response');
    res.cookie('tolsovka', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*3600*1000 });
    res.json({ ok: true, token });
  } catch (error) {
    console.error('[login] Login error:', error);
    res.status(500).json({ error: 'internal_error', message: error.message });
  }
});

// Verify token (для совместимости с фронтендом)
adminRouter.post('/api/admin/auth/verify', authMiddleware, (req, res) => {
  const user = req.user; // получаем из authMiddleware
  res.json({ 
    valid: true, 
    user: {
      username: user.username || user,
      role: 'admin'
    }
  });
});

// Change password
adminRouter.post('/api/admin/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'missing' });
  const ok = await changePassword(currentPassword, newPassword);
  if (!ok) return res.status(400).json({ error: 'invalid_current_password' });
res.json({ ok: true });
});

// Products CRUD
function handleProductImages(id, images) {
  const processed = [];
  if (!Array.isArray(images) || images.length === 0) {
    return processed;
  }

  const tempDir = path.resolve(baseUploads, 'temp');
  const productDir = path.resolve(baseUploads, 'products', id);
  ensureDir(productDir);

  const imgStmt = db.prepare('INSERT INTO product_images (productId, url, position) VALUES (?, ?, ?)');

  images.forEach((tempUrl, index) => {
    let finalUrl = tempUrl;
    if (tempUrl.startsWith('/uploads/temp/')) {
      const filename = path.basename(tempUrl);
      const tempPath = path.resolve(tempDir, filename);
      const newPath = path.resolve(productDir, filename);
      const newUrl = `/uploads/products/${id}/${filename}`;

      if (fs.existsSync(tempPath)) {
        try {
          fs.renameSync(tempPath, newPath);
          finalUrl = newUrl;
        } catch (err) {
          console.error('[admin] Failed to move image', tempUrl, err);
        }
      }
    }

    processed.push(finalUrl);
    try {
      imgStmt.run(id, finalUrl, index);
    } catch (err) {
      console.error('[admin] Failed to persist image record', err);
    }
  });

  return processed;
}

adminRouter.post('/api/admin/products', authMiddleware, (req, res) => {
  const {
    categoryId,
    title,
    priceRub,
    description,
    size,
    images,
    status = 'published',
    publishAt,
    dropId,
  } = req.body || {};

  if (!categoryId || !Number.isFinite(Number(priceRub))) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  if (status === 'scheduled' && !publishAt) {
    return res.status(400).json({ error: 'publish_time_required' });
  }

  const normalizedStatus = ['draft', 'scheduled', 'published'].includes(status) ? status : 'draft';

  const id = 'p_' + Math.random().toString(36).slice(2, 8);
  const createdAt = new Date().toISOString();
  const publishIso = publishAt ? new Date(publishAt).toISOString() : null;
  const publishedAt = normalizedStatus === 'published' ? createdAt : null;

  try {
    db.prepare(
      `INSERT INTO products (id, categoryId, title, priceRub, description, size, status, publishAt, publishedAt, dropId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      categoryId,
      title || null,
      Number(priceRub),
      description || null,
      size || null,
      normalizedStatus,
      publishIso,
      publishedAt,
      dropId || null,
      createdAt
    );

    const processedUrls = handleProductImages(id, images);

    const product = db
      .prepare(
        `SELECT id, categoryId, title, priceRub, description, size, status, publishAt, publishedAt, dropId, createdAt
         FROM products WHERE id = ?`
      )
      .get(id);

    res.json({ ok: true, id, product: mapProductRow({ ...product, images: processedUrls }) });
  } catch (error) {
    console.error('[admin] Product creation failed:', error);
    res.status(500).json({ error: 'creation_failed', message: error.message });
  }
});

adminRouter.patch('/api/admin/products/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const cur = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ error: 'not_found' });

  const {
    categoryId,
    title,
    priceRub,
    description,
    size,
    status,
    publishAt,
    dropId,
    images,
  } = req.body || {};

  const nextStatus = status && ['draft', 'scheduled', 'published'].includes(status) ? status : cur.status;
  const nextPublishAt = publishAt !== undefined ? (publishAt ? new Date(publishAt).toISOString() : null) : cur.publishAt;
  const nextDropId = dropId !== undefined ? (dropId || null) : cur.dropId;

  if (nextStatus === 'scheduled' && !nextPublishAt) {
    return res.status(400).json({ error: 'publish_time_required' });
  }

  const nextPublishedAt =
    nextStatus === 'published'
      ? cur.publishedAt || new Date().toISOString()
      : nextStatus === 'draft'
      ? null
      : cur.publishedAt;

  db.prepare(
    `UPDATE products
     SET categoryId = ?,
         title = ?,
         priceRub = ?,
         description = ?,
         size = ?,
         status = ?,
         publishAt = ?,
         publishedAt = ?,
         dropId = ?
     WHERE id = ?`
  ).run(
    categoryId !== undefined ? categoryId : cur.categoryId,
    title !== undefined ? title : cur.title,
    priceRub !== undefined && Number.isFinite(Number(priceRub)) ? Number(priceRub) : cur.priceRub,
    description !== undefined ? description : cur.description,
    size !== undefined ? size : cur.size,
    nextStatus,
    nextPublishAt,
    nextPublishedAt,
    nextDropId,
    id
  );

  if (Array.isArray(images)) {
    db.prepare('DELETE FROM product_images WHERE productId = ?').run(id);
    handleProductImages(id, images);
  }

  const updated = db
    .prepare(
      `SELECT id, categoryId, title, priceRub, description, size, status, publishAt, publishedAt, dropId, createdAt
       FROM products WHERE id = ?`
    )
    .get(id);

  res.json({ ok: true, product: mapProductRow(updated) });
});

adminRouter.delete('/api/admin/products/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
});

adminRouter.get('/api/admin/products', authMiddleware, (req, res) => {
  const page = Math.max(parseInt(req.query.page ?? '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? '20', 10) || 20, 1), 100);
  const category = req.query.category;
  const search = req.query.search;
  const status = req.query.status;
  const dropId = req.query.dropId;

  const clauses = [];
  const params = [];

  if (category) {
    clauses.push('p.categoryId = ?');
    params.push(String(category));
  }
  if (search) {
    clauses.push('(p.title LIKE ? OR p.description LIKE ?)');
    const pat = `%${search}%`;
    params.push(pat, pat);
  }
  if (status && ['draft', 'scheduled', 'published'].includes(String(status))) {
    clauses.push('p.status = ?');
    params.push(String(status));
  }
  if (dropId) {
    clauses.push('p.dropId = ?');
    params.push(String(dropId));
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const total = db
    .prepare(`SELECT COUNT(*) as total FROM products p ${where}`)
    .get(...params).total;

  const offset = (page - 1) * limit;
  const stmt = db.prepare(`
    SELECT p.id, p.categoryId, c.name as categoryName, p.title, p.priceRub, p.description, p.size,
           p.status, p.publishAt, p.publishedAt, p.dropId, p.createdAt
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    ${where}
    ORDER BY p.createdAt DESC
    LIMIT ? OFFSET ?
  `);

  const rows = stmt.all(...params, limit, offset);
  const imgStmt = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC');

  const products = rows.map((row) =>
    mapProductRow({
      ...row,
      images: imgStmt.all(row.id).map((x) => x.url),
    })
  );

  res.json({
    products,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

adminRouter.get('/api/admin/products/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const p = db
    .prepare(
      `SELECT id, categoryId, title, priceRub, description, size, status, publishAt, publishedAt, dropId, createdAt
       FROM products WHERE id = ?`
    )
    .get(id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  const images = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC').all(id).map((r) => r.url);
  res.json(mapProductRow({ ...p, images }));
});

// Drops CRUD
function selectDropById(id) {
  const drop = db
    .prepare(
      `SELECT d.*, COUNT(dp.productId) as productCount
       FROM drops d
       LEFT JOIN drop_products dp ON dp.dropId = d.id
       WHERE d.id = ?
       GROUP BY d.id`
    )
    .get(id);
  if (!drop) return null;
  const products = fetchDropProducts(id);
  return toDropResponse(drop, products);
}

function persistDropProducts(dropId, productIds = [], publishAt, status) {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM drop_products WHERE dropId = ?').run(dropId);

    const insertDP = db.prepare(
      'INSERT INTO drop_products (dropId, productId, position) VALUES (?, ?, ?)' 
    );
    const updateProduct = db.prepare(
      `UPDATE products
         SET dropId = ?, status = ?, publishAt = ?, publishedAt = ?
       WHERE id = ?`
    );

    productIds.forEach((productId, index) => {
      insertDP.run(dropId, productId, index);

      let nextStatus = status;
      if (!['draft', 'scheduled', 'published'].includes(nextStatus)) {
        nextStatus = 'scheduled';
      }

      let nextPublishAt = null;
      let nextPublishedAt = null;

      if (nextStatus === 'scheduled') {
        nextPublishAt = publishAt || null;
      } else if (nextStatus === 'published') {
        nextPublishedAt = new Date().toISOString();
      }

      updateProduct.run(dropId, nextStatus, nextPublishAt, nextPublishedAt, productId);
    });
  });

  tx();
}

adminRouter.get('/api/admin/drops', authMiddleware, (req, res) => {
  const rows = db
    .prepare(
      `SELECT d.*, COUNT(dp.productId) as productCount
       FROM drops d
       LEFT JOIN drop_products dp ON dp.dropId = d.id
       GROUP BY d.id
       ORDER BY d.publishAt IS NULL, d.publishAt ASC`
    )
    .all();

  const data = rows.map((row) => toDropResponse(row, fetchDropProducts(row.id)));
  res.json(data);
});

adminRouter.post('/api/admin/drops', authMiddleware, (req, res) => {
  const {
    title,
    categoryId,
    publishAt,
    description,
    highlightBanner,
    productIds = [],
    status,
  } = req.body || {};

  if (!title || !categoryId) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const normalizedStatus = ['draft', 'scheduled', 'published'].includes(status) ? status : publishAt ? 'scheduled' : 'draft';
  if (normalizedStatus === 'scheduled' && !publishAt) {
    return res.status(400).json({ error: 'publish_time_required' });
  }

  const id = 'drop_' + Math.random().toString(36).slice(2, 8);
  const slug = ensureUniqueSlug(title);
  const now = new Date().toISOString();
  const publishIso = publishAt ? new Date(publishAt).toISOString() : null;
  const releasedAt = normalizedStatus === 'published' ? now : null;

  try {
    const tx = db.transaction(() => {
      db.prepare(
        `INSERT INTO drops (id, title, slug, categoryId, status, publishAt, releasedAt, description, highlightBanner, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        title,
        slug,
        categoryId,
        normalizedStatus,
        publishIso,
        releasedAt,
        description || null,
        highlightBanner || null,
        now,
        now
      );

      if (productIds.length) {
        persistDropProducts(id, productIds, publishIso, normalizedStatus);
      }
    });

    tx();

    res.status(201).json(selectDropById(id));
  } catch (error) {
    console.error('[admin] Failed to create drop:', error);
    res.status(500).json({ error: 'creation_failed', message: error.message });
  }
});

adminRouter.patch('/api/admin/drops/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const current = db
    .prepare(
      `SELECT id, title, slug, categoryId, status, publishAt, releasedAt, description, highlightBanner, createdAt, updatedAt
       FROM drops WHERE id = ?`
    )
    .get(id);
  if (!current) return res.status(404).json({ error: 'not_found' });

  const {
    title,
    categoryId,
    publishAt,
    description,
    highlightBanner,
    status,
    productIds,
  } = req.body || {};

  const nextTitle = title !== undefined ? title : current.title;
  const nextCategoryId = categoryId !== undefined ? categoryId : current.categoryId;
  const nextStatus = status && ['draft', 'scheduled', 'published'].includes(status) ? status : current.status;
  const publishIso = publishAt !== undefined ? (publishAt ? new Date(publishAt).toISOString() : null) : current.publishAt;

  if (nextStatus === 'scheduled' && !publishIso) {
    return res.status(400).json({ error: 'publish_time_required' });
  }

  const now = new Date().toISOString();
  const releasedAt = nextStatus === 'published' ? current.releasedAt || now : nextStatus === 'draft' ? null : current.releasedAt;
  const slug = nextTitle !== current.title ? ensureUniqueSlug(nextTitle) : current.slug;

  try {
    const tx = db.transaction(() => {
      db.prepare(
        `UPDATE drops
         SET title = ?, slug = ?, categoryId = ?, status = ?, publishAt = ?, releasedAt = ?, description = ?, highlightBanner = ?, updatedAt = ?
         WHERE id = ?`
      ).run(
        nextTitle,
        slug,
        nextCategoryId,
        nextStatus,
        publishIso,
        releasedAt,
        description !== undefined ? description : current.description,
        highlightBanner !== undefined ? highlightBanner : current.highlightBanner,
        now,
        id
      );

      if (Array.isArray(productIds)) {
        persistDropProducts(id, productIds, publishIso, nextStatus);
      } else if (nextStatus !== current.status || publishIso !== current.publishAt) {
        const relatedProducts = db.prepare('SELECT productId FROM drop_products WHERE dropId = ? ORDER BY position ASC').all(id);
        const ids = relatedProducts.map((row) => row.productId);
        if (ids.length) {
          persistDropProducts(id, ids, publishIso, nextStatus);
        }
      }
    });

    tx();

    res.json(selectDropById(id));
  } catch (error) {
    console.error('[admin] Failed to update drop:', error);
    res.status(500).json({ error: 'update_failed', message: error.message });
  }
});

adminRouter.delete('/api/admin/drops/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const current = db.prepare('SELECT id FROM drops WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'not_found' });

  try {
    const tx = db.transaction(() => {
      const productRows = db.prepare('SELECT productId FROM drop_products WHERE dropId = ?').all(id);
      const resetProduct = db.prepare(
        `UPDATE products SET dropId = NULL, status = CASE WHEN status = 'published' THEN status ELSE 'draft' END,
          publishAt = NULL WHERE id = ?`
      );
      productRows.forEach((row) => resetProduct.run(row.productId));

      db.prepare('DELETE FROM drop_products WHERE dropId = ?').run(id);
      db.prepare('DELETE FROM drops WHERE id = ?').run(id);
    });

    tx();
    res.json({ ok: true });
  } catch (error) {
    console.error('[admin] Failed to delete drop:', error);
    res.status(500).json({ error: 'delete_failed', message: error.message });
  }
});


// Categories CRUD
adminRouter.get('/api/admin/categories', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.id, c.slug, c.name, c.[order], c.hide_empty, COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.categoryId
      GROUP BY c.id, c.slug, c.name, c.[order], c.hide_empty
      ORDER BY c.[order] ASC, c.name ASC
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'failed', details: String(e) });
  }
});

// Banners CRUD
adminRouter.get('/api/admin/banners', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT id, title, image, href, active, [order], openInNewTab FROM banners ORDER BY [order] ASC').all();
  res.json(rows);
});

adminRouter.post('/api/admin/banners', authMiddleware, (req, res) => {
  const { title, image, href, active = true, order, openInNewTab = false } = req.body || {};
  if (!image) return res.status(400).json({ error: 'image_required' });
  
  
  const id = 'b_' + Math.random().toString(36).slice(2, 8);
  
  // Определяем порядок автоматически, если не указан
  let finalOrder = order;
  if (!Number.isFinite(finalOrder)) {
    const maxOrder = db.prepare('SELECT MAX([order]) as maxOrder FROM banners').get();
    finalOrder = (maxOrder?.maxOrder || 0) + 1;
  }
  
  console.log('[admin] Creating banner with data:', { id, title, image, href, active, order: finalOrder, openInNewTab });
  
  // Создаём баннер
  db.prepare('INSERT INTO banners (id, title, image, href, active, [order], openInNewTab) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, title || null, image, href || null, active ? 1 : 0, finalOrder, openInNewTab ? 1 : 0);
  
  // Возвращаем полные данные созданного баннера
  res.json({
    id,
    title: title || null,
    image,
    href: href || null,
    active: active ? 1 : 0,
    order: finalOrder,
    openInNewTab: openInNewTab ? 1 : 0
  });
});

adminRouter.patch('/api/admin/banners/reorder', authMiddleware, (req, res) => {
  console.log('🔥 [server] Banners reorder endpoint called')
  console.log('🔥 [server] request.body:', JSON.stringify(req.body, null, 2))
  
  const { banners } = req.body || {};
  console.log('🔥 [server] Extracted banners:', banners)
  
  if (!Array.isArray(banners)) {
    console.log('🔥 [server] ERROR: banners is not array:', banners)
    return res.status(400).json({ error: 'banners_required' })
  }
  
  // Проверим каждый баннер
  for (const banner of banners) {
    if (!banner.id || !Number.isFinite(banner.order)) {
      console.log('🔥 [server] ERROR: invalid banner:', banner)
      return res.status(400).json({ error: 'invalid_banner_data' })
    }
  }
  
  try {
    const stmt = db.prepare('UPDATE banners SET [order] = ? WHERE id = ?')
    const tx = db.transaction((bannersToReorder) => {
      for (const banner of bannersToReorder) {
        const result = stmt.run(banner.order, banner.id)
        if (result.changes === 0) {
          throw new Error(`Banner not found: ${banner.id}`)
        }
      }
    })
    
    tx(banners)
    console.log('🔥 [server] Banners reordered successfully!')
    res.json({ success: true, message: 'Banners reordered' })
  } catch (error) {
    console.error('🔥 [server] Reorder error:', error)
    res.status(500).json({ error: 'reorder_failed', message: error.message })
  }
});

adminRouter.patch('/api/admin/banners/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { title, image, href, active, order, openInNewTab } = req.body || {};
  const cur = db.prepare('SELECT * FROM banners WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ error: 'not_found' });
  
  
  // Обновляем баннер
  db.prepare('UPDATE banners SET title = ?, image = ?, href = ?, active = ?, [order] = ?, openInNewTab = ? WHERE id = ?')
    .run(
      (title !== undefined ? title : cur.title),
      (image !== undefined ? image : cur.image), 
      (href !== undefined ? href : cur.href), 
      (active !== undefined ? (active ? 1 : 0) : cur.active), 
      (Number.isFinite(order) ? order : cur.order),
      (openInNewTab !== undefined ? (openInNewTab ? 1 : 0) : (cur.openInNewTab || 0)), 
      id
    );
  
  // Возвращаем обновлённые данные
  const updated = db.prepare('SELECT * FROM banners WHERE id = ?').get(id);
  res.json({
    id: updated.id,
    title: updated.title,
    image: updated.image,
    href: updated.href,
    active: updated.active, // оставляем как integer для совместимости
    order: updated.order,
    openInNewTab: updated.openInNewTab || 0
  });
});

adminRouter.delete('/api/admin/banners/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM banners WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Categories CRUD
adminRouter.post('/api/admin/categories', authMiddleware, (req, res) => {
  const { name, order, hide_empty } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  
  // Проверяем дубликаты по имени сразу
  const existingByName = db.prepare('SELECT id, name FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))').get(name);
  if (existingByName) {
    console.log('[admin] Name conflict detected during creation with category:', existingByName);
    return res.status(400).json({ 
      error: 'duplicate_category_name', 
      message: `Категория с таким названием уже существует: "${existingByName.name}"`,
      conflictingCategory: existingByName.name
    });
  }
  
  let baseSlug;
  try {
    baseSlug = slugify(name, { lower: true, strict: true });
  } catch (slugError) {
    console.error('[admin] Slugify error in create:', slugError);
    // Fallback to simple slug generation
    baseSlug = name.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    console.log('[admin] Fallback slug generated in create:', baseSlug);
  }
  let slug = baseSlug;
  let counter = 1;
  
  // Проверяем уникальность slug и добавляем суффикс при необходимости
  while (true) {
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); // более уникальный ID
  
  // Получаем следующий order если не указан
  let finalOrder = order;
  if (!Number.isFinite(finalOrder)) {
    const maxOrder = db.prepare('SELECT MAX([order]) as maxOrder FROM categories').get();
    finalOrder = (maxOrder?.maxOrder || 0) + 1;
  }
  
  try {
    const hideEmptyValue = hide_empty ? 1 : 0;
    console.log('[admin] Creating category:', { id, slug, name, order: finalOrder, hide_empty: hideEmptyValue });
    db.prepare('INSERT INTO categories (id, slug, name, [order], hide_empty) VALUES (?, ?, ?, ?, ?)').run(id, slug, name, finalOrder, hideEmptyValue);
    res.json({ ok: true, id, slug, name, order: finalOrder, hide_empty: hideEmptyValue });
  } catch (e) {
    console.error('[admin] Category creation failed:', e.message);
    res.status(400).json({ error: 'insert_failed', message: e.message, details: String(e) });
  }
});

adminRouter.put('/api/admin/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, slug, order, hide_empty } = req.body || {};
  
  console.log(`[admin] PUT /api/admin/categories/${id} called`);
  console.log('[admin] Request body:', JSON.stringify(req.body, null, 2));
  console.log('[admin] Extracted fields:', { name, slug, order, hide_empty });
  
  try {
    const cur = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    console.log('[admin] Current category in DB:', cur);
    
    if (!cur) return res.status(404).json({ error: 'not_found' });
    
    // Если меняется имя, сначала проверяем дубликаты по имени
    if (name && name !== cur.name) {
      const existingByName = db.prepare('SELECT id, name FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND id != ?').get(name, id);
      if (existingByName) {
        console.log('[admin] Name conflict detected with category:', existingByName);
        return res.status(400).json({ 
          error: 'duplicate_category_name', 
          message: `Категория с таким названием уже существует: "${existingByName.name}"`,
          conflictingCategory: existingByName.name
        });
      }
    }
    
    let newSlug = slug;
    if (name && !slug) {
      try {
        newSlug = slugify(name, { lower: true, strict: true });
        console.log('[admin] Generated new slug:', newSlug);
        
        // Проверяем уникальность slug (исключая текущую категорию)
        const existingCategory = db.prepare('SELECT id, name FROM categories WHERE slug = ? AND id != ?').get(newSlug, id);
        if (existingCategory) {
          console.log('[admin] Slug conflict detected with category:', existingCategory);
          return res.status(400).json({ 
            error: 'duplicate_category_slug', 
            message: `Категория с похожим названием уже существует: "${existingCategory.name}"`,
            conflictingCategory: existingCategory.name
          });
        }
      } catch (slugError) {
        console.error('[admin] Slugify error:', slugError);
        // Fallback to simple slug generation
        newSlug = name.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        console.log('[admin] Fallback slug generated:', newSlug);
        
        // Проверяем уникальность fallback slug тоже
        const existingCategory = db.prepare('SELECT id, name FROM categories WHERE slug = ? AND id != ?').get(newSlug, id);
        if (existingCategory) {
          console.log('[admin] Fallback slug conflict detected with category:', existingCategory);
          return res.status(400).json({ 
            error: 'duplicate_category', 
            message: `Категория с таким названием уже существует: "${existingCategory.name}"`,
            conflictingCategory: existingCategory.name
          });
        }
      }
    }
    
    const next = {
      name: name !== undefined ? name : cur.name,
      slug: newSlug !== undefined ? newSlug : cur.slug,
      order: Number.isFinite(order) ? Number(order) : cur.order,
      hide_empty: hide_empty !== undefined ? (hide_empty ? 1 : 0) : cur.hide_empty,
    };
    
    console.log('[admin] Prepared data for update:', next);
    
    const updateResult = db.prepare('UPDATE categories SET name = ?, slug = ?, [order] = ?, hide_empty = ? WHERE id = ?')
      .run(next.name, next.slug, next.order, next.hide_empty, id);
      
    console.log('[admin] Update result:', updateResult);
    console.log('[admin] Update completed successfully');
    
    res.json({ id, ...next });
  } catch (e) {
    console.error('[admin] Category update error:', e);
    console.error('[admin] Error stack:', e.stack);
    res.status(500).json({ error: 'failed', details: String(e), stack: e.stack });
  }
});

adminRouter.patch('/api/admin/categories/reorder', authMiddleware, (req, res) => {
  console.log('🔥 [server] Categories reorder endpoint called')
  console.log('🔥 [server] request.body:', JSON.stringify(req.body, null, 2))
  
  const { categories } = req.body || {}
  console.log('🔥 [server] Extracted categories:', categories)
  
  if (!Array.isArray(categories)) {
    console.log('🔥 [server] ERROR: categories is not array:', categories)
    return res.status(400).json({ error: 'categories_required' })
  }
  
  // Проверим каждую категорию
  for (const cat of categories) {
    if (!cat.id || !Number.isFinite(cat.order)) {
      console.log('🔥 [server] ERROR: invalid category:', cat)
      return res.status(400).json({ error: 'invalid_category_data' })
    }
  }
  
  try {
    const stmt = db.prepare('UPDATE categories SET [order] = ? WHERE id = ?')
    const tx = db.transaction((cats) => {
      for (const cat of cats) {
        const result = stmt.run(cat.order, cat.id)
        if (result.changes === 0) {
          throw new Error(`Category not found: ${cat.id}`)
        }
      }
    })
    
    tx(categories)
    console.log('🔥 [server] Categories reordered successfully!')
    res.json({ success: true, message: 'Categories reordered' })
  } catch (error) {
    console.error('🔥 [server] Reorder error:', error)
    res.status(500).json({ error: 'reorder_failed', message: error.message })
  }
})

adminRouter.delete('/api/admin/categories/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Settings CRUD
adminRouter.get('/api/admin/settings', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    console.error('[admin] Failed to get settings:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.post('/api/admin/settings', authMiddleware, (req, res) => {
  try {
    const { settings } = req.body || {};
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'settings_object_required' });
    }
    
    // Обновляем настройки в транзакции
    const upsertStmt = db.prepare(`
      INSERT INTO settings (key, value) 
      VALUES (?, ?) 
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    
    const tx = db.transaction((settingsObj) => {
      Object.entries(settingsObj).forEach(([key, value]) => {
        upsertStmt.run(key, String(value));
      });
    });
    
    tx(settings);
    
    console.log('[admin] Settings updated:', settings);
    res.json({ ok: true, settings });
  } catch (error) {
    console.error('[admin] Failed to update settings:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.get('/api/admin/promocodes', authMiddleware, (req, res) => {
  try {
    const promos = db.prepare('SELECT * FROM promocodes ORDER BY createdAt DESC').all();
    res.json(promos.map(mapPromoRow));
  } catch (error) {
    console.error('[admin] Failed to list promocodes:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.get('/api/admin/promocodes/:code', authMiddleware, (req, res) => {
  const code = normalizePromoCode(req.params.code);
  if (!code) return res.status(400).json({ error: 'code_required' });

  try {
    const row = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(code);
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json({ promo: mapPromoRow(row) });
  } catch (error) {
    console.error('[admin] Failed to fetch promocode:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.get('/api/admin/promocodes/:code/usages', authMiddleware, (req, res) => {
  const code = normalizePromoCode(req.params.code);
  if (!code) return res.status(400).json({ error: 'code_required' });

  try {
    const promoRow = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(code);
    if (!promoRow) return res.status(404).json({ error: 'not_found' });

    const rows = db.prepare('SELECT id, code, usedAt, cartTotal, discountApplied, metadata, telegramUserId, telegramUsername FROM promocode_usages WHERE code = ? ORDER BY usedAt DESC').all(code);
    const usages = rows.map((usage) => {
      let metadata = null;
      if (usage.metadata) {
        try {
          metadata = JSON.parse(usage.metadata);
        } catch (e) {
          metadata = usage.metadata;
        }
      }
      return {
        id: usage.id,
        code: usage.code,
        usedAt: usage.usedAt,
        cartTotal: Number(usage.cartTotal || 0),
        discountApplied: Number(usage.discountApplied || 0),
        metadata,
        telegramUserId: usage.telegramUserId || null,
        telegramUsername: usage.telegramUsername || null
      };
    });

    res.json({ promo: mapPromoRow(promoRow), usages });
  } catch (error) {
    console.error('[admin] Failed to fetch promocode usages:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.post('/api/admin/promocodes', authMiddleware, (req, res) => {
  const payload = req.body || {};
  const code = normalizePromoCode(payload.code);
  if (!code) return res.status(400).json({ error: 'code_required' });

  const discountType = String(payload.discountType || '').toLowerCase();
  if (!['percent', 'fixed'].includes(discountType)) {
    return res.status(400).json({ error: 'invalid_discount_type' });
  }

  const discountValue = Number(payload.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return res.status(400).json({ error: 'invalid_discount_value' });
  }
  if (discountType === 'percent' && discountValue > 100) {
    return res.status(400).json({ error: 'percent_too_high' });
  }

  let minSubtotal = payload.minSubtotal !== undefined ? Number(payload.minSubtotal) : 0;
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
    return res.status(400).json({ error: 'invalid_min_subtotal' });
  }
  minSubtotal = Math.round(minSubtotal);

  let maxUses = null;
  if (payload.maxUses !== undefined && payload.maxUses !== null && payload.maxUses !== '') {
    maxUses = Number(payload.maxUses);
    if (!Number.isFinite(maxUses) || maxUses <= 0) {
      return res.status(400).json({ error: 'invalid_max_uses' });
    }
    maxUses = Math.round(maxUses);
  }

  let expiresAt = null;
  if (payload.expiresAt) {
    const expires = new Date(payload.expiresAt);
    if (Number.isNaN(expires.getTime())) {
      return res.status(400).json({ error: 'invalid_expiration' });
    }
    expiresAt = expires.toISOString();
  }

  const description = payload.description ? String(payload.description).trim() : null;
  const isActive = payload.isActive === undefined ? 1 : (payload.isActive ? 1 : 0);

  try {
    const existing = db.prepare('SELECT code FROM promocodes WHERE code = ?').get(code);
    if (existing) return res.status(409).json({ error: 'code_exists' });

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO promocodes (code, description, discountType, discountValue, minSubtotal, maxUses, isActive, expiresAt, usageCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(code, description, discountType, discountValue, minSubtotal, maxUses, isActive, expiresAt, now, now);

    const created = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(code);
    res.status(201).json({ ok: true, promo: mapPromoRow(created) });
  } catch (error) {
    console.error('[admin] Failed to create promocode:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.patch('/api/admin/promocodes/:code', authMiddleware, (req, res) => {
  const code = normalizePromoCode(req.params.code);
  if (!code) return res.status(400).json({ error: 'code_required' });

  const current = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(code);
  if (!current) return res.status(404).json({ error: 'not_found' });

  const payload = req.body || {};
  const fields = [];
  const values = [];

  let nextDiscountType = current.discountType;
  if (Object.prototype.hasOwnProperty.call(payload, 'discountType')) {
    const type = String(payload.discountType || '').toLowerCase();
    if (!['percent', 'fixed'].includes(type)) {
      return res.status(400).json({ error: 'invalid_discount_type' });
    }
    nextDiscountType = type;
    fields.push('discountType = ?');
    values.push(nextDiscountType);
  }

  let nextDiscountValue = current.discountValue;
  if (Object.prototype.hasOwnProperty.call(payload, 'discountValue')) {
    const value = Number(payload.discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: 'invalid_discount_value' });
    }
    nextDiscountValue = value;
    fields.push('discountValue = ?');
    values.push(nextDiscountValue);
  }

  if (nextDiscountType === 'percent' && nextDiscountValue > 100) {
    return res.status(400).json({ error: 'percent_too_high' });
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    const description = payload.description ? String(payload.description).trim() : null;
    fields.push('description = ?');
    values.push(description);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'minSubtotal')) {
    let minSubtotal = payload.minSubtotal !== undefined && payload.minSubtotal !== null && payload.minSubtotal !== ''
      ? Number(payload.minSubtotal)
      : 0;
    if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
      return res.status(400).json({ error: 'invalid_min_subtotal' });
    }
    minSubtotal = Math.round(minSubtotal);
    fields.push('minSubtotal = ?');
    values.push(minSubtotal);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'maxUses')) {
    let maxUses = null;
    if (payload.maxUses !== undefined && payload.maxUses !== null && payload.maxUses !== '') {
      maxUses = Number(payload.maxUses);
      if (!Number.isFinite(maxUses) || maxUses <= 0) {
        return res.status(400).json({ error: 'invalid_max_uses' });
      }
      maxUses = Math.round(maxUses);
    }
    fields.push('maxUses = ?');
    values.push(maxUses);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
    fields.push('isActive = ?');
    values.push(payload.isActive ? 1 : 0);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'expiresAt')) {
    let expiresAt = null;
    if (payload.expiresAt) {
      const expires = new Date(payload.expiresAt);
      if (Number.isNaN(expires.getTime())) {
        return res.status(400).json({ error: 'invalid_expiration' });
      }
      expiresAt = expires.toISOString();
    }
    fields.push('expiresAt = ?');
    values.push(expiresAt);
  }

  if (!fields.length) {
    return res.json({ ok: true, promo: mapPromoRow(current) });
  }

  const now = new Date().toISOString();
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(code);

  try {
    db.prepare(`UPDATE promocodes SET ${fields.join(', ')} WHERE code = ?`).run(...values);
    const updated = db.prepare('SELECT * FROM promocodes WHERE code = ?').get(code);
    res.json({ ok: true, promo: mapPromoRow(updated) });
  } catch (error) {
    console.error('[admin] Failed to update promocode:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});

adminRouter.delete('/api/admin/promocodes/:code', authMiddleware, (req, res) => {
  const code = normalizePromoCode(req.params.code);
  if (!code) return res.status(400).json({ error: 'code_required' });

  try {
    const result = db.prepare('DELETE FROM promocodes WHERE code = ?').run(code);
    if (!result.changes) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('[admin] Failed to delete promocode:', error);
    res.status(500).json({ error: 'failed', message: error.message });
  }
});
