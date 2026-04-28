import type {CSSProperties} from 'react'

type PortableTextChild = {
  _type?: string
  text?: string
}

type PortableTextBlock = {
  _key?: string
  _type?: string
  style?: string
  children?: PortableTextChild[]
}

type PreviewData = {
  title?: string
  subtitle?: string
  excerpt?: string
  body?: PortableTextBlock[]
  schemaTitle?: string
}

const shellStyle: CSSProperties = {
  background: '#f6f7f7',
  height: '100%',
  minHeight: '100%',
  overflow: 'auto',
  padding: '1.5rem',
}

const previewStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e3e3',
  borderRadius: '18px',
  boxShadow: '0 12px 40px rgba(18, 23, 28, 0.08)',
  margin: '0 auto',
  maxWidth: '760px',
  padding: '3rem',
}

const eyebrowStyle: CSSProperties = {
  color: '#5b646b',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  margin: '0 0 1rem',
  textTransform: 'uppercase',
}

const titleStyle: CSSProperties = {
  color: '#101418',
  fontSize: 'clamp(2rem, 3vw, 3.4rem)',
  fontWeight: 800,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  margin: 0,
}

const subtitleStyle: CSSProperties = {
  color: '#44515c',
  fontSize: '1.125rem',
  lineHeight: 1.6,
  margin: '1rem 0 0',
  maxWidth: '62ch',
}

const bodyStyle: CSSProperties = {
  color: '#182028',
  fontSize: '1.05rem',
  lineHeight: 1.8,
  marginTop: '2.5rem',
}

const emptyStyle: CSSProperties = {
  color: '#6b7680',
  fontStyle: 'italic',
}

function getBlockText(block: PortableTextBlock): string {
  return (block.children ?? [])
    .map((child) => child.text ?? '')
    .join('')
    .trim()
}

function renderBlock(block: PortableTextBlock) {
  const text = getBlockText(block)

  if (!text) {
    return null
  }

  switch (block.style) {
    case 'h2':
      return (
        <h2
          key={block._key}
          style={{
            fontSize: '1.6rem',
            fontWeight: 750,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '2rem 0 0.75rem',
          }}
        >
          {text}
        </h2>
      )
    case 'blockquote':
      return (
        <blockquote
          key={block._key}
          style={{
            borderLeft: '4px solid #c4ccd2',
            color: '#34414b',
            fontSize: '1.15rem',
            margin: '1.75rem 0',
            padding: '0.25rem 0 0.25rem 1rem',
          }}
        >
          {text}
        </blockquote>
      )
    default:
      return (
        <p key={block._key} style={{margin: '0 0 1.1rem'}}>
          {text}
        </p>
      )
  }
}

export default function DocumentPreviewPane({
  title,
  subtitle,
  excerpt,
  body,
  schemaTitle,
}: PreviewData) {
  const teaser = subtitle ?? excerpt
  const bodyBlocks = Array.isArray(body) ? body : []

  return (
    <div style={shellStyle}>
      <article style={previewStyle}>
        <p style={eyebrowStyle}>{schemaTitle ?? 'Preview'}</p>
        <h1 style={titleStyle}>{title || 'Untitled document'}</h1>
        {teaser ? <p style={subtitleStyle}>{teaser}</p> : null}

        <div style={bodyStyle}>
          {bodyBlocks.length > 0 ? (
            bodyBlocks.map(renderBlock)
          ) : (
            <p style={emptyStyle}>Start writing to see the content preview here.</p>
          )}
        </div>
      </article>
    </div>
  )
}
