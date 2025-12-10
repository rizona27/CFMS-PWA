<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { fundService } from '@/services/fundService'

const router = useRouter()
const dataStore = useDataStore()

const isSearchExpanded = ref(false)
const searchText = ref('')
const selectedSortKey = ref<'none' | 'navReturn1m' | 'navReturn3m' | 'navReturn6m' | 'navReturn1y'>('none')
const sortOrder = ref<'ascending' | 'descending'>('descending')
const expandedFundCodes = ref<Set<string>>(new Set())
const isRefreshing = ref(false)
const updatingTextState = ref(0)
const updatingTextTimer = ref<number | null>(null)

const refreshKey = ref(0)
const privacyKey = ref(0)
const themeKey = ref(0)

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

const sortKeyFullDisplay = computed(() => {
  const map = {
    none: '无排序',
    navReturn1m: '近1个月',
    navReturn3m: '近3个月',
    navReturn6m: '近6个月',
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
  if (holdings.value.length === 0) return false
  const prevWorkday = previousWorkday.value
  
  return holdings.value.some(holding =>
    holding.isValid && isSameDay(new Date(holding.navDate), prevWorkday)
  )
})

const outdatedLatestDate = computed(() => {
  if (holdings.value.length === 0 || hasLatestNavDate.value) return null
  
  const outdatedHoldings = holdings.value.filter(h => h.isValid)
  if (outdatedHoldings.length === 0) return null
  
  const latest = outdatedHoldings.reduce((latest, holding) => {
    const date = new Date(holding.navDate)
    return date > latest ? date : latest
  }, new Date(0))
  
  return latest
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
  
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' })
  
  if (hasLatestNavDate.value) {
    const prevDateString = formatter.format(previousWorkday.value)
    return `最新: ${prevDateString}`
  } else {
    if (outdatedLatestDate.value) {
      const outdatedDateString = formatter.format(outdatedLatestDate.value)
      return `待更新: ${outdatedDateString}`
    } else {
      const prevDateString = formatter.format(previousWorkday.value)
      return `待更新: ${prevDateString}`
    }
  }
})

const updatingText = computed(() => {
  const baseText = ''
  const dots = '.'.repeat(updatingTextState.value % 4)
  return baseText + dots
})

const getFundHash = (fundName: string): number => {
  let hash = 0
  for (let i = 0; i < fundName.length; i++) {
    hash = ((hash << 5) - hash) + fundName.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getFundGradient = (fundName: string): string => {
  const hash = getFundHash(fundName)
  const hue = hash % 360
  const saturationLight = hash % 31 + 60
  
  const lightGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturationLight}%, 85%) 0%,
    hsl(${hue}, ${saturationLight}%, 92%) 25%,
    hsl(${hue}, ${saturationLight}%, 96%) 50%,
    hsl(${hue}, ${saturationLight}%, 98%) 75%,
    white 100%)`
  
  const darkGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturationLight - 20}%, 18%) 0%,
    hsl(${hue}, ${saturationLight - 20}%, 22%) 25%,
    hsl(${hue}, ${saturationLight - 20}%, 25%) 50%,
    hsl(${hue}, ${saturationLight - 20}%, 28%) 75%,
    var(--bg-card) 100%)`
  
  return `var(--fund-gradient-light, ${lightGradient}) var(--fund-gradient-dark, ${darkGradient})`
}

const getCurrentSortReturn = (fundCode: string) => {
  if (selectedSortKey.value === 'none') return null
  
  const fund = groupedByFund.value[fundCode]?.[0]
  if (!fund) return null
  
  switch (selectedSortKey.value) {
    case 'navReturn1m': return fund.navReturn1m
    case 'navReturn3m': return fund.navReturn3m
    case 'navReturn6m': return fund.navReturn6m
    case 'navReturn1y': return fund.navReturn1y
    default: return null
  }
}

const toggleAllCards = () => {
  if (areAnyCardsExpanded.value) {
    expandedFundCodes.value.clear()
  } else {
    expandedFundCodes.value = new Set(sortedFundCodes.value)
  }
}

const toggleSearch = () => {
  isSearchExpanded.value = !isSearchExpanded.value
  if (!isSearchExpanded.value) {
    searchText.value = ''
  }
}

const performSearch = (text: string) => {
  searchText.value = text
}

const clearSearch = () => {
  searchText.value = ''
}

const cycleSortKey = () => {
  const keys = ['none', 'navReturn1m', 'navReturn3m', 'navReturn6m', 'navReturn1y'] as const
  const currentIndex = keys.indexOf(selectedSortKey.value)
  selectedSortKey.value = keys[(currentIndex + 1) % keys.length]
  
  dataStore.showToastMessage(`排序方式: ${sortKeyFullDisplay.value}`)
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ascending' ? 'descending' : 'ascending'
  const orderText = sortOrder.value === 'ascending' ? '升序' : '降序'
  dataStore.showToastMessage(`排序顺序: ${orderText}`)
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
  return fund?.fundName || (fundCode ? `未加载(${fundCode})` : '未加载')
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
  return value > 0 ? '#ef4444' : value < 0 ? '#10b981' : '#666'
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

const getFundDisplayName = (name: string) => {
  if (!name) return '未加载'
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
  
  dataStore.updateUserPreferences({ showRefreshButton: true })
  
  autoHideTimer.value = setTimeout(() => {
    if (!isRefreshing.value) {
      dataStore.updateUserPreferences({ showRefreshButton: false })
    }
  }, 5000) as unknown as number
}

const handleRefresh = async () => {
  if (isRefreshing.value) return
  
  const token = localStorage.getItem('auth_token')
  if (!token) {
    dataStore.showToastMessage('请先登录以刷新数据')
    const event = new CustomEvent('auth-required', {
      detail: { message: '请先登录以刷新基金数据' }
    })
    window.dispatchEvent(event)
    return
  }
  
  isRefreshing.value = true
  startUpdatingTextAnimation()
  dataStore.startRefresh()
  
  const total = holdings.value.length
  
  try {
    for (let i = 0; i < total; i++) {
      const holding = holdings.value[i]
      
      try {
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
        }
      } catch (error) {
      }
      
      dataStore.updateRefreshProgress(i + 1)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } finally {
    dataStore.completeRefresh()
    isRefreshing.value = false
    stopUpdatingTextAnimation()
    
    refreshKey.value = Date.now()
    
    setTimeout(() => {
      dataStore.updateUserPreferences({ showRefreshButton: false })
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
      uniqueFunds.set(fund.fundCode, fund.fundName || `未加载(${fund.fundCode})`)
    }
  })
  
  return Array.from(uniqueFunds.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
}

const copyClientID = (clientID: string, clientName: string) => {
  if (!hasLatestNavDate.value) {
    dataStore.showToastMessage('数据未更新，请先刷新数据')
    return
  }
  
  if (!clientID || clientID.trim() === '') {
    dataStore.showToastMessage('客户号为空')
    return
  }
  
  navigator.clipboard.writeText(clientID)
    .then(() => {
      dataStore.showToastMessage('客户号已复制到剪贴板')
    })
    .catch(err => {
      dataStore.showToastMessage('复制失败，请重试')
    })
}

const generateReport = (holding: any) => {
  if (!hasLatestNavDate.value) {
    dataStore.showToastMessage('数据未更新，请先刷新数据')
    return
  }
  
  const profit = getHoldingReturn(holding)
  const purchaseAmount = holding.purchaseAmount
  const purchaseShares = holding.purchaseShares
  const currentNav = holding.currentNav
  const navDate = new Date(holding.navDate)
  const purchaseDate = new Date(holding.purchaseDate)
  
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  })
  
  const purchaseDateStr = formatter.format(purchaseDate)
  const navDateStr = formatter.format(navDate)
  
  const timeDiff = Math.abs(navDate.getTime() - purchaseDate.getTime())
  const holdingDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
  
  const annualizedReturn = holdingDays > 0 ?
    (Math.pow(1 + (profit || 0) / 100, 365 / holdingDays) - 1) * 100 : 0
  
  const formatCurrency = (amount: number) => {
    if (amount >= 10000 && amount % 10000 === 0) return `${(amount / 10000).toFixed(0)}万`
    else if (amount >= 10000) return `${(amount / 10000).toFixed(2)}万`
    else return `${amount.toFixed(2)}元`
  }
  
  const reportContent = `
${holding.fundName || `未加载(${holding.fundCode})`} | ${holding.fundCode}
├ 客户: ${holding.clientName} (${holding.clientID || '无客户号'})
├ 购买日期: ${purchaseDateStr}
├ 持有天数: ${holdingDays}天
├ 购买金额: ${formatCurrency(purchaseAmount)}
├ 购买份额: ${purchaseShares.toFixed(2)}份
├ 最新净值: ${currentNav.toFixed(4)} | ${navDateStr}
├ 收益: ${profit ? (profit > 0 ? '+' : '') + profit.toFixed(2) + '元' : '/'}
├ 收益率: ${profit ? (profit > 0 ? '+' : '') + profit.toFixed(2) + '%' : '/'}
└ 年化收益率: ${annualizedReturn ? (annualizedReturn > 0 ? '+' : '') + annualizedReturn.toFixed(2) + '%' : '/'}
`
  
  navigator.clipboard.writeText(reportContent)
    .then(() => {
      dataStore.showToastMessage('报告已复制到剪贴板')
    })
    .catch(err => {
      dataStore.showToastMessage('生成报告失败，请重试')
    })
}

const handleThemeChange = (event: any) => {
  const { mode } = event.detail
  themeKey.value = Date.now()
  refreshKey.value = Date.now()
}

const showOutdatedToast = ref(false)
const autoHideTimer = ref<number | null>(null)

watch(() => dataStore.isPrivacyMode, (newValue) => {
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
})

onMounted(() => {
  dataStore.init()
  
  setTimeout(() => {
    checkAndShowOutdatedToast()
  }, 1000)
  
  window.addEventListener('theme-mode-changed', handleThemeChange)
  
  onUnmounted(() => {
    updatingTextTimer.value !== null && clearInterval(updatingTextTimer.value)
    autoHideTimer.value !== null && clearTimeout(autoHideTimer.value)
    
    window.removeEventListener('theme-mode-changed', handleThemeChange)
  })
})
</script>

<template>
  <div class="summary-view" :key="`${refreshKey}-${themeKey}-${privacyKey}`">
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
          
          <div class="sort-group">
            <button
              class="sort-btn"
              @click="cycleSortKey"
              :title="selectedSortKey !== 'none' ? `按${sortKeyFullDisplay}排序` : '无排序'"
              :style="{ color: sortKeyColor }"
            >
              <span class="sort-icon">{{ sortButtonIcon }}</span>
            </button>
            
            <button
              v-if="selectedSortKey !== 'none'"
              class="sort-order-btn"
              @click="toggleSortOrder"
              :title="`${sortOrder === 'ascending' ? '升序' : '降序'}排序`"
              :style="{ color: sortKeyColor }"
            >
              <span class="sort-order-icon">
                {{ sortOrder === 'ascending' ? '▲' : '▼' }}
              </span>
            </button>
          </div>
        </div>
        
        <div class="status-pill-group">
          <div
            v-if="!showRefreshButton"
            class="status-pill"
            @click="onStatusTextTap"
            :class="{ 'status-latest': hasLatestNavDate }"
          >
            <span class="status-text">{{ statusText }}</span>
          </div>
          
          <button
            v-if="showRefreshButton"
            class="refresh-pill"
            @click.stop="handleRefresh"
            :disabled="isRefreshing"
            :title="isRefreshing ? '刷新中...' : '刷新数据'"
          >
            <span v-if="isRefreshing" class="spinner-small"></span>
            <span v-else class="refresh-icon">🔄</span>
          </button>
        </div>
      </div>
      
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
            :style="{ '--fund-gradient': getFundGradient(getFundName(fundCode)) }"
          >
            <div class="fund-bar-background"></div>
            
            <div class="fund-header">
              <div class="fund-info-single-line">
                <div class="fund-name-id-wrapper">
                  <h3 class="fund-name-single">
                    <span class="fund-name-text">{{ getFundName(fundCode) }}</span>
                    <span class="fund-code-text-single">({{ fundCode }})</span>
                  </h3>
                </div>
                
                <div
                  v-if="selectedSortKey !== 'none'"
                  class="current-sort-return"
                  :style="{ color: getReturnColor(getCurrentSortReturn(fundCode)) }"
                >
                  {{ formatReturn(getCurrentSortReturn(fundCode)) }}
                </div>
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
            </div>
            
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
                
                <div v-if="expandedFundCodes.has(fundCode) && !isPrivacyMode" class="clients-section">
                  <div class="clients-header">
                    <span class="clients-label">持有客户:</span>
                  </div>
                  <div class="clients-list">
                    <div
                      v-for="(holding, index) in groupedByFund[fundCode]"
                      :key="holding.id"
                      class="client-item-with-actions"
                    >
                      <div class="client-info">
                        <div class="client-name-id-display">
                          <span class="client-name-text">{{ processClientName(holding.clientName) }}</span>
                          <span v-if="holding.clientID" class="client-id-text">({{ holding.clientID }})</span>
                        </div>
                        <span
                          v-if="getHoldingReturn(holding) !== null"
                          class="client-return"
                          :style="{ color: getReturnColor(getHoldingReturn(holding)) }"
                        >
                          ({{ formatReturn(getHoldingReturn(holding)) }})
                        </span>
                        <span v-else class="client-return">(/)</span>
                      </div>
                      <div class="client-actions" v-if="holding.clientID">
                        <button
                          class="client-action-btn copy-btn"
                          @click.stop="copyClientID(holding.clientID, holding.clientName)"
                          title="复制客户号"
                        >
                          复制客户号
                        </button>
                        <button
                          class="client-action-btn report-btn"
                          @click.stop="generateReport(holding)"
                          title="生成报告"
                        >
                          复制报告
                        </button>
                      </div>
                      <span v-if="index < groupedByFund[fundCode].length - 1" class="separator">、</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
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
  align-items: center;
}

.action-btn {
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  min-width: 36px;
  padding: 0 12px;
}

.action-btn:hover {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.action-btn.active {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.sort-group {
  display: flex;
  gap: 4px;
}

.sort-btn {
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  padding: 0 12px;
  gap: 6px;
  min-width: 36px;
  font-weight: 500;
}

.sort-btn:hover {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.sort-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-order-btn {
  height: 36px;
  min-width: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  padding: 0;
  font-weight: bold;
}

.sort-order-btn:hover {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.sort-order-icon {
  font-size: 12px;
  font-weight: bold;
}

.status-pill-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-pill {
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
  background: var(--bg-card);
  color: var(--text-primary);
}

.status-pill:hover {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.status-pill.status-latest {
  background: #d1fae5;
  color: #065f46;
  border-color: #065f46;
}

.status-pill.status-latest:hover {
  background: #065f46;
  color: white;
  border-color: #065f46;
}

.status-text {
  white-space: nowrap;
}

.refresh-pill {
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--accent-color);
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0 16px;
  gap: 6px;
  font-weight: 500;
}

.refresh-pill:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.refresh-pill:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  display: flex;
  align-items: center;
  gap: 4px;
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
  border-radius: 8px;
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
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.fund-card:hover {
  border-color: var(--accent-color);
}

.fund-bar-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: var(--fund-gradient);
  opacity: 0.7;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.fund-card:hover .fund-bar-background {
  opacity: 0.8;
}

.fund-card.expanded .fund-bar-background {
  opacity: 0.6;
}

.fund-card.expanded {
  background: var(--bg-hover);
}

.fund-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  z-index: 1;
  padding: 8px 16px;
  min-height: 36px;
}

.fund-info-single-line {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: nowrap;
}

.fund-name-id-wrapper {
  flex: 1;
  min-width: 0;
}

.fund-name-single {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1.3;
}

.fund-name-text {
  display: inline-block;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fund-code-text-single {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: normal;
  flex-shrink: 0;
}

.current-sort-return {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.client-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 8px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.count-label {
  opacity: 0.8;
}

.count-value {
  font-weight: 600;
  font-style: italic;
}

.expanded-content {
  margin-top: 0;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.3s ease;
  position: relative;
  z-index: 1;
  background: var(--bg-card);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fund-details {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 0;
  border: none;
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
  flex-direction: column;
  gap: 8px;
}

.client-item-with-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: var(--bg-hover);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  position: relative;
  min-height: 40px;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.client-name-id-display {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.client-name-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.client-id-text {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.7;
  font-weight: normal;
}

.client-return {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  margin-left: auto;
  margin-right: 8px;
}

.client-actions {
  display: flex;
  gap: 4px;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-card);
  border-radius: 4px;
  padding: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.client-action-btn {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.client-action-btn.copy-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.client-action-btn.report-btn:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.separator {
  color: var(--text-secondary);
  margin-right: 4px;
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
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
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  min-width: 180px;
}

.progress-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.progress-details {
  font-size: 13px;
  color: var(--text-secondary);
}

.outdated-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  z-index: 999;
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
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
    gap: 8px;
  }
  
  .fund-name-text, .fund-code-text-single {
    width: 100%;
  }
  
  .current-sort-return {
    align-self: flex-start;
  }
  
  .outdated-toast {
    max-width: 320px;
    padding: 14px;
    bottom: 80px;
  }
  
  .sort-btn {
    min-width: auto;
    padding: 0 8px;
  }
  
  .sort-order-btn {
    min-width: 28px;
    height: 28px;
  }
  
  .refresh-pill {
    min-width: 36px;
    padding: 0;
  }
  
  .status-pill {
    min-width: 60px;
    padding: 0 12px;
  }
  
  .client-item-with-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding-bottom: 36px;
  }
  
  .client-actions {
    position: absolute;
    bottom: 8px;
    right: 8px;
    top: auto;
    transform: none;
    flex-wrap: wrap;
  }
  
  .client-action-btn {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .client-return {
    margin-left: 0;
    margin-right: 0;
  }
}

:root.dark .status-pill {
  background: var(--bg-card);
  border-color: var(--border-color);
}

:root.dark .status-pill.status-latest {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border-color: #4ade80;
}

:root.dark .status-pill.status-latest:hover {
  background: #4ade80;
  color: #1e293b;
  border-color: #4ade80;
}

:root.dark .sort-btn,
:root.dark .sort-order-btn {
  background: var(--bg-card);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:root.dark .sort-btn:hover,
:root.dark .sort-order-btn:hover {
  background: var(--accent-color);
  color: white;
}

:root.dark .refresh-pill {
  background: var(--accent-color);
}

:root.dark .refresh-pill:hover:not(:disabled) {
  background: #2563eb;
}

:root.dark .client-action-btn {
  background: var(--bg-card);
  border-color: var(--border-color);
}
</style>
