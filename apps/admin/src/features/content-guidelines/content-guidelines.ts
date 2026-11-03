/**
 * Single source for author-facing content guidelines. The Settings page and the editor
 * quick guides both read from here. Add a new content type by adding a key to `guidelines.types`.
 *
 * Only conventions established by the editor, the API contract or the public renderers are listed.
 * Not defined anywhere, so deliberately absent: required section names, length or word limits,
 * SEO title or meta description length limits.
 */

export const GUIDELINES_PATH = "/settings/content-guidelines";

export type GuidelineSection = { id: string; title: string; intro?: string; points: string[] };
export type HierarchyRow = { label: string; text: string; depth: 0 | 1 | 2 };
export type ContentTypeGuideline = {
  id: "blog" | "caseStudy";
  title: string;
  intro: string;
  /** Short bullets shown beside the editor. */
  quick: string[];
  sections: GuidelineSection[];
  /** Neutral example of the heading hierarchy, with placeholder text only. */
  example: HierarchyRow[];
};

const sharedQuick = [
  "Use H2 for major sections.",
  "Use H3 for subsections inside an H2 section.",
  "Leave H1 to the title, which is already shown as the page heading.",
  "Write body text as normal paragraphs.",
  "Use images for diagrams, screenshots and other supporting visuals, each with meaningful alt text.",
  "Use a YouTube video when it adds useful context.",
];

const hierarchyExample: HierarchyRow[] = [
  { label: "H2", text: "Section title", depth: 0 },
  { label: "Paragraph", text: "Text that explains this section.", depth: 1 },
  { label: "H2", text: "Another section title", depth: 0 },
  { label: "H3", text: "Subsection title", depth: 1 },
  { label: "Paragraph", text: "Text that explains this subsection.", depth: 2 },
  { label: "H3", text: "Another subsection title", depth: 1 },
  { label: "Paragraph", text: "Text that explains this subsection.", depth: 2 },
];

export const guidelines = {
  title: "Content Guidelines",
  description: "How to write and structure Blogs and Case Studies in the content editor.",
  intro:
    "These guidelines help you structure content consistently. They describe the conventions the Admin Panel and the website already follow. Where something is not a fixed rule, this page says so.",

  general: {
    id: "general",
    title: "General Content Structure",
    intro: "Blogs and Case Studies use the same content editor.",
    points: [
      "The title you enter is shown on the website as the main page heading. Your content starts below it.",
      "Build the content as a series of sections. Start each major section with an H2 heading.",
      "Use the toolbar to switch between Paragraph, H1, H2 and H3, and to add bold or italic text, an image, a video, a link, or a list.",
      "Choose a heading level for the role the text plays in the structure, not for how large it looks.",
      "Content can contain several images and videos, placed anywhere between text.",
      "Undo and Redo in the toolbar reverse your recent changes.",
      "There are no required section names and no fixed length. Structure the content to suit the topic.",
    ],
  } satisfies GuidelineSection,

  headings: {
    id: "headings",
    title: "Choosing Heading Levels",
    intro: "Headings describe how your content is organized. Pick the level that matches the hierarchy.",
    points: [
      "H1: the main heading of the whole page. This is your title, and the website shows it for you. Avoid adding another H1 inside the content. The editor does not block it, so this is a recommendation, not an enforced rule.",
      "H2: a major section of the content. Every main topic you cover gets its own H2.",
      "H3: a subsection that belongs to the H2 above it. Use it only when an H2 section needs to be broken into parts.",
      "Do not pick a heading because it looks bigger or smaller. If the text is only a normal sentence or paragraph, use Paragraph.",
    ],
  } satisfies GuidelineSection,

  elements: [
    {
      id: "paragraphs",
      title: "Paragraphs",
      points: ["Use Paragraph for normal explanatory text. Bold and italic can add emphasis inside a paragraph."],
    },
    {
      id: "lists",
      title: "Lists",
      points: [
        "Use a bulleted list for a group of related points that have no set order.",
        "Use a numbered list when the order matters, such as steps.",
      ],
    },
    {
      id: "links",
      title: "Links",
      points: [
        "Select the text, choose Link, then enter the full URL. Clear the URL and confirm to remove a link.",
        "Pasted web addresses do not turn into links automatically, so add the link yourself.",
      ],
    },
    {
      id: "videos",
      title: "Videos",
      points: [
        "Use a video when it adds useful context to the surrounding text.",
        "Choose Video and paste a YouTube link. Only YouTube is supported. Watch, youtu.be, embed and Shorts links are accepted.",
        "The video is added as its own element at the cursor, so it can sit anywhere in the content. Select it and choose Video again to change the link.",
      ],
    },
    {
      id: "images",
      title: "Body Images",
      intro: "Body images appear inside the content. They are separate from the Cover Image, which is managed on its own.",
      points: [
        "Use body images for architecture diagrams, system diagrams, workflow diagrams, screenshots, charts and technical illustrations.",
        "An image can sit between text sections, and you can add several.",
        "Choose images that support or explain the text around them.",
        "Every body image needs meaningful alt text, up to 300 characters. Describe what the image shows so people who cannot see it still understand it.",
        "Images must be JPEG, PNG or WebP files of 10 MB or less.",
        "Body images can be added once the item has been created. If you are creating a new item, save the first step, then go back to add images.",
      ],
    },
  ] satisfies GuidelineSection[],

  metadata: {
    id: "metadata",
    title: "SEO and Summary Fields",
    intro: "These fields are required for both Blogs and Case Studies. They are not part of the content editor.",
    points: [
      "SEO title: the title used for the browser tab and search results. It is not shown inside the content.",
      "Meta description: the description search engines may show under the title. It is not shown inside the content.",
      "Excerpt: a short summary of the Blog or Case Study.",
      "No length limits are set for these fields, so none are listed here.",
    ],
  } satisfies GuidelineSection,

  types: {
    blog: {
      id: "blog",
      title: "Blogs",
      intro: "A Blog is an article. Its title is the page heading, and the content is organized into sections below it.",
      quick: sharedQuick,
      example: hierarchyExample,
      sections: [
        {
          id: "blog-structure",
          title: "Structuring a Blog",
          points: [
            "Divide the article into sections, each starting with an H2 heading.",
            "Use H3 only when a section covers several distinct parts.",
            "Write each section as paragraphs, and use lists for steps or grouped points.",
            "Add images and videos where they help explain the text next to them.",
          ],
        },
        {
          id: "blog-fields",
          title: "Other Blog fields",
          points: ["Author, category and read time (a whole number of minutes) are required, along with the excerpt and the search fields."],
        },
      ],
    },
    caseStudy: {
      id: "caseStudy",
      title: "Case Studies",
      intro: "A Case Study describes a project. The title is the page heading, and the content is organized into sections below it.",
      quick: sharedQuick,
      example: hierarchyExample,
      sections: [
        {
          id: "case-study-structure",
          title: "Structuring a Case Study",
          intro: "On the website, each H2 heading becomes a step in the Case Study section navigation, in the order you write them.",
          points: [
            "H2 is a major Case Study section. Keep H2 titles short and meaningful, because readers see them as navigation.",
            "H3 is a subsection inside an H2 section.",
            "Paragraph is the normal explanatory text under a heading.",
            "Write sections in the order readers should follow them. Section names are up to you.",
          ],
        },
        {
          id: "case-study-fields",
          title: "Other Case Study fields",
          points: ["Client name is required, along with the excerpt and the search fields. Tech stack and tags are optional lists separated by commas."],
        },
      ],
    },
  } satisfies Record<string, ContentTypeGuideline>,
};

export type GuidelineType = keyof typeof guidelines.types;
