<script setup lang="ts">
import type { Author } from '../types/article'

const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('content').path(route.path).first()
})

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
                  Table of Contents
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
                  No headings found in this article.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
