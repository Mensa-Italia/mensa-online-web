import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Login as apiLogin, Logout as apiLogout, isLogged, GetUser, pb } from '@/api/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(GetUser() || null)
  const loading = ref(false)
  const error = ref(null)
  // Authenticated state as a ref (not computed) to allow explicit immediate updates
  const authenticated = ref(isLogged() && !!user.value)

  async function login(email, password) {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const data = await apiLogin(email, password)
      user.value = data?.record || GetUser() || null
      authenticated.value = isLogged() && !!user.value
      return user.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    apiLogout()
    user.value = null
    authenticated.value = false
  }

  // Subscribe to PocketBase authStore changes so UI updates immediately after login
  pb.authStore.onChange(() => {
    user.value = GetUser() || null
    authenticated.value = isLogged() && !!user.value
  })

  async function updateProfile(payload) {
    if (!user.value) throw new Error('Not authenticated')
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      // Build form data; PocketBase update supports multipart for files
      const form = new FormData()
      for (const [k, v] of Object.entries(payload)) {
        if (v === undefined || v === null || v === '') continue
        form.append(k, v)
      }
      const updated = await pb.collection(user.value.collectionName || 'users').update(user.value.id, form)
      // refresh auth store record (PocketBase does not auto-merge local record)
      // If pb.authStore.model exists update it, else refetch
      pb.authStore.save(pb.authStore.token, updated)
      user.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, authenticated, login, logout, updateProfile }
})
