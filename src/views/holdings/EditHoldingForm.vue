<template>
  <div class="edit-holding-form">
    <!-- 表单头部 -->
    <div class="form-header">
      <div class="header-content">
        <h2 class="form-title">{{ formData.client_name || '新持仓' }}</h2>
        <p class="form-subtitle" v-if="holding">
          {{ holding.fund_name }} [{{ holding.fund_code }}]
        </p>
      </div>
      <button class="close-button" @click="handleCancel">
        <span class="close-icon">×</span>
      </button>
    </div>
    
    <!-- 表单内容 -->
    <div class="form-scroll">
      <form @submit.prevent="handleSubmit" class="holding-form">
        <!-- 客户信息部分 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <h3 class="section-title">客户信息</h3>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="clientName" class="form-label">
                <span class="label-icon">📝</span>
                客户姓名 *
              </label>
              <input
                id="clientName"
                v-model="formData.client_name"
                type="text"
                class="form-input"
                :class="{ 'error': errors.client_name }"
                placeholder="请输入客户姓名"
                @input="validateClientName"
                required
              />
              <div v-if="errors.client_name" class="error-message">
                {{ errors.client_name }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="clientId" class="form-label">
                <span class="label-icon">🔢</span>
                客户编号
              </label>
              <input
                id="clientId"
                v-model="formData.client_id"
                type="text"
                class="form-input"
                :class="{ 'error': errors.client_id }"
                placeholder="最多12位数字"
                maxlength="12"
                @input="validateClientId"
              />
              <div v-if="errors.client_id" class="error-message">
                {{ errors.client_id }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 基金信息部分 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">📈</div>
            <h3 class="section-title">基金信息</h3>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="fundCode" class="form-label">
                <span class="label-icon">#️⃣</span>
                基金代码 *
              </label>
              <input
                id="fundCode"
                v-model="formData.fund_code"
                type="text"
                class="form-input"
                :class="{ 'error': errors.fund_code }"
                placeholder="6位数字"
                maxlength="6"
                @input="validateFundCode"
                required
              />
              <div v-if="errors.fund_code" class="error-message">
                {{ errors.fund_code }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="fundName" class="form-label">
                <span class="label-icon">🏷️</span>
                基金名称
              </label>
              <input
                id="fundName"
                v-model="formData.fund_name"
                type="text"
                class="form-input"
                placeholder="自动获取或手动输入"
              />
            </div>
          </div>
        </div>
        
        <!-- 购买信息部分 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h3 class="section-title">购买信息</h3>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="purchaseAmount" class="form-label">
                <span class="label-icon">💵</span>
                购买金额 (元) *
              </label>
              <input
                id="purchaseAmount"
                v-model.number="formData.purchase_amount"
                type="number"
                class="form-input"
                :class="{ 'error': errors.purchase_amount }"
                placeholder="0.00"
                step="0.01"
                min="0"
                @input="validateAmount('purchase_amount')"
                required
              />
              <div v-if="errors.purchase_amount" class="error-message">
                {{ errors.purchase_amount }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="purchaseShares" class="form-label">
                <span class="label-icon">📊</span>
                购买份额 *
              </label>
              <input
                id="purchaseShares"
                v-model.number="formData.purchase_shares"
                type="number"
                class="form-input"
                :class="{ 'error': errors.purchase_shares }"
                placeholder="0.0000"
                step="0.0001"
                min="0"
                @input="validateAmount('purchase_shares')"
                required
              />
              <div v-if="errors.purchase_shares" class="error-message">
                {{ errors.purchase_shares }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="purchaseDate" class="form-label">
              <span class="label-icon">📅</span>
              购买日期 *
            </label>
            <input
              id="purchaseDate"
              v-model="formData.purchase_date"
              type="date"
              class="form-input"
              :class="{ 'error': errors.purchase_date }"
              :max="maxDate"
              @change="validateDate"
              required
            />
            <div v-if="errors.purchase_date" class="error-message">
              {{ errors.purchase_date }}
            </div>
          </div>
        </div>
        
        <!-- 净值信息部分 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">📉</div>
            <h3 class="section-title">净值信息</h3>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="currentNav" class="form-label">
                <span class="label-icon">📊</span>
                当前净值
              </label>
              <input
                id="currentNav"
                v-model.number="formData.current_nav"
                type="number"
                class="form-input"
                placeholder="自动获取"
                step="0.0001"
                min="0"
              />
            </div>
            
            <div class="form-group">
              <label for="navDate" class="form-label">
                <span class="label-icon">📅</span>
                净值日期
              </label>
              <input
                id="navDate"
                v-model="formData.nav_date"
                type="date"
                class="form-input"
                :max="maxDate"
              />
            </div>
          </div>
        </div>
        
        <!-- 其他信息部分 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">⚙️</div>
            <h3 class="section-title">其他信息</h3>
          </div>
          
          <div class="form-group">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="formData.is_pinned"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">置顶此持仓</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="remarks" class="form-label">
              <span class="label-icon">📝</span>
              备注
            </label>
            <textarea
              id="remarks"
              v-model="formData.remarks"
              class="form-textarea"
              placeholder="可选，最多255个字符"
              maxlength="255"
              rows="3"
            ></textarea>
            <div class="char-count">
              {{ formData.remarks?.length || 0 }}/255
            </div>
          </div>
        </div>
        
        <!-- 表单操作按钮 -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="isSubmitting"
          >
            取消
          </button>
          
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">保存中...</span>
            <span v-else>保存修改</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import type { Holding } from '@/types/data'

interface Props {
  holding?: Holding | null
}

const props = withDefaults(defineProps<Props>(), {
  holding: null
})

const emit = defineEmits<{
  (e: 'save', holding: any): void
  (e: 'cancel'): void
}>()

const dataStore = useDataStore()

// 组件状态
const isSubmitting = ref(false)

// 表单数据 - 使用 Holding 类型
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
  is_pinned: false,
  pinned_timestamp: null as string | null,
  remarks: '',
  created_at: '',
  updated_at: '',
  nav_return_1m: undefined as number | undefined,
  nav_return_3m: undefined as number | undefined,
  nav_return_6m: undefined as number | undefined,
  nav_return_1y: undefined as number | undefined
})

// 错误信息
const errors = ref({
  client_name: '',
  client_id: '',
  fund_code: '',
  purchase_amount: '',
  purchase_shares: '',
  purchase_date: ''
})

// 计算属性
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
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

// 监听props变化，初始化表单数据
watch(() => props.holding, (newHolding) => {
  if (newHolding) {
    loadFormData(newHolding)
  } else {
    resetForm()
  }
}, { immediate: true })

// 加载表单数据
const loadFormData = (holding: Holding) => {
  formData.value = {
    id: holding.id,
    client_name: holding.client_name,
    client_id: holding.client_id,
    fund_code: holding.fund_code,
    fund_name: holding.fund_name,
    purchase_amount: holding.purchase_amount,
    purchase_shares: holding.purchase_shares,
    purchase_date: holding.purchase_date,
    current_nav: holding.current_nav,
    nav_date: holding.nav_date,
    is_pinned: holding.is_pinned,
    pinned_timestamp: holding.pinned_timestamp,
    remarks: holding.remarks || '',
    created_at: holding.created_at || new Date().toISOString(),
    updated_at: holding.updated_at || new Date().toISOString(),
    nav_return_1m: (holding as any).nav_return_1m,
    nav_return_3m: (holding as any).nav_return_3m,
    nav_return_6m: (holding as any).nav_return_6m,
    nav_return_1y: (holding as any).nav_return_1y
  }
}

// 重置表单
const resetForm = () => {
  const now = new Date().toISOString().split('T')[0]
  
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
    is_pinned: false,
    pinned_timestamp: null,
    remarks: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    nav_return_1m: undefined,
    nav_return_3m: undefined,
    nav_return_6m: undefined,
    nav_return_1y: undefined
  }
  
  // 重置错误信息
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
}

// 验证函数（移植自Swift代码）
const validateClientName = () => {
  const name = formData.value.client_name.trim()
  
  if (name === '') {
    errors.value.client_name = '姓名不能为空'
    return
  }
  
  // 检查是否包含非法字符
  const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z\s]+$/
  if (!allowedPattern.test(name)) {
    errors.value.client_name = '姓名只能包含汉字、英文字母和空格'
    return
  }
  
  // 检查中英文长度限制
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

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // 准备提交数据 - 确保所有字段都有值
    const updatedData = {
      ...formData.value,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // 如果这是新持仓，添加创建时间
    if (!updatedData.created_at) {
      updatedData.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // 记录日志
    dataStore.addLog(`编辑持仓: ${updatedData.client_name} - ${updatedData.fund_code}`, 'info')
    
    console.log('提交持仓数据:', updatedData)
    
    // 触发保存事件（父组件会处理实际的数据存储）
    emit('save', updatedData)
    
  } catch (error) {
    console.error('保存失败:', error)
    dataStore.addLog(`编辑持仓失败: ${error}`, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  if (confirm('确定要取消编辑吗？未保存的修改将会丢失。')) {
    emit('cancel')
  }
}

// 初始化
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
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
}

.form-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.close-button {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.holding-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.section-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--accent-color-rgb), 0.1);
  border-radius: 8px;
  color: var(--accent-color);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.label-icon {
  font-size: 14px;
  opacity: 0.7;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 2px;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
  margin-top: 4px;
}

.checkbox-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--accent-color-rgb), 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border-color);
}

@media (max-width: 768px) {
  .form-header {
    padding: 16px;
  }
  
  .form-title {
    font-size: 18px;
  }
  
  .form-scroll {
    padding: 16px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn {
    padding: 12px;
    font-size: 15px;
  }
}
</style>