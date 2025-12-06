<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { fundService } from '@/services/fundService'

const router = useRouter()
const dataStore = useDataStore()

// 重新渲染键
const refreshKey = ref(0)
const privacyKey = ref(0)

// 状态
const isSearchExpanded = ref(false)
const searchText = ref('')
const expandedClients = ref<Set<string>>(new Set())
const isRefreshing = ref(false)
const updatingTextState = ref(0)
const updatingTextTimer = ref<number | null>(null)
const loadedGroupedClientCount = ref(10)
const loadedSearchResultCount = ref(10)
const refreshID = ref(0)
const swipedHoldingStates = ref<Record<string, { isSwiped: boolean; dragOffset: number }>>({})

// 计算属性
const holdings = computed(() => dataStore.holdings)
const isPrivacyMode = computed(() => dataStore.isPrivacyMode)
const showRefreshButton = computed(() => dataStore.showRefreshButton)
const refreshProgress = computed(() => dataStore.refreshProgress)
const pinnedHoldings = computed(() => dataStore.pinnedHoldings)
const groupedByClient = computed(() => dataStore.groupedByClient)

const previousWorkday = computed(() => {
  const today = new Date()
  const date = new Date(today)
  
  while (true) {
    date.setDate(date.getDate() - 1)
    const weekday = date.getDay()
    if (weekday >= 1 && weekday <= 5) {
      return date
    }
  }
})

const latestNavDate = computed(() => {
  const validHoldings = holdings.value.filter(h => h.isValid && h.navDate <= new Date())
  if (validHoldings.length === 0) return null
  
  return validHoldings.reduce((latest, holding) => {
    const date = new Date(holding.navDate)
    return date > latest ? date : latest
  }, new Date(0))
})

const hasLatestNavDate = computed(() => {
  if (holdings.value.length === 0 || holdings.value.every(h => !h.isValid)) {
    return false
  }
  
  const previousWorkdayStart = previousWorkday.value
  return holdings.value.some(holding => {
    return holding.isValid && isSameDay(new Date(holding.navDate), previousWorkdayStart)
  })
})

const outdatedClients = computed(() => {
  const previousWorkdayStart = previousWorkday.value
  const outdatedHoldings = holdings.value.filter(holding => {
    return holding.isValid && !isSameDay(new Date(holding.navDate), previousWorkdayStart)
  })
  return Array.from(new Set(outdatedHoldings.map(h => h.clientName)))
})

const latestNavDateString = computed(() => {
  const latestDate = latestNavDate.value
  if (!latestDate) return '暂无数据'
  
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' })
  const dateString = formatter.format(latestDate)
  
  if (hasLatestNavDate.value) {
    return `最新日期: ${dateString}`
  } else {
    const prevDateString = formatter.format(previousWorkday.value)
    return `待更新: ${prevDateString}`
  }
})

const groupedHoldingsByClientName = computed(() => {
  const allHoldings = holdings.value
  
  const groupedDictionary: Record<string, typeof allHoldings> = {}
  allHoldings.forEach(holding => {
    const key = holding.clientName
    if (!groupedDictionary[key]) {
      groupedDictionary[key] = []
    }
    groupedDictionary[key].push(holding)
  })
  
  const clientGroups = Object.entries(groupedDictionary).map(([clientName, holdings]) => {
    const totalAUM = holdings.reduce((sum, holding) => sum + (holding.currentNav * holding.purchaseShares), 0)
    const representativeClientID = holdings[0]?.clientID || ''
    
    const sortedHoldings = [...holdings].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      if (a.isPinned && b.isPinned) {
        const timeA = a.pinnedTimestamp?.getTime() || 0
        const timeB = b.pinnedTimestamp?.getTime() || 0
        return timeB - timeA
      }
      
      return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    })
    
    return {
      id: clientName,
      clientName,
      clientID: representativeClientID,
      totalAUM,
      holdings: sortedHoldings,
      isPinned: false,
      pinnedTimestamp: null as Date | null
    }
  })
  
  clientGroups.sort((a, b) => a.clientName.localeCompare(b.clientName, 'zh-CN'))
  
  return clientGroups
})

const sectionedClientGroups = computed(() => {
  const sections: Record<string, typeof groupedHoldingsByClientName.value> = {}
  
  if (pinnedHoldings.value.length > 0) {
    const pinnedClientGroup = {
      id: 'Pinned',
      clientName: '置顶分栏',
      clientID: '',
      totalAUM: pinnedHoldings.value.reduce((sum, holding) => sum + (holding.currentNav * holding.purchaseShares), 0),
      holdings: pinnedHoldings.value,
      isPinned: true,
      pinnedTimestamp: pinnedHoldings.value
        .map(h => h.pinnedTimestamp)
        .filter(Boolean)
        .reduce((latest, timestamp) => {
          const time = timestamp!.getTime()
          return time > (latest?.getTime() || 0) ? timestamp! : latest!
        }, null as Date | null)
    }
    sections['★'] = [pinnedClientGroup]
  }
  
  groupedHoldingsByClientName.value.forEach(group => {
    const firstChar = group.clientName.charAt(0).toUpperCase()
    if (!sections[firstChar]) {
      sections[firstChar] = []
    }
    sections[firstChar].push(group)
  })
  
  return sections
})

const sortedSectionKeys = computed(() => {
  return Object.keys(sectionedClientGroups.value).sort((char1, char2) => {
    if (char1 === '★') return -1
    if (char2 === '★') return 1
    if (char1 === '#') return 1
    if (char2 === '#') return -1
    return char1.localeCompare(char2, 'zh-CN')
  })
})

const areAnyCardsExpanded = computed(() => expandedClients.value.size > 0)

const searchResults = computed(() => {
  if (!searchText.value) return []
  
  const searchLower = searchText.value.toLowerCase()
  return holdings.value.filter(holding =>
    holding.clientName.toLowerCase().includes(searchLower) ||
    holding.fundCode.toLowerCase().includes(searchLower) ||
    holding.fundName.toLowerCase().includes(searchLower) ||
    holding.clientID.toLowerCase().includes(searchLower) ||
    holding.remarks.toLowerCase().includes(searchLower)
  )
})

const updatingText = computed(() => {
  const baseText = ''
  const dots = '.'.repeat(updatingTextState.value % 4)
  return baseText + dots
})

// 方法
const toggleAllCards = () => {
  if (areAnyCardsExpanded.value) {
    expandedClients.value.clear()
  } else {
    const allClientIds = new Set(groupedHoldingsByClientName.value.map(g => g.id))
    if (pinnedHoldings.value.length > 0) {
      allClientIds.add('Pinned')
    }
    expandedClients.value = allClientIds
  }
  dataStore.addLog(`客户视图: ${areAnyCardsExpanded.value ? '折叠' : '展开'}所有客户卡片`, 'info')
}

const toggleSearch = () => {
  isSearchExpanded.value = !isSearchExpanded.value
  if (!isSearchExpanded.value) {
    searchText.value = ''
  }
  dataStore.addLog(`客户视图: ${isSearchExpanded.value ? '显示' : '隐藏'}搜索框`, 'info')
}

const performSearch = (text: string) => {
  searchText.value = text
  if (text) {
    dataStore.addLog(`客户视图: 搜索 "${text}"`, 'info')
  }
}

const clearSearch = () => {
  searchText.value = ''
  dataStore.addLog('客户视图: 清除搜索', 'info')
}

const processClientName = (name: string): string => {
  if (!dataStore.isPrivacyMode) {
    return name
  }
  
  if (name.length <= 1) {
    return name
  } else if (name.length === 2) {
    return name.charAt(0) + '*'
  } else {
    return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
  }
}

const colorForHoldingCount = (count: number) => {
  if (count === 1) return '#eab308'
  if (count <= 3) return '#f97316'
  return '#ef4444'
}

const togglePin = (holdingId: string) => {
  dataStore.togglePinStatus(holdingId)
  refreshID.value++
  dataStore.addLog(`客户视图: 切换持仓置顶状态 (ID: ${holdingId.substring(0, 8)})`, 'info')
}

const calculateHoldingDays = (holding: any) => {
  const endDate = new Date(holding.navDate)
  const startDate = new Date(holding.purchaseDate)
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
}

const calculateProfit = (holding: any) => {
  if (!holding.isValid || holding.purchaseAmount <= 0) {
    return { absolute: 0, annualized: 0 }
  }
  
  const currentValue = holding.currentNav * holding.purchaseShares
  const absoluteProfit = currentValue - holding.purchaseAmount
  
  // 年化收益率计算
  const holdingDays = calculateHoldingDays(holding)
  const absoluteReturnPercentage = (absoluteProfit / holding.purchaseAmount) * 100
  const annualizedReturn = holdingDays > 0 ? 
    (Math.pow(1 + absoluteReturnPercentage / 100, 365 / holdingDays) - 1) * 100 : 0
  
  return {
    absolute: absoluteProfit,
    annualized: annualizedReturn
  }
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000 && amount % 10000 === 0) {
    return `${(amount / 10000).toFixed(0)}万`
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(2)}万`
  } else {
    return `${amount.toFixed(2)}元`
  }
}

const formatPercentage = (value: number) => {
  if (value > 0) {
    return `+${value.toFixed(2)}%`
  } else if (value < 0) {
    return `${value.toFixed(2)}%`
  } else {
    return '0.00%'
  }
}

const getReturnColor = (value: number) => {
  if (value > 0) return '#10b981'
  if (value < 0) return '#ef4444'
  return '#666'
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const onStatusTextTap = () => {
  if (holdings.value.length === 0) return
  
  showStatusText.value = false
  
  setTimeout(() => {
    dataStore.updateUserPreferences({ showRefreshButton: true })
    
    autoHideTimer.value = setTimeout(() => {
      if (!isRefreshing.value) {
        dataStore.updateUserPreferences({ showRefreshButton: false })
        
        setTimeout(() => {
          showStatusText.value = true
        }, 500)
      }
    }, 5000) as unknown as number
  }, 500)
}

const handleRefresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  startUpdatingTextAnimation()
  dataStore.startRefresh()
  dataStore.addLog('开始刷新基金数据', 'info')
  
  const total = holdings.value.length
  
  try {
    for (let i = 0; i < total; i++) {
      const holding = holdings.value[i]
      
      try {
        dataStore.addLog(`正在刷新基金 ${holding.fundCode} 数据...`, 'network')
        const fundInfo = await fundService.fetchFundInfo(holding.fundCode)
        
        if (fundInfo.name && fundInfo.nav > 0) {
          await dataStore.updateHolding(holding.id, {
            fundName: fundInfo.name,
            currentNav: fundInfo.nav,
            navDate: new Date(fundInfo.navDate),
            isValid: true,
            navReturn1m: fundInfo.returns?.navReturn1m,
            navReturn3m: fundInfo.returns?.navReturn3m,
            navReturn6m: fundInfo.returns?.navReturn6m,
            navReturn1y: fundInfo.returns?.navReturn1y
          })
          dataStore.addLog(`基金 ${holding.fundCode} 数据更新成功`, 'success')
        }
      } catch (error) {
        console.error(`刷新基金 ${holding.fundCode} 失败:`, error)
        dataStore.addLog(`基金 ${holding.fundCode} 数据更新失败: ${(error as Error).message}`, 'error')
      }
      
      dataStore.updateRefreshProgress(i + 1)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } finally {
    dataStore.completeRefresh()
    isRefreshing.value = false
    stopUpdatingTextAnimation()
    dataStore.addLog('基金数据刷新完成', 'success')
    
    // 强制重新渲染
    refreshKey.value = Date.now()
    
    setTimeout(() => {
      dataStore.updateUserPreferences({ showRefreshButton: false })
      
      setTimeout(() => {
        showStatusText.value = true
      }, 500)
    }, 1000)
  }
}

const startUpdatingTextAnimation = () => {
  updatingTextState.value = 0
  updatingTextTimer.value = setInterval(() => {
    updatingTextState.value = (updatingTextState.value + 1) % 4
  }, 500) as unknown as number
}

const stopUpdatingTextAnimation = () => {
  if (updatingTextTimer.value !== null) {
    clearInterval(updatingTextTimer.value)
    updatingTextTimer.value = null
  }
}

// 从dataStore获取状态
const showStatusText = computed({
  get: () => !dataStore.showRefreshButton,
  set: (value) => {
    if (!value) {
      dataStore.updateUserPreferences({ showRefreshButton: true })
    }
  }
})

// 隐私模式变化处理器
const handlePrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`ClientView: 隐私模式变化到 ${enabled}`)
  
  // 直接更新dataStore
  dataStore.isPrivacyMode = enabled
  
  // 强制重新渲染
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  
  dataStore.addLog(`隐私模式变化: ${enabled ? '开启' : '关闭'}`, 'info')
}

// 全局隐私模式变化处理器
const handleGlobalPrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`ClientView: 收到全局隐私模式变化事件: ${enabled}`)
  
  // 直接更新dataStore
  dataStore.isPrivacyMode = enabled
  
  // 强制重新渲染
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
}

// 主题变化处理器
const handleThemeChange = (event: any) => {
  const { theme } = event.detail
  console.log(`ClientView: 主题变化到 ${theme}`)
  applyThemeToDocument(theme)
  refreshKey.value = Date.now()
}

// 应用主题到文档
const applyThemeToDocument = (mode: string) => {
  const root = document.documentElement
  const body = document.body
  
  // 移除所有主题类
  root.classList.remove('theme-light', 'theme-dark', 'theme-system')
  body.classList.remove('light-mode', 'dark-mode')
  
  if (mode === 'dark') {
    root.classList.add('theme-dark')
    body.classList.add('dark-mode')
    updateCSSVariables('dark')
  } else if (mode === 'light') {
    root.classList.add('theme-light')
    body.classList.add('light-mode')
    updateCSSVariables('light')
  } else {
    root.classList.add('theme-system')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      body.classList.add('dark-mode')
      updateCSSVariables('dark')
    } else {
      body.classList.add('light-mode')
      updateCSSVariables('light')
    }
  }
  
  // 强制重绘
  nextTick(() => {
    void body.offsetHeight
  })
}

// 立即更新CSS变量
const updateCSSVariables = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.style.setProperty('--bg-primary', '#000000')
    root.style.setProperty('--bg-card', '#1c1c1e')
    root.style.setProperty('--bg-hover', '#2c2c2e')
    root.style.setProperty('--text-primary', '#ffffff')
    root.style.setProperty('--text-secondary', '#8e8e93')
    root.style.setProperty('--border-color', '#3a3a3c')
    root.style.setProperty('--accent-color', '#3b82f6')
    root.style.setProperty('--accent-color-rgb', '59, 130, 246')
  } else {
    root.style.setProperty('--bg-primary', '#f5f5f7')
    root.style.setProperty('--bg-card', '#ffffff')
    root.style.setProperty('--bg-hover', '#f0f7ff')
    root.style.setProperty('--text-primary', '#333333')
    root.style.setProperty('--text-secondary', '#666666')
    root.style.setProperty('--border-color', '#e5e5e7')
    root.style.setProperty('--accent-color', '#3b82f6')
    root.style.setProperty('--accent-color-rgb', '59, 130, 246')
  }
}

// 响应式变量
const autoHideTimer = ref<number | null>(null)

// 监听隐私模式变化
watch(() => dataStore.isPrivacyMode, (newValue) => {
  console.log(`ClientView: dataStore.isPrivacyMode变化到 ${newValue}`)
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
})

// 监听持仓数据变化
watch(holdings, () => {
  // 当持仓数据变化时重新计算分组
  refreshKey.value = Date.now()
})

// 生命周期
onMounted(() => {
  // 初始化数据
  dataStore.init()
  
  // 初始化主题
  const savedTheme = localStorage.getItem('themeMode') || 'system'
  applyThemeToDocument(savedTheme)
  
  dataStore.addLog('用户访问客户视图页面', 'info')
  
  // 监听隐私模式变化事件
  window.addEventListener('privacy-mode-changed', handlePrivacyModeChange)
  window.addEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
  
  // 监听主题变化事件
  window.addEventListener('theme-changed', handleThemeChange)
  window.addEventListener('theme-changed-global', handleThemeChange)
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const currentTheme = localStorage.getItem('themeMode') || 'system'
    if (currentTheme === 'system') {
      applyThemeToDocument('system')
      refreshKey.value = Date.now()
    }
  }
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  onUnmounted(() => {
    // 清理定时器
    updatingTextTimer.value !== null && clearInterval(updatingTextTimer.value)
    autoHideTimer.value !== null && clearTimeout(autoHideTimer.value)
    
    // 移除监听器
    window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange)
    window.removeEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
    window.removeEventListener('theme-changed', handleThemeChange)
    window.removeEventListener('theme-changed-global', handleThemeChange)
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  })
})
</script>

<template>
  <div class="client-view" :key="`${refreshKey}-${privacyKey}`">
    <!-- 返回按钮 -->
    <div class="back-button" @click="$router.back()">
      <span class="back-icon">←</span>
    </div>
    
    <!-- 标题和状态栏 -->
    <div class="header-section">
      <div class="header-row">
        <div class="action-buttons">
          <button 
            class="action-btn"
            :class="{ active: areAnyCardsExpanded }"
            @click="toggleAllCards"
            :title="areAnyCardsExpanded ? '折叠所有' : '展开所有'"
          >
            {{ areAnyCardsExpanded ? '⇲' : '⇱' }}
          </button>
          
          <button 
            class="action-btn"
            :class="{ active: isSearchExpanded }"
            @click="toggleSearch"
            :title="isSearchExpanded ? '隐藏搜索' : '显示搜索'"
          >
            🔍
          </button>
        </div>
        
        <div class="status-indicator" @click="onStatusTextTap">
          <div v-if="showStatusText && !showRefreshButton" class="status-text">
            {{ latestNavDateString }}
          </div>
          
          <button 
            v-if="showRefreshButton"
            class="refresh-btn"
            @click.stop="handleRefresh"
            :disabled="isRefreshing"
            :title="isRefreshing ? '刷新中...' : '刷新数据'"
          >
            <span v-if="isRefreshing" class="spinner-small"></span>
            <span v-else>⟳</span>
          </button>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div v-if="isSearchExpanded" class="search-box">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchText"
            type="text"
            placeholder="输入客户名、基金代码、基金名称..."
            class="search-input"
            @input="performSearch(searchText)"
          />
          <button 
            v-if="searchText" 
            class="clear-search"
            @click="clearSearch"
          >
            ×
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="content-area">
      <!-- 搜索结果显示 -->
      <div v-if="searchText" class="search-results">
        <div v-if="searchResults.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>未找到匹配的内容</h3>
          <p>请尝试其他搜索关键词</p>
        </div>
        
        <div v-else class="search-results-list">
          <div 
            v-for="holding in searchResults.slice(0, loadedSearchResultCount)" 
            :key="holding.id"
            class="holding-card-detailed"
          >
            <div class="holding-header-detailed">
              <div class="holding-info-detailed">
                <div class="fund-name-row">
                  <h4 class="fund-name">{{ holding.fundName }}</h4>
                  <span class="fund-code">({{ holding.fundCode }})</span>
                  <span v-if="holding.isPinned" class="pin-indicator">📌</span>
                </div>
                <div class="client-info-row">
                  <span class="client-name">{{ processClientName(holding.clientName) }}</span>
                  <span v-if="holding.clientID" class="client-id">({{ holding.clientID }})</span>
                </div>
              </div>
              <div class="nav-info">
                <span class="nav-value">{{ holding.currentNav.toFixed(4) }}</span>
                <span class="nav-date">({{ new Date(holding.navDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) }})</span>
              </div>
            </div>
            
            <div class="holding-details-detailed">
              <div class="detail-row">
                <span class="detail-label">购买金额:</span>
                <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                <span class="detail-label" style="margin-left: 16px;">份额:</span>
                <span class="detail-value">{{ holding.purchaseShares.toFixed(2) }}份</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">收益:</span>
                <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).absolute) }">
                  {{ calculateProfit(holding).absolute > 0 ? '+' : '' }}{{ calculateProfit(holding).absolute.toFixed(2) }}元
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">收益率:</span>
                <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).absolute / holding.purchaseAmount * 100) }">
                  {{ formatPercentage(calculateProfit(holding).absolute / holding.purchaseAmount * 100) }}
                </span>
                <span class="detail-label-small">[绝对]</span>
                <span class="separator">|</span>
                <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).annualized) }">
                  {{ formatPercentage(calculateProfit(holding).annualized) }}
                </span>
                <span class="detail-label-small">[年化]</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">购买日期:</span>
                <span class="detail-value">{{ new Date(holding.purchaseDate).toLocaleDateString('zh-CN', { year: '2-digit', month: '2-digit', day: '2-digit' }) }}</span>
                <span class="detail-label" style="margin-left: 16px;">持有天数:</span>
                <span class="detail-value">{{ calculateHoldingDays(holding) }}天</span>
              </div>
              
              <div v-if="holding.remarks" class="detail-row">
                <span class="detail-label">备注:</span>
                <span class="detail-value">{{ holding.remarks }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="loadedSearchResultCount < searchResults.length" class="load-more">
            <button @click="loadedSearchResultCount += 10">加载更多</button>
          </div>
        </div>
      </div>
      
      <!-- 客户分组显示 -->
      <div v-else class="client-groups">
        <div v-if="holdings.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>当前没有数据</h3>
          <p>请导入数据开始使用</p>
        </div>
        
        <div v-else class="sections-container">
          <!-- 置顶分栏 -->
          <div v-if="pinnedHoldings.length > 0" class="section">
            <div 
              class="section-header pinned-header"
              @click="expandedClients.has('Pinned') ? expandedClients.delete('Pinned') : expandedClients.add('Pinned')"
            >
              <div class="header-content">
                <span class="pin-icon">📌</span>
                <span class="section-title">置顶分栏</span>
                <span class="holdings-count">{{ pinnedHoldings.length }}支</span>
              </div>
              <span class="expand-icon">{{ expandedClients.has('Pinned') ? '−' : '+' }}</span>
            </div>
            
            <div v-if="expandedClients.has('Pinned')" class="section-content">
              <div 
                v-for="holding in pinnedHoldings" 
                :key="holding.id"
                class="holding-card-detailed"
              >
                <div class="holding-header-detailed">
                  <div class="holding-info-detailed">
                    <div class="fund-name-row">
                      <h4 class="fund-name">{{ holding.fundName }}</h4>
                      <span class="fund-code">({{ holding.fundCode }})</span>
                      <span class="pin-indicator">📌</span>
                    </div>
                    <div class="client-info-row">
                      <span class="client-name">{{ processClientName(holding.clientName) }}</span>
                      <span v-if="holding.clientID" class="client-id">({{ holding.clientID }})</span>
                    </div>
                  </div>
                  <div class="nav-info">
                    <span class="nav-value">{{ holding.currentNav.toFixed(4) }}</span>
                    <span class="nav-date">({{ new Date(holding.navDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) }})</span>
                  </div>
                </div>
                
                <div class="holding-details-detailed">
                  <div class="detail-row">
                    <span class="detail-label">购买金额:</span>
                    <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                    <span class="detail-label" style="margin-left: 16px;">份额:</span>
                    <span class="detail-value">{{ holding.purchaseShares.toFixed(2) }}份</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">收益:</span>
                    <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).absolute) }">
                      {{ calculateProfit(holding).absolute > 0 ? '+' : '' }}{{ calculateProfit(holding).absolute.toFixed(2) }}元
                    </span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">收益率:</span>
                    <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).absolute / holding.purchaseAmount * 100) }">
                      {{ formatPercentage(calculateProfit(holding).absolute / holding.purchaseAmount * 100) }}
                    </span>
                    <span class="detail-label-small">[绝对]</span>
                    <span class="separator">|</span>
                    <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).annualized) }">
                      {{ formatPercentage(calculateProfit(holding).annualized) }}
                    </span>
                    <span class="detail-label-small">[年化]</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">购买日期:</span>
                    <span class="detail-value">{{ new Date(holding.purchaseDate).toLocaleDateString('zh-CN', { year: '2-digit', month: '2-digit', day: '2-digit' }) }}</span>
                    <span class="detail-label" style="margin-left: 16px;">持有天数:</span>
                    <span class="detail-value">{{ calculateHoldingDays(holding) }}天</span>
                  </div>
                  
                  <div v-if="holding.remarks" class="detail-row">
                    <span class="detail-label">备注:</span>
                    <span class="detail-value">{{ holding.remarks }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 客户分组 -->
          <div 
            v-for="sectionKey in sortedSectionKeys.filter(key => key !== '★')" 
            :key="sectionKey"
            class="section"
          >
            <div class="section-letter">{{ sectionKey }}</div>
            
            <div 
              v-for="clientGroup in sectionedClientGroups[sectionKey]" 
              :key="clientGroup.id"
              class="client-group"
            >
              <div 
                class="group-header"
                @click="expandedClients.has(clientGroup.id) ? expandedClients.delete(clientGroup.id) : expandedClients.add(clientGroup.id)"
              >
                <div class="header-content">
                  <div class="client-info">
                    <span class="client-name">{{ processClientName(clientGroup.clientName) }}</span>
                    <span v-if="clientGroup.clientID" class="client-id">({{ clientGroup.clientID }})</span>
                  </div>
                  <span class="holdings-count" :style="{ color: colorForHoldingCount(clientGroup.holdings.length) }">
                    {{ clientGroup.holdings.length }}支
                  </span>
                </div>
                <span class="expand-icon">{{ expandedClients.has(clientGroup.id) ? '−' : '+' }}</span>
              </div>
              
              <div v-if="expandedClients.has(clientGroup.id)" class="group-content">
                <div 
                  v-for="holding in clientGroup.holdings.slice(0, loadedGroupedClientCount)" 
                  :key="holding.id"
                  class="holding-card-detailed"
                >
                  <div class="holding-header-detailed">
                    <div class="holding-info-detailed">
                      <div class="fund-name-row">
                        <h4 class="fund-name">{{ holding.fundName }}</h4>
                        <span class="fund-code">({{ holding.fundCode }})</span>
                        <span v-if="holding.isPinned" class="pin-indicator">📌</span>
                      </div>
                      <div v-if="!isPrivacyMode" class="client-info-row">
                        <span class="purchase-date">购买日期: {{ new Date(holding.purchaseDate).toLocaleDateString('zh-CN') }}</span>
                      </div>
                    </div>
                    <div class="nav-info">
                      <span class="nav-value">{{ holding.currentNav.toFixed(4) }}</span>
                      <span class="nav-date">({{ new Date(holding.navDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) }})</span>
                    </div>
                  </div>
                  
                  <div class="holding-details-detailed">
                    <div class="detail-row">
                      <span class="detail-label">购买金额:</span>
                      <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                      <span class="detail-label" style="margin-left: 16px;">份额:</span>
                      <span class="detail-value">{{ holding.purchaseShares.toFixed(2) }}份</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">收益:</span>
                      <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).absolute) }">
                        {{ calculateProfit(holding).absolute > 0 ? '+' : '' }}{{ calculateProfit(holding).absolute.toFixed(2) }}元
                      </span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">收益率:</span>
                      <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).absolute / holding.purchaseAmount * 100) }">
                        {{ formatPercentage(calculateProfit(holding).absolute / holding.purchaseAmount * 100) }}
                      </span>
                      <span class="detail-label-small">[绝对]</span>
                      <span class="separator">|</span>
                      <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).annualized) }">
                        {{ formatPercentage(calculateProfit(holding).annualized) }}
                      </span>
                      <span class="detail-label-small">[年化]</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">购买日期:</span>
                      <span class="detail-value">{{ new Date(holding.purchaseDate).toLocaleDateString('zh-CN', { year: '2-digit', month: '2-digit', day: '2-digit' }) }}</span>
                      <span class="detail-label" style="margin-left: 16px;">持有天数:</span>
                      <span class="detail-value">{{ calculateHoldingDays(holding) }}天</span>
                    </div>
                    
                    <div v-if="holding.remarks" class="detail-row">
                      <span class="detail-label">备注:</span>
                      <span class="detail-value">{{ holding.remarks }}</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="loadedGroupedClientCount < clientGroup.holdings.length" class="load-more">
                  <button @click="loadedGroupedClientCount += 10">加载更多</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 刷新进度 -->
    <div v-if="isRefreshing" class="refresh-overlay">
      <div class="refresh-progress">
        <div class="progress-text">
          更新中{{ updatingText }}
        </div>
        <div class="progress-details">
          [{{ refreshProgress.current }}/{{ refreshProgress.total }}]
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.client-view {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background-color 0.3s ease;
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.back-button:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.header-section {
  background: var(--bg-primary);
  padding: 80px 16px 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.action-btn:hover {
  border-color: var(--accent-color);
  background: var(--bg-hover);
}

.action-btn.active {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.status-indicator {
  min-width: 100px;
  text-align: right;
  cursor: pointer;
}

.status-text {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--bg-hover);
  transition: all 0.2s ease;
}

.status-text:hover {
  background: var(--border-color);
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), #764ba2);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(var(--accent-color-rgb), 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-box {
  margin-top: 12px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  background: var(--bg-card);
  color: var(--text-primary);
}

.search-input:focus {
  border-color: var(--accent-color);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: var(--text-secondary);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.clear-search:hover {
  background: var(--text-primary);
}

.content-area {
  padding: 16px;
  min-height: calc(100vh - 200px);
  overflow-y: auto;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 12px;
  margin: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.holding-card-detailed {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.holding-card-detailed:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--accent-color-rgb), 0.1);
}

.holding-header-detailed {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.holding-info-detailed {
  flex: 1;
  min-width: 0;
}

.fund-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.fund-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.fund-code {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.pin-indicator {
  font-size: 12px;
  color: #f97316;
}

.client-info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.client-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.client-id {
  font-size: 12px;
  color: var(--text-secondary);
}

.nav-info {
  text-align: right;
  min-width: 100px;
}

.nav-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-color);
  display: block;
  margin-bottom: 2px;
}

.nav-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.holding-details-detailed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  flex-wrap: wrap;
}

.detail-label {
  color: var(--text-secondary);
  min-width: 60px;
}

.detail-value {
  font-weight: 500;
  color: var(--text-primary);
}

.detail-label-small {
  font-size: 12px;
  color: var(--text-secondary);
}

.separator {
  color: var(--text-secondary);
  margin: 0 4px;
}

.load-more {
  text-align: center;
  padding: 12px;
}

.load-more button {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.load-more button:hover {
  background: #2563eb;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.section-letter {
  padding: 8px 16px;
  background: var(--bg-hover);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.pinned-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.section-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.section-header:hover {
  background: rgba(0, 0, 0, 0.05);
}

.pinned-header:hover {
  background: rgba(102, 126, 234, 0.9);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.pin-icon {
  font-size: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

.holdings-count {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}

.expand-icon {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid var(--bg-hover);
  transition: background 0.2s ease;
}

.group-header:hover {
  background: var(--bg-hover);
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.group-content {
  padding: 12px;
  background: var(--bg-hover);
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.refresh-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.refresh-progress {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  text-align: center;
  min-width: 200px;
}

.progress-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.progress-details {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .back-button {
    top: 10px;
    left: 10px;
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .header-section {
    padding: 60px 12px 12px;
  }
  
  .content-area {
    padding: 12px;
  }
  
  .holding-header-detailed {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-info {
    text-align: left;
    width: 100%;
  }
  
  .detail-row {
    font-size: 13px;
  }
  
  .detail-label {
    min-width: 50px;
  }
}

/* 深色模式特定样式 */
@media (prefers-color-scheme: dark) {
  body.dark-mode .pinned-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  body.dark-mode .refresh-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
}
</style>