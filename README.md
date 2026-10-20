# Delcom Courses (SvelteKit 3 + TypeScript)

Studi Kasus 2 (3.2) PABWE 2026 P6. Proyek: `ifs24007-pabwe2026-sk-p6-sveltekit`.

Sumber data: <https://open-api.delcom.org/docs/1.0/api-courses>

## Menjalankan

```bash
bun install
bun run dev            # http://localhost:3005
bun run test:coverage  # target coverage 100%
bun run build && bun start
```

`.env`:

```env
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3005
```

## Catatan SvelteKit 3

- Konfigurasi (adapter) ada di `vite.config.ts`, bukan `svelte.config.js`.
- Memakai `@sveltejs/adapter-bun`; build harus dijalankan oleh Bun (`bun run build`).
- `tsconfig.json` meng-extend `$app/tsconfig`. Import memakai path relatif (tidak ada alias `$lib`).
- Butuh Node >= 22.17 (untuk tooling) dan Bun >= 1.4.

## Struktur

```
src/
├── App.test.ts, test-utils.ts, env.d.ts, app.css, app.html
├── helpers/   apiHelper.ts, toolsHelper.ts
├── hooks/     useInput.ts
├── features/
│   ├── auth/     api, states, layouts, pages, components/AuthSessionRedirect.svelte
│   ├── users/    api, states, pages
│   ├── common/   pages/NotFoundPage.svelte
│   └── courses/  api, states, layouts, components, modals, pages
└── routes/    +layout, +error, /, /auth/*, /courses/[courseId], /users, /profile
```
