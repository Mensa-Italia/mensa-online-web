<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePositionsStore } from '@/stores/positions'

const emit = defineEmits(['close','select'])
const positionsStore = usePositionsStore()

const name = ref('')
const lat = ref(45.46427)
const lng = ref(9.18951)
const address = ref('')
const creating = ref(false)
const formError = ref('')

onMounted(() => {
  if (!positionsStore.loaded && !positionsStore.loading) positionsStore.loadFromServer()
})

const sortedPositions = computed(() => {
  return [...positionsStore.positions].sort((a,b) => a.name.localeCompare(b.name))
})

function resetForm(){ name.value=''; lat.value=45.46427; lng.value=9.18951; address.value=''; formError.value='' }

async function create(){
  if(creating.value) return
  formError.value=''
  if(!name.value.trim()) { formError.value='Nome richiesto'; return }
  creating.value=true
  try {
    const rec = await positionsStore.addPosition({ name: name.value.trim(), lat: +lat.value, lng: +lng.value, address: address.value.trim() })
    // Auto-select new record
    emit('select', rec.id)
    resetForm()
  } catch(e){
    formError.value = e?.message || 'Errore creazione'
  } finally {
    creating.value=false
  }
}

async function remove(id){
  if(!confirm('Rimuovere posizione?')) return
  try { await positionsStore.removePosition(id) } catch(_) {}
}

function select(id){ emit('select', id) }
</script>

<template>
  <div class="pm-root">
    <header class="pm-header">
      <h2 class="pm-title">Gestisci Posizioni</h2>
      <button type="button" class="close-btn" @click="emit('close')" aria-label="Chiudi">×</button>
    </header>
    <div class="pm-body">
      <div class="columns">
        <div class="col list-col">
          <h3 class="col-heading">Salvate</h3>
          <p v-if="positionsStore.loading" class="small dim">Caricamento…</p>
          <p v-else-if="positionsStore.error" class="small text-danger" role="alert">{{ positionsStore.error }}</p>
          <p v-else-if="!sortedPositions.length" class="small dim">Nessuna posizione salvata.</p>
          <ul v-else class="list-reset pos-list">
            <li v-for="p in sortedPositions" :key="p.id" class="pos-row">
              <div class="main">
                <strong class="name">{{ p.name }}</strong>
                <p class="address" :title="p.address">{{ p.address }}</p>
                <code class="coords">{{ p.lat.toFixed(5) }}, {{ p.lng.toFixed(5) }}</code>
              </div>
              <div class="row-actions">
                <button class="mini-btn select" @click="select(p.id)">Seleziona</button>
                <button class="mini-btn danger" @click="remove(p.id)" aria-label="Elimina">✕</button>
              </div>
            </li>
          </ul>
        </div>
        <div class="col form-col">
          <h3 class="col-heading">Nuova</h3>
          <form @submit.prevent="create" class="create-form">
            <div class="row g-2">
              <div class="col-12">
                <label class="form-label form-label-sm">Nome *</label>
                <input v-model="name" class="form-control form-control-sm" required />
              </div>
              <div class="col-6">
                <label class="form-label form-label-sm">Lat</label>
                <input v-model.number="lat" type="number" step="0.000001" class="form-control form-control-sm" />
              </div>
              <div class="col-6">
                <label class="form-label form-label-sm">Lng</label>
                <input v-model.number="lng" type="number" step="0.000001" class="form-control form-control-sm" />
              </div>
              <div class="col-12">
                <label class="form-label form-label-sm">Indirizzo</label>
                <input v-model="address" class="form-control form-control-sm" />
              </div>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button type="submit" class="btn btn-sm btn-accent" :disabled="creating">{{ creating ? 'Salvataggio…' : 'Crea' }}</button>
              <button type="button" class="btn btn-sm btn-soft" @click="resetForm" :disabled="creating">Reset</button>
            </div>
            <p v-if="formError" class="text-danger small mt-2" role="alert">{{ formError }}</p>
          </form>
          <p class="hint small mt-3">Per posizionare su mappa usa il picker completo nella sezione Posizioni (futuro embed).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pm-root { width:100%; max-width:1000px; background:linear-gradient(150deg, rgba(10,16,28,0.95), rgba(15,23,42,0.97)); border:1px solid rgba(255,255,255,0.1); border-radius:22px; box-shadow:0 18px 42px -14px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05) inset; display:flex; flex-direction:column; max-height:90vh; overflow:hidden; }
.pm-header { display:flex; align-items:center; justify-content:space-between; padding:.9rem 1.1rem .7rem; border-bottom:1px solid rgba(255,255,255,0.08); }
.pm-title { margin:0; font-size:.9rem; font-weight:600; letter-spacing:.5px; }
.close-btn { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); color:#fff; width:40px; height:40px; border-radius:12px; cursor:pointer; font-size:1.1rem; line-height:1; display:flex; align-items:center; justify-content:center; }
.close-btn:hover { background:rgba(255,255,255,0.18); }
.pm-body { padding:1rem 1.15rem 1.15rem; overflow-y:auto; flex:1; }
.columns { display:grid; gap:1.2rem; grid-template-columns: 1fr 340px; }
@media (max-width:920px){ .columns { grid-template-columns:1fr; } }
.col-heading { margin:0 0 .6rem; font-size:.65rem; letter-spacing:.55px; font-weight:600; text-transform:uppercase; opacity:.8; }
.pos-list { display:flex; flex-direction:column; gap:.55rem; }
.pos-row { display:flex; gap:.9rem; padding:.55rem .65rem .5rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; align-items:flex-start; }
.pos-row:hover { border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.065); }
.name { font-size:.7rem; letter-spacing:.4px; font-weight:600; }
.address { margin:.05rem 0 .25rem; font-size:.55rem; opacity:.75; line-height:1.1; max-width:480px; }
.coords { display:inline-block; margin:0; font-size:.5rem; opacity:.65; background:rgba(255,255,255,0.06); padding:.15rem .4rem .12rem; border-radius:8px; }
.row-actions { display:flex; gap:.4rem; align-items:center; margin-left:auto; }
.mini-btn { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18); color:#fff; font-size:.5rem; letter-spacing:.4px; padding:.35rem .55rem .32rem; border-radius:8px; cursor:pointer; font-weight:600; }
.mini-btn:hover { background:rgba(255,255,255,0.18); }
.mini-btn.danger { background:rgba(185,28,28,0.25); border-color:rgba(248,113,113,0.45); color:#fecaca; }
.mini-btn.danger:hover { background:rgba(185,28,28,0.38); }
.create-form { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:.8rem .85rem .95rem; }
.hint { opacity:.55; }
</style>