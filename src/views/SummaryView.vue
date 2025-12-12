<template>
  <div class="summary-view" :key="`${refreshKey}-${themeKey}-${privacyKey}`">
    <div class="fixed-header">
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
                :style="{ color: sortKeyColor, borderColor: sortKeyColor }"
              >
                <span class="sort-text">{{ sortButtonText }}</span>
              </button>
              
              <button
                v-if="selectedSortKey !== 'none'"
                class="sort-order-btn"
                @click="toggleSortOrder"
                :title="`${sortOrder === 'ascending' ? '升序' : '降序'}排序`"
                :style="{ color: sortKeyColor, borderColor: sortKeyColor }"
              >
                <span class="sort-order-icon">
                  {{ sortOrder === 'ascending' ? '↑' : '↓' }}
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
              <span v-else class="refresh-icon">⟳</span>
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
    </div>
    
    <div class="content-wrapper">
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
              class="fund-pill-card"
              :class="{ expanded: expandedFundCodes.has(fundCode) }"
              @click="toggleFundCard(fundCode)"
              :style="{ '--fund-pill-gradient': getFundPillGradient(fundCode) }"
            >
              <div class="fund-pill-content">
                <div class="fund-pill-info">
                  <div class="fund-name-code">
                    <span class="fund-name">{{ getFundDisplayName(fundCode) }}</span>
                    <span class="fund-code">({{ fundCode }})</span>
                  </div>
                  
                  <div class="fund-right-stats">
                    <div
                      v-if="selectedSortKey !== 'none'"
                      class="current-sort-return"
                      :style="{ color: getReturnColor(getCurrentSortReturn(fundCode)) }"
                    >
                      {{ formatReturn(getCurrentSortReturn(fundCode)) }}
                    </div>
                    
                    <div v-if="selectedSortKey === 'none' && !isPrivacyMode" class="client-count">
                      <span
                        class="count-value"
                        :style="{ color: getClientCountColor(groupedByFund[fundCode].length) }"
                      >
                        {{ groupedByFund[fundCode].length }}人
                      </span>
                    </div>
                  </div>
                </div>
                
                <div v-if="expandedFundCodes.has(fundCode)" class="expanded-details">
                  <div class="returns-grid-compact">
                    <div class="returns-row">
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
                    </div>
                    <div class="returns-row">
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
                  </div>
                  
                  <div v-if="expandedFundCodes.has(fundCode) && !isPrivacyMode" class="clients-section">
                    <div class="clients-header">
                      <span class="clients-label">持有客户:</span>
                    </div>
                    <div class="clients-list">
                      <span
                        v-for="(holding, index) in sortedHoldingsByClientReturn(fundCode)"
                        :key="holding.id"
                        class="client-item-simple"
                      >
                        <span class="client-name-simple">{{ processClientName(holding.clientName) }}</span>
                        <span
                          class="client-return-simple"
                          :style="{ color: getReturnColor(getHoldingReturn(holding)) }"
                        >
                          ({{ formatReturn(getHoldingReturn(holding)) }})
                        </span>
                        <span v-if="index < sortedHoldingsByClientReturn(fundCode).length - 1" class="separator-simple">、</span>
                      </span>
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
            {{ getFundDisplayName(fundCode) }} [{{ fundCode }}]
          </div>
          <div v-if="outdatedFundCodes.length > 5" class="toast-more">
            ... 还有{{ outdatedFundCodes.length - 5 }}支
          </div>
        </div>
      </div>
    </div>
    
    <ToastMessage
      v-model:show="dataStore.showToast"
      :message="dataStore.toastMessage"
      :type="dataStore.toastType"
      :icon="dataStore.toastIcon"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { fundService } from '@/services/fundService'
import ToastMessage from '@/components/common/ToastMessage.vue'

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
    none: '#666666',
    navReturn1m: '#3b82f6',
    navReturn3m: '#8b5cf6',
    navReturn6m: '#f97316',
    navReturn1y: '#ef4444'
  }
  return map[selectedSortKey.value]
})

const sortButtonText = computed(() => {
  const map = {
    none: '无排序',
    navReturn1m: '近1月',
    navReturn3m: '近3月',
    navReturn6m: '近6月',
    navReturn1y: '近1年'
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

const sortedHoldingsByClientReturn = computed(() => {
  return (fundCode: string) => {
    const holdings = groupedByFund.value[fundCode] || []
    return [...holdings].sort((a, b) => {
      const returnA = getHoldingReturn(a) || 0
      const returnB = getHoldingReturn(b) || 0
      return returnB - returnA
    })
  }
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
  if (holdings.value.length === 0) return '无数据'
  
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' })
  
  if (hasLatestNavDate.value) {
    const prevDateString = formatter.format(previousWorkday.value)
    return `最新净值: ${prevDateString}`
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

const getFundHash = (fundCode: string): number => {
  let hash = 0
  for (let i = 0; i < fundCode.length; i++) {
    hash = ((hash << 5) - hash) + fundCode.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getFundPillGradient = (fundCode: string): string => {
  const hash = getFundHash(fundCode)
  const hue = hash % 360
  const saturation = 65 + (hash % 25)
  const lightnessLight = 88 + (hash % 7)
  const lightnessDark = 28 + (hash % 7)
  
  const lightGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturation}%, ${lightnessLight}%) 0%,
    hsl(${hue}, ${saturation}%, 94%) 50%,
    hsl(${hue}, ${saturation}%, 98%) 100%)`
  
  const darkGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturation - 15}%, ${lightnessDark}%) 0%,
    hsl(${hue}, ${saturation - 15}%, 32%) 50%,
    hsl(${hue}, ${saturation - 15}%, 36%) 100%)`
  
  return `var(--fund-pill-light, ${lightGradient}) var(--fund-pill-dark, ${darkGradient})`
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

const getFundDisplayName = (fundCode: string) => {
  const fund = groupedByFund.value[fundCode]?.[0]
  if (!fund?.fundName) {
    return `未加载(${fundCode})`
  }
  
  const fundName = fund.fundName
  if (fundName.length > 8) {
    return fundName.substring(0, 8) + '...'
  }
  return fundName
}

const getFullFundName = (fundCode: string) => {
  const fund = groupedByFund.value[fundCode]?.[0]
  return fund?.fundName || `未加载(${fundCode})`
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

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const onStatusTextTap = () => {
  if (holdings.value.length === 0) return
  
  dataStore.updateUserPreferences({ showRefreshButton: true })
  
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
  
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
    dataStore.showToastMessage('请先登录以刷新数据', 'warning')
    const event = new CustomEvent('auth-required', {
      detail: { message: '请先登录以刷新基金数据' }
    })
    window.dispatchEvent(event)
    return
  }
  
  isRefreshing.value = true
  startUpdatingTextAnimation()
  dataStore.startRefresh()
  dataStore.showToastMessage('开始刷新数据，请稍候...', 'info')
  
  const total = holdings.value.length
  
  try {
    for (let i = 0; i < total; i++) {
      const holding = holdings.value[i]
      
      try {
        const fundInfo = await fundService.fetchFundInfo(holding.fundCode)
        const eastmoneyDetails = await fundService.fetchFundDetailsFromEastmoney(holding.fundCode)
        
        await dataStore.updateHolding(holding.id, {
          fundName: fundInfo.name,
          currentNav: fundInfo.nav,
          navDate: new Date(fundInfo.navDate),
          isValid: true,
          navReturn1m: eastmoneyDetails.returns?.navReturn1m,
          navReturn3m: eastmoneyDetails.returns?.navReturn3m,
          navReturn6m: eastmoneyDetails.returns?.navReturn6m,
          navReturn1y: eastmoneyDetails.returns?.navReturn1y
        })
      } catch (error) {
        console.error('刷新基金数据失败:', error)
      }
      
      dataStore.updateRefreshProgress(i + 1)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } finally {
    dataStore.completeRefresh()
    isRefreshing.value = false
    stopUpdatingTextAnimation()
    dataStore.showToastMessage('数据刷新完成！', 'success')
    
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
    dataStore.showToastMessage('数据未更新，请先刷新数据', 'warning')
    return
  }
  
  if (!clientID || clientID.trim() === '') {
    dataStore.showToastMessage('客户号为空', 'error')
    return
  }
  
  navigator.clipboard.writeText(clientID)
    .then(() => {
      dataStore.showToastMessage('客户号已复制到剪贴板', 'success')
    })
    .catch(err => {
      dataStore.showToastMessage('复制失败，请重试', 'error')
    })
}

const generateReport = (holding: any) => {
  if (!hasLatestNavDate.value) {
    dataStore.showToastMessage('数据未更新，请先刷新数据', 'warning')
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
      dataStore.showToastMessage('报告已复制到剪贴板', 'success')
    })
    .catch(err => {
      dataStore.showToastMessage('生成报告失败，请重试', 'error')
    })
}

const handleThemeChange = (event: any) => {
  const { isDark } = event.detail
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
  
  window.addEventListener('theme-changed', handleThemeChange)
  
  onUnmounted(() => {
    updatingTextTimer.value !== null && clearInterval(updatingTextTimer.value)
    autoHideTimer.value !== null && clearTimeout(autoHideTimer.value)
    
    window.removeEventListener('theme-changed', handleThemeChange)
  })
})
</script>

<style scoped>
.summary-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background-color 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  flex-shrink: 0;
  background: var(--bg-primary);
  z-index: 100;
  position: relative;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 0;
  background: var(--bg-primary);
}

.header-section {
  padding: 8px 16px 8px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  background: var(--bg-primary);
  position: relative;
  z-index: 100;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  min-width: 32px;
  padding: 0 10px;
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
  height: 32px;
  border: 1px solid;
  border-radius: 16px;
  background: var(--bg-card);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  padding: 0 12px;
  gap: 4px;
  font-weight: 500;
  min-width: 60px;
}

.sort-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color) !important;
}

.sort-text {
  font-size: 13px;
  font-weight: 500;
}

.sort-order-btn {
  height: 32px;
  min-width: 32px;
  border: 1px solid;
  border-radius: 16px;
  background: var(--bg-card);
  font-size: 14px;
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
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color) !important;
}

.sort-order-icon {
  font-size: 13px;
  font-weight: bold;
}

.status-pill-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-pill {
  height: 32px;
  padding: 6px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 500;
  white-space: nowrap;
  min-width: 70px;
}

.status-pill:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
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

.refresh-pill {
  height: 32px;
  padding: 6px 12px;
  background: var(--accent-color);
  border: 1px solid var(--accent-color);
  border-radius: 16px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  gap: 4px;
  font-weight: 500;
  min-width: 32px;
}

.refresh-pill:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.refresh-pill:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 20px;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.refresh-pill:hover:not(:disabled) .refresh-icon {
  transform: rotate(90deg);
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-box {
  margin-top: 8px;
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
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 36px 8px 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
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
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.clear-search:hover {
  background: var(--text-primary);
}

.content-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding-bottom: 100px;
}

.content-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 16px 16px;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
  overscroll-behavior: contain;
  padding-bottom: 120px;
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
  gap: 4px;
}

.fund-card-wrapper {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fund-pill-card {
  background: var(--bg-card);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 48px;
}

.fund-pill-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.fund-pill-card.expanded {
  background: var(--bg-hover);
  border-radius: 24px;
  border-color: var(--accent-color);
}

.fund-pill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--fund-pill-gradient);
  opacity: 0.7;
  z-index: 0;
  transition: opacity 0.3s ease;
  border-radius: 24px;
}

.fund-pill-card:hover::before {
  opacity: 0.8;
}

.fund-pill-card.expanded::before {
  opacity: 0.6;
  border-radius: 24px;
}

.fund-pill-content {
  position: relative;
  z-index: 1;
}

.fund-pill-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  min-height: 48px;
}

.fund-name-code {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

.fund-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.fund-code {
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: normal;
}

.fund-right-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-sort-return {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  padding: 2px 0;
  flex-shrink: 0;
  min-width: 65px;
  text-align: right;
}

.client-count {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.count-value {
  font-weight: normal;
  font-style: italic;
  font-size: 16px;
}

.expanded-details {
  margin-top: 0;
  padding: 8px 16px 16px;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.3s ease;
  position: relative;
  z-index: 1;
  background: var(--bg-card);
  border-radius: 0 0 24px 24px;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.returns-grid-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.returns-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.return-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.return-label {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.return-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.clients-section {
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
}

.clients-header {
  margin-bottom: 6px;
}

.clients-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.clients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  align-items: center;
}

.client-item-simple {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--text-primary);
  margin: 0 2px;
}

.client-name-simple {
  font-weight: 500;
}

.client-return-simple {
  font-weight: 500;
  font-size: 11px;
}

.separator-simple {
  color: var(--text-secondary);
  margin-left: 2px;
  margin-right: 2px;
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
  bottom: max(120px, env(safe-area-inset-bottom, 0px) + 80px);
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
    padding: 6px 12px 6px;
  }
  
  .content-area {
    padding: 6px 12px 12px;
    padding-bottom: 120px;
  }
  
  .funds-container {
    gap: 3px;
  }
  
  .fund-pill-info {
    padding: 6px 12px;
    min-height: 44px;
  }
  
  .fund-name-code {
    padding: 3px 0;
  }
  
  .fund-name {
    max-width: 50%;
    font-size: 15px;
  }
  
  .fund-code {
    font-size: 13px;
  }
  
  .fund-right-stats {
    gap: 8px;
  }
  
  .current-sort-return {
    font-size: 15px;
    padding: 2px 0;
    min-width: 55px;
  }
  
  .client-count {
    font-size: 13px;
  }
  
  .count-value {
    font-size: 15px;
  }
  
  .expanded-details {
    padding: 6px 12px 12px;
  }
  
  .returns-row {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  
  .return-item {
    padding: 6px 8px;
  }
  
  .return-label, .return-value {
    font-size: 11px;
  }
  
  .clients-section {
    padding-top: 6px;
  }
  
  .clients-label {
    font-size: 11px;
  }
  
  .client-item-simple {
    font-size: 11px;
  }
  
  .client-return-simple {
    font-size: 10px;
  }
  
  .outdated-toast {
    max-width: 320px;
    padding: 14px;
    bottom: max(100px, env(safe-area-inset-bottom, 0px) + 60px);
  }
  
  .sort-btn {
    padding: 0 10px;
    font-size: 12px;
    min-width: 55px;
  }
  
  .sort-text {
    font-size: 12px;
  }
  
  .sort-order-btn {
    min-width: 30px;
    height: 30px;
  }
  
  .status-pill,
  .refresh-pill {
    height: 30px;
    padding: 5px 10px;
    font-size: 12px;
    min-width: 55px;
  }
  
  .refresh-icon {
    font-size: 18px;
  }
}

@media screen and (max-width: 768px) {
  .summary-view {
    -webkit-tap-highlight-color: transparent;
  }
  
  .fixed-header {
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    background: var(--bg-primary);
  }
  
  .header-section {
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    background: var(--bg-primary);
  }
}

:root.dark .status-pill {
  background: var(--bg-hover);
  border-color: var(--border-color);
  color: var(--text-primary);
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

:root.dark .refresh-pill {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

:root.dark .refresh-pill:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.sort-btn:hover,
.sort-order-btn:hover {
  background-color: var(--accent-color);
  color: white !important;
}

.action-btn.active,
.sort-btn:hover,
.sort-order-btn:hover {
  background-color: var(--accent-color);
  color: white !important;
  border-color: var(--accent-color) !important;
}

:root.dark .action-btn.active,
:root.dark .sort-btn:hover,
:root.dark .sort-order-btn:hover {
  background-color: var(--accent-color);
  color: white !important;
  border-color: var(--accent-color) !important;
}

:root.dark .sort-btn,
:root.dark .sort-order-btn {
  background: var(--bg-card);
  color: var(--text-primary);
}

:root.dark .current-sort-return,
:root.dark .client-count {
  background: transparent;
}

:root.dark .return-item {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .return-label,
:root.dark .return-value {
  color: var(--text-primary);
}

:root.dark .fund-name {
  color: var(--text-primary);
}

:root.dark .fund-code {
  color: var(--text-secondary);
}

:root.dark .return-value[style*="color: #ef4444"] {
  color: #f87171 !important;
}

:root.dark .return-value[style*="color: #10b981"] {
  color: #34d399 !important;
}

:root.dark .return-value[style*="color: #666"] {
  color: #9ca3af !important;
}

:root {
  --bg-primary-rgb: 248, 250, 252;
}

:root.dark {
  --bg-primary-rgb: 15, 23, 42;
}
</style>
