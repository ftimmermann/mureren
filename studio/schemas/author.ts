import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'author',
    title: 'Skribent',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'authorImage',
            title: 'Skribentbillede',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
})