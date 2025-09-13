import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { GetDocuments, GetDocumentsElaboration, GetDocumentElaborationByDocument } from '@/api/api'

export const useDocumentsStore = defineStore('documents', () => {
  const userDocuments = ref([
    { id: 'ud1', name: 'Membership Card (PDF)', type: 'pdf', updated: '2025-01-09' },
    { id: 'ud2', name: 'IQ Test Result Summary', type: 'pdf', updated: '2025-02-14' },
  ])

  const membershipDocuments = ref([
    { id: 'md1', name: 'National Charter', type: 'pdf', updated: '2025-01-01' },
    { id: 'md2', name: 'Event Guidelines', type: 'pdf', updated: '2025-03-02' },
  ])

  const library = ref([
    // initial mock data trimmed; will be replaced after PB load if available
  ])

  // Incremental reveal (infinite scroll style) state
  const displayLimit = ref(40) // initial batch size
  const increment = 40 // items to add each reveal

  const hasMoreLocal = computed(() => library.value.length > displayLimit.value)

  function showMore() {
    if (hasMoreLocal.value) displayLimit.value += increment
  }

  function resetDisplay() {
    displayLimit.value = increment
  }

  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  // Detail (elaboration / AI resume) state
  const detailLoading = ref(false)
  const detailError = ref(null)
  const selected = ref(null) // holds the base doc object (from library)
  const aiResume = ref('') // markdown text

  function clearSelection() {
    selected.value = null
    aiResume.value = ''
    detailError.value = null
  }

  async function loadElaboration(doc) {
    if (!doc || !doc.id) return
    selected.value = doc
    aiResume.value = ''
    detailError.value = null
    detailLoading.value = true
    try {
      let record = null
      // First attempt: relation lookup by document id
      record = await GetDocumentElaborationByDocument(doc.id)
      // Fallback: explicit elaborated id on doc object (if backend already provided mapping)
      if (!record && doc.elaborated) {
        record = await GetDocumentsElaboration(doc.elaborated)
      }
      // Last resort: try same id (legacy assumption) ONLY if not already attempted
      if (!record) {
        try { record = await GetDocumentsElaboration(doc.id) } catch (_) { /* ignore */ }
      }
      aiResume.value = record?.ia_resume || record?.ai_resume || ''
      if (!aiResume.value && !record) {
        detailError.value = 'No elaboration available.'
      }
    } catch (e) {
      detailError.value = e instanceof Error ? e.message : String(e)
    } finally {
      detailLoading.value = false
    }
  }

  const categories = computed(() => {
    const set = new Set(library.value.map((d) => d.category))
    return Array.from(set).sort()
  })

  const libraryByCategory = computed(() => {
    return library.value.reduce((acc, doc) => {
      ;(acc[doc.category] = acc[doc.category] || []).push(doc)
      return acc
    }, {})
  })

  const totalDocuments = computed(
    () => userDocuments.value.length + membershipDocuments.value.length + library.value.length,
  )

  async function loadFromPocketBase() {
    // Deprecated naming kept for backward compatibility; now uses API helper
    if (loading.value || loaded.value) return
    loading.value = true
    error.value = null
    try {
      const records = await GetDocuments()
      // records expected to be an array (getFullList). Defensive fallback.
      library.value = (Array.isArray(records) ? records : []).map((r, i) => {
        const name = r.name || r.title || r.file || `Documento ${i + 1}`
        const summary = r.description || r.summary || ''
        const category = r.category || 'varie'
        // Attempt file URL reconstruction if fields present (PocketBase pattern)
        let link = ''
        if (r.file && (r.collectionId || r.collection || r.collectionName)) {
          const collection = r.collectionId || r.collection || r.collectionName || 'documents'
            // backend base matches api.js baseURL
          link = `https://svc.mensa.it/api/files/${collection}/${r.id}/${r.file}`
        }
        return {
          id: r.id,
          name,
            summary,
          category,
          link,
          uploaded: (r.created || '').substring(0, 10),
          updated: (r.updated || r.created || '').substring(0, 10),
        }
      })
      loaded.value = true
      // After initial load ensure display limit reset (in case of re-entry)
      resetDisplay()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function addUserDocument(doc) {
    userDocuments.value.push(doc)
  }
  function addMembershipDocument(doc) {
    membershipDocuments.value.push(doc)
  }
  function addDocument(doc) {
    const id = 'lib' + (library.value.length + 1)
    const now = new Date().toISOString().slice(0, 10)
    library.value.push({ id, uploaded: now, updated: now, ...doc })
  }

  return {
    userDocuments,
    membershipDocuments,
    library,
    displayLimit,
    hasMoreLocal,
    categories,
    libraryByCategory,
    totalDocuments,
    addUserDocument,
    addMembershipDocument,
    addDocument,
    loadFromPocketBase,
    showMore,
    resetDisplay,
    loading,
    loaded,
    error,
    // detail exports
    selected,
    aiResume,
    detailLoading,
    detailError,
    loadElaboration,
    clearSelection,
  }
})
