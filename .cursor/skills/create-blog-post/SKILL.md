---
name: create-blog-post
description: Step-by-step guide to create an MDX blog post with proper frontmatter schema, file naming, content structure, and tag assignment. Use when creating new blog posts, MDX content, or content for the blog.
---

# Create Blog Post

Step-by-step guide to add a new MDX blog post to `apps/web/src/content/blog/`.

## 1. Gather Information

- **Title**: Post title (used for H1 and filename)
- **Description**: 1–2 sentences for SEO and social
- **Tags**: 3–5 tags (e.g. `["Astro", "TypeScript", "Frontend"]`)
- **Cover image** (optional): Path like `/images/post-cover.png`
- **Draft**: `true` to hide from production

## 2. Create Filename

Convert title to kebab-case:

- "Building a Modern Blog" → `building-a-modern-blog.mdx`
- "AI Chatbots with Vercel" → `ai-chatbots-with-vercel.mdx`

## 3. Create File

Path: `apps/web/src/content/blog/[kebab-case-title].mdx`

## 4. Add Frontmatter

Use this schema (from `content.config.ts`):

```yaml
---
title: "Your Post Title"
description: "Brief description for SEO and social sharing."
publishedAt: 2026-03-02
updatedAt: 2026-03-02  # optional
tags: ["Tag1", "Tag2", "Tag3"]
coverImage: "/images/your-cover.png"  # optional
draft: false
---
```

- `readingTime` is optional; computed by `estimateReadingTime` from `@blog/utils` if omitted
- `publishedAt` and `updatedAt` use `z.coerce.date()` – YYYY-MM-DD format

## 5. Add Content Structure

```markdown
# [Title]

Intro paragraph.

## Section 1

Content...

## Section 2

Content with code blocks:

\`\`\`typescript
// example
\`\`\`

## What's Next

Closing thoughts.
```

## 6. Verify

- Run `pnpm build` in `apps/web` to ensure content loads
- Check `getPublishedPosts()` in `apps/web/src/lib/content.ts` – posts with `draft: true` are excluded

## Reference

- Content config: `apps/web/src/content.config.ts`
- Content helpers: `apps/web/src/lib/content.ts`
- Reading time: `packages/utils/src/reading-time.ts` (200 words/min)
