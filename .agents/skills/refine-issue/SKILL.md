---
name: refine-issue
description: Turn a vague GitHub issue or requirement into an implementation-ready brief by surfacing hidden assumptions, business rules, and edge cases.
---

# Skill: Refine Issue

Take a lightweight issue, feature request, or vague requirement and produce
a structured, implementation-ready brief. The goal is to make the
requirement **actionable** — not to fill in a giant template.

## How to invoke

When the user provides an issue (URL, number, or pasted text), gather the
raw requirement and then work through the sections below.

## 1. Clarify before committing

If the requirement is ambiguous, **stop and ask focused follow-up
questions** before writing the brief. Good questions target:

- Who is the user or role affected?
- What does the user actually need to accomplish?
- What words in the requirement could mean more than one thing?
- Are there implicit business rules or constraints?
- What is explicitly out of scope?

Ask only the questions that matter — skip anything already clear from
context. Batch related questions together (max 3–5 per round) so the
conversation stays efficient.

## 2. Produce the brief

Once enough is known, write a brief containing **only the sections that
add value** for the specific issue. Not every section is needed every time.

### Problem statement

One or two sentences: what is wrong or missing today?

### User story

> As a [role], I want [goal] so that [benefit].

### Acceptance criteria

A short, testable checklist. Each item should be verifiable without
subjective judgment.

### Business rules

Explicit rules that must hold (e.g. "A resource cannot be booked if it is
already reserved for the same time slot").

### Assumptions

Things treated as true unless the user says otherwise.

### Non-goals

What this work intentionally does **not** cover.

### Edge cases & validation

Tricky scenarios, boundary conditions, or input-validation rules worth
calling out early.

### Impacted areas

Which parts of the codebase are affected:

| Area | Impact |
| --- | --- |
| `api/` (routes, schemas) | … |
| `api/prisma/schema.prisma` | … |
| `web/` (components, pages) | … |
| Generated client (`npm run generate`) | … |
| Database (new tables, columns) | … |

## 3. Open questions

List any remaining unknowns that could not be resolved during
clarification. These are things the team should decide before
implementation begins.

## Output guidelines

- Keep the brief **concise** — aim for ≤ 1 page of content.
- Use plain language; avoid jargon the user didn't introduce.
- Prefer concrete examples over abstract descriptions.
- If the original issue is on GitHub, suggest updating it with the refined
  brief or posting it as a comment.
