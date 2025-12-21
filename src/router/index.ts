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
      isPasswordReset: true
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: {
      title: '找回密码',
      requiresAuth: false,
      showTabBar: false
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

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log(`\n=== 路由守卫开始 ===`)
  console.log(`从: ${from.path} 到: ${to.path}`)
  console.log('完整路径:', to.fullPath)
  
  // 设置页面标题
  const title = to.meta.title as string || 'CFMS · 基金管理系统'
  document.title = title
  
  // 检查是否是密码重置页面
  const isPasswordReset = to.meta.isPasswordReset === true
  
  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('auth_token')
  
  // 检查token有效性
  const hasValidToken = token && token !== 'null' && token !== 'undefined'
  
  // 特殊处理：密码重置页面，无论是否有token都允许访问
  if (isPasswordReset) {
    console.log('访问密码重置页面，允许访问')
    next()
    return
  }
  
  // 访问登录页面但已登录，重定向到配置页面
  if (to.path === '/auth' && hasValidToken) {
    console.log('已登录用户访问登录页，重定向到 /config')
    next('/config')
    return
  }
  
  // 需要认证但未登录，重定向到登录页
  if (requiresAuth && !hasValidToken) {
    console.log('需要认证但未登录，重定向到 /auth')
    next('/auth')
    return
  }
  
  // 特殊处理：忘记密码页面不需要认证
  if (to.path === '/forgot-password') {
    console.log('访问忘记密码页面，允许访问')
    next()
    return
  }
  
  // 其他情况允许访问
  console.log('允许访问:', to.path)
  next()
})

export default router