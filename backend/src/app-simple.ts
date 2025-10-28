import Fastify from 'fastify'
import cors from '@fastify/cors'
import { logger } from './utils/logger'

// 建立 Fastify 實例
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

// 註冊 CORS
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
})

// 健康檢查
fastify.get('/health', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: 'development'
  }

  logger.info('健康檢查請求:', { ip: request.ip })
  
  return reply.send(health)
})

// 詳細健康檢查
fastify.get('/health/detailed', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: 'development',
    database: {
      status: 'ok',
      lastCheck: new Date().toISOString()
    },
    redis: {
      status: 'ok',
      lastCheck: new Date().toISOString()
    }
  }

  logger.info('詳細健康檢查請求:', { ip: request.ip })
  
  return reply.send(health)
})

// 事件發佈測試
fastify.post('/api/events/publish', async (request, reply) => {
  const { type, data, source, timestamp } = request.body as any

  if (!type || !data || !source) {
    return reply.status(400).send({
      success: false,
      error: '缺少必要參數: type, data, source'
    })
  }

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    source,
    timestamp: timestamp || new Date().toISOString(),
    status: 'pending'
  }

  logger.info('事件發佈請求:', { eventId: event.id, type, source })

  return reply.send({
    success: true,
    data: event,
    message: '事件發佈成功'
  })
})

// 事件列表測試
fastify.get('/api/events', async (request, reply) => {
  const page = (request.query as any)?.page ? parseInt((request.query as any).page) : 1
  const limit = (request.query as any)?.limit ? parseInt((request.query as any).limit) : 20

  logger.info('查詢事件列表請求:', { page, limit })

  const events: any[] = []
  const total = 0

  return reply.send({
    success: true,
    data: {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    },
    message: '事件列表查詢成功'
  })
})

// 事件統計測試
fastify.get('/api/events/stats/summary', async (_request, reply) => {
  logger.info('查詢事件統計請求')

  const stats = {
    total: 0,
    byType: {},
    bySource: {},
    byStatus: {},
    recent: []
  }

  return reply.send({
    success: true,
    data: stats,
    message: '事件統計查詢成功'
  })
})

// 啟動伺服器
async function start() {
  try {
    const address = await fastify.listen({
      port: 3001,
      host: '0.0.0.0'
    })

    logger.info(`🚀 簡化版後端伺服器啟動成功: ${address}`)
    logger.info(`📊 環境: development`)
    logger.info(`🔧 日誌等級: info`)

  } catch (err) {
    logger.error('❌ 伺服器啟動失敗:', err)
    process.exit(1)
  }
}

// 優雅關閉
process.on('SIGINT', async () => {
  logger.info('🛑 收到 SIGINT 信號，正在關閉伺服器...')
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('🛑 收到 SIGTERM 信號，正在關閉伺服器...')
  await fastify.close()
  process.exit(0)
})

// 啟動應用
start()
