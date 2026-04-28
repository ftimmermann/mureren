import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'article',
  title: 'Artikel',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Rubrik',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'subtitle',
      title: 'Underrubbrik',
      description: 'Bruges også som kort tekst på henvisninger',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'publicationDate',
      title: 'Udgivelsesdato',
      type: 'date',
      options: {
        dateFormat: 'DD-MM-YYYY',
      },
    }),
    defineField({
      name: 'legacyDate',
      title: 'LegacyDate',
      type: 'string',
    }),
    defineField({
      name: 'mainImage',
      title: 'Artikelbillede',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
        name: 'author',
        title: 'Skribent',
        type: 'reference',
        to: [{type: 'author'}]
    }),
    defineField({
        name: 'category',
        title: 'Kategori',
        type: 'reference',
        to: [{type: 'category'}]
    }),
    defineField({
        name: 'tag',
        title: 'Tag',
        type: 'reference',
        to: [{type: 'tag'}]
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
