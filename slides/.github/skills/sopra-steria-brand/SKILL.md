---
name: sopra-steria-brand
description: "Applies Sopra Steria official brand colors, typography, and visual identity to any artifact. Use when brand colors, style guidelines, visual formatting, or Sopra Steria design standards apply. Triggers: brand guidelines, Sopra Steria style, brand colors, corporate identity, visual identity, brand styling, presentation styling, document formatting, Sopra Steria branding."
compatibility: Claude Code, GitHub Copilot CLI, OpenAI Codex (via openskills)
---

# Sopra Steria Brand Styling

Apply Sopra Steria's official brand identity (Scandinavia 2026) to presentations, documents, web pages, diagrams, and other visual artifacts.

**Keywords**: branding, corporate identity, visual identity, styling, brand colors, typography, Sopra Steria brand, visual formatting, visual design

## Quick Reference

| Resource | Location |
|----------|----------|
| Logo usage rules | `references/logo-usage.md` |
| Imagery and illustration guidelines | `references/imagery-guidelines.md` |
| Logo (color) | `assets/Sopra-Steria_logo_RGB_black-color.png` |
| Logo (black) | `assets/Sopra-Steria_logo_RGB_black.png` |
| Logo (white, for dark backgrounds) | `assets/Sopra-Steria_logo_RGB_white.png` |
| Diagram styling | Use the **draw-io** plugin's `sopra-steria-style-guide.md` for diagram-specific rules |

## Brand Colors

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Sopra Steria Purple | `#4d1d82` | 77, 29, 130 | Primary brand color, headings, primary borders, network zone boundaries |
| Dark Purple | `#2A1449` | 42, 20, 73 | Dark accents, icon line drawings, deep backgrounds |
| Background Purple | `#ede9f2` | 237, 233, 242 | Light purple backgrounds, section fills |
| Background Beige | `#fdf2e5` | 253, 242, 229 | Warm light backgrounds, alternative section fills |
| Black | `#1d1d1b` | 29, 29, 27 | Body text, primary borders |

### Secondary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Warm Purple | `#8b1d82` | 139, 29, 130 | Secondary purple accent, security boundaries |
| Orange | `#f07d00` | 240, 125, 0 | Primary accent, highlights, key components, CTAs |
| Red | `#cf022b` | 207, 2, 43 | Warnings, critical elements, alerts |
| Grey | `#a8a8a7` | 168, 168, 167 | Neutral elements, secondary borders |
| Light Grey | `#ededed` | 237, 237, 237 | Subtle backgrounds, standard shape fills |

### Sopra Steria Gradient

A signature gradient used for illustrations and decorative elements:

| Stop | Hex | Position |
|------|-----|----------|
| Purple | `#4d1d82` | 0% |
| Warm Purple | `#8b1d82` | 10% |
| Red | `#cf022b` | 60% |
| Orange | `#f07d00` | 100% |

CSS: `linear-gradient(to right, #4d1d82 0%, #8b1d82 10%, #cf022b 60%, #f07d00 100%)`

## Typography

### Main Typeface: Hurme Geometric

Sopra Steria's primary typeface. Two versions:

| Font | Weights | Usage |
|------|---------|-------|
| Hurme Geometric Sans 3 | Bold, Semibold, Regular, Light | Body text, general content |
| Hurme Geometric Sans 4 | Bold, Regular, Light | Headings, tagline, display text |

### Desktop Fallback: Tahoma

For software applications (Word, PowerPoint, Excel, email) when Hurme Geometric is unavailable:

| Font | Weights |
|------|---------|
| Tahoma | Bold, Regular |

### Font Application Rules

| Element | Primary Font | Fallback |
|---------|-------------|----------|
| Headings | Hurme Geometric Sans 4 Bold | Tahoma Bold, Arial Bold |
| Subheadings | Hurme Geometric Sans 3 Semibold | Tahoma Bold |
| Body text | Hurme Geometric Sans 3 Regular | Tahoma Regular |
| Captions / small text | Hurme Geometric Sans 3 Light | Tahoma Regular |
| Display / tagline | Hurme Geometric Sans 4 Bold | Tahoma Bold |

### Web Font Stack

```css
--font-heading: 'Hurme Geometric Sans 4', Tahoma, Arial, sans-serif;
--font-body: 'Hurme Geometric Sans 3', Tahoma, Arial, sans-serif;
```

## Tagline

**"The world is how we shape it."**

- Typeface: Hurme Geometric Sans 4 Bold
- Placement: Underneath the logo, half a symbol's width away, covering the entire width of the logo
- Minimum size: 40 mm width

## Logo

Three variants are available in the `assets/` folder:

| Variant | File | Use on |
|---------|------|--------|
| Color | `Sopra-Steria_logo_RGB_black-color.png` | White or light backgrounds |
| Black | `Sopra-Steria_logo_RGB_black.png` | White or light backgrounds (monochrome) |
| White | `Sopra-Steria_logo_RGB_white.png` | Dark or colored backgrounds |

**Key rules:**
- Minimum size: 32 mm (print) / 170 px (digital)
- Clear space: 2x symbol width (horizontal), 1x symbol width (vertical)
- Never distort, recolor, or add effects to the logo

See `references/logo-usage.md` for complete logo usage guidelines.

## Application Rules

### Presentations (PPTX)

- **Slide backgrounds**: White (default), `#ede9f2` (purple section), `#fdf2e5` (beige section)
- **Title text**: Hurme Geometric Sans 4 Bold / Tahoma Bold, color `#4d1d82`
- **Body text**: Hurme Geometric Sans 3 Regular / Tahoma Regular, color `#1d1d1b`
- **Accent shapes**: Fill with `#f07d00` (orange) or `#4d1d82` (purple)
- **Tables**: Header row fill `#4d1d82` with white text; alternating rows white and `#ede9f2`
- **Logo**: Place on title slide and closing slide; use color variant on light backgrounds

### Documents (DOCX)

- **Headings**: Tahoma Bold, color `#4d1d82`
- **Body**: Tahoma Regular, color `#1d1d1b`
- **Table headers**: Fill `#4d1d82`, text white
- **Horizontal rules / accents**: `#f07d00` (orange)
- **Highlighted text backgrounds**: `#fdf2e5` (beige) or `#ede9f2` (purple)

### Web (HTML / CSS)

```css
:root {
  /* Primary */
  --ss-purple: #4d1d82;
  --ss-dark-purple: #2A1449;
  --ss-bg-purple: #ede9f2;
  --ss-bg-beige: #fdf2e5;
  --ss-black: #1d1d1b;

  /* Secondary */
  --ss-warm-purple: #8b1d82;
  --ss-orange: #f07d00;
  --ss-red: #cf022b;
  --ss-grey: #a8a8a7;
  --ss-light-grey: #ededed;

  /* Typography */
  --font-heading: 'Hurme Geometric Sans 4', Tahoma, Arial, sans-serif;
  --font-body: 'Hurme Geometric Sans 3', Tahoma, Arial, sans-serif;

  /* Gradient */
  --ss-gradient: linear-gradient(to right, #4d1d82 0%, #8b1d82 10%, #cf022b 60%, #f07d00 100%);
}
```

- **Links**: `#4d1d82` (default), `#8b1d82` (hover)
- **Buttons primary**: Background `#4d1d82`, text white
- **Buttons secondary**: Background `#f07d00`, text white
- **Section backgrounds**: Alternate between white, `#ede9f2`, and `#fdf2e5`

### Diagrams

For draw.io and architectural diagrams, defer to the **draw-io** plugin which includes a comprehensive `sopra-steria-style-guide.md` with diagram-specific color usage, line styles, and spacing rules.
