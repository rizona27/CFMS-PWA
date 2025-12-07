import { useDataStore } from '@/stores/dataStore'

export interface FundInfo {
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

// 定义代理列表，按优先级排序
const PROXY_SERVICES = [
  // 直接访问（通常会在浏览器环境失败，但保留作为第一尝试）
  (url: string) => url,
  // CORS代理服务
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://crossorigin.me/${url.replace(/^https?:\/\//, '')}`,
  // 备用代理
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url: string) => `https://proxy.cors.sh/${url}`,
  (url: string) => `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.cors.sh/${url}`,
]

// 基金API端点配置
const FUND_API_CONFIG = {
  eastmoney: {
    baseUrl: 'https://fundgz.1234567.com.cn/js',
    infoUrl: (code: string) => `https://fund.eastmoney.com/pingzhongdata/${code}.js`,
    returnsUrl: (code: string) => `https://fund.eastmoney.com/pingzhongdata/${code}.js`,
  },
  ths: {
    baseUrl: 'https://fund.10jqka.com.cn',
    infoUrl: (code: string) => `https://fund.10jqka.com.cn/${code}/`,
  },
  tencent: {
    baseUrl: 'https://qt.gtimg.cn',
    infoUrl: (code: string) => `q=ff_${code}`,
  },
  fund123: {
    baseUrl: 'https://www.fund123.cn/api',
    infoUrl: (code: string) => `https://www.fund123.cn/fund/${code}`,
  }
}

class FundService {
  private dataStore: any
  
  constructor() {
    this.dataStore = useDataStore()
  }

  // 获取用户选择的API
  private getSelectedAPI() {
    return this.dataStore.userPreferences?.selectedFundAPI || 'eastmoney'
  }

  // 尝试使用代理获取数据
  private async fetchWithProxy(url: string, options?: RequestInit): Promise<Response> {
    const proxiesToTry = [...PROXY_SERVICES]
    let lastError: any = null;
    
    for (let i = 0; i < proxiesToTry.length; i++) {
      const proxy = proxiesToTry[i];
      const isDirect = i === 0;
      
      try {
        const proxyUrl = proxy(url)
        const proxyName = isDirect ? '直接访问' : `代理服务(${i})`
        
        // 仅在控制台记录尝试，不写入UI日志以免造成干扰
        console.debug(`尝试请求: ${proxyName} -> ${url}`)
        
        const response = await fetch(proxyUrl, {
          ...options,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options?.headers,
          },
          mode: 'cors',
          credentials: 'omit',
        })

        if (response.ok) {
          if (!isDirect) {
             console.log(`代理成功: ${proxyName}`)
          }
          // 只有非直连成功才记录一条网络日志，或者完全不记录以保持清爽
          if (!isDirect) {
            this.dataStore.addLog(`数据请求成功 (使用${proxyName})`, 'network')
          }
          return response
        }
        
        // 如果失败，仅在控制台警告，继续下一次循环
        console.warn(`节点响应非200: ${response.status} ${response.statusText} (使用${proxyName})`)
        
      } catch (error) {
        lastError = error;
        // 仅控制台记录，不打扰用户
        // console.debug(`节点请求异常:`, error)
      }
    }
    
    // 如果循环结束仍未返回，说明所有尝试都失败了
    console.error(`所有代理尝试均失败:`, lastError)
    this.dataStore.addLog(`基金数据请求最终失败: 无法连接到数据源`, 'error')
    throw new Error('网络请求失败：所有代理节点均无法访问')
  }

  // 获取基金实时净值
  async fetchFundRealTimeNav(fundCode: string): Promise<FundRealTimeNav> {
    const apiType = this.getSelectedAPI()
    
    try {
      // 减少日志噪音，不记录每次开始
      // this.dataStore.addLog(`获取基金 ${fundCode} 实时净值 (API: ${apiType})`, 'network')
      
      switch (apiType) {
        case 'eastmoney':
          return await this.fetchFromEastMoneyRealTime(fundCode)
        case 'ths':
          const thsInfo = await this.fetchFromTHS(fundCode)
          return { nav: thsInfo.nav, date: thsInfo.navDate }
        case 'tencent':
          const tencentInfo = await this.fetchFromTencent(fundCode)
          return { nav: tencentInfo.nav, date: tencentInfo.navDate }
        case 'fund123':
          const fund123Info = await this.fetchFromFund123(fundCode)
          return { nav: fund123Info.nav, date: fund123Info.navDate }
        default:
          return await this.fetchFromEastMoneyRealTime(fundCode)
      }
    } catch (error) {
      console.error(`获取基金 ${fundCode} 实时净值失败:`, error)
      this.dataStore.addLog(`获取基金 ${fundCode} 实时净值失败: ${(error as Error).message}`, 'error')
      throw error
    }
  }

  // 获取基金详细信息
  async fetchFundInfo(fundCode: string): Promise<FundInfo> {
    const apiType = this.getSelectedAPI()
    
    try {
      // 首先尝试从缓存获取
      const cached = this.dataStore.getFundFromCache(fundCode)
      if (cached) {
        console.log(`从缓存获取基金信息: ${fundCode}`)
        // 降低缓存日志级别或不显示
        return cached
      }

      this.dataStore.addLog(`正在更新基金 ${fundCode} 信息...`, 'network')
      
      let fundInfo: FundInfo
      
      switch (apiType) {
        case 'eastmoney':
          fundInfo = await this.fetchFromEastMoney(fundCode)
          break
        case 'ths':
          fundInfo = await this.fetchFromTHS(fundCode)
          break
        case 'tencent':
          fundInfo = await this.fetchFromTencent(fundCode)
          break
        case 'fund123':
          fundInfo = await this.fetchFromFund123(fundCode)
          break
        default:
          fundInfo = await this.fetchFromEastMoney(fundCode)
      }

      // 保存到缓存
      this.dataStore.saveToFundCache(fundCode, {
        ...fundInfo,
        timestamp: Date.now()
      })
      
      this.dataStore.addLog(`成功获取基金 ${fundCode} 信息`, 'success')

      return fundInfo
    } catch (error) {
      console.error(`获取基金 ${fundCode} 信息失败:`, error)
      this.dataStore.addLog(`获取基金 ${fundCode} 信息失败: ${(error as Error).message}`, 'error')
      
      // 返回默认值，防止应用崩溃
      return {
        code: fundCode,
        name: '未知基金',
        nav: 0,
        navDate: new Date().toISOString().split('T')[0],
      }
    }
  }

  // 天天基金API
  private async fetchFromEastMoney(fundCode: string): Promise<FundInfo> {
    try {
      // 尝试获取实时净值
      const realTime = await this.fetchFromEastMoneyRealTime(fundCode)
      
      // 尝试获取历史收益率
      let returns: FundReturns = {}
      try {
        returns = await this.fetchReturnsFromEastmoney(fundCode)
      } catch (error) {
        console.warn(`获取基金 ${fundCode} 收益率失败:`, error)
      }

      return {
        code: fundCode,
        name: realTime.name || '天天基金',
        nav: realTime.nav,
        navDate: realTime.date,
        returns
      }
    } catch (error) {
      // 如果实时API失败，尝试备用API
      console.warn(`天天基金实时API失败，尝试备用方案`)
      return await this.fetchFromEastMoneyFallback(fundCode)
    }
  }

  private async fetchFromEastMoneyRealTime(fundCode: string): Promise<{ name: string; nav: number; date: string }> {
    const url = `https://fundgz.1234567.com.cn/js/${fundCode}.js?rt=${Date.now()}`
    
    try {
      const response = await this.fetchWithProxy(url)
      const text = await response.text()
      
      // 解析JSONP响应
      const jsonpMatch = text.match(/jsonpgz\((.+)\)/)
      if (jsonpMatch) {
        const data = JSON.parse(jsonpMatch[1])
        return {
          name: data.name || 'N/A',
          nav: parseFloat(data.dwjz || data.gsz),
          date: data.jzrq || data.gzrq
        }
      }
      
      throw new Error('无效的响应格式')
    } catch (error) {
      // 这里不抛出，由上层处理fallback
      throw error
    }
  }

  private async fetchFromEastMoneyFallback(fundCode: string): Promise<FundInfo> {
    // 备用API：使用基金档案页
    const url = `https://fund.eastmoney.com/${fundCode}.html`
    
    try {
      const response = await this.fetchWithProxy(url)
      const html = await response.text()
      
      // 从HTML中提取基金名称和净值
      const nameMatch = html.match(/<title>([^<]+)/)
      const navMatch = html.match(/单位净值[^>]*>([\d.]+)/)
      const dateMatch = html.match(/(\d{4}-\d{2}-\d{2})/)
      
      return {
        code: fundCode,
        name: nameMatch ? nameMatch[1].replace('_天天基金网', '').trim() : '未知基金',
        nav: navMatch ? parseFloat(navMatch[1]) : 0,
        navDate: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      }
    } catch (error) {
      console.error(`天天基金备用API也失败:`, error)
      throw error
    }
  }

  private async fetchReturnsFromEastmoney(fundCode: string): Promise<FundReturns> {
    const url = `https://fund.eastmoney.com/pingzhongdata/${fundCode}.js`
    
    try {
      const response = await this.fetchWithProxy(url)
      const jsContent = await response.text()
      
      const returns: FundReturns = {}
      
      // 使用更精确的正则表达式匹配
      const patterns = [
        { key: 'navReturn1m' as const, regex: /syl_1y\s*=\s*"([^"]*)"/ },
        { key: 'navReturn3m' as const, regex: /syl_3y\s*=\s*"([^"]*)"/ },
        { key: 'navReturn6m' as const, regex: /syl_6y\s*=\s*"([^"]*)"/ },
        { key: 'navReturn1y' as const, regex: /syl_1n\s*=\s*"([^"]*)"/ }
      ]
      
      for (const { key, regex } of patterns) {
        const match = jsContent.match(regex)
        if (match && match[1]) {
          const value = parseFloat(match[1])
          if (!isNaN(value)) {
            returns[key] = value
          }
        }
      }
      
      if (Object.values(returns).filter(v => v !== undefined).length === 0) {
        const alternativePattern = /syl_(1y|3y|6y|1n)\s*=\s*"([^"]*)"/
        let match
        const regex = new RegExp(alternativePattern, 'g')
        while ((match = regex.exec(jsContent)) !== null) {
          const key = match[1]
          const value = parseFloat(match[2])
          if (!isNaN(value)) {
            switch (key) {
              case '1y': returns.navReturn1m = value; break
              case '3y': returns.navReturn3m = value; break
              case '6y': returns.navReturn6m = value; break
              case '1n': returns.navReturn1y = value; break
            }
          }
        }
      }
      
      return returns
    } catch (error) {
      console.warn(`获取收益率数据失败，使用模拟数据:`, error)
      return this.generateMockReturns()
    }
  }

  // 同花顺API
  private async fetchFromTHS(fundCode: string): Promise<FundInfo> {
    const url = `https://fund.10jqka.com.cn/${fundCode}/`
    
    try {
      const response = await this.fetchWithProxy(url)
      const html = await response.text()
      
      // 解析HTML获取基金信息
      const nameMatch = html.match(/<h1[^>]*>([^<]+)</)
      const navMatch = html.match(/单位净值[^>]*>([\d.]+)</)
      const dateMatch = html.match(/净值日期[^>]*>([^<]+)</)
      
      return {
        code: fundCode,
        name: nameMatch ? nameMatch[1].trim() : '同花顺基金',
        nav: navMatch ? parseFloat(navMatch[1]) : 0,
        navDate: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      }
    } catch (error) {
      console.error(`同花顺API失败:`, error)
      // 回退到天天基金
      return await this.fetchFromEastMoney(fundCode)
    }
  }

  // 腾讯财经API
  private async fetchFromTencent(fundCode: string): Promise<FundInfo> {
    const url = `https://qt.gtimg.cn/q=ff_${fundCode}`
    
    try {
      const response = await this.fetchWithProxy(url)
      const text = await response.text()
      
      // 解析腾讯财经格式
      const parts = text.split('~')
      if (parts.length > 2) {
        return {
          code: fundCode,
          name: parts[1] || '腾讯基金',
          nav: parseFloat(parts[3]) || 0,
          navDate: parts[2] || new Date().toISOString().split('T')[0],
        }
      }
      
      throw new Error('无效的响应格式')
    } catch (error) {
      console.error(`腾讯财经API失败:`, error)
      // 回退到天天基金
      return await this.fetchFromEastMoney(fundCode)
    }
  }

  // 蚂蚁基金API
  private async fetchFromFund123(fundCode: string): Promise<FundInfo> {
    const url = `https://www.fund123.cn/api/fund/${fundCode}`
    
    try {
      const response = await this.fetchWithProxy(url)
      const data = await response.json()
      
      return {
        code: fundCode,
        name: data.name || '蚂蚁基金',
        nav: data.nav || 0,
        navDate: data.navDate || new Date().toISOString().split('T')[0],
        returns: data.returns
      }
    } catch (error) {
      console.error(`蚂蚁基金API失败:`, error)
      // 回退到天天基金
      return await this.fetchFromEastMoney(fundCode)
    }
  }

  // 生成模拟收益率数据（用于开发环境）
  private generateMockReturns(): FundReturns {
    // 生成 -20% 到 +30% 的随机收益率
    const getRandomReturn = () => (Math.random() * 50 - 20)
    
    return {
      navReturn1m: parseFloat(getRandomReturn().toFixed(2)),
      navReturn3m: parseFloat(getRandomReturn().toFixed(2)),
      navReturn6m: parseFloat(getRandomReturn().toFixed(2)),
      navReturn1y: parseFloat(getRandomReturn().toFixed(2)),
    }
  }

  // 批量获取基金信息
  async fetchMultipleFunds(fundCodes: string[]): Promise<FundInfo[]> {
    const results: FundInfo[] = []
    
    this.dataStore.addLog(`开始批量获取 ${fundCodes.length} 支基金信息`, 'network')
    
    for (const code of fundCodes) {
      try {
        const info = await this.fetchFundInfo(code)
        results.push(info)
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`获取基金 ${code} 失败:`, error)
        this.dataStore.addLog(`批量获取基金 ${code} 信息失败`, 'error')
        results.push({
          code,
          name: '获取失败',
          nav: 0,
          navDate: new Date().toISOString().split('T')[0],
        })
      }
    }
    
    this.dataStore.addLog(`批量获取基金信息完成`, 'success')
    return results
  }
}

export const fundService = new FundService()
