# Vyntics Admin Panel — Style Guide

**Status:** Visual/design source of truth  
**Application:** `apps/admin`

---

# 1. Design direction

The Vyntics Admin Panel should feel like a **clean, professional, minimal CMS/admin application**.

The visual language is intentionally restrained.

Primary characteristics:

- white-first interface;
- black primary actions and text;
- neutral supporting tones only where required for usability;
- DM Sans typography;
- generous but controlled spacing;
- clear borders;
- simple cards;
- conventional tables;
- minimal decoration;
- no gradients;
- no colorful dashboard theme;
- no excessive shadows;
- no visually noisy components.

The Admin Panel should look like a product used daily by an internal team, not like a marketing landing page.

---

# 2. Color system

The palette is monochrome-first.

## 2.1 Core colors

Use these as the design foundation:

| Token | Value | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Main page background |
| `--color-black` | `#000000` | Primary text and primary actions |
| `--color-gray-50` | `#FAFAFA` | Subtle surfaces/hover backgrounds |
| `--color-gray-100` | `#F5F5F5` | Secondary surfaces |
| `--color-gray-200` | `#E5E5E5` | Borders/dividers |
| `--color-gray-300` | `#D4D4D4` | Stronger borders/disabled controls |
| `--color-gray-500` | `#737373` | Secondary/muted text |
| `--color-gray-700` | `#404040` | Secondary dark text |

The palette should remain visually neutral.

## 2.2 Primary action

Primary buttons:

```text
background: black
text: white
```

Hover:

```text
background: gray-700
text: white
```

Do not introduce arbitrary brand colors.

## 2.3 Destructive actions

Destructive actions may use a restrained semantic treatment when necessary for clarity.

They should remain visually compatible with the monochrome system.

Do not create a red-heavy interface.

The destructive meaning must also be communicated through text and confirmation, not color alone.

## 2.4 Status colors

Status badges may use very restrained semantic backgrounds/text where necessary for comprehension.

Status must never be communicated by color alone.

Examples:

```text
Draft
Published
Unpublished

New
Reviewing
Shortlisted
Rejected
Hired
```

The exact status treatment should remain subtle and consistent.

---

# 3. Typography

## 3.1 Font

Primary font:

**DM Sans**

All Admin Panel UI should use DM Sans unless a technical limitation requires otherwise.

Fallback stack:

```text
"DM Sans", ui-sans-serif, system-ui, sans-serif
```

## 3.2 Typography hierarchy

Recommended starting scale:

| Element | Size | Weight |
|---|---:|---:|
| Page title | 28px | 600 |
| Section title | 20px | 600 |
| Card title | 16px | 600 |
| Body | 14–16px | 400 |
| Secondary text | 13–14px | 400 |
| Table text | 14px | 400 |
| Label | 13–14px | 500 |
| Button | 14px | 500 |
| Small metadata | 12–13px | 400/500 |

Do not use large marketing-style typography.

## 3.3 Line height

Use comfortable line heights:

- headings: approximately 1.2–1.3;
- body: approximately 1.5;
- labels/control text: approximately 1.4.

---

# 4. Spacing

Use a consistent spacing scale.

Recommended base:

```text
4
8
12
16
20
24
32
40
48
64
```

Common usage:

- input internal spacing: 12–16px;
- form field gap: 16–20px;
- card padding: 20–24px;
- page section gap: 24–32px;
- page horizontal padding: 24–32px desktop;
- major page separation: 32–48px.

Avoid arbitrary one-off spacing values.

---

# 5. Border radius

Use restrained rounding.

Recommended:

```text
small controls: 6px
inputs/buttons: 6–8px
cards: 8–10px
dialogs: 10–12px
```

Avoid highly rounded/pill-shaped UI except for small status badges where appropriate.

---

# 6. Shadows

The interface should be mostly border-driven.

Use:

- borders for cards;
- borders for inputs;
- borders for tables;
- minimal shadow only where elevation is necessary.

Do not use large floating shadows.

---

# 7. Application shell

## 7.1 Sidebar

The sidebar is sticky/fixed on desktop.

Characteristics:

- white or near-white background;
- right border;
- black logo/product name;
- clear navigation;
- compact icons if used;
- active item clearly visible;
- no colorful navigation theme.

Example:

```text
VYNTICS

Dashboard

Content
  Blogs
  Case Studies

Operations
  Careers
  Job Applications

People
  Team Members

Inbox
  Contact Submissions

────────────────
Logout
```

The exact grouping can be adjusted during implementation, but labels must match actual product modules.

## 7.2 Active navigation

Active navigation should use:

- black text;
- subtle gray background;
- clear visual indicator.

Avoid bright colored active states.

## 7.3 Header

The top area may contain:

- page context;
- authenticated user identity;
- logout/account menu.

Keep it simple.

## 7.4 Login Page

The Login Page is a dedicated authentication screen, separate from the authenticated application shell. It must use the typography, colors, spacing, controls, responsive behavior, and accessibility requirements defined elsewhere in this guide.

### Layout

On desktop, use a full-viewport, two-column split layout:

- approximately 55% of the viewport for a brand/visual identity area;
- approximately 45% of the viewport for the login area.

The left side is primarily a Vyntics brand and visual identity area. It must reserve intentional, designed space for a Vyntics-provided image, artwork, or brand asset that will be selected separately. The asset must be replaceable later without restructuring the page and must remain independent from the authentication form.

The right side should use a clean white presentation. Center the authentication form within the available area and constrain it to a sensible maximum width so that it remains readable rather than stretching across the column.

### Content hierarchy

Use this concise hierarchy:

```text
Vyntics
Admin Panel

Welcome back
Sign in to continue

[Continue with Google]

or

Email
[email input]

Password
[password input] [visibility control]

[Sign in]
```

The primary action is **Sign in**. The Google action must be labeled **Continue with Google**.

Do not add marketing copy, unnecessary secondary links, or decorative content that competes with the authentication task.

### Authentication options and access context

The Login Page must provide:

- Google authentication;
- email/password authentication.

It must not provide or link to:

- Sign Up;
- Create Account;
- Register;
- public self-registration.

Administrators are provisioned separately. Successful Supabase authentication does not by itself grant Admin Panel access. The backend authorization flow remains authoritative:

```text
Supabase authentication
-> verified access token
-> exact case-insensitive vyntics.com email domain
-> active admin_users record
-> appropriate admin or superadmin role
-> Admin Panel access
```

The interface must not imply that creating a Supabase account creates an Admin Panel account. Do not invent an invitation, registration, or admin-management workflow.

### Responsive behavior

Desktop uses the approximately 55/45 two-column split described above.

On tablet, adapt the proportions or arrangement as needed while preserving both a recognizable brand presence and a comfortable login form.

On mobile, use a single-column layout with the authentication form as the primary interaction. The visual area may become a compact section above the form. On very small screens, it may be reduced further or hidden when necessary to prevent it from pushing the form excessively far down the page.

The mobile experience must remain simple, accessible, and consistent with the general responsive requirements in section 25.

### Visual treatment

Follow the existing Admin Panel visual system:

- DM Sans typography;
- white primary background;
- black primary text and primary action;
- white text on the black primary button;
- restrained neutral gray supporting colors;
- subtle borders and restrained border radii;
- minimal shadows;
- no gradients, colorful authentication theme, excessive decoration, or marketing-style animation.

Use the existing typography scale in section 3, spacing scale in section 4, button rules in section 11, and input/form rules in sections 12 and 13. Do not introduce a separate visual system for authentication.

### Accessibility and validation

The Login Page must provide:

- visible labels for Email and Password;
- appropriate form semantics;
- keyboard-accessible fields, buttons, and controls;
- visible focus states;
- an accessible name for the Google authentication button;
- an accessible password visibility control that communicates its current state;
- accessible validation and authentication error presentation;
- sufficient contrast.

Errors and status information must not rely on color alone. Follow the general accessibility and error-state requirements in sections 21 and 26.

---

# 8. Page layout

Every page should follow a predictable structure:

```text
Page
├── Page header
│   ├── Title
│   ├── Description
│   └── Primary action
│
├── Main content
│
└── Supporting sections/actions
```

Use a consistent maximum content width where appropriate.

Large tables may use the full available width.

Forms should not become excessively wide.

---

# 9. Dashboard

The dashboard should look like a normal operational dashboard.

Recommended structure:

```text
Dashboard

Welcome / context

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ KPI      │ │ KPI      │ │ KPI      │ │ KPI      │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Recent activity / useful admin content
```

KPI cards should:

- be simple;
- use large numeric values;
- have small labels;
- use borders;
- avoid decorative graphics;
- avoid fake metrics.

No colorful charts unless a real analytics contract is introduced later.

---

# 10. Cards

Cards should be simple containers.

Recommended:

```text
background: white
border: gray-200
radius: 8–10px
padding: 20–24px
```

Avoid:

- gradients;
- decorative illustrations;
- oversized shadows;
- unnecessary icons.

---

# 11. Buttons

## Primary

```text
black background
white text
```

Use for:

- Create;
- Save;
- Publish;
- Upload;
- Confirm important positive action.

## Secondary

```text
white background
black text
gray border
```

Use for:

- Cancel;
- Back;
- secondary actions.

## Ghost

Use sparingly.

Should remain clearly interactive without introducing visual noise.

## Destructive

Use for:

- Delete;
- destructive removal.

Require confirmation for destructive operations.

Buttons must have:

- clear labels;
- disabled state;
- loading state where applicable;
- keyboard focus state.

Avoid icon-only buttons unless the meaning is unambiguous and an accessible label is provided.

---

# 12. Inputs

Inputs should be clean and conventional.

```text
white background
gray border
black text
6–8px radius
```

Focus:

- clear black/dark focus indication;
- accessible focus ring.

Error:

- clear border/state;
- error message below field;
- not color-only.

Do not use placeholder text as a substitute for labels.

---

# 13. Forms

Form structure:

```text
Section title

Field label *
[ input ]

Field label
[ input ]

Help/error text

[ Cancel ] [ Save ]
```

Rules:

- labels always visible;
- required fields indicated;
- related fields grouped;
- sensible vertical spacing;
- primary action at the bottom or in a consistent page header;
- unsaved changes handling can be added where warranted.

Do not make forms visually dense.

---

# 14. Textareas and content fields

Use textareas for:

- excerpts;
- descriptions;
- metadata;
- notes;
- messages.

Structured JSON content fields for Blogs, Case Studies, and Careers must use the content editor selected during implementation.

The style guide does not prescribe a rich-text schema because the backend currently stores content as JSON objects without a predefined document schema.

The editor must not silently invent a backend schema without an explicit implementation decision.

---

# 15. Tables

Tables are a major part of the Admin Panel.

Visual structure:

```text
┌──────────────────────────────────────────────────────────┐
│ Name       Status       Updated       Actions            │
├──────────────────────────────────────────────────────────┤
│ ...                                                       │
│ ...                                                       │
└──────────────────────────────────────────────────────────┘
```

Use:

- white background;
- subtle borders;
- compact but readable rows;
- clear headers;
- consistent alignment;
- right-aligned actions where appropriate.

Avoid:

- excessive row colors;
- colorful table headers;
- dense tiny typography.

Rows should have a subtle hover state.

---

# 16. Status badges

Status badges should be compact and readable.

Examples:

```text
Draft
Published
Unpublished
```

and:

```text
New
Reviewing
Shortlisted
Rejected
Hired
```

Use text plus restrained semantic styling.

Do not use status color as the only differentiator.

---

# 17. Dialogs

Use dialogs for:

- delete confirmation;
- potentially destructive actions;
- concise confirmations.

Structure:

```text
Delete Blog?

This action permanently removes the blog.

[Cancel] [Delete]
```

Rules:

- clear title;
- concise explanation;
- explicit destructive action;
- keyboard accessible;
- focus trapped appropriately;
- Escape closes when safe.

Do not use dialogs for large forms unless there is a strong UX reason.

---

# 18. Toasts / notifications

Use lightweight feedback for successful mutations:

```text
Blog updated successfully.
```

and failures:

```text
Unable to update the blog. Please try again.
```

Notifications should:

- be concise;
- not contain secrets;
- not expose internal stack traces;
- not replace important inline validation.

---

# 19. Loading states

Use consistent skeletons/spinners.

Tables:

- show row skeletons or a clear loading indicator.

Forms:

- disable mutation controls;
- show loading text/state.

Uploads:

- show upload progress/loading state;
- prevent duplicate upload actions.

---

# 20. Empty states

Empty states should be informative but minimal.

Example:

```text
No blog posts

Create a blog post to get started.

[Create Blog]
```

For read-only sections:

```text
No contact submissions yet.
```

Do not use oversized illustrations unless intentionally added to the design system.

---

# 21. Error states

Error states should be calm and actionable.

Example:

```text
Something went wrong

We couldn't load the blog posts.

[Try again]
```

For permission:

```text
You don't have permission to access this page.
```

For service availability:

```text
The service is temporarily unavailable.
Please try again later.
```

Never display:

- stack traces;
- internal URLs;
- Storage credentials;
- access tokens;
- raw infrastructure exceptions.

---

# 22. File upload UI

For Blog covers, Case Study covers, and Team photos:

```text
┌─────────────────────────────────────────┐
│                                         │
│   Upload image                          │
│   JPEG, PNG or WebP · Max 5 MB          │
│                                         │
│   [Choose file]                         │
│                                         │
└─────────────────────────────────────────┘
```

After selection:

- show preview;
- show filename only if useful;
- allow replacement;
- show upload state;
- show validation error.

Do not allow arbitrary Storage bucket/path selection.

---

# 23. Image preview

Use predictable aspect ratios.

For cover images:

- wide landscape preview.

For team photos:

- portrait/square-oriented preview depending on the final public presentation.

The admin UI should not distort images.

Use object-fit behavior appropriate to the content.

## 23.1 Case Studies UI/UX

The Case Studies experience must use the existing Admin Panel visual system and should feel like a coherent part of the same CMS. These requirements define visual hierarchy and editing experience only; they do not change application architecture or backend contracts.

### Case Studies list page

Each Case Study in the list must prominently display its cover image as part of the record's primary visual hierarchy. The image must not be hidden until the record is opened.

The title and supporting information should remain clean, concise, and easy to scan alongside the cover. Image prominence must not make row actions, status, or important metadata difficult to find.

The list presentation must:

- preserve a consistent wide landscape treatment for cover images;
- avoid cropping or distortion that obscures the image's purpose;
- remain orderly and readable when several records are visible;
- adapt cleanly between desktop and mobile;
- use the existing loading, empty, error, status, and action patterns;
- avoid introducing a separate card style or visual language that conflicts with the rest of the Admin Panel.

### Case Study detail/edit page

The detail/edit experience should read as a structured content-editing page rather than an unorganized collection of inputs.

#### Cover image first

The existing cover image must be displayed prominently at the top of the experience. Cover upload, replacement, and deletion controls must be visually grouped with that image so their relationship is immediately clear.

When no cover exists, the corresponding empty/upload state should occupy the same leading area and preserve the intended hierarchy.

#### Title and information hierarchy

The Case Study title should appear immediately after the cover-image area. Remaining fields should follow in clear, logical groups with visible section hierarchy and comfortable spacing.

The page should guide the administrator from the identifying content into supporting metadata and longer content without presenting every field with equal visual weight.

#### Field layout

Fields that require more attention or space should generally be arranged vertically. Small, closely related fields may appear side by side when that improves scanability and editing efficiency.

Do not force every field into a two-column grid. Longer text and content fields should use the available full width. Field grouping and width should prioritize readability, clear labels, and comfortable editing over visual density.

#### Long-form content

Long-form fields must have sufficient horizontal width and vertical editing space. The main content area must not feel cramped, and its layout should remain comfortable for reviewing and editing substantial content.

#### Save action

A clear **Save Changes** button must appear at the bottom of the edit form. It should use the established primary-button hierarchy and remain visually prominent among nearby secondary actions.

While saving, the action must show an appropriate loading state and prevent duplicate submission. Validation and API errors must remain clearly visible, understandable, and associated with the relevant field or form state where appropriate.

#### Responsive behavior

Any side-by-side field arrangement must collapse naturally to a single column on smaller screens. The cover image and its related actions must remain prominent and usable on mobile.

Normal editing must not require horizontal page scrolling. Long-form controls, form actions, status feedback, and image controls should fit the available viewport and follow the existing responsive form patterns.

### Design consistency

Case Studies must reuse:

- DM Sans;
- the existing monochrome color palette;
- the existing spacing scale;
- the existing typography hierarchy;
- the existing border and radius system;
- the existing button hierarchy;
- the existing input and form patterns;
- the existing loading, empty, error, and mutation-state patterns.

Do not introduce gradients, unrelated colors, a new component library, or a separate Case Studies visual language.

### Scope boundary

This subsection defines visual and interaction requirements only. It does not define or change API endpoints, backend or database behavior, authentication, dependencies, routing, or specific React component implementation.

## 23.2 Careers UI/UX

The Careers experience must use the existing Admin Panel visual system and should make current Career opportunities easy to scan and manage. These requirements define visual hierarchy and navigation intent only; the implementation-plan contract remains authoritative for Career fields and behavior.

### Careers listing

The Careers page should use a card-based layout. Each current Career record should appear as an individual, self-contained card that presents the most important supported Career information at a glance.

Cards should make roles easy to scan and compare without becoming visually dense. Their content and hierarchy must follow the existing Career data contract and should use clear titles, concise supporting details, and predictable actions.

The primary Careers presentation should not be a traditional data table. A secondary table representation may be considered only when there is a strong responsive or accessibility reason and it remains consistent with the same information hierarchy.

### Opening a Career

Selecting a Career card should open the corresponding Career detail/edit experience. The card's primary interactive area and actions must remain clear and keyboard accessible so that opening the Career is predictable and does not conflict with secondary actions.

The detail/edit experience must follow the existing Admin Panel design language and provide the appropriate Career management fields. The exact field hierarchy will be defined during implementation from the current implementation-plan contract.

### See Applicants for This Role

Each Career card must provide a clear action labeled **See Applicants for This Role**.

This action should take the administrator directly to the Job Applications experience with the selected Career context preserved, so the administrator does not need to find the role again manually.

The intended flow is:

```text
Careers
-> specific Career card
-> See Applicants for This Role
-> Job Applications page
-> applicants for that specific Career
```

The navigation should make the selected Career context clear when the Job Applications experience opens. This subsection does not prescribe a technical routing or filtering mechanism.

### Scope boundary

The Job Applications page belongs to the next implementation phase. For the Careers phase, only the navigation intent described above is defined.

Do not define or implement the complete Job Applications experience here, including:

- applicant cards or tables;
- applicant filters;
- applicant detail views;
- application status management;
- resume handling;
- notes;
- application deletion;
- other Job Applications interactions.

The Job Applications UI and behavior will be designed and implemented in its own phase.

### Responsive behavior

On desktop, Career cards may use a clean responsive grid. Cards should have consistent sizing and spacing, and the overall layout should remain visually balanced across the available width.

On mobile, cards should collapse naturally into a single-column flow or another appropriate narrow layout. Normal use must not require horizontal scrolling.

At every supported viewport:

- card content should remain readable without excessive truncation;
- the primary Career selection behavior should remain clear;
- **See Applicants for This Role** must remain easy to find and activate;
- spacing and action placement should remain consistent and accessible.

### Design-system consistency

Careers must reuse:

- DM Sans;
- the existing monochrome color palette;
- the existing spacing scale;
- the existing typography hierarchy;
- the existing border and radius system;
- the existing button hierarchy;
- the existing card patterns;
- the existing loading, empty, and error-state patterns;
- the existing responsive behavior.

Do not introduce gradients, unrelated colors, a new component library, or a separate Careers visual language.

## 23.3 Job Applications UI/UX

The Job Applications experience should support quick discovery, comparison, and review while making the current applicant scope immediately clear. These requirements define visual and interaction behavior only; they do not change the documented backend contract.

### Job Applications overview

The page should provide a two-level navigation and discovery experience that lets the administrator choose between:

- **All Applicants**;
- applicants associated with one specific Career.

The current selection must remain visually clear so the administrator can immediately understand whether the displayed applications span all Careers or belong to one role.

### All Applicants

A prominent **All Applicants** action, card, or button should appear near the top of the page. Selecting it should display applications across all Careers rather than restricting the view to one Career.

The All Applicants entry must remain easy to find and activate after a specific Career has been selected. Its selected and unselected states should follow the existing focus, active, and card or button patterns without relying on color alone.

### Career cards

Below the All Applicants entry, display compact navigation cards for the available Careers. These cards should be smaller and more concise than the Career management cards on the Careers page because their purpose is applicant discovery and scope selection, not Career management.

Each card should clearly show the Career title. Selecting a card should display only the applications associated with that Career and should give the selected card a clear, accessible active state.

The intended discovery flows are:

```text
Job Applications
-> All Applicants
-> all applications
```

or:

```text
Job Applications
-> Career card
-> applicants for that Career
```

### Applicants table

Applications should use a clean, compact table optimized for scanning and comparison. The primary columns are:

- Name;
- Email;
- Mobile;
- Status;
- Resume;
- Details.

Columns, row spacing, alignment, and action placement should remain consistent with the existing Admin Panel table patterns. Readability must not be sacrificed for density.

### Resume action

The Resume column should provide a clear view or download action when a resume is available. The control must use an understandable text label, accessible name, or supporting tooltip and must not rely on an unexplained icon alone.

Resume access must follow the existing private-storage security model. The UI must not reveal raw Storage paths, permanent public URLs, credentials, provider details, or other private implementation information.

When no resume is available, display the established **No resume attached** state rather than an inactive or misleading download action.

### Status

The Status column should use the existing compact status-badge language. Status text must remain readable and visually distinguishable within the monochrome design system, and meaning must never depend on color alone.

### Expandable applicant details

Each applicant row should expand and collapse to reveal additional application information. The whole row should offer a comfortably sized interaction target; the administrator should not need to select only a small Details control.

The row must also retain a visible Details or information control as an obvious secondary affordance. Both interactions should affect the same expanded state:

- selecting the row expands or collapses its details;
- selecting the Details control expands or collapses its details.

The expanded area should appear immediately associated with its applicant row through spacing, borders, background treatment, or another restrained existing pattern.

### Expanded details

The expanded area should present the additional information available from the documented Job Applications contract in clear, logical groups rather than as an unstructured block.

Related identity, Career, application, and administrative information should be grouped consistently. Longer content, including notes and other descriptive information, should receive sufficient width and spacing for comfortable reading.

The expanded content must remain visually connected to the originating row and should not appear to belong to the next applicant.

### Row interaction and accessibility

Expandable rows must be keyboard accessible and show a visible focus state. Assistive technology must be able to identify the expansion control and determine whether the details are expanded or collapsed.

Interactive controls inside a row must retain distinct behavior:

- selecting Resume performs the resume action and must not toggle row expansion;
- selecting Details explicitly toggles expansion;
- other row actions must not accidentally trigger expansion;
- focus order and accessible names must make each available action understandable.

The row should provide a generous interaction area without creating invalid or confusing nested interactive controls.

### Responsive behavior

The Career navigation cards should collapse naturally on smaller screens while keeping the selected scope clear.

The applicants table must remain usable when all desktop columns cannot fit comfortably. Use an appropriate responsive table treatment that preserves access to primary applicant information, status, Resume, and Details rather than compressing content into unreadable columns.

Expanded details must remain readable on mobile, with long content wrapping naturally and without requiring horizontal page scrolling for normal review.

### Visual hierarchy

Use this overall hierarchy:

1. Job Applications page heading;
2. All Applicants action;
3. Career-specific navigation cards;
4. current applicant scope or context;
5. applicants table;
6. expanded applicant details.

The selected scope should be apparent before the administrator begins reviewing table rows.

### Design-system consistency

Job Applications must reuse:

- DM Sans;
- the existing monochrome color palette;
- the existing spacing scale;
- the existing typography hierarchy;
- the existing card patterns;
- the existing table patterns;
- the existing button hierarchy;
- the existing status badges;
- the existing dialogs and notification patterns;
- the existing loading, empty, and error-state patterns;
- the existing responsive behavior.

Do not introduce gradients, unrelated colors, a new component library, or a separate Job Applications visual language.

### Scope boundary

This subsection defines Job Applications visual and interaction requirements only. It does not define routing mechanics, API changes, backend or database behavior, authentication, dependencies, or specific component implementation. It does not document unrelated future features.

## 23.4 Our Team / Team Members UI/UX

The Team Members experience should provide a clean, image-focused overview inspired by the card composition and hierarchy of the current public Vyntics Team section. The Admin Panel must interpret that visual reference through its own established design system rather than copying the public website's implementation or introducing a separate visual language.

### Team Members listing

The Team Members page should use a card-based layout. Each Team Member should appear as an individual card that prominently displays:

- the Team Member photo;
- the Team Member name;
- the Team Member role.

The listing should provide a clear visual overview of the team without displaying the member's biography or description. Cards should remain focused, easy to scan, and free from unnecessary administrative metadata.

### Card visual hierarchy

Each Team Member card should use this hierarchy:

1. Team Member photo;
2. Team Member name;
3. Team Member role.

The photo should be the primary visual element. The name should be immediately readable, with the role presented as secondary information beneath it.

Do not add the full biography or description to the card. Do not overload the card with information that belongs in the detail experience.

The overall card composition may take visual inspiration from the clean, image-led public Vyntics Team section while retaining the Admin Panel's typography, borders, spacing, controls, and restrained monochrome treatment.

### Team page header

The page should have a clear **Team Members** heading. A prominent **Create New Team Member** button should appear at the top right of the page header and use the existing primary-button styling.

This should be the primary creation action and must remain easy to locate across supported viewport sizes.

### Opening a Team Member

Selecting anywhere on a Team Member card should open that member's management and detail experience. The card itself should be the primary entry point, with a clear focus state and keyboard-accessible behavior.

The administrator should not need to locate a small Edit button inside the card simply to open the Team Member.

The detail/edit experience should provide access to:

- complete Team Member information;
- biography or description;
- photo management;
- editing;
- deletion.

The exact field hierarchy should follow the current Team Member data contract and may be finalized during implementation.

### Team Member detail experience

The Team Member detail/edit experience should display the complete information associated with the selected member. This is where the full biography or description belongs.

The page should clearly distinguish:

- viewable information;
- editable fields;
- photo-management controls;
- the **Save Changes** action;
- the destructive Delete action.

The biography must remain in the detail/edit experience and must not be repeated on the listing card.

### Edit behavior

Editing should use the established Admin Panel form hierarchy and controls. The experience should support only fields defined by the current Team Member contract.

The save action should follow existing conventions for prominence, loading and disabled states, duplicate-submission prevention, validation, success feedback, and safe API-error presentation.

### Delete behavior

Deletion should be available from the Team Member detail/edit experience and use the existing destructive confirmation-dialog pattern. The confirmation should clearly identify the Team Member being removed.

Do not place an unnecessarily prominent destructive action on every listing card. The listing should remain visually focused on opening and reviewing Team Members.

### Create behavior

Selecting **Create New Team Member** should open the Team Member creation experience. Creation should use the same visual hierarchy, field patterns, validation treatment, and responsive form behavior as editing.

### Responsive behavior

On desktop, Team Member cards should use a clean responsive grid with consistent sizing and spacing. The photo, name, and role hierarchy should remain visually balanced, and the Create New Team Member action should remain visible in the page header.

On mobile, cards should collapse naturally into a single-column or another appropriate narrow layout without horizontal scrolling. Photos should remain prominent, names and roles should remain readable, and the primary creation action should remain easy to access.

### Design-system consistency

Team Members must reuse:

- DM Sans;
- the existing monochrome color palette;
- the existing spacing scale;
- the existing typography hierarchy;
- the existing card patterns;
- the existing button hierarchy;
- the existing form controls;
- the existing dialog and confirmation patterns;
- the existing loading, empty, and error-state patterns;
- the existing responsive behavior.

The public website reference informs only the card composition and image/name/role hierarchy. Do not copy its implementation, styling system, or public-site behavior into the Admin Panel.

### Information intentionally excluded from cards

Unless a future approved design-system requirement explicitly changes the listing, do not display the following on Team Member cards:

- biography or description;
- full LinkedIn URL;
- created or updated timestamps;
- internal identifiers;
- administrative metadata.

### Scope boundary

This subsection defines visual and interaction requirements for the Admin Panel Team Members experience only. It does not define or change backend API contracts, database schema, Storage architecture, authentication, public website implementation, or the behavior of the public Team section.

---

# 24. Resume UI

Job application resumes are private.

Use a simple action:

```text
Resume

[View Resume]
[Download]
```

if the backend provides an active signed URL.

If no resume:

```text
No resume attached.
```

Do not display raw Storage paths.

Do not expose permanent public URLs.

---

# 25. Responsive behavior

Desktop:

- fixed/sticky sidebar;
- comfortable table width;
- two-column form layouts only where useful.

Tablet:

- reduced page padding;
- sidebar may collapse.

Mobile:

- drawer navigation;
- single-column forms;
- horizontal table scrolling;
- stacked page actions;
- full-width primary actions where appropriate.

The mobile UI should remain functional rather than attempting to reproduce the desktop layout exactly.

---

# 26. Accessibility

Required:

- keyboard navigation;
- visible focus;
- semantic controls;
- labels;
- accessible names;
- correct heading hierarchy;
- dialog focus management;
- table headers;
- meaningful error messages;
- no color-only status meaning.

Minimum target should be strong WCAG-oriented practice rather than visual-only compliance.

---

# 27. Icons

Icons should be:

- simple;
- monochrome;
- consistent in stroke/weight;
- used to support labels rather than replace them.

Do not introduce decorative iconography everywhere.

Sidebar icons may be used, but navigation labels must remain visible on desktop.

---

# 28. Animation

Animation should be minimal.

Allowed:

- sidebar transitions;
- dialog transitions;
- subtle hover/focus transitions;
- loading indicators.

Avoid:

- large entrance animations;
- bouncing elements;
- decorative motion;
- marketing-style animation.

The admin panel should feel fast and stable.

---

# 29. Content tone

UI copy should be:

- concise;
- direct;
- professional;
- neutral.

Examples:

Good:

> Delete this case study?

> Cover image is required before publishing.

> No applications found.

Avoid:

> Uh oh! Looks like something went wrong!

Avoid overly conversational marketing copy.

---

# 30. Component consistency

Once a component exists, reuse it.

Examples:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Dialog`
- `Badge`
- `Table`
- `PageHeader`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `FileUpload`
- `FormField`

Do not create visually different versions of the same component for each feature without a real requirement.

---

# 31. Design principles

The Admin Panel should consistently follow these principles:

1. **Clarity over decoration**
2. **Consistency over novelty**
3. **Black and white first**
4. **DM Sans everywhere**
5. **Borders over heavy shadows**
6. **Clear hierarchy**
7. **Predictable forms**
8. **Readable tables**
9. **Accessible interactions**
10. **No invented backend behavior**

The final interface should feel like one coherent system even though it contains several independent administrative modules.
