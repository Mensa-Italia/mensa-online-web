<script setup>
import { computed, onMounted } from 'vue'
import { useBoutiqueStore } from '@/stores/boutique'
import BoutiqueProductCard from './BoutiqueProductCard.vue'

const store = useBoutiqueStore()
onMounted(() => store.loadMock())
const items = computed(() => store.filteredProducts)
</script>

<template>
  <div class="bp-list">
    <BoutiqueProductCard
      v-for="p in items"
      :key="p.id"
      :product="p"
      layout="row"
    />
    <div v-if="!store.loading && items.length === 0" class="empty">No products match.</div>
  </div>
</template>

<style scoped>
.bp-list { display:flex; flex-direction:column; gap:.95rem; padding:0 .15rem; }
.empty { text-align:center; opacity:.6; font-size:.7rem; padding:1rem 0; }
</style>
