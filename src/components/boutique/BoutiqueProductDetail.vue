<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useBoutiqueStore } from '@/stores/boutique'

const store = useBoutiqueStore()

const activeIndex = ref(0)
const product = computed(() => store.selectedProduct)
const images = computed(() => product.value?.images || [product.value?.image].filter(Boolean))
// Currently selected variant (size). Defaults to the middle variant when a product opens.
const selectedVariant = ref('')

watch(product, (p) => {
  activeIndex.value = 0
  const list = p?.variants || []
  selectedVariant.value = list.length ? list[Math.floor(list.length / 2)] : ''
})

function close() { store.closeProduct() }
function prev() { if (images.value.length) activeIndex.value = (activeIndex.value - 1 + images.value.length) % images.value.length }
function next() { if (images.value.length) activeIndex.value = (activeIndex.value + 1) % images.value.length }
function addToCart() { if (product.value) { store.addToCart(product.value, selectedVariant.value); store.openCart() } }

function onKey(e){
  if(e.key==='Escape') close()
  if(!product.value) return
  if(e.key==='ArrowLeft') prev()
  if(e.key==='ArrowRight') next()
}

onMounted(()=>window.addEventListener('keydown', onKey))
onUnmounted(()=>window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="product" class="detail-overlay" role="dialog" aria-modal="true">
    <div class="panel">
      <button class="close" aria-label="Close" @click="close"><X class="ic" /></button>
      <div class="content">
        <div class="gallery">
          <div class="frame">
            <img :src="images[activeIndex]" alt="" class="main-img" />
            <button v-if="images.length>1" class="nav prev" @click="prev"><ChevronLeft class="ic" /></button>
            <button v-if="images.length>1" class="nav next" @click="next"><ChevronRight class="ic" /></button>
          </div>
          <div v-if="images.length>1" class="thumbs">
            <button
              v-for="(src,i) in images"
              :key="i"
              :class="['thumb', { active: i===activeIndex }]"
              @click="activeIndex = i"
            >
              <img :src="src" alt="" />
            </button>
          </div>
        </div>
        <div class="info">
          <h2 class="title">{{ product.name }}</h2>
          <p class="price">€ {{ product.price.toFixed(2) }}</p>
          <p class="long" v-if="product.longDescription">{{ product.longDescription }}</p>
          <div class="meta-grid">
            <div v-if="product.materials" class="meta-item"><span class="label">Materials</span><span class="value">{{ product.materials }}</span></div>
            <div v-if="product.care" class="meta-item"><span class="label">Care</span><span class="value">{{ product.care }}</span></div>
            <div v-if="product.limited" class="meta-item"><span class="label">Edition</span><span class="value">Limited</span></div>
          </div>
          <div v-if="product.variants?.length" class="variants">
            <span class="variant-label">Size</span>
            <div class="variant-group">
              <button
                v-for="v in product.variants"
                :key="v"
                class="variant-btn"
                :class="{ active: selectedVariant === v }"
                @click="selectedVariant = v"
              >{{ v }}</button>
            </div>
          </div>
          <button class="add-btn" @click="addToCart">
            <ShoppingCart class="ic" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-overlay { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:2.5rem 1.1rem 2rem; z-index:450; }
.panel { width:100%; max-width:1080px; background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.04)); border:1px solid rgba(255,255,255,.14); border-radius:24px; box-shadow:0 20px 60px -20px rgba(0,0,0,.65),0 6px 24px -8px rgba(0,0,0,.45); position:relative; overflow:hidden; }
.close { position:absolute; top:.8rem; right:.8rem; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; }
.close:hover { background:rgba(255,255,255,.15); }
.content { display:flex; gap:2rem; padding:2.2rem 2rem 1.9rem; }
.gallery { display:flex; flex-direction:column; gap:.9rem; width:48%; }
.frame { position:relative; background:#0f172a; border:1px solid rgba(255,255,255,.12); border-radius:14px; aspect-ratio:1/1; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.main-img { width:100%; height:100%; object-fit:contain; }
.nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(15,23,42,.75); border:1px solid rgba(255,255,255,.15); width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; backdrop-filter:blur(4px); }
.nav:hover { background:#2563eb; border-color:#2563eb; }
.nav.prev { left:10px; }
.nav.next { right:10px; }
.thumbs { display:flex; gap:.5rem; flex-wrap:wrap; }
.thumb { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.15); width:60px; height:60px; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:4px; }
.thumb.active { outline:2px solid #2563eb; }
.thumb img { width:100%; height:100%; object-fit:contain; }
.info { flex:1; display:flex; flex-direction:column; gap:1rem; }
.title { margin:0; font-size:1.35rem; font-weight:600; letter-spacing:.5px; }
.price { margin:0; font-weight:700; font-size:1.05rem; letter-spacing:.4px; }
.long { margin:0; font-size:.8rem; line-height:1.5; opacity:.85; }
.meta-grid { display:grid; gap:.6rem .9rem; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); font-size:.62rem; }
.meta-item { display:flex; flex-direction:column; gap:.2rem; }
.label { text-transform:uppercase; letter-spacing:.8px; font-size:.55rem; opacity:.65; }
.value { font-size:.65rem; font-weight:500; }
.variants { display:flex; flex-direction:column; gap:.45rem; }
.variant-label { font-size:.6rem; opacity:.7; text-transform:uppercase; letter-spacing:.7px; }
.variant-group { display:flex; flex-wrap:wrap; gap:.4rem; }
.variant-btn { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.18); color:#fff; font-size:.6rem; padding:.4rem .65rem; border-radius:6px; cursor:pointer; transition:background .2s, border-color .2s, box-shadow .2s; }
.variant-btn:hover { background:#2563eb; border-color:#2563eb; }
.variant-btn.active { background:#2563eb; border-color:#2563eb; box-shadow:0 2px 10px -4px rgba(37,99,235,.55); }
.add-btn { align-self:flex-start; background:#2563eb; border:1px solid #1d4ed8; color:#fff; font-size:.7rem; font-weight:600; letter-spacing:.6px; padding:.7rem 1.1rem; border-radius:12px; display:flex; gap:.55rem; align-items:center; cursor:pointer; box-shadow:0 8px 26px -12px rgba(37,99,235,.55); }
.add-btn:hover { background:#1d4ed8; }
.ic { width:18px; height:18px; }
@media (max-width:980px){
  .content { flex-direction:column; gap:1.75rem; padding:1.7rem 1.4rem 1.5rem; }
  .gallery { width:100%; flex-direction:column; }
  .meta-grid { grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); }
  .title { font-size:1.15rem; }
}
@media (max-width:640px){
  .detail-overlay { padding:1rem .75rem; }
  .panel { border-radius:18px; }
  .frame { aspect-ratio: 4/3; }
  .content { padding:1.4rem 1.05rem 1.25rem; }
  .thumb { width:52px; height:52px; }
}
</style>
