<template>
  <div class="custom-navbar" :class="{ 'with-shadow': shadow }">
    <button class="back-button-pill" @click="handleBack">
      <span class="back-icon">←</span>
      {{ backText }}
    </button>
    
    <!-- 通过CSS隐藏标题 -->
    <h1 class="page-title">{{ title }}</h1>
    
    <div class="nav-right-section">
      <slot name="right-buttons"></slot>
      <div class="nav-spacer" v-if="!$slots['right-buttons']"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
  backText?: string
  backRoute?: string
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backText: '返回',
  backRoute: '',
  shadow: false  // 默认关闭阴影
})

const router = useRouter()

const handleBack = () => {
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent; /* 改为透明背景 */
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  backdrop-filter: blur(10px); /* 添加毛玻璃效果保持可读性 */
  -webkit-backdrop-filter: blur(10px);
}

/* 移除阴影类，因为shadow默认为false */
.custom-navbar.with-shadow {
  box-shadow: none; /* 不再使用阴影 */
}

/* 返回按钮样式 - 更新为与APILogView一致的药丸形状 */
.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.1)); /* 更透明的背景 */
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 20px;
  color: var(--text-primary, #1e293b);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px); /* 添加毛玻璃效果 */
  -webkit-backdrop-filter: blur(8px);
  z-index: 101; /* 确保按钮在顶部 */
  position: relative;
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

/* 隐藏标题但不删除DOM元素，保持布局 */
.page-title {
  display: none; /* 隐藏标题 */
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin: 0;
  text-align: center;
  flex: 1;
  opacity: 0; /* 双重保证不可见 */
  visibility: hidden;
}

.nav-right-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-spacer {
  width: 80px;
  visibility: hidden;
}

/* 深色模式适配 */
:root.dark .custom-navbar {
  background: transparent; /* 深色模式也透明 */
}

:root.dark .custom-navbar.with-shadow {
  box-shadow: none;
}

:root.dark .back-button-pill {
  background: var(--bg-hover, rgba(255, 255, 255, 0.1));
  border-color: var(--border-color, #334155);
  color: var(--text-primary, #f1f5f9);
  box-shadow: none; /* 移除阴影 */
}

:root.dark .back-button-pill:hover {
  background: var(--accent-color, #60a5fa);
  border-color: var(--accent-color, #60a5fa);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

/* 页面标题在深色模式也隐藏 */
:root.dark .page-title {
  display: none;
  opacity: 0;
  visibility: hidden;
}

@media (max-width: 768px) {
  .custom-navbar {
    padding: 10px 12px;
    position: sticky; /* 确保在移动端也是粘性定位 */
    top: 0;
  }
  
  .back-button-pill {
    padding: 6px 12px;
    font-size: 13px;
    position: relative; /* 确保按钮在移动端正确显示 */
    z-index: 101;
  }
  
  .page-title {
    font-size: 16px;
  }
}

/* 确保NavBar在所有设备上都固定在顶部 */
@media (max-width: 480px) {
  .custom-navbar {
    padding: 8px 10px;
  }
  
  .back-button-pill {
    padding: 6px 10px;
    font-size: 12px;
  }
}

/* 防止页面内容在滚动时遮挡NavBar */
.custom-navbar::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color, #e2e8f0), transparent);
  pointer-events: none;
}

/* 确保NavBar在所有滚动场景下都可见 */
.custom-navbar {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
