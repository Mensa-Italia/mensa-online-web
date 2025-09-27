<script setup>
import { onMounted, ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEventsStore } from '@/stores/events'
import PageHeader from '@/components/PageHeader.vue'
import FilterToolbar from '@/components/FilterToolbar.vue'

const eventsStore = useEventsStore()
// Use storeToRefs so that refs stay reactive when destructured
const { events, loading, error } = storeToRefs(eventsStore)
const { loadFromPocketBase } = eventsStore

onMounted(() => {
  loadFromPocketBase()
})

function formatStartDate(dateObj) {
  if (!dateObj) return ''
  try {
    const d = new Date(dateObj)
    // Show e.g. "Sep 13" (locale-aware) – concise for chip
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function eventStatus(ev) {
  const now = Date.now()
  const start = ev.whenStart ? (ev.whenStart.getTime ? ev.whenStart.getTime() : new Date(ev.whenStart).getTime()) : 0
  const end = ev.whenEnd ? (ev.whenEnd.getTime ? ev.whenEnd.getTime() : new Date(ev.whenEnd).getTime()) : 0
  if (now < start) return 'upcoming'
  if (now >= start && now <= end) return 'ongoing'
  return 'past'
}

// TODO reinvent layout: new image-first 16:9 immersive card

// Filters
const q = ref('')
const region = ref('')

const regions = computed(() => {
  const set = new Set()
  for (const ev of events.value) {
    const r = ev.position?.state || ''
    if (r) set.add(r)
  }
  return Array.from(set).sort()
})

const filteredEvents = computed(() => {
  const qLower = q.value.toLowerCase()
  return events.value.filter(ev => {
    if (q.value) {
      const text = (ev.name + ' ' + (ev.description || '')).toLowerCase()
      if (!text.includes(qLower)) return false
    }
    if (region.value && (ev.position?.state || '') !== region.value) return false
    return true
  })
})

function clearFilters() {
  q.value = ''
  region.value = ''
}

// Navigate to dedicated event detail page instead of side panel
const router = useRouter()
function openEvent(ev) {
  router.push({ name: 'EventDetail', params: { id: ev.id } })
}

import { linkify } from '@/api/linkify'

// Date/time helpers for panel
function formatDateTime(dt) {
  if (!dt) return ''
  try {
    const d = new Date(dt)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return '' }
}
function formatDate(dt) {
  if (!dt) return ''
  try { return new Date(dt).toLocaleDateString(undefined, { dateStyle: 'medium' }) } catch { return '' }
}
function formatTime(dt) {
  if (!dt) return ''
  try { return new Date(dt).toLocaleTimeString(undefined, { timeStyle: 'short' }) } catch { return '' }
}
function formatDuration(start, end) {
  if (!start || !end) return ''
  try {
    const ms = new Date(end) - new Date(start)
    if (ms <= 0) return ''
    const mins = Math.round(ms / 60000)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const rem = mins % 60
    if (hours < 24) return rem ? `${hours}h ${rem}m` : `${hours}h`
    const days = Math.floor(hours / 24)
    const hRem = hours % 24
    return hRem ? `${days}d ${hRem}h` : `${days}d`
  } catch { return '' }
}
</script>

<template>
  <div class="events-root">
    <PageHeader title="Events" subtitle="Discover all Mensa events" />
    <FilterToolbar
      v-model="q"
      v-model:filter-item="region"
      :filter-items="regions"
      :loading="loading"
      :all-item-name="'All regions'"
      :placeholder="'Search events...'"
      @clear="clearFilters"
    />
    <div v-if="loading" class="loading">Loading events…</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredEvents.length" class="events-grid">
      <article
        v-for="ev in filteredEvents"
        :key="ev.id"
        :class="[
          'ev-tile',
          ev.isNational && 'variant-national',
          ev.isSpot && 'variant-spot',
          `st-${eventStatus(ev)}`,
          !ev.image && 'no-img'
        ]"
        role="button"
        tabindex="0"
        @click="openEvent(ev)"
        @keydown.enter.prevent="openEvent(ev)"
        @keydown.space.prevent="openEvent(ev)"
        :aria-label="'Open details for ' + ev.name"
      >
        <div class="media-wrapper">
          <div class="ratio-frame">
            <img v-if="ev.image" :src="ev.image" :alt="ev.name" loading="lazy" />
            <div v-else class="no-image" :aria-label="'No image for ' + ev.name">
              <span class="no-img-label">{{ (ev.name || 'Event').slice(0,1).toUpperCase() }}</span>
            </div>
            <div class="overlay-gradient"></div>
            <div class="type-badge" :class="{ national: ev.isNational, spot: ev.isSpot }">
              <span v-if="ev.isNational">National</span>
              <span v-else-if="ev.isSpot">Spot</span>
              <span v-else>Event</span>
            </div>
            <div class="status-chip" :class="eventStatus(ev)">
              <span>{{ eventStatus(ev) }}</span>
            </div>
          </div>
        </div>
        <div class="tile-body">
          <h3 class="ev-title clamp-2">{{ ev.name }}</h3>
          <p v-if="ev.description" class="ev-desc clamp-3">{{ ev.description }}</p>
          <div class="ev-meta">
            <span class="meta location">{{ ev.position?.state || '—' }}</span>
            <span v-if="ev.contact" class="meta contact">{{ ev.contact }}</span>
          </div>
        </div>
        <div class="tile-footer">
          <div class="actions-left" v-if="ev.bookingLink">
            <a v-if="ev.bookingLink" :href="ev.bookingLink" target="_blank" rel="noopener" class="act book" :aria-label="'Book ' + ev.name" @click.stop>Book</a>
          </div>
          <div v-if="ev.whenStart" class="start-chip" :aria-label="'Starts ' + formatStartDate(ev.whenStart)">{{ formatStartDate(ev.whenStart) }}</div>
        </div>
      </article>
    </div>
    <div v-else-if="!loading && !error" class="empty">No events match your filters.</div>
  </div>
</template>

<!-- redesigned slate card layout -->

<style scoped>
.events-root {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}
/* Filters bar (reverted) */
.filters-bar { display:flex; flex-wrap:wrap; gap:.65rem .9rem; align-items:center; padding:.25rem .2rem 0; }
.filters-bar .field { position:relative; display:flex; align-items:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:.75rem; padding:0 .55rem; height:38px; backdrop-filter:blur(10px) saturate(140%); }
.filters-bar .field.inline { flex:1 1 220px; min-width:200px; }
.filters-bar .icon-leading { width:16px; height:16px; opacity:.6; margin-right:.4rem; }
.filter-input, .filter-select { background:transparent; border:none; outline:none; color:#f1f5f9; font-size:.7rem; width:100%; }
.filter-select { padding:.35rem 0; }
.filter-input::placeholder { color:rgba(241,245,249,0.45); }
.clear-btn { background:rgba(255,255,255,0.06); color:#e2e8f0; border:1px solid rgba(255,255,255,0.1); border-radius:.65rem; font-size:.6rem; padding:.45rem .7rem; cursor:pointer; letter-spacing:.5px; font-weight:600; }
.clear-btn:hover { background:rgba(255,255,255,0.12); }
.results-chip { font-size:.55rem; padding:.4rem .65rem; border-radius:.55rem; background:rgba(255,255,255,0.07); letter-spacing:.5px; font-weight:600; }
.filters-bar select option { color:#0f172a; }
/* Reinvented 16:9 tile layout */
.events-grid { display:grid; gap:1.1rem; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); }
@media (min-width:1600px) { .events-grid { grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:1.25rem; } }
@media (max-width:620px) { .events-grid { grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:.85rem; } }

.ev-tile { position:relative; display:flex; flex-direction:column; background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.07); border-radius:1rem; overflow:hidden; backdrop-filter:blur(12px) saturate(140%); box-shadow:0 4px 18px -8px rgba(0,0,0,0.55); transition:box-shadow .25s ease, transform .25s ease, border-color .25s ease; cursor:pointer; }
.ev-tile:hover { transform:translateY(-2px); box-shadow:0 8px 28px -10px rgba(0,0,0,0.6); border-color:rgba(255,255,255,0.15); }
.ev-tile:focus { outline:2px solid #38bdf8; outline-offset:2px; }
.variant-national { border-color:rgba(14,165,233,0.4); box-shadow:0 0 0 1px rgba(14,165,233,0.35),0 10px 34px -14px rgba(14,165,233,0.5); }
.variant-spot { border-color:rgba(167,139,250,0.4); box-shadow:0 0 0 1px rgba(168,85,247,0.3),0 10px 32px -14px rgba(147,51,234,0.5); }

.media-wrapper { position:relative; width:100%; }
.ratio-frame { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; background:linear-gradient(145deg,#1e293b,#0f172a); }
.ratio-frame::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 70% 25%,rgba(255,255,255,0.18),transparent 60%); mix-blend-mode:overlay; opacity:.5; pointer-events:none; }
.ratio-frame img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:saturate(108%) contrast(1.05); transition:transform .55s ease, filter .55s ease; }
.ev-tile:hover .ratio-frame img { transform:scale(1.045); filter:saturate(115%) contrast(1.08) brightness(1.05); }
.no-image { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:2.2rem; font-weight:700; letter-spacing:1px; color:#64748b; background:linear-gradient(135deg,#1e293b,#0f172a); }
.variant-national .no-image { color:#38bdf8; }
.variant-spot .no-image { color:#c084fc; }
.overlay-gradient { position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,0.6) 80%),linear-gradient(120deg,rgba(0,0,0,0.15),rgba(0,0,0,0)); pointer-events:none; }
.variant-national .overlay-gradient { background:linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(2,132,199,0.18) 60%,rgba(2,132,199,0.65) 90%),linear-gradient(120deg,rgba(2,132,199,0.25),rgba(0,0,0,0)); }
.variant-spot .overlay-gradient { background:linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(147,51,234,0.25) 60%,rgba(109,40,217,0.6) 90%),linear-gradient(120deg,rgba(147,51,234,0.25),rgba(0,0,0,0)); }

.type-badge { position:absolute; top:.55rem; left:.6rem; font-size:.55rem; padding:.3rem .65rem; border-radius:.65rem; font-weight:600; letter-spacing:.6px; text-transform:uppercase; backdrop-filter:blur(6px) saturate(160%); background:rgba(51,65,85,0.55); color:#f1f5f9; box-shadow:0 2px 6px -2px rgba(0,0,0,0.4); }
.type-badge.national { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#f0f9ff; }
.type-badge.spot { background:linear-gradient(135deg,#7e22ce,#a855f7); color:#faf5ff; }

.status-chip { position:absolute; top:.55rem; right:.6rem; padding:.25rem .55rem; font-size:.5rem; font-weight:600; letter-spacing:.6px; border-radius:.6rem; text-transform:uppercase; background:rgba(30,41,59,0.65); backdrop-filter:blur(6px) saturate(160%); color:#e2e8f0; display:flex; align-items:center; gap:.35rem; }
.status-chip.upcoming { background:linear-gradient(135deg,#0d9488,#14b8a6); color:#ecfeff; }
.status-chip.ongoing { background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff7ed; }
.status-chip.past { background:linear-gradient(135deg,#334155,#1e293b); opacity:.75; }

/* Footer & start date chip (bottom row) */
.tile-footer { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:0 .8rem .75rem; margin-top:auto; }
.actions-left { display:flex; gap:.55rem; }
.tile-footer:empty { display:none; }
.start-chip { padding:.38rem .7rem; font-size:.55rem; font-weight:600; letter-spacing:.6px; border-radius:.7rem; background:rgba(30,41,59,0.75); backdrop-filter:blur(6px) saturate(160%); color:#f1f5f9; box-shadow:0 2px 6px -2px rgba(0,0,0,0.45); white-space:nowrap; }
.variant-national .start-chip { background:linear-gradient(135deg,#0284c7,#0ea5e9); color:#f0f9ff; }
.variant-spot .start-chip { background:linear-gradient(135deg,#7e22ce,#a855f7); color:#faf5ff; }

.tile-body { display:flex; flex-direction:column; gap:.55rem; padding:.7rem .8rem .85rem; }
.ev-title { margin:0; font-size:.9rem; line-height:1.15; font-weight:600; letter-spacing:.4px; }
.ev-desc { margin:0; font-size:.65rem; line-height:1.25; opacity:.8; }
.ev-meta { display:flex; flex-wrap:wrap; gap:.45rem .8rem; font-size:.56rem; opacity:.72; }
.ev-meta .meta { display:inline-flex; align-items:center; gap:.35rem; }
/* legacy .tile-actions removed */
.act { font-size:.55rem; padding:.45rem .8rem; border-radius:.6rem; font-weight:600; letter-spacing:.55px; text-decoration:none; position:relative; overflow:hidden; display:inline-flex; align-items:center; backdrop-filter:blur(6px) saturate(150%); transition:background .25s ease, color .25s ease; }
.act.book { background:linear-gradient(135deg,#0ea5e9,#38bdf8); color:#fff; }
.act.book:hover { filter:brightness(1.08); }

.clamp-2 { display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.clamp-3 { display:-webkit-box; -webkit-line-clamp:3; line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

.ev-tile.variant-national::after { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 78% 22%,rgba(56,189,248,0.25),transparent 60%); mix-blend-mode:overlay; }
.ev-tile.variant-spot::after { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 78% 22%,rgba(168,85,247,0.25),transparent 60%); mix-blend-mode:overlay; }

.ev-tile.st-past { opacity:.85; }
.ev-tile.st-past .ratio-frame img { filter:grayscale(.2) brightness(.9); }

@media (hover:hover) {
  .ev-tile:hover .ev-title { text-decoration:underline; }
}

@media (max-width:620px) {
  .ev-title { font-size:.82rem; }
  .tile-body { padding:.6rem .65rem .75rem; }
  .tile-footer { padding:0 .65rem .65rem; }
}

.panel-body .richtext a { color:#38bdf8; text-decoration:underline; text-underline-offset:2px; }
.panel-body .richtext a:hover { color:#7dd3fc; }
.panel-body .richtext strong { font-weight:600; }
.section-heading { font-size:.75rem; margin:0 0 .4rem; text-transform:uppercase; letter-spacing:.65px; opacity:.75; }
.panel-footer { position:sticky; bottom:0; background:rgba(15,23,42,0.95); backdrop-filter:blur(8px) saturate(140%); padding:.7rem 1.2rem .85rem; font-size:.6rem; display:flex; gap:.9rem; align-items:center; border-top:1px solid rgba(255,255,255,0.08); justify-content:space-between; }
.footer-left { display:flex; gap:.4rem; align-items:center; flex-wrap:wrap; }
.footer-actions { display:flex; gap:.55rem; }
.contact-label { opacity:.7; }
.pa-btn.info { background:rgba(255,255,255,0.08); color:#e2e8f0; }
.pa-btn.info:hover { background:rgba(255,255,255,0.15); }
.pa-btn.book.alt { background:linear-gradient(135deg,#0284c7,#38bdf8); }
</style>
