---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
metadata:
  author: claude
  version: "2.0"
  tags: [frontend, design, ui, css, animation]
---

# Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Quick Decision Path

When designing, answer these in order:

1. **Purpose** → What problem does this solve? Who uses it?
2. **Tone** → Which extreme best fits? (minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art-deco, soft-pastel, industrial...)
3. **Differentiation** → What's the ONE memorable thing?
4. **Constraints** → Framework, performance, accessibility requirements

Then implement with focus on:
- Typography (distinctive fonts over generic like Inter/Roboto)
- Color (cohesive with CSS variables, bold accents over timid palettes)
- Motion (CSS-first, staggered reveals, scroll-triggering, hover states)
- Spatial (asymmetry, overlap, generous negative space or controlled density)
- Visual details (textures, gradients, shadows, decorative borders)

## Tone Examples

| Tone | Use When | Characteristics |
|------|----------|----------------|
| Brutally Minimal | Data-heavy apps, tools | Stark contrast, raw typography, functional |
| Maximalist Chaos | Creative portfolios, art | Layered elements, bold colors, dynamic |
| Retro-Futuristic | Tech products, gaming | Neon, grid patterns, sci-fi aesthetics |
| Organic/Natural | Wellness, sustainability | Earth tones, soft curves, botanical |
| Luxury/Refined | Premium brands, hospitality | Gold accents, serif fonts, generous spacing |
| Soft/Pastel | Baby, wedding, lifestyle | Light backgrounds, muted tones, rounded |
| Editorial/Magazine | News, blogs, content | Strong typography hierarchy, grid layouts |
| Brutalist/Raw | Architecture, design studios | Exposed structure, bold type, high contrast |
| Art Deco/Geometric | Fashion, luxury events | Symmetry, gold/black, stepped patterns |
| Industrial/Utilitarian | Manufacturing, logistics | Monospace, functional, high contrast |

## Typography Checklist

```css
/* ❌ Never use */
font-family: 'Inter', 'Roboto', Arial, sans-serif;

/* ✅ Instead, choose distinctive fonts */
font-family: 'Playfair Display', 'Cormorant Garamond', serif;
font-family: 'Space Grotesk', 'JetBrains Mono', monospace;
font-family: 'DM Serif Display', 'Instrument Serif', serif;
```

Pair one distinctive display font with one refined body font. Use Google Fonts or premium font services.

## Color System Example

```css
:root {
  /* Dominant + accent beats timid evenly-distributed */
  --bg-primary: #F8F5F0;        /* Warm cream - dominant */
  --accent-primary: #5E9286;     /* Sage green - brand */
  --accent-secondary: #C4A77D;   /* Warm gold - luxury touch */
  --text-primary: #2C2C2C;       /* Near-black - readable */
  --text-muted: #6B6B6B;        /* Soft gray - secondary */
  --surface: #FFFFFF;            /* White - cards/elevated */
}
```

## Animation Patterns

```css
/* High-impact: staggered page load reveals */
.hero-title { animation: fadeSlideUp 0.6s ease-out 0.1s both; }
.hero-subtitle { animation: fadeSlideUp 0.6s ease-out 0.2s both; }
.hero-cta { animation: fadeSlideUp 0.6s ease-out 0.3s both; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scroll-triggered fade-in */
.reveal { opacity: 0; transform: translateY(30px); }
.reveal.visible { animation: fadeIn 0.5s ease-out forwards; }

/* Hover: scale + shadow */
.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
```

## Background Textures

```css
/* Gradient mesh - creates atmosphere */
.hero {
  background:
    radial-gradient(ellipse at 20% 30%, rgba(94,146,134,0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(196,167,125,0.2) 0%, transparent 50%),
    linear-gradient(180deg, #F8F5F0 0%, #EDE8E0 100%);
}

/* Noise overlay for depth */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  opacity: 0.03;
  pointer-events: none;
}

/* Subtle pattern */
.section {
  background-color: #F8F5F0;
  background-image: url("data:image/svg+xml,..."); /* Geometric pattern */
  background-size: 60px 60px;
}
```

## Visual Hierarchy

- Use scale contrast: dramatically large headings (4rem+) vs smaller body (1rem)
- Add decorative elements: thin borders, subtle gradients, accent shapes
- Break the grid intentionally: full-bleed images, overlapping elements
- Use negative space as a design element, not just emptiness

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Output Checklist

Before finishing, verify:
- [ ] Font choices are distinctive (not Inter/Roboto/Arial)
- [ ] Colors have purpose and hierarchy
- [ ] Animations are smooth and meaningful
- [ ] Layout creates visual interest (not just centered boxes)
- [ ] Background has depth (not flat solid color)
- [ ] Reduced motion is respected
- [ ] Design is cohesive across all components

---

**Remember**: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
