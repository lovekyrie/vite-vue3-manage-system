import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
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
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }

  next()
})

export default router
