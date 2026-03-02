import { getCollection } from 'astro:content';
import { estimateReadingTime, stripHtml } from '@blog/utils';

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts
    .map((post) => ({
      ...post,
      data: {
        ...post.data,
        readingTime: post.data.readingTime ?? estimateReadingTime(stripHtml(post.body ?? '')),
      },
    }))
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getPostsByTag(tag: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) =>
    post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

export function getAllTags(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  const tagMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
