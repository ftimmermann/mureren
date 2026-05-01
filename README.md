# Mureren / Landsklubben

SvelteKit frontend plus a local Sanity Studio for managing Landsklubben content.

## Project Structure

- `sveltekit-app/` - SvelteKit site that reads content from Sanity.
- `studio/` - Sanity Studio with schemas for pages, articles, short articles, authors, categories, and tags.
- `mureren_articles_with_images/` - source JSON used by the article import script.

## Requirements

- Node.js 20+
- pnpm
- A Sanity project with a dataset, plus API tokens for reading and importing content.

## Setup

Install dependencies from the repository root:

```sh
pnpm install
```

Create local environment files from the examples:

```sh
cp sveltekit-app/.env.example sveltekit-app/.env
cp studio/.env.example studio/.env
```

Fill in the Sanity values:

```sh
# sveltekit-app/.env
PUBLIC_SANITY_PROJECT_ID="<project-id>"
PUBLIC_SANITY_DATASET="production"
SANITY_API_READ_TOKEN="<read-token>"
DATABASE_URL="<postgres-connection-string>"
POLL_VOTER_SECRET="<long-random-secret>"
POLL_ADMIN_TOKEN="<long-random-admin-token>"
POLL_ADMIN_ALLOWED_ORIGINS="http://localhost:3333"
PUBLIC_SANITY_API_VERSION="2025-10-22"
PUBLIC_SANITY_STUDIO_URL="http://localhost:3333"

# studio/.env
SANITY_STUDIO_PROJECT_ID="<project-id>"
SANITY_STUDIO_DATASET="production"
SANITY_API_WRITE_TOKEN="<write-token>"
SANITY_STUDIO_PREVIEW_URL="http://localhost:5173"
SANITY_STUDIO_POLL_ADMIN_TOKEN="<same-value-as-POLL_ADMIN_TOKEN>"
SANITY_STUDIO_STUDIO_HOST=""
```

The `.env` files are ignored by git.

For local polling development, use this local URL in `sveltekit-app/.env`:

```sh
DATABASE_URL="postgres://mureren:polls@localhost:5433/mureren"
```

For Easypanel, create a PostgreSQL database beside the SvelteKit app and replace `DATABASE_URL` with the Easypanel connection string in the SvelteKit app environment.

## Development

Start the local polling database, SvelteKit app, and Sanity Studio from the repository root:

```sh
pnpm run dev
```

Local URLs:

- SvelteKit app: http://localhost:5173/
- Sanity Studio: http://localhost:3333/
- Local Postgres: `postgres://mureren:polls@localhost:5433/mureren`

Poll reporting is available in Sanity Studio under `Afstemningsrapporter`. The Studio tool reads vote data from the SvelteKit admin API, so `SANITY_STUDIO_POLL_ADMIN_TOKEN` in `studio/.env` must match `POLL_ADMIN_TOKEN` in `sveltekit-app/.env`.

The first time you use the local polling database, run migrations after the database is up:

```sh
pnpm --filter sveltekit-app db:migrate
```

You can also run each workspace separately:

```sh
pnpm --filter sveltekit-app dev
pnpm --filter studio dev
```

## Useful Commands

```sh
pnpm --filter sveltekit-app check
pnpm --filter sveltekit-app build
pnpm --filter sveltekit-app db:generate
pnpm --filter sveltekit-app db:migrate
pnpm run db:up
pnpm run db:down
pnpm --filter studio build
pnpm format
```

## Import Articles

The Studio package includes an importer for `mureren_articles_with_images/mureren_articles.json`.

Preview the import without writing to Sanity:

```sh
pnpm --filter studio import:articles -- --dry-run
```

Import into the dataset configured in `studio/.env`:

```sh
pnpm --filter studio import:articles
```

Import into a specific dataset:

```sh
pnpm --filter studio import:articles -- --dataset development
```

The import script requires `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and `SANITY_API_WRITE_TOKEN`.

## Verification

Current local verification:

- `pnpm --filter sveltekit-app check`
- `pnpm --filter studio build`

Both commands should pass before deploying or handing content work to editors.

## Feature Plans

- [Polling feature](./POLLING_IMPLEMENTATION_PLAN.md)
- [Frontpage implementation](./FRONTPAGE_IMPLEMENTATION_PLAN.md)

## Agent Knowledge Base

- [Project info map](./project-info.md)
- [Short articles / Kort nyt](./docs/short-articles.md)
