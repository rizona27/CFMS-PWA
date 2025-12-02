import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FundHolding, ProfitResult } from '../models/FundModels'

export const useDataStore = defineStore('data', () => {
  // 状态
  const holdings = ref<FundHolding[]>([])
  const isPrivacyMode = ref(true)
  const isRefreshing = ref(false)
  const refreshProgress = ref({ current: 0, total: 0 })
  const toastMessage = ref('')
  const showToast = ref(false)

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

  // 方法
  function loadData() {
    try {
      // 加载持仓数据
      const savedHoldings = localStorage.getItem('fundHoldings')
      if (savedHoldings) {
        const data = JSON.parse(savedHoldings)
        holdings.value = data.map((item: any) => new FundHolding(item))
        console.log('持仓数据加载成功，数量:', holdings.value.length)
      }
      
      // 加载隐私模式设置
      const savedPrivacyMode = localStorage.getItem('isPrivacyModeEnabled')
      if (savedPrivacyMode !== null) {
        isPrivacyMode.value = JSON.parse(savedPrivacyMode)
      }
      
      console.log('数据加载完成')
    } catch (error) {
      console.error('数据加载失败:', error)
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
      
      console.log('数据保存成功')
    } catch (error) {
      console.error('数据保存失败:', error)
    }
  }

  function addHolding(holdingData: Partial<FundHolding>): FundHolding {
    try {
      const newHolding = new FundHolding(holdingData)
      
      if (!newHolding.isValidHolding) {
        throw new Error('持仓数据无效')
      }
      
      holdings.value.push(newHolding)
      saveData()
      
      console.log('添加新持仓:', newHolding.fundCode, newHolding.clientName)
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
      
      const updatedHolding = new FundHolding({
        ...holdings.value[index],
        ...updates
      })
      
      if (!updatedHolding.isValidHolding) {
        throw new Error('更新后的数据无效')
      }
      
      holdings.value[index] = updatedHolding
      saveData()
      
      console.log('更新持仓:', updatedHolding.fundCode)
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
      
      holdings.value.splice(index, 1)
      saveData()
      
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
      holding.pinnedTimestamp = holding.isPinned ? new Date() : null
      
      // 重新排序数组，让置顶的显示在前面
      holdings.value.splice(index, 1)
      if (holding.isPinned) {
        holdings.value.unshift(holding)
      } else {
        holdings.value.push(holding)
      }
      
      saveData()
      console.log('切换置顶状态:', holding.fundCode, holding.isPinned)
    }
  }

  function showToastMessage(message: string, duration: number = 3000) {
    toastMessage.value = message
    showToast.value = true
    
    setTimeout(() => {
      showToast.value = false
    }, duration)
  }

  function startRefresh() {
    isRefreshing.value = true
    refreshProgress.value = { current: 0, total: holdings.value.length }
  }

  function completeRefresh() {
    isRefreshing.value = false
    refreshProgress.value = { current: 0, total: 0 }
  }

  // 初始化
  function init() {
    loadData()
    console.log('DataStore初始化完成')
  }

  return {
    // 状态
    holdings,
    isPrivacyMode,
    isRefreshing,
    refreshProgress,
    toastMessage,
    showToast,
    
    // 计算属性
    holdingsCount,
    totalAssets,
    totalInvestment,
    totalProfit,
    pinnedHoldings,
    
    // 方法
    loadData,
    saveData,
    addHolding,
    updateHolding,
    deleteHolding,
    calculateProfit,
    togglePinStatus,
    showToastMessage,
    startRefresh,
    completeRefresh,
    init
  }
})