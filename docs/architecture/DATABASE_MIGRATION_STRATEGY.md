# 資料庫遷移策略 - 前後端分離

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**目標**: 規劃前後端分離後的資料庫架構和遷移策略  
**狀態**: 規劃階段

---

## 🎯 遷移目標

### 當前狀況
- **資料庫**: Vercel Postgres (Prisma Postgres)
- **位置**: Vercel 平台
- **用途**: 儲存 OAuth tokens 和事件資料
- **連接**: 僅後端可連接

### 目標狀況
- **資料庫**: 維持 Vercel Postgres 或遷移到外部資料庫
- **連接**: 後端主要連接，前端可選直接連接
- **用途**: 擴展支援更多資料類型
- **效能**: 優化查詢效能和連接池管理

---

## 📊 資料庫選項分析

### 選項 1: 維持 Vercel Postgres

#### 優點
- ✅ **無需遷移**: 現有資料和設定保持不變
- ✅ **成本效益**: 免費方案足夠初期使用
- ✅ **整合度高**: 與 Vercel 生態系統整合良好
- ✅ **自動備份**: Vercel 提供自動備份
- ✅ **零停機**: 不影響現有服務

#### 缺點
- ❌ **平台綁定**: 依賴 Vercel 平台
- ❌ **擴展限制**: 免費方案有連接數和儲存限制
- ❌ **前端限制**: 前端無法直接連接
- ❌ **遷移複雜**: 未來遷移會更困難

#### 適用場景
- 專案規模較小
- 預算有限
- 快速上線需求
- 團隊熟悉 Vercel 生態

### 選項 2: 遷移到 Render Postgres

#### 優點
- ✅ **平台獨立**: 不依賴特定平台
- ✅ **成本透明**: 明確的定價模式
- ✅ **效能更好**: 專用資料庫實例
- ✅ **擴展性強**: 支援更大的連接數和儲存
- ✅ **管理方便**: 統一的平台管理

#### 缺點
- ❌ **需要遷移**: 資料遷移和設定調整
- ❌ **成本增加**: 需要付費方案
- ❌ **停機風險**: 遷移過程可能影響服務
- ❌ **學習成本**: 需要熟悉 Render 平台

#### 適用場景
- 專案規模中等
- 需要更好的效能
- 計劃長期發展
- 團隊有技術能力

### 選項 3: 遷移到外部雲端資料庫

#### 選項 3A: AWS RDS / Google Cloud SQL / Azure Database

#### 優點
- ✅ **企業級**: 高可用性和可靠性
- ✅ **效能最佳**: 專用硬體資源
- ✅ **功能豐富**: 完整的資料庫功能
- ✅ **擴展性強**: 支援大規模應用
- ✅ **備份恢復**: 專業的備份和恢復方案

#### 缺點
- ❌ **成本最高**: 需要付費使用
- ❌ **複雜度高**: 設定和管理複雜
- ❌ **過度設計**: 對小型專案來說過於複雜

#### 選項 3B: Supabase / PlanetScale / Neon

#### 優點
- ✅ **現代化**: 基於 PostgreSQL 的現代化平台
- ✅ **開發者友好**: 優秀的開發者體驗
- ✅ **功能豐富**: 內建認證、即時功能等
- ✅ **成本合理**: 免費方案 + 合理定價
- ✅ **生態整合**: 與現代前端框架整合良好

#### 缺點
- ❌ **新興平台**: 相對較新的服務
- ❌ **學習成本**: 需要學習新的工具和概念
- ❌ **依賴風險**: 依賴第三方服務

---

## 🎯 推薦方案

### 階段性遷移策略

#### 階段 1: 維持現狀 (立即執行)
- **時間**: 1-2 週
- **目標**: 完成前後端分離，維持現有資料庫
- **風險**: 低
- **成本**: 無

**實施步驟**:
1. 重構後端代碼，適配 Vercel Postgres
2. 確保所有 API 端點正常運作
3. 測試資料庫連接和查詢效能
4. 監控系統穩定性和效能

#### 階段 2: 評估和準備 (1-2 個月後)
- **時間**: 1-2 週
- **目標**: 評估是否需要遷移資料庫
- **風險**: 低
- **成本**: 無

**評估指標**:
- 資料庫連接數使用率
- 查詢效能表現
- 儲存空間使用率
- 業務增長預期
- 成本效益分析

#### 階段 3: 遷移執行 (如需要)
- **時間**: 1-2 週
- **目標**: 遷移到更適合的資料庫平台
- **風險**: 中
- **成本**: 根據選擇的平台而定

---

## 📋 詳細遷移計劃

### 階段 1: 維持 Vercel Postgres

#### 1.1 後端適配

```javascript
// config/database.js
const { Pool } = require('pg')

class DatabaseConfig {
  constructor() {
    this.pool = null
    this.init()
  }

  init() {
    const connectionString = process.env.POSTGRES_URL
    
    if (!connectionString) {
      throw new Error('POSTGRES_URL 環境變數未設定')
    }

    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // 最大連接數
      idleTimeoutMillis: 30000, // 空閒超時
      connectionTimeoutMillis: 2000, // 連接超時
    })

    // 監聽連接錯誤
    this.pool.on('error', (err) => {
      console.error('資料庫連接錯誤:', err)
    })
  }

  async query(text, params) {
    const start = Date.now()
    try {
      const result = await this.pool.query(text, params)
      const duration = Date.now() - start
      console.log('查詢執行時間:', duration, 'ms')
      return result
    } catch (error) {
      console.error('資料庫查詢錯誤:', error)
      throw error
    }
  }

  async getClient() {
    return await this.pool.connect()
  }

  async close() {
    if (this.pool) {
      await this.pool.end()
    }
  }
}

module.exports = new DatabaseConfig()
```

#### 1.2 資料庫服務適配

```javascript
// services/databaseService.js
const db = require('../config/database')
const logger = require('../utils/logger')

class DatabaseService {
  /**
   * 儲存 Token
   */
  async saveToken(shopHandle, tokenData) {
    const query = `
      INSERT INTO oauth_tokens (
        shop_handle, 
        access_token, 
        refresh_token, 
        expires_at, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (shop_handle) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
      RETURNING *
    `
    
    const values = [
      shopHandle,
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_at
    ]

    try {
      const result = await db.query(query, values)
      logger.info('Token 儲存成功', { shopHandle })
      return result.rows[0]
    } catch (error) {
      logger.error('Token 儲存失敗', { error: error.message, shopHandle })
      throw error
    }
  }

  /**
   * 獲取 Token
   */
  async getToken(shopHandle) {
    const query = 'SELECT * FROM oauth_tokens WHERE shop_handle = $1'
    
    try {
      const result = await db.query(query, [shopHandle])
      return result.rows[0] || null
    } catch (error) {
      logger.error('Token 獲取失敗', { error: error.message, shopHandle })
      throw error
    }
  }

  /**
   * 根據 Access Token 獲取 Token 資料
   */
  async getTokenByAccessToken(accessToken) {
    const query = 'SELECT * FROM oauth_tokens WHERE access_token = $1'
    
    try {
      const result = await db.query(query, [accessToken])
      return result.rows[0] || null
    } catch (error) {
      logger.error('根據 Access Token 獲取失敗', { error: error.message })
      throw error
    }
  }

  /**
   * 刪除 Token
   */
  async deleteToken(shopHandle) {
    const query = 'DELETE FROM oauth_tokens WHERE shop_handle = $1'
    
    try {
      const result = await db.query(query, [shopHandle])
      logger.info('Token 刪除成功', { shopHandle })
      return result.rowCount > 0
    } catch (error) {
      logger.error('Token 刪除失敗', { error: error.message, shopHandle })
      throw error
    }
  }

  /**
   * 儲存事件
   */
  async saveEvent(eventData) {
    const query = `
      INSERT INTO events (
        id,
        type,
        source,
        data,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `
    
    const values = [
      eventData.id,
      eventData.type,
      eventData.source,
      JSON.stringify(eventData.data)
    ]

    try {
      const result = await db.query(query, values)
      return result.rows[0]
    } catch (error) {
      logger.error('事件儲存失敗', { error: error.message, eventData })
      throw error
    }
  }

  /**
   * 獲取事件列表
   */
  async getEvents(params = {}) {
    const { page = 1, limit = 50, type, source } = params
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM events WHERE 1=1'
    const values = []
    let paramIndex = 1

    if (type) {
      query += ` AND type = $${paramIndex}`
      values.push(type)
      paramIndex++
    }

    if (source) {
      query += ` AND source = $${paramIndex}`
      values.push(source)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    try {
      const result = await db.query(query, values)
      return result.rows
    } catch (error) {
      logger.error('事件列表獲取失敗', { error: error.message, params })
      throw error
    }
  }
}

module.exports = new DatabaseService()
```

#### 1.3 環境變數配置

```bash
# .env.example
# 資料庫配置
POSTGRES_URL=postgres://username:password@host:port/database

# 應用配置
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Shopline 配置
APP_KEY=your_app_key
APP_SECRET=your_app_secret
SHOP_HANDLE=your_shop_handle
SHOP_URL=https://your-shop.myshopline.com/

# 日誌配置
LOG_LEVEL=info
```

### 階段 2: 資料庫遷移 (如需要)

#### 2.1 遷移準備

```javascript
// scripts/migrate-database.js
const { Pool: SourcePool } = require('pg')
const { Pool: TargetPool } = require('pg')

class DatabaseMigrator {
  constructor() {
    this.sourcePool = new Pool({
      connectionString: process.env.SOURCE_POSTGRES_URL
    })
    
    this.targetPool = new Pool({
      connectionString: process.env.TARGET_POSTGRES_URL
    })
  }

  /**
   * 執行完整遷移
   */
  async migrate() {
    try {
      console.log('開始資料庫遷移...')
      
      // 1. 建立目標資料庫結構
      await this.createTargetSchema()
      
      // 2. 遷移 OAuth Tokens
      await this.migrateOAuthTokens()
      
      // 3. 遷移事件資料
      await this.migrateEvents()
      
      // 4. 驗證遷移結果
      await this.validateMigration()
      
      console.log('資料庫遷移完成!')
    } catch (error) {
      console.error('資料庫遷移失敗:', error)
      throw error
    } finally {
      await this.close()
    }
  }

  /**
   * 建立目標資料庫結構
   */
  async createTargetSchema() {
    console.log('建立目標資料庫結構...')
    
    const createTables = `
      -- OAuth Tokens 表
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        id SERIAL PRIMARY KEY,
        shop_handle VARCHAR(255) UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 事件表
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        source VARCHAR(100) NOT NULL,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- 建立索引
      CREATE INDEX IF NOT EXISTS idx_oauth_tokens_shop_handle ON oauth_tokens(shop_handle);
      CREATE INDEX IF NOT EXISTS idx_oauth_tokens_access_token ON oauth_tokens(access_token);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
      CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    `

    await this.targetPool.query(createTables)
    console.log('目標資料庫結構建立完成')
  }

  /**
   * 遷移 OAuth Tokens
   */
  async migrateOAuthTokens() {
    console.log('遷移 OAuth Tokens...')
    
    const sourceResult = await this.sourcePool.query('SELECT * FROM oauth_tokens')
    const tokens = sourceResult.rows

    for (const token of tokens) {
      const insertQuery = `
        INSERT INTO oauth_tokens (
          shop_handle, access_token, refresh_token, expires_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (shop_handle) DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          updated_at = EXCLUDED.updated_at
      `
      
      await this.targetPool.query(insertQuery, [
        token.shop_handle,
        token.access_token,
        token.refresh_token,
        token.expires_at,
        token.created_at,
        token.updated_at
      ])
    }

    console.log(`OAuth Tokens 遷移完成: ${tokens.length} 筆記錄`)
  }

  /**
   * 遷移事件資料
   */
  async migrateEvents() {
    console.log('遷移事件資料...')
    
    const sourceResult = await this.sourcePool.query('SELECT * FROM events ORDER BY created_at')
    const events = sourceResult.rows

    for (const event of events) {
      const insertQuery = `
        INSERT INTO events (id, type, source, data, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `
      
      await this.targetPool.query(insertQuery, [
        event.id,
        event.type,
        event.source,
        event.data,
        event.created_at
      ])
    }

    console.log(`事件資料遷移完成: ${events.length} 筆記錄`)
  }

  /**
   * 驗證遷移結果
   */
  async validateMigration() {
    console.log('驗證遷移結果...')
    
    // 驗證 OAuth Tokens
    const sourceTokens = await this.sourcePool.query('SELECT COUNT(*) FROM oauth_tokens')
    const targetTokens = await this.targetPool.query('SELECT COUNT(*) FROM oauth_tokens')
    
    if (sourceTokens.rows[0].count !== targetTokens.rows[0].count) {
      throw new Error('OAuth Tokens 數量不匹配')
    }

    // 驗證事件資料
    const sourceEvents = await this.sourcePool.query('SELECT COUNT(*) FROM events')
    const targetEvents = await this.targetPool.query('SELECT COUNT(*) FROM events')
    
    if (sourceEvents.rows[0].count !== targetEvents.rows[0].count) {
      throw new Error('事件資料數量不匹配')
    }

    console.log('遷移驗證通過!')
  }

  /**
   * 關閉連接
   */
  async close() {
    await this.sourcePool.end()
    await this.targetPool.end()
  }
}

// 執行遷移
if (require.main === module) {
  const migrator = new DatabaseMigrator()
  migrator.migrate().catch(console.error)
}

module.exports = DatabaseMigrator
```

#### 2.2 遷移腳本

```bash
#!/bin/bash
# migrate.sh

echo "開始資料庫遷移..."

# 設定環境變數
export SOURCE_POSTGRES_URL="postgres://source_user:source_pass@source_host:5432/source_db"
export TARGET_POSTGRES_URL="postgres://target_user:target_pass@target_host:5432/target_db"

# 執行遷移
node scripts/migrate-database.js

echo "資料庫遷移完成!"
```

---

## 📊 效能監控

### 資料庫效能指標

```javascript
// utils/databaseMonitor.js
const db = require('../config/database')
const logger = require('./logger')

class DatabaseMonitor {
  constructor() {
    this.metrics = {
      queryCount: 0,
      totalQueryTime: 0,
      errorCount: 0,
      connectionCount: 0
    }
  }

  /**
   * 記錄查詢指標
   */
  recordQuery(duration, error = null) {
    this.metrics.queryCount++
    this.metrics.totalQueryTime += duration
    
    if (error) {
      this.metrics.errorCount++
    }
  }

  /**
   * 獲取效能指標
   */
  getMetrics() {
    const avgQueryTime = this.metrics.queryCount > 0 
      ? this.metrics.totalQueryTime / this.metrics.queryCount 
      : 0

    return {
      ...this.metrics,
      avgQueryTime,
      errorRate: this.metrics.queryCount > 0 
        ? this.metrics.errorCount / this.metrics.queryCount 
        : 0
    }
  }

  /**
   * 重置指標
   */
  reset() {
    this.metrics = {
      queryCount: 0,
      totalQueryTime: 0,
      errorCount: 0,
      connectionCount: 0
    }
  }

  /**
   * 定期報告
   */
  startReporting(intervalMs = 60000) {
    setInterval(() => {
      const metrics = this.getMetrics()
      logger.info('資料庫效能指標', metrics)
      
      // 如果錯誤率過高，發送告警
      if (metrics.errorRate > 0.1) {
        logger.warn('資料庫錯誤率過高', { errorRate: metrics.errorRate })
      }
      
      // 如果平均查詢時間過長，發送告警
      if (metrics.avgQueryTime > 1000) {
        logger.warn('資料庫查詢時間過長', { avgQueryTime: metrics.avgQueryTime })
      }
    }, intervalMs)
  }
}

module.exports = new DatabaseMonitor()
```

---

## 🚨 風險評估和緩解

### 高風險項目

#### 1. 資料遺失風險
- **風險**: 遷移過程中可能導致資料遺失
- **緩解**: 
  - 完整備份源資料庫
  - 分階段遷移
  - 詳細的驗證流程
  - 回滾計劃

#### 2. 服務中斷風險
- **風險**: 遷移過程可能導致服務中斷
- **緩解**:
  - 維護模式
  - 藍綠部署
  - 逐步切換
  - 監控和告警

#### 3. 效能下降風險
- **風險**: 新資料庫可能效能不如預期
- **緩解**:
  - 效能測試
  - 監控指標
  - 優化查詢
  - 連接池調優

### 中風險項目

#### 1. 配置複雜度
- **風險**: 新資料庫配置可能更複雜
- **緩解**: 詳細的文件和測試

#### 2. 學習成本
- **風險**: 團隊需要學習新的資料庫平台
- **緩解**: 培訓和文件

---

## 📋 檢查清單

### 遷移前檢查
- [ ] 完整備份源資料庫
- [ ] 測試遷移腳本
- [ ] 準備回滾計劃
- [ ] 設定監控和告警
- [ ] 通知相關人員

### 遷移中檢查
- [ ] 監控遷移進度
- [ ] 檢查資料完整性
- [ ] 驗證服務可用性
- [ ] 記錄所有操作

### 遷移後檢查
- [ ] 驗證所有功能正常
- [ ] 檢查效能指標
- [ ] 更新文件
- [ ] 清理舊資源
- [ ] 團隊培訓

---

## 📈 成功指標

### 技術指標
- [ ] 資料完整性 100%
- [ ] 查詢效能提升 > 20%
- [ ] 錯誤率 < 0.1%
- [ ] 可用性 > 99.9%

### 業務指標
- [ ] 零資料遺失
- [ ] 零服務中斷
- [ ] 用戶體驗無影響
- [ ] 成本控制在預算內

---

**版本**: 1.0.0  
**建立日期**: 2025-01-27  
**狀態**: 規劃完成  
**下一步**: 建立詳細的遷移時程
