<template>
  <div class="clear-holdings-view">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <span class="back-icon">←</span>
    </div>
    
    <!-- 主要内容 -->
    <div class="content-area">
      <div class="header">
        <h1 class="title">清空持仓数据</h1>
        <p class="subtitle">此操作将永久删除所有持仓数据，请谨慎操作</p>
      </div>
      
      <!-- 数据统计 -->
      <div class="stats-section">
        <h2 class="section-title">当前数据统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalHoldings }}</div>
            <div class="stat-label">总持仓数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalClients }}</div>
            <div class="stat-label">客户数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalValue }}</div>
            <div class="stat-label">总价值</div>
          </div>
        </div>
      </div>
      
      <!-- 警告信息 -->
      <div class="warning-section">
        <div class="warning-icon">⚠️</div>
        <h3 class="warning-title">重要警告</h3>
        <ul class="warning-list">
          <li>此操作无法撤销，数据将永久删除</li>
          <li>建议先导出数据备份</li>
          <li>清空后需要重新导入或手动添加数据</li>
        </ul>
      </div>
      
      <!-- 确认步骤 -->
      <div class="confirmation-section">
        <h3 class="section-title">确认操作</h3>
        
        <div class="confirmation-item">
          <input
            type="checkbox"
            id="understoodRisk"
            v-model="confirmations.understoodRisk"
            class="confirmation-checkbox"
          />
          <label for="understoodRisk" class="confirmation-label">
            我理解此操作的风险，确认要继续
          </label>
        </div>
        
        <div class="confirmation-item">
          <input
            type="checkbox"
            id="hasBackup"
            v-model="confirmations.hasBackup"
            class="confirmation-checkbox"
          />
          <label for="hasBackup" class="confirmation-label">
            我已备份数据或确认不需要备份
          </label>
        </div>
        
        <div class="text-confirmation">
          <label for="confirmationText" class="confirmation-label">
            请在下方输入框输入"确认清空所有持仓"以继续：
          </label>
          <input
            id="confirmationText"
            v-model="confirmationText"
            type="text"
            placeholder="确认清空所有持仓"
            class="confirmation-input"
            :class="{ 'input-error': confirmationText !== '' && confirmationText !== '确认清空所有持仓' }"
          />
          <div v-if="confirmationText !== '' && confirmationText !== '确认清空所有持仓'" class="error-message">
            请输入正确的确认文本
          </div>
        </div>
        
        <!-- 清空按钮 -->
        <button
          class="clear-button"
          :class="{ 'enabled': canClear }"
          :disabled="!canClear || isClearing"
          @click="showFinalConfirmation"
        >
          <span v-if="isClearing" class="spinner"></span>
          <span v-else>清空所有持仓数据</span>
        </button>
        
        <!-- 取消按钮 -->
        <button class="cancel-button" @click="goBack">
          取消
        </button>
      </div>
    </div>
    
    <!-- 最终确认模态框 -->
    <div v-if="showFinalModal" class="final-modal-overlay">
      <div class="final-modal">
        <div class="modal-header">
          <h3>最终确认</h3>
          <button class="modal-close" @click="showFinalModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="modal-icon">⚠️</div>
          <p class="modal-text">
            您即将永久删除 <strong>{{ stats.totalHoldings }}</strong> 条持仓记录，
            涉及 <strong>{{ stats.totalClients }}</strong> 个客户，
            总价值 <strong>{{ stats.totalValue }}</strong>。
          </p>
          <p class="modal-text">此操作无法撤销，确定要继续吗？</p>
        </div>
        <div class="modal-actions">
          <button class="modal-button cancel" @click="showFinalModal = false">
            取消
          </button>
          <button class="modal-button confirm" @click="performClear">
            确认清空
          </button>
        </div>
      </div>
    </div>
    
    <!-- Toast消息 -->
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ToastMessage from '@/components/common/ToastMessage.vue'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

const stats = ref({
  totalClients: 0,
  totalHoldings: 0,
  totalValue: '¥0.00'
})

const confirmations = ref({
  understoodRisk: false,
  hasBackup: false
})

const confirmationText = ref('')
const isClearing = ref(false)
const showFinalModal = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

const canClear = computed(() => {
  return (
    confirmations.value.understoodRisk &&
    confirmations.value.hasBackup &&
    confirmationText.value === '确认清空所有持仓'
  )
})

// 计算统计数据
const calculateStats = () => {
  const holdings = dataStore.holdings
  
  // 计算不重复的客户数
  const clientSet = new Set<string>()
  holdings.forEach(holding => {
    clientSet.add(`${holding.clientName}|${holding.clientID}`)
  })
  
  // 计算总价值
  const totalValue = holdings.reduce((total, holding) => {
    return total + (holding.currentNav * holding.purchaseShares)
  }, 0)
  
  stats.value = {
    totalClients: clientSet.size,
    totalHoldings: holdings.length,
    totalValue: `¥${totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

const showFinalConfirmation = () => {
  if (!canClear.value) return
  showFinalModal.value = true
}

const performClear = async () => {
  showFinalModal.value = false
  isClearing.value = true
  
  try {
    // 清空持仓数据
    dataStore.clearAllHoldings()
    
    // 重新计算统计数据
    calculateStats()
    
    // 重置确认状态
    confirmations.value = {
      understoodRisk: false,
      hasBackup: false
    }
    confirmationText.value = ''
    
    showNotification('所有持仓数据已清空！', 'success')
    
    // 延迟返回
    setTimeout(() => {
      router.push('/holdings/manage')
    }, 2000)
    
  } catch (error) {
    console.error('清空持仓失败:', error)
    showNotification(`清空失败: ${error}`, 'error')
  } finally {
    isClearing.value = false
  }
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const goBack = () => {
  router.push('/holdings/manage')
}

// 初始化
onMounted(() => {
  calculateStats()
})
</script>

<style scoped>
.clear-holdings-view {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.back-button:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.content-area {
  padding: 80px 20px 40px;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.stats-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: var(--bg-hover);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.warning-section {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.warning-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 16px;
}

.warning-title {
  font-size: 18px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 16px;
  text-align: center;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  padding: 8px 0;
  color: #856404;
  position: relative;
  padding-left: 24px;
}

.warning-list li:before {
  content: '•';
  position: absolute;
  left: 8px;
  font-size: 20px;
}

.confirmation-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.confirmation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: var(--bg-hover);
  border-radius: 12px;
}

.confirmation-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
}

.confirmation-label {
  flex: 1;
  font-size: 16px;
  color: var(--text-primary);
  cursor: pointer;
}

.text-confirmation {
  margin: 32px 0;
}

.confirmation-input {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  margin-top: 12px;
  transition: all 0.3s ease;
  background: var(--bg-hover);
  color: var(--text-primary);
}

.confirmation-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.confirmation-input.input-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  margin-left: 4px;
}

.clear-button {
  width: 100%;
  padding: 20px;
  background: #f5f5f7;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #999;
  cursor: not-allowed;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  position: relative;
}

.clear-button.enabled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  cursor: pointer;
}

.clear-button.enabled:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

.clear-button:disabled {
  opacity: 0.6;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cancel-button {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
}

.final-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.final-modal {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-content {
  text-align: center;
  margin-bottom: 32px;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.modal-text {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.6;
}

.modal-text strong {
  color: var(--accent-color);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button.cancel {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-button.cancel:hover {
  background: var(--border-color);
}

.modal-button.confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.modal-button.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .clear-button {
    background: #2c2c2e;
  }
  
  .warning-section {
    background: #332701;
    border-color: #665800;
  }
  
  .warning-list li,
  .warning-title {
    color: #ffd54f;
  }
  
  .confirmation-input {
    background: #2c2c2e;
  }
  
  .modal-button.cancel {
    background: #2c2c2e;
  }
}

@media (max-width: 768px) {
  .content-area {
    padding: 70px 16px 32px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stats-section,
  .warning-section,
  .confirmation-section {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .clear-button {
    padding: 18px;
  }
}
</style>