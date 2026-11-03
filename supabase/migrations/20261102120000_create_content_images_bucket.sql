-- Inline body images for Blogs and Case Studies. A bucket of their own, never the cover buckets.
-- Public like the other image buckets; the limits mirror the API's validation (JPEG, PNG, WebP, 10 MiB).
-- Objects are stored as <resource uuid>/<sha256>.<ext>; resource UUIDs are unique across Blogs
-- and Case Studies, so one bucket serves both.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content-images', 'content-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
