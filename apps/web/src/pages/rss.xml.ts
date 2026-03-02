import type { CollectionEntry } from 'astro:content';
import rss from '@astrojs/rss';
import { getPublishedPosts } from '@lib/content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'Adrian Lopez Blog',
    description: 'Modern web development, AI, and cutting-edge technologies.',
    site: context.site?.toString() ?? 'https://adrianlopez.dev',
    items: posts.map((post: CollectionEntry<'blog'>) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/blog/${post.id}`,
    })),
    customData: '<language>en-us</language>',
  });
}
