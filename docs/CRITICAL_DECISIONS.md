# 關鍵決策記錄

**建立日期**: 2025-01-27  
**用途**: 記錄用戶的重要決策，避免 AI Agent 翻臉不認帳

---

## 🚨 2025-01-27 重要決策

### 決策 1: 新帳戶使用
- **GitHub 組織**: `morris-shopline`
- **Vercel 組織**: `morris-shoplines-projects`
- **專案名稱**: `shopline-middleware-platform`
- **可見性**: Public

### 決策 2: 前後端分離架構
- **前端**: Next.js 14 + TypeScript (部署於 Vercel)
- **後端**: Fastify + TypeScript (部署於 Render)
- **資料庫**: PostgreSQL (Render)
- **快取**: Redis (Render)

### 決策 3: GitHub 倉庫內容限制
**🚨 用戶明確指示**: 只推送前後端分離架構相關檔案，不要推送舊專案檔案污染新倉庫

#### ✅ 應該推送的檔案
- `frontend/` - 新的 Next.js 前端
- `backend/` - 新的 Fastify 後端
- `docs/` - 新的文檔
- `package.json` - 根目錄配置
- `.gitignore` - 忽略規則
- `README.md` - 專案說明

#### ❌ 不應該推送的檔案
- `api/` - 舊的 Vercel API
- `config/` - 舊的配置
- `connectors/` - 舊的連接器
- `core/` - 舊的核心
- `data/` - 舊的資料
- `engines/` - 舊的引擎
- `local/` - 本地檔案
- `migration/` - 遷移中介 (只是本地概念)
- `public/` - 舊的靜態檔案
- `routes/` - 舊的路由
- `scripts/` - 舊的腳本
- `tests/` - 舊的測試
- `utils/` - 舊的工具
- `views/` - 舊的視圖
- `server.js` - 舊的伺服器
- `vercel.json` - 舊的 Vercel 配置
- `GUIDE.md` - 舊的指南
- `config.json` - 舊的配置
- `.env*` - 環境變數檔案

### 決策 4: Git 認證方式
- **使用 GitHub CLI**: `gh auth login`
- **用戶資訊**: `morris-shopline` / `morris.li@shopline.com`
- **推送方式**: 使用 Personal Access Token

### 決策 5: 倉庫清理策略
- **問題**: 初始推送時錯誤地包含了舊專案檔案
- **解決方案**: 更新 `.gitignore` 忽略所有舊檔案
- **後續**: 考慮刪除重建倉庫以獲得乾淨的 Git 歷史

---

## 📋 執行檢查清單

### 每次推送前檢查
- [ ] 只包含 `frontend/`, `backend/`, `docs/` 目錄
- [ ] 不包含任何舊專案檔案
- [ ] `.gitignore` 已正確設定
- [ ] 使用正確的 Git 認證

### 部署前檢查
- [ ] Vercel 設定 Root Directory 為 `frontend`
- [ ] Render 設定 Root Directory 為 `backend`
- [ ] 環境變數正確設定

---

## 🎯 重要提醒

### 對 AI Agent 的警告
1. **不要推送舊專案檔案** - 用戶已明確指示
2. **migration/ 只是本地概念** - 不要推送到 GitHub
3. **保持倉庫純淨** - 只包含前後端分離架構
4. **記住這些決策** - 不要翻臉不認帳

### 用戶期望
- 乾淨的 GitHub 倉庫
- 純淨的前後端分離架構
- 沒有舊專案檔案污染
- 清晰的 Git 歷史

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 生效  
**重要性**: 🚨 最高優先級
