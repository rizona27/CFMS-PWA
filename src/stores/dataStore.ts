import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export interface FundHolding {
  id: string
  clientName: string
  clientID: string
  fundCode: string
  fundName: string
  purchaseAmount: number
  purchaseShares: number
  purchaseDate: Date
  remarks: string
  currentNav: number
  navDate: Date
  isValid: boolean
  isPinned: boolean
  pinnedTimestamp?: Date
  navReturn1m?: number
  navReturn3m?: number
  navReturn6m?: number
  navReturn1y?: number
}

export interface ProfitResult {
  absolute: number
  annualized: number
}

export interface LogEntry {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'network' | 'cache'
  timestamp: Date
}

export interface TableColumn {
  id: string
  title: string
  keyPath: string
  isSelected: boolean
}

export interface APIFilterState {
  selectedLogTypes: string[]
  expandedLogTypes: string[]
}

export interface ExportHistoryItem {
  id: number
  filename: string
  filesize: string
  date: string
  format: string
  records: number
  data: string | null
}

export interface ImportSettings {
  overwrite: boolean
  skipDuplicates: boolean
  autoFetchFundInfo: boolean
}

export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system'
  isPrivacyMode: boolean
  selectedFundAPI: string
  selectedLogTypes: string[]
  expandedLogTypes: string[]
  exportHistory: ExportHistoryItem[]
  importSettings: ImportSettings
  showRefreshButton: boolean
}

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

const createFundHolding = (data: Partial<FundHolding> = {}): FundHolding => ({
  id: data.id || crypto.randomUUID(),
  clientName: data.clientName || '',
  clientID: data.clientID || '',
  fundCode: data.fundCode || '',
  fundName: data.fundName || '未加载',
  purchaseAmount: data.purchaseAmount || 0,
  purchaseShares: data.purchaseShares || 0,
  purchaseDate: data.purchaseDate || new Date(),
  remarks: data.remarks || '',
  currentNav: data.currentNav || 0,
  navDate: data.navDate || new Date(),
  isValid: data.isValid || false,
  isPinned: data.isPinned || false,
  pinnedTimestamp: data.pinnedTimestamp,
  navReturn1m: data.navReturn1m,
  navReturn3m: data.navReturn3m,
  navReturn6m: data.navReturn6m,
  navReturn1y: data.navReturn1y
})

const isValidHolding = (holding: FundHolding): boolean => {
  return !!(holding.clientName &&
           holding.fundCode &&
           holding.purchaseAmount > 0 &&
           holding.purchaseShares > 0)
}

const convertHoldingToFundHolding = (holding: any): FundHolding => {
  return {
    id: holding.id || crypto.randomUUID(),
    clientName: holding.client_name || holding.clientName || '',
    clientID: holding.client_id || holding.clientID || '',
    fundCode: holding.fund_code || holding.fundCode || '',
    fundName: holding.fund_name || holding.fundName || '未加载',
    purchaseAmount: holding.purchase_amount || holding.purchaseAmount || 0,
    purchaseShares: holding.purchase_shares || holding.purchaseShares || 0,
    purchaseDate: new Date(holding.purchase_date || holding.purchaseDate || new Date()),
    remarks: holding.remarks || '',
    currentNav: holding.current_nav || holding.currentNav || 0,
    navDate: new Date(holding.nav_date || holding.navDate || new Date()),
    isValid: true,
    isPinned: holding.is_pinned || holding.isPinned || false,
    pinnedTimestamp: holding.pinned_timestamp || holding.pinnedTimestamp ? new Date(holding.pinned_timestamp || holding.pinnedTimestamp) : undefined,
    navReturn1m: holding.nav_return_1m || holding.navReturn1m,
    navReturn3m: holding.nav_return_3m || holding.navReturn3m,
    navReturn6m: holding.nav_return_6m || holding.navReturn6m,
    navReturn1y: holding.nav_return_1y || holding.navReturn1y
  }
}

const convertFundHoldingToHolding = (fundHolding: FundHolding): any => {
  return {
    id: fundHolding.id,
    client_name: fundHolding.clientName,
    client_id: fundHolding.clientID,
    fund_code: fundHolding.fundCode,
    fund_name: fundHolding.fundName,
    purchase_date: fundHolding.purchaseDate.toISOString().split('T')[0],
    purchase_amount: fundHolding.purchaseAmount,
    purchase_shares: fundHolding.purchaseShares,
    current_nav: fundHolding.currentNav,
    nav_date: fundHolding.navDate.toISOString().split('T')[0],
    is_pinned: fundHolding.isPinned,
    pinned_timestamp: fundHolding.pinnedTimestamp?.toISOString() || null,
    remarks: fundHolding.remarks,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    nav_return_1m: fundHolding.navReturn1m,
    nav_return_3m: fundHolding.navReturn3m,
    nav_return_6m: fundHolding.navReturn6m,
    nav_return_1y: fundHolding.navReturn1y
  }
}

// API基础URL，从环境变量获取或使用默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cfms.crnas.uk:8315'

export const useDataStore = defineStore('data', () => {
  const holdings = ref<FundHolding[]>([])
  const logMessages = ref<LogEntry[]>([])
  
  const isPrivacyMode = ref(true)
  const isRefreshing = ref(false)
  const refreshProgress = reactive({ current: 0, total: 0 })
  const toastMessage = ref('')
  const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')
  const toastIcon = ref('')
  const showToast = ref(false)
  const showRefreshButton = ref(false)
  const autoHideRefreshButtonTimer = ref<number | null>(null)
  
  const userPreferences = ref<UserPreferences>({
    themeMode: (localStorage.getItem('theme_mode') as 'light' | 'dark' | 'system') || 'system',
    isPrivacyMode: true,
    selectedFundAPI: 'eastmoney',
    selectedLogTypes: ['info', 'success', 'error', 'warning', 'network', 'cache'],
    expandedLogTypes: ['info', 'success', 'error', 'warning', 'network', 'cache'],
    exportHistory: [],
    importSettings: {
      overwrite: false,
      skipDuplicates: true,
      autoFetchFundInfo: true
    },
    showRefreshButton: false
  })

  const fundCache = ref<Map<string, CachedFundInfo>>(new Map())

  // 🔴 添加防卫标志，防止递归调用
  let isSaving = false
  let isLogging = false

  const holdingsCount = computed(() => holdings.value.length)
  
  const totalAssets = computed(() => {
    return holdings.value.reduce((total, holding) => {
      return total + (holding.currentNav * holding.purchaseShares)
    }, 0)
  })

  const totalInvestment = computed(() => {
    return holdings.value.reduce((total, holding) => {
      return total + holding.purchaseAmount
    }, 0)
  })

  const totalProfit = computed(() => {
    return holdings.value.reduce((total, holding) => {
      const profit = calculateProfit(holding)
      return total + profit.absolute
    }, 0)
  })

  const pinnedHoldings = computed(() => {
    return holdings.value
      .filter(holding => holding.isPinned)
      .sort((a, b) => {
        const timeA = a.pinnedTimestamp?.getTime() || 0
        const timeB = b.pinnedTimestamp?.getTime() || 0
        return timeB - timeA
      })
  })

  const groupedByClient = computed(() => {
    const groups: Record<string, FundHolding[]> = {}
    
    holdings.value.forEach(holding => {
      const key = `${holding.clientName}|${holding.clientID}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(holding)
    })
    
    return groups
  })

  const groupedByFund = computed(() => {
    const groups: Record<string, FundHolding[]> = {}
    
    holdings.value.forEach(holding => {
      const key = holding.fundCode
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(holding)
    })
    
    return groups
  })

  const isDarkMode = computed(() => {
    const mode = userPreferences.value.themeMode
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return mode === 'dark'
  })

  const loadFundCache = () => {
    try {
      const savedCache = localStorage.getItem('fundCache')
      if (savedCache) {
        const data = JSON.parse(savedCache)
        fundCache.value = new Map(Object.entries(data))
      }
    } catch (error) {
      console.error('加载基金缓存失败:', error)
      // 使用安全的日志记录，不触发保存
      safeAddLog('加载基金缓存失败', 'error', false)
    }
  }

  const saveFundCache = () => {
    try {
      const cacheObj: Record<string, CachedFundInfo> = {}
      fundCache.value.forEach((value, key) => {
        cacheObj[key] = value
      })
      localStorage.setItem('fundCache', JSON.stringify(cacheObj))
    } catch (error) {
      console.error('保存基金缓存失败:', error)
      // 使用安全的日志记录，不触发保存
      safeAddLog('保存基金缓存失败', 'error', false)
    }
  }

  const getFundFromCache = (code: string): CachedFundInfo | null => {
    const cached = fundCache.value.get(code)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000
    if (isExpired) {
      return null
    }
    
    return cached
  }

  const saveToFundCache = (code: string, data: CachedFundInfo) => {
    fundCache.value.set(code, data)
    saveFundCache()
  }

  const clearFundCache = () => {
    fundCache.value.clear()
    localStorage.removeItem('fundCache')
    addLog('基金缓存已清空', 'info')
  }

  // 🔴 添加数据库缓存相关方法
  const getFundFromDBCache = async (code: string): Promise<CachedFundInfo | null> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('[缓存] 未登录，跳过数据库缓存查询')
        return null
      }
      
      const response = await fetch(`${API_BASE_URL}/api/fund/cache/get?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // 转换格式
        return {
          code: result.data.code,
          name: result.data.name,
          nav: result.data.nav,
          navDate: result.data.navDate,
          returns: result.data.returns,
          timestamp: Date.now()
        }
      }
      
      return null
      
    } catch (error) {
      console.error('获取数据库缓存失败:', error)
      return null
    }
  }

  const saveToDBCache = async (code: string, data: CachedFundInfo): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('[缓存] 未登录，跳过保存到数据库缓存')
        return false
      }
      
      const fundData = {
        code: data.code,
        name: data.name,
        nav: data.nav,
        navDate: data.navDate,
        isValid: true,
        returns: data.returns
      }
      
      const response = await fetch(`${API_BASE_URL}/api/fund/cache/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fundData })
      })
      
      if (!response.ok) {
        return false
      }
      
      const result = await response.json()
      return result.success || false
      
    } catch (error) {
      console.error('保存到数据库缓存失败:', error)
      return false
    }
  }

  const clearDBCache = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('[缓存] 未登录，跳过清空数据库缓存')
        return false
      }
      
      const response = await fetch(`${API_BASE_URL}/api/fund/cache/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        return false
      }
      
      const result = await response.json()
      
      if (result.success) {
        addLog('数据库基金缓存已清空', 'info')
      }
      
      return result.success || false
      
    } catch (error) {
      console.error('清空数据库缓存失败:', error)
      return false
    }
  }

  const loadData = () => {
    try {
      const savedHoldings = localStorage.getItem('fundHoldings')
      if (savedHoldings) {
        const data = JSON.parse(savedHoldings)
        holdings.value = data.map((item: any) => ({
          ...createFundHolding(),
          ...item,
          purchaseDate: new Date(item.purchaseDate),
          navDate: new Date(item.navDate),
          pinnedTimestamp: item.pinnedTimestamp ? new Date(item.pinnedTimestamp) : undefined
        }))
      }
      
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        const data = JSON.parse(savedPreferences)
        userPreferences.value = { ...userPreferences.value, ...data }
        
        isPrivacyMode.value = userPreferences.value.isPrivacyMode ?? true
        showRefreshButton.value = userPreferences.value.showRefreshButton || false
      }
      
      const savedLogs = localStorage.getItem('fundLogs')
      if (savedLogs) {
        const logs = JSON.parse(savedLogs)
        logMessages.value = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
      }
      
      const savedExportHistory = localStorage.getItem('exportHistory')
      if (savedExportHistory) {
        userPreferences.value.exportHistory = JSON.parse(savedExportHistory)
      }
      
      loadFundCache()
      
    } catch (error) {
      console.error('数据加载失败:', error)
      showToastMessage('数据加载失败')
    }
  }

  const saveData = () => {
    // 🔴 检查防卫标志，防止递归调用
    if (isSaving) {
      console.warn('正在保存中，防止递归，跳过本次保存')
      return
    }
    
    isSaving = true
    
    try {
      const holdingsData = holdings.value.map(holding => ({
        id: holding.id,
        clientName: holding.clientName,
        clientID: holding.clientID,
        fundCode: holding.fundCode,
        purchaseAmount: holding.purchaseAmount,
        purchaseShares: holding.purchaseShares,
        purchaseDate: holding.purchaseDate.toISOString(),
        remarks: holding.remarks,
        fundName: holding.fundName,
        currentNav: holding.currentNav,
        navDate: holding.navDate.toISOString(),
        isPinned: holding.isPinned,
        pinnedTimestamp: holding.pinnedTimestamp?.toISOString() || null,
        isValid: holding.isValid,
        navReturn1m: holding.navReturn1m,
        navReturn3m: holding.navReturn3m,
        navReturn6m: holding.navReturn6m,
        navReturn1y: holding.navReturn1y
      }))
      localStorage.setItem('fundHoldings', JSON.stringify(holdingsData))
      
      userPreferences.value.isPrivacyMode = isPrivacyMode.value
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
      
      localStorage.setItem('theme_mode', userPreferences.value.themeMode)
      
      const logsToSave = logMessages.value.slice(-500).map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      }))
      localStorage.setItem('fundLogs', JSON.stringify(logsToSave))
      
      localStorage.setItem('exportHistory', JSON.stringify(userPreferences.value.exportHistory))
      
      // 🔴 移除记录"数据已成功保存"的日志，因为这是触发递归的原因
      // 不再调用：addLog('数据已成功保存', 'cache')
      
    } catch (error) {
      console.error('数据保存失败:', error)
      showToastMessage('数据保存失败')
      
      // 🔴 安全的错误日志记录，不触发保存
      safeAddLog(`保存全局错误: ${error instanceof Error ? error.message : '未知错误'}`, 'error', false)
    } finally {
      isSaving = false
    }
  }

  // 🔴 添加安全的日志记录函数，可控制是否触发保存
  const safeAddLog = (message: string, type: LogEntry['type'] = 'info', shouldSave: boolean = true) => {
    if (isLogging) {
      return
    }
    
    isLogging = true
    
    try {
      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: new Date()
      }
      
      logMessages.value.push(logEntry)
      
      if (logMessages.value.length > 500) {
        logMessages.value = logMessages.value.slice(-500)
      }
      
      if (shouldSave && !isSaving) {
        saveData()
      }
    } finally {
      isLogging = false
    }
  }

  const updateThemeMode = (mode: 'light' | 'dark' | 'system') => {
    const oldMode = userPreferences.value.themeMode
    userPreferences.value.themeMode = mode
    localStorage.setItem('theme_mode', mode)
    saveData()
    
    addLog(`主题模式切换为: ${mode === 'system' ? '跟随系统' : mode === 'light' ? '浅色' : '深色'}`, 'info')
    
    const event = new CustomEvent('theme-changed', {
      detail: {
        mode: mode,
        oldMode: oldMode,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(event)
  }

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    const oldPrivacyMode = isPrivacyMode.value
    const oldThemeMode = userPreferences.value.themeMode
    
    userPreferences.value = { ...userPreferences.value, ...preferences }
    
    if (preferences.themeMode && preferences.themeMode !== oldThemeMode) {
      updateThemeMode(preferences.themeMode)
    }
    
    if (preferences.isPrivacyMode !== undefined) {
      isPrivacyMode.value = preferences.isPrivacyMode
      
      const event = new CustomEvent('privacy-mode-changed', {
        detail: {
          enabled: preferences.isPrivacyMode,
          oldValue: oldPrivacyMode,
          timestamp: Date.now()
        }
      })
      window.dispatchEvent(event)
    }
    
    if (preferences.showRefreshButton !== undefined) {
      showRefreshButton.value = preferences.showRefreshButton
    }
    
    saveData()
  }

  const updateAPIFilterState = (filterState: Partial<APIFilterState>) => {
    if (filterState.selectedLogTypes) {
      userPreferences.value.selectedLogTypes = filterState.selectedLogTypes
    }
    if (filterState.expandedLogTypes) {
      userPreferences.value.expandedLogTypes = filterState.expandedLogTypes
    }
    saveData()
  }

  const updateImportSettings = (settings: Partial<ImportSettings>) => {
    userPreferences.value.importSettings = {
      ...userPreferences.value.importSettings,
      ...settings
    }
    saveData()
  }

  const addExportHistory = (item: ExportHistoryItem) => {
    userPreferences.value.exportHistory.unshift(item)
    if (userPreferences.value.exportHistory.length > 10) {
      userPreferences.value.exportHistory = userPreferences.value.exportHistory.slice(0, 10)
    }
    saveData()
  }

  const deleteExportHistory = (id: number) => {
    userPreferences.value.exportHistory = userPreferences.value.exportHistory.filter(
      item => item.id !== id
    )
    saveData()
  }

  const addHolding = (holdingData: Partial<FundHolding>): FundHolding => {
    try {
      const newHolding = createFundHolding(holdingData)
      
      if (!isValidHolding(newHolding)) {
        throw new Error('持仓数据无效')
      }
      
      holdings.value.push(newHolding)
      saveData()
      
      addLog(`添加新持仓: ${newHolding.clientName} - ${newHolding.fundCode}`, 'info')
      
      showToastMessage('持仓添加成功', 'success')
      
      return newHolding
    } catch (error: any) {
      console.error('添加持仓失败:', error)
      showToastMessage(`添加失败: ${error.message}`, 'error')
      throw error
    }
  }

  const updateHolding = (holdingId: string, updates: Partial<FundHolding>): FundHolding => {
    try {
      const index = holdings.value.findIndex(h => h.id === holdingId)
      if (index === -1) {
        throw new Error('持仓记录不存在')
      }
      
      const updatedHolding = {
        ...holdings.value[index],
        ...updates,
        id: holdingId
      }
      
      if (!isValidHolding(updatedHolding)) {
        throw new Error('更新后的数据无效')
      }
      
      holdings.value[index] = updatedHolding
      saveData()
      
      addLog(`更新持仓: ${updatedHolding.clientName} - ${updatedHolding.fundCode}`, 'info')
      
      showToastMessage('持仓更新成功', 'success')
      
      return updatedHolding
    } catch (error: any) {
      console.error('更新持仓失败:', error)
      showToastMessage(`更新失败: ${error.message}`, 'error')
      throw error
    }
  }

  const deleteHolding = (holdingId: string) => {
    try {
      const index = holdings.value.findIndex(h => h.id === holdingId)
      if (index === -1) {
        throw new Error('持仓记录不存在')
      }
      
      const holding = holdings.value[index]
      holdings.value.splice(index, 1)
      saveData()
      
      addLog(`删除持仓: ${holding.clientName} - ${holding.fundCode}`, 'warning')
      
      console.log('删除持仓:', holdingId)
      showToastMessage('持仓删除成功', 'success')
    } catch (error: any) {
      console.error('删除持仓失败:', error)
      showToastMessage(`删除失败: ${error.message}`, 'error')
      throw error
    }
  }

  const clearAllHoldings = () => {
    try {
      const count = holdings.value.length
      holdings.value = []
      saveData()
      
      addLog(`清空所有持仓数据，共${count}条记录`, 'warning')
      showToastMessage(`已清空${count}条持仓记录`, 'info')
      
      return count
    } catch (error: any) {
      console.error('清空持仓失败:', error)
      showToastMessage(`清空失败: ${error.message}`, 'error')
      throw error
    }
  }

  const calculateProfit = (holding: FundHolding): ProfitResult => {
    const currentMarketValue = holding.currentNav * holding.purchaseShares
    const absoluteProfit = currentMarketValue - holding.purchaseAmount

    const startDate = new Date(holding.purchaseDate)
    const endDate = new Date(holding.navDate)
    const daysHeld = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

    const annualizedReturn = daysHeld > 0 ? (absoluteProfit / holding.purchaseAmount) / daysHeld * 365 * 100 : 0

    return {
      absolute: absoluteProfit,
      annualized: annualizedReturn
    }
  }

  const togglePinStatus = (holdingId: string) => {
    const index = holdings.value.findIndex(h => h.id === holdingId)
    if (index !== -1) {
      const holding = holdings.value[index]
      holding.isPinned = !holding.isPinned
      holding.pinnedTimestamp = holding.isPinned ? new Date() : undefined
      
      holdings.value.splice(index, 1)
      if (holding.isPinned) {
        holdings.value.unshift(holding)
      } else {
        holdings.value.push(holding)
      }
      
      saveData()
      
      addLog(`切换置顶状态: ${holding.fundCode} - ${holding.isPinned ? '置顶' : '取消置顶'}`, 'info')
      
      showToastMessage(`${holding.fundCode} ${holding.isPinned ? '已置顶' : '已取消置顶'}`, 'info')
    }
  }

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    // 🔴 使用安全的日志记录函数
    safeAddLog(message, type, true)
  }

  const clearLogs = () => {
    logMessages.value = []
    saveData()
    showToastMessage('日志已清空', 'info')
  }

  const showToastMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', icon?: string) => {
    toastMessage.value = message
    toastType.value = type
    toastIcon.value = icon || ''
    showToast.value = true
    
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  const startRefresh = () => {
    isRefreshing.value = true
    refreshProgress.current = 0
    refreshProgress.total = holdings.value.length
    
    addLog('开始刷新持仓数据', 'info')
  }

  const updateRefreshProgress = (current: number) => {
    refreshProgress.current = current
  }

  const completeRefresh = () => {
    isRefreshing.value = false
    refreshProgress.current = 0
    refreshProgress.total = 0
    
    addLog('持仓数据刷新完成', 'success')
    showToastMessage('数据刷新完成', 'success')
  }

  const startAutoHideRefreshButton = () => {
    // 清除现有的定时器
    if (autoHideRefreshButtonTimer.value) {
      clearTimeout(autoHideRefreshButtonTimer.value)
    }
    
    // 显示刷新按钮
    showRefreshButton.value = true
    
    // 设置3秒后自动隐藏
    autoHideRefreshButtonTimer.value = window.setTimeout(() => {
      showRefreshButton.value = false
      autoHideRefreshButtonTimer.value = null
    }, 3000)
  }

  const getClientDisplayName = (clientName: string, clientID?: string): string => {
    let displayName = clientName
    
    if (isPrivacyMode.value) {
      if (clientName.length <= 1) {
        displayName = clientName
      } else if (clientName.length === 2) {
        displayName = clientName.charAt(0) + '*'
      } else {
        displayName = clientName.charAt(0) + '*'.repeat(clientName.length - 2) + clientName.charAt(clientName.length - 1)
      }
    }
    
    if (clientID) {
      return `${displayName}(${clientID})`
    } else {
      return displayName
    }
  }

  const getSortedFundCodes = (sortKey: string = 'none', sortOrder: 'ascending' | 'descending' = 'descending'): string[] => {
    const groups = groupedByFund.value
    const codes = Object.keys(groups)
    
    if (sortKey === 'none') {
      return codes.sort()
    }
    
    return codes.sort((code1, code2) => {
      const fund1 = groups[code1]?.[0]
      const fund2 = groups[code2]?.[0]
      
      if (!fund1 || !fund2) return 0
      
      let value1 = 0
      let value2 = 0
      
      switch (sortKey) {
        case 'navReturn1m': value1 = fund1.navReturn1m || 0; value2 = fund2.navReturn1m || 0; break
        case 'navReturn3m': value1 = fund1.navReturn3m || 0; value2 = fund2.navReturn3m || 0; break
        case 'navReturn6m': value1 = fund1.navReturn6m || 0; value2 = fund2.navReturn6m || 0; break
        case 'navReturn1y': value1 = fund1.navReturn1y || 0; value2 = fund2.navReturn1y || 0; break
      }
      
      return sortOrder === 'ascending' ? value1 - value2 : value2 - value1
    })
  }

  const init = () => {
    loadData()
  }

  return {
    holdings,
    logMessages,
    isPrivacyMode,
    isRefreshing,
    refreshProgress,
    toastMessage,
    toastType,
    toastIcon,
    showToast,
    showRefreshButton,
    userPreferences,
    fundCache,
    
    isDarkMode,
    
    holdingsCount,
    totalAssets,
    totalInvestment,
    totalProfit,
    pinnedHoldings,
    groupedByClient,
    groupedByFund,
    
    loadData,
    saveData,
    init,
    
    updateThemeMode,
    
    addHolding,
    updateHolding,
    deleteHolding,
    clearAllHoldings,
    calculateProfit,
    togglePinStatus,
    
    addLog,
    clearLogs,
    
    updateUserPreferences,
    updateAPIFilterState,
    updateImportSettings,
    addExportHistory,
    deleteExportHistory,
    
    showToastMessage,
    startRefresh,
    updateRefreshProgress,
    completeRefresh,
    startAutoHideRefreshButton,
    getClientDisplayName,
    getSortedFundCodes,
    
    loadFundCache,
    saveFundCache,
    getFundFromCache,
    saveToFundCache,
    clearFundCache,
    
    convertHoldingToFundHolding,
    convertFundHoldingToHolding,
    
    // 🔴 新增数据库缓存相关方法
    getFundFromDBCache,
    saveToDBCache,
    clearDBCache
  }
})