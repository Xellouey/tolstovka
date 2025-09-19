import { authPlugin } from '../middleware/auth.js'
import adminAuthRoutes from './admin/auth.js'
import adminBannersRoutes from './admin/banners.js'
import adminCategoriesRoutes from './admin/categories.js'
import adminProductsRoutes from './admin/products.js'

/**
 * Admin routes plugin
 */
export default async function adminRoutes(fastify, options) {
  // Register JWT authentication plugin
  await fastify.register(authPlugin)

  // Register auth routes (no auth required for login)
  await fastify.register(adminAuthRoutes, { prefix: '/auth' })
  
  // Register protected admin routes
  await fastify.register(adminBannersRoutes, { prefix: '/banners' })
  await fastify.register(adminCategoriesRoutes, { prefix: '/categories' })
  await fastify.register(adminProductsRoutes, { prefix: '/products' })

  // Get admin stats (для совместимости с существующим фронтендом)
  fastify.get('/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const categories = fastify.db.prepare('SELECT COUNT(*) as count FROM categories').get()
      const products = fastify.db.prepare('SELECT COUNT(*) as count FROM products').get()
      const banners = fastify.db.prepare('SELECT COUNT(*) as count FROM banners WHERE active = 1').get()
      
      return {
        categories: categories.count,
        products: products.count, 
        banners: banners.count,
        active: banners.count
      }
    } catch (error) {
      fastify.log.error('Error fetching admin stats:', error)
      reply.status(500).send({ 
        error: 'Failed to fetch stats',
        message: 'Не удалось загрузить статистику'
      })
    }
  })
}
