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
            'button-glass': activeTab === tab.id,
            'pill-active': activeTab === tab.id
          }"
          @click="switchTab(tab)"
        >
          <div class="button-inner">
            <div class="icon-container">
              <img
                :src="getIconPath(tab.iconId || tab.id, activeTab === tab.id)"
                :alt="tab.label"
                class="tab-icon"
                loading="lazy"
              />
            </div>
            <span class="tab-label">{{ tab.label }}</span>
          </div>
          
          <!-- 药丸状背景元素 -->
          <div v-if="activeTab === tab.id" class="pill-background"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 标签页配置 - 根据您的路由配置进行调整
const tabs = [
  {
    id: 'summary',
    label: '一览',
    routeName: 'summary',
    routePath: '/summary',
    iconId: 'summary' // 保持与图标文件名一致
  },
  {
    id: 'client',
    label: '客户',
    routeName: 'client',
    routePath: '/client',
    iconId: 'client'
  },
  {
    id: 'ranking',  // 这里改为 ranking 以匹配您的路由
    label: '排名',
    routeName: 'ranking',
    routePath: '/ranking',
    iconId: 'top' // 图标文件名可能还是 top，所以单独指定
  },
  {
    id: 'config',
    label: '设置',
    routeName: 'config',
    routePath: '/config',
    iconId: 'config'
  }
]

const activeTab = ref('summary')

// 使用静态导入确保构建时包含图标
const iconModules = import.meta.glob('@/assets/icons/tabbar/*.png', { eager: true })

// 获取图标路径的方法
const getIconPath = (tabIconId: string, isActive: boolean): string => {
  const iconName = isActive ? `${tabIconId}2.png` : `${tabIconId}1.png`
  
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

const switchTab = async (tab: any) => {
  activeTab.value = tab.id
  
  try {
    // 先尝试使用路由名称导航
    if (tab.routeName) {
      await router.push({ name: tab.routeName })
    }
    // 如果路由名称失败，尝试使用路径
    else if (tab.routePath) {
      await router.push(tab.routePath)
    }
  } catch (error: any) {
    console.warn(`导航到 ${tab.label} 失败:`, error.message)
    
    // 如果是路由名称错误，使用路径重试
    if (error.message.includes('name') && tab.routePath) {
      console.log(`尝试使用路径导航: ${tab.routePath}`)
      await router.push(tab.routePath)
    }
  }
}

// 根据当前路由更新激活状态
const updateActiveTab = () => {
  const currentRouteName = route.name?.toString()
  const currentRoutePath = route.path
  
  console.log('当前路由:', { currentRouteName, currentRoutePath })
  
  // 先尝试匹配路由名称
  if (currentRouteName) {
    const matchingTabByName = tabs.find(tab =>
      tab.routeName === currentRouteName ||
      tab.id === currentRouteName
    )
    if (matchingTabByName) {
      console.log('通过路由名称匹配到标签:', matchingTabByName.id)
      activeTab.value = matchingTabByName.id
      return
    }
  }
  
  // 如果名称不匹配，尝试匹配路径
  const matchingTabByPath = tabs.find(tab =>
    currentRoutePath === tab.routePath ||
    (tab.routePath !== '/' && currentRoutePath.startsWith(tab.routePath + '/'))
  )
  
  if (matchingTabByPath) {
    console.log('通过路由路径匹配到标签:', matchingTabByPath.id)
    activeTab.value = matchingTabByPath.id
    return
  }
  
  // 处理根路径特殊情况
  if (currentRoutePath === '/' || currentRouteName === 'root') {
    const token = localStorage.getItem('auth_token')
    const hasValidToken = token && token !== 'null' && token !== 'undefined'
    
    // 如果已登录，默认显示config标签
    if (hasValidToken) {
      console.log('根路径，已登录，激活config标签')
      activeTab.value = 'config'
    } else {
      console.log('根路径，未登录，激活summary标签')
      activeTab.value = 'summary'
    }
    return
  }
  
  // 默认激活第一个标签
  console.log('未匹配到任何路由，默认激活第一个标签')
  activeTab.value = tabs[0].id
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateActiveTab()
  },
  { immediate: true }
)

// 初始设置
onMounted(() => {
  updateActiveTab()
})

// 计算当前是否显示TabBar
const showTabBar = computed(() => {
  // 从路由meta获取showTabBar配置
  const routeMeta = route.meta as { showTabBar?: boolean }
  return routeMeta.showTabBar !== false // 默认显示，除非明确设置为false
})
</script>

<style scoped>
.ios-tab-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  pointer-events: none;
  background: transparent;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 隐藏TabBar的样式 */
.ios-tab-bar-container.hidden {
  opacity: 0;
  transform: translateY(100%);
  pointer-events: none;
}

.ios-tab-bar {
  pointer-events: auto;
  border-radius: 9999px; /* 药丸状圆角 */
  padding: 8px;
  width: 100%;
  max-width: 360px; /* 限制宽度，使药丸形状更明显 */
  margin: 0 auto 12px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.75));
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.3));
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 8px 40px rgba(79, 172, 254, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  /* 优化移动端触摸体验 */
  touch-action: manipulation;
  overflow: hidden; /* 确保内部元素不超出药丸形状 */
}

.tab-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
}

.tab-button {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
  /* 优化移动端触摸区域 */
  min-height: 48px;
  z-index: 2;
}

.tab-button:hover:not(.active) {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
}

.tab-button.active {
  flex: 1.2; /* 激活的按钮稍微宽一点 */
}

/* 药丸状背景 - 激活状态 */
.pill-background {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border-radius: 9999px;
  background: var(--glass-button-bg, rgba(79, 172, 254, 0.2));
  border: 1px solid var(--glass-button-border, rgba(79, 172, 254, 0.2));
  box-shadow:
    0 2px 12px var(--glass-button-shadow, rgba(79, 172, 254, 0.15)),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 1;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button.active .pill-background {
  animation: pill-pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pill-pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  70% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
}

.button-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button.active .icon-container {
  transform: translateY(-2px);
}

.tab-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
  filter: brightness(0.9) saturate(0.9);
  /* 优化抗锯齿 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.tab-button.active .tab-icon {
  filter: brightness(1.1) saturate(1.2);
  transform: scale(1.1);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-button:not(.active) .tab-label {
  color: var(--text-secondary, #666666);
  opacity: 0.85;
  font-weight: 500;
  transform: translateY(1px);
}

.tab-button.active .tab-label {
  color: var(--accent-color, #007AFF);
  opacity: 1;
  font-weight: 600;
  transform: translateY(0);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* 深色模式适配 */
:root.dark .ios-tab-bar {
  background: var(--glass-bg, rgba(20, 20, 30, 0.8));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  box-shadow:
    var(--card-shadow, 0 4px 24px rgba(0, 0, 0, 0.3)),
    0 8px 40px rgba(79, 172, 254, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

:root.dark .tab-button:hover:not(.active) {
  background: var(--bg-hover, rgba(255, 255, 255, 0.08));
}

/* 深色模式下的药丸背景 */
:root.dark .pill-background {
  background: var(--glass-button-bg, rgba(79, 172, 254, 0.25));
  border: 1px solid var(--glass-button-border, rgba(79, 172, 254, 0.15));
  box-shadow:
    0 2px 12px var(--glass-button-shadow, rgba(79, 172, 254, 0.2)),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

:root.dark .tab-button.active .tab-label {
  color: var(--accent-color, #64B5F6);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

:root.dark .tab-button:not(.active) .tab-label {
  color: var(--text-secondary, #A0A0A0);
}

:root.dark .tab-icon {
  filter: brightness(0.8) saturate(0.9);
}

:root.dark .tab-button.active .tab-icon {
  filter: brightness(1.2) saturate(1.3);
}

/* PWA特定优化 - 添加到主屏幕时的底部安全区域 */
@supports (padding: max(0px)) {
  .ios-tab-bar-container {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

/* 移动端适配 - 针对不同屏幕尺寸 */
@media (max-width: 768px) {
  .ios-tab-bar-container {
    padding: 0 16px;
  }
  
  .ios-tab-bar {
    max-width: 340px;
    border-radius: 9999px;
    padding: 6px;
    margin-bottom: 10px;
  }
  
  .tab-button {
    padding: 6px 10px;
    min-height: 44px;
    border-radius: 12px;
  }
  
  .pill-background {
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
  }
  
  .icon-container {
    width: 22px;
    height: 22px;
  }
  
  .tab-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .ios-tab-bar-container {
    padding: 0 12px;
  }
  
  .ios-tab-bar {
    max-width: 320px;
    border-radius: 9999px;
    padding: 5px;
    margin-bottom: 8px;
  }
  
  .tab-button {
    padding: 5px 8px;
    min-height: 40px;
    min-width: 0;
  }
  
  .pill-background {
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
  }
  
  .icon-container {
    width: 20px;
    height: 20px;
  }
  
  .tab-label {
    font-size: 9px;
  }
}

/* 大屏手机适配 */
@media (min-width: 481px) and (max-width: 768px) {
  .ios-tab-bar {
    max-width: 360px;
  }
}

/* 横屏模式适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .ios-tab-bar-container {
    padding-bottom: 8px;
  }
  
  .ios-tab-bar {
    max-width: 320px;
    padding: 4px 6px;
    margin-bottom: 6px;
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
    border: 1.5px solid var(--glass-border, rgba(0, 0, 0, 0.4));
  }
  
  .tab-button.active .tab-label {
    font-weight: 700;
  }
  
  .pill-background {
    border: 2px solid var(--accent-color, #007AFF);
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .tab-button,
  .tab-button .tab-icon,
  .tab-button .tab-label,
  .icon-container,
  .pill-background {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}

/* 新增：超小屏幕设备适配 */
@media (max-width: 360px) {
  .ios-tab-bar {
    max-width: 300px;
    padding: 4px;
  }
  
  .tab-button {
    padding: 4px 6px;
  }
  
  .tab-label {
    font-size: 8px;
  }
}
</style>
