<template>
  <div id="app" :class="themeClass">
    <!-- 登录状态下显示主布局 -->
    <template v-if="authStore.isLoggedIn">
      <div class="app-container">
        <div class="main-content">
          <router-view v-slot="{ Component, route }">
            <transition 
              :name="route.meta.transition || 'fade'" 
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
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </template>
    
    <!-- 全局Toast消息 -->
    <div v-if="toastMessage" class="toast-message" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useDataStore } from './stores/dataStore'
import CustomTabBar from './components/layout/CustomTabBar.vue'

const authStore = useAuthStore()
const dataStore = useDataStore()
const route = useRoute()

// 响应式状态
const isLoading = ref(false)
const toastMessage = ref('')
const toastType = ref('info')
const isTabBarHidden = ref(false)

// 主题类名计算
const themeClass = computed(() => {
  const theme = localStorage.getItem('themeMode') || 'light'
  return `theme-${theme}`
})

// 是否显示底部导航栏
const showTabBar = computed(() => {
  return route.meta.showTabBar !== false
})

// 显示Toast消息
const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

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
  isTabBarHidden.value = hideTabBarRoutes.some(route => newPath.startsWith(route))
})

// 应用启动时的初始化
onMounted(() => {
  console.log('CFMS PWA应用已启动')
  
  // 自动登录
  authStore.autoLogin()
  
  // 加载数据
  dataStore.loadData()
  
  // 监听全局事件
  window.addEventListener('show-toast', (event: any) => {
    const { message, type } = event.detail
    showToast(message, type)
  })
  
  // 监听在线状态
  window.addEventListener('online', () => {
    showToast('网络已连接', 'success')
  })
  
  window.addEventListener('offline', () => {
    showToast('网络已断开', 'warning')
  })
})

// 全局错误处理
onMounted(() => {
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error)
    showToast('应用发生错误，请刷新页面', 'error')
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
    showToast('操作失败，请重试', 'error')
  })
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

/* 主题样式 */
.theme-light {
  --bg-primary: #f5f5f5;
  --bg-card: #ffffff;
  --bg-hover: #f0f0f0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-color: #2196f3;
  --border-color: #e0e0e0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.theme-dark {
  --bg-primary: #121212;
  --bg-card: #1e1e1e;
  --bg-hover: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --accent-color: #64b5f6;
  --border-color: #333333;
  background-color: var(--bg-primary);
  color: var(--text-primary);
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

/* Toast消息 */
.toast-message {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 80%;
  text-align: center;
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s;
  animation-fill-mode: forwards;
}

.toast-message.info {
  border-left: 4px solid #2196f3;
}

.toast-message.success {
  border-left: 4px solid #4caf50;
}

.toast-message.error {
  border-left: 4px solid #f44336;
}

.toast-message.warning {
  border-left: 4px solid #ff9800;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .app-container {
    height: 100%;
  }
  
  .toast-message {
    bottom: 80px;
    max-width: 90%;
    font-size: 14px;
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