<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import PageHeader from '@/components/PageHeader.vue'
import BoutiqueProductFilters from '@/components/boutique/BoutiqueProductFilters.vue'
import BoutiqueProductList from '@/components/boutique/BoutiqueProductList.vue'
import BoutiqueCartDrawer from '@/components/boutique/BoutiqueCartDrawer.vue'
import BoutiqueCheckoutPanel from '@/components/boutique/BoutiqueCheckoutPanel.vue'
import BoutiqueProductDetail from '@/components/boutique/BoutiqueProductDetail.vue'
import { useBoutiqueStore } from '@/stores/boutique'
import { ShoppingCart, Filter, PackageSearch } from 'lucide-vue-next'

const store = useBoutiqueStore()

function openCart() { store.openCart() }
import { ref } from 'vue'
const showMobileFilters = ref(false)
function openFilters() { showMobileFilters.value = true }
function closeFilters() { showMobileFilters.value = false }
</script>

<template>
  <div class="boutique-root">
    <PageHeader title="Boutique" subtitle="Merchandise & branded apparel">
      <template #actions>
        <RouterLink to="/orders" class="orders-h-action" aria-label="View orders">
          <PackageSearch class="ic" />
          <span class="label">Orders</span>
        </RouterLink>
        <button class="cart-h-action" @click="openCart" aria-label="Open cart">
          <ShoppingCart class="ic" />
          <span class="badge" v-if="store.cartCount">{{ store.cartCount }}</span>
        </button>
      </template>
    </PageHeader>
    <div class="filters-bar desktop-only">
      <BoutiqueProductFilters :show-categories="true" :show-search="true" />
      <div class="bar-actions"></div>
    </div>
    <div class="mobile-filter-trigger mobile-only">
      <div class="mf-row">
        <div class="mf-search-inline">
          <BoutiqueProductFilters :show-categories="false" :show-search="true" />
        </div>
        <button class="mf-btn" @click="openFilters" aria-label="Open category filters"><Filter class="ic" /></button>
        <button class="mf-cart" @click="openCart" aria-label="Open cart">
          <ShoppingCart class="ic" />
          <span class="badge" v-if="store.cartCount">{{ store.cartCount }}</span>
        </button>
      </div>
    </div>
    <div class="boutique-inner">
      <BoutiqueProductList />
    </div>
    <!-- Bottom sheet filters (mobile) -->
    <div v-if="showMobileFilters" class="filters-sheet" role="dialog" aria-modal="true">
      <div class="sheet-backdrop" @click="closeFilters" />
      <div class="sheet-panel">
        <header class="sheet-header">
          <h3 class="sheet-title">Filters</h3>
          <button class="close-btn" @click="closeFilters" aria-label="Close filters">×</button>
        </header>
        <div class="sheet-body">
          <BoutiqueProductFilters :show-categories="true" :show-search="false" />
        </div>
        <footer class="sheet-footer">
          <button class="apply-btn" @click="closeFilters">Done</button>
        </footer>
      </div>
    </div>
    <BoutiqueCartDrawer />
    <BoutiqueCheckoutPanel />
    <BoutiqueProductDetail />
  </div>
</template>

<style scoped>
.boutique-root { display:flex; flex-direction:column; gap:1rem; }
.boutique-inner { display:flex; flex-direction:column; gap:1.2rem; max-width:940px; width:100%; margin:0 auto; padding:0 .25rem 1.2rem; }
/* Single column layout */
.filters-bar { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:.4rem; padding:0 0 .15rem; border-bottom:1px solid rgba(255,255,255,.06); }
.filters-bar > *:first-child { flex:1; }
.bar-actions { display:flex; align-items:center; gap:.6rem; }
.mobile-filter-trigger { display:none; }
@media (max-width:760px){
  .desktop-only { display:none; }
  .mobile-only { display:flex; }
  .mobile-filter-trigger { position:sticky; top:0; z-index:30; display:flex; padding:.5rem .5rem .65rem; background:rgba(15,23,42,.9); backdrop-filter:blur(10px) saturate(150%); border-bottom:1px solid rgba(255,255,255,.06); }
  .mobile-filter-trigger .mf-row { display:flex; width:100%; gap:.55rem; align-items:stretch; }
  .mobile-filter-trigger .mf-search-inline { flex:1; display:flex; }
  .mobile-filter-trigger .mf-search-inline :deep(.filters) { padding:.35rem .6rem .4rem; background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.04)); border:1px solid rgba(255,255,255,.12); border-radius:14px; width:100%; }
  .mobile-filter-trigger .mf-search-inline :deep(.toolbar) { gap:.4rem; justify-content:stretch; }
  .mobile-filter-trigger .mf-search-inline :deep(.search-wrap) { max-width:none; flex:1; }
  .mobile-filter-trigger .mf-search-inline :deep(.search) { font-size:.66rem; }
}
.filters-bar > :first-child { flex:1; }
.cart-top { position:relative; background:#2563eb; border:1px solid #1d4ed8; color:#fff; padding:.7rem .8rem; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 24px -10px rgba(37,99,235,.55); }
.cart-top .icon { width:20px; height:20px; }
.badge { position:absolute; top:-6px; right:-6px; background:#ef4444; color:#fff; font-size:.55rem; font-weight:600; line-height:1; padding:.28rem .45rem; border-radius:999px; min-width:20px; display:flex; align-items:center; justify-content:center; }
.orders-h-action, .cart-h-action { position:relative; display:inline-flex; align-items:center; gap:.4rem; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); color:#fff; padding:.55rem .8rem; border-radius:10px; font-size:.6rem; font-weight:600; letter-spacing:.45px; cursor:pointer; text-decoration:none; }
.orders-h-action:hover, .cart-h-action:hover { background:rgba(255,255,255,.14); }
.orders-h-action .ic, .cart-h-action .ic { width:18px; height:18px; }
.cart-h-action { padding:.55rem .75rem; }
/* Mobile trigger buttons */
.mf-btn, .mf-cart { position:relative; display:flex; align-items:center; justify-content:center; gap:.2rem; background:linear-gradient(135deg,#1e293b,#0f172a); color:#fff; border:1px solid rgba(255,255,255,.15); border-radius:14px; padding:.6rem .65rem; font-size:.62rem; font-weight:600; letter-spacing:.5px; cursor:pointer; min-width:46px; }
.mf-btn:hover, .mf-cart:hover { background:linear-gradient(135deg,#2563eb,#1d4ed8); border-color:#2563eb; }
.mf-btn { flex:0 0 auto; }
.mf-cart { flex:0 0 auto; }
.mf-btn .ic, .mf-cart .ic { width:18px; height:18px; }
.mf-cart .badge { top:2px; right:4px; }
@media (max-width:760px){
  .filters-bar { flex-direction:column; align-items:stretch; }
  .cart-top { align-self:flex-end; }
}
@media (max-width: 720px) {
}

/* Bottom sheet styles */
.filters-sheet { position:fixed; inset:0; z-index:220; display:flex; flex-direction:column; }
.sheet-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(3px); }
.sheet-panel { margin-top:auto; background:linear-gradient(160deg,rgba(30,41,59,.96),rgba(15,23,42,.94)); border-top-left-radius:24px; border-top-right-radius:24px; box-shadow:0 -4px 18px -6px rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.08); border-bottom:none; animation:sheet-in .4s cubic-bezier(.4,0,.2,1); max-height:85%; width:100%; display:flex; flex-direction:column; }
.sheet-header { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.1rem .75rem; }
.sheet-title { margin:0; font-size:.85rem; font-weight:600; letter-spacing:.4px; }
.close-btn { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; cursor:pointer; color:#fff; }
.close-btn:hover { background:rgba(255,255,255,.18); }
.sheet-body { padding:0 .9rem 1rem; overflow-y:auto; }
.sheet-body :deep(.filters) { background:none; box-shadow:none; border:none; padding:.4rem 0 0; }
.sheet-footer { padding:.7rem 1.1rem 1.15rem; border-top:1px solid rgba(255,255,255,.08); display:flex; justify-content:flex-end; }
.apply-btn { background:#2563eb; border:1px solid #1d4ed8; color:#fff; padding:.65rem 1.1rem; border-radius:12px; font-size:.62rem; font-weight:600; letter-spacing:.5px; cursor:pointer; box-shadow:0 6px 20px -10px rgba(37,99,235,.55); }
.apply-btn:hover { background:#1d4ed8; }
@keyframes sheet-in { from { transform:translateY(100%); } to { transform:translateY(0); } }
</style>
