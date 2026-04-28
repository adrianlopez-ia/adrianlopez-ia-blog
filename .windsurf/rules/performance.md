---
description: Performance optimizations for Lighthouse and Astro
activationMode: glob
globs: ['apps/web/**/*']
---

# Performance Guidelines

## Target: 100 Lighthouse Score

Aim for 100 in Performance, Accessibility, Best Practices, SEO.

## Images

- **Lazy load** — Use `loading="lazy"` for below-the-fold images
- **Astro Image** — Use `<Image />` for optimized srcset and WebP

```astro
---
import { Image } from 'astro:assets';
---
<!-- ✅ GOOD -->
<Image src={post.cover} alt={post.title} width={800} height={450} loading="lazy" />

<!-- For external images -->
<img src={url} alt="..." loading="lazy" decoding="async" />
```

```html
<!-- ❌ BAD - No lazy, no optimization -->
<img src="/large-hero.jpg" />
```

## Client-Side JS

- **Minimize** — Use Astro islands; only add `client:*` for interactive components
- **Islands architecture** — Default to zero JS; hydrate only what needs interactivity

```astro
---
import ChatWidget from '../components/ai/ChatWidget';
---
<!-- ✅ GOOD - Only ChatWidget gets JS -->
<ChatWidget client:visible />

<!-- ❌ BAD - Unnecessary client hydration -->
<StaticCard client:load />
```

## Content Collections

Use Content Collections for static blog data (MDX, etc.) — built at build time, no runtime fetch.

```typescript
// ✅ GOOD - Static at build
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
```

## Caching

- Implement proper caching headers for API responses
- Use `Cache-Control` for static assets

```typescript
// API response with cache
return c.json(data, 200, {
  headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
});
```

## Code Splitting

Use dynamic imports for heavy or rarely-used modules.

```typescript
// ✅ GOOD - Lazy load
const HeavyChart = lazy(() => import('./HeavyChart'));

// ❌ BAD - Eager load for everything
import HeavyChart from './HeavyChart';
```

## Fonts

- Use `font-display: swap` to avoid FOIT
- Preload critical fonts

```css
/* ✅ GOOD */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter.woff2') format('woff2');
}
```

## Checklist

- [ ] Images use `loading="lazy"` or Astro Image
- [ ] Minimal client-side JS (islands)
- [ ] Content Collections for static data
- [ ] Caching headers on API
- [ ] Dynamic imports for heavy code
- [ ] Fonts with `display=swap`
