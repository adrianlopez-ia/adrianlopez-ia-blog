import 'dotenv/config';
import { createClient } from './client';
import { comments, posts, postsToTags, tags, users } from './schema';

const db = createClient();

async function seed() {
  console.log('Seeding database...');

  const [admin] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: 'adrian@adrianlopez.dev',
      name: 'Adrian Lopez',
      role: 'admin',
      bio: 'Full-stack developer & AI enthusiast',
    })
    .returning();

  const tagValues = [
    { id: crypto.randomUUID(), name: 'AI', slug: 'ai', color: '#8B5CF6', description: 'Artificial Intelligence' },
    { id: crypto.randomUUID(), name: 'Frontend', slug: 'frontend', color: '#3B82F6', description: 'Frontend development' },
    { id: crypto.randomUUID(), name: 'Backend', slug: 'backend', color: '#10B981', description: 'Backend development' },
    { id: crypto.randomUUID(), name: 'TypeScript', slug: 'typescript', color: '#2563EB', description: 'TypeScript language' },
    { id: crypto.randomUUID(), name: 'DevOps', slug: 'devops', color: '#F59E0B', description: 'DevOps & CI/CD' },
  ];

  await db.insert(tags).values(tagValues);

  const postValues = [
    {
      id: crypto.randomUUID(),
      title: 'Building a Modern Blog with Astro 5 and GSAP',
      slug: 'building-modern-blog-astro-5-gsap',
      excerpt: 'Learn how to create a stunning blog with parallax effects using Astro 5 and GSAP ScrollTrigger.',
      content: 'This is a sample post about building modern blogs...',
      status: 'published' as const,
      authorId: admin!.id,
      readingTime: 8,
      publishedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      title: 'AI Chatbots with Vercel AI SDK',
      slug: 'ai-chatbots-vercel-ai-sdk',
      excerpt: 'A deep dive into building AI-powered chatbots with the Vercel AI SDK and LangChain.',
      content: 'This is a sample post about AI chatbots...',
      status: 'published' as const,
      authorId: admin!.id,
      readingTime: 12,
      publishedAt: new Date(),
    },
  ];

  const insertedPosts = await db.insert(posts).values(postValues).returning();

  await db.insert(postsToTags).values([
    { postId: insertedPosts[0]!.id, tagId: tagValues[1]!.id },
    { postId: insertedPosts[0]!.id, tagId: tagValues[3]!.id },
    { postId: insertedPosts[1]!.id, tagId: tagValues[0]!.id },
    { postId: insertedPosts[1]!.id, tagId: tagValues[3]!.id },
  ]);

  await db.insert(comments).values({
    id: crypto.randomUUID(),
    content: 'Great post! Very informative.',
    postId: insertedPosts[0]!.id,
    authorId: admin!.id,
  });

  console.log('Seed complete!');
}

seed().catch(console.error);
