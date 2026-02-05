<script setup lang="ts">
import type { Article, Author } from '../types/article'

const props = defineProps<{
  article: Article
  authors?: Author[]
}>()

const { locale } = useI18n()

const articlePath = computed(() => {
  const path = props.article.path || props.article._path
  if (!path) return '#'

  const localePrefix = `/${locale.value}/`
  if (path.startsWith(localePrefix)) {
    const pathWithoutLocale = path.slice(localePrefix.length - 1)
    return locale.value === 'ja' ? pathWithoutLocale : path
  }

  return path
})

const articleTitle = computed(() => {
  return props.article.title || articlePath.value.split('/').pop() || 'Untitled'
})

const articleDescription = computed(() => {
  return props.article.description || null
})

const articleDate = computed(() => {
  const article = props.article

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
  <article class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
    <NuxtLink :to="articlePath" class="block">
      <div class="grid md:grid-cols-2 gap-0">
        <!-- Image Section - Larger and more prominent -->
        <div v-if="articleImage" class="w-full h-64 md:h-auto overflow-hidden bg-primary-200">
          <img
            :src="articleImage"
            :alt="articleTitle"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div v-else class="w-full h-64 md:h-auto bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <Icon name="heroicons:document-text" class="w-24 h-24 text-primary-300" />
        </div>

        <!-- Content Section -->
        <div class="p-8 md:p-10 flex flex-col justify-between">
          <div>
            <!-- Category Badge -->
            <div v-if="articleCategory" class="mb-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary-50 rounded-lg">
                <Icon name="heroicons:folder" class="w-4 h-4" />
                {{ articleCategory }}
              </span>
            </div>

            <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4 hover:text-primary transition-colors line-clamp-3">
              {{ articleTitle }}
            </h2>

            <p v-if="articleDescription" class="text-lg text-gray-600 mb-6 line-clamp-3">
              {{ articleDescription }}
            </p>

            <!-- Tags -->
            <div v-if="articleTags.length > 0" class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="tag in articleTags.slice(0, 8)"
                :key="tag"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-sm text-secondary bg-secondary-50 rounded-lg"
              >
                <Icon name="heroicons:hashtag" class="w-3.5 h-3.5" />
                {{ tag }}
              </span>
              <span v-if="articleTags.length > 8" class="inline-flex items-center px-2.5 py-1 text-sm text-gray-500">
                +{{ articleTags.length - 8 }}
              </span>
            </div>
          </div>

          <!-- Author and Date - More prominent -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <div class="flex items-center gap-4">
              <AuthorAvatar
                v-if="articleAuthor"
                :name="articleAuthor"
                :avatar="authorAvatar"
                size="md"
                name-position="right"
              />
            </div>
            <div class="flex items-center gap-2 text-gray-500">
              <Icon name="heroicons:calendar" class="w-5 h-5" />
              <span v-if="articleDate" class="text-base font-medium">{{ articleDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
