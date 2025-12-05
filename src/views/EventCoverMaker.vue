<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useOfficesStore } from '@/stores/offices'

const route = useRoute()
const router = useRouter()
const offices = useOfficesStore()
const code = computed(() => route.params.code)
const office = computed(() => offices.getByCode(code.value))

if (!office.value) {
  router.replace('/offices')
}

// Remote image generation service (manual trigger)
const BASE_URL = 'https://svc.mensa.it/api/cs/generate-event-card'

// Query fields
const title = ref('NEVE AD AGOSTO')
const line0 = ref('VENERDÌ 15 AGOSTO')
const line1 = ref('ORE 12:00')
const line2 = ref('CASA DI LUDOVICO')
const line3 = ref('STRADA ANTICA DI SALUZZO 8')
const line4 = ref('CAVOUR (TO)')

// Image state
const placeholderUrl = 'https://picsum.photos/1200/630?blur=1&random=42'
const imageUrl = ref(placeholderUrl) // This will hold a blob: URL after generation
const generating = ref(false)
const error = ref('')
const generatedOnce = ref(false)
const lastBlob = ref(null)

function buildUrl() {
  const params = new URLSearchParams()
  params.set('title', title.value)
  params.set('line0', line0.value)
  params.set('line1', line1.value)
  params.set('line2', line2.value)
  params.set('line3', line3.value)
  params.set('line4', line4.value)
  // cache buster
  params.set('t', Date.now().toString())
  return `${BASE_URL}?${params.toString()}`
}

async function generate() {
  error.value = ''
  generating.value = true
  const url = buildUrl()
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const blob = await res.blob()
    // Revoke old object URL to avoid leaks
    if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl.value)
    }
    lastBlob.value = blob
    imageUrl.value = URL.createObjectURL(blob)
    generatedOnce.value = true
  } catch (e) {
    console.warn(e)
    error.value = 'Immagine non generata (errore di rete o parametri invalidi).'
  } finally {
    generating.value = false
  }
}

function download() {
  if (!generatedOnce.value || !lastBlob.value) return
  const a = document.createElement('a')
  a.href = imageUrl.value // blob URL already
  a.download = `event-cover-${code.value}.png`
  a.click()
}

onUnmounted(() => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value)
  }
})
</script>

<template>
  <div v-if="office" class="cover-maker-page">
    <PageHeader :title="'Event Cover Image Maker - ' + office.name" subtitle="Genera una cover remota (1200x630) usando il servizio Mensa" />
    <div class="toolbar">
      <RouterLink :to="{ name: 'LocalOfficeDetail', params: { code: office.code } }" class="btn btn-sm btn-outline-light">← Torna alla sezione</RouterLink>
      <div class="spacer" />
    </div>
    <div class="layout">
      <div class="form panel">
        <label class="form-label">Titolo</label>
        <input v-model="title" class="form-control form-control-sm" />
        <label class="form-label">Riga 1</label>
        <input v-model="line0" class="form-control form-control-sm" />
        <label class="form-label">Riga 2</label>
        <input v-model="line1" class="form-control form-control-sm" />
        <label class="form-label">Riga 3</label>
        <input v-model="line2" class="form-control form-control-sm" />
        <label class="form-label">Riga 4</label>
        <input v-model="line3" class="form-control form-control-sm" />
        <label class="form-label">Riga 5</label>
        <input v-model="line4" class="form-control form-control-sm" />
        <div class="hint">Compila i campi e premi "Genera". L'immagine non viene aggiornata finché non premi il pulsante.</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="form-actions">
          <button class="btn btn-sm btn-accent" type="button" @click="generate" :disabled="generating">{{ generating ? 'Generazione…' : (generatedOnce ? 'Rigenera' : 'Genera') }}</button>
          <button class="btn btn-sm btn-soft" type="button" @click="download" :disabled="!generatedOnce">Scarica PNG</button>
        </div>
      </div>
      <div class="preview panel">
        <img :src="imageUrl" alt="Event cover preview" class="img-preview" />
        <div class="download-hint" v-if="!generatedOnce">Placeholder iniziale (picsum)</div>
        <div class="download-hint" v-else>Immagine generata • Puoi scaricarla o modificare i testi e rigenerare</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cover-maker-page { display:flex; flex-direction:column; gap:1.2rem; }
.toolbar { display:flex; align-items:center; gap:.6rem; }
.spacer { flex:1; }
.layout { display:grid; gap:1rem; grid-template-columns:1fr; }
@media (min-width: 1080px) { .layout { grid-template-columns: 340px 1fr; } }
.panel { background:rgba(15,23,42,0.82); border:1px solid rgba(96,165,250,0.35); border-radius:1rem; padding:1rem 1rem 1.15rem; backdrop-filter:blur(14px) saturate(150%); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 6px 26px -10px rgba(29,78,216,0.65); display:flex; flex-direction:column; gap:.55rem; }
.form-label { font-size:.58rem; text-transform:uppercase; letter-spacing:.55px; opacity:.75; margin:0; }
input.form-control { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.18); color:#fff; font-size:.65rem; border-radius:.5rem; padding:.45rem .6rem; }
input.form-control:focus { outline:none; border-color:#60a5fa; box-shadow:0 0 0 1px #60a5fa55; }
.hint { font-size:.52rem; opacity:.6; line-height:1.3; margin-top:.2rem; }
.error { font-size:.55rem; color:#f87171; }
.img-preview { width:100%; border:1px solid rgba(255,255,255,0.18); border-radius:.6rem; background:#0f172a; aspect-ratio:1200/630; object-fit:cover; }
.download-hint { font-size:.55rem; opacity:.65; margin-top:.35rem; }
.form-actions { margin-top:.75rem; display:flex; gap:.55rem; flex-wrap:wrap; }
.btn-sm.btn-accent { background:var(--gradient-accent); border:1px solid rgba(255,255,255,0.18); color:#fff; font-weight:600; letter-spacing:.4px; font-size:.62rem; padding:.5rem .85rem; border-radius:.65rem; box-shadow:0 2px 6px -2px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12); }
.btn-sm.btn-accent:hover:not(:disabled){ filter:brightness(1.08); }
.btn-sm.btn-accent:disabled { opacity:.45; cursor:not-allowed; }
.btn-sm.btn-soft { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; font-weight:500; font-size:.6rem; padding:.5rem .85rem; border-radius:.65rem; }
.btn-sm.btn-soft:hover:not(:disabled){ background:rgba(255,255,255,0.14); }
.btn-sm.btn-soft:disabled { opacity:.4; cursor:not-allowed; }
</style>
