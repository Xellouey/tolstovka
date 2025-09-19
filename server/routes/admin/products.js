import { productSchema, productUpdateSchema, productImagesReorderSchema } from '../../schemas/product.js'

/**
 * Admin products CRUD routes
 * Все роуты защищены аутентификацией
 */
export default async function adminProductsRoutes(fastify, options) {
  // Middleware для проверки аутентификации на всех роутах
  fastify.addHook('preHandler', fastify.authenticate)

  // GET /api/admin/products - Получить все товары с пагинацией
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          category: { type: 'string' },
          search: { type: 'string' }
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
                  categoryName: { type: 'string' },
                  title: { type: 'string' },
                  priceRub: { type: 'integer' },
                  description: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { 
      page = 1, 
      limit = 20, 
      category,
      search 
    } = request.query
    
    try {
      // Подготавливаем условия WHERE
      const conditions = []
      const params = []
      
      if (category) {
        conditions.push('p.categoryId = ?')
        params.push(category)
      }
      
      if (search) {
        conditions.push('(p.title LIKE ? OR p.description LIKE ?)')
        const searchPattern = `%${search}%`
        params.push(searchPattern, searchPattern)
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
      
      // Получаем общее количество товаров
      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        ${whereClause}
      `
      const totalResult = fastify.db.prepare(countQuery).get(...params)
      const total = totalResult.total
      const totalPages = Math.ceil(total / limit)
      
      // Получаем товары с пагинацией
      const offset = (page - 1) * limit
      const productsQuery = `
        SELECT 
          p.id, 
          p.categoryId, 
          c.name as categoryName,
          p.title, 
          p.priceRub, 
          p.description, 
          p.createdAt
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        ${whereClause}
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?
      `
      
      const queryParams = [...params, limit, offset]
      const productsStmt = fastify.db.prepare(productsQuery)
      const products = productsStmt.all(...queryParams)
      
      // Получаем изображения для каждого товара
      const imageStmt = fastify.db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC')
      const enrichedProducts = products.map(product => ({
        ...product,
        images: imageStmt.all(product.id).map(img => img.url)
      }))
      
      reply.send({
        products: enrichedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      })
    } catch (error) {
      fastify.log.error('Error fetching products:', error)
      reply.status(500).send({ 
        error: 'Failed to fetch products',
        message: 'Не удалось загрузить товары'
      })
    }
  })

  // GET /api/admin/products/:id - Получить товар по ID
  fastify.get('/:id', {
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
            priceRub: { type: 'integer' },
            description: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    
    try {
      // Получаем товар
      const productStmt = fastify.db.prepare('SELECT * FROM products WHERE id = ?')
      const product = productStmt.get(id)
      
      if (!product) {
        return reply.status(404).send({ 
          error: 'Product not found',
          message: 'Товар не найден'
        })
      }
      
      // Получаем изображения
      const imageStmt = fastify.db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC')
      const images = imageStmt.all(id).map(img => img.url)
      
      reply.send({
        ...product,
        images
      })
    } catch (error) {
      fastify.log.error('Error fetching product:', error)
      reply.status(500).send({ 
        error: 'Failed to fetch product',
        message: 'Не удалось загрузить товар'
      })
    }
  })

  // POST /api/admin/products - Создать новый товар
  fastify.post('/', {
    schema: {
      body: productSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            categoryId: { type: 'string' },
            title: { type: 'string' },
            priceRub: { type: 'integer' },
            description: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { categoryId, title, priceRub, description, images } = request.body
    
    try {
      // Проверяем существование категории
      const categoryStmt = fastify.db.prepare('SELECT id FROM categories WHERE id = ?')
      const categoryExists = categoryStmt.get(categoryId)
      
      if (!categoryExists) {
        return reply.status(400).send({ 
          error: 'Category not found',
          message: 'Категория не найдена'
        })
      }
      
      // Генерируем ID для нового товара
      const id = `p_${Date.now()}`
      const createdAt = new Date().toISOString()
      
      // Создаем товар в транзакции
      const transaction = fastify.db.transaction(() => {
        // Вставляем товар
        const insertProductStmt = fastify.db.prepare(`
          INSERT INTO products (id, categoryId, title, priceRub, description, createdAt) 
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        insertProductStmt.run(id, categoryId, title || null, priceRub, description || null, createdAt)
        
        // Вставляем изображения
        const insertImageStmt = fastify.db.prepare(`
          INSERT INTO product_images (productId, url, position) 
          VALUES (?, ?, ?)
        `)
        images.forEach((url, index) => {
          insertImageStmt.run(id, url, index)
        })
      })
      
      transaction()
      
      fastify.log.info(`Product created: ${id} (${title})`)
      
      reply.status(201).send({ 
        id, 
        categoryId, 
        title: title || null, 
        priceRub, 
        description: description || null, 
        images, 
        createdAt 
      })
    } catch (error) {
      fastify.log.error('Error creating product:', error)
      reply.status(500).send({ 
        error: 'Failed to create product',
        message: 'Не удалось создать товар'
      })
    }
  })

  // PUT /api/admin/products/:id - Обновить товар
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: productUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            categoryId: { type: 'string' },
            title: { type: 'string' },
            priceRub: { type: 'integer' },
            description: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const updates = request.body
    
    try {
      // Проверяем существование товара
      const existingStmt = fastify.db.prepare('SELECT * FROM products WHERE id = ?')
      const existing = existingStmt.get(id)
      
      if (!existing) {
        return reply.status(404).send({ 
          error: 'Product not found',
          message: 'Товар не найден'
        })
      }
      
      // Проверяем категорию если она указана
      if (updates.categoryId) {
        const categoryStmt = fastify.db.prepare('SELECT id FROM categories WHERE id = ?')
        const categoryExists = categoryStmt.get(updates.categoryId)
        
        if (!categoryExists) {
          return reply.status(400).send({ 
            error: 'Category not found',
            message: 'Категория не найдена'
          })
        }
      }
      
      // Обновляем в транзакции
      const transaction = fastify.db.transaction(() => {
        // Подготавливаем поля для обновления товара
        const fieldsToUpdate = []
        const valuesToUpdate = []
        
        if (updates.categoryId !== undefined) {
          fieldsToUpdate.push('categoryId = ?')
          valuesToUpdate.push(updates.categoryId)
        }
        if (updates.title !== undefined) {
          fieldsToUpdate.push('title = ?')
          valuesToUpdate.push(updates.title)
        }
        if (updates.priceRub !== undefined) {
          fieldsToUpdate.push('priceRub = ?')
          valuesToUpdate.push(updates.priceRub)
        }
        if (updates.description !== undefined) {
          fieldsToUpdate.push('description = ?')
          valuesToUpdate.push(updates.description)
        }
        
        // Обновляем товар если есть изменения
        if (fieldsToUpdate.length > 0) {
          const updateQuery = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = ?`
          valuesToUpdate.push(id)
          
          const updateStmt = fastify.db.prepare(updateQuery)
          updateStmt.run(...valuesToUpdate)
        }
        
        // Обновляем изображения если указаны
        if (updates.images) {
          // Удаляем старые изображения
          const deleteImagesStmt = fastify.db.prepare('DELETE FROM product_images WHERE productId = ?')
          deleteImagesStmt.run(id)
          
          // Вставляем новые изображения
          const insertImageStmt = fastify.db.prepare(`
            INSERT INTO product_images (productId, url, position) 
            VALUES (?, ?, ?)
          `)
          updates.images.forEach((url, index) => {
            insertImageStmt.run(id, url, index)
          })
        }
      })
      
      transaction()
      
      // Возвращаем обновленный товар
      const updatedProduct = existingStmt.get(id)
      const imageStmt = fastify.db.prepare('SELECT url FROM product_images WHERE productId = ? ORDER BY position ASC')
      const images = imageStmt.all(id).map(img => img.url)
      
      fastify.log.info(`Product updated: ${id}`)
      
      reply.send({
        ...updatedProduct,
        images
      })
    } catch (error) {
      fastify.log.error('Error updating product:', error)
      reply.status(500).send({ 
        error: 'Failed to update product',
        message: 'Не удалось обновить товар'
      })
    }
  })

  // DELETE /api/admin/products/:id - Удалить товар
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        204: {},
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    
    try {
      // Удаляем товар (изображения удалятся автоматически из-за CASCADE)
      const deleteStmt = fastify.db.prepare('DELETE FROM products WHERE id = ?')
      const result = deleteStmt.run(id)
      
      if (result.changes === 0) {
        return reply.status(404).send({ 
          error: 'Product not found',
          message: 'Товар не найден'
        })
      }
      
      fastify.log.info(`Product deleted: ${id}`)
      
      reply.status(204).send()
    } catch (error) {
      fastify.log.error('Error deleting product:', error)
      reply.status(500).send({ 
        error: 'Failed to delete product',
        message: 'Не удалось удалить товар'
      })
    }
  })

  // PATCH /api/admin/products/:id/images/reorder - Изменить порядок изображений товара
  fastify.patch('/:id/images/reorder', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: productImagesReorderSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const { images } = request.body
    
    try {
      // Проверяем существование товара
      const productStmt = fastify.db.prepare('SELECT id FROM products WHERE id = ?')
      const productExists = productStmt.get(id)
      
      if (!productExists) {
        return reply.status(404).send({ 
          error: 'Product not found',
          message: 'Товар не найден'
        })
      }
      
      // Обновляем порядок изображений в транзакции
      const transaction = fastify.db.transaction(() => {
        // Удаляем все изображения
        const deleteStmt = fastify.db.prepare('DELETE FROM product_images WHERE productId = ?')
        deleteStmt.run(id)
        
        // Вставляем изображения в новом порядке
        const insertStmt = fastify.db.prepare(`
          INSERT INTO product_images (productId, url, position) 
          VALUES (?, ?, ?)
        `)
        images.forEach((url, index) => {
          insertStmt.run(id, url, index)
        })
      })
      
      transaction()
      
      fastify.log.info(`Product images reordered: ${id}`)
      
      reply.send({ 
        success: true,
        message: 'Порядок изображений обновлен',
        images
      })
    } catch (error) {
      fastify.log.error('Error reordering product images:', error)
      reply.status(500).send({ 
        error: 'Failed to reorder images',
        message: 'Не удалось изменить порядок изображений'
      })
    }
  })
}