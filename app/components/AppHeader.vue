<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

const showLanguageMenu = ref(false)

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const switchLanguage = (code: string) => {
  setLocale(code)
  showLanguageMenu.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-primary-100">
    <div class="flex items-center justify-between max-w-7xl mx-auto px-6 py-3">
      <NuxtLink :to="localePath('/')" class="flex items-center">
        <img src="/images/header-logo.jpg" alt="Spacely" width="120" height="40" class="transition-transform duration-200 hover:scale-105" />
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink :to="localePath('/articles')" class="px-4 py-2 font-display text-sm font-medium text-primary rounded-xl hover:bg-primary-50 hover:text-primary transition-colors">
          {{ t('nav.articles') }}
        </NuxtLink>

        <!-- Language Switcher -->
        <div class="relative">
          <button
            @click="toggleLanguageMenu"
            class="flex items-center gap-1.5 p-2 text-primary hover:text-primary hover:bg-primary-50 rounded-xl transition-colors font-display text-sm font-medium"
          >
            <Icon name="heroicons:globe-alt" class="w-[18px] h-[18px]" />
            <span class="hidden sm:inline uppercase">{{ locale }}</span>
            <Icon name="heroicons:chevron-down" class="w-4 h-4" />
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
              class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-primary-100 py-1 z-50"
            >
              <button
                v-for="loc in locales"
                :key="(loc as any).code"
                @click="switchLanguage((loc as any).code)"
                class="w-full px-4 py-2 text-left text-sm font-display hover:bg-primary-50 transition-colors flex items-center gap-2"
                :class="{ 'text-primary font-medium': (loc as any).code === locale, 'text-gray-700': (loc as any).code !== locale }"
              >
                <Icon
                  v-if="(loc as any).code === locale"
                  name="heroicons:check"
                  class="w-4 h-4 text-primary"
                />
                <span v-else class="w-4 h-4"></span>
                {{ (loc as any).name }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>
