<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { ShoppingCart } from 'lucide-vue-next'
import { useBoutiqueStore } from '@/stores/boutique'

const props = defineProps({
  product: { type: Object, required: true },
  layout: { type: String, default: 'column' }, // 'row' or 'column'
})

const store = useBoutiqueStore()
// Selected size (variant). We default to the middle variant when variants exist.
const size = ref('')
const hovering = ref(false)

const canChooseVariant = computed(() => (props.product.variants || []).length > 0)

function pickDefaultVariant() {
  if (!canChooseVariant.value) { size.value = ''; return }
  const list = props.product.variants
  if (!Array.isArray(list) || list.length === 0) { size.value = ''; return }
  size.value = list[Math.floor(list.length / 2)]
}

function ensureVariant() { if (canChooseVariant.value && !size.value) pickDefaultVariant() }

// When component mounts or product changes, preselect middle variant.
onMounted(() => pickDefaultVariant())
watch(() => props.product, () => pickDefaultVariant(), { immediate: false })

function add() {
  ensureVariant()
  store.addToCart(props.product, size.value)
  store.openCart()
}

// Remove rating visuals (kept placeholder in case re-added later)
</script>

<template>
  <div class="bp-card" :class="layout" @mouseenter="hovering = true" @mouseleave="hovering = false">
  <div class="media" @click="store.openProduct(product)" role="button" tabindex="0" @keyup.enter="store.openProduct(product)">
      <img :src="product.image" alt="" class="img" />
      <span v-if="product.limited" class="flag-limited">Limited</span>
    </div>
    <div class="content">
      <div class="main-block">
  <h3 class="title clickable" :title="product.name" @click="store.openProduct(product)">{{ product.name }}</h3>
        <p class="desc" :class="{ fade: hovering }">{{ product.description }}</p>
        <div class="variant-wrap" v-if="canChooseVariant">
          <div class="variant-group">
            <button
              v-for="v in product.variants"
              :key="v"
              type="button"
              class="variant-btn"
              :class="{ active: size === v }"
              @click="size = v"
            >{{ v }}</button>
          </div>
        </div>
      </div>
      <div class="side-block">
        <div class="price">€ {{ product.price.toFixed(2) }}</div>
        <button class="add-btn" @click="add">
          <ShoppingCart class="ic" />
          <span>Add</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bp-card { display:flex; flex-direction:column; position:relative; background:linear-gradient(160deg,rgba(255,255,255,.045),rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.1); border-radius:16px; overflow:hidden; transition:box-shadow .35s, transform .35s, border-color .35s; }
.bp-card:hover { box-shadow:0 10px 32px -14px rgba(0,0,0,.65), 0 4px 14px -6px rgba(0,0,0,.4); transform:translateY(-2px); border-color:rgba(255,255,255,.18); }
.bp-card.row { flex-direction:row; min-height:150px; }
.bp-card.row .media { width:180px; flex:0 0 180px; aspect-ratio:1/1; border-right:1px solid rgba(255,255,255,.06); }
.bp-card.row .content { flex-direction:row; }
.bp-card.row .main-block { padding:1rem 1.2rem 1rem 1.05rem; }
.bp-card.row .side-block { border-left:1px solid rgba(255,255,255,.06); }
.media { position:relative; width:100%; aspect-ratio: 4/3; background:linear-gradient(145deg,#1e293b,#0f172a 65%); display:flex; align-items:center; justify-content:center; overflow:hidden; }
.img { width:100%; height:100%; object-fit:contain; mix-blend-mode:screen; opacity:.95; transition:transform .7s cubic-bezier(.4,0,.2,1); }
.bp-card:hover .img { transform:scale(1.05); }
.flag-limited { position:absolute; top:8px; left:8px; background:linear-gradient(90deg,#9333ea,#7e22ce); padding:.28rem .55rem; font-size:.55rem; font-weight:600; border-radius:6px; letter-spacing:.5px; box-shadow:0 2px 10px -4px rgba(147,51,234,.55); }
.media { cursor:pointer; }
.title.clickable { cursor:pointer; text-decoration:none; }
.title.clickable:hover { text-decoration:underline; }
.content { display:flex; flex-direction:column; flex:1; }
.main-block { display:flex; flex-direction:column; gap:.55rem; padding:.8rem .9rem .85rem; flex:1; }
.title { font-size:.8rem; font-weight:600; line-height:1.3; margin:0; letter-spacing:.25px; }
.desc { font-size:.6rem; line-height:1.35; opacity:.78; margin:0; max-width:780px; transition:opacity .35s; }
.desc.fade { opacity:.5; }
.variant-wrap { margin-top:-.1rem; }
.variant-group { display:flex; flex-wrap:wrap; gap:.35rem; }
.variant-btn { background:#1e293b; border:1px solid rgba(255,255,255,.18); color:#fff; padding:.28rem .55rem; font-size:.55rem; border-radius:5px; cursor:pointer; line-height:1; font-weight:500; letter-spacing:.25px; }
.variant-btn.active { background:#2563eb; border-color:#2563eb; box-shadow:0 2px 10px -4px rgba(37,99,235,.55); }
.side-block { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.65rem; padding:.85rem .85rem; width:150px; }
.bp-card.column .side-block { flex-direction:row; justify-content:space-between; width:100%; border-top:1px solid rgba(255,255,255,.06); padding:.6rem .85rem .7rem; }
.price { font-weight:700; font-size:.9rem; letter-spacing:.3px; }
.add-btn { background:#2563eb; color:#fff; border:none; border-radius:10px; font-size:.58rem; font-weight:600; letter-spacing:.45px; display:flex; align-items:center; gap:.45rem; cursor:pointer; padding:.55rem .8rem; box-shadow:0 6px 18px -8px rgba(37,99,235,.55); }
.add-btn:hover { background:#1d4ed8; }
.ic { width:14px; height:14px; }
/* Medium & small screens: horizontal with image on right */
@media (max-width:860px){
  .bp-card, .bp-card.row { flex-direction:row-reverse; align-items:stretch; }
  .bp-card .media { width:150px; flex:0 0 150px; aspect-ratio:1/1; border-left:1px solid rgba(255,255,255,.07); border-right:none; }
  .bp-card .img { object-fit:contain; mix-blend-mode:normal; }
  .bp-card .content { flex:1; min-width:0; }
  .bp-card .main-block { padding:.75rem .9rem .7rem .85rem; gap:.5rem; }
  .bp-card .title { font-size:.8rem; line-height:1.25; }
  .bp-card .desc { font-size:.58rem; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; max-width:100%; }
  .bp-card .side-block { width:auto; border:none !important; padding:.55rem .8rem .65rem .85rem; flex-direction:row; justify-content:flex-start; gap:.65rem; }
  .bp-card.column .side-block { border-top:none; }
  .bp-card .add-btn { padding:.5rem .75rem; font-size:.56rem; border-radius:9px; gap:.45rem; }
  .bp-card .flag-limited { font-size:.52rem; padding:.26rem .5rem; }
}
/* Narrow phones refine sizing */
@media (max-width:600px){
  .bp-card .media { width:120px; flex:0 0 120px; }
  .bp-card .main-block { padding:.65rem .75rem .55rem .75rem; gap:.4rem; }
  .bp-card .title { font-size:.75rem; }
  .bp-card .desc { font-size:.56rem; }
  .bp-card .variant-btn { padding:.25rem .48rem; font-size:.5rem; }
  .bp-card .add-btn { padding:.45rem .65rem; font-size:.53rem; }
  .bp-card .price { font-size:.8rem; }
}
</style>
