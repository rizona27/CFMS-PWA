<template>
  <div class="ios-tab-bar-container">
    <div class="ios-tab-bar glass-effect">
      <div class="tab-buttons">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{
            active: activeTab === tab.id,
            'button-glass': activeTab === tab.id
          }"
          @click="switchTab(tab.id)"
        >
          <div class="button-inner">
            <div class="icon-container">
              <img
                :src="getIconPath(tab.id, activeTab === tab.id)"
                :alt="tab.label"
                class="tab-icon"
                loading="lazy"
              />
            </div>
            <span class="tab-label">{{ tab.label }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 标签页配置
const tabs = [
  { id: 'summary', label: '一览' },
  { id: 'client', label: '客户' },
  { id: 'top', label: '排名' },
  { id: 'config', label: '设置' }
]

const activeTab = ref('summary')

// 使用静态导入确保构建时包含图标
const iconModules = import.meta.glob('@/assets/icons/tabbar/*.png', { eager: true })

// 获取图标路径的方法
const getIconPath = (tabId: string, isActive: boolean): string => {
  const iconName = isActive ? `${tabId}2.png` : `${tabId}1.png`
  const iconKey = `/src/assets/icons/tabbar/${iconName}`
  
  // 查找匹配的图标模块
  for (const [path, module] of Object.entries(iconModules)) {
    if (path.includes(iconName)) {
      // @ts-ignore - 确保返回正确的路径
      return (module as any).default || (module as any)
    }
  }
  
  // 如果找不到，返回默认路径（开发环境可用）
  if (import.meta.env.DEV) {
    return new URL(`/src/assets/icons/tabbar/${iconName}`, import.meta.url).href
  }
  
  console.warn(`找不到图标: ${iconName}`)
  return ''
}

const switchTab = (tabId: string) => {
  activeTab.value = tabId
  router.push({ name: tabId })
}

watch(
  () => route.name,
  (routeName) => {
    if (routeName && typeof routeName === 'string') {
      activeTab.value = routeName
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.ios-tab-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 16px);
  pointer-events: none;
  background: transparent;
  /* 添加轻微的上方阴影，表示浮起效果 */
  box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.05);
}

.ios-tab-bar {
  pointer-events: auto;
  border-radius: 20px;
  padding: 10px 8px;
  width: 100%;
  max-width: 500px;
  min-width: 320px;
  margin: 0 auto 8px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.92));
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.25));
  box-shadow:
    var(--card-shadow, 0 4px 24px rgba(0, 0, 0, 0.08)),
    0 8px 40px rgba(79, 172, 254, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  /* 优化移动端触摸体验 */
  touch-action: manipulation;
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.tab-button {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  border-radius: 14px;
  min-width: 60px;
  flex-grow: 1;
  overflow: hidden;
  /* 优化移动端触摸区域 */
  min-height: 44px;
}

.tab-button:hover:not(.active) {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
}

.tab-button.active {
  flex-grow: 2;
  /* 轻微放大效果 */
  transform: scale(1.02);
}

/* 磨玻璃效果 */
.button-glass {
  background: var(--glass-button-bg, rgba(79, 172, 254, 0.15)) !important;
  border: 1px solid var(--glass-button-border, rgba(79, 172, 254, 0.1));
  box-shadow:
    0 2px 8px var(--glass-button-shadow, rgba(79, 172, 254, 0.08)),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.button-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  position: relative;
  z-index: 2;
  /* 确保内容居中 */
  width: 100%;
}

.icon-container {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.tab-button.active .icon-container {
  transform: translateY(-1px);
}

.tab-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
  opacity: 0.8;
  /* 优化抗锯齿 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.tab-button.active .tab-icon {
  opacity: 1;
  filter: brightness(1.1) saturate(1.1);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  /* 确保文字不会被截断 */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-button:not(.active) .tab-label {
  color: var(--text-secondary, #666666);
  opacity: 0.85;
  font-weight: 500;
}

.tab-button.active .tab-label {
  color: var(--accent-color, #007AFF);
  opacity: 1;
  font-weight: 600;
  /* 轻微的上浮效果 */
  transform: translateY(0.5px);
}

/* 深色模式适配 */
:root.dark .ios-tab-bar {
  background: var(--glass-bg, rgba(30, 30, 46, 0.85));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
  box-shadow:
    var(--card-shadow, 0 4px 24px rgba(0, 0, 0, 0.25)),
    0 8px 40px rgba(79, 172, 254, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

:root.dark .tab-button:hover:not(.active) {
  background: var(--bg-hover, rgba(255, 255, 255, 0.06));
}

/* 深色模式下的磨玻璃激活按钮样式 */
:root.dark .button-glass {
  background: var(--glass-button-bg, rgba(79, 172, 254, 0.18)) !important;
  border: 1px solid var(--glass-button-border, rgba(79, 172, 254, 0.12));
  box-shadow:
    0 2px 8px var(--glass-button-shadow, rgba(79, 172, 254, 0.1)),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

:root.dark .tab-button.active .tab-label {
  color: var(--accent-color, #64B5F6);
}

:root.dark .tab-button:not(.active) .tab-label {
  color: var(--text-secondary, #A0A0A0);
}

/* PWA特定优化 - 添加到主屏幕时的底部安全区域 */
@supports (padding: max(0px)) {
  .ios-tab-bar-container {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}

/* 移动端适配 - 针对不同屏幕尺寸 */
@media (max-width: 768px) {
  .ios-tab-bar-container {
    padding: 0 12px;
  }
  
  .ios-tab-bar {
    max-width: 100%;
    min-width: unset;
    border-radius: 18px;
    padding: 8px 6px;
    margin-bottom: 6px;
  }
  
  .tab-button {
    padding: 5px 8px;
    min-width: 54px;
    border-radius: 12px;
  }
  
  .icon-container {
    width: 20px;
    height: 20px;
  }
  
  .tab-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .ios-tab-bar-container {
    padding: 0 10px;
  }
  
  .ios-tab-bar {
    border-radius: 16px;
    padding: 6px 4px;
    margin-bottom: 4px;
  }
  
  .tab-button {
    padding: 4px 6px;
    min-width: 48px;
    min-height: 40px;
  }
  
  .icon-container {
    width: 18px;
    height: 18px;
  }
  
  .tab-label {
    font-size: 9px;
  }
}

/* 大屏手机适配 */
@media (min-width: 481px) and (max-width: 768px) {
  .ios-tab-bar {
    max-width: 440px;
  }
}

/* 横屏模式适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .ios-tab-bar-container {
    padding-bottom: 8px;
  }
  
  .ios-tab-bar {
    padding: 6px 8px;
    margin-bottom: 4px;
  }
  
  .tab-button {
    padding: 4px 6px;
    min-height: 36px;
  }
  
  .button-inner {
    gap: 2px;
  }
  
  .icon-container {
    width: 18px;
    height: 18px;
  }
  
  .tab-label {
    font-size: 9px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .ios-tab-bar {
    border: 1.5px solid var(--glass-border, rgba(0, 0, 0, 0.3));
  }
  
  .tab-button.active .tab-label {
    font-weight: 700;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .tab-button,
  .tab-button .tab-icon,
  .tab-button .tab-label,
  .icon-container {
    transition: none !important;
    transform: none !important;
  }
}
</style>
