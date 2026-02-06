import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'

export default defineContentConfig({
  collections: {
    content: defineCollection(asSitemapCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string().default(''),
        description: z.string().default(''),
        date: z.string().default(new Date().toISOString().split('T')[0]),
        author: z.string().default(''),
        image: z.string().optional(),
        category: z.string().default(''),
        tags: z.array(z.string()).default([]),
      })
    })),
  }
})
