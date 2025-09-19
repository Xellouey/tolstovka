import { bannerSchema, bannerUpdateSchema, bannerReorderSchema } from '../../schemas/banner.js'

/**
 * Admin banners CRUD routes
 * Все роуты защищены аутентификацией
 */
export default async function adminBannersRoutes(fastify, options) {
  // Middleware для проверки аутентификации на всех роутах
  fastify.addHook('preHandler', fastify.authenticate)

  // GET /api/admin/banners - Получить все банеры (включая неактивные)
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              image: { type: 'string' },
              href: { type: 'string' },
              active: { type: 'integer' },
              order: { type: 'integer' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const stmt = fastify.db.prepare(`
        SELECT id, image, href, active, [order] 
        FROM banners 
        ORDER BY [order] ASC, id ASC
      `)
      const banners = stmt.all()
      
      // Конвертируем active из integer в boolean для удобства
      const bannersWithBoolean = banners.map(banner => ({
        ...banner,
        active: Boolean(banner.active)
      }))
      
      reply.send(bannersWithBoolean)
    } catch (error) {
      fastify.log.error('Error fetching banners:', error)
      reply.status(500).send({ 
        error: 'Failed to fetch banners',
        message: 'Не удалось загрузить банеры'
      })
    }
  })

  // POST /api/admin/banners - Создать новый банер
  fastify.post('/', {
    schema: {
      body: bannerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            image: { type: 'string' },
            href: { type: 'string' },
            active: { type: 'boolean' },
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
    const { image, href, active = true } = request.body
    
    try {
      // Генерируем ID для нового банера
      const id = `b_${Date.now()}`
      
      // Получаем следующий порядковый номер
      const maxOrderStmt = fastify.db.prepare('SELECT MAX([order]) as maxOrder FROM banners')
      const maxOrderResult = maxOrderStmt.get()
      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1
      
      // Вставляем новый банер
      const insertStmt = fastify.db.prepare(`
        INSERT INTO banners (id, image, href, active, [order]) 
        VALUES (?, ?, ?, ?, ?)
      `)
      
      insertStmt.run(id, image, href, active ? 1 : 0, nextOrder)
      
      fastify.log.info(`Banner created: ${id}`)
      
      reply.status(201).send({ 
        id, 
        image, 
        href, 
        active, 
        order: nextOrder 
      })
    } catch (error) {
      fastify.log.error('Error creating banner:', error)
      reply.status(500).send({ 
        error: 'Failed to create banner',
        message: 'Не удалось создать банер'
      })
    }
  })

  // PUT /api/admin/banners/:id - Обновить банер
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: bannerUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            image: { type: 'string' },
            href: { type: 'string' },
            active: { type: 'boolean' },
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
      // Проверяем существование банера
      const existingStmt = fastify.db.prepare('SELECT * FROM banners WHERE id = ?')
      const existing = existingStmt.get(id)
      
      if (!existing) {
        return reply.status(404).send({ 
          error: 'Banner not found',
          message: 'Банер не найден'
        })
      }
      
      // Подготавливаем поля для обновления
      const fieldsToUpdate = []
      const valuesToUpdate = []
      
      if (updates.image !== undefined) {
        fieldsToUpdate.push('image = ?')
        valuesToUpdate.push(updates.image)
      }
      if (updates.href !== undefined) {
        fieldsToUpdate.push('href = ?')
        valuesToUpdate.push(updates.href)
      }
      if (updates.active !== undefined) {
        fieldsToUpdate.push('active = ?')
        valuesToUpdate.push(updates.active ? 1 : 0)
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
      const updateQuery = `UPDATE banners SET ${fieldsToUpdate.join(', ')} WHERE id = ?`
      valuesToUpdate.push(id)
      
      const updateStmt = fastify.db.prepare(updateQuery)
      const result = updateStmt.run(...valuesToUpdate)
      
      if (result.changes === 0) {
        return reply.status(404).send({ 
          error: 'Banner not found',
          message: 'Банер не найден'
        })
      }
      
      // Возвращаем обновленный банер
      const updatedStmt = fastify.db.prepare('SELECT * FROM banners WHERE id = ?')
      const updated = updatedStmt.get(id)
      
      fastify.log.info(`Banner updated: ${id}`)
      
      reply.send({
        ...updated,
        active: Boolean(updated.active)
      })
    } catch (error) {
      fastify.log.error('Error updating banner:', error)
      reply.status(500).send({ 
        error: 'Failed to update banner',
        message: 'Не удалось обновить банер'
      })
    }
  })

  // DELETE /api/admin/banners/:id - Удалить банер
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
      const deleteStmt = fastify.db.prepare('DELETE FROM banners WHERE id = ?')
      const result = deleteStmt.run(id)
      
      if (result.changes === 0) {
        return reply.status(404).send({ 
          error: 'Banner not found',
          message: 'Банер не найден'
        })
      }
      
      fastify.log.info(`Banner deleted: ${id}`)
      
      reply.status(204).send()
    } catch (error) {
      fastify.log.error('Error deleting banner:', error)
      reply.status(500).send({ 
        error: 'Failed to delete banner',
        message: 'Не удалось удалить банер'
      })
    }
  })

  // PATCH /api/admin/banners/reorder - Изменить порядок банеров
  fastify.patch('/reorder', {
    schema: {
      body: bannerReorderSchema,
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
    const { banners } = request.body
    
    try {
      // Обновляем порядок банеров в транзакции
      const updateStmt = fastify.db.prepare('UPDATE banners SET [order] = ? WHERE id = ?')
      const transaction = fastify.db.transaction((bannersToReorder) => {
        for (const banner of bannersToReorder) {
          const result = updateStmt.run(banner.order, banner.id)
          if (result.changes === 0) {
            throw new Error(`Banner not found: ${banner.id}`)
          }
        }
      })
      
      transaction(banners)
      
      fastify.log.info(`Banners reordered: ${banners.length} items`)
      
      reply.send({ 
        success: true,
        message: 'Порядок банеров обновлен'
      })
    } catch (error) {
      fastify.log.error('Error reordering banners:', error)
      
      if (error.message.includes('Banner not found')) {
        return reply.status(400).send({ 
          error: 'Invalid banner ID',
          message: error.message
        })
      }
      
      reply.status(500).send({ 
        error: 'Failed to reorder banners',
        message: 'Не удалось изменить порядок банеров'
      })
    }
  })
}