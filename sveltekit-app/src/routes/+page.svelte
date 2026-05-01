<script lang="ts">
  import {urlFor} from '$lib/sanity/image'
  import {formatDate} from '$lib/utils'
  import type {Article, FrontpageData, Page, ShortArticle} from '$lib/sanity/queries'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()
  const frontpage = $derived(data.options.initial.data as FrontpageData | null)
  const articles = $derived(frontpage?.articles ?? [])
  const shortArticles = $derived(frontpage?.shortArticles ?? [])
  const pages = $derived(frontpage?.pages ?? [])
  const leadArticle = $derived(articles[0])
  const secondaryArticles = $derived(articles.slice(1, 3))
  const listArticles = $derived(articles.slice(3, 5))
  const utilityPages = $derived(pages.slice(0, 4))

  function articleHref(article: Article) {
    return `/post/${article.slug.current}`
  }

  function pageHref(page: Page) {
    return `/${page.slug.current}`
  }

  function articleKicker(article: Article) {
    return article.category?.name ?? article.tag?.name ?? 'Artikel'
  }

  function articleDate(article: Article) {
    return article.publicationDate ? formatDate(article.publicationDate) : article.legacyDate
  }

  function shortArticleAnchor(article: ShortArticle) {
    return `kort-nyt-${article.slug?.current ?? article._id}`
  }

  function shortArticleHref(article: ShortArticle) {
    return `/nyheder#${encodeURIComponent(shortArticleAnchor(article))}`
  }
</script>

<svelte:head>
  <title>Mureren</title>
</svelte:head>

<div class="frontpage">
  <section class="frontpage-section frontpage-section--news" aria-labelledby="frontpage-news-title">
    <div class="frontpage-section__header">
      <h1 id="frontpage-news-title">Nyheder</h1>
      <a class="frontpage-section__link" href="/nyheder">Se alle</a>
    </div>

    <div class="news-layout">
      {#if leadArticle}
        <article class="news-card news-card--lead">
          <a class="news-card__media" href={articleHref(leadArticle)}>
            {#if leadArticle.mainImage}
              <img
                src={urlFor(leadArticle.mainImage).width(1400).height(900).fit('crop').url()}
                alt={leadArticle.title || ''}
              />
            {:else}
              <span class="media-placeholder" aria-hidden="true"></span>
            {/if}
          </a>
          <div class="news-card__body">
            <p class="news-card__kicker">{articleKicker(leadArticle)}</p>
            <h2 class="news-card__title">
              <a href={articleHref(leadArticle)}>{leadArticle.title}</a>
            </h2>
            {#if leadArticle.subtitle}
              <p class="news-card__summary">{leadArticle.subtitle}</p>
            {/if}
            {#if articleDate(leadArticle)}
              <p class="news-card__meta">{articleDate(leadArticle)}</p>
            {/if}
          </div>
        </article>
      {:else}
        <article class="news-card news-card--lead news-card--placeholder">
          <span class="news-card__media media-placeholder" aria-hidden="true"></span>
          <div class="news-card__body">
            <p class="news-card__kicker">Artikel</p>
            <h2 class="news-card__title">Pladsholder til topnyhed</h2>
            <p class="news-card__summary">Dette område er klar til den primære forsideartikel.</p>
          </div>
        </article>
      {/if}

      <div class="news-layout__secondary" aria-label="Flere nyheder">
        {#each secondaryArticles as article (article._id)}
          <article class="news-card news-card--secondary">
            <a class="news-card__media" href={articleHref(article)}>
              {#if article.mainImage}
                <img
                  src={urlFor(article.mainImage).width(800).height(430).fit('crop').url()}
                  alt={article.title || ''}
                />
              {:else}
                <span class="media-placeholder" aria-hidden="true"></span>
              {/if}
            </a>
            <div class="news-card__body">
              <p class="news-card__kicker">{articleKicker(article)}</p>
              <h2 class="news-card__title">
                <a href={articleHref(article)}>{article.title}</a>
              </h2>
              {#if article.subtitle}
                <p class="news-card__summary">{article.subtitle}</p>
              {/if}
            </div>
          </article>
        {/each}

        {#each listArticles as article (article._id)}
          <article class="news-list-item">
            <a class="news-list-item__media" href={articleHref(article)}>
              {#if article.mainImage}
                <img
                  src={urlFor(article.mainImage).width(320).height(320).fit('crop').url()}
                  alt={article.title || ''}
                />
              {:else}
                <span class="media-placeholder" aria-hidden="true"></span>
              {/if}
            </a>
            <div class="news-list-item__body">
              <p class="news-card__kicker">{articleKicker(article)}</p>
              <h2 class="news-list-item__title">
                <a href={articleHref(article)}>{article.title}</a>
              </h2>
              {#if article.subtitle}
                <p class="news-card__summary">{article.subtitle}</p>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="short-news-band" aria-labelledby="short-news-title">
    <div class="short-news-band__inner">
      <div class="short-news-band__header">
        <h2 id="short-news-title">Kort nyt</h2>
        <a href="/nyheder">Se alle</a>
      </div>
      <div class="short-news-list">
        {#each shortArticles.slice(0, 3) as item (item._id)}
          <article class="short-news-item">
            <a class="short-news-item__link" href={shortArticleHref(item)} data-sveltekit-noscroll>
              <p class="short-news-item__meta">{formatDate(item._createdAt)}</p>
              <h3>{item.title}</h3>
              {#if item.excerpt}
                <p>{item.excerpt}</p>
              {/if}
            </a>
          </article>
        {:else}
          <article class="short-news-item">
            <p class="short-news-item__meta">Kort nyt</p>
            <h3>Pladsholder til kort nyhed</h3>
            <p>Området er klar til korte redaktionelle opdateringer.</p>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="frontpage-section frontpage-section--contact" aria-label="Kontakt og nyhedsbrev">
    <article class="info-card info-card--tip">
      <h2>Tip redaktionen</h2>
      <p>Har du en historie, en idé eller et spørgsmål til redaktionen?</p>
      <a href="mailto:redaktion@example.com">Skriv til redaktionen</a>
    </article>

    <article class="info-card info-card--newsletter">
      <h2>Tilmeld dig nyhedsbrevet</h2>
      <p>Få nyt fra Mureren direkte i din indbakke.</p>
      <a href="https://www.brevo.com/">Gå til Brevo.com</a>
    </article>
  </section>

  <section class="feature-band" aria-labelledby="pdf-title">
    <div class="feature-band__inner">
      <h2 id="pdf-title">Læs Mureren som PDF</h2>
    </div>
  </section>

  <section class="frontpage-section frontpage-section--utility" aria-label="Genveje">
    <div class="utility-grid">
      {#each utilityPages as page (page._id)}
        <article class="utility-card">
          <h2>{page.title}</h2>
          {#if page.subtitle}
            <p>{page.subtitle}</p>
          {/if}
          <a href={pageHref(page)}>Læs mere</a>
        </article>
      {:else}
        <article class="utility-card">
          <h2>Bliv medlem af 3F</h2>
          <p>Pladsholder til medlemskabshenvisning.</p>
          <a href="/">Gå til 3f.dk</a>
        </article>
        <article class="utility-card">
          <h2>Find din afdeling</h2>
          <p>Pladsholder til afdelingssøgning eller ekstern henvisning.</p>
          <a href="/">Gå til 3f.dk</a>
        </article>
        <article class="utility-card utility-card--wide">
          <h2>Branche vejledninger</h2>
          <p>Pladsholder til vejledninger og vigtige links.</p>
          <a href="/">Læs mere</a>
        </article>
        <article class="utility-card utility-card--wide">
          <h2>Overenskomst 2025 for murer</h2>
          <p>Pladsholder til overenskomstindhold.</p>
          <a href="/">Læs mere</a>
        </article>
      {/each}
    </div>
  </section>

  <section class="feature-band feature-band--faq" aria-labelledby="faq-title">
    <div class="feature-band__inner">
      <h2 id="faq-title">FAQ</h2>
    </div>
  </section>
</div>

<style>
  .frontpage {
    display: grid;
    gap: 2.5rem;
  }

  .frontpage-section,
  .short-news-band__inner,
  .feature-band__inner {
    width: min(58rem, calc(100% - 2rem));
    margin-inline: auto;
  }

  .frontpage-section__header,
  .short-news-band__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .frontpage-section__header h1,
  .short-news-band__header h2,
  .feature-band h2,
  .info-card h2,
  .utility-card h2 {
    margin: 0;
    font-size: 1rem;
    line-height: 1.25;
    text-transform: uppercase;
  }

  .frontpage-section__link,
  .short-news-band__header a,
  .news-card a,
  .news-list-item a,
  .short-news-item__link,
  .info-card a,
  .utility-card a {
    color: inherit;
  }

  .news-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(16rem, 1fr);
    gap: 1rem;
  }

  .news-layout__secondary {
    display: grid;
    gap: 1rem;
  }

  .news-card,
  .news-list-item,
  .info-card,
  .utility-card {
    min-width: 0;
  }

  .news-card__media,
  .news-list-item__media {
    display: block;
    background: #ddd;
    overflow: hidden;
  }

  .news-card__media {
    aspect-ratio: 16 / 10;
  }

  .news-card--lead .news-card__media {
    aspect-ratio: 3 / 2;
  }

  .news-card__media img,
  .news-list-item__media img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .media-placeholder {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 7rem;
    background: #ddd;
  }

  .news-card__body {
    display: grid;
    gap: 0.45rem;
    padding-top: 0.75rem;
  }

  .news-card__kicker,
  .news-card__meta,
  .short-news-item__meta {
    margin: 0;
    color: #666;
    font-size: 0.82rem;
    text-transform: uppercase;
  }

  .news-card__title,
  .news-list-item__title {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.25;
  }

  .news-card--lead .news-card__title {
    font-size: clamp(1.6rem, 3vw, 2.5rem);
  }

  .news-card__summary,
  .short-news-item p,
  .info-card p,
  .utility-card p {
    margin: 0;
    color: #444;
    line-height: 1.45;
  }

  .news-list-item {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .news-list-item__media {
    aspect-ratio: 1;
  }

  .short-news-band,
  .feature-band {
    background: #ddd;
  }

  .short-news-band {
    padding: 1.25rem 0;
  }

  .short-news-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .short-news-item {
    display: grid;
    min-width: 0;
  }

  .short-news-item__link {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
    text-decoration: none;
  }

  .short-news-item h3 {
    margin: 0;
    font-size: 1rem;
    line-height: 1.25;
  }

  .frontpage-section--contact {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .info-card,
  .utility-card {
    display: grid;
    gap: 0.75rem;
    align-content: start;
    padding: 1rem;
    background: #e5e5e5;
  }

  .info-card a,
  .utility-card a {
    width: fit-content;
    margin-top: 0.25rem;
  }

  .feature-band {
    min-height: 9rem;
    display: grid;
    align-items: center;
    text-align: center;
  }

  .utility-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }

  .utility-card--wide {
    grid-column: span 2;
  }

  @media (max-width: 760px) {
    .frontpage {
      gap: 2rem;
    }

    .news-layout {
      grid-template-columns: 1fr;
    }

    .news-layout__secondary {
      gap: 1.25rem;
    }

    .news-card--secondary {
      display: grid;
      grid-template-columns: 5.5rem minmax(0, 1fr);
      gap: 1rem;
    }

    .news-card--secondary .news-card__media {
      aspect-ratio: 1;
    }

    .news-card--secondary .news-card__body {
      padding-top: 0;
    }

    .news-card--secondary .news-card__summary {
      display: none;
    }

    .short-news-list {
      display: flex;
      gap: 2rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scroll-snap-type: x proximity;
    }

    .short-news-item {
      flex: 0 0 13rem;
      scroll-snap-align: start;
    }

    .frontpage-section--contact,
    .utility-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .utility-card--wide {
      grid-column: auto;
    }
  }

  @media (max-width: 420px) {
    .news-card__summary,
    .utility-card p,
    .info-card p {
      font-size: 0.95rem;
    }
  }
</style>
