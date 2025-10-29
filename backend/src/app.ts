import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})

// 註冊 CORS
fastify.register(cors, {
  origin: true
})

// 基本路由
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

fastify.get('/api/status', async (request, reply) => {
  return { 
    message: 'Shopline Middleware Platform API',
    version: '1.0.0',
    status: 'running'
  }
})

// 啟動伺服器
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000')
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()