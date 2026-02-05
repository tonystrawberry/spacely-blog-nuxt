import { authors, getAuthorByName, getAuthorAvatar, getGitHubAvatarUrl } from '../data/authors'
import type { Author } from '../types/article'

export const useAuthors = () => {
  return {
    authors,
    getAuthorByName,
    getAuthorAvatar,
    getGitHubAvatarUrl,
  }
}

// Re-export the Author type for convenience
export type { Author }
