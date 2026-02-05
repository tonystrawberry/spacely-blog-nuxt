import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxtjs/i18n', '@nuxtjs/seo', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-studio'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  // Enable SSR
  ssr: true,

  // Prerender sitemap for SEO
  nitro: {
    prerender: {
      routes: ['/sitemap.xml'],
    },
  },

  // @nuxtjs/seo - Site configuration
  site: {
    url: 'https://spacely-blog-nuxt.vercel.app/',
    name: 'Spacely Tech Blog | Vue.js・Nuxt・TypeScript',
    description: 'Spacely Tech Blogは、Vue.js、Nuxt、TypeScript、フロントエンド開発のベストプラクティスについて発信する技術ブログです。実践的なチュートリアルやコード例で、モダンなWeb開発スキルを身につけましょう。',
    defaultLocale: 'ja',
  },

  // SEO module configuration
  seo: {
    meta: {
      author: 'Spacely',
      twitterSite: '@spacely_jp',
      twitterCreator: '@spacely_jp',
    }
  },

  // Sitemap configuration - auto-discovers routes via prerendering
  sitemap: {},

  // Robots configuration (allow all, no restrictions)
  robots: {
    allow: '/',
  },

  // OG Image configuration
  ogImage: {
    enabled: true,
  },

  content: {
    // Use native SQLite connector for Vercel serverless compatibility
    experimental: {
      sqliteConnector: 'native',
    },
    renderer: {
      anchorLinks: true
    },
    build: {
      markdown: {
        highlight: {
          theme: 'github-dark'
        }
      }
    }
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', iso: 'en-US', dir: 'ltr', file: 'en.json' },
      { code: 'ja', name: '日本語', iso: 'ja-JP', dir: 'ltr', file: 'ja.json' }
    ],
    defaultLocale: 'ja',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  studio: {
    repository: {
      provider: 'github',
      owner: 'tonystrawberry',
      repo: 'spacely-blog-nuxt',
      branch: 'master'
    },
    route: '/admin',
    i18n: {
      defaultLocale: 'ja',
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ja',
      },
      titleTemplate: '%s | Spacely Tech Blog',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ]
    }
  },
})
