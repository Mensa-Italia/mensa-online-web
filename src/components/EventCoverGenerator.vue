<script setup>
// Reusable cover generator component
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null }, // { blob, url }
  autoTitle: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

// Remote endpoint
const BASE_URL = 'https://svc.mensa.it/api/cs/generate-event-card'

// Form fields (exposed for generation only; not auto-generating to respect single-fetch design)
const title = ref('')
const line0 = ref('')
const line1 = ref('')
const line2 = ref('')
const line3 = ref('')
const line4 = ref('')

watch(() => props.autoTitle, (v) => { if(v && !title.value) title.value = v.toUpperCase() })

const placeholderUrl = 'https://picsum.photos/1200/630?blur=1&random=55'
const imageUrl = ref(placeholderUrl)
const generating = ref(false)
const error = ref('')
const generatedOnce = ref(false)
let lastBlob = null

function buildUrl() {
  const params = new URLSearchParams()
  params.set('title', title.value)
  params.set('line0', line0.value)
  params.set('line1', line1.value)
  params.set('line2', line2.value)
  params.set('line3', line3.value)
  params.set('line4', line4.value)
  params.set('t', Date.now().toString())
  return `${BASE_URL}?${params.toString()}`
}

async function generate() {
  error.value=''
  generating.value=true
  try {
    const res = await fetch(buildUrl(), { cache:'no-store' })
    if(!res.ok) throw new Error('HTTP '+res.status)
    const blob = await res.blob()
    if(imageUrl.value && imageUrl.value.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value)
    lastBlob = blob
    imageUrl.value = URL.createObjectURL(blob)
    generatedOnce.value = true
    emit('update:modelValue', { blob, url: imageUrl.value })
  } catch(e) {
    error.value = 'Generation failed'
  } finally { generating.value=false }
}

function download() {
  if(!generatedOnce.value || !lastBlob) return
  const a = document.createElement('a')
  a.href = imageUrl.value
  a.download = 'event-cover.png'
  a.click()
}

onUnmounted(() => {
  if(imageUrl.value && imageUrl.value.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value)
})
</script>

<template>
  <div class="cover-gen" :class="{ compact }">
    <div class="cg-grid">
      <div class="cg-form">
        <label class="cg-label">Title</label>
        <input v-model="title" class="cg-input" />
        <label class="cg-label">Line 1</label>
        <input v-model="line0" class="cg-input" />
        <label class="cg-label">Line 2</label>
        <input v-model="line1" class="cg-input" />
        <label class="cg-label">Line 3</label>
        <input v-model="line2" class="cg-input" />
        <label class="cg-label">Line 4</label>
        <input v-model="line3" class="cg-input" />
        <label class="cg-label">Line 5</label>
        <input v-model="line4" class="cg-input" />
        <div class="cg-hint">Edit lines then press Generate. Image updates only on request.</div>
        <div v-if="error" class="cg-error">{{ error }}</div>
        <div class="cg-actions">
          <button type="button" class="btn btn-sm btn-accent" @click="generate" :disabled="generating">{{ generating ? 'Generating…' : (generatedOnce ? 'Regenerate' : 'Generate') }}</button>
          <button type="button" class="btn btn-sm btn-soft" @click="download" :disabled="!generatedOnce">Download</button>
        </div>
      </div>
      <div class="cg-preview">
        <img :src="imageUrl" alt="Cover preview" class="cg-img" />
        <div class="cg-status" v-if="!generatedOnce">Placeholder preview</div>
        <div class="cg-status" v-else>Generated image ready</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cover-gen { display:flex; flex-direction:column; gap:1rem; }
.cg-grid { display:grid; gap:1rem; grid-template-columns:1fr; }
@media (min-width:1040px){ .cg-grid { grid-template-columns: 330px 1fr; } }
.cg-form { display:flex; flex-direction:column; gap:.45rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); padding:.8rem .85rem .9rem; border-radius:.85rem; }
.cg-label { font-size:.55rem; letter-spacing:.5px; text-transform:uppercase; opacity:.75; }
.cg-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.18); color:#fff; font-size:.64rem; padding:.45rem .55rem; border-radius:.55rem; }
.cg-input:focus { outline:none; border-color:#60a5fa; box-shadow:0 0 0 1px #60a5fa66; }
.cg-hint { font-size:.5rem; opacity:.55; margin-top:.15rem; line-height:1.3; }
.cg-error { font-size:.55rem; color:#f87171; }
.cg-actions { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.3rem; }
.cg-preview { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); padding:.65rem .75rem .8rem; border-radius:.85rem; display:flex; flex-direction:column; gap:.5rem; }
.cg-img { width:100%; aspect-ratio:1200/630; object-fit:cover; border-radius:.55rem; border:1px solid rgba(255,255,255,0.15); background:#0f172a; }
.cg-status { font-size:.55rem; opacity:.65; }
.btn-accent { background:var(--gradient-accent); border:1px solid rgba(255,255,255,0.18); color:#fff; font-weight:600; letter-spacing:.4px; font-size:.62rem; padding:.5rem .85rem; border-radius:.65rem; }
.btn-accent:hover { filter:brightness(1.08); }
.btn-soft { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; font-weight:500; font-size:.6rem; padding:.5rem .85rem; border-radius:.65rem; }
.btn-soft:hover { background:rgba(255,255,255,0.16); }
</style>
