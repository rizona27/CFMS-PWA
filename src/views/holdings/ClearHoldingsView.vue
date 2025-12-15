<template>
  <div class="clear-holdings-view">
    <!-- 固定顶部工具栏 -->
    <div class="fixed-header">
      <div class="form-toolbar">
        <button class="back-button-pill" @click="goBack">
          <span class="back-icon">←</span>
          返回
        </button>
      </div>
    </div>
    
    <div class="content-scroll">
      <div class="content-area">
        <!-- 数据统计卡片 -->
        <div class="stats-card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 8C21 6.34315 19.6569 5 18 5H16C14.3431 5 13 6.34315 13 8V16C13 17.6569 14.3431 19 16 19H18C19.6569 19 21 17.6569 21 16V8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 8C11 6.34315 9.65685 5 8 5H6C4.34315 5 3 6.34315 3 8V16C3 17.6569 4.34315 19 6 19H8C9.65685 19 11 17.6569 11 16V8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 12H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="card-title">当前数据统计</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalHoldings }}</div>
              <div class="stat-label">总持仓数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalClients }}</div>
              <div class="stat-label">客户数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalValue }}</div>
              <div class="stat-label">总价值</div>
            </div>
          </div>
        </div>
        
        <!-- 警告信息卡片 -->
        <div class="warning-card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="card-title">重要警告</h3>
          </div>
          <div class="warning-content">
            <ul class="warning-list">
              <li>此操作无法撤销，数据将永久删除</li>
              <li>建议先导出数据备份</li>
              <li>清空后需要重新导入或手动添加数据</li>
            </ul>
          </div>
        </div>
        
        <!-- 确认操作卡片 -->
        <div class="confirmation-card">
          <div class="card-header">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="card-title">确认操作</h3>
          </div>
          <div class="confirmation-content">
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

const isClearing = ref(false)
const showFinalModal = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

const canClear = computed(() => {
  return (
    confirmations.value.understoodRisk &&
    confirmations.value.hasBackup
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* 固定顶部工具栏 */
.fixed-header {
  flex-shrink: 0;
  z-index: 100;
  position: sticky;
  top: 0;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 0;
  background: var(--bg-primary);
}

.form-toolbar {
  flex-shrink: 0;
  padding: 12px 16px;
  background: transparent;
  border-bottom: none;
  z-index: 10;
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
  width: fit-content;
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

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  max-height: calc(100vh - 60px);
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

/* 卡片样式 */
.stats-card,
.warning-card,
.confirmation-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:root.dark .stats-card,
:root.dark .warning-card,
:root.dark .confirmation-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(59, 130, 246, 0.1);
}

.stats-card .card-icon {
  background: rgba(59, 130, 246, 0.1);
}

.warning-card .card-icon {
  background: rgba(255, 193, 7, 0.1);
}

.confirmation-card .card-icon {
  background: rgba(16, 185, 129, 0.1);
}

.card-icon svg {
  color: var(--accent-color);
}

.warning-card .card-icon svg {
  color: #ffc107;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px 12px;
  background: var(--bg-hover);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 警告卡片 */
.warning-card {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.warning-content {
  margin-top: 8px;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  padding: 10px 0;
  color: #ffc107;
  position: relative;
  padding-left: 24px;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 193, 7, 0.2);
}

.warning-list li:last-child {
  border-bottom: none;
}

.warning-list li:before {
  content: '⚠️';
  position: absolute;
  left: 0;
  font-size: 14px;
}

:root.dark .warning-card {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
}

:root.dark .warning-list li {
  color: #ffd54f;
}

/* 确认操作卡片 */
.confirmation-content {
  margin-top: 8px;
}

.confirmation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px;
  background: var(--bg-hover);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.confirmation-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.confirmation-label {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
  cursor: pointer;
}

.clear-button {
  width: 100%;
  padding: 18px;
  background: var(--bg-hover);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: not-allowed;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  position: relative;
}

.clear-button.enabled {
  background: var(--error-color);
  border-color: var(--error-color);
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

/* 最终确认模态框 */
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
  box-shadow: var(--hover-shadow);
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border-color);
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
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
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
  background: var(--border-color);
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
  border: 1px solid var(--border-color);
}

.modal-button.cancel:hover {
  background: var(--border-color);
}

.modal-button.confirm {
  background: var(--error-color);
  color: white;
  border: 1px solid var(--error-color);
}

.modal-button.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .content-scroll {
    padding: 10px 12px;
  }
  
  .content-area {
    gap: 12px;
  }
  
  .stats-card,
  .warning-card,
  .confirmation-card {
    padding: 16px;
    border-radius: 14px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .stat-item {
    padding: 14px 10px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .confirmation-item {
    padding: 12px;
    margin-bottom: 14px;
  }
  
  .confirmation-label {
    font-size: 14px;
  }
  
  .clear-button {
    padding: 16px;
    font-size: 16px;
  }
  
  .cancel-button {
    padding: 14px;
  }
  
  .card-title {
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .content-scroll {
    padding: 8px 10px;
  }
  
  .stats-card,
  .warning-card,
  .confirmation-card {
    padding: 14px;
    border-radius: 12px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .stat-item {
    padding: 12px 10px;
  }
  
  .card-header {
    margin-bottom: 14px;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
  }
  
  .warning-list li {
    padding: 8px 0 8px 24px;
    font-size: 13px;
  }
  
  .confirmation-item {
    padding: 10px;
    margin-bottom: 12px;
  }
  
  .confirmation-label {
    font-size: 13px;
  }
  
  .clear-button {
    padding: 14px;
    font-size: 15px;
  }
  
  .cancel-button {
    padding: 12px;
    font-size: 15px;
  }
  
  .final-modal {
    padding: 20px;
  }
  
  .modal-text {
    font-size: 14px;
  }
}
</style>
