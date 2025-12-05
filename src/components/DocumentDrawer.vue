<script setup>
import { computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { storeToRefs } from 'pinia'
import { renderMarkdown } from '@/api/markdown'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const store = useDocumentsStore()
const { selected, aiResume, detailLoading, detailError } = storeToRefs(store)

const renderedResume = computed(() => renderMarkdown(aiResume.value || ''))

function closeDrawer() {
  emit('close')
  store.clearSelection()
}

function openFullFile() {
  if (selected.value?.link) window.open(selected.value.link, '_blank', 'noopener')
}

function prettyCategory(slug) {
  if (!slug) return ''
  return slug
    .replace(/_/g, ' ')
    .replace(/\b(\w)/g, (m, c) => c.toUpperCase())
}

function handleKey(e) {
  if (e.key === 'Escape' && props.open) {
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
})

// If drawer closes externally ensure selection cleared
watch(() => props.open, (v) => { if (!v) store.clearSelection() })
</script>

<template>
  <teleport to="body">
    <transition name="fade-fast">
      <div v-if="open" class="drawer-overlay" @click="closeDrawer" />
    </transition>
    <transition name="drawer">
      <aside
        v-if="open && selected"
        class="doc-drawer"
        aria-label="Document details"
        role="dialog"
        :aria-modal="true"
      >
        <header class="drawer-header">
          <div class="drawer-title-block">
            <h2 class="doc-name">{{ selected.name }}</h2>
            <p class="muted small" v-if="selected.category">{{ prettyCategory(selected.category) }}</p>
          </div>
          <button class="close-btn" type="button" aria-label="Close details" @click="closeDrawer">×</button>
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
          <div style="height:4rem" />
        </div>
        <footer class="drawer-footer" v-if="selected?.link">
          <button class="open-file-btn" type="button" @click="openFullFile">Open full file ↗</button>
        </footer>
      </aside>
    </transition>
  </teleport>
</template>

<style scoped>
.drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.46); backdrop-filter:blur(2px); z-index:79; }
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
.mini-loading { font-size:0.6rem; opacity:0.75; }
.dim { opacity:0.6; }
/* Transitions replicate originals */
.fade-fast-enter-from, .fade-fast-leave-to { opacity:0; }
.fade-fast-enter-active, .fade-fast-leave-active { transition:opacity 0.25s ease; }
.drawer-enter-from { transform:translateX(64px); opacity:0; }
.drawer-leave-to { transform:translateX(64px); opacity:0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.42s cubic-bezier(0.4,0,0.25,1), opacity 0.34s; }
@media (max-width: 720px) {
  .doc-drawer { width:100%; max-width:100%; }
}
</style>
