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
          
          <div class="template-section">
            <h3>需要模板？</h3>
            <p>如果不清楚文件格式，请先下载模板文件参考：</p>
            <button class="template-btn" @click="downloadTemplate">
              📥 下载导入模板
            </button>
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
          <h2>配置字段映射</h2>
          <p class="section-description">
            请为每个字段选择对应的数据列。带 <span class="required-star">*</span> 的字段为必填项。
          </p>
          
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
              
              <div v-for="field in fieldConfigs" :key="field.id" class="mapping-row">
                <div class="mapping-col field-col">
                  <div class="field-name">
                    {{ field.label }}
                    <span v-if="field.required" class="required-badge">*</span>
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
                  <span v-else-if="field.required" class="status-required">
                    ⚠ 必填
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
          <h2>预览并导入</h2>
          
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
                    <th>基金名称</th>
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
                    <td>{{ item.fundName }}</td>
                    <td class="numeric">{{ formatNumber(item.purchaseAmount, 2) }}</td>
                    <td class="numeric">{{ formatNumber(item.purchaseShares, 4) }}</td>
                    <td>{{ formatDate(item.purchaseDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 导入选项 -->
          <div class="import-options">
            <h3>导入选项</h3>
            <div class="options-grid">
              <label class="option-item">
                <input type="checkbox" v-model="importSettings.overwrite" />
                <div class="option-content">
                  <div class="option-title">覆盖现有数据</div>
                  <div class="option-description">清空所有现有持仓后再导入</div>
                </div>
              </label>
              
              <label class="option-item">
                <input type="checkbox" v-model="importSettings.skipDuplicates" checked />
                <div class="option-content">
                  <div class="option-title">跳过重复记录</div>
                  <div class="option-description">自动跳过客户、基金、金额相同的记录</div>
                </div>
              </label>
              
              <label class="option-item">
                <input type="checkbox" v-model="importSettings.stripEmptyRows" checked />
                <div class="option-content">
                  <div class="option-title">跳过空行</div>
                  <div class="option-description">自动跳过完全空白的行</div>
                </div>
              </label>
              
              <label class="option-item">
                <input type="checkbox" v-model="importSettings.autoValidate" checked />
                <div class="option-content">
                  <div class="option-title">自动验证数据</div>
                  <div class="option-description">自动验证并修正数据格式</div>
                </div>
              </label>
            </div>
          </div>
          
          <!-- 导入统计 -->
          <div class="import-stats">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ rawData.length }}</div>
                <div class="stat-label">总数据行数</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ validRowsCount }}</div>
                <div class="stat-label">有效数据行</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value">{{ estimatedTime }}</div>
                <div class="stat-label">预计时间</div>
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

      <!-- 导入结果 -->
      <div v-if="importResult" class="result-section">
        <div class="result-header">
          <h2>导入完成</h2>
          <div class="result-summary">
            {{ importResult.success }} 条成功 · {{ importResult.failed }} 条失败
          </div>
        </div>
        
        <div class="result-cards">
          <div class="result-card success">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <h3>成功导入</h3>
              <div class="card-value">{{ importResult.success }}</div>
              <div class="card-label">条记录</div>
            </div>
          </div>
          
          <div class="result-card failed">
            <div class="card-icon">❌</div>
            <div class="card-content">
              <h3>导入失败</h3>
              <div class="card-value">{{ importResult.failed }}</div>
              <div class="card-label">条记录</div>
            </div>
          </div>
        </div>
        
        <!-- 错误详情 -->
        <div v-if="importResult.errors.length > 0" class="errors-section">
          <h3>错误详情</h3>
          <div class="errors-list">
            <div v-for="(error, index) in importResult.errors" :key="index" class="error-item">
              <span class="error-line">第{{ error.line }}行</span>
              <span class="error-separator">·</span>
              <span class="error-field">{{ error.field }}</span>
              <span class="error-separator">·</span>
              <span class="error-message">{{ error.message }}</span>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="action-btn primary" @click="goToHoldings">
            📋 查看持仓
          </button>
          <button class="action-btn secondary" @click="importAnother">
            🔄 继续导入
          </button>
          <button class="action-btn outline" @click="exportResults">
            💾 导出结果
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

// 步骤控制
const currentStep = ref(1)

// 文件处理状态
const selectedFile = ref<File | null>(null)
const fileProcessed = ref(false)
const isImporting = ref(false)
const progressPercentage = ref(0)
const fileFormatDetected = ref<string>('')

// 数据存储
const rawHeaders = ref<string[]>([])
const rawData = ref<any[][]>([])
const previewData = ref<StoreFundHolding[]>([])
const importResult = ref<any>(null)

// 字段配置
interface FieldConfig {
  id: string
  label: string
  required: boolean
  description: string
  columnIndex: number | null
}

const fieldConfigs = ref<FieldConfig[]>([
  {
    id: 'clientName',
    label: '客户姓名',
    required: true,
    description: '客户的姓名或名称',
    columnIndex: null
  },
  {
    id: 'clientID',
    label: '客户号',
    required: false,
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
    id: 'fundName',
    label: '基金名称',
    required: false,
    description: '基金产品名称',
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
    required: false,
    description: '购买交易日期',
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

// 导入设置
const importSettings = ref({
  overwrite: false,
  skipDuplicates: true,
  stripEmptyRows: true,
  autoValidate: true
})

// 计算属性
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

const estimatedTime = computed(() => {
  const rows = rawData.value.length
  if (rows < 100) return '< 1秒'
  if (rows < 1000) return '1-3秒'
  if (rows < 10000) return '3-10秒'
  return '10+秒'
})

interface AutoSuggestion {
  fieldId: string
  columnIndex: number
  message: string
}

const autoSuggestions = computed(() => {
  const suggestions: AutoSuggestion[] = []
  
  // 检查未映射的必填字段
  const unmappedRequiredFields = fieldConfigs.value.filter(
    field => field.required && (field.columnIndex === null || field.columnIndex < 0)
  )
  
  // 分析每列数据，寻找可能的匹配
  for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
    const columnName = rawHeaders.value[colIndex].toLowerCase()
    const sampleData = getSampleData(colIndex)
    
    // 检查每个未映射的字段
    for (const field of unmappedRequiredFields) {
      const fieldName = field.label.toLowerCase()
      const fieldId = field.id
      
      // 基于列名的匹配
      if (columnName.includes(fieldName) ||
          (fieldId === 'clientName' && (columnName.includes('姓名') || columnName.includes('名字'))) ||
          (fieldId === 'fundCode' && (columnName.includes('代码') || columnName.includes('fund'))) ||
          (fieldId === 'purchaseAmount' && (columnName.includes('金额') || columnName.includes('成本'))) ||
          (fieldId === 'purchaseShares' && (columnName.includes('份额') || columnName.includes('shares')))) {
        
        suggestions.push({
          fieldId: fieldId,
          columnIndex: colIndex,
          message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
        })
        break
      }
      
      // 基于数据内容的匹配
      if (sampleData && sampleData !== '(无数据)') {
        if (fieldId === 'fundCode' && /^\d{6}$/.test(sampleData)) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `检测到基金代码格式: "${sampleData}"`
          })
          break
        }
        
        if (fieldId === 'purchaseAmount' && !isNaN(parseFloat(sampleData)) && parseFloat(sampleData) > 100) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `检测到金额数据: "${sampleData}"`
          })
          break
        }
      }
    }
  }
  
  return suggestions.slice(0, 3) // 只显示前3个建议
})

// 文件处理函数
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

// 检测文件实际格式（类似 app.py 的方法）
const detectFileFormat = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase()
  
  try {
    // 读取文件前4个字节来检测实际格式
    const buffer = await file.slice(0, 4).arrayBuffer()
    const view = new Uint8Array(buffer)
    
    // 检查是否是 Excel 文件（PK\x03\x04 签名）
    if (view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04) {
      return 'excel'
    }
    
    // 检查是否是 XLS 文件（D0 CF 11 E0 签名）
    if (view[0] === 0xD0 && view[1] === 0xCF && view[2] === 0x11 && view[3] === 0xE0) {
      return 'excel'
    }
    
    // 根据文件扩展名判断
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel'
    }
    
    if (fileName.endsWith('.csv')) {
      return 'csv'
    }
    
    return 'unknown'
  } catch (error) {
    console.error('检测文件格式失败:', error)
    // 如果检测失败，回退到根据扩展名判断
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return 'excel'
    }
    return 'csv'
  }
}

// 处理选中的文件
const processSelectedFile = async () => {
  if (!selectedFile.value) return
  
  try {
    const file = selectedFile.value
    
    // 检测文件实际格式
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
    
    // 尝试多种编码
    let decodedText = text
    const encodings = ['utf-8', 'gbk', 'gb2312', 'gb18030', 'utf-8-sig', 'latin1']
    
    // 如果文本包含乱码，尝试重新解码
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
    
    // 检测分隔符
    const delimiter = detectDelimiter(lines[0])
    
    // 解析数据
    rawHeaders.value = parseCSVLine(lines[0], delimiter)
    rawData.value = lines.slice(1).map(line => parseCSVLine(line, delimiter))
    
    // 清理数据：移除完全空白的行
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
    
    // 使用第一个工作表
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // 转换为二维数组，保留所有行
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: true
    })
    
    if (jsonData.length === 0) {
      throw new Error('工作表为空')
    }
    
    // 找到标题行（第一个非空行最多的行）
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
    
    // 设置标题
    const headerRow = jsonData[headerRowIndex] as any[]
    rawHeaders.value = headerRow.map((cell, index) => {
      if (cell === null || cell === undefined) {
        return `列${index + 1}`
      }
      const value = String(cell).trim()
      return value || `列${index + 1}`
    })
    
    // 设置数据
    rawData.value = jsonData.slice(headerRowIndex + 1).map((row, rowIndex) => {
      if (!Array.isArray(row)) return []
      
      return rawHeaders.value.map((_, colIndex) => {
        const cell = row[colIndex]
        
        if (cell === null || cell === undefined) {
          return ''
        }
        
        // 处理日期
        if (cell instanceof Date) {
          return cell.toISOString().split('T')[0]
        }
        
        // 处理 XLSX 库的特殊日期格式
        if (typeof cell === 'object' && cell.t && cell.v) {
          if (cell.t === 'd') {
            return new Date(cell.v).toISOString().split('T')[0]
          }
          return cell.v
        }
        
        // 处理数字
        if (typeof cell === 'number') {
          return cell.toString()
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
    
    // 进入引号
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true
      quoteChar = char
      continue
    }
    
    // 离开引号
    if (char === quoteChar && inQuotes) {
      if (nextChar === quoteChar) {
        // 转义引号
        current += char
        i++
      } else {
        inQuotes = false
      }
      continue
    }
    
    // 分隔符（不在引号内）
    if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
      continue
    }
    
    current += char
  }
  
  result.push(current.trim())
  
  // 清理引号
  return result.map(col => {
    const trimmed = col.trim()
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1).trim()
    }
    return trimmed
  })
}

// 自动检测字段映射
const autoDetectFieldMappings = () => {
  // 重置所有映射
  fieldConfigs.value.forEach(field => field.columnIndex = null)
  
  // 基于列名的匹配
  for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
    const columnName = rawHeaders.value[colIndex].toLowerCase()
    
    for (const field of fieldConfigs.value) {
      if (field.columnIndex !== null && field.columnIndex >= 0) continue
      
      const fieldName = field.label.toLowerCase()
      const fieldId = field.id
      
      // 精确匹配
      if (columnName === fieldName ||
          columnName.includes(fieldName) ||
          (fieldId === 'clientName' && (columnName.includes('姓名') || columnName.includes('名字'))) ||
          (fieldId === 'clientID' && (columnName.includes('客户号') || columnName.includes('编号') || columnName.includes('id'))) ||
          (fieldId === 'fundCode' && (columnName.includes('代码') || columnName.includes('fund') || columnName.includes('基金代码'))) ||
          (fieldId === 'fundName' && (columnName.includes('名称') || columnName.includes('name'))) ||
          (fieldId === 'purchaseAmount' && (columnName.includes('金额') || columnName.includes('成本') || columnName.includes('amount'))) ||
          (fieldId === 'purchaseShares' && (columnName.includes('份额') || columnName.includes('shares'))) ||
          (fieldId === 'purchaseDate' && (columnName.includes('日期') || columnName.includes('date')))) {
        
        field.columnIndex = colIndex
        break
      }
    }
  }
  
  // 基于数据内容的匹配（对于仍未匹配的必填字段）
  const unmappedRequiredFields = fieldConfigs.value.filter(
    field => field.required && (field.columnIndex === null || field.columnIndex < 0)
  )
  
  if (unmappedRequiredFields.length > 0 && rawData.value.length > 0) {
    const sampleRow = rawData.value[0]
    
    for (let colIndex = 0; colIndex < sampleRow.length; colIndex++) {
      const cellValue = sampleRow[colIndex]?.toString() || ''
      
      for (const field of unmappedRequiredFields) {
        if (field.columnIndex !== null && field.columnIndex >= 0) continue
        
        if (field.id === 'fundCode' && /^\d{6}$/.test(cellValue)) {
          field.columnIndex = colIndex
          break
        }
        
        if (field.id === 'purchaseAmount' && !isNaN(parseFloat(cellValue)) && parseFloat(cellValue) > 100) {
          field.columnIndex = colIndex
          break
        }
        
        if (field.id === 'purchaseShares' && !isNaN(parseFloat(cellValue)) && parseFloat(cellValue) > 0) {
          field.columnIndex = colIndex
          break
        }
      }
    }
  }
  
  // 生成预览
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

// 生成预览数据
const generatePreviewData = () => {
  previewData.value = []
  
  if (!allRequiredFieldsMapped.value || rawData.value.length === 0) {
    return
  }
  
  // 只预览前10行数据
  const previewRows = Math.min(10, rawData.value.length)
  
  for (let i = 0; i < previewRows; i++) {
    const row = rawData.value[i]
    
    try {
      // 提取数据
      const rowData: any = {}
      
      fieldConfigs.value.forEach(field => {
        if (field.columnIndex !== null && field.columnIndex >= 0 && row) {
          rowData[field.id] = row[field.columnIndex]
        }
      })
      
      // 清洗和转换
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
  
  // 客户姓名
  cleaned.clientName = String(rowData.clientName || '').trim()
  if (!cleaned.clientName) cleaned.clientName = '未知客户'
  
  // 客户号
  const clientID = String(rowData.clientID || '000000000000').trim()
  cleaned.clientID = clientID.replace(/\D/g, '').padStart(12, '0')
  
  // 基金代码
  const fundCode = String(rowData.fundCode || '').trim()
  cleaned.fundCode = fundCode.replace(/\D/g, '').padStart(6, '0')
  
  // 基金名称
  cleaned.fundName = String(rowData.fundName || '').trim() || '未加载'
  
  // 购买金额
  let amount = rowData.purchaseAmount
  if (typeof amount === 'string') {
    amount = amount.replace(/[^\d.-]/g, '')
  }
  cleaned.purchaseAmount = Math.abs(parseFloat(amount) || 0)
  
  // 购买份额
  let shares = rowData.purchaseShares
  if (typeof shares === 'string') {
    shares = shares.replace(/[^\d.-]/g, '')
  }
  cleaned.purchaseShares = Math.abs(parseFloat(shares) || 0)
  
  // 购买日期
  cleaned.purchaseDate = parseDateValue(rowData.purchaseDate) || new Date()
  
  // 当前净值（计算值）
  cleaned.currentNav = cleaned.purchaseShares > 0 ?
    cleaned.purchaseAmount / cleaned.purchaseShares : 1
  
  // 净值日期
  cleaned.navDate = new Date()
  
  // 备注
  cleaned.remarks = String(rowData.remarks || '').trim()
  
  // 其他字段
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
  
  // 处理各种格式
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
      
      // 处理两位数年份
      if (year < 100) {
        year = year + 2000
      }
      
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  // 尝试解析Excel日期数字
  const excelDateNum = parseFloat(str)
  if (!isNaN(excelDateNum) && excelDateNum > 0) {
    // Excel日期是从1899-12-30开始的天数
    const date = new Date((excelDateNum - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  return null
}

// 步骤控制
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

// 开始导入
const startImport = async () => {
  if (!allRequiredFieldsMapped.value) {
    showNotification('请先配置所有必填字段', 'error')
    return
  }
  
  isImporting.value = true
  progressPercentage.value = 0
  importResult.value = null
  
  try {
    // 如果需要覆盖，先清空现有数据
    if (importSettings.value.overwrite) {
      dataStore.clearAllHoldings()
    }
    
    const result = {
      success: 0,
      failed: 0,
      errors: [] as Array<{line: number, field: string, message: string}>
    }
    
    // 构建字段映射
    const fieldMap: Record<string, number> = {}
    fieldConfigs.value.forEach(field => {
      if (field.columnIndex !== null && field.columnIndex >= 0) {
        fieldMap[field.id] = field.columnIndex
      }
    })
    
    // 用于去重的集合
    const duplicateKeys = new Set<string>()
    
    // 处理每一行数据
    const totalRows = rawData.value.length
    
    for (let i = 0; i < totalRows; i++) {
      const row = rawData.value[i]
      const lineNumber = i + 2 // 标题行+1
      
      progressPercentage.value = Math.floor(((i + 1) / totalRows) * 100)
      
      // 跳过空行
      if (importSettings.value.stripEmptyRows) {
        const isEmptyRow = !row || row.every(cell =>
          !cell || cell.toString().trim() === ''
        )
        if (isEmptyRow) continue
      }
      
      try {
        // 提取数据
        const rowData: any = {}
        Object.keys(fieldMap).forEach(fieldId => {
          const colIndex = fieldMap[fieldId]
          if (colIndex !== undefined && row && row[colIndex] !== undefined) {
            rowData[fieldId] = row[colIndex]
          }
        })
        
        // 清洗和转换
        const cleanedData = cleanAndTransformRowData(rowData)
        
        // 验证数据
        const validation = validateRowData(cleanedData, lineNumber)
        if (!validation.isValid) {
          result.failed++
          result.errors.push(...validation.errors)
          continue
        }
        
        // 检查重复
        if (importSettings.value.skipDuplicates) {
          const duplicateKey = `${cleanedData.clientName}-${cleanedData.fundCode}-${cleanedData.purchaseAmount}`
          if (duplicateKeys.has(duplicateKey)) {
            continue
          }
          duplicateKeys.add(duplicateKey)
        }
        
        // 保存数据
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
    
    // 显示结果
    if (result.success > 0) {
      showNotification(`成功导入 ${result.success} 条记录`, 'success')
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
  
  if (!data.clientName || data.clientName.trim() === '') {
    errors.push({
      line: lineNumber,
      field: '客户姓名',
      message: '不能为空'
    })
  }
  
  if (!data.fundCode || !/^\d{6}$/.test(data.fundCode)) {
    errors.push({
      line: lineNumber,
      field: '基金代码',
      message: '必须是6位数字'
    })
  }
  
  if (data.purchaseAmount <= 0) {
    errors.push({
      line: lineNumber,
      field: '购买金额',
      message: '必须大于0'
    })
  }
  
  if (data.purchaseShares <= 0) {
    errors.push({
      line: lineNumber,
      field: '购买份额',
      message: '必须大于0'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 模板下载
const downloadTemplate = () => {
  const templateData = [
    ['客户姓名', '客户号', '基金代码', '基金名称', '购买金额', '购买份额', '购买日期', '备注'],
    ['张三', '123456789012', '000001', '华夏成长混合', '10000.00', '5000.0000', '2024-01-15', ''],
    ['李四', '234567890123', '000002', '易方达消费行业', '20000.00', '8000.0000', '2024-01-20', '长期持有'],
    ['王五', '345678901234', '000003', '嘉实沪深300ETF', '15000.00', '6000.0000', '2024-01-25', '定投'],
    ['赵六', '456789012345', '000004', '南方中证500ETF', '30000.00', '12000.0000', '2024-01-30', '资产配置']
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '持仓模板')
  
  // 设置列宽
  const wscols = [
    { wch: 10 }, // 客户姓名
    { wch: 15 }, // 客户号
    { wch: 10 }, // 基金代码
    { wch: 20 }, // 基金名称
    { wch: 12 }, // 购买金额
    { wch: 12 }, // 购买份额
    { wch: 12 }, // 购买日期
    { wch: 15 }  // 备注
  ]
  worksheet['!cols'] = wscols
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  // 使用原生方式下载文件
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '持仓数据导入模板.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 导出结果
const exportResults = () => {
  if (!importResult.value) return
  
  const results = []
  
  // 添加摘要
  results.push(['导入结果摘要', '', '', '', '', ''])
  results.push(['成功导入', importResult.value.success, '条'])
  results.push(['导入失败', importResult.value.failed, '条'])
  results.push(['', '', ''])
  
  // 添加错误详情
  if (importResult.value.errors.length > 0) {
    results.push(['错误详情', '', '', '', '', ''])
    results.push(['行号', '字段', '错误信息'])
    importResult.value.errors.forEach((error: {line: number, field: string, message: string}) => {
      results.push([error.line, error.field, error.message])
    })
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(results)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '导入结果')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  // 使用原生方式下载文件
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateStr = new Date().toISOString().slice(0, 10)
  link.download = `导入结果_${dateStr}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 工具函数
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

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // 这里可以替换为更优雅的通知组件
  alert(`${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'} ${message}`)
}

const goBack = () => {
  router.push('/holdings/manage')
}

const goToHoldings = () => {
  router.push('/holdings')
}

const importAnother = () => {
  // 重置状态
  currentStep.value = 1
  selectedFile.value = null
  fileProcessed.value = false
  rawHeaders.value = []
  rawData.value = []
  previewData.value = []
  importResult.value = null
  fileFormatDetected.value = ''
  fieldConfigs.value.forEach(field => field.columnIndex = null)
  
  // 重置文件输入
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}
</script>

<style scoped>
/* 样式保持不变，只移除 file-saver 依赖 */
/* ... 样式代码与之前相同 ... */

.import-holding-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 步骤指示器 */
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
  background: #667eea;
  color: white;
  border-color: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
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
  color: #667eea;
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

/* 步骤内容 */
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

/* 上传区域 */
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
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #667eea;
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
  color: #667eea;
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
  color: #667eea !important;
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

.template-section {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid #bae6fd;
}

.template-section h3 {
  color: #0369a1;
  margin: 0 0 10px 0;
  font-size: 18px;
}

.template-section p {
  color: #0c4a6e;
  margin: 0 0 15px 0;
  font-size: 14px;
}

.template-btn {
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.template-btn:hover {
  background: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* 字段映射 */
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

/* 字段映射表格 */
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

/* 智能推荐 */
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

/* 导入选项 */
.import-options {
  margin-bottom: 30px;
}

.import-options h3 {
  color: #374151;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.option-item input[type="checkbox"] {
  margin-right: 15px;
  margin-top: 3px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-content {
  flex: 1;
}

.option-title {
  color: #374151;
  font-weight: 600;
  margin-bottom: 5px;
  font-size: 15px;
}

.option-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

/* 导入统计 */
.import-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  font-size: 32px;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 步骤操作按钮 */
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.next-btn:hover:not(:disabled),
.import-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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

/* 结果区域 */
.result-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.result-header {
  text-align: center;
  margin-bottom: 40px;
}

.result-header h2 {
  color: #1f2937;
  font-size: 32px;
  margin-bottom: 10px;
}

.result-summary {
  font-size: 18px;
  color: #6b7280;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.result-card {
  padding: 30px;
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.result-card.success {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.result-card.failed {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: white;
}

.card-icon {
  font-size: 40px;
  margin-right: 20px;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.card-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 5px;
}

.card-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 错误详情 */
.errors-section {
  background: #fef2f2;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid #fecaca;
}

.errors-section h3 {
  color: #dc2626;
  margin: 0 0 15px 0;
  font-size: 18px;
}

.errors-list {
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #fecaca;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-line {
  color: #dc2626;
  font-weight: 600;
  min-width: 60px;
}

.error-separator {
  color: #9ca3af;
}

.error-field {
  color: #374151;
  font-weight: 500;
  min-width: 80px;
}

.error-message {
  color: #6b7280;
  flex: 1;
}

/* 结果操作按钮 */
.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.action-btn.secondary {
  background: #10b981;
  color: white;
  border: none;
}

.action-btn.outline {
  background: white;
  color: #374151;
  border: 2px solid #d1d5db;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.action-btn.primary:hover {
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary:hover {
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

/* 响应式设计 */
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
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .import-stats {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
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
}

/* 滚动条样式 */
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

/* 数字单元格 */
.numeric {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  text-align: right;
}

/* 警告文本 */
.warning-text {
  color: #ef4444;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.required-star {
  color: #ef4444;
  font-weight: bold;
}

/* 导航栏样式覆盖 */
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
