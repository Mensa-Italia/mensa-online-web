## Project-Specific AI Assistant Instructions

Focus: Vue 3 + Vite single-page app scaffold using Pinia for state and Vue Router (currently empty routes). Keep suggestions minimal, idiomatic, and aligned with existing tooling.

### Core Architecture
1. Entry bootstraps in `src/main.js`: creates app, registers Pinia + Router, mounts `#app`.
2. Global alias `@` -> `src/` (see `vite.config.js`). Prefer this for imports instead of relative chains.
3. State management: Pinia composition stores (example: `src/stores/counter.js`). Follow pattern: `defineStore(id, () => { refs/computed + actions; return exposed })`.
4. Routing: `src/router/index.js` defines a `createRouter` with `createWebHistory(import.meta.env.BASE_URL)` and an empty `routes: []`. When adding routes, export lightweight route records (lazy-load via dynamic import for new views: `component: () => import('@/views/MyView.vue')`).
5. Components: `App.vue` is root; create new feature views under `src/views/` (create directory if missing) and smaller reusable components under `src/components/`.

### Conventions & Patterns
6. Use `<script setup>` SFC syntax for new components unless a specific need for `defineComponent`.
7. Prefer composition API (`ref`, `computed`) matching store example; avoid Options API unless interop needed.
8. Keep store state primitive & serializable; derive values with `computed` (see `doubleCount`). Don't mutate computed values directly.
9. For additional stores, mirror naming: `src/stores/<domain>.js`, export `use<Domain>Store`.
10. Import stores inside components (not globally) to enable proper SSR/DevTools (even if SSR not configured yet).

### Build & Tooling
11. Primary scripts (from `package.json`): `npm run dev` (Vite dev server), `npm run build` (production), `npm run preview` (serve dist), `npm run lint` (ESLint flat config + auto-fix), `npm run format` (Prettier over `src/`).
12. Node engine constraint: `^20.19.0 || >=22.12.0`; avoid suggesting unsupported Node versions.
13. ESLint uses flat config (`eslint.config.js`) with `plugin-vue` essential rules and Prettier disabled formatting—so rely on Prettier for style.
14. When adding dependencies needing Vite plugins (e.g., SVG loaders), register them in `vite.config.js` under `plugins` array.

### File & Import Guidance
15. Always use the `@` alias for root source imports: `import X from '@/components/X.vue'`.
16. Co-locate component-specific styles in SFC `<style scoped>` unless sharing globally (then create `src/assets/styles/` and import in `main.js`).
17. For new route-level views, create file, then append route object `{ path: '/feature', name: 'Feature', component: () => import('@/views/Feature.vue') }` to routes array.

### State & Data Flow
18. Keep side effects (e.g., fetching, timers) inside store actions or dedicated composables under `src/composables/` (create dir if needed). Return only reactive sources needed by components.
19. For derived values, prefer computed inside the store rather than recalculating in each component.

### Adding Tests (Future-Proof Note)
20. No test framework configured yet—if generating tests, propose adding Vitest + Vue Test Utils succinctly (but do not add unless explicitly requested).

### Performance & DX
21. Encourage route-level code splitting via dynamic imports (see point 4) for all but trivially small components.
22. Avoid absolute filesystem paths; rely on alias + relative only within same small subtree.
23. When suggesting refactors, maintain flat, minimal config—avoid over-engineering (keep plugin list lean).

### Safe Changes Checklist (apply before committing suggestions)
24. Does new code respect Node engine range? If adding syntax requiring different runtime, flag it.
25. Are imports using `@` alias and not deep relative traversals (`../../`)? Adjust if not.
26. Store definitions should return plain serializable state + computed + functions; do not export instantiated store outside a component.
27. New routes must have unique `name` and stable paths (leading `/`).

### Examples
28. New Store Skeleton:
```js
// src/stores/user.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  function setProfile(data) { profile.value = data }
  return { profile, setProfile }
})
```
29. New Route Record:
```js
// in src/router/index.js routes array
{ path: '/users', name: 'Users', component: () => import('@/views/Users.vue') }
```

### Interaction Guidance for AI
30. Before large edits, check for existing pattern (search under `src/stores/` or `src/router/`).
31. Prefer incremental additions over sweeping refactors in this small scaffold.
32. Ask for clarification only if a feature touches unestablished areas (auth, API layer) since none exist yet.

### PocketBase Integration
33. PocketBase client singleton lives in `src/lib/pb.js` exporting `pb` and `authStore`.
34. Env var `VITE_PB_URL` controls base URL; if absent, stores may fall back to mock data.
35. Data fetching belongs inside Pinia store actions (e.g., `loadFromPocketBase`) with `loading`, `loaded`, and `error` refs.
36. When mapping records, guard optional fields (city/state/email/image). Derive file URLs with `pb.files.getUrl(record, record.image)`.
37. Keep network calls idempotent: avoid concurrent duplicate fetches by early-return if `loading` is true.
38. For pagination or filters, extend store state with `page`, `perPage`, and server `totalItems` before expanding UI.
39. Do not leak PocketBase record objects directly to components; map to normalized plain objects consumed by the UI.

### JS Models Layer
40. Model mappers live in `src/api/models/`. Each file exports `map<Type>Record` and JSDoc typedef (no classes) for tree-shakable, framework-agnostic shapes.
41. Shared helpers (`parseDate`, `parseDateNullable`, `id`, `pick`) in `src/api/models/_helpers.js`—prefer these for consistency.
42. Stores never import from generated Dart artifacts; instead, they depend only on JS model mapper functions.
43. Keep mappers pure: no mutation, no side effects (no network calls, URL generation, or global state usage).
44. File fields store the original filename; derive file URLs in stores/UI using `pb.files.getUrl(record, filename)`.
45. Date handling: convert to `Date` objects for non-nullable fields or `Date|null` for optional. Keep strings only if raw value is required for display sorting.
46. Add new models by creating a `<name>.js` with typedef + `map<Name>Record`, then export via `src/api/models/index.js` barrel.
47. When backend changes a field name, keep backward compatibility in mapper (e.g., `r.bookingLink || r.booking_link`).
48. Do not overfit: only model fields actually used by UI or foreseeable upcoming features; additional raw backend keys remain accessible in record if needed.
49. For nested objects (e.g., `position` inside events), create separate mapper modules and compose them.
50. All future PocketBase-integrated stores should rely on these mappers to ensure consistent normalization.

---
If any of these sections become outdated (e.g., tests added, routes populated), update the relevant numbered lines rather than appending redundant guidance.
