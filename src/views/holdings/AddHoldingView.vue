<template>
  <div class="add-holding-view">
    <!-- 导航栏 -->
    <div class="custom-navbar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
      <h1 class="page-title">新增持仓</h1>
      <div class="nav-spacer"></div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content">
      <div class="form-container" ref="formContainer">
        <!-- 表单区域 -->
        <div class="form-section">
          <!-- 必填信息标题 -->
          <div class="section-title">
            <div class="title-icon">📋</div>
            <div class="title-text">必填信息</div>
            <div class="title-subtext">请准确填写以下信息</div>
          </div>
          
          <!-- 客户姓名 -->
          <div class="form-card" :class="{ 'error': clientNameError }">
            <div class="form-card-header">
              <div class="form-card-title">
                <span class="required-mark">*</span> 客户姓名
              </div>
              <div class="form-card-hint" v-if="clientNameError">
                {{ clientNameError }}
              </div>
            </div>
            <input
              v-model="clientName"
              type="text"
              name="clientName"
              id="clientNameInput"
              placeholder="请输入客户姓名"
              class="form-input"
              :class="{ 'error': clientNameError }"
              @input="validateClientName"
              @blur="validateClientName"
            />
          </div>
          
          <!-- 基金代码 -->
          <div class="form-card" :class="{ 'error': fundCodeError }">
            <div class="form-card-header">
              <div class="form-card-title">
                <span class="required-mark">*</span> 基金代码
              </div>
              <div class="form-card-hint" v-if="fundCodeError">
                {{ fundCodeError }}
              </div>
            </div>
            <input
              v-model="fundCode"
              type="text"
              name="fundCode"
              id="fundCodeInput"
              placeholder="请输入6位基金代码"
              class="form-input"
              :class="{ 'error': fundCodeError }"
              @input="validateFundCode"
              @blur="validateFundCode"
              maxlength="6"
            />
          </div>
          
          <!-- 购买金额 -->
          <div class="form-card" :class="{ 'error': purchaseAmountError }">
            <div class="form-card-header">
              <div class="form-card-title">
                <span class="required-mark">*</span> 购买金额
              </div>
              <div class="form-card-hint" v-if="purchaseAmountError">
                {{ purchaseAmountError }}
              </div>
            </div>
            <input
              v-model="purchaseAmount"
              type="number"
              name="purchaseAmount"
              id="purchaseAmountInput"
              placeholder="请输入购买金额"
              class="form-input"
              :class="{ 'error': purchaseAmountError }"
              @input="validatePurchaseAmount"
              @blur="validatePurchaseAmount"
              step="0.01"
              min="0.01"
            />
          </div>
          
          <!-- 购买份额 -->
          <div class="form-card" :class="{ 'error': purchaseSharesError }">
            <div class="form-card-header">
              <div class="form-card-title">
                <span class="required-mark">*</span> 购买份额
              </div>
              <div class="form-card-hint" v-if="purchaseSharesError">
                {{ purchaseSharesError }}
              </div>
            </div>
            <input
              v-model="purchaseShares"
              type="number"
              name="purchaseShares"
              id="purchaseSharesInput"
              placeholder="请输入购买份额"
              class="form-input"
              :class="{ 'error': purchaseSharesError }"
              @input="validatePurchaseShares"
              @blur="validatePurchaseShares"
              step="0.01"
              min="0.01"
            />
          </div>
          
          <!-- 购买日期 -->
          <div class="form-card">
            <div class="form-card-header">
              <div class="form-card-title">
                <span class="required-mark">*</span> 购买日期
              </div>
            </div>
            <div class="date-input" @click="showDatePicker = !showDatePicker">
              <span class="date-text">{{ formattedDate }}</span>
              <span class="date-icon">{{ showDatePicker ? '▲' : '▼' }}</span>
            </div>
            
            <!-- 日期选择器 -->
            <div v-if="showDatePicker" class="date-picker-container">
              <div class="date-picker-header">
                <span>选择购买日期</span>
                <button class="date-picker-close" @click.stop="showDatePicker = false">
                  ✕
                </button>
              </div>
              <div class="date-picker">
                <input
                  v-model="purchaseDate"
                  type="date"
                  name="purchaseDate"
                  id="purchaseDateInput"
                  class="date-input-native"
                  :max="today"
                  @change="onDateChange"
                />
              </div>
              <div class="date-picker-actions">
                <button class="date-picker-button" @click="setToday">
                  今天
                </button>
                <button class="date-picker-button primary" @click="showDatePicker = false">
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 可选信息区域 -->
        <div class="form-section">
          <!-- 可选信息标题 -->
          <div class="section-title">
            <div class="title-icon">📝</div>
            <div class="title-text">可选信息</div>
            <div class="title-subtext">以下信息可选择性填写</div>
          </div>
          
          <!-- 客户号 -->
          <div class="form-card">
            <div class="form-card-header">
              <div class="form-card-title">客户号</div>
              <div class="form-card-hint">最多12位数字</div>
            </div>
            <input
              v-model="clientID"
              type="text"
              name="clientID"
              id="clientIDInput"
              placeholder="选填，最多12位数字"
              class="form-input"
              maxlength="12"
              @input="validateClientID"
            />
          </div>
          
          <!-- 备注 -->
          <div class="form-card">
            <div class="form-card-header">
              <div class="form-card-title">备注</div>
              <div class="form-card-hint">最多30个字符</div>
            </div>
            <textarea
              v-model="remarks"
              name="remarks"
              id="remarksInput"
              placeholder="选填，最多30个字符"
              class="form-textarea"
              maxlength="30"
              rows="2"
              @input="validateRemarks"
            ></textarea>
            <div class="char-counter">
              {{ remarks.length }}/30
            </div>
          </div>
        </div>
        
        <!-- 用户限制提示 -->
        <div v-if="isFreeUser" class="user-limit-card">
          <div class="limit-header">
            <div class="limit-icon">ℹ️</div>
            <div class="limit-title">用户限制提醒</div>
          </div>
          <div class="limit-content">
            <p>基础用户限制：</p>
            <ul class="limit-list">
              <li>最多添加 <strong>5个</strong> 不同客户</li>
              <li>每个客户最多 <strong>2个</strong> 基金产品</li>
            </ul>
            <p class="limit-upgrade">升级到高级用户可解除限制</p>
          </div>
        </div>
        
        <!-- 表单验证状态 -->
        <div v-if="showValidationSummary" class="validation-summary">
          <div class="validation-icon">⚠️</div>
          <div class="validation-message">
            请完成所有必填项：{{ validationErrors.join('，') }}
          </div>
        </div>
        
        <!-- 按钮区域 -->
        <div class="form-actions">
          <button class="form-button cancel" @click="goBack">
            取消
          </button>
          <button
            class="form-button submit"
            :class="{ 'disabled': !isFormValid }"
            @click="saveHolding"
            :disabled="!isFormValid || isSaving"
          >
            <span v-if="isSaving" class="loading-spinner"></span>
            {{ isSaving ? '保存中...' : '保存持仓' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Toast消息 -->
    <div v-if="showToast" class="toast-message" :class="toastType">
      {{ toastMessage }}
    </div>
    
    <!-- 基金信息加载中遮罩 -->
    <div v-if="isLoadingFundInfo" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner-large"></div>
        <div class="loading-text">正在获取基金信息...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { fundService } from '@/services/fundService'
import type { FundHolding } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

// ========== 工具函数定义 ==========
// 必须在响应式状态之前定义，避免变量访问顺序问题
const getTodayDate = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// 日志记录方法
const logAction = (action: string, message: string, type: 'info' | 'success' | 'error' | 'warning' | 'network' | 'cache' = 'info') => {
  dataStore.addLog(`${action}: ${message}`, type)
}

// ========== 响应式状态 ==========
const clientName = ref('')
const clientID = ref('')
const fundCode = ref('')
const purchaseAmount = ref('')
const purchaseShares = ref('')
const purchaseDate = ref(getTodayDate())
const remarks = ref('')

// 验证错误
const clientNameError = ref('')
const fundCodeError = ref('')
const purchaseAmountError = ref('')
const purchaseSharesError = ref('')
const showDatePicker = ref(false)

// UI状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')
const isSaving = ref(false)
const isLoadingFundInfo = ref(false)
const showValidationSummary = ref(false)

// ========== 计算属性 ==========
const today = computed(() => getTodayDate())
const formattedDate = computed(() => {
  const date = new Date(purchaseDate.value)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
})

const isFormValid = computed(() => {
  return !clientNameError.value &&
         !fundCodeError.value &&
         !purchaseAmountError.value &&
         !purchaseSharesError.value &&
         clientName.value.trim() !== '' &&
         fundCode.value.trim() !== '' &&
         purchaseAmount.value !== '' &&
         purchaseShares.value !== '' &&
         purchaseDate.value.trim() !== ''
})

const validationErrors = computed(() => {
  const errors: string[] = []
  if (!clientName.value.trim()) errors.push('客户姓名')
  if (!fundCode.value.trim()) errors.push('基金代码')
  if (!purchaseAmount.value) errors.push('购买金额')
  if (!purchaseShares.value) errors.push('购买份额')
  if (clientNameError.value) errors.push('客户姓名验证')
  if (fundCodeError.value) errors.push('基金代码验证')
  if (purchaseAmountError.value) errors.push('购买金额验证')
  if (purchaseSharesError.value) errors.push('购买份额验证')
  return errors
})

const isFreeUser = computed(() => {
  return authStore.currentUser?.user_type === 'free'
})

// ========== 方法定义 ==========
const goBack = () => {
  router.back()
}

const setToday = () => {
  purchaseDate.value = getTodayDate()
  showDatePicker.value = false
  logAction('日期选择', '选择今天为购买日期', 'info')
}

const onDateChange = () => {
  logAction('日期选择', `选择购买日期: ${formattedDate.value}`, 'info')
}

// 验证方法
const validateClientName = () => {
  const name = clientName.value.trim()
  
  if (!name) {
    clientNameError.value = '客户姓名不能为空'
    return false
  }
  
  // 检查姓名长度（2-10个字符）
  if (name.length < 2 || name.length > 10) {
    clientNameError.value = '姓名长度应为2-10个字符'
    return false
  }
  
  // 检查是否只包含中文字符、英文字母和空格
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\s]+$/
  if (!nameRegex.test(name)) {
    clientNameError.value = '姓名只能包含中文、英文和空格'
    return false
  }
  
  clientNameError.value = ''
  logAction('表单验证', `客户姓名验证通过: ${name}`, 'info')
  return true
}

const validateFundCode = () => {
  const code = fundCode.value.trim()
  
  if (!code) {
    fundCodeError.value = '基金代码不能为空'
    return false
  }
  
  // 检查是否为6位数字
  const codeRegex = /^\d{6}$/
  if (!codeRegex.test(code)) {
    fundCodeError.value = '基金代码必须是6位数字'
    return false
  }
  
  fundCodeError.value = ''
  logAction('表单验证', `基金代码验证通过: ${code}`, 'info')
  return true
}

const validatePurchaseAmount = () => {
  const amountStr = purchaseAmount.value
  
  if (!amountStr) {
    purchaseAmountError.value = '购买金额不能为空'
    return false
  }
  
  const amount = parseFloat(amountStr)
  
  if (isNaN(amount) || amount <= 0) {
    purchaseAmountError.value = '请输入有效的正数金额'
    return false
  }
  
  // 检查金额是否过大（超过1亿）
  if (amount > 100000000) {
    purchaseAmountError.value = '金额不能超过1亿元'
    return false
  }
  
  purchaseAmountError.value = ''
  logAction('表单验证', `购买金额验证通过: ${amount.toFixed(2)}`, 'info')
  return true
}

const validatePurchaseShares = () => {
  const sharesStr = purchaseShares.value
  
  if (!sharesStr) {
    purchaseSharesError.value = '购买份额不能为空'
    return false
  }
  
  const shares = parseFloat(sharesStr)
  
  if (isNaN(shares) || shares <= 0) {
    purchaseSharesError.value = '请输入有效的正数份额'
    return false
  }
  
  // 检查份额是否过大（超过1000万份）
  if (shares > 10000000) {
    purchaseSharesError.value = '份额不能超过1000万份'
    return false
  }
  
  purchaseSharesError.value = ''
  logAction('表单验证', `购买份额验证通过: ${shares.toFixed(2)}`, 'info')
  return true
}

const validateClientID = () => {
  const id = clientID.value.trim()
  
  if (id && !/^\d{0,12}$/.test(id)) {
    // 只允许数字，最多12位
    clientID.value = id.replace(/\D/g, '').slice(0, 12)
  }
  
  logAction('表单验证', `客户号更新: ${clientID.value || '空'}`, 'info')
  return true
}

const validateRemarks = () => {
  const remarksText = remarks.value
  
  if (remarksText.length > 30) {
    remarks.value = remarksText.slice(0, 30)
  }
  
  logAction('表单验证', `备注更新: ${remarks.value.length}个字符`, 'info')
  return true
}

// 保存持仓
const saveHolding = async () => {
  // 验证所有必填字段
  const isClientNameValid = validateClientName()
  const isFundCodeValid = validateFundCode()
  const isAmountValid = validatePurchaseAmount()
  const isSharesValid = validatePurchaseShares()
  
  if (!isClientNameValid || !isFundCodeValid || !isAmountValid || !isSharesValid) {
    showValidationSummary.value = true
    showToastMessage('请检查表单中的错误', 'warning')
    logAction('表单提交', '表单验证失败，无法保存持仓', 'error')
    return
  }
  
  // 检查免费用户限制
  if (isFreeUser.value) {
    const clientNameTrimmed = clientName.value.trim()
    const existingClientNames = new Set(dataStore.holdings.map(h => h.clientName))
    
    // 检查是否超过5个不同客户
    if (!existingClientNames.has(clientNameTrimmed) && existingClientNames.size >= 5) {
      showToastMessage('基础用户最多添加5个不同的客户，请升级后继续使用', 'warning')
      logAction('用户限制', `基础用户超过5个客户限制: ${clientNameTrimmed}`, 'warning')
      return
    }
    
    // 检查每个客户是否超过2个产品
    const clientHoldings = dataStore.holdings.filter(h => h.clientName === clientNameTrimmed)
    if (clientHoldings.length >= 2) {
      showToastMessage('基础用户每个客户最多添加2个产品，请升级后继续使用', 'warning')
      logAction('用户限制', `基础用户超过每个客户2个产品限制: ${clientNameTrimmed}`, 'warning')
      return
    }
  }
  
  isSaving.value = true
  isLoadingFundInfo.value = true
  
  try {
    // 记录开始保存日志
    logAction('持仓操作', `开始添加持仓: 客户 ${clientName.value} - 基金 ${fundCode.value}`, 'info')
    
    // 使用fundService获取基金信息（统一数据架构）
    logAction('基金查询', `查询基金信息: ${fundCode.value}`, 'network')
    const fundInfo = await fundService.fetchFundInfo(fundCode.value)
    
    if (!fundInfo || !fundInfo.name) {
      showToastMessage(`基金 ${fundCode.value} 不存在或无法获取信息`, 'error')
      logAction('基金查询', `基金查询失败: ${fundCode.value}`, 'error')
      isLoadingFundInfo.value = false
      isSaving.value = false
      return
    }
    
    logAction('基金查询', `基金查询成功: ${fundCode.value} - ${fundInfo.name}`, 'success')
    
    // 创建持仓对象（符合统一数据架构）
    const newHolding: FundHolding = {
      id: crypto.randomUUID(),
      clientName: clientName.value.trim(),
      clientID: clientID.value.trim(),
      fundCode: fundCode.value.trim(),
      purchaseAmount: parseFloat(purchaseAmount.value),
      purchaseShares: parseFloat(purchaseShares.value),
      purchaseDate: new Date(purchaseDate.value),
      remarks: remarks.value.trim(),
      fundName: fundInfo.name,
      currentNav: fundInfo.nav,
      navDate: new Date(fundInfo.navDate),
      isValid: true,
      isPinned: false,
      pinnedTimestamp: undefined,
      navReturn1m: fundInfo.returns?.navReturn1m,
      navReturn3m: fundInfo.returns?.navReturn3m,
      navReturn6m: fundInfo.returns?.navReturn6m,
      navReturn1y: fundInfo.returns?.navReturn1y
    }
    
    // 通过dataStore保存持仓（统一数据架构）
    dataStore.addHolding(newHolding)
    
    logAction('持仓操作',
      `持仓添加成功: 客户 ${newHolding.clientName} - 基金 ${newHolding.fundCode} - 金额 ¥${newHolding.purchaseAmount.toFixed(2)} - 份额 ${newHolding.purchaseShares.toFixed(2)}`,
      'success'
    )
    
    // 重置表单
    resetForm()
    
    showToastMessage('持仓添加成功', 'success')
    
    // 延迟返回，确保用户看到成功消息
    setTimeout(() => {
      router.push('/holdings/manage')
    }, 1500)
    
  } catch (error: any) {
    logAction('持仓操作', `持仓添加失败: ${error.message}`, 'error')
    showToastMessage('添加持仓失败，请重试', 'error')
    console.error('保存持仓失败:', error)
  } finally {
    isLoadingFundInfo.value = false
    isSaving.value = false
  }
}

// 重置表单
const resetForm = () => {
  clientName.value = ''
  clientID.value = ''
  fundCode.value = ''
  purchaseAmount.value = ''
  purchaseShares.value = ''
  purchaseDate.value = getTodayDate()
  remarks.value = ''
  
  clientNameError.value = ''
  fundCodeError.value = ''
  purchaseAmountError.value = ''
  purchaseSharesError.value = ''
  
  showValidationSummary.value = false
}

// 显示Toast消息
const showToastMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// ========== 生命周期 ==========
onMounted(() => {
  logAction('页面访问', '打开新增持仓页面', 'info')
})
</script>

<style scoped>
.add-holding-view {
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.back-button:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.back-icon {
  font-size: 18px;
  line-height: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  flex: 1;
}

.nav-spacer {
  width: 80px;
  visibility: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 16px;
  padding: 0 8px;
}

.title-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.title-subtext {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-card:hover {
  border-color: var(--border-color);
}

.form-card.error {
  border-color: #ff416c;
  background: linear-gradient(135deg, rgba(255, 65, 108, 0.05), rgba(255, 75, 43, 0.05));
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.form-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.required-mark {
  color: #ff416c;
  margin-right: 4px;
}

.form-card-hint {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
  max-width: 60%;
}

.form-card.error .form-card-hint {
  color: #ff416c;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg-hover);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.form-input.error {
  border-color: #ff416c;
  background: rgba(255, 65, 108, 0.05);
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.date-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg-hover);
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-input:hover {
  border-color: var(--accent-color);
}

.date-text {
  color: var(--text-primary);
}

.date-icon {
  font-size: 12px;
  color: var(--text-secondary);
}

.date-picker-container {
  position: relative;
  margin-top: 12px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.date-picker-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.date-picker-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.date-picker {
  padding: 16px;
}

.date-input-native {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg-hover);
}

.date-picker-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-hover);
}

.date-picker-button {
  flex: 1;
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-picker-button:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
}

.date-picker-button.primary {
  background: linear-gradient(135deg, var(--accent-color), #2196f3);
  color: white;
  border: none;
}

.date-picker-button.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg-hover);
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.user-limit-card {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1));
  border: 2px solid rgba(33, 150, 243, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.limit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.limit-icon {
  font-size: 20px;
}

.limit-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-color);
}

.limit-content {
  font-size: 14px;
  color: var(--text-primary);
}

.limit-content p {
  margin-bottom: 8px;
}

.limit-list {
  margin-left: 20px;
  margin-bottom: 12px;
}

.limit-list li {
  margin-bottom: 4px;
}

.limit-upgrade {
  font-size: 13px;
  color: var(--accent-color);
  font-weight: 500;
}

.validation-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  margin-bottom: 24px;
}

.validation-icon {
  font-size: 20px;
}

.validation-message {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding: 8px 0 32px;
}

.form-button {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-button.cancel {
  background: linear-gradient(135deg, var(--bg-hover), var(--bg-card));
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.form-button.cancel:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-button.submit {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

.form-button.submit:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
}

.form-button.submit.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, var(--bg-hover), var(--bg-card));
  color: var(--text-secondary);
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.loading-spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toast-message {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 80%;
  text-align: center;
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s;
  animation-fill-mode: forwards;
}

.toast-message.info {
  border-left: 4px solid #2196f3;
}

.toast-message.success {
  border-left: 4px solid #4caf50;
}

.toast-message.error {
  border-left: 4px solid #f44336;
}

.toast-message.warning {
  border-left: 4px solid #ff9800;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.loading-content {
  background: var(--bg-card);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.loading-text {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin-top: 12px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .content {
    padding: 12px;
  }
  
  .form-card {
    padding: 14px;
  }
  
  .form-input,
  .date-input,
  .form-textarea {
    padding: 10px;
    font-size: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .form-button {
    padding: 14px;
  }
  
  .toast-message {
    bottom: 80px;
    max-width: 90%;
    font-size: 14px;
  }
  
  .filter-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 平板设备优化 */
@media (min-width: 768px) and (max-width: 1024px) {
  .form-container {
    max-width: 80%;
  }
}

/* 滚动条样式 */
.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: var(--bg-hover);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
