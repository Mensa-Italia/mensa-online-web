import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// Global styles: Bootstrap first so local component styles can override
import 'bootstrap/dist/css/bootstrap.min.css'
// If JS components (modals, dropdowns) are needed later, uncomment below:
// import 'bootstrap'
import '@/assets/theme.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
