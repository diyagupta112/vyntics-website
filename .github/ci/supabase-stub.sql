-- CI only. Plain Postgres has no Supabase storage schema, and one migration inserts into storage.buckets.
create schema if not exists storage;
create table if not exists storage.buckets (
    id text primary key,
    name text not null,
    public boolean not null default false,
    file_size_limit bigint,
    allowed_mime_types text[]
);
