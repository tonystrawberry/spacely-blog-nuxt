import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'

// Predefined categories for articles
const categories = [
  'Vue',
  'Nuxt',
  'Frontend',
  'Backend',
  'DevOps',
  'Architecture',
  'Security',
  'Performance',
  'Testing',
  'Design',
] as const

// Predefined tags for articles
const tags = [
  'vue',
  'nuxt',
  'typescript',
  'javascript',
  'composables',
  'composition-api',
  'pinia',
  'state-management',
  'ssr',
  'ssg',
  'performance',
  'optimization',
  'seo',
  'accessibility',
  'a11y',
  'testing',
  'vitest',
  'unit-testing',
  'e2e',
  'tailwind',
  'css',
  'styling',
  'responsive-design',
  'mobile',
  'pwa',
  'animations',
  'transitions',
  'components',
  'patterns',
  'best-practices',
  'architecture',
  'api',
  'graphql',
  'rest',
  'data-fetching',
  'deployment',
  'vercel',
  'serverless',
  'ci-cd',
  'github-actions',
  'automation',
  'security',
  'authentication',
  'i18n',
  'localization',
  'nuxt-content',
  'markdown',
  'blog',
  'cms',
  'beginner',
  'advanced',
] as const

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
        category: z.enum(categories).optional(),
        tags: z.array(z.string()).default([]),
      })
    })),
  }
})
