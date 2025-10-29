# OAuth 流程 Mermaid 圖表

**最後更新**: 2025-10-29  
**用途**: 視覺化展示 Shopline OAuth 2.0 完整流程

---

## 🔐 完整 OAuth 2.0 流程圖

### 1. 授權啟動與回調流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端 (Next.js)
    participant B as 後端 (Fastify)
    participant S as Shopline
    participant D as 資料庫 (PostgreSQL)

    Note over U,D: 1. 授權啟動階段
    U->>F: 點擊「開始授權」
    F->>B: GET /api/auth/shopline/install
    B->>B: 生成 state 參數
    B->>B: 生成授權 URL
    B->>F: 重定向到授權頁面
    F->>S: 重定向到 Shopline 授權頁面
    
    Note over U,D: 2. 用戶授權階段
    S->>U: 顯示授權確認頁面
    U->>S: 點擊「授權」
    
    Note over U,D: 3. 回調處理階段
    S->>B: 重定向到 /api/auth/shopline/callback<br/>?code=xxx&state=xxx&sign=xxx
    B->>B: 驗證簽名和參數
    B->>S: POST /admin/oauth-web/oauth/token<br/>請求 Access Token
    S->>B: 返回 Token 資料<br/>{access_token, refresh_token, expires_in}
    B->>D: 儲存 Token 到資料庫
    B->>F: 重定向到授權完成頁面
    F->>U: 顯示授權成功
```

### 2. Token 管理與刷新流程

```mermaid
sequenceDiagram
    participant F as 前端 (Next.js)
    participant B as 後端 (Fastify)
    participant D as 資料庫 (PostgreSQL)
    participant S as Shopline

    Note over F,S: 1. Token 狀態檢查
    F->>B: GET /api/connectors/shopline/status
    B->>D: 查詢 Token 狀態
    D->>B: 返回 Token 資料
    
    Note over F,S: 2. Token 過期檢查
    B->>B: 檢查 Token 是否過期
    
    alt Token 有效
        B->>F: 返回 Token 資訊<br/>{access_token, expires_at, status: 'valid'}
    else Token 過期
        Note over F,S: 3. 自動刷新 Token
        B->>S: POST /admin/oauth/token/refresh<br/>使用 refresh_token
        S->>B: 返回新 Token<br/>{access_token, refresh_token, expires_in}
        B->>D: 更新 Token 資料
        B->>F: 返回新 Token 資訊<br/>{access_token, expires_at, status: 'refreshed'}
    end
```

### 3. API 測試與事件發布流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端 (Next.js)
    participant B as 後端 (Fastify)
    participant D as 資料庫 (PostgreSQL)
    participant S as Shopline
    participant R as Redis (Event Queue)

    Note over U,R: 1. API 測試請求
    U->>F: 點擊「測試 API」
    F->>B: POST /api/connectors/shopline/test<br/>{api_type: 'products', action: 'list'}
    
    Note over U,R: 2. Token 驗證
    B->>D: 查詢有效 Token
    D->>B: 返回 Token 資料
    
    Note over U,R: 3. API 調用
    B->>S: GET /admin/openapi/v20260301/products/products.json<br/>Authorization: Bearer {access_token}
    S->>B: 返回 API 結果<br/>{products: [...], total: 100}
    
    Note over U,R: 4. 事件發布
    B->>R: 發布測試事件到 Queue<br/>{type: 'api_test', source: 'shopline', data: {...}}
    
    Note over U,R: 5. 結果返回
    B->>F: 返回 API 結果
    F->>U: 顯示結果
```

### 4. Webhook 訂閱與接收流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端 (Next.js)
    participant B as 後端 (Fastify)
    participant S as Shopline
    participant D as 資料庫 (PostgreSQL)
    participant R as Redis (Event Queue)

    Note over U,R: 1. Webhook 訂閱
    U->>F: 點擊「訂閱 Webhook」
    F->>B: POST /api/connectors/shopline/webhooks<br/>{events: ['product.created', 'order.created']}
    B->>S: POST /admin/webhooks<br/>訂閱指定事件
    S->>B: 返回 Webhook 配置
    B->>D: 儲存 Webhook 配置
    
    Note over U,R: 2. Webhook 接收
    S->>B: POST /api/webhooks/shopline<br/>Shopline 推送事件
    B->>B: 驗證 Webhook 簽名
    B->>D: 記錄事件到資料庫
    B->>R: 發布事件到 Queue
    
    Note over U,R: 3. 事件處理
    R->>B: 處理事件
    B->>F: 透過 SSE 推播事件
    F->>U: 顯示新事件
```

---

## 🏗️ 系統架構圖

### 前後端分離架構

```mermaid
graph TB
    subgraph "前端 (Vercel)"
        A[Admin 首頁]
        B[Shopline Connector 頁]
        C[Event Monitor]
    end
    
    subgraph "後端 (Render)"
        D[Fastify API Gateway]
        E[OAuth 端點]
        F[Webhook 端點]
        G[API 測試端點]
    end
    
    subgraph "資料層 (Render)"
        H[PostgreSQL]
        I[Redis Queue]
    end
    
    subgraph "外部服務"
        J[Shopline API]
        K[Shopline Webhook]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    D --> F
    D --> G
    
    E --> H
    F --> H
    G --> H
    
    E --> J
    G --> J
    K --> F
    
    F --> I
    G --> I
```

### 資料流程圖

```mermaid
flowchart LR
    subgraph "用戶操作"
        A[點擊授權] --> B[測試 API]
        B --> C[訂閱 Webhook]
    end
    
    subgraph "前端處理"
        D[Next.js 頁面] --> E[API 調用]
        E --> F[狀態更新]
    end
    
    subgraph "後端處理"
        G[Fastify 路由] --> H[業務邏輯]
        H --> I[資料庫操作]
        I --> J[外部 API 調用]
    end
    
    subgraph "資料儲存"
        K[PostgreSQL] --> L[Token 儲存]
        L --> M[Event 記錄]
    end
    
    subgraph "事件處理"
        N[Redis Queue] --> O[事件發布]
        O --> P[即時推播]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> G
    E --> G
    F --> G
    
    G --> K
    H --> K
    I --> K
    
    J --> N
    O --> P
```

---

## 🔧 技術實作細節

### 1. 後端端點架構

```mermaid
graph TD
    subgraph "認證模組"
        A1[GET /api/auth/shopline/install]
        A2[GET /api/auth/shopline/callback]
        A3[POST /api/auth/shopline/refresh]
        A4[POST /api/auth/shopline/revoke]
    end
    
    subgraph "連接器模組"
        B1[GET /api/connectors/shopline/status]
        B2[GET /api/connectors/shopline/token]
        B3[POST /api/connectors/shopline/test]
        B4[GET /api/connectors/shopline/webhooks]
        B5[POST /api/connectors/shopline/webhooks]
    end
    
    subgraph "事件模組"
        C1[GET /api/events]
        C2[GET /api/events/stats]
        C3[POST /api/webhooks/shopline]
    end
    
    subgraph "健康檢查"
        D1[GET /health]
        D2[GET /api/status]
    end
```

### 2. 資料庫關聯圖

```mermaid
erDiagram
    SHOPLINE_TOKENS {
        int id PK
        string shop_handle
        text access_token
        text refresh_token
        timestamp expires_at
        text scope
        timestamp created_at
        timestamp updated_at
    }
    
    EVENTS {
        int id PK
        string source
        string event_type
        text data
        string status
        timestamp created_at
    }
    
    WEBHOOKS {
        int id PK
        string platform
        string event_type
        string webhook_url
        string secret
        boolean active
        timestamp created_at
    }
    
    EVENT_LOGS {
        int id PK
        int event_id FK
        string level
        text message
        timestamp created_at
    }
    
    SHOPLINE_TOKENS ||--o{ EVENTS : generates
    EVENTS ||--o{ EVENT_LOGS : has
    WEBHOOKS ||--o{ EVENTS : receives
```

---

## 🚀 部署流程圖

### 完整部署流程

```mermaid
flowchart TD
    A[代碼提交到 GitHub] --> B[Vercel 自動部署前端]
    A --> C[Render 自動部署後端]
    
    B --> D[前端環境變數設定]
    C --> E[後端環境變數設定]
    
    D --> F[前端健康檢查]
    E --> G[後端健康檢查]
    
    F --> H[前後端連接測試]
    G --> H
    
    H --> I[資料庫遷移]
    I --> J[Redis 連接測試]
    
    J --> K[部署完成]
    
    K --> L[功能測試]
    L --> M[生產環境就緒]
```

---

**最後更新**: 2025-10-29  
**維護者**: AI Assistant  
**版本**: 1.0.0
