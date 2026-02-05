import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  safelist: [
    'rounded-lg',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F54270',
          50: '#fef2f5',
          100: '#fde6eb',
          200: '#fccdd7',
          300: '#faa4b8',
          400: '#F54270',
          500: '#e62d5a',
          600: '#d11d4a',
          700: '#ae163d',
          800: '#911534',
          900: '#79172f',
        },
        secondary: {
          DEFAULT: '#2E3192',
          50: '#e8e9f5',
          100: '#d1d3eb',
          200: '#a3a7d7',
          300: '#757bc3',
          400: '#474faf',
          500: '#2E3192',
          600: '#252774',
          700: '#1c1d56',
          800: '#131438',
          900: '#0a0b1a',
        },
        tertiary: {
          DEFAULT: '#B44C97',
          50: '#fdf2fa',
          100: '#fce7f6',
          200: '#fbcfed',
          300: '#f9a8de',
          400: '#f472c8',
          500: '#e946ac',
          600: '#B44C97',
          700: '#9d3d7d',
          800: '#823567',
          900: '#6c3156',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [typography],
} satisfies Config
