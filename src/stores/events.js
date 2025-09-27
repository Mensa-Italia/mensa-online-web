import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { GetEvents } from '@/api/api'

function mapEventRecord(r) {
  return {
    id: r.id,
    name: r.name || r.title || 'Untitled Event',
    description: r.description || '',
    infoLink: r.info_link || r.infoLink || '',
    bookingLink: r.booking_link || r.bookingLink || '',
    whenStart: new Date(r.when_start || r.whenStart || r.when || Date.now()),
    whenEnd: new Date(r.when_end || r.whenEnd || r.when || Date.now()),
    contact: r.contact || '',
    isNational: !!r.is_national || !!r.isNational,
    isSpot: !!r.is_spot || !!r.isSpot,
    image:  r.image ? `https://svc.mensa.it/api/files/${r.collectionId || 'events'}/${r.id}/${r.image}` : '',
    position: r.expand.position || r.position || null,
    owner: r.owner || null,
    created: r.created ? new Date(r.created) : null,
    updated: r.updated ? new Date(r.updated) : null,
  }
}

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const userTerritory = ref('Lombardy')
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  const currentEvent = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return events.value.find((ev) => ev.whenStart.toISOString().slice(0, 10) === today) || null
  })

  const territoryEvents = computed(() => {
    return events.value.filter((ev) => ev.isNational === false && (ev.position?.state || '') === userTerritory.value)
  })

  const italyEvents = computed(() => events.value.filter((ev) => ev.isNational))

  const totalEvents = computed(() => events.value.length)

  async function loadFromPocketBase() {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const result = await GetEvents()
      events.value = result.map((r) => mapEventRecord(r))
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function addEvent(event) {
    events.value.push(event)
  }

  return {
    events,
    currentEvent,
    territoryEvents,
    italyEvents,
    totalEvents,
    userTerritory,
  addEvent,
    loadFromPocketBase,
    loading,
    loaded,
    error,
  }
})
