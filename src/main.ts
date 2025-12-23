import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './style.css'
import './assets/main.css'

// 全局错误处理 - 在所有代码执行之前添加
window.addEventListener('error', (event) => {
  console.error('全局错误捕获:', event.error)
  console.error('错误发生位置:', event.filename, event.lineno, event.colno)
  
  // 如果是 siteHostMap 错误，可能是某些依赖未加载
  if (event.error && event.error.message && event.error.message.includes('siteHostMap')) {
    console.log('检测到 siteHostMap 错误，尝试修复...')
    // 防止错误传播导致应用崩溃
    event.preventDefault()
    
    // 如果是开发环境，显示友好提示
    if (import.meta.env.DEV) {
      console.warn('请检查 siteHostMap 相关的模块是否已正确导入')
    }
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
  event.preventDefault()
})

console.log('应用开始初始化...')

// 获取错误消息的安全函数
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '未知错误'
}

// 确保应用在 DOM 完全加载后启动
const initApp = () => {
  try {
    const app = createApp(App)
    const pinia = createPinia()
    
    app.use(pinia)
    app.use(router)
    
    // 等待路由就绪后再挂载应用
    router.isReady().then(() => {
      console.log('路由已就绪，开始挂载应用')
      app.mount('#app')
      
      // 初始化完成后检查当前路径
      const currentPath = window.location.hash.replace('#', '') || '/'
      console.log('当前路径:', currentPath)
      
      // 如果是重置密码页面，确保不会因为 token 检查被重定向
      if (currentPath.includes('/reset-password')) {
        console.log('检测到重置密码页面，确保访问正常')
      }
    }).catch(err => {
      console.error('路由就绪失败:', err)
      // 即使路由失败也尝试挂载应用
      app.mount('#app')
    })
    
  } catch (error) {
    console.error('应用初始化失败:', error)
    const errorMessage = getErrorMessage(error)
    
    // 显示友好的错误提示
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <h2 style="color: #ef4444; margin-bottom: 16px;">应用启动失败</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">${errorMessage}</p>
          <button onclick="window.location.reload()" style="
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">重新加载</button>
        </div>
      `
    }
  }
}

// 确保 DOM 已加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

// 初始化 - 确保用户访问根路径时显示正确页面
const initAppLogic = () => {
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
  initAppLogic()
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
