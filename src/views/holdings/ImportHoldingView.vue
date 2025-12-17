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
          <p class="upload-subtitle">或点击选择文件</p>
          <p class="upload-hint">支持CSV文件格式</p>
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
            <div class="file-icon">📝</div>
            <div class="file-details">
              <h4>{{ selectedFile.name }}</h4>
              <p>{{ formatFileSize(selectedFile.size) }} · CSV文件</p>
            </div>
            <button class="remove-file" @click="clearSelection">
              ✕
            </button>
          </div>
        </div>
      </div>
      
      <!-- 导入设置 -->
      <div v-if="selectedFile" class="settings-section">
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
            <p class="setting-hint">使用客户、基金、金额、份额、日期和客户号组合检查重复</p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                v-model="settings.stripEmptyRows"
                class="setting-checkbox"
              />
              <span>跳过空行</span>
            </label>
            <p class="setting-hint">自动跳过完全为空的记录行</p>
          </div>
        </div>
      </div>
      
      <!-- 数据预览 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <h2 class="section-title">数据预览（前3条）</h2>
        <div class="preview-table">
          <table>
            <thead>
              <tr>
                <th>客户姓名</th>
                <th>客户号</th>
                <th>基金代码</th>
                <th>购买金额</th>
                <th>购买份额</th>
                <th>购买日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in previewData" :key="index">
                <td>{{ item.clientName }}</td>
                <td>{{ item.clientID }}</td>
                <td>{{ item.fundCode }}</td>
                <td>{{ item.purchaseAmount.toFixed(2) }}</td>
                <td>{{ item.purchaseShares.toFixed(4) }}</td>
                <td>{{ formatDate(item.purchaseDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 导入按钮 -->
      <div v-if="selectedFile" class="action-section">
        <button
          class="import-button"
          :class="{ 'importing': isImporting }"
          @click="startImport"
          :disabled="!selectedFile || isImporting || previewData.length === 0"
        >
          <span v-if="!isImporting">开始导入</span>
          <span v-else>导入中... {{ progressPercentage.toFixed(0) }}%</span>
        </button>
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
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="result-actions">
          <button class="action-button primary" @click="goToHoldings">
            查看持仓
          </button>
          <button class="action-button secondary" @click="importAnother">
            导入另一个文件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import { useDataStore, type FundHolding as StoreFundHolding } from '@/stores/dataStore'
import { FundHolding as FundHoldingClass } from '@/models/FundModels'

// 定义类型
interface ImportResult {
  success: number
  failed: number
  total: number
  errors: Array<{
    line: number;
    field: string;
    message: string;
    value: string
  }>
  successItems: StoreFundHolding[]
}

const router = useRouter()
const dataStore = useDataStore()

// 响应式数据
const dragOver = ref(false)
const selectedFile = ref<File | null>(null)
const isImporting = ref(false)
const importResult = ref<ImportResult | null>(null)
const progressPercentage = ref(0)
const previewData = ref<StoreFundHolding[]>([])
const rawHeaders = ref<string[]>([])
const rawData = ref<any[]>([])

// 导入统计
const totalRows = ref(0)
const processedRows = ref(0)
const successRows = ref(0)
const failedRows = ref(0)

// 使用dataStore中的导入设置，正确处理默认值
const settings = computed(() => {
  const defaultSettings = {
    overwrite: false,
    skipDuplicates: true,
    stripEmptyRows: true
  }
  
  return {
    ...defaultSettings,
    ...dataStore.userPreferences.importSettings
  }
})

// 文件处理函数
const handleDragOver = (event: DragEvent) => {
  dragOver.value = true
  event.preventDefault()
}

const handleFileDrop = async (event: DragEvent) => {
  dragOver.value = false
  event.preventDefault()
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.name.toLowerCase().endsWith('.csv')) {
      selectedFile.value = file
      await readAndDetectColumns(file)
    } else {
      showNotification('请选择CSV文件', 'error')
    }
  }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    if (file.name.toLowerCase().endsWith('.csv')) {
      selectedFile.value = file
      await readAndDetectColumns(file)
    } else {
      showNotification('请选择CSV文件', 'error')
      input.value = ''
    }
  }
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  fileInput?.click()
}

const clearSelection = () => {
  selectedFile.value = null
  previewData.value = []
  rawHeaders.value = []
  rawData.value = []
  importResult.value = null
  
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

// 读取文件并检测列名
const readAndDetectColumns = async (file: File) => {
  try {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim() !== '')
    
    if (lines.length > 0) {
      const data = parseCSVLines(lines)
      rawHeaders.value = data[0] || []
      rawData.value = data.slice(1)
      
      // 检测列名映射
      detectColumnMapping(rawHeaders.value, rawData.value)
      
      // 生成预览数据
      generatePreviewData()
    }
  } catch (error) {
    console.error('读取文件失败:', error)
    showNotification(`读取文件失败: ${error}`, 'error')
  }
}

// 解析CSV行（处理引号和逗号）
const parseCSVLines = (lines: string[]): string[][] => {
  const result: string[][] = []
  
  for (const line of lines) {
    const columns: string[] = []
    let currentColumn = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        columns.push(currentColumn.trim())
        currentColumn = ''
      } else {
        currentColumn += char
      }
    }
    
    columns.push(currentColumn.trim())
    result.push(columns)
  }
  
  return result
}

// 检测列名映射
const detectColumnMapping = (headers: string[], sampleData: any[]) => {
  // 简化的列名检测逻辑
  const columnMapping: any[] = []
  const requiredFields = ['clientName', 'clientID', 'fundCode', 'purchaseAmount', 'purchaseShares']
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim().toLowerCase()
    let mappedTo = ''
    
    if (header.includes('客户姓名') || header.includes('姓名') || header.includes('name')) {
      mappedTo = 'clientName'
    } else if (header.includes('客户号') || header.includes('客户编号') || header.includes('id')) {
      mappedTo = 'clientID'
    } else if (header.includes('基金代码') || header.includes('代码') || header.includes('code')) {
      mappedTo = 'fundCode'
    } else if (header.includes('购买金额') || header.includes('金额') || header.includes('amount')) {
      mappedTo = 'purchaseAmount'
    } else if (header.includes('购买份额') || header.includes('份额') || header.includes('shares')) {
      mappedTo = 'purchaseShares'
    } else if (header.includes('购买日期') || header.includes('日期') || header.includes('date')) {
      mappedTo = 'purchaseDate'
    }
    
    columnMapping.push({
      original: header || `列${i + 1}`,
      mappedTo: mappedTo,
      sample: sampleData.length > 0 ? (sampleData[0][i] || '') : ''
    })
  }
  
  // 检查必要字段
  const missingFields = requiredFields.filter(field =>
    !columnMapping.some(m => m.mappedTo === field)
  )
  
  if (missingFields.length > 0) {
    showNotification(`缺少必要字段: ${missingFields.join(', ')}，请确保CSV包含客户姓名、客户号、基金代码、购买金额、购买份额列`, 'error')
  }
}

// 生成预览数据
const generatePreviewData = () => {
  previewData.value = []
  
  if (!rawData.value || rawData.value.length === 0) return
  
  // 创建映射关系
  const fieldMap: Record<string, number> = {}
  for (let i = 0; i < rawHeaders.value.length; i++) {
    const header = rawHeaders.value[i].trim().toLowerCase()
    
    if (header.includes('客户姓名') || header.includes('姓名') || header.includes('name')) {
      fieldMap['clientName'] = i
    } else if (header.includes('客户号') || header.includes('客户编号') || header.includes('id')) {
      fieldMap['clientID'] = i
    } else if (header.includes('基金代码') || header.includes('代码') || header.includes('code')) {
      fieldMap['fundCode'] = i
    } else if (header.includes('购买金额') || header.includes('金额') || header.includes('amount')) {
      fieldMap['purchaseAmount'] = i
    } else if (header.includes('购买份额') || header.includes('份额') || header.includes('shares')) {
      fieldMap['purchaseShares'] = i
    } else if (header.includes('购买日期') || header.includes('日期') || header.includes('date')) {
      fieldMap['purchaseDate'] = i
    }
  }
  
  // 检查必要字段
  const requiredFields = ['clientName', 'fundCode', 'purchaseAmount', 'purchaseShares']
  const missingFields = requiredFields.filter(field => !fieldMap[field])
  
  if (missingFields.length > 0) {
    showNotification(`缺少必要字段: ${missingFields.join(', ')}`, 'error')
    return
  }
  
  // 转换前3行数据
  const previewRows = Math.min(3, rawData.value.length)
  for (let i = 0; i < previewRows; i++) {
    const row = rawData.value[i]
    const rowData: any = {}
    
    Object.keys(fieldMap).forEach(field => {
      const colIndex = fieldMap[field]
      if (colIndex !== undefined && row[colIndex] !== undefined) {
        rowData[field] = row[colIndex]
      }
    })
    
    try {
      // 数据清洗和转换
      const cleanedData = cleanRowData(rowData)
      
      // 使用convertHoldingToFundHolding转换数据
      const fundHoldingData = dataStore.convertHoldingToFundHolding(cleanedData)
      
      // 转换为StoreFundHolding类型
      const storeFundHolding: StoreFundHolding = {
        ...fundHoldingData,
        pinnedTimestamp: fundHoldingData.pinnedTimestamp || undefined
      }
      
      previewData.value.push(storeFundHolding)
    } catch (error) {
      console.error(`第${i + 1}行数据转换失败:`, error)
      const invalidHolding: StoreFundHolding = {
        id: crypto.randomUUID(),
        clientName: '数据错误',
        clientID: '',
        fundCode: 'ERROR',
        fundName: '',
        purchaseAmount: 0,
        purchaseShares: 0,
        purchaseDate: new Date(),
        remarks: '',
        currentNav: 0,
        navDate: new Date(),
        isValid: false,
        isPinned: false,
        pinnedTimestamp: undefined
      }
      previewData.value.push(invalidHolding)
    }
  }
}

// 清洗行数据
const cleanRowData = (rowData: any): any => {
  const cleaned: any = {}
  
  // 清洗基金代码（补全为6位）
  if (rowData.fundCode) {
    cleaned.fundCode = String(rowData.fundCode).padStart(6, '0')
  }
  
  // 清洗客户号（补全为12位）
  if (rowData.clientID) {
    const clientIDStr = String(rowData.clientID).trim()
    cleaned.clientID = clientIDStr.padStart(12, '0')
  } else {
    cleaned.clientID = '000000000000'
  }
  
  // 客户姓名
  cleaned.clientName = String(rowData.clientName || '').trim()
  if (!cleaned.clientName) {
    cleaned.clientName = `客户${cleaned.clientID}`
  }
  
  // 转换数值类型
  cleaned.purchaseAmount = parseFloat(rowData.purchaseAmount) || 0
  cleaned.purchaseShares = parseFloat(rowData.purchaseShares) || 0
  cleaned.currentNav = parseFloat(rowData.currentNav) || 0
  
  // 转换日期类型
  if (rowData.purchaseDate) {
    const date = parseDate(rowData.purchaseDate)
    cleaned.purchaseDate = date || new Date()
  } else {
    cleaned.purchaseDate = new Date()
  }
  
  cleaned.navDate = new Date()
  
  // 其他字段
  cleaned.fundName = String(rowData.fundName || '').trim() || '未加载'
  cleaned.remarks = String(rowData.remarks || '').trim()
  
  return cleaned
}

// 解析日期
const parseDate = (dateStr: any): Date | null => {
  if (!dateStr) return null
  
  const str = String(dateStr).trim()
  
  // 尝试直接解析
  const date = new Date(str)
  if (!isNaN(date.getTime())) {
    return date
  }
  
  // 尝试处理yyyy-MM-dd格式
  const match = str.match(/^(\d{4})[-/]?(\d{1,2})[-/]?(\d{1,2})$/)
  if (match) {
    const year = parseInt(match[1])
    const month = parseInt(match[2]) - 1
    const day = parseInt(match[3])
    return new Date(year, month, day)
  }
  
  return null
}

// 验证持仓数据
const validateHolding = (holding: StoreFundHolding, lineIndex: number) => {
  const errors: Array<{ field: string; message: string; value: string }> = []
  
  // 验证客户姓名
  if (!holding.clientName || holding.clientName.trim() === '') {
    errors.push({
      field: '客户姓名',
      message: '不能为空',
      value: holding.clientName || ''
    })
  }
  
  // 验证基金代码
  if (!holding.fundCode || !/^\d{6}$/.test(holding.fundCode)) {
    errors.push({
      field: '基金代码',
      message: '必须是6位数字',
      value: holding.fundCode || ''
    })
  }
  
  // 验证购买金额
  if (holding.purchaseAmount <= 0) {
    errors.push({
      field: '购买金额',
      message: '必须大于0',
      value: holding.purchaseAmount.toString()
    })
  }
  
  // 验证购买份额
  if (holding.purchaseShares <= 0) {
    errors.push({
      field: '购买份额',
      message: '必须大于0',
      value: holding.purchaseShares.toString()
    })
  }
  
  // 验证购买日期
  if (!holding.purchaseDate || isNaN(holding.purchaseDate.getTime())) {
    errors.push({
      field: '购买日期',
      message: '日期无效',
      value: holding.purchaseDate?.toString() || ''
    })
  }
  
  return errors
}

// 开始导入
const startImport = async () => {
  if (!selectedFile.value) return
  
  isImporting.value = true
  importResult.value = null
  progressPercentage.value = 0
  totalRows.value = rawData.value.length
  processedRows.value = 0
  successRows.value = 0
  failedRows.value = 0
  
  try {
    // 如果需要覆盖，先清空现有数据
    if (settings.value.overwrite) {
      const count = dataStore.holdings.length
      dataStore.clearAllHoldings()
      showNotification(`已清空${count}条现有持仓记录`, 'info')
    }
    
    // 创建映射关系
    const fieldMap: Record<string, number> = {}
    for (let i = 0; i < rawHeaders.value.length; i++) {
      const header = rawHeaders.value[i].trim().toLowerCase()
      
      if (header.includes('客户姓名') || header.includes('姓名') || header.includes('name')) {
        fieldMap['clientName'] = i
      } else if (header.includes('客户号') || header.includes('客户编号') || header.includes('id')) {
        fieldMap['clientID'] = i
      } else if (header.includes('基金代码') || header.includes('代码') || header.includes('code')) {
        fieldMap['fundCode'] = i
      } else if (header.includes('购买金额') || header.includes('金额') || header.includes('amount')) {
        fieldMap['purchaseAmount'] = i
      } else if (header.includes('购买份额') || header.includes('份额') || header.includes('shares')) {
        fieldMap['purchaseShares'] = i
      } else if (header.includes('购买日期') || header.includes('日期') || header.includes('date')) {
        fieldMap['purchaseDate'] = i
      }
    }
    
    // 检查必要字段
    const requiredFields = ['clientName', 'fundCode', 'purchaseAmount', 'purchaseShares']
    const missingFields = requiredFields.filter(field => !fieldMap[field])
    
    if (missingFields.length > 0) {
      showNotification(`缺少必要字段: ${missingFields.join(', ')}`, 'error')
      isImporting.value = false
      return
    }
    
    const result: ImportResult = {
      success: 0,
      failed: 0,
      total: rawData.value.length,
      errors: [],
      successItems: []
    }
    
    // 使用Set来存储已存在的去重键
    const existingKeys = new Set<string>()
    
    // 如果有持仓数据，构建现有的去重键集合
    if (settings.value.skipDuplicates) {
      dataStore.holdings.forEach(holding => {
        const fundHoldingInstance = new FundHoldingClass(convertStoreToModel(holding))
        existingKeys.add(fundHoldingInstance.createDeduplicationKey())
      })
    }
    
    for (let i = 0; i < rawData.value.length; i++) {
      const row = rawData.value[i]
      const lineNumber = i + 2
      
      // 跳过空行（如果设置了）
      if (settings.value.stripEmptyRows) {
        const isEmptyRow = row.every((cell: any) =>
          cell === null || cell === undefined || cell === '' || cell.toString().trim() === ''
        )
        if (isEmptyRow) {
          processedRows.value++
          continue
        }
      }
      
      // 构建数据对象
      const rowData: any = {}
      Object.keys(fieldMap).forEach(field => {
        const colIndex = fieldMap[field]
        if (colIndex !== undefined && row[colIndex] !== undefined) {
          rowData[field] = row[colIndex]
        }
      })
      
      processedRows.value = i + 1
      progressPercentage.value = ((i + 1) / rawData.value.length) * 100
      
      try {
        // 数据清洗和转换
        const cleanedData = cleanRowData(rowData)
        
        // 使用convertHoldingToFundHolding转换数据
        const fundHoldingData = dataStore.convertHoldingToFundHolding(cleanedData)
        
        // 转换为StoreFundHolding类型
        const fundHolding: StoreFundHolding = {
          ...fundHoldingData,
          pinnedTimestamp: fundHoldingData.pinnedTimestamp || undefined
        }
        
        // 验证数据
        const validationErrors = validateHolding(fundHolding, lineNumber)
        if (validationErrors.length > 0) {
          result.failed++
          failedRows.value++
          validationErrors.forEach(error => {
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
        if (settings.value.skipDuplicates) {
          const fundHoldingInstance = new FundHoldingClass(convertStoreToModel(fundHolding))
          const duplicateKey = fundHoldingInstance.createDeduplicationKey()
          if (existingKeys.has(duplicateKey)) {
            continue
          }
          existingKeys.add(duplicateKey)
        }
        
        // 保存到dataStore
        const savedHolding = dataStore.addHolding(fundHolding)
        
        result.success++
        successRows.value++
        result.successItems.push(savedHolding)
        
      } catch (error: any) {
        result.failed++
        failedRows.value++
        result.errors.push({
          line: lineNumber,
          field: '系统错误',
          message: `处理失败: ${error.message}`,
          value: ''
        })
      }
    }
    
    importResult.value = result
    
    // 记录日志
    if (result.success > 0) {
      dataStore.addLog(`CSV导入成功: ${result.success}条记录导入成功`, 'success')
    }
    if (result.failed > 0) {
      dataStore.addLog(`CSV导入有错误: ${result.failed}条记录导入失败`, 'warning')
    }
    
    if (result.success > 0) {
      showNotification(`导入完成！成功${result.success}条，失败${result.failed}条`, 'success')
    } else {
      showNotification('导入失败，请检查数据格式', 'error')
    }
    
  } catch (error) {
    console.error('导入失败:', error)
    showNotification(`导入失败: ${error}`, 'error')
    dataStore.addLog(`CSV导入失败: ${error}`, 'error')
  } finally {
    isImporting.value = false
    progressPercentage.value = 100
  }
}

// 转换StoreFundHolding为FundHoldingClass所需的格式
const convertStoreToModel = (storeHolding: StoreFundHolding): any => {
  return {
    clientName: storeHolding.clientName,
    clientID: storeHolding.clientID,
    fundCode: storeHolding.fundCode,
    fundName: storeHolding.fundName,
    purchaseAmount: storeHolding.purchaseAmount,
    purchaseShares: storeHolding.purchaseShares,
    purchaseDate: storeHolding.purchaseDate,
    remarks: storeHolding.remarks,
    currentNav: storeHolding.currentNav,
    navDate: storeHolding.navDate,
    isPinned: storeHolding.isPinned,
    pinnedTimestamp: storeHolding.pinnedTimestamp || null,
    isValid: storeHolding.isValid
  }
}

// 工具函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  if (!date || isNaN(date.getTime())) return '无效日期'
  return date.toISOString().split('T')[0]
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  // 简化通知，直接使用alert
  if (type === 'error') {
    alert(`错误: ${message}`)
  } else if (type === 'warning') {
    alert(`警告: ${message}`)
  } else if (type === 'success') {
    alert(`成功: ${message}`)
  } else {
    alert(message)
  }
}

const goBack = () => {
  router.push('/holdings/manage')
}

const goToHoldings = () => {
  router.push('/holdings')
}

const importAnother = () => {
  clearSelection()
  importResult.value = null
}
</script>

<style scoped>
.import-holding-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #c3cfe2;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #667eea;
  background: #f8fafc;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.upload-title {
  color: #333;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.upload-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.upload-hint {
  color: #999;
  font-size: 0.8rem;
}

.selected-file {
  margin-top: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
}

.file-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}

.file-details {
  flex: 1;
}

.file-details h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.file-details p {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.8rem;
}

.remove-file {
  background: #ef4444;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1rem;
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
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

.setting-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-hint {
  font-size: 0.8rem;
  color: #666;
  margin-left: 1.75rem;
}

.preview-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  border: 1px solid #e5e7eb;
}

.preview-table {
  overflow-x: auto;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.preview-table th {
  background: #f8fafc;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.preview-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
}

.preview-table tr:last-child td {
  border-bottom: none;
}

.action-section {
  margin-top: 1.5rem;
}

.import-button {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.import-button:hover:not(:disabled) {
  background: #5a67d8;
}

.import-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.import-button.importing {
  background: #4b5563;
}

.result-section {
  margin-top: 1.5rem;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.result-icon {
  font-size: 1.5rem;
}

.result-content h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.result-content p {
  margin: 0.25rem 0 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.result-item.success .result-content p {
  color: #10b981;
}

.result-item.failed .result-content p {
  color: #ef4444;
}

.errors-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.errors-title {
  color: #333;
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.8rem;
}

.error-line {
  font-weight: 600;
  color: #333;
  min-width: 50px;
}

.error-field {
  color: #ef4444;
  font-weight: 500;
  min-width: 70px;
}

.error-message {
  color: #666;
  flex: 1;
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-button.primary {
  background: #667eea;
  color: white;
}

.action-button.primary:hover {
  background: #5a67d8;
}

.action-button.secondary {
  background: #10b981;
  color: white;
}

.action-button.secondary:hover {
  background: #059669;
}

/* 深色模式适配 */
:root.dark .import-holding-view {
  background: #1a1a2e;
}

:root.dark .upload-area,
:root.dark .file-info,
:root.dark .settings-grid,
:root.dark .preview-section,
:root.dark .result-item,
:root.dark .errors-section {
  background: #2d3748;
  border-color: #4a5568;
}

:root.dark .upload-title,
:root.dark .section-title {
  color: #e5e7eb;
}

:root.dark .upload-subtitle {
  color: #cbd5e1;
}

:root.dark .upload-hint {
  color: #a0aec0;
}

:root.dark .file-details h4 {
  color: #f1f5f9;
}

:root.dark .file-details p {
  color: #cbd5e1;
}

:root.dark .setting-label {
  color: #f1f5f9;
}

:root.dark .setting-hint {
  color: #cbd5e1;
}

:root.dark .preview-table th {
  background: #374151;
  color: #f1f5f9;
  border-color: #4b5563;
}

:root.dark .preview-table td {
  color: #cbd5e1;
  border-color: #4b5563;
}

:root.dark .result-content h3,
:root.dark .errors-title,
:root.dark .error-line {
  color: #f1f5f9;
}

:root.dark .error-item {
  background: #374151;
}

:root.dark .error-message {
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .container {
    padding: 0.75rem;
  }
  
  .upload-area {
    padding: 1.5rem;
  }
  
  .result-summary {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .preview-table {
    font-size: 0.7rem;
  }
  
  .preview-table th,
  .preview-table td {
    padding: 0.375rem;
  }
}
</style>
