# AGENTS.md

Nuxt 3 (v3.13) SPA frontend ("trums") — a sales/inventory/HR ERP client talking to a backend API. Node 22, npm, Vue 3, Vite 6.

## Commands

- `npm run dev` — dev server on **`http://localhost:8000`** (not 3000; set in package.json).
- `npm run build` — production build. This is the only real verification step (there is **no lint, typecheck, or test script**). For type errors use `npx nuxi typecheck`.
- `npm install` triggers `postinstall: nuxt prepare`, which generates `.nuxt/tsconfig.json` (the base of `tsconfig.json`). Re-run it after changing nuxt.config.

## Env & config

- App reads `NUXT_API_URL`, `NUXT_API_BASE`, and `NUXT_OPENID_CONNECT_*` from `.env` (gitignored; a local `.env` exists). Without it, `useRuntimeConfig().public.*` is empty and every API call fails. CI regenerates `.env` from GitHub secrets.
- `ssr: false` — pure SPA. Do all data loading client-side; guard `localStorage`/`window` access with `process.client`.
- API fallback base in `plugins/axios.ts` is `http://192.168.1.96:9008/api/` — don't rely on it.

## API access (three ways — use the right one)

- `useApiFetch<T>(url, options)` — `$fetch` wrapper, auto-attaches `Authorization`, retries on 401 via token refresh + queue. Preferred for one-shot calls (`composables/useApiFetch.ts`).
- `useFetchApi<T>(endpoint, key, method, body, retry?)` — returns `{ data, error, pending, status, code }`; also 401-refresh aware. This is the most widely used helper in pages.
- `$api` (axios) from `useNuxtApp()` — raw plugin instance (`plugins/axios.ts`); bearer token set per-call, not an interceptor. Avoid for new code.
- Types for endpoints live in `types/` (`response.ts`, `response_pagination.ts`, `request_search.ts`, per-feature files). `utils/permission.ts:canAccess`/`checkPermission` handle feature permissions.

## Auth (two overlapping systems — preserve both)

- OIDC via `nuxt-openid-connect` module + `oidc-client-ts` (`composables/useOIDC.ts`); configured in `nuxt.config.ts` under `openidConnect`.
- Legacy manual auth: cookies `token`, `refresh_token`, `expired_at`, `userdata` (`composables/useAuth.ts`) plus Pinia `stores/auth.ts` persisting `auth_data`, `menu`, `user_data` to `localStorage`. 401 refresh hits `/people-refresh`.
- Route permission checks: `definePageMeta({ requiredPermission: "catalogues-read" })` → `middleware/checkAccess.ts` (currently logs only, non-blocking). `middleware/error.global.ts` redirects unknown routes to `/error/404`.

## UI stack

- **Element Plus** — auto-imported globally (use `ElMessage`, `ElLoading`, etc. with no import); `element-plus` must stay in `build.transpile`. Component prefix `El`, plus `Headless*` components from Headless UI.
- **Tailwind** via `@nuxtjs/tailwindcss` — source css `~/assets/css/input.css`; config `tailwind.config.ts` (content paths are hand-listed — add new dirs there if Tailwind classes don't apply).
- **Dark mode** — `@nuxtjs/color-mode` with empty class prefix/suffix, so `dark:` variants work; mode stored in `color-mode` cookie.
- **i18n** — `@nuxtjs/i18n`, locales `en`/`id` (`i18n/locales/{en,id}.json`), `prefix_except_default`, default `en`, browser-detect via `language` cookie. Add new strings to **both** locale files.
- `nuxt-twemoji`, `@nuxt/icon` (Iconify `heroicons`/`uil`), `@vueuse/nuxt` are available.

## Structure

- Pages grouped by feature module: `pages/sales/`, `pages/master/`, `pages/inventory-management/`, `pages/finance-management/`, `pages/supply-chain-management/`, etc. Lists are `index.vue` + `add.vue` + `[id].vue` + `components/` per feature.
- Shared/reusable components live in `components/trums/` (auto-imported by name). Page-local components go in `pages/<feature>/components/`.
- Domain types in `types/`, formatting/helpers in `utils/` (all auto-imported).

## Workflow

- CI/CD (`.github/workflows/ci-cd.yml`) deploys on push to **`main` or `konsinyasi`** only: `npm i && npm run build`, tars `.output`, SCPs to server, PM2 restart `trums-fe_8008`. Other branches (`rab`, `faizal`, `ramdhan`, ...) are feature branches and do not deploy.
- Don't commit `.env` or build artifacts (`.output`, `.nuxt` are gitignored).
