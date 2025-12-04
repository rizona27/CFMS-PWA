<template>
  <div class="edit-holding-view">
    <div class="custom-navbar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
      <h1 class="page-title">编辑持仓</h1>
      <div class="nav-spacer"></div>
    </div>
    
    <div class="content">
      <p>编辑持仓页面内容正在开发中...</p>
      <div class="action-buttons">
        <button @click="goToHoldings" class="action-button secondary">
          返回持仓管理
        </button>
        <button @click="goToConfig" class="action-button">
          返回设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goToHoldings = () => {
  router.push('/holdings')
}

const goToConfig = () => {
  router.push('/config')
}
</script>

<style scoped>
.edit-holding-view {
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
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
}

.back-button:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.back-icon {
  font-size: 18px;
  line-height: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.nav-spacer {
  width: 80px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-button {
  padding: 12px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.action-button.secondary {
  background: var(--text-secondary);
}
</style>