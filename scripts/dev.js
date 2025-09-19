#!/usr/bin/env node
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🚀 Starting TOLSOVKA development environment...')

// Function to spawn process with nice output
function spawnProcess(command, args, cwd, label, color = '\x1b[36m') {
  const child = spawn(command, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  })

  const prefix = `${color}[${label}]\x1b[0m`

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n')
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${prefix} ${line}`)
      }
    })
  })

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n')
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${prefix} ${line}`)
      }
    })
  })

  child.on('exit', (code) => {
    console.log(`${prefix} Process exited with code ${code}`)
  })

  return child
}

// Start processes
const processes = []

// 1. Start Fastify server
console.log('📡 Starting backend server...')
const server = spawnProcess(
  'node',
  ['fastify-server.js'],
  path.join(projectRoot, 'server'),
  'SERVER',
  '\x1b[32m' // Green
)
processes.push(server)

// 2. Start frontend dev server
console.log('🎨 Starting frontend dev server...')
const frontend = spawnProcess(
  'npm',
  ['run', 'dev'],
  path.join(projectRoot, 'frontend'),
  'FRONTEND',
  '\x1b[34m' // Blue
)
processes.push(frontend)

// 3. Start Telegram bot (optional)
if (process.argv.includes('--bot')) {
  console.log('🤖 Starting Telegram bot...')
  const bot = spawnProcess(
    'node',
    ['bot.js'],
    path.join(projectRoot, 'server'),
    'BOT',
    '\x1b[33m' // Yellow
  )
  processes.push(bot)
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...')
  processes.forEach(child => {
    child.kill('SIGTERM')
  })
  process.exit(0)
})

process.on('SIGTERM', () => {
  processes.forEach(child => {
    child.kill('SIGTERM')
  })
  process.exit(0)
})

console.log(`
✨ Development servers starting...

📱 Frontend: http://localhost:5173
📡 Backend:  http://localhost:8080
🤖 Bot:      ${process.argv.includes('--bot') ? 'Started' : 'Use --bot flag to start'}

Press Ctrl+C to stop all servers
`)