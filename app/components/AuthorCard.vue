<script setup lang="ts">
import type { Author } from '../types/article'

const props = defineProps<{
  authorName: string
}>()

const { t } = useI18n()
const { getAuthorByName } = useAuthors()

const author = computed(() => getAuthorByName(props.authorName))
</script>

<template>
  <div v-if="author" class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <img
          v-if="author.avatar"
          :src="author.avatar"
          :alt="author.fullName || author.name"
          class="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
        />
        <div
          v-else
          class="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center border-4 border-primary-100"
        >
          <Icon name="heroicons:user" class="w-12 h-12 text-primary-300" />
        </div>
      </div>

      <!-- Author Info -->
      <div class="flex-grow text-center sm:text-left">
        <p class="text-sm text-gray-500 mb-1">{{ t('article.writtenBy') }}</p>
        <h3 class="text-2xl font-display font-bold text-gray-900 mb-1">
          {{ author.fullName || author.name }}
        </h3>
        <p v-if="author.position" class="text-primary font-medium mb-1">
          {{ author.position }}
        </p>
        <p v-if="author.description" class="text-gray-600 mb-4 leading-relaxed">
          {{ author.description }}
        </p>

        <!-- GitHub Link -->
        <a
          v-if="author.github"
          :href="`https://github.com/${author.github}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Icon name="mdi:github" class="w-5 h-5" />
          {{ t('article.followOnGitHub') }}
        </a>
      </div>
    </div>
  </div>
</template>
