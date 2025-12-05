<script setup>
import { useBoutiqueStore } from '@/stores/boutique'
import { X, Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-vue-next'

const store = useBoutiqueStore()

function inc(line) { store.updateQuantity(line.id, line.quantity + 1) }
function dec(line) { if (line.quantity > 1) store.updateQuantity(line.id, line.quantity - 1) }
function remove(line) { store.removeLine(line.id) }
function checkout() { store.closeCart(); store.openCheckout() }
</script>

<template>
  <div class="cart-drawer" :class="{ open: store.cartOpen }" aria-hidden="!store.cartOpen">
    <div class="cart-header">
      <ShoppingCart class="icon" />
      <span class="title">Your Cart</span>
      <button class="close" @click="store.closeCart"><X class="icon" /></button>
    </div>
    <div class="cart-body" v-if="store.cartDetailed.length > 0">
      <div class="line" v-for="l in store.cartDetailed" :key="l.id">
        <div class="info">
          <div class="name">{{ l.product.name }}</div>
          <div class="variant" v-if="l.variantKey">Size: {{ l.variantKey }}</div>
          <div class="price">€ {{ l.product.price.toFixed(2) }}</div>
        </div>
        <div class="qty">
          <button @click="dec(l)" :disabled="l.quantity === 1" class="qty-btn"><Minus class="icon" /></button>
          <span class="q">{{ l.quantity }}</span>
          <button @click="inc(l)" class="qty-btn"><Plus class="icon" /></button>
        </div>
        <div class="line-total">€ {{ l.lineTotal.toFixed(2) }}</div>
        <button class="remove" @click="remove(l)"><Trash2 class="icon" /></button>
      </div>
    </div>
    <div v-else class="cart-empty">Your cart is empty.</div>
    <div class="cart-footer" v-if="store.cartDetailed.length">
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>€ {{ store.subtotal.toFixed(2) }}</span></div>
        <div class="row"><span>Shipping</span><span>€ {{ store.shipping.toFixed(2) }}</span></div>
        <div class="row"><span>Tax</span><span>€ {{ store.tax.toFixed(2) }}</span></div>
        <div class="row total"><span>Total</span><span>€ {{ store.total.toFixed(2) }}</span></div>
      </div>
      <button class="btn btn-sm btn-outline-light w-100" @click="checkout">
        Checkout <ArrowRight class="icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.cart-drawer { position:fixed; top:0; right:0; width:360px; max-width:100%; height:100dvh; background:#0f172a; backdrop-filter:blur(18px) saturate(180%); border-left:1px solid rgba(255,255,255,.08); transform:translateX(100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; z-index:400; box-shadow:-8px 0 24px -12px rgba(0,0,0,.6); }
.cart-drawer.open { transform:translateX(0); }
.cart-header { display:flex; align-items:center; gap:.55rem; padding:.85rem .95rem; border-bottom:1px solid rgba(255,255,255,.08); background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02)); }
.title { font-size:.85rem; font-weight:600; letter-spacing:.25px; }
.close { margin-left:auto; background:none; border:none; color:#fff; cursor:pointer; display:flex; align-items:center; }
.cart-body { flex:1; overflow-y:auto; padding:.75rem .9rem; display:flex; flex-direction:column; gap:.7rem; }
.line { display:grid; grid-template-columns: 1fr auto auto auto; gap:.65rem; background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.03)); padding:.6rem .65rem .65rem; border:1px solid rgba(255,255,255,.1); border-radius:10px; align-items:center; position:relative; }
.info { display:flex; flex-direction:column; gap:.25rem; }
.name { font-size:.68rem; font-weight:600; line-height:1.2; }
.variant { font-size:.55rem; opacity:.6; }
.price { font-size:.6rem; opacity:.75; }
.qty { display:flex; align-items:center; gap:.3rem; }
.qty-btn { background:#1e293b; border:1px solid rgba(255,255,255,.15); color:#fff; width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.qty-btn:hover { background:#2563eb; border-color:#2563eb; }
.q { font-size:.62rem; font-weight:600; }
.line-total { font-size:.62rem; font-weight:600; text-align:right; }
.remove { background:none; border:none; color:rgba(255,255,255,.55); cursor:pointer; display:flex; align-items:center; }
.remove:hover { color:#fff; }
.cart-empty { padding:1.2rem .9rem; font-size:.68rem; opacity:.65; }
.cart-footer { border-top:1px solid rgba(255,255,255,.08); padding:.85rem .95rem 1rem; display:flex; flex-direction:column; gap:.75rem; background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02)); }
.totals { display:flex; flex-direction:column; gap:.3rem; font-size:.62rem; }
.row { display:flex; justify-content:space-between; }
.row.total { font-weight:600; font-size:.72rem; padding-top:.4rem; border-top:1px solid rgba(255,255,255,.1); margin-top:.3rem; }
.icon { width:16px; height:16px; }
@media (max-width:480px){ .cart-drawer { width:100%; } }
</style>
