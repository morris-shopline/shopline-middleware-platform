# Sprint 2: Orders API 規格文件

## 📋 基本資訊

- **Sprint**: Sprint 2
- **版本**: v2.1.0
- **建立日期**: 2025-10-21
- **狀態**: 📝 規格設計中
- **負責人**: Development Team

## 🎯 需求分析 (Requirement Analysis)

### 用戶需求
**需求描述**：實作 SHOPLINE Orders API 的 Create、Read、Update 功能，讓用戶可以：
1. 查詢訂單列表
2. 查詢單一訂單詳情
3. 建立測試訂單
4. 更新訂單狀態

### 使用情境

#### 情境 1：查詢訂單列表
**使用者**：商店管理員  
**目的**：查看最近的訂單  
**流程**：
1. 用戶點擊「檢視訂單」按鈕
2. 系統呼叫 SHOPLINE Orders API 取得訂單列表
3. 顯示訂單列表（訂單號、客戶、金額、狀態）

#### 情境 2：查詢訂單詳情
**使用者**：商店管理員  
**目的**：查看特定訂單的完整資訊  
**流程**：
1. 用戶在訂單列表中選擇特定訂單
2. 系統呼叫 SHOPLINE Orders API 取得訂單詳情
3. 顯示完整訂單資訊（商品、數量、金額、客戶資訊、配送資訊）

#### 情境 3：建立測試訂單
**使用者**：開發者/測試人員  
**目的**：建立測試訂單驗證系統功能  
**流程**：
1. 用戶點擊「建立訂單」按鈕
2. 填寫訂單資訊（客戶、商品、數量）
3. 系統呼叫 SHOPLINE Orders API 建立訂單
4. 顯示建立結果

#### 情境 4：更新訂單狀態
**使用者**：商店管理員  
**目的**：更新訂單處理狀態  
**流程**：
1. 用戶選擇特定訂單
2. 選擇新的訂單狀態（如：處理中、已出貨、已完成）
3. 系統呼叫 SHOPLINE Orders API 更新訂單
4. 顯示更新結果

### 功能優先級（依測試順序）
1. **P0（必須）**：建立測試訂單（需先 GET Products 取得有效 variant_id）
2. **P0（必須）**：查詢訂單列表
3. **P0（必須）**：查詢訂單詳情
4. **P1（重要）**：更新訂單狀態
5. **P1（重要）**：再次查詢訂單詳情（驗證更新）

### 測試流程
```
1. GET Products API → 取得有效的 variant_id
   ↓
2. POST Order API → 建立測試訂單
   ↓
3. GET Orders API → 查詢訂單列表，確認訂單已建立
   ↓
4. GET Order Detail API → 查詢訂單詳情
   ↓
5. PUT Order API → 更新訂單狀態
   ↓
6. GET Order Detail API → 再次查詢，確認狀態已更新
```

### 技術限制和風險

#### 限制
1. **API Scope 需求**：需要 `read_orders` 和 `write_orders` scope
2. **測試資料依賴**：建立訂單需要已存在的商品（顧客非必要）
3. **訂單狀態規則**：SHOPLINE 對訂單狀態轉換有限制（參考官方文件）

#### 風險
1. **API 複雜度**：Orders API 比 Products API 複雜，欄位更多
2. **資料依賴**：需要先查詢有效的商品 ID
3. **測試環境限制**：測試訂單可能影響商店統計數據

### 官方文件參考
- **建立訂單**：https://developer.shopline.com/docs/admin-rest-api/order/order-management/create-an-order?version=v20260301
- **查詢訂單**：https://developer.shopline.com/docs/admin-rest-api/order/order-management/get-orders?version=v20260301
- **更新訂單**：https://developer.shopline.com/docs/admin-rest-api/order/order-management/update-an-order?version=v20260301
- **Access Scope**：https://developer.shopline.com/docs/apps/api-instructions-for-use/access-scope?version=v20260301

## 🏗️ 架構設計 (Architecture Design)

### 系統架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 UI      │    │ Vercel Functions │    │ SHOPLINE API   │
│  - 訂單列表     │◄──►│  - GET /orders  │◄──►│  Orders API    │
│  - 訂單詳情     │    │  - POST /orders │    │                │
│  - 建立訂單     │    │  - PUT /orders  │    │                │
│  - 更新訂單     │    │                 │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### API 端點設計

#### 1. 查詢訂單列表
```
GET /api/test/orders
```

**Query Parameters**:
```typescript
{
  page?: number      // 頁碼，預設 1
  limit?: number     // 每頁筆數，預設 10
  status?: string    // 訂單狀態篩選
}
```

**Response** (成功):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "12345",
        "order_number": "ORD-20251021-001",
        "customer": {
          "id": "67890",
          "name": "張三",
          "email": "test@example.com"
        },
        "total_price": "1000.00",
        "status": "pending",
        "created_at": "2025-10-21T05:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  },
  "apiInfo": {
    "endpoint": "https://paykepoc.myshopline.com/admin/openapi/v20260301/orders.json",
    "method": "GET",
    "status": 200,
    "timestamp": "2025-10-21T05:00:00Z"
  }
}
```

#### 2. 查詢訂單詳情
```
GET /api/test/orders/:id
```

**Response** (成功):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "12345",
      "order_number": "ORD-20251021-001",
      "customer": {
        "id": "67890",
        "name": "張三",
        "email": "test@example.com",
        "phone": "0912345678"
      },
      "line_items": [
        {
          "id": "111",
          "product_id": "222",
          "variant_id": "333",
          "title": "測試商品",
          "quantity": 2,
          "price": "500.00"
        }
      ],
      "shipping_address": {
        "name": "張三",
        "address1": "台北市信義區信義路五段7號",
        "city": "台北市",
        "country": "台灣"
      },
      "total_price": "1000.00",
      "status": "pending",
      "created_at": "2025-10-21T05:00:00Z",
      "updated_at": "2025-10-21T05:00:00Z"
    }
  },
  "apiInfo": {
    "endpoint": "https://paykepoc.myshopline.com/admin/openapi/v20260301/orders/{id}.json",
    "method": "GET",
    "status": 200,
    "timestamp": "2025-10-21T05:00:00Z"
  }
}
```

#### 3. 建立訂單
```
POST /api/test/orders
```

**前置步驟**：
1. 先呼叫 `GET /api/test/products` 取得有效的 variant_id
2. 從回應中選擇一個有效的 variant_id

**Request Body**（實測可用範例）:
```json
{
  "order": {
    "note_attributes": [
      {
        "name": "API_REMARK",
        "value": "test order update"
      }
    ],
    "tags": "API_Revised",
    "price_info": {
      "current_extra_total_discounts": "8.00",
      "taxes_included": null,
      "total_shipping_price": "8.00"
    },
    "line_items": [
      {
        "discount_price": {
          "amount": "1.00",
          "title": "Discount name"
        },
        "location_id": "6402444512912503764",
        "price": "3.25",
        "properties": [
          {
            "name": "attribute name",
            "show": true,
            "type": "text",
            "value": "attribute value"
          }
        ],
        "quantity": 1,
        "requires_shipping": null,
        "shipping_line_title": null,
        "tax_line": {
          "price": "3.25",
          "rate": "0.020",
          "title": "Tax name"
        },
        "taxable": null,
        "title": "beautiful skirt",
        "variant_id": "18068894570286381842792925"
      }
    ]
  }
}
```

**⚠️ 重要**：
- `variant_id` 必須從 GET Products API 取得
- 顧客資訊非必要，可省略
- 完全依照官方文件：https://developer.shopline.com/docs/admin-rest-api/order/order-management/create-an-order?version=v20260301

**Response** (成功):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "12345",
      "order_number": "ORD-20251021-001",
      "status": "pending"
    }
  },
  "message": "訂單建立成功",
  "apiInfo": {
    "endpoint": "https://paykepoc.myshopline.com/admin/openapi/v20260301/orders.json",
    "method": "POST",
    "status": 201,
    "timestamp": "2025-10-21T05:00:00Z"
  }
}
```

#### 4. 更新訂單狀態
```
PUT /api/test/orders/:id
```

**Request Body**:
```json
{
  "order": {
    "status": "processing"
  }
}
```

**Response** (成功):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "12345",
      "status": "processing",
      "updated_at": "2025-10-21T05:10:00Z"
    }
  },
  "message": "訂單狀態更新成功",
  "apiInfo": {
    "endpoint": "https://paykepoc.myshopline.com/admin/openapi/v20260301/orders/{id}.json",
    "method": "PUT",
    "status": 200,
    "timestamp": "2025-10-21T05:10:00Z"
  }
}
```

### 資料庫 Schema

**無需新增資料表**，繼續使用現有的 `oauth_tokens` 表。

### 技術選型

- **後端**：沿用現有的 Vercel Serverless Functions
- **API 客戶端**：擴充現有的 `utils/shopline-api.js`
- **前端**：擴充現有的 Vanilla JavaScript
- **資料庫**：使用現有的 PostgreSQL（僅儲存 OAuth tokens）

## 📊 Epic & Story 規劃

### Epic: Orders API 整合

#### Story 1: 查詢訂單列表 [P0]
**作為**：商店管理員  
**我想要**：查看訂單列表  
**以便於**：了解最近的訂單狀況

**驗收標準**：
- 可以成功呼叫 SHOPLINE Orders API
- 顯示訂單列表（訂單號、客戶、金額、狀態）
- 支援分頁
- 支援狀態篩選
- 顯示錯誤訊息

**工作量估算**：4 小時

#### Story 2: 查詢訂單詳情 [P0]
**作為**：商店管理員  
**我想要**：查看特定訂單的完整資訊  
**以便於**：了解訂單的詳細內容

**驗收標準**：
- 可以成功呼叫 SHOPLINE Orders API
- 顯示完整訂單資訊
- 顯示商品明細
- 顯示客戶資訊
- 顯示配送資訊

**工作量估算**：3 小時

#### Story 3: 建立測試訂單 [P1]
**作為**：開發者  
**我想要**：建立測試訂單  
**以便於**：驗證系統功能

**驗收標準**：
- 可以成功建立訂單
- 提供預設測試資料
- 顯示建立結果
- 處理錯誤情境（商品不存在、庫存不足等）

**工作量估算**：5 小時

#### Story 4: 更新訂單狀態 [P1]
**作為**：商店管理員  
**我想要**：更新訂單處理狀態  
**以便於**：追蹤訂單處理進度

**驗收標準**：
- 可以成功更新訂單狀態
- 提供狀態選擇
- 顯示更新結果
- 處理錯誤情境（無效狀態等）

**工作量估算**：3 小時

### Sprint Backlog
- **Story 1**: 查詢訂單列表 [4h]
- **Story 2**: 查詢訂單詳情 [3h]
- **Story 3**: 建立測試訂單 [5h]
- **Story 4**: 更新訂單狀態 [3h]

**總工作量**：15 小時

## ✅ 規格確認事項

### 已確認項目

1. **訂單建立先決條件** ✅
   - **確認**：只需要商品，顧客非必要
   - **說明**：建立訂單只需要有效的 `variant_id`，顧客資訊可省略

2. **測試順序** ✅
   - **確認**：建立訂單 → 查詢訂單 → 查詢訂單詳情 → 更新訂單狀態 → 查詢訂單詳情（驗證）

3. **API 呼叫流程** ✅
   - **確認**：建立訂單前需先 GET Products 取得有效的 variant_id
   - **流程**：GET Products → POST Order（使用 variant_id）

4. **官方文件參考** ✅
   - **確認**：完全依照文件定義處理，禁止自己瞎掰
   - **文件**：已記錄在本文件「官方文件參考」章節

5. **實測 Sample** ✅
   - **確認**：已提供實測可過的 create order sample
   - **位置**：本文件 `#### 3. 建立訂單` 章節

6. **權限管理** ✅
   - **確認**：已建檔 `docs/research/SHOPLINE_ACCESS_SCOPES.md`
   - **需要申請**：`read_orders` 和 `write_orders` scope

---

## 📝 待確認事項

### ⚠️ 需要與用戶確認

1. **訂單狀態規則**
   - [ ] 確認 SHOPLINE 支援的訂單狀態列表
   - [ ] 確認訂單狀態轉換規則（哪些狀態可以互相轉換）
   - [ ] 確認是否有不可逆的狀態轉換
   - **TODO**：查閱官方文件確認

2. **前端 UI 設計**
   - [ ] 訂單列表顯示欄位（建議：訂單編號、狀態、金額）
   - [ ] 訂單詳情顯示格式（建議：完整 JSON）
   - [ ] 建立訂單互動流程（建議：選商品 → 自動建立 → 顯示結果）
   - [ ] 更新訂單互動流程（建議：選訂單 → 選狀態 → 確認更新）
   - **TODO**：用戶確認 UI 設計方向

3. **錯誤處理策略**
   - [ ] 各種錯誤情境的處理方式（建議：顯示完整錯誤訊息）
   - [ ] 錯誤訊息顯示格式（建議：記錄到控制台）
   - [ ] 是否需要重試機制（建議：不需要，測試工具性質）
   - **TODO**：用戶確認錯誤處理策略

4. **效能考量**
   - [ ] 是否需要分頁功能（建議：暫不實作）
   - [ ] 是否需要篩選和搜尋（建議：暫不實作）
   - [ ] 是否需要快取機制（建議：暫不實作）
   - **TODO**：用戶確認是否需要這些功能

## 🔄 下一步行動

1. **等待用戶確認**：上述待確認事項
2. **API 文件研究**：查閱 SHOPLINE Orders API 官方文件
3. **測試案例設計**：基於確認的規格設計測試案例
4. **開始實作**：待規格確認後開始開發

---

**狀態**：📝 等待用戶確認  
**建立時間**：2025-10-21  
**預計完成**：待確認後評估  

**⚠️ 重要：本規格需經用戶確認後才能進入開發階段！**

