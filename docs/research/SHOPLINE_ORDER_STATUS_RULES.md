# SHOPLINE 訂單狀態規則

## 📋 基本資訊

- **官方文件**：
  - 建立訂單：https://developer.shopline.com/docs/admin-rest-api/order/order-management/create-an-order?version=v20260301
  - 查詢訂單：https://developer.shopline.com/docs/admin-rest-api/order/order-management/get-orders?version=v20260301
  - 更新訂單：https://developer.shopline.com/docs/admin-rest-api/order/order-management/update-an-order?version=v20260301
- **版本**：v20260301
- **最後更新**：2025-10-21

## 🔄 訂單狀態類型

根據 SHOPLINE API 文件，訂單有多個狀態維度：

### 1. 訂單狀態 (status)
訂單的整體處理狀態

### 2. 履約狀態 (fulfillment_status)
訂單的配送/履約狀態

### 3. 財務狀態 (financial_status)
訂單的付款狀態

## 📊 訂單狀態值（基於官方文件推測）

### 常見訂單狀態
根據 SHOPLINE 電商系統的標準流程，訂單狀態通常包含：

- `pending` - 待處理
- `processing` - 處理中
- `completed` - 已完成
- `cancelled` - 已取消

### 常見履約狀態
- `unfulfilled` - 未履約
- `partial` - 部分履約
- `fulfilled` - 已履約

### 常見財務狀態
- `pending` - 待付款
- `paid` - 已付款
- `refunded` - 已退款
- `partially_refunded` - 部分退款

## ⚠️ 重要說明

**本文件基於一般電商系統的標準狀態推測，實際狀態值和轉換規則需要：**

1. **查閱完整的 SHOPLINE API 文件**
2. **實際測試 API 回應**
3. **根據測試結果更新本文件**

## 🔧 更新訂單 API

### API 端點
```
PUT https://{handle}.myshopline.com/admin/openapi/v20260301/orders/{order_id}.json
```

### 可更新的欄位（基於官方文件）

根據用戶提供的 create order sample，以下欄位可能可更新：

#### 1. 訂單標籤 (tags)
```json
{
  "order": {
    "tags": "Updated_Tag"
  }
}
```

#### 2. 訂單備註 (note_attributes)
```json
{
  "order": {
    "note_attributes": [
      {
        "name": "API_REMARK",
        "value": "updated remark"
      }
    ]
  }
}
```

#### 3. 價格資訊 (price_info)
```json
{
  "order": {
    "price_info": {
      "current_extra_total_discounts": "10.00",
      "taxes_included": null,
      "total_shipping_price": "10.00"
    }
  }
}
```

## 📝 測試策略

### 階段 1：建立訂單並記錄回應
1. 建立測試訂單
2. 記錄 API 回應中的所有狀態欄位
3. 記錄可用的狀態值

### 階段 2：測試更新訂單
1. 嘗試更新 tags
2. 嘗試更新 note_attributes
3. 記錄成功/失敗的更新操作

### 階段 3：文件化
1. 根據實際測試結果更新本文件
2. 記錄狀態轉換規則
3. 記錄限制和注意事項

## 🎯 實作計劃

### 初期實作（保守策略）
由於官方文件未明確列出所有可更新欄位，我們採取保守策略：

1. **建立訂單**：使用用戶提供的實測 sample
2. **查詢訂單**：實作查詢功能，觀察回應結構
3. **更新訂單**：先實作最安全的更新（tags, note_attributes）
4. **記錄結果**：根據實際測試結果更新文件

### 後續優化
根據實際測試結果，逐步增加更新功能：
- 狀態更新（如果 API 支援）
- 價格調整（如果業務需要）
- 其他欄位（根據需求）

## 📚 參考資料

### 官方文件
- **建立訂單**：https://developer.shopline.com/docs/admin-rest-api/order/order-management/create-an-order?version=v20260301
- **查詢訂單**：https://developer.shopline.com/docs/admin-rest-api/order/order-management/get-orders?version=v20260301
- **更新訂單**：https://developer.shopline.com/docs/admin-rest-api/order/order-management/update-an-order?version=v20260301

### 實測 Sample（用戶提供）
詳見：`docs/sprints/SPRINT2_ORDERS_API_SPEC.md` - "建立訂單" 章節

## 🔄 變更日誌

### 2025-10-21
- ✅ 建立訂單狀態規則文件
- ⚠️ 標註狀態值為推測，需實測驗證
- ✅ 制定測試策略
- ✅ 制定保守的實作計劃

---

**⚠️ 警告**：本文件中的狀態值為推測，必須透過實際測試驗證並更新！

**維護者**：Development Team  
**最後更新**：2025-10-21

