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
  console.log('应用初始化开始...')
  
  // 清空可能的错误 token
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  
  console.log('初始token:', token)
  console.log('初始user:', user)
  
  if (token === 'undefined' || token === 'null') {
    console.log('清除无效token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
  
  // 检查当前路径，如果是不存在的路径，重定向到 auth
  const currentPath = window.location.hash ? window.location.hash.substring(1) : '/'
  console.log('当前路径:', currentPath)
  
  const validPaths = ['/', '/auth', '/summary', '/client', '/ranking', '/config', '/about', '/holdings', '/logs', '/edit-holding', '/debug']
  
  if (!validPaths.includes(currentPath) && currentPath !== '/') {
    console.log('路径无效，重定向到 auth')
    router.push('/auth')
  }
  
  console.log('应用初始化完成')
}

// 等待路由就绪
router.isReady().then(() => {
  console.log('路由已就绪')
  initApp()
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})