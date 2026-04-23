# AGENTS.md

Guidance for AI coding agents working in this repo. Follows the
[agents.md](https://agents.md) convention. Human-facing docs live in
[`README.md`](./README.md), [`api/README.md`](./api/README.md), and
[`web/README.md`](./web/README.md).

## General behavior

- **Ask before assuming.** If a requirement, scope, or design choice is
  unclear, ask the user a focused clarifying question before proceeding.
  Getting it right matters more than getting it fast.

## Project overview

npm **workspaces** monorepo:

| Path | Stack | Purpose |
| --- | --- | --- |
| `api/` | Hono + `@hono/zod-openapi`, Prisma, SQLite, `tsx` | REST API |
| `web/` | React 19, Vite, TailwindCSS 4, TanStack Query, Axios, Orval | SPA frontend |
| `workshop-tasks/` | Markdown | Workshop exercise descriptions (not code) |
| `slides/` | — | Workshop slides |

Both code packages are ESM (`"type": "module"`).

## Setup & commands

Run from the repo root unless noted.

| Command | Purpose |
| --- | --- |
| `npm install` | Install all workspaces. |
| `npm run dev` | Start API (`:3000`) and web (`:5173`) concurrently. Web waits for `/health` via `wait-on`. |
| `npm run dev:api` | API only. Override port with `API_PORT=4000 npm run dev:api`. |
| `npm run dev:web` | Web only (assumes API is already running). |
| `npm run build` | Build all workspaces (`--if-present`). |
| `npm run typecheck` | Type-check all workspaces. |
| `npm run generate` | Regenerate Prisma client, `api/openapi.json`, and Orval hooks. |

**No test runner or linter is configured.** Do not invent one. After code
changes, run `npm run typecheck` and (when relevant) `npm run build` to
validate.

## Code generation pipeline (critical)

The frontend is fully driven by the API's OpenAPI document:

1. `api/src/app.ts` defines Zod schemas and `createRoute(...)`, registered
   on `OpenAPIHono`.
2. `api/scripts/export-openapi.ts` writes `api/openapi.json` (run via
   `npm run generate`).
3. `web/orval.config.ts` reads `../api/openapi.json` and writes
   `web/src/api/generated/hooks.ts` (react-query + axios, with
   `customClient` mutator from `web/src/api/client.ts`).
4. `web/src/App.tsx` consumes hooks like `useGetResources`,
   `usePostResources`, `useDeleteResourcesId`.

**Implications for agents:**

- After changing any API route or schema, run `npm run generate` from the
  root so the web hooks are regenerated. (`web` build/typecheck already run
  `generate` first.)
- **Never hand-edit `web/src/api/generated/*`** — Orval cleans the directory
  on each run (`clean: true`).
- Generated hook names follow Orval's `method + path` convention
  (`useGetResources`, `usePostResources`, `useDeleteResourcesId`). Renaming a route
  renames the hook — update consumers accordingly.

## API conventions (`api/src/app.ts`)

- Declare every public route with `createRoute(...)` and
  `app.openapi(route, handler)` so it appears in the OpenAPI doc. **Do not
  use plain `app.get(...)` for public endpoints** — it bypasses codegen.
- Request/response shapes are Zod schemas with `.openapi('Name')` so Orval
  emits named TS types.
- Convert Prisma `Date` to ISO string before responding (see
  `toResourceResponse`); response schemas use `z.string().datetime()`.
  Mirror this for new models.
- Path params use `z.coerce.number()` because Hono passes them as strings.
- Prisma client is a shared singleton in `api/src/db.ts`. Import via
  `./db.js` — the `.js` extension is **required** by NodeNext ESM
  resolution, even though the source is `.ts`.
- CORS allows `localhost:5173` and `4173` by default; override with
  comma-separated `CORS_ORIGIN`.

## Web conventions

- Use generated hooks from `web/src/api` (re-exported via `index.ts`). Do
  **not** call `axios` directly in components.
- After mutations, invalidate queries via the generated query-key helpers
  (e.g. `getGetResourcesQueryKey()`) — see `web/src/App.tsx`.
- Dev requests go to `/api/*`; Vite rewrites them to `http://localhost:3000`
  (strips `/api`). For production builds, set `VITE_API_BASE_URL`.
- Tailwind v4 is wired through `@tailwindcss/vite` — there is **no**
  `tailwind.config.js`; configure via `web/src/index.css`.

## Database

- SQLite file at `api/data/workshop.db`; schema in
  `api/prisma/schema.prisma`.
- `npm run dev` (in `api/`) runs `prisma generate` then `prisma db push`
  automatically. There are **no committed migrations** beyond the initial
  one — schema changes are pushed, not migrated, in this workshop setup.
- Reset the DB by deleting `api/data/workshop.db` and restarting.

## TypeScript / module setup

- Both packages are ESM (`"type": "module"`).
- API uses `tsx` for dev and `tsc` for build.
- Relative imports **must include the `.js` extension** (e.g.
  `import { prisma } from './db.js'`).

## Validation checklist for agents

After changes, before declaring a task done:

1. If you touched API routes or schemas: `npm run generate`.
2. `npm run typecheck` (root) — must pass.
3. If you changed build inputs: `npm run build` (root) — must pass.
4. There are no unit/integration tests and no linter; do not add either
   unless the user asks.

## Optional MCP servers

Two MCP servers are templated in `.copilot/mcp-config.json`:

- `playwright` — drive a real browser against `http://localhost:5173`.
- `workshop-sqlite` — query/mutate `api/data/workshop.db` directly.

Activation steps and the `WORKSHOP_DB_PATH` requirement are documented in
[`README.md`](./README.md#optional-mcp-servers-for-copilot-cli). When the
SQLite server is available, prefer it over shelling out to `sqlite3` for
verifying API mutations.

## What NOT to do

- ❌ Hand-edit anything under `web/src/api/generated/`.
- ❌ Add a test runner, linter, or formatter unless the user explicitly
  requests it.
- ❌ Use plain `app.get/post/...` for public API routes — always use
  `createRoute` + `app.openapi`.
- ❌ Drop the `.js` suffix on relative imports (NodeNext ESM will fail).
- ❌ Create Prisma migrations — this project uses `db push`.
- ❌ Call `axios` directly from React components — use the generated hooks.
- ❌ Edit `api/openapi.json` by hand — it is generated.

## Skills

Reusable skill files live under `.agents/skills/`. Each skill is a
Markdown file (`SKILL.md`) that an AI agent can invoke by name.

| Skill | Path | Purpose |
| --- | --- | --- |
| `ship-issue` | `.agents/skills/ship-issue/SKILL.md` | End-to-end orchestrator: pick issue → triage → plan → implement → PR → review → self-fix → merge. Invokes sub-skills automatically. |
| `plan-issue` | `.agents/skills/plan-issue/SKILL.md` | Turn a triaged issue into a concrete implementation plan with file-by-file changes, code patterns, and ordered todos. Posts to the issue. |
| `review-pr` | `.agents/skills/review-pr/SKILL.md` | Project-specific PR review checklist covering codegen sync, API/web conventions, domain validation, and quality. |
| `refine-issue` | `.agents/skills/refine-issue/SKILL.md` | Turn a vague issue or requirement into an implementation-ready brief with acceptance criteria, business rules, and edge cases. |
| `triage-issue` | `.agents/skills/triage-issue/SKILL.md` | Read a GitHub issue and post a concise triage (scope, assumptions, acceptance criteria, impacted areas) back as a comment. |

When adding a new skill, create a directory under `.agents/skills/` with a
`SKILL.md` that describes the task, the checks to perform, and the expected
output format.
