<script setup>
import PageHeader from '@/components/PageHeader.vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOfficesStore } from '@/stores/offices'

const auth = useAuthStore()
const officesStore = useOfficesStore()
const router = useRouter()

onMounted(() => { officesStore.ensureLoaded() })

// Enabled codes: if super -> all non-hidden; if events -> allow a subset (first 3 currently) else none.
const enabledOfficeCodes = computed(() => {
  if (!auth.user) return []
  const raw = auth.user?.powers || []
  const powers = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/[\s,]+/).filter(Boolean) : []
  const isSuper = powers.includes('super')
  if (isSuper) return officesStore.items.filter(o => !o.hidden).map(o => o.code)
  if (powers.includes('events')) {
    // Business rule placeholder: limit to first 3 alphabetical offices for now
    return officesStore.items.filter(o => !o.hidden).slice(0,3).map(o => o.code)
  }
  return []
})

const offices = computed(() => officesStore.items.filter(o => enabledOfficeCodes.value.includes(o.code)))
function openOffice(office) { router.push({ name: 'LocalOfficeDetail', params: { code: office.code } }) }

</script>

<template>
  <div class="local-offices-page">
    <PageHeader title="Local Offices" subtitle="Administrative area for local office management" />

    <div v-if="officesStore.loading" class="empty-state panel">
      <h2 class="section-title">Loading Offices...</h2>
      <p class="lead">Fetching assigned local offices.</p>
    </div>

    <div v-else-if="officesStore.error" class="empty-state panel">
      <h2 class="section-title">Load Error</h2>
      <p class="lead">{{ officesStore.error }}</p>
    </div>

    <div v-else-if="!offices.length" class="empty-state panel">
      <h2 class="section-title">No Offices Enabled</h2>
      <p class="lead">Your profile currently has no local offices assigned for administration. If you believe this is an error, please contact a national administrator.</p>
    </div>

    <div v-else class="office-grid">
      <div
        v-for="office in offices"
        :key="office.code"
        class="office-card"
        role="button"
        tabindex="0"
        @click="openOffice(office)"
        @keydown.enter.prevent="openOffice(office)"
        @keydown.space.prevent="openOffice(office)"
      >
        <div v-if="office.image" class="office-media">
          <img :src="office.image" :alt="office.name + ' cover'" class="office-cover" loading="lazy" />
        </div>
        <div class="card-head">
          <h3 class="office-name">{{ office.name }}</h3>
          <span v-if="office.region" class="badge badge-region">{{ office.region }}</span>
          <span class="badge badge-accent">ADMIN</span>
        </div>
        <p class="office-desc">{{ office.description }}</p>
        <div class="stats" v-if="office.stats">
          <div class="stat">
            <div class="num">{{ office.stats.members }}</div>
            <div class="label">Members</div>
          </div>
          <div class="stat">
            <div class="num">{{ office.stats.eventsUpcoming }}</div>
            <div class="label">Upcoming Events</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.local-offices-page { display:flex; flex-direction:column; gap:1.25rem; }

.empty-state, .office-card { background:rgba(15,23,42,0.82); border:1px solid rgba(96,165,250,0.35); border-radius:1.1rem; backdrop-filter:blur(14px) saturate(150%); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 6px 26px -10px rgba(29,78,216,0.65); }
.empty-state { padding:1.5rem 1.4rem 1.6rem; }

.section-title { margin:0 0 .8rem; font-size:1.05rem; font-weight:600; letter-spacing:.5px; background:linear-gradient(90deg,#93c5fd,#bfdbfe); -webkit-background-clip:text; background-clip:text; color:transparent; }
.lead { margin:.15rem 0 0; font-size:.8rem; line-height:1.35; opacity:.85; }

.office-grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); }
.office-card { padding:.75rem .75rem 1rem; display:flex; flex-direction:column; gap:.6rem; position:relative; overflow:hidden; cursor:pointer; outline:none; transition: background .18s, transform .18s; }
.office-card::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 40% 25%,rgba(96,165,250,0.25),transparent 65%); opacity:.6; pointer-events:none; }
.office-card:focus-visible { box-shadow:0 0 0 2px rgba(96,165,250,0.9), 0 0 0 4px rgba(59,130,246,0.45); }
.office-card:hover { background:rgba(255,255,255,0.04); }
.office-card:active { transform:translateY(1px); }
.office-media { position:relative; width:100%; aspect-ratio: 5 / 3; border-radius:.85rem; overflow:hidden; background:#1e293b; box-shadow:0 2px 10px -4px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.05); }
.office-cover { width:100%; height:100%; object-fit:cover; display:block; }
.card-head { display:flex; align-items:center; gap:.5rem; }
.office-name { margin:0; font-size:.95rem; font-weight:600; letter-spacing:.4px; }
.badge { font-size:.5rem; text-transform:uppercase; letter-spacing:.7px; background:#1d4ed8; padding:.25rem .45rem .27rem; border-radius:.5rem; font-weight:700; box-shadow:0 2px 6px -2px rgba(29,78,216,0.6); }
.badge-accent { background:#1d4ed8; color:#fff; }
.office-desc { margin:0; font-size:.62rem; line-height:1.3; opacity:.75; min-height:2.2em; }
.stats { display:flex; gap:.75rem; margin:.25rem 0 .35rem; }
.stat { display:flex; flex-direction:column; }
.num { font-size:.85rem; font-weight:600; line-height:1; }
.label { font-size:.48rem; text-transform:uppercase; letter-spacing:.5px; opacity:.55; }

@media (min-width: 880px) {
  .office-grid { grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); }
}
</style>
