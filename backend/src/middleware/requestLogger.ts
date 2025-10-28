import { FastifyRequest, FastifyReply } from 'fastify'
import { logger } from '../utils/logger'

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const start = Date.now()

  // 記錄請求開始
  logger.info('請求開始:', {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent']
  })

  // 監聽回應完成
  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = Date.now() - start
    
    logger.info('請求完成:', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ip: request.ip
    })

    done()
  })
}
