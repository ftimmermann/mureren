<script lang="ts">
  import {urlFor} from '$lib/sanity/image'

  const props = $props()
  const image = $derived((props as {value?: any}).value ?? props)
  const caption = $derived(image?.caption ?? '')
  const src = $derived(image?.asset ? urlFor(image).width(1200).url() : '')
</script>

{#if src}
  <figure class="body-image">
    <img src={src} alt={caption} loading="lazy" />
    {#if caption}
      <figcaption>{caption}</figcaption>
    {/if}
  </figure>
{/if}
