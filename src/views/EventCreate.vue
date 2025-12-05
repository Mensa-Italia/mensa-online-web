<template>
  <div class="event-create-page">
    <PageHeader title="Create Event" subtitle="Add a new event to the calendar" />
    <div class="form-wrapper panel">
      <form @submit.prevent="submit" novalidate class="ec-form">
        <!-- Cover Image (upload or generate) -->
        <div class="section">
          <div class="section-head">
            <h2 class="section-title mb-0">Cover Image <span class="req">*</span></h2>
            <div class="section-actions">
              <label class="btn btn-xs btn-soft mb-0" aria-label="Upload cover image">
                <input type="file" accept="image/*" class="d-none" @change="onFileChange" />Upload
              </label>
              <button type="button" class="btn btn-xs btn-accent" @click="openGenerator" aria-haspopup="dialog">Generate</button>
              <button v-if="coverUrl" type="button" class="btn btn-xs btn-outline-danger" @click="clearCover" aria-label="Remove cover image">Remove</button>
            </div>
          </div>
          <div class="cover-block single center">
            <div
              class="cover-preview"
              :class="{ placeholder: !coverUrl, droppable: true, 'drag-over': isDragOver, 'invalid-cover': triedSubmit && coverError }"
              @dragover.prevent="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              role="button"
              tabindex="0"
              aria-label="Event cover image drop area"
            >
              <img v-if="coverUrl" :src="coverUrl" alt="Event cover" />
              <div v-else class="ph-text">Drop image or use Upload / Generate</div>
              <div v-if="isDragOver" class="drop-indicator">Release to use this image</div>
            </div>
            <div v-if="triedSubmit && coverError" class="invalid-feedback d-block small mt-1">{{ coverError }}</div>
          </div>
        </div>
        <div class="section">
          <h2 class="section-title">Basic Info</h2>
          <div class="row g-3 align-items-start">
            <div class="col-12 col-md-6">
              <label for="ev-name" class="form-label form-label-sm">Name <span class="req">*</span></label>
              <input id="ev-name" v-model.trim="name" type="text" class="form-control form-control-sm" :class="{ 'is-invalid': triedSubmit && nameError }" />
              <div v-if="triedSubmit && nameError" class="invalid-feedback d-block small">{{ nameError }}</div>
            </div>
            <div class="col-12 col-md-6">
              <label for="ev-info" class="form-label form-label-sm">Info Link</label>
              <input id="ev-info" v-model.trim="infoLink" type="url" placeholder="https://" class="form-control form-control-sm" />
              <div class="form-text tiny">Optional external page</div>
            </div>
            <div class="col-12">
              <label for="ev-desc" class="form-label form-label-sm">Description</label>
              <textarea id="ev-desc" v-model="description" rows="4" class="form-control form-control-sm" />
            </div>
          </div>
        </div>

        <!-- Type first -->
        <div class="section">
          <h2 class="section-title">Type</h2>
          <div class="type-row switches">
            <div class="switch-item">
              <input type="checkbox" id="ev-national" class="switch-input" v-model="isNational" />
              <label for="ev-national" class="switch-label">
                <span class="switch-ui" aria-hidden="true"></span>
                <span class="switch-text">Is national?</span>
              </label>
            </div>
            <div class="switch-item">
              <input type="checkbox" id="ev-online" class="switch-input" v-model="isOnline" />
              <label for="ev-online" class="switch-label">
                <span class="switch-ui" aria-hidden="true"></span>
                <span class="switch-text">Is online?</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Timing & Position -->
        <div class="section">
          <h2 class="section-title">Timing & Location</h2>
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-3">
              <label for="ev-start" class="form-label form-label-sm">Start</label>
              <input id="ev-start" v-model="whenStart" type="datetime-local" class="form-control form-control-sm" />
            </div>
            <div class="col-12 col-md-3">
              <label for="ev-end" class="form-label form-label-sm">End</label>
              <input id="ev-end" v-model="whenEnd" type="datetime-local" class="form-control form-control-sm" :class="{ 'is-invalid': triedSubmit && timeError }" />
              <div v-if="triedSubmit && timeError" class="invalid-feedback d-block small">{{ timeError }}</div>
            </div>
            <div class="col-12 col-md-6" v-if="!isOnline">
              <label for="ev-position" class="form-label form-label-sm">Position <span class="req">*</span></label>
              <div class="d-flex flex-column gap-2">
                <div
                  class="fake-select form-control form-control-sm"
                  :class="{ 'is-invalid': triedSubmit && positionError }"
                  role="button"
                  tabindex="0"
                  aria-haspopup="dialog"
                  aria-label="Select a position"
                  @click="openPositionsDrawer"
                  @keyup.enter="openPositionsDrawer"
                >
                  <span v-if="currentPositionName">{{ currentPositionName }}</span>
                  <span v-else class="placeholder">Select a position</span>
                </div>
                <div v-if="triedSubmit && positionError" class="invalid-feedback d-block small">{{ positionError }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <div class="section">
          <h2 class="section-title">Schedule</h2>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <button type="button" class="dash-btn accent small" @click="addSchedule">Add Item</button>
          </div>
          <div v-if="schedule.length === 0" class="empty small">No schedule items.</div>
          <div v-for="(item,i) in schedule" :key="item.id" class="sched-item">
            <div class="row g-2 align-items-start">
              <div class="col-12 col-md-3">
                <input v-model="item.name" placeholder="Title" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-3">
                <input v-model="item.infoLink" placeholder="Link" class="form-control form-control-sm" />
              </div>
              <div class="col-6 col-md-2">
                <input v-model="item.whenStart" type="datetime-local" class="form-control form-control-sm" />
              </div>
              <div class="col-6 col-md-2">
                <input v-model="item.whenEnd" type="datetime-local" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-2 d-flex gap-2">
                <button class="btn btn-sm btn-soft flex-grow-1" type="button" @click="toggleDetails(item)">{{ item._open ? 'Hide' : 'Details' }}</button>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="removeSchedule(i)" aria-label="Remove schedule item">X</button>
              </div>
              <div v-if="item._open" class="col-12 mt-1">
                <textarea v-model="item.description" rows="2" placeholder="Description" class="form-control form-control-sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2 pt-2">
          <button type="submit" class="dash-btn accent" :disabled="submitting || hasBlockingErrors">{{ submitting ? 'Saving…' : 'Create Event' }}</button>
          <button type="button" class="dash-btn ghost" @click="resetForm" :disabled="submitting">Reset</button>
          <div v-if="triedSubmit && hasBlockingErrors" class="text-danger small align-self-center ms-2">Fix errors above.</div>
        </div>
        <div v-if="error" class="alert-error" role="alert">{{ error }}</div>
        <div v-if="success" class="alert-success" role="status">Event created.</div>
      </form>
    </div>
  <!-- Cover Generator Dialog -->
    <teleport to="body">
      <transition name="fade-fast">
        <div v-if="showGenerator" class="modal-overlay" role="presentation">
          <div class="modal-backdrop" @click="closeGenerator" />
          <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="cg-title">
            <header class="modal-header">
              <h2 id="cg-title" class="modal-title">Generate Cover Image</h2>
              <button type="button" class="modal-close" aria-label="Close generator" @click="closeGenerator">×</button>
            </header>
            <div class="modal-body">
              <EventCoverGenerator v-model="generatedCover" :auto-title="name" @update:modelValue="applyGenerated" />
            </div>
            <footer class="modal-footer">
              <button type="button" class="btn btn-sm btn-soft" @click="closeGenerator">Close</button>
              <button
                v-if="generatedCover && generatedCover.url"
                type="button"
                class="btn btn-sm btn-accent"
                @click="confirmGenerated"
              >Use Image</button>
            </footer>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Positions Drawer (styled like Phonebook drawer) -->
    <teleport to="body">
      <transition name="drawer">
        <div v-if="showPositionsDrawer">
          <div class="drawer-overlay" @click="closePositionsDrawer" />
          <aside class="member-drawer position-drawer" aria-label="Positions" role="dialog" aria-modal="true">
            <header class="drawer-header">
              <button class="close-btn" type="button" aria-label="Close" @click="closePositionsDrawer">×</button>
              <div class="drawer-id-block">
                <div class="drawer-title">
                  <h2 class="name mb-0">Positions</h2>
                  <p class="muted small mb-0" style="margin-top:.15rem;">
                    {{ positionsStore.positions.length }} saved
                  </p>
                </div>
              </div>
            </header>
            <div class="drawer-content">
              <section class="section-block actions-block">
                <div class="actions-row">
                  <button type="button" class="mini-btn" @click="refreshPositions" :disabled="positionsStore.loading">Refresh</button>
                  <button type="button" class="mini-btn" @click="openAddPosition">Add New</button>
                </div>
              </section>
              <section class="section-block">
                <h3 class="section-title">Select</h3>
                <p v-if="positionsStore.error" class="error-row" role="alert">{{ positionsStore.error }}</p>
                <p v-else-if="positionsStore.loading" class="loading-row">Loading positions…</p>
                <p v-else-if="!positionsStore.positions.length" class="small dim mb-0">No saved positions yet.</p>
                <ul v-else class="positions-list list-reset">
                  <li
                    v-for="p in positionsStore.positions"
                    :key="p.id"
                    class="position-row interactive"
                    :class="{ active: p.id === positionId }"
                    role="button"
                    tabindex="0"
                    @click="selectPosition(p)"
                    @keyup.enter="selectPosition(p)"
                  >
                    <div class="identity compact">
                      <strong class="name">{{ p.name }}</strong>
                      <div class="secondary-line">
                        <span class="addr" v-if="p.address">{{ p.address }}</span>
                        <span v-if="p.address" class="sep">•</span>
                        <span class="coords">{{ p.lat.toFixed(4) }}, {{ p.lng.toFixed(4) }}</span>
                      </div>
                    </div>
                    <div class="chevron" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </div>
                  </li>
                </ul>
              </section>
              <section class="section-block" v-if="positionId">
                <h3 class="section-title">Selected</h3>
                <p class="small mb-0">Current: <strong>{{ currentPositionName }}</strong></p>
              </section>
            </div>
          </aside>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { usePositionsStore } from '@/stores/positions'
import { CreateEventFull } from '@/api/api'
import { useEventsStore } from '@/stores/events'
import EventCoverGenerator from '@/components/EventCoverGenerator.vue'
import { useEventDraftStore } from '@/stores/eventDraft'

const eventsStore = useEventsStore()
const router = useRouter()
const positionsStore = usePositionsStore()
const draft = useEventDraftStore()

const name = ref('')
const description = ref('')
const infoLink = ref('')
const isOnline = ref(false)
const isNational = ref(false)
const whenStart = ref('')
const whenEnd = ref('')
const positionId = ref('')
const showPositionsDrawer = ref(false)
// Schedule (must be declared before watcher that references it)
const schedule = ref([])
function addSchedule() { schedule.value.push({ id: crypto.randomUUID(), name:'', description:'', infoLink:'', whenStart: whenStart.value, whenEnd: whenEnd.value, _open:false }) }
function toggleDetails(item){ item._open = !item._open }
function removeSchedule(i){ schedule.value.splice(i,1) }

// Cover handling
const coverUrl = ref('')
const coverBlob = ref(null)
const showGenerator = ref(false)
const generatedCover = ref(null)
const isDragOver = ref(false)
function processFile(f){
  if(!f) return
  if(!f.type.startsWith('image/')) return
  if(coverUrl.value && coverUrl.value.startsWith('blob:')) URL.revokeObjectURL(coverUrl.value)
  const url = URL.createObjectURL(f)
  coverUrl.value = url
  coverBlob.value = f
}
function onFileChange(e){
  const f = e.target.files && e.target.files[0]
  processFile(f)
}
function clearCover(){
  if(coverUrl.value && coverUrl.value.startsWith('blob:')) URL.revokeObjectURL(coverUrl.value)
  coverUrl.value=''; coverBlob.value=null; generatedCover.value=null
}
function onDragOver(){ isDragOver.value = true }
function onDragLeave(){ isDragOver.value = false }
function onDrop(e){
  e.preventDefault()
  isDragOver.value = false
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  processFile(f)
}
function applyGenerated(val){
  // update model but don't auto-close; allow user to confirm via Use Image button
  if(!val) return
  generatedCover.value = val
}
function confirmGenerated(){
  if(!generatedCover.value) return
  if(coverUrl.value && coverUrl.value.startsWith('blob:')) URL.revokeObjectURL(coverUrl.value)
  coverUrl.value = generatedCover.value.url
  coverBlob.value = generatedCover.value.blob
  closeGenerator()
}
let prevScrollY = 0
function lockBodyScroll() {
  prevScrollY = window.scrollY || 0
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${prevScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
}
function unlockBodyScroll() {
  const body = document.body
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  window.scrollTo(0, prevScrollY)
}
function openGenerator(){
  if(showGenerator.value) return
  lockBodyScroll()
  showGenerator.value = true
}
function closeGenerator(){
  if(!showGenerator.value) return
  showGenerator.value = false
  // allow transition end? immediate restore is fine.
  unlockBodyScroll()
}
const currentPositionName = computed(() => positionsStore.positions.find(p => p.id === positionId.value)?.name || '')

function openPositionsDrawer(){
  if(!positionsStore.loaded && !positionsStore.loading) positionsStore.loadFromServer()
  showPositionsDrawer.value = true
  document.addEventListener('keydown', escCloseDrawer)
}
function closePositionsDrawer(){
  showPositionsDrawer.value = false
  document.removeEventListener('keydown', escCloseDrawer)
}
function escCloseDrawer(e){ if(e.key==='Escape') closePositionsDrawer() }
function selectPosition(p){ positionId.value = p.id; closePositionsDrawer() }
function refreshPositions(){ positionsStore.loaded = false; positionsStore.loadFromServer() }
function openAddPosition(){
  // Mark need for refresh when returning
  try { sessionStorage.setItem('reloadPositionsAfterReturn','1') } catch(_) {}
  // Navigate to picker with context
  window.location.href = '/positions/picker?from=event-create'
}
function checkReturnRefresh(){
  try {
    if(sessionStorage.getItem('reloadPositionsAfterReturn') === '1') {
      sessionStorage.removeItem('reloadPositionsAfterReturn')
      refreshPositions()
      showPositionsDrawer.value = true // reopen drawer for continuity
    }
  } catch(_) {}
}
window.addEventListener('focus', checkReturnRefresh)

// Persist to draft store whenever key fields change
watch([name, description, infoLink, isOnline, isNational, whenStart, whenEnd, positionId, coverUrl, coverBlob, schedule], () => {
  draft.setDraft({
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
    coverBlob: coverBlob.value
  })
}, { deep: true })

onMounted(() => {
  // initialize times if empty
  if(!draft.whenStart) draft.whenStart = new Date().toISOString().slice(0,16)
  if(!draft.whenEnd) draft.whenEnd = new Date(Date.now()+2*60*60*1000).toISOString().slice(0,16)
  // hydrate local refs from draft
  name.value = draft.name
  description.value = draft.description
  infoLink.value = draft.infoLink
  isOnline.value = draft.isOnline
  isNational.value = draft.isNational
  whenStart.value = draft.whenStart || new Date().toISOString().slice(0,16)
  whenEnd.value = draft.whenEnd || new Date(Date.now()+2*60*60*1000).toISOString().slice(0,16)
  positionId.value = draft.positionId
  schedule.value = draft.schedule.map(s => ({ ...s }))
  coverUrl.value = draft.coverUrl
  coverBlob.value = draft.coverBlob
  if(!positionsStore.loaded && !positionsStore.loading) positionsStore.loadFromServer()
  checkReturnRefresh()
})


const submitting = ref(false)
const error = ref(null)
const success = ref(false)
const triedSubmit = ref(false)

const nameError = computed(() => !name.value.trim() ? 'Name is required' : '')
const timeError = computed(() => {
  if(!whenStart.value || !whenEnd.value) return ''
  try {
    const s = new Date(whenStart.value).getTime()
    const e = new Date(whenEnd.value).getTime()
    if(e < s) return 'End must be after start'
  } catch(_) { return '' }
  return ''
})
const positionError = computed(() => {
  if(isOnline.value) return ''
  return positionId.value ? '' : 'Position is required for non-online events'
})
const coverError = computed(() => !coverUrl.value ? 'Cover image is required' : '')
const hasBlockingErrors = computed(() => !!nameError.value || !!timeError.value || !!positionError.value || !!coverError.value)

function resetForm(){
  name.value=''; description.value=''; infoLink.value=''; isOnline.value=false; isNational.value=false; positionId.value=''; schedule.value=[]; success.value=false; error.value=null; triedSubmit.value=false
  whenStart.value = new Date().toISOString().slice(0,16)
  whenEnd.value = new Date(Date.now()+2*60*60*1000).toISOString().slice(0,16)
  clearCover()
  draft.clear()
}

async function submit(){
  if(submitting.value) return
  triedSubmit.value = true
  error.value=null; success.value=false
  if(hasBlockingErrors.value){
    error.value = coverError.value || nameError.value || timeError.value || positionError.value || 'Please fix validation errors'
    return
  }
  submitting.value=true
  try {
    const record = await CreateEventFull({
      name: name.value,
      description: description.value,
      infoLink: infoLink.value,
      whenStart: new Date(whenStart.value),
      whenEnd: new Date(whenEnd.value),
      isOnline: isOnline.value,
      isNational: isNational.value,
      isSpot: false,
      positionId: positionId.value || undefined,
      imageFile: coverBlob.value || null,
      schedules: schedule.value.map(s => ({
        name: s.name,
        description: s.description,
        infoLink: s.infoLink,
        whenStart: s.whenStart ? new Date(s.whenStart) : null,
        whenEnd: s.whenEnd ? new Date(s.whenEnd) : null,
        maxExternalGuests: s.maxExternalGuests,
        price: s.price,
        isSubscriptable: s.isSubscriptable
      }))
    })
    // Optimistic add to local store using existing mapper logic expectations
    eventsStore.addEvent({
      id: record.id,
      name: record.name,
      description: record.description,
      infoLink: record.info_link,
      whenStart: new Date(record.when_start),
      whenEnd: new Date(record.when_end),
      isNational: record.is_national,
      isSpot: false,
      position: null,
      image: coverUrl.value || '',
    })
    // Redirect to events list after creation
    success.value = true
    // Small delay to ensure store update renders if user navigates back quickly
    setTimeout(() => {
      router.push({ name: 'Events' })
    }, 50)
  } catch(e){
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    submitting.value=false
  }
}

// Cleanup focus listener when component unmounts
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(()=> window.removeEventListener('focus', checkReturnRefresh))
</script>

<style scoped>
.event-create-page { display:flex; flex-direction:column; gap:1.2rem; }
.form-wrapper { padding:1.15rem 1.1rem 1.3rem; background:rgba(15,23,42,0.82); border:1px solid rgba(96,165,250,0.35); border-radius:1rem; backdrop-filter:blur(14px) saturate(150%); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 6px 26px -10px rgba(29,78,216,0.55); }
.ec-form { display:flex; flex-direction:column; gap:1.8rem; }
.section { display:flex; flex-direction:column; gap:.9rem; }
.section-title { font-size:.72rem; letter-spacing:.5px; font-weight:600; text-transform:uppercase; margin:0; opacity:.8; }
.section-head { display:flex; align-items:center; justify-content:space-between; gap:.9rem; flex-wrap:wrap; }
.section-actions { display:flex; align-items:center; gap:.45rem; }
.btn-xs { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; font-weight:500; font-size:.55rem; padding:.42rem .7rem; border-radius:.55rem; letter-spacing:.4px; }
.btn-xs.btn-accent { background:var(--gradient-accent); border:1px solid rgba(255,255,255,0.2); font-weight:600; }
.btn-xs.btn-accent:hover { filter:brightness(1.08); }
.btn-xs.btn-outline-danger { background:rgba(185,28,28,0.18); border:1px solid rgba(248,113,113,0.45); color:#fecaca; }
.btn-xs.btn-outline-danger:hover { background:rgba(185,28,28,0.3); }
.cover-hint { opacity:.55; margin-top:.45rem; }
.cover-block.single { max-width:520px; }
.cover-block.single.center { margin-left:auto; margin-right:auto; align-items:center; }
.cover-block.single.center .cover-preview { margin-left:auto; margin-right:auto; }
.req { color:#f87171; }
.small-flags .form-check-label { font-size:.63rem; letter-spacing:.4px; }
.type-row { display:flex; gap:1.2rem; flex-wrap:wrap; background:rgba(255,255,255,0.04); padding:.75rem .9rem; border:1px solid rgba(255,255,255,0.12); border-radius:.75rem; }
.switch-item { position:relative; display:flex; align-items:center; }
.switch-input { position:absolute; opacity:0; pointer-events:none; }
.switch-label { display:flex; align-items:center; gap:.55rem; cursor:pointer; font-size:.62rem; letter-spacing:.4px; font-weight:500; }
.switch-ui { width:34px; height:18px; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.28); border-radius:24px; position:relative; transition:.28s background, .28s border-color; box-shadow:inset 0 0 0 1px rgba(0,0,0,0.25); }
.switch-ui:after { content:""; position:absolute; top:50%; left:3px; width:12px; height:12px; background:#fff; border-radius:50%; transform:translateY(-50%); transition:.28s left, .28s background, .28s box-shadow; box-shadow:0 2px 4px -1px rgba(0,0,0,0.45); }
.switch-input:focus-visible + .switch-label .switch-ui { outline:2px solid rgba(59,130,246,0.9); outline-offset:2px; }
.switch-input:checked + .switch-label .switch-ui { background:linear-gradient(90deg,#2563eb,#3b82f6); border-color:rgba(255,255,255,0.45); }
.switch-input:checked + .switch-label .switch-ui:after { left:19px; }
.switch-text { position:relative; top:1px; }
.sched-item { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:.75rem; padding:.65rem .7rem .75rem; margin-bottom:.6rem; }
.sched-item:last-child { margin-bottom:0; }
.empty { background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.15); padding:.55rem .7rem; border-radius:.6rem; }
/* Accent/Soft buttons (reuse pattern) */
.btn-accent { background:var(--gradient-accent); border:1px solid rgba(255,255,255,0.18); color:#fff; font-weight:600; letter-spacing:.4px; font-size:.62rem; padding:.5rem .85rem; border-radius:.65rem; }
.btn-accent:hover { filter:brightness(1.08); }
.btn-soft { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; font-weight:500; font-size:.6rem; padding:.5rem .85rem; border-radius:.65rem; }
.btn-soft:hover { background:rgba(255,255,255,0.16); }
.btn-outline-danger { background:rgba(185,28,28,0.18); border:1px solid rgba(248,113,113,0.45); color:#fecaca; font-size:.6rem; padding:.5rem .6rem; border-radius:.55rem; }
.btn-outline-danger:hover { background:rgba(185,28,28,0.3); }
.alert-error { margin-top:1rem; background:rgba(185,28,28,0.18); border:1px solid rgba(248,113,113,0.45); padding:.55rem .7rem; border-radius:.6rem; font-size:.62rem; color:#fecaca; }
.alert-success { margin-top:1rem; background:rgba(22,163,74,0.2); border:1px solid rgba(74,222,128,0.45); padding:.55rem .7rem; border-radius:.6rem; font-size:.62rem; color:#bbf7d0; }
.form-text.tiny { font-size:.5rem; opacity:.55; margin-top:.2rem; }
.cover-block { display:flex; flex-direction:column; gap:1rem; }
.cover-block .cover-actions { display:flex; flex-wrap:wrap; gap:.5rem; }
.cover-preview { width:100%; max-width:420px; aspect-ratio:1200/630; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.15); border-radius:.85rem; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:.55rem; box-sizing:border-box; }
.cover-preview img { width:100%; height:100%; object-fit:cover; border-radius:.45rem; box-shadow:0 0 0 1px rgba(255,255,255,0.08), 0 4px 14px -6px rgba(0,0,0,0.55); }
.cover-preview.placeholder .ph-text { font-size:.6rem; opacity:.6; letter-spacing:.5px; }
.cover-preview.droppable { cursor:pointer; transition: border-color .25s, background .25s; }
.cover-preview.drag-over { border-color:#60a5fa; background:rgba(59,130,246,0.15); box-shadow:0 0 0 2px rgba(96,165,250,0.35), 0 4px 16px -6px rgba(59,130,246,0.55); }
.cover-preview.invalid-cover { border-color:#f87171; box-shadow:0 0 0 2px rgba(248,113,113,0.4), 0 4px 16px -6px rgba(185,28,28,0.55); }
.drop-indicator { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(17,24,39,0.55); backdrop-filter:blur(2px); font-size:.65rem; font-weight:600; letter-spacing:.5px; color:#e0f2fe; text-align:center; padding:.75rem; }
.cover-gen-wrapper { border:1px solid rgba(255,255,255,0.12); border-radius:.85rem; padding:.75rem .8rem; background:rgba(255,255,255,0.03); }
.fade-scale-enter-active, .fade-scale-leave-active { transition:.3s opacity, .3s transform; transform-origin:top left; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity:0; transform:scale(.95); }
/* Modal styles */
.modal-overlay { position:fixed; inset:0; z-index:260; display:flex; align-items:flex-start; justify-content:center; padding:4.5vh 1rem 2rem; }
.modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:0; backdrop-filter:blur(12px) saturate(150%); }
/* Slight translucency for depth but not enough to darken contents excessively */
.modal-panel { position:relative; width:100%; max-width:1100px; z-index:10; background:linear-gradient(155deg, rgba(10,16,28,0.93), rgba(15,23,42,0.97) 60%, rgba(4,7,12,0.98)); border:1px solid rgba(255,255,255,0.12); border-radius:22px; box-shadow:0 22px 50px -16px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(59,130,246,0.22); display:flex; flex-direction:column; max-height:90vh; overflow:hidden; }
.modal-panel:before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 70% 18%, rgba(96,165,250,0.12), transparent 62%), radial-gradient(circle at 18% 78%, rgba(52,211,153,0.10), transparent 68%); mix-blend-mode:overlay; opacity:.3; }
.modal-panel, .modal-panel * { filter:none !important; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.15rem .75rem; border-bottom:1px solid rgba(255,255,255,0.08); }
.modal-title { margin:0; font-size:0.9rem; letter-spacing:.5px; font-weight:600; }
.modal-close { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; cursor:pointer; color:#fff; }
.modal-close:hover { background:rgba(255,255,255,0.18); }
.modal-body { padding:.9rem 1.1rem 1rem; overflow-y:auto; flex:1; }
.modal-body::-webkit-scrollbar { width:10px; }
.modal-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:6px; }
.modal-footer { padding:.7rem 1.1rem 1rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:flex-end; gap:.6rem; background:linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.75)); }
.fade-fast-enter-from, .fade-fast-leave-to { opacity:0; }
.fade-fast-enter-active, .fade-fast-leave-active { transition:opacity .28s ease; }

/* Positions Drawer (Phonebook style clone) */
.drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.46); backdrop-filter:blur(2px); z-index:260; }
.member-drawer.position-drawer { position:fixed; top:0; right:0; height:100%; width:390px; max-width:92%; background:rgba(19,26,38,0.9); backdrop-filter:blur(18px); border-left:1px solid rgba(255,255,255,0.1); box-shadow:-2px 0 18px -4px rgba(0,0,0,0.55); display:flex; flex-direction:column; z-index:270; will-change:transform,opacity; }
.drawer-header { display:flex; flex-direction:column; gap:1rem; padding:1.05rem 1.2rem 0.75rem; border-bottom:1px solid rgba(255,255,255,0.09); }
.drawer-id-block { display:flex; align-items:center; gap:1rem; }
.drawer-title .name { font-size:1.08rem; margin:0 0 0.3rem; letter-spacing:0.4px; }
.drawer-title .muted { margin:0; opacity:0.6; font-size:0.62rem; }
.drawer-content { padding:0.95rem 1.2rem 1.6rem; overflow-y:auto; scrollbar-width:thin; font-size:0.7rem; line-height:1.45; }
.drawer-content::-webkit-scrollbar { width:7px; }
.drawer-content::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
.close-btn { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1); color:#e2e8f0; width:30px; height:30px; border-radius:8px; font-size:1.05rem; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer; margin-left:auto; }
.close-btn:hover { background:rgba(255,255,255,0.15); }
.section-block { margin-bottom:1.25rem; display:flex; flex-direction:column; gap:0.55rem; }
.section-title { font-size:0.62rem; text-transform:uppercase; letter-spacing:1px; opacity:0.55; margin:0; font-weight:600; }
.mini-btn { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:#e2e8f0; font-size:0.55rem; line-height:1; padding:0.35rem 0.55rem; border-radius:6px; font-weight:500; letter-spacing:.5px; display:inline-flex; align-items:center; gap:.35rem; cursor:pointer; }
.mini-btn:hover:not(:disabled){ background:rgba(255,255,255,0.14); }
.mini-btn:disabled { opacity:.5; cursor:default; }
.actions-row { display:flex; gap:0.5rem; flex-wrap:wrap; }
.positions-list { display:flex; flex-direction:column; gap:0.55rem; margin:0; padding:0; }
.position-row { display:grid; grid-template-columns:1fr 18px; gap:0.65rem 0.85rem; padding:0.65rem 0.75rem; border-radius:14px; background:rgba(255,255,255,0.04); backdrop-filter:blur(10px); align-items:center; transition:background .18s, box-shadow .18s, border-color .18s; border:1px solid rgba(255,255,255,0.04); }
.position-row.interactive { cursor:pointer; }
.position-row:hover { background:rgba(255,255,255,0.07); box-shadow:0 4px 10px -4px rgba(0,0,0,0.45); }
.position-row.active { border-color:rgba(96,165,250,0.55); box-shadow:0 0 0 1px rgba(96,165,250,0.35), 0 4px 12px -6px rgba(29,78,216,0.55); }
.position-row .name { font-size:0.82rem; font-weight:600; letter-spacing:0.4px; line-height:1.15; }
.position-row .secondary-line { font-size:0.58rem; opacity:0.75; display:flex; flex-wrap:wrap; align-items:center; gap:0.35rem; }
.position-row .secondary-line .coords { opacity:0.65; }
.chevron { width:18px; height:18px; display:flex; align-items:center; opacity:0.4; transition:opacity .18s, transform .25s; }
.position-row:hover .chevron { opacity:0.8; transform:translateX(2px); }
@media (max-width:640px){ .position-row { grid-template-columns:1fr 18px; } }
/* Animations */
.drawer-enter-from { transform:translateX(64px); opacity:0; }
.drawer-leave-to { transform:translateX(64px); opacity:0; }
.drawer-enter-active, .drawer-leave-active { transition:transform 0.42s cubic-bezier(.4,0,.25,1), opacity 0.34s; }
/* Fake select (opens positions drawer) */
.fake-select { position:relative; cursor:pointer; display:flex; align-items:center; gap:.4rem; }
.fake-select:after { content:""; position:absolute; right:0.6rem; top:50%; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid rgba(255,255,255,0.7); transform:translateY(-50%); pointer-events:none; }
.fake-select .placeholder { opacity:.55; }
.fake-select:focus-visible { outline:2px solid rgba(96,165,250,.8); outline-offset:2px; }

/* Dash button styles (mirrored from dashboard for consistency) */
.dash-btn { --btn-bg:linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)); --btn-border:rgba(255,255,255,0.22); --btn-color:var(--color-text-primary,#fff); position:relative; appearance:none; border:1px solid var(--btn-border); background:var(--btn-bg); color:var(--btn-color); font-size:.6rem; font-weight:600; letter-spacing:.6px; text-transform:uppercase; padding:.45rem .85rem .4rem; border-radius:10px; display:inline-flex; align-items:center; gap:.45rem; line-height:1; cursor:pointer; backdrop-filter:blur(6px) saturate(140%); transition:.22s background,.22s border-color,.22s box-shadow,.22s transform; }
.dash-btn:hover { border-color:rgba(255,255,255,0.4); background:linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06)); box-shadow:0 4px 10px -4px rgba(0,0,0,0.5); }
.dash-btn:active { transform:translateY(1px); }
.dash-btn:focus-visible { outline:2px solid #60a5fa; outline-offset:2px; }
.dash-btn.ghost { --btn-bg:rgba(255,255,255,0.05); --btn-border:rgba(255,255,255,0.18); font-weight:500; }
.dash-btn.ghost:hover { --btn-bg:rgba(255,255,255,0.1); }
.dash-btn.accent { --btn-bg:linear-gradient(135deg,#3b82f6,#2563eb 45%, #0ea5e9); --btn-border:rgba(255,255,255,0.25); box-shadow:0 4px 14px -4px rgba(37,99,235,0.55); }
.dash-btn.accent:hover { filter:brightness(1.07); box-shadow:0 5px 18px -4px rgba(37,99,235,0.65); }
.dash-btn.accent.subtle { --btn-bg:linear-gradient(135deg,#6366f1,#3b82f6 55%,#0ea5e9); }
.dash-btn.outline { --btn-bg:rgba(255,255,255,0.04); --btn-border:rgba(255,255,255,0.35); color:#e0f2fe; }
.dash-btn.outline:hover { background:rgba(255,255,255,0.09); }
.dash-btn.outline:active { background:rgba(255,255,255,0.14); }
.dash-btn[disabled], .dash-btn.disabled { opacity:.55; cursor:not-allowed; filter:grayscale(.2); }
.dash-btn.small { font-size:.55rem; padding:.4rem .7rem .35rem; }
</style>
