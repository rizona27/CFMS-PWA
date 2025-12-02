<template>
  <div class="summary-view">
    <div class="summary-header glass-effect">
      <div class="header-content">
        <h1 class="page-title">数据概览</h1>
        
        <GlobalSearchBar 
          v-model:searchTerm="searchTerm"
          class="global-search-area"
        />
      </div>
    </div>
    
    <div class="summary-content">
      <div v-if="!searchTerm" class="welcome-section">
        <p>欢迎回来，{{ authStore.displayName }}！</p>
        <p class="instruction">使用上方的搜索栏查找持仓信息。</p>
      </div>
      
      <div v-else class="search-results-section">
        <p>正在搜索: <strong>{{ searchTerm }}</strong>...</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
// 导入新的全局搜索组件
import GlobalSearchBar from '../components/common/GlobalSearchBar.vue'

const authStore = useAuthStore()

// 用于存储搜索词
const searchTerm = ref('') 

// 注意：原先的业务逻辑（如 formatCurrency, calculateDaysHeld, togglePin 等）
// 已根据您的要求全部移除，SummaryView 现在是一个干净的概览页面。

</script>

<style scoped>
.summary-view {
  min-height: 100vh;
  background: var(--bg-primary);
  /* 确保底部为 CustomTabBar 留出足够的空间 */
  padding-bottom: 100px; 
}

/* 顶部栏样式：用于固定搜索栏和标题 */
.summary-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20px;
  /* 保持底部的圆角 */
  border-radius: 0 0 var(--card-radius) var(--card-radius); 
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0;
}

.global-search-area {
  max-width: 600px;
  align-self: flex-start; /* 让搜索栏在 Flex 容器中保持靠左对齐 */
}

/* 主要内容 */
.summary-content {
  padding: 20px;
}

.welcome-section {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.welcome-section p {
  font-size: 16px;
  margin-bottom: 8px;
}

.welcome-section .instruction {
  font-size: 14px;
  color: var(--accent-color);
  font-weight: 500;
}

.search-results-section {
  padding: 20px 0;
  color: var(--text-secondary);
}
</style>