---
name: ship-issue
description: End-to-end orchestrator that picks a GitHub issue and drives it through triage, planning, implementation, PR, review, self-fix, and merge.
---

# Skill: Ship Issue

Take a GitHub issue from first contact to merged PR. This skill
orchestrates the full lifecycle by invoking sub-skills at each phase and
applying quality gates between them.

## How to invoke

The user provides an issue reference (URL, `#number`, or
`owner/repo#number`). The agent then runs all eight phases below
autonomously, only pausing if something is genuinely uncertain.

---

## Phase 1 — Pick & assign

1. Fetch the issue via `gh issue view <number> --json title,body,labels,assignees,comments`.
2. Read the title, body, labels, and all comments to understand context.
3. Assign yourself to the issue:
   ```
   gh issue edit <number> --add-assignee @me
   ```
4. Add a brief comment acknowledging you're starting work:
   ```
   gh issue comment <number> --body "🤖 Starting work on this issue. Will triage → plan → implement → PR → review → merge."
   ```

**Gate:** If the issue is locked or already has an open PR linked to it,
stop and inform the user.

---

## Phase 2 — Triage

Invoke the **`triage-issue`** skill with the issue number.

The triage skill will:
- Analyse the issue in context of the repo.
- Post a structured triage comment (scope, impacted areas, acceptance
  criteria, risks).

**After the triage skill completes:**

1. Read the triage output carefully.
2. Verify it is specific and actionable — not generic boilerplate.
3. If the triage flagged the issue as **too vague**, stop and ask the user
   for clarification. Do not proceed to planning with ambiguous requirements.
4. Capture the acceptance criteria for use in later phases.

**Gate:** Triage must produce clear acceptance criteria before proceeding.

---

## Phase 3 — Plan

Invoke the **`plan-issue`** skill with the issue number. The triage
comment will already be on the issue, so the planning skill can read it.

The plan skill will:
- Analyse the codebase to determine which files need changes.
- Produce a structured implementation plan (file-by-file changes, ordered
  todos, parallelisation opportunities).
- Post the plan as a GitHub issue comment.
- Return the plan as local context.

**After the plan skill completes:**

1. Review the plan for completeness:
   - Every acceptance criterion from triage has a matching todo.
   - The codegen step (`npm run generate`) is in the right place.
   - Validation steps (`npm run typecheck`) are included.
2. If the plan has gaps, refine it before proceeding.
3. Save the plan todos for use during implementation.

**Gate:** Plan must cover all acceptance criteria and include validation
steps before proceeding.

---

## Phase 4 — Implement

This is where the code gets written. Use the issue + triage + plan as
your working context.

### Setup

1. Create a feature branch:
   ```
   git checkout -b <issue-number>-<short-slug> main
   ```
   Example: `42-add-booking-model`

### Execution strategy

Follow the plan's ordered todo list. At each step:

- **Sequential work** (database → API → codegen → web): do these in order
  since each layer depends on the previous one.
- **Parallel work**: when the plan identifies independent tasks (e.g.,
  multiple web components after hooks are generated), use sub-agents to
  work on them simultaneously.

### Repo conventions to follow

These are non-negotiable for this project:

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

### Validation

After all code changes:

1. Run `npm run generate` (if API routes or schemas changed).
2. Run `npm run typecheck` — must pass with zero errors.
3. Run `npm run build` — must pass (if build inputs changed).

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

2. Push the branch:
   ```
   git push -u origin <branch-name>
   ```

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

## Phase 6 — Review PR

Invoke the **`review-pr`** skill with the PR number.

The review skill will check:
- Codegen pipeline integrity.
- API conventions compliance.
- Web/frontend conventions.
- Database and schema consistency.
- Domain validation rules.
- General code quality.

**Additionally**, if the PR touches any files in `web/src/` (excluding
`web/src/api/generated/`), also invoke the **`design`** skill to verify
the UI follows the Forsvaret-inspired design system.

Capture all review findings for the next phase.

---

## Phase 7 — Self-fix

Process the review findings:

1. **Critical issues** (bugs, security, correctness, missing codegen):
   Fix these immediately. Commit and push.
2. **Important issues** (convention violations, missing validation):
   Fix these. Commit and push.
3. **Nits** (style observations that don't affect correctness):
   Fix if trivial, otherwise note them and move on.
4. **Uncertain items**: If a review finding is ambiguous or requires a
   design decision, **stop and ask the user** before fixing.

After fixes:

1. Re-run `npm run typecheck` (and `npm run build` if relevant).
2. Push the fix commits.
3. Optionally re-run the review skill on the updated diff to confirm
   no new issues were introduced. Only do this if significant changes
   were made during the fix phase.

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

## Error handling

At any phase, if something goes wrong:

| Situation | Action |
| --- | --- |
| Issue is too vague after triage | Stop, ask user for clarification |
| Plan doesn't cover all acceptance criteria | Refine plan before implementing |
| `npm run typecheck` fails after implementation | Fix errors, re-validate |
| `npm run generate` fails | Check for syntax errors in schemas, fix |
| PR review finds critical bugs | Fix and re-push |
| Merge conflicts | Rebase on main, resolve, re-validate |
| CI checks fail on unrelated code | Inform user, await decision |
| Anything genuinely uncertain | Stop and ask the user |

## Sub-skill reference

| Phase | Skill invoked | Purpose |
| --- | --- | --- |
| 2 | `triage-issue` | Structured triage with acceptance criteria |
| 3 | `plan-issue` | Implementation plan with file-by-file changes |
| 6 | `review-pr` | Code review against project conventions |
| 6 | `design` | Design system compliance (if UI changed) |

## Output

When the skill completes, summarise what was done:

- Issue number and title.
- PR number and link.
- Summary of changes made.
- Any open items or follow-ups noted during review.
