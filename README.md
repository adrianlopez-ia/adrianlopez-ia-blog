# adrianlopez-ia-blog

Modern fullstack monorepo blog with parallax landing, AI chatbots, and multi-framework examples.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Astro 5 (MDX, Content Collections, View Transitions) |
| Backend | Hono (multi-runtime, edge-ready) |
| Database | Drizzle ORM + Turso (SQLite edge) |
| Styling | Tailwind CSS v4 |
| Animations | GSAP ScrollTrigger + Lenis |
| AI/Chat | Vercel AI SDK + LangChain.js |
| Linting | Biome + Stylelint |
| Testing | Vitest + Playwright |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm check
```

## Project Structure

```
apps/
  web/          → Astro 5 blog + parallax landing
  api/          → Hono REST API
packages/
  ui/           → Shared React components
  database/     → Drizzle ORM schemas
  ai/           → AI/Agent shared logic
  config/       → Shared TypeScript & Biome configs
  types/        → Shared TypeScript types
  utils/        → Shared utilities
examples/
  react-chatbot/    → React + Vercel AI SDK chatbot
  vue-agent/        → Vue 3 conversational agent
  svelte-widget/    → Svelte 5 interactive widget
  solid-dashboard/  → SolidJS real-time dashboard
  vanilla-bot/      → Web Components AI bot
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Scripts

| Command | Description |
|---------|------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all code with Biome |
| `pnpm check` | Lint + format with Biome |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:e2e` | Run E2E tests with Playwright |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio |
