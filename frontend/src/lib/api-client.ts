// API 客戶端配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// 環境檢測
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// API 端點配置
export const API_ENDPOINTS = {
  // 認證
  auth: {
    oauthCallback: '/api/auth/oauth/callback',
    refreshToken: '/api/auth/token/refresh',
    revokeToken: '/api/auth/token/revoke'
  },
  
  // Shopline API
  shopline: {
    shop: '/api/shopline/shop',
    products: '/api/shopline/products',
    orders: '/api/shopline/orders',
    test: '/api/shopline/test'
  },
  
  // 事件
  events: {
    publish: '/api/events/publish',
    list: '/api/events',
    stats: '/api/events/stats/summary'
  },
  
  // 健康檢查
  health: '/health'
}

// 通用 API 回應類型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API 客戶端類
class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // 建立請求標頭
  private getHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
  }

  // 通用請求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      console.error('API 請求錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤'
      }
    }
  }

  // GET 請求
  async get<T>(endpoint: string, accessToken?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: accessToken ? this.getHeaders(accessToken) : this.getHeaders()
    })
  }

  // POST 請求
  async post<T>(
    endpoint: string,
    data?: any,
    accessToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: accessToken ? this.getHeaders(accessToken) : this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // PUT 請求
  async put<T>(
    endpoint: string,
    data?: any,
    accessToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: accessToken ? this.getHeaders(accessToken) : this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // DELETE 請求
  async delete<T>(endpoint: string, accessToken?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: accessToken ? this.getHeaders(accessToken) : this.getHeaders()
    })
  }

  // 健康檢查
  async healthCheck(): Promise<ApiResponse> {
    return this.get(API_ENDPOINTS.health)
  }

  // 認證相關
  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    return this.post(API_ENDPOINTS.auth.refreshToken, { refreshToken })
  }

  async revokeToken(accessToken: string): Promise<ApiResponse> {
    return this.post(API_ENDPOINTS.auth.revokeToken, { accessToken })
  }

  // Shopline API
  async getShopInfo(accessToken: string): Promise<ApiResponse> {
    return this.get(API_ENDPOINTS.shopline.shop, accessToken)
  }

  async getProducts(accessToken: string, params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const endpoint = `${API_ENDPOINTS.shopline.products}?${queryParams.toString()}`
    return this.get(endpoint, accessToken)
  }

  async createProduct(accessToken: string, productData: any): Promise<ApiResponse> {
    return this.post(API_ENDPOINTS.shopline.products, productData, accessToken)
  }

  async getOrders(accessToken: string, params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const endpoint = `${API_ENDPOINTS.shopline.orders}?${queryParams.toString()}`
    return this.get(endpoint, accessToken)
  }

  async getOrderDetail(accessToken: string, orderId: string): Promise<ApiResponse> {
    return this.get(`${API_ENDPOINTS.shopline.orders}/${orderId}`, accessToken)
  }

  async createOrder(accessToken: string, orderData: any): Promise<ApiResponse> {
    return this.post(API_ENDPOINTS.shopline.orders, orderData, accessToken)
  }

  async testAllAPIs(accessToken: string): Promise<ApiResponse> {
    return this.get(API_ENDPOINTS.shopline.test, accessToken)
  }

  // 事件相關
  async publishEvent(eventData: {
    type: string
    data: any
    source: string
    timestamp?: string
  }): Promise<ApiResponse> {
    return this.post(API_ENDPOINTS.events.publish, eventData)
  }

  async getEvents(params?: {
    page?: number
    limit?: number
    type?: string
    source?: string
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.source) queryParams.append('source', params.source)
    
    const endpoint = `${API_ENDPOINTS.events.list}?${queryParams.toString()}`
    return this.get(endpoint)
  }

  async getEventStats(): Promise<ApiResponse> {
    return this.get(API_ENDPOINTS.events.stats)
  }
}

// 建立 API 客戶端實例
export const apiClient = new ApiClient()

// 環境資訊
export const envInfo = {
  isDevelopment,
  isProduction,
  apiBaseUrl: API_BASE_URL,
  nodeEnv: process.env.NODE_ENV
}
