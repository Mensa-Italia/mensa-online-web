<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  items: { type: Array, required: true }, // [{ key, label, icon?, disabled? }]
  dense: { type: Boolean, default: false },
  stretch: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const current = ref(props.modelValue)
watch(() => props.modelValue, v => { current.value = v })

function select(key) {
  if (key === current.value) return
  current.value = key
  emit('update:modelValue', key)
  emit('change', key)
}

// Keyboard navigation (← → Home End)
function onKey(e) {
  const enabled = props.items.filter(i => !i.disabled)
  const currentIndex = enabled.findIndex(i => i.key === current.value)
  if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
    e.preventDefault()
    let nextKey = current.value
    if (e.key === 'ArrowRight') nextKey = enabled[(currentIndex + 1) % enabled.length].key
    else if (e.key === 'ArrowLeft') nextKey = enabled[(currentIndex - 1 + enabled.length) % enabled.length].key
    else if (e.key === 'Home') nextKey = enabled[0].key
    else if (e.key === 'End') nextKey = enabled[enabled.length - 1].key
    select(nextKey)
  }
}

onMounted(() => {
  if (!current.value && props.items.length) current.value = props.items[0].key
})
</script>

<template>
  <nav class="subnav" :class="{ dense, stretch }" aria-label="Section navigation">
    <ul class="subnav-list" role="tablist">
      <li v-for="(item,i) in items" :key="item.key" class="subnav-item">
        <button
          class="subnav-btn"
          :class="{ active: item.key === current, disabled: item.disabled }"
          type="button"
          role="tab"
          :aria-selected="item.key === current"
          :tabindex="item.key === current ? 0 : -1"
          :disabled="item.disabled"
          @click="select(item.key)"
          @keydown="onKey"
          :data-key="item.key"
        >
          <component v-if="item.icon" :is="item.icon" class="icon" size="14" />
          <span class="label">{{ item.label }}</span>
        </button>
      </li>
    </ul>
    <div class="subnav-actions"><slot name="actions" /></div>
  </nav>
</template>

<style scoped>
.subnav { position:relative; display:flex; align-items:stretch; gap:0.75rem; padding:0 0 0.15rem; }
.subnav.stretch .subnav-list { flex:1; }
.subnav-list { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:0.3rem; position:relative; }
.subnav-item { display:flex; }
.subnav-btn { --btn-bg:rgba(255,255,255,0.04); position:relative; border:none; background:var(--btn-bg); color:rgba(255,255,255,0.68); font-size:0.62rem; letter-spacing:0.55px; font-weight:600; text-transform:uppercase; padding:0.55rem 0.9rem; border-radius:0.7rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.45rem; backdrop-filter:blur(6px) saturate(160%); transition:background .18s, color .18s, box-shadow .18s; }
.subnav-btn .icon { opacity:0.8; }
.subnav-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
.subnav-btn.active { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; box-shadow:0 4px 14px -6px rgba(37,99,235,0.55); }
.subnav-btn.active .icon { opacity:1; }
.subnav-btn:focus-visible { outline:2px solid rgba(96,165,250,0.8); outline-offset:2px; }
.subnav-btn.disabled { opacity:0.45; cursor:not-allowed; }
.dense .subnav-btn { padding:0.45rem 0.75rem; font-size:0.6rem; }
.subnav-actions { margin-left:auto; display:flex; align-items:center; gap:.5rem; }
@media (max-width:680px){
  .subnav-btn { font-size:0.58rem; padding:0.5rem 0.7rem; }
  .dense .subnav-btn { padding:0.4rem 0.65rem; }
}
</style>
