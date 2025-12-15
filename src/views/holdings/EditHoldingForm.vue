<template>
  <div class="edit-holding-form">
    <!-- 固定顶部工具栏 -->
    <div class="fixed-header">
      <div class="form-toolbar">
        <button class="back-button-pill" @click="handleCancel">
          <span class="back-icon">←</span>
          返回
        </button>
      </div>
    </div>
    
    <div class="form-scroll">
      <form @submit.prevent="handleSubmit" class="holding-form">
        <!-- 客户姓名 -->
        <div class="input-group" :class="{ 'error': errors.client_name }">
          <div class="input-icon-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C15.3137 2 18 4.68629 18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8C6 4.68629 8.68629 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 21V19C4 17.9391 4.42143 16.9217 5.17157 16.1716C5.92172 15.4214 6.93913 15 8 15H16C17.0609 15 18.0783 15.4214 18.8284 16.1716C19.5786 16.9217 20 17.9391 20 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="formData.client_name"
              type="text"
              placeholder="客户姓名 (必填)"
              class="form-input"
              :class="{ 'error': errors.client_name }"
              @input="validateClientName"
              @blur="formatClientName"
              maxlength="10"
              required
            />
          </div>
          <p class="error-message" v-if="errors.client_name">{{ errors.client_name }}</p>
        </div>

        <!-- 基金代码和名称 -->
        <div class="input-group" :class="{ 'error': errors.fund_code }">
          <div class="input-icon-wrapper fund-code-row">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="formData.fund_code"
              type="text"
              inputmode="numeric"
              placeholder="基金代码"
              class="form-input fund-code-input"
              :class="{ 'error': errors.fund_code }"
              @input="validateFundCode"
              maxlength="6"
              required
            />
            <div class="fund-name-display">
              {{ formData.fund_name || '基金名称' }}
            </div>
          </div>
          <p class="error-message" v-if="errors.fund_code">{{ errors.fund_code }}</p>
        </div>

        <!-- 购买金额、份额和日期 -->
        <div class="input-row">
          <div class="input-group" :class="{ 'error': errors.purchase_amount }">
            <div class="input-icon-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16V8M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                v-model.number="formData.purchase_amount"
                type="number"
                inputmode="decimal"
                placeholder="购买金额"
                class="form-input"
                :class="{ 'error': errors.purchase_amount }"
                @input="validateAmount('purchase_amount')"
                @blur="formatPurchaseAmount"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <p class="error-message" v-if="errors.purchase_amount">{{ errors.purchase_amount }}</p>
          </div>

          <div class="input-group" :class="{ 'error': errors.purchase_shares }">
            <div class="input-icon-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                v-model.number="formData.purchase_shares"
                type="number"
                inputmode="decimal"
                placeholder="持有份额"
                class="form-input"
                :class="{ 'error': errors.purchase_shares }"
                @input="validateAmount('purchase_shares')"
                @blur="formatPurchaseShares"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <p class="error-message" v-if="errors.purchase_shares">{{ errors.purchase_shares }}</p>
          </div>
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
              v-model="formData.purchase_date"
              type="date"
              class="form-input date-input-native-styled"
              :max="maxDate"
              @change="validateDate"
              required
            />
            <span class="date-display">{{ formattedDate }}</span>
            <span class="date-select-arrow">▼</span>
          </div>
          <p class="error-message" v-if="errors.purchase_date">{{ errors.purchase_date }}</p>
        </div>

        <!-- 客户号和备注 -->
        <div class="input-row">
          <div class="input-group" :class="{ 'error': errors.client_id }">
            <div class="input-icon-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 7C10 8.10457 9.10457 9 8 9C6.89543 9 6 8.10457 6 7C6 5.89543 6.89543 5 8 5C9.10457 5 10 5.89543 10 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 8V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                v-model="formData.client_id"
                type="text"
                inputmode="numeric"
                placeholder="客户号 (选填)"
                class="form-input"
                :class="{ 'error': errors.client_id }"
                maxlength="12"
                @input="validateClientId"
              />
            </div>
            <p class="error-message" v-if="errors.client_id">{{ errors.client_id }}</p>
          </div>
          
          <div class="input-group">
            <div class="input-icon-wrapper-textarea remarks-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <textarea
                v-model="formData.remarks"
                class="form-textarea remarks-textarea"
                placeholder="备注 (选填，最多10个汉字)"
                maxlength="10"
                rows="1"
              ></textarea>
            </div>
            <div class="char-counter">
              {{ formData.remarks?.length || 0 }}/10
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="form-button cancel"
            @click="handleReset"
            :disabled="isSubmitting"
          >
            重置
          </button>
          
          <button
            type="submit"
            class="form-button submit"
            :class="{ 'disabled': !isFormValid || isSubmitting }"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-spinner"></span>
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
        
        <div class="form-spacer"></div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'

interface Props {
  holding?: any | null
}

const props = withDefaults(defineProps<Props>(), {
  holding: null
})

const emit = defineEmits<{
  (e: 'save', holding: any): void
  (e: 'cancel'): void
}>()

const dataStore = useDataStore()

const isSubmitting = ref(false)

const formData = ref({
  id: '',
  client_name: '',
  client_id: '',
  fund_code: '',
  fund_name: '',
  purchase_amount: 0,
  purchase_shares: 0,
  purchase_date: '',
  current_nav: 0,
  nav_date: '',
  remarks: '',
  created_at: '',
  updated_at: '',
  nav_return_1m: undefined as number | undefined,
  nav_return_3m: undefined as number | undefined,
  nav_return_6m: undefined as number | undefined,
  nav_return_1y: undefined as number | undefined
})

const errors = ref({
  client_name: '',
  client_id: '',
  fund_code: '',
  purchase_amount: '',
  purchase_shares: '',
  purchase_date: ''
})

const formatPurchaseAmount = () => {
  if (formData.value.purchase_amount) {
    const amount = parseFloat(formData.value.purchase_amount.toString())
    if (!isNaN(amount)) {
      formData.value.purchase_amount = parseFloat(amount.toFixed(2))
    }
  }
}

const formatPurchaseShares = () => {
  if (formData.value.purchase_shares) {
    const shares = parseFloat(formData.value.purchase_shares.toString())
    if (!isNaN(shares)) {
      formData.value.purchase_shares = parseFloat(shares.toFixed(4))
    }
  }
}

const formatClientName = () => {
  formData.value.client_name = formData.value.client_name.trim()
}

const formattedDate = computed(() => {
  if (!formData.value.purchase_date) return '购买日期'
  try {
    const date = new Date(formData.value.purchase_date + 'T00:00:00')
    if (isNaN(date.getTime())) return '日期格式错误'
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return formData.value.purchase_date
  }
})

const loadFormData = (holding: any) => {
  if (holding) {
    formData.value = {
      id: holding.id || crypto.randomUUID(),
      client_name: holding.clientName || holding.client_name || '',
      client_id: holding.clientID || holding.client_id || '',
      fund_code: holding.fundCode || holding.fund_code || '',
      fund_name: holding.fundName || holding.fund_name || '',
      purchase_amount: holding.purchaseAmount || holding.purchase_amount || 0,
      purchase_shares: holding.purchaseShares || holding.purchase_shares || 0,
      purchase_date: holding.purchaseDate
        ? (holding.purchaseDate instanceof Date
          ? holding.purchaseDate.toISOString().split('T')[0]
          : holding.purchaseDate.split('T')[0])
        : getTodayDate(),
      current_nav: holding.currentNav || holding.current_nav || 0,
      nav_date: holding.navDate
        ? (holding.navDate instanceof Date
          ? holding.navDate.toISOString().split('T')[0]
          : holding.navDate.split('T')[0])
        : getTodayDate(),
      remarks: holding.remarks || '',
      created_at: holding.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: holding.updated_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
      nav_return_1m: holding.navReturn1m || holding.nav_return_1m,
      nav_return_3m: holding.navReturn3m || holding.nav_return_3m,
      nav_return_6m: holding.navReturn6m || holding.nav_return_6m,
      nav_return_1y: holding.navReturn1y || holding.nav_return_1y
    }
    
    formatPurchaseAmount()
    formatPurchaseShares()
  }
}

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

const resetForm = () => {
  const now = getTodayDate()
  
  formData.value = {
    id: crypto.randomUUID(),
    client_name: '',
    client_id: '',
    fund_code: '',
    fund_name: '',
    purchase_amount: 0,
    purchase_shares: 0,
    purchase_date: now,
    current_nav: 0,
    nav_date: now,
    remarks: '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    nav_return_1m: undefined,
    nav_return_3m: undefined,
    nav_return_6m: undefined,
    nav_return_1y: undefined
  }
  
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
}

const maxDate = computed(() => {
  return getTodayDate()
})

const isFormValid = computed(() => {
  return (
    formData.value.client_name.trim() !== '' &&
    formData.value.fund_code.trim() !== '' &&
    formData.value.purchase_amount > 0 &&
    formData.value.purchase_shares > 0 &&
    formData.value.purchase_date !== '' &&
    Object.values(errors.value).every(error => error === '')
  )
})

const validateClientName = () => {
  const name = formData.value.client_name.trim()
  
  if (name === '') {
    errors.value.client_name = '姓名不能为空'
    return
  }
  
  const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z\s]+$/
  if (!allowedPattern.test(name)) {
    errors.value.client_name = '姓名只能包含汉字、英文字母和空格'
    return
  }
  
  const hasChinese = /[\u4e00-\u9fa5]/.test(name)
  if (hasChinese) {
    if (name.length > 5) {
      errors.value.client_name = '姓名包含汉字时，总长度不能超过5个字符'
      return
    }
  } else {
    if (name.length > 15) {
      errors.value.client_name = '英文姓名不超过15个字母'
      return
    }
  }
  
  errors.value.client_name = ''
}

const validateClientId = () => {
  const clientId = formData.value.client_id.trim()
  
  if (clientId === '') {
    errors.value.client_id = ''
    return
  }
  
  if (!/^\d+$/.test(clientId)) {
    errors.value.client_id = '客户编号只能包含数字'
    return
  }
  
  if (clientId.length > 12) {
    errors.value.client_id = '客户编号不能超过12位数字'
    return
  }
  
  errors.value.client_id = ''
}

const validateFundCode = () => {
  const code = formData.value.fund_code.trim()
  
  if (code === '') {
    errors.value.fund_code = '基金代码不能为空'
    return
  }
  
  if (!/^\d{6}$/.test(code)) {
    errors.value.fund_code = '基金代码必须是6位数字'
    return
  }
  
  errors.value.fund_code = ''
}

const validateAmount = (field: 'purchase_amount' | 'purchase_shares') => {
  const value = formData.value[field]
  
  if (value <= 0) {
    errors.value[field] = '必须大于0'
    return
  }
  
  if (field === 'purchase_amount' && value > 999999999.99) {
    errors.value[field] = '金额不能超过999,999,999.99'
    return
  }
  
  if (field === 'purchase_shares' && value > 999999.9999) {
    errors.value[field] = '份额不能超过999,999.9999'
    return
  }
  
  errors.value[field] = ''
}

const validateDate = () => {
  const date = formData.value.purchase_date
  
  if (date === '') {
    errors.value.purchase_date = '购买日期不能为空'
    return
  }
  
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate > today) {
    errors.value.purchase_date = '购买日期不能晚于今天'
    return
  }
  
  errors.value.purchase_date = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const updatedData = {
      ...formData.value,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    if (!updatedData.created_at) {
      updatedData.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    dataStore.addLog(`编辑持仓: ${updatedData.client_name} - ${updatedData.fund_code}`, 'info')
    
    emit('save', updatedData)
    
  } catch (error) {
    console.error('保存失败:', error)
    dataStore.addLog(`编辑持仓失败: ${error}`, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleReset = () => {
  if (confirm('确定要重置表单吗？所有修改将会丢失。')) {
    loadFormData(props.holding)
  }
}

watch(() => props.holding, (newHolding) => {
  if (newHolding) {
    loadFormData(newHolding)
  }
}, { immediate: true })

onMounted(() => {
  if (!props.holding) {
    resetForm()
  }
})
</script>

<style scoped>
.edit-holding-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 85vh;
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
}

/* 固定顶部工具栏 */
.fixed-header {
  flex-shrink: 0;
  z-index: 100;
  position: relative;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 0;
  background: var(--bg-primary);
}

.form-toolbar {
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
  z-index: 10;
}

.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
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

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  max-height: calc(85vh - 60px);
}

.holding-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.input-row .input-group {
  flex: 1;
  margin-bottom: 0;
}

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

.fund-code-row {
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.fund-code-input {
  width: 50px; /* 调整基金代码输入框宽度 */
  flex: 0 0 auto;
  margin-right: 6px;
  padding-right: 0;
  font-size: 14px;
  text-align: center;
}

.fund-name-display {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-secondary);
  background: transparent;
  border-left: 1px solid var(--border-color);
  padding-left: 10px;
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  height: 42px;
  min-height: 42px;
  max-height: 42px;
  line-height: 1.4;
  font-family: inherit;
}

.input-icon-wrapper:focus-within,
.input-icon-wrapper-textarea:focus-within,
.date-input-wrapper:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1);
}

.input-icon {
  flex-shrink: 0;
  color: var(--accent-color);
  margin-right: 8px;
}

.input-group.error .input-icon-wrapper,
.input-group.error .input-icon-wrapper-textarea,
.input-group.error .date-input-wrapper {
  border-color: #ff416c;
  background: rgba(255, 65, 108, 0.05);
}

.input-group.error .input-icon-wrapper:focus-within,
.input-group.error .input-icon-wrapper-textarea:focus-within,
.input-group.error .date-input-wrapper:focus-within {
  box-shadow: 0 0 0 2px rgba(255, 65, 108, 0.2);
}

.form-input {
  flex-grow: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  box-sizing: border-box;
  min-height: 22px;
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

.form-input.error {
  border-color: #ef4444;
}

.date-input-wrapper {
  position: relative;
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
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-primary);
  z-index: 1;
  margin-left: 8px;
  min-height: 22px;
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

.form-textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
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

.form-actions {
  display: flex;
  gap: 8px;
  padding: 12px 0 16px;
  margin-top: 8px;
}

.form-button {
  flex: 1;
  padding: 14px;
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

.form-button.cancel:hover:not(:disabled) {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-button.cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-button.submit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.form-button.submit:hover:not(.disabled):not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.form-button.submit.disabled,
.form-button.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-hover-light);
  color: var(--text-secondary);
  box-shadow: none;
  transform: none;
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

.form-spacer {
  height: 10px;
}

.form-scroll::-webkit-scrollbar {
  width: 6px;
}

.form-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.form-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.form-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

:root.dark .form-toolbar {
  background: var(--bg-card-dark);
  border-color: var(--border-color-dark);
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

:root.dark .input-icon-wrapper,
:root.dark .input-icon-wrapper-textarea,
:root.dark .date-input-wrapper {
  background: var(--bg-hover-dark);
  border-color: var(--border-color-dark);
}

:root.dark .form-input,
:root.dark .form-textarea,
:root.dark .date-display {
  color: var(--text-primary-dark);
}

:root.dark .fund-name-display {
  color: var(--text-secondary-dark);
  border-color: var(--border-color-dark);
}

:root.dark .form-button.cancel {
  background: var(--bg-hover-dark);
  color: var(--text-primary-dark);
  border-color: var(--border-color-dark);
}

:root.dark .form-button.submit.disabled,
:root.dark .form-button.submit:disabled {
  background: var(--bg-hover-dark);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .edit-holding-form {
    max-height: 90vh;
  }
  
  .form-toolbar {
    padding: 8px 12px;
  }
  
  .back-button-pill {
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .form-scroll {
    padding: 8px 16px;
    max-height: calc(90vh - 50px);
  }
  
  .holding-form {
    gap: 6px;
  }
  
  .input-row {
    flex-direction: column;
    gap: 6px;
    margin-bottom: 6px;
  }
  
  .input-group {
    margin-bottom: 6px;
  }
  
  .input-icon-wrapper,
  .input-icon-wrapper-textarea,
  .date-input-wrapper {
    padding: 0 10px;
    min-height: 40px;
  }
  
  .fund-code-input {
    width: 45px; /* 移动端调整宽度 */
    font-size: 13px;
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
  .edit-holding-form {
    border-radius: 12px;
  }
  
  .form-toolbar {
    padding: 6px 10px;
  }
  
  .back-button-pill {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .form-scroll {
    padding: 6px 14px;
    max-height: calc(90vh - 45px);
  }
  
  .holding-form {
    gap: 4px;
  }
  
  .input-icon-wrapper,
  .input-icon-wrapper-textarea,
  .date-input-wrapper {
    padding: 0 8px;
    min-height: 38px;
    border-radius: 6px;
  }
  
  .fund-code-input {
    width: 40px; /* 移动端调整宽度 */
    font-size: 12px;
  }
  
  .form-input,
  .form-textarea,
  .date-display {
    padding: 6px 0;
    font-size: 13px;
  }
  
  .fund-name-display {
    font-size: 12px;
    padding: 6px 0;
    padding-left: 6px;
  }
  
  .remarks-textarea {
    padding: 6px 0;
    font-size: 13px;
  }
  
  .form-button {
    padding: 10px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .error-message {
    font-size: 11px;
    padding-left: 20px;
  }
}
</style>
