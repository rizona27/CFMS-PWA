<template>
  <div class="export-holding-view">
    <NavBar title="导出持仓" back-route="/holdings/manage" />
    
    <div class="content">
      <div class="export-container">
        <h2 class="export-title">导出持仓数据</h2>
        <p class="export-subtitle">将持仓数据导出为文件，便于备份或共享</p>
        
        <div class="export-options">
          <!-- 导出格式选择 -->
          <div class="format-selection">
            <h3 class="section-title">选择导出格式</h3>
            <div class="format-options">
              <div
                v-for="format in exportFormats"
                :key="format.id"
                class="format-card"
                :class="{ selected: selectedFormat.id === format.id }"
                @click="selectFormat(format)"
              >
                <div class="format-icon">{{ format.icon }}</div>
                <h4 class="format-name">{{ format.name }}</h4>
                <p class="format-desc">{{ format.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- 导出范围 -->
          <div class="scope-selection">
            <h3 class="section-title">选择导出范围</h3>
            <div class="scope-options">
              <label class="scope-option">
                <input
                  type="radio"
                  v-model="exportScope"
                  value="all"
                />
                <span class="radio-label">
                  <span class="option-title">全部持仓</span>
                  <span class="option-desc">导出所有客户的持仓记录</span>
                </span>
              </label>
              
              <label class="scope-option">
                <input
                  type="radio"
                  v-model="exportScope"
                  value="filtered"
                />
                <span class="radio-label">
                  <span class="option-title">按条件筛选</span>
                  <span class="option-desc">根据筛选条件导出部分持仓</span>
                </span>
              </label>
            </div>
            
            <!-- 筛选条件 -->
            <div v-if="exportScope === 'filtered'" class="filter-options">
              <div class="filter-group">
                <label>客户姓名</label>
                <input
                  type="text"
                  v-model="filters.clientName"
                  placeholder="输入客户姓名"
                />
              </div>
              
              <div class="filter-group">
                <label>客户编号</label>
                <input
                  type="text"
                  v-model="filters.clientId"
                  placeholder="输入客户编号"
                />
              </div>
              
              <div class="filter-row">
                <div class="filter-group">
                  <label>基金代码</label>
                  <input
                    type="text"
                    v-model="filters.fundCode"
                    placeholder="输入基金代码"
                  />
                </div>
                
                <div class="filter-group">
                  <label>置顶状态</label>
                  <select v-model="filters.isPinned">
                    <option value="">全部</option>
                    <option value="pinned">已置顶</option>
                    <option value="not_pinned">未置顶</option>
                  </select>
                </div>
              </div>
              
              <div class="filter-group">
                <label>持仓日期范围</label>
                <div class="date-inputs">
                  <input
                    type="date"
                    v-model="filters.startDate"
                    placeholder="开始日期"
                  />
                  <span class="date-separator">至</span>
                  <input
                    type="date"
                    v-model="filters.endDate"
                    placeholder="结束日期"
                  />
                </div>
              </div>
              
              <div class="filter-group">
                <label>购买金额范围</label>
                <div class="range-inputs">
                  <input
                    type="number"
                    v-model.number="filters.minAmount"
                    placeholder="最小金额"
                    step="0.01"
                    min="0"
                  />
                  <span class="range-separator">-</span>
                  <input
                    type="number"
                    v-model.number="filters.maxAmount"
                    placeholder="最大金额"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 导出选项 -->
          <div class="export-settings">
            <h3 class="section-title">导出选项</h3>
            <div class="setting-options">
              <label class="setting-option">
                <input type="checkbox" v-model="options.includeCalculations" checked />
                <span>包含收益计算结果</span>
              </label>
              <label class="setting-option">
                <input type="checkbox" v-model="options.includeFundInfo" checked />
                <span>包含基金信息（名称、净值）</span>
              </label>
              <label class="setting-option">
                <input type="checkbox" v-model="options.compressFile" />
                <span>压缩导出文件</span>
              </label>
              <label class="setting-option">
                <input type="checkbox" v-model="options.includeTimestamps" />
                <span>包含时间戳（创建/更新时间）</span>
              </label>
            </div>
          </div>
          
          <!-- 字段选择 -->
          <div class="field-selection">
            <h3 class="section-title">选择导出字段</h3>
            <div class="field-options">
              <div
                v-for="field in exportFields"
                :key="field.id"
                class="field-item"
                :class="{ required: field.required }"
              >
                <label class="field-label">
                  <input
                    type="checkbox"
                    v-model="selectedFields"
                    :value="field.id"
                    :disabled="field.required"
                  />
                  <span class="field-name">{{ field.name }}</span>
                  <span class="field-type">{{ field.type }}</span>
                </label>
                <span class="field-desc">{{ field.description }}</span>
              </div>
            </div>
          </div>
          
          <!-- 预估信息 -->
          <div class="export-preview">
            <div class="preview-info">
              <div class="info-item">
                <span class="info-label">预计导出记录：</span>
                <span class="info-value">{{ estimatedRecords }} 条</span>
              </div>
              <div v-if="selectedFormat.id === 'csv'" class="info-item">
                <span class="info-label">CSV编码：</span>
                <span class="info-value">UTF-8 with BOM</span>
              </div>
              <div class="info-item">
                <span class="info-label">导出格式：</span>
                <span class="info-value">{{ selectedFormat.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">包含字段：</span>
                <span class="info-value">{{ selectedFields.length }} 个</span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="export-actions">
            <button 
              class="btn-export" 
              @click="startExport"
              :disabled="isExporting || estimatedRecords === 0"
            >
              <span v-if="!isExporting">
                <span class="button-icon">💾</span>
                开始导出
              </span>
              <span v-else class="exporting-text">
                <span class="spinner"></span>
                导出中... {{ exportProgress }}%
              </span>
            </button>
            <button class="btn-cancel" @click="goBack">取消</button>
          </div>
          
          <!-- 导出历史 -->
          <div class="export-history" v-if="exportHistory.length > 0">
            <h3 class="section-title">最近导出记录</h3>
            <div class="history-list">
              <div
                v-for="item in exportHistory"
                :key="item.id"
                class="history-item"
              >
                <div class="history-info">
                  <div class="history-main">
                    <span class="history-filename">{{ item.filename }}</span>
                    <span class="history-filesize">{{ item.filesize }}</span>
                  </div>
                  <div class="history-meta">
                    <span class="history-date">{{ item.date }}</span>
                    <span class="history-format">{{ item.format.toUpperCase() }}</span>
                    <span class="history-records">{{ item.records }} 条记录</span>
                  </div>
                </div>
                <div class="history-actions">
                  <button class="history-btn" @click="downloadAgain(item)">重新下载</button>
                  <button class="history-btn delete" @click="deleteHistory(item)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'
import type { Holding } from '@/types/data'

const router = useRouter()

const exportFormats = [
  { id: 'csv', name: 'CSV', icon: '📝', description: '标准CSV格式，兼容Excel' },
  { id: 'excel', name: 'Excel', icon: '📊', description: 'Excel格式，包含多个工作表' },
  { id: 'json', name: 'JSON', icon: '🔧', description: '结构化数据，适合程序处理' }
]

const selectedFormat = ref(exportFormats[0])
const exportScope = ref('all')
const isExporting = ref(false)
const exportProgress = ref(0)

const filters = ref({
  clientName: '',
  clientId: '',
  fundCode: '',
  isPinned: '',
  startDate: '',
  endDate: '',
  minAmount: null as number | null,
  maxAmount: null as number | null
})

const options = ref({
  includeCalculations: true,
  includeFundInfo: true,
  compressFile: false,
  includeTimestamps: false
})

// 导出字段定义
const exportFields = ref([
  { id: 'client_name', name: '客户姓名', type: '文本', description: '客户姓名', required: true },
  { id: 'client_id', name: '客户编号', type: '文本', description: '客户编号/代码', required: false },
  { id: 'fund_code', name: '基金代码', type: '文本', description: '6位基金代码', required: true },
  { id: 'fund_name', name: '基金名称', type: '文本', description: '基金全称', required: false },
  { id: 'purchase_date', name: '购买日期', type: '日期', description: 'YYYY-MM-DD格式', required: true },
  { id: 'purchase_amount', name: '购买金额', type: '金额', description: '购买总金额（元）', required: true },
  { id: 'purchase_shares', name: '购买份额', type: '份额', description: '持有份额（份）', required: true },
  { id: 'current_nav', name: '当前净值', type: '净值', description: '最新单位净值', required: false },
  { id: 'nav_date', name: '净值日期', type: '日期', description: '净值发布日期', required: false },
  { id: 'is_pinned', name: '置顶状态', type: '布尔', description: '是否置顶', required: false },
  { id: 'remarks', name: '备注', type: '文本', description: '附加说明', required: false },
  { id: 'created_at', name: '创建时间', type: '时间戳', description: '记录创建时间', required: false },
  { id: 'updated_at', name: '更新时间', type: '时间戳', description: '最后更新时间', required: false }
])

const selectedFields = ref<string[]>(['client_name', 'client_id', 'fund_code', 'fund_name', 'purchase_date', 'purchase_amount', 'purchase_shares', 'current_nav', 'nav_date', 'remarks'])

// 模拟导出历史
const exportHistory = ref([
  { 
    id: 1, 
    filename: '持仓数据_2024-03-15.csv', 
    filesize: '45.2 KB',
    date: '2024-03-15 14:30', 
    format: 'csv',
    records: 156,
    data: null as string | null
  },
  { 
    id: 2, 
    filename: '持仓数据_2024-03-10.xlsx', 
    filesize: '68.7 KB',
    date: '2024-03-10 10:15', 
    format: 'excel',
    records: 142,
    data: null as string | null
  },
  { 
    id: 3, 
    filename: 'VIP客户持仓.json', 
    filesize: '32.1 KB',
    date: '2024-03-05 16:45', 
    format: 'json',
    records: 42,
    data: null as string | null
  }
])

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 模拟持仓数据
const mockHoldings: Holding[] = [
  {
    id: '1',
    client_name: '张三',
    client_id: 'C001',
    fund_code: '005827',
    fund_name: '易方达蓝筹精选混合',
    purchase_date: '2024-01-15',
    purchase_amount: 100000.00,
    purchase_shares: 40000.0000,
    current_nav: 2.5000,
    nav_date: '2024-03-15',
    is_pinned: false,
    pinned_timestamp: null,
    remarks: '首次购买',
    created_at: '2024-01-15 10:30:00',
    updated_at: '2024-03-15 15:45:00'
  },
  // 更多模拟数据...
]

// 计算属性
const estimatedRecords = computed(() => {
  if (exportScope.value === 'all') {
    return mockHoldings.length
  }
  
  let filtered = [...mockHoldings]
  
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
  
  if (filters.value.isPinned === 'pinned') {
    filtered = filtered.filter(h => h.is_pinned)
  } else if (filters.value.isPinned === 'not_pinned') {
    filtered = filtered.filter(h => !h.is_pinned)
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
  if (format.id === 'json') {
    selectedFields.value = exportFields.value.map(f => f.id)
  } else if (format.id === 'csv') {
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
  let dataToExport = [...mockHoldings]
  
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
    case 'json':
      exportData = formatHoldingsToJSON(dataToExport)
      filename = `持仓数据_${timestamp}_${time}.json`
      mimeType = 'application/json'
      break
    case 'excel':
      // 实际项目中这里应该生成Excel文件
      exportData = formatHoldingsToCSV(dataToExport)
      filename = `持仓数据_${timestamp}_${time}.xlsx`
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
  }
  
  // 添加导出历史
  const newHistoryItem = {
    id: Date.now(),
    filename,
    filesize: formatFileSize(new Blob([exportData]).size),
    date: `${timestamp} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`,
    format: selectedFormat.value.id,
    records: dataToExport.length,
    data: exportData
  }
  
  exportHistory.value.unshift(newHistoryItem)
  
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
  
  if (filters.value.isPinned === 'pinned') {
    filtered = filtered.filter(h => h.is_pinned)
  } else if (filters.value.isPinned === 'not_pinned') {
    filtered = filtered.filter(h => !h.is_pinned)
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
  const index = exportHistory.value.findIndex(h => h.id === item.id)
  if (index !== -1) {
    exportHistory.value.splice(index, 1)
    showNotification('导出记录已删除', 'info')
  }
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const goBack = () => {
  router.push('/holdings/manage')
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
.export-holding-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.export-container {
  max-width: 1200px;
  margin: 0 auto;
}

.export-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-align: center;
}

.export-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  text-align: center;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.format-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.format-card.selected {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
  box-shadow: 0 4px 12px rgba(var(--accent-color-rgb), 0.1);
}

.format-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.format-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.format-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.scope-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.scope-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scope-option:hover {
  border-color: var(--accent-color);
}

.scope-option input[type="radio"] {
  margin-top: 3px;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.option-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.filter-options {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-row {
  display: flex;
  gap: 12px;
}

.filter-row .filter-group {
  flex: 1;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 13px;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.2);
}

.date-inputs,
.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-inputs input,
.range-inputs input {
  flex: 1;
}

.date-separator,
.range-separator {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 0 4px;
}

.range-inputs input {
  text-align: center;
}

.export-settings {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-option {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
}

.setting-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.field-selection {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.field-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
}

.field-item {
  padding: 8px;
  border-radius: 6px;
  background: var(--bg-primary);
}

.field-item.required {
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  margin-bottom: 4px;
}

.field-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.field-label input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-name {
  font-weight: 500;
  flex: 1;
}

.field-type {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
}

.field-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 24px;
}

.export-preview {
  background: linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.05), transparent);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.preview-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.export-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  flex: 2;
  padding: 14px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-export:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-cancel {
  flex: 1;
  padding: 14px;
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: var(--border-color);
}

.exporting-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
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

.export-history {
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
  margin-top: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.history-item:hover {
  border-color: var(--accent-color);
  transform: translateX(2px);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.history-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-filename {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.history-filesize {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.history-format {
  font-size: 11px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.history-records {
  font-size: 11px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.history-btn {
  padding: 6px 12px;
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.history-btn.delete:hover {
  background: #ef4444;
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .format-options {
    grid-template-columns: 1fr;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .history-actions {
    align-self: flex-end;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .preview-info {
    grid-template-columns: 1fr;
  }
  
  .history-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>