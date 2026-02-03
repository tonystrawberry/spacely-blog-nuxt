<script setup lang="ts">
import type { Author } from '../types/article'

const route = useRoute()
const { t, locale, locales, setLocale } = useI18n()

// Extract the article slug directly from the route path (without locale prefix)
// This stays constant regardless of locale changes
const articleSlug = computed(() => {
  let path = route.path
  // Remove locale prefix to get just the slug
  if (path.startsWith('/ja/')) return path.slice(4)
  if (path.startsWith('/en/')) return path.slice(4)
  return path.slice(1) // Remove leading slash (for default locale URLs)
})

// Build the content path based on locale
// URL: /getting-started (ja - default) or /en/getting-started (en)
// Content: /ja/getting-started or /en/getting-started
const contentPath = computed(() => {
  let path = route.path

  // For English locale, the URL already has /en/ prefix
  // For Japanese (default), we need to add /ja/ prefix to match content structure
  if (locale.value === 'ja' && !path.startsWith('/ja/')) {
    return `/ja${path}`
  }

  return path
})

const { data: page } = await useAsyncData(
  () => `page-${locale.value}-${route.path}`,
  () => queryCollection('content').path(contentPath.value).first(),
  { watch: [() => route.path, locale] }
)

// Check if translation exists in other locales
const { data: availableTranslations } = await useAsyncData(
  () => `translations-${articleSlug.value}`,
  async () => {
    const slug = articleSlug.value
    const translations: Array<{ code: string; name: string; path: string }> = []

    for (const loc of locales.value) {
      const locCode = (loc as any).code
      const locName = (loc as any).name
      const translationPath = `/${locCode}/${slug}`

      try {
        const exists = await queryCollection('content').path(translationPath).first()
        if (exists) {
          // Build the URL path (without locale prefix for default locale)
          const urlPath = locCode === 'ja' ? `/${slug}` : `/${locCode}/${slug}`
          translations.push({ code: locCode, name: locName, path: urlPath })
        }
      } catch (e) {
        // Translation doesn't exist
      }
    }

    return translations
  },
  { watch: [() => route.path] }
)

// Check if there are multiple translations available
const hasMultipleTranslations = computed(() => {
  return (availableTranslations.value?.length || 0) > 1
})

// Language switcher state
const showLanguageMenu = ref(false)

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const switchToTranslation = (translation: { code: string; path: string }) => {
  showLanguageMenu.value = false
  setLocale(translation.code)
  navigateTo(translation.path)
}

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

// Set page title and meta
useHead({
  title: `${articleTitle.value} - Spacely Tech Blog`,
  meta: [
    { name: 'description', content: articleDescription.value || '' }
  ]
})

// Smooth scroll to anchor
const scrollToHeading = (id: string, event?: Event) => {
  const element = document.getElementById(id)
  if (element) {
    event?.preventDefault()
    const offset = 80 // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    // Update URL hash without jumping
    history.pushState(null, '', `#${id}`)
  }
  // If element not found, let the default anchor behavior work
}
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
            <div v-if="articleAuthor" class="flex items-center gap-2">
              <img
                v-if="authorAvatar"
                :src="authorAvatar"
                :alt="articleAuthor"
                class="w-6 h-6 rounded-full object-cover border border-primary-200"
              />
              <Icon v-else name="heroicons:user" class="w-4 h-4" />
              <span class="font-medium text-primary">{{ articleAuthor }}</span>
            </div>

            <!-- Language Switcher (only if translation exists) -->
            <div v-if="hasMultipleTranslations" class="relative">
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
                  class="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-primary-100 py-1 z-50"
                >
                  <button
                    v-for="translation in availableTranslations"
                    :key="translation.code"
                    @click="switchToTranslation(translation)"
                    class="w-full px-4 py-2 text-left text-sm font-display hover:bg-primary-50 transition-colors flex items-center gap-2"
                    :class="{ 'text-primary font-medium': translation.code === locale, 'text-gray-700': translation.code !== locale }"
                  >
                    <Icon
                      v-if="translation.code === locale"
                      name="heroicons:check"
                      class="w-4 h-4 text-primary"
                    />
                    <span v-else class="w-4 h-4"></span>
                    {{ translation.name }}
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
            <div class="prose prose-lg max-w-none
              prose-headings:font-display
              prose-headings:text-gray-900
              prose-headings:scroll-mt-24
              prose-h1:text-4xl
              prose-h1:font-bold
              prose-h1:mb-6
              prose-h2:text-3xl
              prose-h2:font-semibold
              prose-h2:mt-12
              prose-h2:mb-6
              prose-h2:pt-2
              prose-h3:text-2xl
              prose-h3:font-semibold
              prose-h3:mt-8
              prose-h3:mb-4
              prose-h3:pt-2
              prose-p:text-gray-700
              prose-p:leading-relaxed
              prose-p:mb-6
              prose-a:text-primary
              prose-a:no-underline
              hover:prose-a:underline
              hover:prose-a:text-primary-500
              prose-strong:text-gray-900
              prose-strong:font-semibold
              prose-code:text-primary
              prose-code:bg-primary-50
              prose-code:px-1.5
              prose-code:py-0.5
              prose-code:rounded
              prose-code:font-mono
              prose-code:text-sm
              prose-pre:bg-gray-900
              prose-pre:text-gray-100
              prose-pre:rounded-lg
              prose-pre:overflow-x-auto
              prose-blockquote:border-l-4
              prose-blockquote:border-primary
              prose-blockquote:pl-4
              prose-blockquote:italic
              prose-blockquote:bg-primary-50
              prose-blockquote:py-2
              prose-ul:list-disc
              prose-ol:list-decimal
              prose-li:text-gray-700
              prose-li:mb-2
              prose-li:marker:text-primary
              prose-img:rounded-lg
              prose-img:shadow-md
              prose-hr:border-primary-200">
              <ContentRenderer
                v-if="filteredPage"
                :value="filteredPage"
                tag="div"
                class="content-body"
              />
            </div>
          </article>

          <!-- Table of Contents Sidebar -->
          <aside class="lg:col-span-1">
            <div class="sticky top-24">
              <div class="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
                <h2 class="text-lg font-display font-semibold text-gray-900 mb-4">
                  {{ t('article.toc') }}
                </h2>
                <nav v-if="toc && toc.length > 0" class="space-y-1.5">
                  <a
                    v-for="heading in toc"
                    :key="heading.id"
                    :href="`#${heading.id}`"
                    @click="scrollToHeading(heading.id, $event)"
                    class="block text-sm text-gray-600 hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary cursor-pointer"
                    :class="{
                      'pl-3': heading.level === 1,
                      'pl-4': heading.level === 2,
                      'pl-6': heading.level === 3,
                      'pl-8': heading.level === 4,
                    }"
                  >
                    {{ heading.text }}
                  </a>
                </nav>
                <p v-else class="text-sm text-gray-500">
                  {{ t('article.noToc') }}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
