# Design Context

## Register
Product UI. Design serves fast admin workflows and content reliability.

## Admin UX Direction
Use native WordPress visual language. Improvements should appear as metaboxes, table columns, notices, filters and bulk actions. Avoid React admin replacements, heavy animation, decorative effects or custom admin chrome.

## Visual Vocabulary
- Status dots: green synced, yellow partial/outdated, red broken/incomplete.
- Compact progress bars for completion and SEO score.
- Plain WP buttons for quick actions.
- Warning lists with concise field names.

## Interaction Rules
- Show actionable missing fields, not generic errors.
- Keep validation readable in dense admin screens.
- Use lightweight JavaScript only for inline empty-field and invalid-JSON highlighting.
