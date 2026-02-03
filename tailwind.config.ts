import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
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
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
