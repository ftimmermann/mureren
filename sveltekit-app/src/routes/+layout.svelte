<script lang="ts">
  import {PreviewMode, QueryLoader, VisualEditing} from '@sanity/sveltekit'
  import type {LayoutProps} from './$types'
  import {page} from '$app/state'
  import {resolve} from '$app/paths'
  import {client} from '$lib/sanity/client'
  const {children, data}: LayoutProps = $props()
  // svelte-ignore state_referenced_locally -- previewEnabled only changes on full page reload
  const {previewEnabled} = data
</script>

<PreviewMode enabled={previewEnabled}>
  <VisualEditing enabled={previewEnabled}>
    <QueryLoader enabled={previewEnabled} {client}>
      {#if previewEnabled}
        <a
          href={resolve('/preview/disable', {
            redirect: page.url.pathname,
          })}
          class="preview-toggle"
        >
          <span>Preview Enabled</span>
          <span>Disable Preview</span>
        </a>
      {/if}

      <div class="shell">
        <header class="header">
          <div class="header__inner">
            <button class="menu-button" type="button" aria-label="Åbn menu">☰</button>
            <a class="site-title" href="/">Mureren</a>
            <a class="search-link" href="/" aria-label="Søg">⌕</a>
          </div>
          <nav class="nav" aria-label="Hovednavigation">
            <a href="/">Debat</a>
            <a href="/">Arbejdsmiljø</a>
            <a href="/">OK26</a>
            <a href="/">Lønforhandling</a>
          </nav>
        </header>
        <main class="main">
          {@render children()}
        </main>
        <footer class="footer">
          <div class="footer__inner">
            <a class="footer__title" href="/">Mureren</a>
            <p>Landsklubben for murere</p>
            <p>Footerindhold afventer endelig informationsarkitektur.</p>
          </div>
        </footer>
      </div>
    </QueryLoader>
  </VisualEditing>
</PreviewMode>

<style>
  .shell {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  .header {
    border-bottom: 1px solid #ddd;
  }

  .footer {
    margin-top: 3rem;
    padding: 3rem 1rem;
    background: #ddd;
    text-align: center;
  }

  .header__inner {
    width: min(68rem, calc(100% - 2rem));
    margin-inline: auto;
    min-height: 4.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .footer__inner {
    width: min(38rem, 100%);
    margin-inline: auto;
    display: grid;
    gap: 0.75rem;
    color: #555;
  }

  .site-title {
    min-width: 12rem;
    padding: 0.75rem 2rem;
    background: #ddd;
    color: inherit;
    text-decoration: none;
    text-align: center;
    font-size: 1rem;
    font-weight: 700;
  }

  .menu-button,
  .search-link {
    width: 2.5rem;
    height: 2.5rem;
    display: inline-grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: inherit;
    text-decoration: none;
    font: inherit;
    cursor: pointer;
  }

  .nav {
    width: min(68rem, 100%);
    margin-inline: auto;
    display: flex;
    justify-content: center;
    gap: clamp(1.5rem, 5vw, 3rem);
    overflow-x: auto;
    padding: 0.75rem 1rem;
    white-space: nowrap;
  }

  .nav a {
    color: inherit;
    text-decoration: none;
    text-transform: uppercase;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .main {
    padding: 2rem 0 0;
  }

  .footer__title {
    width: min(26rem, 100%);
    margin-inline: auto;
    padding: 0.75rem 2rem;
    background: #bbb;
    color: inherit;
    text-decoration: none;
    font-weight: 700;
  }

  .footer p {
    margin: 0;
  }

  .preview-toggle {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    padding: 0.5rem 0.75rem;
    background: #fff;
    border: 1px solid #ddd;
    text-decoration: none;
    color: inherit;
    font-size: 0.75rem;
  }

  .preview-toggle span:first-child {
    display: block;
  }

  .preview-toggle:hover span:first-child {
    display: none;
  }

  .preview-toggle span:last-child {
    display: none;
  }

  .preview-toggle:hover span:last-child {
    display: block;
  }

  @media (max-width: 640px) {
    .header__inner {
      min-height: 5.25rem;
    }

    .site-title {
      min-width: 8.5rem;
      padding-inline: 1rem;
    }
  }
</style>
