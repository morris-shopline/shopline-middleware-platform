import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { logger } from '../utils/logger'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 記錄錯誤
  logger.error('請求錯誤:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    ip: request.ip,
    userAgent: request.headers['user-agent']
  })

  // 根據錯誤類型設定狀態碼
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'

  // 處理特定錯誤類型
  if (error.code === 'FST_ERR_VALIDATION') {
    statusCode = 400
    message = '請求參數驗證失敗'
  } else if (error.code === 'FST_ERR_NOT_FOUND') {
    statusCode = 404
    message = '找不到請求的資源'
  } else if (error.code === 'FST_ERR_UNAUTHORIZED') {
    statusCode = 401
    message = '未授權訪問'
  } else if (error.code === 'FST_ERR_FORBIDDEN') {
    statusCode = 403
    message = '禁止訪問'
  }

  // 在開發環境顯示詳細錯誤
  const response: any = {
    success: false,
    error: message,
    statusCode
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack
    response.details = error.validation
  }

  reply.status(statusCode).send(response)
}
