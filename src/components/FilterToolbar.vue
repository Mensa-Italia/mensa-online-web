<script setup>
/**
 * Reusable filter/search toolbar.
 * Props:
 *  - modelValue: search string (v-model)
 *  - filterItem: selected filter item (v-model:filterItem)
 *  - filterItems: array of filter item strings
 *  - loading: boolean (optional) to disable inputs when loading
 *  - showCount: number | null -> if provided shows result count chip
 *  - placeholder: custom placeholder for search input
 * Emits:
 *  - update:modelValue
 *  - update:filterItem
 *  - clear (after reset action)
 */
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  filterItem: { type: String, default: '' },
    filterItems: { type: Array, default: () => [] },
  allItemName: { type: String, default: 'All items' },
  loading: { type: Boolean, default: false },
  showCount: { type: Number, default: null },
  placeholder: { type: String, default: 'Search...' },
  dense: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'update:filterItem', 'clear'])

// Writable computed wrappers to support v-model usage
const q = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const filterItemModel = computed({
  get: () => props.filterItem,
  set: (v) => emit('update:filterItem', v),
})

function clearFilters() {
  emit('update:modelValue', '')
  emit('update:filterItem', '')
  emit('clear')
}

const hasFilters = computed(() => !!(props.modelValue || props.filterItem))
</script>

<template>
  <div :class="['filter-toolbar', { dense: props.dense }]">
    <div class="field inline">
      <svg class="icon-leading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3" /></svg>
      <input
        v-model.trim="q"
        type="text"
        class="filter-input"
        :placeholder="props.placeholder"
        aria-label="Search"
        :disabled="props.loading"
      />
    </div>
    <div class="field region">
      <svg class="icon-leading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18"/><path d="M7 12h10"/><path d="M10 19h4"/></svg>
      <select
        v-model="filterItemModel"
        class="filter-select"
        aria-label="Filter by item"
        :disabled="props.loading"
      >
        <option value="">{{ props.allItemName }}</option>
        <option v-for="r in props.filterItems" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>
    <button
      v-if="hasFilters"
      class="clear-btn"
      type="button"
      @click="clearFilters"
      title="Clear filters"
      :disabled="props.loading"
    >Reset</button>
    <span v-if="props.showCount !== null" class="results-chip">{{ props.showCount }} results</span>
  </div>
</template>

<style scoped>
/* Filter toolbar */
.filter-toolbar { display:flex; flex-wrap:wrap; gap:.65rem .9rem; align-items:center; padding:.25rem .2rem 0; }
.filter-toolbar.dense { gap:.45rem .6rem; }
.filter-toolbar .field { position:relative; display:flex; align-items:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:.75rem; padding:0 .55rem; height:38px; backdrop-filter:blur(10px) saturate(140%); transition:border-color .2s ease, box-shadow .2s ease; }
.filter-toolbar .field.inline { flex:1 1 220px; min-width:200px; }
.filter-toolbar .field.region { min-width:180px; }
.filter-toolbar .field:focus-within { border-color:rgba(255,255,255,0.22); box-shadow:0 0 0 2px rgba(255,255,255,0.05); }
.filter-toolbar .icon-leading { width:16px; height:16px; opacity:.6; margin-right:.4rem; flex-shrink:0; }
.filter-input,
.filter-select { background:transparent; border:none; outline:none; color:#f1f5f9; font-size:.7rem; width:100%; }
.filter-input::placeholder { color:rgba(241,245,249,0.45); }
.filter-select { padding:.35rem 1.2rem .35rem 0; -webkit-appearance:none; appearance:none; line-height:1.2; cursor:pointer; }
.filter-select:-moz-focusring { color:transparent; text-shadow:0 0 0 #f1f5f9; }
.filter-toolbar .field.region::after { content:""; position:absolute; right:.65rem; top:50%; width:0; height:0; pointer-events:none; border-left:4px solid transparent; border-right:4px solid transparent; border-top:5px solid rgba(241,245,249,0.7); transform:translateY(-30%); }
.filter-toolbar .field.region:focus-within::after { border-top-color:#fff; }
.filter-input::-webkit-search-decoration,
.filter-input::-webkit-search-cancel-button,
.filter-input::-webkit-search-results-button,
.filter-input::-webkit-search-results-decoration { display:none; }
.clear-btn { background:rgba(255,255,255,0.06); color:#e2e8f0; border:1px solid rgba(255,255,255,0.1); border-radius:.65rem; font-size:.6rem; padding:.45rem .7rem; cursor:pointer; letter-spacing:.5px; font-weight:600; }
.clear-btn:hover { background:rgba(255,255,255,0.12); }
.results-chip { font-size:.55rem; padding:.4rem .65rem; border-radius:.55rem; background:rgba(255,255,255,0.07); letter-spacing:.5px; font-weight:600; }
.filter-toolbar select option { color:#0f172a; }
/* Reinvented 16:9 tile layout */
.events-grid { display:grid; gap:1.1rem; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); }
@media (min-width:1600px) { .events-grid { grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:1.25rem; } }
@media (max-width:620px) { .events-grid { grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:.85rem; } }

.ev-tile { position:relative; display:flex; flex-direction:column; background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.07); border-radius:1rem; overflow:hidden; backdrop-filter:blur(12px) saturate(140%); box-shadow:0 4px 18px -8px rgba(0,0,0,0.55); transition:box-shadow .25s ease, transform .25s ease, border-color .25s ease; }
.ev-tile:hover { transform:translateY(-2px); box-shadow:0 8px 28px -10px rgba(0,0,0,0.6); border-color:rgba(255,255,255,0.15); }
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

.tile-body { display:flex; flex-direction:column; gap:.55rem; padding:.7rem .8rem .85rem; }
.ev-title { margin:0; font-size:.9rem; line-height:1.15; font-weight:600; letter-spacing:.4px; }
.ev-desc { margin:0; font-size:.65rem; line-height:1.25; opacity:.8; }
.ev-meta { display:flex; flex-wrap:wrap; gap:.45rem .8rem; font-size:.56rem; opacity:.72; }
.ev-meta .meta { display:inline-flex; align-items:center; gap:.35rem; }
.tile-actions { display:flex; gap:.55rem; padding:0 .8rem .75rem; margin-top:auto; }
.act { font-size:.55rem; padding:.45rem .8rem; border-radius:.6rem; font-weight:600; letter-spacing:.55px; text-decoration:none; position:relative; overflow:hidden; display:inline-flex; align-items:center; backdrop-filter:blur(6px) saturate(150%); transition:background .25s ease, color .25s ease; }
.act.info { background:rgba(255,255,255,0.06); color:#e2e8f0; }
.act.info:hover { background:rgba(255,255,255,0.12); }
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
  .tile-actions { padding:0 .65rem .65rem; }
}
</style>