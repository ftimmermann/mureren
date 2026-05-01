<script lang="ts">
  import {PortableText} from '@portabletext/svelte'
  import {browser} from '$app/environment'
  import {afterNavigate} from '$app/navigation'
  import {onMount} from 'svelte'
  import BodyImage from '../../components/BodyImage.svelte'
  import PollBlock from '../../components/PollBlock.svelte'
  import type {ShortArticle} from '$lib/sanity/queries'
  import {urlFor} from '$lib/sanity/image'
  import {formatDateTime} from '$lib/utils'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()
  const articles = $derived((data.options.initial.data ?? []) as ShortArticle[])

  const components = {
    types: {
      image: BodyImage,
      pollReference: PollBlock,
    },
  }

  let mainNodes = $state<HTMLElement[]>([])
  let secondaryNodes = $state<HTMLElement[]>([])
  let activeIndex = $state(0)
  let secondaryContainer = $state<HTMLElement | null>(null)

  function updateActiveIndex() {
    if (!browser || mainNodes.length === 0) {
      return
    }

    let nextActiveIndex = 0

    for (const [index, node] of mainNodes.entries()) {
      if (!node) {
        continue
      }

      const rect = node.getBoundingClientRect()
      const hasPassedHandoverPoint = rect.top <= -(rect.height * 0.6)

      if (!hasPassedHandoverPoint) {
        break
      }

      nextActiveIndex = Math.min(index + 1, mainNodes.length - 1)
    }

    activeIndex = nextActiveIndex
  }

  function handleViewportChange() {
    updateActiveIndex()
  }

  function scrollToArticle(index: number) {
    const targetNode = mainNodes[index]

    if (!targetNode) {
      return
    }

    targetNode.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function shortArticleAnchor(article: ShortArticle) {
    return `kort-nyt-${article.slug?.current ?? article._id}`
  }

  function scrollToCurrentHash() {
    if (!browser || !window.location.hash) {
      return
    }

    const targetId = decodeURIComponent(window.location.hash.slice(1))
    const targetNode = document.getElementById(targetId)

    if (!targetNode) {
      return
    }

    targetNode.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    targetNode.focus({preventScroll: true})
  }

  function scrollToCurrentHashAfterRender() {
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToCurrentHash)
    })
  }

  function syncSecondaryScroll() {
    if (!browser || !secondaryContainer) {
      return
    }

    const activeNode = secondaryNodes[activeIndex]

    if (!activeNode) {
      return
    }

    const containerRect = secondaryContainer.getBoundingClientRect()
    const nodeRect = activeNode.getBoundingClientRect()
    const isFullyVisible =
      nodeRect.top >= containerRect.top && nodeRect.bottom <= containerRect.bottom

    if (isFullyVisible) {
      return
    }

    secondaryContainer.scrollTo({
      top: activeNode.offsetTop,
      behavior: 'smooth',
    })
  }

  $effect(() => {
    if (!browser || articles.length === 0) {
      return
    }

    const observer = new IntersectionObserver(handleViewportChange, {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    })

    for (const node of mainNodes) {
      if (node) {
        observer.observe(node)
      }
    }

    window.addEventListener('scroll', handleViewportChange, {passive: true})
    window.addEventListener('resize', handleViewportChange)
    updateActiveIndex()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
    }
  })

  $effect(() => {
    activeIndex
    syncSecondaryScroll()
  })

  onMount(() => {
    scrollToCurrentHashAfterRender()
  })

  afterNavigate(({to}) => {
    if (to?.url.pathname === '/nyheder' && to.url.hash) {
      scrollToCurrentHashAfterRender()
    }
  })
</script>

<svelte:head>
  <title>Nyheder</title>
</svelte:head>

<section class="news-page">
  <header class="news-page__header">
    <p class="news-page__eyebrow">Kort nyt</p>
    <h1>Nyheder</h1>
  </header>

  {#if articles.length}
    <div class="news-layout">
      <div class="news-layout__main">
        {#each articles as article, index (article._id)}
          <article
            id={shortArticleAnchor(article)}
            tabindex="-1"
            class:main-node={true}
            class:main-node--active={index === activeIndex}
            bind:this={mainNodes[index]}
          >
            <div class="main-node__meta">{formatDateTime(article._createdAt)}</div>
            <h2 class="main-node__title">{article.title}</h2>

            {#if article.excerpt}
              <p class="main-node__excerpt">{article.excerpt}</p>
            {/if}

            {#if article.mainImage}
              <img
                class="main-node__image"
                src={urlFor(article.mainImage).width(1400).fit('max').url()}
                alt={article.title || ''}
              />
            {/if}

            {#if article.body?.length}
              <div class="main-node__body">
                <PortableText {components} value={article.body} />
              </div>
            {/if}
          </article>
        {/each}
      </div>

      <aside
        class="news-layout__secondary"
        aria-label="Nyhedsoversigt"
        bind:this={secondaryContainer}
      >
        <div class="secondary-list">
          {#each articles as article, index (article._id)}
            <button
              type="button"
              class:secondary-node={true}
              class:secondary-node--active={index === activeIndex}
              bind:this={secondaryNodes[index]}
              onclick={() => scrollToArticle(index)}
            >
              <p class="secondary-node__time">{formatDateTime(article._createdAt)}</p>
              <p class="secondary-node__title">{article.title}</p>
            </button>
          {/each}
        </div>
      </aside>
    </div>
  {:else}
    <p class="empty">Ingen korte nyheder endnu.</p>
  {/if}
</section>

<style>
  .news-page {
    display: grid;
    gap: 2rem;
  }

  .news-page__header {
    display: grid;
    gap: 0.5rem;
  }

  .news-page__header h1,
  .news-page__eyebrow {
    margin: 0;
  }

  .news-page__eyebrow {
    color: #6a6a6a;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .news-layout {
    display: grid;
    gap: 2rem;
    align-items: start;
  }

  .news-layout__main {
    display: grid;
    gap: 4rem;
    min-width: 0;
  }

  .news-layout__secondary {
    min-width: 0;
    position: sticky;
    top: 0;
    align-self: start;
    max-height: 100vh;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .main-node {
    display: grid;
    gap: 1rem;
    padding: 1.5rem;
    padding-bottom: 3rem;
    border-radius: 1.5rem;
    border-bottom: 1px solid #ddd;
    scroll-margin-top: 1.5rem;
    background: transparent;
    transition: background-color 160ms ease;
  }

  .main-node--active {
    background: #f7f4ee;
  }

  .main-node__meta,
  .secondary-node__time {
    color: #666;
    font-size: 0.95rem;
  }

  .main-node__title,
  .main-node__excerpt,
  .secondary-node__title {
    margin: 0;
  }

  .main-node__title {
    font-size: clamp(2rem, 4vw, 3.25rem);
    line-height: 1.05;
  }

  .main-node__excerpt {
    color: #444;
    font-size: 1.125rem;
    line-height: 1.6;
  }

  .main-node__image {
    width: 100%;
    display: block;
  }

  .main-node__body {
    font-size: 1.0625rem;
    line-height: 1.75;
  }

  .main-node__body :global(p),
  .main-node__body :global(blockquote) {
    margin: 0 0 1rem;
  }

  .main-node__body :global(blockquote) {
    padding-left: 1rem;
    border-left: 2px solid #ddd;
  }

  .main-node__body :global(a) {
    color: inherit;
  }

  .main-node__body :global(.body-image) {
    margin: 1.5rem 0;
  }

  .main-node__body :global(.body-image img) {
    width: 100%;
    display: block;
  }

  .main-node__body :global(.body-image figcaption) {
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.95rem;
  }

  .secondary-list {
    display: grid;
    gap: 0.75rem;
  }

  .secondary-node {
    display: grid;
    gap: 0.35rem;
    width: 100%;
    padding: 1rem;
    border: 0;
    border-radius: 1rem;
    background: #f5f5f5;
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      color 160ms ease,
      transform 160ms ease;
  }

  .secondary-node--active {
    background: #111;
    color: #fff;
    transform: translateX(-0.25rem);
  }

  .secondary-node--active .secondary-node__time {
    color: rgba(255, 255, 255, 0.72);
  }

  .secondary-node__time,
  .secondary-node__title {
    margin: 0;
  }

  .secondary-node__title {
    font-size: 1.05rem;
    line-height: 1.4;
    font-weight: 600;
  }

  .secondary-node:focus-visible {
    outline: 2px solid #111;
    outline-offset: 2px;
  }

  .secondary-node--active:focus-visible {
    outline-color: #fff;
  }

  .empty {
    margin: 0;
    color: #666;
  }

  @media (min-width: 900px) {
    .news-layout {
      grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr);
    }
  }

  @media (max-width: 899px) {
    .news-layout__secondary {
      position: static;
    }

    .secondary-list {
      position: static;
    }
  }
</style>
