import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router.js";
import pinia from "@/statemanager.js";
import {VsxIcon} from "vue-iconsax";


const app = createApp(App)
app.component("VsxIcon", VsxIcon);
app.use(router)
app.use(pinia)
app.mount('#app')
