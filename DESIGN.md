# Design System — Forsvaret-Inspired

A design system for the **cyfor-ai-workshop** booking/resource-management
app, inspired by the Norwegian Armed Forces (Forsvaret) visual identity.

> **Copyright note:** Forsvaret's visual profile is protected by Norwegian
> copyright and criminal law. This document describes a design system
> _inspired by_ their publicly described principles and extracted color
> palette. We do not use their logo, Cera Pro font, or any restricted
> brand assets.

---

## Design Principles

1. **Nordic light** — large light surfaces, clean typography, simple
   monochrome icons, generous whitespace.
2. **No artificial effects** — no drop shadows, no gradients, no
   embossing, no rounded "pill" shapes. Keep it flat and honest.
3. **Colors in a subordinate role** — use sparingly. Most of the UI
   should be white/grey with small doses of accent color.
4. **Controlled and calm** — the overall expression is trustworthy,
   credible, modern, and competent.
5. **Typography does the heavy lifting** — weight, size, letter-spacing,
   and whitespace create hierarchy; avoid relying on color or decoration.

---

## Color Palette

All colors extracted from the Forsvaret public website CSS.

### Primary

| Token              | Hex       | Tailwind var          | Usage                          |
| ------------------ | --------- | --------------------- | ------------------------------ |
| Black              | `#191b21` | `--color-fv-black`    | Text, headings, primary buttons |
| White              | `#ffffff` | (default white)       | Card backgrounds, page chrome  |
| Grey Light         | `#f5f7f8` | `--color-fv-grey`     | Page background                |

### Secondary (nature-inspired)

| Token              | Hex       | Tailwind var              | Usage                          |
| ------------------ | --------- | ------------------------- | ------------------------------ |
| Green Light        | `#f1f2f0` | `--color-fv-green-light`  | Section/card tint              |
| Green              | `#c6c7c4` | `--color-fv-green`        | Borders, dividers              |
| Blue Light         | `#e2e6e9` | `--color-fv-blue-light`   | Secondary surfaces             |
| Blue               | `#e6f3fd` | `--color-fv-blue`         | Info highlights                |
| Beige Light        | `#ede9e8` | `--color-fv-beige-light`  | Warm accent backgrounds        |
| Beige              | `#e3ddd8` | `--color-fv-beige`        | Warm accent borders            |

### Interactive

| Token              | Hex       | Tailwind var              | Usage                          |
| ------------------ | --------- | ------------------------- | ------------------------------ |
| Focus Blue         | `#5783a6` | `--color-fv-focus`        | Focus rings, links, accents    |
| Danger             | `#b91c1c` | `--color-fv-danger`       | Error text, destructive actions |

---

## Typography

| Element     | Size       | Weight | Line-height | Letter-spacing | Extra          |
| ----------- | ---------- | ------ | ----------- | -------------- | -------------- |
| H1          | 2.25rem    | 400    | 1.15        | —              | —              |
| H2          | 1.375rem   | 500    | 1.5         | —              | —              |
| H3          | 1.125rem   | 500    | 1.5         | —              | —              |
| Body        | 1rem       | 400    | 1.66        | —              | —              |
| Small       | 0.875rem   | 400    | 1.6         | —              | —              |
| Label       | 0.75rem    | 700    | 1.5         | 0.12em         | uppercase      |

**Font stack:** `Inter, ui-sans-serif, system-ui, sans-serif` (Inter is a
close free match for Forsvaret's proprietary Cera Pro).

---

## Component Patterns

### Buttons

- **Primary:** `bg-fv-black text-white` — rectangular (no border-radius or
  very small `rounded-sm`), medium weight text.
- **Secondary:** transparent with `border-2 border-fv-black` — same
  rectangular shape.
- **Destructive:** `text-fv-danger border-fv-danger`.
- **Disabled:** reduced opacity (`opacity-40`), `cursor-not-allowed`.
- No shadows. No gradients. No pill shapes.

```html
<!-- Primary -->
<button class="bg-fv-black px-5 py-2.5 text-sm font-medium text-white">
  Add resource
</button>

<!-- Secondary -->
<button class="border-2 border-fv-black px-5 py-2.5 text-sm font-medium">
  Cancel
</button>
```

### Inputs

- Thin bottom border or full border in `fv-green` (muted).
- On focus: `outline-2 outline-offset-2 outline-fv-focus`.
- No rounded corners (or `rounded-sm` at most).
- Placeholder text in muted green.

```html
<input class="w-full border border-fv-green bg-white px-3 py-2.5 text-base
             outline-none focus:outline-2 focus:outline-offset-2
             focus:outline-fv-focus" />
```

### Cards / Sections

- White background, thin `border border-fv-green`.
- **No shadow** — flat is the rule.
- Generous internal padding (`p-5` or `p-6`).
- Section heading as uppercase label.

```html
<section class="border border-fv-green bg-white p-5">
  <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-fv-black">
    Add resource
  </h2>
  <!-- content -->
</section>
```

### Badges / Tags

- Small, flat, muted backgrounds.
- `bg-fv-green-light text-fv-black` or `bg-fv-blue-light text-fv-black`.
- No rounded-full pill shape — use `rounded-sm` or none.
- Text is small and may be uppercase.

```html
<span class="bg-fv-green-light px-2 py-0.5 text-xs font-medium">
  Equipment
</span>
```

---

## Layout

- Maximum content width: `max-w-2xl` (672px) for a single-column layout.
- Page background: `bg-fv-grey` (`#f5f7f8`).
- Vertical spacing between sections: `space-y-8`.
- Cards have `p-5` or `p-6` padding.

---

## Do / Don't

| ✅ Do                                          | ❌ Don't                                    |
| ---------------------------------------------- | ------------------------------------------- |
| Use flat, borderless designs                    | Add `shadow-sm` or any box shadows          |
| Keep colors muted and nature-inspired           | Use saturated primaries for large areas      |
| Let whitespace create breathing room            | Cram elements together                       |
| Use uppercase tracked labels for section heads  | Use large bold headings everywhere            |
| Square/rectangular buttons                      | Pill-shaped (`rounded-full`) buttons          |
| Thin muted borders (`border-fv-green`)          | Thick colorful borders                       |
| Focus rings with `fv-focus` blue               | Browser-default focus outlines               |
| Light mode only                                 | Dark mode (conflicts with Nordic light theme) |

---

## Tailwind Configuration

All custom tokens are defined in `web/src/index.css` using Tailwind v4's
`@theme` directive. No `tailwind.config.js` is used.

```css
@theme {
  --color-fv-black: #191b21;
  --color-fv-grey: #f5f7f8;
  --color-fv-green-light: #f1f2f0;
  --color-fv-green: #c6c7c4;
  --color-fv-blue-light: #e2e6e9;
  --color-fv-blue: #e6f3fd;
  --color-fv-beige-light: #ede9e8;
  --color-fv-beige: #e3ddd8;
  --color-fv-focus: #5783a6;
  --color-fv-danger: #b91c1c;
}
```

This generates utility classes like `bg-fv-black`, `text-fv-focus`,
`border-fv-green`, etc.
