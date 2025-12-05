import { ref } from 'vue'
import { defineStore } from 'pinia'
import { GetLocalOffices, pb } from '@/api/api'

// Initial mock placeholder until first successful load; kept minimal.
const MOCK_ITEMS = []

export const useOfficesStore = defineStore('offices', () => {
  const items = ref(MOCK_ITEMS)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  function normalize(record) {
    // Accept flexible field names; ensure code lowercase (fallback to slug or id)
    const code = (record.code || record.slug || record.id || '').toString().toLowerCase()
    const members = record.members_count || record.members || 0
    const upcoming = record.events_upcoming || record.eventsUpcoming || 0
    // Image: if file field (e.g. cover or image) exists, build file URL; else optional provided absolute URL
    let image = ''
    const fileField = record.cover || record.image
    if (fileField) {
      try {
        image = pb.files.getURL(record, fileField)
      } catch (_) {
        image = ''
      }
    } else if (record.image_url) {
      image = record.image_url
    }
    const region = record.region || record.area || ''
    return {
      code,
      name: record.name || record.title || code || '—',
      region,
      description: record.description || record.desc || (region ? `Office in ${region}` : ''),
      stats: { members, eventsUpcoming: upcoming },
      image,
      hidden: !!record.hidden
    }
  }

  async function load() {
    if (loading.value || loaded.value) return
    loading.value = true
    error.value = null
    try {
      const list = await GetLocalOffices()
      items.value = (Array.isArray(list) ? list : []).map(normalize)
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() { if (!loaded.value && !loading.value) await load() }

  function getByCode(code) { if (!code) return null; return items.value.find(o => o.code === String(code).toLowerCase()) || null }

  return { items, loading, loaded, error, load, ensureLoaded, getByCode }
})
