import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CreatePosition, GetPositions, DeletePosition } from '@/api/api'

// Positions now sync with backend 'positions' collection (soft delete via saved=false)
// Structure normalized: { id, name, lat, lng, address }

const LS_KEY = 'myPositions:v1'

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
  } catch (_) {}
  return []
}

function persist(arr) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)) } catch(_) {}
}

export const usePositionsStore = defineStore('positions', () => {
  const positions = ref(loadFromLocalStorage()) // merged cache of remote + local (optimistic)
  const adding = ref(false)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  function normalize(r){
    return {
      id: r.id,
      name: r.name || 'Senza nome',
      lat: r.lat ?? r.latitude ?? 0,
      lng: r.lon ?? r.lng ?? 0,
      address: r.address || ''
    }
  }

  async function loadFromServer(){
    if (loading.value || loaded.value) return
    loading.value = true
    error.value = null
    try {
      const list = await GetPositions()
      const mapped = list.map(normalize)
      // Merge: replace all (we assume server is source of truth) while preserving any optimistic still not synced (no match by id length heuristic)
      const optimistic = positions.value.filter(p => !mapped.find(m => m.id === p.id) && p.id.length === 36) // keep only if no collision (UUID style) - but server also uses 15 char ids, so this effectively retains only unsynced uuid entries
      positions.value = [...mapped, ...optimistic]
      persist(positions.value)
      loaded.value = true
    } catch(e){
      error.value = e?.message || String(e)
    } finally {
      loading.value = false
    }
  }

  async function addPosition(p) {
    // Optimistic local id while saving
    if (adding.value) return
    adding.value = true
    error.value = null
    const tempId = crypto.randomUUID()
    const localRec = { id: tempId, ...p }
    positions.value.push(localRec)
    persist(positions.value)
    try {
      const record = await CreatePosition(p)
      // Replace temp record with backend record (keeping order)
      const idx = positions.value.findIndex(r => r.id === tempId)
      if (idx !== -1) {
        positions.value[idx] = normalize(record)
        persist(positions.value)
        return positions.value[idx]
      }
      return record
    } catch (e) {
      error.value = e?.message || String(e)
      // Rollback optimistic insert
      positions.value = positions.value.filter(r => r.id !== tempId)
      persist(positions.value)
      throw e
    } finally {
      adding.value = false
    }
  }

  async function removePosition(id) {
    const original = [...positions.value]
    positions.value = positions.value.filter(p => p.id !== id)
    persist(positions.value)
    try {
      await DeletePosition(id)
    } catch(e){
      // rollback on failure
      positions.value = original
      persist(positions.value)
      error.value = e?.message || String(e)
      throw e
    }
  }

  return { positions, addPosition, removePosition, loadFromServer, loading, loaded, adding, error }
})
