import type {PortableTextBlock} from '@portabletext/types'
import type {Image, Slug} from '@sanity/types'
import groq from 'groq'

export const articleQuery = groq`*[_type == "article" && slug.current == $slug][0]{
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
}`

export const articlesQuery = groq`*[_type == "article" && defined(slug.current)] | order(coalesce(publicationDate, _createdAt) desc){
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
}`

export const shortArticlesQuery = groq`*[_type == "shortArticle"] | order(_createdAt desc){
  ...
}`

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
  body: PortableTextBlock[]
}

export interface ShortArticle {
  _id: string
  _type: 'shortArticle'
  _createdAt: string
  title?: string
  excerpt?: string
  mainImage?: Image
  body?: PortableTextBlock[]
}
