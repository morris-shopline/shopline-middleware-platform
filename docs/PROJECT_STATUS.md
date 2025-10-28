# 專案現況 (Project Status)

**最後更新**: 2025-01-27  
**當前階段**: 前後端分離架構完成，準備部署  
**架構版本**: Event-Driven V3.0 → 前後端分離架構 (Fastify + Next.js)  
**運作狀態**: ✅ 本地測試完成 + 🚀 準備生產環境部署  
**新帳戶**: GitHub: morris-shopline, Vercel: morris-shoplines-projects  
**🚨 重要決策**: 只推送前後端分離架構，不推送舊專案檔案 (詳見 CRITICAL_DECISIONS.md)

---

## 🎯 專案目標

建立一個 **Event-Driven 的多平台 Connector 系統**，作為中介層（Middleman）整合：
- **Shopline** (電商平台)
- **Next Engine** (OMS 訂單管理系統)
- **未來**: Shopify, WooCommerce, 其他平台

### 核心價值

- **庫存同步**: NE ↔ Shopline 雙向同步
- **訂單管理**: Shopline → Next Engine 訂單推送
- **可擴展性**: 新增端點不影響核心邏輯
- **可觀測性**: 所有變化都是可追蹤的事件

---

## ✅ 當前運作中的功能

### Shopline OAuth
- ✅ 安裝授權流程 (`/oauth/install`)
- ✅ OAuth 回調處理 (`/oauth/callback`)
- ✅ Token 儲存 (PostgreSQL)
- ✅ Token 刷新機制

### Shopline API (已整合 Event Bus)
- ✅ 商店資訊查詢 (`GET /api/test/shop`) → 自動發佈 `shop.updated` 事件
- ✅ 商品列表查詢 (`GET /api/test/products`) → 自動發佈 `product.updated` 事件  
- ✅ 商品建立 (`POST /api/test/products`) → 自動發佈 `product.created` 事件
- ✅ 訂單建立 (`POST /api/test/orders/create`) → 自動發佈 `order.created` 事件
- ✅ 訂單列表查詢 (`GET /api/test/orders/list`) → 自動發佈 `order.updated` 事件
- ✅ 訂單詳情查詢 (`GET /api/test/orders/:id`)
- ✅ 訂單更新 (`PUT /api/test/orders/:id`)

### 部署環境
- ✅ Local: Express Server (http://localhost:3000)
- ✅ Production: Vercel Serverless Functions
- ✅ Database: Prisma Postgres (Vercel)

### Event Bus 系統
- ✅ Event Bus 核心 (`core/event-bus/`)
- ✅ Standard Events 定義 (`core/events/`)
- ✅ Shopline Source Connector (`connectors/shopline/source/`)
- ✅ 雙寫模式 (Dual-Write) - 現有 API 正常運作 + 自動發佈事件
- ✅ Event Monitor Dashboard (`/event-monitor`) - 即時監控事件流
- ✅ 事件持久化 (PostgreSQL `events` 表)

### 前端 UI
- ✅ 授權按鈕
- ✅ 商店資訊查詢
- ✅ 商品列表查詢
- ✅ Event Monitor Dashboard 連結
- ✅ 訂單建立測試

---

## 📊 專案階段

### ✅ Phase 0: 研究與架構設計 (已完成)

**時間**: 2025-10-20 ~ 2025-10-22 (3 天)

**完成項目**:
- [x] Shopline REST API 研究與實作 (Sprint 2)
- [x] Shopline GraphQL API 深度研究
- [x] Next Engine API 深度研究
- [x] 三平台 API 完整對比表
- [x] 架構演進 (V1 → V2 → V3)
- [x] Event-Driven 架構設計 V3
- [x] 漸進式重構 Roadmap

**關鍵成果**:
- 📄 [Shopline GraphQL 研究](./research/SHOPLINE_GRAPHQL_RESEARCH.md)
- 📄 [Next Engine API 研究](./research/NEXT_ENGINE_API_RESEARCH.md)
- 📄 [三平台 API 對比表](./architecture/THREE_PLATFORM_API_COMPARISON.md)
- 📄 [Event-Driven 架構 V3](./architecture/EVENT_DRIVEN_ARCHITECTURE_V3.md)
- 📄 [漸進式重構 Roadmap](./architecture/GRADUAL_REFACTORING_ROADMAP.md)

**關鍵發現**:
1. Shopline GraphQL **不支援 Orders API**
2. Next Engine Token **自動更新**機制
3. Next Engine **反向推送式庫存更新** (獨特設計)
4. 需要 Event-Driven 架構以支援多平台擴展

---

### ✅ Phase R1: Event Bus 核心 (已完成)

**預計時間**: 2 天  
**實際時間**: 2 天  
**狀態**: ✅ 已完成  
**影響範圍**: **不影響現有功能**

**成就**:
- ✅ 建立 Event Bus 核心基礎設施
- ✅ Standard Event 定義
- ✅ 功能開關機制
- ✅ 完整單元測試
- ✅ Event Monitor Dashboard (SSE 訂閱模式)

**完成報告**: [Phase R1 完成報告](./status/PHASE_R1_COMPLETION_REPORT.md)

### ✅ Phase R2: Shopline Source Connector (已完成)

**預計時間**: 3 天  
**實際時間**: < 1 天  
**狀態**: ✅ 已完成  
**影響範圍**: **不影響現有功能**

**成就**:
- ✅ Shopline Source Connector 實作
- ✅ 雙寫模式 (原有 API + 事件發布)
- ✅ 事件轉換器 (API 回應 → Standard Events)
- ✅ 功能開關控制
- ✅ 100% 測試覆蓋率

**完成報告**: [Phase R2 完成報告](./status/PHASE_R2_COMPLETION_REPORT.md)

### 🔄 Phase R3: Shopline Target Connector (準備開始)

**預計時間**: 3 天  
**狀態**: 準備中  
**影響範圍**: **不影響現有功能**

**目標**:
- 實作 Shopline Target Connector
- 建立事件訂閱機制
- Standard Event 到 Shopline API 轉換
- 選擇性訂閱功能

**驗收標準**:
- [ ] Event Bus 單元測試通過
- [ ] **現有 Shopline 功能完全正常**
- [ ] Feature Flag 可控制啟用/停用
- [ ] 文件更新

---

### 🚀 MVP 中台架構階段 (準備開始)

**目標**: 建立中台架構，實現前後端分離，完成 Shopline 完整授權流程

**技術選型**:
- **Backend**: Fastify + TypeScript + BullMQ + Redis Cloud
- **Frontend**: Next.js + SWR + Vercel
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis Cloud
- **Auth**: 自建 JWT + Shopline OAuth
- **Realtime**: SSE (Server Sent Events)

**核心功能**:
- Admin 首頁 (Event 監測 + Connector 管理)
- Shopline Connector (授權/撤銷/Refresh/Webhook/API 測試)
- Event 流轉機制 (Webhook → Queue → 即時推播)
- Token 管理 (PostgreSQL + localStorage)

**階段規劃**:
- **Phase 1**: 專案結構重組 (2-3 天) - 前後端分離
- **Phase 2**: 核心功能實作 (5-6 天) - Admin UI + 授權流程
- **Phase 3**: 整合與測試 (3-4 天) - 部署 + 測試

**總計**: 約 10-13 天 (2-3 週)

**詳細計劃**: [MVP 中台架構實施計劃](./sprints/SPRINT_MVP_MIDDLEWARE_ARCHITECTURE.md)

---

## 🏗️ 目標架構 (Event-Driven V3)

### 核心理念：背骨 + 器官

```
┌─────────────────────────────────────┐
│     Source Connectors (輸入)        │
│  Shopline | Next Engine | Shopify  │
└──────────────┬──────────────────────┘
               ↓ 產生 Standard Events
┌──────────────────────────────────────┐
│   🦴 Event Bus (背骨)                │
│   - 事件佇列                          │
│   - 事件路由                          │
│   - 事件儲存 (可選)                   │
└──────────────┬──────────────────────┘
               ↓ 分發到訂閱者
┌──────────────────────────────────────┐
│   🫀 Event Handlers (器官)           │
│   - Sync Engine (雙向同步)           │
│   - Target Connectors (輸出)        │
│   - Analytics (分析)                │
│   - Notifications (通知)            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│    Target Connectors (輸出)         │
│  Shopline | Next Engine | Slack    │
└─────────────────────────────────────┘
```

### 關鍵優勢

1. **核心不依賴平台**: Event Bus 只知道 Standard Event
2. **新增端點不影響核心**: 只需實作 Connector
3. **業務邏輯解耦**: Sync Engine 訂閱事件，不知道來源
4. **可追蹤、可回放**: 所有事件都有完整的 trace
5. **符合業界最佳實踐**: Zapier / n8n / CDP 模式

---

## 📂 代碼結構

### 當前結構 (運作中)

```
custom-app/
├── api/                          # Vercel Functions
│   ├── oauth/
│   │   ├── install.js           # ✅ 運作中
│   │   └── callback.js          # ✅ 運作中
│   └── test/
│       ├── shop.js              # ✅ 運作中
│       ├── products.js          # ✅ 運作中
│       └── orders/
│           ├── create.js        # ✅ 運作中
│           ├── list.js          # ✅ 運作中
│           └── [id].js          # ✅ 運作中
│
├── routes/                       # Express Routes (local dev)
│   └── oauth.js                 # ✅ 運作中
│
├── utils/                        # 工具函數
│   ├── shopline-api.js          # ✅ 運作中 (核心 API Client)
│   ├── database-postgres.js     # ✅ 運作中 (Token 儲存)
│   └── signature.js             # ✅ 運作中 (HMAC 驗證)
│
├── views/                        # 前端 UI
│   └── index.html               # ✅ 運作中
│
├── public/                       # 靜態資源
│   └── js/app.js                # ✅ 運作中
│
├── server.js                     # ✅ Express Server (local)
└── vercel.json                   # ✅ Vercel 配置
```

### 目標結構 (Phase R1 開始建立)

```
custom-app/
├── (現有代碼保持不變)
│
├── core/                         # 新增：核心抽象層
│   ├── events/
│   │   ├── StandardEvent.ts     # 標準事件定義
│   │   ├── EventTypes.ts        # 事件類型
│   │   └── EventPayloads.ts     # Payload 定義
│   │
│   └── event-bus/
│       ├── IEventBus.ts         # Event Bus 介面
│       └── InMemoryEventBus.ts  # 初期實作
│
├── connectors/                   # 新增：平台 Connectors
│   ├── shopline/
│   │   ├── source/              # Webhook → Standard Event
│   │   └── target/              # Standard Event → API
│   │
│   └── next-engine/
│       ├── source/              # Push → Standard Event
│       └── target/              # Standard Event → API
│
├── engines/                      # 新增：業務引擎 (器官)
│   └── sync-engine/             # 雙向同步引擎
│
└── config/
    └── event-driven/            # 新增：Event-Driven 配置
```

---

## 🔑 關鍵決策記錄

### 決策 1: 為什麼採用 Event-Driven 架構？

**問題**: V1/V2 架構中，Service Layer 仍需知道平台細節，新增端點會影響核心邏輯。

**解決方案**: 採用 Event-Driven 架構，核心只知道 Standard Event。

**參考**: Zapier / n8n (工作流工具), CDP (客戶數據平台) 的模式。

**文件**: [Event-Driven 架構 V3](./architecture/EVENT_DRIVEN_ARCHITECTURE_V3.md)

### 決策 2: 為什麼要漸進式重構，而非砍掉重練？

**問題**: 現有 Shopline 功能已測試通過並部署，不能破壞。

**解決方案**: 採用「雙模式並存」+ 「絞殺者模式」，逐步演進。

**策略**:
- 初期：舊架構為主，新架構為輔 (測試)
- 中期：雙模式並行 (A/B testing)
- 後期：新架構為主，移除舊代碼

**文件**: [漸進式重構 Roadmap](./architecture/GRADUAL_REFACTORING_ROADMAP.md)

### 決策 3: 為什麼暫停 Sprint 3？

**背景**: Sprint 2 完成 Orders API 後，原計劃 Sprint 3 繼續 Shopline 功能。

**轉折**: 用戶提出多平台整合需求 (Next Engine)。

**決定**: 暫停功能開發，轉向架構研究與設計 (Phase 0)。

**原因**: 
- 避免技術債累積
- 確保架構可擴展
- 降低未來重構成本

**文件**: [Sprint 暫停說明](./sprints/SPRINT_PAUSE_NOTICE.md)

### 決策 4: Shopline Orders 必須用 REST API

**發現**: Shopline GraphQL **不支援 Orders API**。

**影響**: 
- 產品查詢可以優先用 GraphQL (更靈活)
- 訂單管理必須用 REST API
- 需要混合使用兩種 API

**文件**: [Shopline GraphQL 研究](./research/SHOPLINE_GRAPHQL_RESEARCH.md)

### 決策 5: Next Engine Token 需要每次 API 呼叫後檢查並保存

**發現**: Next Engine **每次 API 呼叫都可能返回新 token**。

**影響**: TokenManager 需要兩種策略：
- Shopline: 手動 refresh (檢查過期 → 呼叫 refresh API)
- Next Engine: 自動更新 (每次 API 回應後檢查並保存)

**文件**: [Next Engine API 研究](./research/NEXT_ENGINE_API_RESEARCH.md)

### 決策 6: 採用 MVP 中台架構 (Fastify + Next.js)

**背景**: 與架構師討論後，決定採用更現代化的技術棧建立中台架構。

**技術選型**:
- **Backend**: Fastify + TypeScript + BullMQ + Redis Cloud
- **Frontend**: Next.js + SWR + Vercel
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis Cloud
- **Auth**: 自建 JWT + Shopline OAuth
- **Realtime**: SSE (Server Sent Events)

**核心功能**:
- Admin 首頁 (Event 監測 + Connector 管理)
- Shopline Connector (授權/撤銷/Refresh/Webhook/API 測試)
- Event 流轉機制 (Webhook → Queue → 即時推播)
- Token 管理 (PostgreSQL + localStorage)

**優勢**:
- 更快的開發速度
- 更好的類型安全
- 更強的擴展性
- 更現代的架構

**文件**: [MVP 中台架構設計](./architecture/MVP_MIDDLEWARE_ARCHITECTURE.md)

---

## 🧪 測試狀態

### 單元測試
- ⚠️ 目前缺少單元測試
- 📋 Phase R1 開始建立測試框架

### 手動測試
- ✅ Shopline OAuth 流程
- ✅ 商店資訊查詢
- ✅ 商品列表查詢
- ✅ 訂單建立
- ✅ 訂單列表查詢
- ✅ 訂單更新

### 部署測試
- ✅ Vercel Functions 部署成功
- ✅ PostgreSQL 連線正常
- ✅ 前端 UI 正常運作

---

## 🐛 已知問題

### 無重大問題

當前運作中的功能都已測試通過。

### 技術債

1. **缺少單元測試**: Phase R1 開始建立
2. **缺少錯誤處理**: 部分 API 呼叫缺少完整錯誤處理
3. **缺少日誌系統**: Phase R2 加入 Event Logger

---

## 📈 效能指標

### API 回應時間 (預估)
- Shopline API 呼叫: ~200-500ms
- PostgreSQL 查詢: ~10-50ms
- Vercel Function 冷啟動: ~500-1000ms

### Next Engine 特殊要求
- **庫存推送回應**: < 1 秒 (非常嚴格)
- **解決方案**: 立即回應 + 異步處理

---

## 🔐 環境變數

### 當前必要的環境變數

```bash
# Shopline
APP_KEY=your_app_key
APP_SECRET=your_app_secret
SHOP_HANDLE=your_shop_handle

# Database
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# Vercel
VERCEL_URL=your-app.vercel.app
```

### Phase R1 新增

```bash
# Event-Driven 架構開關
USE_EVENT_BUS=false              # 初期設為 false
EVENT_BUS_TYPE=memory            # memory / redis
LOG_EVENTS=true                  # 是否記錄所有事件
```

---

## 📚 重要文件清單

### 必讀 (新進 Agent)
1. [Event-Driven 架構 V3](./architecture/EVENT_DRIVEN_ARCHITECTURE_V3.md)
2. [漸進式重構 Roadmap](./architecture/GRADUAL_REFACTORING_ROADMAP.md)
3. [三平台 API 對比表](./architecture/THREE_PLATFORM_API_COMPARISON.md)

### 參考 (實作時)
4. [Shopline GraphQL 研究](./research/SHOPLINE_GRAPHQL_RESEARCH.md)
5. [Next Engine API 研究](./research/NEXT_ENGINE_API_RESEARCH.md)
6. [Shopline Orders API 最佳實踐](./research/SHOPLINE_ORDERS_API_NOTES.md)

### 歷史 (了解演進)
7. [Sprint 2 完成報告](./sprints/SPRINT2_COMPLETION_REPORT.md)
8. [Sprint 暫停說明](./sprints/SPRINT_PAUSE_NOTICE.md)

---

## 🚀 下一步行動

### 立即可執行 (MVP 中台架構 Phase 1)

1. **Day 1 上午**: 專案結構重組
   - 建立 `frontend/` (Next.js 專案)
   - 建立 `backend/` (Fastify 專案)
   - 建立 `shared/` (共用類型定義)
   - 設定 TypeScript 配置

2. **Day 1 下午**: 雲端服務配置
   - 建立 Render 後端專案
   - 建立 Vercel 前端專案
   - 設定 PostgreSQL 資料庫
   - 設定 Redis Cloud

3. **Day 2**: 後端基礎架構
   - 建立 Fastify 應用基礎結構
   - 設定 Prisma ORM 和資料庫 Schema
   - 實作基本的控制器和服務結構
   - 設定 BullMQ 和 Redis 連接

**詳細步驟**: [MVP 中台架構實施計劃](./sprints/SPRINT_MVP_MIDDLEWARE_ARCHITECTURE.md)

---

## 📞 聯絡資訊

### 專案維護
- **Primary**: AI Assistant
- **Repository**: GitHub (private)
- **部署平台**: Vercel

### 支援資源
- Shopline Developer Docs: https://developer.shopline.com
- Next Engine Developer Docs: https://developer.next-engine.com
- Vercel Docs: https://vercel.com/docs

---

## 📝 更新日誌

### 2025-01-27
- ✅ 與架構師討論完成
- ✅ MVP 中台架構設計完成
- ✅ 技術選型確定 (Fastify + Next.js)
- ✅ 詳細實施計劃建立
- 📋 準備開始 MVP 中台架構 Phase 1

### 2025-10-22
- ✅ Phase 0 完成
- ✅ Event-Driven 架構 V3 設計完成
- ✅ 漸進式重構 Roadmap 建立
- 📋 準備開始 Phase R1

### 2025-10-21
- ✅ Sprint 2 完成
- ✅ Shopline Orders API 測試通過
- ✅ Vercel 部署成功
- 📋 開始 API 研究 (Phase 0)

### 2025-10-20
- ✅ 專案啟動
- ✅ Shopline OAuth 完成
- ✅ 基礎 CRUD 功能完成

---

**Last Updated**: 2025-10-22  
**Next Review**: Phase R1 完成後  
**Status**: ✅ Active & Ready for Phase R1

