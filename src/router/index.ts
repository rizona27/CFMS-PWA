    import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

    // 路由懒加载 - 使用绝对路径
    const SummaryView = () => import('@/views/SummaryView.vue')
    const ClientView = () => import('@/views/ClientView.vue')
    const TopPerformersView = () => import('@/views/TopPerformersView.vue')
    const ConfigView = () => import('@/views/ConfigView.vue')
    const ActivationView = () => import('@/views/ActivationView.vue')
    const AuthView = () => import('@/views/auth/AuthView.vue')
    const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue')
    const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
    const AboutView = () => import('@/views/AboutView.vue')
    const APILogView = () => import('@/views/APILogView.vue')
    const CloudSyncView = () => import('@/views/CloudSyncView.vue')

    // 持仓管理相关路由
    const ManageHoldingsView = () => import('@/views/holdings/ManageHoldingsView.vue')
    const AddHoldingView = () => import('@/views/holdings/AddHoldingView.vue')
    const EditHoldingView = () => import('@/views/holdings/EditHoldingView.vue')
    const ImportHoldingView = () => import('@/views/holdings/ImportHoldingView.vue')
    const ExportHoldingView = () => import('@/views/holdings/ExportHoldingView.vue')
    const ClearHoldingsView = () => import('@/views/holdings/ClearHoldingsView.vue')

    // 路由配置
    const routes: RouteRecordRaw[] = [
      {
        path: '/',
        name: 'root',
        redirect: () => {
          console.log('根路径重定向检查...')
          
          // 特殊处理：重置密码页面不进行重定向
          const currentHash = window.location.hash
          if (currentHash.includes('/reset-password')) {
            console.log('检测到重置密码页面，不进行根路径重定向')
            return currentHash.replace('#', '')
          }
          
          const token = localStorage.getItem('auth_token')
          const user = localStorage.getItem('auth_user')
          
          const hasValidToken = token && token !== 'null' && token !== 'undefined'
          
          if (hasValidToken) {
            console.log('有有效token，重定向到 /config')
            return '/config'
          } else {
            console.log('没有有效token，重定向到 /auth')
            return '/auth'
          }
        }
      },
      {
        path: '/auth',
        name: 'auth',
        component: AuthView,
        meta: {
          title: '用户登录',
          requiresAuth: false,
          showTabBar: false
        }
      },
      {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPasswordView,
        meta: {
          title: '重置密码',
          requiresAuth: false,
          showTabBar: false,
          // 添加特殊标记，表示这是一个公开访问的特殊页面
          isPublicSpecialPage: true
        }
      },
      {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPasswordView,
        meta: {
          title: '找回密码',
          requiresAuth: false,
          showTabBar: false,
          isPublicSpecialPage: true
        }
      },
      {
        path: '/config',
        name: 'config',
        component: ConfigView,
        meta: {
          title: '系统设置',
          requiresAuth: true,
          showTabBar: true
        }
      },
      {
        path: '/summary',
        name: 'summary',
        component: SummaryView,
        meta: {
          title: '基金一览',
          requiresAuth: true,
          showTabBar: true
        }
      },
      {
        path: '/client',
        name: 'client',
        component: ClientView,
        meta: {
          title: '客户管理',
          requiresAuth: true,
          showTabBar: true
        }
      },
      {
        path: '/ranking',
        name: 'ranking',
        component: TopPerformersView,
        meta: {
          title: '业绩排名',
          requiresAuth: true,
          showTabBar: true
        }
      },
      {
        path: '/about',
        name: 'about',
        component: AboutView,
        meta: {
          title: '关于 CFMS',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/logs',
        name: 'logs',
        component: APILogView,
        meta: {
          title: 'API 日志',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/cloud-sync',
        name: 'cloud-sync',
        component: CloudSyncView,
        meta: {
          title: '云端同步',
          requiresAuth: true,
          showTabBar: false
        }
      },
      
      // ==================== 持仓管理相关路由 ====================
      {
        path: '/holdings',
        name: 'holdings',
        redirect: '/holdings/manage'
      },
      {
        path: '/holdings/manage',
        name: 'ManageHoldings',
        component: ManageHoldingsView,
        meta: {
          title: '持仓管理',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/holdings/add',
        name: 'AddHolding',
        component: AddHoldingView,
        meta: {
          title: '新增持仓',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/holdings/edit/:id?',
        name: 'EditHolding',
        component: EditHoldingView,
        meta: {
          title: '编辑持仓',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/holdings/import',
        name: 'ImportHolding',
        component: ImportHoldingView,
        meta: {
          title: '导入持仓',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/holdings/export',
        name: 'ExportHolding',
        component: ExportHoldingView,
        meta: {
          title: '导出持仓',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/holdings/clear',
        name: 'ClearHoldings',
        component: ClearHoldingsView,
        meta: {
          title: '清空持仓',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        path: '/activation',
        name: 'Activation',
        component: ActivationView,
        meta: {
          title: '尊享升级',
          requiresAuth: true,
          showTabBar: false
        }
      },
      {
        // 保留旧路径兼容性
        path: '/edit-holding/:id?',
        name: 'edit-holding-old',
        redirect: '/holdings/edit'
      },
      
      {
        // 添加404页面处理
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        redirect: '/auth'
      }
    ]

    // 使用 createWebHashHistory 代替 createWebHistory
    const router = createRouter({
      history: createWebHashHistory(),
      routes
    })

    // 路由守卫 - 修复重置密码页面访问问题
    router.beforeEach((to, from, next) => {
      console.log(`\n=== 路由守卫开始 ===`)
      console.log(`从: ${from.path} 到: ${to.path}`)
      console.log('完整路径:', to.fullPath)
      console.log('路由元信息:', to.meta)
      
      try {
        // 设置页面标题
        const title = to.meta.title as string || 'CFMS · 基金管理系统'
        document.title = title
        
        // ========== 特殊页面处理 ==========
        // 1. 重置密码页面 - 完全公开访问，无需任何token检查
        if (to.path === '/reset-password') {
          console.log('✅ 访问密码重置页面，允许访问（特殊页面）')
          console.log('重置参数:', to.query)
          console.log('完整查询参数:', JSON.stringify(to.query))
          
          // 设置一个标记，防止其他逻辑干扰
          sessionStorage.setItem('isResettingPassword', 'true')
          next()
          return
        }
        
        // 2. 忘记密码页面 - 完全公开访问
        if (to.path === '/forgot-password') {
          console.log('✅ 访问忘记密码页面，允许访问（特殊页面）')
          next()
          return
        }
        
        // 3. 登录页面 - 如果已登录则跳转
        if (to.path === '/auth') {
          // 检查是否有有效token
          const token = localStorage.getItem('auth_token')
          const hasValidToken = token && token !== 'null' && token !== 'undefined'
          
          if (hasValidToken) {
            console.log('已登录用户访问登录页，重定向到 /config')
            next('/config')
            return
          }
          console.log('访问登录页面，允许访问')
          next()
          return
        }
        
        // ========== 常规页面处理 ==========
        // 获取 token 状态
        const token = localStorage.getItem('auth_token')
        const hasValidToken = token && token !== 'null' && token !== 'undefined'
        
        console.log('token状态:', { token, hasValidToken })
        
        // 检查是否需要认证
        const requiresAuth = to.meta.requiresAuth
        console.log('requiresAuth:', requiresAuth)
        
        if (requiresAuth && !hasValidToken) {
          console.log('需要认证但未登录，重定向到 /auth')
          next('/auth')
          return
        }
        
        // 所有检查通过，允许访问
        console.log('✅ 允许访问:', to.path)
        next()
      } catch (error: any) {
        console.error('路由守卫出错:', error)
        
        // 特殊处理：如果是重置密码页面，即使出错也允许访问
        if (to.path === '/reset-password' || to.fullPath.includes('reset-password')) {
          console.log('重置密码页面路由守卫出错，但允许继续访问')
          next()
          return
        }
        
        // 其他页面出错时重定向到登录页
        console.log('路由守卫出错，重定向到登录页')
        next('/auth')
      }
    })

    // 路由后置钩子，清理标记
    router.afterEach((to) => {
      // 离开重置密码页面时清理标记
      if (to.path !== '/reset-password') {
        sessionStorage.removeItem('isResettingPassword')
      }
    })

    export default router
