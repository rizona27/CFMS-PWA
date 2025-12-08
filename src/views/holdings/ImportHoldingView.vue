<template>
  <div class="import-holding-view">
    <NavBar title="导入持仓数据" show-back @back="goBack" />
    
    <div class="container">
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <div
          class="upload-area"
          :class="{ 'drag-over': dragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave="dragOver = false"
          @drop="handleFileDrop"
          @click="triggerFileInput"
        >
          <div class="upload-icon">📁</div>
          <h3 class="upload-title">拖放文件到此处</h3>
          <p class="upload-subtitle">或点击选择CSV文件</p>
          <p class="upload-hint">支持标准的CSV格式文件</p>
          <input
            type="file"
            ref="fileInput"
            accept=".csv"
            @change="handleFileSelect"
            style="display: none"
          />
        </div>
        
        <!-- 已选择文件 -->
        <div v-if="selectedFile" class="selected-file">
          <div class="file-info">
            <div class="file-icon">📄</div>
            <div class="file-details">
              <h4>{{ selectedFile.name }}</h4>
              <p>{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <button class="remove-file" @click="selectedFile = null">
              ✕
            </button>
          </div>
        </div>
      </div>
      
      <!-- 导入设置 -->
      <div class="settings-section">
        <h2 class="section-title">导入设置</h2>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                v-model="settings.overwrite"
                class="setting-checkbox"
              />
              <span>覆盖现有数据</span>
            </label>
            <p class="setting-hint">如果启用，将先清空所有现有持仓数据</p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                v-model="settings.skipDuplicates"
                class="setting-checkbox"
              />
              <span>跳过重复记录</span>
            </label>
            <p class="setting-hint">跳过客户、基金和日期完全相同的记录</p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                v-model="settings.autoFetchFundInfo"
                class="setting-checkbox"
              />
              <span>自动获取基金信息</span>
            </label>
            <p class="setting-hint">自动获取基金名称和最新净值</p>
          </div>
        </div>
      </div>
      
      <!-- 导入按钮 -->
      <div class="action-section">
        <button
          class="import-button"
          :class="{ 'importing': isImporting }"
          @click="startImport"
          :disabled="!selectedFile || isImporting"
        >
          <span v-if="!isImporting">开始导入</span>
          <span v-else>导入中... {{ progressPercentage.toFixed(0) }}%</span>
        </button>
        
        <button class="template-button" @click="downloadTemplate">
          下载模板
        </button>
      </div>
      
      <!-- 导入进度 -->
      <div v-if="isImporting" class="progress-section">
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            正在处理: {{ importProgress.current }}/{{ importProgress.total }}
            <span v-if="currentProcessingLine"> - {{ currentProcessingLine }}</span>
          </div>
        </div>
      </div>
      
      <!-- 导入结果 -->
      <div v-if="importResult" class="result-section">
        <h2 class="section-title">导入结果</h2>
        
        <div class="result-summary">
          <div class="result-item success">
            <div class="result-icon">✅</div>
            <div class="result-content">
              <h3>成功</h3>
              <p>{{ importResult.success }} 条</p>
            </div>
          </div>
          
          <div class="result-item failed">
            <div class="result-icon">❌</div>
            <div class="result-content">
              <h3>失败</h3>
              <p>{{ importResult.failed }} 条</p>
            </div>
          </div>
          
          <div class="result-item skipped">
            <div class="result-icon">⏭️</div>
            <div class="result-content">
              <h3>跳过</h3>
              <p>{{ importResult.skipped }} 条</p>
            </div>
          </div>
        </div>
        
        <!-- 错误详情 -->
        <div v-if="importResult.errors.length > 0" class="errors-section">
          <h3 class="errors-title">错误详情</h3>
          <div class="errors-list">
            <div
              v-for="(error, index) in importResult.errors"
              :key="index"
              class="error-item"
            >
              <span class="error-line">第{{ error.line }}行</span>
              <span class="error-field">{{ error.field }}:</span>
              <span class="error-message">{{ error.message }}</span>
              <span class="error-value" v-if="error.value">({{ error.value }})</span>
            </div>
          </div>
        </div>
        
        <!-- 成功详情 -->
        <div v-if="importResult.successItems.length > 0" class="success-section">
          <h3 class="success-title">成功导入的记录</h3>
          <div class="success-list">
            <div
              v-for="(item, index) in importResult.successItems"
              :key="index"
              class="success-item"
            >
              <span class="success-client">{{ item.client_name }}</span>
              <span class="success-fund">{{ item.fund_code }}</span>
              <span class="success-amount">{{ item.purchase_amount.toFixed(2) }}元</span>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'
import { useDataStore } from '@/stores/dataStore'
import { fundService } from '@/services/fundService'

// 定义 ImportResult 类型
interface ImportResult {
  success: number
  failed: number
  skipped: number
  total: number
  errors: Array<{
    line: number;
    field: string;
    message: string;
    value: string
  }>
  successItems: Array<{
    client_name: string
    client_id: string
    fund_code: string
    purchase_amount: number
  }>
}

const router = useRouter()
const dataStore = useDataStore()

const dragOver = ref(false)
const selectedFile = ref<File | null>(null)
const isImporting = ref(false)
const importResult = ref<ImportResult | null>(null)
const importProgress = ref({ current: 0, total: 0 })
const progressPercentage = ref(0)
const currentProcessingLine = ref('')

// 使用dataStore中的导入设置
const settings = computed(() => dataStore.userPreferences.importSettings)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 处理文件拖放
const handleDragOver = (event: DragEvent) => {
  dragOver.value = true
  event.preventDefault()
}

const handleFileDrop = (event: DragEvent) => {
  dragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.name.endsWith('.csv')) {
      selectedFile.value = file
    } else {
      showNotification('请选择CSV文件', 'error')
    }
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    if (file.name.endsWith('.csv')) {
      selectedFile.value = file
    } else {
      showNotification('请选择CSV文件', 'error')
      input.value = ''
    }
  }
}

// 触发文件输入
const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  fileInput?.click()
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证CSV行数据
const validateCSVRow = (row: any, lineIndex: number) => {
  const errors: Array<{ field: string; message: string; value: string }> = []
  
  // 验证客户姓名
  if (!row.client_name || row.client_name.trim() === '') {
    errors.push({
      field: '客户姓名',
      message: '不能为空',
      value: row.client_name || ''
    })
  } else {
    const name = row.client_name.trim()
    const hasChinese = /[\u4e00-\u9fa5]/.test(name)
    if (hasChinese && name.length > 5) {
      errors.push({
        field: '客户姓名',
        message: '包含汉字时长度不能超过5个字符',
        value: name
      })
    } else if (!hasChinese && name.length > 15) {
      errors.push({
        field: '客户姓名',
        message: '英文姓名不超过15个字母',
        value: name
      })
    }
  }
  
  // 验证客户号（可选）
  if (row.client_id && row.client_id.trim() !== '') {
    const clientId = row.client_id.trim()
    if (!/^\d*$/.test(clientId)) {
      errors.push({
        field: '客户号',
        message: '只能包含数字',
        value: clientId
      })
    }
    if (clientId.length > 20) {
      errors.push({
        field: '客户号',
        message: '不能超过20个字符',
        value: clientId
      })
    }
  }
  
  // 验证基金代码
  if (!row.fund_code || !/^\d{6}$/.test(row.fund_code)) {
    errors.push({
      field: '基金代码',
      message: '必须是6位数字',
      value: row.fund_code || ''
    })
  }
  
  // 验证购买金额
  if (!row.purchase_amount || isNaN(parseFloat(row.purchase_amount))) {
    errors.push({
      field: '购买金额',
      message: '必须是有效数字',
      value: row.purchase_amount || ''
    })
  } else {
    const amount = parseFloat(row.purchase_amount)
    if (amount <= 0) {
      errors.push({
        field: '购买金额',
        message: '必须大于0',
        value: amount.toString()
      })
    }
    if (amount > 999999999.99) {
      errors.push({
        field: '购买金额',
        message: '不能超过999,999,999.99',
        value: amount.toString()
      })
    }
  }
  
  // 验证购买份额
  if (!row.purchase_shares || isNaN(parseFloat(row.purchase_shares))) {
    errors.push({
      field: '购买份额',
      message: '必须是有效数字',
      value: row.purchase_shares || ''
    })
  } else {
    const shares = parseFloat(row.purchase_shares)
    if (shares <= 0) {
      errors.push({
        field: '购买份额',
        message: '必须大于0',
        value: shares.toString()
      })
    }
    if (shares > 999999.9999) {
      errors.push({
        field: '购买份额',
        message: '不能超过999,999.9999',
        value: shares.toString()
      })
    }
  }
  
  // 验证购买日期
  if (!row.purchase_date) {
    errors.push({
      field: '购买日期',
      message: '不能为空',
      value: row.purchase_date || ''
    })
  } else {
    const date = new Date(row.purchase_date)
    if (isNaN(date.getTime())) {
      errors.push({
        field: '购买日期',
        message: '日期格式无效',
        value: row.purchase_date
      })
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date > today) {
        errors.push({
          field: '购买日期',
          message: '不能晚于今天',
          value: row.purchase_date
        })
      }
    }
  }
  
  return errors
}

// 解析CSV文件
const parseCSV = (csvText: string): Array<any> => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '')
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row: any = {}
    
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        row[header] = values[index].trim()
      }
    })
    
    rows.push(row)
  }
  
  return rows
}

// 开始导入
const startImport = async () => {
  if (!selectedFile.value) return
  
  isImporting.value = true
  importResult.value = null
  progressPercentage.value = 0
  
  try {
    const fileContent = await selectedFile.value.text()
    const rows = parseCSV(fileContent)
    
    if (rows.length === 0) {
      showNotification('CSV文件为空或格式错误', 'error')
      isImporting.value = false
      return
    }
    
    // 如果需要覆盖，先清空现有数据
    if (settings.value.overwrite) {
      dataStore.clearAllHoldings()
    }
    
    importProgress.value = { current: 0, total: rows.length }
    
    const result: ImportResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      total: rows.length,
      errors: [],
      successItems: []
    }
    
    const existingKeys = new Set<string>()
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const lineNumber = i + 2 // +2是因为标题行和0-based索引
      
      currentProcessingLine.value = `第${lineNumber}行: ${row.client_name || ''}`
      importProgress.value.current = i + 1
      progressPercentage.value = ((i + 1) / rows.length) * 100
      
      // 验证行数据
      const errors = validateCSVRow(row, lineNumber)
      if (errors.length > 0) {
        result.failed++
        errors.forEach(error => {
          result.errors.push({
            line: lineNumber,
            field: error.field,
            message: error.message,
            value: error.value
          })
        })
        continue
      }
      
      // 检查重复
      const duplicateKey = `${row.client_name}|${row.client_id || ''}|${row.fund_code}|${row.purchase_date}`
      if (settings.value.skipDuplicates && existingKeys.has(duplicateKey)) {
        result.skipped++
        continue
      }
      
      existingKeys.add(duplicateKey)
      
      try {
        // 获取基金信息
        let fundName = row.fund_name ? row.fund_name.trim() : ''
        let currentNav = 0
        let navDate = new Date().toISOString().split('T')[0]
        
        if (settings.value.autoFetchFundInfo) {
          try {
            const fundInfo = await fundService.fetchFundInfo(row.fund_code)
            if (fundInfo.name) {
              fundName = fundInfo.name
              currentNav = fundInfo.nav
              navDate = fundInfo.navDate
            }
          } catch (error) {
            console.warn(`获取基金信息失败: ${row.fund_code}`, error)
            // 如果获取失败，继续使用手动输入的值或默认值
          }
        }
        
        // 创建FundHolding对象并保存到dataStore
        const fundHolding = {
          id: crypto.randomUUID(),
          clientName: row.client_name.trim(),
          clientID: row.client_id ? row.client_id.trim() : '',
          fundCode: row.fund_code,
          fundName: fundName,
          purchaseAmount: parseFloat(parseFloat(row.purchase_amount).toFixed(2)),
          purchaseShares: parseFloat(parseFloat(row.purchase_shares).toFixed(4)),
          purchaseDate: new Date(row.purchase_date),
          remarks: row.remarks ? row.remarks.trim() : '',
          currentNav: currentNav,
          navDate: new Date(navDate),
          isValid: true,
          isPinned: false,
          pinnedTimestamp: undefined
        }
        
        dataStore.addHolding(fundHolding)
        
        result.success++
        result.successItems.push({
          client_name: fundHolding.clientName,
          client_id: fundHolding.clientID,
          fund_code: fundHolding.fundCode,
          purchase_amount: fundHolding.purchaseAmount
        })
        
      } catch (error) {
        result.failed++
        result.errors.push({
          line: lineNumber,
          field: '系统错误',
          message: `保存失败: ${error}`,
          value: ''
        })
      }
    }
    
    importResult.value = result
    
    if (result.success > 0) {
      showNotification(`导入完成！成功${result.success}条，失败${result.failed}条，跳过${result.skipped}条`, 'success')
    } else {
      showNotification('导入失败，请检查CSV文件格式', 'error')
    }
    
  } catch (error) {
    console.error('导入失败:', error)
    showNotification(`导入失败: ${error}`, 'error')
  } finally {
    isImporting.value = false
    progressPercentage.value = 100
  }
}

// 下载模板文件
const downloadTemplate = () => {
  const headers = [
    '客户姓名',
    '客户号',
    '基金代码',
    '基金名称',
    '购买金额',
    '购买份额',
    '购买日期',
    '备注'
  ]
  
  const exampleData = [
    ['张三', 'C001', '005827', '易方达蓝筹精选混合', '100000.00', '40000.0000', '2024-01-15', '首次购买'],
    ['李四', 'C002', '000001', '华夏成长混合', '50000.00', '27777.7778', '2024-02-20', '追加投资']
  ]
  
  const csvContent = [
    headers.join(','),
    ...exampleData.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', '持仓数据导入模板.csv')
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showNotification('模板文件下载成功', 'success')
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const goBack = () => {
  router.push('/holdings/manage')
}
</script>

<style scoped>
.import-holding-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-area {
  border: 3px dashed rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.upload-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.upload-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.selected-file {
  margin-top: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.file-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.file-details {
  flex: 1;
}

.file-details h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.file-details p {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.875rem;
}

.remove-file {
  background: #ef4444;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-file:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.section-title {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  color: #333;
}

.setting-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.setting-hint {
  font-size: 0.875rem;
  color: #666;
  margin-left: 2rem;
}

.action-section {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.import-button {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.import-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.import-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.import-button.importing {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
}

.template-button {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid #667eea;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-button:hover {
  background: #667eea;
  color: white;
}

.progress-section {
  margin-top: 2rem;
}

.progress-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}

.result-section {
  margin-top: 2rem;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.result-icon {
  font-size: 2rem;
}

.result-content h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.result-content p {
  margin: 0.25rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.result-item.success .result-content p {
  color: #10b981;
}

.result-item.failed .result-content p {
  color: #ef4444;
}

.result-item.skipped .result-content p {
  color: #f59e0b;
}

.errors-section,
.success-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.errors-title,
.success-title {
  color: #333;
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.errors-list,
.success-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.error-item,
.success-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.875rem;
}

.error-line {
  font-weight: 600;
  color: #333;
  min-width: 60px;
}

.error-field {
  color: #ef4444;
  font-weight: 500;
  min-width: 80px;
}

.error-message {
  color: #666;
  flex: 1;
}

.error-value {
  color: #999;
  font-style: italic;
}

.success-client {
  font-weight: 600;
  color: #333;
  min-width: 100px;
}

.success-fund {
  color: #667eea;
  font-family: 'Courier New', monospace;
  min-width: 80px;
}

.success-amount {
  color: #10b981;
  font-weight: 600;
}

/* 深色模式适配 */
:root.dark .import-holding-view {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

:root.dark .file-info {
  background: rgba(30, 41, 59, 0.95);
}

:root.dark .file-details h4 {
  color: #f1f5f9;
}

:root.dark .file-details p {
  color: #cbd5e1;
}

:root.dark .settings-grid,
:root.dark .progress-container,
:root.dark .result-item,
:root.dark .errors-section,
:root.dark .success-section {
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

:root.dark .setting-label {
  color: #f1f5f9;
}

:root.dark .setting-hint {
  color: #cbd5e1;
}

:root.dark .progress-text {
  color: #cbd5e1;
}

:root.dark .result-content h3 {
  color: #f1f5f9;
}

:root.dark .errors-title,
:root.dark .success-title {
  color: #f1f5f9;
}

:root.dark .error-item,
:root.dark .success-item {
  background: rgba(15, 23, 42, 0.7);
}

:root.dark .error-line {
  color: #f1f5f9;
}

:root.dark .error-message {
  color: #cbd5e1;
}

:root.dark .error-value {
  color: #94a3b8;
}

:root.dark .success-client {
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .upload-area {
    padding: 2rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .result-summary {
    grid-template-columns: 1fr;
  }
}
</style>
