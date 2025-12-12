<template>
  <div class="client-view" :key="`${refreshKey}-${themeKey}-${privacyKey}`">
    <!-- 完全固定的顶部工具栏 -->
    <div class="fixed-header">
      <div class="header-section">
        <div class="header-row">
          <div class="action-buttons">
            <button
              class="action-btn"
              :class="{ active: areAnyCardsExpanded }"
              @click="expandedClients.size > 0 ? expandedClients.clear() : groupedHoldingsByClientName.forEach(g => expandedClients.add(g.id))"
              :title="areAnyCardsExpanded ? '折叠所有' : '展开所有'"
            >
              {{ areAnyCardsExpanded ? '⇲' : '⇱' }}
            </button>
            
            <button
              class="action-btn"
              :class="{ active: isSearchExpanded }"
              @click="isSearchExpanded = !isSearchExpanded"
              :title="isSearchExpanded ? '隐藏搜索' : '显示搜索'"
            >
              🔍
            </button>
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
            />
            <button
              v-if="searchText"
              class="clear-search"
              @click="searchText = ''"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可独立滚动的下方内容区域 -->
    <div class="content-wrapper">
      <div class="content-area">
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
              class="holding-card-compact"
            >
              <div class="holding-header-compact">
                <div class="holding-info-compact">
                  <div class="fund-name-row">
                    <h4 class="fund-name">{{ getFundDisplayName(holding.fundName, holding.fundCode) }}</h4>
                    <span class="fund-code-inline">({{ holding.fundCode }})</span>
                  </div>
                  <div class="client-info-row">
                    <div class="client-name-id-display">
                      <span class="client-name-text">{{ getClientDisplayName(holding.clientName, holding.clientID).name }}</span>
                      <span v-if="holding.clientID" class="client-id-text">({{ holding.clientID }})</span>
                    </div>
                  </div>
                </div>
                <div class="nav-info-top-right">
                  <span class="nav-with-date">
                    {{ holding.currentNav.toFixed(4) }}<span class="nav-date-inline">({{ formatNavDate(new Date(holding.navDate)) }})</span>
                  </span>
                </div>
              </div>
              
              <div class="holding-details-compact">
                <div class="detail-row detail-row-two-items">
                  <span class="detail-label">购买金额:</span>
                  <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                  <span class="detail-label detail-label-spacer">份额:</span>
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
                  <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).annualized) }">
                    {{ formatPercentage(calculateProfit(holding).annualized) }}
                  </span>
                  <span class="detail-label-inline">[年化]</span>
                  <span class="detail-value" :style="{ color: getReturnColor(absoluteReturnPercentage(holding)) }" style="margin-left: 8px;">
                    {{ formatPercentage(absoluteReturnPercentage(holding)) }}
                  </span>
                  <span class="detail-label-inline">[绝对]</span>
                </div>
                
                <div class="detail-row date-info-row detail-row-two-items">
                  <span class="detail-label">购买日期:</span>
                  <span class="detail-value">{{ formatPurchaseDate(new Date(holding.purchaseDate)) }}</span>
                  <span class="detail-label detail-label-spacer">持有天数:</span>
                  <span class="detail-value">{{ calculateHoldingDays(holding) }}天</span>
                </div>
                
                <div v-if="holding.remarks" class="detail-row remarks-with-actions">
                  <span class="detail-label">备注:</span>
                  <span class="detail-value remarks-text">{{ holding.remarks }}</span>
                  <div class="inline-actions">
                    <button
                      class="holding-action-btn copy-btn"
                      @click.stop="handleCopyClientID(holding.clientID, holding.clientName)"
                      :disabled="!holding.clientID"
                      :title="holding.clientID ? '复制客户号' : '无客户号'"
                    >
                      复制客户号
                    </button>
                    <button
                      class="holding-action-btn report-btn"
                      @click.stop="generateReport(holding)"
                      title="生成报告"
                    >
                      复制报告
                    </button>
                  </div>
                </div>
                
                <div v-else class="detail-row remarks-with-actions">
                  <span class="detail-label placeholder-label"></span>
                  <span class="detail-value placeholder-value"></span>
                  <div class="inline-actions">
                    <button
                      class="holding-action-btn copy-btn"
                      @click.stop="handleCopyClientID(holding.clientID, holding.clientName)"
                      :disabled="!holding.clientID"
                      :title="holding.clientID ? '复制客户号' : '无客户号'"
                    >
                      复制客户号
                    </button>
                    <button
                      class="holding-action-btn report-btn"
                      @click.stop="generateReport(holding)"
                      title="生成报告"
                    >
                      复制报告
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="loadedSearchResultCount < searchResults.length" class="load-more">
              <button @click="loadedSearchResultCount += 10">加载更多</button>
            </div>
          </div>
        </div>
        
        <div v-else class="client-groups">
          <div v-if="holdings.length === 0" class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>当前没有数据</h3>
            <p>请导入数据开始使用</p>
          </div>
          
          <div v-else class="clients-container">
            <div
              v-for="clientGroup in groupedHoldingsByClientName"
              :key="clientGroup.id"
              class="client-group-single"
              :class="{ expanded: expandedClients.has(clientGroup.id) }"
            >
              <div
                class="client-pill-card"
                @click="expandedClients.has(clientGroup.id) ? expandedClients.delete(clientGroup.id) : expandedClients.add(clientGroup.id)"
                :style="{ '--client-pill-gradient': getClientPillGradient(clientGroup.clientName) }"
              >
                <div class="client-pill-content">
                  <div class="client-pill-info">
                    <div class="client-name-id-display-single">
                      <span class="client-name-text-single">{{ getClientDisplayName(clientGroup.clientName, clientGroup.clientID).name }}</span>
                      <span v-if="clientGroup.clientID" class="client-id-text-single">({{ clientGroup.clientID }})</span>
                    </div>
                    
                    <div class="client-right-stats">
                      <span class="holdings-count-single" :style="{ color: colorForHoldingCount(clientGroup.holdings.length) }">
                        {{ clientGroup.holdings.length }}支
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="expandedClients.has(clientGroup.id)" class="group-content-single">
                <div
                  v-for="holding in clientGroup.holdings.slice(0, loadedGroupedClientCount)"
                  :key="holding.id"
                  class="holding-card-compact"
                >
                  <div class="holding-header-compact">
                    <div class="holding-info-compact">
                      <div class="fund-name-row">
                        <h4 class="fund-name">{{ getFundDisplayName(holding.fundName, holding.fundCode) }}</h4>
                        <span class="fund-code-inline">({{ holding.fundCode }})</span>
                      </div>
                    </div>
                    <div class="nav-info-top-right">
                      <span class="nav-with-date">
                        {{ holding.currentNav.toFixed(4) }}<span class="nav-date-inline">({{ formatNavDate(new Date(holding.navDate)) }})</span>
                      </span>
                    </div>
                  </div>
                  
                  <div class="holding-details-compact">
                    <div class="detail-row detail-row-two-items">
                      <span class="detail-label">购买金额:</span>
                      <span class="detail-value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                      <span class="detail-label detail-label-spacer">份额:</span>
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
                      <span class="detail-value" :style="{ color: getReturnColor(calculateProfit(holding).annualized) }">
                        {{ formatPercentage(calculateProfit(holding).annualized) }}
                      </span>
                      <span class="detail-label-inline">[年化]</span>
                      <span class="detail-value" :style="{ color: getReturnColor(absoluteReturnPercentage(holding)) }" style="margin-left: 8px;">
                        {{ formatPercentage(absoluteReturnPercentage(holding)) }}
                      </span>
                      <span class="detail-label-inline">[绝对]</span>
                    </div>
                    
                    <div class="detail-row date-info-row detail-row-two-items">
                      <span class="detail-label">购买日期:</span>
                      <span class="detail-value">{{ formatPurchaseDate(new Date(holding.purchaseDate)) }}</span>
                      <span class="detail-label detail-label-spacer">持有天数:</span>
                      <span class="detail-value">{{ calculateHoldingDays(holding) }}天</span>
                    </div>
                    
                    <div v-if="holding.remarks" class="detail-row remarks-with-actions">
                      <span class="detail-label">备注:</span>
                      <span class="detail-value remarks-text">{{ holding.remarks }}</span>
                      <div class="inline-actions">
                        <button
                          class="holding-action-btn copy-btn"
                          @click.stop="handleCopyClientID(holding.clientID, holding.clientName)"
                          :disabled="!holding.clientID"
                          :title="holding.clientID ? '复制客户号' : '无客户号'"
                        >
                          复制客户号
                        </button>
                        <button
                          class="holding-action-btn report-btn"
                          @click.stop="generateReport(holding)"
                          title="生成报告"
                        >
                          复制报告
                        </button>
                      </div>
                    </div>
                    
                    <div v-else class="detail-row remarks-with-actions">
                      <span class="detail-label placeholder-label"></span>
                      <span class="detail-value placeholder-value"></span>
                      <div class="inline-actions">
                        <button
                          class="holding-action-btn copy-btn"
                          @click.stop="handleCopyClientID(holding.clientID, holding.clientName)"
                          :disabled="!holding.clientID"
                          :title="holding.clientID ? '复制客户号' : '无客户号'"
                        >
                          复制客户号
                        </button>
                        <button
                          class="holding-action-btn report-btn"
                          @click.stop="generateReport(holding)"
                          title="生成报告"
                        >
                          复制报告
                        </button>
                      </div>
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
import { useAuthStore } from '@/stores/authStore'
import { fundService } from '@/services/fundService'
import ToastMessage from '@/components/common/ToastMessage.vue'

const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

const refreshKey = ref(0)
const privacyKey = ref(0)
const themeKey = ref(0)

const isSearchExpanded = ref(false)
const searchText = ref('')
const expandedClients = ref<Set<string>>(new Set())
const isRefreshing = ref(false)
const updatingTextState = ref(0)
const updatingTextTimer = ref<number | null>(null)
const loadedGroupedClientCount = ref(10)
const loadedSearchResultCount = ref(10)

const holdings = computed(() => dataStore.holdings)
const isPrivacyMode = computed(() => dataStore.isPrivacyMode)
const showRefreshButton = computed(() => dataStore.showRefreshButton)
const refreshProgress = computed(() => dataStore.refreshProgress)
const currentUser = computed(() => authStore.currentUser)

watch(isPrivacyMode, (newValue) => {
  privacyKey.value = Date.now()
})

const previousWorkday = computed(() => {
  const today = new Date()
  const date = new Date(today)
  while (true) {
    date.setDate(date.getDate() - 1)
    const weekday = date.getDay()
    if (weekday >= 1 && weekday <= 5) return date
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

const groupedHoldingsByClientName = computed(() => {
  const allHoldings = holdings.value
  const groupedDictionary: Record<string, typeof allHoldings> = {}
  allHoldings.forEach(holding => {
    const key = holding.clientName
    if (!groupedDictionary[key]) groupedDictionary[key] = []
    groupedDictionary[key].push(holding)
  })
  
  const clientGroups = Object.entries(groupedDictionary).map(([clientName, holdings]) => {
    const totalAUM = holdings.reduce((sum, holding) => sum + (holding.currentNav * holding.purchaseShares), 0)
    const representativeClientID = holdings[0]?.clientID || ''
    const sortedHoldings = [...holdings].sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime())
    return {
      id: clientName,
      clientName,
      clientID: representativeClientID,
      totalAUM,
      holdings: sortedHoldings
    }
  })
  
  clientGroups.sort((a, b) => a.clientName.localeCompare(b.clientName, 'zh-CN'))
  return clientGroups
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

const getFundDisplayName = (fundName: string, fundCode: string): string => {
  return fundName || (fundCode ? `未加载(${fundCode})` : '未加载')
}

const getClientDisplayName = (clientName: string, clientID: string) => {
  const processedName = dataStore.isPrivacyMode ?
    (clientName.length <= 1 ? clientName :
     clientName.length === 2 ? clientName.charAt(0) + '*' :
     clientName.charAt(0) + '*'.repeat(clientName.length - 2) + clientName.charAt(clientName.length - 1)) :
    clientName
  
  return {
    name: processedName,
    id: clientID
  }
}

// 生成客户药丸渐变背景色
const getClientPillGradient = (clientName: string): string => {
  // 简单的hash函数生成颜色
  let hash = 0
  for (let i = 0; i < clientName.length; i++) {
    hash = ((hash << 5) - hash) + clientName.charCodeAt(i)
    hash |= 0
  }
  hash = Math.abs(hash)
  
  const hue = hash % 360
  const saturation = 65 + (hash % 25)  // 65-90%饱和度
  const lightnessLight = 88 + (hash % 7)  // 88-95%亮度（浅色模式）
  const lightnessDark = 28 + (hash % 7)   // 28-35%亮度（深色模式）
  
  const lightGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturation}%, ${lightnessLight}%) 0%,
    hsl(${hue}, ${saturation}%, 94%) 50%,
    hsl(${hue}, ${saturation}%, 98%) 100%)`
  
  const darkGradient = `linear-gradient(90deg,
    hsl(${hue}, ${saturation - 15}%, ${lightnessDark}%) 0%,
    hsl(${hue}, ${saturation - 15}%, 32%) 50%,
    hsl(${hue}, ${saturation - 15}%, 36%) 100%)`
  
  return `var(--client-pill-light, ${lightGradient}) var(--client-pill-dark, ${darkGradient})`
}

const colorForHoldingCount = (count: number) => {
  if (count === 1) return '#eab308'
  if (count <= 3) return '#f97316'
  return '#ef4444'
}

const calculateHoldingDays = (holding: any) => {
  const endDate = new Date(holding.navDate)
  const startDate = new Date(holding.purchaseDate)
  
  // 如果购买日期晚于净值日期，则持有天数为0
  if (startDate > endDate) return 0
  
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime())
  // 使用 Math.floor 而不是 Math.ceil，并且不加1
  const days = Math.floor(timeDiff / (1000 * 3600 * 24))
  return days > 0 ? days : 0
}

const calculateProfit = (holding: any) => {
  if (!holding.isValid || holding.purchaseAmount <= 0) return { absolute: 0, annualized: 0 }
  const currentValue = holding.currentNav * holding.purchaseShares
  const absoluteProfit = currentValue - holding.purchaseAmount
  const holdingDays = calculateHoldingDays(holding)
  const absoluteReturnPercentage = (absoluteProfit / holding.purchaseAmount)
  
  let annualizedReturn = 0
  if (holdingDays > 0) {
    // 防止极端幂运算导致数值溢出，添加限制条件
    if (holdingDays < 30) { // 持有天数小于30天
        // 对于极短期持有，使用简单的年化计算，防止指数爆炸
        annualizedReturn = absoluteReturnPercentage * (365 / holdingDays) * 100
    } else {
        // 正常计算年化收益率
        // 添加安全检查：如果指数过大，使用对数计算
        const exponent = 365 / holdingDays
        if (exponent > 10) { // 指数过大时，使用近似计算
            annualizedReturn = absoluteReturnPercentage * 365 * 100 / holdingDays
        } else {
            annualizedReturn = (Math.pow(1 + absoluteReturnPercentage, exponent) - 1) * 100
        }
    }
    
    // 限制年化收益率在合理范围内（-1000% 到 1000%）
    if (annualizedReturn > 1000) annualizedReturn = 1000
    if (annualizedReturn < -1000) annualizedReturn = -1000
  }
  
  return { absolute: absoluteProfit, annualized: annualizedReturn }
}

// 计算绝对收益率
const absoluteReturnPercentage = (holding: any) => {
  if (!holding.isValid || holding.purchaseAmount <= 0) return 0
  const profit = calculateProfit(holding)
  return (profit.absolute / holding.purchaseAmount) * 100
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000 && amount % 10000 === 0) return `${(amount / 10000).toFixed(0)}万`
  else if (amount >= 10000) return `${(amount / 10000).toFixed(2)}万`
  else return `${amount.toFixed(2)}元`
}

const formatPercentage = (value: number) => {
  // 检查是否为极大的科学计数法，如果是则显示为 'ERR' 或 'N/A'
  if (!isFinite(value) || Math.abs(value) > 1e100) {
    return 'N/A'
  }
  
  // 限制小数位数为2位
  const roundedValue = Math.round(value * 100) / 100
  
  if (roundedValue > 0) return `+${roundedValue.toFixed(2)}%`
  else if (roundedValue < 0) return `${roundedValue.toFixed(2)}%`
  else return '0.00%'
}

const getReturnColor = (value: number) => {
  if (value > 0) return '#ef4444'
  if (value < 0) return '#10b981'
  return '#666'
}

const formatNavDate = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
}

const formatPurchaseDate = (date: Date) => {
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
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
  isRefreshing.value = true
  startUpdatingTextAnimation()
  dataStore.startRefresh()
  dataStore.showToastMessage('开始刷新数据，请稍候...', 'info')
  dataStore.addLog('开始刷新基金数据', 'info')
  
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
        console.error('刷新基金数据失败:', error)
      }
      dataStore.updateRefreshProgress(i + 1)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } finally {
    dataStore.completeRefresh()
    isRefreshing.value = false
    stopUpdatingTextAnimation()
    dataStore.addLog('基金数据刷新完成', 'success')
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

const handleCopyClientID = (clientID: string, clientName: string) => {
  // 检查权限 - 需要客户分层权限
  if (!currentUser.value || currentUser.value.user_type === 'free') {
    dataStore.showToastMessage('不支持基础用户使用此功能', 'warning')
    return
  }
  
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
  // 检查权限 - 需要客户分层权限
  if (!currentUser.value || currentUser.value.user_type === 'free') {
    dataStore.showToastMessage('不支持基础用户使用此功能', 'warning')
    return
  }
  
  if (!hasLatestNavDate.value) {
    dataStore.showToastMessage('数据未更新，请先刷新数据', 'warning')
    return
  }
  
  const profit = calculateProfit(holding).absolute
  const annualizedReturn = calculateProfit(holding).annualized
  const absoluteReturn = absoluteReturnPercentage(holding)
  const purchaseAmount = holding.purchaseAmount
  const purchaseShares = holding.purchaseShares
  const currentNav = holding.currentNav
  const navDate = new Date(holding.navDate)
  const purchaseDate = new Date(holding.purchaseDate)
  
  const purchaseDateStr = formatPurchaseDate(purchaseDate)
  const navDateStr = formatNavDate(navDate)
  
  const holdingDays = calculateHoldingDays(holding)
  
  // 严格按照Swift格式生成报告
  const reportContent = `${holding.fundName || `未加载(${holding.fundCode})`} | ${holding.fundCode}
├ 购买日期:${purchaseDateStr}
├ 持有天数:${holdingDays}天
├ 购买金额:${formatCurrency(purchaseAmount)}
├ 最新净值:${currentNav.toFixed(4)} | ${navDateStr}
├ 收益:${profit > 0 ? '+' : ''}${profit.toFixed(2)}元
├ 收益率:${formatPercentage(annualizedReturn)}(年化)
└ 收益率:${formatPercentage(absoluteReturn)}(绝对)`
  
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

const autoHideTimer = ref<number | null>(null)

watch(holdings, () => {
  refreshKey.value = Date.now()
})

onMounted(() => {
  dataStore.init()
  
  window.addEventListener('theme-changed', handleThemeChange)
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (dataStore.userPreferences.themeMode === 'system') {
      themeKey.value = Date.now()
      refreshKey.value = Date.now()
    }
  }
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  onUnmounted(() => {
    updatingTextTimer.value !== null && clearInterval(updatingTextTimer.value)
    autoHideTimer.value !== null && clearTimeout(autoHideTimer.value)
    
    window.removeEventListener('theme-changed', handleThemeChange)
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  })
})
</script>

<style scoped>
.client-view {
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

/* 完全固定的顶部区域 - 永远不滚动 */
.fixed-header {
  flex-shrink: 0;
  background: var(--bg-primary);
  z-index: 100;
  position: relative;
  /* 修复：统一的安全区域处理 */
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 0;
  /* 确保背景延伸到状态栏 */
  background: var(--bg-primary);
}

.header-section {
  padding: 12px 16px 12px;
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
  margin-bottom: 12px;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.action-buttons {
  display: flex;
  gap: 8px;
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

.status-pill-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-pill {
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
  background: var(--bg-hover);
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
  padding: 8px 16px;
  background: var(--accent-color);
  border: 1px solid var(--accent-color);
  border-radius: 18px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  gap: 6px;
  font-weight: 500;
  min-width: 36px;
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

/* 关键：独立的滚动内容区域 */
.content-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  /* 修复：为导航栏添加底部间距，防止内容被遮挡 */
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
  padding: 12px 16px 16px;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
  overscroll-behavior: contain;
  /* 修复：添加底部内边距确保内容不会被导航栏遮挡 */
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

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clients-container {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 进一步减小间距使其更紧凑 */
}

.client-group-single {
  margin-bottom: 4px;
  border-radius: 24px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  overflow: hidden;
}

.client-group-single.expanded {
  border: 1px solid var(--accent-color);
  border-radius: 24px;
  background: var(--bg-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.client-pill-card {
  background: var(--bg-card);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  /* 添加阴影效果以匹配SummaryView */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 48px;
}

.client-group-single.expanded .client-pill-card {
  border-radius: 24px 24px 0 0;
  border-color: transparent;
  border-bottom: none;
  box-shadow: none;
}

.client-pill-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.client-pill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--client-pill-gradient);
  opacity: 0.7;
  z-index: 0;
  transition: opacity 0.3s ease;
  border-radius: 24px;
}

.client-pill-card:hover::before {
  opacity: 0.8;
}

.client-group-single.expanded .client-pill-card::before {
  opacity: 0.6;
  border-radius: 24px 24px 0 0;
}

.client-pill-content {
  position: relative;
  z-index: 1;
}

.client-pill-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  min-height: 48px; /* 增加高度使其更匹配SummaryView */
}

.client-name-id-display-single {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

.client-name-text-single {
  font-size: 16px; /* 增大字体大小 */
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.client-id-text-single {
  font-size: 14px; /* 增大字体大小 */
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: normal;
}

.client-right-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.holdings-count-single {
  font-size: 16px; /* 增大字体大小 */
  font-weight: 700;
  white-space: nowrap;
  padding: 6px 12px; /* 增加内边距使其更显眼 */
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  min-width: 65px;
  text-align: center;
}

.group-content-single {
  padding: 8px;
  background: var(--bg-hover);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.holding-card-compact {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.holding-card-compact:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.client-group-single.expanded .holding-card-compact {
  border-color: var(--border-color);
  margin-left: 8px;
  margin-right: 8px;
  width: calc(100% - 16px);
}

.client-group-single.expanded .holding-card-compact:hover {
  border-color: var(--border-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.holding-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.holding-info-compact {
  flex: 1;
  min-width: 0;
}

.fund-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.fund-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.fund-code-inline {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: normal;
}

.client-info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.client-name-id-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.3;
}

.client-name-text {
  font-weight: 600;
}

.client-id-text {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.7;
  font-weight: normal;
}

.nav-info-top-right {
  text-align: right;
  min-width: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.nav-with-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-color);
  line-height: 1.2;
  white-space: nowrap;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.nav-date-inline {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: normal;
}

.holding-details-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--bg-hover);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  flex-wrap: wrap;
}

.detail-row-two-items {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  align-items: center;
  gap: 4px;
}

.detail-label-spacer {
  margin-left: 8px;
}

.date-info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: var(--text-secondary);
}

.detail-label {
  color: var(--text-secondary);
  min-width: 35px;
  font-size: 11px;
  font-weight: 500;
}

.detail-label-inline {
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: normal;
  font-style: italic;
}

.detail-value {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 11px;
}

.remarks-with-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--bg-hover);
  flex-wrap: nowrap;
}

.remarks-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder-label,
.placeholder-value {
  flex: 1;
  min-width: 0;
}

.inline-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

.holding-action-btn {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.holding-action-btn.copy-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.holding-action-btn.report-btn:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.holding-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-more {
  text-align: center;
  padding: 10px;
}

.load-more button {
  padding: 6px 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s ease;
}

.load-more button:hover {
  background: #2563eb;
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

@media (max-width: 768px) {
  .header-section {
    padding: 10px 12px 10px;
  }
  
  .content-area {
    padding: 10px 12px 12px;
    padding-bottom: 120px; /* 移动端也保持底部间距 */
  }
  
  .clients-container {
    gap: 3px; /* 移动端间距更小 */
  }
  
  .client-pill-info {
    padding: 6px 12px;
    min-height: 44px; /* 移动端稍小 */
  }
  
  .client-name-text-single {
    max-width: 50%;
    font-size: 15px; /* 移动端稍小但保持增大效果 */
  }
  
  .client-id-text-single {
    font-size: 13px; /* 移动端稍小但保持增大效果 */
  }
  
  .holdings-count-single {
    font-size: 15px; /* 移动端稍小但保持增大效果 */
    padding: 5px 10px;
    min-width: 55px;
  }
  
  .holding-header-compact {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .nav-info-top-right {
    min-width: auto;
    width: auto;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  
  .detail-row {
    font-size: 11px;
  }
  
  .detail-row-two-items {
    grid-template-columns: auto 1fr auto 1fr;
  }
  
  .detail-label {
    min-width: 30px;
    font-size: 10px;
  }
  
  .detail-value {
    font-size: 10px;
  }
  
  .inline-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  
  .holding-action-btn {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
  
  .empty-icon {
    font-size: 36px;
  }
  
  .empty-state h3 {
    font-size: 16px;
  }
  
  .empty-state p {
    font-size: 13px;
  }
  
  .status-pill,
  .refresh-pill {
    min-width: 60px;
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .refresh-icon {
    font-size: 18px;
  }
  
  .client-group-single.expanded .holding-card-compact {
    margin-left: 4px;
    margin-right: 4px;
    width: calc(100% - 8px);
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: 8px 10px 10px;
    padding-bottom: 120px; /* 小屏幕也保持底部间距 */
  }
  
  .clients-container {
    gap: 3px;
  }
  
  .client-group-single {
    border-radius: 20px;
  }
  
  .client-group-single.expanded {
    border-radius: 20px;
  }
  
  .client-pill-card {
    border-radius: 20px;
    min-height: 44px;
  }
  
  .client-group-single.expanded .client-pill-card {
    border-radius: 20px 20px 0 0;
  }
  
  .client-pill-info {
    padding: 5px 10px;
    min-height: 42px;
  }
  
  .client-name-text-single {
    font-size: 14px; /* 小屏幕稍小 */
  }
  
  .client-id-text-single {
    font-size: 12px; /* 小屏幕稍小 */
  }
  
  .holdings-count-single {
    font-size: 14px; /* 小屏幕稍小 */
    padding: 4px 8px;
  }
  
  .holding-card-compact {
    padding: 10px;
    margin-bottom: 6px;
  }
  
  .group-content-single {
    padding: 6px;
  }
  
  .fund-name {
    font-size: 12px;
  }
  
  .fund-code-inline {
    font-size: 10px;
  }
  
  .client-name-text {
    font-size: 11px;
  }
  
  .client-id-text {
    font-size: 10px;
  }
  
  .nav-with-date {
    font-size: 12px;
  }
  
  .nav-date-inline {
    font-size: 9px;
  }
  
  .inline-actions {
    flex-direction: row;
    gap: 4px;
    width: auto;
  }
  
  .holding-action-btn {
    width: auto;
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .remarks-text {
    max-width: 60%;
  }
}

@media (hover: none) and (pointer: coarse) {
  .client-pill-card:active {
    background: var(--bg-hover);
  }
  
  .holding-card-compact:active {
    transform: scale(0.98);
  }
}

/* === iOS PWA 特定修复 === */
@media screen and (max-width: 768px) {
  .client-view {
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

/* 深色模式适配 */
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

:root.dark .clear-search {
  background: var(--text-secondary);
  color: var(--bg-primary);
}

:root.dark .clear-search:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

:root.dark .holding-action-btn {
  background: var(--bg-card);
  border-color: var(--border-color);
}

:root.dark .holdings-count-single {
  background: rgba(30, 41, 59, 0.9);
  color: var(--text-primary);
}

:root.dark .client-pill-card::before {
  opacity: 0.8;
}

:root.dark .client-pill-card:hover::before {
  opacity: 0.9;
}

:root.dark .client-group-single.expanded .client-pill-card::before {
  opacity: 0.7;
}

:root.dark .client-group-single.expanded {
  background: rgba(30, 41, 59, 0.5);
  border-color: var(--accent-color);
}

/* 为深色模式添加RGB值变量 */
:root {
  --bg-primary-rgb: 248, 250, 252; /* #f8fafc */
}

:root.dark {
  --bg-primary-rgb: 15, 23, 42; /* #0f172a */
}
</style>
