# Agent 規則和優先文件

**建立日期**: 2025-01-27  
**用途**: 為 AI Agent 提供優先閱讀和遵循的規則

---

## 🎯 專案基本資訊

### 帳戶資訊
- **GitHub 組織**: `morris-shopline`
- **Vercel 組織**: `morris-shoplines-projects`
- **專案名稱**: `shopline-middleware-platform`

### 架構資訊
- **前端**: Next.js 14 + TypeScript (部署於 Vercel)
- **後端**: Fastify + TypeScript (部署於 Render)
- **資料庫**: PostgreSQL (Render)
- **快取**: Redis (Render)
- **現有專案**: 保持運行，逐步遷移

---

## 📚 優先閱讀文件

### 1. 核心狀態文件
1. **`docs/PROJECT_STATUS.md`** - 專案當前狀態
2. **`docs/NEW_ACCOUNT_DEPLOYMENT_PLAN.md`** - 新帳戶部署規劃
3. **`docs/LOCAL_TEST_REPORT.md`** - 本地測試報告

### 2. 架構文件
1. **`docs/sprints/SPRINT_GRADUAL_MIGRATION.md`** - 漸進式遷移計劃
2. **`docs/architecture/FRONTEND_ARCHITECTURE_V2.md`** - 前端架構
3. **`docs/architecture/BACKEND_ARCHITECTURE_V2.md`** - 後端架構

### 3. 實施指南
1. **`docs/QUICK_START_GUIDE.md`** - 快速開始指南
2. **`docs/FINAL_MIGRATION_SUMMARY.md`** - 遷移總結
3. **`migration/migration-scripts/`** - 部署腳本

---

## 🔧 技術規則

### 代碼規範
- **語言**: 優先使用 TypeScript
- **前端**: Next.js 14 + Tailwind CSS
- **後端**: Fastify + Prisma
- **樣式**: 無分號，使用 Tailwind CSS
- **API**: 使用 fetch API，不使用 axios

### 文件規範
- **響應語言**: 繁體中文
- **代碼引用**: 使用 `startLine:endLine:filepath` 格式
- **文件更新**: 每次修改後更新相關文檔

### 部署規範
- **前端**: Vercel (morris-shoplines-projects)
- **後端**: Render
- **資料庫**: PostgreSQL (Render)
- **環境變數**: 使用 `.env.example` 範本

---

## 🚨 重要規則

### 1. 檔案處理規則
- **永遠不要刪除現有檔案**，除非用戶明確確認
- **建立新檔案時**，使用唯一名稱避免衝突
- **修改現有檔案時**，先備份再修改
- **🚨 重要決策記錄**: 2025-01-27 用戶明確指示只推送前後端分離架構，不要推送舊專案檔案污染新倉庫

### 2. 專案結構規則
- **前端代碼**: 放在 `frontend/` 目錄
- **後端代碼**: 放在 `backend/` 目錄
- **文檔**: 放在 `docs/` 目錄
- **🚨 重要**: migration/ 目錄只是本地概念，不要推送到 GitHub
- **🚨 重要**: 舊專案檔案 (api/, config/, connectors/, core/, data/, engines/, public/, routes/, scripts/, tests/, utils/, views/, server.js, vercel.json 等) 全部忽略，不要推送

### 3. 環境變數規則
- **前端**: 使用 `NEXT_PUBLIC_` 前綴
- **後端**: 使用標準環境變數名稱
- **敏感資訊**: 不要硬編碼在代碼中

### 4. 測試規則
- **本地測試**: 必須通過所有測試
- **部署前**: 必須驗證環境變數
- **功能測試**: 必須測試前後端連接

---

## 📋 檢查清單

### 每次修改後檢查
- [ ] 代碼語法正確
- [ ] 類型定義完整
- [ ] 環境變數正確
- [ ] 文檔更新
- [ ] 測試通過

### 部署前檢查
- [ ] 所有檔案已提交
- [ ] 環境變數已設定
- [ ] 測試腳本通過
- [ ] 文檔完整

---

## 🎯 優先任務

### 當前階段 (Phase 1)
1. **完成新帳戶設定**
2. **建立 GitHub 倉庫**
3. **設定 Vercel 和 Render**
4. **驗證部署**

### 後續階段 (Phase 2+)
1. **完善功能實現**
2. **優化性能**
3. **添加監控**
4. **擴展功能**

---

## 📞 支援資訊

### 重要文件位置
- **專案狀態**: `docs/PROJECT_STATUS.md`
- **部署規劃**: `docs/NEW_ACCOUNT_DEPLOYMENT_PLAN.md`
- **快速開始**: `docs/QUICK_START_GUIDE.md`
- **測試報告**: `docs/LOCAL_TEST_REPORT.md`

### 腳本位置
- **後端測試**: `migration/migration-scripts/test-backend.js`
- **前端測試**: `migration/migration-scripts/test-frontend.js`
- **部署腳本**: `migration/migration-scripts/deploy-*.js`

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 生效  
**更新頻率**: 每次重大變更時更新
