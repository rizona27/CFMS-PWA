<template>
  <div class="empty-state-wrapper">
    <div class="empty-state-content">
      <div class="icon-container">
        <img
          src="@/assets/empty.png"
          alt="无数据"
          class="empty-icon"
        />
      </div>

      <div class="text-content">
        <h1 class="main-title">无缓存数据</h1>
        <p class="subtitle">请导入后使用</p>
      </div>

      <div class="decorative-elements">
        <div class="decor-circle decor-1"></div>
        <div class="decor-circle decor-2"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  fullHeight?: boolean
}>()
</script>

<style scoped>
.empty-state-wrapper {
  width: 100%;
  height: v-bind('props.fullHeight ? "calc(100vh - var(--header-height, 60px))" : "auto"');
  min-height: v-bind('props.fullHeight ? "calc(100vh - var(--header-height, 60px) - 20px)" : "300px"');
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  /* 移除边框和阴影，将渐变应用到整个区域 */
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.95), rgba(230, 235, 240, 0.95));
  border-radius: 0;
  box-shadow: none;
}

.empty-state-content {
  text-align: center;
  padding: 40px 32px;
  max-width: 400px;
  z-index: 10;
}

.icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background-color: var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 50%;
  height: 50%;
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 5;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.decor-1 {
  width: 180px;
  height: 180px;
  background-color: var(--accent-color);
  top: 10%;
  left: -5%;
  animation-delay: 0s;
}

.decor-2 {
  width: 120px;
  height: 120px;
  background-color: var(--secondary-color);
  bottom: 5%;
  right: -5%;
  animation-delay: 10s;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}

@media (max-width: 768px) {
  .empty-state-wrapper {
    min-height: 300px;
  }
  
  .empty-state-content {
    padding: 32px 16px;
  }
  
  .icon-container {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }
  
  .main-title {
    font-size: 18px;
    margin-bottom: 6px;
  }
  
  .subtitle {
    font-size: 13px;
  }
  
  .decor-1 {
    width: 120px;
    height: 120px;
  }
  
  .decor-2 {
    width: 80px;
    height: 80px;
  }
}

:root.dark .empty-state-wrapper {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
}
</style>
