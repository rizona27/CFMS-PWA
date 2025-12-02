<template>
  <div id="app" :class="themeClass">
    <!-- 登录状态下显示主布局 -->
    <template v-if="authStore.isLoggedIn">
      <div class="app-container">
        <div class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
        
        <!-- 底部导航栏 -->
        <CustomTabBar />
      </div>
    </template>
    
    <!-- 未登录状态下显示登录页面 -->
    <template v-else>
      <AuthView />
    </template>
    
    <!-- 全局Toast消息 -->
    <!-- <ToastMessage /> -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import CustomTabBar from './components/layout/CustomTabBar.vue'
import AuthView from './views/AuthView.vue'
// import ToastMessage from './components/common/ToastMessage.vue'

const authStore = useAuthStore()

// 主题类名计算
const themeClass = computed(() => {
  return 'theme-light'
})

// 应用启动时的初始化
onMounted(() => {
  console.log('CFMS PWA应用已启动')
  authStore.autoLogin()
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
}

/* 主题样式 */
.theme-light {
  background-color: #f5f5f5;
  color: #333333;
}

.theme-dark {
  background-color: #121212;
  color: #ffffff;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>