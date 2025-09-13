<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { storeToRefs } from 'pinia'
import { useDocumentsStore } from '@/stores/documents'
import { renderMarkdown } from '@/api/markdown'
import {
  PiggyBank,
  Crown,
  CalendarRange,
  FolderOpen,
  Paperclip,
  FileText,
  Gavel,
  BookOpen,
  TrendingUp,
} from 'lucide-vue-next'
import FilterToolbar from '@/components/FilterToolbar.vue'

const store = useDocumentsStore()
const { library, categories, totalDocuments, loading, error, displayLimit, hasMoreLocal, selected, aiResume, detailLoading, detailError } = storeToRefs(store)

const q = ref('')
const category = ref('')

const filtered = computed(() => {
  return library.value.filter((d) => {
    if (q.value) {
      const text = (d.name + ' ' + d.summary).toLowerCase()
      if (!text.includes(q.value.toLowerCase())) return false
    }
    if (category.value && d.category !== category.value) return false
    return true
  })
})

const categoryIcons = {
  bilanci: PiggyBank, // status_up_outline equivalent
  elezioni: Crown, // crown_outline
  eventi_progetti: CalendarRange, // calendar_outline
  materiale_comunicazione: FolderOpen, // folder_outline
  modulitstica_contratti: Paperclip, // paperclip_outline
  news_pubblicazioni: FileText, // document_outline
  normativa_interna: Gavel, // judge_outline
  verbali_delibere: BookOpen, // book_outline
  tesoreria_contabilità: TrendingUp, // trend_up_outline
}

const sorted = computed(() => {
  // Sort filtered list by uploaded date (desc). Fallback to updated if uploaded missing.
  return [...filtered.value].sort((a, b) => {
    const da = a.uploaded || a.updated || ''
    const db = b.uploaded || b.updated || ''
    return db.localeCompare(da)
  })
})

// Visible slice for incremental display
const visible = computed(() => sorted.value.slice(0, displayLimit.value))

function iconFor(doc) {
  return categoryIcons[doc.category] || FileText
}

function prettyCategory(slug) {
  return slug
    .replace(/_/g, ' ')
    .replace(/\b(\w)/g, (m, c) => c.toUpperCase())
    .replace('Contabilità', 'Contabilità') // keep accent if any future normalization
}

// Drawer handling
const drawerOpen = ref(false)
function openDetails(doc) {
  drawerOpen.value = true
  store.loadElaboration(doc)
}
function closeDetails() {
  drawerOpen.value = false
  store.clearSelection()
}

const renderedResume = computed(() => renderMarkdown(aiResume.value || ''))

function openFullFile() {
  if (selected.value?.link) {
    window.open(selected.value.link, '_blank')
  }
}

const sentinel = ref(null)
let observer = null

onMounted(async () => {
  if (!store.loaded && !store.loading) {
    await store.loadFromPocketBase()
  }
  await nextTick()
  initObserver()
})

onBeforeUnmount(() => {
  destroyObserver()
})

function destroyObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function initObserver() {
  destroyObserver()
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && hasMoreLocal.value && !loading.value) {
          store.showMore()
        }
      }
    },
    { root: null, rootMargin: '0px 0px 320px 0px', threshold: 0 }
  )
  observer.observe(sentinel.value)
}

watch([q, category], () => {
  store.resetDisplay()
  nextTick().then(() => initObserver())
})

// If underlying library length changes (e.g., initial load) re-init observer
watch([library, hasMoreLocal], () => {
  nextTick().then(() => initObserver())
})
</script>

<template>
  <div class="docs-root">
    <PageHeader title="Documents" subtitle="Organization & membership PDFs">
      <template #actions>
        <div class="stat-chip">Total <strong>{{ totalDocuments }}</strong></div>
        <div v-if="loading" class="stat-chip">Loading…</div>
      </template>
    </PageHeader>

    <FilterToolbar
      v-model="q"
      v-model:filter-item="category"
      :filter-items="categories"
      :loading="loading"
      :all-item-name="'All categories'"
      :placeholder="'Search documents...'"
      @clear="() => { category = ''; q = '' }"
    />

    <section class="panel glass-panel list-panel">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span>Documents (newest first)</span>
      </div>
      <p v-if="error" class="small text-danger m-0" role="alert">{{ error }}</p>
      <template v-if="visible.length">
        <ul class="list-reset doc-list">
          <li v-for="d in visible" :key="d.id" class="doc-row" @click="openDetails(d)">
            <div class="icon-cell">
              <component :is="iconFor(d)" class="mini-icon" />
            </div>
            <div class="main">
              <strong class="title">{{ d.name }}</strong>
              <p class="summary">{{ d.summary }}</p>
            </div>
            <div class="meta small">
              <span class="badge-soft label cat-pill">{{ prettyCategory(d.category) }}</span>
            </div>
          </li>
          <li v-if="hasMoreLocal" ref="sentinel" class="doc-load-sentinel" />
        </ul>
      </template>
      <p v-else-if="!loading && !error" class="small dim m-0">No documents match your filters.</p>
      <p v-else-if="loading" class="small dim m-0">Loading documents…</p>
    </section>
    <!-- Overlay -->
    <transition name="fade-fast">
      <div v-if="drawerOpen" class="drawer-overlay" @click="closeDetails" />
    </transition>
    <!-- Drawer -->
    <transition name="drawer">
      <aside v-if="drawerOpen && selected" class="doc-drawer" aria-label="Document details">
        <header class="drawer-header">
          <div class="drawer-title-block">
            <h2 class="doc-name">{{ selected.name }}</h2>
            <p class="muted small" v-if="selected.category">{{ prettyCategory(selected.category) }}</p>
            <!-- uploaded date removed -->
          </div>
          <button class="close-btn" type="button" aria-label="Close details" @click="closeDetails">×</button>
        </header>
        <div class="drawer-content">
          <div v-if="detailLoading" class="mini-loading">Loading summary…</div>
          <p v-if="detailError" class="error-row small" role="alert">{{ detailError }}</p>
          <div v-if="!detailLoading && !detailError" class="resume-wrapper">
            <section v-if="aiResume" class="resume-block">
              <h3 class="section-title">AI Resume</h3>
              <div class="markdown" v-html="renderedResume" />
            </section>
            <p v-else class="dim small">No summary available.</p>
          </div>
          <!-- Spacer to ensure content bottom is above footer -->
          <div style="height:4rem" />
        </div>
        <footer class="drawer-footer" v-if="selected?.link">
          <button class="open-file-btn" type="button" @click="openFullFile">Open full file ↗</button>
        </footer>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
.docs-root {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}
.filters {
  padding: 1rem 0.95rem 0.9rem;
}
.list-panel {
  padding: 0.85rem 0.95rem 0.75rem;
}
/* Removed category grouping styles */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.doc-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 0.7rem;
  padding: 0.6rem 0.7rem 0.55rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  cursor: pointer;
  align-items: center; /* vertically center */
}
.doc-row:hover {
  background: rgba(255, 255, 255, 0.07);
}
.icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03));
}
.mini-icon {
  width: 17px;
  height: 17px;
  stroke-width: 1.7;
}
.main {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.title {
  font-size: 0.75rem;
  letter-spacing: 0.4px;
}
.summary {
  font-size: 0.6rem;
  opacity: 0.7;
  margin: 0;
  line-height: 1.15;
}
.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.meta .badge-soft {
  font-size: 0.5rem;
  font-weight: 600;
}
.meta .cat-pill {
  text-transform: lowercase;
}
.doc-load-sentinel {
  height: 1px;
  list-style: none;
  margin: 0;
  padding: 0;
}
/* Drawer styles (borrowed pattern from phonebook with slight adjustments) */
.drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.46); backdrop-filter:blur(2px); }
.doc-drawer { position:fixed; top:0; right:0; width:500px; max-width:95%; height:100%; background:rgba(19,26,38,0.9); backdrop-filter:blur(18px); border-left:1px solid rgba(255,255,255,0.1); box-shadow:-2px 0 18px -4px rgba(0,0,0,0.55); display:flex; flex-direction:column; z-index:80; }
.drawer-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1.2rem; padding:1rem 1.15rem 0.85rem; border-bottom:1px solid rgba(255,255,255,0.08); }
.close-btn { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:#e2e8f0; width:34px; height:34px; border-radius:10px; font-size:1.1rem; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.close-btn:hover { background:rgba(255,255,255,0.15); }
.drawer-title-block { display:flex; flex-direction:column; gap:0.35rem; padding-right:0.25rem; }
.doc-name { margin:0; font-size:1.08rem; letter-spacing:0.45px; line-height:1.15; }
.drawer-content { padding:0.9rem 1.1rem 0.75rem; overflow-y:auto; font-size:0.82rem; line-height:1.6; }
.drawer-content::-webkit-scrollbar { width:7px; }
.drawer-content::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
.section-title { font-size:0.62rem; text-transform:uppercase; letter-spacing:1px; opacity:0.55; margin:0 0 0.5rem; font-weight:600; }
.resume-block { display:flex; flex-direction:column; gap:0.6rem; }
.markdown h1 { font-size:1.1rem; margin:0.9rem 0 0.5rem; }
.markdown h2 { font-size:0.95rem; margin:0.85rem 0 0.45rem; }
.markdown h3 { font-size:0.88rem; margin:0.8rem 0 0.4rem; }
.markdown p { margin:0 0 0.9rem; }
.markdown ul { margin:0 0 1rem 1.1rem; padding:0; list-style:disc; }
.markdown li { margin:0.35rem 0; }
.markdown code { background:rgba(255,255,255,0.15); padding:0.18rem 0.4rem; border-radius:5px; font-family:monospace; font-size:0.68rem; }
.drawer-footer { position:absolute; bottom:0; left:0; right:0; padding:0.75rem 1.1rem 0.9rem; display:flex; justify-content:flex-end; background:linear-gradient(180deg, rgba(19,26,38,0), rgba(19,26,38,0.85) 55%, rgba(19,26,38,0.95)); backdrop-filter:blur(6px); border-top:1px solid rgba(255,255,255,0.08); }
.open-file-btn { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#f1f5f9; border:none; padding:0.55rem 0.9rem; font-size:0.68rem; font-weight:600; letter-spacing:0.5px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; box-shadow:0 4px 10px -3px rgba(0,0,0,0.5); }
.open-file-btn:hover { filter:brightness(1.08); }
.resume-wrapper { position:relative; }
.mini-loading { font-size:0.6rem; opacity:0.75; }
.dim { opacity:0.6; }

/* Animations (reuse names) */
.fade-fast-enter-from, .fade-fast-leave-to { opacity:0; }
.fade-fast-enter-active, .fade-fast-leave-active { transition:opacity 0.25s ease; }
.drawer-enter-from { transform:translateX(64px); opacity:0; }
.drawer-leave-to { transform:translateX(64px); opacity:0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.42s cubic-bezier(0.4,0,0.25,1), opacity 0.34s; }
@media (max-width: 720px) {
  .docs-title {
    font-size: 1.35rem;
  }
  .doc-row {
    grid-template-columns: 18px 1fr;
  }
  .meta {
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.4rem;
    grid-column: 2 / span 1;
  }
}
</style>
