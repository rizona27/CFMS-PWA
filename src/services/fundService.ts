import { useDataStore } from '@/stores/dataStore'

// 【重要修改】定义正确的 API 基础 URL，解决因域名不一致导致的 404/401 错误
const API_BASE_URL = 'https://cfms.crnas.uk:8315'

export interface FundInfo {
  code: string
  name: string
  nav: number
  navDate: string
  isValid?: boolean
  returns?: {
    navReturn1m?: number
    navReturn3m?: number
    navReturn6m?: number
    navReturn1y?: number
  }
}

export interface FundRealTimeNav {
  nav: number
  date: string
}

export interface FundReturns {
  navReturn1m?: number
  navReturn3m?: number
  navReturn6m?: number
  navReturn1y?: number
}

class DateFormatters {
  static formatYYYY_MM_DD(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  static parseYYYY_MM_DD(dateString: string): Date | null {
    try {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day)
    } catch (error) {
      return null
    }
  }
}

class FundService {
  private dataStore: any
  private fundCache: Map<string, { holding: FundInfo; timestamp: number }> = new Map()
  private activeRequests: Map<string, Promise<FundInfo>> = new Map()
  private readonly cacheExpirationInterval: number = 24 * 60 * 60 * 1000

  constructor() {
    // 【正确】从 Pinia 获取 Store 实例
    this.dataStore = useDataStore()
  }

  private getSelectedAPI() {
    return this.dataStore.userPreferences?.selectedFundAPI || 'eastmoney'
  }

  private formatFundCode(code: string): string {
    const cleaned = code.replace(/\D/g, '')
    const formatted = cleaned.padStart(6, '0')
    console.log(`[代码格式化] ${code} -> ${formatted}`)
    return formatted
  }

  private isCacheExpired(cachedData: { holding: FundInfo; timestamp: number }): boolean {
    return Date.now() - cachedData.timestamp > this.cacheExpirationInterval
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  private async getAuthHeaders() {
    // 关键：从 localStorage 获取正确的令牌键名
    const token = localStorage.getItem('auth_token') || ''
    console.log('[认证头] 当前令牌:', token ? token.substring(0, 20) + '...' : '未找到')
    
    if (!token) {
      console.warn('[认证头] 令牌不存在，请先登录')
      // 触发重新登录事件
      const event = new CustomEvent('auth-required', {
        detail: { message: '请先登录以获取基金数据' }
      })
      window.dispatchEvent(event)
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': window.location.origin
    }
  }

  async fetchFundInfo(fundCode: string, useOnlyEastmoney: boolean = false): Promise<FundInfo> {
    const formattedCode = this.formatFundCode(fundCode)
    console.group(`🧭 [fetchFundInfo] 开始处理基金: ${fundCode} (${formattedCode})`)
    
    if (this.activeRequests.has(formattedCode)) {
      console.log(`[请求去重] 使用现有请求`)
      const result = await this.activeRequests.get(formattedCode)!
      console.groupEnd()
      return result
    }

    this.dataStore.addLog(`开始查询基金代码: ${formattedCode}，使用API: ${this.getSelectedAPI()}` + (useOnlyEastmoney ? " (仅使用天天基金)" : ""), 'network')

    const cachedData = this.fundCache.get(formattedCode)
    if (cachedData) {
      const isSameNavDay = this.isSameDay(DateFormatters.parseYYYY_MM_DD(cachedData.holding.navDate) || new Date(), new Date())
      const isCacheFresh = !this.isCacheExpired(cachedData)
      
      if (isSameNavDay && isCacheFresh) {
        console.log(`[缓存] ✅ 命中有效缓存`)
        this.dataStore.addLog(`基金代码 ${formattedCode}: 从缓存中获取数据`, 'cache')
        console.groupEnd()
        return cachedData.holding
      } else {
        console.log(`[缓存] ⏰ 缓存已过期或非今日`)
      }
    }

    const requestTask = this.fetchFromProxy(formattedCode, useOnlyEastmoney)
    this.activeRequests.set(formattedCode, requestTask)

    try {
      const result = await requestTask
      console.groupEnd()
      return result
    } finally {
      this.activeRequests.delete(formattedCode)
    }
  }

  private async fetchFromProxy(fundCode: string, useOnlyEastmoney: boolean = false): Promise<FundInfo> {
    console.log(`[代理请求] 创建代理获取任务: ${fundCode}`)
    
    // 首先检查令牌
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.error('[认证错误] 未找到令牌，需要重新登录')
      // 触发重新登录事件
      const event = new CustomEvent('auth-required', {
        detail: { message: '认证令牌缺失，请重新登录' }
      })
      window.dispatchEvent(event)
      throw new Error('认证令牌缺失，请重新登录')
    }
    
    console.log(`[认证] 使用令牌: ${token.substring(0, 20)}...`)
    
    const apiType = this.getSelectedAPI()
    const url = `${API_BASE_URL}/api/proxy/fund/${fundCode}?api=${apiType}`
    console.log(`[代理请求] 请求URL: ${url}`)
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin
      }
      
      console.log(`[请求] URL: ${url}`)
      console.log(`[请求] 头信息:`, { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` })
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include'  // 重要：跨域请求携带凭证
      })
      
      console.log(`[响应] 状态: ${response.status}`)
      
      if (response.status === 401) {
        console.error('[认证失败] 令牌无效或已过期')
        // 清除无效令牌
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        
        // 触发重新登录事件
        const event = new CustomEvent('auth-expired', {
          detail: { message: '登录已过期，请重新登录' }
        })
        window.dispatchEvent(event)
        
        throw new Error('登录已过期，请重新登录')
      }
      
      if (!response.ok) {
        console.error(`[请求失败] 状态: ${response.status}`)
        throw new Error(`代理请求失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        console.error(`[业务错误]`, result.error)
        throw new Error(result.error || '代理返回错误')
      }
      
      console.log(`[成功] 基金数据:`, result.data.name, result.data.nav)
      
      // 保存到缓存
      this.saveToCache(result.data)
      
      return result.data
      
    } catch (error) {
      console.error(`[代理请求异常]`, error)
      this.dataStore.addLog(`获取基金 ${fundCode} 数据失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
      throw error
    }
  }

  private saveToCache(info: FundInfo): void {
    this.fundCache.set(info.code, {
      holding: info,
      timestamp: Date.now()
    })
  }

  private createInvalidFundInfo(fundCode: string): FundInfo {
    return {
      code: fundCode,
      name: 'N/A',
      nav: 0,
      navDate: DateFormatters.formatYYYY_MM_DD(new Date()),
      isValid: false
    }
  }

  async fetchMultipleFunds(fundCodes: string[]): Promise<FundInfo[]> {
    const results: FundInfo[] = []
    
    this.dataStore.addLog(`开始批量获取 ${fundCodes.length} 支基金信息`, 'network')
    
    // 使用批量代理接口
    const url = `${API_BASE_URL}/api/proxy/fund/batch`
    
    // 检查令牌
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.error('[批量请求] 令牌缺失')
      throw new Error('请先登录以获取基金数据')
    }
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          codes: fundCodes,
          api: this.getSelectedAPI()
        })
      })
      
      if (response.status === 401) {
        console.error('[批量请求] 认证失败')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        
        const event = new CustomEvent('auth-expired', {
          detail: { message: '登录已过期，请重新登录' }
        })
        window.dispatchEvent(event)
        
        throw new Error('登录已过期，请重新登录')
      }
      
      if (!response.ok) {
        throw new Error(`批量请求失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '批量请求返回错误')
      }
      
      // 更新缓存
      result.data.forEach((fund: FundInfo) => {
        this.fundCache.set(fund.code, {
          holding: fund,
          timestamp: Date.now()
        })
      })
      
      this.dataStore.addLog(`批量获取基金信息完成`, 'success')
      return result.data
      
    } catch (error) {
      console.error(`批量请求异常:`, error)
      this.dataStore.addLog(`批量获取基金信息失败，回退到逐个请求`, 'warning')
      
      // 回退到逐个请求
      for (const code of fundCodes) {
        try {
          const info = await this.fetchFundInfo(code)
          results.push(info)
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.error(`获取基金 ${code} 失败:`, error)
          this.dataStore.addLog(`批量获取基金 ${code} 信息失败`, 'error')
          results.push(this.createInvalidFundInfo(code))
        }
      }
    }
    
    return results
  }

  async fetchFundRealTimeNav(fundCode: string): Promise<FundRealTimeNav> {
    const info = await this.fetchFundInfo(fundCode)
    return {
      nav: info.nav,
      date: info.navDate
    }
  }

  async fetchFundDetailsFromEastmoney(code: string): Promise<{ fundName: string; returns: FundReturns }> {
    const formattedCode = this.formatFundCode(code)
    this.dataStore.addLog(`基金代码 ${formattedCode}: 尝试从天天基金获取详情数据`, 'network')
    
    try {
      // 检查令牌
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('请先登录以获取基金详情数据')
      }
      
      const url = `${API_BASE_URL}/api/proxy/fund/${formattedCode}?api=eastmoney`
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      })
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        
        const event = new CustomEvent('auth-expired', {
          detail: { message: '登录已过期，请重新登录' }
        })
        window.dispatchEvent(event)
        
        throw new Error('登录已过期，请重新登录')
      }
      
      if (!response.ok) {
        throw new Error(`详情数据请求失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '详情数据获取失败')
      }
      
      this.dataStore.addLog(`基金代码 ${formattedCode}: 详情数据解析完成`, 'success')
      
      return {
        fundName: result.data.name || 'N/A',
        returns: result.data.returns || {}
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.dataStore.addLog(`基金代码 ${formattedCode}: 详情数据获取失败: ${errorMessage}`, 'error')
      return { fundName: 'N/A', returns: {} }
    }
  }

  // 清理缓存
  clearCache(): void {
    this.fundCache.clear()
    console.log(`[缓存] 已清理所有基金缓存`)
  }
}

export const fundService = new FundService()
