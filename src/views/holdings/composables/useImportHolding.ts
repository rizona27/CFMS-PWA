import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore, type FundHolding as StoreFundHolding } from '@/stores/dataStore'
import * as XLSX from 'xlsx'

interface FieldConfig {
  id: string
  label: string
  required: boolean
  description: string
  columnIndex: number | null
}

interface AutoSuggestion {
  fieldId: string
  columnIndex: number
  message: string
}

interface ImportLog {
  time: string
  message: string
}

interface ImportResult {
  success: number
  failed: number
  skipped: number
  errors: Array<{ line: number; field: string; message: string }>
}

export function useImportHolding() {
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
  const importResult = ref<ImportResult | null>(null)
  const importLogs = ref<ImportLog[]>([])

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

  const requiredFieldConfigs = computed(() => {
    return fieldConfigs.value.filter(field => field.required)
  })

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

  const requiredFieldsTotalCount = computed(() => {
    return requiredFieldConfigs.value.length
  })

  const requiredFieldsMappedCount = computed(() => {
    return requiredFieldConfigs.value.filter(
      field => field.columnIndex !== null && field.columnIndex >= 0
    ).length
  })

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
        
        if (fieldId === 'fundCode' && (
          columnName.includes('代码') ||
          columnName.includes('fund') ||
          columnName.includes('基金代码') ||
          columnName.includes('产品代码')
        )) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
          })
          break
        }
        
        if (fieldId === 'purchaseAmount' && (
          columnName.includes('金额') ||
          columnName.includes('成本') ||
          columnName.includes('amount') ||
          columnName.includes('price') ||
          columnName.includes('持仓成本')
        )) {
          suggestions.push({
            fieldId: fieldId,
            columnIndex: colIndex,
            message: `将"${rawHeaders.value[colIndex]}"映射为"${field.label}"`
          })
          break
        }
        
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
        
        if (sampleData && sampleData !== '') {
          if (fieldId === 'fundCode' && /^\d{6}$/.test(sampleData.replace(/\s/g, ''))) {
            suggestions.push({
              fieldId: fieldId,
              columnIndex: colIndex,
              message: `检测到基金代码格式: "${sampleData}"`
            })
            break
          }
          
          if (fieldId === 'purchaseAmount' && /^[0-9,]+(\.[0-9]{1,2})?$/.test(sampleData.replace(/[^\d.,]/g, ''))) {
            suggestions.push({
              fieldId: fieldId,
              columnIndex: colIndex,
              message: `检测到金额数据: "${sampleData}"`
            })
            break
          }
          
          if (fieldId === 'purchaseShares' && /^[0-9]+(\.[0-9]{1,4})?$/.test(sampleData.replace(/[^\d.]/g, ''))) {
            suggestions.push({
              fieldId: fieldId,
              columnIndex: colIndex,
              message: `检测到份额数据: "${sampleData}"`
            })
            break
          }
          
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
    
    if (importLogs.value.length > 50) {
      importLogs.value = importLogs.value.slice(0, 50)
    }
  }

  const clearLogs = () => {
    importLogs.value = []
    addImportLog('日志已清空')
  }

  const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      selectedFile.value = input.files[0]
      await processSelectedFile()
    }
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
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      })
      
      if (jsonData.length === 0) {
        throw new Error('工作表为空')
      }
      
      addImportLog(`Excel文件读取完成，原始数据行数: ${jsonData.length}`)
      
      let headerRowIndex = 0
      let maxColumns = 0
      let maxHeaderScore = 0
      
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        const row = jsonData[i] as any[]
        if (!Array.isArray(row)) continue
        
        let nonEmptyCells = 0
        let headerScore = 0
        
        for (let j = 0; j < row.length; j++) {
          const cell = String(row[j] || '').trim()
          if (cell) {
            nonEmptyCells++
            
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
            return cell.toFixed(4)
          }
          
          return String(cell).trim()
        })
        
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
    
    addImportLog(`开始自动映射，共${rawHeaders.value.length}列`)
    rawHeaders.value.forEach((header, index) => {
      addImportLog(`列${index + 1}: "${header}"`)
    })
    
    for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
      const columnName = rawHeaders.value[colIndex].toLowerCase()
      
      for (const field of fieldConfigs.value) {
        if (field.columnIndex !== null && field.columnIndex >= 0) continue
        
        const fieldId = field.id
        
        if (fieldId === 'clientID') {
          if (columnName === '客户号' || columnName === '核心客户号' || columnName === '客户编号' ||
              columnName === '客户代码' || columnName === '客户id') {
            field.columnIndex = colIndex
            addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 客户号`)
            break
          }
        }
        
        if (fieldId === 'fundCode') {
          if (columnName === '基金代码' || columnName === '代码' || columnName === '基金编码' ||
              columnName === 'fund code' || columnName === 'fund_code') {
            field.columnIndex = colIndex
            addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 基金代码`)
            break
          }
        }
        
        if (fieldId === 'purchaseAmount') {
          if (columnName === '购买金额' || columnName === '持仓成本(元)' || columnName === '购买金额(元)' ||
              columnName === 'amount' || columnName === 'purchase amount') {
            field.columnIndex = colIndex
            addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 购买金额`)
            break
          }
        }
        
        if (fieldId === 'purchaseShares') {
          if (columnName === '购买份额' || columnName === '当前份额' || columnName === '持仓份额' ||
              columnName === 'shares' || columnName === 'purchase shares') {
            field.columnIndex = colIndex
            addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 购买份额`)
            break
          }
        }
        
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
        
        if (fieldId === 'clientName') {
          if ((columnName === '客户姓名' || columnName === '姓名' || columnName === '客户名称') &&
              !columnName.includes('综合客户经理')) {
            field.columnIndex = colIndex
            addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 客户姓名`)
            break
          }
        }
        
        if (fieldId === 'remarks' && columnName === '备注') {
          field.columnIndex = colIndex
          addImportLog(`精确映射: "${rawHeaders.value[colIndex]}" -> 备注`)
          break
        }
      }
    }
    
    for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
      const columnName = rawHeaders.value[colIndex].toLowerCase()
      
      for (const field of fieldConfigs.value) {
        if (field.columnIndex !== null && field.columnIndex >= 0) continue
        
        const fieldId = field.id
        
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
        
        if (fieldId === 'purchaseDate' && (
          columnName.includes('日期') ||
          columnName.includes('date') ||
          columnName.includes('时间') ||
          columnName.includes('day') ||
          columnName.includes('购买时间')
        )) {
          if (field.columnIndex === null ||
              (columnName.includes('最早购买日期') && !rawHeaders.value[field.columnIndex].toLowerCase().includes('最早购买日期'))) {
            field.columnIndex = colIndex
            addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 购买日期`)
          }
          break
        }
        
        if (fieldId === 'clientName' && (
          columnName.includes('姓名') ||
          columnName.includes('名字') ||
          columnName.includes('客户') ||
          columnName.includes('name')
        )) {
          if (!columnName.includes('综合客户经理') && !columnName.includes('经理')) {
            field.columnIndex = colIndex
            addImportLog(`模糊映射: "${rawHeaders.value[colIndex]}" -> 客户姓名`)
            break
          }
        }
        
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
    
    const unmappedRequiredFields = fieldConfigs.value.filter(
      field => field.required && (field.columnIndex === null || field.columnIndex < 0)
    )
    
    addImportLog(`第三轮智能映射: 还有 ${unmappedRequiredFields.length} 个必填字段未映射`)
    
    if (unmappedRequiredFields.length > 0 && rawData.value.length > 0) {
      const sampleRows = rawData.value.slice(0, Math.min(5, rawData.value.length))
      
      for (let colIndex = 0; colIndex < rawHeaders.value.length; colIndex++) {
        const columnSamples = sampleRows.map(row => row[colIndex]?.toString() || '')
        
        for (const field of unmappedRequiredFields) {
          if (field.columnIndex !== null && field.columnIndex >= 0) continue
          
          const fieldId = field.id
          let matchScore = 0
          
          for (const sample of columnSamples) {
            if (!sample || sample.trim() === '') continue
            
            const cleanValue = sample.replace(/[^\d.]/g, '')
            
            if (fieldId === 'fundCode') {
              if (/^\d{6}$/.test(cleanValue)) {
                matchScore += 3
              } else if (/^\d+$/.test(cleanValue) && cleanValue.length >= 4 && cleanValue.length <= 8) {
                matchScore += 1
              }
            }
            
            if (fieldId === 'purchaseAmount') {
              if (/^\d+\.?\d*$/.test(cleanValue) && cleanValue !== '') {
                const numValue = parseFloat(cleanValue)
                if (numValue > 1000 && numValue < 1000000000) {
                  matchScore += 3
                } else if (numValue > 0) {
                  matchScore += 1
                }
              }
            }
            
            if (fieldId === 'purchaseShares') {
              if (/^\d+\.?\d*$/.test(cleanValue) && cleanValue !== '') {
                const numValue = parseFloat(cleanValue)
                if (numValue > 100 && numValue < 10000000) {
                  matchScore += 3
                } else if (numValue > 0) {
                  matchScore += 1
                }
              }
            }
            
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
          
          if (matchScore >= sampleRows.length * 2) {
            field.columnIndex = colIndex
            addImportLog(`智能映射: 列${colIndex + 1} (${rawHeaders.value[colIndex]}) -> ${field.label} (分数: ${matchScore})`)
            break
          }
        }
      }
    }
    
    const clientNameField = fieldConfigs.value.find(f => f.id === 'clientName')
    const clientIDField = fieldConfigs.value.find(f => f.id === 'clientID')
    
    if (clientNameField && clientNameField.columnIndex === null &&
        clientIDField && clientIDField.columnIndex !== null && clientIDField.columnIndex >= 0) {
      clientNameField.columnIndex = clientIDField.columnIndex
      addImportLog(`特殊处理: 客户姓名使用客户号列 (列${clientIDField.columnIndex + 1})`)
    }
    
    const stillUnmapped = fieldConfigs.value.filter(
      field => field.required && (field.columnIndex === null || field.columnIndex < 0)
    )
    
    if (stillUnmapped.length > 0 && rawData.value.length > 0) {
      addImportLog(`第四轮兜底映射: 还有 ${stillUnmapped.length} 个必填字段未映射`)
      
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
    
    const mappedFields = fieldConfigs.value.filter(f => f.columnIndex !== null && f.columnIndex >= 0).length
    const totalFields = fieldConfigs.value.length
    
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
    
    const samples = []
    for (let i = 0; i < Math.min(3, rawData.value.length); i++) {
      const sample = rawData.value[i]?.[columnIndex]
      if (sample !== undefined && sample !== null && sample !== '') {
        samples.push(sample.toString())
      }
    }
    
    if (samples.length === 0) {
      return ''
    }
    
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
    
    let clientID = String(rowData.clientID || '').trim()
    if (!clientID) {
      clientID = String(rowData.clientName || '').trim()
    }
    
    const cleanID = clientID.replace(/\D/g, '')
    cleaned.clientID = cleanID || '000000000000'
    
    cleaned.clientName = String(rowData.clientName || '').trim()
    if (!cleaned.clientName || cleaned.clientName === '未知客户') {
      if (cleaned.clientID && cleaned.clientID !== '000000000000') {
        cleaned.clientName = `客户${cleaned.clientID.slice(-6)}`
      } else {
        cleaned.clientName = '未知客户'
      }
    }
    
    let fundCode = String(rowData.fundCode || '').trim()
    fundCode = fundCode.replace(/\D/g, '')
    
    if (fundCode.length === 0) {
      fundCode = '000000'
    } else if (fundCode.length > 6) {
      fundCode = fundCode.slice(0, 6)
    } else if (fundCode.length < 6) {
      fundCode = fundCode.padStart(6, '0')
    }
    
    cleaned.fundCode = fundCode
    cleaned.fundName = `基金${cleaned.fundCode}`
    
    let amount = rowData.purchaseAmount
    if (typeof amount === 'string') {
      amount = amount.replace(/[^\d.-]/g, '')
    }
    let parsedAmount = Math.abs(parseFloat(amount) || 0)
    cleaned.purchaseAmount = parseFloat(parsedAmount.toFixed(2))
    
    let shares = rowData.purchaseShares
    if (typeof shares === 'string') {
      shares = shares.replace(/[^\d.-]/g, '')
    }
    let parsedShares = Math.abs(parseFloat(shares) || 0)
    cleaned.purchaseShares = parseFloat(parsedShares.toFixed(4))
    
    cleaned.purchaseDate = parseDateValue(rowData.purchaseDate) || new Date()
    
    cleaned.currentNav = cleaned.purchaseShares > 0 ?
      parseFloat((cleaned.purchaseAmount / cleaned.purchaseShares).toFixed(4)) : 1
    
    cleaned.navDate = new Date()
    
    cleaned.remarks = String(rowData.remarks || '').trim()
    
    cleaned.isValid = true
    cleaned.isPinned = false
    
    cleaned.id = crypto.randomUUID()
    
    addImportLog(`清洗后数据: ${cleaned.clientID} | ${cleaned.fundCode} | ${cleaned.purchaseAmount} | ${cleaned.purchaseShares} | ${cleaned.purchaseDate}`)
    
    return cleaned
  }

  const parseDateValue = (value: any): Date | null => {
    if (!value) return null
    
    const str = String(value).trim()
    
    addImportLog(`解析日期: "${str}"`)
    
    const date = new Date(str)
    if (!isNaN(date.getTime())) {
      addImportLog(`直接解析成功: ${date.toISOString()}`)
      return date
    }
    
    const patterns = [
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,
      /^(\d{4})(\d{2})(\d{2})$/,
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/,
      /^(\d{4})年(\d{1,2})月(\d{1,2})日$/,
      /^(\d{1,2})月(\d{1,2})日(\d{4})年$/,
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
    
    const excelDateNum = parseFloat(str)
    if (!isNaN(excelDateNum) && excelDateNum > 0) {
      const excelEpoch = new Date(1899, 11, 30)
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
    const amount = Math.round(holding.purchaseAmount * 100)
    const shares = Math.round(holding.purchaseShares * 10000)
    
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
    importLogs.value = []
    
    addImportLog('开始导入数据...')
    
    try {
      const result: ImportResult = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      }
      
      const fieldMap: Record<string, number> = {}
      fieldConfigs.value.forEach(field => {
        if (field.columnIndex !== null && field.columnIndex >= 0) {
          fieldMap[field.id] = field.columnIndex
        }
      })
      
      addImportLog(`字段映射配置: ${JSON.stringify(fieldMap)}`)
      
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
      
      const newHoldings: any[] = []
      const seenKeys = new Set<string>()
      
      for (let i = 0; i < totalRows; i++) {
        const row = rawData.value[i]
        const lineNumber = i + 2
        
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
          
          seenKeys.add(duplicateKey)
          
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
      
      addImportLog(`开始批量添加 ${newHoldings.length} 条持仓记录`)
      
      const holdingsBeforeImport = dataStore.holdings.length
      
      const batchResult = dataStore.batchAddHoldings(newHoldings)
      
      addImportLog(`批量添加完成: ${batchResult.success} 成功, ${batchResult.failed} 失败`)
      addImportLog(`导入前持仓数量: ${holdingsBeforeImport}, 导入后持仓数量: ${dataStore.holdings.length}`)
      
      result.success = batchResult.success
      result.failed += batchResult.failed
      batchResult.errors.forEach((errorMsg, index) => {
        result.errors.push({
          line: index + 2,
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
    } else if (data.purchaseAmount > 1000000000) {
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
    
    if (!data.purchaseDate || isNaN(data.purchaseDate.getTime())) {
      errors.push({
        line: lineNumber,
        field: '购买日期',
        message: '购买日期格式无效'
      })
    } else {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
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

  return {
    currentStep,
    selectedFile,
    fileProcessed,
    fileFormatDetected,
    rawHeaders,
    rawData,
    fieldConfigs,
    previewData,
    importLogs,
    isImporting,
    progressPercentage,
    importResult,
    allRequiredFieldsMapped,
    hasUnmappedRequiredFields,
    validRowsCount,
    requiredFieldsTotalCount,
    requiredFieldsMappedCount,
    autoSuggestions,
    handleFileSelect,
    clearSelection,
    onFieldMappingChange,
    applySuggestion,
    nextStep,
    prevStep,
    startImport,
    goToHoldings,
    importAnother,
    clearLogs,
    showNotification,
    formatFileSize,
    formatNumber,
    formatDate
  }
}
