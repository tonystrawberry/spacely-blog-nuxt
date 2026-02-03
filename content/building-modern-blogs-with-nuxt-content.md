---
title: Building Modern Blogs with Nuxt Content
description: Discover how to create a beautiful, content-driven blog using Nuxt Content and Markdown.
date: 2024-01-22
author: '@ytocquet'
image: /images/articles/featured.svg
---

# Building Modern Blogs with Nuxt Content

Nuxt Content is a powerful module that allows you to write content in Markdown and access it through a MongoDB-like API. In this guide, we'll show you how to build a modern blog using Nuxt Content.

## Why Nuxt Content?

Nuxt Content provides several advantages for content-driven websites:

- **Markdown Support**: Write content in Markdown, a simple and intuitive format
- **Type Safety**: Full TypeScript support for your content
- **Flexible Querying**: Query your content like a database
- **Code Highlighting**: Automatic syntax highlighting for code blocks
- **Component Integration**: Use Vue components directly in your Markdown

## Setting Up Nuxt Content

First, install the Nuxt Content module:

```bash
npm install @nuxt/content
```

Then, add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content']
})
```

## Creating Content

Create a `content` directory in your project root and add Markdown files:

```markdown
---
title: My First Post
description: This is my first blog post
date: 2024-01-22
---

# My First Post

This is the content of my first post!
```

## Querying Content

You can query your content using the `queryContent` composable:

```vue
<script setup>
const { data: posts } = await useAsyncData('posts', () =>
  queryContent('/blog')
    .sort({ date: -1 })
    .find()
)
</script>
```

## Displaying Content

Use the `<ContentRenderer>` component to display your content:

```vue
<template>
  <ContentRenderer :value="post" />
</template>
```

## Advanced Features

### Code Highlighting

Nuxt Content automatically highlights code blocks. You can customize the theme in your `nuxt.config.ts`:

```typescript
content: {
  highlight: {
    theme: 'github-dark'
  }
}
```

### Search

Nuxt Content includes built-in search capabilities, making it easy to implement search functionality in your blog.

## Conclusion

Nuxt Content is an excellent solution for building content-driven websites. Its simplicity and power make it perfect for blogs, documentation sites, and more.
