import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// 初始化 - 确保用户访问根路径时显示正确页面
const initApp = () => {
  // 清空可能的错误 token
  const token = localStorage.getItem('auth_token')
  if (token === 'undefined' || token === 'null') {
    localStorage.removeItem('auth_token')
  }
  
  // 检查当前路径，如果是不存在的路径，重定向到 auth
  const currentPath = window.location.pathname
  const validPaths = ['/', '/auth', '/summary', '/client', '/ranking', '/config', '/about', '/holdings', '/logs', '/edit-holding']
  
  if (!validPaths.includes(currentPath) && currentPath !== '/') {
    // 如果路径无效，重定向到登录页
    router.push('/auth')
  }
}

// 等待路由就绪
router.isReady().then(() => {
  initApp()
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})