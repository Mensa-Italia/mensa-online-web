<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEventsStore } from '@/stores/events'
import { linkify } from '@/api/linkify'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const { events, loading, error, loaded } = storeToRefs(eventsStore)
const { loadFromPocketBase } = eventsStore

// Map handling
const mapContainer = ref(null)
let mapInstance = null
const coordsRef = ref(null)

onMounted(async () => {
  if (!loaded.value && !loading.value) await loadFromPocketBase()
  maybeInitMap()
})
onBeforeUnmount(() => { if (mapInstance && mapInstance.remove) { mapInstance.remove(); mapInstance = null } })

const eventId = computed(() => route.params.id)
const ev = computed(() => events.value.find(e => String(e.id) === String(eventId.value)))
watch(ev, () => { maybeInitMap() })

function status(e) {
  if (!e) return ''
  const now = Date.now()
  const s = e.whenStart ? new Date(e.whenStart).getTime() : 0
  const en = e.whenEnd ? new Date(e.whenEnd).getTime() : 0
  if (now < s) return 'upcoming'
  if (now >= s && now <= en) return 'ongoing'
  return 'past'
}

function fmtDate(dt, opts={ dateStyle:'long' }) { try { return dt ? new Date(dt).toLocaleDateString(undefined, opts) : '' } catch { return '' } }
function fmtTime(dt) { try { return dt ? new Date(dt).toLocaleTimeString(undefined, { timeStyle:'short' }) : '' } catch { return '' } }
function fmtDateTime(dt) { try { return dt ? new Date(dt).toLocaleString(undefined, { dateStyle:'medium', timeStyle:'short' }) : '' } catch { return '' } }
function duration(a,b){ try{ if(!a||!b) return ''; const ms = new Date(b)-new Date(a); if(ms<=0)return ''; const m=Math.round(ms/60000); if(m<60)return m+" min"; const h=Math.floor(m/60); const r=m%60; if(h<24)return r?`${h}h ${r}m`:`${h}h`; const d=Math.floor(h/24); const hr=h%24; return hr?`${d}d ${hr}h`:`${d}d`; }catch{return ''} }

function extractCoords(position) {
  if (!position) return null
  const lat = position.lat ?? position.latitude
  const lon = position.lon ?? position.lng ?? position.longitude
  if (typeof lat === 'number' && typeof lon === 'number') return { lat, lon }
  if (Array.isArray(position.coordinates)) {
    const [a,b] = position.coordinates
    if (typeof a === 'number' && typeof b === 'number') {
      if (Math.abs(a) > 90) return { lon: a, lat: b }
      return { lat: a, lon: b }
    }
  }
  if (typeof position === 'string') {
    const parts = position.split(/[ ,;]+/).map(Number).filter(n => !isNaN(n))
    if (parts.length >= 2) return { lat: parts[0], lon: parts[1] }
  }
  return null
}

async function maybeInitMap() {
  if (!mapContainer.value || !ev.value || mapInstance) return
  const coords = extractCoords(ev.value.position)
  if (!coords) return
  coordsRef.value = coords
  try {
    const maplibregl = await import('maplibre-gl')
    await import('maplibre-gl/dist/maplibre-gl.css')
    mapInstance = new maplibregl.Map({
      container: mapContainer.value,
      style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=7u4KZex2hU8HDKij7YWx',
      center: [coords.lon, coords.lat],
      zoom: 16,
      attributionControl: false,
      interactive: true
    })
    new maplibregl.Marker({ color: '#0ea5e9' }).setLngLat([coords.lon, coords.lat]).addTo(mapInstance)
    // Disable interactions to make it static-looking
    mapInstance.scrollZoom.disable()
    mapInstance.boxZoom.disable()
    mapInstance.dragRotate.disable()
    mapInstance.dragPan.disable()
    mapInstance.keyboard.disable()
    mapInstance.doubleClickZoom.disable()
    mapInstance.touchZoomRotate.disable()
  } catch (e) {
    console.warn('Map initialization failed', e)
  }
}

function openGoogleMaps() {
  if (!coordsRef.value) return
  const { lat, lon } = coordsRef.value
  const url = `https://www.google.com/maps?q=${lat},${lon}`
  window.open(url, '_blank', 'noopener')
}
</script>

<template>
  <div class="event-page" v-if="!loading || loaded">
    <div class="topbar-row">
      <RouterLink :to="{ name: 'Events' }" class="back-pill">← Events</RouterLink>
    </div>
    <div v-if="error" class="err">{{ error }}</div>
    <div v-else-if="!ev && loaded" class="not-found">Event not found.</div>
    <div v-else-if="ev" class="page-grid">
      <div class="left-col">
        <div class="head-block">
          <div class="badge-row">
            <span class="chip kind" :class="{ national: ev.isNational, spot: ev.isSpot }">
              <span v-if="ev.isNational">Nazionale</span>
              <span v-else-if="ev.isSpot">Spot</span>
              <span v-else>Evento</span>
            </span>
            <span class="chip state" :class="status(ev)">{{ status(ev) }}</span>
          </div>
          <h1 class="title">{{ ev.name }}</h1>
          <div class="time-inline">
            <span>{{ fmtDate(ev.whenStart) }} {{ fmtTime(ev.whenStart) }}</span>
            <span class="sep">→</span>
            <span>{{ fmtDate(ev.whenEnd) }} {{ fmtTime(ev.whenEnd) }}</span>
            <span v-if="duration(ev.whenStart, ev.whenEnd)" class="dur-pill">{{ duration(ev.whenStart, ev.whenEnd) }}</span>
          </div>
          <div class="loc-inline" v-if="ev.position?.state">{{ ev.position.state }}</div>
        </div>
        <div class="section" v-if="ev.description">
          <div class="richtext" v-html="linkify(ev.description)"></div>
        </div>
        <div class="section" v-if="ev.contact">
          <h2>Contatti</h2>
          <div class="richtext" v-html="linkify(ev.contact)"></div>
        </div>
        <div class="cta-main" v-if="ev.bookingLink || ev.infoLink">
          <a v-if="ev.bookingLink" :href="ev.bookingLink" target="_blank" rel="noopener" class="cta-btn primary">Partecipa</a>
          <a v-else-if="ev.infoLink" :href="ev.infoLink" target="_blank" rel="noopener" class="cta-btn ghost">Partecipa</a>
          <a v-if="ev.infoLink && ev.bookingLink" :href="ev.infoLink" target="_blank" rel="noopener" class="cta-btn alt">Info</a>
        </div>
      </div>
      <aside class="right-col">
        <div class="thumb" v-if="ev.image"><img :src="ev.image" :alt="ev.name" /></div>
        <div v-else class="thumb fallback">{{ (ev.name||'E').slice(0,1).toUpperCase() }}</div>
        <div class="info-card">
          <h3 class="card-title">Dettagli</h3>
          <ul class="kv-list">
            <li v-if="ev.position?.state"><span class="k">Luogo</span><span class="v">{{ ev.position.state }}</span></li>
            <li><span class="k">Stato</span><span class="v cap">{{ status(ev) }}</span></li>
            <li v-if="ev.whenStart"><span class="k">Inizio</span><span class="v">{{ fmtDateTime(ev.whenStart) }}</span></li>
            <li v-if="ev.whenEnd"><span class="k">Fine</span><span class="v">{{ fmtDateTime(ev.whenEnd) }}</span></li>
            <li v-if="duration(ev.whenStart, ev.whenEnd)"><span class="k">Durata</span><span class="v">{{ duration(ev.whenStart, ev.whenEnd) }}</span></li>
            <li v-if="ev.owner"><span class="k">Owner</span><span class="v">{{ ev.owner }}</span></li>
          </ul>
        </div>
        <div class="map-wrapper" ref="mapContainer" v-if="ev.position">
          <div class="map-overlay" @click="openGoogleMaps" title="Apri in Google Maps"></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.event-page { display:flex; flex-direction:column; gap:1.4rem; }
.topbar-row { display:flex; justify-content:space-between; align-items:center; }
.back-pill { font-size:.6rem; padding:.5rem .9rem; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:999px; text-decoration:none; color:#f1f5f9; letter-spacing:.4px; backdrop-filter:blur(6px) saturate(150%); }
.back-pill:hover { background:rgba(255,255,255,0.12); }

.page-grid { display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:2rem; }
@media (max-width:1050px){ .page-grid { grid-template-columns:1fr; } .right-col { order:-1; } }
/* Left column */
.left-col { display:flex; flex-direction:column; gap:1.9rem; }
.head-block { display:flex; flex-direction:column; gap:1rem; }
.badge-row { display:flex; gap:.55rem; flex-wrap:wrap; }
.chip { font-size:.55rem; padding:.38rem .75rem; border-radius:.75rem; font-weight:600; letter-spacing:.55px; text-transform:uppercase; background:rgba(255,255,255,0.12); backdrop-filter:blur(6px) saturate(160%); }
.chip.kind.national { background:linear-gradient(135deg,#0284c7,#0ea5e9); }
.chip.kind.spot { background:linear-gradient(135deg,#7e22ce,#a855f7); }
.chip.state.upcoming { background:linear-gradient(135deg,#0d9488,#14b8a6); }
.chip.state.ongoing { background:linear-gradient(135deg,#d97706,#f59e0b); }
.chip.state.past { background:linear-gradient(135deg,#334155,#1e293b); }
.title { margin:0; font-size:2rem; line-height:1.12; letter-spacing:.5px; }
.time-inline { display:flex; flex-wrap:wrap; gap:.6rem; align-items:center; font-size:.62rem; opacity:.85; }
.time-inline .sep { opacity:.5; }
.dur-pill { background:rgba(255,255,255,0.1); padding:.3rem .6rem; border-radius:.7rem; font-weight:600; letter-spacing:.5px; }
.loc-inline { font-size:.65rem; opacity:.8; }
.section { display:flex; flex-direction:column; gap:.7rem; }
.section h2 { margin:0; font-size:.95rem; letter-spacing:.45px; }
.section .richtext { font-size:.78rem; line-height:1.5; }
.section .richtext p { margin:.7rem 0; }
.cta-main { display:flex; gap:.8rem; flex-wrap:wrap; margin-top:.2rem; }
.cta-btn { font-size:.7rem; padding:.65rem 1.15rem; border-radius:.85rem; font-weight:600; letter-spacing:.55px; text-decoration:none; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); color:#fff; backdrop-filter:blur(8px) saturate(160%); transition:background .25s ease, transform .25s ease; }
.cta-btn:hover { background:rgba(255,255,255,0.18); }
.cta-btn.primary { background:linear-gradient(135deg,#0ea5e9,#38bdf8); border:none; }
.cta-btn.primary:hover { filter:brightness(1.08); transform:translateY(-2px); }
.cta-btn.alt { background:rgba(255,255,255,0.16); }

/* Right column */
.right-col { display:flex; flex-direction:column; gap:1rem; position:sticky; top:1rem; }
.thumb { width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:1rem; background:linear-gradient(145deg,#1e293b,#0f172a); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; }
.thumb img { width:100%; height:100%; object-fit:cover; filter:saturate(110%) contrast(1.05); }
.thumb.fallback { font-size:2.6rem; font-weight:700; color:#64748b; }
.info-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:1rem; padding:1rem 1.1rem 1.2rem; backdrop-filter:blur(10px) saturate(160%); display:flex; flex-direction:column; gap:1rem; }
.card-title { margin:0; font-size:.72rem; letter-spacing:.55px; text-transform:uppercase; opacity:.7; }
.kv-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; font-size:.63rem; }
.kv-list li { display:flex; gap:.55rem; }
.kv-list .k { width:70px; opacity:.55; text-transform:uppercase; font-size:.52rem; letter-spacing:.5px; }
.kv-list .v { flex:1 1 auto; }
.kv-list .cap { text-transform:capitalize; }
.map-wrapper { width:100%; height:240px; border:1px solid rgba(255,255,255,0.1); border-radius:1rem; overflow:hidden; background:#0f172a; position:relative; }
.map-wrapper :deep(canvas) { outline:none; pointer-events:none !important; }
.map-wrapper :deep(.maplibregl-ctrl) { display:none !important; }
.map-overlay { position:absolute; inset:0; cursor:pointer; background:transparent; z-index:10; pointer-events:auto; }
.map-overlay:hover { box-shadow:inset 0 0 0 2px rgba(255,255,255,0.12); }

.not-found, .err { font-size:.75rem; opacity:.8; padding:1rem; }
</style>
