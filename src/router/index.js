import { createRouter, createWebHistory } from 'vue-router'
import { isLogged } from '@/api/api'

// Lazy layout + views for code-splitting
const AppShell = () => import('@/layouts/AppShell.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Boutique = () => import('@/views/Boutique.vue')
const Phonebook = () => import('@/views/Phonebook.vue')
const Documents = () => import('@/views/Documents.vue')
const Login = () => import('@/views/Login.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
        { path: 'boutique', name: 'Boutique', component: Boutique, meta: { requiresAuth: true } },
        { path: 'phonebook', name: 'Phonebook', component: Phonebook, meta: { requiresAuth: true } },
  { path: 'documents', name: 'Documents', component: Documents, meta: { requiresAuth: true } },
  { path: 'profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { requiresAuth: true } },
  { path: 'events', name: 'Events', component: () => import('@/views/Events.vue'), meta: { requiresAuth: true } },
  { path: 'events/:id', name: 'EventDetail', component: () => import('@/views/EventDetail.vue'), meta: { requiresAuth: true } },
      ],
    },
  ],
})

// Global navigation guard for auth
router.beforeEach((to) => {
  const loggedIn = isLogged()
  if (to.meta.requiresAuth && !loggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Login' && loggedIn) {
    return { name: 'Dashboard' }
  }
  return true
})

export default router
