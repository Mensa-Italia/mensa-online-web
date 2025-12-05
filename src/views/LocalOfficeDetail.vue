<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useOfficesStore } from '@/stores/offices'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const code = computed(() => route.params.code)
const offices = useOfficesStore()
const auth = useAuthStore()

onMounted(async () => {
  await offices.ensureLoaded()
  if (!offices.getByCode(code.value)) {
    router.replace('/offices')
  }
})

const office = computed(() => offices.getByCode(code.value))

// Future: verify user permission specifically for this office

</script>

<template>
  <div class="office-detail-page" v-if="office">
    <PageHeader :title="office.name" subtitle="Local Office Administration" />

    <div class="hero" v-if="office.image">
      <img :src="office.image" :alt="office.name + ' image'" class="hero-img" />
      <div class="hero-overlay" />
      <div class="hero-meta">
        <h2 class="hero-title">{{ office.name }}</h2>
        <p class="hero-desc">{{ office.description }}</p>
        <div class="hero-meta-line" v-if="office.region" style="font-size:.55rem; opacity:.7; letter-spacing:.5px;">Region: {{ office.region }}</div>
        <div class="hero-stats" v-if="office.stats">
          <div class="hstat">
            <div class="num">{{ office.stats.members }}</div>
            <div class="label">Members</div>
          </div>
          <div class="hstat">
            <div class="num">{{ office.stats.eventsUpcoming }}</div>
            <div class="label">Upcoming</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-layout">
      <section class="panel section-col">
        <h3 class="section-head">Quick Actions</h3>
        <ul class="action-list">
          <li>
            <button class="btn btn-sm btn-outline-light w-100" type="button" @click="router.push({ name: 'EventCreate', query: { office: office.code } })">
              Create Event
            </button>
          </li>
          <li>
            <button class="btn btn-sm btn-outline-light w-100" type="button" @click="router.push({ name: 'LocalOfficeCoOfficers', params: { code: office.code } })">
              Manage Co-Officers
            </button>
          </li>
        </ul>
      </section>
      <section class="panel section-col">
        <h3 class="section-head">Recent Events</h3>
        <div class="placeholder small">Events feed placeholder</div>
      </section>
      <section class="panel section-col">
        <h3 class="section-head">Members Snapshot</h3>
        <div class="placeholder small">Members list placeholder</div>
      </section>
      <section class="panel section-col">  
        <h3 class="section-head">Tools</h3>
        <div class="placeholder small" style="gap:.5rem; flex-direction:column;">
          <button class="btn btn-sm btn-outline-light w-100" type="button" @click="router.push({ name: 'LocalOfficeWelcomeEmail', params: { code: office.code } })">Welcome Email Composer</button>
          <div style="font-size:.5rem; opacity:.6;">Apri l'editor per preparare la mail di benvenuto</div>
          <hr style="margin:.4rem 0; border-color:rgba(255,255,255,0.15);" />
          <button class="btn btn-sm btn-outline-light w-100" type="button" @click="router.push({ name: 'LocalOfficeEventCoverMaker', params: { code: office.code } })">Event Cover Image Maker</button>
          <div style="font-size:.5rem; opacity:.6;">Genera rapidamente una cover 1200x630 per un evento</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.office-detail-page { display:flex; flex-direction:column; gap:1.4rem; }
.hero { position:relative; border-radius:1.1rem; overflow:hidden; background:#0f172a; min-height:200px; display:flex; align-items:flex-end; }
.hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:brightness(.6) saturate(1.1); }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.9)); }
.hero-meta { position:relative; padding:1.4rem 1.4rem 1.6rem; display:flex; flex-direction:column; gap:.75rem; width:100%; }
.hero-title { margin:0; font-size:1.3rem; font-weight:600; letter-spacing:.5px; }
.hero-desc { margin:0; font-size:.72rem; line-height:1.3; max-width:680px; opacity:.85; }
.hero-stats { display:flex; gap:1.2rem; margin-top:.25rem; }
.hstat { display:flex; flex-direction:column; }
.hstat .num { font-size:.95rem; font-weight:600; line-height:1; }
.hstat .label { font-size:.56rem; text-transform:uppercase; opacity:.6; letter-spacing:.5px; }

.grid-layout { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); }
.panel { background:rgba(15,23,42,0.82); border:1px solid rgba(96,165,250,0.35); border-radius:1rem; padding:1rem .95rem 1.15rem; backdrop-filter:blur(14px) saturate(150%); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 6px 26px -10px rgba(29,78,216,0.65); display:flex; flex-direction:column; gap:.75rem; }
.section-head { margin:0; font-size:.82rem; letter-spacing:.5px; font-weight:600; }
.action-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; }
.placeholder { font-size:.62rem; opacity:.7; background:rgba(255,255,255,0.05); padding:.75rem .8rem; border:1px dashed rgba(255,255,255,0.15); border-radius:.6rem; }
.placeholder.small { min-height:60px; display:flex; align-items:center; justify-content:center; text-align:center; }


@media (min-width: 1100px) {
  .grid-layout { grid-template-columns:repeat(4,1fr); }
  .section-col { min-height:220px; }
}
</style>
