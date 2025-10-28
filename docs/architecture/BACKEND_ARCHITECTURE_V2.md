# 後端架構設計 V2 - 前後端分離

**版本**: 2.0.0  
**建立日期**: 2025-01-27  
**目標**: 獨立 API 服務，部署在 Render  
**狀態**: 設計階段

---

## 🎯 設計目標

### 核心原則
- **獨立服務**: 不依賴前端，可獨立部署和擴展
- **RESTful API**: 標準的 REST API 設計
- **模組化**: 清晰的代碼組織和職責分離
- **可觀測性**: 完整的日誌、監控和錯誤追蹤
- **安全性**: 認證、授權、CORS、速率限制

### 技術選型
- **運行時**: Node.js 18+
- **框架**: Express.js
- **資料庫**: PostgreSQL (Vercel Postgres 或外部)
- **認證**: JWT + OAuth 2.0
- **部署**: Render
- **監控**: 內建日誌系統

---

## 🏗️ 目錄結構

```
backend/
├── src/
│   ├── controllers/              # 控制器層
│   │   ├── authController.js     # 認證控制器
│   │   ├── shopController.js     # 商店控制器
│   │   ├── productController.js  # 商品控制器
│   │   ├── orderController.js    # 訂單控制器
│   │   └── eventController.js    # 事件控制器
│   ├── services/                 # 業務邏輯層
│   │   ├── shoplineService.js    # Shopline 服務
│   │   ├── nextEngineService.js  # Next Engine 服務
│   │   ├── eventBusService.js    # 事件總線服務
│   │   ├── authService.js        # 認證服務
│   │   └── databaseService.js    # 資料庫服務
│   ├── models/                   # 資料模型層
│   │   ├── database.js           # 資料庫連接
│   │   ├── Token.js              # Token 模型
│   │   ├── Event.js              # 事件模型
│   │   └── Shop.js               # 商店模型
│   ├── middleware/               # 中介軟體
│   │   ├── auth.js               # 認證中介軟體
│   │   ├── cors.js               # CORS 中介軟體
│   │   ├── errorHandler.js       # 錯誤處理
│   │   ├── rateLimiter.js        # 速率限制
│   │   ├── logger.js             # 日誌中介軟體
│   │   └── validator.js           # 請求驗證
│   ├── routes/                   # 路由層
│   │   ├── auth.js               # 認證路由
│   │   ├── shop.js               # 商店路由
│   │   ├── products.js           # 商品路由
│   │   ├── orders.js             # 訂單路由
│   │   └── events.js             # 事件路由
│   ├── utils/                    # 工具函數
│   │   ├── logger.js             # 日誌工具
│   │   ├── validator.js          # 驗證工具
│   │   ├── crypto.js             # 加密工具
│   │   └── constants.js          # 常數定義
│   ├── config/                   # 配置
│   │   ├── database.js           # 資料庫配置
│   │   ├── auth.js               # 認證配置
│   │   └── app.js                # 應用配置
│   └── app.js                    # 應用入口
├── tests/                        # 測試
│   ├── unit/                     # 單元測試
│   ├── integration/              # 整合測試
│   └── fixtures/                 # 測試資料
├── docs/                         # API 文件
│   ├── api.md                    # API 說明
│   └── examples/                 # 使用範例
├── package.json                  # 依賴管理
├── render.yaml                   # Render 配置
├── .env.example                  # 環境變數範例
└── README.md                     # 專案說明
```

---

## 🔧 核心模組設計

### 1. 應用入口 (app.js)

```javascript
/**
 * 應用入口點
 */
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const compression = require('compression')

// 載入配置
const config = require('./config/app')
const databaseConfig = require('./config/database')

// 載入中介軟體
const errorHandler = require('./middleware/errorHandler')
const logger = require('./middleware/logger')
const corsMiddleware = require('./middleware/cors')
const rateLimiter = require('./middleware/rateLimiter')

// 載入路由
const authRoutes = require('./routes/auth')
const shopRoutes = require('./routes/shop')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const eventRoutes = require('./routes/events')

// 載入服務
const { setupEventBus } = require('./services/eventBusService')
const { initDatabase } = require('./services/databaseService')

class Application {
  constructor() {
    this.app = express()
    this.port = config.port
    this.init()
  }

  /**
   * 初始化應用
   */
  async init() {
    try {
      // 初始化資料庫
      await this.initDatabase()
      
      // 設定中介軟體
      this.setupMiddleware()
      
      // 設定路由
      this.setupRoutes()
      
      // 設定錯誤處理
      this.setupErrorHandling()
      
      // 初始化事件總線
      await this.initEventBus()
      
      console.log('✅ 應用初始化完成')
    } catch (error) {
      console.error('❌ 應用初始化失敗:', error)
      process.exit(1)
    }
  }

  /**
   * 初始化資料庫
   */
  async initDatabase() {
    try {
      await initDatabase()
      console.log('✅ 資料庫連接成功')
    } catch (error) {
      console.error('❌ 資料庫連接失敗:', error)
      throw error
    }
  }

  /**
   * 設定中介軟體
   */
  setupMiddleware() {
    // 安全中介軟體
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))

    // 壓縮中介軟體
    this.app.use(compression())

    // CORS 中介軟體
    this.app.use(corsMiddleware)

    // 速率限制
    this.app.use(rateLimiter)

    // 日誌中介軟體
    this.app.use(logger)

    // 解析中介軟體
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf
      }
    }))
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }))
  }

  /**
   * 設定路由
   */
  setupRoutes() {
    // API 路由
    this.app.use('/api/auth', authRoutes)
    this.app.use('/api/shop', shopRoutes)
    this.app.use('/api/products', productRoutes)
    this.app.use('/api/orders', orderRoutes)
    this.app.use('/api/events', eventRoutes)

    // 健康檢查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      })
    })

    // API 資訊
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Shopline Backend API',
        version: '2.0.0',
        description: 'Shopline 後端 API 服務',
        endpoints: {
          auth: '/api/auth',
          shop: '/api/shop',
          products: '/api/products',
          orders: '/api/orders',
          events: '/api/events'
        },
        documentation: '/docs'
      })
    })

    // 404 處理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * 設定錯誤處理
   */
  setupErrorHandling() {
    this.app.use(errorHandler)
  }

  /**
   * 初始化事件總線
   */
  async initEventBus() {
    try {
      await setupEventBus()
      console.log('✅ 事件總線初始化成功')
    } catch (error) {
      console.error('❌ 事件總線初始化失敗:', error)
      throw error
    }
  }

  /**
   * 啟動伺服器
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 後端服務已啟動`)
      console.log(`📍 端口: ${this.port}`)
      console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📊 健康檢查: http://localhost:${this.port}/health`)
      console.log(`📚 API 文件: http://localhost:${this.port}/api`)
    })
  }

  /**
   * 優雅關閉
   */
  async shutdown() {
    console.log('🛑 正在關閉伺服器...')
    
    try {
      // 關閉資料庫連接
      await require('./services/databaseService').close()
      
      // 關閉事件總線
      await require('./services/eventBusService').shutdown()
      
      console.log('✅ 伺服器已優雅關閉')
      process.exit(0)
    } catch (error) {
      console.error('❌ 關閉伺服器時發生錯誤:', error)
      process.exit(1)
    }
  }
}

// 建立應用實例
const app = new Application()

// 啟動伺服器
app.start()

// 優雅關閉處理
process.on('SIGTERM', () => app.shutdown())
process.on('SIGINT', () => app.shutdown())

module.exports = app
```

### 2. 認證控制器 (controllers/authController.js)

```javascript
/**
 * 認證控制器
 */
const authService = require('../services/authService')
const { validateRequest } = require('../middleware/validator')
const { asyncHandler } = require('../utils/asyncHandler')
const logger = require('../utils/logger')

class AuthController {
  /**
   * OAuth 授權
   */
  static authorize = asyncHandler(async (req, res) => {
    const { code, state } = req.body

    logger.info('OAuth 授權請求', { code: code?.substring(0, 10) + '...', state })

    try {
      const result = await authService.authorize(code, state)
      
      logger.info('OAuth 授權成功', { 
        shopHandle: result.shop_handle,
        expiresAt: result.expires_at 
      })

      res.json({
        success: true,
        data: result,
        message: 'OAuth 授權成功'
      })
    } catch (error) {
      logger.error('OAuth 授權失敗', { error: error.message, code, state })
      throw error
    }
  })

  /**
   * 刷新 Token
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    logger.info('Token 刷新請求')

    try {
      const result = await authService.refreshToken(refreshToken)
      
      logger.info('Token 刷新成功', { 
        shopHandle: result.shop_handle,
        expiresAt: result.expires_at 
      })

      res.json({
        success: true,
        data: result,
        message: 'Token 刷新成功'
      })
    } catch (error) {
      logger.error('Token 刷新失敗', { error: error.message })
      throw error
    }
  })

  /**
   * 撤銷 Token
   */
  static revokeToken = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')

    logger.info('Token 撤銷請求', { token: accessToken?.substring(0, 10) + '...' })

    try {
      await authService.revokeToken(accessToken)
      
      logger.info('Token 撤銷成功')

      res.json({
        success: true,
        message: 'Token 撤銷成功'
      })
    } catch (error) {
      logger.error('Token 撤銷失敗', { error: error.message })
      throw error
    }
  })

  /**
   * 驗證 Token
   */
  static validateToken = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')

    try {
      const isValid = await authService.validateToken(accessToken)
      
      res.json({
        success: true,
        data: { valid: isValid },
        message: isValid ? 'Token 有效' : 'Token 無效'
      })
    } catch (error) {
      logger.error('Token 驗證失敗', { error: error.message })
      throw error
    }
  })

  /**
   * 獲取認證狀態
   */
  static getAuthStatus = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')

    try {
      const status = await authService.getAuthStatus(accessToken)
      
      res.json({
        success: true,
        data: status,
        message: '認證狀態獲取成功'
      })
    } catch (error) {
      logger.error('獲取認證狀態失敗', { error: error.message })
      throw error
    }
  })
}

module.exports = AuthController
```

### 3. 商品控制器 (controllers/productController.js)

```javascript
/**
 * 商品控制器
 */
const productService = require('../services/shoplineService')
const { validateRequest } = require('../middleware/validator')
const { asyncHandler } = require('../utils/asyncHandler')
const logger = require('../utils/logger')

class ProductController {
  /**
   * 獲取商品列表
   */
  static getProducts = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')
    const { page = 1, limit = 10, status, search } = req.query

    logger.info('獲取商品列表請求', { page, limit, status, search })

    try {
      const result = await productService.getProducts(accessToken, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search
      })

      logger.info('商品列表獲取成功', { 
        count: result.products?.length || 0,
        total: result.total || 0 
      })

      res.json({
        success: true,
        data: result,
        message: '商品列表獲取成功'
      })
    } catch (error) {
      logger.error('獲取商品列表失敗', { error: error.message })
      throw error
    }
  })

  /**
   * 獲取商品詳情
   */
  static getProduct = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')
    const { id } = req.params

    logger.info('獲取商品詳情請求', { productId: id })

    try {
      const result = await productService.getProduct(accessToken, id)

      logger.info('商品詳情獲取成功', { productId: id })

      res.json({
        success: true,
        data: result,
        message: '商品詳情獲取成功'
      })
    } catch (error) {
      logger.error('獲取商品詳情失敗', { error: error.message, productId: id })
      throw error
    }
  })

  /**
   * 建立商品
   */
  static createProduct = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')
    const productData = req.body

    logger.info('建立商品請求', { 
      title: productData.product?.title,
      handle: productData.product?.handle 
    })

    try {
      const result = await productService.createProduct(accessToken, productData)

      logger.info('商品建立成功', { 
        productId: result.product?.id,
        title: result.product?.title 
      })

      res.status(201).json({
        success: true,
        data: result,
        message: '商品建立成功'
      })
    } catch (error) {
      logger.error('建立商品失敗', { error: error.message })
      throw error
    }
  })

  /**
   * 更新商品
   */
  static updateProduct = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')
    const { id } = req.params
    const productData = req.body

    logger.info('更新商品請求', { productId: id })

    try {
      const result = await productService.updateProduct(accessToken, id, productData)

      logger.info('商品更新成功', { productId: id })

      res.json({
        success: true,
        data: result,
        message: '商品更新成功'
      })
    } catch (error) {
      logger.error('更新商品失敗', { error: error.message, productId: id })
      throw error
    }
  })

  /**
   * 刪除商品
   */
  static deleteProduct = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '')
    const { id } = req.params

    logger.info('刪除商品請求', { productId: id })

    try {
      await productService.deleteProduct(accessToken, id)

      logger.info('商品刪除成功', { productId: id })

      res.json({
        success: true,
        message: '商品刪除成功'
      })
    } catch (error) {
      logger.error('刪除商品失敗', { error: error.message, productId: id })
      throw error
    }
  })
}

module.exports = ProductController
```

### 4. 認證服務 (services/authService.js)

```javascript
/**
 * 認證服務
 */
const shoplineService = require('./shoplineService')
const databaseService = require('./databaseService')
const { generateState, verifyState } = require('../utils/crypto')
const logger = require('../utils/logger')

class AuthService {
  /**
   * OAuth 授權
   */
  async authorize(code, state) {
    try {
      // 驗證 state 參數
      if (!verifyState(state)) {
        throw new Error('Invalid state parameter')
      }

      // 呼叫 Shopline API 獲取 token
      const tokenData = await shoplineService.authorize(code)
      
      if (!tokenData.success) {
        throw new Error(tokenData.error || 'OAuth 授權失敗')
      }

      // 儲存 token 到資料庫
      const shopHandle = tokenData.data.shop_handle || 'default'
      await databaseService.saveToken(shopHandle, tokenData.data)

      // 發佈認證事件
      await this.publishAuthEvent('authorized', {
        shopHandle,
        expiresAt: tokenData.data.expires_at
      })

      return tokenData.data
    } catch (error) {
      logger.error('OAuth 授權失敗', { error: error.message, code, state })
      throw error
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken) {
    try {
      // 呼叫 Shopline API 刷新 token
      const tokenData = await shoplineService.refreshToken(refreshToken)
      
      if (!tokenData.success) {
        throw new Error(tokenData.error || 'Token 刷新失敗')
      }

      // 更新資料庫中的 token
      const shopHandle = tokenData.data.shop_handle || 'default'
      await databaseService.saveToken(shopHandle, tokenData.data)

      // 發佈認證事件
      await this.publishAuthEvent('refreshed', {
        shopHandle,
        expiresAt: tokenData.data.expires_at
      })

      return tokenData.data
    } catch (error) {
      logger.error('Token 刷新失敗', { error: error.message })
      throw error
    }
  }

  /**
   * 撤銷 Token
   */
  async revokeToken(accessToken) {
    try {
      // 呼叫 Shopline API 撤銷 token
      const result = await shoplineService.revokeToken(accessToken)
      
      if (!result.success) {
        throw new Error(result.error || 'Token 撤銷失敗')
      }

      // 從資料庫刪除 token
      const shopHandle = await this.getShopHandleFromToken(accessToken)
      if (shopHandle) {
        await databaseService.deleteToken(shopHandle)
      }

      // 發佈認證事件
      await this.publishAuthEvent('revoked', { shopHandle })

      return result
    } catch (error) {
      logger.error('Token 撤銷失敗', { error: error.message })
      throw error
    }
  }

  /**
   * 驗證 Token
   */
  async validateToken(accessToken) {
    try {
      if (!accessToken) {
        return false
      }

      // 檢查 token 是否在資料庫中
      const tokenData = await databaseService.getTokenByAccessToken(accessToken)
      if (!tokenData) {
        return false
      }

      // 檢查 token 是否過期
      const now = new Date()
      const expiresAt = new Date(tokenData.expires_at)
      
      if (now >= expiresAt) {
        // Token 已過期，嘗試刷新
        try {
          await this.refreshToken(tokenData.refresh_token)
          return true
        } catch (error) {
          logger.warn('Token 過期且刷新失敗', { error: error.message })
          return false
        }
      }

      return true
    } catch (error) {
      logger.error('Token 驗證失敗', { error: error.message })
      return false
    }
  }

  /**
   * 獲取認證狀態
   */
  async getAuthStatus(accessToken) {
    try {
      const isValid = await this.validateToken(accessToken)
      
      if (!isValid) {
        return {
          authenticated: false,
          message: '未認證或 Token 無效'
        }
      }

      const tokenData = await databaseService.getTokenByAccessToken(accessToken)
      
      return {
        authenticated: true,
        shopHandle: tokenData.shop_handle,
        expiresAt: tokenData.expires_at,
        message: '已認證'
      }
    } catch (error) {
      logger.error('獲取認證狀態失敗', { error: error.message })
      return {
        authenticated: false,
        message: '認證狀態檢查失敗'
      }
    }
  }

  /**
   * 從 Token 獲取商店 Handle
   */
  async getShopHandleFromToken(accessToken) {
    try {
      const tokenData = await databaseService.getTokenByAccessToken(accessToken)
      return tokenData?.shop_handle
    } catch (error) {
      logger.error('從 Token 獲取商店 Handle 失敗', { error: error.message })
      return null
    }
  }

  /**
   * 發佈認證事件
   */
  async publishAuthEvent(type, data) {
    try {
      const eventBusService = require('./eventBusService')
      await eventBusService.publish('auth', type, data)
    } catch (error) {
      logger.error('發佈認證事件失敗', { error: error.message, type, data })
    }
  }
}

module.exports = new AuthService()
```

---

## 🛡️ 中介軟體設計

### 1. 認證中介軟體 (middleware/auth.js)

```javascript
/**
 * 認證中介軟體
 */
const authService = require('../services/authService')
const logger = require('../utils/logger')

/**
 * 驗證 JWT Token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: '請提供有效的訪問令牌'
      })
    }

    const isValid = await authService.validateToken(token)
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: '令牌無效或已過期'
      })
    }

    // 將 token 資訊添加到請求對象
    req.token = token
    req.authenticated = true

    next()
  } catch (error) {
    logger.error('認證中介軟體錯誤', { error: error.message })
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: '認證過程中發生錯誤'
    })
  }
}

/**
 * 可選認證 (不強制要求 token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const isValid = await authService.validateToken(token)
      if (isValid) {
        req.token = token
        req.authenticated = true
      }
    }

    next()
  } catch (error) {
    logger.error('可選認證中介軟體錯誤', { error: error.message })
    next() // 繼續執行，不中斷請求
  }
}

module.exports = {
  authenticateToken,
  optionalAuth
}
```

### 2. CORS 中介軟體 (middleware/cors.js)

```javascript
/**
 * CORS 中介軟體
 */
const cors = require('cors')

const corsOptions = {
  origin: (origin, callback) => {
    // 允許的來源列表
    const allowedOrigins = [
      'http://localhost:3000',           // 本地開發
      'https://your-frontend.vercel.app', // 生產環境
      process.env.FRONTEND_URL           // 環境變數
    ].filter(Boolean)

    // 允許沒有 origin 的請求 (如 Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 小時
}

module.exports = cors(corsOptions)
```

### 3. 錯誤處理中介軟體 (middleware/errorHandler.js)

```javascript
/**
 * 錯誤處理中介軟體
 */
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // 記錄錯誤
  logger.error('API 錯誤', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Mongoose 重複鍵錯誤
  if (err.code === 11000) {
    const message = '重複的資源'
    error = { message, statusCode: 400 }
  }

  // Mongoose 驗證錯誤
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = { message, statusCode: 400 }
  }

  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    const message = '無效的令牌'
    error = { message, statusCode: 401 }
  }

  // JWT 過期錯誤
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已過期'
    error = { message, statusCode: 401 }
  }

  // CORS 錯誤
  if (err.message === 'Not allowed by CORS') {
    const message = '不允許的跨域請求'
    error = { message, statusCode: 403 }
  }

  // 預設錯誤
  const statusCode = error.statusCode || 500
  const message = error.message || '伺服器內部錯誤'

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  })
}

module.exports = errorHandler
```

---

## 🚀 Render 部署配置

### render.yaml

```yaml
services:
  - type: web
    name: shopline-backend
    env: node
    plan: free
    region: singapore
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: FRONTEND_URL
        value: https://your-frontend.vercel.app
      - key: APP_KEY
        value: 4c951e966557c8374d9a61753dfe3c52441aba3b
      - key: APP_SECRET
        value: dd46269d6920f49b07e810862d3093062b0fb858
      - key: SHOP_HANDLE
        value: paykepoc
      - key: SHOP_URL
        value: https://paykepoc.myshopline.com/
      - key: POSTGRES_URL
        fromDatabase:
          name: shopline-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: LOG_LEVEL
        value: info

databases:
  - name: shopline-db
    plan: free
    region: singapore
```

### package.json

```json
{
  "name": "shopline-backend",
  "version": "2.0.0",
  "description": "Shopline 後端 API 服務 - 前後端分離版本",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "uuid": "^9.0.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "shopline",
    "backend",
    "api",
    "ecommerce"
  ],
  "author": "Development Team",
  "license": "MIT"
}
```

---

## 📊 監控和日誌

### 日誌配置 (utils/logger.js)

```javascript
/**
 * 日誌配置
 */
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'shopline-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
})

// 如果不是生產環境，也輸出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

module.exports = logger
```

---

## 🧪 測試策略

### 單元測試範例

```javascript
// tests/unit/controllers/authController.test.js
const request = require('supertest')
const app = require('../../src/app')
const authService = require('../../src/services/authService')

describe('AuthController', () => {
  describe('POST /api/auth/authorize', () => {
    it('should authorize with valid code', async () => {
      const mockResult = {
        success: true,
        data: {
          access_token: 'mock_token',
          refresh_token: 'mock_refresh',
          expires_at: new Date().toISOString()
        }
      }

      jest.spyOn(authService, 'authorize').mockResolvedValue(mockResult.data)

      const response = await request(app)
        .post('/api/auth/authorize')
        .send({
          code: 'valid_code',
          state: 'valid_state'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.access_token).toBe('mock_token')
    })

    it('should return error with invalid code', async () => {
      jest.spyOn(authService, 'authorize').mockRejectedValue(new Error('Invalid code'))

      const response = await request(app)
        .post('/api/auth/authorize')
        .send({
          code: 'invalid_code',
          state: 'valid_state'
        })

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })
  })
})
```

---

## 📚 API 文件

### API 端點清單

| 方法 | 端點 | 描述 | 認證 |
|------|------|------|------|
| POST | `/api/auth/authorize` | OAuth 授權 | 否 |
| POST | `/api/auth/refresh` | 刷新 Token | 否 |
| POST | `/api/auth/revoke` | 撤銷 Token | 是 |
| GET | `/api/auth/status` | 認證狀態 | 是 |
| GET | `/api/shop/info` | 商店資訊 | 是 |
| GET | `/api/products` | 商品列表 | 是 |
| GET | `/api/products/:id` | 商品詳情 | 是 |
| POST | `/api/products` | 建立商品 | 是 |
| PUT | `/api/products/:id` | 更新商品 | 是 |
| DELETE | `/api/products/:id` | 刪除商品 | 是 |
| GET | `/api/orders` | 訂單列表 | 是 |
| GET | `/api/orders/:id` | 訂單詳情 | 是 |
| POST | `/api/orders` | 建立訂單 | 是 |
| PUT | `/api/orders/:id` | 更新訂單 | 是 |
| GET | `/api/events` | 事件列表 | 否 |
| GET | `/api/events/stream` | 事件流 | 否 |
| GET | `/health` | 健康檢查 | 否 |

---

**版本**: 2.0.0  
**建立日期**: 2025-01-27  
**狀態**: 設計完成  
**下一步**: 規劃資料庫遷移策略
