# Polling Feature Implementation Plan

## Goal

Build a polling feature that works as a member engagement tool, not just a simple poll widget.

Editors should be able to configure approved poll features in Sanity and place polls anywhere in article, page, or short article body content. Votes, reporting, exports, and abuse prevention should live in the SvelteKit app database hosted alongside the app on the Netcup VPS.

Several customer-requested features are currently highlighted in yellow in the source brief. Treat those as unapproved optional features until the customer has accepted the price/scope. The implementation should leave room for them, but should not build hidden unpaid functionality.

Guiding principle:

- Build approved core behavior now.
- Add extension points where they are cheap and do not complicate the MVP.
- Do not implement, test, or hide full yellow-scope behavior unless it is approved.

Status legend:

- [ ] Not started
- [~] In progress / partially implemented
- [x] Done
- [!] Blocked or needs decision

## Architecture

Use Sanity for editorial configuration:

- Poll question, intro, and text options
- Approved poll type and voting rules
- Start and end dates
- Result visibility
- Communication fields such as "Hvad bruger vi svarene til?" and "Resultatet betyder, at vi..."
- Placement inside article/page/shortArticle body content
- Poll reporting/admin experience through a custom Studio tool

Use the SvelteKit app database for interaction data:

- Votes
- Result counts
- Export data
- Suspicious activity logs
- One-vote-per-user enforcement

Comments, segmentation, member-only access, visual option media, ranking, and article generation from results are optional add-ons unless approved.

Recommended database: PostgreSQL on the Netcup VPS.

Recommended app-side database layer: Drizzle ORM.

Target admin UX:

- Sanity Studio is the primary admin interface for creating, placing, reporting, exporting, and closing polls.
- SvelteKit owns the backend API and Postgres access for vote data.
- The existing SvelteKit `/admin/polls` pages are a dev/debug fallback and should not be polished as the final customer-facing admin experience.

## Approved Core vs Optional Add-Ons

### Approved Core Candidate

This is the recommended first implementation scope unless the customer approves more:

- Standalone Sanity `poll` document
- Inline `pollReference` placement in article/page/shortArticle body content
- Question/title/description
- Text-based answer options
- Single-choice voting
- Multiple-choice voting, if approved as part of the base quote
- Start and end date
- Result visibility
  - show immediately
  - show after close
  - hide externally
- Purpose text: "Hvad bruger vi svarene til?"
- Conclusion text: "Resultatet betyder, at vi..."
- Basic public poll UI
- App-owned vote storage
- Basic duplicate-vote prevention
- Basic poll reports in Sanity Studio
- CSV export, if approved as part of admin MVP

### Yellow / Optional Add-Ons

The following items are customer feature requests that should be priced and approved separately before implementation:

- Ranking/top-three poll type
- Open comment field after voting
- Targeting/segmentation fields such as member status, local department, trade group, union representative status, age group, or region
- Segmented admin reporting
- Generate/create a news article from poll results
- Members-only polls
- Image/icon/color-based answer options
- Thumbs up/down visual mode
- Choosing between images
- Animation, advanced charts, or realtime results
- CAPTCHA/challenge flow beyond basic rate limiting

Schema and database design may reserve obvious extension points for these, but the user-facing/admin-facing behavior should not be built until approved.

## Sanity Content Model

### New `poll` Document

Create a standalone Sanity document type for polls.

Core fields:

- `title`
- `question`
- `slug`
- `description`
- `type`
  - `singleChoice`
  - `multipleChoice` if approved for v1
- `options[]`
  - `label`
  - stable `_key` used by the app database
- `maxSelections` if multiple choice is approved
- `startsAt`
- `endsAt`
- `resultVisibility`
  - `immediate`
  - `afterClose`
  - `hidden`
- `status`
  - `draft`
  - `active`
  - `closed`
  - `archived`
- `purposeText`
  - Danish label: "Hvad bruger vi svarene til?"
- `conclusionText`
  - Danish label: "Resultatet betyder, at vi..."

Reserved future fields, only added when approved:

- `allowComment`
- `commentLabel`
- `followUpArticle`
- `requireMemberLogin`
- option `description`
- option `image`
- option `icon`
- option `color`
- ranking settings
- segmentation questions/config

The Sanity poll document should not store votes or result counts.

### Portable Text Placement

Add a reusable Portable Text object type:

```ts
{
  name: 'pollReference',
  title: 'Afstemning',
  type: 'object',
  fields: [
    {
      name: 'poll',
      title: 'Afstemning',
      type: 'reference',
      to: [{type: 'poll'}],
    },
  ],
}
```

Add `pollReference` to the shared block content schema used by:

- `article`
- `page`
- `shortArticle`

This lets editors insert a poll at any desired position in the body content:

```text
Paragraph
Image
Poll
Paragraph
Quote
Poll
```

The same poll can be reused across multiple placements, while all votes still count against the same Sanity poll `_id`.

## SvelteKit Frontend

### Rendering

Add a custom Portable Text renderer for `pollReference`.

Rendering flow:

1. Fetch article/page/shortArticle content from Sanity.
2. Include referenced poll documents in the GROQ query.
3. Render `<Poll poll={poll} />` inside the body.
4. The poll component loads vote state and results from SvelteKit endpoints.
5. The poll component submits votes to SvelteKit endpoints.

### Poll UI

The first poll component should support approved core behavior:

- Single choice
- Multiple choice, if approved for v1
- Mobile-first layout
- Clear closed/not-yet-open states
- Configurable result visibility

Result display should support:

- Hidden externally
- Shown immediately after voting
- Shown only after the poll closes

Do not implement ranking, comments, visual option media, animations, or realtime charts unless those add-ons are approved.

## Database Model

Initial PostgreSQL tables:

### `poll_votes`

Stores one row per selected option.

Suggested columns:

- `id`
- `poll_id`
- `option_key`
- `voter_hash`
- `created_at`

For single-choice polls, each voter should have one row.

For multiple-choice polls, each voter can have multiple rows for the same `poll_id`, but only one row per `option_key`.

Future optional columns:

- `member_id`
- `ranking_position`

### `poll_responses`

Stores one response session per voter/poll. In the core MVP this table can stay minimal.

Suggested columns:

- `id`
- `poll_id`
- `voter_hash`
- `created_at`

Future optional columns, only if approved:

- `member_id`
- `comment`
- `member_status`
- `local_department`
- `trade_group`
- `is_union_representative`
- `age_group`
- `region`

Keep segmentation fields intentionally limited and GDPR-conscious if that add-on is approved.

### `poll_activity_logs`

Stores suspicious or useful operational events.

Suggested columns:

- `id`
- `poll_id`
- `voter_hash`
- `event_type`
- `ip_hash`
- `user_agent_hash`
- `created_at`

## API Endpoints

Suggested SvelteKit endpoints:

- `GET /api/polls/[pollId]`
  - returns vote state and public result data
- `POST /api/polls/[pollId]`
  - validates and stores vote
- `GET /api/admin/polls/[pollId]/results`
  - admin-only result breakdown
- `GET /api/admin/polls/[pollId]/export.csv`
  - admin-only CSV export
- `POST /api/admin/polls/[pollId]/close`
  - admin-only close action

The SvelteKit API is the backend source for results/export/close actions. The primary admin UI should be a Sanity Studio custom tool.

## Admin Features

Sanity Studio should handle:

- Create/edit poll
- Configure dates, options, type, visibility, purpose, conclusion
- Place poll in body content
- View total vote count
- View results by option
- Export CSV/Excel-compatible data, if approved for the admin MVP
- Close poll early, if approved
- Archive of closed polls, if approved

SvelteKit should handle:

- Public poll rendering
- Vote submission
- Result APIs
- CSV export API
- Close-poll API
- Postgres access

SvelteKit admin pages should remain a dev/debug fallback.

Optional add-ons:

- View comments
- View segmented reporting
- Duplicate poll
- Suspicious activity overview

Segmented reporting should avoid showing groups with too few answers. For example, hide segment breakdowns with fewer than 5 responses.

## Abuse Prevention

Phase 1 protection:

- Cookie/localStorage vote marker
- `voter_hash` derived from a server-side salt plus request traits
- IP hash and user-agent hash for rate limiting/logging
- Unique constraints to reduce duplicate voting
- Basic rate limiting on vote endpoint

Phase 2 protection:

- Member login
- One vote per member via unique `poll_id + member_id`
- CAPTCHA or challenge only when suspicious activity is detected

Avoid requiring CAPTCHA for every vote unless abuse becomes a real problem, since it can reduce engagement.

## GDPR Notes

The feature may collect sensitive or semi-sensitive member information.

Before launch, decide:

- Which segmentation fields are necessary
- Whether fields are required or optional
- How long raw vote data is retained
- Whether member identity is stored
- Who can access admin reports
- Minimum segment size for reporting
- Text shown to users explaining why data is collected

Prefer aggregate reporting and avoid exposing identifiable individual responses unless there is a clear legal and organizational basis.

## Implementation Phases

### Phase 1: Foundation

- [x] Add Sanity `poll` schema
- [x] Add `pollReference` Portable Text object
- [x] Update article/page/shortArticle GROQ queries
- [x] Render poll references in SvelteKit body content
- [x] Add PostgreSQL and Drizzle setup
- [x] Add basic vote tables and migrations
- [x] Start local polling database from `pnpm run dev`
- [x] Keep yellow-scope fields out of the editor UI unless approved

### Phase 2: Voting MVP

- [x] Build poll component
- [x] Support single choice
- [x] Support multiple choice if approved for v1
- [x] Add vote endpoint
- [x] Add public result endpoint
- [x] Add basic duplicate-vote prevention
- [x] Add immediate/after-close/hidden result visibility

### Phase 3: Admin Reporting

- [x] Add app-side admin routes as dev/debug fallback
- [x] Show total votes and option breakdowns
- [x] Add CSV export if approved
- [x] Add Studio reporting tool as target admin experience
- [x] Add Studio CSV export action
- [ ] Add closed poll archive if approved
- [x] Add close-poll API action if approved
- [x] Add close-poll Studio action if approved

### Phase 4: Approved Yellow Add-Ons

Only start these when priced and approved:

- [ ] Add optional comment field
- [ ] Add targeting/segmentation questions
- [ ] Add segmented admin reporting
- [ ] Add ranking/top-three poll type
- [ ] Add image/icon/color option rendering
- [ ] Add advanced visual result charts
- [ ] Add realtime result updates

### Phase 5: Member and Security Enhancements

- [ ] Add members-only poll support if member login exists
- [ ] Enforce one vote per logged-in member
- [ ] Add suspicious activity reporting
- [ ] Add conditional CAPTCHA/challenge flow
- [ ] Add stronger audit logs

Only start this phase if members-only/security add-ons are approved.

### Phase 6: Communication Follow-Up

- [x] Add result summary/conclusion rendering
- [ ] Add follow-up article reference display
- [ ] Consider a helper workflow for creating a news article from poll results

The helper workflow for creating an article from poll results is a yellow-scope add-on.

### Studio Reporting Tool

- [x] Build a custom Sanity Studio tool for viewing poll reports inside Studio

This is now the target admin experience rather than a nice-to-have. Vote data should still live in the SvelteKit/Postgres backend, and the Studio tool should call the same admin/reporting API used by the app-side admin pages. The SvelteKit admin pages can remain as a fallback/debug tool.

## Open Questions

- Is there already a member login system, or should all v1 polls be public/anonymous?
- Which segmentation fields are truly needed for launch?
- Should polls be available on the homepage as a featured block, in addition to inline body placement?
- Should admins be managed in Sanity, the SvelteKit app, or through server-side credentials?
- What is the desired retention period for raw votes and comments?
- Should comments be moderated before admin/export visibility?
