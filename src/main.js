import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// Global styles: Bootstrap first so local component styles can override
import 'bootstrap/dist/css/bootstrap.min.css'
// If JS components (modals, dropdowns) are needed later, uncomment below:
// import 'bootstrap'
import '@/assets/theme.css'

// Runtime build/version stamp injected at build time (see vite.config.js define)
// eslint-disable-next-line no-undef
const BUILD_STAMP = typeof __APP_BUILD__ !== 'undefined' ? __APP_BUILD__ : 'dev'

// Simple cache-bust logic: if stored build differs, force a hard reload once
try {
	const key = 'app_build_stamp'
	const previous = localStorage.getItem(key)
	if (previous && previous !== BUILD_STAMP) {
		// Clear relevant caches (best-effort)
		if ('caches' in window) {
			caches.keys().then(keys => { keys.forEach(k => caches.delete(k)) })
		}
		localStorage.setItem(key, BUILD_STAMP)
		// Reload to fetch new index.html & hashed assets
		window.location.reload()
	} else if (!previous) {
		localStorage.setItem(key, BUILD_STAMP)
	}
	// Expose for debugging
	window.__APP_BUILD__ = BUILD_STAMP
} catch (e) {
	// Non-blocking; ignore storage errors
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
