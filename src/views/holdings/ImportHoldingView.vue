<template>
  <div class="import-holding-view">
    <NavBar title="导入持仓" back-route="/holdings/manage" />
    
    <div class="content">
      <div class="import-container">
        <h2 class="import-title">导入持仓数据</h2>
        <p class="import-subtitle">支持从CSV文件导入持仓数据，格式请参照示例</p>
        
        <div class="import-options">
          <!-- 文件拖放区域 -->
          <div 
            class="drop-zone"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop="handleFileDrop"
            :class="{ 'drag-over': dragOver }"
          >
            <div class="drop-icon">📁</div>
            <h3>拖放文件到此处</h3>
            <p>支持 .csv 格式</p>
            <p class="drop-hint">或点击下方按钮选择文件</p>
          </div>
          
          <!-- 文件选择按钮 -->
          <div class="file-selector">
            <input
              type="file"
              id="fileInput"
              ref="fileInput"
              accept=".csv"
              @change="handleFileSelect"
              hidden
            />
            <label for="fileInput" class="file-select-button">
              <span class="button-icon">📄</span>
              选择CSV文件
            </label>
            <p v-if="selectedFile" class="selected-file">
              已选择: {{ selectedFile.name }}
              <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
            </p>
          </div>
          
          <!-- 导入选项 -->
          <div class="import-settings">
            <h3 class="settings-title">导入设置</h3>
            
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.overwrite" />
                <span>覆盖现有数据</span>
              </label>
              <p class="setting-hint">如果勾选，将清空现有持仓后导入</p>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.skipDuplicates" checked />
                <span>跳过重复记录</span>
              </label>
              <p class="setting-hint">根据客户姓名+客户号+基金代码+购买日期检测重复</p>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.autoFetchFundInfo" checked />
                <span>自动获取基金信息</span>
              </label>
              <p class="setting-hint">导入后自动获取基金名称、最新净值和净值日期</p>
            </div>
          </div>
          
          <!-- CSV格式说明 -->
          <div class="format-guide">
            <h3 class="guide-title">CSV文件格式说明</h3>
            <div class="guide-content">
              <p>CSV文件应包含以下列（列顺序不限，标题行可选）：</p>
              <div class="columns-list">
                <div class="column-item required">
                  <span class="column-name">客户姓名</span>
                  <span class="column-desc">必填，最多50个字符</span>
                </div>
                <div class="column-item optional">
                  <span class="column-name">客户号</span>
                  <span class="column-desc">可选，最多20个字符</span>
                </div>
                <div class="column-item required">
                  <span class="column-name">基金代码</span>
                  <span class="column-desc">必填，6位数字</span>
                </div>
                <div class="column-item optional">
                  <span class="column-name">基金名称</span>
                  <span class="column-desc">可选，自动获取或手动填写</span>
                </div>
                <div class="column-item required">
                  <span class="column-name">购买金额</span>
                  <span class="column-desc">必填，最多2位小数</span>
                </div>
                <div class="column-item required">
                  <span class="column-name">购买份额</span>
                  <span class="column-desc">必填，最多4位小数</span>
                </div>
                <div class="column-item required">
                  <span class="column-name">购买日期</span>
                  <span class="column-desc">必填，格式：YYYY-MM-DD</span>
                </div>
                <div class="column-item optional">
                  <span class="column-name">备注</span>
                  <span class="column-desc">可选，最多255个字符</span>
                </div>
              </div>
              <button class="btn-download-template" @click="downloadTemplate">
                <span class="button-icon">📥</span>
                下载模板文件
              </button>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="import-actions">
            <button 
              class="btn-import" 
              :disabled="!selectedFile || isImporting"
              @click="startImport"
            >
              <span v-if="!isImporting">开始导入</span>
              <span v-else class="importing-text">
                <span class="spinner"></span>
                导入中... {{ importProgress.current }}/{{ importProgress.total }}
              </span>
            </button>
            <button class="btn-cancel" @click="goBack">取消</button>
          </div>
          
          <!-- 导入结果 -->
          <div v-if="importResult" class="import-result">
            <h3 class="result-title">导入结果</h3>
            <div class="result-stats">
              <div class="stat-item success">
                <span class="stat-count">{{ importResult.success }}</span>
                <span class="stat-label">成功</span>
              </div>
              <div class="stat-item failed">
                <span class="stat-count">{{ importResult.failed }}</span>
                <span class="stat-label">失败</span>
              </div>
              <div class="stat-item skipped">
                <span class="stat-count">{{ importResult.skipped }}</span>
                <span class="stat-label">跳过</span>
              </div>
              <div class="stat-item total">
                <span class="stat-count">{{ importResult.total }}</span>
                <span class="stat-label">总计</span>
              </div>
            </div>
            
            <div v-if="importResult.errors.length > 0" class="error-list">
              <h4>错误详情：</h4>
              <div class="errors-container">
                <div v-for="(error, index) in importResult.errors" :key="index" class="error-item">
                  <span class="error-line">第{{ error.line }}行: </span>
                  <span class="error-message">{{ error.message }}</span>
                  <span v-if="error.field" class="error-field">(字段: {{ error.field }})</span>
                  <span v-if="error.value" class="error-value">值: "{{ error.value }}"</span>
                </div>
              </div>
            </div>
            
            <div v-if="importResult.success > 0" class="success-list">
              <h4>成功导入记录：</h4>
              <div class="success-items">
                <div v-for="(item, index) in importResult.successItems" :key="index" class="success-item">
                  {{ item.client_name }} ({{ item.client_id }}) - {{ item.fund_code }}: {{ item.purchase_amount.toFixed(2) }}元
                </div>
              </div>
            </div>
          </div>
          
          <!-- 导入进度 -->
          <div v-if="isImporting" class="import-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <div class="progress-info">
              <span>正在处理: {{ currentProcessingLine }}</span>
              <span>{{ progressPercentage.toFixed(1) }}%</span>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'

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

// 定义 Holding 类型（简化版）
interface Holding {
  client_name: string
  client_id: string
  fund_code: string
  fund_name: string
  purchase_date: string
  purchase_amount: number
  purchase_shares: number
  current_nav: number
  nav_date: string
  is_pinned: boolean
  pinned_timestamp: string | null
  remarks: string
  created_at: string
  updated_at: string
}

const router = useRouter()

const dragOver = ref(false)
const selectedFile = ref<File | null>(null)
const isImporting = ref(false)
const importResult = ref<ImportResult | null>(null)
const importProgress = ref({ current: 0, total: 0 })
const progressPercentage = ref(0)
const currentProcessingLine = ref('')

const settings = ref({
  overwrite: false,
  skipDuplicates: true,
  autoFetchFundInfo: true
})

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 处理文件拖放
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

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证CSV行数据（移植自Swift的验证逻辑）
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
      
      // 创建持仓对象（确保所有必需字段都有值）
      const holding: Holding = {
        client_name: row.client_name.trim(),
        client_id: row.client_id ? row.client_id.trim() : '',
        fund_code: row.fund_code,
        fund_name: row.fund_name ? row.fund_name.trim() : '',
        purchase_date: row.purchase_date,
        purchase_amount: parseFloat(parseFloat(row.purchase_amount).toFixed(2)),
        purchase_shares: parseFloat(parseFloat(row.purchase_shares).toFixed(4)),
        current_nav: 0,
        nav_date: new Date().toISOString().split('T')[0],
        is_pinned: false,
        pinned_timestamp: null,
        remarks: row.remarks ? row.remarks.trim() : '',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      
      // 模拟API调用保存
      await new Promise(resolve => setTimeout(resolve, 50))
      
      result.success++
      result.successItems.push({
        client_name: holding.client_name,
        client_id: holding.client_id,
        fund_code: holding.fund_code,
        purchase_amount: holding.purchase_amount
      })
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
}

const goBack = () => {
  router.push('/holdings/manage')
}
</script>

<style scoped>
.import-holding-view {
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

.import-container {
  max-width: 1200px;
  margin: 0 auto;
}

.import-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-align: center;
}

.import-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  text-align: center;
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-card);
}

.drop-zone.drag-over {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.drop-zone h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.drop-zone p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.drop-hint {
  font-size: 12px;
  opacity: 0.7;
}

.file-selector {
  text-align: center;
}

.file-select-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-select-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.button-icon {
  font-size: 18px;
}

.selected-file {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-primary);
}

.file-size {
  color: var(--text-secondary);
  font-size: 12px;
}

.import-settings {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
}

.setting-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.setting-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 28px;
  margin-top: 4px;
}

.format-guide {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.guide-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.guide-content {
  font-size: 14px;
  color: var(--text-secondary);
}

.guide-content p {
  margin-bottom: 12px;
}

.columns-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.column-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.column-item.required {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}

.column-item.optional {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.column-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.column-desc {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
}

.btn-download-template {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-download-template:hover {
  background: var(--border-color);
  transform: translateY(-1px);
}

.import-actions {
  display: flex;
  gap: 12px;
}

.btn-import {
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
}

.btn-import:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-import:not(:disabled):hover {
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

.importing-text {
  display: flex;
  align-items: center;
  justify-content: center;
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

.import-result {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  margin-top: 16px;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-primary);
}

.stat-item.success {
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.stat-item.failed {
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.stat-item.skipped {
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.stat-item.total {
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-count {
  font-size: 24px;
  font-weight: 700;
}

.stat-item.success .stat-count {
  color: #10b981;
}

.stat-item.failed .stat-count {
  color: #ef4444;
}

.stat-item.skipped .stat-count {
  color: #f59e0b;
}

.stat-item.total .stat-count {
  color: #3b82f6;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.error-list {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  margin-bottom: 16px;
}

.error-list h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.errors-container {
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  font-size: 12px;
  color: #ef4444;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.error-item:last-child {
  border-bottom: none;
}

.error-line {
  font-weight: 600;
}

.error-field {
  color: #f59e0b;
}

.error-value {
  color: #6b7280;
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.success-list {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.success-list h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.success-items {
  max-height: 150px;
  overflow-y: auto;
}

.success-item {
  font-size: 13px;
  color: #10b981;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.success-item:last-child {
  border-bottom: none;
}

.import-progress {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.progress-bar {
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #3b82f6);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .import-actions {
    flex-direction: column;
  }
  
  .drop-zone {
    padding: 30px 16px;
  }
  
  .drop-icon {
    font-size: 40px;
  }
  
  .columns-list {
    grid-template-columns: 1fr;
  }
  
  .result-stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    min-width: calc(50% - 8px);
  }
}
</style>