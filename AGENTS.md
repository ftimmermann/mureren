# AGENTS.md

## Project Overview

This repository contains the Mureren / Landsklubben site.

It is a pnpm workspace with two main apps:

- `sveltekit-app/` - the public SvelteKit frontend.
- `studio/` - the Sanity Studio used for editorial content management.

Sanity is the source of truth for editorial configuration and content. The SvelteKit app is responsible for rendering the public site and, when needed, owning application behavior that does not belong in Sanity.

For interaction-heavy features such as polling, voting, reporting, exports, abuse prevention, member-specific state, or high-frequency writes, prefer an app-owned database beside the SvelteKit app rather than writing operational data into Sanity.

## Package Manager

Use `pnpm` for this project.

Preferred commands:

```sh
pnpm install
pnpm run dev
pnpm --filter sveltekit-app check
pnpm --filter studio build
```

Avoid using `npm install` unless there is an explicit reason to maintain npm metadata. This workspace is configured around pnpm.

## Documentation

Any new feature should be documented.

Documentation can live in:

- `README.md` for setup, day-to-day development, and project-wide instructions.
- `project-info.md` as the quick map for future agents looking for specific app areas.
- `docs/` for focused implementation notes about existing content types or subsystems.
- A dedicated feature plan such as `POLLING_IMPLEMENTATION_PLAN.md` for larger features.
- Inline code comments only where the code is not self-explanatory.

When adding or changing a feature, update the relevant docs in the same change whenever possible.

For large features, document:

- Goal and non-goals
- Content model changes
- App/database changes
- User/admin flows
- Environment variables
- Verification steps
- Open questions or rollout phases

## User Shorthand

When the user asks `LMH?`, interpret it as:

> Is this a light, medium, or heavy task in terms of Codex subscription usage?

Answer briefly with one of:

- light
- light-medium
- medium
- medium-heavy
- heavy

Optionally add one short reason.

## Skills

Create or update Codex skills when a workflow becomes repeatable, specialized, or easy to get wrong.

Good candidates for skills:

- Sanity schema and GROQ conventions for this project
- Deployment workflow for the Netcup VPS
- Polling/reporting implementation workflow
- Content import/migration workflow
- Design-system/component conventions

Do not create a skill for one-off notes. Prefer a skill when it would help future agents consistently perform a recurring task.

## UI and Component Conventions

Create semantic components first.

Prefer meaningful components and class names over inline styling decisions in markup.

For JSX/TSX code, prefer:

```tsx
<article className={styles.card}>
```

over:

```tsx
<article className="rounded-xl border bg-white p-6 shadow-sm">
```

For Svelte code, prefer:

```svelte
<article class="poll-card">
```

with styles defined in the component `<style>` block or an appropriate shared stylesheet.

Avoid packing design decisions directly into markup as long utility-class strings. Markup should describe structure and behavior; CSS should carry presentation decisions.

Use semantic HTML:

- `article` for articles/cards that represent standalone content
- `section` for grouped page regions
- `nav` for navigation
- `form`, `fieldset`, `legend`, `label`, and `button` for interactive forms
- proper heading order

Components should be accessible by default:

- Buttons for actions, links for navigation
- Labels for inputs
- Keyboard-friendly controls
- Useful focus states
- ARIA only when native HTML is not enough

## Sanity Conventions

Use Sanity for editorial data:

- Articles
- Pages
- Short articles
- Authors, categories, tags
- Editorial configuration for features

Prefer reusable schema objects when the same content pattern appears in multiple document types.

For body content, prefer Portable Text objects for embeddable editorial blocks. For example, a poll should be its own `poll` document and be inserted into body content through a `pollReference` object.

Do not store high-frequency interaction data in Sanity.

## SvelteKit Conventions

Keep route load functions focused on fetching data and shaping page props.

Keep reusable UI in `sveltekit-app/src/components` or a clearly named feature folder if the feature grows.

For server-only code, use server-only modules and endpoints. Do not expose private tokens or database credentials to client code.

When adding environment variables:

- Add them to the relevant `.env.example`
- Document them in `README.md` or the feature plan
- Keep real `.env` values out of git

## Data and Privacy

Treat member-related data as sensitive.

For features that collect member input, document:

- What is collected
- Why it is collected
- How long it is retained
- Who can access it
- Whether exports contain personal or segment-level data

Prefer aggregate reporting. Avoid exposing small segment groups that could identify individuals.

## Verification

Run the narrowest useful verification for the change.

Common checks:

```sh
pnpm --filter sveltekit-app check
pnpm --filter studio build
```

If a feature adds database migrations, API endpoints, or admin flows, add appropriate verification notes to the feature documentation.

When finishing work, report which checks were run and whether anything could not be verified.

## Git Hygiene

Respect existing worktree changes. Do not revert unrelated changes.

Keep edits scoped to the requested feature or fix.

Do not commit secrets, generated local env files, or local machine artifacts.
