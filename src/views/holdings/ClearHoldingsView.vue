<template>
  <div class="clear-holdings-view">
    <NavBar title="清空持仓" back-route="/holdings/manage" />
    
    <div class="content">
      <div class="clear-container">
        <!-- 警告区域 -->
        <div class="warning-section">
          <div class="warning-icon">⚠️</div>
          <h2 class="warning-title">危险操作</h2>
          <p class="warning-subtitle">此操作将永久删除持仓数据，无法恢复</p>
        </div>
        
        <!-- 数据统计 -->
        <div class="stats-section">
          <h3 class="stats-title">当前持仓统计</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats.totalClients }}</div>
              <div class="stat-label">客户数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.totalHoldings }}</div>
              <div class="stat-label">持仓记录</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.totalValue }}</div>
              <div class="stat-label">总持仓金额</div>
            </div>
          </div>
        </div>
        
        <!-- 确认步骤 -->
        <div class="confirmation-section">
          <h3 class="confirmation-title">确认清空操作</h3>
          
          <!-- 第一步：确认理解风险 -->
          <div class="confirmation-step">
            <label class="step-label">
              <input
                type="checkbox"
                v-model="confirmations.understoodRisk"
              />
              <span class="step-text">
                <strong>我理解风险：</strong>清空后所有持仓数据将永久删除，无法通过撤销恢复。
              </span>
            </label>
          </div>
          
          <!-- 第二步：确认备份 -->
          <div class="confirmation-step">
            <label class="step-label">
              <input
                type="checkbox"
                v-model="confirmations.hasBackup"
              />
              <span class="step-text">
                <strong>我已备份：</strong>我确认已经导出并备份了重要的持仓数据。
              </span>
            </label>
          </div>
          
          <!-- 第三步：输入确认文本 -->
          <div class="confirmation-step">
            <div class="step-text">
              <strong>输入确认文本：</strong>
              请在下方输入框输入 "<strong>确认清空所有持仓</strong>" 以继续
            </div>
            <input
              v-model="confirmationText"
              type="text"
              placeholder="请输入确认文本"
              class="confirmation-input"
            />
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section">
          <button
            class="btn-clear"
            :disabled="!canClear || isClearing"
            @click="showFinalConfirmation"
          >
            <span v-if="!isClearing">
              <span class="button-icon">🗑️</span>
              清空所有持仓数据
            </span>
            <span v-else class="clearing-text">
              <span class="spinner"></span>
              正在清空...
            </span>
          </button>
          <button class="btn-cancel" @click="goBack">取消</button>
        </div>
        
        <!-- 二次确认模态框 -->
        <div v-if="showFinalModal" class="final-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">最后确认</h3>
              <button class="modal-close" @click="showFinalModal = false">×</button>
            </div>
            
            <div class="modal-body">
              <div class="modal-warning">
                <span class="modal-warning-icon">🔥</span>
                <p>您确定要清空所有持仓数据吗？</p>
              </div>
              
              <div class="modal-stats">
                <p>这将删除：</p>
                <ul>
                  <li>{{ stats.totalClients }} 个客户的所有信息</li>
                  <li>{{ stats.totalHoldings }} 条持仓记录</li>
                  <li>{{ stats.totalValue }} 的持仓金额数据</li>
                  <li>所有相关的收益计算和历史记录</li>
                </ul>
              </div>
              
              <div class="modal-actions">
                <button class="modal-btn-cancel" @click="showFinalModal = false">
                  再考虑一下
                </button>
                <button class="modal-btn-confirm" @click="performClear">
                  是的，立即清空
                </button>
              </div>
            </div>
          </div>
          <div class="modal-backdrop" @click="showFinalModal = false"></div>
        </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'

const router = useRouter()

const stats = ref({
  totalClients: 48,
  totalHoldings: 156,
  totalValue: '¥2,845,320.00'
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

const showFinalConfirmation = () => {
  if (!canClear.value) return
  showFinalModal.value = true
}

const performClear = async () => {
  showFinalModal.value = false
  isClearing.value = true
  
  // 模拟清空操作
  setTimeout(() => {
    isClearing.value = false
    
    // 重置统计数据
    stats.value = {
      totalClients: 0,
      totalHoldings: 0,
      totalValue: '¥0.00'
    }
    
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
  }, 3000)
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const goBack = () => {
  router.push('/holdings/manage')
}
</script>

<style scoped>
.clear-holdings-view {
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

.clear-container {
  max-width: 600px;
  margin: 0 auto;
}

.warning-section {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent);
  border-radius: 16px;
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.warning-title {
  font-size: 24px;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 8px;
}

.warning-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.stats-section {
  margin-bottom: 32px;
}

.stats-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.confirmation-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
  margin-bottom: 32px;
}

.confirmation-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
}

.confirmation-step {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.confirmation-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.step-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.step-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.step-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
}

.step-text strong {
  color: #ef4444;
}

.confirmation-input {
  width: 100%;
  margin-top: 12px;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.confirmation-input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.confirmation-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-clear {
  padding: 16px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none;
}

.btn-clear:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
}

.btn-cancel {
  padding: 14px;
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: var(--border-color);
}

.button-icon {
  font-size: 20px;
}

.clearing-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 模态框样式 */
.final-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1001;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.modal-warning {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent);
  border-radius: 12px;
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.modal-warning-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.modal-warning p {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-stats {
  background: var(--bg-hover);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.modal-stats p {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.modal-stats ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.modal-stats li {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.modal-stats li:last-child {
  border-bottom: none;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn-cancel,
.modal-btn-confirm {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn-cancel {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.modal-btn-cancel:hover {
  background: var(--border-color);
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.modal-btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .confirmation-section {
    padding: 20px;
  }
  
  .modal-content {
    max-height: 80vh;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .warning-section {
    padding: 20px;
  }
  
  .warning-icon {
    font-size: 40px;
  }
  
  .warning-title {
    font-size: 20px;
  }
  
  .step-label {
    align-items: flex-start;
  }
}
</style>