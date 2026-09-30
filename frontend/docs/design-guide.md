# Careers Page Design Guide

Status: implementation specification  
Scope: public website Careers experience only  
Routes: `/careers` and `/careers/[slug]`

## Purpose and constraints

The Careers experience should help a visitor understand what working at Vyntics could feel like, review live openings, inspect a role in detail, and submit an application. It should feel confident, clear, and human while staying within the public website design system.

This guide does not approve final marketing claims or testimonial content. Copy below is directional unless it comes directly from an API field. The implementation must not add claims about clients, growth, culture, benefits, employee experience, or hiring outcomes without approved content.

The existing backend in `apps/api` is the source of truth for routes and data behavior. The public frontend must not create a second application endpoint or submit internal job identifiers.

## Existing frontend conventions

The public site uses Next.js App Router with public pages inside `src/app/(marketing)`. The route group supplies the shared `SiteHeader`, `<main>`, and `SiteFooter`; it does not appear in the URL. Page metadata is declared with Next.js metadata exports. Reusable page sections live in `src/components/sections`, small primitives live in `src/components/ui`, and page-specific components should remain close to their route until reuse is established.

Use the existing `Container` primitive and the global tokens from `globals.css`:

- DM Sans throughout.
- `--color-ink` / `--color-foreground` for primary text.
- `--color-background` and `--color-surface` for page and card surfaces.
- `--color-primary` for primary actions and key brand emphasis.
- `--color-lavender` and `--color-accent` for restrained supporting emphasis.
- `--color-muted` and `--color-border` for secondary text and boundaries.
- `--content-width` for the page grid.

The experience must support the existing light and dark themes. Use fluid type and spacing with `clamp()`, one-pixel tokenized borders, restrained shadows, rounded cards, and short transitions consistent with the current site. Every hover treatment must have an equivalent keyboard focus treatment. Use semantic headings, labelled sections, visible focus states, sufficient contrast, and live regions for asynchronous feedback.

Data fetching should follow the established environment convention: server-rendered reads may use `API_BASE_URL`, then `NEXT_PUBLIC_API_BASE_URL`, with the local API fallback used by the existing server component; browser submissions use `NEXT_PUBLIC_API_BASE_URL`. Strip a trailing slash before appending an endpoint. Do not expose private server environment values to client components.

## Page and interaction flow

```text
/careers
  Hero
    ↓ View Current Openings
  Why Join Us
    ↓
  What Our Team Says
    ↓
  Current Openings ── select a role ──→ /careers/[slug]
    ↓                                      ↓
  No Matching Role                    Apply on the same role URL
                                           ↓
                                      Submit application
                                           ↓
                                      Success or retryable error
```

The primary Careers page order is fixed: Hero, Why Join Us, What Our Team Says, Current Openings, then No Matching Role / contact CTA.

## Careers landing page: `/careers`

### Hero / entrance

Purpose: establish the page as a recruiting experience and lead directly to available roles.

Use a large, approved stock photograph as the dominant visual or background. Favor a candid, professional team or work setting that can crop well at wide and narrow aspect ratios. Avoid imagery that implies a specific Vyntics office, employee, client, or workplace benefit unless it is verified. The image source, usage rights, final crop, and alt-text decision are content requirements before implementation.

On desktop, use a full-width hero with the text held within the standard container and constrained to a readable measure. The image may fill the hero or occupy a strong adjacent plane. Apply a dark or brand-tinted overlay, gradient, and/or reduced image opacity so text meets contrast requirements over every crop. The content hierarchy is:

1. Small eyebrow identifying the Careers page.
2. One concise `<h1>` about joining Vyntics, doing meaningful work, growing, and contributing.
3. One short supporting paragraph.
4. Primary `View Current Openings` CTA.

The wording must remain general until approved; it should express an invitation and aspiration without promising a particular culture, career trajectory, project type, or impact. The CTA is a real anchor link to `#current-openings`. Use smooth scrolling only when motion is allowed, account for the sticky header with `scroll-margin-top`, and move focus to or announce the destination when needed for keyboard and assistive-technology clarity.

Use generous vertical space, approximately the visual weight of the existing large page heroes, with the heading as the clear focal point. On small screens, stack all content, keep the CTA comfortably tappable, choose a deliberate mobile crop, and avoid placing text over a visually busy part of the image. Do not rely on the image to communicate essential meaning.

### Why Join Us

Purpose: give candidates a concise overview of the working themes Vyntics wants to communicate.

Introduce the section with an eyebrow, a short heading, and optional one-sentence context. Follow with three or four equal-priority items covering these themes:

- meaningful work and contribution;
- learning and professional growth;
- team and culture;
- opportunities to take part and contribute ideas.

Treat these as content themes, not verified company claims. Final headings and descriptions require stakeholder approval. Avoid metrics, guarantees, superlatives, named benefits, and statements about actual employee experience unless supplied and approved.

Use a two-column card or editorial grid at desktop sizes, with restrained brand accents and enough whitespace for quick scanning. Each item needs a short heading and one concise paragraph; icons are optional and must not become decorative clutter. Collapse to one column on narrow screens. Preserve logical DOM order so the reading order remains correct without the desktop layout.

### What Our Team Says

Purpose: add a human perspective through approved first-party employee testimony.

At wide breakpoints, use a two-column composition. The left column contains the eyebrow, `What our current team says` heading, and brief supporting copy; it may be sticky within the height of this section, offset below the site header. The right column contains one prominent testimonial at a time. Disable the sticky treatment when the viewport is too short or the layout collapses.

Each testimonial may display an employee image, quotation, name, and role only when those assets and permissions are supplied. There is currently no testimonial API or approved testimonial dataset in the inspected frontend or backend. All testimonial copy, names, roles, portraits, image rights, and publication consent are therefore **TBD content requirements**. Do not reuse the client testimonials currently present on the home page, invent placeholders that look real, or derive employee testimony from the Our Team API.

When content exists, the carousel should:

- rotate automatically at a calm interval, with enough time to read the longest item;
- provide labelled previous and next controls plus a visible position indicator;
- pause while hovered, keyboard-focused, or being interacted with;
- preserve a stable section height to prevent layout shift;
- announce manually selected slides politely, but avoid announcing every automatic change;
- stop automatic rotation when `prefers-reduced-motion: reduce` is active and remove nonessential slide transitions;
- support swipe only as an enhancement, never as the only navigation method.

Use restrained opacity/translate transitions rather than dramatic 3D movement. On mobile, place the heading above a single full-width testimonial card, keep controls below it, and allow the card height to grow with its content. If no approved testimonials are ready at implementation time, omit the section rather than publish fabricated content; retain its place in the intended flow for later activation.

### Current Openings

Purpose: show the roles returned by the backend and provide a clear path to each detail page.

Give the section `id="current-openings"` and an appropriate sticky-header scroll offset. Fetch `GET /careers` on the server where practical. The endpoint returns a `CareerListResponse` object with a `data` array, ordered by `published_at` descending by the repository.

Each list item has exactly these public fields:

| Field | Type | Frontend presentation |
| --- | --- | --- |
| `id` | UUID string | Stable render key only; do not expose as navigation state. |
| `slug` | string | Build the route `/careers/{slug}`. Preserve it exactly and URL-encode the path segment. |
| `title` | string | Card heading and primary link label. |
| `location` | string | Compact role metadata. |
| `employment_type` | string | Compact role metadata. |
| `department` | string | Eyebrow, label, or metadata. |
| `experience` | string | Compact role metadata. |
| `short_description` | string | Brief card summary. |
| `published_at` | ISO 8601 datetime | Available for ordering or a publication label if product/content approves showing it. |

Use a clean vertical list or a maximum two-column card grid. The title and short description carry the strongest hierarchy; department, location, employment type, and experience form a compact metadata group. Provide one unambiguous `View role` action and make the title link to the same destination. Do not place an application form on a listing card.

The section states are:

- **Loading:** for streaming/client transitions, use a small skeleton that matches the final card geometry and has an accessible loading label. Prefer server rendering so the initial page does not depend on a client-side spinner.
- **Loaded:** render every valid item returned in `data` without fabricating fallback openings.
- **Empty:** show a calm `No current openings` message and lead naturally into the email contact block below.
- **Error:** explain that openings could not be loaded, offer a retry where the chosen rendering architecture supports it, and keep the contact option available. Do not present an API failure as an empty list.

Current backend caveat: the implemented repository returns **every stored career** and has no open/published status field or filter. This differs from the statement in `api-contracts.md` that the endpoint returns currently published/open roles. Before implementation is considered production-ready, backend/product owners must either confirm that every stored career is public and open or add the required lifecycle rule to the backend. The frontend must not invent an `open` field or infer availability from `published_at`.

### No Matching Role

Place a distinct, compact contact block directly after Current Openings. It should say, in approved wording, that people may introduce themselves when no listed role matches. Make `contact@vyntics.com` a visible `mailto:contact@vyntics.com` link. A prefilled subject may be added if content approves it. This path does not submit to an API and should remain useful when the opening list is empty or unavailable.

## Career detail: `/careers/[slug]`

Selecting a listing item opens a canonical detail route under the existing marketing route group. Fetch `GET /careers/{slug}` using the exact, URL-encoded slug from route params. Do not find the role by UUID or rely on the listing response as the detail source.

The detail response contains:

| Field | Type | Frontend presentation |
| --- | --- | --- |
| `id` | UUID string | Internal render identity only. |
| `slug` | string | Canonical route and application endpoint. |
| `title` | string | Page `<h1>` and role identity in the form. |
| `location` | string | Hero metadata. |
| `employment_type` | string | Hero metadata. |
| `department` | string | Eyebrow or hero metadata. |
| `experience` | string | Hero metadata. |
| `short_description` | string | Introductory summary. |
| `description` | JSON object | Structured main role content. |
| `responsibilities` | JSON object | Structured Responsibilities section. |
| `requirements` | JSON object | Structured Requirements section. |
| `nice_to_have` | JSON object | Optional-content section; omit when the object has no renderable content. |
| `benefits` | JSON object | Optional-content section; omit when the object has no renderable content. |
| `published_at` | ISO 8601 datetime | Metadata only unless showing the date is approved. |

The page begins with department, title, short description, role metadata, and a prominent `Apply` CTA. Follow with the structured detail sections in this order: description, responsibilities, requirements, nice to have, benefits. Use a readable single content column with an optional desktop side rail for role metadata and a repeated Apply CTA. The mobile layout remains a single column; a sticky mobile CTA is optional only if it does not obscure content or form feedback.

The backend types these five long-form fields as arbitrary JSON objects and does not currently define their node schema. A safe shared structured-content renderer and an approved node contract are prerequisites for implementation. It must ignore unsupported nodes safely, sanitize any generated HTML/URLs, preserve heading order, and avoid rendering empty objects as blank sections. Do not stringify raw JSON into the page.

Detail states:

- **Loading:** reserve the hero and content proportions with accessible skeletons during navigation.
- **404:** `GET /careers/{slug}` returns `404 {"detail":"Career not found."}`; use the site not-found experience and provide a route back to `/careers#current-openings`.
- **Other error:** show a clear retrieval error with retry/back navigation. Do not expose exception text.
- **Incomplete optional content:** omit empty `nice_to_have` or `benefits` sections. Required response-shape failures should enter the error state rather than rendering misleading partial data.

Use the title and short description for page metadata unless a separate, approved SEO contract is introduced; the Careers detail API does not provide `seo_title` or `meta_description`.

## Application experience

Clicking `Apply` should reveal or focus a dedicated application panel/section on the same `/careers/{slug}` URL, consistent with the backend contract documentation. An in-page section addressed by `#apply` is preferred because it preserves context, supports deep linking, and avoids modal focus/scroll complexity. If a dialog is selected during implementation, it must trap focus, close on Escape, restore focus to the triggering CTA, and remain usable with long content on small screens.

The form heading must identify the selected `title`. The URL `slug` determines the POST endpoint; never ask the user to choose or submit a `career_id`.

### Exact submission contract

Submit `multipart/form-data` to `POST /careers/{slug}/apply`. Build a `FormData` object and allow the browser to set the multipart boundary; do not manually set the `Content-Type` header.

| Form field | Implemented API type and status | Presentation and client validation |
| --- | --- | --- |
| `name` | string, required multipart field | Label `Full name`; text input with `autocomplete="name"`. The backend currently applies no length or non-blank constraint. |
| `email` | valid email, required multipart field | Label `Email`; `type="email"`, `autocomplete="email"`, trim surrounding UI input before append. |
| `phone` | string, required multipart field | Label `Phone`; `type="tel"`, `autocomplete="tel"`. Do not enforce a country-specific format because the backend defines none. |
| `resume` | file, currently optional in implementation | Label `Resume`; file input accepting `.pdf,.doc,.docx` and the corresponding MIME types. See the contract discrepancy below. |
| `cover_letter` | string or null, optional | Label `Cover letter` with an explicit `Optional` marker; multiline input. The backend defines no length limit. Omit the field when empty. |

Do not send any other field. The parser explicitly rejects unexpected multipart keys with HTTP 422, including internal values such as `id`, `career_id`, `status`, `submitted_at`, `resume_url`, or `notes`.

When a resume is provided, the backend validates all of the following:

- extension is `.pdf`, `.doc`, or `.docx` (case-insensitive);
- MIME type matches the extension;
- file signature/content matches the declared type;
- file is non-empty;
- file size does not exceed the configured `STORAGE_RESUME_MAX_BYTES`, currently defaulting to 10 MiB.

Show the accepted formats and 10 MiB current limit next to the file control, display the selected filename, and make replacement/removal clear. Client validation improves feedback but never replaces backend validation.

Contract discrepancy: `api-contracts.md` says `resume` is required, but the implemented route, schema, database migration, service, and API test explicitly allow it to be omitted temporarily. The frontend specification follows the current executable implementation and presents Resume as optional until this is reconciled. Product/backend owners should decide whether to make it required before implementation; once decided, the UI required state and backend must change together.

### Validation and submission states

Keep labels visible above controls and associate each error with its field. On submit, validate presence of `name`, `email`, and `phone`, browser-valid email syntax, and any selected resume’s extension and size. Since the backend accepts blank strings for `name` and `phone`, the UI should prevent whitespace-only values for usability while treating this as client-side presentation validation, not an API guarantee.

During submission, disable duplicate submits, keep the entered values visible, change the button label to `Submitting…`, and expose the state through an accessible status region. Do not clear the form until a 201 response is received. Preserve text fields and the selected file where the browser permits after recoverable failures.

The success response is HTTP 201 with exactly:

```json
{
  "id": "uuid",
  "status": "new",
  "submitted_at": "ISO-8601 datetime"
}
```

On success, replace the form body or move focus to a clearly titled confirmation state. Directional copy: `Thank you for applying. Our team will reach out to you soon if your profile meets our requirements.` The application ID and backend status do not need to be displayed. Provide a clear route back to the role or Current Openings.

On failure, keep the form and show a concise summary near the submit control: `The application was not submitted. Please try again.` Use specific, friendly field/file guidance for safe validation errors, while avoiding raw backend or storage details. Keep a Retry action by leaving the submit control available after the request settles.

Map response behavior as follows:

| Response | Backend behavior | Frontend behavior |
| --- | --- | --- |
| `201` | Application accepted; returns receipt. | Show the success state and clear sensitive form state. |
| `404` | Career slug does not exist: `Career not found.` | Explain that the role is no longer available and link to Current Openings; do not retry the same submission automatically. |
| `422` | Missing/invalid form field, unexpected key, or invalid resume. | Show the general failure message plus a safe field/file-specific message when the response can be mapped reliably. |
| `500` | Persistence failure: `Unable to process Job Application.` | Preserve input and offer retry with generic wording. |
| `503` | Resume storage unavailable: `Resume storage is temporarily unavailable.` | Preserve input and offer retry later; do not expose infrastructure details. |
| Network/timeout | No usable API response. | Preserve input, show the generic failure message, and allow retry. |

Automatic retries must not be used for POST because they can create a duplicate application if the response is lost after the server commits. A user-triggered retry is acceptable.

## Responsive and accessibility requirements

- Use the site’s content width and fluid spacing; collapse multi-column sections at the breakpoints that keep content readable rather than forcing dense cards.
- Maintain at least 44-by-44-pixel pointer targets for primary actions and carousel controls.
- Keep DOM and tab order aligned with visual reading order.
- Ensure hero overlays, muted text, controls, validation messages, and disabled states meet contrast requirements in both themes.
- Give the hero image useful alt text only when it conveys information; use empty alt text when it is purely atmospheric.
- Use one page `<h1>`, sequential headings, semantic lists for metadata where appropriate, and a `<blockquote>` for testimonial text.
- Do not use color alone for required state, errors, selection, or carousel position.
- Honor `prefers-reduced-motion`; disable autoplay and smooth/animated movement that is not essential.
- Keep form success and error feedback in an `aria-live="polite"` status region, and move focus to the success heading or error summary after submission.

## Content and implementation prerequisites

Before the page can be completed, obtain or decide:

1. Approved hero copy and a licensed hero image with desktop/mobile crops.
2. Approved Why Join Us headings and descriptions, verified as accurate.
3. Approved testimonials, names, roles, portraits, image rights, and consent; otherwise omit that section at launch.
4. A defined structured-content node schema shared by the Admin/API and frontend renderer.
5. Whether all stored careers are public/open, or a backend lifecycle/filtering change.
6. Whether Resume is optional or required, reconciled between implementation and `api-contracts.md`.

These are content or backend-contract dependencies. They must not be filled with invented data in the frontend.
