---
name: triage-issue
description: Read a GitHub issue and post a concise triage result back to the issue as a comment, covering scope, assumptions, acceptance criteria, and impacted areas.
---

# Skill: Triage Issue

Read a GitHub issue, analyse it in the context of this repository, and post
a structured triage comment back to the issue on GitHub. The triage makes
the issue actionable for whoever implements it next — human or agent.

## How to invoke

The user provides an issue reference (URL, `#number`, or owner/repo#number).
Fetch the issue title, body, labels, and any existing comments, then work
through the sections below. When done, post the triage as a comment on the
issue using `gh`.

## 1. Understand the issue

- Read the issue title, body, and all comments.
- Identify the **core ask** — what does the reporter actually want?
- Note anything vague, contradictory, or missing.

If the issue is too vague to triage meaningfully, **stop and ask the user**
for clarification before posting. Do not guess at large ambiguities.

## 2. Assess scope and complexity

Rate the issue on a simple scale:

| Size | Meaning |
| --- | --- |
| **Small** | Isolated change, one file or layer, < 30 min |
| **Medium** | Touches API + web or adds a new entity, 30–90 min |
| **Large** | Cross-cutting, new DB tables + API + UI + codegen, > 90 min |

If the issue is **Large**, suggest how to split it into smaller,
independently deliverable pieces.

## 3. Identify impacted areas

Map the change to the parts of the codebase it will touch:

| Area | Expected impact |
| --- | --- |
| `api/prisma/schema.prisma` | New/changed models? |
| `api/src/app.ts` | New/changed routes or Zod schemas? |
| `api/openapi.json` (generated) | Will need regeneration? |
| `web/src/api/generated/` (generated) | Will need regeneration? |
| `web/src/` (components/pages) | New/changed UI? |
| Database (`api/data/workshop.db`) | Schema push needed? |

Omit rows that are clearly unaffected.

## 4. Surface assumptions and business rules

List any assumptions you are making and any domain rules that apply. For
this project, common concerns include:

- Booking conflict rules (double-booking, overlapping time slots).
- Resource availability constraints.
- Required vs. optional fields and their validation bounds (e.g.
  `title` 1–120 chars, `description` max 500 chars).
- Whether create and update operations share the same schema or differ.

## 5. Draft acceptance criteria

Write a short, testable checklist. Each item should be verifiable without
subjective judgement. Aim for 3–7 items. Example format:

- [ ] `POST /resources` accepts the new field and persists it.
- [ ] `GET /resources` returns the new field in the response.
- [ ] The web UI displays the new field on the resource card.
- [ ] `npm run generate` succeeds and produced updated hooks.
- [ ] `npm run typecheck` passes.

## 6. Flag risks and open questions

- Note anything that could go wrong or that needs a decision before
  implementation starts.
- Call out if the change risks breaking the codegen pipeline, existing
  API consumers, or booking logic.

## 7. Post triage to GitHub

Format the triage result as a Markdown comment and post it to the issue:

```
gh issue comment <number> --body "<triage markdown>"
```

Use this structure for the comment:

```markdown
## 🔍 Triage

**Core ask:** <one-sentence summary>

**Size:** Small / Medium / Large

### Impacted areas
<table from step 3>

### Assumptions & business rules
<bullet list from step 4>

### Acceptance criteria
<checklist from step 5>

### Risks / open questions
<bullet list from step 6, or "None identified.">
```

Keep the comment **concise** — aim for ≤ 30 lines of Markdown. The triage
should be skimmable in under a minute.

## Output guidelines

- Be specific to **this** issue; do not produce generic boilerplate.
- Use plain language; avoid jargon the reporter didn't use.
- Prefer concrete examples over abstract descriptions.
- If the issue already has a thorough description with acceptance
  criteria, acknowledge what is already clear and only add what is
  missing.
- After posting, confirm to the user that the comment was posted and
  include a link.
