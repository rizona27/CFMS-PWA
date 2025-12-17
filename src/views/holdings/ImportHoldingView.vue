<template>
  <div class="import-holding-view">
    <NavBar title="导入持仓数据" show-back @back="goBack" />
    
    <div class="container">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">上传文件</div>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">配置映射</div>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ 'active': currentStep === 3, 'completed': currentStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-label">预览导入</div>
        </div>
      </div>

      <!-- 步骤1: 上传文件 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="upload-section">
          <h2>上传持仓数据文件</h2>
          <p class="section-description">
            请上传包含持仓数据的CSV或Excel文件。系统会自动检测数据格式。
          </p>
          
          <div class="upload-zone" @click="triggerFileInput">
            <div class="upload-icon">📁</div>
            <h3>拖放文件到此处</h3>
            <p>或点击选择文件</p>
            <p class="file-format">支持 .csv, .xlsx, .xls 格式</p>
            <input
              type="file"
              ref="fileInput"
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
              style="display: none"
            />
          </div>
          
          <div v-if="selectedFile" class="file-selected">
            <div class="file-card">
              <div class="file-icon">📄</div>
              <div class="file-info">
                <h4>{{ selectedFile.name }}</h4>
                <p>{{ formatFileSize(selectedFile.size) }} · {{ getFileExtension(selectedFile) }}</p>
                <p v-if="fileFormatDetected" class="file-detected">
                  检测到格式: <strong>{{ fileFormatDetected }}</strong>
                </p>
              </div>
              <button class="remove-btn" @click="clearSelection">✕</button>
            </div>
          </div>
          
          <div class="step-actions">
            <button
              class="next-btn"
              @click="nextStep"
              :disabled="!selectedFile || !fileProcessed"
            >
              下一步：配置映射 →
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤2: 配置列映射 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="mapping-section">
          <!-- 文件原始数据预览 -->
          <div class="original-preview">
            <h3>原始数据预览（前5行）</h3>
            <div class="preview-container">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th v-for="(header, index) in rawHeaders" :key="index" class="col-header">
                      <div class="header-content">
                        <span class="col-title">{{ header || `列${index + 1}` }}</span>
                        <span class="col-index">列{{ index + 1 }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in rawData.slice(0, 5)" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="cell-data">
                      {{ cell || '(空)' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 字段映射配置 -->
          <div class="field-mapping">
            <h3>字段映射配置</h3>
            <div class="mapping-table">
              <div class="mapping-header">
                <div class="mapping-col field-col">字段名称</div>
                <div class="mapping-col map-col">映射到列</div>
                <div class="mapping-col sample-col">示例数据</div>
                <div class="mapping-col status-col">状态</div>
              </div>
              
              <!-- 必填字段 -->
              <div v-for="field in requiredFieldConfigs" :key="field.id" class="mapping-row">
                <div class="mapping-col field-col">
                  <div class="field-name">
                    {{ field.label }}
                    <span class="required-badge">*</span>
                  </div>
                  <div class="field-description">{{ field.description }}</div>
                </div>
                
                <div class="mapping-col map-col">
                  <select
                    v-model="field.columnIndex"
                    @change="onFieldMappingChange(field)"
                    class="column-select"
                  >
                    <option value="-1">-- 请选择 --</option>
                    <option
                      v-for="(header, index) in rawHeaders"
                      :key="index"
                      :value="index"
                    >
                      {{ header || `列${index + 1}` }}
                    </option>
                  </select>
                </div>
                
                <div class="mapping-col sample-col">
                  <div class="sample-data">
                    {{ getSampleData(field.columnIndex) || '(无数据)' }}
                  </div>
                </div>
                
                <div class="mapping-col status-col">
                  <span v-if="field.columnIndex !== -1 && field.columnIndex !== null" class="status-mapped">
                    ✓ 已映射
                  </span>
                  <span v-else class="status-required">
                    ⚠ 必填
                  </span>
                </div>
              </div>
              
              <!-- 可选字段分隔线 -->
              <div class="optional-fields-separator">
                <span>可选字段</span>
              </div>
              
              <!-- 可选字段 -->
              <div v-for="field in optionalFieldConfigs" :key="field.id" class="mapping-row">
                <div class="mapping-col field-col">
                  <div class="field-name">
                    {{ field.label }}
                  </div>
                  <div class="field-description">{{ field.description }}</div>
                </div>
                
                <div class="mapping-col map-col">
                  <select
                    v-model="field.columnIndex"
                    @change="onFieldMappingChange(field)"
                    class="column-select"
                  >
                    <option value="-1">-- 请选择 --</option>
                    <option
                      v-for="(header, index) in rawHeaders"
                      :key="index"
                      :value="index"
                    >
                      {{ header || `列${index + 1}` }}
                    </option>
                  </select>
                </div>
                
                <div class="mapping-col sample-col">
                  <div class="sample-data">
                    {{ getSampleData(field.columnIndex) || '(无数据)' }}
                  </div>
                </div>
                
                <div class="mapping-col status-col">
                  <span v-if="field.columnIndex !== -1 && field.columnIndex !== null" class="status-mapped">
                    ✓ 已映射
                  </span>
                  <span v-else class="status-optional">
                    ○ 可选
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 智能推荐 -->
          <div v-if="hasUnmappedRequiredFields" class="auto-suggestion">
            <h3>智能推荐</h3>
            <p>系统检测到以下可能的映射关系：</p>
            <div class="suggestions">
              <button
                v-for="suggestion in autoSuggestions"
                :key="suggestion.fieldId"
                @click="applySuggestion(suggestion)"
                class="suggestion-btn"
              >
                {{ suggestion.message }}
              </button>
            </div>
          </div>
          
          <div class="step-actions">
            <button class="prev-btn" @click="prevStep">
              ← 上一步
            </button>
            <button
              class="next-btn"
              @click="nextStep"
              :disabled="!allRequiredFieldsMapped"
            >
              下一步：预览导入 →
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤3: 预览和导入 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="preview-section">
          <!-- 转换后数据预览 -->
          <div class="converted-preview">
            <h3>转换后数据预览（前5条）</h3>
            <div class="preview-container">
              <table class="preview-table">
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
                  <tr v-for="(item, index) in previewData.slice(0, 5)" :key="index">
                    <td>{{ item.clientName }}</td>
                    <td>{{ item.clientID }}</td>
                    <td>{{ item.fundCode }}</td>
                    <td class="numeric">{{ formatNumber(item.purchaseAmount, 2) }}</td>
                    <td class="numeric">{{ formatNumber(item.purchaseShares, 2) }}</td>
                    <td>{{ formatDate(item.purchaseDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 导入统计 - 精简版 -->
          <div class="import-stats-compact">
            <div class="stat-compact">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ rawData.length }}</div>
                <div class="stat-label">总数据行数</div>
              </div>
            </div>
            
            <div class="stat-divider"></div>
            
            <div class="stat-compact">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ validRowsCount }}</div>
                <div class="stat-label">有效数据行</div>
              </div>
            </div>
          </div>
          
          <!-- 导入日志 -->
          <div v-if="importLogs.length > 0" class="import-logs">
            <h3>导入日志</h3>
            <div class="logs-container">
              <div v-for="(log, index) in importLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-separator">-</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
          
          <div class="step-actions">
            <button class="prev-btn" @click="prevStep">
              ← 上一步
            </button>
            <button
              class="import-btn"
              @click="startImport"
              :disabled="isImporting || !allRequiredFieldsMapped"
            >
              <span v-if="!isImporting">🚀 开始导入</span>
              <span v-else>
                <span class="spinner"></span>
                导入中... {{ progressPercentage }}%
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 导入结果 - 精简版 -->
      <div v-if="importResult" class="result-section-compact">
        <div class="result-header-compact">
          <h2>导入完成</h2>
          <div class="result-summary-compact">
            {{ importResult.success }} 条成功 · {{ importResult.failed }} 条失败 · {{ importResult.skipped }} 条跳过
          </div>
        </div>
        
        <div class="result-cards-compact">
          <div class="result-card-compact success">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <div class="card-value">{{ importResult.success }}</div>
              <div class="card-label">成功</div>
            </div>
          </div>
          
          <div class="result-card-compact failed">
            <div class="card-icon">❌</div>
            <div class="card-content">
              <div class="card-value">{{ importResult.failed }}</div>
              <div class="card-label">失败</div>
            </div>
          </div>
          
          <div class="result-card-compact skipped">
            <div class="card-icon">⚠️</div>
            <div class="card-content">
              <div class="card-value">{{ importResult.skipped }}</div>
              <div class="card-label">跳过</div>
            </div>
          </div>
        </div>
        
        <!-- 错误详情 -->
        <div v-if="importResult.errors.length > 0" class="errors-section">
          <h3>错误详情</h3>
          <div class="errors-list">
            <div v-for="(error, index) in importResult.errors.slice(0, 10)" :key="index" class="error-item">
              <span class="error-line">第{{ error.line }}行</span>
              <span class="error-separator">·</span>
              <span class="error-field">{{ error.field }}</span>
              <span class="error-separator">·</span>
              <span class="error-message">{{ error.message }}</span>
            </div>
            <div v-if="importResult.errors.length > 10" class="error-more">
              还有 {{ importResult.errors.length - 10 }} 条错误未显示...
            </div>
          </div>
        </div>
        
        <!-- 导入日志 -->
        <div v-if="importLogs.length > 0" class="import-logs">
          <h3>导入执行日志</h3>
          <div class="logs-container">
            <div v-for="(log, index) in importLogs" :key="index" class="log-item">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-separator">-</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
        
        <div class="result-actions-compact">
          <button class="action-btn primary" @click="goToHoldings">
            📋 查看持仓
          </button>
          <button class="action-btn secondary" @click="importAnother">
            🔄 继续导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import { useDataStore, type FundHolding as StoreFundHolding } from '@/stores/dataStore'
import { FundHolding as FundHoldingClass } from '@/models/FundModels'
import * as XLSX from 'xlsx'

const router = useRouter()
const dataStore = useDataStore()

const currentStep = ref(1)

const selectedFile = ref<File | null>(null)
const fileProcessed = ref(false)
const isImporting = ref(false)
const progressPercentage = ref(0)
const fileFormatDetected = ref<string>('')

const rawHeaders = ref<string[]>([])
const rawData = ref<any[][]>([])
const previewData = ref<StoreFundHolding[]>([])
const importResult = ref<any>(null)
const importLogs = ref<Array<{time: string, message: string}>>([])

interface FieldConfig {
  id: string
  label: string
  required: boolean
  description: string
  columnIndex: number | null
}

// 重新组织字段配置，将客户姓名改为可选字段，去掉基金名称
const fieldConfigs = ref<FieldConfig[]>([
  {
    id: 'clientID',
    label: '客户号',
    required: true,
    description: '客户编号或身份证号',
    columnIndex: null
  },
  {
    id: 'fundCode',
    label: '基金代码',
    required: true,
    description: '6位基金代码',
    columnIndex: null
  },
  {
    id: 'purchaseAmount',
    label: '购买金额',
    required: true,
    description: '购买总金额（元）',
    columnIndex: null
  },
  {
    id: 'purchaseShares',
    label: '购买份额',
    required: true,
    description: '购买的基金份额',
    columnIndex: null
  },
  {
    id: 'purchaseDate',
    label: '购买日期',
    required: true,
    description: '购买交易日期',
    columnIndex: null
  },
  {
    id: 'clientName',
    label: '客户姓名',
    required: false,
    description: '客户的姓名或名称',
    columnIndex: null
  },
  {
    id: 'remarks',
    label: '备注',
    required: false,
    description: '额外说明信息',
    columnIndex: null
  }
])

// 计算属性：必填字段
const requiredFieldConfigs = computed(() => {
  return fieldConfigs.value.filter(field => field.required)
})

// 计算属性：可选字段
const optionalFieldConfigs = computed(() => {
  return fieldConfigs.value.filter(field => !field.required)
})

const allRequiredFieldsMapped = computed(() => {
  return fieldConfigs.value
    .filter(field => field.required)
    .every(field => field.columnIndex !== null && field.columnIndex >= 0)
})

const hasUnmappedRequiredFields = computed(() => {
  return fieldConfigs.value
    .filter(field => field.required)
    .some(field => field.columnIndex === null || field.columnIndex < 0)
})

const validRowsCount = computed(() => {
  return previewData.value.length
})

interface AutoSuggestion {
  fieldId: string
  columnIndex: number
  message: string
}

const autoSuggestions = computed(() => {
  const suggestions: AutoSuggestion[] = []
  
  const unmappedRequiredFields = fieldConfigs.value.filter(
    field => field.required && (field.columnIndex === null || field.columnIndex < 0)
  )
  
  for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
    const columnName = rawHeaders.value[colIndex].toLowerCase()
    const sampleData = getSampleData(colIndex)
    
    for (const field of unmappedRequiredFields) {
      const fieldName = field.label.toLowerCase()
      const fieldId = field.id
      
      // 客户号映射逻辑
      if (fieldId === 'clientID' && (
        columnName.includes('客户号') ||
        columnName.includes('核心客户号') ||
        columnName.includes('编号') ||
        columnName.includes('id') ||
        columnName.includes('证件号') ||
        columnName.includes('客户编号')
      )) {
        suggestions.push({
          fieldId: fieldId,
          columnIndex: colIndex,
          message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
        })
        break
      }
      
      // 基金代码映射逻辑
      if (fieldId === 'fundCode' && (
        columnName.includes('代码') ||
        columnName.includes('fund') ||
        columnName.includes('基金代码') ||
        columnName.includes('产品代码') ||
        columnName.includes('代码')
      )) {
        suggestions.push({
          fieldId: fieldId,
          columnIndex: colIndex,
          message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
        })
        break
      }
      
      // 购买金额映射逻辑
      if (fieldId === 'purchaseAmount' && (
        columnName.includes('金额') ||
        columnName.includes('成本') ||
        columnName.includes('amount') ||
        columnName.includes('price') ||
        columnName.includes('持仓成本') ||
        columnName.includes('购买金额')
      )) {
        suggestions.push({
          fieldId: fieldId,
          columnIndex: colIndex,
          message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
        })
        break
      }
      
      // 购买份额映射逻辑
      if (fieldId === 'purchaseShares' && (
        columnName.includes('份额') ||
        columnName.includes('shares') ||
        columnName.includes('quantity') ||
        columnName.includes('当前份额')
      )) {
        suggestions.push({
          fieldId: fieldId,
          columnIndex: colIndex,
          message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
        })
        break
      }
      
      // 购买日期映射逻辑 - 优先映射最早购买日期
      if (fieldId === 'purchaseDate') {
        if (columnName.includes('最早购买日期')) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
          })
          break
        }
        if (columnName.includes('购买日期') || columnName.includes('date') || columnName.includes('时间')) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
          })
          break
        }
      }
      
      // 智能检测数据格式
      if (sampleData && sampleData !== '(无数据)') {
        // 基金代码格式检测
        if (fieldId === 'fundCode' && /^\d{6}$/.test(sampleData.replace(/\s/g, ''))) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `检测到基金代码格式: "${sampleData}"`
          })
          break
        }
        
        // 金额格式检测
        if (fieldId === 'purchaseAmount' && /^[0-9,]+(\.[0-9]{1,2})?$/.test(sampleData.replace(/[^\d.,]/g, ''))) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `检测到金额数据: "${sampleData}"`
          })
          break
        }
        
        // 份额格式检测
        if (fieldId === 'purchaseShares' && /^[0-9]+(\.[0-9]{1,4})?$/.test(sampleData.replace(/[^\d.]/g, ''))) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `检测到份额数据: "${sampleData}"`
          })
          break
        }
        
        // 日期格式检测
        if (fieldId === 'purchaseDate' && (
          /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(sampleData) ||
          /^\d{8}$/.test(sampleData.replace(/[^\d]/g, ''))
        )) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `检测到日期数据: "${sampleData}"`
          })
          break
        }
      }
    }
  }
  
  return suggestions.slice(0, 3)
})

// 添加日志函数
const addImportLog = (message: string) => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  importLogs.value.unshift({
    time: timeStr,
    message: message
  })
  
  // 只保留最近的50条日志
  if (importLogs.value.length > 50) {
    importLogs.value = importLogs.value.slice(0, 50)
  }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
    await processSelectedFile()
  }
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  fileInput?.click()
}

const clearSelection = () => {
  selectedFile.value = null
  fileProcessed.value = false
  rawHeaders.value = []
  rawData.value = []
  previewData.value = []
  importResult.value = null
  fileFormatDetected.value = ''
  importLogs.value = []
  fieldConfigs.value.forEach(field => field.columnIndex = null)
  
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}

const getFileExtension = (file: File): string => {
  return file.name.split('.').pop()?.toUpperCase() || '未知'
}

const detectFileFormat = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase()
  
  try {
    const buffer = await file.slice(0, 4).arrayBuffer()
    const view = new Uint8Array(buffer)
    
    if (view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04) {
      return 'excel'
    }
    
    if (view[0] === 0xD0 && view[1] === 0xCF && view[2] === 0x11 && view[3] === 0xE0) {
      return 'excel'
    }
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel'
    }
    
    if (fileName.endsWith('.csv')) {
      return 'csv'
    }
    
    return 'unknown'
  } catch (error) {
    console.error('检测文件格式失败:', error)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel'
    }
    return 'csv'
  }
}

const processSelectedFile = async () => {
  if (!selectedFile.value) return
  
  try {
    const file = selectedFile.value
    
    const actualFormat = await detectFileFormat(file)
    fileFormatDetected.value = actualFormat === 'excel' ? 'Excel格式' : 'CSV格式'
    
    if (actualFormat === 'excel') {
      await processExcelFile(file)
    } else if (actualFormat === 'csv') {
      await processCSVFile(file)
    } else {
      throw new Error('不支持的文件格式')
    }
    
    fileProcessed.value = true
    autoDetectFieldMappings()
    
    addImportLog(`文件加载完成: ${file.name}, 共${rawData.value.length}行数据`)
    
  } catch (error) {
    console.error('文件处理失败:', error)
    showNotification(`文件处理失败: ${error}`, 'error')
    addImportLog(`文件处理失败: ${error}`)
  }
}

const processCSVFile = async (file: File) => {
  try {
    const text = await file.text()
    
    let decodedText = text
    const encodings = ['utf-8', 'gbk', 'gb2312', 'gb18030', 'utf-8-sig', 'latin1']
    
    if (/[\uFFFD\uFFFE\uFFFF]/.test(text) || text.includes('�')) {
      for (const encoding of encodings) {
        try {
          const decoder = new TextDecoder(encoding)
          const buffer = await file.arrayBuffer()
          decodedText = decoder.decode(buffer)
          if (!/[\uFFFD\uFFFE\uFFFF]/.test(decodedText) && !decodedText.includes('�')) {
            break
          }
        } catch (e) {
          continue
        }
      }
    }
    
    const lines = decodedText.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
    
    if (lines.length === 0) {
      throw new Error('文件为空')
    }
    
    const delimiter = detectDelimiter(lines[0])
    
    rawHeaders.value = parseCSVLine(lines[0], delimiter)
    rawData.value = lines.slice(1).map(line => parseCSVLine(line, delimiter))
    
    rawData.value = rawData.value.filter(row =>
      row.some(cell => cell && cell.toString().trim() !== '')
    )
    
  } catch (error) {
    throw new Error(`处理CSV文件失败: ${error}`)
  }
}

const processExcelFile = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: false
    })
    
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // 修改：使用默认值，不跳过空行
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false // 修改：不跳过空行
    })
    
    if (jsonData.length === 0) {
      throw new Error('工作表为空')
    }
    
    addImportLog(`Excel文件读取完成，原始数据行数: ${jsonData.length}`)
    
    // 修改：增强的头部检测逻辑
    let headerRowIndex = 0
    let maxColumns = 0
    let maxHeaderScore = 0
    
    // 尝试前5行作为可能的头部
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i] as any[]
      if (!Array.isArray(row)) continue
      
      let nonEmptyCells = 0
      let headerScore = 0
      
      // 计算头部分数：包含特定关键字的列越多，越可能是头部
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').trim()
        if (cell) {
          nonEmptyCells++
          
          // 检查是否包含典型的头部关键字
          const lowerCell = cell.toLowerCase()
          if (lowerCell.includes('客户') || lowerCell.includes('基金') ||
              lowerCell.includes('金额') || lowerCell.includes('份额') ||
              lowerCell.includes('日期') || lowerCell.includes('代码')) {
            headerScore += 3
          } else if (lowerCell.includes('号') || lowerCell.includes('id') ||
                     lowerCell.includes('name') || lowerCell.includes('date')) {
            headerScore += 2
          } else if (cell.length > 0) {
            headerScore += 1
          }
        }
      }
      
      // 如果这行看起来更像是头部（有更高的分数）
      if (nonEmptyCells > maxColumns || (nonEmptyCells === maxColumns && headerScore > maxHeaderScore)) {
        maxColumns = nonEmptyCells
        maxHeaderScore = headerScore
        headerRowIndex = i
      }
    }
    
    addImportLog(`检测到头部行: 第${headerRowIndex + 1}行，最大列数: ${maxColumns}，头部分数: ${maxHeaderScore}`)
    
    const headerRow = jsonData[headerRowIndex] as any[]
    rawHeaders.value = headerRow.map((cell, index) => {
      if (cell === null || cell === undefined) {
        return `列${index + 1}`
      }
      const value = String(cell).trim()
      return value || `列${index + 1}`
    })
    
    addImportLog(`原始头部: ${rawHeaders.value.join(' | ')}`)
    
    // 提取数据行（从头部行之后开始）
    rawData.value = []
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      if (!Array.isArray(row)) continue
      
      const dataRow = rawHeaders.value.map((_, colIndex) => {
        const cell = row[colIndex]
        
        if (cell === null || cell === undefined) {
          return ''
        }
        
        if (cell instanceof Date) {
          return cell.toISOString().split('T')[0]
        }
        
        if (typeof cell === 'object' && cell.t && cell.v) {
          if (cell.t === 'd') {
            return new Date(cell.v).toISOString().split('T')[0]
          }
          return cell.v
        }
        
        if (typeof cell === 'number') {
          // 保留足够的精度
          return cell.toFixed(4)
        }
        
        return String(cell).trim()
      })
      
      // 检查这一行是否有实际数据
      const hasData = dataRow.some(cell => {
        if (typeof cell === 'string') {
          return cell.trim() !== ''
        }
        return cell !== null && cell !== undefined && cell !== ''
      })
      
      if (hasData) {
        rawData.value.push(dataRow)
      }
    }
    
    addImportLog(`处理后数据行数: ${rawData.value.length}`)
    if (rawData.value.length > 0) {
      addImportLog(`第一行数据示例: ${JSON.stringify(rawData.value[0].slice(0, 10))}`)
    }
    
  } catch (error) {
    throw new Error(`处理Excel文件失败: ${error}`)
  }
}

const detectDelimiter = (line: string): string => {
  const delimiters = [',', '\t', ';', '|']
  let bestDelimiter = ','
  let maxColumns = 0
  
  for (const delim of delimiters) {
    const columns = parseCSVLine(line, delim).length
    if (columns > maxColumns && columns > 1) {
      maxColumns = columns
      bestDelimiter = delim
    }
  }
  
  return bestDelimiter
}

const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true
      quoteChar = char
      continue
    }
    
    if (char === quoteChar && inQuotes) {
      if (nextChar === quoteChar) {
        current += char
        i++
      } else {
        inQuotes = false
      }
      continue
    }
    
    if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
      continue
    }
    
    current += char
  }
  
  result.push(current.trim())
  
  return result.map(col => {
    const trimmed = col.trim()
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1).trim()
    }
    return trimmed
  })
}

const autoDetectFieldMappings = () => {
  fieldConfigs.value.forEach(field => field.columnIndex = null)
  
  // 调试：打印所有列名
  addImportLog(`开始自动映射，共${rawHeaders.value.length}列`)
  rawHeaders.value.forEach((header, index) => {
    addImportLog(`列${index + 1}: "${header}"`)
  })
  
  // 第一轮：精确匹配
  for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
    const columnName = rawHeaders.value[colIndex].toLowerCase()
    
    for (const field of fieldConfigs.value) {
      if (field.columnIndex !== null && field.columnIndex >= 0) continue
      
      const fieldId = field.id
      
      // 客户号映射 - 优先精确匹配
      if (fieldId === 'clientID') {
        if (columnName === '客户号' || columnName === '核心客户号' || columnName === '客户编号' ||
            columnName === '客户代码' || columnName === '客户id') {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 客户号`)
          break
        }
      }
      
      // 基金代码映射 - 优先精确匹配
      if (fieldId === 'fundCode') {
        if (columnName === '基金代码' || columnName === '代码' || columnName === '基金编码' ||
            columnName === 'fund code' || columnName === 'fund_code') {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 基金代码`)
          break
        }
      }
      
      // 购买金额映射 - 优先精确匹配
      if (fieldId === 'purchaseAmount') {
        if (columnName === '购买金额' || columnName === '持仓成本(元)' || columnName === '购买金额(元)' ||
            columnName === 'amount' || columnName === 'purchase amount') {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 购买金额`)
          break
        }
      }
      
      // 购买份额映射 - 优先精确匹配
      if (fieldId === 'purchaseShares') {
        if (columnName === '购买份额' || columnName === '当前份额' || columnName === '持仓份额' ||
            columnName === 'shares' || columnName === 'purchase shares') {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 购买份额`)
          break
        }
      }
      
      // 购买日期映射 - 优先映射最早购买日期
      if (fieldId === 'purchaseDate') {
        if (columnName.includes('最早购买日期')) {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 购买日期（最早）`)
          break
        }
        if (columnName === '购买日期' || columnName === '交易日期' || columnName === 'date' ||
            columnName === 'purchase date') {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 购买日期`)
          break
        }
      }
      
      // 客户姓名映射 - 避免映射到综合客户经理
      if (fieldId === 'clientName') {
        if ((columnName === '客户姓名' || columnName === '姓名' || columnName === '客户名称') &&
            !columnName.includes('综合客户经理')) {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 客户姓名`)
          break
        }
      }
      
      // 备注映射
      if (fieldId === 'remarks' && columnName === '备注') {
        field.columnIndex = colIndex
        addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 备注`)
        break
      }
    }
  }
  
  // 第二轮：模糊匹配（对于还未映射的字段）
  for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
    const columnName = rawHeaders.value[colIndex].toLowerCase()
    
    for (const field of fieldConfigs.value) {
      if (field.columnIndex !== null && field.columnIndex >= 0) continue
      
      const fieldId = field.id
      
      // 客户号模糊匹配
      if (fieldId === 'clientID' && (
        columnName.includes('客户号') ||
        columnName.includes('编号') ||
        columnName.includes('id') ||
        columnName.includes('证件号') ||
        columnName.includes('账号') ||
        columnName.includes('号码')
      )) {
        field.columnIndex = colIndex
        addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 客户号`)
        break
      }
      
      // 基金代码模糊匹配
      if (fieldId === 'fundCode' && (
        columnName.includes('代码') ||
        columnName.includes('fund') ||
        columnName.includes('code') ||
        columnName.includes('产品') ||
        columnName.includes('基金')
      )) {
        field.columnIndex = colIndex
        addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 基金代码`)
        break
      }
      
      // 购买金额模糊匹配
      if (fieldId === 'purchaseAmount' && (
        columnName.includes('金额') ||
        columnName.includes('成本') ||
        columnName.includes('amount') ||
        columnName.includes('price') ||
        columnName.includes('价值') ||
        columnName.includes('总金额')
      )) {
        field.columnIndex = colIndex
        addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 购买金额`)
        break
      }
      
      // 购买份额模糊匹配
      if (fieldId === 'purchaseShares' && (
        columnName.includes('份额') ||
        columnName.includes('shares') ||
        columnName.includes('quantity') ||
        columnName.includes('数量') ||
        columnName.includes('单位')
      )) {
        field.columnIndex = colIndex
        addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 购买份额`)
        break
      }
      
      // 购买日期模糊匹配
      if (fieldId === 'purchaseDate' && (
        columnName.includes('日期') ||
        columnName.includes('date') ||
        columnName.includes('时间') ||
        columnName.includes('day') ||
        columnName.includes('购买时间')
      )) {
        // 如果还没有映射，或者当前列名包含"最早购买日期"且之前映射的不是"最早购买日期"
        if (field.columnIndex === null ||
            (columnName.includes('最早购买日期') && !rawHeaders.value[field.columnIndex].toLowerCase().includes('最早购买日期'))) {
          field.columnIndex = colIndex
          addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 购买日期`)
        }
        break
      }
      
      // 客户姓名模糊匹配 - 避免综合客户经理
      if (fieldId === 'clientName' && (
        columnName.includes('姓名') ||
        columnName.includes('名字') ||
        columnName.includes('客户') ||
        columnName.includes('name')
      )) {
        // 特别排除"综合客户经理"
        if (!columnName.includes('综合客户经理') && !columnName.includes('经理')) {
          field.columnIndex = colIndex
          addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 客户姓名`)
          break
        }
      }
      
      // 备注模糊匹配
      if (fieldId === 'remarks' && (
        columnName.includes('remark') ||
        columnName.includes('comment') ||
        columnName.includes('说明') ||
        columnName.includes('备注')
      )) {
        field.columnIndex = colIndex
        addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 备注`)
        break
      }
    }
  }
  
  // 第三轮：智能数据格式检测（如果还有未映射的必填字段）
  const unmappedRequiredFields = fieldConfigs.value.filter(
    field => field.required && (field.columnIndex === null || field.columnIndex < 0)
  )
  
  addImportLog(`第三轮智能映射: 还有 ${unmappedRequiredFields.length} 个必填字段未映射`)
  
  if (unmappedRequiredFields.length > 0 && rawData.value.length > 0) {
    // 检查多行样本数据以提高准确性
    const sampleRows = rawData.value.slice(0, Math.min(5, rawData.value.length))
    
    for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
      // 收集该列的多行样本数据
      const columnSamples = sampleRows.map(row => row[colIndex]?.toString() || '')
      
      for (const field of unmappedRequiredFields) {
        if (field.columnIndex !== null && field.columnIndex >= 0) continue
        
        const fieldId = field.id
        let matchScore = 0
        
        // 分析多行数据
        for (const sample of columnSamples) {
          if (!sample || sample.trim() === '') continue
          
          const cleanValue = sample.replace(/[^\d.]/g, '')
          
          // 基金代码格式检测（6位数字）
          if (fieldId === 'fundCode') {
            if (/^\d{6}$/.test(cleanValue)) {
              matchScore += 3
            } else if (/^\d+$/.test(cleanValue) && cleanValue.length >= 4 && cleanValue.length <= 8) {
              matchScore += 1
            }
          }
          
          // 金额格式检测
          if (fieldId === 'purchaseAmount') {
            // 检查是否可能是金额（有小数点，数值较大）
            if (/^\d+\.?\d*$/.test(cleanValue) && cleanValue !== '') {
              const numValue = parseFloat(cleanValue)
              if (numValue > 1000 && numValue < 1000000000) { // 合理金额范围
                matchScore += 3
              } else if (numValue > 0) {
                matchScore += 1
              }
            }
          }
          
          // 份额格式检测
          if (fieldId === 'purchaseShares') {
            if (/^\d+\.?\d*$/.test(cleanValue) && cleanValue !== '') {
              const numValue = parseFloat(cleanValue)
              if (numValue > 100 && numValue < 10000000) { // 合理份额范围
                matchScore += 3
              } else if (numValue > 0) {
                matchScore += 1
              }
            }
          }
          
          // 日期格式检测
          if (fieldId === 'purchaseDate') {
            if (
              /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(sample) ||
              /^\d{8}$/.test(sample.replace(/[^\d]/g, '')) ||
              /^\d{4}年\d{1,2}月\d{1,2}日$/.test(sample)
            ) {
              matchScore += 3
            } else if (sample.includes('-') || sample.includes('/')) {
              matchScore += 1
            }
          }
        }
        
        // 如果匹配分数足够高，使用这个映射
        if (matchScore >= sampleRows.length * 2) { // 至少每行2分
          field.columnIndex = colIndex
          addImportLog(`智能映射: 列${colIndex + 1} (${rawHeaders.value[colIndex]}) -> ${field.label} (分数: ${matchScore})`)
          break
        }
      }
    }
  }
  
  // 特殊处理：如果客户姓名未映射但客户号已映射，尝试用客户号列映射客户姓名
  const clientNameField = fieldConfigs.value.find(f => f.id === 'clientName')
  const clientIDField = fieldConfigs.value.find(f => f.id === 'clientID')
  
  if (clientNameField && clientNameField.columnIndex === null &&
      clientIDField && clientIDField.columnIndex !== null && clientIDField.columnIndex >= 0) {
    clientNameField.columnIndex = clientIDField.columnIndex
    addImportLog(`特殊处理: 客户姓名使用客户号列 (列${clientIDField.columnIndex + 1})`)
  }
  
  // 第四轮：如果还有未映射的必填字段，尝试根据数据特征自动分配
  const stillUnmapped = fieldConfigs.value.filter(
    field => field.required && (field.columnIndex === null || field.columnIndex < 0)
  )
  
  if (stillUnmapped.length > 0 && rawData.value.length > 0) {
    addImportLog(`第四轮兜底映射: 还有 ${stillUnmapped.length} 个必填字段未映射`)
    
    // 尝试为每个未映射字段分配一个未使用的列
    const usedColumns = fieldConfigs.value
      .filter(f => f.columnIndex !== null && f.columnIndex >= 0)
      .map(f => f.columnIndex)
    
    const availableColumns = rawHeaders.value
      .map((_, index) => index)
      .filter(index => !usedColumns.includes(index))
    
    let columnIndex = 0
    for (const field of stillUnmapped) {
      if (columnIndex < availableColumns.length) {
        field.columnIndex = availableColumns[columnIndex]
        addImportLog(`兜底映射: ${field.label} -> 列${availableColumns[columnIndex] + 1}`)
        columnIndex++
      }
    }
  }
  
  // 记录映射结果
  const mappedFields = fieldConfigs.value.filter(f => f.columnIndex !== null && f.columnIndex >= 0).length
  const totalFields = fieldConfigs.value.length
  
  // 输出最终的映射关系
  const mappingResult: Record<string, number> = {}
  fieldConfigs.value.forEach(field => {
    if (field.columnIndex !== null && field.columnIndex >= 0) {
      mappingResult[field.id] = field.columnIndex
    }
  })
  
  addImportLog(`自动映射完成: ${mappedFields}/${totalFields} 个字段已映射`)
  addImportLog(`最终映射关系: ${JSON.stringify(mappingResult)}`)
  
  generatePreviewData()
}

const getSampleData = (columnIndex: number | null): string => {
  if (columnIndex === null || columnIndex < 0 || rawData.value.length === 0) {
    return ''
  }
  
  // 尝试获取前3行的样本数据
  const samples = []
  for (let i = 0; i < Math.min(3, rawData.value.length); i++) {
    const sample = rawData.value[i]?.[columnIndex]
    if (sample !== undefined && sample !== null && sample !== '') {
      samples.push(sample.toString())
    }
  }
  
  if (samples.length === 0) {
    return '(无数据)'
  }
  
  // 如果有多个样本，显示前2个
  return samples.length > 1 ? `${samples[0]}...` : samples[0]
}

const onFieldMappingChange = (field: FieldConfig) => {
  addImportLog(`字段映射更改: ${field.label} -> 列${field.columnIndex !== null ? field.columnIndex + 1 : '未选择'}`)
  generatePreviewData()
}

const applySuggestion = (suggestion: AutoSuggestion) => {
  const field = fieldConfigs.value.find(f => f.id === suggestion.fieldId)
  if (field) {
    field.columnIndex = suggestion.columnIndex
    addImportLog(`应用智能建议: ${suggestion.message}`)
    generatePreviewData()
  }
}

const generatePreviewData = () => {
  previewData.value = []
  
  if (!allRequiredFieldsMapped.value || rawData.value.length === 0) {
    addImportLog('无法生成预览：必要字段未完全映射或没有数据')
    return
  }
  
  const previewRows = Math.min(10, rawData.value.length)
  
  for (let i = 0; i < previewRows; i++) {
    const row = rawData.value[i]
    
    try {
      const rowData: any = {}
      
      fieldConfigs.value.forEach(field => {
        if (field.columnIndex !== null && field.columnIndex >= 0 && row) {
          const value = row[field.columnIndex]
          rowData[field.id] = value !== undefined ? value : ''
        }
      })
      
      const cleanedData = cleanAndTransformRowData(rowData)
      const fundHoldingData = dataStore.convertHoldingToFundHolding(cleanedData)
      const storeHolding: StoreFundHolding = {
        ...fundHoldingData,
        pinnedTimestamp: fundHoldingData.pinnedTimestamp || undefined
      }
      
      previewData.value.push(storeHolding)
    } catch (error) {
      console.error(`第${i + 1}行数据转换失败:`, error)
      addImportLog(`第${i + 1}行数据转换失败: ${error}`)
    }
  }
  
  addImportLog(`数据预览生成: ${previewData.value.length} 条记录`)
  if (previewData.value.length > 0) {
    const sample = previewData.value[0]
    addImportLog(`示例记录: ${sample.clientName} | ${sample.fundCode} | ${sample.purchaseAmount} | ${sample.purchaseShares} | ${sample.purchaseDate}`)
  }
}

const cleanAndTransformRowData = (rowData: any): any => {
  const cleaned: any = {}
  
  addImportLog(`原始行数据: ${JSON.stringify(rowData)}`)
  
  // 客户号 - 确保是字符串并清理
  let clientID = String(rowData.clientID || '').trim()
  if (!clientID) {
    // 如果没有客户号，尝试从客户姓名中提取
    clientID = String(rowData.clientName || '').trim()
  }
  
  // 清理客户号：移除非数字字符，保留足够长度
  const cleanID = clientID.replace(/\D/g, '')
  cleaned.clientID = cleanID || '000000000000'
  
  // 客户姓名：如果没有客户姓名，使用客户号
  cleaned.clientName = String(rowData.clientName || '').trim()
  if (!cleaned.clientName || cleaned.clientName === '未知客户') {
    if (cleaned.clientID && cleaned.clientID !== '000000000000') {
      cleaned.clientName = `客户${cleaned.clientID.slice(-6)}`
    } else {
      cleaned.clientName = '未知客户'
    }
  }
  
  // 基金代码 - 确保6位
  let fundCode = String(rowData.fundCode || '').trim()
  fundCode = fundCode.replace(/\D/g, '') // 只保留数字
  
  if (fundCode.length === 0) {
    fundCode = '000000'
  } else if (fundCode.length > 6) {
    fundCode = fundCode.slice(0, 6)
  } else if (fundCode.length < 6) {
    fundCode = fundCode.padStart(6, '0')
  }
  
  cleaned.fundCode = fundCode
  
  // 基金名称：如果没有提供，使用默认名称
  cleaned.fundName = `基金${cleaned.fundCode}`
  
  // 购买金额 - 处理各种格式
  let amount = rowData.purchaseAmount
  if (typeof amount === 'string') {
    // 移除千位分隔符和货币符号
    amount = amount.replace(/[^\d.-]/g, '')
  }
  let parsedAmount = Math.abs(parseFloat(amount) || 0)
  cleaned.purchaseAmount = parseFloat(parsedAmount.toFixed(2))
  
  // 购买份额 - 处理各种格式
  let shares = rowData.purchaseShares
  if (typeof shares === 'string') {
    shares = shares.replace(/[^\d.-]/g, '')
  }
  let parsedShares = Math.abs(parseFloat(shares) || 0)
  cleaned.purchaseShares = parseFloat(parsedShares.toFixed(4)) // 份额可以保留更多小数位
  
  // 购买日期 - 尝试多种格式
  cleaned.purchaseDate = parseDateValue(rowData.purchaseDate) || new Date()
  
  // 净值计算：如果购买份额大于0，计算净值
  cleaned.currentNav = cleaned.purchaseShares > 0 ?
    parseFloat((cleaned.purchaseAmount / cleaned.purchaseShares).toFixed(4)) : 1
  
  cleaned.navDate = new Date()
  
  // 备注
  cleaned.remarks = String(rowData.remarks || '').trim()
  
  cleaned.isValid = true
  cleaned.isPinned = false
  
  // 添加唯一ID - 使用更简单的方式
  cleaned.id = crypto.randomUUID()
  
  addImportLog(`清洗后数据: ${cleaned.clientID} | ${cleaned.fundCode} | ${cleaned.purchaseAmount} | ${cleaned.purchaseShares} | ${cleaned.purchaseDate}`)
  
  return cleaned
}

// 生成唯一ID的函数（备用）
const generateUniqueId = (holding: any): string => {
  const dateStr = holding.purchaseDate.toISOString().split('T')[0]
  const amountStr = Math.round(holding.purchaseAmount * 100) // 精确到分
  const sharesStr = Math.round(holding.purchaseShares * 10000) // 精确到万分
  
  return `${holding.clientID}-${holding.fundCode}-${amountStr}-${sharesStr}-${dateStr}`
}

const parseDateValue = (value: any): Date | null => {
  if (!value) return null
  
  const str = String(value).trim()
  
  addImportLog(`解析日期: "${str}"`)
  
  // 尝试直接解析
  const date = new Date(str)
  if (!isNaN(date.getTime())) {
    addImportLog(`直接解析成功: ${date.toISOString()}`)
    return date
  }
  
  // 尝试常见日期格式
  const patterns = [
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/, // 2023-01-15, 2023/01/15
    /^(\d{4})(\d{2})(\d{2})$/, // 20230115
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/, // 15-01-2023, 15/01/2023
    /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, // 2023年1月15日
    /^(\d{1,2})月(\d{1,2})日(\d{4})年$/, // 1月15日2023年
  ]
  
  for (const pattern of patterns) {
    const match = str.match(pattern)
    if (match) {
      let year, month, day
      
      if (match[1].length === 4) {
        year = parseInt(match[1])
        month = parseInt(match[2]) - 1
        day = parseInt(match[3])
      } else {
        day = parseInt(match[1])
        month = parseInt(match[2]) - 1
        year = parseInt(match[3])
      }
      
      if (year < 100) {
        year = year + 2000
      }
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        addImportLog(`模式匹配成功: ${pattern} -> ${date.toISOString()}`)
        return date
      }
    }
  }
  
  // 尝试Excel日期格式（Excel的日期是从1899-12-30开始的序列号）
  const excelDateNum = parseFloat(str)
  if (!isNaN(excelDateNum) && excelDateNum > 0) {
    // Excel日期：1900年1月0日 = 0，但Excel错误地认为1900年是闰年
    const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
    const date = new Date(excelEpoch.getTime() + excelDateNum * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      addImportLog(`Excel日期解析成功: ${excelDateNum} -> ${date.toISOString()}`)
      return date
    }
  }
  
  addImportLog(`日期解析失败: ${str}`)
  return null
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
    addImportLog(`进入步骤 ${currentStep.value}`)
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    addImportLog(`返回步骤 ${currentStep.value}`)
  }
}

const createDeduplicationKey = (holding: any): string => {
  const dateStr = holding.purchaseDate.toISOString().split('T')[0]
  const amount = Math.round(holding.purchaseAmount * 100) // 精确到分
  const shares = Math.round(holding.purchaseShares * 10000) // 精确到万分
  
  const key = `${holding.clientID}-${holding.fundCode}-${amount}-${shares}-${dateStr}`
  addImportLog(`生成去重键: ${key}`)
  return key
}

const startImport = async () => {
  if (!allRequiredFieldsMapped.value) {
    showNotification('请先配置所有必填字段', 'error')
    return
  }
  
  isImporting.value = true
  progressPercentage.value = 0
  importResult.value = null
  importLogs.value = [] // 清空之前的日志
  
  addImportLog('开始导入数据...')
  
  try {
    const result = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{line: number, field: string, message: string}>
    }
    
    const fieldMap: Record<string, number> = {}
    fieldConfigs.value.forEach(field => {
      if (field.columnIndex !== null && field.columnIndex >= 0) {
        fieldMap[field.id] = field.columnIndex
      }
    })
    
    addImportLog(`字段映射配置: ${JSON.stringify(fieldMap)}`)
    
    // 获取现有持仓的去重键
    const existingHoldingsKeys = new Set<string>()
    addImportLog(`检查现有持仓数据，共 ${dataStore.holdings.length} 条记录`)
    
    dataStore.holdings.forEach((holding, index) => {
      const key = createDeduplicationKey(holding)
      existingHoldingsKeys.add(key)
      if (index < 5) {
        addImportLog(`现有持仓 ${index + 1}: ${holding.clientName} - ${holding.fundCode} - ${holding.purchaseAmount} - 去重键: ${key}`)
      }
    })
    
    addImportLog(`现有持仓去重键数量: ${existingHoldingsKeys.size}`)
    
    const totalRows = rawData.value.length
    addImportLog(`开始处理 ${totalRows} 行数据`)
    
    // 一次性处理所有行
    const newHoldings: any[] = []
    const seenKeys = new Set<string>() // 用于本次导入内的去重
    
    for (let i = 0; i < totalRows; i++) {
      const row = rawData.value[i]
      const lineNumber = i + 2 // Excel行号（从1开始）+ 头部行（1行）= 行号+2
      
      // 更新进度
      progressPercentage.value = Math.floor(((i + 1) / totalRows) * 100)
      
      try {
        const rowData: any = {}
        Object.keys(fieldMap).forEach(fieldId => {
          const colIndex = fieldMap[fieldId]
          if (colIndex !== undefined && row && row[colIndex] !== undefined) {
            rowData[fieldId] = row[colIndex]
          } else {
            rowData[fieldId] = ''
          }
        })
        
        addImportLog(`处理第 ${lineNumber} 行: ${JSON.stringify(rowData)}`)
        
        const cleanedData = cleanAndTransformRowData(rowData)
        
        const validation = validateRowData(cleanedData, lineNumber)
        if (!validation.isValid) {
          result.failed++
          result.errors.push(...validation.errors)
          addImportLog(`第 ${lineNumber} 行验证失败: ${validation.errors.map(e => e.message).join(', ')}`)
          continue
        }
        
        const duplicateKey = createDeduplicationKey(cleanedData)
        
        // 检查是否已存在相同记录（包括本次导入内）
        if (existingHoldingsKeys.has(duplicateKey) || seenKeys.has(duplicateKey)) {
          result.skipped++
          result.errors.push({
            line: lineNumber,
            field: '重复记录',
            message: '已存在相同的持仓记录，已跳过'
          })
          addImportLog(`第 ${lineNumber} 行重复，已跳过`)
          continue
        }
        
        // 添加到去重集合中
        seenKeys.add(duplicateKey)
        
        // 暂时保存到数组中，稍后批量添加
        newHoldings.push(cleanedData)
        result.success++
        addImportLog(`第 ${lineNumber} 行准备导入`)
        
      } catch (error: any) {
        result.failed++
        result.errors.push({
          line: lineNumber,
          field: '系统错误',
          message: error.message || '未知错误'
        })
        addImportLog(`第 ${lineNumber} 行处理异常: ${error.message}`)
      }
    }
    
    // 批量添加持仓
    addImportLog(`开始批量添加 ${newHoldings.length} 条持仓记录`)
    
    // 保存导入前的持仓数量
    const holdingsBeforeImport = dataStore.holdings.length
    
    // 使用dataStore的批量添加方法
    const batchResult = dataStore.batchAddHoldings(newHoldings)
    
    addImportLog(`批量添加完成: ${batchResult.success} 成功, ${batchResult.failed} 失败`)
    addImportLog(`导入前持仓数量: ${holdingsBeforeImport}, 导入后持仓数量: ${dataStore.holdings.length}`)
    
    // 更新导入结果
    result.success = batchResult.success
    result.failed += batchResult.failed
    batchResult.errors.forEach((errorMsg, index) => {
      result.errors.push({
        line: index + 2, // 估算行号
        field: '批量添加',
        message: errorMsg
      })
    })
    
    importResult.value = result
    progressPercentage.value = 100
    
    addImportLog(`导入完成统计: 成功 ${result.success} 条，失败 ${result.failed} 条，跳过 ${result.skipped} 条`)
    
    if (result.success > 0) {
      showNotification(`成功导入 ${result.success} 条记录`, 'success')
    } else if (result.skipped > 0) {
      showNotification(`所有 ${result.skipped} 条记录均为重复数据，已跳过`, 'warning')
    } else {
      showNotification('导入失败，请检查数据格式', 'error')
    }
    
  } catch (error) {
    console.error('导入过程出错:', error)
    addImportLog(`导入过程异常: ${error}`)
    showNotification(`导入失败: ${error}`, 'error')
  } finally {
    isImporting.value = false
    addImportLog('导入过程结束')
  }
}

const validateRowData = (data: any, lineNumber: number) => {
  const errors: Array<{line: number, field: string, message: string}> = []
  
  // 客户号验证
  if (!data.clientID || data.clientID.trim() === '' || data.clientID === '000000000000') {
    errors.push({
      line: lineNumber,
      field: '客户号',
      message: '客户号不能为空或无效'
    })
  } else if (data.clientID.length < 6) {
    errors.push({
      line: lineNumber,
      field: '客户号',
      message: '客户号太短，至少需要6位'
    })
  }
  
  // 基金代码验证
  if (!data.fundCode || !/^\d{6}$/.test(data.fundCode)) {
    errors.push({
      line: lineNumber,
      field: '基金代码',
      message: '基金代码必须是6位数字'
    })
  } else if (data.fundCode === '000000') {
    errors.push({
      line: lineNumber,
      field: '基金代码',
      message: '基金代码不能全为0'
    })
  }
  
  // 购买金额验证
  if (data.purchaseAmount <= 0) {
    errors.push({
      line: lineNumber,
      field: '购买金额',
      message: `购买金额必须大于0，当前值: ${data.purchaseAmount.toFixed(2)}`
    })
  } else if (data.purchaseAmount > 1000000000) { // 10亿
    errors.push({
      line: lineNumber,
      field: '购买金额',
      message: `购买金额过大: ${data.purchaseAmount.toFixed(2)}`
    })
  } else if (isNaN(data.purchaseAmount)) {
    errors.push({
      line: lineNumber,
      field: '购买金额',
      message: '购买金额格式无效'
    })
  }
  
  // 购买份额验证
  if (data.purchaseShares <= 0) {
    errors.push({
      line: lineNumber,
      field: '购买份额',
      message: `购买份额必须大于0，当前值: ${data.purchaseShares.toFixed(4)}`
    })
  } else if (isNaN(data.purchaseShares)) {
    errors.push({
      line: lineNumber,
      field: '购买份额',
      message: '购买份额格式无效'
    })
  }
  
  // 购买日期验证
  if (!data.purchaseDate || isNaN(data.purchaseDate.getTime())) {
    errors.push({
      line: lineNumber,
      field: '购买日期',
      message: '购买日期格式无效'
    })
  } else {
    // 检查日期是否合理（不能是未来日期）
    const today = new Date()
    today.setHours(23, 59, 59, 999) // 今天的最后一刻
    if (data.purchaseDate > today) {
      errors.push({
        line: lineNumber,
        field: '购买日期',
        message: '购买日期不能是未来日期'
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals)
}

const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '无效日期'
  return date.toISOString().split('T')[0]
}

const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const icons = {
    'error': '❌',
    'success': '✅',
    'warning': '⚠️',
    'info': 'ℹ️'
  }
  alert(`${icons[type]} ${message}`)
}

const goBack = () => {
  router.push('/holdings/manage')
}

const goToHoldings = () => {
  router.push('/holdings')
}

const importAnother = () => {
  currentStep.value = 1
  selectedFile.value = null
  fileProcessed.value = false
  rawHeaders.value = []
  rawData.value = []
  previewData.value = []
  importResult.value = null
  fileFormatDetected.value = ''
  importLogs.value = []
  fieldConfigs.value.forEach(field => field.columnIndex = null)
  
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}
</script>

<style scoped>
/* 原有的样式保持不变，只添加导入日志的样式 */

.import-logs {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #e5e7eb;
}

.import-logs h3 {
  color: #374151;
  font-size: 16px;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.log-item {
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

.log-time {
  color: #3b82f6;
  font-weight: 500;
  min-width: 70px;
}

.log-separator {
  color: #9ca3af;
}

.log-message {
  color: #4b5563;
  flex: 1;
  word-break: break-all;
}

/* 原有的其他样式保持不变 */
.import-holding-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.step.active .step-number {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.step.active .step-label {
  color: #3b82f6;
  font-weight: 600;
}

.step.completed .step-label {
  color: #10b981;
}

.step-line {
  width: 100px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 20px;
  position: relative;
  top: -20px;
}

.step-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.step-content h2 {
  color: #1f2937;
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 700;
}

.section-description {
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.upload-zone {
  border: 3px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  margin-bottom: 30px;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #3b82f6;
}

.upload-zone h3 {
  color: #374151;
  font-size: 20px;
  margin-bottom: 10px;
}

.upload-zone p {
  color: #6b7280;
  margin-bottom: 5px;
}

.file-format {
  font-size: 14px;
  color: #9ca3af;
}

.file-selected {
  margin-bottom: 30px;
}

.file-card {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e5e7eb;
}

.file-icon {
  font-size: 32px;
  margin-right: 20px;
  color: #3b82f6;
}

.file-info {
  flex: 1;
}

.file-info h4 {
  color: #1f2937;
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.file-info p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.file-detected {
  color: #3b82f6 !important;
  font-size: 12px;
  margin-top: 5px !important;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.original-preview {
  margin-bottom: 40px;
}

.original-preview h3 {
  color: #374151;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
}

.preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: auto;
  max-height: 300px;
  background: white;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.preview-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
}

.preview-table tr:hover td {
  background: #f9fafb;
}

.col-header {
  min-width: 120px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-title {
  font-weight: 600;
  color: #374151;
}

.col-index {
  font-size: 11px;
  color: #9ca3af;
}

.cell-data {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-mapping {
  margin-bottom: 40px;
}

.field-mapping h3 {
  color: #374151;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
}

.mapping-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.mapping-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 20px;
  background: #f8fafc;
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.mapping-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background 0.2s ease;
}

.mapping-row:hover {
  background: #f8fafc;
}

.mapping-row:last-child {
  border-bottom: none;
}

.field-col .field-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.required-badge {
  color: #ef4444;
  font-size: 18px;
  font-weight: bold;
}

.field-col .field-description {
  font-size: 12px;
  color: #6b7280;
}

.column-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
}

.column-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sample-data {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #6b7280;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-mapped {
  color: #10b981;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  background: #d1fae5;
  border-radius: 20px;
}

.status-required {
  color: #f59e0b;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  background: #fef3c7;
  border-radius: 20px;
}

.status-optional {
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 20px;
}

/* 可选字段分隔线 */
.optional-fields-separator {
  grid-column: 1 / -1;
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 2px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.optional-fields-separator span {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.auto-suggestion {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #bae6fd;
}

.auto-suggestion h3 {
  color: #0369a1;
  margin: 0 0 10px 0;
  font-size: 16px;
}

.auto-suggestion p {
  color: #0c4a6e;
  margin: 0 0 15px 0;
  font-size: 14px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.suggestion-btn {
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-btn:hover {
  background: #0284c7;
  transform: translateY(-1px);
}

/* 精简版导入统计 */
.import-stats-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.stat-compact {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #e5e7eb;
}

.prev-btn,
.next-btn,
.import-btn {
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.prev-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.prev-btn:hover {
  background: #e5e7eb;
  transform: translateX(-2px);
}

.next-btn,
.import-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.next-btn:hover:not(:disabled),
.import-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.next-btn:disabled,
.import-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.import-btn {
  padding: 16px 40px;
  font-size: 18px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 精简版结果区域 */
.result-section-compact {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.result-header-compact {
  text-align: center;
  margin-bottom: 30px;
}

.result-header-compact h2 {
  color: #1f2937;
  font-size: 24px;
  margin-bottom: 10px;
}

.result-summary-compact {
  font-size: 16px;
  color: #6b7280;
}

.result-cards-compact {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.result-card-compact {
  flex: 1;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 120px;
}

.result-card-compact.success {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.result-card-compact.failed {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: white;
}

.result-card-compact.skipped {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.card-icon {
  font-size: 24px;
  margin-right: 12px;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2px;
}

.card-label {
  font-size: 12px;
  opacity: 0.9;
}

.errors-section {
  background: #fef2f2;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #fecaca;
}

.errors-section h3 {
  color: #dc2626;
  margin: 0 0 15px 0;
  font-size: 16px;
}

.errors-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.error-item {
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #fecaca;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-more {
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #fecaca;
  font-size: 13px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.error-line {
  color: #dc2626;
  font-weight: 600;
  min-width: 50px;
}

.error-separator {
  color: #9ca3af;
}

.error-field {
  color: #374151;
  font-weight: 500;
  min-width: 70px;
}

.error-message {
  color: #6b7280;
  flex: 1;
}

.result-actions-compact {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.action-btn.secondary {
  background: #10b981;
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.action-btn.secondary:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .step-indicator {
    padding: 15px;
  }
  
  .step-line {
    width: 40px;
    margin: 0 10px;
  }
  
  .step-content {
    padding: 20px;
  }
  
  .mapping-header,
  .mapping-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .import-stats-compact {
    flex-direction: column;
    gap: 15px;
  }
  
  .stat-divider {
    width: 100%;
    height: 1px;
  }
  
  .result-cards-compact {
    flex-direction: column;
    align-items: center;
  }
  
  .result-card-compact {
    max-width: 100%;
    width: 100%;
  }
  
  .result-actions-compact {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .upload-zone {
    padding: 40px 20px;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .prev-btn,
  .next-btn,
  .import-btn {
    width: 100%;
  }
  
  .error-item {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .error-line,
  .error-field,
  .error-message {
    min-width: auto;
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.numeric {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  text-align: right;
}

:deep(.nav-bar) {
  background: transparent;
  box-shadow: none;
  position: relative;
  z-index: 100;
}

:deep(.nav-bar h1) {
  color: white;
}
</style>
