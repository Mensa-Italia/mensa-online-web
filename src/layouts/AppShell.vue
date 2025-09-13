<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { LayoutDashboard, Store, BookUser, FileBox, Calendar } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

// State
const isNavOpen = ref(false)
const route = useRoute()
const auth = useAuthStore()

// Close nav on route change (mobile)
watch(
  () => route.fullPath,
  () => {
    isNavOpen.value = false
  },
)

// Lock body scroll when mobile nav open
watch(isNavOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function toggleNav() {
  isNavOpen.value = !isNavOpen.value
}

function doLogout() {
  auth.logout()
  if (route.path !== '/login') {
    window.location.href = '/login'
  }
}

function getUserAvatarUrl(user) {
  return user?.avatar ? `https://svc.mensa.it/api/files/${user.collectionId || 'users'}/${user.id}/${user.avatar}` : ''
}

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/documents', label: 'Documents', icon: FileBox },
  { to: '/boutique', label: 'Boutique', icon: Store },
  { to: '/phonebook', label: 'Phonebook', icon: BookUser },
]

// Close with ESC
function onKeydown(e) {
  if (e.key === 'Escape' && isNavOpen.value) isNavOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app-shell" :class="{ 'nav-open': isNavOpen }">
    <!-- Overlay -->
    <div class="overlay" v-if="isNavOpen" @click="toggleNav" />

    <!-- Sidebar -->
    <aside class="sidebar" :aria-hidden="!isNavOpen && isMobile" >
      <div class="sidebar-inner">
        <div class="logo">
          <img src="@/assets/logo_horizontal.png" alt="Mensa" class="brand-logo" />
        </div>
        <nav class="nav-group" v-if="auth.authenticated">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.path === item.to }"
            @click="isNavOpen = false"
          >
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.label }}</span>
          </RouterLink>
        </nav>
        <div v-if="auth.authenticated" class="sidebar-logout">
        <RouterLink
          v-if="auth.authenticated"
          to="/profile"
          class="user-info"
        >
          <img v-if="auth.user?.avatar" :src="getUserAvatarUrl(auth.user)" alt="avatar" class="user-avatar" />
          <div class="user-meta">
            <div class="user-name sidebar-text">{{ auth.user?.name || 'User' }}</div>
            <div class="user-id sidebar-text">{{ auth.user?.id }}</div>
          </div>
        </RouterLink>
          <button class="btn btn-sm btn-outline-light w-100" @click="doLogout">Logout</button>
        </div>
        <div class="sidebar-footer small">
          <span>&copy; {{ new Date().getFullYear() }} Mensa</span>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <button
          class="menu-btn"
          @click="toggleNav"
          aria-label="Toggle navigation"
          :aria-expanded="isNavOpen.toString()"
          aria-controls="app-sidebar"
        >
          ☰
        </button>
        <strong class="brand-mini">Mensa</strong>
      </header>
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
:root {
  --sidebar-width: 240px;
}
.app-shell {
  --sidebar-width: 240px;
  display: flex;
  min-height: 100dvh;
  width: 100%;
  background: var(--app-bg, #0f172a);
  color: #f1f5f9;
  position: relative;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  z-index: 140;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100dvh;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(15,23,42,0.94), rgba(15,23,42,0.78));
  border-right: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 8px 28px -10px rgba(0,0,0,0.55);
  z-index: 160;
  transform: translateX(-100%);
  transition: transform .32s cubic-bezier(.4,0,.2,1);
}
.nav-open .sidebar {
  transform: translateX(0);
}
@media (min-width: 768px) {
  .overlay { display: none; }
  .sidebar {
    transform: translateX(0);
  }
}
.sidebar-inner {
  padding: 1rem .9rem .75rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.logo { display:flex; align-items:center; justify-content:center; min-height:40px; margin-bottom:.9rem; }
.brand-logo { display:block; max-width:160px; width:100%; height:auto; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35)); }
.nav-group { display:flex; flex-direction:column; gap:.35rem; margin-bottom:.9rem; }
.nav-link { display:flex; gap:.55rem; align-items:center; font-size:.72rem; padding:.5rem .55rem; border-radius:6px; color:#e2e8f0; text-decoration:none; line-height:1; transition:background .15s; }
.nav-link:hover { background:rgba(255,255,255,0.06); }
.nav-link.active { background:rgba(255,255,255,0.12); color:#fff; }
.nav-icon { width:16px; height:16px; stroke-width:1.8; }
.nav-link.active .nav-icon { stroke: var(--accent,#60a5fa); }

.user-info { cursor:pointer; display:flex; align-items:center; gap:.8rem; margin-bottom:1.1rem; text-decoration:none; min-width:0; color:#fff; }
.user-avatar { width:40px; height:40px; min-width:40px; border-radius:50%; object-fit:cover; box-shadow:0 1px 8px -2px rgba(0,0,0,0.18); }
.user-meta { display:flex; flex-direction:column; min-width:0; flex:1; gap:.18rem; }
.user-name { font-size:.97rem; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#f1f5f9; }
.user-id { font-size:.68rem; opacity:.62; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.sidebar-logout { margin-top:auto; margin-bottom:.65rem; }
.sidebar-footer { opacity:.55; font-size:.65rem; }

.main { display:flex; flex-direction:column; flex:1; width:100%; min-height:100dvh; margin-left:0; transition:margin-left .3s cubic-bezier(.4,0,.2,1); }
@media (min-width: 768px) { .main { margin-left: var(--sidebar-width); } }

.topbar { position:sticky; top:0; display:flex; align-items:center; gap:.6rem; padding:.55rem .75rem; background:rgba(15,23,42,0.82); border-bottom:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(10px) saturate(150%); z-index:50; }
.menu-btn { background:none; color:#f1f5f9; border:1px solid rgba(255,255,255,0.3); padding:.35rem .6rem; border-radius:6px; font-size:.95rem; line-height:1; cursor:pointer; }
@media (min-width: 768px) { .menu-btn { display:none; } .topbar { padding: 0; } }
.logout-btn { margin-left:auto; }
.brand-mini { font-size:.9rem; margin-left:.25rem; }
@media (min-width: 768px) { .brand-mini { display:none; } .topbar { padding: 0; } }

.content { flex:1; overflow-y:auto; padding:1.1rem 1.15rem 2rem; display:flex; flex-direction:column; gap:1.25rem; }

/* Utility & shared styles */
.btn-outline-light, .btn.btn-outline-light { --bs-btn-color:#f1f5f9; --bs-btn-border-color:rgba(255,255,255,.3); --bs-btn-hover-bg:rgba(255,255,255,.1); --bs-btn-hover-color:#fff; background:none; }

/* Scrollbar refinement (WebKit) */
.sidebar-inner::-webkit-scrollbar { width:8px; }
.sidebar-inner::-webkit-scrollbar-track { background:transparent; }
.sidebar-inner::-webkit-scrollbar-thumb { background:rgba(255,255,255,.16); border-radius:4px; }
.sidebar-inner::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,.26); }
</style>
