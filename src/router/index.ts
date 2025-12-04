import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 路由懒加载
const SummaryView = () => import('../views/SummaryView.vue')
const ClientView = () => import('../views/ClientView.vue')
const TopPerformersView = () => import('../views/TopPerformersView.vue')
const ConfigView = () => import('../views/ConfigView.vue')
const AuthView = () => import('../views/AuthView.vue')
const AboutView = () => import('../views/AboutView.vue')
const ManageHoldingsView = () => import('../views/ManageHoldingsView.vue')
const APILogView = () => import('../views/APILogView.vue')
const EditHoldingView = () => import('../views/EditHoldingView.vue')

// 路由配置 - 根路径直接重定向到登录页面
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: '/auth'
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
    path: '/holdings',
    name: 'holdings',
    component: ManageHoldingsView,
    meta: { 
      title: '持仓管理',
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
    path: '/edit-holding/:id?',
    name: 'edit-holding',
    component: EditHoldingView,
    meta: { 
      title: '编辑持仓',
      requiresAuth: true,
      showTabBar: false
    },
    props: true
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

// 简化路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title as string || 'CFMS基金管理系统'
  document.title = title
  
  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('auth_token')
  
  // 对于根路径，已经在前面的redirect中处理了，这里不再处理
  if (to.path === '/') {
    next()
    return
  }
  
  // 如果访问的是/auth但已登录，重定向到首页
  if (to.path === '/auth' && token) {
    next('/summary')
    return
  }
  
  // 如果路由需要认证但用户未登录，重定向到登录页
  if (requiresAuth && !token) {
    next('/auth')
    return
  }
  
  // 其他情况正常导航
  next()
})

export default router