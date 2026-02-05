/**
 * Composable for handling article translation checks
 */
import { withoutTrailingSlash } from 'ufo'

export const useArticleTranslation = () => {
  const route = useRoute()
  const { locales } = useI18n()

  // Extract article slug from any path (removes locale prefix and /articles/)
  const getArticleSlug = (path?: string): string => {
    const p = path || route.path
    // Remove locale prefix and /articles/
    // e.g., /ja/articles/getting-started -> getting-started
    // e.g., /en/articles/getting-started -> getting-started
    const match = p.match(/^\/(ja|en)\/articles\/(.+)$/)
    if (match && match[2]) return match[2]
    return ''
  }

  // Check if current page is an article detail page
  const isArticlePage = computed(() => {
    const path = route.path
    // It's an article page if it matches /{locale}/articles/{slug}
    return /^\/(ja|en)\/articles\/.+$/.test(path)
  })

  // Current article slug (reactive)
  const articleSlug = computed(() => getArticleSlug())

  // Check if translation exists for a specific locale
  const checkTranslationExists = async (targetLocale: string, slug?: string): Promise<boolean> => {
    const articlePath = slug || articleSlug.value

    if (!articlePath) return true

    const translationPath = `/${targetLocale}/articles/${articlePath}`

    try {
      const exists = await queryCollection('content').path(withoutTrailingSlash(translationPath)).first()
      return !!exists
    } catch (e) {
      return false
    }
  }

  // Get all available translations for current article
  const getAvailableTranslations = async (slug?: string) => {
    const articlePath = slug || articleSlug.value
    const translations: Array<{ code: string; name: string; path: string }> = []

    if (!articlePath) return translations

    for (const loc of locales.value) {
      const locCode = (loc as any).code
      const locName = (loc as any).name
      const translationPath = `/${locCode}/articles/${articlePath}`

      try {
        const exists = await queryCollection('content').path(withoutTrailingSlash(translationPath)).first()
        if (exists) {
          // Build the URL path (with prefix strategy, all locales have prefix)
          const urlPath = `/${locCode}/articles/${articlePath}`
          translations.push({ code: locCode, name: locName, path: urlPath })
        }
      } catch (e) {
        // Translation doesn't exist
      }
    }

    return translations
  }

  // Check if a locale has translation (sync check against pre-fetched translations)
  const hasTranslation = (translations: Array<{ code: string }>, localeCode: string): boolean => {
    return translations.some(t => t.code === localeCode)
  }

  // Get translation path for a locale
  const getTranslationPath = (translations: Array<{ code: string; path: string }>, localeCode: string): string | null => {
    const translation = translations.find(t => t.code === localeCode)
    return translation?.path || null
  }

  return {
    articleSlug,
    isArticlePage,
    getArticleSlug,
    checkTranslationExists,
    getAvailableTranslations,
    hasTranslation,
    getTranslationPath
  }
}
