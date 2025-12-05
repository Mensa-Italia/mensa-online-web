<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { storeToRefs } from 'pinia'
import { useDocumentsStore } from '@/stores/documents'
import { renderMarkdown } from '@/api/markdown'
import DocumentDrawer from '@/components/DocumentDrawer.vue'
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

// Drawer handling (now delegated to component)
const drawerOpen = ref(false)
function openDetails(doc) { drawerOpen.value = true; store.loadElaboration(doc) }
function closeDetails() { drawerOpen.value = false; store.clearSelection() }

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
    <DocumentDrawer :open="drawerOpen" @close="closeDetails" />
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
/* Drawer styles moved to reusable component */
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
