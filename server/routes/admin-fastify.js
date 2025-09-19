export default async function adminRoutes(fastify, options) {
  // Admin login
  fastify.post('/admin/login', async (request, reply) => {
    const { username, password } = request.body
    
    // Simple admin check (in production, use proper authentication)
    if (username === 'admin' && password === process.env.ADMIN_PASSWORD || 'admin123') {
      const token = fastify.jwt.sign({ 
        id: 1, 
        username: 'admin', 
        role: 'admin' 
      })
      
      reply.setCookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })
      
      return { success: true, message: 'Login successful' }
    }
    
    reply.status(401)
    return { success: false, message: 'Invalid credentials' }
  })

  // Admin logout
  fastify.post('/admin/logout', async (request, reply) => {
    reply.clearCookie('admin_token')
    return { success: true, message: 'Logged out successfully' }
  })

  // Admin middleware for protected routes
  const adminAuth = async (request, reply) => {
    try {
      const token = request.cookies.admin_token
      if (!token) {
        throw new Error('No token provided')
      }
      
      const decoded = fastify.jwt.verify(token)
      if (decoded.role !== 'admin') {
        throw new Error('Insufficient permissions')
      }
      
      request.admin = decoded
    } catch (error) {
      reply.status(401)
      return { success: false, message: 'Unauthorized' }
    }
  }

  // Protected admin routes
  fastify.register(async function(fastify) {
    fastify.addHook('preHandler', adminAuth)

    // Get all orders
    fastify.get('/admin/orders', async (request, reply) => {
      const db = fastify.db
      const orders = db.prepare(`
        SELECT o.*, u.telegram_id, u.username 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `).all()
      
      return { success: true, data: orders }
    })

    // Update order status
    fastify.put('/admin/orders/:id/status', async (request, reply) => {
      const { id } = request.params
      const { status } = request.body
      
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
      if (!validStatuses.includes(status)) {
        reply.status(400)
        return { success: false, message: 'Invalid status' }
      }
      
      const db = fastify.db
      const result = db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
        .run(status, new Date().toISOString(), id)
      
      if (result.changes === 0) {
        reply.status(404)
        return { success: false, message: 'Order not found' }
      }
      
      return { success: true, message: 'Order status updated' }
    })

    // Analytics
    fastify.get('/admin/analytics', async (request, reply) => {
      const db = fastify.db
      
      const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get()
      const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"').get()
      const ordersToday = db.prepare(`
        SELECT COUNT(*) as count FROM orders 
        WHERE DATE(created_at) = DATE('now')
      `).get()
      const popularProducts = db.prepare(`
        SELECT p.name, SUM(oi.quantity) as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 10
      `).all()
      
      return {
        success: true,
        data: {
          totalOrders: totalOrders.count,
          totalRevenue: totalRevenue.total || 0,
          ordersToday: ordersToday.count,
          popularProducts
        }
      }
    })

    // Manage products
    fastify.get('/admin/products', async (request, reply) => {
      const db = fastify.db
      const products = db.prepare(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.created_at DESC
      `).all()
      
      return { success: true, data: products }
    })

    // Create/Update product
    fastify.post('/admin/products', async (request, reply) => {
      const { name, description, price, category_id, image_url, is_available } = request.body
      
      const db = fastify.db
      const result = db.prepare(`
        INSERT INTO products (name, description, price, category_id, image_url, is_available)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, description, price, category_id, image_url, is_available)
      
      return { success: true, data: { id: result.lastInsertRowid } }
    })

    fastify.put('/admin/products/:id', async (request, reply) => {
      const { id } = request.params
      const { name, description, price, category_id, image_url, is_available } = request.body
      
      const db = fastify.db
      const result = db.prepare(`
        UPDATE products 
        SET name = ?, description = ?, price = ?, category_id = ?, 
            image_url = ?, is_available = ?, updated_at = ?
        WHERE id = ?
      `).run(name, description, price, category_id, image_url, is_available, 
             new Date().toISOString(), id)
      
      if (result.changes === 0) {
        reply.status(404)
        return { success: false, message: 'Product not found' }
      }
      
      return { success: true, message: 'Product updated' }
    })

    // Delete product
    fastify.delete('/admin/products/:id', async (request, reply) => {
      const { id } = request.params
      const db = fastify.db
      
      const result = db.prepare('DELETE FROM products WHERE id = ?').run(id)
      
      if (result.changes === 0) {
        reply.status(404)
        return { success: false, message: 'Product not found' }
      }
      
      return { success: true, message: 'Product deleted' }
    })
  })
}