# Project Info

This file is a quick map for future agents working on the Mureren / Landsklubben repo.

Start here when you need to find the right area of the app before making changes.

## High-Level Shape

- `sveltekit-app/` - public SvelteKit frontend.
- `studio/` - Sanity Studio for editorial content management.
- Sanity owns editorial content and configuration.
- SvelteKit owns public rendering and app behavior.
- PostgreSQL/Drizzle is used for interaction-heavy polling data.

## Core Instructions

- Read `AGENTS.md` first.
- Use `pnpm`, not npm, for project work.
- Respect existing worktree changes.
- Keep docs updated with feature changes.

Useful commands:

```sh
pnpm run dev
pnpm --filter sveltekit-app check
pnpm --filter studio build
```

## Frontend Areas

### Global Layout

Files:

- `sveltekit-app/src/routes/+layout.svelte`
- `sveltekit-app/src/routes/+layout.server.ts`

Current state:

- Header/footer are scaffolded toward the frontpage wireframe.
- Header navigation, menu, search, and footer are still static placeholders.
- Future work likely needs a Sanity settings/navigation singleton.

### Frontpage

Files:

- `sveltekit-app/src/routes/+page.server.ts`
- `sveltekit-app/src/routes/+page.svelte`
- `FRONTPAGE_IMPLEMENTATION_PLAN.md`

Current state:

- Visual scaffold is implemented.
- Top news uses latest `article` documents.
- Kort nyt band uses latest `shortArticle` documents.
- Utility cards temporarily use `page` documents where available.
- Several areas are placeholder-only until Studio models are decided.

### Article Pages

Files:

- `sveltekit-app/src/routes/post/[slug]/+page.server.ts`
- `sveltekit-app/src/routes/post/[slug]/+page.svelte`
- `studio/schemas/article.ts`

Current state:

- Articles have their own route under `/post/[slug]`.
- Article body supports Portable Text and poll references.

### Short Articles / Kort Nyt

Full notes:

- `docs/short-articles.md`

Files:

- `studio/schemas/shortArticle.ts`
- `sveltekit-app/src/routes/nyheder/+page.server.ts`
- `sveltekit-app/src/routes/nyheder/+page.svelte`

Current state:

- `shortArticle` powers Kort nyt.
- `/nyheder` renders short articles as a feed.
- Frontpage Kort nyt items link to `/nyheder#kort-nyt-[slug]` and scroll the feed item into view.
- No individual short article detail route exists yet.

### Static Pages

Files:

- `studio/schemas/page.ts`
- `sveltekit-app/src/lib/sanity/queries.ts`

Current state:

- `page` exists in Studio and query types.
- Dedicated public page routing may need review before relying on pages for final navigation.
- Frontpage currently uses pages as temporary utility-card content.

## Content Model Areas

### Shared Portable Text

File:

- `studio/schemas/blockContent.ts`

Current state:

- Supports normal text, h2, blockquote, bullet lists, strong/emphasis, links, images with captions, and `pollReference`.
- `pollReference` references a standalone `poll` document.

### Polling

Files:

- `POLLING_IMPLEMENTATION_PLAN.md`
- `studio/schemas/poll.ts`
- `sveltekit-app/src/components/PollBlock.svelte`
- `sveltekit-app/src/routes/api/polls/[pollId]/+server.ts`
- `sveltekit-app/src/routes/api/admin/polls/[pollId]/results/+server.ts`
- `sveltekit-app/src/routes/api/admin/polls/[pollId]/export.csv/+server.ts`
- `sveltekit-app/src/routes/api/admin/polls/[pollId]/close/+server.ts`
- `sveltekit-app/src/lib/server/polls/`
- `sveltekit-app/src/lib/server/db/`

Current state:

- Polling MVP is mostly implemented.
- Sanity owns poll configuration and placement.
- SvelteKit/Postgres owns votes, results, exports, duplicate prevention, and admin APIs.
- Studio reporting tool is the target admin experience.

## Documentation Map

- `README.md` - setup, development, environment, import, verification.
- `AGENTS.md` - project conventions and agent instructions.
- `POLLING_IMPLEMENTATION_PLAN.md` - polling feature plan and status.
- `FRONTPAGE_IMPLEMENTATION_PLAN.md` - frontpage scaffold and future implementation checklist.
- `docs/short-articles.md` - current shortArticle/Kort nyt implementation.

## Skill Guidance

Do not create a Codex skill for simple notes.

Good future skill candidates:

- Sanity schema and GROQ conventions once the content model stabilizes.
- Frontpage curation workflow after the client decides pinned/latest behavior.
- Polling/reporting workflow if future agents repeatedly extend polling.
- Deployment workflow for the Netcup/Easypanel setup.
