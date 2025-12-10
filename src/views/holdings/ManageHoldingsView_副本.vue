<template>
  <div class="manage-holdings-view">
    <NavBar title="持仓管理" back-route="/config" />
    
    <div class="content">
      <div class="cards-grid">
        <!-- 新增持仓 -->
        <CustomCard
          title="新增持仓"
          description="添加新的客户持仓记录"
          icon="➕"
          :bg-color="'rgba(59, 130, 246, 0.1)'"
          :fg-color="'#3b82f6'"
          @click="goToAddHolding"
        />
        
        <!-- 编辑持仓 -->
        <CustomCard
          title="编辑持仓"
          description="修改现有持仓信息"
          icon="✏️"
          :bg-color="'rgba(16, 185, 129, 0.1)'"
          :fg-color="'#10b981'"
          @click="goToEditHolding"
        />
        
        <!-- 导入持仓 -->
        <CustomCard
          title="导入持仓"
          description="从文件导入持仓数据"
          icon="📥"
          :bg-color="'rgba(245, 158, 11, 0.1)'"
          :fg-color="'#f59e0b'"
          @click="goToImportHolding"
        />
        
        <!-- 导出持仓 -->
        <CustomCard
          title="导出持仓"
          description="导出持仓数据到文件"
          icon="📤"
          :bg-color="'rgba(139, 92, 246, 0.1)'"
          :fg-color="'#8b5cf6'"
          @click="goToExportHolding"
        />
        
        <!-- 清空持仓（单独一行，样式不同） -->
        <div class="clear-card-wrapper">
          <CustomCard
            title="清空持仓"
            description="清空所有持仓数据（谨慎操作）"
            icon="🗑️"
            :bg-color="'rgba(239, 68, 68, 0.1)'"
            :fg-color="'#ef4444'"
            :is-glass-effect="false"
            @click="goToClearHoldings"
          >
            <div class="warning-note">
              <span class="warning-icon">⚠️</span>
              <span class="warning-text">此操作不可撤销</span>
            </div>
          </CustomCard>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import CustomCard from '@/components/common/CustomCard.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'

const router = useRouter()
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const goToAddHolding = () => {
  router.push('/holdings/add')
}

const goToEditHolding = () => {
  router.push('/holdings/edit')
}

const goToImportHolding = () => {
  router.push('/holdings/import')
}

const goToExportHolding = () => {
  router.push('/holdings/export')
}

const goToClearHoldings = () => {
  router.push('/holdings/clear')
}
</script>

<style scoped>
.manage-holdings-view {
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 768px;
  margin: 0 auto;
}

.clear-card-wrapper {
  grid-column: 1 / -1;
  margin-top: 8px;
}

.warning-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.warning-icon {
  font-size: 16px;
}

.warning-text {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .cards-grid {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .clear-card-wrapper {
    margin-top: 4px;
  }
}
</style>