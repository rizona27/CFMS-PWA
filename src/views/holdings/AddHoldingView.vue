<template>
  <div class="add-holding-view">
    
    <div class="top-actions">
      <button class="back-button-pill" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
    </div>

    <div class="config-scroll-area">
      <div class="config-content-wrapper">
        <div class="config-content">
          
          <div class="form-container" ref="formContainer">
            
            <div class="form-section">
              <h2 class="section-heading">
                必填信息 <span class="required-hint">(*)</span>
              </h2>
              
              <div class="input-group" :class="{ 'error': clientNameError }">
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C15.3137 2 18 4.68629 18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8C6 4.68629 8.68629 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 21V19C4 17.9391 4.42143 16.9217 5.17157 16.1716C5.92172 15.4214 6.93913 15 8 15H16C17.0609 15 18.0783 15.4214 18.8284 16.1716C19.5786 16.9217 20 17.9391 20 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="clientName"
                    type="text"
                    name="clientName"
                    id="clientNameInput"
                    placeholder="客户姓名 (必填, 2-10字符)"
                    class="form-input"
                    :class="{ 'error': clientNameError }"
                    @input="onClientNameInput"
                    @blur="formatClientName"
                    maxlength="10"
                  />
                </div>
                <p class="error-message" v-if="clientNameError">{{ clientNameError }}</p>
              </div>
              
              <div class="input-group" :class="{ 'error': fundCodeError }">
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="fundCode"
                    type="text"
                    inputmode="numeric"
                    name="fundCode"
                    id="fundCodeInput"
                    placeholder="基金代码 (必填, 6位数字)"
                    class="form-input"
                    :class="{ 'error': fundCodeError }"
                    @input="onFundCodeInput"
                    maxlength="6"
                  />
                </div>
                <p class="error-message" v-if="fundCodeError">{{ fundCodeError }}</p>
              </div>
              
              <div class="input-group" :class="{ 'error': purchaseAmountError }">
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V8M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="purchaseAmount"
                    type="number"
                    inputmode="decimal"
                    name="purchaseAmount"
                    id="purchaseAmountInput"
                    placeholder="购买金额 (¥)"
                    class="form-input"
                    :class="{ 'error': purchaseAmountError }"
                    @blur="formatPurchaseAmount"
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <p class="error-message" v-if="purchaseAmountError">{{ purchaseAmountError }}</p>
              </div>
              
              <div class="input-group" :class="{ 'error': purchaseSharesError }">
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="purchaseShares"
                    type="number"
                    inputmode="decimal"
                    name="purchaseShares"
                    id="purchaseSharesInput"
                    placeholder="购买份额 (份)"
                    class="form-input"
                    :class="{ 'error': purchaseSharesError }"
                    @blur="formatPurchaseShares"
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <p class="error-message" v-if="purchaseSharesError">{{ purchaseSharesError }}</p>
              </div>
              
              <div class="input-group">
                <div class="date-input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="purchaseDate"
                    type="date"
                    name="purchaseDate"
                    id="purchaseDateInput"
                    class="form-input date-input-native-styled"
                    :max="today"
                    @change="onDateChange"
                  />
                  <span class="date-display">{{ formattedDate }}</span>
                  <span class="date-select-arrow">▼</span>
                </div>
              </div>
            </div>
            
            <hr class="section-divider" />

            <div class="form-section">
              <h2 class="section-heading">可选信息 <span class="optional-hint">(选填)</span></h2>
              
              <div class="input-group">
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 7C10 8.10457 9.10457 9 8 9C6.89543 9 6 8.10457 6 7C6 5.89543 6.89543 5 8 5C9.10457 5 10 5.89543 10 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 8V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="clientID"
                    type="text"
                    inputmode="numeric"
                    name="clientID"
                    id="clientIDInput"
                    placeholder="客户号 (选填, 最多12位数字)"
                    class="form-input"
                    maxlength="12"
                    @input="validateClientID"
                  />
                </div>
              </div>
              
              <div class="input-group">
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 13H15M9 9H15M10 17H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <input
                    v-model="remarks"
                    type="text"
                    name="remarks"
                    id="remarksInput"
                    placeholder="备注 (最多10个字符)"
                    class="form-input"
                    maxlength="10"
                    @input="validateRemarks"
                  />
                </div>
                <div class="char-counter">
                  {{ remarks.length }}/10
                </div>
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
              <button class="form-button cancel" @click="resetForm">
                重置
              </button>
              <button
                class="form-button submit"
                :class="{ 'disabled': !isFormValid }"
                @click="saveHolding"
                :disabled="!isFormValid || isSaving"
              >
                <span v-if="isSaving" class="loading-spinner"></span>
                {{ isSaving ? '保存中...' : '保存' }}
              </button>
            </div>
            
            <div class="form-spacer"></div>

          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showToast" class="toast-message" :class="toastType">
      {{ toastMessage }}
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
const purchaseAmount = ref('')
const purchaseShares = ref('')
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
         purchaseDate.value.trim() !== ''
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

const goBack = () => {
  router.push('/holdings/manage')
}

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
}

const formatPurchaseAmount = () => {
  if (purchaseAmount.value) {
    const amount = parseFloat(purchaseAmount.value)
    if (!isNaN(amount)) {
      purchaseAmount.value = amount.toFixed(2)
    }
  }
}

const formatPurchaseShares = () => {
  if (purchaseShares.value) {
    const shares = parseFloat(purchaseShares.value)
    if (!isNaN(shares)) {
      purchaseShares.value = shares.toFixed(2)
    }
  }
}

const validateClientID = () => {
  const id = clientID.value.trim()
  if (id && !/^\d{0,12}$/.test(id)) {
    clientID.value = id.replace(/\D/g, '').slice(0, 12)
  }
}

const validateRemarks = () => {
  const remarksText = remarks.value
  const maxLength = 10
  
  if (remarksText.length > maxLength) {
    remarks.value = remarksText.slice(0, maxLength)
  }
}

const validateForm = () => {
  let isValid = true
  
  const name = clientName.value.trim()
  clientNameError.value = ''
  
  if (!name) {
    clientNameError.value = '客户姓名不能为空'
    isValid = false
  } else if (name.length < 2 || name.length > 10) {
    clientNameError.value = '姓名长度应为2-10个字符'
    isValid = false
  } else if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(name)) {
    clientNameError.value = '姓名只能包含中文、英文和空格'
    isValid = false
  }
  
  const code = fundCode.value.trim()
  fundCodeError.value = ''
  
  if (!code) {
    fundCodeError.value = '基金代码不能为空'
    isValid = false
  } else if (!/^\d{6}$/.test(code)) {
    fundCodeError.value = '基金代码必须是6位数字'
    isValid = false
  }
  
  const amountStr = purchaseAmount.value
  purchaseAmountError.value = ''
  
  if (!amountStr) {
    purchaseAmountError.value = '购买金额不能为空'
    isValid = false
  } else {
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      purchaseAmountError.value = '请输入有效的正数金额'
      isValid = false
    } else if (amount > 100000000) {
      purchaseAmountError.value = '金额不能超过1亿元'
      isValid = false
    }
  }
  
  const sharesStr = purchaseShares.value
  purchaseSharesError.value = ''
  
  if (!sharesStr) {
    purchaseSharesError.value = '购买份额不能为空'
    isValid = false
  } else {
    const shares = parseFloat(sharesStr)
    if (isNaN(shares) || shares <= 0) {
      purchaseSharesError.value = '请输入有效的正数份额'
      isValid = false
    } else if (shares > 10000000) {
      purchaseSharesError.value = '份额不能超过1000万份'
      isValid = false
    }
  }
  
  return isValid
}

const fetchAndEnrichFundInfo = async (holdingId: string, fundCode: string) => {
  try {
    logAction('基金查询', `后台查询基金信息: ${fundCode}`, 'info')
    const fundInfo = await fundService.fetchFundInfo(fundCode)
    
    if (fundInfo && fundInfo.name) {
      dataStore.updateHolding(holdingId, {
        fundName: fundInfo.name,
        currentNav: fundInfo.nav,
        navDate: new Date(fundInfo.navDate),
        isValid: true
      })
      logAction('基金查询', `持仓 ${fundCode} 信息更新成功: ${fundInfo.name}`, 'success')
    } else {
      dataStore.updateHolding(holdingId, {
        fundName: '未知基金',
        isValid: false,
      })
      logAction('基金查询', `基金查询失败，已保存基础数据，请手动检查代码: ${fundCode}`, 'error')
    }
  } catch (error: any) {
    logAction('基金查询', `后台查询基金信息发生错误: ${error.message}`, 'error')
    dataStore.updateHolding(holdingId, {
      fundName: '未知基金',
      isValid: false,
    })
  }
}

const saveHolding = async () => {
  const isFormValid = validateForm()
  
  if (!isFormValid) {
    showValidationSummary.value = true
    showToastMessage('请检查表单中的错误', 'warning')
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
      purchaseAmount: parseFloat(purchaseAmount.value),
      purchaseShares: parseFloat(purchaseShares.value),
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
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

onMounted(() => {
})
</script>

<style scoped>
.add-holding-view {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:root.dark .add-holding-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.top-actions {
  padding: 16px 16px 0;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.config-scroll-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.config-content-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.config-content {
  padding: 0 0 100px;
}

.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 20px;
  color: var(--text-primary, #1e293b);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button-pill:hover {
  background: var(--accent-color, #3b82f6);
  color: white;
  border-color: var(--accent-color, #3b82f6);
  transform: translateX(-2px);
}

:root.dark .back-button-pill {
  background: var(--bg-hover, rgba(255, 255, 255, 0.05));
  border-color: var(--border-color, #334155);
  color: var(--text-primary, #f1f5f9);
}

:root.dark .back-button-pill:hover {
  background: var(--accent-color, #60a5fa);
  border-color: var(--accent-color, #60a5fa);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.form-container {
  padding: 0 8px;
}

.form-section {
  margin-bottom: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:root.dark .form-section {
  background: var(--bg-card-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.section-heading {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-color, #3b82f6);
  border-bottom: 2px solid var(--border-color-light);
  padding-bottom: 8px;
  margin: 0 0 16px 0;
}

:root.dark .section-heading {
  border-bottom: 2px solid var(--border-color-dark);
}

.required-hint {
  color: #ff416c;
  font-size: 16px;
}

.optional-hint {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
}

.section-divider {
  border: 0;
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

.input-group {
  margin-bottom: 16px;
  position: relative;
}

.input-icon-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-hover-light);
  transition: all 0.2s ease;
  padding: 0 16px 0 8px;
  min-height: 48px;
}

:root.dark .input-icon-wrapper {
  background: var(--bg-hover-dark);
  border-color: var(--border-color-dark);
}

.input-icon-wrapper:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.input-icon {
  flex-shrink: 0;
  color: var(--accent-color);
  margin-right: 8px;
}

.form-input {
  flex-grow: 1;
  padding: 12px 0;
  border: none;
  font-size: 16px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  box-sizing: border-box;
  min-height: 24px;
}

:root.dark .form-input {
  color: var(--text-primary-dark);
}

.input-group.error .input-icon-wrapper {
  border-color: #ff416c;
  background: rgba(255, 65, 108, 0.05);
}

.input-group.error .input-icon-wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(255, 65, 108, 0.2);
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

.error-message {
  font-size: 12px;
  color: #ff416c;
  margin: 4px 0 0 0;
  font-weight: 500;
  padding-left: 28px;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-hover-light);
  transition: all 0.2s ease;
  padding: 0 16px 0 8px;
  min-height: 48px;
}

.date-input-native-styled {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  padding: 0;
}

.date-display {
  flex: 1;
  padding: 12px 0 12px 0;
  font-size: 16px;
  color: var(--text-primary);
  z-index: 1;
  margin-left: 8px;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.date-select-arrow {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1;
  z-index: 1;
  margin-left: 8px;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  padding-right: 4px;
}

.user-limit-card {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1));
  border: 2px solid rgba(33, 150, 243, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

:root.dark .user-limit-card {
  background: rgba(33, 150, 243, 0.15);
  border: 2px solid rgba(33, 150, 243, 0.5);
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

:root.dark .limit-content {
  color: var(--text-primary-dark);
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
  margin-bottom: 16px;
}

:root.dark .validation-summary {
  background: rgba(255, 215, 0, 0.15);
  border: 2px solid rgba(255, 215, 0, 0.5);
}

.validation-icon {
  font-size: 20px;
}

.validation-message {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
}

:root.dark .validation-message {
  color: var(--text-primary-dark);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding: 0 0 24px;
  margin-top: 16px;
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
  background: var(--bg-hover-light);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

:root.dark .form-button.cancel {
  background: var(--bg-hover-dark);
  color: var(--text-primary-dark);
  border-color: var(--border-color-dark);
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
  background: var(--bg-hover-light);
  color: var(--text-secondary);
  box-shadow: none;
}

:root.dark .form-button.submit.disabled {
  background: var(--bg-hover-dark);
  color: var(--text-secondary);
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

.form-spacer {
  height: 40px;
}

@media (max-width: 768px) {
  .top-actions {
    padding: 10px 12px 0;
    margin-bottom: 6px;
  }
  
  .back-button-pill {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .config-content-wrapper {
    padding: 0 12px;
  }
  
  .form-section {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .section-divider {
    margin: 6px 0;
  }

  .form-input,
  .date-display,
  .form-textarea {
    padding: 10px 0;
    font-size: 15px;
  }
  
  .input-icon-wrapper,
  .input-icon-wrapper-textarea,
  .date-input-wrapper {
    padding: 0 14px 0 8px;
    min-height: 44px;
  }

  .date-display {
    padding: 10px 0 10px 0;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
    padding: 0 0 16px;
    margin-top: 12px;
  }
  
  .form-button {
    padding: 14px;
  }
  
  .toast-message {
    bottom: 80px;
    max-width: 90%;
    font-size: 14px;
  }
}
</style>
