# Design System — Forsvaret-inspired Resource Manager

This document describes how the Forsvaret (Norwegian Armed Forces) visual profile is adapted for the booking/resource management product.

## Design principles

From the Forsvaret profile guidelines:

- **Clean Nordic light**: Large light surfaces, clean typography, simple icons, good imagery, clear language
- **No artificial effects**: No drop shadows, gradients, embossing, or bevels
- **Controlled color use**: Colors are subordinate — used sparingly and only where necessary for the message and visual balance
- **Typography matters**: Weight, contrast, and whitespace are as important as word choice

## Color palette

Derived from Forsvaret's nature-inspired palette:

| Role | Name | Hex | Usage |
| --- | --- | --- | --- |
| Primary | Forsvaret Dark | `#1B2A4A` | Headers, primary buttons, nav |
| Primary Light | Nordic Blue | `#2D4A7A` | Hover states, active elements |
| Background | Arctic White | `#F5F7FA` | Page background |
| Surface | Snow | `#FFFFFF` | Cards, panels |
| Border | Frost | `#D1D9E6` | Borders, dividers |
| Text Primary | Dark Navy | `#1A1F36` | Body text |
| Text Secondary | Slate | `#5A6578` | Supporting text, labels |
| Accent | Forest Green | `#2D6B4F` | Success, positive actions |
| Danger | Signal Red | `#C53030` | Errors, destructive actions |
| Category Badge | Muted Teal | `#E6F0ED` | Category labels background |

## Typography

- **Brand font**: Forsvaret (TTF files in `design-system/NEDLASTING/TYPOGRAFI/FORSVARET/`)
  - Weights: Light, Medium, Bold, Narrow
- **Fallback / body font**: system sans-serif stack (Inter, system-ui, sans-serif)
- **Headings**: Forsvaret Bold or semibold system font
- **Body text**: Regular weight, good line height (1.5–1.6)

For the web app, we use the system font stack since Forsvaret font licensing restricts external use. The design aesthetic is preserved through spacing, color, and restraint.

## Component guidelines

### Buttons
- Primary: `bg-[#1B2A4A]` text white, rounded-md, no shadow
- Secondary: border `#D1D9E6`, text dark, transparent bg
- Disabled: muted background, no pointer

### Form inputs
- Clean borders (`#D1D9E6`), generous padding
- Focus: border darkens to `#2D4A7A`, no glow effects
- No box shadows

### Cards / Panels
- White background, single thin border (`#D1D9E6`)
- No drop shadows, no rounded corners beyond `rounded-lg`
- Generous internal padding

### Category badges
- Muted background tint, small text, rounded-full pill shape
- No bold colors — keep subordinate

### Layout
- Max width container, centered
- Generous vertical spacing between sections
- Clean hierarchy: heading > description > content

## File reference

- Font files: `design-system/NEDLASTING/TYPOGRAFI/FORSVARET/`
- Illustration: `design-system/NEDLASTING/ILLUSTRASJONER/`
