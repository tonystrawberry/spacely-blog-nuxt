<script setup lang="ts">
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-primary-100">
    <div class="flex items-center justify-between max-w-7xl mx-auto px-6 py-3">
      <NuxtLink to="/" class="flex items-center">
        <img src="/images/header-logo.jpg" alt="Spacely" width="120" height="40" class="transition-transform duration-200 hover:scale-105" />
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink to="/articles" class="px-4 py-2 font-display text-sm font-medium text-primary rounded-xl hover:bg-primary-50 hover:text-primary transition-colors">
          Articles
        </NuxtLink>

        <button class="flex items-center gap-1.5 p-2 text-primary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors font-display text-sm font-medium">
          <Icon name="heroicons:globe-alt" class="w-[18px] h-[18px]" />
          <span class="hidden sm:inline">EN</span>
        </button>
      </div>
    </div>
  </header>
</template>
