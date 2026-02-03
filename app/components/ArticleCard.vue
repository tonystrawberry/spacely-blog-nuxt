<script setup lang="ts">
import type { Article, Author } from '../types/article'

const props = defineProps<{
  article: Article
  authors?: Author[]
}>()

const articlePath = computed(() => {
  const path = props.article.path || props.article._path
  return path || '#'
})

const articleTitle = computed(() => {
  return props.article.title || articlePath.value.split('/').pop() || 'Untitled'
})

const articleDate = computed(() => {
  const article = props.article as any

  // Debug: log all keys to see what's available
  if (process.dev && !article.date) {
    console.log('Article keys:', Object.keys(article))
    console.log('Full article:', JSON.stringify(article, null, 2))
  }

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
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
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
        <h3 class="text-xl font-display font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
          {{ articleTitle }}
        </h3>
        <p v-if="article.description" class="text-gray-600 line-clamp-3">
          {{ article.description }}
        </p>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-auto px-6 pb-6">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:calendar" class="w-4 h-4" />
          <span v-if="articleDate">{{ articleDate }}</span>
        </div>
        <div v-if="articleAuthor" class="flex items-center gap-2 text-primary">
          <img
            v-if="authorAvatar"
            :src="authorAvatar"
            :alt="articleAuthor"
            class="w-6 h-6 rounded-full object-cover border border-primary-200"
          />
          <Icon v-else name="heroicons:user" class="w-4 h-4" />
          <span class="font-medium text-sm">{{ articleAuthor }}</span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
