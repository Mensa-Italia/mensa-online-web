<script setup>
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})

const hasActions = computed(() => {
  const instance = getCurrentInstance()
  return !!(instance && instance.slots && instance.slots.actions)
})
</script>

<template>
  <header class="page-header" :class="{ compact }">
    <div class="titles">
      <h1 class="page-title gradient-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="hasActions" class="header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.9rem 1.2rem;
  padding: 0 0 0.4rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.page-header.compact { padding-bottom: 0.25rem; }
.titles { display:flex; flex-direction:column; gap:0.25rem; }
.page-title { margin:0; font-size:1.55rem; letter-spacing:0.6px; font-weight:600; }
.page-subtitle { margin:0; font-size:0.72rem; letter-spacing:0.5px; opacity:0.78; }
.header-actions { margin-left:auto; display:flex; align-items:center; gap:0.6rem; }
.header-actions :deep(.stat-chip){ margin:0; }
@media (max-width:720px){
  .page-title { font-size:1.35rem; }
}
</style>
