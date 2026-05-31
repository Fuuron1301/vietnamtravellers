# Tour Full Editor Spec

Goal: làm `Tour Full Editor` trong admin để sửa đầy đủ field tour đang render ngoài website, gồm overview, detail cards, itinerary, pricing, FAQ, Google Maps, gallery, SEO, revisions, autosave, và public URL preview.

Scope:
- Chỉ tour editor trước.
- Dùng DB-backed admin API.
- Giữ `_mirror_raw` làm fallback, không xóa data thật.
- Public runtime đọc field edit mới trước, fallback sau.

Editable groups:
- Overview: intro, concierge note, signature moments, route, theme, suitable, type, departure.
- Media/Map: featured image, gallery, Google Maps embed.
- Structured data: itinerary, pricing, FAQ, includes/excludes, meals, transport, accommodation, review quote/rating.
- Publish/SEO: title, slug, excerpt, content, canonical, meta description, status, schedule.

Acceptance:
- Admin detail page shows labels that match public section names.
- Saving updates DB and public route.
- No smoke/fake rows used.
- Typecheck/lint/smoke pass.
