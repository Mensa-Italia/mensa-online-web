<script setup>
import { useBoutiqueStore } from '@/stores/boutique'
import { computed, ref, watch } from 'vue'
import { Filter, Search } from 'lucide-vue-next'

const props = defineProps({
  showCategories: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true }
})

const store = useBoutiqueStore()
const categories = computed(() => store.categories)
const counts = computed(() => store.categoryCounts)
const localSearch = ref(store.search)

watch(localSearch, (v) => store.setSearch(v))

function setCat(c) { store.setCategory(c) }
</script>

<template>
  <div class="filters glass-panel">
    <div class="toolbar" :class="{ 'only-categories': props.showCategories && !props.showSearch, 'only-search': props.showSearch && !props.showCategories }">
      <div class="left" v-if="props.showCategories">
        <Filter class="icon heading" />
        <div class="categories" role="tablist">
          <button
            v-for="c in categories"
            :key="c"
            type="button"
            class="cat-btn"
            :class="{ active: store.category === c }"
            @click="setCat(c)"
          >
            <span class="label">{{ c }}</span>
            <span class="count" v-if="counts[c] !== undefined">{{ counts[c] }}</span>
          </button>
        </div>
      </div>
      <div class="search-wrap" v-if="props.showSearch">
        <Search class="icon search-icon" />
        <input v-model="localSearch" class="search" type="search" placeholder="Search products" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters { padding:.5rem .85rem .5rem; }
.toolbar { display:flex; flex-wrap:wrap; gap:1rem 1.15rem; align-items:center; justify-content:space-between; }
.toolbar.only-categories { justify-content:flex-start; }
.toolbar.only-search { justify-content:flex-end; }
.left { display:flex; gap:.85rem; align-items:center; flex-wrap:wrap; }
.categories { display:flex; flex-wrap:wrap; gap:.4rem; }
.cat-btn { position:relative; background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.06)); border:1px solid rgba(255,255,255,.16); color:#fff; font-size:.6rem; padding:.38rem .65rem; border-radius:6px; cursor:pointer; line-height:1; display:flex; align-items:center; gap:.4rem; font-weight:500; letter-spacing:.25px; }
.cat-btn:hover { background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.08)); }
.cat-btn.active { background:#2563eb; border-color:#2563eb; box-shadow:0 4px 18px -6px rgba(37,99,235,.5); }
.count { background:rgba(0,0,0,.35); padding:.2rem .4rem; border-radius:4px; font-size:.55rem; font-weight:600; }
.icon.heading { width:18px; height:18px; opacity:.65; }
.search-wrap { position:relative; flex:1; min-width:220px; max-width:320px; align-self:center; }
.search-icon { position:absolute; left:.55rem; top:50%; transform:translateY(-50%); width:16px; height:16px; opacity:.55; }
.search { width:100%; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); color:#fff; padding:.46rem .6rem .46rem 2rem; border-radius:8px; font-size:.64rem; letter-spacing:.25px; }
.search:focus { outline:2px solid #2563eb; outline-offset:2px; }
@media (max-width:640px){
  .toolbar { flex-direction:column; align-items:stretch; gap:.65rem; }
  .left { width:100%; }
  .search-wrap { max-width:none; }
}
</style>
