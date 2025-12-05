<script setup>
import PageHeader from '@/components/PageHeader.vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useOfficesStore } from '@/stores/offices'
import { useAuthStore } from '@/stores/auth'
import { GetLocalOfficeAdmins, AddLocalOfficeCoOfficer, RemoveLocalOfficeAdmin, pb } from '@/api/api'

// Placeholder: integration with backend (e.g., relation table local_office_officers) to be added.
// This initial version uses a temporary local array to allow adding/removing emails.

const route = useRoute()
const router = useRouter()
const code = computed(() => route.params.code)
const offices = useOfficesStore()
const auth = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const error = ref(null)
// coOfficers items: { id: adminRecordId, userId, email, name, isOfficer, avatar }
const coOfficers = ref([])
const newUserId = ref('')

onMounted(async () => {
  await offices.ensureLoaded()
  const office = offices.getByCode(code.value)
  if (!office) {
    router.replace({ name: 'LocalOffices' })
    return
  }
  await loadAdmins()
})

async function loadAdmins() {
  if (loading.value) return
  loading.value = true
  error.value = null
  try {
    const office = offices.getByCode(code.value)
    const list = await GetLocalOfficeAdmins(office?.id || office?.code || code.value)
    coOfficers.value = list.map(r => {
      const user = r.expand?.user
      let avatar = ''
      if (user?.avatar) {
        try { avatar = pb.files.getURL(user, user.avatar) } catch(_) {}
      } else if (user?.image) {
        try { avatar = pb.files.getURL(user, user.image) } catch(_) {}
      }
      return {
        id: r.id,
        userId: r.user,
        email: user?.email || user?.mail || 'unknown',
        name: user?.name || user?.full_name || user?.id || '—',
        isOfficer: !!r.is_the_officer,
        avatar
      }
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const office = computed(() => offices.getByCode(code.value))

async function addUserId() {
  const id = newUserId.value.trim()
  if (!id) return
  if (coOfficers.value.some(o => o.userId === id)) return
  saving.value = true
  error.value = null
  try {
    const office = offices.getByCode(code.value)
    await AddLocalOfficeCoOfficer(office?.id || office?.code || code.value, id)
    newUserId.value = ''
    // Reload full list to get expanded user data (email, name, avatar)
    await loadAdmins()
  } catch (e) {
    // Per requirement: generic message that user not present (never logged in)
    error.value = 'The user never logged in into Mensa Online'
    // Optionally log actual error for debugging
    console.warn('Add co-officer failed', e)
  } finally {
    saving.value = false
  }
}
async function removeEmail(item) {
  if (item.isOfficer) return // prevent removing main officer here
  saving.value = true
  error.value = null
  try {
    await RemoveLocalOfficeAdmin(item.id)
    coOfficers.value = coOfficers.value.filter(o => o.id !== item.id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}
async function save() { /* no-op retained for UI consistency; individual ops persist immediately */ }

</script>

<template>
  <div v-if="office" class="coofficers-page">
    <PageHeader :title="office.name + ' – Co-Officers'" subtitle="Manage collaborators who can administer this office" />

    <div class="panel editor">
      <h3 class="head">Current Officers & Co-Officers</h3>
      <p class="hint">Add or remove collaborators who can administer this office. Primary officer cannot be removed here.</p>

      <div v-if="loading" class="empty">Loading...</div>
      <div v-else-if="!coOfficers.length" class="empty">No co-officers yet.</div>
      <ul v-else class="list">
        <li v-for="item in coOfficers" :key="item.id" class="coofficer-row" :class="{ officer:item.isOfficer }">
          <div class="avatar-wrapper">
            <div class="avatar" :class="{ placeholder: !item.avatar }">
              <img v-if="item.avatar" :src="item.avatar" :alt="item.name + ' avatar'" loading="lazy" />
              <span v-else>{{ item.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="identity">
            <p class="name" :title="item.name">{{ item.name }}</p>
          </div>
          <div class="role-col">
            <span v-if="item.isOfficer" class="badge primary">Officer</span>
          </div>
          <div class="actions-col">
            <button
              v-if="!item.isOfficer"
              class="btn-remove"
              type="button"
              @click="removeEmail(item)"
              :disabled="saving"
            >Remove</button>
          </div>
        </li>
      </ul>

      <form class="add-form" @submit.prevent="addUserId">
        <input
          v-model="newUserId"
          type="text"
          placeholder="Numero tessera"
          class="input"
          :disabled="saving"
        />
        <button type="submit" class="btn-add" :disabled="!newUserId || saving">Add</button>
      </form>

      <div class="actions">
        <button class="btn-cancel" type="button" @click="router.push({ name: 'LocalOfficeDetail', params: { code: office.code } })" :disabled="saving">Back</button>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
.coofficers-page { display:flex; flex-direction:column; gap:1.4rem; }
.panel.editor { background:rgba(15,23,42,0.82); border:1px solid rgba(96,165,250,0.35); border-radius:1rem; padding:1rem 1rem 1.2rem; backdrop-filter:blur(14px) saturate(150%); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 6px 26px -10px rgba(29,78,216,0.65); display:flex; flex-direction:column; gap:.9rem; }
.head { margin:0; font-size:.9rem; font-weight:600; letter-spacing:.5px; }
.hint { margin:0; font-size:.6rem; line-height:1.35; opacity:.7; }
.empty { font-size:.6rem; opacity:.65; padding:.4rem .2rem .2rem; }
.list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; }
.coofficer-row { display:grid; grid-template-columns:auto 1fr auto auto; gap:.85rem .9rem; padding:.6rem .75rem; border-radius:14px; background:rgba(255,255,255,0.04); backdrop-filter:blur(10px); align-items:center; border:1px solid rgba(255,255,255,0.08); transition:background .18s,border-color .18s, box-shadow .18s; }
.coofficer-row:hover { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.18); box-shadow:0 4px 10px -4px rgba(0,0,0,0.45); }
.coofficer-row.officer { border:1px solid rgba(96,165,250,0.45); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 4px 14px -6px rgba(29,78,216,0.55); }
.avatar-wrapper { position:relative; width:40px; height:40px; }
.avatar { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:600; letter-spacing:.5px; background:linear-gradient(135deg,#334155,#1e293b); color:#e2e8f0; border:1px solid rgba(255,255,255,0.12); overflow:hidden; }
.avatar img { width:100%; height:100%; object-fit:cover; display:block; }
.avatar.placeholder { background:linear-gradient(135deg, rgba(59,130,246,0.55), rgba(59,130,246,0.2)); color:#dbeafe; }
.identity { display:flex; flex-direction:column; gap:.1rem; min-width:120px; }
.name { margin:0; font-size:.8rem; font-weight:600; letter-spacing:.35px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#f1f5f9; }
.role-col { display:flex; align-items:center; }
.badge.primary { background:rgba(59,130,246,0.15); color:#93c5fd; font-size:.53rem; padding:.3rem .5rem .32rem; border:1px solid rgba(59,130,246,0.5); border-radius:8px; letter-spacing:.55px; font-weight:600; }
.actions-col { display:flex; align-items:center; }
.btn-remove { background:rgba(239,68,68,0.15); color:#fca5a5; border:1px solid rgba(239,68,68,0.35); font-size:.55rem; padding:.38rem .65rem .4rem; border-radius:.55rem; cursor:pointer; letter-spacing:.4px; font-weight:600; }
.btn-remove:hover { background:rgba(239,68,68,0.25); }
.add-form { display:flex; gap:.6rem; }
.input { flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:.55rem; color:#fff; font-size:.6rem; padding:.5rem .6rem .45rem; outline:none; }
.input:focus { border-color:rgba(96,165,250,0.6); }
.btn-add { background:rgba(59,130,246,0.2); border:1px solid rgba(59,130,246,0.5); color:#93c5fd; font-size:.6rem; padding:.48rem .75rem .5rem; border-radius:.55rem; cursor:pointer; }
.btn-add:hover { background:rgba(59,130,246,0.3); }
.actions { display:flex; gap:.6rem; }
.btn-save { background:#1d4ed8; border:1px solid #2563eb; color:#fff; font-size:.6rem; padding:.55rem .9rem .6rem; border-radius:.6rem; cursor:pointer; }
.btn-save:disabled { opacity:.5; cursor:default; }
.btn-cancel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:.6rem; padding:.55rem .9rem .6rem; border-radius:.6rem; cursor:pointer; }
.error { font-size:.55rem; color:#f87171; }
</style>
