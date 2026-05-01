# Frontpage Implementation Plan

## Goal

Prepare the public frontpage for the desired editorial layout while the final design and frontpage-specific Studio content model are still pending.

The current usable content types are:

- `article`
- `shortArticle`
- `page`

The first implementation should use those types where they fit naturally and use semantic placeholder markup for areas that need new editorial configuration later.

## Status Legend

- [ ] Not started
- [~] Partially implemented
- [x] Done
- [!] Blocked or needs decision

## Layout Areas

| Area | Visual scaffold | Studio model | SvelteKit implementation |
| --- | --- | --- | --- |
| Global header with menu, logo, category nav, and search | [x] | [ ] Navigation/settings document needed | [~] Static markup only |
| Top news area with one lead article and secondary stories | [x] | [~] Uses existing articles, no frontpage curation yet | [~] Latest articles are wired automatically |
| Mobile news layout with lead story and compact stacked stories | [x] | [~] Uses existing articles | [~] Responsive scaffold implemented |
| "Kort nyt" carousel/ticker band | [x] | [~] Uses existing shortArticle documents | [~] Static horizontal list with links to `/nyheder` feed anchors, no carousel controls yet |
| "Tip redaktionen" card | [x] | [ ] Needs editable frontpage card or site settings | [ ] Placeholder content only |
| Newsletter/Brevo signup card | [x] | [ ] Needs editable frontpage card or site settings | [ ] Placeholder link/content only |
| "Læs Mureren som PDF" band | [x] | [ ] Needs PDF/publication content type or settings field | [ ] Placeholder content only |
| Utility cards: membership, department finder, guides, agreement | [x] | [~] Can temporarily use pages, but needs curated frontpage cards | [~] Pulls available pages as temporary cards |
| FAQ band | [x] | [ ] Needs FAQ page/section decision | [ ] Placeholder content only |
| Footer | [x] | [ ] Needs site settings/navigation model | [~] Static markup only |

## Studio Work Still Missing

- [ ] Create a `siteSettings` or `frontpage` singleton for global header/footer content.
- [ ] Decide whether frontpage article placement should be automatic latest-content, manually curated, or a hybrid.
- [ ] Add editable frontpage sections for the tip card, newsletter card, PDF band, utility cards, and FAQ band.
- [ ] Add fields for external links such as Brevo, 3F membership, and department finder.
- [ ] Add optional relation fields for linking utility cards to `page` documents.
- [ ] Add a publication/PDF content model if "Læs Mureren som PDF" should point to current and archived PDFs.
- [ ] Add navigation/category configuration for top nav labels and destinations.

## SvelteKit Work Still Missing

- [x] Replace the simple frontpage article list with a responsive frontpage scaffold.
- [x] Fetch articles, short articles, and pages in a frontpage-specific query.
- [x] Render latest article content into the top news slots.
- [x] Render short articles into the "Kort nyt" band.
- [x] Link frontpage short articles to their matching item in the `/nyheder` feed.
- [~] Render pages as temporary utility-card content.
- [ ] Replace placeholder cards with data from the final Studio frontpage/settings model.
- [ ] Add real routes or external URLs for menu, search, newsletter, PDF, membership, department finder, FAQ, and utility cards.
- [ ] Implement search behavior when the search route exists.
- [ ] Add carousel controls only if the final design requires them.
- [ ] Review image sizes/crops once final art direction arrives.
- [ ] Add focused tests or smoke-test notes for frontpage rendering once the data model is settled.

## Design Notes

- The current styling is intentionally minimal and unopinionated.
- Markup uses semantic sections, articles, headings, links, and accessible labels.
- Classes are named for the eventual content areas rather than for temporary visual choices.
- The mobile layout follows the wireframe: single-column lead news, compact stacked story items, horizontal short-news band, two-column cards, and full-width feature bands.

## Open Questions

- Should editors manually choose the lead and secondary frontpage articles?
- Should "Kort nyt" be a true carousel, or is a horizontally scrollable list enough?
- Should the PDF area link to one current PDF, a latest issue document, or a PDF archive?
- Should utility cards be separate frontpage card objects, references to pages, or a mix of both?
- What should the search route and menu drawer contain?
- Should the footer be driven by the same settings document as header navigation?
