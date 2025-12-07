<template>
  <div class="edit-holding-view">
    <!-- 导航栏 -->
    <div class="custom-navbar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
      <h1 class="page-title">编辑持仓</h1>
      <div class="nav-spacer"></div>
    </div>
    
    <div class="content">
      <div class="search-section">
        <h2 class="section-title">搜索客户持仓</h2>
        <p class="section-subtitle">输入客户编号、姓名或基金代码搜索持仓记录</p>
        
        <!-- 搜索框 -->
        <div class="search-box">
          <div class="search-input-container">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="输入客户姓名、客户号或基金代码..."
              class="search-input"
              @input="performSearch"
            />
            <button
              v-if="searchTerm"
              class="clear-search"
              @click="handleClearSearch"
            >
              ✕
            </button>
          </div>
        </div>
        
        <!-- 搜索结果列表 -->
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
                <div class="client-info">
                  <span class="client-name">{{ dataStore.getClientDisplayName(holding.clientName, holding.clientID) }}</span>
                </div>
                <div class="holding-info">
                  <div class="fund-info">
                    <span class="fund-name">{{ holding.fundName || '加载中...' }}</span>
                    <span class="fund-code">[{{ holding.fundCode }}]</span>
                  </div>
                  <div class="holding-details">
                    <div class="detail-item">
                      <span class="label">金额:</span>
                      <span class="value">{{ formatCurrency(holding.purchaseAmount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">份额:</span>
                      <span class="value">{{ formatShares(holding.purchaseShares) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="edit-icon">✏️</div>
            </div>
          </div>
        </div>
        
        <div v-else-if="searchTerm && !isLoading" class="no-results">
          <div class="no-results-icon">😕</div>
          <p class="no-results-text">未找到匹配的持仓记录</p>
          <p class="no-results-hint">请检查搜索关键词是否正确</p>
        </div>
        
        <div v-else-if="!searchTerm" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">输入关键词搜索持仓记录</p>
          <p class="empty-hint">可以搜索客户姓名、客户号或基金代码</p>
        </div>
        
        <!-- 加载中 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">搜索中...</p>
        </div>
      </div>
    </div>
    
    <!-- 编辑表单弹窗 -->
    <div v-if="showEditForm" class="edit-form-modal">
      <div class="modal-overlay" @click="closeEditForm"></div>
      <div class="modal-content">
        <EditHoldingForm
          v-if="selectedHolding"
          :holding="selectedHolding"
          @save="handleSave"
          @cancel="closeEditForm"
        />
      </div>
    </div>

    <!-- Toast消息组件 -->
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import EditHoldingForm from './EditHoldingForm.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'
import type { FundHolding } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// 搜索相关状态
const searchTerm = ref('')
const isLoading = ref(false)
const selectedHolding = ref<FundHolding | null>(null)
const showEditForm = ref(false)

// Toast相关状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 搜索结果
const searchResults = ref<FundHolding[]>([])

// 显示Toast消息 - 修复：调用 dataStore.showToastMessage
const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  dataStore.showToastMessage(message) // 使用 dataStore 的 showToastMessage 方法
  // 同时更新本地状态以便 ToastMessage 组件显示
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
  
  // 记录到API日志
  dataStore.addLog(`系统提示: ${message}`, type)
}

// 搜索监听
const performSearch = () => {
  if (!searchTerm.value.trim()) {
    searchResults.value = []
    return
  }
  
  isLoading.value = true
  
  setTimeout(() => {
    const term = searchTerm.value.toLowerCase().trim()
    
    // 从dataStore中搜索持仓
    searchResults.value = dataStore.holdings.filter(holding =>
      holding.clientName.toLowerCase().includes(term) ||
      (holding.clientID && holding.clientID.toLowerCase().includes(term)) ||
      holding.fundName.toLowerCase().includes(term) ||
      holding.fundCode.includes(term) ||
      (holding.remarks && holding.remarks.toLowerCase().includes(term))
    )
    
    isLoading.value = false
  }, 300)
}

// 格式化函数
const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatShares = (value: number) => {
  return `${value.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}份`
}

const handleClearSearch = () => {
  searchTerm.value = ''
  searchResults.value = []
  selectedHolding.value = null
}

const selectHolding = (holding: FundHolding) => {
  selectedHolding.value = holding
  showEditForm.value = true
  console.log('选择持仓:', holding)
}

const handleSave = async (updatedHolding: any) => {
  try {
    console.log('保存持仓:', updatedHolding)
    
    // 转换为dataStore格式
    const fundHolding: Partial<FundHolding> = {
      id: updatedHolding.id,
      clientName: updatedHolding.client_name || updatedHolding.clientName,
      clientID: updatedHolding.client_id || updatedHolding.clientID || '',
      fundCode: updatedHolding.fund_code || updatedHolding.fundCode,
      fundName: updatedHolding.fund_name || updatedHolding.fundName,
      purchaseAmount: updatedHolding.purchase_amount || updatedHolding.purchaseAmount,
      purchaseShares: updatedHolding.purchase_shares || updatedHolding.purchaseShares,
      purchaseDate: new Date(updatedHolding.purchase_date || updatedHolding.purchaseDate),
      currentNav: updatedHolding.current_nav || updatedHolding.currentNav || 0,
      navDate: new Date(updatedHolding.nav_date || updatedHolding.navDate || new Date()),
      isPinned: updatedHolding.is_pinned || updatedHolding.isPinned || false,
      pinnedTimestamp: updatedHolding.pinned_timestamp
        ? new Date(updatedHolding.pinned_timestamp)
        : (updatedHolding.is_pinned ? new Date() : undefined),
      remarks: updatedHolding.remarks || '',
      navReturn1m: updatedHolding.nav_return_1m || updatedHolding.navReturn1m,
      navReturn3m: updatedHolding.nav_return_3m || updatedHolding.navReturn3m,
      navReturn6m: updatedHolding.nav_return_6m || updatedHolding.navReturn6m,
      navReturn1y: updatedHolding.nav_return_1y || updatedHolding.navReturn1y
    }
    
    // 通过dataStore更新持仓
    if (fundHolding.id) {
      dataStore.updateHolding(fundHolding.id, fundHolding)
      
      // 修复：不再重复调用 showNotification，因为 dataStore.updateHolding 内部已经调用 showToastMessage
      // 只需关闭表单和重置状态
      showEditForm.value = false
      selectedHolding.value = null
      
      // 重新搜索以显示更新后的数据
      performSearch()
    }
    
  } catch (error) {
    console.error('保存失败:', error)
    dataStore.addLog(`编辑持仓失败: ${error}`, 'error')
    showNotification('持仓更新失败，请重试', 'error')
  }
}

const closeEditForm = () => {
  if (confirm('确定要取消编辑吗？未保存的修改将会丢失。')) {
    showEditForm.value = false
    selectedHolding.value = null
  }
}

const goBack = () => {
  router.push('/holdings/manage')
}

// 初始化 - 添加防缩放功能
onMounted(() => {
  dataStore.addLog('打开编辑持仓页面', 'info')
  
  // 禁止缩放 - 增强版
  const disableZoom = () => {
    // 添加 viewport meta 标签
    let metaViewport = document.querySelector('meta[name="viewport"]')
    if (!metaViewport) {
      metaViewport = document.createElement('meta')
      metaViewport.setAttribute('name', 'viewport')
      document.head.appendChild(metaViewport)
    }
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    
    // 禁用双击缩放
    let lastTouchEnd = 0
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }, { passive: false })
    
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
    
    // 禁用双指缩放
    document.addEventListener('gesturestart', (event) => {
      event.preventDefault()
    })
    
    // 禁用键盘缩放 (Ctrl + +/-)
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey === true || event.metaKey === true) &&
          (event.keyCode === 107 || event.keyCode === 109 || event.keyCode === 187 || event.keyCode === 189)) {
        event.preventDefault()
      }
    })
  }
  
  disableZoom()
})
</script>

<style scoped>
.edit-holding-view {
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
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
  -webkit-tap-highlight-color: transparent;
}

.back-button:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.back-icon {
  font-size: 18px;
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
  padding: 20px;
  max-height: calc(100vh - 120px);
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.content::-webkit-scrollbar {
  display: none;
}

.search-section {
  max-width: 800px;
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

.search-box {
  margin-bottom: 24px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg-card);
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.clear-search:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
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
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;
}

.results-list::-webkit-scrollbar {
  width: 4px;
}

.results-list::-webkit-scrollbar-track {
  background: transparent;
}

.results-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.result-item:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fund-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.fund-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-code {
  font-size: 12px;
  color: var(--accent-color);
  font-family: 'Courier New', monospace;
  background: rgba(var(--accent-color-rgb), 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.holding-details {
  display: flex;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.detail-item .value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.edit-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 12px;
}

.result-item:hover .edit-icon {
  background: var(--accent-dark);
  transform: scale(1.1);
}

.no-results {
  text-align: center;
  padding: 60px 0;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results-text {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.no-results-hint {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-secondary);
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--accent-color-rgb), 0.1);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 编辑表单弹窗样式 */
.edit-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
    max-height: calc(100vh - 100px);
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: auto;
  }
  
  .edit-icon {
    align-self: flex-end;
    margin-top: -40px;
    margin-left: 0;
  }
  
  .holding-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .results-list {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98%;
    max-height: 90vh;
  }
  
  .results-list {
    max-height: 250px;
  }
}

/* PWA全屏适配 */
@media (display-mode: standalone) {
  .content {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
  
  .custom-navbar {
    padding-top: calc(12px + env(safe-area-inset-top));
  }
}

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .result-item:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .back-button:active {
    transform: scale(0.95);
  }
  
  .edit-icon:active {
    transform: scale(0.9);
  }
  
  .clear-search:active {
    transform: scale(0.9);
  }
}
</style>