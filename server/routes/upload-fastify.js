import path from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function uploadRoutes(fastify, options) {
  // Multipart is already registered in main server

  // Upload single file
  fastify.post('/upload/single', async (request, reply) => {
    try {
      const data = await request.file()
      
      if (!data) {
        reply.status(400)
        return { success: false, message: 'No file provided' }
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(data.mimetype)) {
        reply.status(400)
        return { success: false, message: 'Invalid file type. Only images are allowed.' }
      }

      // Generate unique filename
      const timestamp = Date.now()
      const extension = path.extname(data.filename) || '.jpg'
      const filename = `upload_${timestamp}_${Math.random().toString(36).substr(2, 9)}${extension}`
      
      // For development, we'll return a placeholder URL
      // In production, you would save to cloud storage (AWS S3, etc.)
      const uploadPath = `/uploads/${filename}`
      const fullPath = path.join(__dirname, '../../uploads', filename)

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.dirname(fullPath)
      try {
        await fs.access(uploadsDir)
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true })
      }

      // For now, return placeholder URL since we're using placeholder images
      const placeholderUrl = `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent('Uploaded Image')}`

      return {
        success: true,
        data: {
          filename,
          originalName: data.filename,
          mimetype: data.mimetype,
          size: 0, // We don't actually save the file in development
          url: placeholderUrl,
          path: uploadPath
        }
      }

    } catch (error) {
      fastify.log.error(error)
      reply.status(500)
      return { success: false, message: 'Upload failed' }
    }
  })

  // Upload multiple files
  fastify.post('/upload/multiple', async (request, reply) => {
    try {
      const files = []
      const parts = request.files()

      for await (const part of parts) {
        if (part.file) {
          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          if (!allowedTypes.includes(part.mimetype)) {
            reply.status(400)
            return { success: false, message: `Invalid file type for ${part.filename}. Only images are allowed.` }
          }

          // Generate unique filename
          const timestamp = Date.now()
          const extension = path.extname(part.filename) || '.jpg'
          const filename = `upload_${timestamp}_${Math.random().toString(36).substr(2, 9)}${extension}`
          
          const placeholderUrl = `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent('Uploaded Image')}`

          files.push({
            filename,
            originalName: part.filename,
            mimetype: part.mimetype,
            size: 0,
            url: placeholderUrl,
            path: `/uploads/${filename}`
          })
        }
      }

      if (files.length === 0) {
        reply.status(400)
        return { success: false, message: 'No files provided' }
      }

      return {
        success: true,
        data: { files }
      }

    } catch (error) {
      fastify.log.error(error)
      reply.status(500)
      return { success: false, message: 'Upload failed' }
    }
  })

  // Delete uploaded file
  fastify.delete('/upload/:filename', async (request, reply) => {
    try {
      const { filename } = request.params
      
      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        reply.status(400)
        return { success: false, message: 'Invalid filename' }
      }

      const fullPath = path.join(__dirname, '../../uploads', filename)
      
      try {
        await fs.access(fullPath)
        await fs.unlink(fullPath)
        return { success: true, message: 'File deleted successfully' }
      } catch (error) {
        if (error.code === 'ENOENT') {
          reply.status(404)
          return { success: false, message: 'File not found' }
        }
        throw error
      }

    } catch (error) {
      fastify.log.error(error)
      reply.status(500)
      return { success: false, message: 'Delete failed' }
    }
  })

  // Get upload info
  fastify.get('/upload/info', async (request, reply) => {
    const uploadsDir = path.join(__dirname, '../../uploads')
    
    try {
      const files = await fs.readdir(uploadsDir)
      const fileStats = []

      for (const filename of files) {
        try {
          const filePath = path.join(uploadsDir, filename)
          const stats = await fs.stat(filePath)
          
          fileStats.push({
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${filename}`
          })
        } catch (error) {
          // Skip files that can't be stat'd
          continue
        }
      }

      return {
        success: true,
        data: {
          totalFiles: fileStats.length,
          totalSize: fileStats.reduce((sum, file) => sum + file.size, 0),
          files: fileStats
        }
      }

    } catch (error) {
      return {
        success: true,
        data: {
          totalFiles: 0,
          totalSize: 0,
          files: []
        }
      }
    }
  })
}