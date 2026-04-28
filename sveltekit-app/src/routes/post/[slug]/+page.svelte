<script lang="ts">
  import {PortableText} from '@portabletext/svelte'
  import BodyImage from '../../../components/BodyImage.svelte'
  import type {Article} from '$lib/sanity/queries'
  import {formatDate} from '$lib/utils'
  import {urlFor} from '$lib/sanity/image'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()
  const article = $derived(data.options.initial.data as Article | null)
  const displayDate = $derived(
    article?.publicationDate ? formatDate(article.publicationDate) : article?.legacyDate,
  )

  const components = {
    types: {
      image: BodyImage,
    },
  }
</script>

{#if article}
  <article class="article">
    {#if article.mainImage}
      <img
        class="article__cover"
        src={urlFor(article.mainImage).width(1600).url()}
        alt={article.title || ''}
      />
    {/if}
    <div class="article__content">
      <h1 class="article__title">{article.title}</h1>
      {#if article.subtitle}
        <p class="article__subtitle">{article.subtitle}</p>
      {/if}
      {#if article.author?.name || displayDate}
        <p class="article__meta">
          {#if article.author?.name}{article.author.name}{/if}
          {#if article.author?.name && displayDate} · {/if}
          {#if displayDate}{displayDate}{/if}
        </p>
      {/if}
      {#if article.body}
        <div class="article__body">
          <PortableText {components} value={article.body} />
        </div>
      {/if}
    </div>
  </article>
{/if}

<style>
  .article {
    display: grid;
    gap: 1.5rem;
  }

  .article__cover {
    width: 100%;
    object-fit: cover;
    display: block;
  }

  .article__content {
    display: grid;
    gap: 1rem;
  }

  .article__title,
  .article__subtitle,
  .article__meta {
    margin: 0;
  }

  .article__title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1.05;
  }

  .article__subtitle {
    color: #444;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  .article__meta {
    color: #666;
    font-size: 0.95rem;
  }

  .article__body {
    font-size: 1.0625rem;
    line-height: 1.75;
  }

  .article__body :global(p),
  .article__body :global(blockquote) {
    margin: 0 0 1rem;
  }

  .article__body :global(blockquote) {
    padding-left: 1rem;
    border-left: 2px solid #ddd;
  }

  .article__body :global(a) {
    color: inherit;
  }

  .article__body :global(.body-image) {
    margin: 1.5rem 0;
  }

  .article__body :global(.body-image img) {
    width: 100%;
    display: block;
  }

  .article__body :global(.body-image figcaption) {
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.95rem;
  }
</style>
