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
    
  } catch (error) {
    console.error('文件处理失败:', error)
    showNotification(`文件处理失败: ${error}`, 'error')
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
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: true
    })
    
    if (jsonData.length === 0) {
      throw new Error('工作表为空')
    }
    
    let headerRowIndex = 0
    let maxColumns = 0
    
    for (let i = 0; i < Math.min(20, jsonData.length); i++) {
      const row = jsonData[i] as any[]
      if (!Array.isArray(row)) continue
      
      const nonEmptyCells = row.filter(cell =>
        cell !== null &&
        cell !== undefined &&
        cell.toString().trim() !== ''
      ).length
      
      if (nonEmptyCells > maxColumns) {
        maxColumns = nonEmptyCells
        headerRowIndex = i
      }
    }
    
    const headerRow = jsonData[headerRowIndex] as any[]
    rawHeaders.value = headerRow.map((cell, index) => {
      if (cell === null || cell === undefined) {
        return `列${index + 1}`
      }
      const value = String(cell).trim()
      return value || `列${index + 1}`
    })
    
    rawData.value = jsonData.slice(headerRowIndex + 1).map((row, rowIndex) => {
      if (!Array.isArray(row)) return []
      
      return rawHeaders.value.map((_, colIndex) => {
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
          return cell.toFixed(2)
        }
        
        return String(cell).trim()
      })
    }).filter(row => row.some(cell => cell !== ''))
    
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
  
  // 第一轮：精确匹配
  for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
    const columnName = rawHeaders.value[colIndex].toLowerCase()
    
    for (const field of fieldConfigs.value) {
      if (field.columnIndex !== null && field.columnIndex >= 0) continue
      
      const fieldId = field.id
      
      // 客户号映射 - 优先精确匹配
      if (fieldId === 'clientID') {
        if (columnName === '客户号' || columnName === '核心客户号' || columnName === '客户编号') {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 基金代码映射 - 优先精确匹配
      if (fieldId === 'fundCode') {
        if (columnName === '基金代码' || columnName === '代码') {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 购买金额映射 - 优先精确匹配
      if (fieldId === 'purchaseAmount') {
        if (columnName === '购买金额' || columnName === '持仓成本(元)') {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 购买份额映射 - 优先精确匹配
      if (fieldId === 'purchaseShares') {
        if (columnName === '购买份额' || columnName === '当前份额') {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 购买日期映射 - 优先映射最早购买日期
      if (fieldId === 'purchaseDate') {
        if (columnName.includes('最早购买日期')) {
          field.columnIndex = colIndex
          break
        }
        if (columnName === '购买日期') {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 客户姓名映射 - 避免映射到综合客户经理
      if (fieldId === 'clientName') {
        if ((columnName === '客户姓名' || columnName === '姓名') && !columnName.includes('综合客户经理')) {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 备注映射
      if (fieldId === 'remarks' && columnName === '备注') {
        field.columnIndex = colIndex
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
        columnName.includes('证件号')
      )) {
        field.columnIndex = colIndex
        break
      }
      
      // 基金代码模糊匹配
      if (fieldId === 'fundCode' && (
        columnName.includes('代码') ||
        columnName.includes('fund')
      )) {
        field.columnIndex = colIndex
        break
      }
      
      // 购买金额模糊匹配
      if (fieldId === 'purchaseAmount' && (
        columnName.includes('金额') ||
        columnName.includes('成本') ||
        columnName.includes('amount') ||
        columnName.includes('price')
      )) {
        field.columnIndex = colIndex
        break
      }
      
      // 购买份额模糊匹配
      if (fieldId === 'purchaseShares' && (
        columnName.includes('份额') ||
        columnName.includes('shares') ||
        columnName.includes('quantity')
      )) {
        field.columnIndex = colIndex
        break
      }
      
      // 购买日期模糊匹配
      if (fieldId === 'purchaseDate' && (
        columnName.includes('日期') ||
        columnName.includes('date') ||
        columnName.includes('时间')
      )) {
        // 如果还没有映射，或者当前列名包含"最早购买日期"且之前映射的不是"最早购买日期"
        if (field.columnIndex === null ||
            (columnName.includes('最早购买日期') && !rawHeaders.value[field.columnIndex].toLowerCase().includes('最早购买日期'))) {
          field.columnIndex = colIndex
        }
        break
      }
      
      // 客户姓名模糊匹配 - 避免综合客户经理
      if (fieldId === 'clientName' && (
        columnName.includes('姓名') ||
        columnName.includes('名字') ||
        columnName.includes('客户')
      )) {
        // 特别排除"综合客户经理"
        if (!columnName.includes('综合客户经理')) {
          field.columnIndex = colIndex
          break
        }
      }
      
      // 备注模糊匹配
      if (fieldId === 'remarks' && (
        columnName.includes('remark') ||
        columnName.includes('comment')
      )) {
        field.columnIndex = colIndex
        break
      }
    }
  }
  
  // 第三轮：智能数据格式检测
  const unmappedRequiredFields = fieldConfigs.value.filter(
    field => field.required && (field.columnIndex === null || field.columnIndex < 0)
  )
  
  if (unmappedRequiredFields.length > 0 && rawData.value.length > 0) {
    const sampleRow = rawData.value[0]
    
    for (let colIndex = 0; colIndex < sampleRow.length; colIndex++) {
      const cellValue = sampleRow[colIndex]?.toString() || ''
      const cleanValue = cellValue.replace(/[^\d.]/g, '')
      
      for (const field of unmappedRequiredFields) {
        if (field.columnIndex !== null && field.columnIndex >= 0) continue
        
        // 基金代码格式检测
        if (field.id === 'fundCode' && /^\d{6}$/.test(cleanValue)) {
          field.columnIndex = colIndex
          break
        }
        
        // 金额格式检测
        if (field.id === 'purchaseAmount' && cleanValue && !isNaN(parseFloat(cleanValue))) {
          const amount = parseFloat(cleanValue)
          if (amount > 100 && amount < 100000000) {
            field.columnIndex = colIndex
            break
          }
        }
        
        // 份额格式检测
        if (field.id === 'purchaseShares' && cleanValue && !isNaN(parseFloat(cleanValue))) {
          const shares = parseFloat(cleanValue)
          if (shares > 0) {
            field.columnIndex = colIndex
            break
          }
        }
        
        // 日期格式检测
        if (field.id === 'purchaseDate' && (
          /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(cellValue) ||
          /^\d{8}$/.test(cellValue.replace(/[^\d]/g, ''))
        )) {
          field.columnIndex = colIndex
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
  }
  
  generatePreviewData()
}

const getSampleData = (columnIndex: number | null): string => {
  if (columnIndex === null || columnIndex < 0 || rawData.value.length === 0) {
    return ''
  }
  
  const sample = rawData.value[0]?.[columnIndex]
  return sample?.toString() || ''
}

const onFieldMappingChange = (field: FieldConfig) => {
  generatePreviewData()
}

const applySuggestion = (suggestion: AutoSuggestion) => {
  const field = fieldConfigs.value.find(f => f.id === suggestion.fieldId)
  if (field) {
    field.columnIndex = suggestion.columnIndex
    generatePreviewData()
  }
}

const generatePreviewData = () => {
  previewData.value = []
  
  if (!allRequiredFieldsMapped.value || rawData.value.length === 0) {
    return
  }
  
  const previewRows = Math.min(10, rawData.value.length)
  
  for (let i = 0; i < previewRows; i++) {
    const row = rawData.value[i]
    
    try {
      const rowData: any = {}
      
      fieldConfigs.value.forEach(field => {
        if (field.columnIndex !== null && field.columnIndex >= 0 && row) {
          rowData[field.id] = row[field.columnIndex]
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
    }
  }
}

const cleanAndTransformRowData = (rowData: any): any => {
  const cleaned: any = {}
  
  // 客户号
  const clientID = String(rowData.clientID || '').trim()
  const cleanID = clientID.replace(/\D/g, '').slice(0, 12)
  cleaned.clientID = cleanID.padStart(Math.min(12, cleanID.length), '0')
  
  // 客户姓名：如果没有找到列，使用客户号生成
  cleaned.clientName = String(rowData.clientName || '').trim()
  if (!cleaned.clientName || cleaned.clientName === '未知客户') {
    if (cleaned.clientID && cleaned.clientID !== '000000000000') {
      cleaned.clientName = `客户${cleaned.clientID.slice(-6)}`
    } else {
      cleaned.clientName = '未知客户'
    }
  }
  
  // 基金代码
  let fundCode = String(rowData.fundCode || '').trim()
  fundCode = fundCode.replace(/\D/g, '')
  
  if (fundCode.length === 0) {
    fundCode = '000000'
  } else if (fundCode.length > 6) {
    fundCode = fundCode.slice(0, 6)
  }
  
  cleaned.fundCode = fundCode.padStart(6, '0')
  
  // 基金名称：使用基金代码
  cleaned.fundName = `基金${cleaned.fundCode}`
  
  // 购买金额
  let amount = rowData.purchaseAmount
  if (typeof amount === 'string') {
    amount = amount.replace(/[^\d.-]/g, '')
  }
  let parsedAmount = Math.abs(parseFloat(amount) || 0)
  cleaned.purchaseAmount = parseFloat(parsedAmount.toFixed(2))
  
  // 购买份额
  let shares = rowData.purchaseShares
  if (typeof shares === 'string') {
    shares = shares.replace(/[^\d.-]/g, '')
  }
  let parsedShares = Math.abs(parseFloat(shares) || 0)
  cleaned.purchaseShares = parseFloat(parsedShares.toFixed(2))
  
  // 购买日期
  cleaned.purchaseDate = parseDateValue(rowData.purchaseDate) || new Date()
  
  // 净值计算
  cleaned.currentNav = cleaned.purchaseShares > 0 ?
    parseFloat((cleaned.purchaseAmount / cleaned.purchaseShares).toFixed(4)) : 1
  
  cleaned.navDate = new Date()
  
  // 备注
  cleaned.remarks = String(rowData.remarks || '').trim()
  
  cleaned.isValid = true
  cleaned.isPinned = false
  
  return cleaned
}

const parseDateValue = (value: any): Date | null => {
  if (!value) return null
  
  const str = String(value).trim()
  
  // 尝试直接解析
  const date = new Date(str)
  if (!isNaN(date.getTime())) {
    return date
  }
  
  // 尝试常见日期格式
  const patterns = [
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/,
    /^(\d{4})年(\d{1,2})月(\d{1,2})日$/
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
        return date
      }
    }
  }
  
  // 尝试Excel日期格式
  const excelDateNum = parseFloat(str)
  if (!isNaN(excelDateNum) && excelDateNum > 0) {
    const date = new Date((excelDateNum - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  return null
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const createDeduplicationKey = (holding: any): string => {
  const dateStr = holding.purchaseDate.toISOString().split('T')[0]
  const amountStr = holding.purchaseAmount.toFixed(2)
  const sharesStr = holding.purchaseShares.toFixed(2)
  
  return `${holding.clientID}-${holding.fundCode}-${amountStr}-${sharesStr}-${dateStr}`
}

const startImport = async () => {
  if (!allRequiredFieldsMapped.value) {
    showNotification('请先配置所有必填字段', 'error')
    return
  }
  
  isImporting.value = true
  progressPercentage.value = 0
  importResult.value = null
  
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
    
    // 获取现有持仓的去重键
    const existingHoldingsKeys = new Set<string>()
    dataStore.holdings.forEach(holding => {
      const key = createDeduplicationKey(holding)
      existingHoldingsKeys.add(key)
    })
    
    const totalRows = rawData.value.length
    
    // 修复：一次性处理所有行，避免重复导入问题
    for (let i = 0; i < totalRows; i++) {
      const row = rawData.value[i]
      const lineNumber = i + 2
      
      // 更新进度
      progressPercentage.value = Math.floor(((i + 1) / totalRows) * 100)
      
      try {
        const rowData: any = {}
        Object.keys(fieldMap).forEach(fieldId => {
          const colIndex = fieldMap[fieldId]
          if (colIndex !== undefined && row && row[colIndex] !== undefined) {
            rowData[fieldId] = row[colIndex]
          }
        })
        
        const cleanedData = cleanAndTransformRowData(rowData)
        
        const validation = validateRowData(cleanedData, lineNumber)
        if (!validation.isValid) {
          result.failed++
          result.errors.push(...validation.errors)
          continue
        }
        
        const duplicateKey = createDeduplicationKey(cleanedData)
        
        // 检查是否已存在相同记录
        if (existingHoldingsKeys.has(duplicateKey)) {
          result.skipped++
          result.errors.push({
            line: lineNumber,
            field: '重复记录',
            message: '已存在相同的持仓记录（客户号-基金代码-金额-份额-日期组合），已跳过'
          })
          continue
        }
        
        // 添加到现有集合中，避免本次导入内重复
        existingHoldingsKeys.add(duplicateKey)
        
        const fundHoldingData = dataStore.convertHoldingToFundHolding(cleanedData)
        dataStore.addHolding(fundHoldingData)
        result.success++
        
      } catch (error: any) {
        result.failed++
        result.errors.push({
          line: lineNumber,
          field: '系统错误',
          message: error.message || '未知错误'
        })
      }
    }
    
    importResult.value = result
    progressPercentage.value = 100
    
    if (result.success > 0) {
      showNotification(`成功导入 ${result.success} 条记录`, 'success')
    } else if (result.skipped > 0) {
      showNotification(`所有 ${result.skipped} 条记录均为重复数据，已跳过`, 'warning')
    } else {
      showNotification('导入失败，请检查数据格式', 'error')
    }
    
  } catch (error) {
    console.error('导入过程出错:', error)
    showNotification(`导入失败: ${error}`, 'error')
  } finally {
    isImporting.value = false
  }
}

const validateRowData = (data: any, lineNumber: number) => {
  const errors: Array<{line: number, field: string, message: string}> = []
  
  if (!data.clientID || data.clientID.trim() === '' || data.clientID === '000000000000') {
    errors.push({
      line: lineNumber,
      field: '客户号',
      message: '客户号不能为空或无效'
    })
  }
  
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
  
  if (data.purchaseAmount <= 0) {
    errors.push({
      line: lineNumber,
      field: '购买金额',
      message: `购买金额必须大于0，当前值: ${data.purchaseAmount.toFixed(2)}`
    })
  } else if (data.purchaseAmount > 100000000) {
    errors.push({
      line: lineNumber,
      field: '购买金额',
      message: `购买金额过大: ${data.purchaseAmount.toFixed(2)}`
    })
  }
  
  if (data.purchaseShares <= 0) {
    errors.push({
      line: lineNumber,
      field: '购买份额',
      message: `购买份额必须大于0，当前值: ${data.purchaseShares.toFixed(2)}`
    })
  }
  
  if (!data.purchaseDate || isNaN(data.purchaseDate.getTime())) {
    errors.push({
      line: lineNumber,
      field: '购买日期',
      message: '购买日期格式无效'
    })
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
  fieldConfigs.value.forEach(field => field.columnIndex = null)
  
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}
</script>

<style scoped>
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
