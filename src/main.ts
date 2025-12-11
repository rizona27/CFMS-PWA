import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './style.css'
// 🚀 核心修复：添加对 main.css 的导入。
// 根据您的路径信息 (main.css 在 src/assets 下)，相对路径为 './assets/main.css'
import './assets/main.css'


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
  
  // 更新有效路径列表，添加持仓管理相关路径
  const validPaths = [
    '/', '/auth', '/config', '/summary', '/client', '/ranking', '/about', '/logs', '/debug',
    // 持仓管理相关路径
    '/holdings', '/holdings/manage', '/holdings/add', '/holdings/edit', '/holdings/import',
    '/holdings/export', '/holdings/clear'
  ]
  
  // 检查当前路径是否在有效路径中
  const isValidPath = validPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'))
  
  if (!isValidPath && currentPath !== '/auth' && currentPath !== '/404') {
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
  
  // 记录到数据存储的日志中
  const dataStore = import('./stores/dataStore').then(module => {
    module.useDataStore().addLog(`全局错误: ${event.error?.message || '未知错误'}`, 'error')
  }).catch(() => {
    console.log('无法记录错误到日志')
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
  
  // 记录到数据存储的日志中
  const dataStore = import('./stores/dataStore').then(module => {
    module.useDataStore().addLog(`未处理的Promise拒绝: ${event.reason?.message || event.reason}`, 'error')
  }).catch(() => {
    console.log('无法记录Promise拒绝到日志')
  })
})

// 调试模式支持
const isDebugMode = import.meta.env.DEV || localStorage.getItem('debug_mode') === 'true'

if (isDebugMode) {
  console.log('调试模式已启用')
  
  // 添加调试工具
  const debugInfo = {
    version: '1.0.0',
    env: import.meta.env.MODE,
    isPWA: window.matchMedia('(display-mode: standalone)').matches,
    isMobile: /Mobi|Android/i.test(navigator.userAgent),
  }
  
  console.log('Debug Info:', debugInfo)
  
  // 方便在控制台调用
  ;(window as any).debugInfo = debugInfo
}
