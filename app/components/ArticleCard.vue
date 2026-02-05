<script setup lang="ts">
import type { Article, Author } from '../types/article'

const props = defineProps<{
  article: Article
  authors?: Author[]
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

// Navigate to search with category filter
const goToCategory = (category: string, event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  router.push(localePath({ path: '/search', query: { category } }))
}

// Navigate to search with tag filter
const goToTag = (tag: string, event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  router.push(localePath({ path: '/search', query: { tag } }))
}

const articlePath = computed(() => {
  const path = props.article.path || props.article._path
  if (!path) return '#'

  // Remove the locale prefix from content path for URL routing
  // Content is stored as /ja/article-slug but URL should be /article-slug (for default locale)
  // or /en/article-slug (for non-default locale)
  const localePrefix = `/${locale.value}/`
  if (path.startsWith(localePrefix)) {
    const pathWithoutLocale = path.slice(localePrefix.length - 1) // Keep the leading /
    // For default locale (ja), return path without locale prefix
    // For other locales, keep the locale prefix
    return locale.value === 'ja' ? pathWithoutLocale : path
  }

  return path
})

const articleTitle = computed(() => {
  return props.article.title || articlePath.value.split('/').pop() || 'Untitled'
})

const articleDate = computed(() => {
  const article = props.article

  // Try multiple possible locations for the date
  const dateValue = article.date ||
                    article.meta?.date ||
                    article.meta?.publishedAt ||
                    article.publishedAt ||
                    article._createdAt ||
                    article.createdAt ||
                    article.body?.meta?.date

  if (dateValue) {
    try {
      const date = new Date(dateValue)
      const dateLocale = locale.value === 'ja' ? 'ja-JP' : 'en-US'
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(dateLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    } catch (e) {
      console.warn('Invalid date format:', dateValue, e)
    }
  }

  return null
})

const articleAuthor = computed(() => {
  const article = props.article as any
  return article.author || article.meta?.author || null
})

const authorAvatar = computed(() => {
  if (!articleAuthor.value || !props.authors) return null
  const author = props.authors.find(a => a.name === articleAuthor.value)
  return author?.avatar || null
})

const articleImage = computed(() => {
  const article = props.article as any
  return article.image || article.meta?.image || article.cover || null
})

const articleCategory = computed(() => {
  const article = props.article as any
  return article.category || null
})

const articleTags = computed(() => {
  const article = props.article as any
  return article.tags || []
})
</script>

<template>
  <article class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
    <NuxtLink :to="articlePath" class="block flex flex-col h-full">
      <div v-if="articleImage" class="w-full h-48 overflow-hidden bg-primary-200">
        <img
          :src="articleImage"
          :alt="articleTitle"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div class="flex-grow mb-4 p-6">
        <!-- Category Badge -->
        <div v-if="articleCategory" class="mb-3">
          <button
            @click="goToCategory(articleCategory, $event)"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Icon name="heroicons:folder" class="w-3 h-3" />
            {{ articleCategory }}
          </button>
        </div>

        <h3 class="text-xl font-display font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
          {{ articleTitle }}
        </h3>
        <p v-if="article.description" class="text-gray-600 line-clamp-3 mb-3">
          {{ article.description }}
        </p>

        <!-- Tags -->
        <div v-if="articleTags.length > 0" class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in articleTags.slice(0, 10)"
            :key="tag"
            @click="goToTag(tag, $event)"
            class="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs text-secondary bg-secondary-50 rounded hover:bg-secondary-100 transition-colors"
          >
            <Icon name="heroicons:hashtag" class="w-3 h-3" />
            {{ tag }}
          </button>
          <span v-if="articleTags.length > 10" class="text-xs text-gray-400">
            +{{ articleTags.length - 10 }}
          </span>
        </div>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-auto px-6 pb-6">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:calendar" class="w-4 h-4" />
          <span v-if="articleDate">{{ articleDate }}</span>
        </div>
        <AuthorAvatar
          v-if="articleAuthor"
          :name="articleAuthor"
          :avatar="authorAvatar"
          size="sm"
          name-position="right"
        />
      </div>
    </NuxtLink>
  </article>
</template>
