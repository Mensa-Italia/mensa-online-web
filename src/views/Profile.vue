<script setup>
import { ref, computed, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import SubNav from '@/components/SubNav.vue'
import { useAuthStore } from '@/stores/auth'
import { pb } from '@/api/api'

const auth = useAuthStore()

// Build initial form state from user record
const form = ref({
  name: '',
  email: '',
  username: '',
  avatar: null, // file object on change
})

const original = ref({})
const avatarPreview = ref('')
const saving = ref(false)
const success = ref(false)
const localError = ref('')

function initFromUser() {
  if (!auth.user) return
  form.value.name = auth.user.name || ''
  form.value.email = auth.user.email || ''
  form.value.username = auth.user.username || ''
  form.value.avatar = null
  original.value = { name: form.value.name, email: form.value.email, username: form.value.username }
  avatarPreview.value = auth.user.avatar ? pb.files.getURL(auth.user, auth.user.avatar) : ''
  success.value = false
  localError.value = ''
}

watch(() => auth.user, initFromUser, { immediate: true })

const dirty = computed(() => {
  return (
    original.value.name !== form.value.name ||
    original.value.email !== form.value.email ||
    original.value.username !== form.value.username ||
    !!form.value.avatar
  )
})

function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    localError.value = 'File must be an image.'
    return
  }
  form.value.avatar = file
  const reader = new FileReader()
  reader.onload = () => { avatarPreview.value = reader.result }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  form.value.avatar = null
  avatarPreview.value = auth.user?.avatar ? pb.files.getURL(auth.user, auth.user.avatar) : ''
}

async function save() {
  if (!dirty.value || saving.value) return
  saving.value = true
  localError.value = ''
  success.value = false
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      username: form.value.username,
    }
    if (form.value.avatar) payload.avatar = form.value.avatar
    await auth.updateProfile(payload)
    initFromUser()
    success.value = true
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Could not save profile'
  } finally {
    saving.value = false
  }
}

function reset() {
  initFromUser()
}

// Sub navigation config (could be reused across pages)
const activeSection = ref('profile')
const sections = [
  { key: 'profile', label: 'Profile' },
  { key: 'payments', label: 'Payment Methods' },
  { key: 'receipts', label: 'Your Receipt' },
  { key: 'devices', label: 'Devices' },
]
</script>

<template>
  <div class="profile-page-root">
    <PageHeader title="Profile" subtitle="Manage your account preferences" />

    <SubNav v-model="activeSection" :items="sections" />

    <!-- PROFILE SECTION -->
  <div v-if="activeSection === 'profile'" class="profile-wrapper">
      <div class="panel">
        <div class="panel-header">
          <h2 class="title">Profile</h2>
          <p class="subtitle">Manage your personal information.</p>
        </div>
        <form class="form" @submit.prevent="save">
        <div class="avatar-row">
          <div class="avatar-stack">
            <div class="avatar-frame" :class="{ placeholder: !avatarPreview }">
              <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar preview" />
              <span v-else class="placeholder-text">No Avatar</span>
            </div>
            <div class="avatar-actions">
              <label class="btn btn-xs btn-outline-light file-btn">
                <input type="file" accept="image/*" @change="onAvatarChange" />
                <span>Change</span>
              </label>
              <button type="button" class="btn btn-xs btn-outline-light" @click="removeAvatar" :disabled="saving">Reset</button>
            </div>
          </div>
          <div class="avatar-hint small">PNG/JPG, recommended square, &lt; 2MB.</div>
        </div>

        <div class="fields-grid">
          <div class="field">
            <label>Name</label>
            <input v-model.trim="form.name" type="text" autocomplete="name" disabled />
          </div>
          <div class="field">
            <label>Username</label>
            <input v-model.trim="form.username" type="text" autocomplete="username" />
          </div>
          <div class="field span-2">
            <label>Email</label>
            <input v-model.trim="form.email" type="email" autocomplete="email" disabled />
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">User ID</span>
            <span class="meta-value monospace">{{ auth.user?.id }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Created</span>
            <span class="meta-value">{{ auth.user?.created }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Updated</span>
            <span class="meta-value">{{ auth.user?.updated }}</span>
          </div>
        </div>

        <div v-if="localError" class="alert error">{{ localError }}</div>
        <div v-if="success" class="alert success">Profile updated.</div>

        <div class="actions">
          <button type="button" class="btn btn-outline-light" @click="reset" :disabled="saving || !dirty">Cancel</button>
          <button type="submit" class="btn btn-accent" :disabled="saving || !dirty">
            <span v-if="!saving">Save Changes</span>
            <span v-else>Saving...</span>
          </button>
        </div>
        </form>
      </div>
    </div>

    <!-- PAYMENT METHODS SECTION -->
  <div v-else-if="activeSection === 'payments'" class="placeholder-section">
      <div class="panel">
        <div class="panel-header"><h2 class="title">Payment Methods</h2><p class="subtitle">Add or manage your saved payment options.</p></div>
        <div class="coming-soon">Payment methods management will appear here.</div>
      </div>
    </div>

    <!-- RECEIPTS SECTION -->
  <div v-else-if="activeSection === 'receipts'" class="placeholder-section">
      <div class="panel">
        <div class="panel-header"><h2 class="title">Your Receipt</h2><p class="subtitle">Download or review your membership receipts.</p></div>
        <div class="coming-soon">Receipts history will appear here.</div>
      </div>
    </div>

    <!-- DEVICES SECTION -->
  <div v-else-if="activeSection === 'devices'" class="placeholder-section">
      <div class="panel">
        <div class="panel-header"><h2 class="title">Devices</h2><p class="subtitle">Manage devices authorized to access your account.</p></div>
        <div class="coming-soon">Connected devices & session controls will appear here.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page-root { display:flex; flex-direction:column; gap:0.85rem; }

.profile-wrapper { max-width: 880px; margin: 0 auto; width:100%; display:flex; flex-direction:column; gap:1.5rem; }
.panel { background:rgba(15,23,42,0.82); border:1px solid rgba(255,255,255,0.07); border-radius:1.2rem; padding:1.75rem 1.6rem 2.1rem; box-shadow:0 2px 18px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04); backdrop-filter:blur(14px) saturate(150%); }
.panel-header { margin-bottom:1.4rem; }
.title { margin:0 0 .35rem; font-size:1.3rem; font-weight:600; letter-spacing:.5px; }
.subtitle { margin:0; opacity:.7; font-size:.82rem; }

.form { display:flex; flex-direction:column; gap:1.6rem; }
.avatar-row { display:flex; flex-direction:column; gap:.65rem; }
.avatar-stack { display:flex; gap:1rem; align-items:flex-start; flex-wrap:wrap; }
.avatar-frame { width:96px; height:96px; border-radius:50%; overflow:hidden; position:relative; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.08); }
.avatar-frame img { width:100%; height:100%; object-fit:cover; }
.avatar-frame.placeholder { background:linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); }
.placeholder-text { font-size:.65rem; letter-spacing:.5px; opacity:.55; text-transform:uppercase; }
.avatar-actions { display:flex; flex-direction:column; gap:.5rem; }
.avatar-actions .btn { width:100%; }
.avatar-hint { opacity:.55; font-size:.6rem; letter-spacing:.5px; text-transform:uppercase; }

.fields-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem 1.2rem; }
.field { display:flex; flex-direction:column; gap:.45rem; }
.field.span-2 { grid-column: span 2; }
@media (max-width:640px){ .field.span-2 { grid-column: span 1; } }
.field label { font-size:.62rem; text-transform:uppercase; letter-spacing:.5px; font-weight:600; opacity:.7; }
.field input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:#f1f5f9; border-radius:.65rem; padding:.55rem .7rem; font-size:.82rem; outline:none; transition:border-color .15s, background .15s; }
.field input:focus { border-color:var(--accent,#60a5fa); background:rgba(255,255,255,0.08); }
.field input[disabled] { opacity:.5; cursor:not-allowed; }

.meta-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:.75rem 1rem; margin-top:-.3rem; }
.meta-item { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); padding:.6rem .75rem .65rem; border-radius:.75rem; display:flex; flex-direction:column; gap:.3rem; }
.meta-label { font-size:.55rem; letter-spacing:.55px; text-transform:uppercase; opacity:.55; font-weight:600; }
.meta-value { font-size:.7rem; font-weight:500; word-break:break-all; }
.meta-value.monospace { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace; font-size:.63rem; }

.actions { display:flex; gap:.9rem; justify-content:flex-end; }
@media (max-width:640px){ .actions { flex-direction:column-reverse; } .actions .btn { width:100%; } }

.alert { padding:.65rem .75rem; border-radius:.6rem; font-size:.7rem; line-height:1.2; font-weight:500; }
.alert.error { background:rgba(220,38,38,0.1); color:#fca5a5; border:1px solid rgba(220,38,38,0.4); }
.alert.success { background:rgba(34,197,94,0.1); color:#86efac; border:1px solid rgba(34,197,94,0.4); }

/* Buttons (light outline + accent) */
.btn { font-size:.65rem; letter-spacing:.5px; font-weight:600; text-transform:uppercase; border-radius:.7rem; border:1px solid transparent; padding:.55rem .95rem; cursor:pointer; background:rgba(255,255,255,0.06); color:#f1f5f9; backdrop-filter:blur(4px) saturate(140%); transition:background .15s,border-color .15s,color .15s; }
.btn:hover { background:rgba(255,255,255,0.1); }
.btn:disabled { opacity:.5; cursor:not-allowed; }
.btn-outline-light { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.22); }
.btn-outline-light:hover { background:rgba(255,255,255,0.08); }
.btn-accent { background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; box-shadow:0 4px 14px -4px rgba(37,99,235,0.5); }
.btn-accent:hover { background:linear-gradient(135deg,#1d4ed8,#1e40af); }
.btn-xs { padding:.4rem .7rem; font-size:.55rem; }
.file-btn input { display:none; }

/* Smooth success fade */
.alert.success { animation:fadeSlide .6s ease; }
@keyframes fadeSlide { 0% { opacity:0; transform:translateY(-4px);} 100% { opacity:1; transform:translateY(0);} }

/* Placeholder sections */
.placeholder-section .coming-soon { font-size:.75rem; opacity:.75; padding:.5rem 0; }
</style>
