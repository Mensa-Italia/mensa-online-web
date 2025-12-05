<script setup>
import { useBoutiqueStore } from '@/stores/boutique'
import { X, CreditCard, CheckCircle2 } from 'lucide-vue-next'

const store = useBoutiqueStore()

function close() { store.closeCheckout() }
async function pay() { await store.payWithMockStripe() }
</script>

<template>
  <div class="checkout-overlay" v-if="store.checkoutOpen">
    <div class="checkout-panel glass-panel">
      <button class="close" @click="close"><X class="icon" /></button>
      <h2 class="title">Checkout</h2>
      <div v-if="!store.lastOrder" class="content">
        <div class="summary">
          <div class="item" v-for="l in store.cartDetailed" :key="l.id">
            <div class="line-main">
              <span class="name">{{ l.product.name }}</span>
              <span v-if="l.variantKey" class="variant">({{ l.variantKey }})</span>
              <span class="qty">× {{ l.quantity }}</span>
            </div>
            <div class="price">€ {{ l.lineTotal.toFixed(2) }}</div>
          </div>
        </div>
        <div class="totals">
          <div><span>Subtotal</span><span>€ {{ store.subtotal.toFixed(2) }}</span></div>
          <div><span>Shipping</span><span>€ {{ store.shipping.toFixed(2) }}</span></div>
          <div><span>Tax</span><span>€ {{ store.tax.toFixed(2) }}</span></div>
          <div class="grand"><span>Total</span><span>€ {{ store.total.toFixed(2) }}</span></div>
        </div>
        <div class="pay-box">
          <p class="hint">Mock Stripe payment. No real transaction.</p>
          <button class="btn btn-sm btn-outline-light w-100" :disabled="store.processingPayment || !store.cartDetailed.length" @click="pay">
            <CreditCard class="icon" />
            <span v-if="!store.processingPayment">Pay Now</span>
            <span v-else>Processing…</span>
          </button>
          <p v-if="store.paymentError" class="error">{{ store.paymentError }}</p>
        </div>
      </div>
      <div v-else class="success">
        <CheckCircle2 class="success-icon" />
        <h3 class="thanks">Payment Successful</h3>
        <p class="order-id">Order ID: {{ store.lastOrder.id }}</p>
        <p class="small">A confirmation email would be sent in a real integration.</p>
        <button class="btn btn-sm btn-outline-light" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(6px); display:flex; align-items:flex-start; justify-content:center; z-index:410; padding:3.5rem 1rem 2rem; }
.checkout-panel { position:relative; max-width:560px; width:100%; padding:1.25rem 1.2rem 1.35rem; display:flex; flex-direction:column; gap:1rem; border:1px solid rgba(255,255,255,.12); border-radius:18px; background:linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.04)); box-shadow:0 16px 48px -16px rgba(0,0,0,.55), 0 4px 18px -6px rgba(0,0,0,.45); }
.close { position:absolute; top:.6rem; right:.6rem; background:none; border:none; color:#fff; cursor:pointer; display:flex; width:34px; height:34px; align-items:center; justify-content:center; border-radius:10px; }
.close:hover { background:rgba(255,255,255,.1); }
.title { font-size:1.05rem; margin:0 0 .1rem; font-weight:600; letter-spacing:.3px; }
.summary { display:flex; flex-direction:column; gap:.5rem; font-size:.63rem; max-height:240px; overflow-y:auto; padding-right:.3rem; }
.item { display:flex; justify-content:space-between; gap:.8rem; background:linear-gradient(95deg,rgba(255,255,255,.06),rgba(255,255,255,.03)); padding:.55rem .6rem; border:1px solid rgba(255,255,255,.1); border-radius:10px; }
.line-main { display:flex; gap:.35rem; flex-wrap:wrap; }
.name { font-weight:600; letter-spacing:.25px; }
.variant { opacity:.6; }
.qty { opacity:.75; }
.price { font-weight:600; }
.totals { display:flex; flex-direction:column; gap:.3rem; font-size:.63rem; }
.totals > div { display:flex; justify-content:space-between; }
.grand { font-weight:600; border-top:1px solid rgba(255,255,255,.1); padding-top:.4rem; margin-top:.3rem; font-size:.75rem; letter-spacing:.3px; }
.pay-box { display:flex; flex-direction:column; gap:.6rem; }
.hint { font-size:.55rem; opacity:.72; margin:0; }
.error { font-size:.55rem; color:#f87171; margin:0; }
.success { display:flex; flex-direction:column; align-items:center; text-align:center; gap:.75rem; padding:1rem 0 .5rem; }
.success-icon { width:62px; height:62px; color:#10b981; filter:drop-shadow(0 4px 12px rgba(16,185,129,.4)); }
.thanks { margin:0; font-size:.95rem; font-weight:600; letter-spacing:.4px; }
.order-id { font-size:.65rem; opacity:.75; margin:0; }
.small { font-size:.55rem; opacity:.6; margin:0; }
@media (max-width:640px){ .checkout-overlay { align-items:flex-end; padding:1rem; } .checkout-panel { border-radius:16px; } }
</style>
