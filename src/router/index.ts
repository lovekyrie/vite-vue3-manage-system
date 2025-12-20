import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/service/info',
    children: [
      {
        path: 'service/info',
        name: 'ServiceInfo',
        component: () => import('@/views/service/ServiceInfo.vue'),
        meta: { title: '服务信息' }
      },
      {
        path: 'product/list',
        name: 'ProductList',
        component: () => import('@/views/product/index.vue'),
        meta: { title: '产品列表' }
      },
      {
        path: 'expense/list',
        name: 'ExpenseList',
        component: () => import('@/views/expense/index.vue'),
        meta: { title: '费用列表' }
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/index.vue'),
        meta: { title: '知识库' }
      },
      {
        path: 'record/list',
        name: 'RecordList',
        component: () => import('@/views/record/index.vue'),
        meta: { title: '记账列表' }
      },
      {
        path: 'data/overview',
        name: 'DataOverview',
        component: () => import('@/views/dataOverview/index.vue'),
        meta: { title: '数据总览' }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '关于我们' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = sessionStorage.getItem('token')

  // 如果去往登录页，且已有 token，则跳转到首页
  if (to.path === '/login' && token) {
    next('/')
    return
  }

  // 如果没有 token 且去往非登录页，则跳转到登录页
  // Note: For development of the UI, I might want to temporarily bypass this or ensure I can login.
  // But I will keep it as is for now.
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }

  next()
})

export default router
