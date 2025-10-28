# 快速開始指南

**目標**: 快速啟動新的前後端分離架構  
**預計時間**: 30 分鐘  
**狀態**: 準備就緒

---

## 🚀 快速啟動步驟

### 1. 環境準備 (5 分鐘)

#### 檢查 Node.js 版本
```bash
node --version  # 需要 >= 18.0.0
npm --version   # 需要 >= 8.0.0
```

#### 安裝依賴
```bash
# 後端依賴
cd backend
npm install

# 前端依賴
cd ../frontend
npm install
```

### 2. 後端啟動 (10 分鐘)

#### 設定環境變數
```bash
cd backend
cp env.example .env
# 編輯 .env 檔案，至少設定以下變數：
# DATABASE_URL=postgresql://username:password@localhost:5432/shopline_backend
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key
```

#### 啟動後端服務
```bash
# 開發模式
npm run dev

# 或建置後啟動
npm run build
npm start
```

#### 驗證後端
```bash
# 健康檢查
curl http://localhost:3001/health

# 詳細健康檢查
curl http://localhost:3001/health/detailed
```

### 3. 前端啟動 (10 分鐘)

#### 設定環境變數
```bash
cd frontend
cp env.example .env.local
# 編輯 .env.local 檔案：
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

#### 啟動前端服務
```bash
# 開發模式
npm run dev
```

#### 驗證前端
訪問 [http://localhost:3000](http://localhost:3000) 查看應用

### 4. 執行測試 (5 分鐘)

#### 後端測試
```bash
cd migration/migration-scripts
node test-backend.js
```

#### 前端測試
```bash
node test-frontend.js
```

---

## 🔧 環境變數配置

### 後端環境變數 (.env)
```bash
# 基本設定
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info

# 資料庫
DATABASE_URL=postgresql://username:password@localhost:5432/shopline_backend
DB_MAX_CONNECTIONS=10
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Shopline (使用現有值)
SHOPLINE_APP_KEY=4c951e966557c8374d9a61753dfe3c52441aba3b
SHOPLINE_APP_SECRET=dd46269d6920f49b07e810862d3093062b0fb858
SHOPLINE_SHOP_HANDLE=paykepoc
SHOPLINE_BASE_URL=https://paykepoc.myshopline.com
```

### 前端環境變數 (.env.local)
```bash
# API 基礎 URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# 環境設定
NODE_ENV=development
```

---

## 📊 驗證清單

### 後端驗證
- [ ] 服務啟動成功 (http://localhost:3001)
- [ ] 健康檢查通過 (/health)
- [ ] 詳細健康檢查通過 (/health/detailed)
- [ ] 事件 API 正常 (/api/events)
- [ ] 認證 API 正常 (/api/auth)

### 前端驗證
- [ ] 頁面載入成功 (http://localhost:3000)
- [ ] 系統狀態顯示正常
- [ ] 後端連接正常
- [ ] 響應式設計正常
- [ ] 環境資訊顯示正確

### 整合驗證
- [ ] 前後端通信正常
- [ ] API 客戶端功能正常
- [ ] 錯誤處理正常
- [ ] 日誌記錄正常

---

## 🛠️ 故障排除

### 常見問題

#### 1. 後端啟動失敗
```bash
# 檢查端口是否被占用
lsof -i :3001

# 檢查環境變數
cat backend/.env

# 檢查依賴
cd backend && npm list
```

#### 2. 前端啟動失敗
```bash
# 檢查端口是否被占用
lsof -i :3000

# 檢查環境變數
cat frontend/.env.local

# 檢查依賴
cd frontend && npm list
```

#### 3. 資料庫連接失敗
```bash
# 檢查 PostgreSQL 是否運行
brew services list | grep postgresql

# 檢查資料庫連接
psql $DATABASE_URL
```

#### 4. Redis 連接失敗
```bash
# 檢查 Redis 是否運行
brew services list | grep redis

# 檢查 Redis 連接
redis-cli ping
```

### 日誌查看

#### 後端日誌
```bash
# 開發模式日誌
cd backend && npm run dev

# 生產模式日誌
cd backend && npm start
```

#### 前端日誌
```bash
# 開發模式日誌
cd frontend && npm run dev

# 建置日誌
cd frontend && npm run build
```

---

## 📚 進階配置

### 資料庫設定
```bash
# 建立資料庫
createdb shopline_backend

# 執行遷移
cd backend && npx prisma migrate dev

# 查看資料庫
npx prisma studio
```

### Redis 設定
```bash
# 啟動 Redis
brew services start redis

# 檢查 Redis 狀態
redis-cli info
```

### 監控設定
```bash
# 啟用詳細日誌
export LOG_LEVEL=debug

# 啟用監控
export MONITORING_ENABLED=true
```

---

## 🎯 下一步

### 開發模式
1. 開始開發新功能
2. 使用現有的 API 客戶端
3. 參考現有的代碼結構

### 生產部署
1. 完成環境設定
2. 執行部署腳本
3. 驗證生產環境

### 功能擴展
1. 添加新的 API 端點
2. 建立新的前端頁面
3. 整合更多第三方服務

---

## 📞 支援

### 文檔資源
- [專案現況](./PROJECT_STATUS.md)
- [遷移狀態報告](./MIGRATION_STATUS_REPORT.md)
- [漸進式遷移計劃](./sprints/SPRINT_GRADUAL_MIGRATION.md)

### 技術支援
- 檢查日誌檔案
- 執行測試腳本
- 參考錯誤處理指南

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 準備就緒  
**預計完成時間**: 30 分鐘
