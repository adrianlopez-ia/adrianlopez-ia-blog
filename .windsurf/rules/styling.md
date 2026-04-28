---
description: Tailwind v4 CSS-first config (design tokens, container queries, theming)
activationMode: glob
globs: ['**/*.css', '**/*.astro']
---

# Styling Guidelines (Tailwind v4)

## Tailwind v4 CSS-First Config

- Use `@theme` in CSS for design tokens (colors, fonts, spacing).
- Use `@import 'tailwindcss'` at top of global CSS.

```css
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --color-brand-500: #5b5bf7;
  --color-surface-50: #fafafa;
  --color-surface-950: #0a0a1a;
}
```

## Container Queries

- Prefer `@container` over media queries when styling components by their container size.

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

## Theming (Dark/Light)

- Use CSS variables for theming. Define in `:root` and `.dark`.

```css
@layer base {
  :root {
    --color-bg: var(--color-surface-50);
    --color-text: var(--color-surface-900);
    color-scheme: light;
  }

  :root.dark {
    --color-bg: var(--color-surface-950);
    --color-text: var(--color-surface-50);
    color-scheme: dark;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
  }
}
```

## No CSS-in-JS

- Use Tailwind utility classes and CSS variables only.
- Avoid inline styles or runtime CSS-in-JS.

## Class Binding in Astro

- Use `class:list` for conditional classes.

```astro
<article class:list={['post-card', 'rounded-lg', { 'ring-2 ring-brand-500': featured }]}>
```

## Enter Transitions

- Use `@starting-style` for enter transitions (CSS-only).

```css
@starting-style {
  .fade-in {
    opacity: 0;
    transform: translateY(10px);
  }
}

.fade-in {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

## Tailwind Utilities

- Prefer Tailwind utility classes over custom CSS when possible.
- Use `@layer components` for reusable component patterns.

```css
@layer components {
  .prose {
    max-width: 72ch;
    line-height: 1.8;
  }
}
```
