<script setup lang="ts">
useHead({
  title: 'Spacely Tech Blog - Home'
})

const authors = [
  { name: '@nazar-pc', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: '@ytocquet', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: '@LITUATUI', avatar: 'https://i.pravatar.cc/100?img=13' },
]

// Query articles from content
const { data: articles } = await useAsyncData('articles', async () => {
  const allContent = await queryCollection('content').find()
  // Filter out index page and limit to 6
  return allContent
    .filter(item => item._path !== '/index' && item._path !== '/')
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
        <img src="/background.svg" alt="" class="w-full h-full object-cover" />
      </div>
      <!-- White overlay -->
      <div class="absolute inset-0 bg-white/70 pointer-events-none"></div>

      <div class="relative z-10 text-center px-8 animate-fade-in-up">
        <div class="mb-4 flex justify-center">
          <img src="/logo.png" alt="Spacely" width="120" height="120" class="transition-transform duration-200 hover:scale-105" />
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mb-3">
          Spacely Tech Blog
        </h1>
        <p class="text-xl font-medium text-primary-500 mb-6">
          A powerful, lightweight theme for Hugo.
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
          Authors
        </h2>
        <p class="text-primary-500 text-lg mb-8">
          Meet our talented authors who contribute amazing content to our blog.
        </p>
        <div class="flex justify-center gap-8 flex-wrap mb-8">
          <div v-for="author in authors" :key="author.name" class="flex flex-col items-center gap-2">
            <img
              :src="author.avatar"
              :alt="author.name"
              class="w-20 h-20 rounded-full object-cover border-[3px] border-primary-100 hover:border-primary-200 hover:scale-105 transition-all duration-200"
            />
            <span class="font-display text-sm text-primary-500">{{ author.name }}</span>
          </div>
        </div>
        <a href="#" class="btn btn-primary text-base px-8 py-3.5">
          Join the team
        </a>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="flex items-center gap-2 text-2xl font-display font-semibold mb-3 text-primary mb-8">
          <Icon name="heroicons:document-text" class="w-7 h-7" />
          Latest Articles
        </h2>
        <div v-if="articles && Array.isArray(articles) && articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="(article, index) in articles"
            :key="(article as Record<string, any>)?._path || index"
            class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <NuxtLink :to="(article as Record<string, any>)?._path || '#'" class="block">
              <h3 class="text-xl font-display font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                {{ (article as Record<string, any>)?.title || ((article as Record<string, any>)?._path?.split('/').pop()) || 'Untitled' }}
              </h3>
              <p v-if="(article as Record<string, any>)?.description" class="text-gray-600 mb-4 line-clamp-2">
                {{ (article as Record<string, any>).description }}
              </p>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <Icon name="heroicons:calendar" class="w-4 h-4" />
                <span v-if="(article as Record<string, any>)?.date">{{ new Date((article as Record<string, any>).date).toLocaleDateString() }}</span>
                <span v-else-if="(article as Record<string, any>)?._createdAt">{{ new Date((article as Record<string, any>)._createdAt).toLocaleDateString() }}</span>
              </div>
            </NuxtLink>
          </article>
        </div>
        <div v-else class="text-center py-12">
          <p class="text-gray-500">No articles found. Start creating content in the <code class="bg-gray-100 px-2 py-1 rounded">content/</code> directory.</p>
        </div>
        <div v-if="articles && Array.isArray(articles) && articles.length > 0" class="text-center mt-8">
          <a href="/articles" class="btn btn-primary text-base px-8 py-3.5">
            View All Articles
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
