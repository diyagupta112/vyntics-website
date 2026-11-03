import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BlogForm } from "@/features/blogs/components/blog-form";
import { CaseStudyForm } from "@/features/case-studies/components/case-study-form";
import { guidelines, GUIDELINES_PATH } from "../content-guidelines";
import { ContentGuide } from "./content-guide";
import { ContentGuidelinesPage } from "./content-guidelines-page";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/blogs/api/blogs", () => ({ blogsApi: { create: vi.fn(), update: vi.fn(), uploadContentImage: vi.fn() } }));
vi.mock("@/features/case-studies/api/case-studies", () => ({ caseStudiesApi: { create: vi.fn(), update: vi.fn(), uploadContentImage: vi.fn() } }));
// The real editor is covered by rich-text-editor.test.tsx; here it only proves the guide does not replace it.
vi.mock("@/components/forms/rich-text-editor", () => ({
  RichTextEditor: ({ id }: { id: string }) => <textarea aria-label="Content editor" id={id} />,
}));

describe("Content Guidelines page", () => {
  it("renders the introduction and every section", () => {
    render(<ContentGuidelinesPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Content Guidelines" })).toBeInTheDocument();
    for (const name of ["General Content Structure", "Blogs", "Case Studies", "Content Elements", "SEO and Summary Fields"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Back to Settings" })).toHaveAttribute("href", "/settings");
  });

  it("explains H1, H2 and H3 by hierarchy", () => {
    render(<ContentGuidelinesPage />);
    const headings = screen.getByRole("heading", { name: "Choosing Heading Levels" }).parentElement!;
    expect(within(headings).getByText(/^H1:/)).toBeInTheDocument();
    expect(within(headings).getByText(/^H2: a major section/)).toBeInTheDocument();
    expect(within(headings).getByText(/^H3: a subsection/)).toBeInTheDocument();
  });

  it("renders Blog and Case Study guidance, including the heading hierarchy example", () => {
    render(<ContentGuidelinesPage />);
    const blogs = screen.getByRole("region", { name: "Blogs" });
    expect(within(blogs).getByRole("heading", { name: "Structuring a Blog" })).toBeInTheDocument();
    const studies = screen.getByRole("region", { name: "Case Studies" });
    expect(within(studies).getByRole("heading", { name: "Structuring a Case Study" })).toBeInTheDocument();
    expect(within(studies).getByRole("list", { name: "Case Studies heading hierarchy example" })).toBeInTheDocument();
    expect(within(studies).getByText(/H2 is a major Case Study section/)).toBeInTheDocument();
  });

  it("explains each supported content element", () => {
    render(<ContentGuidelinesPage />);
    const elements = screen.getByRole("region", { name: "Content Elements" });
    for (const name of ["Paragraphs", "Lists", "Links", "Videos", "Body Images"]) {
      expect(within(elements).getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(within(elements).getByText(/Only YouTube is supported/)).toBeInTheDocument();
    expect(within(elements).getByText(/Every body image needs meaningful alt text/)).toBeInTheDocument();
    expect(within(elements).getByText(/separate from the Cover Image/)).toBeInTheDocument();
  });

  it("explains the search and summary fields", () => {
    render(<ContentGuidelinesPage />);
    const region = screen.getByRole("region", { name: "SEO and Summary Fields" });
    for (const label of [/^SEO title/, /^Meta description/, /^Excerpt/]) expect(within(region).getByText(label)).toBeInTheDocument();
  });
});

describe("ContentGuide", () => {
  it("shows the Blog quick guide from the shared source and links to the full guide", () => {
    render(<ContentGuide type="blog" />);
    for (const point of guidelines.types.blog.quick) expect(screen.getByText(point)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View full guidelines/ })).toHaveAttribute("href", GUIDELINES_PATH);
    expect(screen.queryByRole("list", { name: "Case Study heading hierarchy" })).not.toBeInTheDocument();
  });

  it("shows the Case Study quick guide with the heading hierarchy", () => {
    render(<ContentGuide type="caseStudy" />);
    expect(screen.getByText("Use H2 for major sections.")).toBeInTheDocument();
    expect(screen.getByText("Use H3 for subsections inside an H2 section.")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Case Study heading hierarchy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View full guidelines/ })).toHaveAttribute("href", GUIDELINES_PATH);
  });
});

describe("Editors with the guide", () => {
  it("keeps the Blog content editor next to the Blog guide", () => {
    render(<BlogForm />);
    expect(screen.getByTestId("content-guide")).toHaveTextContent("Blogs");
    expect(screen.getByLabelText(/^Content/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View full guidelines/ })).toHaveAttribute("href", GUIDELINES_PATH);
  });

  it("keeps the Case Study content editor next to the Case Study guide", () => {
    render(<CaseStudyForm />);
    expect(screen.getByTestId("content-guide")).toHaveTextContent("Case Studies");
    expect(screen.getByLabelText(/^Content/)).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Case Study heading hierarchy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View full guidelines/ })).toHaveAttribute("href", GUIDELINES_PATH);
  });
});
