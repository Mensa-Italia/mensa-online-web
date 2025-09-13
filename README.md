# mensa_web

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## PocketBase Integration

The application can source member data from a PocketBase backend.

### Environment

Copy `.env.example` to `.env` and set:

```
VITE_PB_URL=http://127.0.0.1:8090
```

### Expected Collection

Collection: `members_registry` (adjust in store if different).

Recommended fields:
- `name` (text)
- `email` (email, optional)
- `region` or `area` (text)
- `city` (text, optional)
- `state` (text, optional)
- `birthdate` (date, optional)
- `image` (file, optional)
- `is_active` (bool, optional)
- `full_data` (JSON object, optional)

Any additional key/value pairs placed inside `full_data` will appear inside the member drawer under "Additional Data".

### Loading Behavior

- If `VITE_PB_URL` is defined, the Phonebook view auto-fetches on mount.
- A "Refresh" button appears beside the total count; it shows a spinner while loading.
- If the env variable is absent, mock seed data is used.

### Images
File URLs are generated via `pb.files.getUrl(record, record.image)`. If the file field is missing, the UI falls back to initials.

### Extending
- For auth: leverage `pb.collection('users').authWithPassword(...)` and store tokens in `authStore`.
- For pagination: replace `getList(1, 200)` with dynamic page parameters; maintain `page`/`perPage` refs in the store.
- For caching: persist `members` to `localStorage` with a timestamp and only refetch after a TTL.
