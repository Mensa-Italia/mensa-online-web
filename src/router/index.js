import { createRouter, createWebHistory } from 'vue-router'
import { isLogged } from '@/api/api'
import { useAuthStore } from '@/stores/auth'

// Lazy layout + views for code-splitting
const AppShell = () => import('@/layouts/AppShell.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Boutique = () => import('@/views/Boutique.vue')
const Phonebook = () => import('@/views/Phonebook.vue')
const Documents = () => import('@/views/Documents.vue')
const Login = () => import('@/views/Login.vue')
const Orders = () => import('@/views/Orders.vue')

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
  { path: 'orders', name: 'Orders', component: Orders, meta: { requiresAuth: true } },
  { path: 'profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { requiresAuth: true } },
  { path: 'events', name: 'Events', component: () => import('@/views/Events.vue'), meta: { requiresAuth: true } },
  { path: 'events/create', name: 'EventCreate', component: () => import('@/views/EventCreate.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'events/:id', name: 'EventDetail', component: () => import('@/views/EventDetail.vue'), meta: { requiresAuth: true } },
  { path: 'offices', name: 'LocalOffices', component: () => import('@/views/LocalOffices.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'offices/:code', name: 'LocalOfficeDetail', component: () => import('@/views/LocalOfficeDetail.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'offices/:code/welcome-email', name: 'LocalOfficeWelcomeEmail', component: () => import('@/views/LocalOfficeWelcomeEmail.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'offices/:code/cover-maker', name: 'LocalOfficeEventCoverMaker', component: () => import('@/views/EventCoverMaker.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'offices/:code/co-officers', name: 'LocalOfficeCoOfficers', component: () => import('@/views/LocalOfficeCoOfficers.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'positions', name: 'Positions', component: () => import('@/views/Positions.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
  { path: 'positions/picker', name: 'PositionPicker', component: () => import('@/views/PositionPicker.vue'), meta: { requiresAuth: true, requiresEventsPower: true } },
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
  if (to.meta.requiresEventsPower) {
    // Access auth store dynamically (router guard context)
    const auth = useAuthStore()
    if (!auth.hasPower('events')) return { name: 'Dashboard' }
  }
  return true
})

export default router
