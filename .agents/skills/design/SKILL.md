# Skill: Apply Design System

Apply the Forsvaret-inspired design system to UI changes in this project. Reference `DESIGN.md` at the project root for the full spec.

## Core rules

1. **No artificial effects** — never add drop shadows, gradients, embossing, or bevels
2. **Color is subordinate** — use the primary palette sparingly; large areas should be white or arctic white (`#F5F7FA`)
3. **Clean borders** — single thin borders in frost (`#D1D9E6`), no shadow-based depth
4. **Typography hierarchy** — use font weight and size to establish hierarchy, not color or decoration
5. **Generous whitespace** — let content breathe with padding and spacing

## Color quick reference

| Token | Hex | Use for |
| --- | --- | --- |
| `primary` | `#1B2A4A` | Buttons, headers |
| `primary-light` | `#2D4A7A` | Hover, focus, active |
| `bg` | `#F5F7FA` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `border` | `#D1D9E6` | All borders/dividers |
| `text` | `#1A1F36` | Body text |
| `text-muted` | `#5A6578` | Labels, secondary text |
| `success` | `#2D6B4F` | Positive actions |
| `danger` | `#C53030` | Errors, remove |
| `badge-bg` | `#E6F0ED` | Category pill bg |

## When styling components

- Buttons: `bg-[#1B2A4A] text-white rounded-md px-4 py-2` — no shadow
- Inputs: `border-[#D1D9E6] focus:border-[#2D4A7A] rounded-md` — no ring/glow
- Cards: `bg-white border border-[#D1D9E6] rounded-lg p-4` — no shadow
- Badges: `bg-[#E6F0ED] text-[#2D6B4F] rounded-full px-2 py-0.5 text-xs`
- Error text: `text-[#C53030]`
- Page: `bg-[#F5F7FA] text-[#1A1F36]`

## Tailwind approach

Use arbitrary values (`bg-[#1B2A4A]`) or extend the theme in `tailwind.config` if the project has one. This project uses Tailwind v4 with CSS `@theme` — add custom properties in `web/src/index.css` under `@theme {}`.
