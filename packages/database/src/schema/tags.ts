import { relations } from 'drizzle-orm';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { posts } from './posts';

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color'),
});

export const postsToTags = sqliteTable(
  'posts_to_tags',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}));

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, { fields: [postsToTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postsToTags.tagId], references: [tags.id] }),
}));
