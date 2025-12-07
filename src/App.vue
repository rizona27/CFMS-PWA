<template>
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
import { computed, ref, onMounted, watch } from 'vue'
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
  }
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
  height: 100vh;
  overflow: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
  border-top-color: #2196f3;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .app-container {
    height: 100%;
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
</style>
