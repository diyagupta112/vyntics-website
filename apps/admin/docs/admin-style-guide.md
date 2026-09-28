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
