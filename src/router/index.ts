import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 路由懒加载
const SummaryView = () => import('../views/SummaryView.vue')
const ClientView = () => import('../views/ClientView.vue')
const TopPerformersView = () => import('../views/TopPerformersView.vue')
const ConfigView = () => import('../views/ConfigView.vue')
const AuthView = () => import('../views/AuthView.vue')
const AboutView = () => import('../views/AboutView.vue')
const APILogView = () => import('../views/APILogView.vue')
const DebugView = () => import('../views/DebugView.vue')

// 持仓管理相关路由
const ManageHoldingsView = () => import('../views/holdings/ManageHoldingsView.vue')
const AddHoldingView = () => import('../views/holdings/AddHoldingView.vue')
const EditHoldingView = () => import('../views/holdings/EditHoldingView.vue')
const ImportHoldingView = () => import('../views/holdings/ImportHoldingView.vue')
const ExportHoldingView = () => import('../views/holdings/ExportHoldingView.vue')
const ClearHoldingsView = () => import('../views/holdings/ClearHoldingsView.vue')

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: () => {
      console.log('根路径重定向检查...')
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('auth_user')
      console.log('token:', token)
      console.log('user:', user)
      
      const hasValidToken = token && token !== 'null' && token !== 'undefined'
      console.log('hasValidToken:', hasValidToken)
      
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
    path: '/debug',
    name: 'debug',
    component: DebugView,
    meta: { 
      title: '调试信息',
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
    path: '/holdings/edit',
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

// 简化的路由守卫
router.beforeEach((to, from, next) => {
  console.log(`\n=== 路由守卫开始 ===`)
  console.log(`从: ${from.path} 到: ${to.path}`)
  
  // 设置页面标题
  const title = to.meta.title as string || 'CFMS基金管理系统'
  document.title = title
  
  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('auth_token')
  
  console.log('requiresAuth:', requiresAuth)
  console.log('token in localStorage:', token)
  
  // 检查token有效性
  const hasValidToken = token && token !== 'null' && token !== 'undefined'
  console.log('hasValidToken:', hasValidToken)
  
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
  
  // 其他情况允许访问
  console.log('允许访问:', to.path)
  next()
})

export default router