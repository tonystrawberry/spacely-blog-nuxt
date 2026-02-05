<script setup lang="ts">
import type { Author } from '../types/article'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// SEO
useSeoMeta({
  title: () => t('search.pageTitle'),
  description: () => t('search.title'),
  ogImage: '/logo.png',
})

const authors: Author[] = [
  { name: '@nazar-pc', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: '@ytocquet', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: '@LITUATUI', avatar: 'https://i.pravatar.cc/100?img=13' },
]

// Initialize from query params
const searchQuery = ref<string>((route.query.q as string) || '')
const selectedCategory = ref<string | null>((route.query.category as string) || null)
const selectedTag = ref<string | null>((route.query.tag as string) || null)

// Query ALL content
const { data: allContent } = await useAsyncData(
  'search-content',
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
    server: false,
  }
)

// Filter articles by current locale
const allArticles = computed(() => {
  if (!allContent.value || !Array.isArray(allContent.value)) return []

  const currentLocale = locale.value || 'ja'

  return allContent.value
    .filter((item: any) => {
      const path = item.path || item._path || ''
      const isCurrentLocale = path.startsWith(`/${currentLocale}/`)
      const isNotSpecialPage = !path.endsWith('/index') && !path.endsWith('/about')
      return isCurrentLocale && isNotSpecialPage
    })
    .sort((a: any, b: any) => {
      const dateA = a.date || a.meta?.date ? new Date(a.date || a.meta?.date).getTime() : 0
      const dateB = b.date || b.meta?.date ? new Date(b.date || b.meta?.date).getTime() : 0
      return dateB - dateA
    })
})

// Extract unique categories
const allCategories = computed(() => {
  if (!allArticles.value) return []
  const categories = new Set<string>()
  allArticles.value.forEach((article: any) => {
    if (article.category) categories.add(article.category)
  })
  return Array.from(categories).sort()
})

// Extract unique tags
const allTags = computed(() => {
  if (!allArticles.value) return []
  const tags = new Set<string>()
  allArticles.value.forEach((article: any) => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach((tag: string) => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
})

// Filter articles by search query, category, and tag
const filteredArticles = computed(() => {
  if (!allArticles.value) return []

  let filtered = allArticles.value

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((article: any) => {
      const title = (article.title || '').toLowerCase()
      const description = (article.description || '').toLowerCase()
      const category = (article.category || '').toLowerCase()
      const tags = (article.tags || []).map((t: string) => t.toLowerCase()).join(' ')
      const searchableText = `${title} ${description} ${category} ${tags}`
      return searchableText.includes(query)
    })
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((article: any) => article.category === selectedCategory.value)
  }

  // Filter by tag
  if (selectedTag.value) {
    filtered = filtered.filter((article: any) =>
      article.tags && Array.isArray(article.tags) && article.tags.includes(selectedTag.value)
    )
  }

  return filtered
})

// Check if any filter is active
const hasActiveFilter = computed(() => {
  return searchQuery.value.trim() || selectedCategory.value || selectedTag.value
})

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = null
  selectedTag.value = null
}

// Handle category selection
const handleCategorySelect = (category: string | null) => {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

// Handle tag selection
const handleTagSelect = (tag: string | null) => {
  selectedTag.value = selectedTag.value === tag ? null : tag
}
</script>

<template>
  <div class="min-h-screen bg-[#fef2f5]">
    <AppHeader />

    <!-- Search Page Header -->
    <section class="py-12 bg-white border-b border-primary-100">
      <div class="max-w-4xl mx-auto px-6">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-primary mb-4 text-center">
          {{ t('search.title') }}
        </h1>

        <!-- Search Bar -->
        <div class="relative mb-8">
          <div class="relative">
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('search.placeholder')"
              class="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <!-- Filter Buttons with Hover Dropdowns -->
        <div class="flex flex-wrap justify-center gap-4">
          <!-- Category Filter Button -->
          <div v-if="allCategories.length > 0" class="relative group">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              :class="selectedCategory
                ? 'bg-primary text-white'
                : 'bg-primary-50 text-primary hover:bg-primary-100'"
            >
              <Icon name="heroicons:folder" class="w-4 h-4" />
              {{ selectedCategory || t('search.filterByCategory') }}
              <Icon name="heroicons:chevron-down" class="w-4 h-4" />
            </button>

            <!-- Category Dropdown -->
            <div class="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="max-h-64 overflow-y-auto">
                <button
                  v-for="category in allCategories"
                  :key="category"
                  @click="handleCategorySelect(category)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
                  :class="selectedCategory === category ? 'text-primary font-medium bg-primary-50' : 'text-gray-700'"
                >
                  <Icon
                    v-if="selectedCategory === category"
                    name="heroicons:check"
                    class="w-4 h-4 text-primary"
                  />
                  <span v-else class="w-4 h-4"></span>
                  {{ category }}
                </button>
              </div>
            </div>
          </div>

          <!-- Tag Filter Button -->
          <div v-if="allTags.length > 0" class="relative group">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              :class="selectedTag
                ? 'bg-secondary text-white'
                : 'bg-secondary-50 text-secondary hover:bg-secondary-100'"
            >
              <Icon name="heroicons:hashtag" class="w-4 h-4" />
              {{ selectedTag || t('search.filterByTag') }}
              <Icon name="heroicons:chevron-down" class="w-4 h-4" />
            </button>

            <!-- Tag Dropdown -->
            <div class="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-3 px-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="max-h-64 overflow-y-auto">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in allTags"
                    :key="tag"
                    @click="handleTagSelect(tag)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-lg transition-colors"
                    :class="selectedTag === tag
                      ? 'bg-secondary text-white'
                      : 'bg-secondary-50 text-secondary hover:bg-secondary-100'"
                  >
                    <Icon name="heroicons:hashtag" class="w-3.5 h-3.5" />
                    {{ tag }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Results -->
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Results Summary & Active Filters -->
        <div class="mb-8">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-4">
              <h2 v-if="filteredArticles.length > 0" class="text-2xl font-display font-bold text-primary">
                {{ t('search.results', { count: filteredArticles.length }) }}
              </h2>
              <h2 v-else-if="hasActiveFilter" class="text-2xl font-display font-bold text-primary">
                {{ t('search.noResults') }}
              </h2>

              <!-- Active Filters Display -->
              <div v-if="hasActiveFilter" class="flex flex-wrap items-center gap-2">
                <span
                  v-if="selectedCategory"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary text-white rounded-lg"
                >
                  <Icon name="heroicons:folder" class="w-3.5 h-3.5" />
                  {{ selectedCategory }}
                  <button @click="handleCategorySelect(null)" class="inline-flex items-center hover:text-primary-200">
                    <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                  </button>
                </span>

                <span
                  v-if="selectedTag"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-secondary text-white rounded-lg"
                >
                  <Icon name="heroicons:hashtag" class="w-3 h-3" />
                  {{ selectedTag }}
                  <button @click="handleTagSelect(null)" class="inline-flex items-center hover:text-secondary-200">
                    <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                  </button>
                </span>

                <span
                  v-if="searchQuery.trim()"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-tertiary text-white rounded-lg"
                >
                  <Icon name="heroicons:magnifying-glass" class="w-3.5 h-3.5" />
                  {{ searchQuery }}
                  <button @click="searchQuery = ''" class="inline-flex items-center hover:text-tertiary-200">
                    <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Clear Filters Button -->
            <Button
              v-if="hasActiveFilter"
              variant="outline"
              size="sm"
              @click="clearAllFilters"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
              {{ t('search.clearFilters') }}
            </Button>
          </div>
        </div>

        <!-- Articles Grid -->
        <div v-if="filteredArticles && Array.isArray(filteredArticles) && filteredArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard
            v-for="(article, index) in filteredArticles"
            :key="(article as Record<string, any>)?._path || (article as Record<string, any>)?.path || index"
            :article="article as Record<string, any>"
            :authors="authors"
          />
        </div>
        <div v-else-if="hasActiveFilter" class="text-center py-16">
          <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">{{ t('search.noResults') }}</p>
        </div>
        <div v-else class="text-center py-16">
          <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">{{ t('search.placeholder') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
