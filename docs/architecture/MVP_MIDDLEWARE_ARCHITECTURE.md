# MVP 中台架構設計

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**目標**: 建立中台架構，實現前後端分離，完成 Shopline 完整授權流程  
**狀態**: 設計完成

---

## 🎯 架構目標

### 核心原則
- **中台化**: 統一的多平台整合中台
- **事件驅動**: 基於事件的鬆耦合架構
- **可擴展**: 易於新增 Connector 和功能
- **可觀測**: 完整的監控和日誌系統
- **高可用**: 穩定的服務和快速恢復

### 技術選型
- **Backend**: Fastify + TypeScript + BullMQ + Redis Cloud
- **Frontend**: Next.js + SWR + Vercel
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis Cloud
- **Auth**: 自建 JWT + Shopline OAuth
- **Realtime**: SSE (Server Sent Events)

---

## 🏗️ 整體架構

### 架構圖

```
┌────────────────────────────────────────────┐
│                  Frontend (Vercel)        │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │ Admin Home   │  │ Shopline Connector│   │
│  │ - Event List │  │ - 授權/撤銷/Refresh │   │
│  │ - Connector  │  │ - Webhook 管理    │   │
│  │   狀態總覽   │  │ - API 測試區塊    │   │
│  └──────────────┘  └──────────────────┘   │
└────────────────────────────────────────────┘
                │          ↑
                │          │ OAuth Redirect
                ▼          │
┌────────────────────────────────────────────┐
│              Backend (Render)              │
│────────────────────────────────────────────│
│   Fastify App (API Gateway)                │
│   ├─ /auth/shopline (OAuth callback)       │
│   ├─ /webhook/shopline (事件入口)          │
│   ├─ /events (提供前端查事件)              │
│   ├─ /connectors/shopline (API Proxy)      │
│────────────────────────────────────────────│
│   BullMQ Workers (Redis)                   │
│   ├─ eventProcessor                        │
│   ├─ apiTestPublisher                      │
│────────────────────────────────────────────│
│   Services Layer                           │
│   ├─ shopline.service.ts                   │
│   ├─ event.service.ts                      │
│   ├─ token.service.ts                      │
│────────────────────────────────────────────│
│   Database (PostgreSQL)                    │
│   ├─ tokens                                │
│   ├─ events                                │
│   ├─ webhooks                              │
│   ├─ connectors                            │
│────────────────────────────────────────────│
│   Queue (Redis Cloud)                      │
│   ├─ eventQueue                            │
│   ├─ apiTestQueue                          │
└────────────────────────────────────────────┘
```

### 資料流

1. **OAuth 流程**: Frontend → Backend → Shopline → Backend → Frontend
2. **API 呼叫**: Frontend → Backend → Shopline → Backend → Frontend
3. **Webhook 接收**: Shopline → Backend → Queue → Worker → Database → SSE → Frontend
4. **Event 查詢**: Frontend → Backend → Database → Frontend

---

## 🔧 後端架構設計

### 目錄結構

```
backend/
├── src/
│   ├── app.ts                    # Fastify 應用入口
│   ├── config/                   # 配置
│   │   ├── database.ts           # 資料庫配置
│   │   ├── redis.ts              # Redis 配置
│   │   └── app.ts                # 應用配置
│   ├── controllers/              # 控制器
│   │   ├── auth.controller.ts    # 認證控制器
│   │   ├── event.controller.ts   # 事件控制器
│   │   └── shopline.controller.ts # Shopline 控制器
│   ├── services/                 # 服務層
│   │   ├── shopline.service.ts   # Shopline 服務
│   │   ├── event.service.ts      # 事件服務
│   │   ├── token.service.ts      # Token 服務
│   │   └── queue.service.ts      # Queue 服務
│   ├── workers/                  # 背景工作
│   │   ├── event.processor.ts    # 事件處理器
│   │   └── api.test.publisher.ts # API 測試發布器
│   ├── middleware/               # 中介軟體
│   │   ├── auth.ts               # 認證中介軟體
│   │   ├── cors.ts               # CORS 中介軟體
│   │   ├── rate-limit.ts         # 速率限制
│   │   └── error-handler.ts      # 錯誤處理
│   ├── routes/                   # 路由
│   │   ├── auth.ts               # 認證路由
│   │   ├── events.ts             # 事件路由
│   │   └── shopline.ts           # Shopline 路由
│   ├── models/                   # 資料模型
│   │   ├── token.model.ts        # Token 模型
│   │   ├── event.model.ts        # Event 模型
│   │   └── webhook.model.ts      # Webhook 模型
│   ├── utils/                    # 工具函數
│   │   ├── logger.ts             # 日誌工具
│   │   ├── validator.ts          # 驗證工具
│   │   └── crypto.ts             # 加密工具
│   └── types/                    # 類型定義
│       ├── auth.types.ts         # 認證類型
│       ├── event.types.ts        # 事件類型
│       └── shopline.types.ts     # Shopline 類型
├── prisma/                       # Prisma 配置
│   ├── schema.prisma             # 資料庫 Schema
│   └── migrations/               # 資料庫遷移
├── tests/                        # 測試
│   ├── unit/                     # 單元測試
│   ├── integration/              # 整合測試
│   └── fixtures/                 # 測試資料
├── package.json
├── tsconfig.json
└── render.yaml                   # Render 配置
```

### 核心服務設計

#### 1. Shopline 服務 (shopline.service.ts)

```typescript
export class ShoplineService {
  private readonly baseUrl = 'https://api.shopline.com'
  private readonly graphqlUrl = 'https://api.shopline.com/graphql'

  /**
   * OAuth 授權
   */
  async authorize(code: string, state: string): Promise<AuthResult> {
    // 實作 OAuth 2.0 授權流程
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<TokenResult> {
    // 實作 Token 刷新
  }

  /**
   * 撤銷 Token
   */
  async revokeToken(accessToken: string): Promise<RevokeResult> {
    // 實作 Token 撤銷
  }

  /**
   * 商店資訊
   */
  async getShopInfo(accessToken: string): Promise<ShopInfo> {
    // 實作商店資訊查詢
  }

  /**
   * 商品管理
   */
  async getProducts(accessToken: string, params: ProductParams): Promise<ProductList> {
    // 實作商品列表查詢
  }

  async createProduct(accessToken: string, product: CreateProductInput): Promise<Product> {
    // 實作商品建立
  }

  /**
   * 訂單管理
   */
  async getOrders(accessToken: string, params: OrderParams): Promise<OrderList> {
    // 實作訂單列表查詢
  }

  async createOrder(accessToken: string, order: CreateOrderInput): Promise<Order> {
    // 實作訂單建立
  }

  /**
   * Webhook 管理
   */
  async subscribeWebhook(accessToken: string, webhook: WebhookConfig): Promise<Webhook> {
    // 實作 Webhook 訂閱
  }

  async getWebhooks(accessToken: string): Promise<Webhook[]> {
    // 實作 Webhook 列表查詢
  }
}
```

#### 2. 事件服務 (event.service.ts)

```typescript
export class EventService {
  private readonly eventQueue: Queue
  private readonly eventRepository: EventRepository

  /**
   * 發布事件
   */
  async publishEvent(event: Event): Promise<void> {
    // 儲存到資料庫
    await this.eventRepository.create(event)
    
    // 加入 Queue
    await this.eventQueue.add('process-event', event)
  }

  /**
   * 查詢事件
   */
  async getEvents(params: EventQueryParams): Promise<EventList> {
    return await this.eventRepository.findMany(params)
  }

  /**
   * 即時事件流
   */
  async createEventStream(): Promise<ReadableStream> {
    // 實作 SSE 事件流
  }

  /**
   * 處理 Webhook 事件
   */
  async handleWebhookEvent(source: string, payload: any): Promise<void> {
    const event: Event = {
      id: generateId(),
      type: this.detectEventType(payload),
      source,
      payload,
      receivedAt: new Date(),
      processed: false
    }

    await this.publishEvent(event)
  }

  private detectEventType(payload: any): string {
    // 根據 payload 檢測事件類型
  }
}
```

#### 3. Token 服務 (token.service.ts)

```typescript
export class TokenService {
  private readonly tokenRepository: TokenRepository
  private readonly shoplineService: ShoplineService

  /**
   * 儲存 Token
   */
  async saveToken(shopHandle: string, tokenData: TokenData): Promise<Token> {
    const token: Token = {
      shopHandle,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(tokenData.expires_at),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return await this.tokenRepository.upsert(token)
  }

  /**
   * 獲取 Token
   */
  async getToken(shopHandle: string): Promise<Token | null> {
    return await this.tokenRepository.findByShopHandle(shopHandle)
  }

  /**
   * 刷新 Token
   */
  async refreshToken(shopHandle: string): Promise<Token> {
    const token = await this.getToken(shopHandle)
    if (!token) {
      throw new Error('Token not found')
    }

    if (this.isTokenExpired(token)) {
      const newTokenData = await this.shoplineService.refreshToken(token.refreshToken)
      return await this.saveToken(shopHandle, newTokenData)
    }

    return token
  }

  /**
   * 檢查 Token 是否過期
   */
  private isTokenExpired(token: Token): boolean {
    return new Date() >= token.expiresAt
  }

  /**
   * 刪除 Token
   */
  async deleteToken(shopHandle: string): Promise<void> {
    await this.tokenRepository.deleteByShopHandle(shopHandle)
  }
}
```

### 資料庫設計

#### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Token {
  id           String   @id @default(cuid())
  shopHandle   String   @unique
  accessToken  String
  refreshToken String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("tokens")
}

model Event {
  id        String    @id @default(cuid())
  type      String
  source    String
  payload   Json
  processed Boolean   @default(false)
  createdAt DateTime  @default(now())

  @@map("events")
  @@index([type])
  @@index([source])
  @@index([createdAt])
}

model Webhook {
  id          String   @id @default(cuid())
  connectorId String
  url         String
  events      String[]
  secret      String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("webhooks")
}

model Connector {
  id          String   @id @default(cuid())
  name        String
  type        String
  config      Json
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("connectors")
}
```

---

## 🎨 前端架構設計

### 目錄結構

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # 根佈局
│   │   ├── page.tsx              # 首頁
│   │   ├── admin/                # Admin 頁面
│   │   │   ├── page.tsx          # Admin 首頁
│   │   │   └── layout.tsx        # Admin 佈局
│   │   └── connectors/           # Connector 頁面
│   │       └── shopline/         # Shopline Connector
│   │           ├── page.tsx      # 主要頁面
│   │           ├── auth/         # 授權頁面
│   │           │   └── callback/ # 授權回調
│   │           │       └── page.tsx
│   │           └── webhooks/     # Webhook 管理
│   │               └── page.tsx
│   ├── components/               # 組件
│   │   ├── ui/                   # 基礎 UI 組件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── modal.tsx
│   │   ├── admin/                # Admin 組件
│   │   │   ├── event-list.tsx    # 事件列表
│   │   │   ├── connector-card.tsx # Connector 卡片
│   │   │   └── stats-dashboard.tsx # 統計儀表板
│   │   └── shopline/             # Shopline 組件
│   │       ├── auth-button.tsx   # 授權按鈕
│   │       ├── token-manager.tsx # Token 管理
│   │       ├── webhook-manager.tsx # Webhook 管理
│   │       └── api-tester.tsx    # API 測試器
│   ├── lib/                      # 工具庫
│   │   ├── api.ts                # API 客戶端
│   │   ├── auth.ts               # 認證工具
│   │   ├── events.ts             # 事件工具
│   │   └── utils.ts              # 通用工具
│   ├── hooks/                    # 自定義 Hooks
│   │   ├── use-auth.ts           # 認證 Hook
│   │   ├── use-events.ts         # 事件 Hook
│   │   └── use-shopline.ts       # Shopline Hook
│   ├── types/                    # 類型定義
│   │   ├── auth.types.ts         # 認證類型
│   │   ├── event.types.ts        # 事件類型
│   │   └── shopline.types.ts     # Shopline 類型
│   └── styles/                   # 樣式
│       ├── globals.css           # 全域樣式
│       └── components.css        # 組件樣式
├── public/                       # 靜態資源
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 核心組件設計

#### 1. Admin 首頁 (app/admin/page.tsx)

```typescript
'use client'

import { useEvents } from '@/hooks/use-events'
import { useConnectors } from '@/hooks/use-connectors'
import { EventList } from '@/components/admin/event-list'
import { ConnectorCard } from '@/components/admin/connector-card'
import { StatsDashboard } from '@/components/admin/stats-dashboard'

export default function AdminPage() {
  const { events, isLoading: eventsLoading } = useEvents()
  const { connectors, isLoading: connectorsLoading } = useConnectors()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">中台管理系統</h1>
      
      {/* 統計儀表板 */}
      <StatsDashboard 
        eventCount={events.length}
        connectorCount={connectors.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* 事件監測 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">事件監測</h2>
          <EventList 
            events={events}
            isLoading={eventsLoading}
          />
        </div>

        {/* Connector 管理 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Connector 管理</h2>
          <div className="space-y-4">
            {connectors.map(connector => (
              <ConnectorCard 
                key={connector.id}
                connector={connector}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2. Shopline Connector 頁面 (app/connectors/shopline/page.tsx)

```typescript
'use client'

import { useShopline } from '@/hooks/use-shopline'
import { AuthButton } from '@/components/shopline/auth-button'
import { TokenManager } from '@/components/shopline/token-manager'
import { WebhookManager } from '@/components/shopline/webhook-manager'
import { ApiTester } from '@/components/shopline/api-tester'

export default function ShoplineConnectorPage() {
  const { 
    isAuthenticated, 
    token, 
    isLoading,
    refreshToken,
    revokeToken 
  } = useShopline()

  if (isLoading) {
    return <div>載入中...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopline Connector</h1>
        <div className="text-center">
          <p className="text-lg mb-6">請先進行授權以使用 Shopline 功能</p>
          <AuthButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopline Connector</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token 管理 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Token 管理</h2>
          <TokenManager 
            token={token}
            onRefresh={refreshToken}
            onRevoke={revokeToken}
          />
        </div>

        {/* Webhook 管理 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Webhook 管理</h2>
          <WebhookManager />
        </div>

        {/* API 測試 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">API 測試</h2>
          <ApiTester />
        </div>
      </div>
    </div>
  )
}
```

#### 3. API 客戶端 (lib/api.ts)

```typescript
import { useSWR } from 'swr'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = localStorage.getItem('access_token')

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // 認證相關
  async authorize(code: string, state: string) {
    return this.request('/auth/shopline/authorize', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/shopline/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // 事件相關
  async getEvents(params?: EventQueryParams) {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/events?${query}`)
  }

  async subscribeToEvents(callback: (event: Event) => void) {
    const eventSource = new EventSource(`${this.baseUrl}/events/stream`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }

    return eventSource
  }

  // Shopline 相關
  async getShopInfo() {
    return this.request('/connectors/shopline/shop')
  }

  async getProducts(params?: ProductParams) {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/connectors/shopline/products?${query}`)
  }

  async createProduct(product: CreateProductInput) {
    return this.request('/connectors/shopline/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async getOrders(params?: OrderParams) {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/connectors/shopline/orders?${query}`)
  }

  async createOrder(order: CreateOrderInput) {
    return this.request('/connectors/shopline/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  // Webhook 相關
  async getWebhooks() {
    return this.request('/connectors/shopline/webhooks')
  }

  async subscribeWebhook(webhook: WebhookConfig) {
    return this.request('/connectors/shopline/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
```

---

## 🔄 Event 流轉機制

### 事件處理流程

1. **Webhook 接收**: Shopline → `/webhook/shopline`
2. **事件儲存**: 寫入 PostgreSQL `events` 表
3. **Queue 發布**: 加入 BullMQ `eventQueue`
4. **Worker 處理**: `eventProcessor` 處理事件
5. **即時推播**: 透過 SSE 推播到前端

### 事件類型定義

```typescript
interface Event {
  id: string
  type: EventType
  source: string
  payload: any
  processed: boolean
  createdAt: Date
}

type EventType = 
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'order.created'
  | 'order.updated'
  | 'order.cancelled'
  | 'webhook.received'
  | 'api.test'
```

### 測試環境事件處理

```typescript
// 測試 API 會發布事件 (僅開發環境)
if (process.env.NODE_ENV === 'development') {
  await eventService.publishEvent({
    id: generateId(),
    type: 'api.test',
    source: 'shopline',
    payload: { action: 'createProduct', data: product },
    processed: false,
    createdAt: new Date()
  })
}
```

---

## 🚀 部署架構

### 環境配置

#### 開發環境
- **Frontend**: `http://localhost:3000` (Next.js)
- **Backend**: `http://localhost:3001` (Fastify)
- **Database**: 本地 PostgreSQL
- **Redis**: 本地 Redis

#### 生產環境
- **Frontend**: Vercel (自動部署)
- **Backend**: Render (自動部署)
- **Database**: Render PostgreSQL
- **Redis**: Redis Cloud

### 環境變數

#### 後端環境變數
```bash
# 應用配置
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app

# 資料庫
DATABASE_URL=postgres://...

# Redis
REDIS_URL=redis://...

# Shopline
SHOPLINE_APP_KEY=your_app_key
SHOPLINE_APP_SECRET=your_app_secret

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

#### 前端環境變數
```bash
# API 配置
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com

# 其他配置
NEXT_PUBLIC_APP_NAME=中台管理系統
```

---

## 📊 監控和日誌

### 日誌系統

```typescript
// utils/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
})

export default logger
```

### 監控指標

- **API 響應時間**: < 500ms
- **事件處理延遲**: < 1s
- **系統可用性**: > 99.9%
- **錯誤率**: < 0.1%

---

## 🧪 測試策略

### 單元測試
- 服務層測試
- 控制器測試
- 工具函數測試

### 整合測試
- API 端點測試
- 資料庫操作測試
- Queue 處理測試

### 端到端測試
- 完整用戶流程測試
- 跨瀏覽器測試
- 效能測試

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 設計完成  
**下一步**: 開始實施 Phase 1
