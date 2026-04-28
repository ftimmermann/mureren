import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultInputPath = path.resolve(__dirname, '../../mureren_articles_with_images/mureren_articles.json')
const apiVersion = process.env.SANITY_API_VERSION || '2025-10-22'

function printUsage() {
  console.log(`Usage:
  npm run import:articles --workspace=studio -- [input.json] [--dry-run] [--dataset <name>]

Examples:
  npm run import:articles --workspace=studio -- --dry-run
  npm run import:articles --workspace=studio -- ../my-articles.json
  npm run import:articles --workspace=studio -- ../my-articles.json --dataset development`)
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    dataset: process.env.SANITY_STUDIO_DATASET,
    inputPath: defaultInputPath,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--dataset') {
      options.dataset = argv[i + 1]
      i += 1
      continue
    }

    if (arg.startsWith('--dataset=')) {
      options.dataset = arg.slice('--dataset='.length)
      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`)
    }

    options.inputPath = path.resolve(process.cwd(), arg)
  }

  return options
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function withKeys(value, prefix = 'k') {
  if (Array.isArray(value)) {
    return value.map((item, index) => withKeys(item, `${prefix}-${index + 1}`))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const output = {...value}

  if (output._type && !output._key) {
    output._key = prefix
  }

  if (Array.isArray(output.children)) {
    output.children = output.children.map((child, index) => withKeys(child, `${prefix}-c${index + 1}`))
  }

  if (Array.isArray(output.markDefs)) {
    output.markDefs = output.markDefs.map((markDef, index) =>
      withKeys(markDef, `${prefix}-m${index + 1}`),
    )
  }

  return output
}

function toReference(_ref) {
  return {_type: 'reference', _ref}
}

function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value))
}

function collectImageRefs(article) {
  const refs = []

  if (article.mainImage?.asset?._ref) {
    refs.push(article.mainImage.asset._ref)
  }

  for (const block of article.body || []) {
    if (block?._type === 'image' && block.asset?._ref) {
      refs.push(block.asset._ref)
    }
  }

  return refs
}

function replaceImageRefs(value, uploadedAssetsBySourceRef) {
  if (Array.isArray(value)) {
    return value.map((entry) => replaceImageRefs(entry, uploadedAssetsBySourceRef))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const output = {...value}

  if (output._type === 'image' && output.asset?._ref) {
    const uploadedAssetRef = uploadedAssetsBySourceRef.get(output.asset._ref)

    if (uploadedAssetRef) {
      output.asset = {
        _type: 'reference',
        _ref: uploadedAssetRef,
      }
    }
  }

  for (const key of Object.keys(output)) {
    if (key === 'asset') continue
    output[key] = replaceImageRefs(output[key], uploadedAssetsBySourceRef)
  }

  return output
}

function buildDocuments(rawArticles) {
  const authorDocs = new Map()
  const categoryDocs = new Map()
  const tagDocs = new Map()
  const articleDocs = []
  const warnings = []
  const imageSourceRefs = new Set()

  rawArticles.forEach((rawArticle, index) => {
    const title = rawArticle.title?.trim()
    const slug = rawArticle.slug?.current?.trim()

    if (!title || !slug) {
      warnings.push(`Skipping item ${index + 1}: missing title or slug`)
      return
    }

    const authorName = rawArticle.authorName?.trim()
    let authorRef

    if (authorName) {
      const authorId = `author.${slugify(authorName)}`
      authorRef = authorId

      if (!authorDocs.has(authorId)) {
        authorDocs.set(authorId, {
          _id: authorId,
          _type: 'author',
          name: authorName,
        })
      }
    }

    const categoryName = rawArticle.category?.trim()
    let categoryRef

    if (categoryName) {
      const categoryId = `category.${slugify(categoryName)}`
      categoryRef = categoryId

      if (!categoryDocs.has(categoryId)) {
        categoryDocs.set(categoryId, {
          _id: categoryId,
          _type: 'category',
          name: categoryName,
          description: categoryName,
        })
      }
    }

    const tagName = rawArticle.tag?.trim()
    let tagRef

    if (tagName) {
      const tagId = `tag.${slugify(tagName)}`
      tagRef = tagId

      if (!tagDocs.has(tagId)) {
        tagDocs.set(tagId, {
          _id: tagId,
          _type: 'tag',
          name: tagName,
          description: tagName,
        })
      }
    }

    for (const imageRef of collectImageRefs(rawArticle)) {
      imageSourceRefs.add(imageRef)
    }

    articleDocs.push({
      _id: rawArticle._id?.trim() || `article.${slug}`,
      _type: 'article',
      title,
      slug: {
        _type: 'slug',
        current: slug,
      },
      subtitle: rawArticle.subtitle?.trim() || undefined,
      publicationDate: rawArticle.publicationDate?.trim() || undefined,
      legacyDate: rawArticle.legacyDate?.trim() || undefined,
      mainImage: cloneJson(rawArticle.mainImage) || undefined,
      body: Array.isArray(rawArticle.body)
        ? rawArticle.body.map((block, blockIndex) => withKeys(block, `article-${index + 1}-b${blockIndex + 1}`))
        : [],
      author: authorRef ? toReference(authorRef) : undefined,
      category: categoryRef ? toReference(categoryRef) : undefined,
      tag: tagRef ? toReference(tagRef) : undefined,
    })
  })

  return {
    authorDocs: [...authorDocs.values()],
    categoryDocs: [...categoryDocs.values()],
    tagDocs: [...tagDocs.values()],
    articleDocs,
    warnings,
    imageSourceRefs: [...imageSourceRefs],
  }
}

function assertWriteEnv(dataset) {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!projectId) {
    throw new Error('Missing SANITY_STUDIO_PROJECT_ID in studio/.env')
  }

  if (!dataset) {
    throw new Error('Missing SANITY_STUDIO_DATASET in studio/.env or via --dataset')
  }

  return {projectId, token}
}

async function loadPayload(inputPath) {
  const fileContents = await readFile(inputPath, 'utf8')
  const parsed = JSON.parse(fileContents)

  if (Array.isArray(parsed)) {
    return {
      articles: parsed,
      imageMap: {},
    }
  }

  if (parsed && Array.isArray(parsed.articles)) {
    return {
      articles: parsed.articles,
      imageMap: parsed.imageMap || {},
    }
  }

  throw new Error('Expected the input JSON file to contain an array of articles or an object with an articles array')
}

async function uploadImages({client, imageMap, imageSourceRefs, inputPath, dryRun}) {
  const uploadedAssetsBySourceRef = new Map()
  const warnings = []
  const payloadRoot = path.dirname(inputPath)

  for (const sourceRef of imageSourceRefs) {
    const relativeImagePath = imageMap[sourceRef]

    if (!relativeImagePath) {
      warnings.push(`Missing imageMap entry for ${sourceRef}`)
      continue
    }

    const absoluteImagePath = path.resolve(payloadRoot, relativeImagePath)

    if (dryRun) {
      uploadedAssetsBySourceRef.set(sourceRef, `dry-run-${sourceRef}`)
      continue
    }

    const imageBuffer = await readFile(absoluteImagePath)
    const uploadedAsset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(absoluteImagePath),
    })

    uploadedAssetsBySourceRef.set(sourceRef, uploadedAsset._id)
  }

  return {
    uploadedAssetsBySourceRef,
    warnings,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printUsage()
    return
  }

  const {projectId, token} = assertWriteEnv(options.dataset)
  const payload = await loadPayload(options.inputPath)
  const documents = buildDocuments(payload.articles)

  console.log(`Input: ${options.inputPath}`)
  console.log(`Dataset: ${options.dataset}`)
  console.log(`Articles in file: ${payload.articles.length}`)
  console.log(`Authors to upsert: ${documents.authorDocs.length}`)
  console.log(`Categories to upsert: ${documents.categoryDocs.length}`)
  console.log(`Tags to upsert: ${documents.tagDocs.length}`)
  console.log(`Articles to upsert: ${documents.articleDocs.length}`)
  console.log(`Referenced images: ${documents.imageSourceRefs.length}`)

  const client = getCliClient({
    apiVersion,
    cwd: process.cwd(),
    dataset: options.dataset,
    projectId,
    token,
    useCdn: false,
  })

  const uploadedImages = await uploadImages({
    client,
    imageMap: payload.imageMap,
    imageSourceRefs: documents.imageSourceRefs,
    inputPath: options.inputPath,
    dryRun: options.dryRun,
  })

  const resolvedArticleDocs = documents.articleDocs.map((articleDoc) =>
    replaceImageRefs(articleDoc, uploadedImages.uploadedAssetsBySourceRef),
  )

  const warnings = [...documents.warnings, ...uploadedImages.warnings]

  if (warnings.length > 0) {
    console.log('\nWarnings:')
    for (const warning of warnings) {
      console.log(`- ${warning}`)
    }
  }

  if (options.dryRun) {
    console.log('\nDry run complete. No changes were written to Sanity.')
    return
  }

  let transaction = client.transaction()

  for (const doc of [
    ...documents.authorDocs,
    ...documents.categoryDocs,
    ...documents.tagDocs,
    ...resolvedArticleDocs,
  ]) {
    transaction = transaction.createOrReplace(doc)
  }

  const result = await transaction.commit()
  console.log(`\nImport complete. Uploaded ${uploadedImages.uploadedAssetsBySourceRef.size} image assets.`)
  console.log(`Transaction ID: ${result.transactionId}`)
}

main().catch((error) => {
  console.error(`Import failed: ${error.message}`)
  process.exitCode = 1
})
