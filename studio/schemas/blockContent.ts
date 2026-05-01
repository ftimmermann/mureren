import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Brødtekst', value: 'normal'},
        {title: 'Mellemrubrik', value: 'h2'},
        {title: 'Citat', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    defineArrayMember({
      name: 'pollReference',
      title: 'Afstemning',
      type: 'object',
      fields: [
        defineField({
          name: 'poll',
          title: 'Afstemning',
          type: 'reference',
          to: [{type: 'poll'}],
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          title: 'poll.title',
          question: 'poll.question',
        },
        prepare(selection) {
          const {question} = selection
          return {
            title: selection.title || 'Afstemning',
            subtitle: question,
          }
        },
      },
    }),
  ],
})
