# Cyfor AI Workshop — Copilot Instructions

npm workspaces monorepo with two packages:

- `api/` — Hono + `@hono/zod-openapi` REST API, Prisma ORM, SQLite.
- `web/` — React 19 + Vite + TailwindCSS 4 SPA, TanStack Query, Axios, Orval-generated hooks.
- `workshop-tasks/` — workshop exercise descriptions (Markdown, not code).
- `slides/` — workshop slides.

## Commands

Run from the repo root unless noted.

| Command | Purpose |
| --- | --- |
| `npm install` | Install all workspaces. |
| `npm run dev` | Start API (`:3000`) and web (`:5173`) concurrently. Web waits for `/health` via `wait-on`. |
| `npm run dev:api` | API only. Override port with `API_PORT=4000 npm run dev:api`. |
| `npm run dev:web` | Web only (assumes API already running). |
| `npm run build` | Build all workspaces (`--if-present`). |
| `npm run typecheck` | Type-check all workspaces. |
| `npm run generate` | Regenerate Prisma client, `api/openapi.json`, and Orval hooks. |

There is no test runner or linter configured in this repo — do not invent one.

## Code generation pipeline (important)

The frontend is fully driven by the API's OpenAPI document. The chain is:

1. `api/src/app.ts` defines Zod schemas + `createRoute(...)` and registers them on `OpenAPIHono`.
2. `api/scripts/export-openapi.ts` writes `api/openapi.json` (run via `npm run generate` in `api/` or root).
3. `web/orval.config.ts` reads `../api/openapi.json` and writes `web/src/api/generated/hooks.ts` (react-query + axios, with `customClient` mutator from `web/src/api/client.ts`).
4. `web/src/App.tsx` consumes hooks like `useGetResources`, `usePostResources`, `useDeleteResourcesId`.

Implications:
- **After changing any API route or schema**, run `npm run generate` (root) so the web hooks regenerate. `web/build` and `web/typecheck` already run `generate` first.
- Do not hand-edit `web/src/api/generated/*` — Orval cleans the directory on each run (`clean: true`).
- Generated hook names follow Orval's method+path convention (`useGetResources`, `usePostResources`, `useDeleteResourcesId`). Renaming a route renames the hook.

## API conventions (`api/src/app.ts`)

- All routes are declared with `createRoute(...)` and `app.openapi(route, handler)` so they appear in the OpenAPI doc. Plain `app.get(...)` would bypass codegen — don't use it for public endpoints.
- Request/response shapes are Zod schemas with `.openapi('Name')` so Orval emits named TS types.
- `toResourceResponse` converts Prisma `Date` to ISO string before responding; mirror this pattern for new models because `ResourceSchema` uses `z.string().datetime()`.
- Path params use `z.coerce.number()` because Hono passes them as strings.
- Prisma client is a shared singleton in `api/src/db.ts`; import via `./db.js` (note the `.js` extension — required by NodeNext ESM resolution even though the source is `.ts`).
- CORS allows `localhost:5173` and `4173` by default; override with comma-separated `CORS_ORIGIN`.

## Database

- SQLite file at `api/data/workshop.db`, schema in `api/prisma/schema.prisma`.
- `npm run dev` (in `api/`) runs `prisma generate` then `prisma db push` automatically — there are no committed migrations beyond the initial one; schema changes are pushed, not migrated, in this workshop setup.
- To reset: delete `api/data/workshop.db` and restart.

## Web conventions

- Use generated hooks from `web/src/api` (re-exported via `index.ts`); do not call `axios` directly in components.
- After mutations, invalidate via the generated query-key helpers (e.g. `getGetResourcesQueryKey()`) — see `App.tsx`.
- Dev requests go to `/api/*` and Vite rewrites them to `http://localhost:3000` (strips `/api`). For production builds set `VITE_API_BASE_URL`.
- Tailwind v4 is wired through the `@tailwindcss/vite` plugin — no `tailwind.config.js`, configure via `index.css`.

## TypeScript / module setup

- Both packages are ESM (`"type": "module"`).
- API uses `tsx` for dev and `tsc` for build; relative imports must include `.js` extensions.

## MCP servers (optional)

If the contributor has activated them, two MCP servers from `.copilot/mcp-config.json` may be
available:

- `playwright` — drive a real browser against `http://localhost:5173`.
- `workshop-sqlite` — query/mutate `api/data/workshop.db` directly.

Activation is documented in the root `README.md` ("Optional: MCP servers for Copilot CLI"). When
the SQLite server is available, prefer it over shelling out to `sqlite3` for verifying API
mutations.
