<template>
  <div class="positions-root">
    <PageHeader title="Le Mie Posizioni" subtitle="Luoghi salvati per creare eventi più velocemente">
      <template #actions>
        <router-link v-if="fromEvent" :to="{ name: 'EventCreate' }" class="back-btn" aria-label="Torna alla creazione evento">
          ← Torna Evento
        </router-link>
        <div class="stat-chip" v-if="!positionsStore.loading">Totali <strong>{{ positionsStore.positions.length }}</strong></div>
        <div class="stat-chip" v-else>Loading…</div>
        <router-link :to="{ name: 'PositionPicker' }" class="action-btn">
          <MapPin class="ic" /> Nuova Posizione
        </router-link>
      </template>
    </PageHeader>

    <section class="panel glass-panel positions-panel">
      <header class="panel-header d-flex justify-content-between align-items-center">
        <span>Posizioni Salvate</span>
        <button v-if="!positionsStore.loading && !positionsStore.error && positionsStore.loaded" class="mini-refresh" @click="reload" :title="'Ricarica'" aria-label="Ricarica">
          ↻
        </button>
      </header>
      <p v-if="positionsStore.error" class="small text-danger m-0" role="alert">{{ positionsStore.error }}</p>
      <p v-else-if="positionsStore.loading" class="small dim m-0">Caricamento posizioni…</p>
      <p v-else-if="!positionsStore.positions.length" class="small dim m-0">Nessuna posizione salvata.</p>
      <ul v-else class="list-reset pos-list">
        <li v-for="p in positionsStore.positions" :key="p.id" class="pos-row">
          <div class="main">
            <strong class="name">{{ p.name }}</strong>
            <p v-if="p.address" class="address" :title="p.address">{{ p.address }}</p>
            <p v-else class="address muted">(nessun indirizzo)</p>
          </div>
          <div class="coords">
            <code>{{ p.lat.toFixed(5) }}, {{ p.lng.toFixed(5) }}</code>
          </div>
          <div class="actions">
            <button class="icon-btn danger" @click="remove(p.id)" :aria-label="'Elimina ' + p.name">
              <Trash2 class="ic" />
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePositionsStore } from '@/stores/positions'
import PageHeader from '@/components/PageHeader.vue'
import { Trash2, MapPin } from 'lucide-vue-next'
const positionsStore = usePositionsStore()
const route = useRoute()
const fromEvent = computed(() => route.query.from === 'event-create')
onMounted(()=> positionsStore.loadFromServer())
async function remove(id){
  if(!confirm('Rimuovere posizione?')) return
  try { await positionsStore.removePosition(id) } catch(_) {}
}
function reload(){ positionsStore.loaded = false; positionsStore.loadFromServer() }
</script>
<style scoped>
.positions-root { display:flex; flex-direction:column; gap:1.4rem; }
.positions-panel { padding: .85rem .95rem .9rem; }
.action-btn { position:relative; display:inline-flex; align-items:center; gap:.45rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:.5rem .75rem; border-radius:10px; font-size:.58rem; font-weight:600; letter-spacing:.45px; text-decoration:none; }
.action-btn:hover { background:rgba(255,255,255,0.14); }
.action-btn .ic { width:15px; height:15px; stroke-width:1.9; }
.back-btn { position:relative; display:inline-flex; align-items:center; gap:.35rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:#fff; padding:.45rem .65rem; border-radius:10px; font-size:.55rem; font-weight:600; letter-spacing:.45px; text-decoration:none; }
.back-btn:hover { background:rgba(255,255,255,0.12); }

.pos-list { margin:0; padding:0; display:flex; flex-direction:column; gap:.45rem; }
.pos-row { display:grid; grid-template-columns: 1fr auto auto; gap:.9rem; padding:.6rem .65rem .55rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:12px; align-items:center; }
.pos-row:hover { border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.065); }
.name { font-size:.74rem; letter-spacing:.4px; font-weight:600; margin:0; }
.address { margin:.05rem 0 0; font-size:.58rem; opacity:.75; line-height:1.15; max-width:420px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.address.muted { opacity:.4; font-style:italic; }
.coords code { font-size:.55rem; background:rgba(255,255,255,0.06); padding:.18rem .4rem .15rem; border-radius:8px; display:inline-block; }
.coords { font-size:.55rem; display:flex; align-items:center; }
.actions { display:flex; align-items:center; gap:.4rem; }
.icon-btn { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; border-radius:10px; cursor:pointer; padding:0; transition:background .18s, border-color .18s; }
.icon-btn:hover { background:rgba(255,255,255,0.14); border-color:rgba(255,255,255,0.25); }
.icon-btn.danger:hover { background:rgba(239,68,68,0.18); border-color:rgba(239,68,68,0.4); }
.icon-btn .ic { width:16px; height:16px; stroke-width:1.8; }
.mini-refresh { background:none; border:none; color:#93c5fd; font-size:.75rem; line-height:1; cursor:pointer; padding:.25rem .4rem; border-radius:8px; }
.mini-refresh:hover { background:rgba(255,255,255,0.1); }
@media (max-width:720px){
  .pos-row { grid-template-columns: 1fr auto; gap:.6rem; }
  .coords { grid-column: 1 / span 1; order:3; }
  .actions { order:2; }
}
</style>
