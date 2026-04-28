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
            <a class="site-title" href="/">Landsklubben</a>
            <nav class="nav" aria-label="Main navigation">
              <a href="/">Forside</a>
              <a href="/">Artikler</a>
              <a href="/">Om os</a>
            </nav>
          </div>
        </header>
        <main class="main">
          {@render children()}
        </main>
        <footer class="footer">
          <div class="footer__inner">Footer placeholder</div>
        </footer>
      </div>
    </QueryLoader>
  </VisualEditing>
</PreviewMode>

<style>
  .shell {
    margin: 0 auto;
    width: min(930px, calc(100% - 2rem));
  }

  .header,
  .footer {
    padding: 1.5rem 0;
    border-bottom: 1px solid #ddd;
  }

  .footer {
    border-top: 1px solid #ddd;
    border-bottom: 0;
    color: #666;
  }

  .header__inner,
  .footer__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .site-title {
    color: inherit;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .nav {
    display: flex;
    gap: 1rem;
  }

  .nav a {
    color: inherit;
    text-decoration: none;
  }

  .main {
    padding: 2rem 0 3rem;
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
    .header__inner,
    .footer__inner {
      flex-direction: column;
      align-items: flex-start;
    }

    .nav {
      flex-wrap: wrap;
    }
  }
</style>
