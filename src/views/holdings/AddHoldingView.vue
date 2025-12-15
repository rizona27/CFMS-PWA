<template>
  <div class="add-holding-view">
    <!-- 使用统一的 NavBar 组件 -->
    <NavBar title="添加持仓" backText="返回" />
    
    <div class="form-scroll">
      <form @submit.prevent="saveHolding" class="holding-form">
        <div class="input-group" :class="{ 'error': clientNameError }">
          <div class="input-icon-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C15.3137 2 18 4.68629 18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8C6 4.68629 8.68629 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 21V19C4 17.9391 4.42143 16.9217 5.17157 16.1716C5.92172 15.4214 6.93913 15 8 15H16C17.0609 15 18.0783 15.4214 18.8284 16.1716C19.5786 16.9217 20 17.9391 20 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="clientName"
              type="text"
              placeholder="客户姓名 (必填, 2-10字符)"
              class="form-input"
              :class="{ 'error': clientNameError }"
              @input="onClientNameInput"
              @blur="formatClientName"
              maxlength="10"
              required
            />
          </div>
          <p class="error-message" v-if="clientNameError">{{ clientNameError }}</p>
        </div>

        <div class="input-group" :class="{ 'error': fundCodeError }">
          <div class="input-icon-wrapper fund-code-row">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="fundCode"
              type="text"
              inputmode="numeric"
              placeholder="基金代码"
              class="form-input fund-code-input"
              :class="{ 'error': fundCodeError }"
              @input="onFundCodeInput"
              maxlength="6"
              required
            />
            <div class="fund-name-display">
              {{ fundName || '基金名称' }}
            </div>
          </div>
          <p class="error-message" v-if="fundCodeError">{{ fundCodeError }}</p>
        </div>

        <!-- 购买金额单独一行 -->
        <div class="input-group" :class="{ 'error': purchaseAmountError }">
          <div class="input-icon-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V8M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model.number="purchaseAmount"
              type="number"
              inputmode="decimal"
              placeholder="购买金额"
              class="form-input"
              :class="{ 'error': purchaseAmountError }"
              @input="validateAmount('purchase_amount')"
              @blur="formatPurchaseAmount"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <p class="error-message" v-if="purchaseAmountError">{{ purchaseAmountError }}</p>
        </div>

        <!-- 购买份额单独一行 -->
        <div class="input-group" :class="{ 'error': purchaseSharesError }">
          <div class="input-icon-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model.number="purchaseShares"
              type="number"
              inputmode="decimal"
              placeholder="持有份额"
              class="form-input"
              :class="{ 'error': purchaseSharesError }"
              @input="validateAmount('purchase_shares')"
              @blur="formatPurchaseShares"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <p class="error-message" v-if="purchaseSharesError">{{ purchaseSharesError }}</p>
        </div>

        <div class="input-group">
          <div class="date-input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="purchaseDate"
              type="date"
              class="form-input date-input-native-styled"
              :max="today"
              @change="onDateChange"
              required
            />
            <span class="date-display">{{ formattedDate }}</span>
            <span class="date-select-arrow">▼</span>
          </div>
        </div>

        <!-- 客户号单独一行 -->
        <div class="input-group">
          <div class="input-icon-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 7C10 8.10457 9.10457 9 8 9C6.89543 9 6 8.10457 6 7C6 5.89543 6.89543 5 8 5C9.10457 5 10 5.89543 10 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 8V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="clientID"
              type="text"
              inputmode="numeric"
              placeholder="客户号 (选填)"
              class="form-input"
              maxlength="12"
              @input="validateClientID"
            />
          </div>
        </div>
        
        <!-- 备注单独一行 -->
        <div class="input-group">
          <div class="input-icon-wrapper-textarea remarks-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <textarea
              v-model="remarks"
              class="form-textarea remarks-textarea"
              placeholder="备注 (选填，最多10个汉字)"
              maxlength="10"
              rows="1"
            ></textarea>
          </div>
          <div class="char-counter">
            {{ remarks.length }}/10
          </div>
        </div>

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
        
        <div v-if="showValidationSummary" class="validation-summary">
          <div class="validation-icon">⚠️</div>
          <div class="validation-message">
            请完成所有必填项：{{ validationErrors.join('，') }}
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="form-button cancel"
            @click="resetForm"
            :disabled="isSaving"
          >
            重置
          </button>
          
          <button
            type="submit"
            class="form-button submit"
            :class="{ 'disabled': !isFormValid || isSaving }"
            :disabled="!isFormValid || isSaving"
          >
            <span v-if="isSaving" class="loading-spinner"></span>
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
        
        <div class="form-spacer"></div>
      </form>
    </div>
    
    <!-- 使用外部ToastMessage组件 -->
    <ToastMessage
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { fundService } from '@/services/fundService'
import type { FundHolding } from '@/stores/dataStore'
import ToastMessage from '@/components/common/ToastMessage.vue'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

const getTodayDate = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

const logAction = (action: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  console.log(`[LOG - ${type.toUpperCase()}] ${action}: ${message}`)
}

const clientName = ref('')
const clientID = ref('')
const fundCode = ref('')
const fundName = ref('')
const purchaseAmount = ref<number | string>('')
const purchaseShares = ref<number | string>('')
const purchaseDate = ref(getTodayDate())
const remarks = ref('')

const clientNameError = ref('')
const fundCodeError = ref('')
const purchaseAmountError = ref('')
const purchaseSharesError = ref('')

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')
const isSaving = ref(false)
const showValidationSummary = ref(false)

const today = computed(() => getTodayDate())
const formattedDate = computed(() => {
  if (!purchaseDate.value) return '购买日期 (必选)'
  try {
    const date = new Date(purchaseDate.value + 'T00:00:00')
    if (isNaN(date.getTime())) return '日期格式错误'
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return purchaseDate.value
  }
})

const isFormValid = computed(() => {
  return clientName.value.trim() !== '' &&
         fundCode.value.trim() !== '' &&
         purchaseAmount.value !== '' &&
         purchaseShares.value !== '' &&
         purchaseDate.value.trim() !== '' &&
         clientNameError.value === '' &&
         fundCodeError.value === '' &&
         purchaseAmountError.value === '' &&
         purchaseSharesError.value === ''
})

const validationErrors = computed(() => {
  const errors: string[] = []
  if (!clientName.value.trim()) errors.push('客户姓名')
  if (!fundCode.value.trim()) errors.push('基金代码')
  if (!purchaseAmount.value) errors.push('购买金额')
  if (!purchaseShares.value) errors.push('购买份额')
  return errors
})

const isFreeUser = computed(() => {
  const currentUser = authStore.currentUser
  return currentUser?.user_type === 'free'
})

const onDateChange = () => {
  logAction('日期选择', `选择购买日期: ${formattedDate.value}`, 'info')
}

const onClientNameInput = () => {
  clientNameError.value = ''
  
  const name = clientName.value
  if (name && !/^[\u4e00-\u9fa5a-zA-Z\s]*$/.test(name)) {
    clientName.value = name.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '')
  }
}

const formatClientName = () => {
  clientName.value = clientName.value.trim()
  validateClientName()
}

const onFundCodeInput = () => {
  fundCodeError.value = ''
  
  const code = fundCode.value
  if (code && !/^\d*$/.test(code)) {
    fundCode.value = code.replace(/\D/g, '')
  }
  
  if (fundCode.value.length > 6) {
    fundCode.value = fundCode.value.substring(0, 6)
  }
  
  if (fundCode.value.length === 6) {
    validateFundCode()
    // 可以在这里添加基金名称查询
  }
}

const formatPurchaseAmount = () => {
  if (purchaseAmount.value) {
    const amount = parseFloat(purchaseAmount.value.toString())
    if (!isNaN(amount)) {
      purchaseAmount.value = parseFloat(amount.toFixed(2))
    }
  }
  validateAmount('purchase_amount')
}

const formatPurchaseShares = () => {
  if (purchaseShares.value) {
    const shares = parseFloat(purchaseShares.value.toString())
    if (!isNaN(shares)) {
      purchaseShares.value = parseFloat(shares.toFixed(2))
    }
  }
  validateAmount('purchase_shares')
}

const validateClientID = () => {
  const id = clientID.value.trim()
  if (id && !/^\d{0,12}$/.test(id)) {
    clientID.value = id.replace(/\D/g, '').slice(0, 12)
  }
}

const validateClientName = () => {
  const name = clientName.value.trim()
  clientNameError.value = ''
  
  if (!name) {
    clientNameError.value = '客户姓名不能为空'
    return
  }
  
  const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z\s]+$/
  if (!allowedPattern.test(name)) {
    clientNameError.value = '姓名只能包含中文、英文和空格'
    return
  }
  
  const hasChinese = /[\u4e00-\u9fa5]/.test(name)
  if (hasChinese) {
    if (name.length > 5) {
      clientNameError.value = '姓名包含汉字时，总长度不能超过5个字符'
      return
    }
  } else {
    if (name.length > 15) {
      clientNameError.value = '英文姓名不超过15个字母'
      return
    }
  }
  clientNameError.value = ''
}

const validateFundCode = () => {
  const code = fundCode.value.trim()
  fundCodeError.value = ''
  
  if (!code) {
    fundCodeError.value = '基金代码不能为空'
    return
  }
  
  if (!/^\d{6}$/.test(code)) {
    fundCodeError.value = '基金代码必须是6位数字'
    return
  }
  
  fundCodeError.value = ''
}

const validateAmount = (field: string) => {
  let value: number
  let errorRef: any
  
  if (field === 'purchase_amount') {
    value = parseFloat(purchaseAmount.value.toString())
    errorRef = purchaseAmountError
  } else {
    value = parseFloat(purchaseShares.value.toString())
    errorRef = purchaseSharesError
  }
  
  errorRef.value = ''
  
  if (isNaN(value) || value <= 0) {
    errorRef.value = '必须大于0'
    return
  }
  
  if (field === 'purchase_amount' && value > 999999999.99) {
    errorRef.value = '金额不能超过十亿'
    return
  }
  
  if (field === 'purchase_shares' && value > 999999999.99) {
    errorRef.value = '份额不能超过十亿'
    return
  }
}

const fetchAndEnrichFundInfo = async (holdingId: string, code: string) => {
  logAction('基金信息查询', `开始查询基金代码: ${code}`, 'info')
  try {
    const fundInfo = await fundService.fetchFundInfo(code)
    
    // 修复点: 临时将 fundInfo 转换为 any 来解决 TS2339 错误，并确保 navDate 类型转换正确
    const info: any = fundInfo;

    if (info) {
      dataStore.updateHolding(holdingId, {
        fundName: info.name,
        currentNav: info.currentNav,
        // 修复 TS2322: 将字符串日期转换为 Date 对象
        navDate: new Date(info.navDate),
        navReturn1m: info.navReturn1m,
        navReturn3m: info.navReturn3m,
        navReturn6m: info.navReturn6m,
        navReturn1y: info.navReturn1y,
      })
      logAction('基金信息查询', `成功更新基金 ${code}: ${info.name}`, 'success')
      fundName.value = info.name // 更新当前页面显示的基金名称
    } else {
      dataStore.updateHolding(holdingId, {
        fundName: '信息未找到/代码无效',
        isValid: false
      })
      logAction('基金信息查询', `未能找到基金代码 ${code} 的信息`, 'warning')
    }
  } catch (error) {
    dataStore.updateHolding(holdingId, {
      fundName: '查询失败',
      isValid: false
    })
    logAction('基金信息查询', `查询基金代码 ${code} 失败: ${error}`, 'error')
  }
}

const saveHolding = () => {
  validateClientName()
  validateFundCode()
  formatPurchaseAmount()
  formatPurchaseShares()
  
  if (!isFormValid.value || clientNameError.value || fundCodeError.value || purchaseAmountError.value || purchaseSharesError.value) {
    showValidationSummary.value = true
    showToastMessage('请检查表单中的错误', 'warning')
    return
  }
  
  if (!clientName.value.trim() || !fundCode.value.trim() || !purchaseAmount.value || !purchaseShares.value) {
    showValidationSummary.value = true
    showToastMessage('请完成所有必填项', 'warning')
    return
  }
  showValidationSummary.value = false
  
  if (isFreeUser.value) {
    const clientNameTrimmed = clientName.value.trim()
    const existingClientNames = new Set(dataStore.holdings.map(h => h.clientName))
    const clientHoldings = dataStore.holdings.filter(h => h.clientName === clientNameTrimmed)
    
    if (!existingClientNames.has(clientNameTrimmed) && existingClientNames.size >= 5) {
      showToastMessage('基础用户最多添加5个不同的客户', 'warning')
      return
    }
    
    if (clientHoldings.length >= 2) {
      showToastMessage('基础用户每个客户最多添加2个产品', 'warning')
      return
    }
  }
  
  isSaving.value = true
  
  try {
    const newHolding: FundHolding = {
      id: crypto.randomUUID(),
      clientName: clientName.value.trim(),
      clientID: clientID.value.trim(),
      fundCode: fundCode.value.trim(),
      purchaseAmount: parseFloat(purchaseAmount.value.toString()),
      purchaseShares: parseFloat(purchaseShares.value.toString()),
      purchaseDate: new Date(purchaseDate.value),
      remarks: remarks.value.trim(),
      fundName: '正在获取信息...',
      currentNav: 0,
      navDate: new Date(0),
      isValid: true,
      isPinned: false,
      pinnedTimestamp: undefined,
      navReturn1m: undefined,
      navReturn3m: undefined,
      navReturn6m: undefined,
      navReturn1y: undefined
    }
    
    const savedHolding = dataStore.addHolding(newHolding)
    showToastMessage('持仓基础数据添加成功，正在后台更新基金信息', 'success')
    fetchAndEnrichFundInfo(savedHolding.id, savedHolding.fundCode)
    resetForm()
    
    setTimeout(() => {
      router.push('/holdings/manage')
    }, 1500)
    
  } catch (error: any) {
    showToastMessage('添加持仓失败，请重试', 'error')
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  clientName.value = ''
  clientID.value = ''
  fundCode.value = ''
  fundName.value = ''
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

const showToastMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

onMounted(() => {
  // 记录访问日志
  logAction('页面访问', '打开 AddHoldingView 页面', 'info')
  
  // 尝试在页面加载时获取初始的 fundName，如果 fundCode 已经存在
  if (fundCode.value.length === 6) {
    // 假设 fundCode 是从路由参数或其他地方恢复的
    validateFundCode()
    // 实际应用中需要调用一次 fetchAndEnrichFundInfo (这里简化处理)
  }
})
</script>

<style scoped>
/* ------------------------------------- */
/* 修复点 1: 确保整个页面布局和固定头部 */
/* ------------------------------------- */
.add-holding-view {
  height: 100vh; /* 确保占据整个视口高度 */
  display: flex; /* 启用 Flex 布局 */
  flex-direction: column; /* 垂直排列 */
  overflow: hidden; /* 隐藏主容器滚动条 */
  background: var(--bg-background, #f8fafc);
  max-width: 768px;
  margin: 0 auto;
  position: relative;
}

/* 移除原有的固定头部，因为现在使用 NavBar */
.fixed-header {
  display: none;
}

.form-toolbar {
  display: none;
}

.form-scroll {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 允许内部滚动 */
  padding: 12px 16px 0;
}

/* ------------------------------------- */
/* 通用表单和输入样式 */
/* ------------------------------------- */
.holding-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 移除 .input-row 样式，因为不再需要并排布局 */
.input-group {
  margin-bottom: 8px;
  position: relative;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-icon-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-hover-light);
  transition: all 0.2s ease;
  padding: 0 12px;
  min-height: 42px;
}

.input-group.error .input-icon-wrapper {
  border-color: #ff416c;
  box-shadow: 0 0 0 2px rgba(255, 65, 108, 0.2);
}

.input-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  margin-right: 8px;
}

.form-input {
  flex-grow: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  -webkit-appearance: none;
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

/* ------------------------------------- */
/* 修复点 2: 基金代码和名称输入框宽度调整 */
/* ------------------------------------- */
.fund-code-row {
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.fund-code-input {
  width: 48px; /* 桌面端宽度 */
  flex: 0 0 48px; /* 确保宽度固定 */
  margin-right: 8px;
  padding-right: 0;
  font-size: 14px;
  text-align: left;
  padding-left: 4px;
}

.fund-name-display {
  flex: 1; /* 占据剩余所有空间 */
  min-width: 0;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-secondary);
  background: transparent;
  border-left: 1px solid var(--border-color);
  padding-left: 12px;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

/* ------------------------------------- */
/* 其他输入样式 */
/* ------------------------------------- */
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-hover-light);
  padding: 0 12px;
  min-height: 42px;
}

.date-input-native-styled {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0; /* 隐藏原生日期选择器 */
  cursor: pointer;
}

.date-display {
  flex-grow: 1;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-primary);
  pointer-events: none; /* 防止点击此文本干扰日期选择 */
}

.date-select-arrow {
  color: var(--text-secondary);
  margin-left: 8px;
  font-size: 10px;
  pointer-events: none;
}

.input-icon-wrapper-textarea {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-hover-light);
  transition: all 0.2s ease;
  padding: 0 12px;
  min-height: 42px;
}

.remarks-wrapper {
  align-items: flex-start;
  min-height: 42px;
}

.remarks-textarea {
  flex-grow: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  resize: none;
  line-height: 1.4;
  height: 40px; /* 初始高度 */
  overflow: hidden;
  margin-left: 8px;
}

.form-textarea {
  flex-grow: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  resize: none;
  line-height: 1.4;
  margin-left: 8px;
}

/* ------------------------------------- */
/* 按钮和消息样式 */
/* ------------------------------------- */
.form-actions {
  display: flex;
  gap: 12px;
  padding: 16px 0 20px;
}

.form-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.cancel {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

.cancel:hover:not(:disabled) {
  background: var(--bg-hover-dark);
}

.form-button.disabled,
.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  font-size: 12px;
  color: #ff416c;
  margin: 2px 0 0 0;
  font-weight: 500;
  padding-left: 28px;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
  padding-right: 4px;
}

/* 移除原有的 back-button-pill 样式 */

.user-limit-card {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1));
  border: 2px solid rgba(33, 150, 243, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
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
  border: 2px solid rgba(255, 165, 0, 0.3);
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.validation-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.validation-message {
  color: var(--text-primary);
}

/* 移除内部 toast 样式，因为使用外部组件 */

/* ------------------------------------- */
/* 深色模式适配 */
/* ------------------------------------- */
:root.dark .fund-name-display {
  border-left-color: var(--border-color-dark);
}

/* ------------------------------------- */
/* 移动端优化 */
/* ------------------------------------- */
@media (max-width: 768px) {
  .form-scroll {
    padding: 6px 16px;
  }

  /* Q2 移动端基金代码输入框宽度调整 */
  .fund-code-input {
    width: 64px; /* 调整为可容纳6位数字并留出2位余量 (约8个数字宽度) */
    flex: 0 0 64px; /* 确保宽度固定 */
    font-size: 13px;
    padding-left: 4px;
  }
  
  .form-input,
  .form-textarea,
  .date-display {
    padding: 8px 0;
    font-size: 13px;
  }
  
  .fund-name-display {
    font-size: 13px;
    padding: 8px 0;
    padding-left: 10px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 6px;
    padding: 8px 0 12px;
  }
  
  .form-button {
    padding: 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .add-holding-view {
    border-radius: 12px;
  }
  
  .form-scroll {
    padding: 6px 14px;
  }
  
  .holding-form {
    gap: 4px;
  }
}
</style>
