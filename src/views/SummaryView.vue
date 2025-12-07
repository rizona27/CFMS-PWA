<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { fundService } from '@/services/fundService'

const router = useRouter()
const dataStore = useDataStore()

// 状态
const isSearchExpanded = ref(false)
const searchText = ref('')
const selectedSortKey = ref<'none' | 'navReturn1m' | 'navReturn3m' | 'navReturn6m' | 'navReturn1y'>('none')
const sortOrder = ref<'ascending' | 'descending'>('descending')
const expandedFundCodes = ref<Set<string>>(new Set())
const isRefreshing = ref(false)
const updatingTextState = ref(0)
const updatingTextTimer = ref<number | null>(null)

// 重新渲染键
const refreshKey = ref(0)
const privacyKey = ref(0)
const themeKey = ref(0)

// 计算属性
const holdings = computed(() => dataStore.holdings)
const isPrivacyMode = computed(() => dataStore.isPrivacyMode)
const showRefreshButton = computed(() => dataStore.showRefreshButton)
const refreshProgress = computed(() => dataStore.refreshProgress)

const sortKeyDisplay = computed(() => {
  const map = {
    none: '无排序',
    navReturn1m: '近1月',
    navReturn3m: '近3月',
    navReturn6m: '近6月',
    navReturn1y: '近1年'
  }
  return map[selectedSortKey.value]
})

const sortKeyColor = computed(() => {
  const map = {
    none: '#666',
    navReturn1m: '#3b82f6',
    navReturn3m: '#8b5cf6',
    navReturn6m: '#f97316',
    navReturn1y: '#ef4444'
  }
  return map[selectedSortKey.value]
})

const sortButtonIcon = computed(() => {
  const map = {
    none: '⇅',
    navReturn1m: '📅',
    navReturn3m: '📆',
    navReturn6m: '🗓️',
    navReturn1y: '⏰'
  }
  return map[selectedSortKey.value]
})

const filteredHoldings = computed(() => {
  if (!searchText.value) return holdings.value
  
  const searchLower = searchText.value.toLowerCase()
  return holdings.value.filter(holding =>
    holding.clientName.toLowerCase().includes(searchLower) ||
    holding.fundCode.toLowerCase().includes(searchLower) ||
    holding.fundName.toLowerCase().includes(searchLower) ||
    holding.remarks.toLowerCase().includes(searchLower)
  )
})

const groupedByFund = computed(() => {
  const groups: Record<string, typeof holdings.value> = {}
  filteredHoldings.value.forEach(holding => {
    if (!groups[holding.fundCode]) {
      groups[holding.fundCode] = []
    }
    groups[holding.fundCode].push(holding)
  })
  return groups
})

const sortedFundCodes = computed(() => {
  return dataStore.getSortedFundCodes(selectedSortKey.value, sortOrder.value)
    .filter(code => groupedByFund.value[code]?.length > 0)
})

const areAnyCardsExpanded = computed(() => expandedFundCodes.value.size > 0)

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
  const validHoldings = holdings.value.filter(h => h.isValid)
  if (validHoldings.length === 0) return null
  
  return validHoldings.reduce((latest, holding) => {
    const date = new Date(holding.navDate)
    return date > latest ? date : latest
  }, new Date(0))
})

const hasLatestNavDate = computed(() => {
  const latest = latestNavDate.value
  if (!latest) return false
  
  return isSameDay(latest, previousWorkday.value)
})

const outdatedFunds = computed(() => {
  const latest = latestNavDate.value
  if (!latest) return []
  
  return holdings.value.filter(holding => {
    if (!holding.isValid) return false
    return !isSameDay(new Date(holding.navDate), latest)
  })
})

const outdatedFundCodes = computed(() => {
  return Array.from(new Set(outdatedFunds.value.map(f => f.fundCode)))
})

const statusText = computed(() => {
  if (holdings.value.length === 0) return '暂无数据'
  
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

const statusColor = computed(() => {
  if (holdings.value.length === 0) return '#f97316'
  return hasLatestNavDate.value ? '#10b981' : '#f97316'
})

const updatingText = computed(() => {
  const baseText = ''
  const dots = '.'.repeat(updatingTextState.value % 4)
  return baseText + dots
})

// 方法
const toggleAllCards = () => {
  if (areAnyCardsExpanded.value) {
    expandedFundCodes.value.clear()
  } else {
    expandedFundCodes.value = new Set(sortedFundCodes.value)
  }
  dataStore.addLog(`概览视图: ${areAnyCardsExpanded.value ? '折叠' : '展开'}所有基金卡片`, 'info')
}

const toggleSearch = () => {
  isSearchExpanded.value = !isSearchExpanded.value
  if (!isSearchExpanded.value) {
    searchText.value = ''
  }
  dataStore.addLog(`概览视图: ${isSearchExpanded.value ? '显示' : '隐藏'}搜索框`, 'info')
}

const performSearch = (text: string) => {
  searchText.value = text
  if (text) {
    dataStore.addLog(`概览视图: 搜索 "${text}"`, 'info')
  }
}

const clearSearch = () => {
  searchText.value = ''
  dataStore.addLog('概览视图: 清除搜索', 'info')
}

const cycleSortKey = () => {
  const keys = ['none', 'navReturn1m', 'navReturn3m', 'navReturn6m', 'navReturn1y'] as const
  const currentIndex = keys.indexOf(selectedSortKey.value)
  selectedSortKey.value = keys[(currentIndex + 1) % keys.length]
  dataStore.addLog(`概览视图: 切换排序方式为 ${sortKeyDisplay.value}`, 'info')
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ascending' ? 'descending' : 'ascending'
  dataStore.addLog(`概览视图: 切换排序顺序为 ${sortOrder.value === 'ascending' ? '升序' : '降序'}`, 'info')
}

const toggleFundCard = (fundCode: string) => {
  if (expandedFundCodes.value.has(fundCode)) {
    expandedFundCodes.value.delete(fundCode)
  } else {
    expandedFundCodes.value.add(fundCode)
  }
}

const getFundName = (fundCode: string) => {
  const fund = groupedByFund.value[fundCode]?.[0]
  return fund?.fundName || '加载中...'
}

const getClientCountColor = (count: number) => {
  if (count === 1) return '#eab308'
  if (count <= 3) return '#f97316'
  return '#ef4444'
}

const getFundReturn = (fundCode: string, period: string) => {
  const fund = groupedByFund.value[fundCode]?.[0]
  if (!fund) return null
  
  switch (period) {
    case '1m': return fund.navReturn1m
    case '3m': return fund.navReturn3m
    case '6m': return fund.navReturn6m
    case '1y': return fund.navReturn1y
    default: return null
  }
}

const formatReturn = (value: number | null | undefined) => {
  if (value == null) return '/'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

const getReturnColor = (value: number | null | undefined) => {
  if (value == null) return '#666'
  return value > 0 ? '#ef4444' : value < 0 ? '#10b981' : '#666'  // 正红负绿零黑
}

const getHoldingReturn = (holding: any) => {
  if (!holding.isValid || holding.purchaseAmount <= 0) return null
  const currentValue = holding.currentNav * holding.purchaseShares
  return ((currentValue - holding.purchaseAmount) / holding.purchaseAmount) * 100
}

const processClientName = (name: string) => {
  if (!dataStore.isPrivacyMode) return name
  if (name.length <= 1) return name
  if (name.length === 2) return name.charAt(0) + '*'
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
}

const getDisplayName = (clientName: string, clientID: string): string => {
  const processedName = processClientName(clientName)
  return clientID ? `${processedName}(${clientID})` : processedName
}

const getFundDisplayName = (name: string) => {
  if (name.length <= 8) return name
  return name.substring(0, 8) + '...'
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
        
        // 使用fundService获取基金信息，它已经处理了代理问题
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
    
    // 强制重新渲染组件以显示最新数据
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

const checkAndShowOutdatedToast = () => {
  if (holdings.value.length === 0 || outdatedFunds.value.length === 0) {
    return
  }
  
  showOutdatedToast.value = true
  setTimeout(() => {
    showOutdatedToast.value = false
  }, 6000)
}

const getSortedUniqueOutdatedFunds = () => {
  const uniqueFunds = new Map<string, string>()
  outdatedFunds.value.forEach(fund => {
    if (!uniqueFunds.has(fund.fundCode)) {
      uniqueFunds.set(fund.fundCode, fund.fundName)
    }
  })
  
  return Array.from(uniqueFunds.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
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
  console.log(`SummaryView: 隐私模式变化到 ${enabled}`)
  
  // 直接更新dataStore
  dataStore.isPrivacyMode = enabled
  
  // 强制重新渲染
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
  
  dataStore.addLog(`隐私模式变化: ${enabled ? '开启' : '关闭'}`, 'info')
}

// 主题变化处理器
const handleThemeChange = (event: any) => {
  const { theme } = event.detail
  console.log(`SummaryView: 主题变化到 ${theme}`)
  applyThemeToDocument(theme)
  themeKey.value = Date.now()
  refreshKey.value = Date.now()
}

// 全局事件处理器
const handleGlobalPrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`SummaryView: 收到全局隐私模式变化事件: ${enabled}`)
  
  // 直接更新dataStore
  dataStore.isPrivacyMode = enabled
  
  // 强制重新渲染
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
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

// 强制同步处理器
const handleForcePrivacySync = () => {
  console.log('SummaryView: 收到强制隐私同步事件')
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
}

const handleForceThemeSync = () => {
  console.log('SummaryView: 收到强制主题同步事件')
  const savedTheme = localStorage.getItem('themeMode') || 'system'
  applyThemeToDocument(savedTheme)
  themeKey.value = Date.now()
  refreshKey.value = Date.now()
}

// 响应式变量
const showOutdatedToast = ref(false)
const autoHideTimer = ref<number | null>(null)

// 监听隐私模式变化
watch(() => dataStore.isPrivacyMode, (newValue) => {
  console.log(`SummaryView: dataStore.isPrivacyMode变化到 ${newValue}`)
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
})

// 生命周期
onMounted(() => {
  // 初始化数据
  dataStore.init()
  
  // 初始化主题
  const savedTheme = localStorage.getItem('themeMode') || 'system'
  applyThemeToDocument(savedTheme)
  
  // 禁止缩放
  const metaViewport = document.querySelector('meta[name="viewport"]')
  if (metaViewport) {
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  } else {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(meta)
  }
  
  dataStore.addLog('用户访问概览视图页面', 'info')
  
  // 延迟检查并显示过时基金Toast
  setTimeout(() => {
    checkAndShowOutdatedToast()
  }, 1000)
  
  // 监听隐私模式变化事件
  window.addEventListener('privacy-mode-changed', handlePrivacyModeChange)
  window.addEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
  
  // 监听主题变化事件
  window.addEventListener('theme-changed', handleThemeChange)
  window.addEventListener('theme-changed-global', handleThemeChange)
  
  // 监听强制同步事件
  window.addEventListener('force-privacy-sync', handleForcePrivacySync)
  window.addEventListener('force-theme-sync', handleForceThemeSync)
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const currentTheme = localStorage.getItem('themeMode') || 'system'
    if (currentTheme === 'system') {
      applyThemeToDocument('system')
      refreshKey.value = Date.now()
      themeKey.value = Date.now()
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
    window.removeEventListener('force-privacy-sync', handleForcePrivacySync)
    window.removeEventListener('force-theme-sync', handleForceThemeSync)
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  })
})
</script>

<template>
  <div class="summary-view" :key="`${refreshKey}-${themeKey}-${privacyKey}`">
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
          
          <!-- 近期收益排序按钮 -->
          <button
            class="action-btn"
            :class="{ active: selectedSortKey !== 'none' }"
            @click="cycleSortKey"
            :style="{ color: selectedSortKey !== 'none' ? sortKeyColor : '' }"
            :title="selectedSortKey !== 'none' ? `${sortKeyDisplay}排序` : '选择排序方式'"
          >
            {{ sortButtonIcon }}
          </button>
          
          <button
            v-if="selectedSortKey !== 'none'"
            class="action-btn"
            @click="toggleSortOrder"
            :style="{ background: sortKeyColor }"
            :title="`${sortOrder === 'ascending' ? '升序' : '降序'}`"
          >
            {{ sortOrder === 'ascending' ? '↑' : '↓' }}
          </button>
        </div>
        
        <div class="status-indicator" @click="onStatusTextTap">
          <div v-if="showStatusText && !showRefreshButton" class="status-text">
            {{ statusText }}
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
      <div v-if="holdings.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>当前没有数据</h3>
        <p>请导入数据开始使用</p>
      </div>
      
      <div v-else-if="filteredHoldings.length === 0 && searchText" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到匹配的内容</h3>
        <p>请尝试其他搜索关键词</p>
      </div>
      
      <div v-else class="funds-container">
        <div
          v-for="fundCode in sortedFundCodes"
          :key="fundCode"
          class="fund-card-wrapper"
        >
          <div
            class="fund-card"
            :class="{ expanded: expandedFundCodes.has(fundCode) }"
            @click="toggleFundCard(fundCode)"
          >
            <div class="fund-header">
              <div class="fund-info-single-line">
                <h3 class="fund-name">{{ getFundName(fundCode) }}</h3>
                <span class="fund-code-text">[{{ fundCode }}]</span>
              </div>
              
              <div v-if="!isPrivacyMode" class="client-count">
                <span class="count-label">持有人数:</span>
                <span
                  class="count-value"
                  :style="{ color: getClientCountColor(groupedByFund[fundCode].length) }"
                >
                  {{ groupedByFund[fundCode].length }}
                </span>
                <span class="count-unit">人</span>
              </div>
              
              <div v-else class="client-count-placeholder"></div>
              
              <div class="expand-icon">
                {{ expandedFundCodes.has(fundCode) ? '−' : '+' }}
              </div>
            </div>
            
            <!-- 展开内容 -->
            <div v-if="expandedFundCodes.has(fundCode)" class="expanded-content">
              <div class="fund-details">
                <div class="returns-grid">
                  <div class="return-item">
                    <span class="return-label">近1月:</span>
                    <span
                      class="return-value"
                      :style="{ color: getReturnColor(getFundReturn(fundCode, '1m')) }"
                    >
                      {{ formatReturn(getFundReturn(fundCode, '1m')) }}
                    </span>
                  </div>
                  <div class="return-item">
                    <span class="return-label">近3月:</span>
                    <span
                      class="return-value"
                      :style="{ color: getReturnColor(getFundReturn(fundCode, '3m')) }"
                    >
                      {{ formatReturn(getFundReturn(fundCode, '3m')) }}
                    </span>
                  </div>
                  <div class="return-item">
                    <span class="return-label">近6月:</span>
                    <span
                      class="return-value"
                      :style="{ color: getReturnColor(getFundReturn(fundCode, '6m')) }"
                    >
                      {{ formatReturn(getFundReturn(fundCode, '6m')) }}
                    </span>
                  </div>
                  <div class="return-item">
                    <span class="return-label">近1年:</span>
                    <span
                      class="return-value"
                      :style="{ color: getReturnColor(getFundReturn(fundCode, '1y')) }"
                    >
                      {{ formatReturn(getFundReturn(fundCode, '1y')) }}
                    </span>
                  </div>
                </div>
                
                <!-- 客户信息显示 - 仅在隐私模式关闭时显示 -->
                <div v-if="expandedFundCodes.has(fundCode) && !isPrivacyMode" class="clients-section">
                  <div class="clients-header">
                    <span class="clients-label">持有客户:</span>
                  </div>
                  <div class="clients-list">
                    <span
                      v-for="(holding, index) in groupedByFund[fundCode]"
                      :key="holding.id"
                      class="client-item"
                    >
                      <span class="client-name-id">
                        {{ getDisplayName(holding.clientName, holding.clientID) }}
                      </span>
                      <span
                        v-if="getHoldingReturn(holding) !== null"
                        class="client-return"
                        :style="{ color: getReturnColor(getHoldingReturn(holding)) }"
                      >
                        ({{ formatReturn(getHoldingReturn(holding)) }})
                      </span>
                      <span v-else class="client-return">(/)</span>
                      <span v-if="index < groupedByFund[fundCode].length - 1" class="separator">、</span>
                    </span>
                  </div>
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
    
    <!-- Toast消息 -->
    <div v-if="showOutdatedToast" class="outdated-toast">
      <div class="toast-content">
        <div class="toast-header">
          非最新日期净值:
          <span class="outdated-count">{{ outdatedFundCodes.length }}</span>
          支
        </div>
        <div v-if="outdatedFundCodes.length > 0" class="toast-list">
          <div
            v-for="[fundCode, fundName] in getSortedUniqueOutdatedFunds().slice(0, 5)"
            :key="fundCode"
            class="toast-item"
          >
            {{ getFundDisplayName(fundName) }} [{{ fundCode }}]
          </div>
          <div v-if="outdatedFundCodes.length > 5" class="toast-more">
            ... 还有{{ outdatedFundCodes.length - 5 }}支
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-view {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background-color 0.3s ease;
  overflow-x: hidden;
}

.header-section {
  background: var(--bg-primary);
  padding: 20px 16px 16px;
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
  transition: all 0.3s ease;
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
  min-height: calc(100vh - 150px);
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

.funds-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fund-card-wrapper {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fund-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.fund-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--accent-color-rgb), 0.1);
}

.fund-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, var(--accent-color), #764ba2);
  border-radius: 2px 0 0 2px;
}

.fund-card.expanded {
  background: var(--bg-hover);
}

.fund-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fund-info-single-line {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.fund-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.fund-code-text {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.client-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 8px;
  white-space: nowrap;
}

.count-label {
  opacity: 0.7;
}

.count-value {
  font-weight: 600;
  font-style: italic;
}

.client-count-placeholder {
  width: 80px; /* 占位，保持对齐 */
}

.expand-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.fund-card.expanded .expand-icon {
  transform: rotate(180deg);
}

.expanded-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fund-details {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.returns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.return-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.return-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.return-value {
  font-size: 14px;
  font-weight: 600;
}

.clients-section {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.clients-header {
  margin-bottom: 8px;
}

.clients-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.clients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.client-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.client-name-id {
  font-size: 13px;
  color: var(--text-primary);
}

.client-return {
  font-size: 12px;
}

.separator {
  color: var(--text-secondary);
  margin-right: 4px;
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

.outdated-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 999;
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border-color);
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.toast-content {
  max-height: 200px;
  overflow-y: auto;
}

.toast-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.outdated-count {
  font-style: italic;
  color: #f97316;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toast-item {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.toast-item:last-child {
  border-bottom: none;
}

.toast-more {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  font-style: italic;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-section {
    padding: 15px 12px 12px;
  }
  
  .content-area {
    padding: 12px;
    min-height: calc(100vh - 130px);
  }
  
  .returns-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .fund-info-single-line {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .fund-name, .fund-code-text {
    width: 100%;
  }
}

/* 深色模式特定样式 */
@media (prefers-color-scheme: dark) {
  body.dark-mode .fund-card::before {
    background: linear-gradient(to bottom, #667eea, #764ba2);
  }
  
  body.dark-mode .refresh-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
}
</style>
