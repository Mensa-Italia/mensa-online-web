<script setup>
import PageHeader from '@/components/PageHeader.vue'
import { onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { PackageCheck, Loader2, ExternalLink } from 'lucide-vue-next'

const ordersStore = useOrdersStore()
onMounted(() => ordersStore.loadMock())

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

const statusLabels = {
  pending: 'Pending',
  inprocess: 'In Process',
  partial: 'Partially Fulfilled',
  fulfilled: 'Fulfilled',
  shipped: 'Shipped',
}

// In the new UX we no longer show inline receipt details; button links to external provider receipt
</script>

<template>
  <div class="orders-root">
    <PageHeader title="Orders" subtitle="Track the status of your boutique purchases">
      <template #actions>
        <RouterLink to="/boutique" class="back-boutique">← Boutique</RouterLink>
      </template>
    </PageHeader>
    <div v-if="ordersStore.loading" class="loading"><Loader2 class="spin ic" /> Loading orders...</div>
    <div v-else>
      <div v-if="ordersStore.orderedByNewest.length === 0" class="empty">No orders yet.</div>
      <div v-else class="order-list">
  <div v-for="o in ordersStore.orderedByNewest" :key="o.id" class="order-card">
          <header class="order-head">
            <div class="left">
              <PackageCheck class="ic" />
              <div class="meta">
                <h3 class="order-id">Order {{ o.id }}</h3>
                <div class="created">Placed: {{ formatDate(o.created) }}</div>
              </div>
            </div>
            <div class="summary">
              <span class="total">€ {{ o.total.toFixed(2) }}</span>
              <span class="status-chip" :class="o.currentStatus">{{ statusLabels[o.currentStatus] || o.currentStatus }}</span>
              <a v-if="o.receiptUrl" class="receipt-link" :href="o.receiptUrl" target="_blank" rel="noopener noreferrer">
                <ExternalLink class="chevron" /> Receipt
              </a>
              <span v-else class="receipt-link disabled" title="Receipt not available yet">Receipt pending</span>
            </div>
          </header>
          <div class="progress-wrap">
            <div class="progress-bar">
              <div class="fill" :style="{ width: ordersStore.progressPercent(o) + '%' }" />
            </div>
            <div class="steps">
              <div v-for="step in ordersStore.stepOrder" :key="step" class="step" :class="{ done: (ordersStore.stepOrder.indexOf(step) <= ordersStore.stepOrder.indexOf(o.currentStatus)) }">
                <span class="dot" />
                <span class="label">{{ statusLabels[step] || step }}</span>
              </div>
            </div>
          </div>
          <!-- Inline receipt removed per new design -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-root { display:flex; flex-direction:column; gap:1rem; }
.back-boutique { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); color:#fff; text-decoration:none; padding:.55rem .85rem; border-radius:10px; font-size:.6rem; font-weight:600; letter-spacing:.45px; display:inline-flex; align-items:center; }
.back-boutique:hover { background:rgba(255,255,255,.15); }
.loading, .empty { padding:1rem; text-align:center; font-size:.75rem; opacity:.75; }
.order-list { display:flex; flex-direction:column; gap:1.1rem; }
.order-card { background:linear-gradient(150deg,rgba(255,255,255,.07),rgba(255,255,255,.035)); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; }
.order-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.85rem 1rem .75rem; border-bottom:1px solid rgba(255,255,255,.08); }
.left { display:flex; gap:.75rem; align-items:center; }
.meta { display:flex; flex-direction:column; gap:.25rem; }
.order-id { margin:0; font-size:.85rem; letter-spacing:.4px; font-weight:600; }
.created { font-size:.6rem; opacity:.7; }
.summary { display:flex; flex-direction:column; align-items:flex-end; gap:.35rem; }
.total { font-size:.82rem; font-weight:700; letter-spacing:.4px; }
.status-chip { font-size:.55rem; padding:.35rem .6rem; border-radius:999px; background:rgba(30,41,59,.7); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,.15); text-transform:uppercase; font-weight:600; letter-spacing:.55px; }
.status-chip.delivered { background:#16a34a; border-color:#15803d; }
.receipt-link { display:inline-flex; align-items:center; gap:.35rem; background:rgba(255,255,255,.08); color:#fff; border:1px solid rgba(255,255,255,.18); border-radius:8px; padding:.35rem .6rem; font-size:.55rem; font-weight:600; letter-spacing:.55px; text-decoration:none; text-transform:uppercase; }
.receipt-link:hover { background:rgba(255,255,255,.15); }
.receipt-link.disabled { cursor:default; opacity:.5; pointer-events:none; }
.receipt-link .chevron { width:14px; height:14px; }
.progress-wrap { display:flex; flex-direction:column; gap:.6rem; padding:.85rem 1rem .9rem; }
.progress-bar { height:6px; border-radius:4px; background:rgba(255,255,255,.15); overflow:hidden; position:relative; }
.progress-bar .fill { position:absolute; inset:0; width:0; background:linear-gradient(90deg,#2563eb,#1d4ed8); transition:width .5s cubic-bezier(.4,0,.2,1); }
.steps { display:flex; justify-content:space-between; gap:.4rem; flex-wrap:wrap; }
.step { display:flex; flex-direction:column; align-items:center; gap:.25rem; min-width:72px; }
.dot { width:16px; height:16px; border-radius:50%; background:rgba(255,255,255,.2); border:2px solid rgba(255,255,255,.5); box-shadow:0 2px 6px -2px rgba(0,0,0,.5); }
.step.done .dot { background:#2563eb; border-color:#1d4ed8; }
.label { font-size:.5rem; text-transform:uppercase; letter-spacing:.55px; opacity:.7; text-align:center; }
.items { padding:0 1rem 1rem; }
.items-table { width:100%; border-collapse:collapse; font-size:.6rem; }
.items-table th { text-align:left; font-weight:600; font-size:.55rem; opacity:.7; padding:.4rem .45rem; }
.items-table td { padding:.45rem .45rem; border-top:1px solid rgba(255,255,255,.08); }
.items-table tbody tr:hover { background:rgba(255,255,255,.05); }
.cell-name { font-weight:500; }
.variant { font-size:.55rem; opacity:.65; margin-left:.4rem; background:rgba(255,255,255,.15); padding:.15rem .4rem; border-radius:5px; }
.qty, .price, .line { text-align:right; }
.foot-label { text-align:right; font-weight:600; }
.total-row { font-size:.65rem; }
.ic { width:20px; height:20px; }
.spin { animation:spin 1s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
/* (Inline receipt removed; animation definitions deleted) */
@media (max-width:640px){
  .order-head { flex-direction:column; align-items:stretch; }
  .summary { flex-direction:row; justify-content:space-between; width:100%; }
  .steps { justify-content:flex-start; }
  .step { min-width:60px; }
}
</style>
