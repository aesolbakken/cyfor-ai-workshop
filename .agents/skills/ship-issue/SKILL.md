---
name: ship-issue
description: End-to-end orchestrator that picks a GitHub issue and drives it through triage, planning, implementation, PR, review, self-fix, and merge. Maximises parallelism at every phase.
---

# Skill: Ship Issue

Take a GitHub issue from first contact to merged PR. This skill
orchestrates the full lifecycle by invoking sub-skills at each phase,
applying quality gates between them, and **maximising parallelism**
wherever independent work streams exist.

## Parallelism philosophy

- **Default to parallel.** Any two tasks that don't have a data
  dependency should run simultaneously via sub-agents or parallel tool
  calls.
- **Pipeline across phases.** Don't wait for a phase to fully complete if
  partial output already unblocks the next phase.
- **Fan-out at every layer.** During implementation, fan out to as many
  sub-agents as there are independent units of work (separate files,
  separate models, separate components).
- **Merge results, not processes.** Let sub-agents finish independently;
  collect and integrate their outputs in a single merge step.

## How to invoke

The user provides an issue reference (URL, `#number`, or
`owner/repo#number`). The agent then runs all eight phases below
autonomously, only pausing if something is genuinely uncertain.

---

## Phase 1 — Pick & assign + early recon

Launch **all of the following in parallel**:

| Task | Tool | Purpose |
| --- | --- | --- |
| Fetch issue | `gh issue view <number> --json title,body,labels,assignees,comments` | Get full issue context |
| Assign self | `gh issue edit <number> --add-assignee @me` | Claim the issue |
| Post start comment | `gh issue comment <number> --body "🤖 Starting work …"` | Signal to watchers |
| Explore codebase | Launch **explore sub-agents** (see below) | Pre-warm context for triage & plan |

### Early codebase recon (explore agents)

While the issue is being fetched, launch **parallel explore agents** to
map the codebase areas most likely to be relevant. This saves a full
round-trip later during triage and planning.

Launch these explore agents simultaneously:

1. **Schema & DB explorer** — read `api/prisma/schema.prisma`, understand
   existing models and relations.
2. **API routes explorer** — read `api/src/app.ts`, catalogue existing
   routes, Zod schemas, and response helpers.
3. **Web explorer** — read `web/src/App.tsx` and other components, understand
   how hooks are consumed and queries invalidated.

Each explore agent returns a concise summary. Collect all three before
starting triage.

**Gate:** If the issue is locked or already has an open PR linked to it,
stop and inform the user.

---

## Phase 2 — Triage (with pre-warmed context)

Invoke the **`triage-issue`** skill with the issue number **plus** the
codebase summaries from Phase 1's explore agents. Feeding in pre-warmed
context lets the triage skill skip its own codebase exploration and
produce results faster.

**After the triage skill completes:**

1. Read the triage output carefully.
2. Verify it is specific and actionable — not generic boilerplate.
3. If the triage flagged the issue as **too vague**, stop and ask the user
   for clarification. Do not proceed to planning with ambiguous requirements.
4. Capture the acceptance criteria for use in later phases.

**Gate:** Triage must produce clear acceptance criteria before proceeding.

---

## Phase 3 — Plan (overlapped with branch setup)

Launch **in parallel**:

| Task | Purpose |
| --- | --- |
| Invoke **`plan-issue`** skill | Produce implementation plan from issue + triage + codebase context |
| Create feature branch | `git checkout -b <issue-number>-<short-slug> main` |
| Pre-install deps if needed | `npm install` (only if plan might add packages) |

The plan skill already has the codebase summaries from Phase 1, so pass
those in to avoid redundant exploration.

**After the plan skill completes:**

1. Review the plan for completeness:
   - Every acceptance criterion from triage has a matching todo.
   - The codegen step (`npm run generate`) is in the right place.
   - Validation steps (`npm run typecheck`) are included.
2. If the plan has gaps, refine it before proceeding.
3. Parse the plan into an ordered dependency graph of todos for Phase 4.

**Gate:** Plan must cover all acceptance criteria and include validation
steps before proceeding.

---

## Phase 4 — Implement (maximum fan-out)

This is where the biggest parallelism wins are. Use the issue + triage +
plan as your working context.

### Build a dependency graph

From the plan's todo list, construct an explicit dependency graph:

```
schema change ──→ API routes ──→ npm run generate ──→ web components
                                                  ├──→ ComponentA (agent 1)
                                                  ├──→ ComponentB (agent 2)
                                                  └──→ ComponentC (agent 3)
```

### Layer-by-layer execution with fan-out

#### Layer 1 — Database (sequential, single agent)
- Modify `api/prisma/schema.prisma`.
- This is a single file; no parallelism needed within this layer.

#### Layer 2 — API (fan-out if multiple routes)
- If the plan adds **multiple independent routes**, launch a **sub-agent
  per route**. Each agent writes its route definition + Zod schemas in
  an isolated section of `api/src/app.ts`.
- If routes depend on each other, keep them sequential.
- Each sub-agent receives: the full plan context, the schema from Layer 1,
  and the specific route it owns.

**Merge point:** Collect all route code. If multiple agents edited
`api/src/app.ts`, integrate their changes carefully (they will have
touched different sections).

#### Layer 3 — Codegen (sequential, must wait for Layer 2)
- Run `npm run generate` — this regenerates Prisma client, OpenAPI doc,
  and Orval hooks.
- This is a hard synchronisation point. Nothing in Layer 4 can start
  until this completes.

#### Layer 4 — Web (maximum fan-out)
- This is where parallelism pays off the most.
- Launch a **separate sub-agent for each independent web component or
  page** identified in the plan.
- Each sub-agent receives: the plan context, the generated hook names
  from Layer 3, and its specific component assignment.
- Sub-agents can work on completely independent files simultaneously.

**Example fan-out:**
```
├── Agent A: BookingList.tsx (uses useGetBookings)
├── Agent B: BookingForm.tsx (uses usePostBookings)
├── Agent C: BookingDetail.tsx (uses useGetBookingsId)
└── Agent D: Update App.tsx routing + navigation
```

#### Layer 5 — Integration (sequential, single agent)
- Wire components together (routing, navigation, imports).
- This agent collects all outputs from Layer 4 and ensures they integrate
  cleanly.

### Repo conventions to follow

These are non-negotiable for this project — include them in every
sub-agent's prompt:

- Use `createRoute(...)` + `app.openapi(route, handler)` for all public
  API routes. Never use plain `app.get/post/…`.
- Zod schemas must include `.openapi('Name')`.
- Convert Prisma `Date` to ISO string (follow `toResourceResponse`).
- Path params: `z.coerce.number()`.
- Relative imports must include `.js` extension.
- Import Prisma client from `./db.js`.
- Web components use generated hooks, never raw `axios`.
- After mutations, invalidate queries with generated key helpers.
- Tailwind v4 via `index.css`, no `tailwind.config.js`.
- No Prisma migrations — use `db push`.

### Validation (parallel where possible)

After all code changes, run **in parallel**:

1. `npm run generate` (if API routes or schemas changed).
2. Then, once generate completes, run **simultaneously**:
   - `npm run typecheck`
   - `npm run build` (if build inputs changed)

If validation fails, fix the errors and re-validate before proceeding.

---

## Phase 5 — Open PR

1. Stage and commit all changes:
   ```
   git add -A
   git commit -m "<type>: <concise description>

   <optional body explaining the change>

   Closes #<issue-number>"
   ```
   Use conventional commit types: `feat`, `fix`, `chore`, `refactor`, etc.

2. Run **in parallel**:
   - Push the branch: `git push -u origin <branch-name>`
   - Draft the PR body (compute while push is in flight).

3. Open a PR via `gh`:
   ```
   gh pr create --title "<title>" --body "<body>" --base main
   ```

   The PR body should include:
   - **What** — one-paragraph summary of the change.
   - **Why** — reference the issue (`Closes #<number>`).
   - **How** — brief description of the approach.
   - **Testing** — what was validated (`typecheck`, `build`, manual checks).
   - **Checklist**: codegen ran, typecheck passes, no hand-edited generated
     files.

---

## Phase 6 — Review PR (parallel reviews)

Launch **all applicable reviews in parallel**:

| Review agent | Condition | Skill |
| --- | --- | --- |
| Code review | Always | **`review-pr`** |
| Design review | PR touches `web/src/` (excl. `generated/`) | **`design`** |

Both review agents receive the PR number and work independently. Collect
findings from all agents before proceeding to self-fix.

---

## Phase 7 — Self-fix (parallel fixes)

Categorise all review findings, then **fix independent issues in
parallel**:

### Categorise

1. **Critical** (bugs, security, correctness, missing codegen) — must fix.
2. **Important** (convention violations, missing validation) — must fix.
3. **Nits** (style observations) — fix if trivial.
4. **Uncertain** — stop and ask the user.

### Parallel fix strategy

- Group findings by file. Assign one sub-agent per file (or per
  independent group of findings).
- Each sub-agent receives: the specific findings for its file(s), the
  full plan context, and the repo conventions.
- Sub-agents make their fixes and return the changes.
- Integrate all fixes, then commit.

### Validate and push

Run **in parallel** after all fixes are applied:
- `npm run typecheck`
- `npm run build` (if relevant)

Push the fix commits. If significant changes were made, optionally re-run
the review skill on the updated diff to confirm no new issues.

---

## Phase 8 — Merge

1. Check that CI / status checks pass:
   ```
   gh pr checks <pr-number> --watch
   ```
   If there are no CI checks configured, verify locally that `typecheck`
   and `build` pass.

2. If all checks pass, merge:
   ```
   gh pr merge <pr-number> --squash --delete-branch
   ```

3. If checks fail:
   - Read the failure logs.
   - Fix the issue, push, and re-check.
   - If the failure is unrelated to your changes (flaky CI, infra issue),
     inform the user and let them decide.

4. Post a final comment on the issue confirming it's been shipped:
   ```
   gh issue comment <number> --body "✅ Shipped in #<pr-number>."
   ```

---

## Parallelism summary

Visual overview of what runs concurrently at each phase:

```
Phase 1  ┬─ fetch issue ─────────────────┐
         ├─ assign self                   │
         ├─ post comment                  ├─→ Phase 2 (triage)
         ├─ explore: schema & DB ─────────┤
         ├─ explore: API routes ──────────┤
         └─ explore: web components ──────┘

Phase 3  ┬─ invoke plan-issue skill ──────┐
         └─ create feature branch         ├─→ Phase 4
                                          │
Phase 4  ┬─ Layer 1: schema (single) ────→│
         └─ Layer 2: routes (fan-out) ────→│
              ├─ route agent A             │
              └─ route agent B             │
                                           │
         ── Layer 3: npm run generate ─────→│  (sync point)
                                           │
         ┬─ Layer 4: web (fan-out) ────────→│
         │   ├─ component agent A          │
         │   ├─ component agent B          │
         │   └─ component agent C          │
         └─ Layer 5: integration ──────────→│
                                           │
         ┬─ typecheck ────────────────────→│  (parallel validation)
         └─ build ────────────────────────→│

Phase 6  ┬─ review-pr skill ─────────────→│  (parallel reviews)
         └─ design skill (if UI) ─────────→│

Phase 7  ┬─ fix agent: file A ───────────→│  (parallel fixes)
         ├─ fix agent: file B ───────────→│
         └─ fix agent: file C ───────────→│
         ┬─ typecheck ────────────────────→│  (parallel validation)
         └─ build ────────────────────────→│
```

---

## Error handling

At any phase, if something goes wrong:

| Situation | Action |
| --- | --- |
| Issue is too vague after triage | Stop, ask user for clarification |
| Plan doesn't cover all acceptance criteria | Refine plan before implementing |
| `npm run typecheck` fails after implementation | Fix errors, re-validate |
| `npm run generate` fails | Check for syntax errors in schemas, fix |
| PR review finds critical bugs | Fix and re-push |
| Sub-agent produces conflicting edits | Resolve conflicts in the merge step for that layer |
| Merge conflicts with main | Rebase on main, resolve, re-validate |
| CI checks fail on unrelated code | Inform user, await decision |
| Anything genuinely uncertain | Stop and ask the user |

## Sub-skill reference

| Phase | Skill invoked | Parallel? | Purpose |
| --- | --- | --- | --- |
| 2 | `triage-issue` | Overlaps with codebase recon | Structured triage with acceptance criteria |
| 3 | `plan-issue` | Overlaps with branch setup | Implementation plan with file-by-file changes |
| 6 | `review-pr` | In parallel with `design` | Code review against project conventions |
| 6 | `design` | In parallel with `review-pr` | Design system compliance (if UI changed) |

## Output

When the skill completes, summarise what was done:

- Issue number and title.
- PR number and link.
- Summary of changes made.
- How many sub-agents were used and for what.
- Any open items or follow-ups noted during review.
