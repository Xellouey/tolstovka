import bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { loginSchema, changePasswordSchema } from '../../schemas/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminConfigPath = path.resolve(__dirname, '../../config/admin.json')

/**
 * Admin authentication routes
 */
export default async function adminAuthRoutes(fastify, options) {
  
  // POST /api/admin/auth/login - Авторизация админа
  fastify.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body
    
    try {
      // Читаем конфигурацию админа
      const adminConfigData = await fs.readFile(adminConfigPath, 'utf8')
      const admin = JSON.parse(adminConfigData)
      
      // Проверяем имя пользователя
      if (username !== admin.username) {
        return reply.status(401).send({ 
          error: 'Invalid credentials',
          message: 'Неверное имя пользователя или пароль'
        })
      }
      
      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash)
      if (!isValidPassword) {
        return reply.status(401).send({ 
          error: 'Invalid credentials',
          message: 'Неверное имя пользователя или пароль'
        })
      }
      
      // Генерируем JWT токен
      const token = await reply.jwtSign({ 
        username: admin.username, 
        role: 'admin'
      }, { 
        expiresIn: '24h' 
      })
      
      fastify.log.info(`Admin login successful: ${username}`)
      
      reply.send({ 
        success: true, 
        token,
        user: { 
          username: admin.username, 
          role: 'admin' 
        }
      })
      
    } catch (error) {
      fastify.log.error('Login error:', error)
      reply.status(500).send({ 
        error: 'Authentication failed',
        message: 'Внутренняя ошибка сервера'
      })
    }
  })

  // POST /api/admin/auth/verify - Проверка токена
  fastify.post('/verify', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    // Если мы дошли сюда, значит токен валиден (проверен в middleware)
    reply.send({
      valid: true,
      user: {
        username: request.user.username,
        role: request.user.role
      }
    })
  })

  // POST /api/admin/auth/password - Смена пароля
  fastify.post('/password', {
    preHandler: [fastify.authenticate],
    schema: {
      body: changePasswordSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body
    
    try {
      // Читаем текущую конфигурацию
      const adminConfigData = await fs.readFile(adminConfigPath, 'utf8')
      const admin = JSON.parse(adminConfigData)
      
      // Проверяем текущий пароль
      const isValidPassword = await bcrypt.compare(currentPassword, admin.passwordHash)
      if (!isValidPassword) {
        return reply.status(401).send({ 
          error: 'Current password is incorrect',
          message: 'Текущий пароль указан неверно'
        })
      }
      
      // Хешируем новый пароль
      const newPasswordHash = await bcrypt.hash(newPassword, 10)
      
      // Обновляем конфигурацию
      const updatedAdmin = {
        ...admin,
        passwordHash: newPasswordHash,
        updatedAt: new Date().toISOString()
      }
      
      // Записываем обновленную конфигурацию
      await fs.writeFile(adminConfigPath, JSON.stringify(updatedAdmin, null, 2))
      
      fastify.log.info(`Password changed for admin: ${admin.username}`)
      
      reply.send({ 
        success: true,
        message: 'Пароль успешно изменен'
      })
      
    } catch (error) {
      fastify.log.error('Password change error:', error)
      reply.status(500).send({ 
        error: 'Failed to update password',
        message: 'Не удалось изменить пароль'
      })
    }
  })

  // POST /api/admin/auth/logout - Выход (на клиенте просто удаляем токен)
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // JWT токены stateless, поэтому просто возвращаем успех
    // На клиенте нужно удалить токен из localStorage/cookies
    reply.send({ 
      success: true,
      message: 'Вы успешно вышли из системы'
    })
  })
}