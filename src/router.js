import {createRouter, createWebHistory} from 'vue-router'
import Login from "@/pages/Login.vue";
import Events from "@/pages/Events.vue";
import Home from "@/pages/Home.vue";
import Documents from "@/pages/Documents.vue";
import Community from "@/pages/Community.vue";
import Boutique from "@/pages/Boutique.vue";


const routes = [
  { path: '/', component: Login },
  { path: '/events', component: Events },
  { path: '/hub', component: Home },
  { path: '/documents', component: Documents},
  { path: '/community', component: Community},
  { path: '/boutique', component: Boutique},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router