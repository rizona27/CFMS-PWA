<template>
  <div class="no-results-wrapper">
    <div class="no-results-content">
        <div class="icon-container">
          <img
            src="@/assets/noresults.png"
            alt="无搜索结果"
            class="no-results-icon"
          />
        </div>

        <div class="text-content">
          <h1 class="main-title">无筛选结果</h1>
          <p class="subtitle">请修改筛选条件</p>
        </div>

        <div class="decorative-elements">
          <div class="decor-line decor-1"></div>
          <div class="decor-line decor-2"></div>
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
.no-results-wrapper {
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

.no-results-content {
  text-align: center;
  padding: 40px 32px;
  max-width: 400px;
  z-index: 10;
}

.icon-container {
  width: 70px;
  height: 70px;
  margin: 0 auto 24px;
  background-color: #fca5a5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-results-icon {
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

.decor-line {
  position: absolute;
  width: 120px;
  height: 2px;
  background-color: var(--accent-color);
  opacity: 0.2;
  animation: moveLine 15s infinite linear;
}

.decor-1 {
  top: 15%;
  left: 10%;
  transform: rotate(45deg);
  animation-delay: 0s;
}

.decor-2 {
  bottom: 10%;
  right: 15%;
  transform: rotate(-30deg);
  animation-delay: 7.5s;
}

@keyframes moveLine {
  0% {
    transform: translateX(-80px) rotate(45deg);
  }
  100% {
    transform: translateX(80px) rotate(45deg);
  }
}

@media (max-width: 768px) {
  .no-results-wrapper {
    min-height: 300px;
  }
  
  .no-results-content {
    padding: 32px 16px;
  }
  
  .icon-container {
    width: 60px;
    height: 60px;
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
    width: 60px;
    top: 25%;
  }
  
  .decor-2 {
    width: 60px;
    bottom: 20%;
  }
}

:root.dark .no-results-wrapper {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
}
</style>
