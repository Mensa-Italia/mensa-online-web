<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import PageHeader from '@/components/PageHeader.vue'
</script>

<template>
  <div class="boutique-root">
  <PageHeader title="Boutique" subtitle="Merchandise & branded apparel" />
    <div class="glass-panel boutique-panel">
      <p class="lead-text">Merchandise & branded apparel coming soon.</p>
      <ul class="list-reset feature-list">
        <li>T‑shirts (design variants)</li>
        <li>Hoodies</li>
        <li>Accessories & pins</li>
        <li>Limited edition drops</li>
      </ul>
      <router-link to="/" class="btn btn-sm btn-outline-light">Back to Dashboard</router-link>
    </div>
  </div>
</template>

<style scoped>
.boutique-root {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.boutique-panel {
  padding: 1.35rem 1.2rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.lead-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
.feature-list {
  font-size: 0.7rem;
  opacity: 0.8;
}
.feature-list li {
  padding: 0.25rem 0;
}
@media (max-width: 720px) {
}
</style>
