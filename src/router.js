import {createRouter, createWebHistory} from 'vue-router'
import Login from "@/pages/Login.vue";
import Events from "@/pages/Events.vue";
import Home from "@/pages/Home.vue";


const routes = [
  { path: '/', component: Login },
  { path: '/events', component: Events },
  { path: '/hub', component: Home },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router