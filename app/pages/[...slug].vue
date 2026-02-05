<script setup lang="ts">
import type { Author } from '../types/article'
import { withoutTrailingSlash } from 'ufo'

const route = useRoute()
const { t, locale, locales, setLocale } = useI18n()

// Use shared composable for translation logic
const {
  articleSlug,
  getAvailableTranslations,
  hasTranslation: checkHasTranslation,
  getTranslationPath: getPath
} = useArticleTranslation()

// Build the content path based on URL structure (not locale state)
// URL: /getting-started (ja - default) or /en/getting-started (en)
// Content: /ja/getting-started or /en/getting-started
const contentPath = computed(() => {
  const path = route.path

  // If path already has /en/ prefix, use as-is (content is at /en/...)
  if (path.startsWith('/en/') || path === '/en') {
    return path
  }

  // Otherwise, it's Japanese content (default locale uses no URL prefix)
  // Add /ja/ prefix to match content file structure
  return `/ja${path}`
})

// Fetch on server for proper SSR and 404 handling
const { data: page } = await useAsyncData(
  `page-${route.path}`,
  () => queryCollection('content').path(withoutTrailingSlash(contentPath.value)).first(),
  { watch: [() => route.path] }
)

// Fetch available translations using the composable
const { data: availableTranslations } = await useAsyncData(
  `translations-${route.path}`,
  () => getAvailableTranslations(),
  { watch: [() => route.path] }
)

// Check if a specific locale has a translation (using fetched data)
const hasTranslation = (localeCode: string) => {
  return checkHasTranslation(availableTranslations.value || [], localeCode)
}

// Get translation path for a locale (using fetched data)
const getTranslationPath = (localeCode: string) => {
  return getPath(availableTranslations.value || [], localeCode)
}

// Language switcher state
const showLanguageMenu = ref(false)
const showNoTranslationModal = ref(false)
const pendingLocaleSwitch = ref<{ code: string; name: string } | null>(null)

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const handleLanguageClick = (loc: { code: string; name: string }) => {
  showLanguageMenu.value = false

  if (loc.code === locale.value) return // Already on this language

  if (hasTranslation(loc.code)) {
    // Translation exists, switch directly
    const path = getTranslationPath(loc.code)
    if (path) {
      setLocale(loc.code as 'en' | 'ja')
      navigateTo(path)
    }
  } else {
    // No translation, show confirmation modal
    pendingLocaleSwitch.value = loc
    showNoTranslationModal.value = true
  }
}

const confirmLanguageSwitch = () => {
  if (pendingLocaleSwitch.value) {
    const targetLocale = pendingLocaleSwitch.value.code as 'en' | 'ja'
    setLocale(targetLocale)
    // Navigate to articles page in the new locale
    const articlesPath = targetLocale === 'ja' ? '/articles' : `/${targetLocale}/articles`
    navigateTo(articlesPath)
  }
  showNoTranslationModal.value = false
  pendingLocaleSwitch.value = null
}

const cancelLanguageSwitch = () => {
  showNoTranslationModal.value = false
  pendingLocaleSwitch.value = null
}

// Get localized language name for modal message
const pendingLocaleName = computed(() => {
  return pendingLocaleSwitch.value?.name || ''
})

// Throw 404 if page not found
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const authors: Author[] = [
  { name: '@nazar-pc', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: '@ytocquet', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: '@LITUATUI', avatar: 'https://i.pravatar.cc/100?img=13' },
]

const article = computed(() => page.value as any)

// Create a modified page object without the first h1 and first paragraph (already shown in header)
const filteredPage = computed(() => {
  if (!page.value) return null

  const pageData = page.value as any
  if (!pageData.body?.value || pageData.body.type !== 'minimark') {
    return pageData
  }

  // Filter out the first h1 and first paragraph from minimark body
  let foundH1 = false
  let foundFirstP = false
  const filteredValue = pageData.body.value.filter((node: any) => {
    if (Array.isArray(node)) {
      // Skip the first h1
      if (node[0] === 'h1' && !foundH1) {
        foundH1 = true
        return false
      }
      // Skip the first paragraph (description) after the h1
      if (node[0] === 'p' && foundH1 && !foundFirstP) {
        foundFirstP = true
        return false
      }
    }
    return true
  })

  return {
    ...pageData,
    body: {
      ...pageData.body,
      value: filteredValue
    }
  }
})

const articleTitle = computed(() => {
  return article.value?.title || article.value?.meta?.title || 'Untitled'
})

const articleDescription = computed(() => {
  return article.value?.description || article.value?.meta?.description || null
})

const articleDate = computed(() => {
  const dateValue = article.value?.date ||
                    article.value?.meta?.date ||
                    article.value?.publishedAt ||
                    article.value?._createdAt

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
  return article.value?.author || article.value?.meta?.author || null
})

const authorAvatar = computed(() => {
  if (!articleAuthor.value) return null
  const author = authors.find(a => a.name === articleAuthor.value)
  return author?.avatar || null
})

// Use the built-in TOC from Nuxt Content
const toc = computed(() => {
  const body = article.value?.body
  if (!body?.toc?.links) return []

  return body.toc.links.map((link: any) => ({
    id: link.id,
    text: link.text,
    level: link.depth || 2
  }))
})

// Article image URL (for OG)
const articleImage = computed(() => {
  return article.value?.image || '/images/articles/featured.svg'
})

// SEO - @nuxtjs/seo handles OG, Twitter, canonical automatically
useSeoMeta({
  title: articleTitle.value,
  description: articleDescription.value || '',
  ogType: 'article',
  ogImage: articleImage.value,
  articlePublishedTime: article.value?.date,
  articleAuthor: articleAuthor.value || 'Spacely Team',
})

// Schema.org structured data for articles
useSchemaOrg([
  defineArticle({
    headline: articleTitle.value,
    description: articleDescription.value || '',
    image: articleImage.value,
    datePublished: article.value?.date,
    author: {
      name: articleAuthor.value || 'Spacely Team',
    },
  })
])

</script>

<template>
  <div class="min-h-screen bg-[#fef2f5]">
    <AppHeader />

    <!-- Article Header -->
    <section class="py-12 bg-white border-b border-primary-100">
      <div class="max-w-7xl mx-auto px-6">
        <div class="max-w-4xl">
          <h1 class="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            {{ articleTitle }}
          </h1>
          <p v-if="articleDescription" class="text-xl text-gray-600 mb-6">
            {{ articleDescription }}
          </p>

          <!-- Article Meta -->
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <div v-if="articleDate" class="flex items-center gap-2">
              <Icon name="heroicons:calendar" class="w-4 h-4" />
              <span>{{ articleDate }}</span>
            </div>
            <AuthorAvatar
              v-if="articleAuthor"
              :name="articleAuthor"
              :avatar="authorAvatar"
              size="sm"
              name-position="right"
            />

            <!-- Language Switcher (always show if there are multiple locales) -->
            <div v-if="locales.length > 1" class="relative">
              <button
                @click="toggleLanguageMenu"
                class="flex items-center gap-1.5 px-3 py-1.5 text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors font-display text-sm font-medium"
              >
                <Icon name="heroicons:globe-alt" class="w-4 h-4" />
                <span class="uppercase">{{ locale }}</span>
                <Icon name="heroicons:chevron-down" class="w-3 h-3" />
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="showLanguageMenu"
                  class="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-primary-100 py-1 z-50"
                >
                  <button
                    v-for="loc in locales"
                    :key="(loc as any).code"
                    @click="handleLanguageClick({ code: (loc as any).code, name: (loc as any).name })"
                    class="w-full px-4 py-2 text-left text-sm font-display hover:bg-primary-50 transition-colors flex items-center justify-between"
                    :class="{
                      'text-primary font-medium': (loc as any).code === locale,
                      'text-gray-700': (loc as any).code !== locale
                    }"
                  >
                    <div class="flex items-center gap-2">
                      <Icon
                        v-if="(loc as any).code === locale"
                        name="heroicons:check"
                        class="w-4 h-4 text-primary"
                      />
                      <span v-else class="w-4 h-4"></span>
                      {{ (loc as any).name }}
                    </div>
                    <Icon
                      v-if="!hasTranslation((loc as any).code) && (loc as any).code !== locale"
                      name="heroicons:exclamation-triangle"
                      class="w-4 h-4 text-amber-500"
                      :title="t('article.noTranslation.title')"
                    />
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Content with TOC -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <!-- Main Content -->
          <article class="lg:col-span-3">
            <ArticleContent :content="filteredPage" />
          </article>

          <!-- Table of Contents Sidebar -->
          <aside class="lg:col-span-1">
            <div class="sticky top-24">
              <TableOfContents :items="toc" />
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- No Translation Modal -->
    <ConfirmModal
      :show="showNoTranslationModal"
      :title="t('article.noTranslation.title')"
      :message="t('article.noTranslation.message', { language: pendingLocaleName })"
      :confirm-text="t('article.noTranslation.confirm')"
      :cancel-text="t('article.noTranslation.cancel')"
      @confirm="confirmLanguageSwitch"
      @cancel="cancelLanguageSwitch"
    />
  </div>
</template>
