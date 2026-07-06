import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout/index.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: '/room',
        component: () => import('@/views/room/index.vue')
      },
      {
        path: '/person',
        component: () => import('@/views/person/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router