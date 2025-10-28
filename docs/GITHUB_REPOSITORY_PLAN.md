# GitHub 倉庫規劃

**建立日期**: 2025-01-27  
**目標**: 為新帳戶 `morris-shopline` 規劃倉庫結構  
**狀態**: 規劃完成，等待確認

---

## 🎯 推薦方案：單一倉庫

### 倉庫資訊
- **倉庫名稱**: `shopline-middleware-platform`
- **描述**: `Shopline 中台系統 - 前後端分離架構，支援多平台整合`
- **可見性**: Private
- **主要分支**: `main`
- **標籤**: `shopline`, `middleware`, `frontend`, `backend`, `typescript`, `nextjs`, `fastify`

### 目錄結構
```
shopline-middleware-platform/
├── frontend/                    # Next.js 前端
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── backend/                     # Fastify 後端
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── tsconfig.json
├── migration/                   # 遷移中介資料夾
│   ├── current-vercel/         # 現有專案備份
│   ├── shared-utils/           # 共用工具
│   └── migration-scripts/      # 遷移腳本
├── docs/                       # 文檔
│   ├── PROJECT_STATUS.md
│   ├── NEW_ACCOUNT_DEPLOYMENT_PLAN.md
│   ├── AGENT_RULES.md
│   └── ...
├── scripts/                    # 專案腳本
├── .gitignore
├── README.md
└── package.json                # 根目錄 package.json
```

---

## 🔧 根目錄配置

### package.json
```json
{
  "name": "shopline-middleware-platform",
  "version": "1.0.0",
  "description": "Shopline 中台系統 - 前後端分離架構",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:backend && npm run test:frontend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "deploy:frontend": "cd frontend && npm run build",
    "deploy:backend": "cd backend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "keywords": [
    "shopline",
    "middleware",
    "frontend",
    "backend",
    "typescript",
    "nextjs",
    "fastify"
  ],
  "author": "morris-shopline",
  "license": "MIT"
}
```

### .gitignore
```gitignore
# Vercel
.vercel

# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
.next/
out/
dist/
build/

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log

# Prisma
prisma/migrations/
```

---

## 🚀 部署配置

### Vercel 配置
- **專案名稱**: `shopline-frontend`
- **Root Directory**: `frontend`
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Render 配置
- **服務名稱**: `shopline-backend`
- **Root Directory**: `backend`
- **Runtime**: Node.js
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

## 📋 建立步驟

### 1. 建立 GitHub 倉庫
1. 訪問 https://github.com/morris-shopline
2. 點擊 "New repository"
3. 設定倉庫資訊：
   - **Repository name**: `shopline-middleware-platform`
   - **Description**: `Shopline 中台系統 - 前後端分離架構`
   - **Visibility**: Private
   - **Initialize**: 不勾選任何選項

### 2. 推送代碼
```bash
# 添加遠端倉庫
git remote add origin https://github.com/morris-shopline/shopline-middleware-platform.git

# 推送代碼
git add .
git commit -m "feat: 完成前後端分離架構重構

- 新增 Next.js 前端 (frontend/)
- 新增 Fastify 後端 (backend/)
- 新增遷移中介資料夾 (migration/)
- 完成本地測試驗證
- 新增完整文檔和部署腳本
- 更新為新帳戶配置"

git push -u origin main
```

### 3. 設定分支保護
1. 在 GitHub 倉庫設定中
2. 前往 "Branches" 頁面
3. 設定 `main` 分支保護規則
4. 要求 Pull Request 審查

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

## 📚 文檔結構

### 主要文檔
- `README.md` - 專案說明
- `docs/PROJECT_STATUS.md` - 專案狀態
- `docs/NEW_ACCOUNT_DEPLOYMENT_PLAN.md` - 部署規劃
- `docs/AGENT_RULES.md` - Agent 規則
- `docs/QUICK_START_GUIDE.md` - 快速開始

### 技術文檔
- `docs/architecture/` - 架構設計
- `docs/sprints/` - 開發計劃
- `docs/status/` - 狀態報告

### 腳本文檔
- `migration/migration-scripts/` - 部署腳本
- `scripts/` - 專案腳本

---

## 🎯 預期結果

### 倉庫功能
- ✅ 代碼統一管理
- ✅ 版本控制一致
- ✅ 部署配置簡單
- ✅ 文檔完整

### 部署結果
- **前端**: `https://shopline-frontend.vercel.app`
- **後端**: `https://shopline-backend.onrender.com`
- **文檔**: GitHub Pages (可選)

---

## 💡 建議

### 倉庫命名
- **主倉庫**: `shopline-middleware-platform`
- **前端專案**: `shopline-frontend`
- **後端專案**: `shopline-backend`

### 標籤使用
- `shopline` - 主要標籤
- `middleware` - 中台系統
- `frontend` - 前端相關
- `backend` - 後端相關
- `typescript` - 技術標籤
- `nextjs` - 前端框架
- `fastify` - 後端框架

### 分支策略
- `main` - 主要分支
- `develop` - 開發分支
- `feature/*` - 功能分支
- `hotfix/*` - 修復分支

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 規劃完成  
**下一步**: 等待確認後開始執行
