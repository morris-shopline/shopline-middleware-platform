# 前端架構設計 V2 - 前後端分離

**版本**: 2.0.0  
**建立日期**: 2025-01-27  
**目標**: 純靜態前端，部署在 Vercel  
**狀態**: 設計階段

---

## 🎯 設計目標

### 核心原則
- **純靜態**: 無需 serverless functions
- **快速載入**: 優化資源載入速度
- **模組化**: 清晰的代碼組織
- **可維護**: 易於理解和修改

### 技術選型
- **託管平台**: Vercel (靜態託管)
- **前端框架**: 原生 JavaScript (Vanilla JS)
- **樣式**: Tailwind CSS
- **HTTP 客戶端**: Fetch API
- **狀態管理**: 簡單的狀態管理方案

---

## 🏗️ 目錄結構

```
frontend/
├── public/
│   ├── index.html                    # 主頁面
│   ├── callback.html                 # OAuth 回調頁面
│   ├── css/
│   │   ├── style.css                # 主要樣式
│   │   └── components.css           # 組件樣式
│   ├── js/
│   │   ├── app.js                   # 主應用邏輯
│   │   ├── api-client.js            # API 客戶端
│   │   ├── auth-manager.js          # 認證管理
│   │   ├── state-manager.js         # 狀態管理
│   │   └── components/              # UI 組件
│   │       ├── ShopInfo.js          # 商店資訊組件
│   │       ├── ProductList.js       # 商品列表組件
│   │       ├── OrderManager.js      # 訂單管理組件
│   │       └── EventMonitor.js      # 事件監控組件
│   └── assets/                      # 靜態資源
│       ├── images/
│       └── icons/
├── vercel.json                      # Vercel 配置
├── package.json                     # 前端依賴
└── README.md                        # 前端說明文件
```

---

## 🔧 核心模組設計

### 1. API 客戶端 (api-client.js)

```javascript
/**
 * API 客戶端 - 負責與後端通訊
 */
class APIClient {
  constructor() {
    this.baseURL = this.getBaseURL()
    this.timeout = 10000 // 10 秒超時
  }

  /**
   * 根據環境獲取後端 URL
   */
  getBaseURL() {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001'  // 本地開發
    }
    return 'https://shopline-backend.onrender.com'  // 生產環境
  }

  /**
   * 統一的 HTTP 請求方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }
      
      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new APIError('請求超時', 408)
      }
      throw error
    }
  }

  // 認證相關 API
  async authorize(code, state) {
    return this.request('/api/auth/authorize', {
      method: 'POST',
      body: JSON.stringify({ code, state })
    })
  }

  async refreshToken(refreshToken) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  }

  async revokeToken(accessToken) {
    return this.request('/api/auth/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  }

  // 商店相關 API
  async getShopInfo(token) {
    return this.request('/api/shop/info', {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  // 商品相關 API
  async getProducts(token, params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/products?${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  async createProduct(token, productData) {
    return this.request('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(productData)
    })
  }

  async updateProduct(token, productId, productData) {
    return this.request(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(productData)
    })
  }

  async deleteProduct(token, productId) {
    return this.request(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  // 訂單相關 API
  async getOrders(token, params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/orders?${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  async getOrder(token, orderId) {
    return this.request(`/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  async createOrder(token, orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderData)
    })
  }

  async updateOrder(token, orderId, orderData) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderData)
    })
  }

  // 事件監控 API
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/events?${query}`)
  }

  async subscribeToEvents(callback) {
    const eventSource = new EventSource(`${this.baseURL}/api/events/stream`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('解析事件數據失敗:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('事件流連接錯誤:', error)
      callback({ type: 'error', message: '事件流連接失敗' })
    }

    return eventSource
  }
}

/**
 * API 錯誤類別
 */
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

// 匯出單例
window.apiClient = new APIClient()
```

### 2. 認證管理器 (auth-manager.js)

```javascript
/**
 * 認證管理器 - 處理 OAuth 流程和 Token 管理
 */
class AuthManager {
  constructor() {
    this.storageKey = 'shopline_auth_data'
    this.authData = this.loadAuthData()
  }

  /**
   * 載入儲存的認證資料
   */
  loadAuthData() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('載入認證資料失敗:', error)
      return null
    }
  }

  /**
   * 儲存認證資料
   */
  saveAuthData(authData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(authData))
      this.authData = authData
    } catch (error) {
      console.error('儲存認證資料失敗:', error)
    }
  }

  /**
   * 清除認證資料
   */
  clearAuthData() {
    localStorage.removeItem(this.storageKey)
    this.authData = null
  }

  /**
   * 檢查是否已認證
   */
  isAuthenticated() {
    return this.authData && this.authData.access_token
  }

  /**
   * 獲取 Access Token
   */
  getAccessToken() {
    return this.authData?.access_token
  }

  /**
   * 獲取 Refresh Token
   */
  getRefreshToken() {
    return this.authData?.refresh_token
  }

  /**
   * 檢查 Token 是否過期
   */
  isTokenExpired() {
    if (!this.authData?.expires_at) return true
    
    const now = new Date().getTime()
    const expiresAt = new Date(this.authData.expires_at).getTime()
    
    return now >= expiresAt
  }

  /**
   * 刷新 Token
   */
  async refreshToken() {
    if (!this.getRefreshToken()) {
      throw new Error('沒有可用的 Refresh Token')
    }

    try {
      const result = await window.apiClient.refreshToken(this.getRefreshToken())
      
      if (result.success) {
        this.saveAuthData(result.data)
        return result.data
      } else {
        throw new Error(result.error || 'Token 刷新失敗')
      }
    } catch (error) {
      console.error('Token 刷新失敗:', error)
      this.clearAuthData()
      throw error
    }
  }

  /**
   * 獲取有效的 Access Token (自動刷新)
   */
  async getValidAccessToken() {
    if (!this.isAuthenticated()) {
      throw new Error('未認證')
    }

    if (this.isTokenExpired()) {
      console.log('Token 已過期，正在刷新...')
      await this.refreshToken()
    }

    return this.getAccessToken()
  }

  /**
   * 登出
   */
  async logout() {
    try {
      const accessToken = this.getAccessToken()
      if (accessToken) {
        await window.apiClient.revokeToken(accessToken)
      }
    } catch (error) {
      console.error('登出時撤銷 Token 失敗:', error)
    } finally {
      this.clearAuthData()
    }
  }

  /**
   * 啟動 OAuth 授權流程
   */
  startOAuthFlow() {
    const params = new URLSearchParams({
      appKey: '4c951e966557c8374d9a61753dfe3c52441aba3b',
      responseType: 'code',
      scope: 'read_products,read_orders,write_products,write_orders',
      redirectUri: `${window.location.origin}/callback.html`,
      state: this.generateState()
    })

    const authUrl = `https://paykepoc.myshopline.com/admin/oauth-web/#/oauth/authorize?${params}`
    window.location.href = authUrl
  }

  /**
   * 生成隨機狀態值
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  /**
   * 處理 OAuth 回調
   */
  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (error) {
      throw new Error(`OAuth 錯誤: ${error}`)
    }

    if (!code) {
      throw new Error('未收到授權碼')
    }

    try {
      const result = await window.apiClient.authorize(code, state)
      
      if (result.success) {
        this.saveAuthData(result.data)
        return result.data
      } else {
        throw new Error(result.error || 'OAuth 授權失敗')
      }
    } catch (error) {
      console.error('OAuth 授權失敗:', error)
      throw error
    }
  }
}

// 匯出單例
window.authManager = new AuthManager()
```

### 3. 狀態管理器 (state-manager.js)

```javascript
/**
 * 狀態管理器 - 管理應用狀態
 */
class StateManager {
  constructor() {
    this.state = {
      // 認證狀態
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      },
      
      // 商店資訊
      shop: {
        data: null,
        loading: false,
        error: null
      },
      
      // 商品列表
      products: {
        data: [],
        loading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 10,
          total: 0
        }
      },
      
      // 訂單列表
      orders: {
        data: [],
        loading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 10,
          total: 0
        }
      },
      
      // 事件監控
      events: {
        data: [],
        loading: false,
        error: null,
        isSubscribed: false
      },
      
      // UI 狀態
      ui: {
        activeTab: 'shop',
        sidebarOpen: false,
        notifications: []
      }
    }
    
    this.listeners = new Map()
    this.init()
  }

  /**
   * 初始化狀態管理器
   */
  init() {
    // 檢查認證狀態
    this.updateAuthState()
    
    // 監聽認證變化
    this.on('auth:change', () => {
      this.updateAuthState()
    })
  }

  /**
   * 更新認證狀態
   */
  updateAuthState() {
    const isAuthenticated = window.authManager.isAuthenticated()
    this.setState('auth', {
      isAuthenticated,
      user: isAuthenticated ? window.authManager.authData : null
    })
  }

  /**
   * 設置狀態
   */
  setState(path, value) {
    const keys = path.split('.')
    let current = this.state
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    this.notifyListeners(path, value)
  }

  /**
   * 獲取狀態
   */
  getState(path) {
    const keys = path.split('.')
    let current = this.state
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    
    return current
  }

  /**
   * 訂閱狀態變化
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 取消訂閱
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 通知監聽器
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('狀態監聽器錯誤:', error)
        }
      })
    }
  }

  /**
   * 添加通知
   */
  addNotification(notification) {
    const notifications = this.getState('ui.notifications') || []
    notifications.push({
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    })
    this.setState('ui.notifications', notifications)
  }

  /**
   * 移除通知
   */
  removeNotification(id) {
    const notifications = this.getState('ui.notifications') || []
    this.setState('ui.notifications', notifications.filter(n => n.id !== id))
  }

  /**
   * 清除錯誤
   */
  clearError(path) {
    this.setState(`${path}.error`, null)
  }

  /**
   * 設置載入狀態
   */
  setLoading(path, loading) {
    this.setState(`${path}.loading`, loading)
  }

  /**
   * 設置錯誤
   */
  setError(path, error) {
    this.setState(`${path}.error`, error)
    this.addNotification({
      type: 'error',
      title: '錯誤',
      message: error.message || error
    })
  }
}

// 匯出單例
window.stateManager = new StateManager()
```

---

## 🎨 UI 組件設計

### 1. 主應用組件 (app.js)

```javascript
/**
 * 主應用組件
 */
class App {
  constructor() {
    this.components = new Map()
    this.init()
  }

  /**
   * 初始化應用
   */
  async init() {
    try {
      // 初始化組件
      this.initComponents()
      
      // 綁定事件
      this.bindEvents()
      
      // 檢查認證狀態
      await this.checkAuthStatus()
      
      // 載入初始數據
      await this.loadInitialData()
      
    } catch (error) {
      console.error('應用初始化失敗:', error)
      window.stateManager.setError('auth', error)
    }
  }

  /**
   * 初始化組件
   */
  initComponents() {
    this.components.set('shopInfo', new ShopInfoComponent())
    this.components.set('productList', new ProductListComponent())
    this.components.set('orderManager', new OrderManagerComponent())
    this.components.set('eventMonitor', new EventMonitorComponent())
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 認證狀態變化
    window.stateManager.on('auth:change', () => {
      this.updateUI()
    })

    // 標籤切換
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-tab]')) {
        const tab = e.target.dataset.tab
        window.stateManager.setState('ui.activeTab', tab)
        this.updateUI()
      }
    })

    // 側邊欄切換
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-toggle-sidebar]')) {
        const sidebarOpen = window.stateManager.getState('ui.sidebarOpen')
        window.stateManager.setState('ui.sidebarOpen', !sidebarOpen)
        this.updateUI()
      }
    })
  }

  /**
   * 檢查認證狀態
   */
  async checkAuthStatus() {
    window.stateManager.setLoading('auth', true)
    
    try {
      if (window.authManager.isAuthenticated()) {
        // 檢查 Token 是否有效
        await window.authManager.getValidAccessToken()
        window.stateManager.setState('auth', {
          isAuthenticated: true,
          loading: false,
          error: null
        })
      } else {
        window.stateManager.setState('auth', {
          isAuthenticated: false,
          loading: false,
          error: null
        })
      }
    } catch (error) {
      window.stateManager.setError('auth', error)
    }
  }

  /**
   * 載入初始數據
   */
  async loadInitialData() {
    if (window.stateManager.getState('auth.isAuthenticated')) {
      // 載入商店資訊
      await this.components.get('shopInfo').load()
    }
  }

  /**
   * 更新 UI
   */
  updateUI() {
    const isAuthenticated = window.stateManager.getState('auth.isAuthenticated')
    const activeTab = window.stateManager.getState('ui.activeTab')
    const sidebarOpen = window.stateManager.getState('ui.sidebarOpen')

    // 更新認證狀態
    document.querySelectorAll('[data-auth-required]').forEach(el => {
      el.style.display = isAuthenticated ? 'block' : 'none'
    })

    document.querySelectorAll('[data-auth-hidden]').forEach(el => {
      el.style.display = isAuthenticated ? 'none' : 'block'
    })

    // 更新標籤
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === activeTab)
    })

    document.querySelectorAll('[data-tab-content]').forEach(el => {
      el.style.display = el.dataset.tabContent === activeTab ? 'block' : 'none'
    })

    // 更新側邊欄
    document.querySelector('[data-sidebar]').classList.toggle('open', sidebarOpen)
  }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App()
})
```

### 2. 商店資訊組件 (components/ShopInfo.js)

```javascript
/**
 * 商店資訊組件
 */
class ShopInfoComponent {
  constructor() {
    this.container = document.querySelector('[data-component="shop-info"]')
    this.init()
  }

  /**
   * 初始化組件
   */
  init() {
    this.bindEvents()
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    // 載入按鈕
    this.container?.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="load-shop-info"]')) {
        this.load()
      }
    })
  }

  /**
   * 載入商店資訊
   */
  async load() {
    if (!window.stateManager.getState('auth.isAuthenticated')) {
      throw new Error('請先進行認證')
    }

    window.stateManager.setLoading('shop', true)
    window.stateManager.clearError('shop')

    try {
      const token = await window.authManager.getValidAccessToken()
      const result = await window.apiClient.getShopInfo(token)

      if (result.success) {
        window.stateManager.setState('shop', {
          data: result.data,
          loading: false,
          error: null
        })
        this.render(result.data)
      } else {
        throw new Error(result.error || '載入商店資訊失敗')
      }
    } catch (error) {
      window.stateManager.setError('shop', error)
      this.renderError(error)
    }
  }

  /**
   * 渲染商店資訊
   */
  render(shopData) {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="shop-info-card">
        <h3>商店資訊</h3>
        <div class="shop-details">
          <div class="detail-item">
            <label>商店名稱:</label>
            <span>${shopData.name || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>商店網址:</label>
            <span>${shopData.url || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>商店 ID:</label>
            <span>${shopData.id || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>時區:</label>
            <span>${shopData.timezone || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>貨幣:</label>
            <span>${shopData.currency || 'N/A'}</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" data-action="load-shop-info">
            重新載入
          </button>
        </div>
      </div>
    `
  }

  /**
   * 渲染錯誤
   */
  renderError(error) {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="error-card">
        <h3>載入商店資訊失敗</h3>
        <p class="error-message">${error.message}</p>
        <div class="actions">
          <button class="btn btn-primary" data-action="load-shop-info">
            重試
          </button>
        </div>
      </div>
    `
  }
}
```

---

## 📱 響應式設計

### CSS 架構

```css
/* 主要樣式 - style.css */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.6;
}

/* 佈局 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.app-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background-color: var(--surface-color);
  border-right: 1px solid var(--border-color);
  padding: 1rem;
  transition: transform 0.3s ease;
}

.main-content {
  padding: 2rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -250px;
    width: 250px;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
  }
  
  .sidebar.open {
    transform: translateX(250px);
  }
  
  .main-content {
    padding: 1rem;
  }
}

/* 組件樣式 */
.card {
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-success {
  background-color: var(--success-color);
  color: white;
}

.btn-warning {
  background-color: var(--warning-color);
  color: white;
}

.btn-error {
  background-color: var(--error-color);
  color: white;
}

/* 載入狀態 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 錯誤狀態 */
.error-card {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.error-message {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

/* 通知 */
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  box-shadow: var(--shadow);
  z-index: 1000;
  max-width: 400px;
}

.notification.success {
  border-left: 4px solid var(--success-color);
}

.notification.error {
  border-left: 4px solid var(--error-color);
}

.notification.warning {
  border-left: 4px solid var(--warning-color);
}
```

---

## 🚀 Vercel 配置

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### package.json

```json
{
  "name": "shopline-frontend",
  "version": "2.0.0",
  "description": "Shopline 前端應用 - 前後端分離版本",
  "main": "public/js/app.js",
  "scripts": {
    "dev": "python3 -m http.server 3000 --directory public",
    "build": "echo 'No build step required for static site'",
    "preview": "vercel dev"
  },
  "devDependencies": {
    "vercel": "^32.0.0"
  },
  "keywords": [
    "shopline",
    "frontend",
    "ecommerce",
    "api"
  ],
  "author": "Development Team",
  "license": "MIT"
}
```

---

## 📊 效能優化

### 1. 資源優化
- 壓縮 CSS 和 JavaScript
- 使用 CDN 載入外部資源
- 實作圖片懶載入
- 使用 Service Worker 快取

### 2. 載入優化
- 關鍵 CSS 內聯
- JavaScript 代碼分割
- 預載入重要資源
- 使用 Intersection Observer

### 3. 網路優化
- 實作請求去重
- 使用請求佇列
- 實作重試機制
- 優化 API 呼叫頻率

---

## 🧪 測試策略

### 1. 單元測試
- API 客戶端測試
- 狀態管理器測試
- 組件邏輯測試

### 2. 整合測試
- 認證流程測試
- API 通訊測試
- 狀態同步測試

### 3. 端到端測試
- 完整用戶流程測試
- 跨瀏覽器測試
- 響應式設計測試

---

## 📚 開發指南

### 1. 本地開發
```bash
# 啟動本地開發伺服器
npm run dev

# 訪問 http://localhost:3000
```

### 2. 部署到 Vercel
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署
vercel

# 生產環境部署
vercel --prod
```

### 3. 環境變數
- 無需環境變數 (純靜態)
- 後端 URL 自動偵測
- 所有配置都在代碼中

---

**版本**: 2.0.0  
**建立日期**: 2025-01-27  
**狀態**: 設計完成  
**下一步**: 實作後端架構
