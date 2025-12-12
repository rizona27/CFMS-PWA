<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

const refreshKey = ref(0)
const privacyKey = ref(0)
const themeKey = ref(0)

const isFilterExpanded = ref(false)
const fundCodeFilterInput = ref('')
const minAmountInput = ref('')
const maxAmountInput = ref('')
const minDaysInput = ref('')
const maxDaysInput = ref('')
const minProfitInput = ref('')
const maxProfitInput = ref('')

const appliedFundCodeFilter = ref('')
const appliedMinAmount = ref('')
const appliedMaxAmount = ref('')
const appliedMinDays = ref('')
const appliedMaxDays = ref('')
const appliedMinProfit = ref('')
const appliedMaxProfit = ref('')

const showingToast = ref(false)
const toastMessage = ref('')
const isLoading = ref(false)
const precomputedHoldings = ref<Array<{
  holding: any
  profit: { absolute: number; annualized: number }
  daysHeld: number
}>>([])

const isPrivacyMode = computed(() => dataStore.isPrivacyMode)
const showRefreshButton = computed(() => dataStore.showRefreshButton)

const selectedSortKey = ref<'none' | 'amount' | 'profit' | 'yield' | 'days'>('none')
const sortOrder = ref<'ascending' | 'descending'>('descending')

const sortKeyDisplay = computed(() => {
  const map = {
    none: '无排序',
    amount: '金额',
    profit: '收益',
    yield: '收益率',
    days: '天数'
  }
  return map[selectedSortKey.value]
})

const sortKeyColor = computed(() => {
  const map = {
    none: '#666666',
    amount: '#3b82f6',
    profit: '#8b5cf6',
    yield: '#f97316',
    days: '#ef4444'
  }
  return map[selectedSortKey.value]
})

const sortButtonText = computed(() => {
  return sortKeyDisplay.value
})

const holdings = computed(() => dataStore.holdings)

// 计算最新净值日期状态
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

const filteredAndSortedHoldings = computed(() => {
  let results = [...precomputedHoldings.value]
  
  if (appliedFundCodeFilter.value) {
    const filterLower = appliedFundCodeFilter.value.toLowerCase()
    results = results.filter(item =>
      item.holding.fundCode.toLowerCase().includes(filterLower) ||
      item.holding.fundName.toLowerCase().includes(filterLower)
    )
  }
  
  if (appliedMinAmount.value) {
    const minAmount = parseFloat(appliedMinAmount.value) * 10000
    results = results.filter(item => item.holding.purchaseAmount >= minAmount)
  }
  
  if (appliedMaxAmount.value) {
    const maxAmount = parseFloat(appliedMaxAmount.value) * 10000
    results = results.filter(item => item.holding.purchaseAmount <= maxAmount)
  }
  
  if (appliedMinDays.value) {
    const minDays = parseInt(appliedMinDays.value)
    results = results.filter(item => item.daysHeld >= minDays)
  }
  
  if (appliedMaxDays.value) {
    const maxDays = parseInt(appliedMaxDays.value)
    results = results.filter(item => item.daysHeld <= maxDays)
  }
  
  if (appliedMinProfit.value) {
    const minProfit = parseFloat(appliedMinProfit.value)
    results = results.filter(item => item.profit.annualized >= minProfit)
  }
  
  if (appliedMaxProfit.value) {
    const maxProfit = parseFloat(appliedMaxProfit.value)
    results = results.filter(item => item.profit.annualized <= maxProfit)
  }
  
  if (selectedSortKey.value !== 'none') {
    results.sort((a, b) => {
      let valueA = 0
      let valueB = 0
      
      switch (selectedSortKey.value) {
        case 'amount':
          valueA = a.holding.purchaseAmount
          valueB = b.holding.purchaseAmount
          break
        case 'profit':
          valueA = a.profit.absolute
          valueB = b.profit.absolute
          break
        case 'yield':
          valueA = a.profit.annualized
          valueB = b.profit.annualized
          break
        case 'days':
          valueA = a.daysHeld
          valueB = b.daysHeld
          break
      }
      
      return sortOrder.value === 'ascending' ? valueA - valueB : valueB - valueA
    })
  } else {
    results.sort((a, b) => a.holding.fundCode.localeCompare(b.holding.fundCode))
  }
  
  return results
})

const zeroProfitIndex = computed(() => {
  if (selectedSortKey.value !== 'yield' && selectedSortKey.value !== 'profit') {
    return null
  }
  
  const holdings = filteredAndSortedHoldings.value
  
  if (sortOrder.value === 'descending') {
    let lastPositiveIndex = -1
    for (let i = holdings.length - 1; i >= 0; i--) {
      if (holdings[i].profit.annualized >= 0) {
        lastPositiveIndex = i
        break
      }
    }
    return lastPositiveIndex < holdings.length - 1 ? lastPositiveIndex : null
  } else {
    let lastNegativeIndex = -1
    for (let i = holdings.length - 1; i >= 0; i--) {
      if (holdings[i].profit.annualized < 0) {
        lastNegativeIndex = i
        break
      }
    }
    return lastNegativeIndex
  }
})

// 只显示客户名，不显示客户号
const getClientNameOnly = (clientName: string): string => {
  return dataStore.getClientDisplayName(clientName, '')
}

// 截断基金名称，超过6个字符用".."代替
const truncateFundName = (name: string): string => {
  if (!name) return ''
  if (name.length <= 6) return name
  return name.substring(0, 6) + '..'
}

const refreshData = () => {
  isLoading.value = true
  const computedData: typeof precomputedHoldings.value = []
  
  for (const holding of holdings.value) {
    if (holding.currentNav > 0 && holding.purchaseAmount > 0) {
      const profit = dataStore.calculateProfit(holding)
      const daysHeld = daysBetween(new Date(holding.purchaseDate), new Date())
      computedData.push({
        holding,
        profit,
        daysHeld
      })
    }
  }
  
  computedData.sort((a, b) => a.holding.fundCode.localeCompare(b.holding.fundCode))
  precomputedHoldings.value = computedData
  isLoading.value = false
  dataStore.addLog('收益排行: 重新计算持仓收益数据', 'info')
  
  refreshKey.value = Date.now()
}

const applyFilters = () => {
  appliedFundCodeFilter.value = fundCodeFilterInput.value
  appliedMinAmount.value = minAmountInput.value
  appliedMaxAmount.value = maxAmountInput.value
  appliedMinDays.value = minDaysInput.value
  appliedMaxDays.value = maxDaysInput.value
  appliedMinProfit.value = minProfitInput.value
  appliedMaxProfit.value = maxProfitInput.value
  
  const filteredCount = filteredAndSortedHoldings.value.length
  toastMessage.value = `已筛选出 ${filteredCount} 条记录`
  showingToast.value = true
  
  const filterDetails = []
  if (appliedFundCodeFilter.value) filterDetails.push(`代码/名称: ${appliedFundCodeFilter.value}`)
  if (appliedMinAmount.value || appliedMaxAmount.value) filterDetails.push(`金额: ${appliedMinAmount.value || '不限'}-${appliedMaxAmount.value || '不限'}万`)
  if (appliedMinDays.value || appliedMaxDays.value) filterDetails.push(`天数: ${appliedMinDays.value || '不限'}-${appliedMaxDays.value || '不限'}`)
  if (appliedMinProfit.value || appliedMaxProfit.value) filterDetails.push(`收益率: ${appliedMinProfit.value || '不限'}-${appliedMaxProfit.value || '不限'}%`)
  
  dataStore.addLog(`收益排行: 应用筛选条件 [${filterDetails.join(', ')}]`, 'info')
  
  setTimeout(() => {
    showingToast.value = false
  }, 2000)
}

const resetFilters = () => {
  fundCodeFilterInput.value = ''
  minAmountInput.value = ''
  maxAmountInput.value = ''
  minDaysInput.value = ''
  maxDaysInput.value = ''
  minProfitInput.value = ''
  maxProfitInput.value = ''
  
  appliedFundCodeFilter.value = ''
  appliedMinAmount.value = ''
  appliedMaxAmount.value = ''
  appliedMinDays.value = ''
  appliedMaxDays.value = ''
  appliedMinProfit.value = ''
  appliedMaxProfit.value = ''
  
  toastMessage.value = '筛选条件已重置'
  showingToast.value = true
  
  dataStore.addLog('收益排行: 重置所有筛选条件', 'info')
  
  setTimeout(() => {
    showingToast.value = false
  }, 2000)
}

const toggleFilter = () => {
  isFilterExpanded.value = !isFilterExpanded.value
  dataStore.addLog(`收益排行: ${isFilterExpanded.value ? '显示' : '隐藏'}筛选面板`, 'info')
}

const cycleSortKey = () => {
  const keys = ['none', 'amount', 'profit', 'yield', 'days'] as const
  const currentIndex = keys.indexOf(selectedSortKey.value)
  selectedSortKey.value = keys[(currentIndex + 1) % keys.length]
  dataStore.addLog(`收益排行: 切换排序键为 ${sortKeyDisplay.value}`, 'info')
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ascending' ? 'descending' : 'ascending'
  dataStore.addLog(`收益排行: 切换排序顺序为 ${sortOrder.value === 'ascending' ? '升序' : '降序'}`, 'info')
}

const daysBetween = (start: Date, end: Date) => {
  const timeDiff = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

const formatAmountInTenThousands = (amount: number) => {
  const tenThousand = amount / 10000.0
  return tenThousand.toFixed(2)
}

const getValueColor = (value: number) => {
  if (value > 0) return '#ef4444'
  if (value < 0) return '#10b981'
  return '#666'
}

// 工具函数
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// 修复：通过正确的API更新隐私模式
const handlePrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`TopPerformersView: 隐私模式变化到 ${enabled}`)
  
  // ✅ 正确的更新方式
  dataStore.updateUserPreferences({ isPrivacyMode: enabled })
  
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
  
  dataStore.addLog(`隐私模式变化: ${enabled ? '开启' : '关闭'}`, 'info')
}

const handleGlobalPrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`TopPerformersView: 收到全局隐私模式变化事件: ${enabled}`)
  
  // ✅ 正确的更新方式
  dataStore.updateUserPreferences({ isPrivacyMode: enabled })
  
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
}

// 主题变化处理器
const handleThemeChange = (event: any) => {
  const { isDark } = event.detail
  console.log(`TopPerformersView: 主题变化到 ${isDark ? 'dark' : 'light'}`)
  themeKey.value = Date.now()
  refreshKey.value = Date.now()
}

const handleForcePrivacySync = () => {
  console.log('TopPerformersView: 收到强制隐私同步事件')
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
}

const handleForceThemeSync = () => {
  console.log('TopPerformersView: 收到强制主题同步事件')
  themeKey.value = Date.now()
  refreshKey.value = Date.now()
}

const onStatusTextTap = () => {
  if (holdings.value.length === 0) return
  dataStore.updateUserPreferences({ showRefreshButton: true })
  autoHideTimer.value = setTimeout(() => {
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
      autoHideTimer.value = null
    }
    dataStore.updateUserPreferences({ showRefreshButton: false })
  }, 5000) as unknown as number
}

watch(() => dataStore.isPrivacyMode, (newValue) => {
  console.log(`TopPerformersView: dataStore.isPrivacyMode变化到 ${newValue}`)
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
})

watch(holdings, () => {
  refreshData()
})

const autoHideTimer = ref<number | null>(null)

onMounted(() => {
  refreshData()
  dataStore.addLog('用户访问收益排行页面', 'info')
  
  const metaViewport = document.querySelector('meta[name="viewport"]')
  if (metaViewport) {
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  } else {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(meta)
  }
  
  // 监听隐私模式变化事件
  window.addEventListener('privacy-mode-changed', handlePrivacyModeChange)
  window.addEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
  
  // 监听主题变化事件（统一使用 theme-changed）
  window.addEventListener('theme-changed', handleThemeChange)
  
  // 监听强制同步事件
  window.addEventListener('force-privacy-sync', handleForcePrivacySync)
  window.addEventListener('force-theme-sync', handleForceThemeSync)
})

onUnmounted(() => {
  window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange)
  window.removeEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
  window.removeEventListener('theme-changed', handleThemeChange)
  window.removeEventListener('force-privacy-sync', handleForcePrivacySync)
  window.removeEventListener('force-theme-sync', handleForceThemeSync)
  
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
})
</script>

<template>
  <div class="top-performers-view" :key="`${refreshKey}-${themeKey}-${privacyKey}`">
    <!-- 固定头部区域 -->
    <div class="fixed-header">
      <div class="header-section" :class="{ 'with-filter': isFilterExpanded }">
        <div class="header-row">
          <div class="action-buttons">
            <button
              class="action-btn"
              :class="{ active: isFilterExpanded }"
              @click="toggleFilter"
              :title="isFilterExpanded ? '隐藏筛选' : '显示筛选'"
            >
              {{ isFilterExpanded ? '✕' : '⧉' }}
            </button>
            
            <div class="sort-group">
              <button
                class="sort-btn"
                @click="cycleSortKey"
                :title="selectedSortKey !== 'none' ? `按${sortKeyDisplay}排序` : '无排序'"
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
          </div>
          
          <div v-if="isFilterExpanded" class="filter-actions">
            <button class="filter-action-btn reset" @click="resetFilters">
              重置
            </button>
            <button class="filter-action-btn apply" @click="applyFilters">
              应用
            </button>
          </div>
        </div>
        
        <div v-if="isFilterExpanded" class="filter-section">
          <div class="filter-row">
            <div class="filter-field">
              <label class="filter-label">代码/名称</label>
              <input
                v-model="fundCodeFilterInput"
                type="text"
                placeholder="输入代码或名称"
                class="filter-input"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label">金额(万)</label>
              <div class="range-inputs">
                <input
                  v-model="minAmountInput"
                  type="number"
                  placeholder="最低"
                  class="filter-input range"
                />
                <span class="range-separator">-</span>
                <input
                  v-model="maxAmountInput"
                  type="number"
                  placeholder="最高"
                  class="filter-input range"
                />
              </div>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-field">
              <label class="filter-label">持有天数</label>
              <div class="range-inputs">
                <input
                  v-model="minDaysInput"
                  type="number"
                  placeholder="最低"
                  class="filter-input range"
                />
                <span class="range-separator">-</span>
                <input
                  v-model="maxDaysInput"
                  type="number"
                  placeholder="最高"
                  class="filter-input range"
                />
              </div>
            </div>
            <div class="filter-field">
              <label class="filter-label">收益率(%)</label>
              <div class="range-inputs">
                <input
                  v-model="minProfitInput"
                  type="number"
                  placeholder="最低"
                  class="filter-input range"
                />
                <span class="range-separator">-</span>
                <input
                  v-model="maxProfitInput"
                  type="number"
                  placeholder="最高"
                  class="filter-input range"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="content-wrapper">
      <div class="content-area">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="precomputedHoldings.length === 0" class="empty-state">
          <div class="empty-icon">🏆</div>
          <h3>当前没有数据</h3>
          <p>请导入数据开始使用</p>
        </div>
        
        <div v-else class="performers-table-container">
          <div class="table-header">
            <div class="header-cell number">#</div>
            <div class="header-cell code-name">代码/名称</div>
            <div class="header-cell amount">金额(万)</div>
            <div class="header-cell profit">收益(万)</div>
            <div class="header-cell days">天数</div>
            <div class="header-cell rate">收益率(%)</div>
            <div class="header-cell client">客户</div>
          </div>
          
          <div class="table-body">
            <div
              v-for="(item, index) in filteredAndSortedHoldings"
              :key="item.holding.id"
              class="table-row"
              :class="{ 'zero-profit-divider': zeroProfitIndex === index }"
            >
              <div class="row-cell number">{{ index + 1 }}.</div>
              <div class="row-cell code-name">
                <div class="fund-name">{{ truncateFundName(item.holding.fundName) }}</div>
                <div class="fund-code">{{ item.holding.fundCode }}</div>
              </div>
              <div class="row-cell amount">{{ formatAmountInTenThousands(item.holding.purchaseAmount) }}</div>
              <div class="row-cell profit" :style="{ color: getValueColor(item.profit.absolute) }">
                {{ formatAmountInTenThousands(item.profit.absolute) }}
              </div>
              <div class="row-cell days">{{ item.daysHeld }}</div>
              <div class="row-cell rate" :style="{ color: getValueColor(item.profit.annualized) }">
                {{ item.profit.annualized.toFixed(2) }}
              </div>
              <div class="row-cell client">
                {{ getClientNameOnly(item.holding.clientName) }}
              </div>
            </div>
          </div>
          
          <div v-if="filteredAndSortedHoldings.length === 0" class="no-results">
            没有符合筛选条件的记录
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showingToast" class="global-toast info">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.top-performers-view {
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

/* 固定头部 */
.fixed-header {
  flex-shrink: 0;
  background: var(--bg-primary);
  z-index: 100;
  position: relative;
  padding-top: env(safe-area-inset-top, 0px);
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

.header-section.with-filter {
  padding-bottom: 8px;
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
  flex: 1;
}

.sort-group {
  display: flex;
  gap: 4px;
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
  margin-left: auto;
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

.filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 8px;
}

.filter-action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-action-btn.reset {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.filter-action-btn.reset:hover {
  background: var(--border-color);
}

.filter-action-btn.apply {
  background: var(--accent-color);
  color: white;
}

.filter-action-btn.apply:hover {
  background: #2563eb;
}

.filter-section {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 0;
  animation: slideDown 0.2s ease;
  border: 1px solid var(--border-color);
}

:root.dark .filter-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-field {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 3px;
  font-weight: 500;
}

.filter-input {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s ease;
  background: var(--bg-card);
  color: var(--text-primary);
}

.filter-input:focus {
  border-color: var(--accent-color);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 3px;
}

.filter-input.range {
  flex: 1;
  text-align: center;
  padding: 7px 4px;
}

.range-separator {
  color: var(--text-secondary);
  padding: 0 3px;
}

/* 可滚动内容区域 */
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

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--bg-hover);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 10px;
  margin: 16px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:root.dark .empty-state {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.empty-icon {
  font-size: 42px;
  margin-bottom: 14px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 13px;
  color: var(--text-secondary);
}

.performers-table-container {
  background: var(--bg-card);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

:root.dark .performers-table-container {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.table-header {
  display: grid;
  grid-template-columns: 0.5fr 1.4fr 0.8fr 1.1fr 0.6fr 1.1fr 1fr;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 5;
}

.header-cell {
  padding: 10px 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-cell.number {
  text-align: center;
}

.header-cell.code-name {
  text-align: left;
  justify-content: flex-start;
}

.header-cell.client {
  text-align: left;
  justify-content: flex-start;
}

.table-body {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 0.5fr 1.4fr 0.8fr 1.1fr 0.6fr 1.1fr 1fr;
  border-bottom: 1px solid var(--bg-hover);
  transition: background 0.2s ease;
  align-items: center;
  min-height: 40px;
}

.table-row:hover {
  background: var(--bg-hover);
}

.table-row.zero-profit-divider {
  border-bottom: 2px solid var(--text-secondary);
}

.row-cell {
  padding: 8px 4px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.row-cell.number {
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  font-size: 12px;
}

.row-cell.code-name {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  padding-left: 4px;
  overflow: hidden;
}

.fund-name {
  font-size: 11px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
  font-weight: 500;
}

.fund-code {
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 10px;
  opacity: 0.8;
}

.row-cell.amount {
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  font-size: 12px;
}

.row-cell.profit {
  font-weight: 600;
  text-align: center;
  font-size: 12px;
}

.row-cell.days {
  color: var(--text-secondary);
  text-align: center;
  font-size: 12px;
}

.row-cell.rate {
  font-weight: 600;
  text-align: center;
  font-size: 12px;
}

.row-cell.client {
  text-align: left;
  justify-content: flex-start;
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-primary);
  padding-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.no-results {
  text-align: center;
  padding: 36px 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-section {
    padding: 6px 12px 6px;
  }
  
  .content-area {
    padding: 6px 12px 12px;
    padding-bottom: 120px;
  }
  
  .action-btn {
    height: 32px;
    min-width: 32px;
    font-size: 13px;
  }
  
  .sort-btn {
    height: 32px;
    padding: 0 10px;
    font-size: 12px;
    min-width: 55px;
  }
  
  .sort-order-btn {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .sort-text {
    font-size: 12px;
  }
  
  .status-pill {
    height: 30px;
    padding: 5px 10px;
    font-size: 12px;
    min-width: 55px;
  }
  
  .filter-action-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .filter-section {
    padding: 8px;
    margin-top: 0;
  }
  
  .filter-row {
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }
  
  .filter-field {
    flex: 0 0 calc(50% - 3px);
    min-width: 0;
  }
  
  .filter-label {
    font-size: 10px;
    margin-bottom: 2px;
  }
  
  .filter-input {
    font-size: 11px;
    padding: 6px 8px;
  }
  
  .filter-input.range {
    padding: 6px 3px;
  }
  
  .table-header {
    grid-template-columns: 0.5fr 1.3fr 0.7fr 1fr 0.5fr 1fr 0.8fr;
    font-size: 10px;
  }
  
  .table-row {
    grid-template-columns: 0.5fr 1.3fr 0.7fr 1fr 0.5fr 1fr 0.8fr;
  }
  
  .row-cell {
    font-size: 10px;
    padding: 6px 3px;
    min-height: 34px;
  }
  
  .fund-name {
    font-size: 10px;
  }
  
  .fund-code {
    font-size: 9px;
  }
  
  .row-cell.client {
    font-size: 10px;
    padding-left: 3px;
  }
  
  .header-cell {
    padding: 8px 3px;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 6px 10px 6px;
  }
  
  .content-area {
    padding: 6px 8px 10px;
  }
  
  .action-buttons {
    gap: 4px;
  }
  
  .sort-group {
    gap: 2px;
  }
  
  .filter-section {
    padding: 6px;
  }
  
  .filter-row {
    gap: 4px;
    margin-bottom: 4px;
  }
  
  .filter-field {
    flex: 0 0 calc(50% - 2px);
  }
  
  .filter-label {
    font-size: 9px;
  }
  
  .filter-input {
    font-size: 10px;
    padding: 5px 6px;
  }
  
  .filter-input.range {
    padding: 5px 2px;
  }
  
  .performers-table-container {
    border-radius: 8px;
  }
  
  .table-header {
    font-size: 9px;
    grid-template-columns: 0.5fr 1.2fr 0.6fr 0.9fr 0.4fr 0.9fr 0.7fr;
  }
  
  .table-row {
    grid-template-columns: 0.5fr 1.2fr 0.6fr 0.9fr 0.4fr 0.9fr 0.7fr;
  }
  
  .row-cell {
    font-size: 9px;
    padding: 6px 2px;
    min-height: 32px;
  }
  
  .fund-name {
    font-size: 9px;
  }
  
  .fund-code {
    font-size: 8px;
  }
  
  .row-cell.client {
    font-size: 9px;
    padding-left: 2px;
  }
  
  .header-cell {
    padding: 8px 2px;
  }
}

.performers-table-container {
  margin-top: 4px;
}

.empty-state {
  margin: 12px;
}

@media (hover: none) and (pointer: coarse) {
  .table-row:active {
    background: var(--bg-hover);
  }
}

.global-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-size: 14px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media screen and (max-width: 768px) {
  .top-performers-view {
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

:root.dark .fund-name {
  color: var(--text-primary);
}

:root.dark .fund-code {
  color: var(--text-secondary);
}

:root {
  --bg-primary-rgb: 248, 250, 252;
}

:root.dark {
  --bg-primary-rgb: 15, 23, 42;
}
</style>
