import {
  dashboardTool,
  projectInfoWidget,
  projectUsersWidget,
  sanityTutorialsWidget,
} from '@sanity/dashboard'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import type {StructureResolver} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'

import {schemaTypes} from './schemas'
import DocumentEditorLayout from './components/DocumentEditorLayout'

import {DocumentsIcon, DocumentTextIcon, DocumentIcon, UsersIcon, TagIcon, TagsIcon} from '@sanity/icons'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET!

const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Indhold')
    .items([
      S.documentTypeListItem('page').title('Sider').icon(DocumentsIcon),
      S.documentTypeListItem('article').title('Artikler').icon(DocumentTextIcon),
      S.documentTypeListItem('shortArticle').title('Kort nyt').icon(DocumentIcon),
      S.divider(),
      S.documentTypeListItem('author').title('Skribenter').icon(UsersIcon),
      S.documentTypeListItem('category').title('Kategorier').icon(TagIcon),
      S.documentTypeListItem('tag').title('Tags').icon(TagsIcon),
    ])

export default defineConfig({
  name: 'lfmsos',
  title: 'Landsklubben',
  projectId,
  dataset,
  plugins: [
    dashboardTool({
      widgets: [
        projectInfoWidget({layout: {width: 'small'}}),
        projectUsersWidget({layout: {width: 'small'}}),
        sanityTutorialsWidget({layout: {width: 'medium'}}),
      ],
    }),
    structureTool({
      structure: deskStructure,
    }),
    presentationTool({
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:5173',
        previewMode: {
          enable: '/preview/enable',
          disable: '/preview/disable',
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    components: {
      unstable_layout: DocumentEditorLayout,
    },
  },
})
