<template>
  <div class="manage-holdings-view">
    <!-- 使用统一的 NavBar 组件 -->
    <NavBar title="持仓管理" backText="返回" backRoute="/config" />
    
    <!-- 固定顶部部分 - 类似 AboutView 样式 -->
    <div class="fixed-top-section">
      <div class="top-container">
        <!-- 固定分隔符 - 与 AboutView 一致，无底色 -->
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
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content-section">
      <div class="content-scroll">
        <div class="content-wrapper">
          <div class="config-content">
            
            <div class="functions-section">
              <div class="function-grid">
                <div
                  class="function-card add-holding-card"
                  @click="goToAddHolding"
                >
                  <div class="card-content">
                    <div class="card-header">
                      <div class="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="card-title">新增持仓</h4>
                    </div>
                    <p class="card-description">添加新的客户持仓记录</p>
                  </div>
                </div>
                
                <div
                  class="function-card edit-holding-card"
                  @click="goToEditHolding"
                >
                  <div class="card-content">
                    <div class="card-header">
                      <div class="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="card-title">编辑持仓</h4>
                    </div>
                    <p class="card-description">修改现有持仓信息</p>
                  </div>
                </div>
                
                <div
                  class="function-card import-holding-card"
                  :class="{ 'disabled': userType === 'free' }"
                  @click="goToImportHolding"
                >
                  <div class="card-content">
                    <div class="card-header">
                      <div class="card-icon">
                        <transition name="icon-fade" mode="out-in">
                          <svg v-if="userType === 'free'" key="import-locked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 10C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H13C12.4696 21 11.9609 20.7893 11.5858 20.4142C11.2107 20.0391 11 19.5304 11 19V12C11 11.4696 11.2107 10.9609 11.5858 10.5858C11.9609 10.2107 12.4696 10 13 10H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13 10V7C13 5.34315 14.3431 4 16 4C17.6569 4 19 5.34315 19 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 21.0391 21 19.5304 21 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else key="import-unlocked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </transition>
                      </div>
                      <div class="card-title-wrapper">
                        <h4 class="card-title">
                          导入持仓
                          <span v-if="userType === 'free'" class="vip-badge">VIP</span>
                        </h4>
                      </div>
                    </div>
                    <p class="card-description">从文件导入持仓数据</p>
                  </div>
                </div>
                
                <div
                  class="function-card export-holding-card"
                  :class="{ 'disabled': userType === 'free' }"
                  @click="goToExportHolding"
                >
                  <div class="card-content">
                    <div class="card-header">
                      <div class="card-icon">
                        <transition name="icon-fade" mode="out-in">
                          <svg v-if="userType === 'free'" key="export-locked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 10C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H13C12.4696 21 11.9609 20.7893 11.5858 20.4142C11.2107 20.0391 11 19.5304 11 19V12C11 11.4696 11.2107 10.9609 11.5858 10.5858C11.9609 10.2107 12.4696 10 13 10H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13 10V7C13 5.34315 14.3431 4 16 4C17.6569 4 19 5.34315 19 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 21.0391 21 19.5304 21 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 10L12 5L7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <svg v-else key="export-unlocked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 21.0391 21 19.5304 21 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 10L12 5L7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </transition>
                      </div>
                      <div class="card-title-wrapper">
                        <h4 class="card-title">
                          导出持仓
                          <span v-if="userType === 'free'" class="vip-badge">VIP</span>
                        </h4>
                      </div>
                    </div>
                    <p class="card-description">导出持仓数据到文件</p>
                  </div>
                </div>
                
                <div
                  class="function-card clear-holding-card warning-card"
                  @click="goToClearHoldings"
                >
                  <div class="card-content">
                    <div class="card-header">
                      <div class="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6H5ZM9 10V17M15 10V17M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="card-title">清空持仓</h4>
                    </div>
                    <p class="card-description warning-text">清空所有持仓数据（谨慎操作）</p>
                    <div class="warning-note">
                      <span class="warning-icon">⚠️</span>
                      <span class="warning-note-text">此操作不可撤销</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer-section">
              <div class="footer-text">
                <span class="gradient-text">Manage with caution, trade with confidence.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 使用 ToastMessage 组件替换原有的全局 toast -->
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import ToastMessage from '../../components/common/ToastMessage.vue'
import NavBar from '@/components/layout/NavBar.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 获取用户类型
const userType = computed(() => {
  return authStore.userType || 'free'
})

// 修改：直接返回到ConfigView界面
const goBack = () => {
  router.push('/config')
}

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const goToAddHolding = () => {
  router.push('/holdings/add')
}

const goToEditHolding = () => {
  router.push('/holdings/edit')
}

const goToImportHolding = () => {
  // 检查用户类型，如果是基础用户则阻止并显示提示
  if (userType.value === 'free') {
    showNotification('导入持仓功能需要升级到VIP用户', 'warning')
    dataStore.safeAddLog('基础用户尝试使用导入持仓功能被阻止', 'info', false)
    return
  }
  router.push('/holdings/import')
}

const goToExportHolding = () => {
  // 检查用户类型，如果是基础用户则阻止并显示提示
  if (userType.value === 'free') {
    showNotification('导出持仓功能需要升级到VIP用户', 'warning')
    dataStore.safeAddLog('基础用户尝试使用导出持仓功能被阻止', 'info', false)
    return
  }
  router.push('/holdings/export')
}

const goToClearHoldings = () => {
  router.push('/holdings/clear')
}
</script>

<style scoped>
/* ------------------------------------- */
/* 页面整体布局 - 参考 AboutView 的布局 */
/* ------------------------------------- */
.manage-holdings-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:root.dark .manage-holdings-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 固定顶部部分 - 类似 AboutView 样式 */
.fixed-top-section {
  flex-shrink: 0;
  z-index: 90; /* 低于 NavBar */
  padding-top: 0;
  background: transparent; /* 无底色 */
}

.top-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 分隔符样式 - 与 AboutView 一致 */
.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 12px;
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

/* 可滚动的内容区域 */
.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: transparent;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 100px;
}

/* ------------------------------------- */
/* 功能卡片样式 */
/* ------------------------------------- */
.config-content {
  padding: 16px 0 120px;
}

.functions-section {
  margin-bottom: 20px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 8px;
}

.function-card {
  border-radius: 16px;
  border: none;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
}

:root.dark .function-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

:root.dark .function-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.function-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.function-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

.add-holding-card {
  background: rgba(59, 130, 246, 0.1);
}

.add-holding-card .card-icon svg {
  color: #3B82F6;
}

.edit-holding-card {
  background: rgba(16, 185, 129, 0.1);
}

.edit-holding-card .card-icon svg {
  color: #10b981;
}

.import-holding-card {
  background: rgba(245, 158, 11, 0.1);
}

.import-holding-card .card-icon svg {
  color: #F59E0B;
}

.export-holding-card {
  background: rgba(139, 92, 246, 0.1);
}

.export-holding-card .card-icon svg {
  color: #8b5cf6;
}

.clear-holding-card {
  background: rgba(239, 68, 68, 0.1);
  grid-column: 1 / -1;
}

.clear-holding-card .card-icon svg {
  color: #ef4444;
}

.warning-card {
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.5);
}

:root.dark .card-icon {
  background: rgba(255, 255, 255, 0.1);
}

.card-title-wrapper {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

:root.dark .card-title {
  color: #e5e7eb;
}

.card-description {
  font-size: 13px;
  color: #666;
  margin: 4px 0 8px 0;
  line-height: 1.4;
  flex: 1;
}

:root.dark .card-description {
  color: #9ca3af;
}

.warning-text {
  color: #ef4444 !important;
}

.warning-note {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin-top: 4px;
}

.warning-icon {
  font-size: 14px;
}

.warning-note-text {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

/* VIP徽章样式 */
.vip-badge {
  background: linear-gradient(135deg, #FFD700, #FFA500, #FF8C00);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-left: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 图标过渡动画 */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.footer-section {
  margin-top: 30px;
  text-align: center;
  padding: 0 16px;
}

.footer-text {
  padding: 16px 0;
}

.gradient-text {
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .top-container {
    padding: 0 12px;
  }
  
  .content-wrapper {
    padding: 0 12px 80px;
  }
  
  .function-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .function-card {
    padding: 14px;
    min-height: 110px;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
  }
  
  .card-title {
    font-size: 15px;
  }
  
  .card-description {
    font-size: 12px;
  }
  
  .vip-badge {
    font-size: 9px;
    padding: 1px 5px;
  }
  
  .warning-note {
    padding: 5px 8px;
  }
  
  .warning-note-text {
    font-size: 11px;
  }
  
  .config-content {
    padding: 12px 0 100px;
  }
  
  .footer-section {
    margin-top: 20px;
  }
  
  .footer-text {
    padding: 12px 0;
  }
  
  .gradient-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .config-content {
    padding: 10px 0 100px;
  }
  
  .function-card {
    padding: 12px;
    min-height: 100px;
  }
  
  .card-header {
    gap: 10px;
    margin-bottom: 6px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 11px;
  }
  
  .vip-badge {
    font-size: 8px;
    padding: 1px 4px;
  }
  
  .footer-section {
    margin-top: 16px;
  }
  
  .footer-text {
    padding: 10px 0;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 60px);
  }
  
  .function-card {
    min-height: 90px;
  }
  
  .config-content {
    padding: 10px 0 80px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .function-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .function-card.disabled:active {
    transform: none;
  }
}

@media (display-mode: standalone) {
  .config-content {
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }
}

/* 滚动条样式 */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:root.dark .content-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>