import type { Author } from '../types/article'

// Generate GitHub avatar URL from username
export const getGitHubAvatarUrl = (username: string, size: number = 100): string => {
  return `https://github.com/${username}.png?size=${size}`
}

// Author data - avatar is auto-generated from GitHub username if not provided
const authorsData: Author[] = [
  {
    name: '@nazar-pc',
    fullName: 'Nazar Mokrynskyi',
    github: 'nazar-pc',
  },
  {
    name: '@ytocquet',
    fullName: 'Yann Tocquet',
    github: 'ytmusic',
  },
  {
    name: '@LITUATUI',
    fullName: 'LITUATUI',
    github: 'LITUATUI',
  },
  {
    name: '@tonystrawberry',
    fullName: 'Tony Duong',
    github: 'tonystrawberry',
  },
]

// Process authors to add avatar URLs
export const authors: Author[] = authorsData.map(author => ({
  ...author,
  avatar: author.avatar || (author.github ? getGitHubAvatarUrl(author.github) : undefined),
}))

// Helper to get author by name
export const getAuthorByName = (name: string): Author | undefined => {
  return authors.find(author => author.name === name)
}

// Helper to get avatar by author name
export const getAuthorAvatar = (name: string): string | undefined => {
  const author = getAuthorByName(name)
  return author?.avatar
}
