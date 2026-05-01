# Short Articles

## Purpose

`shortArticle` is the Sanity document type used for **Kort nyt** content.

Use it for short editorial updates that should appear in the Kort nyt feed and the frontpage Kort nyt band. It is currently closer to a feed item than a full standalone article page.

## Current Studio Model

Schema file:

- `studio/schemas/shortArticle.ts`

Fields:

- `title` - main title.
- `slug` - required slug generated from `title`.
- `excerpt` - short summary text.
- `mainImage` - optional image with hotspot support.
- `body` - shared `blockContent`.

Because `body` uses the shared `blockContent` schema, short articles can contain:

- portable text blocks
- images with captions
- `pollReference` blocks

The Studio desk structure lists this document type as **Kort nyt**.

## Current SvelteKit Query

Query file:

- `sveltekit-app/src/lib/sanity/queries.ts`

Main query:

```ts
export const shortArticlesQuery = groq`*[_type == "shortArticle"] | order(_createdAt desc){
  ...,
  ${bodyFields}
}`
```

The frontpage query also fetches the latest short articles:

```ts
"shortArticles": *[_type == "shortArticle"] | order(_createdAt desc)[0...8]{
  ...
}
```

## Current SvelteKit Usage

Routes:

- `sveltekit-app/src/routes/nyheder/+page.server.ts`
- `sveltekit-app/src/routes/nyheder/+page.svelte`
- `sveltekit-app/src/routes/+page.server.ts`
- `sveltekit-app/src/routes/+page.svelte`

`/nyheder` currently renders short articles as a full Kort nyt feed:

- main column with expanded short article content
- sticky side overview
- active item tracking based on scroll position
- body rendering through Portable Text
- support for images and poll references

The frontpage currently renders the latest short articles in the **Kort nyt** band.

Frontpage short article items link to the existing `/nyheder` feed with a hash target:

```txt
/nyheder#kort-nyt-[slug]
```

Each rendered short article on `/nyheder` gets a matching `id`, so clicking a frontpage Kort nyt item navigates to the feed and scrolls the item into view. This implements the current client wish without adding individual short article routes.

## Current Limitations

- There is no individual short article route yet, even though `slug` exists. Current expected behavior is to link into `/nyheder` by hash.
- Frontpage Kort nyt items are not manually curated in Studio.
- The frontpage Kort nyt band is a static responsive list/horizontal scroll area, not a full carousel.
- The `shortArticle` schema does not currently have category, tag, author, publication date, or manual ordering fields.
- The frontpage query fetches short articles without `bodyFields` because the frontpage band only needs summary-level data today.

## Likely Future Decisions

- Decide whether short articles ever need standalone URLs such as `/nyheder/[slug]`, or whether `/nyheder#kort-nyt-[slug]` should remain the canonical behavior.
- Decide whether the frontpage Kort nyt band should show latest items automatically, manually pinned items, or a hybrid.
- Decide whether `shortArticle` needs `publicationDate` separate from `_createdAt`.
- Decide whether short articles should support categories/tags or remain lightweight.
- Decide whether the Kort nyt band needs real carousel controls.

## Implementation Notes

- Keep `shortArticle` lightweight unless the client wants it to behave like a full article type.
- If adding a detail route, reuse the existing Portable Text rendering pattern from `/nyheder` and article pages.
- If adding frontpage curation later, prefer a frontpage/settings document that references short articles instead of adding frontpage-specific fields directly to `shortArticle`.
