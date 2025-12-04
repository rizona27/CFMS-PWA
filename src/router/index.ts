import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/summary'
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
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { 
      title: '用户登录',
      requiresAuth: false,
      showTabBar: false
    }
  },
  // 新增路由
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫 - 添加路由守卫控制
router.beforeEach((to, _from, next) => {
  // 动态导入 authStore，避免循环依赖
  import('@/stores/authStore').then(({ useAuthStore }) => {
    const authStore = useAuthStore()
    
    // 设置页面标题
    const title = to.meta.title as string || 'CFMS基金管理系统'
    document.title = title
    
    // 检查是否需要认证
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      // 如果用户未登录且尝试访问需要认证的页面，重定向到登录页
      next('/auth')
    } else if (to.name === 'auth' && authStore.isLoggedIn) {
      // 如果用户已登录且尝试访问登录页，重定向到首页
      next('/')
    } else {
      next()
    }
  }).catch((error) => {
    console.error('路由守卫错误:', error)
    next()
  })
})

export default router