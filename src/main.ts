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
  
  // 更新有效路径列表，添加持仓管理相关路径
  const validPaths = [
    '/', '/auth', '/config', '/summary', '/client', '/ranking', '/about', '/logs', '/debug',
    // 持仓管理相关路径
    '/holdings', '/holdings/manage', '/holdings/add', '/holdings/edit', '/holdings/import', 
    '/holdings/export', '/holdings/clear'
  ]
  
  // 检查是否为有效路径（支持动态参数）
  const isValidPath = validPaths.some(path => {
    if (path.includes('/:')) {
      // 处理动态路由，如 /holdings/edit/:id
      const basePath = path.split('/:')[0]
      return currentPath.startsWith(basePath)
    }
    return path === currentPath
  })
  
  if (!isValidPath && currentPath !== '/') {
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
    environment: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }
  
  console.log('调试信息:', debugInfo)
  
  // 允许所有CORS请求（仅用于开发）
  if (typeof window !== 'undefined') {
    // 添加调试快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D 打开调试面板
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        console.log('调试快捷键激活')
        // 这里可以添加打开调试面板的逻辑
      }
    })
  }
}