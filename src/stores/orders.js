import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Order tracking store (mock implementation)
// Each order keeps a sequence of status steps; currentStatus must match one of steps[].key
// Pattern: tri-state loading + idempotent load
export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  // Canonical Printful-aligned step order for timelines
  // Reference: Printful API order statuses
  // (Other possible statuses outside this happy-path: failed, canceled, onhold)
  const stepOrder = [
    'pending',      // Order received / awaiting processing
    'inprocess',    // Being fulfilled (in production)
    'partial',      // Some items fulfilled (rare in simple mock, may be skipped)
    'fulfilled',    // All items fulfilled, preparing for shipment
    'shipped',      // Shipped (tracking available)
  ]

  function makeMock(nowOffsetMinutes = 0, partial = {}) {
    const baseTime = Date.now() - nowOffsetMinutes * 60 * 1000
    const id = 'ord_' + Math.random().toString(36).slice(2, 10)
    // Random progress depth (at least first status)
    const depth = Math.floor(Math.random() * stepOrder.length) + 1
    // Skip 'partial' occasionally (simulate not always present)
    let linear = stepOrder.slice(0, depth)
    if (!linear.includes('partial') && Math.random() < 0.25 && linear.includes('inprocess') && !linear.includes('fulfilled')) {
      // inject partial between inprocess and fulfilled if applicable
      const ipIdx = linear.indexOf('inprocess')
      if (ipIdx !== -1) linear.splice(ipIdx + 1, 0, 'partial')
    }
    const steps = linear
    const stepObjects = steps.map((k, i) => ({
      key: k,
      at: new Date(baseTime + i * 45 * 60 * 1000).toISOString(),
    }))
    const currentStatus = steps[steps.length - 1]
    return {
      id,
  created: stepObjects[0].at,
  currentStatus,
      steps: stepObjects,
      items: [
        { name: 'Classic Mensa T‑Shirt', variant: 'M', quantity: 1, unitPrice: 18.0 },
        { name: 'Enamel Lapel Pin', variant: '', quantity: 2, unitPrice: 6.5 },
      ],
      subtotal: 31.0,
      shipping: 5.0,
      tax: +(31.0 * 0.22).toFixed(2),
      total: +(31.0 + 5.0 + +(31.0 * 0.22).toFixed(2)).toFixed(2),
      paymentProvider: 'mock-stripe',
      // Placeholder Stripe-style receipt URL. Replace with real URL when integrating backend.
      receiptUrl: `https://pay.stripe.com/receipts/mock_rcpt_${id}`,
      statusHistory: stepObjects, // alias for potential future UI
      ...partial,
    }
  }

  async function loadMock() {
    if (loading.value || loaded.value) return
    loading.value = true
    error.value = null
    try {
      // Provide a few mock orders at varying stages
      orders.value = [
        makeMock(600),
        makeMock(180),
        makeMock(45),
      ]
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function addFromCheckout(orderLike) {
    // Accept structure from boutique store's lastOrder
    if (!orderLike || !orderLike.id) return
    const existing = orders.value.find(o => o.id === orderLike.id)
    if (existing) return
    const nowIso = new Date().toISOString()
    orders.value.unshift({
      id: orderLike.id,
      created: orderLike.created || nowIso,
      currentStatus: 'pending',
      steps: [ { key: 'pending', at: orderLike.created || nowIso }, { key: 'inprocess', at: nowIso } ],
      items: orderLike.items || [],
      subtotal: orderLike.subtotal || 0,
      shipping: orderLike.shipping || 0,
      tax: orderLike.tax || 0,
      total: orderLike.total || 0,
      paymentProvider: orderLike.paymentProvider || 'mock-stripe',
      receiptUrl: orderLike.receiptUrl || null,
      statusHistory: [],
    })
  }

  // Derived
  const orderedByNewest = computed(() => [...orders.value].sort((a,b) => new Date(b.created) - new Date(a.created)))

  function progressPercent(order) {
    if (!order) return 0
    const idx = stepOrder.indexOf(order.currentStatus)
    if (idx === -1) return 0
    return Math.round((idx / (stepOrder.length - 1)) * 100)
  }

  return {
    // state
    orders, loading, loaded, error,
    // constants
    stepOrder,
    // computed
    orderedByNewest,
    // actions
    loadMock, addFromCheckout,
    // helpers
    progressPercent,
  }
})
