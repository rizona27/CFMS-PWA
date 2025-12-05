<template>
  <div class="debug-view">
    <h1>调试信息</h1>
    <div class="debug-info">
      <h2>localStorage</h2>
      <pre>{{ localStorageInfo }}</pre>
      
      <h2>Auth Store</h2>
      <pre>{{ authStoreInfo }}</pre>
      
      <h2>当前路由</h2>
      <pre>{{ routeInfo }}</pre>
      
      <div class="debug-buttons">
        <button @click="clearAndReload" class="debug-btn">清除缓存并刷新</button>
        <button @click="forceLogin('admin')" class="debug-btn">强制登录(admin)</button>
        <button @click="forceLogin('user')" class="debug-btn">强制登录(user)</button>
        <button @click="forceLogin('guest')" class="debug-btn">强制登录(guest)</button>
        <button @click="goToConfig" class="debug-btn">跳转到配置页</button>
        <button @click="goToAuth" class="debug-btn">跳转到登录页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const localStorageInfo = computed(() => {
  const items: Record<string, any> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      try {
        items[key] = JSON.parse(localStorage.getItem(key) || '')
      } catch {
        items[key] = localStorage.getItem(key)
      }
    }
  }
  return items
})

const authStoreInfo = computed(() => ({
  isLoggedIn: authStore.isLoggedIn,
  currentUser: authStore.currentUser,
  token: authStore.token,
  userType: authStore.userType,
  displayName: authStore.displayName
}))

const routeInfo = computed(() => ({
  path: route.path,
  fullPath: route.fullPath,
  params: route.params,
  query: route.query,
  meta: route.meta
}))

const clearAndReload = () => {
  console.log('清除所有localStorage并刷新页面')
  localStorage.clear()
  window.location.reload()
}

const forceLogin = (username: string) => {
  console.log(`强制登录: ${username}`)
  authStore.mockLogin(username, 'password')
  setTimeout(() => {
    router.replace('/config').then(() => {
      console.log('跳转到配置页成功')
    }).catch(err => {
      console.error('跳转失败:', err)
      window.location.href = '/'
    })
  }, 500)
}

const goToConfig = () => {
  console.log('尝试跳转到配置页')
  router.replace('/config').then(() => {
    console.log('跳转到配置页成功')
  }).catch(err => {
    console.error('跳转失败:', err)
  })
}

const goToAuth = () => {
  console.log('跳转到登录页')
  router.replace('/auth')
}

onMounted(() => {
  console.log('调试页面已加载')
})
</script>

<style scoped>
.debug-view {
  padding: 20px;
}

.debug-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.debug-info h2 {
  margin-top: 20px;
  color: #333;
}

.debug-info pre {
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
  font-family: monospace;
  font-size: 12px;
}

.debug-buttons {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.debug-btn {
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
  min-width: 150px;
}

.debug-btn:hover {
  background: #1976d2;
}
</style>