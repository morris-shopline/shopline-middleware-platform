# Shopline OAuth 2.0 流程文件

**最後更新**: 2025-10-29  
**適用架構**: 前後端分離架構 (Fastify + Next.js)

---

## 🎯 概述

本文檔詳細說明在當前前後端分離架構下，Custom App 與 Shopline 的 OAuth 2.0 授權流程，包含完整的 Mermaid 流程圖和實作細節。

---

## 🏗️ 架構概覽

### 當前架構
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 UI      │    │   後端 API     │    │  PostgreSQL DB  │
│  (Next.js)     │◄──►│  (Fastify)     │◄──►│   (Render)      │
│  (Vercel)      │    │  (Render)      │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin 首頁    │    │  OAuth 端點     │    │   Token 儲存    │
│   Connector 頁  │    │  Webhook 端點   │    │   Event 記錄    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔐 OAuth 2.0 完整流程

> **📊 詳細流程圖**: 請參考 [OAuth 流程 Mermaid 圖表](./OAUTH_FLOW_DIAGRAMS.md) 查看完整的視覺化流程圖

### 1. 授權啟動流程

**簡化流程**:
1. 用戶點擊「開始授權」
2. 前端調用後端授權端點
3. 後端生成授權 URL 並重定向
4. 用戶在 Shopline 完成授權
5. Shopline 回調到後端
6. 後端驗證並獲取 Token
7. 儲存 Token 並重定向到成功頁面

### 2. Token 管理流程

**簡化流程**:
1. 前端請求 Token 狀態
2. 後端查詢資料庫
3. 檢查 Token 是否過期
4. 如過期則自動刷新
5. 返回 Token 資訊給前端

### 3. API 測試流程

**簡化流程**:
1. 用戶點擊測試按鈕
2. 後端獲取有效 Token
3. 調用 Shopline API
4. 發布測試事件到 Queue
5. 返回結果給前端顯示

---

## 🔧 實作細節

### 1. 後端端點設計

#### 授權端點
```typescript
// GET /api/auth/shopline/install
// 啟動 OAuth 授權流程

// GET /api/auth/shopline/callback
// 處理 OAuth 回調

// POST /api/auth/shopline/refresh
// 刷新 Access Token

// POST /api/auth/shopline/revoke
// 撤銷 Token
```

#### 連接器端點
```typescript
// GET /api/connectors/shopline/status
// 獲取連接器狀態

// GET /api/connectors/shopline/token
// 獲取 Token 資訊

// POST /api/connectors/shopline/test
// 測試 API 調用

// GET /api/connectors/shopline/webhooks
// 獲取 Webhook 列表

// POST /api/connectors/shopline/webhooks
// 訂閱 Webhook
```

### 2. 前端頁面設計

#### Admin 首頁
- Event 監測面板
- Connector 狀態總覽
- 快速操作按鈕

#### Shopline Connector 頁面
- OAuth 授權按鈕
- Token 狀態顯示
- Webhook 管理
- API 測試區塊

### 3. 資料庫 Schema

```sql
-- Token 儲存
CREATE TABLE shopline_tokens (
  id SERIAL PRIMARY KEY,
  shop_handle VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event 記錄
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  data TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 安全考量

### 1. 簽名驗證
```typescript
// SHOPLINE 標準簽名驗證
function verifySignature(params: any, signature: string, secret: string): boolean {
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'sign')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex')
  
  return signature === expectedSignature
}
```

### 2. 時間戳驗證
```typescript
// 防止重放攻擊
function verifyTimestamp(timestamp: string, toleranceMinutes = 10): boolean {
  const currentTime = Date.now()
  const requestTime = parseInt(timestamp)
  const timeDiff = Math.abs(currentTime - requestTime)
  const toleranceMs = toleranceMinutes * 60 * 1000
  
  return timeDiff <= toleranceMs
}
```

### 3. State 參數驗證
```typescript
// 防止 CSRF 攻擊
function generateState(): string {
  return crypto.randomBytes(32).toString('hex')
}

function verifyState(receivedState: string, storedState: string): boolean {
  return receivedState === storedState
}
```

---

## 📊 環境變數配置

### 後端環境變數 (Render)
```bash
# 資料庫
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Shopline OAuth
SHOPLINE_CLIENT_ID=4c951e966557c8374d9a61753dfe3c52441aba3b
SHOPLINE_CLIENT_SECRET=dd46269d6920f49b07e810862d3093062b0fb858
SHOPLINE_REDIRECT_URI=https://shopline-middleware-platform.onrender.com/api/auth/shopline/callback

# 應用配置
NODE_ENV=production
PORT=3000
```

### 前端環境變數 (Vercel)
```bash
# API 連接
NEXT_PUBLIC_API_URL=https://shopline-middleware-platform.onrender.com

# 應用配置
NODE_ENV=production
```

---

## 🧪 測試流程

### 1. 本地測試
```bash
# 啟動後端
cd backend
npm run dev

# 啟動前端
cd frontend
npm run dev

# 測試 OAuth 流程
curl http://localhost:3001/api/auth/shopline/install
```

### 2. 生產環境測試
```bash
# 測試授權流程
curl https://shopline-middleware-platform.onrender.com/api/auth/shopline/install

# 測試 API 狀態
curl https://shopline-middleware-platform.onrender.com/api/connectors/shopline/status
```

---

## 🚨 錯誤處理

### 1. 常見錯誤
- **簽名驗證失敗**: 檢查 app_secret 和參數順序
- **時間戳過期**: 檢查系統時間同步
- **Token 過期**: 自動刷新或要求重新授權
- **網路錯誤**: 重試機制和錯誤回報

### 2. 錯誤回報
```typescript
// 統一錯誤格式
interface APIError {
  error: string
  message: string
  code: number
  timestamp: string
}
```

---

## 📈 監控與日誌

### 1. 事件記錄
- OAuth 授權成功/失敗
- Token 刷新成功/失敗
- API 調用成功/失敗
- Webhook 接收成功/失敗

### 2. 效能監控
- API 回應時間
- Token 刷新頻率
- 錯誤率統計

---

## 🔄 未來擴展

### 1. 多平台支援
- Shopify OAuth
- Next Engine OAuth
- 其他平台整合

### 2. 進階功能
- 自動 Token 刷新
- Webhook 事件處理
- 資料同步機制

---

**最後更新**: 2025-10-29  
**維護者**: AI Assistant  
**版本**: 1.0.0
