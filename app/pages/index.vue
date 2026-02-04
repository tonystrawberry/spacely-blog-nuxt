<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

// SEO - @nuxtjs/seo handles OG, Twitter, canonical automatically
useSeoMeta({
  title: () => t('home.pageTitle'),
  description: () => t('home.metaDescription'),
  ogImage: '/logo.png',
})

const authors = [
  { name: '@nazar-pc', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: '@ytocquet', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: '@LITUATUI', avatar: 'https://i.pravatar.cc/100?img=13' },
]

// Query ALL articles from content (not filtered by locale)
const { data: allContent, error } = await useAsyncData(
  'home-content',
  async () => {
    try {
      const content = await queryCollection('content').all()
      return content || []
    } catch (e) {
      console.error('Error fetching content:', e)
      return []
    }
  },
  {
    default: () => [],
  }
)

// Filter articles by current locale (reactive)
const articles = computed(() => {
  if (!allContent.value || !Array.isArray(allContent.value)) return []

  const currentLocale = locale.value || 'ja'

  return allContent.value
    .filter((item: any) => {
      const path = item.path || item._path || ''
      // Only include items from the current locale folder
      const isCurrentLocale = path.startsWith(`/${currentLocale}/`)
      // Exclude index, about pages
      const isNotSpecialPage = !path.endsWith('/index') &&
                                !path.endsWith('/about')
      return isCurrentLocale && isNotSpecialPage
    })
    .sort((a: any, b: any) => {
      // Sort by date if available (newest first)
      const dateA = a.date || a.meta?.date ? new Date(a.date || a.meta?.date).getTime() : 0
      const dateB = b.date || b.meta?.date ? new Date(b.date || b.meta?.date).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 6)
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <!-- Hero Section -->
    <section class="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <!-- Background SVG -->
      <div class="absolute inset-0 pointer-events-none">
        <img src="/background.svg" alt="Spacely Tech Blog background pattern" class="w-full h-full object-cover" aria-hidden="true" />
      </div>
      <!-- White overlay -->
      <div class="absolute inset-0 bg-white/70 pointer-events-none"></div>

      <div class="relative z-10 text-center px-8 animate-fade-in-up">
        <div class="mb-4 flex justify-center">
          <img src="/logo.png" alt="Spacely" width="120" height="120" class="transition-transform duration-200 hover:scale-105" />
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mb-3">
          {{ t('home.title') }}
        </h1>
        <p class="text-xl font-medium text-primary-500 mb-6">
          {{ t('home.subtitle') }}
        </p>
        <a href="#" class="inline-flex items-center justify-center text-primary hover:text-primary hover:scale-110 transition-transform">
          <Icon name="heroicons:link" class="w-6 h-6" />
        </a>
      </div>
    </section>

    <!-- Authors Section -->
    <section class="py-16 text-center bg-white">
      <div class="max-w-4xl mx-auto px-6">
        <h2 class="flex items-center justify-center gap-2 text-2xl font-display font-semibold mb-3 text-primary">
          <Icon name="heroicons:user-group" class="w-7 h-7" />
          {{ t('authors.title') }}
        </h2>
        <p class="text-primary-500 text-lg mb-8">
          {{ t('authors.description') }}
        </p>
        <div class="flex justify-center gap-8 flex-wrap mb-8">
          <AuthorAvatar
            v-for="author in authors"
            :key="author.name"
            :name="author.name"
            :avatar="author.avatar"
            size="lg"
            name-position="bottom"
          />
        </div>
        <Button variant="primary" size="lg" href="#">
          {{ t('authors.joinTeam') }}
        </Button>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="py-16 bg-[#fef2f5]">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="flex items-center gap-2 text-2xl font-display font-semibold mb-3 text-primary mb-8">
          <Icon name="heroicons:document-text" class="w-7 h-7" />
          {{ t('articles.latest') }}
        </h2>
        <div v-if="articles && Array.isArray(articles) && articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard
            v-for="(article, index) in articles"
            :key="(article as Record<string, any>)?._path || index"
            :article="article as Record<string, any>"
            :authors="authors"
          />
        </div>
        <div v-else class="text-center py-12">
          <p class="text-gray-500">{{ t('articles.noArticles') }}</p>
        </div>
        <div v-if="articles && Array.isArray(articles) && articles.length > 0" class="text-center mt-8">
          <Button variant="primary" size="lg" :to="localePath('/articles')">
            {{ t('articles.viewAll') }}
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
