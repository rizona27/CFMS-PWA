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
                  <span class="client-name">{{ holding.client_name }}</span>
                  <span class="client-id" v-if="holding.client_id">({{ holding.client_id }})</span>
                </div>
                <div class="holding-info">
                  <div class="fund-info">
                    <span class="fund-name">{{ holding.fund_name || '加载中...' }}</span>
                    <span class="fund-code">[{{ holding.fund_code }}]</span>
                  </div>
                  <div class="holding-details">
                    <div class="detail-item">
                      <span class="label">金额:</span>
                      <span class="value">{{ formatCurrency(holding.purchase_amount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">份额:</span>
                      <span class="value">{{ formatShares(holding.purchase_shares) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="edit-icon">✏️</div>
            </div>
          </div>
        </div>
        
        <div v-else-if="searchTerm && !isLoading" class="no-results">
          <p>未找到匹配的持仓记录</p>
        </div>
        
        <div v-else-if="!searchTerm" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">输入关键词搜索持仓记录</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import GlobalSearchBar from '@/components/common/GlobalSearchBar.vue'
import EditHoldingForm from './EditHoldingForm.vue'
import type { Holding } from '@/types/data'
import { convertHoldingToFundHolding } from '@/types/data'

const router = useRouter()

const searchTerm = ref('')
const isLoading = ref(false)
const selectedHolding = ref<Holding | null>(null)
const showEditForm = ref(false)

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
  showEditForm.value = true
}

const handleSave = (updatedHolding: any) => {
  console.log('保存持仓:', updatedHolding)
  // 这里应该调用API保存数据
  showEditForm.value = false
  selectedHolding.value = null
}

const closeEditForm = () => {
  showEditForm.value = false
  selectedHolding.value = null
}
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
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
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

.client-id {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 4px;
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
}

.fund-code {
  font-size: 12px;
  color: var(--accent-color);
  font-family: 'Courier New', monospace;
  background: rgba(var(--accent-color-rgb), 0.1);
  padding: 1px 6px;
  border-radius: 4px;
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
}

.result-item:hover .edit-icon {
  background: var(--accent-dark);
  transform: scale(1.1);
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
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
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .edit-icon {
    align-self: flex-end;
    margin-top: -40px;
  }
  
  .holding-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>