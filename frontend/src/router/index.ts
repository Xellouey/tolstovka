import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/category/:slug',
      name: 'category',
      component: () => import('../views/CategoryView.vue'),
      props: true
    },
    // Backward compatibility: treat /category/:id as slug
    {
      path: '/category/:id',
      redirect: to => ({ name: 'category', params: { slug: String(to.params.id) } })
    },
    {
      path: '/p/:id',
      name: 'product',
      component: () => import('../views/ProductView.vue'),
      props: true
    },
    // Backward compatibility redirect
    {
      path: '/product/:id',
      redirect: to => ({ name: 'product', params: to.params })
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/AdminView.vue')
    },
    {
      path: '/test-admin',
      name: 'TestAdmin',
      component: () => import('@/views/TestAdminView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      redirect: '/'
    }
  ]
})

export default router
