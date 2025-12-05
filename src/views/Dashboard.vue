<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed, onMounted, onBeforeUnmount, nextTick, ref, watch } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import DocumentDrawer from '@/components/DocumentDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import { pb } from '@/api/api'
import { useRouter } from 'vue-router'

const documents = useDocumentsStore()
const events = useEventsStore()
const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!documents.loaded && !documents.loading) documents.loadFromPocketBase()
  if (!events.loaded && !events.loading) events.loadFromPocketBase()
})

const lastThreeDocuments = computed(() => {
  // Prefer freshly loaded library; fallback to any other lists combined
  const list = documents.library.slice(0, 3)
  if (list.length) return list
  // fallback combining user + membership docs (already small arrays)
  const combined = [...documents.userDocuments, ...documents.membershipDocuments]
    .sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
  return combined.slice(0, 3)
})

const nextEvent = computed(() => {
  if (!events.events.length) return null
  const now = Date.now()
  // events already sorted asc by when_start in API call; find first with start >= now
  return events.events.find(e => e.whenStart.getTime() >= now) || events.events[0]
})

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '—' }
}

const membershipExpiry = computed(() => {
  const u = auth.user
  if (!u) return null
  // Attempt multiple possible field names
  const raw = u.expire_membership || null
  return raw || null
})

const membershipDaysLeft = computed(() => {
  if (!membershipExpiry.value) return null
  const end = new Date(membershipExpiry.value)
  if (isNaN(end.getTime())) return null
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
})

const profileImage = computed(() => {
  const u = auth.user
  if (!u) return ''
    return auth.user.avatar ? pb.files.getURL(auth.user, auth.user.avatar) : ''
})

function goToDocuments() {
  router.push({ name: 'Documents' })
}
const docDrawerOpen = ref(false)
function openDoc(doc) {
  if (!doc) return
  docDrawerOpen.value = true
  documents.loadElaboration(doc)
}
function closeDocDrawer() {
  docDrawerOpen.value = false
  documents.clearSelection()
}
function goToEvents() {
  router.push({ name: 'Events' })
}
function goToEventDetail(id) {
  router.push({ name: 'EventDetail', params: { id } })
}
function goToProfile() {
  router.push({ name: 'Profile' })
}
function renewMembership() {
  // Placeholder: redirect to profile; later could open external renewal portal
  router.push({ name: 'Profile', query: { renew: '1' } })
}

// Equal height cards logic (desktop / multi-column only)
const membershipCardRef = ref(null)
const documentsCardRef = ref(null)
const eventsCardRef = ref(null)
const maxCardHeight = ref(0)

const equalCardStyle = computed(() => {
  return maxCardHeight.value > 0 ? { minHeight: maxCardHeight.value + 'px' } : {}
})

async function updateCardHeights() {
  await nextTick()
  const width = window.innerWidth || 0
  // Disable equalization on narrow single-column layouts
  if (width < 640) {
    maxCardHeight.value = 0
    return
  }
  const nodes = [membershipCardRef.value, documentsCardRef.value, eventsCardRef.value].filter(Boolean)
  if (!nodes.length) return
  // Temporarily clear min-heights to measure natural heights
  nodes.forEach(n => n && (n.style.minHeight = ''))
  const tallest = Math.max(...nodes.map(n => n.offsetHeight || 0))
  maxCardHeight.value = tallest
}

function handleResize() { updateCardHeights() }

onMounted(() => {
  window.addEventListener('resize', handleResize)
  // initial pass after data maybe loads lazily
  updateCardHeights()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// Recompute after asynchronous data loads (documents & events)
watch(() => documents.loaded, (v) => { if (v) updateCardHeights() })
watch(() => events.loaded, (v) => { if (v) updateCardHeights() })
watch(() => auth.user, () => updateCardHeights())
</script>

<template>
  <div class="dashboard">
    <PageHeader title="Dashboard" subtitle="Overview and quick access to main features" />

  <div class="grid">
       <!-- Membership Block -->
  <div class="card block membership" ref="membershipCardRef" :style="equalCardStyle">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h3 class="h6 mb-0">Membership</h3>
          <button class="dash-btn ghost" @click="goToProfile">Profile</button>
        </div>
        <div class="card-body membership-body">
          <div class="membership-content">
            <div class="d-flex gap-3 align-items-center mb-3" v-if="auth.user">
              <div class="profile-pic" v-if="profileImage">
                <img :src="profileImage" :alt="auth.user.name || auth.user.email || 'Profile'" />
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold">{{ auth.user.name || auth.user.username || auth.user.email }}</div>
                <div class="small text-muted">Member ID: <strong>{{ auth.user.id }}</strong></div>
              </div>
            </div>
            <div v-if="membershipExpiry" class="mb-2">
                <div class="small">Expires on: <strong>{{ formatDate(membershipExpiry) }}</strong>
                <span v-if="membershipDaysLeft !== null" class="ms-2 days-left" :class="{ critical: membershipDaysLeft < 30 }">{{ membershipDaysLeft }} day<span v-if="membershipDaysLeft !== 1">s</span> left</span>
              </div>
            </div>
            <div v-else class="small text-muted mb-3">Expiration date not available.</div>
          </div>
          <div class="actions-row bottom">
            <button class="dash-btn accent" @click="renewMembership" aria-label="Renew Membership">Renew Membership</button>
          </div>
        </div>
      </div>
      <!-- Documents Block -->
  <div class="card block docs" ref="documentsCardRef" :style="equalCardStyle">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h3 class="h6 mb-0">Latest Documents</h3>
          <button class="dash-btn ghost" @click="goToDocuments">All</button>
        </div>
        <div class="card-body doc-body">
          <div v-if="documents.loading" class="small text-muted">Loading documents…</div>
          <div v-else-if="documents.error" class="small text-danger">{{ documents.error }}</div>
          <div v-else class="doc-tiles">
            <div
              v-for="d in lastThreeDocuments"
              :key="d.id"
              class="doc-tile"
              :class="{ clickable: !!d.link }"
              tabindex="0"
              @click="openDoc(d)"
              @keyup.enter="openDoc(d)"
            >
              <div class="primary-row">
                <span class="name" :title="d.name">{{ d.name }}</span>
                <span class="doc-tag small-tag">{{ d.category || d.type || 'doc' }}</span>
              </div>
              <div class="meta-row">
                <span class="date">Updated {{ d.updated || d.uploaded }}</span>
                <span v-if="d.link" class="open-indicator" aria-label="Open document">↗</span>
              </div>
            </div>
            <div v-if="!lastThreeDocuments.length" class="small text-muted">No documents available yet.</div>
          </div>
        </div>
      </div>

      <!-- Next Event Block -->
  <div class="card block events" ref="eventsCardRef" :style="equalCardStyle">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h3 class="h6 mb-0">Next Event</h3>
          <button class="dash-btn ghost" @click="goToEvents">All</button>
        </div>
        <div class="card-body" v-if="events.loading">
          <div class="small text-muted">Loading events…</div>
        </div>
        <div class="card-body" v-else-if="events.error">
          <div class="small text-danger">{{ events.error }}</div>
        </div>
        <div class="card-body event-body" v-else>
          <template v-if="nextEvent">
            <div class="event-wrapper">
              <div v-if="nextEvent.image" class="event-thumb" @click="goToEventDetail(nextEvent.id)">
                <img :src="nextEvent.image" :alt="nextEvent.name" />
              </div>
              <div class="event-content">
                <h4 class="h6 mb-1 clickable" @click="goToEventDetail(nextEvent.id)">{{ nextEvent.name }}</h4>
                <div class="small text-muted time-line">{{ nextEvent.whenStart.toLocaleString() }}</div>
                <p class="small desc" v-if="nextEvent.description">{{ nextEvent.description.slice(0, 140) }}<span v-if="nextEvent.description.length > 140">…</span></p>
              </div>
            </div>
            <div class="event-actions">
              <button class="dash-btn accent subtle" @click="goToEventDetail(nextEvent.id)" aria-label="Event Details">Event Details</button>
              <a v-if="nextEvent.bookingLink" :href="nextEvent.bookingLink" target="_blank" rel="noopener" class="dash-btn outline">Book</a>
            </div>
            <DocumentDrawer :open="docDrawerOpen" @close="closeDocDrawer" />
          </template>
          <div v-else class="small text-muted">No upcoming events found.</div>
        </div>
      </div>

     
    </div>
  </div>
</template>

<style scoped>
.dashboard { display:flex; flex-direction:column; gap:1.25rem; }
.grid { display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); }
.card { border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); backdrop-filter:blur(8px) saturate(130%); border-radius:14px; overflow:hidden; color:var(--color-text-primary); }
.card-header { padding:.65rem .9rem; background:linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)); border-bottom:1px solid rgba(255,255,255,0.1); color:var(--color-text-primary); }
.card-body { padding:1rem; color:var(--color-text-primary); }
.list-group-item { background:transparent; color:var(--color-text-primary); border-color:rgba(255,255,255,0.12); }
.list-group-item + .list-group-item { border-top-color:rgba(255,255,255,0.08); }
.doc-name { font-weight:500; }
.doc-tag, .small-tag { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.22); padding:3px 7px 2px; border-radius:999px; font-size:.58rem; letter-spacing:.55px; text-transform:uppercase; line-height:1; white-space:nowrap; }
.doc-body { padding:.4rem .55rem .9rem; }
.doc-tiles { display:flex; flex-direction:column; gap:.55rem; }
.doc-tile { position:relative; padding:.65rem .75rem .55rem; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.045); border-radius:14px; display:flex; flex-direction:column; gap:.4rem; transition:background .25s, border-color .25s, transform .25s; }
.doc-tile:hover { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.07); }
.doc-tile.clickable { cursor:pointer; }
.doc-tile:focus-visible { outline:2px solid #60a5fa; outline-offset:2px; }
.doc-tile .primary-row { display:flex; align-items:flex-start; gap:.7rem; }
.doc-tile .name { font-size:.8rem; font-weight:600; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:.15px; }
.doc-tile .meta-row { display:flex; align-items:center; justify-content:space-between; gap:.75rem; }
.doc-tile .date { font-size:.58rem; opacity:.7; letter-spacing:.4px; text-transform:uppercase; }
.doc-tile .open-indicator { font-size:.7rem; opacity:.65; }
.doc-tile.clickable:hover .open-indicator { opacity:1; }
.meta { opacity:.75; }
.event-thumb { width:90px; height:90px; flex:0 0 auto; overflow:hidden; border-radius:10px; cursor:pointer; position:relative; }
.event-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.profile-pic { width:72px; height:72px; border-radius:50%; overflow:hidden; flex:0 0 auto; box-shadow:0 0 0 2px rgba(255,255,255,0.15); }
.profile-pic img { width:100%; height:100%; object-fit:cover; }
.clickable { cursor:pointer; }
.days-left { background:rgba(34,197,94,0.18); border:1px solid rgba(34,197,94,0.4); color:#a7f3d0; padding:2px 8px; border-radius:999px; font-size:.6rem; letter-spacing:.5px; }
.days-left.critical { background:rgba(220,53,69,0.2); border-color:rgba(220,53,69,0.5); color:#fecaca; }
/* Layout helpers */
.actions-row { display:flex; justify-content:flex-end; margin-top:.75rem; }
.actions-row.bottom { margin-top:auto; }
.card.block { display:flex; flex-direction:column; }
.membership-body { display:flex; flex-direction:column; flex:1 1 auto; padding-bottom:0.85rem; }
.membership-body .membership-content { flex:1 1 auto; }
.event-body { display:flex; flex-direction:column; flex:1 1 auto; padding-bottom:.9rem; }
.event-wrapper { display:flex; gap:1rem; align-items:flex-start; flex:0 0 auto; }
.event-content { display:flex; flex-direction:column; flex:1 1 auto; }
.event-content .time-line { margin-bottom:.3rem; }
.event-content .desc { margin:0 0 1rem; line-height:1.3; }
.event-actions { margin-top:auto; display:flex; gap:.55rem; justify-content:flex-end; padding-top:.75rem; }
/* Modern dashboard buttons */
.dash-btn { --btn-bg:linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)); --btn-border:rgba(255,255,255,0.22); --btn-color:var(--color-text-primary); position:relative; appearance:none; border:1px solid var(--btn-border); background:var(--btn-bg); color:var(--btn-color); font-size:.6rem; font-weight:600; letter-spacing:.6px; text-transform:uppercase; padding:.45rem .85rem .4rem; border-radius:10px; display:inline-flex; align-items:center; gap:.45rem; line-height:1; cursor:pointer; backdrop-filter:blur(8px) saturate(140%); transition:background .25s, border-color .25s, box-shadow .25s, transform .25s; }
.dash-btn:hover { border-color:rgba(255,255,255,0.4); background:linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06)); box-shadow:0 4px 10px -4px rgba(0,0,0,0.5); }
.dash-btn:active { transform:translateY(1px); }
.dash-btn:focus-visible { outline:2px solid #60a5fa; outline-offset:2px; }
.dash-btn.ghost { --btn-bg:rgba(255,255,255,0.05); --btn-border:rgba(255,255,255,0.18); font-weight:500; }
.dash-btn.ghost:hover { --btn-bg:rgba(255,255,255,0.1); }
.dash-btn.accent { --btn-bg:linear-gradient(135deg,#3b82f6,#2563eb 45%, #0ea5e9); --btn-border:rgba(255,255,255,0.25); box-shadow:0 4px 14px -4px rgba(37,99,235,0.55); }
.dash-btn.accent:hover { filter:brightness(1.07); box-shadow:0 5px 18px -4px rgba(37,99,235,0.65); }
.dash-btn.accent.subtle { --btn-bg:linear-gradient(135deg,#6366f1,#3b82f6 55%,#0ea5e9); }
.dash-btn.outline { --btn-bg:rgba(255,255,255,0.04); --btn-border:rgba(255,255,255,0.35); color:#e0f2fe; }
.dash-btn.outline:hover { background:rgba(255,255,255,0.09); }
.dash-btn.outline:active { background:rgba(255,255,255,0.14); }
.dash-btn[disabled], .dash-btn.disabled { opacity:.55; cursor:not-allowed; filter:grayscale(.2); }
.dash-btn.small { font-size:.55rem; padding:.4rem .7rem .35rem; }
.dash-btn .icon { width:12px; height:12px; display:inline-block; }
@media (max-width: 640px) { .grid { grid-template-columns:1fr; } }
</style>
