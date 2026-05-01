import {defineArrayMember, defineField, defineType} from 'sanity'

const pollTypeOptions = [
  {title: 'Et svar', value: 'singleChoice'},
  {title: 'Flere svar', value: 'multipleChoice'},
]

const resultVisibilityOptions = [
  {title: 'Vis resultat med det samme', value: 'immediate'},
  {title: 'Vis resultat efter lukning', value: 'afterClose'},
  {title: 'Skjul resultat eksternt', value: 'hidden'},
]

const statusOptions = [
  {title: 'Kladde', value: 'draft'},
  {title: 'Aktiv', value: 'active'},
  {title: 'Lukket', value: 'closed'},
  {title: 'Arkiveret', value: 'archived'},
]

export default defineType({
  name: 'poll',
  title: 'Afstemning',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Intern titel',
      type: 'string',
      description: 'Bruges i Sanity og som fallback, hvis spørgsmålet mangler.',
      validation: (Rule) => Rule.required(),
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
      name: 'question',
      title: 'Spørgsmål',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Introduktion',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'type',
      title: 'Afstemningstype',
      type: 'string',
      initialValue: 'singleChoice',
      options: {
        list: pollTypeOptions,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Svarmuligheder',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pollOption',
          title: 'Svarmulighed',
          fields: [
            defineField({
              name: 'label',
              title: 'Tekst',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'maxSelections',
      title: 'Maksimalt antal valg',
      type: 'number',
      description: 'Kun relevant når brugeren må vælge flere svar.',
      hidden: ({parent}) => parent?.type !== 'multipleChoice',
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Starttidspunkt',
      type: 'datetime',
    }),
    defineField({
      name: 'endsAt',
      title: 'Sluttidspunkt',
      type: 'datetime',
    }),
    defineField({
      name: 'resultVisibility',
      title: 'Resultatvisning',
      type: 'string',
      initialValue: 'afterClose',
      options: {
        list: resultVisibilityOptions,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: statusOptions,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'purposeText',
      title: 'Hvad bruger vi svarene til?',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'conclusionText',
      title: 'Resultatet betyder, at vi...',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      question: 'question',
      status: 'status',
    },
    prepare(selection) {
      const {question, status} = selection
      return {
        ...selection,
        subtitle: [status, question].filter(Boolean).join(' · '),
      }
    },
  },
})
