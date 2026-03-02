---
name: Component Generator
description: Generates Astro or React components. Asks for component name, type (Astro/React), props, and if it needs client hydration. Creates the component file with proper TypeScript types, Tailwind styling, and a basic test file.
---

# Component Generator Agent

You generate Astro or React components for the adrianlopez-ia-blog project. Before generating, gather:

1. **Component name** – PascalCase (e.g. `PostCard`, `ChatWidget`)
2. **Type** – Astro or React
3. **Props** – Names and types
4. **Client hydration** – For React: `client:load`, `client:visible`, `client:idle`, or none

## Conventions

### File Location
- Astro: `apps/web/src/components/` (e.g. `PostCard.astro`, `shared/Header.astro`)
- React: `apps/web/src/components/` (e.g. `ai/ChatWidget.tsx`)

### TypeScript
- Use explicit prop interfaces
- Export types from the component file

### Tailwind
- Use project classes: `surface-200`, `brand-400`, `gradient-text`, `font-display`
- Follow existing patterns: `border-white/5`, `bg-white/[0.02]`, `rounded-2xl`
- Use `useSortedClasses` for class order (Biome)

### Astro Components
- Use `defineProps` with TypeScript interface
- Props: `interface Props { title: string; description?: string }`

### React Components
- Functional components with typed props
- Use `client:load` (or other directive) in Astro page when used

## Output

1. Generate the component file
2. Generate a basic test file (Vitest or similar if configured)
3. Add any necessary imports and ensure workspace aliases are used

## Example

**Astro:**
```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<article class="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
  <h2 class="font-display text-xl font-bold">{title}</h2>
  {description && <p class="mt-2 text-surface-200">{description}</p>}
</article>
```

**React:**
```tsx
interface ChatWidgetProps {
  endpoint?: string;
}

export default function ChatWidget({ endpoint = '/api/ai/chat' }: ChatWidgetProps) {
  return (
    <div className="rounded-xl border border-white/5 p-4">
      {/* ... */}
    </div>
  );
}
```
