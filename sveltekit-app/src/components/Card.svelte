<script lang="ts">
  import {formatDate} from '$lib/utils'
  import {urlFor} from '$lib/sanity/image'
  import type {Article} from '$lib/sanity/queries'

  const {article}: {article: Article} = $props()

  const displayDate = $derived(article.publicationDate ? formatDate(article.publicationDate) : article.legacyDate)
</script>

<a class="card" href={`/post/${article.slug.current}`}>
  {#if article.mainImage}
    <img
      class="card__cover"
      src={urlFor(article.mainImage).width(1200).height(640).fit('crop').url()}
      alt={article.title || ''}
    />
  {/if}

  <div class="card__content">
    <h2 class="card__title">{article.title}</h2>
    {#if article.subtitle}
      <p class="card__subtitle">{article.subtitle}</p>
    {/if}
    {#if displayDate}
      <p class="card__meta">{displayDate}</p>
    {/if}
  </div>
</a>

<style>
  .card {
    display: grid;
    gap: 1rem;
    color: inherit;
    text-decoration: none;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #ddd;
  }

  .card__cover {
    width: 100%;
    max-height: 28rem;
    object-fit: cover;
    display: block;
  }

  .card__content {
    display: grid;
    gap: 0.75rem;
  }

  .card__title {
    margin: 0;
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .card__subtitle {
    margin: 0;
    color: #444;
    line-height: 1.5;
  }

  .card__meta {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
  }

  @media (hover: hover) {
    .card:hover .card__title {
      text-decoration: underline;
    }
  }
</style>
