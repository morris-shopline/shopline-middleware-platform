# 新帳戶部署規劃

**建立日期**: 2025-01-27  
**目標**: 使用新帳戶部署前後端分離架構  
**狀態**: 規劃完成，等待執行

---

## 🎯 新帳戶資訊

### GitHub 帳戶
- **組織**: `morris-shopline`
- **URL**: https://github.com/morris-shopline/
- **用途**: 代碼倉庫管理

### Vercel 帳戶
- **組織**: `morris-shoplines-projects`
- **URL**: https://vercel.com/morris-shoplines-projects
- **用途**: 前端部署

### Render 帳戶
- **個人帳戶**: 使用現有或新建
- **用途**: 後端部署

---

## 📁 建議的 GitHub 專案結構

### 方案 1: 單一倉庫 (推薦)
```
morris-shopline/shopline-middleware-platform
├── frontend/          # Next.js 前端
├── backend/           # Fastify 後端
├── migration/         # 遷移中介資料夾
├── docs/              # 文檔
└── scripts/           # 部署腳本
```

**優點**:
- 代碼統一管理
- 部署配置簡單
- 版本控制一致

**缺點**:
- 倉庫較大
- 前後端耦合

### 方案 2: 分離倉庫
```
morris-shopline/shopline-frontend    # Next.js 前端
morris-shopline/shopline-backend     # Fastify 後端
morris-shopline/shopline-docs        # 文檔倉庫
```

**優點**:
- 前後端完全獨立
- 權限管理靈活
- 部署更靈活

**缺點**:
- 管理複雜
- 版本同步困難

---

## 🚀 推薦部署方案

### 方案 1: 單一倉庫 + 分離部署 (推薦)

#### GitHub 倉庫設定
- **倉庫名稱**: `shopline-middleware-platform`
- **描述**: `Shopline 中台系統 - 前後端分離架構`
- **可見性**: Private
- **分支策略**: `main` 分支

#### Vercel 部署設定
- **專案名稱**: `shopline-frontend`
- **Root Directory**: `frontend`
- **Framework**: Next.js
- **環境變數**: 
  ```bash
  NEXT_PUBLIC_API_BASE_URL=https://shopline-backend.onrender.com
  NODE_ENV=production
  ```

#### Render 部署設定
- **服務名稱**: `shopline-backend`
- **Root Directory**: `backend`
- **Runtime**: Node.js
- **環境變數**: 完整的後端配置

---

## 📋 部署檢查清單

### GitHub 設定
- [ ] 建立新倉庫 `morris-shopline/shopline-middleware-platform`
- [ ] 設定倉庫描述和標籤
- [ ] 配置分支保護規則
- [ ] 設定 GitHub Actions (可選)

### Vercel 設定
- [ ] 連接 GitHub 倉庫
- [ ] 設定 Root Directory 為 `frontend`
- [ ] 配置環境變數
- [ ] 設定自定義域名 (可選)

### Render 設定
- [ ] 建立 Web Service
- [ ] 建立 PostgreSQL 資料庫
- [ ] 建立 Redis 實例
- [ ] 配置環境變數
- [ ] 設定健康檢查

### 整合測試
- [ ] 測試後端 API
- [ ] 測試前端連接
- [ ] 測試前後端通信
- [ ] 驗證所有功能

---

## 🔧 環境變數配置

### 前端環境變數 (Vercel)
```bash
NEXT_PUBLIC_API_BASE_URL=https://shopline-backend.onrender.com
NODE_ENV=production
```

### 後端環境變數 (Render)
```bash
# 基本設定
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
LOG_LEVEL=info

# 資料庫
DATABASE_URL=<PostgreSQL 連接字串>
DB_MAX_CONNECTIONS=10
DB_SSL=true

# Redis
REDIS_URL=<Redis 連接字串>

# JWT
JWT_SECRET=<隨機生成的密鑰>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://shopline-frontend.vercel.app

# Shopline
SHOPLINE_APP_KEY=4c951e966557c8374d9a61753dfe3c52441aba3b
SHOPLINE_APP_SECRET=dd46269d6920f49b07e810862d3093062b0fb858
SHOPLINE_SHOP_HANDLE=paykepoc
SHOPLINE_BASE_URL=https://paykepoc.myshopline.com
SHOPLINE_WEBHOOK_SECRET=<隨機生成的密鑰>
```

---

## 📚 文檔更新

### 需要更新的文件
- [x] `.gitignore` - 更新忽略規則
- [x] `PROJECT_STATUS.md` - 更新帳戶資訊
- [x] `NEW_ACCOUNT_DEPLOYMENT_PLAN.md` - 新建部署規劃
- [ ] `README.md` - 更新專案說明
- [ ] 部署腳本 - 更新帳戶資訊

### 新增的文件
- [x] `LOCAL_TEST_REPORT.md` - 本地測試報告
- [x] `FINAL_MIGRATION_SUMMARY.md` - 遷移總結
- [x] `QUICK_START_GUIDE.md` - 快速開始指南

---

## 🎯 下一步行動

### 立即可做
1. **確認 GitHub 倉庫名稱**
2. **建立新的 GitHub 倉庫**
3. **推送代碼到新倉庫**
4. **設定 Vercel 和 Render**

### 後續優化
1. **設定 CI/CD 流程**
2. **配置監控和告警**
3. **優化性能**
4. **添加更多功能**

---

## 💡 建議

### 倉庫命名建議
- **主倉庫**: `shopline-middleware-platform`
- **前端專案**: `shopline-frontend`
- **後端專案**: `shopline-backend`

### 域名建議
- **前端**: `shopline-platform.vercel.app`
- **後端**: `shopline-backend.onrender.com`
- **自定義域名**: `platform.shopline.com` (可選)

### 標籤建議
- `shopline`
- `middleware`
- `frontend`
- `backend`
- `typescript`
- `nextjs`
- `fastify`

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 規劃完成  
**下一步**: 等待確認後開始執行
