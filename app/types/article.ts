export interface Article {
  path?: string
  _path?: string
  title?: string
  description?: string
  date?: string
  author?: string
  image?: string
  meta?: {
    date?: string
    author?: string
    image?: string
    [key: string]: any
  }
  [key: string]: any
}

export interface Author {
  name: string
  fullName?: string
  position?: string
  description?: string
  github?: string
  avatar?: string // Optional - will be generated from GitHub if not provided
}
