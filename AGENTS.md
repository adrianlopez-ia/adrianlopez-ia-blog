## Purpose
This repo is a monorepo with **lefthook**, **turborepo**, **Biome**, and **TypeScript strict**. This file is the practical “how to work here” guide for agents.

## Project context (verified in repo)
- **Web**: Astro (see `apps/web/*.astro`)
- **API**: Hono (see `apps/api/src`)
- **DB**: Turso / libSQL (see `packages/database`)
- **AI**: provider pool exists (OpenRouter → Groc → Google Gemini) (see `packages/ai`)
- **UI rules**: Gestalt + "premium dark mode" guidance lives in `.cursorrules` and `.windsurf/rules/`
- **IDE rules**: Cursor (`.cursor/rules/*.mdc`) + Windsurf (`.windsurf/rules/*.md`) + Antigravity (AGENTS.md)

## Core principles
1. **AI failover**: prefer the AI pool for reliability; don’t hardcode a single provider.
2. **Framework agnostic UI**: the web app can host React/Vue/Svelte islands—pick the smallest tool that fits.
3. **Gestalt design**: UI changes should follow `.cursorrules` (proximity, similarity, figure-ground).
4. **Clean monorepo**: keep packages decoupled; share types/utils in `packages/*` instead of cross-app imports.
5. **English-only by default**: UI copy, metadata, and comments in English unless the user requests localization.

## Roadmap (living list)
- [ ] Keep this list honest: only mark items done when they exist in the repo.
- [ ] Add/adjust as the user requests new features.

## Monorepo boundaries (typical)
- Put shared types in `packages/types`
- Put reusable utilities in `packages/utils`
- Keep route handlers thin; push logic into services/modules (don’t let `routes/*` become business-logic dumps)

## Fast start
- Use **small, focused changes**.
- Don’t create commits/push/PRs unless the user explicitly asks.
- Prefer repo tooling (Turbo/Biome) over ad-hoc scripts.

## Common commands
- **Typecheck**: `npx turbo typecheck`
- **Lint**: `npx turbo lint`
- **Tests**: `npx turbo test`
- **Biome (manual)**: `npx @biomejs/biome check .`

## Hooks (lefthook)
- **pre-commit**: Biome (staged) + Turbo typecheck
- **commit-msg**: conventional commit validation
- **pre-push**: Turbo test + Turbo lint

Windows note:
- Commit messages may be CRLF; strip `\r` from the first line before regex checks.

## Git workflow
- **Branch naming**: `feature/*`, `fix/*`, `chore/*`
- **Commit format**: `type(scope): description`
- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Scope**: optional only if `lefthook.yml` allows `type: description`

Examples:
- `feat(ai): add streaming chat endpoint`
- `ci(lefthook): enforce conventional commit message format`
- `fix(api): validate input with zod`

## TypeScript + code conventions
- Strict TS: **no `any`** (use `unknown` + narrow)
- **Named exports only**, avoid barrel re-exports
- Prefer `const`, functional patterns, small pure helpers
- Avoid `console.log` in production code (use the project logger if present)

## Language consistency
- Default to **English** for UI copy, metadata, and comments unless the user explicitly requests Spanish/localization.

## Security + data safety (must-follow)
- Never commit `.env` or secrets; use `.env.example` templates
- Never return API keys to the client
- Validate external/user input with Zod before use
- Sanitize user-provided HTML before rendering
- Cookies: `httpOnly`, `secure` in prod, `sameSite` sensible defaults
- Avoid `eval`, dynamic require with user input, and raw SQL

## Definition of done (before saying “finished”)
- No new lints in touched files
- Typecheck passes for affected packages
- No secrets added (`.env`, keys, tokens)
- Hooks that apply to the change would pass (or you document why they can’t run locally)

## When something fails
- **Hook failure**: fix the root cause (don’t bypass hooks unless user asks)
- **Type errors**: fix types at the boundary (Zod schema → inferred types)
- **CI/tests failing**: reproduce with the commands above, then iterate

## Agent guidelines
- Be concise in chat; be thorough in code and verification.
- Prefer “make it correct first” over premature refactors.
- Keep diffs reviewable: avoid sweeping formatting changes unrelated to the task.
