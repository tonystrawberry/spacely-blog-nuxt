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
    position: 'Senior Software Engineer',
    description: 'Open source enthusiast and Rust advocate. Building decentralized systems and contributing to the web ecosystem.',
    github: 'nazar-pc',
  },
  {
    name: '@ytocquet',
    fullName: 'Yann Tocquet',
    position: 'Frontend Developer',
    description: 'Passionate about Vue.js and modern web technologies. Creating beautiful and performant user interfaces.',
    github: 'ytmusic',
  },
  {
    name: '@LITUATUI',
    fullName: 'LITUATUI',
    position: 'Full Stack Developer',
    description: 'Building web applications with a focus on developer experience and code quality.',
    github: 'LITUATUI',
  },
  {
    name: '@tonystrawberry',
    fullName: 'Tony Duong',
    position: 'Software Engineer',
    description: 'Full-stack developer passionate about building great products. Love TypeScript, Vue.js, and Ruby on Rails.',
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
