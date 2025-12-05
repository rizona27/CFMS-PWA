<template>
  <div class="edit-holding-view">
    <NavBar title="编辑持仓" back-route="/holdings/manage" />
    
    <div class="content">
      <div class="search-section">
        <h2 class="section-title">搜索客户持仓</h2>
        <p class="section-subtitle">输入客户编号、姓名或基金代码搜索持仓记录</p>
        
        <GlobalSearchBar
          v-model:searchTerm="searchTerm"
          @clear="handleClearSearch"
        />
        
        <div v-if="searchResults.length > 0" class="results-section">
          <h3 class="results-title">搜索结果 ({{ searchResults.length }})</h3>
          <div class="results-list">
            <div
              v-for="holding in searchResults"
              :key="holding.id"
              class="result-item"
              @click="selectHolding(holding)"
            >
              <div class="result-info">
                <span class="client-name">{{ holding.client_name }}</span>
                <span class="client-id">({{ holding.client_id }})</span>
              </div>
              <div class="holding-details">
                <span class="fund-name">{{ holding.fund_name || '加载中...' }}</span>
                <span class="fund-code">{{ holding.fund_code }}</span>
              </div>
              <div class="holding-meta">
                <span class="purchase-amount">{{ formatCurrency(holding.purchase_amount) }}</span>
                <span class="purchase-shares">{{ formatShares(holding.purchase_shares) }}</span>
              </div>
              <div class="holding-actions">
                <span class="edit-icon">✏️</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="searchTerm && !isLoading" class="no-results">
          <p>未找到匹配的持仓记录</p>
        </div>
      </div>
      
      <div v-if="selectedHolding" class="edit-section">
        <h3 class="edit-title">编辑持仓信息</h3>
        
        <div class="holding-header">
          <div class="header-info">
            <h4>{{ selectedHolding.client_name }} ({{ selectedHolding.client_id }})</h4>
            <p>{{ selectedHolding.fund_name }} [{{ selectedHolding.fund_code }}]</p>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">当前净值</span>
              <span class="stat-value">{{ formatCurrency(selectedHolding.current_nav) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">净值日期</span>
              <span class="stat-value">{{ formatDate(selectedHolding.nav_date) }}</span>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="saveChanges" class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label for="editClientName">客户姓名 *</label>
              <input
                id="editClientName"
                v-model="editForm.client_name"
                type="text"
                placeholder="请输入客户姓名"
                :class="{ 'error': errors.client_name }"
                @input="validateClientName"
                required
              />
              <div v-if="errors.client_name" class="error-message">
                {{ errors.client_name }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="editClientId">客户编号</label>
              <input
                id="editClientId"
                v-model="editForm.client_id"
                type="text"
                placeholder="最多12位数字"
                maxlength="12"
                :class="{ 'error': errors.client_id }"
                @input="validateClientId"
              />
              <div v-if="errors.client_id" class="error-message">
                {{ errors.client_id }}
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editFundCode">基金代码 *</label>
              <input
                id="editFundCode"
                v-model="editForm.fund_code"
                type="text"
                placeholder="6位数字"
                maxlength="6"
                :class="{ 'error': errors.fund_code }"
                @input="validateFundCode"
                required
              />
              <div v-if="errors.fund_code" class="error-message">
                {{ errors.fund_code }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="editFundName">基金名称</label>
              <input
                id="editFundName"
                v-model="editForm.fund_name"
                type="text"
                placeholder="自动获取或手动输入"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editPurchaseAmount">购买金额 (元) *</label>
              <input
                id="editPurchaseAmount"
                v-model.number="editForm.purchase_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                :class="{ 'error': errors.purchase_amount }"
                @input="validateAmount('purchase_amount')"
                required
              />
              <div v-if="errors.purchase_amount" class="error-message">
                {{ errors.purchase_amount }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="editPurchaseShares">购买份额 *</label>
              <input
                id="editPurchaseShares"
                v-model.number="editForm.purchase_shares"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                :class="{ 'error': errors.purchase_shares }"
                @input="validateAmount('purchase_shares')"
                required
              />
              <div v-if="errors.purchase_shares" class="error-message">
                {{ errors.purchase_shares }}
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editPurchaseDate">购买日期 *</label>
              <input
                id="editPurchaseDate"
                v-model="editForm.purchase_date"
                type="date"
                :max="maxDate"
                :class="{ 'error': errors.purchase_date }"
                @change="validateDate"
                required
              />
              <div v-if="errors.purchase_date" class="error-message">
                {{ errors.purchase_date }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="editCurrentNav">当前净值</label>
              <input
                id="editCurrentNav"
                v-model.number="editForm.current_nav"
                type="number"
                step="0.0001"
                min="0"
                placeholder="自动获取"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editNavDate">净值日期</label>
              <input
                id="editNavDate"
                v-model="editForm.nav_date"
                type="date"
                :max="maxDate"
              />
            </div>
            
            <div class="form-group">
              <label for="editIsPinned">置顶状态</label>
              <div class="checkbox-wrapper">
                <input
                  id="editIsPinned"
                  v-model="editForm.is_pinned"
                  type="checkbox"
                />
                <label for="editIsPinned" class="checkbox-label">
                  {{ editForm.is_pinned ? '已置顶' : '未置顶' }}
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label for="editRemarks">备注</label>
            <textarea
              id="editRemarks"
              v-model="editForm.remarks"
              placeholder="可选，最多255个字符"
              maxlength="255"
              rows="3"
            ></textarea>
            <div class="char-count">
              {{ editForm.remarks?.length || 0 }}/255
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="cancelEdit">
              取消
            </button>
            <button type="submit" class="btn-primary" :disabled="!isFormValid || isSaving">
              {{ isSaving ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import GlobalSearchBar from '@/components/common/GlobalSearchBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'
import type { Holding } from '@/types/data'

const router = useRouter()

const searchTerm = ref('')
const isLoading = ref(false)
const selectedHolding = ref<Holding | null>(null)
const isSaving = ref(false)

// 表单数据
const editForm = ref({
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
  remarks: ''
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

// 模拟数据 - 实际应从API获取
const mockHoldings: Holding[] = [
  {
    id: '1',
    client_name: '张三',
    client_id: 'C001',
    fund_code: '005827',
    fund_name: '易方达蓝筹精选混合',
    purchase_date: '2024-01-15',
    purchase_amount: 100000.00,
    purchase_shares: 40000.0000,
    current_nav: 2.5000,
    nav_date: '2024-03-15',
    is_pinned: false,
    pinned_timestamp: null,
    remarks: '首次购买',
    created_at: '2024-01-15 10:30:00',
    updated_at: '2024-03-15 15:45:00'
  },
  {
    id: '2',
    client_name: '李四',
    client_id: 'C002',
    fund_code: '000001',
    fund_name: '华夏成长混合',
    purchase_date: '2024-02-20',
    purchase_amount: 50000.00,
    purchase_shares: 27777.7778,
    current_nav: 1.8000,
    nav_date: '2024-03-15',
    is_pinned: true,
    pinned_timestamp: '2024-03-10 09:15:00',
    remarks: '追加投资',
    created_at: '2024-02-20 14:20:00',
    updated_at: '2024-03-15 16:30:00'
  },
  {
    id: '3',
    client_name: '王五',
    client_id: 'C003',
    fund_code: '001856',
    fund_name: '嘉实新兴产业股票',
    purchase_date: '2024-03-01',
    purchase_amount: 80000.00,
    purchase_shares: 25000.0000,
    current_nav: 3.2000,
    nav_date: '2024-03-15',
    is_pinned: false,
    pinned_timestamp: null,
    remarks: '',
    created_at: '2024-03-01 11:45:00',
    updated_at: '2024-03-15 14:20:00'
  }
]

const searchResults = ref<Holding[]>([])

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 计算属性
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return (
    editForm.value.client_name.trim() !== '' &&
    editForm.value.fund_code.trim() !== '' &&
    editForm.value.purchase_amount > 0 &&
    editForm.value.purchase_shares > 0 &&
    editForm.value.purchase_date !== '' &&
    Object.values(errors.value).every(error => error === '')
  )
})

// 搜索监听
watch(searchTerm, (newTerm) => {
  if (newTerm.trim()) {
    performSearch(newTerm)
  } else {
    searchResults.value = []
  }
})

// 格式化函数
const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatShares = (value: number) => {
  return `${value.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}份`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 搜索函数
const performSearch = (term: string) => {
  isLoading.value = true
  setTimeout(() => {
    const searchTermLower = term.toLowerCase()
    searchResults.value = mockHoldings.filter(holding => 
      holding.client_name.toLowerCase().includes(searchTermLower) || 
      holding.client_id.toLowerCase().includes(searchTermLower) ||
      holding.fund_name.toLowerCase().includes(searchTermLower) ||
      holding.fund_code.includes(searchTermLower) ||
      holding.remarks.toLowerCase().includes(searchTermLower)
    )
    isLoading.value = false
  }, 300)
}

const handleClearSearch = () => {
  searchTerm.value = ''
  searchResults.value = []
  selectedHolding.value = null
}

const selectHolding = (holding: Holding) => {
  selectedHolding.value = holding
  editForm.value = {
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
    remarks: holding.remarks || ''
  }
  
  // 重置错误信息
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
}

// 验证函数（移植自Swift代码）
const validateClientName = () => {
  const name = editForm.value.client_name.trim()
  
  if (name === '') {
    errors.value.client_name = '姓名不能为空'
    return
  }
  
  // 检查是否包含非法字符（移植自Swift的filterAllowedNameCharacters）
  const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z\s]+$/
  if (!allowedPattern.test(name)) {
    errors.value.client_name = '姓名只能包含汉字、英文字母和空格'
    return
  }
  
  // 检查中英文长度限制（移植自Swift逻辑）
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
  const clientId = editForm.value.client_id.trim()
  
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
  const code = editForm.value.fund_code.trim()
  
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
  const value = editForm.value[field]
  
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
  const date = editForm.value.purchase_date
  
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

// 保存修改
const saveChanges = async () => {
  if (!selectedHolding.value || !isFormValid.value) return
  
  isSaving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新数据
    const updatedHolding: Holding = {
      ...selectedHolding.value,
      ...editForm.value,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // 如果基金代码改变，触发基金信息更新
    if (editForm.value.fund_code !== selectedHolding.value.fund_code) {
      // 这里应该调用基金信息API
      console.log('基金代码变化，需要更新基金信息:', editForm.value.fund_code)
      showNotification('持仓信息已更新，正在获取最新的基金信息...', 'info')
    } else {
      showNotification('持仓信息更新成功！', 'success')
    }
    
    // 重置状态
    setTimeout(() => {
      selectedHolding.value = null
      editForm.value = {
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
        pinned_timestamp: null,
        remarks: ''
      }
      isSaving.value = false
    }, 1500)
    
  } catch (error) {
    showNotification('保存失败，请重试', 'error')
    isSaving.value = false
  }
}

const cancelEdit = () => {
  selectedHolding.value = null
  editForm.value = {
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
    pinned_timestamp: null,
    remarks: ''
  }
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// 初始化
onMounted(() => {
  editForm.value.purchase_date = new Date().toISOString().split('T')[0]
  editForm.value.nav_date = new Date().toISOString().split('T')[0]
})
</script>

<style scoped>
.edit-holding-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.search-section {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.results-section {
  margin-top: 24px;
}

.results-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
  border-color: var(--accent-color);
}

.result-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.client-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.client-id {
  font-size: 12px;
  color: var(--text-secondary);
}

.holding-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
  min-width: 200px;
}

.fund-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.fund-code {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.holding-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 150px;
}

.purchase-amount {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-color);
}

.purchase-shares {
  font-size: 12px;
  color: var(--text-secondary);
}

.edit-icon {
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.result-item:hover .edit-icon {
  opacity: 1;
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
}

.edit-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.edit-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.holding-header {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.header-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.header-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.header-stats {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.edit-form {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-group label::after {
  content: attr(data-required);
  color: #ef4444;
  margin-left: 2px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.2);
}

.form-group input.error {
  border-color: #ef4444;
}

.form-group input.error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .holding-details,
  .holding-meta {
    align-items: flex-start;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>