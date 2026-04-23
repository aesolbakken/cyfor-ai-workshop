---
name: design
description: Apply and verify the Forsvaret-inspired design system for this project. Covers colors, typography, component patterns, and do/don't rules.
---

# Skill: Design System

Apply the **Forsvaret-inspired design system** documented in
[`DESIGN.md`](../../DESIGN.md) to new or existing UI components in the
`web/` package.

## When to invoke

Use this skill when:

- Creating a new page or component in `web/src/`
- Restyling existing components to match the design system
- Reviewing a PR that touches frontend styling

## Reference

Read `DESIGN.md` at the repo root for the complete token table,
component patterns, and code examples. The key points are summarized
below.

## Design tokens (quick reference)

### Colors (Tailwind utilities)

| Utility prefix     | Hex       | Typical use                  |
| ------------------ | --------- | ---------------------------- |
| `fv-black`         | `#191b21` | Text, primary buttons        |
| `fv-grey`          | `#f5f7f8` | Page background              |
| `fv-green-light`   | `#f1f2f0` | Card tint, badge background  |
| `fv-green`         | `#c6c7c4` | Borders, dividers            |
| `fv-blue-light`    | `#e2e6e9` | Secondary surfaces           |
| `fv-blue`          | `#e6f3fd` | Info highlights              |
| `fv-beige-light`   | `#ede9e8` | Warm accent areas            |
| `fv-beige`         | `#e3ddd8` | Warm accent borders          |
| `fv-focus`         | `#5783a6` | Focus rings, links           |
| `fv-danger`        | `#b91c1c` | Errors, destructive actions  |

### Typography

- **Font:** Inter (system fallback stack)
- **Labels/section headings:** `text-xs font-bold uppercase tracking-widest`
- **Body:** `text-base font-normal`
- **Headings:** light weight (400) for large, medium (500) for small

## Checklist for applying the design

When styling a component, verify each of these:

1. **No shadows** — remove any `shadow-*` classes.
2. **No dark mode** — remove all `dark:` variant classes.
3. **No gradients** — do not use `bg-gradient-*`.
4. **No pill shapes** — do not use `rounded-full` on buttons or badges.
   Use no radius or `rounded-sm`.
5. **Buttons** — primary: `bg-fv-black text-white`, rectangular. Secondary:
   `border-2 border-fv-black`, transparent background.
6. **Inputs** — `border border-fv-green`, focus: `outline-2
   outline-offset-2 outline-fv-focus`.
7. **Cards** — `bg-white border border-fv-green`, no shadow, `p-5` padding.
8. **Badges** — `bg-fv-green-light` or `bg-fv-blue-light`, `text-xs`,
   `rounded-sm` or none.
9. **Section headings** — uppercase label style: `text-xs font-bold
   uppercase tracking-widest`.
10. **Page background** — `bg-fv-grey`.
11. **Colors sparingly** — most of the UI should be white/grey. Accent
    colors appear only in small doses.
12. **Generous whitespace** — use `space-y-8` between sections, `p-5`
    inside cards.

## Review checklist (for PR reviews)

When reviewing a PR that touches frontend styling:

- [ ] Does the change follow the color palette from DESIGN.md?
- [ ] Are there any `shadow-*` or `dark:` classes introduced?
- [ ] Are buttons rectangular (not pill-shaped)?
- [ ] Are focus states using `outline-fv-focus`?
- [ ] Is the overall expression calm, clean, and flat?
- [ ] Are section headings using the uppercase label pattern?

## Output format

When applying this skill, structure your response as:

1. **Changes made** — list each component/file and what was updated.
2. **Design tokens used** — which colors, typography styles were applied.
3. **Compliance notes** — any places where the design system was
   intentionally deviated from (with justification).
