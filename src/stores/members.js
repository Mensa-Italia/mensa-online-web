import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { GetMembers } from '@/api/api'

// Simple mock dataset; in future replace with API fetch
// Base fields: id, name, email, region, joined
// Optional extended fields (if available from backend integration):
// area, city, state, birthdate, created, updated, is_active, image, full_data (object of arbitrary key/value pairs), full_profile_link
export const useMembersStore = defineStore('members', () => {
  const members = ref([
    // initial mock data trimmed; will be replaced after PB load
    { id: 1, name: 'Alice Bianchi', email: 'alice@example.com', region: 'Lombardia', joined: '2023-02-14' },
    { id: 2, name: 'Bruno Verdi', email: 'bruno@example.com', region: 'Lazio', joined: '2022-11-03' },
    { id: 3, name: 'Carla Neri', email: 'carla@example.com', region: 'Toscana', joined: '2024-06-21' },
  ])

  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)
  // Local incremental display (client-side pagination / virtual-like)
  const displayLimit = ref(100)
  const increment = 100
  const hasMoreLocal = computed(() => members.value.length > displayLimit.value)

  const total = computed(() => members.value.length)
  const byRegion = computed(() => {
    const acc = {}
    for (const m of members.value) {
      acc[m.region] = (acc[m.region] || 0) + 1
    }
    return acc
  })

  function normalize(record) {
    const fullData = record.full_data || record.fullData || {}
    const email = record.email || record.mail || fullData['E-mail:'] || fullData['Email:'] || ''
    const region = record.region || record.area || record.regione || record.state || ''
    return {
      id: record.id,
      name: record.name || [record.first_name, record.last_name].filter(Boolean).join(' ') || '—',
      email,
      region,
      area: record.area || undefined,
      city: record.city || undefined,
      state: record.state || undefined,
      birthdate: record.birthdate || undefined,
      joined: (record.joined || record.created || '').substring(0, 10),
      created: record.created,
      updated: record.updated,
      is_active: record.is_active,
      image: record.image ? `https://svc.mensa.it/api/files/${record.collectionId || 'members_registry'}/${record.id}/${record.image}?thumb=0x100` : '',
      full_data: fullData,
      full_profile_link: record.profile_link || record.full_profile_link || '',
    }
  }

  async function loadFromPocketBase() {
    if (loading.value || loaded.value) return
    loading.value = true
    error.value = null
    try {
      const result = await GetMembers()
      members.value = (Array.isArray(result) ? result : []).map(normalize)
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function showMore() {
    if (hasMoreLocal.value) {
      displayLimit.value += increment
    }
  }

  function resetDisplay() {
    displayLimit.value = increment
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) {
      await loadFromPocketBase()
    }
  }

  function addMember(data) {
    const id = members.value.length ? Math.max(...members.value.map((m) => m.id)) + 1 : 1
    members.value.push({ id, ...data })
  }
  return { members, total, byRegion, addMember, loadFromPocketBase, ensureLoaded, loading, loaded, error, displayLimit, showMore, resetDisplay, hasMoreLocal }
})
