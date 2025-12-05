import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Store transient draft data for EventCreate so user can navigate away (e.g. to Positions) and return without losing progress.
// Not persisted to localStorage (session-only). If persistence across reload is needed later, can add serialization.
export const useEventDraftStore = defineStore('eventDraft', () => {
  const name = ref('')
  const description = ref('')
  const infoLink = ref('')
  const isOnline = ref(false)
  const isNational = ref(false)
  const whenStart = ref('')
  const whenEnd = ref('')
  const positionId = ref('')
  const schedule = ref([]) // array of items
  const coverUrl = ref('')
  const coverBlob = ref(null) // holds File / Blob reference if any (not serializable)

  const hasData = computed(() => {
    return !!(
      name.value || description.value || infoLink.value || positionId.value ||
      schedule.value.length || coverUrl.value
    )
  })

  function setDraft(d){
    if(!d) return
    name.value = d.name ?? name.value
    description.value = d.description ?? description.value
    infoLink.value = d.infoLink ?? infoLink.value
    isOnline.value = !!d.isOnline
    isNational.value = !!d.isNational
    whenStart.value = d.whenStart || whenStart.value
    whenEnd.value = d.whenEnd || whenEnd.value
    positionId.value = d.positionId || ''
    if(Array.isArray(d.schedule)) schedule.value = d.schedule
    coverUrl.value = d.coverUrl || coverUrl.value
    coverBlob.value = d.coverBlob || coverBlob.value
  }

  function toObject(){
    return {
      name: name.value,
      description: description.value,
      infoLink: infoLink.value,
      isOnline: isOnline.value,
      isNational: isNational.value,
      whenStart: whenStart.value,
      whenEnd: whenEnd.value,
      positionId: positionId.value,
      schedule: schedule.value.map(s => ({ ...s })),
      coverUrl: coverUrl.value,
      coverBlob: coverBlob.value,
    }
  }

  function clear(){
    name.value=''; description.value=''; infoLink.value=''; isOnline.value=false; isNational.value=false; whenStart.value=''; whenEnd.value=''; positionId.value=''; schedule.value=[]; coverUrl.value=''; coverBlob.value=null
  }

  return { name, description, infoLink, isOnline, isNational, whenStart, whenEnd, positionId, schedule, coverUrl, coverBlob, hasData, setDraft, toObject, clear }
})
