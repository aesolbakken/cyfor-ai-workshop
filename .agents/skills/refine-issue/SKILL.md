# Skill: Refine Issue

Turn a vague GitHub issue, feature request, or one-liner requirement into an implementation-ready brief for the cyfor-workshop codebase.

## Workflow

### 1. Clarify before committing

Read the issue or requirement. If any of the following are unclear, ask the user targeted follow-up questions **before** writing the brief:

- Who is the user or role affected?
- What is the desired outcome vs. the current behavior?
- Are there constraints on scope (e.g. "API only", "no auth")?
- Are there implicit business rules (e.g. uniqueness, required fields, category limits)?
- What should explicitly *not* be included?

Limit follow-ups to 3–5 focused questions. Do not ask about things you can answer by reading the codebase.

### 2. Investigate the codebase

Before finalizing the brief, check which parts of the system are affected:

- `api/prisma/schema.prisma` — model changes?
- `api/src/app.ts` — new or changed routes / Zod schemas?
- `web/src/App.tsx` — UI changes?
- `web/src/api/generated/` — will `npm run generate` be needed?
- `api/src/app.test.ts` — new test cases?

### 3. Write the brief

Produce a concise brief with these sections (skip any that don't apply):

```
## Problem statement
One or two sentences: what is wrong or missing, and why it matters.

## User / role
Who is affected.

## User story
As a [role], I want [action] so that [outcome].

## Acceptance criteria
- [ ] Concrete, testable items.

## Non-goals
- Things explicitly out of scope.

## Assumptions
- Anything taken as given that could change.

## Business rules & edge cases
- Hidden rules, validation constraints, boundary conditions.

## Impacted areas
- api/ — ...
- web/ — ...
- generated client — yes/no
- database — ...
- tests — ...
```

Keep it short. The brief should fit in a single screen. Prefer bullet points over paragraphs.
