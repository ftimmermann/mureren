import type {CSSProperties} from 'react'
import type {DocumentLayoutProps} from 'sanity'
import {useEditState} from 'sanity'

import DocumentPreviewPane from './DocumentPreviewPane'

const previewableSchemaTypes = new Set(['article', 'page', 'shortArticle'])

const layoutStyle: CSSProperties = {
  display: 'grid',
  gap: '1px',
  gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, 0.95fr)',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
}

const editorStyle: CSSProperties = {
  background: 'var(--card-bg-color)',
  height: '100%',
  minWidth: 0,
  overflow: 'auto',
}

const previewColumnStyle: CSSProperties = {
  background: '#eef1f3',
  borderLeft: '1px solid #d9dddf',
  height: '100%',
  minWidth: 0,
  overflow: 'hidden',
  width: '100%',
}

const schemaTitles: Record<string, string> = {
  article: 'Artikel',
  page: 'Statisk side',
  shortArticle: 'Kort nyt',
}

type PortableTextBlock = {
  _key?: string
  _type?: string
  style?: string
  children?: Array<{
    _type?: string
    text?: string
  }>
}

export default function DocumentEditorLayout(props: DocumentLayoutProps) {
  const editState = useEditState(props.documentId, props.documentType)

  if (!previewableSchemaTypes.has(props.documentType)) {
    return props.renderDefault(props)
  }

  const currentDocument = (editState.draft ??
    editState.version ??
    editState.published ??
    {}) as {
    title?: string
    subtitle?: string
    excerpt?: string
    body?: PortableTextBlock[]
  }

  return (
    <div style={layoutStyle}>
      <div style={editorStyle}>{props.renderDefault(props)}</div>
      <aside style={previewColumnStyle}>
        <DocumentPreviewPane
          body={currentDocument.body}
          excerpt={currentDocument.excerpt}
          schemaTitle={schemaTitles[props.documentType] ?? props.documentType}
          subtitle={currentDocument.subtitle}
          title={currentDocument.title}
        />
      </aside>
    </div>
  )
}
