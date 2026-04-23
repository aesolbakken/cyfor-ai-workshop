# Cyfor Workshop

Monorepo with an **API** (Hono + Prisma + SQLite) and a **Web** frontend (React + Vite).

## Prerequisites

- Node.js 20+
- npm 10+

## Getting Started

```bash
npm install
npm run dev
```

This starts both projects concurrently — the API on `http://localhost:3000` and the Vite dev server on `http://localhost:5173`. The web server waits for the API health check before starting.

### Run projects individually

```bash
# API only (default port 3000, override with API_PORT)
npm run dev:api

# Web only (assumes API is already running)
npm run dev:web
```

### Other commands

| Command | Description |
| --- | --- |
| `npm run build` | Build all workspaces |
| `npm run generate` | Run code generation (Prisma client + OpenAPI + Orval) |
| `npm run typecheck` | Type-check all workspaces |

## Inspecting the SQLite Database

The API uses a SQLite database at `api/data/workshop.db`. It is created automatically on first run via `prisma db push`.

### Option 1: Prisma Studio

```bash
npx prisma studio --schema api/prisma/schema.prisma
```

This opens a browser UI at `http://localhost:5555` where you can browse and edit data directly.

> **Corporate proxy / TLS error?** If you get a `SELF_SIGNED_CERT_IN_CHAIN` error, run this first:
> ```bash
> # Git Bash / macOS / Linux
> export NODE_TLS_REJECT_UNAUTHORIZED=0
>
> # Windows CMD
> set NODE_TLS_REJECT_UNAUTHORIZED=0
> ```
> **Warning:** This disables TLS certificate verification and should never be used in production.

### Option 2: VS Code extension

Install the **SQLite Viewer** extension, then open `api/data/workshop.db` directly in VS Code.

### Reset the database

```bash
# macOS / Linux
rm api/data/workshop.db

# Windows PowerShell
Remove-Item api/data/workshop.db

# Windows CMD
del api\data\workshop.db

npm run dev
```

The database and schema are recreated on startup.

## Project Structure

```text
├── .agents/      # Copilot skills (PR review, etc.)
├── api/          # Hono REST API + Prisma + SQLite
├── web/          # React + Vite + TailwindCSS frontend
└── package.json  # npm workspaces root
```

See [api/README.md](api/README.md) and [web/README.md](web/README.md) for project-specific details.

## Optional: MCP servers for Copilot CLI

The repo ships a template at [`.copilot/mcp-config.json`](.copilot/mcp-config.json) with two
[Model Context Protocol](https://modelcontextprotocol.io) servers that are useful while working on
this codebase:

| Server | What it gives the agent |
| --- | --- |
| `playwright` (`@playwright/mcp`) | Drive a real browser against the dev web app on `http://localhost:5173` to exercise the React UI end-to-end. |
| `workshop-sqlite` (`mcp-server-sqlite-npx`) | Query and mutate `api/data/workshop.db` directly to verify what the API persisted. |

GitHub Copilot CLI loads MCP servers only from `~/.copilot/mcp-config.json` (it does **not**
auto-discover the file in this repo). VS Code, Claude Desktop, and other MCP clients use the same
schema, so the same template works for them with their own config paths.

### Activate the servers

1. Replace the `WORKSHOP_DB_PATH` placeholder with the absolute path to your local
   `api/data/workshop.db`. The file is created on first `npm run dev`.

   ```bash
   # macOS / Linux
   DB="$(pwd)/api/data/workshop.db"
   ```

   On Windows PowerShell use `(Resolve-Path .\api\data\workshop.db).Path`.

2. Merge the template into your user config (do **not** overwrite — you may already have other
   servers configured):

   ```bash
   # macOS / Linux, requires jq
   mkdir -p ~/.copilot
   [ -f ~/.copilot/mcp-config.json ] || echo '{"mcpServers":{}}' > ~/.copilot/mcp-config.json
   jq --arg db "$DB" --slurpfile tmpl .copilot/mcp-config.json '
     .mcpServers.playwright = $tmpl[0].mcpServers.playwright |
     .mcpServers["workshop-sqlite"] = ($tmpl[0].mcpServers["workshop-sqlite"]
       | .args = (.args | map(if . == "WORKSHOP_DB_PATH" then $db else . end)))
   ' ~/.copilot/mcp-config.json > ~/.copilot/mcp-config.json.new \
     && mv ~/.copilot/mcp-config.json.new ~/.copilot/mcp-config.json
   ```

   Or, equivalently, run `/mcp add` inside `copilot` and enter the `command` / `args` from the
   template manually.

3. Verify in an interactive `copilot` session:

   ```text
   /mcp show
   ```

   Both `playwright` and `workshop-sqlite` should appear with status `running`. Use
   `/mcp show playwright` to list the tools each server exposes.

The SQLite server has write access by default; that's intentional because the workshop DB is
disposable (`rm api/data/workshop.db && npm run dev` recreates it).
