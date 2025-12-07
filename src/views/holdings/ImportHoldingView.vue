<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
