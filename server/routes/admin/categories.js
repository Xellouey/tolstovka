import slugify from 'slugify'
import { categorySchema, categoryUpdateSchema, categoryReorderSchema } from '../../schemas/category.js'

/**
 * Admin categories CRUD routes
 * Все роуты защищены аутентификацией
 */
export default async function adminCategoriesRoutes(fastify, options) {
  // Middleware для проверки аутентификации на всех роутах
  fastify.addHook('preHandler', fastify.authenticate)

  // GET /api/admin/categories - Получить все категории
  fastify.get('/', {
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
              order: { type: 'integer' },
              productCount: { type: 'integer' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Получаем категории с количеством товаров
      const stmt = fastify.db.prepare(`
        SELECT 
          c.id, 
          c.slug, 
          c.name, 
          c.[order],
          COUNT(p.id) as productCount
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoryId
        GROUP BY c.id, c.slug, c.name, c.[order]
        ORDER BY c.[order] ASC, c.name ASC
      `)
      const categories = stmt.all()
      
      reply.send(categories)
    } catch (error) {
      fastify.log.error('Error fetching categories:', error)
      reply.status(500).send({ 
        error: 'Failed to fetch categories',
        message: 'Не удалось загрузить категории'
      })
    }
  })

  // POST /api/admin/categories - Создать новую категорию
  fastify.post('/', {
    schema: {
      body: categorySchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string' },
            name: { type: 'string' },
            order: { type: 'integer' }
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
    const { name, slug: providedSlug } = request.body
    
    try {
      // Генерируем ID и slug
      const id = `c_${Date.now()}`
      const slug = providedSlug || slugify(name, { 
        lower: true, 
        strict: true, 
        locale: 'ru',
        replacement: '-'
      })
      
      // Проверяем уникальность slug
      const existingSlugStmt = fastify.db.prepare('SELECT id FROM categories WHERE slug = ?')
      const existingSlug = existingSlugStmt.get(slug)
      
      if (existingSlug) {
        return reply.status(400).send({ 
          error: 'Slug already exists',
          message: `Категория с URL "${slug}" уже существует`
        })
      }
      
      // Получаем следующий порядковый номер
      const maxOrderStmt = fastify.db.prepare('SELECT MAX([order]) as maxOrder FROM categories')
      const maxOrderResult = maxOrderStmt.get()
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1
      
      // Вставляем новую категорию
      const insertStmt = fastify.db.prepare(`
        INSERT INTO categories (id, slug, name, [order]) 
        VALUES (?, ?, ?, ?)
      `)
      
      insertStmt.run(id, slug, name, nextOrder)
      
      fastify.log.info(`Category created: ${id} (${name})`)
      
      reply.status(201).send({ 
        id, 
        slug, 
        name, 
        order: nextOrder 
      })
    } catch (error) {
      fastify.log.error('Error creating category:', error)
      reply.status(500).send({ 
        error: 'Failed to create category',
        message: 'Не удалось создать категорию'
      })
    }
  })

  // PUT /api/admin/categories/:id - Обновить категорию
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: categoryUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string' },
            name: { type: 'string' },
            order: { type: 'integer' }
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
      // Проверяем существование категории
      const existingStmt = fastify.db.prepare('SELECT * FROM categories WHERE id = ?')
      const existing = existingStmt.get(id)
      
      if (!existing) {
        return reply.status(404).send({ 
          error: 'Category not found',
          message: 'Категория не найдена'
        })
      }
      
      // Подготавливаем поля для обновления
      const fieldsToUpdate = []
      const valuesToUpdate = []
      
      if (updates.name !== undefined) {
        fieldsToUpdate.push('name = ?')
        valuesToUpdate.push(updates.name)
        
        // Если имя изменилось, но slug не указан, генерируем новый slug
        if (!updates.slug) {
          const newSlug = slugify(updates.name, { 
            lower: true, 
            strict: true, 
            locale: 'ru',
            replacement: '-'
          })
          
          // Проверяем уникальность нового slug
          if (newSlug !== existing.slug) {
            const existingSlugStmt = fastify.db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?')
            const existingSlug = existingSlugStmt.get(newSlug, id)
            
            if (!existingSlug) {
              fieldsToUpdate.push('slug = ?')
              valuesToUpdate.push(newSlug)
            }
          }
        }
      }
      
      if (updates.slug !== undefined) {
        // Проверяем уникальность slug
        const existingSlugStmt = fastify.db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?')
        const existingSlug = existingSlugStmt.get(updates.slug, id)
        
        if (existingSlug) {
          return reply.status(400).send({ 
            error: 'Slug already exists',
            message: `Категория с URL "${updates.slug}" уже существует`
          })
        }
        
        fieldsToUpdate.push('slug = ?')
        valuesToUpdate.push(updates.slug)
      }
      
      if (updates.order !== undefined) {
        fieldsToUpdate.push('[order] = ?')
        valuesToUpdate.push(updates.order)
      }
      
      if (fieldsToUpdate.length === 0) {
        return reply.status(400).send({ 
          error: 'No fields to update',
          message: 'Нет полей для обновления'
        })
      }
      
      // Выполняем обновление
      const updateQuery = `UPDATE categories SET ${fieldsToUpdate.join(', ')} WHERE id = ?`
      valuesToUpdate.push(id)
      
      const updateStmt = fastify.db.prepare(updateQuery)
      const result = updateStmt.run(...valuesToUpdate)
      
      if (result.changes === 0) {
        return reply.status(404).send({ 
          error: 'Category not found',
          message: 'Категория не найдена'
        })
      }
      
      // Возвращаем обновленную категорию
      const updatedStmt = fastify.db.prepare('SELECT * FROM categories WHERE id = ?')
      const updated = updatedStmt.get(id)
      
      fastify.log.info(`Category updated: ${id} (${updated.name})`)
      
      reply.send(updated)
    } catch (error) {
      fastify.log.error('Error updating category:', error)
      reply.status(500).send({ 
        error: 'Failed to update category',
        message: 'Не удалось обновить категорию'
      })
    }
  })

  // DELETE /api/admin/categories/:id - Удалить категорию
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
        },
        409: {
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
      // Проверяем есть ли товары в этой категории
      const productCountStmt = fastify.db.prepare('SELECT COUNT(*) as count FROM products WHERE categoryId = ?')
      const productCount = productCountStmt.get(id)?.count || 0
      
      if (productCount > 0) {
        return reply.status(409).send({ 
          error: 'Category has products',
          message: `В категории есть товары (${productCount}). Удалите их сначала.`
        })
      }
      
      // Удаляем категорию
      const deleteStmt = fastify.db.prepare('DELETE FROM categories WHERE id = ?')
      const result = deleteStmt.run(id)
      
      if (result.changes === 0) {
        return reply.status(404).send({ 
          error: 'Category not found',
          message: 'Категория не найдена'
        })
      }
      
      fastify.log.info(`Category deleted: ${id}`)
      
      reply.status(204).send()
    } catch (error) {
      fastify.log.error('Error deleting category:', error)
      reply.status(500).send({ 
        error: 'Failed to delete category',
        message: 'Не удалось удалить категорию'
      })
    }
  })

  // PATCH /api/admin/categories/reorder - Изменить порядок категорий
  fastify.patch('/reorder', {
    schema: {
      body: categoryReorderSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
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
    const { categories } = request.body
    
    try {
      // Обновляем порядок категорий в транзакции
      const updateStmt = fastify.db.prepare('UPDATE categories SET [order] = ? WHERE id = ?')
      const transaction = fastify.db.transaction((categoriesToReorder) => {
        for (const category of categoriesToReorder) {
          const result = updateStmt.run(category.order, category.id)
          if (result.changes === 0) {
            throw new Error(`Category not found: ${category.id}`)
          }
        }
      })
      
      transaction(categories)
      
      fastify.log.info(`Categories reordered: ${categories.length} items`)
      
      reply.send({ 
        success: true,
        message: 'Порядок категорий обновлен'
      })
    } catch (error) {
      fastify.log.error('Error reordering categories:', error)
      
      if (error.message.includes('Category not found')) {
        return reply.status(400).send({ 
          error: 'Invalid category ID',
          message: error.message
        })
      }
      
      reply.status(500).send({ 
        error: 'Failed to reorder categories',
        message: 'Не удалось изменить порядок категорий'
      })
    }
  })
}