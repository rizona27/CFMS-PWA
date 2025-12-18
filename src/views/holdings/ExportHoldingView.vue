<template>
  <div class="export-holding-view">
    <!-- 使用统一的 NavBar 组件 -->
    <NavBar title="导出持仓数据" backText="返回" backRoute="/holdings/manage" />
    
    <!-- 固定顶部部分 - 类似 ImportHoldingView 样式 -->
    <div class="fixed-top-section">
      <div class="top-container">
        <!-- 固定分隔符 - 与 ImportHoldingView 一致，无底色 -->
        <div class="stylish-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            </svg>
          </div>
          <div class="divider-line"></div>
        </div>
      </div>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content-section">
      <div class="content-scroll">
        <div class="content-wrapper">
          <div class="export-content">
            
            <!-- 导出设置区域 -->
            <div class="settings-section">
              <div class="section-card">
                <!-- 导出格式选择 -->
                <div class="format-selection">
                  <h3 class="section-subtitle">选择导出格式</h3>
                  <div class="format-options">
                    <div
                      v-for="format in exportFormats"
                      :key="format.id"
                      class="format-option"
                      :class="{ active: selectedFormat.id === format.id }"
                      @click="selectFormat(format)"
                    >
                      <div class="format-icon">{{ format.icon }}</div>
                      <div class="format-info">
                        <h4>{{ format.name }}</h4>
                        <p>{{ format.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 导出范围 -->
                <div class="export-scope">
                  <h3 class="section-subtitle">导出范围</h3>
                  <div class="scope-options">
                    <label class="scope-option">
                      <input
                        type="radio"
                        v-model="exportScope"
                        value="all"
                      />
                      <span class="radio-label">全部持仓 ({{ dataStore.holdings.length }} 条记录)</span>
                    </label>
                    <label class="scope-option">
                      <input
                        type="radio"
                        v-model="exportScope"
                        value="filtered"
                      />
                      <span class="radio-label">筛选结果 ({{ estimatedRecords }} 条记录)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 筛选条件（当选择筛选结果时显示） -->
            <div v-if="exportScope === 'filtered'" class="filters-section">
              <div class="section-card">
                <h3 class="section-subtitle">筛选条件</h3>
                
                <div class="filters-grid">
                  <div class="filter-row">
                    <div class="filter-group compact">
                      <label>客户姓名</label>
                      <input
                        type="text"
                        v-model="filters.clientName"
                        placeholder="输入客户姓名..."
                        class="filter-input"
                      />
                    </div>
                    
                    <div class="filter-group compact">
                      <label>客户号</label>
                      <input
                        type="text"
                        v-model="filters.clientId"
                        placeholder="输入客户号..."
                        class="filter-input"
                      />
                    </div>
                  </div>
                  
                  <div class="filter-row">
                    <div class="filter-group compact">
                      <label>基金代码</label>
                      <input
                        type="text"
                        v-model="filters.fundCode"
                        placeholder="输入基金代码..."
                        class="filter-input"
                      />
                    </div>
                    
                    <div class="filter-group compact">
                      <label>基金名称</label>
                      <input
                        type="text"
                        v-model="filters.fundName"
                        placeholder="输入基金名称..."
                        class="filter-input"
                      />
                    </div>
                  </div>
                  
                  <!-- 日期范围 - 保持两行布局 -->
                  <div class="filter-group full-width">
                    <label class="filter-label">购买日期范围</label>
                    <div class="date-range">
                      <input
                        type="date"
                        v-model="filters.startDate"
                        class="date-input"
                      />
                      <span class="date-separator">至</span>
                      <input
                        type="date"
                        v-model="filters.endDate"
                        class="date-input"
                      />
                    </div>
                  </div>
                  
                  <!-- 金额范围 - 保持两行布局 -->
                  <div class="filter-group full-width">
                    <label class="filter-label">购买金额范围 (元)</label>
                    <div class="amount-range">
                      <input
                        type="number"
                        v-model="filters.minAmount"
                        placeholder="最小金额"
                        class="amount-input"
                        min="0"
                        step="0.01"
                      />
                      <span class="amount-separator">-</span>
                      <input
                        type="number"
                        v-model="filters.maxAmount"
                        placeholder="最大金额"
                        class="amount-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 导出选项 -->
            <div class="options-section">
              <div class="section-card">
                <h3 class="section-subtitle">导出内容</h3>
                
                <div class="options-grid">
                  <div class="option-item">
                    <label class="option-label">
                      <input
                        type="checkbox"
                        v-model="options.includeCalculations"
                        checked
                      />
                      <span>包含计算字段（当前市值、收益率等）</span>
                    </label>
                  </div>
                  
                  <div class="option-item">
                    <label class="option-label">
                      <input
                        type="checkbox"
                        v-model="options.includeFundInfo"
                        checked
                      />
                      <span>包含基金基本信息</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 字段选择 -->
            <div class="fields-section">
              <div class="section-card">
                <h3 class="section-subtitle">选择导出字段</h3>
                
                <div class="fields-grid">
                  <div
                    v-for="field in exportFields"
                    :key="field.id"
                    class="field-item"
                    :class="{ required: field.required }"
                  >
                    <label class="field-label">
                      <input
                        type="checkbox"
                        :value="field.id"
                        v-model="selectedFields"
                        :disabled="field.required"
                      />
                      <span class="field-name">{{ field.name }}</span>
                      <span class="field-type">{{ field.type }}</span>
                    </label>
                    <p class="field-description">{{ field.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 导出按钮 -->
            <div class="export-button-section">
              <button
                class="export-button"
                :class="{ exporting: isExporting }"
                @click="startExport"
                :disabled="isExporting || estimatedRecords === 0"
              >
                <span v-if="!isExporting">开始导出 ({{ estimatedRecords }} 条记录)</span>
                <span v-else>导出中... {{ exportProgress }}%</span>
              </button>
              
              <!-- 进度条 -->
              <div v-if="isExporting" class="progress-container">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: exportProgress + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- 导出历史 -->
            <div v-if="exportHistory.length > 0" class="history-section">
              <div class="section-card">
                <h3 class="section-subtitle">导出历史</h3>
                
                <div class="history-list">
                  <div
                    v-for="item in exportHistory"
                    :key="item.id"
                    class="history-item"
                  >
                    <div class="history-info">
                      <div class="history-filename">{{ item.filename }}</div>
                      <div class="history-details">
                        <span class="history-date">{{ item.date }}</span>
                        <span class="history-format">{{ item.format.toUpperCase() }}</span>
                        <span class="history-size">{{ item.filesize }}</span>
                        <span class="history-records">{{ item.records }} 条记录</span>
                      </div>
                    </div>
                    
                    <div class="history-actions">
                      <button
                        class="action-button download"
                        @click="downloadAgain(item)"
                      >
                        下载
                      </button>
                      <button
                        class="action-button delete"
                        @click="deleteHistory(item)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer-section">
              <div class="footer-text">
                <span class="gradient-text">Export with precision, manage with confidence.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Toast消息 -->
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'
import { useDataStore } from '@/stores/dataStore'
import type { Holding, FundHolding } from '@/types/data'
import { convertFundHoldingToHolding } from '@/types/data'

const router = useRouter()
const dataStore = useDataStore()

const exportFormats = [
  { id: 'csv', name: 'CSV', icon: '📝', description: '标准CSV格式，兼容Excel' },
  { id: 'excel', name: 'Excel', icon: '📊', description: 'Excel格式，包含多个工作表' }
]

const selectedFormat = ref(exportFormats[0])
const exportScope = ref('all')
const isExporting = ref(false)
const exportProgress = ref(0)

const filters = ref({
  clientName: '',
  clientId: '',
  fundCode: '',
  fundName: '',
  startDate: '',
  endDate: '',
  minAmount: null as number | null,
  maxAmount: null as number | null
})

const options = ref({
  includeCalculations: true,
  includeFundInfo: true
})

// 导出字段定义
const exportFields = ref([
  { id: 'client_name', name: '客户姓名', type: '文本', description: '客户姓名', required: true },
  { id: 'client_id', name: '客户号', type: '文本', description: '客户号', required: false },
  { id: 'fund_code', name: '基金代码', type: '文本', description: '6位基金代码', required: true },
  { id: 'fund_name', name: '基金名称', type: '文本', description: '基金全称', required: false },
  { id: 'purchase_date', name: '购买日期', type: '日期', description: 'YYYY-MM-DD格式', required: true },
  { id: 'purchase_amount', name: '购买金额', type: '金额', description: '购买总金额（元）', required: true },
  { id: 'purchase_shares', name: '购买份额', type: '份额', description: '持有份额（份）', required: true },
  { id: 'current_nav', name: '当前净值', type: '净值', description: '最新单位净值', required: false },
  { id: 'nav_date', name: '净值日期', type: '日期', description: '净值发布日期', required: false },
  { id: 'remarks', name: '备注', type: '文本', description: '附加说明', required: false }
])

const selectedFields = ref<string[]>(['client_name', 'client_id', 'fund_code', 'fund_name', 'purchase_date', 'purchase_amount', 'purchase_shares', 'current_nav', 'nav_date', 'remarks'])

// 使用dataStore中的导出历史
const exportHistory = ref(dataStore.userPreferences.exportHistory)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 从dataStore获取持仓数据并转换为Holding格式
const getHoldingsFromDataStore = (): Holding[] => {
  return dataStore.holdings.map(fundHolding => {
    // 准备转换参数
    const fundHoldingData: any = {
      ...fundHolding,
      purchaseDate: fundHolding.purchaseDate instanceof Date
        ? fundHolding.purchaseDate.toISOString().split('T')[0]
        : fundHolding.purchaseDate,
      navDate: fundHolding.navDate instanceof Date
        ? fundHolding.navDate.toISOString().split('T')[0]
        : fundHolding.navDate
    }
    
    // 处理 pinnedTimestamp，如果是Date则转换为字符串
    if (fundHolding.pinnedTimestamp instanceof Date) {
      fundHoldingData.pinnedTimestamp = fundHolding.pinnedTimestamp.toISOString()
    } else if (fundHolding.pinnedTimestamp !== undefined) {
      fundHoldingData.pinnedTimestamp = fundHolding.pinnedTimestamp
    }
    
    const converted = convertFundHoldingToHolding(fundHoldingData)
    return converted
  })
}

// 计算属性
const estimatedRecords = computed(() => {
  const holdings = getHoldingsFromDataStore()
  
  if (exportScope.value === 'all') {
    return holdings.length
  }
  
  let filtered = [...holdings]
  
  if (filters.value.clientName) {
    filtered = filtered.filter(h =>
      h.client_name.toLowerCase().includes(filters.value.clientName.toLowerCase())
    )
  }
  
  if (filters.value.clientId) {
    filtered = filtered.filter(h =>
      h.client_id.toLowerCase().includes(filters.value.clientId.toLowerCase())
    )
  }
  
  if (filters.value.fundCode) {
    filtered = filtered.filter(h =>
      h.fund_code.includes(filters.value.fundCode)
    )
  }
  
  if (filters.value.fundName) {
    filtered = filtered.filter(h =>
      h.fund_name && h.fund_name.toLowerCase().includes(filters.value.fundName.toLowerCase())
    )
  }
  
  if (filters.value.startDate) {
    filtered = filtered.filter(h => h.purchase_date >= filters.value.startDate)
  }
  
  if (filters.value.endDate) {
    filtered = filtered.filter(h => h.purchase_date <= filters.value.endDate)
  }
  
  if (filters.value.minAmount !== null) {
    filtered = filtered.filter(h => h.purchase_amount >= filters.value.minAmount!)
  }
  
  if (filters.value.maxAmount !== null) {
    filtered = filtered.filter(h => h.purchase_amount <= filters.value.maxAmount!)
  }
  
  return filtered.length
})

const selectFormat = (format: any) => {
  selectedFormat.value = format
  
  // 根据格式调整默认字段选择
  if (format.id === 'csv') {
    selectedFields.value = ['client_name', 'client_id', 'fund_code', 'fund_name', 'purchase_date', 'purchase_amount', 'purchase_shares', 'current_nav', 'nav_date', 'remarks']
  }
}

// 格式化持仓数据为CSV
const formatHoldingsToCSV = (holdings: Holding[]): string => {
  const headers = selectedFields.value.map(fieldId => {
    const field = exportFields.value.find(f => f.id === fieldId)
    return field ? field.name : fieldId
  })
  
  const rows = holdings.map(holding => {
    return selectedFields.value.map(fieldId => {
      let value = holding[fieldId as keyof Holding]
      
      // 特殊处理
      if (fieldId === 'purchase_amount' || fieldId === 'current_nav') {
        return typeof value === 'number' ? value.toFixed(2) : value
      } else if (fieldId === 'purchase_shares') {
        return typeof value === 'number' ? value.toFixed(4) : value
      } else if (fieldId === 'is_pinned') {
        return value ? '是' : '否'
      }
      
      return value || ''
    }).join(',')
  })
  
  return ['\uFEFF' + headers.join(','), ...rows].join('\n')
}

// 格式化持仓数据为JSON
const formatHoldingsToJSON = (holdings: Holding[]): string => {
  const result = holdings.map(holding => {
    const obj: any = {}
    selectedFields.value.forEach(fieldId => {
      obj[fieldId] = holding[fieldId as keyof Holding]
    })
    return obj
  })
  
  return JSON.stringify(result, null, 2)
}

// 导出函数
const startExport = async () => {
  if (estimatedRecords.value === 0) {
    showNotification('没有符合条件的记录可导出', 'warning')
    return
  }
  
  isExporting.value = true
  exportProgress.value = 0
  
  try {
    // 模拟导出进度
    const interval = setInterval(() => {
      exportProgress.value += 10
      if (exportProgress.value >= 100) {
        clearInterval(interval)
        completeExport()
      }
    }, 100)
    
  } catch (error) {
    console.error('导出失败:', error)
    showNotification(`导出失败: ${error}`, 'error')
    isExporting.value = false
    exportProgress.value = 0
  }
}

const completeExport = () => {
  // 获取筛选后的数据
  let dataToExport = getHoldingsFromDataStore()
  
  if (exportScope.value === 'filtered') {
    dataToExport = applyFilters(dataToExport)
  }
  
  // 根据格式生成数据
  let exportData = ''
  let filename = ''
  let mimeType = ''
  
  const timestamp = new Date().toISOString().split('T')[0]
  const time = new Date().toTimeString().split(' ')[0].substring(0, 5).replace(':', '')
  
  switch (selectedFormat.value.id) {
    case 'csv':
      exportData = formatHoldingsToCSV(dataToExport)
      filename = `持仓数据_${timestamp}_${time}.csv`
      mimeType = 'text/csv;charset=utf-8;'
      break
    case 'excel':
      // 实际项目中这里应该生成Excel文件
      exportData = formatHoldingsToCSV(dataToExport)
      filename = `持仓数据_${timestamp}_${time}.xlsx`
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
  }
  
  // 添加导出历史到dataStore
  const newHistoryItem = {
    id: Date.now(),
    filename,
    filesize: formatFileSize(new Blob([exportData]).size),
    date: `${timestamp} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`,
    format: selectedFormat.value.id,
    records: dataToExport.length,
    data: exportData
  }
  
  dataStore.addExportHistory(newHistoryItem)
  exportHistory.value = dataStore.userPreferences.exportHistory
  
  // 触发下载
  downloadFile(exportData, filename, mimeType)
  
  // 显示通知
  showNotification(`导出成功！共导出 ${dataToExport.length} 条记录`, 'success')
  
  // 重置状态
  isExporting.value = false
  exportProgress.value = 0
}

// 应用筛选条件
const applyFilters = (holdings: Holding[]): Holding[] => {
  let filtered = [...holdings]
  
  if (filters.value.clientName) {
    filtered = filtered.filter(h =>
      h.client_name.toLowerCase().includes(filters.value.clientName.toLowerCase())
    )
  }
  
  if (filters.value.clientId) {
    filtered = filtered.filter(h =>
      h.client_id.toLowerCase().includes(filters.value.clientId.toLowerCase())
    )
  }
  
  if (filters.value.fundCode) {
    filtered = filtered.filter(h =>
      h.fund_code.includes(filters.value.fundCode)
    )
  }
  
  if (filters.value.fundName) {
    filtered = filtered.filter(h =>
      h.fund_name && h.fund_name.toLowerCase().includes(filters.value.fundName.toLowerCase())
    )
  }
  
  if (filters.value.startDate) {
    filtered = filtered.filter(h => h.purchase_date >= filters.value.startDate)
  }
  
  if (filters.value.endDate) {
    filtered = filtered.filter(h => h.purchase_date <= filters.value.endDate)
  }
  
  if (filters.value.minAmount !== null) {
    filtered = filtered.filter(h => h.purchase_amount >= filters.value.minAmount!)
  }
  
  if (filters.value.maxAmount !== null) {
    filtered = filtered.filter(h => h.purchase_amount <= filters.value.maxAmount!)
  }
  
  return filtered
}

// 下载文件
const downloadFile = (data: string, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const downloadAgain = (item: any) => {
  if (item.data) {
    let mimeType = 'text/csv;charset=utf-8;'
    if (item.format === 'json') mimeType = 'application/json'
    if (item.format === 'excel') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    
    downloadFile(item.data, item.filename, mimeType)
    showNotification(`重新下载: ${item.filename}`, 'info')
  }
}

const deleteHistory = (item: any) => {
  dataStore.deleteExportHistory(item.id)
  exportHistory.value = dataStore.userPreferences.exportHistory
  showNotification('导出记录已删除', 'info')
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// 初始化
onMounted(() => {
  const today = new Date()
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  filters.value.startDate = lastMonth.toISOString().split('T')[0]
  filters.value.endDate = today.toISOString().split('T')[0]
})
</script>

<style scoped>
/* ------------------------------------- */
/* 页面整体布局 - 参考 ImportHoldingView 的布局 */
/* ------------------------------------- */
.export-holding-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:root.dark .export-holding-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 固定顶部部分 - 类似 ImportHoldingView 样式 */
.fixed-top-section {
  flex-shrink: 0;
  z-index: 90; /* 低于 NavBar */
  padding-top: 0;
  background: transparent; /* 无底色 */
}

.top-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 分隔符样式 - 与 ImportHoldingView 一致 */
.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 12px;
  opacity: 0.6;
}

.divider-line {
  height: 1px;
  width: 40px;
  background: linear-gradient(90deg, transparent, currentColor);
}

.divider-line:last-child {
  background: linear-gradient(90deg, currentColor, transparent);
}

.divider-icon {
  color: currentColor;
  display: flex;
  align-items: center;
}

:root.dark .stylish-divider {
  color: rgba(255, 255, 255, 0.3);
}

.stylish-divider {
  color: rgba(0, 0, 0, 0.2);
}

/* 可滚动的内容区域 */
.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: transparent;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px 100px;
}

/* 导出内容区域 */
.export-content {
  padding: 16px 0 120px;
}

/* 卡片样式 */
.section-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

:root.dark .section-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-subtitle {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

/* 格式选择样式 */
.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.format-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-card);
}

.format-option:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.format-option.active {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.1);
}

.format-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.format-info h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.format-info p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 导出范围样式 */
.scope-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scope-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
}

.scope-option input {
  margin-right: 0.5rem;
}

.radio-label {
  color: var(--text-secondary);
}

/* 筛选条件样式 */
.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group.compact {
  flex-direction: row;
  align-items: center;
}

.filter-group.compact label {
  min-width: 70px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.filter-group.full-width {
  grid-column: 1 / -1;
}

.filter-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.filter-input {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
  background: var(--bg-card);
  color: var(--text-primary);
}

.filter-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.date-range,
.amount-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input,
.amount-input {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--bg-card);
  color: var(--text-primary);
}

.date-separator,
.amount-separator {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 导出选项样式 */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
}

.option-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
  color: var(--text-primary);
  font-size: 0.95rem;
}

/* 字段选择样式 */
.fields-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.field-item {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  background: var(--bg-card);
}

.field-item:hover {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
}

.field-item.required {
  background: rgba(245, 158, 11, 0.05);
  border-color: #f59e0b;
}

.field-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.field-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.field-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  align-self: flex-start;
}

.field-description {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 导出按钮样式 */
.export-button-section {
  margin-top: 2rem;
  text-align: center;
}

.export-button {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}

.export-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-button.exporting {
  background: var(--text-secondary);
}

.progress-container {
  margin-top: 1rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.progress-bar {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

/* 导出历史样式 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  background: var(--bg-card);
}

.history-item:hover {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
}

.history-info {
  flex: 1;
}

.history-filename {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.history-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.download {
  background: var(--success-color);
  color: white;
}

.action-button.download:hover {
  background: #059669;
}

.action-button.delete {
  background: var(--error-color);
  color: white;
}

.action-button.delete:hover {
  background: #dc2626;
}

.footer-section {
  margin-top: 30px;
  text-align: center;
  padding: 0 16px;
}

.footer-text {
  padding: 16px 0;
}

.gradient-text {
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .top-container {
    padding: 0 12px;
  }
  
  .content-wrapper {
    padding: 0 12px 80px;
  }
  
  .section-card {
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 16px;
  }
  
  .export-content {
    padding: 12px 0 100px;
  }
  
  .section-subtitle {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .format-options {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .format-option {
    padding: 0.75rem;
  }
  
  .format-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }
  
  .format-info h4 {
    font-size: 1rem;
  }
  
  .format-info p {
    font-size: 0.75rem;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .filter-group.compact {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group.compact label {
    min-width: auto;
    margin-bottom: 0.25rem;
  }
  
  .filter-input {
    width: 100%;
  }
  
  .fields-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  .field-item {
    padding: 0.75rem;
  }
  
  .field-name {
    font-size: 0.8125rem;
  }
  
  .field-type {
    font-size: 0.6875rem;
  }
  
  .field-description {
    font-size: 0.6875rem;
  }
  
  .export-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
  
  .history-item {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .history-details {
    justify-content: center;
  }
  
  .history-actions {
    width: 100%;
    justify-content: center;
  }
  
  .footer-section {
    margin-top: 20px;
  }
  
  .footer-text {
    padding: 12px 0;
  }
  
  .gradient-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .export-content {
    padding: 10px 0 100px;
  }
  
  .section-card {
    padding: 12px;
    border-radius: 12px;
  }
  
  .fields-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer-section {
    margin-top: 16px;
  }
  
  .footer-text {
    padding: 10px 0;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 60px);
  }
  
  .export-content {
    padding: 10px 0 80px;
  }
  
  .section-card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .fields-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
}

/* PC WEB端布局 */
@media (min-width: 769px) {
  .format-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .fields-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

/* 滚动条样式 */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:root.dark .content-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

/* 深色模式适配 */
:root.dark .export-button {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
}

:root.dark .export-button:hover:not(:disabled) {
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2);
}

:root.dark .format-option {
  background: rgba(30, 41, 59, 0.5);
}

:root.dark .format-option.active {
  background: rgba(var(--accent-color-rgb), 0.2);
}

:root.dark .field-item {
  background: rgba(30, 41, 59, 0.5);
}

:root.dark .filter-input,
:root.dark .date-input,
:root.dark .amount-input {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .history-item {
  background: rgba(30, 41, 59, 0.5);
}
</style>
