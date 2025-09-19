import { db } from '../db.js';

export async function publicRoutes(fastify) {
  // Cache for categories (refresh every 5 minutes)
  let categoriesCache = null;
  let categoriesCacheTime = 0;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get categories with caching
  fastify.get('/categories', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              slug: { type: 'string' },
              name: { type: 'string' },
              order: { type: 'number' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const now = Date.now();
    
    if (!categoriesCache || (now - categoriesCacheTime) > CACHE_DURATION) {
      try {
        const stmt = db.prepare('SELECT id, slug, name, [order] FROM categories ORDER BY [order] ASC, name ASC');
        categoriesCache = stmt.all();
        categoriesCacheTime = now;
        
        // Set cache headers
        reply.header('Cache-Control', 'public, max-age=300'); // 5 minutes
      } catch (error) {
        fastify.log.error('Database error in /categories:', error);
        reply.status(500).send({ error: 'Failed to fetch categories' });
        return;
      }
    } else {
      // Serve from cache
      reply.header('Cache-Control', 'public, max-age=300');
      reply.header('X-Cache', 'HIT');
    }
    
    return categoriesCache;
  });

  // Get products with filtering and sorting
  fastify.get('/products', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          sort: { type: 'string', enum: ['price_asc', 'price_desc', 'newest', 'oldest'] },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  categoryId: { type: 'string' },
                  title: { type: 'string' },
                  priceRub: { type: 'number' },
                  description: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string' }
                }
              }
            },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { category, sort = 'price_asc', limit = 50, offset = 0 } = request.query;
    
    try {
      let whereClause = '';
      let params = {};
      
      if (category) {
        // Get category by slug
        const catStmt = db.prepare('SELECT id FROM categories WHERE slug = ?');
        const cat = catStmt.get(category);
        if (!cat) {
          return { products: [], total: 0, hasMore: false };
        }
        whereClause = 'WHERE p.categoryId = ?';
        params = { categoryId: cat.id };
      }
      
      // Order clause
      let orderBy = 'ORDER BY p.priceRub ASC';
      switch (sort) {
        case 'price_desc':
          orderBy = 'ORDER BY p.priceRub DESC';
          break;
        case 'newest':
          orderBy = 'ORDER BY p.createdAt DESC';
          break;
        case 'oldest':
          orderBy = 'ORDER BY p.createdAt ASC';
          break;
        default:
          orderBy = 'ORDER BY p.priceRub ASC';
      }
      
      // Count total products
      const countSql = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
      const countStmt = db.prepare(countSql);
      const totalResult = category ? countStmt.get(params.categoryId) : countStmt.get();
      const total = totalResult.total;
      
      // Get products
      const sql = `
        SELECT p.id, p.categoryId, p.title, p.priceRub, p.description, p.createdAt
        FROM products p
        ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
      `;
      
      const stmt = db.prepare(sql);
      const queryParams = category 
        ? [params.categoryId, limit, offset]
        : [limit, offset];
      const products = stmt.all(...queryParams);
      
      // Get images for each product
      const imgStmt = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC');
      const enriched = products.map(product => ({
        ...product,
        images: imgStmt.all(product.id).map(img => img.url)
      }));
      
      // Set cache headers for products
      reply.header('Cache-Control', 'public, max-age=60'); // 1 minute
      
      return {
        products: enriched,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      fastify.log.error('Database error in /products:', error);
      reply.status(500).send({ error: 'Failed to fetch products' });
    }
  });

  // Get single product
  fastify.get('/product/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            categoryId: { type: 'string' },
            title: { type: 'string' },
            priceRub: { type: 'number' },
            description: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const stmt = db.prepare('SELECT id, categoryId, title, priceRub, description, createdAt FROM products WHERE id = ?');
      const product = stmt.get(id);
      
      if (!product) {
        reply.status(404).send({ error: 'Product not found' });
        return;
      }
      
      // Get images
      const imgStmt = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC');
      const images = imgStmt.all(id).map(img => img.url);
      
      // Set cache headers
      reply.header('Cache-Control', 'public, max-age=300'); // 5 minutes
      
      return {
        ...product,
        images
      };
    } catch (error) {
      fastify.log.error('Database error in /product:', error);
      reply.status(500).send({ error: 'Failed to fetch product' });
    }
  });

  // Get banners
  fastify.get('/banners', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              image: { type: 'string' },
              href: { type: ['string', 'null'] },
              active: { type: 'number' },
              order: { type: 'number' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const stmt = db.prepare('SELECT id, image, href, active, [order] FROM banners WHERE active = 1 ORDER BY [order] ASC');
      const banners = stmt.all();
      
      // Set cache headers
      reply.header('Cache-Control', 'public, max-age=60'); // 1 minute
      
      return banners;
    } catch (error) {
      fastify.log.error('Database error in /banners:', error);
      reply.status(500).send({ error: 'Failed to fetch banners' });
    }
  });

  // Search products
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 2, maxLength: 100 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request, reply) => {
    const { q, limit = 20 } = request.query;
    
    try {
      const searchTerm = `%${q}%`;
      const sql = `
        SELECT p.id, p.categoryId, p.title, p.priceRub, p.description, p.createdAt
        FROM products p
        WHERE p.title LIKE ? OR p.description LIKE ?
        ORDER BY 
          CASE WHEN p.title LIKE ? THEN 1 ELSE 2 END,
          p.priceRub ASC
        LIMIT ?
      `;
      
      const stmt = db.prepare(sql);
      const products = stmt.all(searchTerm, searchTerm, `%${q}%`, limit);
      
      // Get images for each product
      const imgStmt = db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC LIMIT 1');
      const enriched = products.map(product => ({
        ...product,
        image: imgStmt.get(product.id)?.url || null
      }));
      
      return { results: enriched };
    } catch (error) {
      fastify.log.error('Database error in /search:', error);
      reply.status(500).send({ error: 'Search failed' });
    }
  });
}