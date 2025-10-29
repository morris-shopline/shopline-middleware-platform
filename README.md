# Shopline 中台系統 - 前後端分離架構

> **Event-Driven 多平台整合系統**
> 
> 作為中介層（Middleman）整合電商平台（Shopline）與 OMS（Next Engine）
> 
> **✅ 里程碑 1 完成**: 前後端分離架構部署成功

## 🎯 專案願景

建立一個 **Event-Driven 的多平台 Connector 系統**，支援：
- **Shopline** (電商平台) - 🔄 準備整合
- **Next Engine** (OMS 訂單管理) - 🔄 準備整合
- **未來**: Shopify, WooCommerce, 其他平台

### 核心能力
- 🔄 **庫存同步**: NE ↔ Shopline 雙向同步
- 📦 **訂單管理**: Shopline → Next Engine 訂單推送
- 🔌 **可擴展性**: 新增端點不影響核心邏輯
- 👀 **可觀測性**: 所有變化都是可追蹤的事件
- 📊 **即時監控**: Event Monitor Dashboard 使用 SSE 訂閱模式監控事件流

---

## 📚 文件中心

**⭐ 新進 Agent 必讀**: [docs/README.md](./docs/README.md) - 完整的文件導航

### 快速導航

#### 核心文件 (必讀)
1. **[專案現況](./docs/PROJECT_STATUS.md)** ⭐ 第一份必讀
   - 當前運作中的功能
   - 已完成的階段
   - 下一步要做什麼

2. **[Event-Driven 架構 V3](./docs/architecture/EVENT_DRIVEN_ARCHITECTURE_V3.md)** ⭐ 目標架構
   - 核心設計理念
   - 完整技術規範

3. **[漸進式重構 Roadmap](./docs/architecture/GRADUAL_REFACTORING_ROADMAP.md)** ⭐ 執行計劃
   - 如何從現況演進
   - 零停機策略

#### 開發相關
- [API 測試端點](#-api-端點) - 當前可用的 API
- [開發工作流程](./docs/workflow/DEVELOPMENT_WORKFLOW.md)
- [部署指南](./docs/DEPLOYMENT.md)

---

## ✅ 當前狀態

### 🎉 里程碑 1 完成 (2025-10-29)
**前後端分離架構部署成功** ✅

#### 部署狀態
- ✅ **前端**: Next.js 部署於 Vercel
  - URL: https://shopline-middleware-platform.vercel.app
  - 狀態: 正常運行
- ✅ **後端**: Fastify + TypeScript 部署於 Render
  - URL: https://shopline-middleware-platform.onrender.com
  - 狀態: 正常運行，健康檢查通過
- ✅ **資料庫**: PostgreSQL 部署於 Render
  - 狀態: 已遷移，Prisma schema 已推送
- ✅ **快取**: Redis 部署於 Render
  - 狀態: 已設定

#### 技術架構
- ✅ **前端**: Next.js + TypeScript (Vercel)
- ✅ **後端**: Fastify + TypeScript (Render)
- ✅ **資料庫**: PostgreSQL + Prisma ORM (Render)
- ✅ **快取**: Redis (Render)
- ✅ **認證**: 準備實作 JWT + Shopline OAuth

### 下一步：MVP 功能開發
**準備開始實作**:
- 🔄 Admin 首頁 - Event 監測和 Connector 管理
- 🔄 Shopline 連接器 - OAuth 授權流程
- 🔄 Webhook 管理 - 事件接收和處理
- 🔄 API 測試區塊 - 測試 Shopline API

---

## 📋 快速開始

### 系統概述
完整的 Multi-Platform Connector 系統，包含前端 UI、後端 API、PostgreSQL 資料庫和 Vercel 雲端部署。支援本地開發（ngrok）和正式環境（Vercel）。

### 快速啟動
```bash
# 1. 安裝依賴
npm install

# 2. 設定 Vercel Postgres 資料庫
# 在 Vercel Dashboard 中建立 Postgres 資料庫
# 取得連接字串後設定環境變數
export POSTGRES_URL="postgres://username:password@host:port/database"

# 3. 啟動應用
npm start

# 4. 啟動 ngrok (新終端)
npm run ngrok

# 5. 訪問應用
open http://localhost:3000

# 6. 訪問 Event Monitor Dashboard
open http://localhost:3000/event-monitor

# Event Monitor Dashboard 功能：
# - 即時監控：使用 SSE 訂閱模式監控事件流
# - 事件發布：測試 Event Bus 事件發布功能
# - 歷史載入：載入最近 100 筆歷史事件
# - 統計顯示：顯示資料庫總事件數和 log 區域統計
```

## 📚 詳細文件導航

完整的文件結構請查看: **[docs/README.md](./docs/README.md)**

### 參考文件
- [Vercel 架構說明](./docs/architecture/VERCEL_ARCHITECTURE.md)
- [Shopline Orders API 筆記](./docs/research/SHOPLINE_ORDERS_API_NOTES.md)
- [開發流程](./docs/workflow/DEVELOPMENT_WORKFLOW.md)

## 🏗️ 系統架構

### 本地開發環境
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 UI      │    │   後端 API     │    │  PostgreSQL DB  │
│  (Vanilla JS)  │◄──►│   (Express.js)  │◄──►│   (Token 儲存)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                      ▲                       ▲
         └──────────────────────┴───────────────────────┘
                          ngrok tunnel
```

### 生產環境 (前後端分離)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 UI      │    │   後端 API     │    │  PostgreSQL DB  │
│  (Next.js)     │◄──►│  (Fastify)     │◄──►│   (Render)      │
│  (Vercel)      │    │  (Render)      │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔑 核心功能

### ✅ 已完成 (里程碑 1)
- ✅ **前後端分離架構** - Next.js + Fastify 分離部署
- ✅ **Vercel 前端部署** - 靜態託管 + 環境變數配置
- ✅ **Render 後端部署** - Web Service + PostgreSQL + Redis
- ✅ **資料庫遷移** - Prisma schema 推送完成
- ✅ **健康檢查** - 前後端連接測試通過
- ✅ **基礎 API 架構** - 準備擴展功能

### 🔄 準備開發 (MVP 功能)
- 🔄 **Admin 首頁** - Event 監測和 Connector 管理
- 🔄 **Shopline OAuth 2.0** - 授權流程和 Token 管理
- 🔄 **Webhook 管理** - 事件接收和處理
- 🔄 **API 測試區塊** - Shopline API 測試功能

## 📋 API 端點

### ✅ 當前可用 (基礎架構)
- `GET /health` - 健康檢查 (後端)
- `GET /api/status` - API 狀態 (後端)
- `GET /` - 前端 UI (Vercel)

### 🔄 準備開發 (MVP 功能)
- `GET /api/auth/shopline` - Shopline OAuth 授權
- `GET /api/auth/shopline/callback` - OAuth 回調
- `GET /api/connectors/shopline` - Shopline 連接器管理
- `POST /api/connectors/shopline/test` - API 測試
- `POST /api/webhooks/shopline` - Webhook 接收
- `GET /api/events` - 事件列表
- `GET /api/events/stats` - 事件統計

## 🤖 Agent 資訊查找

### 官方資源查詢
```bash
# 顯示官方資源清單
npm run agent:official
```

### 查找原則
1. 優先使用本地專案文件 (docs/ 資料夾)
2. 超出專案內容時，使用官方來源查詢
3. Agent 自行判斷何時需要查詢何種資訊

## 🔧 配置

### 環境變數
```bash
# 本地開發
NODE_ENV=development
PORT=3000
POSTGRES_URL=postgres://...  # Prisma Postgres 連接字串

# Vercel 生產環境
APP_KEY=4c951e966557c8374d9a61753dfe3c52441aba3b
APP_SECRET=dd46269d6920f49b07e810862d3093062b0fb858
SHOP_HANDLE=paykepoc
SHOP_URL=https://paykepoc.myshopline.com/
NODE_ENV=production
POSTGRES_URL=postgres://...  # 自動由 Vercel 設定
```

### 本地開發設定
```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數（參考 .env.local）
cp .env.example .env.local

# 3. 啟動本地伺服器
npm start

# 4. 啟動 ngrok (另一終端)
npm run ngrok
```

### Vercel 部署
```bash
# 1. 連接 Vercel 專案
vercel link

# 2. 本地測試 Vercel Functions
vercel dev --yes

# 3. 部署到 Vercel
git push origin main  # 自動部署
```

## 🚨 故障排除

### 常見問題
1. **簽名驗證失敗** - 檢查 app_secret 和時間戳
2. **資料庫連線失敗** - 檢查資料庫檔案權限
3. **ngrok 連線問題** - 重新啟動 ngrok 服務

### 日誌查看
```bash
# 查看應用日誌
tail -f logs/combined.log

# 查看錯誤日誌
tail -f logs/error.log
```

## 📞 支援

如需協助，請參考：
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 系統架構
- [SHOPLINE_STANDARDS.md](./SHOPLINE_STANDARDS.md) - 平台標準
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南

---

**版本**: 4.0.0 (前後端分離架構)  
**最後更新**: 2025-10-29  
**狀態**: ✅ 里程碑 1 完成，MVP 功能開發準備中  
**前端網址**: https://shopline-middleware-platform.vercel.app  
**後端網址**: https://shopline-middleware-platform.onrender.com  
**文件中心**: [docs/README.md](./docs/README.md)
