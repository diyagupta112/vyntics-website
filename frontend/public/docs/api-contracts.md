# Vyntics Website - Master API Contract

Public Website Frontend Integration Reference • Consolidated from the approved API contracts

Version 1.0  |  22 September 2026  |  Frontend Integration

# Purpose

This document consolidates the API contracts for the Vyntics public company website into one reference for the frontend team. It preserves the endpoint definitions, request/response structures, field explanations, content-body guidance, SEO metadata guidance, frontend mapping, validation rules, and important implementation instructions from the individual API documents.

# API Scope

| Website Functionality | Endpoint(s) | Purpose |
| --- | --- | --- |
| Blogs | GET /blogs GET /blogs/{slug} | Blog listing and complete individual blog pages. |
| Case Studies | GET /case-studies GET /case-studies/{slug} | Case-study listing and complete individual case-study pages. |
| Careers | GET /careers GET /careers/{slug} | Current openings and individual job details. |
| Job Applications | POST /careers/{slug}/apply | Submit an application for a specific job. |
| Our Team | GET /our-team | Return all publicly visible team members. |
| Contact Us | POST /contact-us | Submit a website contact/inquiry form. |

# General Public API Principle

These contracts describe the data the public website frontend should expect from the backend. Internal Admin Panel implementation details are kept separate unless they directly affect frontend behavior.

Important: The frontend should build against the agreed public response structures rather than relying on internal database fields or Admin Panel implementation details.

# 1. Blogs API

The Blogs API supports two public website use cases: the main Blogs listing and an individual blog page.

## 1.1 Main Blogs Page

`GET /blogs`

Returns a list of published blogs that can be displayed on the main Blogs page.

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "example-blog-slug",
      "title": "Example Blog Title",
      "author": "Author Name",
      "category": "Artificial Intelligence",
      "excerpt": "Short description of the blog...",
      "cover_image_url": "https://...",
      "read_time": 8,
      "published_at": "2026-09-22T10:30:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
| --- | --- | --- |
| id | string/UUID | Unique identifier of the blog. |
| slug | string | Unique URL-friendly identifier used to navigate to the individual blog. |
| title | string | Main title of the blog. |
| author | string | Author name. |
| category | string | Blog category. |
| excerpt | string | Short description/summary shown as the blog preview. |
| cover_image_url | string | URL of the blog's cover image. |
| read_time | integer | Estimated reading time in minutes. |
| published_at | datetime | Date/time when the blog was published. |

### Fields Intentionally Not Included in Listing

The listing response does not include the complete blog content because the main Blogs page only needs the information required to display blog previews/cards.

- `content` - complete article content is only needed on the individual blog page.
- `seo_title` - used for the individual page's document title and SEO metadata.
- `meta_description` - used for the individual page's SEO metadata.

The `GET /blogs` response is intentionally lightweight compared with `GET /blogs/{slug}`. Pagination can be added later if required as the number of published blogs grows; exact pagination parameters can be finalized separately.

### Frontend Mapping

| API Field | Frontend Use |
| --- | --- |
| title | Blog card title |
| excerpt | Blog card description/preview |
| cover_image_url | Blog card image |
| category | Category/tag |
| author | Author information |
| read_time | Reading time |
| published_at | Publication date |
| slug | Link to the individual blog |

### Expected Flow

```
GET /blogs
  ↓
Blogs listing
  ↓
Blog cards
  ↓
User selects a blog
  ↓
GET /blogs/{slug}
  ↓
Complete blog
```

## 1.2 Individual Blog Page

`GET /blogs/{slug}`

Returns the complete public data required to render one individual blog page.

```json
{
  "id": "uuid",
  "slug": "example-blog-slug",
  "title": "Example Blog Title",
  "seo_title": "Example Blog Title | Vyntics",
  "meta_description": "A short description of the blog for search engines and page metadata.",
  "author": "Author Name",
  "category": "Artificial Intelligence",
  "excerpt": "Short description of the blog...",
  "cover_image_url": "https://...",
  "read_time": 8,
  "content": {},
  "published_at": "2026-09-22T10:30:00Z"
}
```

### Response Fields

| Field | Type | Description |
| --- | --- | --- |
| id | string/UUID | Unique identifier of the blog. |
| slug | string | Unique URL-friendly identifier used for the blog URL. |
| title | string | Main title of the blog; this is the visible title rendered on the page. |
| seo_title | string | SEO/page title used for the HTML document title and search-engine metadata. It does not need to be visible inside the blog. |
| meta_description | string | SEO description for page metadata/search-engine results. It does not need to be visible inside the blog. |
| author | string | Author name. |
| category | string | Blog category. |
| excerpt | string | Short description/summary of the blog. |
| cover_image_url | string | URL of the blog's cover image. |
| read_time | integer | Estimated reading time in minutes. |
| content | object | Complete structured content of the blog. |
| published_at | datetime | Date/time when the blog was published. |

### Important: title vs seo_title vs meta_description

| Field | Frontend Use | Visible in Article? |
| --- | --- | --- |
| title | Use as the visible/main blog heading (`<h1>`). | Yes |
| seo_title | Use for the page/document title (`<title>`) and relevant SEO metadata. | No |
| meta_description | Use for the page's meta description. | No |

`seo_title` and `meta_description` do not need to be rendered as visible content inside the blog article.

### Blog Content Body

The `content` field contains the complete structured content of the article. It should not be treated as a single plain-text string.

- Headings
- Subheadings
- Paragraphs
- Lists
- Images
- Links
- Other rich-text elements

The frontend should treat `content` as structured content and render it accordingly. The exact internal editor/storage format for `content` is handled separately as part of the Admin Panel/backend implementation. The website frontend does not need to know how the Admin Panel creates the content; it only needs to follow the agreed API response structure for rendering it.

For now, the public API contract defines `content` as structured content; the exact `content` schema can be defined separately before implementation.

# 2. Case Studies API

The Case Studies API supports a lightweight listing response for cards and a complete response for an individual case-study page.

## 2.1 Main Case Studies Page

`GET /case-studies`

Returns only the information required to render case-study cards and navigate to an individual case study.

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "example-case-study",
      "title": "Example Case Study",
      "client_name": "Example Client",
      "excerpt": "A short description of the case study...",
      "cover_image_url": "https://...",
      "tech_stack": [
        "Python",
        "FastAPI",
        "AWS"
      ],
      "tags": [
        "AI",
        "Web Development"
      ],
      "published_at": "2026-09-22T10:30:00Z"
    }
  ]
}
```

### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| id | string / UUID | Unique identifier for the case study. |
| slug | string | URL-friendly identifier used to navigate to the individual case-study page. |
| title | string | Main title displayed on the case-study card. |
| client_name | string | Identifies the client/project if the client name is intended to be publicly displayed. |
| excerpt | string | Short description shown on the case-study card. |
| cover_image_url | string | Image displayed on the case-study card. |
| tech_stack | array of strings | Technologies used in the project. |
| tags | array of strings | Topics/categories associated with the case study; useful for display or future filtering. |
| published_at | datetime | Publication date/time. |

### Fields Not Included in Listing

- `content` - full structured case-study content is only needed on the individual case-study page.
- `seo_title` - used for the individual page's document title and SEO metadata.
- `meta_description` - used for the individual page's SEO metadata.
- `status` - internal publication/state field; published case studies can be returned without exposing this internal field.

## 2.2 Individual Case Study Page

`GET /case-studies/{slug}`

Returns the complete public data required to display one case study.

```json
{
  "id": "uuid",
  "slug": "example-case-study",
  "title": "Example Case Study",
  "seo_title": "Example Case Study | Vyntics",
  "meta_description": "A short description of the case study for search engines and page metadata.",
  "client_name": "Example Client",
  "excerpt": "A short description of the case study...",
  "cover_image_url": "https://...",
  "tech_stack": [
    "Python",
    "FastAPI",
    "AWS"
  ],
  "tags": [
    "AI",
    "Web Development"
  ],
  "content": {},
  "published_at": "2026-09-22T10:30:00Z"
}
```

### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| id | string / UUID | Unique identifier for the case study. |
| slug | string | URL-friendly identifier for the case-study page. |
| title | string | Visible main case-study heading. |
| seo_title | string | SEO/page title used for the HTML document title and relevant SEO metadata; not part of the visible case-study body. |
| meta_description | string | Page metadata/search-engine description; not part of the visible case-study body. |
| client_name | string | Identifies the client/project if publicly displayed. |
| excerpt | string | Short description/summary of the case study. |
| cover_image_url | string | Main/cover image for the case-study page. |
| tech_stack | array of strings | Technologies used in the project. |
| tags | array of strings | Topics/categories associated with the case study. |
| content | object | Complete structured case-study content. |
| published_at | datetime | Publication date/time. |

## 2.3 Case Study Content Body

The `content` body should be structured content rather than one large plain-text string. It can contain multiple content types such as headings, paragraphs, lists, images, links, and videos.

```json
{
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "content": [
          {
            "type": "text",
            "text": "Our Approach"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "We built a scalable solution..."
          }
        ]
      },
      {
        "type": "image",
        "attrs": {
          "src": "https://example.com/image.jpg",
          "alt": "System architecture"
        }
      },
      {
        "type": "video",
        "attrs": {
          "src": "https://example.com/video.mp4"
        }
      }
    ]
  }
}
```

### Supported Content Types

- Heading
- Paragraph
- Image
- Video
- List
- Link
- Other structured content types agreed as part of the final content schema

### Video Handling

Videos should be represented by a URL/reference to the video rather than embedding the video file itself inside the API JSON response.

```json
{
  "type": "video",
  "attrs": {
    "src": "https://storage.example.com/case-study-demo.mp4"
  }
}
```

Typical flow:

1. Admin Panel creates/updates the case-study content.
2. FastAPI handles the application/API layer.
3. Video assets are stored in the configured storage service.
4. The resulting video URL/reference is included in the structured content.
5. The public Case Studies API returns the structured content.
6. The website frontend renders the video using the provided reference.

### Case Studies API Flow

```
Case Studies Page
  ↓
GET /case-studies
  ↓
Case Study Cards
  ↓
User selects a case study
  ↓
GET /case-studies/{slug}
  ↓
Complete Case Study Page
```

The two endpoints have different responsibilities: `GET /case-studies` returns enough information to display all case-study cards, while `GET /case-studies/{slug}` returns everything required to display one complete case study.

### Public Client Name Decision

The source contract includes `client_name` as a case-study field. Whether it should be publicly displayed should be confirmed with the frontend/design/content team. If client names are intended to be public, `client_name` remains in the public response. If not, it can be omitted from the public API while still being retained internally where required.

# 3. Careers API

The Careers API supports the public Careers listing and the individual job detail page.

## 3.1 Current Job Openings

`GET /careers`

Returns the currently published/open job opportunities shown on the Careers page.

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "senior-software-engineer",
      "title": "Senior Software Engineer",
      "location": "Remote",
      "employment_type": "Full-time",
      "department": "Engineering",
      "experience": "3+ years",
      "short_description": "We are looking for a Senior Software Engineer...",
      "published_at": "2026-09-22T10:30:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | string / UUID | Yes | Unique identifier for the job internally. |
| slug | string | Yes | Public URL identifier, e.g. senior-software-engineer. |
| title | string | Yes | Job title displayed to users. |
| location | string | Yes | Job location, such as Remote or Jaipur, India. |
| employment_type | string | Yes | Employment type, such as Full-time or Part-time. |
| department | string | Yes | Department or functional area. |
| experience | string | Yes | Experience requirement displayed to users. |
| short_description | string | Yes | Short summary used on the Careers listing/card. |
| published_at | datetime | Yes | Publication timestamp in ISO 8601 format. |

The listing API should return only jobs that are currently published/open for applications. Internal fields such as application status, internal notes, or administrative metadata are not part of this public response.

## 3.2 Individual Job Details

`GET /careers/{slug}`

Returns the complete public details for a specific job opening. The frontend remains on the job URL when the user opens the job and views its details.

```json
{
  "id": "uuid",
  "slug": "senior-software-engineer",
  "title": "Senior Software Engineer",
  "location": "Remote",
  "employment_type": "Full-time",
  "department": "Engineering",
  "experience": "3+ years",
  "short_description": "We are looking for a Senior Software Engineer...",
  "description": {},
  "responsibilities": {},
  "requirements": {},
  "nice_to_have": {},
  "benefits": {},
  "published_at": "2026-09-22T10:30:00Z"
}
```

### Response Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | string / UUID | Yes | Unique identifier for the job. |
| slug | string | Yes | Public URL identifier. |
| title | string | Yes | Job title. |
| location | string | Yes | Job location. |
| employment_type | string | Yes | Employment type. |
| department | string | Yes | Department or functional area. |
| experience | string | Yes | Experience requirement. |
| short_description | string | Yes | Short job summary. |
| description | object | Yes | Structured full job description/content. |
| responsibilities | object | Yes | Structured list/content of responsibilities. |
| requirements | object | Yes | Structured list/content of required qualifications. |
| nice_to_have | object | Yes | Structured list/content of preferred qualifications. |
| benefits | object | Yes | Structured content describing benefits. |
| published_at | datetime | Yes | Publication timestamp in ISO 8601 format. |

## 3.3 URL and Apply Flow

A job is publicly accessible using its slug, for example `/careers/senior-software-engineer`. Clicking Apply Now does not require a separate job page or a frontend lookup of the internal UUID. The application is submitted to `POST /careers/{slug}/apply`, documented in the Job Applications section.

The longer job-detail sections are represented as structured content objects rather than plain text. The exact internal editor/storage format is an implementation detail; the public API contract should remain stable.

# 4. Job Applications API

This endpoint is used when a candidate submits the Apply Now form for a specific Vyntics job opening.

## 4.1 Submit Job Application

`POST /careers/{slug}/apply`

Submits an application for the job identified by the public slug. The endpoint accepts multipart/form-data because the resume is uploaded as a file.

Content-Type: multipart/form-data

### Request Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Applicant's full name. |
| email | string | Yes | Applicant's email address. |
| phone | string | Yes | Applicant's direct contact phone number. |
| resume | file | Yes | Applicant's resume/CV. Accepted formats: .pdf, .doc, .docx. |
| cover_letter | string | No | Optional cover letter or additional information from the applicant. |

### Example Request

```
POST /careers/senior-software-engineer/apply
Content-Type: multipart/form-data

name: John Doe
email: john@example.com
phone: +91 9876543210
resume: john-doe-resume.pdf
cover_letter: I am interested in this position because...
```

## 4.2 Application Processing

- The backend resolves the `{slug}` to the corresponding internal job record and associates the new application with that job.
- The frontend does not need to send the internal job UUID.
- The backend should verify that the job exists and is currently accepting applications before creating the application.

## 4.3 Resume Validation

The resume is required and must be restricted to PDF, DOC, or DOCX. Validation should check the uploaded file's actual MIME/file type in addition to the filename extension; extension-only validation should not be relied upon.

## 4.4 Backend-Managed Application Fields

These fields are created/managed by the backend and are not submitted by the public frontend form.

| Field | Type | Managed By | Description |
| --- | --- | --- | --- |
| id | string / UUID | Backend | Unique application identifier. |
| job_id | string / UUID | Backend | Internal job identifier resolved from the URL slug. |
| resume_url | string | Backend | Storage reference/URL for the uploaded resume. |
| status | string | Backend | Initial application status, such as `new`. |
| submitted_at | datetime | Backend | Application submission timestamp. |
| notes | string | Backend | Internal recruiter/admin notes, if supported. |

## 4.5 Frontend Apply Flow

1. Frontend loads a job using `GET /careers/{slug}`.
2. User clicks Apply Now on the same job page.
3. Frontend displays the application form without changing the public job URL.
4. User enters name, email, phone, resume, and optionally a cover letter.
5. Frontend submits the form to `POST /careers/{slug}/apply` using multipart/form-data.
6. Backend validates the job, applicant fields, and resume, stores the application, and associates it with the correct job.

## Form Summary

| Required | Optional |
| --- | --- |
| Name | Cover Letter |
| Email |  |
| Phone |  |
| Resume |  |

# 5. Our Team API

The public website uses a single endpoint for the Our Team page. There is no separate public endpoint for an individual team member at this stage.

`GET /our-team`

Returns all publicly visible team members in the intended display order.

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "Chief Executive Officer",
      "bio": "John leads Vyntics and focuses on...",
      "photo_url": "https://...",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "display_order": 1,
      "member_type": "leadership"
    },
    {
      "id": "uuid",
      "name": "Jane Smith",
      "role": "Software Engineer",
      "bio": "Jane works on...",
      "photo_url": "https://...",
      "linkedin_url": "https://linkedin.com/in/janesmith",
      "display_order": 2,
      "member_type": "team"
    }
  ]
}
```

### Response Fields

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| id | string / UUID | Yes | Unique identifier for the team member. |
| name | string | Yes | Team member's name. |
| role | string | Yes | Role/title displayed on the website. |
| bio | string | No | Short biography or description. |
| photo_url | string | No | Profile photo URL. |
| linkedin_url | string | No | LinkedIn profile URL, if available. |
| display_order | integer | Yes | Controls the order in which team members are returned/displayed. |
| member_type | string | Yes | Semantic type/category of team member, such as leadership or team. |

## 5.1 member_type

The `member_type` field provides semantic information about the team member so that the frontend can apply different layouts or visual treatment where required.

- `leadership`
- `team`

For example, C-suite or other leadership members can use `member_type = leadership`, while normal team members can use `member_type = team`.

## Frontend Presentation Rule

The backend should provide semantic `member_type` rather than UI-specific fields such as `card_size`, `layout`, `width`, or styling.

```
member_type = "leadership"
  ↓
Frontend can render a larger / more prominent card

member_type = "team"
  ↓
Frontend can render a normal team card
```

This keeps presentation decisions in the frontend. The backend only communicates what category the team member belongs to.

## 5.2 display_order

The `display_order` field allows the backend/Admin Panel to control the intended ordering of team members. The frontend can render the members in the order returned by the API.

```
1 → CEO
2 → CTO
3 → Engineering Lead
4 → Designer
```

## 5.3 Visibility

The Admin Panel may control whether a team member is publicly visible. The internal visibility field should not be exposed as part of the public response. The backend should filter out non-visible team members and return only members intended for public display.

```
Admin Panel
  ↓
is_visible = true / false
  ↓
FastAPI
  ↓
GET /our-team
  ↓
Only publicly visible members
  ↓
Frontend
```

## 5.4 Public API Scope

Only one public endpoint is required at this stage: `GET /our-team`. A separate endpoint such as `GET /our-team/{id}` is not required because the public website does not currently need an individual team-member page.

# 6. Contact Us API

The Contact Us API is a POST API because the frontend submits new information to the backend rather than retrieving existing website content.

`POST /contact-us`

Accepts a new Contact Us form submission.

## 6.1 Request Body

Content-Type: application/json

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Company",
  "subject": "Website Development Inquiry",
  "message": "We would like to discuss building a new website for our company.",
  "source_page": "/"
}
```

## Request Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Name of the person submitting the form. |
| email | string | Yes | Email address of the person submitting the form. |
| company | string | No | Company or organization name. |
| subject | string | Yes | Subject or purpose of the inquiry. |
| message | string | Yes | Main message or inquiry submitted by the user. |
| source_page | string | Yes | Page from which the Contact Us form was submitted. |

## 6.2 source_page

The `source_page` field is included because the Contact Us form may be used on multiple pages of the website. It allows the backend/Admin Panel to identify where a submission originated.

- Homepage: `"source_page": "/"`
- Case Study page: `"source_page": "/case-studies/example-case-study"`
- Another website page: `"source_page": "/some-page"`

The current Contact Us form may be located on the homepage, in which case the value would be `/`. If the same form is later placed on another page, that page path can be submitted instead.

## 6.3 Backend-Managed Fields

The frontend should not send internal/admin-managed fields. These are created and managed by the backend:

- `id`
- `status`
- `submitted_at`
- `notes`
- `resolved_at`
- `resolved_by`

## 6.4 API Flow

```
User fills Contact Us form
  ↓
Frontend
  ↓
POST /contact-us
  ↓
FastAPI Backend
  ↓
Validate request
  ↓
Store contact submission
  ↓
Return response
```

## 6.5 Frontend Form Requirements

The frontend form should be designed around the request body defined above. The frontend is responsible for collecting the public submission fields and sending them in the expected JSON structure.

- name
- email
- company
- subject
- message
- source_page

The success response and validation/error response will be defined separately so the frontend knows exactly what to handle after submission.

# 7. Cross-API Frontend Implementation Notes

## 7.1 Slugs and Public URLs

Blogs, Case Studies, and Careers use a public `slug` to identify the resource in the website URL and retrieve the individual resource.

| Resource | Listing Endpoint | Individual / Submission Endpoint | URL Identifier |
| --- | --- | --- | --- |
| Blogs | GET /blogs | GET /blogs/{slug} | slug |
| Case Studies | GET /case-studies | GET /case-studies/{slug} | slug |
| Careers | GET /careers | GET /careers/{slug} | slug |
| Job Applications | - | POST /careers/{slug}/apply | job slug |

For job applications, the frontend does not need to know or submit the internal job UUID. The backend resolves the slug to the internal job record.

## 7.2 Lightweight Listing vs Complete Detail

The listing endpoints intentionally return only the fields needed for cards/list views and navigation. The individual endpoints return the complete page data, including structured content and page-level metadata where applicable.

```
Listing
  ↓
Cards / summaries
  ↓
User selects item
  ↓
Individual endpoint
  ↓
Complete page
```

## 7.3 Structured Content

Where a response contains a `content` object, the frontend should treat it as structured content rather than assuming it is one plain-text string. Blogs and Case Studies can contain rich content such as headings, paragraphs, lists, images, links, and other structured elements. Case Studies explicitly support video content represented through a video URL/reference.

## 7.4 SEO Metadata

For Blogs and Case Studies, the public individual-page response separates visible content from SEO/page metadata:

| Field | Purpose | Visible Article/Page Content |
| --- | --- | --- |
| title | Main visible page heading. | Yes |
| seo_title | HTML document/page title and relevant SEO metadata. | No |
| meta_description | Page meta description/search-engine description. | No |

The listing endpoints intentionally omit `seo_title` and `meta_description` because those fields are relevant to the individual page.

## 7.5 Backend-Managed vs Frontend-Submitted Data

The frontend should submit only the public form/application fields defined by each request contract. Internal IDs, status fields, timestamps, storage references, administrative notes, and resolution fields are backend-managed where specified.

# 8. Endpoint Quick Reference

| Method | Endpoint | Website Use |
| --- | --- | --- |
| GET | /blogs | Main Blogs page |
| GET | /blogs/{slug} | Individual Blog page |
| GET | /case-studies | Main Case Studies page |
| GET | /case-studies/{slug} | Individual Case Study page |
| GET | /careers | Current job openings |
| GET | /careers/{slug} | Individual Job page |
| POST | /careers/{slug}/apply | Submit Job Application |
| GET | /our-team | Our Team page |
| POST | /contact-us | Contact Us submission |

# 9. Contract Boundary

This master document is the consolidated public website frontend API reference. It describes what the frontend should send and receive for the website APIs. Internal Admin Panel implementation, database schema, editor/storage implementation, authentication details, and other backend internals remain separate unless explicitly represented in the public contract because they affect frontend behavior.
