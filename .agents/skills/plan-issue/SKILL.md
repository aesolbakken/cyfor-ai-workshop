---
name: plan-issue
description: Turn a triaged GitHub issue into a concrete implementation plan with file-by-file changes, code patterns to follow, and an ordered todo list. Posts the plan to the issue.
---

# Skill: Plan Issue

Given a GitHub issue that has been triaged (or is already well-defined),
produce a **concrete implementation plan** that an agent or developer can
follow step by step. The plan bridges the gap between "what to build"
(triage/refinement) and "how to build it" (code changes).

## How to invoke

The user provides an issue reference (URL, `#number`, or `owner/repo#number`).
Optionally, triage output or a refined brief may already exist as an issue
comment or in the conversation context. Fetch the issue and all comments,
then work through the sections below.

## 1. Gather context

- Read the issue title, body, labels, and all comments (especially any
  triage or refinement comments).
- Identify the **acceptance criteria** — what must be true when this is done?
- If acceptance criteria are missing or unclear, **stop and ask the user**
  before planning.

## 2. Analyse the codebase

Explore the parts of the codebase that the change will touch. For this
project, the typical areas are:

| Area | What to look for |
| --- | --- |
| `api/prisma/schema.prisma` | Existing models, relations, field patterns |
| `api/src/app.ts` | Existing routes, Zod schemas, response helpers |
| `api/src/db.ts` | Prisma client singleton |
| `web/src/App.tsx` | How existing hooks are consumed, query invalidation |
| `web/src/api/` | Generated hooks, client setup |
| `web/src/index.css` | Tailwind v4 theme tokens |

Read enough to understand the existing patterns so the plan can reference
them concretely (e.g., "follow the `toResourceResponse` pattern for date
conversion").

## 3. Produce the plan

Write a structured plan containing these sections:

### Summary

One paragraph: what we are building and why.

### File-by-file changes

For each file that needs to change, describe:

- **File path** — e.g. `api/prisma/schema.prisma`
- **What changes** — specific additions, modifications, or deletions.
- **Patterns to follow** — reference existing code patterns to mirror.
- **Order** — note dependencies (e.g., schema before routes, routes before
  UI).

Group by layer: Database → API → Codegen → Web.

### Implementation todos

An ordered checklist of concrete steps. Each todo should be independently
verifiable. Example:

1. Add `Booking` model to `api/prisma/schema.prisma` with fields …
2. Add `BookingSchema` and `CreateBookingSchema` Zod schemas in `api/src/app.ts`
3. Add `POST /bookings` route using `createRoute` + `app.openapi`
4. Add `GET /bookings` route …
5. Run `npm run generate` to regenerate OpenAPI doc and Orval hooks
6. Create `web/src/BookingList.tsx` consuming `useGetBookings`
7. Run `npm run typecheck` — must pass

### Parallelisation opportunities

Identify which todos can be done in parallel by sub-agents and which must
be sequential. For example:

- Schema + API routes are sequential (routes depend on schema).
- Multiple independent web components can be built in parallel once hooks
  are generated.

### Risks and edge cases

Flag anything that could go wrong during implementation. Reference specific
acceptance criteria or business rules from the triage.

## 4. Review the plan

Before posting, self-review:

- [ ] Every acceptance criterion from the triage has a matching todo.
- [ ] The codegen pipeline step (`npm run generate`) is included at the
      right point.
- [ ] Validation steps (`npm run typecheck`, `npm run build`) are included.
- [ ] File paths are accurate (verified by reading the codebase).
- [ ] The plan follows all repo conventions from `AGENTS.md`.

## 5. Post the plan to GitHub

Format the plan as a Markdown comment and post it to the issue:

```
gh issue comment <number> --body "<plan markdown>"
```

Use this structure for the comment:

```markdown
## 📋 Implementation Plan

**Summary:** <one paragraph>

### File-by-file changes

#### Database layer
- **`api/prisma/schema.prisma`** — <changes>

#### API layer
- **`api/src/app.ts`** — <changes>

#### Codegen
- Run `npm run generate`

#### Web layer
- **`web/src/…`** — <changes>

### Todos
<ordered checklist>

### Parallelisation
<which steps can be parallel>

### Risks
<bullet list, or "None identified.">
```

Keep the comment **focused and actionable** — aim for ≤ 50 lines of
Markdown. The plan should be followable without referring back to the
issue body.

## 6. Return the plan as context

After posting, return the full plan in your response so it can be used
as working context by the next phase (implementation). Include the raw
todo list for direct use.

## Output guidelines

- Be specific to **this** issue and **this** codebase; no generic advice.
- Reference real file paths and existing code patterns by name.
- Every todo must be concrete enough to execute without further research.
- If the issue is too large for a single plan, suggest splitting it and
  plan only the first piece.
