<template>
  <div class="clear-holdings-view">
    <!-- 顶部工具栏 -->
    <div class="fixed-header transparent-header">
      <div class="form-toolbar">
        <!-- 药丸形状返回按钮 -->
        <button class="back-button-pill" @click="goBack">
          <span class="back-icon">←</span>
          返回
        </button>
      </div>
      
      <!-- 分隔符 -->
      <div class="stylish-divider">
        <div class="divider-line"></div>
        <div class="divider-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
          </svg>
        </div>
        <div class="divider-line"></div>
      </div>
    </div>
    
    <div class="content-scroll">
      <div class="content-area">
        <!-- 重要警告 -->
        <div class="warning-section">
          <h3 class="warning-title">⚠️ 重要警告</h3>
          <div class="warning-content">
            <ul class="warning-list">
              <li>此操作无法撤销，数据将永久删除</li>
              <li>建议先导出数据备份</li>
              <li>清空后需要重新导入或手动添加数据</li>
            </ul>
          </div>
        </div>

        <!-- 数据统计 - 网格布局 -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card holdings-card">
              <div class="stat-content">
                <div class="stat-label">总持仓数</div>
                <div class="stat-value">{{ stats.totalHoldings }}</div>
              </div>
            </div>
            <div class="stat-card clients-card">
              <div class="stat-content">
                <div class="stat-label">客户数</div>
                <div class="stat-value">{{ stats.totalClients }}</div>
              </div>
            </div>
            <div class="stat-card value-card">
              <div class="stat-content">
                <div class="stat-label">总价值</div>
                <div class="stat-value">{{ stats.totalValue }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 确认操作 -->
        <div class="confirmation-section">
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
  background: transparent;
}

.transparent-header {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.form-toolbar {
  flex-shrink: 0;
  padding: 8px 16px;
  background: transparent;
  border-bottom: none;
  z-index: 10;
}

.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 20px;
  color: var(--text-primary, #1e293b);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.back-button-pill:hover {
  background: var(--accent-color, #3b82f6);
  color: white;
  border-color: var(--accent-color, #3b82f6);
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

/* 分隔符 */
.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 0 8px;
  opacity: 0.6;
}

.divider-line {
  height: 1px;
  width: 40px;
  background: linear-gradient(90deg, transparent, currentColor);
}

.divider-line:last-child {
  background: linear-gradient(90deg, currentColor, transparent);
}

.divider-icon {
  color: currentColor;
  display: flex;
  align-items: center;
}

:root.dark .stylish-divider {
  color: rgba(255, 255, 255, 0.3);
}

.stylish-divider {
  color: rgba(0, 0, 0, 0.2);
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
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

/* 重要警告 */
.warning-section {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 4px;
}

.warning-title {
  font-size: 16px;
  font-weight: 600;
  color: #dc3545;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  padding: 6px 0;
  color: #dc3545;
  position: relative;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.4;
}

.warning-list li:before {
  content: '•';
  position: absolute;
  left: 8px;
  font-weight: bold;
}

:root.dark .warning-section {
  background: rgba(220, 53, 69, 0.12);
  border-color: rgba(220, 53, 69, 0.4);
}

:root.dark .warning-list li {
  color: #f56565;
}

/* 数据统计 - 网格布局 */
.stats-section {
  margin: 8px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 12px;
}

.stat-card {
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid;
  min-height: 80px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 总持仓数卡片 - 蓝色系 */
.holdings-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 客户数卡片 - 紫色系 */
.clients-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%);
  border-color: rgba(139, 92, 246, 0.3);
}

/* 总价值卡片 - 绿色系，跨两列 */
.value-card {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 100%);
  border-color: rgba(34, 197, 94, 0.3);
  min-height: 90px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.value-card .stat-value {
  font-size: 24px;
  font-weight: 800;
}

/* 深色模式适配 */
:root.dark .holdings-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%);
  border-color: rgba(59, 130, 246, 0.4);
}

:root.dark .clients-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%);
  border-color: rgba(139, 92, 246, 0.4);
}

:root.dark .value-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%);
  border-color: rgba(34, 197, 94, 0.4);
}

/* 确认操作 */
.confirmation-section {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(234, 88, 12, 0.08) 100%);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-top: 4px;
}

:root.dark .confirmation-section {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(234, 88, 12, 0.12) 100%);
  border-color: rgba(251, 146, 60, 0.4);
}

.confirmation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: var(--bg-hover);
  border-radius: 10px;
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
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1.4;
}

.clear-button {
  width: 100%;
  padding: 16px;
  background: var(--bg-hover);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: not-allowed;
  transition: all 0.3s ease;
  margin-top: 8px;
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
    padding: 8px 12px;
  }
  
  .content-area {
    gap: 12px;
  }
  
  .warning-section,
  .confirmation-section {
    padding: 14px;
    border-radius: 10px;
  }
  
  .stats-grid {
    gap: 8px;
  }
  
  .stat-card {
    padding: 14px;
    min-height: 75px;
  }
  
  .value-card {
    min-height: 85px;
  }
  
  .stat-label {
    font-size: 13px;
    margin-bottom: 6px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .value-card .stat-value {
    font-size: 22px;
  }
  
  .confirmation-item {
    padding: 8px 10px;
    margin-bottom: 10px;
  }
  
  .confirmation-label {
    font-size: 13px;
  }
  
  .clear-button {
    padding: 14px;
    font-size: 15px;
  }
  
  .warning-title {
    font-size: 15px;
  }
  
  .warning-list li {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .content-scroll {
    padding: 6px 10px;
  }
  
  .form-toolbar {
    padding: 6px 12px;
  }
  
  .back-button-pill {
    padding: 6px 14px;
    font-size: 13px;
  }
  
  .warning-section,
  .confirmation-section {
    padding: 12px;
  }
  
  .stats-grid {
    gap: 6px;
  }
  
  .stat-card {
    padding: 12px;
    min-height: 70px;
  }
  
  .value-card {
    min-height: 80px;
  }
  
  .stat-label {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .value-card .stat-value {
    font-size: 20px;
  }
  
  .confirmation-item {
    padding: 8px;
    margin-bottom: 8px;
  }
  
  .confirmation-label {
    font-size: 12px;
  }
  
  .clear-button {
    padding: 12px;
    font-size: 14px;
  }
  
  .final-modal {
    padding: 20px;
  }
  
  .modal-text {
    font-size: 14px;
  }
}

/* 深色模式适配 */
:root.dark .fixed-header {
  background: transparent;
}

:root.dark .back-button-pill {
  background: var(--bg-hover, rgba(255, 255, 255, 0.1));
  border-color: var(--border-color, #334155);
  color: var(--text-primary, #f1f5f9);
}

:root.dark .back-button-pill:hover {
  background: var(--accent-color, #60a5fa);
  border-color: var(--accent-color, #60a5fa);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}
</style>
