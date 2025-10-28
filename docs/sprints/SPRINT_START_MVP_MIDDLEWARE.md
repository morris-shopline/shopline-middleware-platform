# Sprint 開始：MVP 中台架構實施

**開始日期**: 2025-01-27  
**預計完成**: 2025-02-17 (3 週)  
**狀態**: 🚀 準備開始  
**目標**: 建立中台架構，實現前後端分離，完成 Shopline 完整授權流程

---

## 🎯 Sprint 目標

### 主要目標
1. **建立中台架構** - Fastify + BullMQ + Redis + PostgreSQL
2. **實現前後端分離** - Vercel (前端) + Render (後端)
3. **完成 Shopline 授權流程** - 初次授權 → 完成頁 → Connector 管理
4. **建立 Admin 首頁** - Event 監測 + Connector 管理
5. **實作 Event 監測系統** - 即時顯示 + 手動觸發測試

### 技術目標
- 從 Vercel 前後端整合 → 前後端分離架構
- 從 Express.js → Fastify + BullMQ + Redis
- 建立完整的 Admin UI 管理介面
- 實作完整的 OAuth 2.0 授權流程

---

## 📋 第一週計劃 (Phase 1: 專案結構重組)

### Day 1: 建立新專案結構

#### 上午任務
- [ ] 建立 `frontend/` 目錄 (Next.js)
- [ ] 建立 `backend/` 目錄 (Fastify)
- [ ] 移動現有檔案到對應目錄
- [ ] 更新 `.gitignore` 和 `package.json`

#### 下午任務
- [ ] 建立 Next.js 基礎應用
- [ ] 建立 Fastify 基礎應用
- [ ] 配置開發環境
- [ ] 測試本地運行

### Day 2: 後端基礎架構

#### 上午任務
- [ ] 配置 Fastify 應用結構
- [ ] 建立中介軟體 (CORS, 錯誤處理, 速率限制)
- [ ] 配置 BullMQ + Redis
- [ ] 建立基礎路由結構

#### 下午任務
- [ ] 設計資料庫 Schema
- [ ] 建立 PostgreSQL 連接
- [ ] 實作基礎 Service 層
- [ ] 建立健康檢查端點

### Day 3: 前端基礎架構

#### 上午任務
- [ ] 建立 Next.js 頁面結構
- [ ] 設計 Admin 首頁 Layout
- [ ] 建立 API 客戶端模組
- [ ] 實作環境偵測 (開發/生產)

#### 下午任務
- [ ] 建立基礎組件 (Header, Sidebar, Main)
- [ ] 實作路由配置
- [ ] 建立樣式系統
- [ ] 測試前後端通訊

---

## 📋 第二週計劃 (Phase 2: 核心功能實作)

### Day 4-5: Shopline 授權流程

#### Day 4 任務
- [ ] 實作 OAuth 2.0 啟動流程
- [ ] 建立授權回調處理
- [ ] 實作 Token 儲存與管理
- [ ] 建立授權完成頁面

#### Day 5 任務
- [ ] 實作自動重導向邏輯
- [ ] 建立授權狀態檢查
- [ ] 實作 Token 刷新機制
- [ ] 建立撤銷授權功能

### Day 6-7: Event 監測系統

#### Day 6 任務
- [ ] 實作 SSE 事件流
- [ ] 建立 Event Monitor 組件
- [ ] 實作事件歷史查詢
- [ ] 建立事件統計顯示

#### Day 7 任務
- [ ] 實作手動觸發測試事件
- [ ] 建立事件過濾功能
- [ ] 實作即時更新機制
- [ ] 建立事件詳情檢視

### Day 8-9: Connector 管理

#### Day 8 任務
- [ ] 建立 Shopline Connector 管理頁面
- [ ] 實作 Token 檢視與刷新
- [ ] 建立 Connector 狀態顯示
- [ ] 實作錯誤處理

#### Day 9 任務
- [ ] 實作 Webhook 訂閱管理
- [ ] 建立 API 測試區塊
- [ ] 實作測試結果顯示
- [ ] 建立操作日誌

---

## 📋 第三週計劃 (Phase 3: 整合與測試)

### Day 10-11: 前後端整合

#### Day 10 任務
- [ ] 整合所有 API 端點
- [ ] 實作統一錯誤處理
- [ ] 建立載入狀態管理
- [ ] 優化用戶體驗

#### Day 11 任務
- [ ] 實作表單驗證
- [ ] 建立成功/錯誤提示
- [ ] 優化響應式設計
- [ ] 實作鍵盤快捷鍵

### Day 12-13: 測試與部署

#### Day 12 任務
- [ ] 端到端測試
- [ ] 效能測試
- [ ] 安全性測試
- [ ] 錯誤處理測試

#### Day 13 任務
- [ ] Render 後端部署
- [ ] Vercel 前端部署
- [ ] 環境變數配置
- [ ] 監控設定

---

## 🛠️ 技術實施指南

### 1. 專案結構建立

```bash
# 建立新目錄結構
mkdir -p frontend backend
mkdir -p frontend/pages frontend/components frontend/lib
mkdir -p backend/src/routes backend/src/services backend/src/workers
mkdir -p backend/src/middleware backend/src/config

# 移動現有檔案
mv views/ frontend/public/
mv public/ frontend/public/
mv api/ backend/src/routes/
mv utils/ backend/src/services/
mv server.js backend/src/
```

### 2. 後端 Fastify 設定

```javascript
// backend/package.json
{
  "name": "shopline-middleware-backend",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "fastify": "^4.24.3",
    "@fastify/cors": "^8.4.0",
    "@fastify/helmet": "^11.1.1",
    "@fastify/rate-limit": "^8.0.2",
    "bullmq": "^4.15.4",
    "ioredis": "^5.3.2",
    "pg": "^8.11.3",
    "uuid": "^9.0.1"
  }
}
```

### 3. 前端 Next.js 設定

```javascript
// frontend/package.json
{
  "name": "shopline-middleware-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "swr": "^2.2.4",
    "tailwindcss": "^3.3.6"
  }
}
```

### 4. 資料庫初始化

```sql
-- backend/src/config/database.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 連接器管理
CREATE TABLE connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'inactive',
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Token 儲存
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID REFERENCES connectors(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 事件記錄
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  source_platform VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  is_test BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook 訂閱
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID REFERENCES connectors(id),
  topic VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 測試計劃

### 單元測試
- [ ] 後端 API 端點測試
- [ ] 前端組件測試
- [ ] 事件處理邏輯測試
- [ ] 資料庫操作測試

### 整合測試
- [ ] 前後端通訊測試
- [ ] OAuth 流程測試
- [ ] 事件流測試
- [ ] 資料庫整合測試

### 端到端測試
- [ ] 完整授權流程測試
- [ ] Event 監測功能測試
- [ ] API 測試功能測試
- [ ] 錯誤處理測試

---

## 📊 成功指標

### 技術指標
- [ ] 前端載入時間 < 2 秒
- [ ] 後端 API 回應時間 < 500ms
- [ ] 事件處理延遲 < 1 秒
- [ ] 測試覆蓋率 > 80%

### 功能指標
- [ ] Shopline 授權流程完整運作
- [ ] Event 監測即時更新
- [ ] Connector 管理功能完整
- [ ] API 測試功能正常

### 用戶體驗指標
- [ ] 授權完成後自動重導向
- [ ] 事件監測即時顯示
- [ ] 錯誤處理友善
- [ ] 載入狀態清晰

---

## 🚨 風險管理

### 高風險項目
- **資料庫遷移**: 可能導致資料遺失
- **API 相容性**: 前端可能無法正確呼叫後端
- **OAuth 流程**: 授權流程可能出現問題

### 風險緩解
- 建立完整的測試覆蓋
- 實作詳細的錯誤處理
- 建立回滾計劃
- 分階段部署

---

## 📝 每日檢查清單

### 每日開始前
- [ ] 檢查昨日完成項目
- [ ] 確認今日目標
- [ ] 檢查環境狀態
- [ ] 備份重要檔案

### 每日結束前
- [ ] 測試今日實作功能
- [ ] 更新進度記錄
- [ ] 檢查代碼品質
- [ ] 準備明日任務

---

## 🎯 第一日任務詳情

### 上午 (9:00-12:00)
1. **建立專案結構** (1 小時)
   - 建立 `frontend/` 和 `backend/` 目錄
   - 移動現有檔案到對應目錄
   - 更新 `.gitignore` 和 `package.json`

2. **配置 Next.js 應用** (1 小時)
   - 初始化 Next.js 專案
   - 配置 Tailwind CSS
   - 建立基礎頁面結構

3. **配置 Fastify 應用** (1 小時)
   - 初始化 Fastify 專案
   - 配置基礎中介軟體
   - 建立健康檢查端點

### 下午 (13:00-17:00)
1. **建立資料庫連接** (1 小時)
   - 配置 PostgreSQL 連接
   - 建立資料庫 Schema
   - 測試資料庫操作

2. **實作基礎 API** (1 小時)
   - 建立認證相關 API
   - 建立事件相關 API
   - 建立 Connector 相關 API

3. **建立前端 API 客戶端** (1 小時)
   - 實作 API 客戶端類別
   - 建立環境偵測
   - 測試前後端通訊

4. **整合測試** (1 小時)
   - 測試本地運行
   - 檢查所有功能正常
   - 修復發現的問題

---

**準備好了嗎？讓我們開始建立中台架構！** 🚀