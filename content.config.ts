import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      // Ensure frontmatter is parsed
      parser: {
        frontmatter: true,
      },
    }),
  },
})
