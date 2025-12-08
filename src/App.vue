<template>
  <!-- 模板部分保持不变 -->
  <div id="app">
    <!-- 登录状态下显示主布局 -->
    <template v-if="authStore.isLoggedIn">
      <div class="app-container">
        <div class="main-content">
          <router-view v-slot="{ Component, route }">
            <transition
              :name="getTransitionName(route)"
              mode="out-in"
              @before-enter="beforeEnter"
              @after-enter="afterEnter"
            >
              <component
                :is="Component"
                :key="route.fullPath"
              />
            </transition>
          </router-view>
        </div>
        
        <!-- 底部导航栏 - 根据路由meta控制显示 -->
        <CustomTabBar v-if="showTabBar && !isTabBarHidden" />
      </div>
      
      <!-- 全局加载指示器 -->
      <div v-if="isLoading" class="global-loading">
        <div class="loading-spinner"></div>
      </div>
    </template>
    
    <!-- 未登录状态下显示登录页面 -->
    <template v-else>
      <div class="auth-container-wrapper">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useDataStore } from './stores/dataStore'
import CustomTabBar from './components/layout/CustomTabBar.vue'

const authStore = useAuthStore()
const dataStore = useDataStore()
const route = useRoute()

// 响应式状态
const isLoading = ref(false)
const isTabBarHidden = ref(false)

// 获取过渡动画名称
const getTransitionName = (route: RouteLocationNormalized) => {
  return (route.meta?.transition as string) || 'fade'
}

// 是否显示底部导航栏
const showTabBar = computed(() => {
  return route.meta?.showTabBar !== false
})

// 页面切换动画
const beforeEnter = () => {
  isLoading.value = true
}

const afterEnter = () => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

// 监听路由变化，隐藏tabbar的特殊页面
watch(() => route.path, (newPath) => {
  // 隐藏tabbar的页面
  const hideTabBarRoutes = ['/edit-holding', '/logs', '/holdings', '/about']
  isTabBarHidden.value = hideTabBarRoutes.some(hideRoute => newPath.startsWith(hideRoute))
})

// 核心逻辑：应用主题
const applyTheme = () => {
  const mode = dataStore.userPreferences.themeMode
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // 判断最终是否应该是深色
  const shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark)

  if (shouldBeDark) {
    document.documentElement.classList.add('dark')
    // 兼容部分移动端浏览器状态栏颜色
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#1a1a2e')
    }
  } else {
    document.documentElement.classList.remove('dark')
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#f5f7fa')
    }
  }
  
  console.log('主题应用:', {
    mode,
    systemDark,
    shouldBeDark,
    hasDarkClass: document.documentElement.classList.contains('dark')
  })
  
  // 触发全局主题变化事件（使用统一的事件名称）
  window.dispatchEvent(new CustomEvent('theme-mode-changed', {
    detail: {
      mode: mode,
      isDark: shouldBeDark,
      timestamp: Date.now()
    }
  }))
}

// 系统主题变化监听器
let systemThemeListener: MediaQueryList | null = null

// 初始化主题
const initTheme = () => {
  // 1. 从localStorage获取或使用默认值
  const savedTheme = localStorage.getItem('theme_mode') as 'light' | 'dark' | 'system' | null
  if (savedTheme) {
    dataStore.userPreferences.themeMode = savedTheme
  }
  
  // 2. 应用主题
  applyTheme()
  
  // 3. 监听系统主题变化（针对"跟随系统"模式）
  systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)')
  systemThemeListener.addEventListener('change', handleSystemThemeChange)
  
  console.log('主题初始化完成，当前模式:', dataStore.userPreferences.themeMode)
}

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  if (dataStore.userPreferences.themeMode === 'system') {
    console.log('系统主题变化，重新应用主题')
    applyTheme()
  }
}

// 监听主题变更事件（统一事件名称）
const handleThemeModeChanged = (event: any) => {
  console.log('App.vue: 收到主题变更事件', event.detail)
  applyTheme()
}

// 检查登录状态
const checkAuthState = () => {
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  
  console.log('检查登录状态:')
  console.log('  token:', token)
  console.log('  user:', user)
  console.log('  authStore.isLoggedIn:', authStore.isLoggedIn)
  
  const hasValidToken = token && token !== 'null' && token !== 'undefined'
  
  if (hasValidToken && !authStore.isLoggedIn) {
    console.log('localStorage有token但store状态未更新，尝试自动登录')
    authStore.autoLogin()
  } else if (!hasValidToken && authStore.isLoggedIn) {
    console.log('localStorage无token但store状态已登录，清除登录状态')
    authStore.logout()
  }
}

// 应用启动时的初始化
onMounted(() => {
  console.log('CFMS PWA应用已启动')
  
  // 初始化主题
  initTheme()
  
  // 监听主题变更事件
  window.addEventListener('theme-mode-changed', handleThemeModeChanged)
  
  // 检查并同步登录状态
  setTimeout(() => {
    checkAuthState()
    
    // 如果当前在需要认证的页面但未登录，重定向到登录页
    if (route.meta?.requiresAuth && !authStore.isLoggedIn) {
      console.log('当前页面需要认证但未登录，检查localStorage...')
      const token = localStorage.getItem('auth_token')
      const hasValidToken = token && token !== 'null' && token !== 'undefined'
      
      if (!hasValidToken) {
        console.log('没有有效token，重定向到登录页')
        // 使用hash直接跳转，避免路由冲突
        window.location.hash = '#/auth'
      }
    }
  }, 100)
  
  // 加载数据
  dataStore.loadData()
  
  // 监听在线状态
  window.addEventListener('online', () => {
    // Toast消息现在由ToastMessage组件处理
  })
  
  window.addEventListener('offline', () => {
    // Toast消息现在由ToastMessage组件处理
  })
  
  // 监听localStorage变化
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth_token' || e.key === 'auth_user') {
      // 登录状态变化时重新检查
      setTimeout(() => checkAuthState(), 100)
    }
  })
})

// 监听store中的主题模式变化
watch(() => dataStore.userPreferences.themeMode, () => {
  applyTheme()
})

// 全局错误处理
onMounted(() => {
  const errorHandler = (event: ErrorEvent) => {
    console.error('全局错误:', event.error)
    // 检查是否是路由相关错误
    if (event.error && event.error.message && event.error.message.includes('router')) {
      console.log('路由相关错误，忽略')
      return
    }
    // 检查是否是Promise rejection错误
    if (event.error && event.error.name === 'NavigationDuplicated') {
      console.log('路由重复导航错误，忽略')
      return
    }
  }
  
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    console.error('未处理的Promise拒绝:', event.reason)
    // 检查是否是路由相关的rejection
    if (event.reason && event.reason.name === 'NavigationDuplicated') {
      console.log('路由重复导航rejection，忽略')
      return
    }
  }
  
  window.addEventListener('error', errorHandler)
  window.addEventListener('unhandledrejection', rejectionHandler)
  
  // 清理函数
  return () => {
    window.removeEventListener('error', errorHandler)
    window.removeEventListener('unhandledrejection', rejectionHandler)
    
    // 移除系统主题监听
    if (systemThemeListener) {
      systemThemeListener.removeEventListener('change', handleSystemThemeChange)
    }
    
    // 移除主题变更监听
    window.removeEventListener('theme-mode-changed', handleThemeModeChanged)
  }
})
</script>

<style>
/* 样式部分保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* 全局CSS变量定义 - 浅色模式 */
:root {
  --bg-primary: #f5f7fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f8fafc;
  --bg-card: #ffffff;
  --bg-hover: #f0f7ff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --border-color: #e2e8f0;
  --accent-color: #3b82f6;
  --accent-color-rgb: 59, 130, 246;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #06b6d4;
}

/* 深色模式CSS变量 */
:root.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #1a1a2e;
  --bg-card: #1e293b;
  --bg-hover: #2c3a5a;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --border-color: #334155;
  --accent-color: #60a5fa;
  --accent-color-rgb: 96, 165, 250;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --primary-color: #60a5fa;
  --success-color: #34d399;
  --warning-color: #fbbf24;
  --error-color: #f87171;
  --info-color: #22d3ee;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.auth-container-wrapper {
  width: 100%;
  height: 100vh;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 全局加载指示器 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 全局Toast样式 - 匹配ConfigView UI */
.global-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9998;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 320px;
  width: auto;
  text-align: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.global-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.global-toast.info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(30, 64, 175, 0.9));
  color: white;
  border-color: rgba(59, 130, 246, 0.3);
}

.global-toast.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9));
  color: white;
  border-color: rgba(34, 197, 94, 0.3);
}

.global-toast.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9));
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
}

.global-toast.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(180, 83, 9, 0.9));
  color: white;
  border-color: rgba(245, 158, 11, 0.3);
}

/* 深色模式Toast */
:root.dark .global-toast {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    0 4px 16px rgba(0, 0, 0, 0.2);
  border-width: 1px;
}

:root.dark .global-toast.info {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.9));
}

:root.dark .global-toast.success {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.9), rgba(34, 197, 94, 0.9));
}

:root.dark .global-toast.error {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.9), rgba(239, 68, 68, 0.9));
}

:root.dark .global-toast.warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9));
}

/* 移动端优化 */
@media (max-width: 768px) {
  .app-container {
    height: 100%;
  }
  
  .global-toast {
    max-width: 280px;
    padding: 10px 20px;
    font-size: 13px;
    bottom: 80px;
  }
}

/* 防止点击穿透 */
@media (hover: none) and (pointer: coarse) {
  button,
  [role="button"],
  input,
  select,
  textarea {
    touch-action: manipulation;
  }
}

/* 禁用文本选择 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* 深色模式滚动条 */
:root.dark ::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

:root.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

:root.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
