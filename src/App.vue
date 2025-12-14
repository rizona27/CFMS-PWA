<template>
  <div id="app">
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
        
        <CustomTabBar v-if="showTabBar && !isTabBarHidden" />
      </div>
      
      <div v-if="isLoading" class="global-loading">
        <div class="loading-spinner"></div>
      </div>
    </template>
    
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

const isLoading = ref(false)
const isTabBarHidden = ref(false)

const getTransitionName = (route: RouteLocationNormalized) => {
  return (route.meta?.transition as string) || 'fade'
}

const showTabBar = computed(() => {
  return route.meta?.showTabBar !== false
})

const beforeEnter = () => {
  isLoading.value = true
}

const afterEnter = () => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

watch(() => route.path, (newPath) => {
  const hideTabBarRoutes = ['/edit-holding', '/logs', '/holdings', '/about']
  isTabBarHidden.value = hideTabBarRoutes.some(hideRoute => newPath.startsWith(hideRoute))
})

// 核心逻辑：应用主题
const applyTheme = () => {
  const mode = dataStore.userPreferences.themeMode
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  const shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark)

  // 清除所有主题类
  document.documentElement.classList.remove('dark', 'theme-light', 'theme-dark')
  
  // 添加正确的主题类
  if (mode === 'light') {
    document.documentElement.classList.add('theme-light')
  } else if (mode === 'dark') {
    document.documentElement.classList.add('dark', 'theme-dark')
  } else if (mode === 'system') {
    if (systemDark) {
      document.documentElement.classList.add('dark', 'theme-dark')
    } else {
      document.documentElement.classList.add('theme-light')
    }
  }
  
  // 更新主题颜色meta标签
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', shouldBeDark ? '#1a1a2e' : '#f5f7fa')
  }
  
  console.log('主题应用:', {
    mode,
    systemDark,
    shouldBeDark,
    currentClasses: document.documentElement.className
  })
}

// 系统主题变化监听器
let systemThemeListener: MediaQueryList | null = null

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme_mode') as 'light' | 'dark' | 'system' | null
  if (savedTheme) {
    dataStore.userPreferences.themeMode = savedTheme
  }
  
  applyTheme()
  
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

// 监听主题变更事件
const handleThemeChanged = (event: any) => {
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

onMounted(() => {
  console.log('CFMS PWA应用已启动')
  
  initTheme()
  
  window.addEventListener('theme-changed', handleThemeChanged)
  
  setTimeout(() => {
    checkAuthState()
    
    if (route.meta?.requiresAuth && !authStore.isLoggedIn) {
      console.log('当前页面需要认证但未登录，检查localStorage...')
      const token = localStorage.getItem('auth_token')
      const hasValidToken = token && token !== 'null' && token !== 'undefined'
      
      if (!hasValidToken) {
        console.log('没有有效token，重定向到登录页')
        window.location.hash = '#/auth'
      }
    }
  }, 100)
  
  dataStore.loadData()
  
  window.addEventListener('online', () => {
    // Toast消息现在由ToastMessage组件处理
  })
  
  window.addEventListener('offline', () => {
    // Toast消息现在由ToastMessage组件处理
  })
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth_token' || e.key === 'auth_user') {
      setTimeout(() => checkAuthState(), 100)
    }
  })
})

// 🔴 移除可能导致循环的watch
// watch(() => dataStore.userPreferences.themeMode, () => {
//   applyTheme()
// })

onUnmounted(() => {
  const errorHandler = (event: ErrorEvent) => {
    console.error('全局错误:', event.error)
    if (event.error && event.error.message && event.error.message.includes('router')) {
      console.log('路由相关错误，忽略')
      return
    }
    if (event.error && event.error.name === 'NavigationDuplicated') {
      console.log('路由重复导航错误，忽略')
      return
    }
  }
  
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    console.error('未处理的Promise拒绝:', event.reason)
    if (event.reason && event.reason.name === 'NavigationDuplicated') {
      console.log('路由重复导航rejection，忽略')
      return
    }
  }
  
  window.removeEventListener('error', errorHandler)
  window.removeEventListener('unhandledrejection', rejectionHandler)
  
  if (systemThemeListener) {
    systemThemeListener.removeEventListener('change', handleSystemThemeChange)
  }
  
  window.removeEventListener('theme-changed', handleThemeChanged)
  window.removeEventListener('storage', () => {})
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
})
</script>

<style>
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
  height: 100%;
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

/* 确保theme-light和theme-dark类有正确变量 */
:root.theme-light {
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
}

:root.theme-dark {
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
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  
  /* === 修正：仅设置底部安全区域，为 CustomTabBar 留出空间 === */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* ============================================== */
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  /* === 修正：移除 main-content 上的 padding-top === */
  /* 顶部安全区域由各个view组件自己处理 */
}

.auth-container-wrapper {
  width: 100%;
  height: 100vh;
}

/* 过渡动画 */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局加载指示器样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 全局Toast样式 */
.global-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  max-width: 320px;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.global-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.global-toast.info {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.9));
}

.global-toast.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(34, 197, 94, 0.9));
}

.global-toast.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 63, 94, 0.9));
}

.global-toast.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(251, 191, 36, 0.9));
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

@media (hover: none) and (pointer: coarse) {
  button,
  .action-btn,
  .sort-btn,
  .sort-order-btn,
  .status-pill,
  .refresh-pill {
    padding: 10px 14px;
    font-size: 14px;
  }
  
  .client-card-header,
  .fund-card-header {
    padding: 14px 12px;
  }
  
  .client-card-footer,
  .fund-card-footer {
    padding: 12px;
  }
}
</style>
