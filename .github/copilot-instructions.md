## Project AI Guidance (Vue 3 + Vite + Pinia + PocketBase)

Goal: Help contributors quickly add features without breaking existing auth, data loading, or routing patterns. All guidance here is based on the current code (update instead of appending when things change).

### Architecture Snapshot
1. Entry (`src/main.js`) wires: createApp -> register Pinia + Router -> mount `#app`; global CSS = Bootstrap + `@/assets/theme.css`.
2. Routing (`src/router/index.js`): Layout route (`AppShell.vue`) wraps authenticated child views (Dashboard, Events, Documents, Boutique, Phonebook, Profile). Auth enforced via `meta.requiresAuth` + global `beforeEach` using `isLogged()`.
3. State: Pinia composition stores under `src/stores/` (auth, members, events, documents, counter). Pattern: `defineStore(id, () => { refs, computed, async actions, return exports })`.
4. Data layer: Direct PocketBase usage centralized in `src/api/api.js`. Stores call exported helpers (`GetEvents`, `GetMembers`, etc.) and normalize records internally (see `members.normalize`, `mapEventRecord`). No separate model mapper layer exists—remove stale references to one if encountered.
5. Layout & navigation: `AppShell.vue` handles sidebar + topbar + mobile nav state; route links defined locally (keep additions consistent with `nav` array + router children).

### PocketBase & Auth
6. Singleton PocketBase client: `pb` in `src/api/api.js`; token + record persisted via `pb.authStore.save(...)` after custom `/api/cs/auth-with-area` login.
7. Auth store (`auth.js`) mirrors `pb.authStore` via onChange subscription; never mutate `pb.authStore` outside API helpers except controlled saves after profile update.
8. Use `isLogged()` and `authenticated` ref for guards/UI; redirect logic lives only in router guard + logout handler.
9. Build file URLs manually following existing pattern: `https://svc.mensa.it/api/files/<collection>/<id>/<filename>` (see events, members, documents). Reuse that helper logic instead of inventing new URL builders.

### Store Patterns
10. Each async load action defends against duplicate calls: early return if `loading` (and sometimes `loaded`). Preserve this idempotence when extending.
11. Expose tri-state fetch refs: `loading`, `loaded`, `error`. Derive display groupings via `computed` (e.g., `members.byRegion`, `events.territoryEvents`). Avoid recomputing in components.
12. Normalize backend variability inside the store (e.g., handling `name || title`, `when_start || whenStart`). Keep fallbacks + backward-compatible field checks when adding new keys.
13. Infinite / incremental lists: `displayLimit` + `increment` + `hasMoreLocal` pattern (members, documents). Reuse this approach instead of adding pagination logic ad hoc.

### Routing & Views
14. New authenticated view: add a child under root layout route with `meta.requiresAuth: true` + lazy component `() => import('@/views/MyView.vue')` and optionally extend the `nav` array in `AppShell.vue` (include an icon from `lucide-vue-next`).
15. Keep route names unique and stable; redirect logic relies on names (`Login`, `Dashboard`).

### Components & Styling
16. Prefer `<script setup>` SFCs; import stores locally (`const store = useXStore()`). Avoid global singletons of store instances.
17. Use `@` alias for all root imports; no deep relative (`../../`) traversal.
18. Co-locate styles with components (`<style scoped>`). Global theme overrides belong in `@/assets/theme.css`.

### API Helpers
19. Add new backend calls inside `src/api/api.js` returning raw PocketBase records (or simplified arrays). Leave normalization to the consuming store.
20. For filtering/sorting, follow existing pattern: `getFullList({ filter: "...", sort: "...", expand: "..." })`. Keep filters server-side where possible; otherwise document why client filtering is required.

### Safe Contribution Checklist
21. Maintain Node version compatibility (`package.json engines`).
22. Always guard async actions: avoid concurrent writes / loads (`if (loading.value) return`).
23. Keep auth redirects centralized (do not scatter `router.push('/login')`; reuse existing logout flow or router guard).
24. Preserve computed derivations instead of moving logic into components.
25. Use dynamic imports for all route-level components to retain code-splitting.

### Example (New Store Skeleton)
```js
// src/stores/user.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { pb } from '@/api/api'
export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  async function load() { if (loading.value) return; loading.value = true; error.value = null; try { profile.value = pb.authStore.record; } catch(e){ error.value = String(e) } finally { loading.value = false } }
  return { profile, loading, error, load }
})
```

### When Unsure
26. Before adding abstraction (e.g., model mappers, caching), check if pattern already exists. If not present, propose in PR description rather than silently introducing it.
27. If adding environment-dependent logic, document required env vars in `README.md` instead of expanding this file.

---
Update this file by editing or replacing lines; do not append duplicate sections. Keep it lean (< ~60 lines) and strictly reflective of the current codebase.
