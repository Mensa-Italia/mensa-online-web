<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { storeToRefs } from 'pinia'
import { useMembersStore } from '@/stores/members'
import FilterToolbar from '@/components/FilterToolbar.vue'

// Filters
const q = ref('')
const region = ref('')

const membersStore = useMembersStore()
// Active/status removed from data model
const { members, total, byRegion, loading, error, loaded, displayLimit, hasMoreLocal } = storeToRefs(membersStore)

const regions = computed(() => Object.keys(byRegion.value).sort())

// Helpers
function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function cleanEmail(val) {
  if (!val || typeof val !== 'string') return val || ''
  // Remove mailto: prefix and surrounding whitespace
  return val.replace(/^mailto:/i, '').trim()
}

const filtered = computed(() => {
  const qLower = q.value.toLowerCase()
  return members.value.filter((m) => {
    if (q.value) {
      const email =
        m.email || (m.full_data && (m.full_data['E-mail:'] || m.full_data['Email:'])) || ''
      const text = (m.name + ' ' + email).toLowerCase()
      if (!text.includes(qLower)) return false
    }
    if (region.value && m.region !== region.value) return false
    return true
  })
})

// Additional data filtering: remove fields already shown in Overview
const filteredAdditionalData = computed(() => {
  if (!selected.value || !selected.value.full_data) return []
  const fd = selected.value.full_data
  const overviewKeys = new Set([
    'Joined', 'Birthdate', 'City', 'State', 'Region', 'Area', 'Email', 'E-mail:'
  ])
  return Object.entries(fd).filter(([key]) => {
    // Normalize key without trailing colon for comparison
    const norm = key.replace(/:$/, '')
    return !overviewKeys.has(norm)
  })
})

// Slice for incremental display
const visible = computed(() => filtered.value.slice(0, displayLimit.value))

// Drawer state
const open = ref(false)
const selected = ref(null)
function openDetails(m) {
  selected.value = m
  open.value = true
}
function closeDetails() {
  open.value = false
  selected.value = null
}

// Auto-load from PocketBase if not yet loaded and env configured
// Infinite scroll sentinel
const sentinel = ref(null)

onMounted(async () => {
  await membersStore.ensureLoaded()
  setupObserver()
})

function setupObserver() {
  if (!sentinel.value) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && hasMoreLocal.value && !loading.value) {
          membersStore.showMore()
        }
      }
    },
    { root: null, rootMargin: '0px 0px 320px 0px', threshold: 0 },
  )
  io.observe(sentinel.value)
}

// Reset display limit when filters change to avoid empty screen when narrowing
watch([q, region], () => {
  membersStore.resetDisplay()
})
</script>

<template>
  <div class="phonebook-root">
    <PageHeader title="Phonebook" subtitle="Members directory">
      <template #actions>
        <div class="stat-chip">Total <strong>{{ total }}</strong></div>
      </template>
    </PageHeader>

    <FilterToolbar
      v-model="q"
      v-model:filter-item="region"
      :filter-items="regions"
      :loading="loading"
      :all-item-name="'All regions'"
      :placeholder="'Search members...'"
      @clear="
          q = '';
          region = '';
      "
    />

    <section class="panel glass-panel list-panel">
      <div class="panel-header">
        <span>Members ({{ filtered.length }})</span>
      </div>
  <div v-if="loading" class="loading-row small">Fetching members…</div>
  <div v-if="error" class="error-row small">{{ error }}</div>
  <template v-if="!loading && visible.length">
        <ul class="list-reset members-list">
          <li
            v-for="m in visible"
            :key="m.id"
            class="member-row interactive"
            role="button"
            tabindex="0"
            @click="openDetails(m)"
            @keyup.enter="openDetails(m)"
          >
            <div class="avatar-wrapper" aria-hidden="true">
              <div
                v-if="m.image"
                class="avatar img"
                :style="{ backgroundImage: `url(${m.image})` }"
              />
              <div v-else class="avatar initials">{{ initials(m.name) }}</div>
              <!-- status dot removed -->
            </div>
            <div class="identity compact">
              <strong class="name">{{ m.name }}</strong>
              <div class="secondary-line">
                <span class="loc" v-if="m.city || m.state || m.region">
                  {{ m.city || m.state || m.region
                  }}<span v-if="m.area && m.area !== m.region" class="area"> · {{ m.area }}</span>
                </span>
                <span v-if="m.email" class="sep">•</span>
                <span v-if="m.email" class="email-inline">{{ cleanEmail(m.email) }}</span>
              </div>
            </div>
            <div class="chevron" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </li>
          <li v-if="hasMoreLocal" class="load-indicator" ref="sentinel"></li>
        </ul>
      </template>
  <p v-else-if="!loading" class="small dim m-0">No members match your filters.</p>
    </section>

    <!-- Overlay -->
    <transition name="fade-fast">
      <div v-if="open" class="drawer-overlay" @click="closeDetails" />
    </transition>
    <!-- Drawer Panel -->
    <transition name="drawer">
      <aside class="member-drawer" aria-label="Member details" v-if="open && selected">
        <header class="drawer-header">
          <button class="close-btn" type="button" @click="closeDetails" aria-label="Close details">
            ×
          </button>
          <div class="drawer-id-block">
            <div class="avatar-wrapper lg" aria-hidden="true">
              <div
                v-if="selected.image"
                class="avatar img"
                :style="{ backgroundImage: `url(${selected.image})` }"
              />
              <div v-else class="avatar initials">{{ initials(selected.name) }}</div>
              <!-- status dot removed in drawer header -->
            </div>
            <div class="drawer-title">
              <h2 class="name">{{ selected.name }}</h2>
              <p class="muted small" v-if="selected.region || selected.area">
                <span>{{ selected.region }}</span>
                <span v-if="selected.area && selected.area !== selected.region">
                  • {{ selected.area }}</span
                >
              </p>
            </div>
          </div>
        </header>
        <div class="drawer-content">
          <section class="section-block">
            <h3 class="section-title">Overview</h3>
            <ul class="kv">
              <li>
                <span class="k">Joined</span
                ><span class="v">{{ formatDate(selected.joined) }}</span>
              </li>
              <li v-if="selected.birthdate">
                <span class="k">Birthdate</span
                ><span class="v">{{ formatDate(selected.birthdate) }}</span>
              </li>
              <li v-if="selected.city">
                <span class="k">City</span><span class="v">{{ selected.city }}</span>
              </li>
              <li v-else-if="selected.state">
                <span class="k">State</span><span class="v">{{ selected.state }}</span>
              </li>
              <li v-if="selected.region">
                <span class="k">Region</span><span class="v">{{ selected.region }}</span>
              </li>
              <li v-if="selected.area && selected.area !== selected.region">
                <span class="k">Area</span><span class="v">{{ selected.area }}</span>
              </li>
              <li v-if="selected.email">
                <span class="k">Email</span>
                <span class="v">
                  <a :href="'mailto:' + cleanEmail(selected.email)" class="link-inline">{{ cleanEmail(selected.email) }}</a>
                </span>
              </li>
              <!-- status line removed -->
            </ul>
          </section>
          <section
            class="section-block"
            v-if="filteredAdditionalData.length"
          >
            <h3 class="section-title">Additional Data</h3>
            <ul class="kv">
              <li v-for="([key, val]) in filteredAdditionalData" :key="key">
                <span class="k">{{ key.replace(/:$/, '') }}</span>
                <span class="v">
                  <a
                    v-if="typeof val === 'string' && val.startsWith('mailto:')"
                    :href="val"
                    class="link-inline"
                    >{{ cleanEmail(val) }}</a
                  >
                  <span v-else>{{ val || '—' }}</span>
                </span>
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </transition>
  </div>
</template>
<style scoped>
/* Layout spacing */
.phonebook-root {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}
@media (max-width: 600px) {
  .phonebook-root {
    gap: 1rem;
  }
}
/* List & Rows (simplified tile) */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.member-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.65rem 0.85rem;
  padding: 0.65rem 0.75rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  align-items: center;
  transition:
    background 0.18s,
    box-shadow 0.18s;
}
.member-row.interactive {
  cursor: pointer;
}
.member-row:hover {
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.45);
}
.avatar-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}
.avatar-wrapper.lg {
  width: 72px;
  height: 72px;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #334155, #1e293b);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.avatar.img {
  background-size: cover;
  background-position: center;
}
.identity {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 140px;
}
.identity.compact .name {
  margin: 0;
}
.name {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  line-height: 1.15;
}
.secondary-line {
  font-size: 0.58rem;
  opacity: 0.75;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}
.secondary-line .email-inline {
  opacity: 0.9;
}
.secondary-line .area {
  opacity: 0.55;
}
.chevron {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  opacity: 0.4;
  transition:
    opacity 0.18s,
    transform 0.25s;
}
.member-row:hover .chevron {
  opacity: 0.8;
  transform: translateX(2px);
}
@media (max-width: 640px) {
  .member-row {
    grid-template-columns: auto 1fr 18px;
  }
}

/* Drawer (improved readability + animation via transitions) */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.46);
  backdrop-filter: blur(2px);
}
.member-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 390px;
  max-width: 92%;
  background: rgba(19, 26, 38, 0.9);
  backdrop-filter: blur(18px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -2px 0 18px -4px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  z-index: 70;
  will-change: transform, opacity;
}
.drawer-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.05rem 1.2rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}
.drawer-id-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.drawer-title .name {
  font-size: 1.08rem;
  margin: 0 0 0.3rem;
  letter-spacing: 0.4px;
}
.drawer-title .muted {
  margin: 0;
  opacity: 0.6;
  font-size: 0.62rem;
}
.drawer-content {
  padding: 0.95rem 1.2rem 1.6rem;
  overflow-y: auto;
  scrollbar-width: thin;
  font-size: 0.7rem;
  line-height: 1.45;
}
.drawer-content::-webkit-scrollbar {
  width: 7px;
}
.drawer-content::-webkit-scrollbar-track {
  background: transparent;
}
.drawer-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}
.close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 1.05rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: auto;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.section-block {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.section-title {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.55;
  margin: 0;
  font-weight: 600;
}
.kv {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.kv.compact {
  gap: 0.35rem;
}
.kv li {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 0.6rem;
  font-size: 0.66rem;
  align-items: baseline;
}
.kv .k {
  opacity: 0.6;
  font-weight: 500;
}
.kv .v {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.mini-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color:#e2e8f0; font-size:0.55rem; line-height:1; padding:0.35rem 0.55rem; border-radius:6px; font-weight:500; letter-spacing:.5px; display:inline-flex; align-items:center; gap:.35rem; cursor:pointer; }
.mini-btn:hover:not(:disabled){ background: rgba(255,255,255,0.14); }
.mini-btn:disabled { opacity:.5; cursor: default; }
.spinner { display:none; }
.loading-row, .error-row { padding:0.4rem 0.3rem 0.2rem; }
.error-row { color:#fca5a5; }
.load-indicator { list-style:none; padding:0; margin:0; height:1px; }
/* Removed .loading-more styles as text indicator no longer shown */
.external-link {
  font-size: 0.6rem;
  font-weight: 500;
  color: #93c5fd;
  text-decoration: none;
}
.external-link:hover {
  text-decoration: underline;
}
.link-inline {
  color: #93c5fd;
  text-decoration: none;
}
.link-inline:hover {
  text-decoration: underline;
}

/* Animations */
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from {
  transform: translateX(64px);
  opacity: 0;
}
.drawer-leave-to {
  transform: translateX(64px);
  opacity: 0;
}
.drawer-enter-active,
.drawer-leave-active {
  transition:
    transform 0.42s cubic-bezier(0.4, 0, 0.25, 1),
    opacity 0.34s;
}

@media (max-width: 720px) {
  .pb-title {
    font-size: 1.35rem;
  }
}
</style>
