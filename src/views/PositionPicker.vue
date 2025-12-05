<template>
  <div class="page narrow">
    <PageHeader title="Seleziona Posizione" subtitle="Scegli una posizione sulla mappa o tramite ricerca" :compact="true" class="mb-3">
      <template #actions>
        <router-link :to="{ name: 'Positions' }" class="btn btn-sm btn-soft d-inline-flex align-items-center gap-1">
          <span style="line-height:1">←</span>
          <span>Indietro</span>
        </router-link>
      </template>
    </PageHeader>
    <div class="panel mb-3">
      <div class="search-row mb-2">
        <input ref="searchInput" class="form-control form-control-sm" type="text" placeholder="Cerca luogo o indirizzo..." aria-label="Search place" />
      </div>
      <div ref="mapEl" class="gmap" aria-label="Map to pick a location"></div>
      <div class="small text-muted mt-1" v-if="mapError">{{ mapError }}</div>
      <form class="mt-3" @submit.prevent="save">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label small">Nome</label>
            <input v-model="name" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-2">
            <label class="form-label small">Lat</label>
            <input v-model.number="lat" type="number" step="0.000001" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-2">
            <label class="form-label small">Lng</label>
            <input v-model.number="lng" type="number" step="0.000001" class="form-control form-control-sm" required />
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small">Indirizzo</label>
            <input v-model="address" class="form-control form-control-sm" />
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="dash-btn accent small" type="submit" :disabled="saving">{{ saving ? 'Salvataggio...' : 'Salva Posizione' }}</button>
          <button class="dash-btn ghost small" type="button" @click="reset" :disabled="saving">Reset</button>
        </div>
  <div v-if="saved" class="text-success small mt-2">Salvata.</div>
  <div v-else-if="saveError" class="text-danger small mt-2">{{ saveError }}</div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { usePositionsStore } from '@/stores/positions'
import { useRouter, useRoute } from 'vue-router'
import { Loader } from '@googlemaps/js-api-loader'
const positionsStore = usePositionsStore()
const router = useRouter()
const route = useRoute()
const name = ref('')
const lat = ref(45.46427)
const lng = ref(9.18951)
const address = ref('')
const saved = ref(false)
const saving = ref(false)
const saveError = ref('')
const mapEl = ref(null)
const searchInput = ref(null)
const mapError = ref('')
const mapReady = ref(false)
let map, marker, autocomplete
let mapInitialized = false
let locateControlEl = null

// Dark mode style (inspired by Google Dark theme with tweaks for better contrast)
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1b3a2f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3e52' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#365471' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1d3041' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e2736' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] }
]

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places']
})

onMounted(async () => {
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    mapError.value = 'Google Maps API key non configurata (.env)'
    return
  }
  try {
    const google = await loader.load()

    function initMap(center) {
      if (mapInitialized) return
      mapInitialized = true
      map = new google.maps.Map(mapEl.value, {
        center,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false, // disable place/POI click interactions
        styles: darkMapStyle
      })
      mapReady.value = true
      addLocateControl(google)
      marker = new google.maps.Marker({ position: center, map, draggable: true })
      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        lat.value = +pos.lat().toFixed(6)
        lng.value = +pos.lng().toFixed(6)
        reverseGeocode(google, pos.lat(), pos.lng())
      })
      map.addListener('click', (e) => {
        setPoint(google, e.latLng.lat(), e.latLng.lng())
      })
      autocomplete = new google.maps.places.Autocomplete(searchInput.value, { types: ['geocode'] })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) return
        const loc = place.geometry.location
        setPoint(google, loc.lat(), loc.lng(), place)
      })
    }

    // Attempt geolocation first; fallback after timeout / error
    let geoTried = false
    const fallbackTimer = setTimeout(() => {
      if (!geoTried) {
        initMap({ lat: lat.value, lng: lng.value })
      }
    }, 3500)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          geoTried = true
          clearTimeout(fallbackTimer)
            lat.value = +pos.coords.latitude.toFixed(6)
            lng.value = +pos.coords.longitude.toFixed(6)
            initMap({ lat: lat.value, lng: lng.value })
            // Optionally reverse geocode for immediate address
            reverseGeocode(google, lat.value, lng.value)
        },
        _err => {
          geoTried = true
          clearTimeout(fallbackTimer)
          initMap({ lat: lat.value, lng: lng.value })
        },
        { maximumAge: 60000, timeout: 3000, enableHighAccuracy: false }
      )
    } else {
      initMap({ lat: lat.value, lng: lng.value })
    }
  } catch (e) {
    mapError.value = 'Errore caricando Google Maps: ' + (e.message || e)
  }
})

function setPoint(google, la, ln, place) {
  lat.value = +la.toFixed(6)
  lng.value = +ln.toFixed(6)
  marker.setPosition({ lat: lat.value, lng: lng.value })
  map.panTo({ lat: lat.value, lng: lng.value })
  if (place) {
    address.value = place.formatted_address || address.value
    if (!name.value) name.value = place.name || ''
  } else {
    reverseGeocode(google, la, ln)
  }
}

async function reverseGeocode(google, la, ln) {
  try {
    const geocoder = new google.maps.Geocoder()
    const { results } = await geocoder.geocode({ location: { lat: la, lng: ln } })
    if (results && results.length) {
      address.value = results[0].formatted_address
    }
  } catch (_) {}
}

function geolocate() {
  if (!navigator.geolocation || !map) return
  if (locateControlEl) locateControlEl.classList.add('loading')
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords
    setPoint(window.google, latitude, longitude)
    if (locateControlEl) locateControlEl.classList.remove('loading')
  }, _err => {
    if (locateControlEl) locateControlEl.classList.remove('loading')
  }, { maximumAge: 20000, timeout: 5000 })
}
function addLocateControl(google){
  // Create only once
  if (locateControlEl) return
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.setAttribute('aria-label', 'Vai alla mia posizione')
  btn.title = 'Vai alla mia posizione'
  btn.className = 'map-control-btn'
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <circle cx="12" cy="12" r="9" stroke-width="1" opacity="0.35"></circle>
    </svg>`
  btn.addEventListener('click', geolocate)
  // Custom feedback state
  const style = btn.style
  style.display = 'flex'
  style.alignItems = 'center'
  style.justifyContent = 'center'
  style.background = 'rgba(15,23,42,0.85)'
  style.backdropFilter = 'blur(6px) saturate(160%)'
  style.color = '#fff'
  style.border = '1px solid rgba(255,255,255,0.18)'
  style.padding = '.55rem'
  style.borderRadius = '12px'
  style.cursor = 'pointer'
  style.boxShadow = '0 2px 6px -1px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.05) inset'
  style.transition = 'background .18s ease'
  btn.onmouseenter = () => { style.background = 'rgba(30,41,59,0.92)' }
  btn.onmouseleave = () => { style.background = 'rgba(15,23,42,0.85)' }
  // Loading pulse
  const observer = new MutationObserver(() => {
    if (btn.classList.contains('loading')) {
      style.animation = 'pulseLoc 1.1s ease-in-out infinite'
    } else {
      style.animation = ''
    }
  })
  observer.observe(btn, { attributes: true, attributeFilter: ['class'] })
  // Outer margin from map edges
  style.margin = '10px 10px 0 0'
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(btn)
  locateControlEl = btn
}
function reset(){ name.value=''; address.value=''; saved.value=false; saveError.value='' }
async function save(){
  if (saving.value) return
  saving.value = true
  saveError.value=''
  try {
    const rec = await positionsStore.addPosition({ name: name.value, lat: lat.value, lng: lng.value, address: address.value })
    saved.value=true
    // After a short feedback delay, navigate back to previous context.
    setTimeout(() => {
      const from = route.query.from
      // Event create context: set refresh flag then go to event create page
      if (from === 'event-create') {
        try { sessionStorage.setItem('reloadPositionsAfterReturn','1') } catch(_) {}
        router.push({ name: 'EventCreate' })
        return
      }
      // If there is browser history, go back; otherwise fallback to positions list
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push({ name: 'Positions' })
      }
    }, 450)
  } catch(e){
    saveError.value = e?.message || 'Errore salvataggio posizione'
  } finally {
    saving.value=false
  }
}
</script>
<style scoped>
.panel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:1rem; padding:1.25rem 1.2rem; backdrop-filter:blur(8px); }
.gmap { height:380px; width:100%; border:1px solid rgba(255,255,255,0.15); border-radius:.75rem; overflow:hidden; background:#0f172a; }
@keyframes pulseLoc { 0%,100% { box-shadow:0 0 0 0 rgba(56,189,248,.0),0 2px 6px -1px rgba(0,0,0,.55); } 50% { box-shadow:0 0 0 6px rgba(56,189,248,.12),0 2px 6px -1px rgba(0,0,0,.55); } }
.map-control-btn.loading { color:#7dd3fc; }
.search-row { display:flex; gap:.5rem; }
.search-row input { flex:1; }
/* Reuse dashboard button styles for consistency */
.dash-btn { --btn-bg:linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)); --btn-border:rgba(255,255,255,0.22); --btn-color:var(--color-text-primary); position:relative; appearance:none; border:1px solid var(--btn-border); background:var(--btn-bg); color:var(--btn-color); font-size:.6rem; font-weight:600; letter-spacing:.6px; text-transform:uppercase; padding:.45rem .85rem .4rem; border-radius:10px; display:inline-flex; align-items:center; gap:.45rem; line-height:1; cursor:pointer; backdrop-filter:blur(8px) saturate(160%); transition:background .2s, border-color .2s, box-shadow .25s, filter .2s; }
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
</style>
