<script setup lang="ts">
const props = defineProps<{
  currentPath: string
  category?: string
  tags?: string[]
  locale: string
  limit?: number
}>()

const { t } = useI18n()
const { authors } = useAuthors()

const limit = props.limit || 3

// Build the locale prefix for content queries (articles are in /{locale}/articles/)
const localePrefix = computed(() => `/${props.locale}/articles/`)

// Fetch related articles based on category and tags
const { data: relatedArticles } = await useAsyncData(
  `related-${props.currentPath}`,
  async () => {
    // Get all articles in the same locale from the articles directory
    const allArticles = await queryCollection('content')
      .where('path', 'LIKE', `${localePrefix.value}%`)
      .all()

    // Filter out current article
    const otherArticles = allArticles.filter((a: any) => a.path !== props.currentPath)

    if (otherArticles.length === 0) return []

    // Score articles by relevance
    const scoredArticles = otherArticles.map((article: any) => {
      let score = 0

      // Category match: +10 points
      if (props.category && article.category === props.category) {
        score += 10
      }

      // Tag matches: +3 points per matching tag
      if (props.tags && props.tags.length > 0 && article.tags) {
        const matchingTags = props.tags.filter(tag => article.tags.includes(tag))
        score += matchingTags.length * 3
      }

      return { article, score }
    })

    // Sort by score (descending), then by date (most recent first)
    scoredArticles.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // If same score, sort by date
      const dateA = new Date(a.article.date || 0).getTime()
      const dateB = new Date(b.article.date || 0).getTime()
      return dateB - dateA
    })

    // Return top articles
    return scoredArticles.slice(0, limit).map(item => item.article)
  },
  { watch: [() => props.currentPath] }
)
</script>

<template>
  <section v-if="relatedArticles && relatedArticles.length > 0" class="bg-[#fef2f5]">
    <!-- Separator -->
    <div class="max-w-7xl mx-auto px-6">
      <div class="border-t border-primary-200"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-8">
        {{ t('article.relatedArticles') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ArticleCard
          v-for="article in relatedArticles"
          :key="article.path"
          :article="article"
          :authors="authors"
        />
      </div>
    </div>
  </section>
</template>
