import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

// 定义类型
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

// 初始化一个默认的FundHolding实例
const createFundHolding = (data: Partial<FundHolding> = {}): FundHolding => ({
  id: data.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

// 验证持仓是否有效
const isValidHolding = (holding: FundHolding): boolean => {
  return !!(holding.clientName && 
           holding.fundCode && 
           holding.purchaseAmount > 0 && 
           holding.purchaseShares > 0)
}

export const useDataStore = defineStore('data', () => {
  // 状态
  const holdings = ref<FundHolding[]>([])
  const logMessages = ref<LogEntry[]>([])
  const isPrivacyMode = ref(true)
  const isRefreshing = ref(false)
  const refreshProgress = reactive({ current: 0, total: 0 })
  const toastMessage = ref('')
  const showToast = ref(false)
  const showRefreshButton = ref(false)

  // 计算属性
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
        return timeB - timeA // 最新的在前面
      })
  })

  // 获取按客户分组的持仓
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

  // 获取按基金代码分组的持仓
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

  // 方法
  function loadData() {
    try {
      // 加载持仓数据
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
        console.log('持仓数据加载成功，数量:', holdings.value.length)
      }
      
      // 加载隐私模式设置
      const savedPrivacyMode = localStorage.getItem('isPrivacyModeEnabled')
      if (savedPrivacyMode !== null) {
        isPrivacyMode.value = JSON.parse(savedPrivacyMode)
      }
      
      // 加载日志
      const savedLogs = localStorage.getItem('fundLogs')
      if (savedLogs) {
        const logs = JSON.parse(savedLogs)
        logMessages.value = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
      }
      
      console.log('数据加载完成')
    } catch (error) {
      console.error('数据加载失败:', error)
      showToastMessage('数据加载失败')
    }
  }

  function saveData() {
    try {
      // 保存持仓数据
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
      
      // 保存隐私模式设置
      localStorage.setItem('isPrivacyModeEnabled', JSON.stringify(isPrivacyMode.value))
      
      // 保存日志（最多保留500条）
      const logsToSave = logMessages.value.slice(-500).map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      }))
      localStorage.setItem('fundLogs', JSON.stringify(logsToSave))
      
      console.log('数据保存成功')
    } catch (error) {
      console.error('数据保存失败:', error)
      showToastMessage('数据保存失败')
    }
  }

  function addHolding(holdingData: Partial<FundHolding>): FundHolding {
    try {
      const newHolding = createFundHolding(holdingData)
      
      if (!isValidHolding(newHolding)) {
        throw new Error('持仓数据无效')
      }
      
      holdings.value.push(newHolding)
      saveData()
      
      // 添加日志
      addLog(`添加新持仓: ${newHolding.clientName} - ${newHolding.fundCode}`, 'info')
      
      showToastMessage('持仓添加成功')
      
      return newHolding
    } catch (error: any) {
      console.error('添加持仓失败:', error)
      showToastMessage(`添加失败: ${error.message}`)
      throw error
    }
  }

  function updateHolding(holdingId: string, updates: Partial<FundHolding>): FundHolding {
    try {
      const index = holdings.value.findIndex(h => h.id === holdingId)
      if (index === -1) {
        throw new Error('持仓记录不存在')
      }
      
      const updatedHolding = {
        ...holdings.value[index],
        ...updates,
        id: holdingId // 确保ID不变
      }
      
      if (!isValidHolding(updatedHolding)) {
        throw new Error('更新后的数据无效')
      }
      
      holdings.value[index] = updatedHolding
      saveData()
      
      // 添加日志
      addLog(`更新持仓: ${updatedHolding.clientName} - ${updatedHolding.fundCode}`, 'info')
      
      showToastMessage('持仓更新成功')
      
      return updatedHolding
    } catch (error: any) {
      console.error('更新持仓失败:', error)
      showToastMessage(`更新失败: ${error.message}`)
      throw error
    }
  }

  function deleteHolding(holdingId: string) {
    try {
      const index = holdings.value.findIndex(h => h.id === holdingId)
      if (index === -1) {
        throw new Error('持仓记录不存在')
      }
      
      const holding = holdings.value[index]
      holdings.value.splice(index, 1)
      saveData()
      
      // 添加日志
      addLog(`删除持仓: ${holding.clientName} - ${holding.fundCode}`, 'warning')
      
      console.log('删除持仓:', holdingId)
      showToastMessage('持仓删除成功')
    } catch (error: any) {
      console.error('删除持仓失败:', error)
      showToastMessage(`删除失败: ${error.message}`)
      throw error
    }
  }

  function calculateProfit(holding: FundHolding): ProfitResult {
    const currentMarketValue = holding.currentNav * holding.purchaseShares
    const absoluteProfit = currentMarketValue - holding.purchaseAmount

    // 计算持有天数
    const startDate = new Date(holding.purchaseDate)
    const endDate = new Date(holding.navDate)
    const daysHeld = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

    // 计算年化收益率
    const annualizedReturn = daysHeld > 0 ? (absoluteProfit / holding.purchaseAmount) / daysHeld * 365 * 100 : 0

    return {
      absolute: absoluteProfit,
      annualized: annualizedReturn
    }
  }

  function togglePinStatus(holdingId: string) {
    const index = holdings.value.findIndex(h => h.id === holdingId)
    if (index !== -1) {
      const holding = holdings.value[index]
      holding.isPinned = !holding.isPinned
      holding.pinnedTimestamp = holding.isPinned ? new Date() : undefined
      
      // 重新排序数组，让置顶的显示在前面
      holdings.value.splice(index, 1)
      if (holding.isPinned) {
        holdings.value.unshift(holding)
      } else {
        holdings.value.push(holding)
      }
      
      saveData()
      
      // 添加日志
      addLog(`切换置顶状态: ${holding.fundCode} - ${holding.isPinned ? '置顶' : '取消置顶'}`, 'info')
      
      showToastMessage(`${holding.fundCode} ${holding.isPinned ? '已置顶' : '已取消置顶'}`)
    }
  }

  function addLog(message: string, type: LogEntry['type'] = 'info') {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    }
    
    logMessages.value.push(logEntry)
    
    // 限制日志数量
    if (logMessages.value.length > 500) {
      logMessages.value = logMessages.value.slice(-500)
    }
    
    // 保存日志
    saveData()
  }

  function clearLogs() {
    logMessages.value = []
    saveData()
    showToastMessage('日志已清空')
  }

  function showToastMessage(message: string) {
    toastMessage.value = message
    showToast.value = true
    
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  function startRefresh() {
    isRefreshing.value = true
    refreshProgress.current = 0
    refreshProgress.total = holdings.value.length
    
    // 添加日志
    addLog('开始刷新持仓数据', 'info')
  }

  function updateRefreshProgress(current: number) {
    refreshProgress.current = current
  }

  function completeRefresh() {
    isRefreshing.value = false
    refreshProgress.current = 0
    refreshProgress.total = 0
    
    // 添加日志
    addLog('持仓数据刷新完成', 'success')
    showToastMessage('数据刷新完成')
  }

  // 获取客户名称（考虑隐私模式）
  function getClientDisplayName(clientName: string): string {
    if (!isPrivacyMode.value) {
      return clientName
    }
    
    if (clientName.length <= 1) {
      return clientName
    } else if (clientName.length === 2) {
      return clientName.charAt(0) + '*'
    } else {
      return clientName.charAt(0) + '*'.repeat(clientName.length - 2) + clientName.charAt(clientName.length - 1)
    }
  }

  // 获取基金分组排序后的代码列表
  function getSortedFundCodes(sortKey: string = 'none', sortOrder: 'ascending' | 'descending' = 'descending'): string[] {
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

  // 初始化
  function init() {
    loadData()
    console.log('DataStore初始化完成')
  }

  return {
    // 状态
    holdings,
    logMessages,
    isPrivacyMode,
    isRefreshing,
    refreshProgress,
    toastMessage,
    showToast,
    showRefreshButton,
    
    // 计算属性
    holdingsCount,
    totalAssets,
    totalInvestment,
    totalProfit,
    pinnedHoldings,
    groupedByClient,
    groupedByFund,
    
    // 方法
    loadData,
    saveData,
    addHolding,
    updateHolding,
    deleteHolding,
    calculateProfit,
    togglePinStatus,
    addLog,
    clearLogs,
    showToastMessage,
    startRefresh,
    updateRefreshProgress,
    completeRefresh,
    getClientDisplayName,
    getSortedFundCodes,
    init
  }
})