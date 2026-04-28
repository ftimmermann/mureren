<script lang="ts">
  import type {Article} from '$lib/sanity/queries'
  import Card from '../components/Card.svelte'
  import type {PageProps} from './$types'

  const {data}: PageProps = $props()
  const articles = $derived((data.options.initial.data ?? []) as Article[])
</script>

<section class="page">
  {#if articles?.length}
    {#each articles as article}
      <Card {article} />
    {/each}
  {:else}
    <p class="empty">Ingen artikler endnu.</p>
  {/if}
</section>

<style>
  .page {
    display: grid;
    gap: 1.5rem;
  }

  .empty {
    margin: 0;
    color: #666;
  }
</style>
