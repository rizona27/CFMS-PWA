import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 路由懒加载
const SummaryView = () => import('../views/SummaryView.vue')
const ClientView = () => import('../views/ClientView.vue')
const TopPerformersView = () => import('../views/TopPerformersView.vue')
const ConfigView = () => import('../views/ConfigView.vue')
const AuthView = () => import('../views/AuthView.vue')

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
    meta: { title: '基金一览' }
  },
  {
    path: '/client',
    name: 'client',
    component: ClientView,
    meta: { title: '客户管理' }
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: TopPerformersView,
    meta: { title: '业绩排名' }
  },
  {
    path: '/config',
    name: 'config',
    component: ConfigView,
    meta: { title: '系统设置' }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { title: '用户登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, _from, next) => { // <-- 修改点：将 from 改为 _from
  // 设置页面标题
  const title = to.meta.title as string || 'CFMS基金管理系统'
  document.title = title
  
  next()
})

export default router