---
name: create-example-page
description: Step-by-step guide to add a new interactive example page with a chosen framework (React/Vue/Svelte/Solid/Vanilla), create the Astro page wrapper, and link it from the examples index. Use when adding demos, example pages, or framework showcases.
---

# Create Example Page

Step-by-step guide to add a new interactive example page to `apps/web/src/pages/examples/`.

## 1. Choose Framework

Supported frameworks:

- **React** – `client:load` with React components
- **Vue** – Vue 3 Composition API
- **Svelte** – Svelte 5 runes
- **SolidJS** – Signals and fine-grained reactivity
- **Vanilla** – Web Components, no framework

## 2. Create Framework Component (if needed)

For React, create in `apps/web/src/components/`:

```
apps/web/src/components/
  ai/ChatWidget.tsx      # React
  examples/MyWidget.svelte  # Svelte
  examples/MyWidget.vue    # Vue
  ...
```

Use project Tailwind classes: `surface-200`, `brand-400`, `gradient-text`, `font-display`, `border-white/5`, `bg-white/[0.02]`, `rounded-2xl`.

## 3. Create Astro Page

Path: `apps/web/src/pages/examples/[example-name].astro`

Template:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import MyComponent from '@components/examples/MyComponent';
---

<BaseLayout title="Example Title" description="Brief description of the example.">
  <div class="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
    <header class="mb-8">
      <a href="/examples" class="text-sm text-brand-400 hover:underline">&larr; Back to Examples</a>
      <h1 class="mt-4 font-display text-4xl font-bold tracking-tight">
        Example <span class="gradient-text">Title</span>
      </h1>
      <p class="mt-2 text-surface-200">
        Description of what this example demonstrates.
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Framework</span>
        <span class="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Tech</span>
      </div>
    </header>

    <MyComponent client:load />

    <div class="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-6">
      <h2 class="font-display text-lg font-semibold">How it works</h2>
      <ul class="mt-3 space-y-2 text-sm text-surface-200">
        <li>- Point 1</li>
        <li>- Point 2</li>
      </ul>
    </div>
  </div>
</BaseLayout>
```

- Use `client:load` for React/Svelte/Vue/Solid components that need hydration
- Use `client:visible` or `client:idle` for below-the-fold components

## 4. Add to Examples Index

In `apps/web/src/pages/examples/index.astro`, add to the `examples` array:

```javascript
{
  title: 'Your Example Title',
  description: 'Brief description of the example.',
  href: '/examples/your-example-name',
  tech: ['Framework', 'Library', 'API'],
  color: 'brand-400',  // or green-400, orange-400, blue-400, yellow-400
},
```

## 5. Checklist

- [ ] Component created (or existing one reused)
- [ ] Astro page at `apps/web/src/pages/examples/[name].astro`
- [ ] Uses `BaseLayout` with title and description
- [ ] Back link to `/examples`
- [ ] Entry added to examples index
- [ ] Correct `client:*` directive for hydration

## Reference

- Examples index: `apps/web/src/pages/examples/index.astro`
- React example: `apps/web/src/pages/examples/react-chatbot.astro`
- Layout: `apps/web/src/layouts/BaseLayout.astro`
