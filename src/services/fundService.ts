import { ref } from 'vue'

// 基金API枚举
export enum FundAPI {
  EASTMONEY = 'eastmoney',
  THS = 'ths',
  TENCENT = 'tencent',
  FUND123 = 'fund123'
}

// 日志类型
export enum LogType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  NETWORK = 'network',
  CACHE = 'cache'
}

// 日志条目
export interface LogEntry {
  id: string
  message: string
  type: LogType
  timestamp: Date
}

// 缓存条目
export interface CachedFundInfo {
  code: string
  name: string
  nav: number
  navDate: string
  returns?: {
    navReturn1m?: number
    navReturn3m?: number
    navReturn6m?: number
    navReturn1y?: number
  }
  timestamp: number
}

// 基金服务类
class FundService {
  private cache: Map<string, CachedFundInfo> = new Map()
  private logMessages = ref<LogEntry[]>([])
  private readonly CACHE_EXPIRATION = 24 * 60 * 60 * 1000 // 24小时
  
  constructor() {
    this.loadCacheFromStorage()
  }
  
  // 获取当前选择的API
  private getSelectedAPI(): FundAPI {
    const saved = localStorage.getItem('selectedFundAPI')
    if (saved && Object.values(FundAPI).includes(saved as FundAPI)) {
      return saved as FundAPI
    }
    return FundAPI.EASTMONEY // 默认天天基金
  }
  
  // 添加日志
  private addLog(message: string, type: LogType = LogType.INFO) {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    }
    
    this.logMessages.value.push(logEntry)
    
    // 限制日志数量
    if (this.logMessages.value.length > 100) {
      this.logMessages.value = this.logMessages.value.slice(-100)
    }
  }
  
  // 从存储加载缓存
  private loadCacheFromStorage() {
    try {
      const saved = localStorage.getItem('fundCache')
      if (saved) {
        const data = JSON.parse(saved)
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as CachedFundInfo)
        })
        this.addLog('缓存已从本地加载', LogType.CACHE)
      }
    } catch (error) {
      this.addLog(`加载缓存失败: ${error}`, LogType.ERROR)
    }
  }
  
  // 保存缓存到存储
  private saveCacheToStorage() {
    try {
      const data: Record<string, CachedFundInfo> = {}
      this.cache.forEach((value, key) => {
        data[key] = value
      })
      localStorage.setItem('fundCache', JSON.stringify(data))
    } catch (error) {
      this.addLog(`保存缓存失败: ${error}`, LogType.ERROR)
    }
  }
  
  // 检查缓存是否过期
  private isCacheExpired(cached: CachedFundInfo): boolean {
    return Date.now() - cached.timestamp > this.CACHE_EXPIRATION
  }
  
  // 获取基金信息
  async fetchFundInfo(code: string): Promise<{
    name: string
    nav: number
    navDate: string
    returns?: {
      navReturn1m?: number
      navReturn3m?: number
      navReturn6m?: number
      navReturn1y?: number
    }
  }> {
    // 检查缓存
    const cached = this.cache.get(code)
    if (cached && !this.isCacheExpired(cached)) {
      this.addLog(`基金 ${code}: 从缓存中获取数据`, LogType.CACHE)
      return {
        name: cached.name,
        nav: cached.nav,
        navDate: cached.navDate,
        returns: cached.returns
      }
    }
    
    this.addLog(`基金 ${code}: 开始获取数据，API: ${this.getSelectedAPI()}`, LogType.NETWORK)
    
    try {
      let result
      const selectedAPI = this.getSelectedAPI()
      
      // 根据选择的API调用不同的服务
      switch (selectedAPI) {
        case FundAPI.EASTMONEY:
          result = await this.fetchFromEastmoney(code)
          break
        case FundAPI.THS:
          result = await this.fetchFromTHS(code)
          break
        case FundAPI.TENCENT:
          result = await this.fetchFromTencent(code)
          break
        case FundAPI.FUND123:
          result = await this.fetchFromFund123(code)
          break
        default:
          result = await this.fetchFromEastmoney(code)
      }
      
      if (result) {
        // 保存到缓存
        this.cache.set(code, {
          code,
          name: result.name,
          nav: result.nav,
          navDate: result.navDate,
          returns: result.returns,
          timestamp: Date.now()
        })
        this.saveCacheToStorage()
        
        this.addLog(`基金 ${code}: 获取成功`, LogType.SUCCESS)
        return result
      }
      
      throw new Error('获取基金信息失败')
    } catch (error) {
      this.addLog(`基金 ${code}: 获取失败: ${error}`, LogType.ERROR)
      
      // 如果缓存中有数据，即使过期也返回
      if (cached) {
        this.addLog(`基金 ${code}: 返回过期的缓存数据`, LogType.WARNING)
        return {
          name: cached.name,
          nav: cached.nav,
          navDate: cached.navDate,
          returns: cached.returns
        }
      }
      
      throw error
    }
  }
  
  // 天天基金API
  private async fetchFromEastmoney(code: string): Promise<any> {
    try {
      // 获取基本基金信息
      const response = await fetch(`https://fundgz.1234567.com.cn/js/${code}.js`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) throw new Error('HTTP错误')
      
      const text = await response.text()
      if (!text.startsWith('jsonpgz')) throw new Error('数据格式错误')
      
      const jsonString = text
        .replace('jsonpgz(', '')
        .replace(');', '')
      
      const data = JSON.parse(jsonString)
      
      const result = {
        name: data.name || '',
        nav: parseFloat(data.dwjz || data.gsz) || 0,
        navDate: data.jzrq || new Date().toISOString().split('T')[0]
      }
      
      // 尝试获取收益率数据
      try {
        const returns = await this.fetchReturnsFromEastmoney(code)
        return { ...result, returns }
      } catch (returnsError) {
        // 即使获取收益率失败，也返回基本数据
        return result
      }
    } catch (error) {
      throw new Error(`天天基金API错误: ${error}`)
    }
  }
  
  // 获取天天基金收益率数据
  private async fetchReturnsFromEastmoney(code: string): Promise<any> {
    try {
      const response = await fetch(`https://fund.eastmoney.com/pingzhongdata/${code}.js`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) throw new Error('HTTP错误')
      
      const text = await response.text()
      
      const returns: any = {}
      
      // 解析收益率数据
      const returnPatterns = [
        { pattern: /syl_1y\s*=\s*"([^"]*)"/, key: 'navReturn1m' },
        { pattern: /syl_3y\s*=\s*"([^"]*)"/, key: 'navReturn3m' },
        { pattern: /syl_6y\s*=\s*"([^"]*)"/, key: 'navReturn6m' },
        { pattern: /syl_1n\s*=\s*"([^"]*)"/, key: 'navReturn1y' }
      ]
      
      returnPatterns.forEach(({ pattern, key }) => {
        const match = text.match(pattern)
        if (match && match[1]) {
          const value = parseFloat(match[1])
          if (!isNaN(value)) {
            returns[key] = value
          }
        }
      })
      
      return returns
    } catch (error) {
      throw new Error(`获取收益率数据失败: ${error}`)
    }
  }
  
  // 同花顺API（示例）
  private async fetchFromTHS(code: string): Promise<any> {
    // 这里使用模拟数据，实际项目需要调用同花顺API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockFunds: Record<string, any> = {
      '005827': { 
        name: '易方达蓝筹精选混合', 
        nav: 2.5000,
        navDate: new Date().toISOString().split('T')[0]
      },
      '000001': { 
        name: '华夏成长混合', 
        nav: 1.8000,
        navDate: new Date().toISOString().split('T')[0]
      },
      '001856': { 
        name: '嘉实新兴产业股票', 
        nav: 3.2000,
        navDate: new Date().toISOString().split('T')[0]
      }
    }
    
    if (mockFunds[code]) {
      return mockFunds[code]
    }
    
    throw new Error('基金代码不存在')
  }
  
  // 腾讯财经API（示例）
  private async fetchFromTencent(code: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    return {
      name: `基金${code}`,
      nav: 1.5000,
      navDate: new Date().toISOString().split('T')[0]
    }
  }
  
  // 蚂蚁基金API（示例）
  private async fetchFromFund123(code: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    return {
      name: `基金${code}`,
      nav: 1.2000,
      navDate: new Date().toISOString().split('T')[0]
    }
  }
  
  // 获取所有API列表
  getAPIs() {
    return [
      { name: '天天基金', value: FundAPI.EASTMONEY },
      { name: '同花顺', value: FundAPI.THS },
      { name: '腾讯财经', value: FundAPI.TENCENT },
      { name: '蚂蚁基金', value: FundAPI.FUND123 }
    ]
  }
  
  // 设置API
  setAPI(api: FundAPI) {
    localStorage.setItem('selectedFundAPI', api)
    this.addLog(`基金API已切换为: ${api}`, LogType.INFO)
  }
  
  // 获取日志
  getLogs() {
    return this.logMessages
  }
  
  // 清空缓存
  clearCache() {
    this.cache.clear()
    localStorage.removeItem('fundCache')
    this.addLog('缓存已清空', LogType.INFO)
  }
}

// 创建单例实例
export const fundService = new FundService()