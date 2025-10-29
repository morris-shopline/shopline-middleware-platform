import Fastify from 'fastify'
import cors from '@fastify/cors'

// 建立 Fastify 實例
const fastify = Fastify({
  logger: {
    level: 'info'
  }
})

// 註冊中介軟體
async function registerMiddleware() {
  // CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true
  })
}

// 註冊路由
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // API routes
  fastify.get('/api/status', async (_request, _reply) => {
    return { 
      message: 'Shopline Middleware Platform API',
      version: '1.0.0',
      status: 'running'
    }
  })
}

// 啟動伺服器
async function start() {
  try {
    await registerMiddleware()
    await registerRoutes()
    
    const port = parseInt(process.env.PORT || '3000')
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('Shutting down server...')
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down server...')
  await fastify.close()
  process.exit(0)
})

// 啟動應用
start()