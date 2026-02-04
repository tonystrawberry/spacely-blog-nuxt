<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

// Use shared composable for translation checks
const { isArticlePage, checkTranslationExists } = useArticleTranslation()

const showLanguageMenu = ref(false)
const showNoTranslationModal = ref(false)
const pendingLocaleSwitch = ref<{ code: string; name: string } | null>(null)

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const switchLanguage = async (loc: { code: string; name: string }) => {
  showLanguageMenu.value = false

  if (loc.code === locale.value) return // Already on this language

  // Check if we're on an article page and if translation exists
  if (isArticlePage.value) {
    const hasTranslation = await checkTranslationExists(loc.code)

    if (!hasTranslation) {
      // Show confirmation modal
      pendingLocaleSwitch.value = loc
      showNoTranslationModal.value = true
      return
    }
  }

  // Translation exists or not on article page - switch directly
  const newPath = switchLocalePath(loc.code as 'en' | 'ja')

  // If we're on a page with query params (like articles with ?page=2),
  // navigate without query params to reset pagination
  if (route.query.page) {
    await setLocale(loc.code as 'en' | 'ja')
    const basePath = typeof newPath === 'string' ? newPath.split('?')[0] : newPath
    await navigateTo(basePath)
  } else {
    await setLocale(loc.code as 'en' | 'ja')
  }
}

const confirmLanguageSwitch = async () => {
  if (pendingLocaleSwitch.value) {
    const targetLocale = pendingLocaleSwitch.value.code as 'en' | 'ja'
    await setLocale(targetLocale)
    // Navigate to articles page in the new locale
    const articlesPath = targetLocale === 'ja' ? '/articles' : `/${targetLocale}/articles`
    await navigateTo(articlesPath)
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
                @click="switchLanguage({ code: (loc as any).code, name: (loc as any).name })"
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
</template>
