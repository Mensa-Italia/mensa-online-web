import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import logoImg from '@/assets/logo_horizontal.png'
import { useOrdersStore } from '@/stores/orders'

// Boutique store (mock-only implementation; no API calls yet)
// Patterns: tri-state loading, idempotent load, computed derivations, add/update cart
export const useBoutiqueStore = defineStore('boutique', () => {
  // --- Product catalog (mock) ---
  const products = ref([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  // Filtering state
  const search = ref('')
  const category = ref('all')

  // UI state (local to boutique experience but central so layout can read cartCount)
  const cartOpen = ref(false)
  const checkoutOpen = ref(false)
  const processingPayment = ref(false)
  const paymentError = ref(null)
  const lastOrder = ref(null)

  // Cart: each line { id, productId, variantKey, quantity }
  const cart = ref([])
  const selectedProduct = ref(null)

  // --- Load mock data ---
  async function loadMock() {
    if (loading.value || loaded.value) return
    loading.value = true
    error.value = null
    try {
      // Basic placeholder images reuse existing asset
  const img = logoImg
      // Provide a few apparel & accessory items with variants
      products.value = [
        {
          id: 'p-shirt-classic',
          name: 'Classic Mensa T‑Shirt',
          category: 'Apparel',
          price: 18.0,
          image: img,
          images: [img, img, img],
          description: 'Soft cotton tee featuring the classic Mensa logotype. Unisex fit.',
          longDescription: 'This classic unisex tee is made from premium soft-spun cotton for day-long comfort. Features a durable screen print of the Mensa logotype. Pre‑shrunk, side‑seamed and ready for everyday wear.',
          materials: '100% cotton (180gsm)',
          care: 'Machine wash cold inside-out, tumble dry low, do not iron decoration.',
          variants: [ 'XS', 'S', 'M', 'L', 'XL', 'XXL' ],
          limited: false,
          tags: ['cotton','tee','unisex'],
          rating: 4.6,
        },
        {
          id: 'p-hoodie-premium',
          name: 'Premium Logo Hoodie',
          category: 'Apparel',
          price: 42.5,
          image: img,
          images: [img, img],
          description: 'Mid‑weight fleece hoodie with embroidered emblem.',
          longDescription: 'Mid-weight brushed fleece hoodie with a minimalist embroidered Mensa emblem on the chest. Comfortable regular fit with double-lined hood and metal-tipped drawcords.',
          materials: '80% cotton / 20% polyester fleece',
          care: 'Wash at 30°C, tumble dry low, do not bleach.',
          variants: [ 'S', 'M', 'L', 'XL', 'XXL' ],
          limited: false,
          tags: ['fleece','hoodie'],
          rating: 4.8,
        },
        {
          id: 'p-pin-enamel',
          name: 'Enamel Lapel Pin',
          category: 'Accessories',
          price: 6.5,
          image: img,
          images: [img],
          description: 'Hard enamel pin with secure rubber clasp.',
          longDescription: 'Premium hard enamel lapel pin with polished metal plating. Includes two secure rubber clutches to keep it straight and safe on your jacket or bag.',
          materials: 'Hard enamel + metal alloy',
          care: 'Wipe gently with a soft cloth; avoid harsh chemicals.',
          variants: [],
          limited: false,
          tags: ['pin','enamel'],
          rating: 4.2,
        },
        {
          id: 'p-notebook-grid',
          name: 'Grid Notebook',
          category: 'Accessories',
          price: 9.9,
          image: img,
          images: [img, img],
          description: 'A5 grid notebook – perfect for ideas & puzzles.',
          longDescription: 'A5 size grid/graph notebook ideal for sketching logic puzzles, planning, or capturing spur-of-the-moment inspiration. Smooth ink-friendly paper.',
          materials: 'Recycled paper, 80 pages',
          care: 'Keep dry; store flat to avoid warping.',
          variants: [],
          limited: false,
          tags: ['stationery'],
          rating: 4.4,
        },
        {
          id: 'p-drop-limited-2025',
          name: '2025 Limited Drop Tee',
          category: 'Limited',
          price: 29.0,
            image: img,
          images: [img, img, img],
          description: 'Numbered limited edition t‑shirt for the 2025 season.',
          longDescription: 'Exclusive numbered edition tee celebrating the 2025 season. Premium fabric blend with a collectible design — once sold out, it will not be reprinted.',
          materials: 'Ring‑spun cotton blend',
          care: 'Gentle wash cold, hang dry for longevity.',
          variants: [ 'S', 'M', 'L', 'XL' ],
          limited: true,
          tags: ['limited','drop','2025'],
          rating: 4.9,
        },
      ]
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  // --- Filtering & lookup ---
  const categories = computed(() => {
    const set = new Set(products.value.map(p => p.category))
    return ['all', ...Array.from(set).sort()]
  })

  // Category counts (for UI badges)
  const categoryCounts = computed(() => {
    const counts = products.value.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
    const total = products.value.length
    return { all: total, ...counts }
  })

  const filteredProducts = computed(() => {
    const q = search.value.trim().toLowerCase()
    return products.value.filter(p => {
      if (category.value !== 'all' && p.category !== category.value) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    })
  })

  function setCategory(cat) { category.value = cat }
  function setSearch(q) { search.value = q }

  // --- Cart operations ---
  const cartCount = computed(() => cart.value.reduce((sum, l) => sum + l.quantity, 0))
  const cartDetailed = computed(() => cart.value.map(line => {
    const product = products.value.find(p => p.id === line.productId) || {}
    return { ...line, product, lineTotal: (product.price || 0) * line.quantity }
  }))
  const subtotal = computed(() => cartDetailed.value.reduce((s,l) => s + l.lineTotal, 0))
  const shipping = computed(() => subtotal.value > 0 ? 5 : 0)
  const taxRate = 0.22
  const tax = computed(() => +(subtotal.value * taxRate).toFixed(2))
  const total = computed(() => +(subtotal.value + shipping.value + tax.value).toFixed(2))

  function addToCart(product, variantKey = '') {
    if (!product || !product.id) return
    const key = variantKey || (product.variants && product.variants.length ? product.variants[0] : '')
    const existing = cart.value.find(l => l.productId === product.id && l.variantKey === key)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.value.push({ id: 'line-' + Date.now() + '-' + Math.random().toString(36).slice(2,7), productId: product.id, variantKey: key, quantity: 1 })
    }
  }

  // Product detail selection
  function openProduct(product) { selectedProduct.value = product }
  function closeProduct() { selectedProduct.value = null }
  function updateQuantity(lineId, qty) {
    const line = cart.value.find(l => l.id === lineId)
    if (!line) return
    line.quantity = Math.max(1, qty)
  }
  function removeLine(lineId) {
    cart.value = cart.value.filter(l => l.id !== lineId)
  }
  function clearCart() { cart.value = [] }

  function openCart() { cartOpen.value = true }
  function closeCart() { cartOpen.value = false }
  function toggleCart() { cartOpen.value = !cartOpen.value }
  function openCheckout() { checkoutOpen.value = true }
  function closeCheckout() { checkoutOpen.value = false }

  // --- Mock payment ---
  async function payWithMockStripe() {
    if (processingPayment.value || cart.value.length === 0) return
    processingPayment.value = true
    paymentError.value = null
    try {
      await new Promise(res => setTimeout(res, 1200)) // simulate network latency
      // pseudo success
      const orderId = 'ord_' + Math.random().toString(36).slice(2,10)
      lastOrder.value = {
        id: orderId,
        created: new Date().toISOString(),
        items: cartDetailed.value.map(l => ({ productId: l.productId, name: l.product.name, variant: l.variantKey, quantity: l.quantity, unitPrice: l.product.price, lineTotal: l.lineTotal })),
        subtotal: subtotal.value,
        shipping: shipping.value,
        tax: tax.value,
        total: total.value,
        paymentProvider: 'mock-stripe',
        status: 'paid',
      }
      // Push into orders store for tracking
      try {
        const ordersStore = useOrdersStore()
        ordersStore.addFromCheckout(lastOrder.value)
      } catch (e) { /* ignore if store not ready */ }
      clearCart()
    } catch (e) {
      paymentError.value = e instanceof Error ? e.message : String(e)
    } finally {
      processingPayment.value = false
    }
  }

  return {
    // state
    products, loading, loaded, error,
    search, category,
    cart, cartOpen, checkoutOpen, processingPayment, paymentError, lastOrder,
    // computed
  categories, categoryCounts, filteredProducts, cartCount, cartDetailed, subtotal, shipping, tax, total,
    // actions
    loadMock, setCategory, setSearch,
    addToCart, updateQuantity, removeLine, clearCart,
    openCart, closeCart, toggleCart, openCheckout, closeCheckout,
    payWithMockStripe,
    openProduct, closeProduct,
    // selection
    selectedProduct,
  }
})
