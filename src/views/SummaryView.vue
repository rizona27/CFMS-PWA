<template>
  <div class="summary-view">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
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
        
        <div class="sort-controls">
          <button 
            class="sort-btn"
            :class="{ active: selectedSortKey !== 'none' }"
            @click="cycleSortKey"
            :style="{ color: selectedSortKey !== 'none' ? sortKeyColor : '' }"
          >
            <span class="sort-icon">{{ sortButtonIcon }}</span>
            <span v-if="selectedSortKey !== 'none'" class="sort-label">
              {{ sortKeyDisplay }}
            </span>
          </button>
          
          <button 
            v-if="selectedSortKey !== 'none'"
            class="order-btn"
            @click="toggleSortOrder"
            :style="{ background: sortKeyColor }"
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
            placeholder="搜索客户名、基金代码、基金名称..."
            class="search-input"
            @input="performSearch"
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
    <div class="content-area" ref="contentArea">
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
              <div class="fund-info">
                <h3 class="fund-name">{{ getFundName(fundCode) }}</h3>
                <span class="fund-code">[{{ fundCode }}]</span>
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
                
                <div v-if="!isPrivacyMode || searchText" class="clients-section">
                  <div class="clients-header">
                    <span class="clients-label">持有客户:</span>
                  </div>
                  <div class="clients-list">
                    <span 
                      v-for="(holding, index) in groupedByFund[fundCode]" 
                      :key="holding.id"
                      class="client-item"
                    >
                      <span class="client-name">
                        {{ isPrivacyMode && !searchText ? getPrivacyName(holding.clientName) : holding.clientName }}
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
          <span class="outdated-count">{{ outdatedFundsCount }}</span>
          支
        </div>
        <div v-if="outdatedFunds.length > 0" class="toast-list">
          <div 
            v-for="fund in outdatedFunds.slice(0, 5)" 
            :key="fund.fundCode"
            class="toast-item"
          >
            {{ getFundDisplayName(fund.fundName) }} [{{ fund.fundCode }}]
          </div>
          <div v-if="outdatedFunds.length > 5" class="toast-more">
            ... 还有{{ outdatedFunds.length - 5 }}支
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// 状态
const isSearchExpanded = ref(false)
const searchText = ref('')
const searchTimeout = ref<number | null>(null)
const selectedSortKey = ref('none')
const sortOrder = ref<'ascending' | 'descending'>('descending')
const expandedFundCodes = ref<Set<string>>(new Set())
const showStatusText = ref(true)
const showRefreshButton = ref(false)
const showOutdatedToast = ref(false)
const isRefreshing = ref(false)
const updatingTextState = ref(0)
const updatingTextTimer = ref<number | null>(null)
const autoHideTimer = ref<number | null>(null)

// 计算属性
const holdings = computed(() => dataStore.holdings)
const isPrivacyMode = computed(() => dataStore.isPrivacyMode)
const groupedByFund = computed(() => dataStore.groupedByFund)
const refreshProgress = computed(() => dataStore.refreshProgress)

const sortKeyDisplay = computed(() => {
  const map: Record<string, string> = {
    none: '无排序',
    navReturn1m: '近1月',
    navReturn3m: '近3月',
    navReturn6m: '近6月',
    navReturn1y: '近1年'
  }
  return map[selectedSortKey.value]
})

const sortKeyColor = computed(() => {
  const map: Record<string, string> = {
    none: '#666',
    navReturn1m: '#3b82f6',
    navReturn3m: '#8b5cf6',
    navReturn6m: '#f97316',
    navReturn1y: '#ef4444'
  }
  return map[selectedSortKey.value]
})

const sortButtonIcon = computed(() => {
  const map: Record<string, string> = {
    none: '⇅',
    navReturn1m: '📅',
    navReturn3m: '📆',
    navReturn6m: '🗓️',
    navReturn1y: '⏰'
  }
  return map[selectedSortKey.value]
})

const areAnyCardsExpanded = computed(() => expandedFundCodes.value.size > 0)

const filteredHoldings = computed(() => {
  if (!searchText.value) return holdings.value
  
  const searchLower = searchText.value.toLowerCase()
  return holdings.value.filter(holding => 
    holding.clientName.toLowerCase().includes(searchLower) ||
    holding.fundCode.toLowerCase().includes(searchLower) ||
    holding.fundName.toLowerCase().includes(searchLower)
  )
})

const filteredGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  filteredHoldings.value.forEach(holding => {
    if (!groups[holding.fundCode]) {
      groups[holding.fundCode] = []
    }
    groups[holding.fundCode].push(holding)
  })
  return groups
})

const sortedFundCodes = computed(() => {
  const codes = Object.keys(filteredGroups.value)
  if (selectedSortKey.value === 'none') {
    return codes.sort()
  }
  
  return codes.sort((a, b) => {
    const fundA = filteredGroups.value[a]?.[0]
    const fundB = filteredGroups.value[b]?.[0]
    
    if (!fundA || !fundB) return 0
    
    let valueA = 0
    let valueB = 0
    
    switch (selectedSortKey.value) {
      case 'navReturn1m': valueA = fundA.navReturn1m || 0; valueB = fundB.navReturn1m || 0; break
      case 'navReturn3m': valueA = fundA.navReturn3m || 0; valueB = fundB.navReturn3m || 0; break
      case 'navReturn6m': valueA = fundA.navReturn6m || 0; valueB = fundB.navReturn6m || 0; break
      case 'navReturn1y': valueA = fundA.navReturn1y || 0; valueB = fundB.navReturn1y || 0; break
    }
    
    return sortOrder.value === 'ascending' ? valueA - valueB : valueB - valueA
  })
})

const statusText = computed(() => {
  if (holdings.value.length === 0) return '暂无数据'
  
  const latestDate = getLatestNavDate()
  if (!latestDate) return '暂无数据'
  
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' })
  const dateString = formatter.format(latestDate)
  
  if (hasLatestNavDate()) {
    return `最新日期: ${dateString}`
  } else {
    const previousWorkday = getPreviousWorkday()
    const prevDateString = formatter.format(previousWorkday)
    return `待更新: ${prevDateString}`
  }
})

const outdatedFunds = computed(() => {
  const latestDate = getLatestNavDate()
  if (!latestDate) return []
  
  return holdings.value.filter(holding => {
    if (!holding.isValid) return false
    const holdingDate = new Date(holding.navDate)
    return !isSameDay(holdingDate, latestDate)
  })
})

const outdatedFundsCount = computed(() => {
  return outdatedFunds.value.length
})

const updatingText = computed(() => {
  const baseText = ''
  const dots = '.'.repeat(updatingTextState.value % 4)
  return baseText + dots
})

// 方法
const goBack = () => {
  router.push('/holdings/manage')
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

const performSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    // 搜索逻辑已在计算属性中实现
  }, 300)
}

const clearSearch = () => {
  searchText.value = ''
}

const cycleSortKey = () => {
  const keys = ['none', 'navReturn1m', 'navReturn3m', 'navReturn6m', 'navReturn1y']
  const currentIndex = keys.indexOf(selectedSortKey.value)
  selectedSortKey.value = keys[(currentIndex + 1) % keys.length]
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ascending' ? 'descending' : 'ascending'
}

const toggleFundCard = (fundCode: string) => {
  if (expandedFundCodes.value.has(fundCode)) {
    expandedFundCodes.value.delete(fundCode)
  } else {
    expandedFundCodes.value.add(fundCode)
  }
}

const getFundName = (fundCode: string) => {
  const fund = filteredGroups.value[fundCode]?.[0]
  return fund?.fundName || '加载中...'
}

const getClientCountColor = (count: number) => {
  if (count === 1) return '#eab308'
  if (count <= 3) return '#f97316'
  return '#ef4444'
}

const getFundReturn = (fundCode: string, period: string) => {
  const fund = filteredGroups.value[fundCode]?.[0]
  if (!fund) return null
  
  switch (period) {
    case '1m': return fund.navReturn1m || null
    case '3m': return fund.navReturn3m || null
    case '6m': return fund.navReturn6m || null
    case '1y': return fund.navReturn1y || null
    default: return null
  }
}

const formatReturn = (value: number | null) => {
  if (value === null) return '/'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

const getReturnColor = (value: number | null) => {
  if (value === null) return '#666'
  return value >= 0 ? '#10b981' : '#ef4444'
}

const getHoldingReturn = (holding: any) => {
  if (!holding.isValid || holding.purchaseAmount <= 0) return null
  const currentValue = holding.currentNav * holding.purchaseShares
  return ((currentValue - holding.purchaseAmount) / holding.purchaseAmount) * 100
}

const getPrivacyName = (name: string) => {
  if (name.length <= 1) return name
  if (name.length === 2) return name.charAt(0) + '*'
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
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

const getLatestNavDate = () => {
  const validHoldings = holdings.value.filter(h => h.isValid)
  if (validHoldings.length === 0) return null
  
  return validHoldings.reduce((latest, holding) => {
    const date = new Date(holding.navDate)
    return date > latest ? date : latest
  }, new Date(0))
}

const getPreviousWorkday = () => {
  const today = new Date()
  let date = new Date(today)
  
  while (true) {
    date.setDate(date.getDate() - 1)
    const weekday = date.getDay()
    if (weekday >= 1 && weekday <= 5) {
      return date
    }
  }
}

const hasLatestNavDate = () => {
  const latestDate = getLatestNavDate()
  if (!latestDate) return false
  
  const previousWorkday = getPreviousWorkday()
  return isSameDay(latestDate, previousWorkday)
}

const onStatusTextTap = () => {
  if (holdings.value.length === 0) return
  
  autoHideTimer.value && clearTimeout(autoHideTimer.value)
  
  showStatusText.value = false
  
  setTimeout(() => {
    showRefreshButton.value = true
    dataStore.showRefreshButton = true
    
    autoHideTimer.value = setTimeout(() => {
      if (!isRefreshing.value) {
        showRefreshButton.value = false
        dataStore.showRefreshButton = false
        
        setTimeout(() => {
          showStatusText.value = true
        }, 500)
      }
    }, 5000)
  }, 500)
}

const handleRefresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  startUpdatingTextAnimation()
  dataStore.startRefresh()
  
  // 模拟刷新过程
  const total = holdings.value.length
  for (let i = 0; i < total; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
    dataStore.updateRefreshProgress(i + 1)
  }
  
  dataStore.completeRefresh()
  isRefreshing.value = false
  stopUpdatingTextAnimation()
  
  // 重置状态
  setTimeout(() => {
    showRefreshButton.value = false
    dataStore.showRefreshButton = false
    
    setTimeout(() => {
      showStatusText.value = true
    }, 500)
  }, 1000)
}

const startUpdatingTextAnimation = () => {
  updatingTextState.value = 0
  updatingTextTimer.value = setInterval(() => {
    updatingTextState.value = (updatingTextState.value + 1) % 4
  }, 500)
}

const stopUpdatingTextAnimation = () => {
  if (updatingTextTimer.value) {
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

// 生命周期
onMounted(() => {
  dataStore.init()
  setTimeout(() => {
    checkAndShowOutdatedToast()
  }, 1000)
})

onUnmounted(() => {
  searchTimeout.value && clearTimeout(searchTimeout.value)
  updatingTextTimer.value && clearInterval(updatingTextTimer.value)
  autoHideTimer.value && clearTimeout(autoHideTimer.value)
})
</script>

<style scoped>
.summary-view {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  background: white;
  padding: 80px 20px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.action-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.sort-btn.active {
  border-color: currentColor;
  background: rgba(var(--color-rgb), 0.1);
}

.sort-icon {
  font-size: 16px;
}

.sort-label {
  font-size: 12px;
  font-weight: 500;
}

.order-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  min-width: 100px;
  text-align: right;
  cursor: pointer;
}

.status-text {
  font-size: 14px;
  color: #666;
  padding: 6px 12px;
  border-radius: 6px;
  background: #f8f9fa;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  color: #999;
}

.search-input {
  width: 100%;
  padding: 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: #666;
}

.content-area {
  padding: 20px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
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
  color: #333;
}

.empty-state p {
  font-size: 14px;
  color: #999;
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
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e5e5e5;
  position: relative;
  overflow: hidden;
}

.fund-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.fund-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 2px 0 0 2px;
}

.fund-card.expanded {
  background: #f8f9fa;
}

.fund-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fund-info {
  flex: 1;
  min-width: 0;
}

.fund-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fund-code {
  font-size: 13px;
  color: #666;
  font-family: 'Monaco', 'Courier New', monospace;
}

.client-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-right: 20px;
}

.count-label {
  opacity: 0.7;
}

.count-value {
  font-weight: 600;
  font-style: italic;
}

.count-unit {
  opacity: 0.7;
}

.client-count-placeholder {
  width: 100px;
}

.expand-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #999;
  transition: transform 0.3s ease;
}

.fund-card.expanded .expand-icon {
  transform: rotate(180deg);
}

.expanded-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 500px; }
}

.fund-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.returns-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.return-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.return-label {
  font-size: 13px;
  color: #666;
  min-width: 50px;
}

.return-value {
  font-size: 14px;
  font-weight: 500;
}

.clients-section {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.clients-label {
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.clients-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1.4;
}

.client-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.client-name {
  color: #333;
}

.client-return {
  font-size: 12px;
}

.separator {
  color: #999;
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
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.progress-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.progress-details {
  font-size: 14px;
  color: #666;
}

.outdated-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 999;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.toast-content {
  text-align: center;
}

.toast-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.outdated-count {
  font-style: italic;
  font-weight: 700;
  color: #eab308;
}

.toast-list {
  max-height: 150px;
  overflow-y: auto;
}

.toast-item {
  font-size: 14px;
  color: #333;
  padding: 6px 0;
  border-bottom: 1px solid #e5e5e5;
  text-align: left;
}

.toast-item:last-child {
  border-bottom: none;
}

.toast-more {
  font-size: 14px;
  color: #666;
  padding-top: 8px;
  font-style: italic;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .back-button {
    top: 10px;
    left: 10px;
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .header-section {
    padding: 60px 16px 16px;
  }
  
  .header-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .status-indicator {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
  
  .sort-controls {
    flex: 1;
    justify-content: flex-end;
  }
  
  .content-area {
    padding: 16px;
  }
  
  .returns-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .clients-section {
    flex-direction: column;
    gap: 4px;
  }
  
  .clients-label {
    align-self: flex-start;
  }
}
</style>