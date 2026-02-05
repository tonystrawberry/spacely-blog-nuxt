/**
 * Composable for handling article translation checks
 */
import { withoutTrailingSlash } from 'ufo'

export const useArticleTranslation = () => {
  const route = useRoute()
  const { locales } = useI18n()

  // Extract article slug from any path (removes locale prefix)
  const getArticleSlug = (path?: string): string => {
    const p = path || route.path
    if (p.startsWith('/ja/')) return p.slice(4)
    if (p.startsWith('/en/')) return p.slice(4)
    return p.slice(1) // Remove leading slash
  }

  // Check if current page is an article detail page
  const isArticlePage = computed(() => {
    const path = route.path
    // Not an article page if it's root, articles list, or special pages
    const nonArticlePaths = ['/', '/articles', '/en', '/en/', '/ja', '/ja/', '/en/articles', '/ja/articles']
    if (nonArticlePaths.includes(path)) return false

    const slug = getArticleSlug(path)
    // Skip special pages
    if (['articles', 'index', 'about', ''].includes(slug)) return false

    // It's an article page if there's a slug
    return slug.length > 0
  })

  // Current article slug (reactive)
  const articleSlug = computed(() => getArticleSlug())

  // Check if translation exists for a specific locale
  const checkTranslationExists = async (targetLocale: string, slug?: string): Promise<boolean> => {
    const articlePath = slug || articleSlug.value

    if (!articlePath) return true

    // Skip check for special pages
    if (['articles', 'index', 'about', ''].includes(articlePath)) return true

    const translationPath = `/${targetLocale}/${articlePath}`

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

    for (const loc of locales.value) {
      const locCode = (loc as any).code
      const locName = (loc as any).name
      const translationPath = `/${locCode}/${articlePath}`

      try {
        const exists = await queryCollection('content').path(withoutTrailingSlash(translationPath)).first()
        if (exists) {
          // Build the URL path (without locale prefix for default locale 'ja')
          const urlPath = locCode === 'ja' ? `/${articlePath}` : `/${locCode}/${articlePath}`
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
