import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { config } from './config'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { authRoutes } from './routes/auth'
import { shoplineRoutes } from './routes/shopline'
import { eventRoutes } from './routes/events'
import { healthRoutes } from './routes/health'

// 建立 Fastify 實例
const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    } : undefined
  }
})

// 註冊中介軟體
async function registerMiddleware() {
  // CORS
  await fastify.register(cors, {
    origin: config.corsOrigins,
    credentials: true
  })

  // 安全性標頭
  await fastify.register(helmet, {
    contentSecurityPolicy: false // 允許內聯樣式
  })

  // 速率限制
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  // 請求日誌
  fastify.addHook('onRequest', requestLogger)

  // 錯誤處理
  fastify.setErrorHandler(errorHandler)
}

// 註冊路由
async function registerRoutes() {
  // 健康檢查
  await fastify.register(healthRoutes, { prefix: '/health' })

  // 認證路由
  await fastify.register(authRoutes, { prefix: '/api/auth' })

  // Shopline API 路由
  await fastify.register(shoplineRoutes, { prefix: '/api/shopline' })

  // 事件路由
  await fastify.register(eventRoutes, { prefix: '/api/events' })
}

// 啟動伺服器
async function start() {
  try {
    // 註冊中介軟體
    await registerMiddleware()

    // 註冊路由
    await registerRoutes()

    // 啟動伺服器
    const address = await fastify.listen({
      port: config.port,
      host: config.host
    })

    logger.info(`🚀 伺服器啟動成功: ${address}`)
    logger.info(`📊 環境: ${config.nodeEnv}`)
    logger.info(`🔧 日誌等級: ${config.logLevel}`)

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
