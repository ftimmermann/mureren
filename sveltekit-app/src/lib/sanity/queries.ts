import type {PortableTextBlock} from '@portabletext/types'
import type {Image, Slug} from '@sanity/types'
import groq from 'groq'

const pollFields = groq`{
  _id,
  _type,
  title,
  slug,
  question,
  description,
  type,
  options,
  maxSelections,
  startsAt,
  endsAt,
  resultVisibility,
  status,
  purposeText,
  conclusionText
}`

const bodyFields = groq`body[]{
  ...,
  _type == "pollReference" => {
    ...,
    poll->${pollFields}
  }
}`

export const articleQuery = groq`*[_type == "article" && slug.current == $slug][0]{
  ...,
  ${bodyFields},
  author->{
    name
  },
  category->{
    name
  },
  tag->{
    name
  }
}`

export const articlesQuery = groq`*[_type == "article" && defined(slug.current)] | order(coalesce(publicationDate, _createdAt) desc){
  ...,
  ${bodyFields},
  author->{
    name
  },
  category->{
    name
  },
  tag->{
    name
  }
}`

export const frontpageQuery = groq`{
  "articles": *[_type == "article" && defined(slug.current)] | order(coalesce(publicationDate, _createdAt) desc)[0...8]{
    ...,
    author->{
      name
    },
    category->{
      name
    },
    tag->{
      name
    }
  },
  "shortArticles": *[_type == "shortArticle"] | order(_createdAt desc)[0...8]{
    ...
  },
  "pages": *[_type == "page" && defined(slug.current)] | order(title asc)[0...8]{
    ...
  }
}`

export const shortArticlesQuery = groq`*[_type == "shortArticle"] | order(_createdAt desc){
  ...,
  ${bodyFields}
}`

export const pageQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  ...,
  ${bodyFields}
}`

export interface PollOption {
  _key: string
  label?: string
}

export interface Poll {
  _id: string
  _type: 'poll'
  title?: string
  slug?: Slug
  question?: string
  description?: string
  type?: 'singleChoice' | 'multipleChoice'
  options?: PollOption[]
  maxSelections?: number
  startsAt?: string
  endsAt?: string
  resultVisibility?: 'immediate' | 'afterClose' | 'hidden'
  status?: 'draft' | 'active' | 'closed' | 'archived'
  purposeText?: string
  conclusionText?: string
}

export interface PollReferenceBlock {
  _key: string
  _type: 'pollReference'
  poll?: Poll
}

export type BodyBlock = PortableTextBlock | PollReferenceBlock

export interface Article {
  _id: string
  _type: 'article'
  _createdAt: string
  publicationDate?: string
  legacyDate?: string
  title?: string
  slug: Slug
  subtitle?: string
  mainImage?: Image
  author?: {
    name?: string
  }
  category?: {
    name?: string
  }
  tag?: {
    name?: string
  }
  body: BodyBlock[]
}

export interface ShortArticle {
  _id: string
  _type: 'shortArticle'
  _createdAt: string
  title?: string
  slug?: Slug
  excerpt?: string
  mainImage?: Image
  body?: BodyBlock[]
}

export interface Page {
  _id: string
  _type: 'page'
  _createdAt: string
  title?: string
  slug: Slug
  subtitle?: string
  mainImage?: Image
  body?: BodyBlock[]
}

export interface FrontpageData {
  articles: Article[]
  shortArticles: ShortArticle[]
  pages: Page[]
}
