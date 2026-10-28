-- Optional sub-page targeting for FAQs. Open-ended key, never an enum or foreign key,
-- so new sub-pages need no migration. Existing rows keep sub_page = null (main page).
alter table public.faqs
    add column sub_page text;

alter table public.faqs
    add constraint ck_faqs_sub_page_key check (
        sub_page is null or (
            char_length(sub_page) between 1 and 255
            and sub_page ~ '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$'
        )
    );
