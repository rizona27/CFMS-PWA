<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// 重新渲染键
const refreshKey = ref(0)
const privacyKey = ref(0)
const themeKey = ref(0)

// 状态
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
    none: '#666',
    amount: '#3b82f6',
    profit: '#8b5cf6',
    yield: '#f97316',
    days: '#ef4444'
  }
  return map[selectedSortKey.value]
})

const sortButtonIcon = computed(() => {
  const map = {
    none: '⇅',
    amount: '💰',
    profit: '📈',
    yield: '📊',
    days: '📅'
  }
  return map[selectedSortKey.value]
})

// 计算属性
const holdings = computed(() => dataStore.holdings)

const filteredAndSortedHoldings = computed(() => {
  let results = [...precomputedHoldings.value]
  
  // 应用筛选
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
  
  // 应用排序
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
    // 默认按基金代码排序
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
    // 手动实现 findLastIndex 功能
    let lastPositiveIndex = -1
    for (let i = holdings.length - 1; i >= 0; i--) {
      if (holdings[i].profit.annualized >= 0) {
        lastPositiveIndex = i
        break
      }
    }
    return lastPositiveIndex < holdings.length - 1 ? lastPositiveIndex : null
  } else {
    // 手动实现 findLastIndex 功能
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

// 方法
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
  
  // 强制重新渲染
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
  
  // 记录筛选操作
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

// 修复：负数显示绿色，正数显示红色，零显示灰色
const getValueColor = (value: number) => {
  if (value > 0) return '#ef4444'  // 正数：红色
  if (value < 0) return '#10b981'  // 负数：绿色
  return '#666'                    // 零：灰色
}

const processClientName = (name: string) => {
  if (!dataStore.isPrivacyMode) return name
  if (name.length <= 1) return name
  if (name.length === 2) return name.charAt(0) + '*'
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
}

// 隐私模式变化处理器
const handlePrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`TopPerformersView: 隐私模式变化到 ${enabled}`)
  
  // 直接更新dataStore
  dataStore.isPrivacyMode = enabled
  
  // 强制重新渲染
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
  
  dataStore.addLog(`隐私模式变化: ${enabled ? '开启' : '关闭'}`, 'info')
}

// 全局隐私模式变化处理器
const handleGlobalPrivacyModeChange = (event: any) => {
  const { enabled } = event.detail
  console.log(`TopPerformersView: 收到全局隐私模式变化事件: ${enabled}`)
  
  // 直接更新dataStore
  dataStore.isPrivacyMode = enabled
  
  // 强制重新渲染
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
}

// 主题变化处理器
const handleThemeChange = (event: any) => {
  const { theme } = event.detail
  console.log(`TopPerformersView: 主题变化到 ${theme}`)
  applyThemeToDocument(theme)
  themeKey.value = Date.now()
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
  console.log('TopPerformersView: 收到强制隐私同步事件')
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
}

const handleForceThemeSync = () => {
  console.log('TopPerformersView: 收到强制主题同步事件')
  const savedTheme = localStorage.getItem('themeMode') || 'system'
  applyThemeToDocument(savedTheme)
  themeKey.value = Date.now()
  refreshKey.value = Date.now()
}

// 监听隐私模式变化
watch(() => dataStore.isPrivacyMode, (newValue) => {
  console.log(`TopPerformersView: dataStore.isPrivacyMode变化到 ${newValue}`)
  privacyKey.value = Date.now()
  refreshKey.value = Date.now()
  themeKey.value = Date.now()
})

// 监听持仓数据变化
watch(holdings, () => {
  refreshData()
})

// 生命周期
onMounted(() => {
  refreshData()
  dataStore.addLog('用户访问收益排行页面', 'info')
  
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
  
  // 监听隐私模式变化
  window.addEventListener('privacy-mode-changed', handlePrivacyModeChange)
  window.addEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
  
  // 监听主题变化
  window.addEventListener('theme-changed', handleThemeChange)
  window.addEventListener('theme-changed-global', handleThemeChange)
  
  // 监听强制同步事件
  window.addEventListener('force-privacy-sync', handleForcePrivacySync)
  window.addEventListener('force-theme-sync', handleForceThemeSync)
  
  // 初始化主题
  const savedTheme = localStorage.getItem('themeMode') || 'system'
  applyThemeToDocument(savedTheme)
})

onUnmounted(() => {
  // 移除监听器
  window.removeEventListener('privacy-mode-changed', handlePrivacyModeChange)
  window.removeEventListener('privacy-mode-changed-global', handleGlobalPrivacyModeChange)
  window.removeEventListener('theme-changed', handleThemeChange)
  window.removeEventListener('theme-changed-global', handleThemeChange)
  window.removeEventListener('force-privacy-sync', handleForcePrivacySync)
  window.removeEventListener('force-theme-sync', handleForceThemeSync)
})
</script>

<template>
  <div class="top-performers-view" :key="`${refreshKey}-${themeKey}-${privacyKey}`">
    <!-- 标题和状态栏 -->
    <div class="header-section">
      <div class="header-row">
        <div class="action-buttons">
          <button
            class="action-btn"
            :class="{ active: isFilterExpanded }"
            @click="toggleFilter"
            :title="isFilterExpanded ? '隐藏筛选' : '显示筛选'"
          >
            {{ isFilterExpanded ? '✕' : '🔍' }}
          </button>
        </div>
        
        <div class="sort-controls" :class="{ 'with-filter': isFilterExpanded }">
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
        
        <div v-if="isFilterExpanded" class="filter-actions">
          <button class="filter-action-btn reset" @click="resetFilters">
            重置
          </button>
          <button class="filter-action-btn apply" @click="applyFilters">
            应用
          </button>
        </div>
      </div>
      
      <!-- 筛选区域 -->
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
    
    <!-- 主要内容 -->
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
      
      <div v-else class="performers-table">
        <!-- 表头 -->
        <div class="table-header">
          <div class="header-cell number">#</div>
          <div class="header-cell code-name">代码/名称</div>
          <div class="header-cell amount">金额(万)</div>
          <div class="header-cell profit">收益(万)</div>
          <div class="header-cell days">天数</div>
          <div class="header-cell rate">收益率(%)</div>
          <div class="header-cell client">客户</div>
        </div>
        
        <!-- 表格内容 -->
        <div class="table-body">
          <div
            v-for="(item, index) in filteredAndSortedHoldings"
            :key="item.holding.id"
            class="table-row"
            :class="{ 'zero-profit-divider': zeroProfitIndex === index }"
          >
            <div class="row-cell number">{{ index + 1 }}.</div>
            <div class="row-cell code-name">
              <div class="fund-code">{{ item.holding.fundCode }}</div>
              <div class="fund-name">{{ item.holding.fundName }}</div>
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
              {{ processClientName(item.holding.clientName) }}
            </div>
          </div>
        </div>
        
        <div v-if="filteredAndSortedHoldings.length === 0" class="no-results">
          没有符合筛选条件的记录
        </div>
      </div>
    </div>
    
    <!-- Toast消息 -->
    <div v-if="showingToast" class="toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.top-performers-view {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background-color 0.3s ease;
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

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.sort-controls.with-filter {
  flex: 0;
}

.sort-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: var(--text-primary);
}

.sort-btn:hover {
  border-color: var(--accent-color);
  background: var(--bg-hover);
}

.sort-btn.active {
  border-color: currentColor;
  background: rgba(var(--accent-color-rgb), 0.1);
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
  background: var(--accent-color);
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.filter-action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-field {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.filter-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
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
  gap: 4px;
}

.filter-input.range {
  flex: 1;
  text-align: center;
}

.range-separator {
  color: var(--text-secondary);
  padding: 0 4px;
}

.content-area {
  padding: 16px;
  min-height: calc(100vh - 150px);
  overflow-y: auto;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
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

.performers-table {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.table-header {
  display: grid;
  grid-template-columns: 0.5fr 1.5fr 0.8fr 0.8fr 0.6fr 0.8fr 1fr;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.header-cell {
  padding: 12px 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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
  grid-template-columns: 0.5fr 1.5fr 0.8fr 0.8fr 0.6fr 0.8fr 1fr;
  border-bottom: 1px solid var(--bg-hover);
  transition: background 0.2s ease;
}

.table-row:hover {
  background: var(--bg-hover);
}

.table-row.zero-profit-divider {
  border-bottom: 2px solid var(--text-secondary);
}

.row-cell {
  padding: 12px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.row-cell.number {
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.row-cell.code-name {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
}

.fund-code {
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.fund-name {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.row-cell.amount {
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.row-cell.profit {
  font-weight: 600;
  text-align: center;
}

.row-cell.days {
  color: var(--text-secondary);
  text-align: center;
}

.row-cell.rate {
  font-weight: 600;
  text-align: center;
}

.row-cell.client {
  text-align: left;
  justify-content: flex-start;
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-primary);
  padding-left: 4px;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-primary);
  color: var(--bg-card);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
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
  
  .table-header {
    grid-template-columns: 0.5fr 1.2fr 0.7fr 0.7fr 0.5fr 0.7fr 0.8fr;
    font-size: 11px;
  }
  
  .table-row {
    grid-template-columns: 0.5fr 1.2fr 0.7fr 0.7fr 0.5fr 0.7fr 0.8fr;
  }
  
  .row-cell {
    font-size: 11px;
    padding: 10px 6px;
  }
  
  .fund-name {
    font-size: 10px;
  }
}
</style>
