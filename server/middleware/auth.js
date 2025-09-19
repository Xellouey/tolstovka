/**
 * JWT Authentication middleware for Fastify
 */

// JWT secret key - в production должен быть в переменных окружения
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

/**
 * Authentication middleware plugin
 * Adds JWT verification to Fastify instance
 */
export async function authPlugin(fastify, options) {
  // JWT плагин уже регистрируется глобально в fastify-server.js
  // Здесь добавляем только декоратор аутентификации
  // Add authentication decorator
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify()
      
      // Проверяем что пользователь - админ
      if (request.user.role !== 'admin') {
        throw new Error('Access denied')
      }
    } catch (err) {
      reply.status(401).send({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      })
    }
  })
}

/**
 * Utility function to generate JWT token
 */
export function generateToken(payload) {
  return fastify.jwt.sign(payload)
}