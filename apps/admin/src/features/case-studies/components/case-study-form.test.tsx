import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CaseStudyForm } from "./case-study-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/case-studies", () => ({
  caseStudiesApi: { create: vi.fn(), update: vi.fn() },
}));

const caseStudy: CaseStudy = { related_services: [], related_sub_services: [],
  id: "1",
  slug: "platform-redesign",
  title: "Platform redesign",
  seo_title: "Platform redesign | Vyntics",
  meta_description: "Metadata",
  client_name: "Example Client",
  excerpt: "A concise result summary.",
  cover_image_url: "https://example.com/cover.jpg",
  tech_stack: ["Python", "FastAPI"],
  tags: ["API", "Engineering"],
  content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Existing case study body" }] }] },
  featured: false,
  status: "draft",
  published_at: null,
  created_at: "2026-09-28T00:00:00Z",
  updated_at: "2026-09-28T00:00:00Z",
};

describe("CaseStudyForm", () => {
  beforeEach(() => vi.clearAllMocks());
  it("previews current unsaved values without any API mutation", () => {
    render(<CaseStudyForm />);
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Unsaved preview title" } });
    fireEvent.click(screen.getByLabelText("Cloud Foundations"));
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = screen.getByTitle("Case Study page preview") as HTMLIFrameElement;
    const instanceId = new URL(frame.src).searchParams.get("instance");
    const post = vi.spyOn(frame.contentWindow!, "postMessage");
    fireEvent(window, new MessageEvent("message", { source: frame.contentWindow, origin: window.location.origin, data: { type: "vyntics-preview/ready", instanceId } }));
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ snapshot: expect.objectContaining({ type: "case-study", title: "Unsaved preview title", related_services: ["cloud_foundations"], featured: false }) }), window.location.origin);
    expect(caseStudiesApi.create).not.toHaveBeenCalled();
    expect(caseStudiesApi.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Close Preview" }));
    expect(screen.getByLabelText(/^Title/)).toHaveValue("Unsaved preview title");
  });


  it.each([false, true])("loads featured=%s and sends its changed value on edit", async (featured) => {
    vi.mocked(caseStudiesApi.update).mockResolvedValue({ ...caseStudy, featured: !featured });
    render(<CaseStudyForm caseStudy={{ ...caseStudy, featured: featured }} />);
    const checkbox = screen.getByRole("checkbox", { name: "Feature this case study on the website" });
    expect(checkbox).toHaveProperty("checked", featured);
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalledWith("1", expect.objectContaining({ featured: !featured })));
  });

  it("displays the backend featured limit and preserves form state", async () => {
    const message = "Maximum of 5 featured case studies allowed.";
    vi.mocked(caseStudiesApi.update).mockRejectedValue(new ApiError({ kind: "validation", status: 422, message }));
    render(<CaseStudyForm caseStudy={caseStudy} />);
    const checkbox = screen.getByRole("checkbox", { name: "Feature this case study on the website" });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText(/^Title/)).toHaveValue(caseStudy.title);
  });


  it("shows required-field validation", () => {
    render(<CaseStudyForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create Case Study" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Client name is required.")).toBeInTheDocument();
    expect(caseStudiesApi.create).not.toHaveBeenCalled();
  });

  it.each([[false, []], [true, []], [false, ["cloud_foundations"]], [false, ["cloud_foundations", "data_engineering"]], [true, ["ai_solutions", "crm_revenue_ops", "analytics_bi"]]] as const)("creates with featured=%s and moves to edit", async (featured, target) => {
    vi.mocked(caseStudiesApi.create).mockResolvedValue(caseStudy);
    render(<CaseStudyForm />);
    const values: Record<string, string> = {
      caseStudyTitle: "Platform redesign",
      caseStudySlug: "platform-redesign",
      caseStudyClientName: "Example Client",
      caseStudyExcerpt: "A concise result summary.",
      caseStudySeoTitle: "Platform redesign | Vyntics",
      caseStudyMetaDescription: "Metadata",
      caseStudyTechStack: "Python, FastAPI",
      caseStudyTags: "API, Engineering",
    };
    for (const [id, value] of Object.entries(values)) {
      fireEvent.change(document.getElementById(id)!, { target: { value } });
    }
    const checkbox = screen.getByRole("checkbox", { name: "Feature this case study on the website" });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    if (!featured) fireEvent.click(checkbox);
    for (const service of target) fireEvent.click(document.getElementById(`case-study-service-${service}`)!);
    fireEvent.click(screen.getByRole("button", { name: "Create Case Study" }));
    await waitFor(() => expect(caseStudiesApi.create).toHaveBeenCalled());
    expect(caseStudiesApi.create).toHaveBeenCalledWith(expect.objectContaining({ featured: featured }));
    expect(caseStudiesApi.create).toHaveBeenCalledWith(expect.objectContaining({ related_services: target, related_sub_services: [] }));
    expect(vi.mocked(caseStudiesApi.create).mock.calls[0]![0]).not.toHaveProperty("related_service");
    expect(push).toHaveBeenCalledWith("/case-studies/1/edit?created=1");
  });

  it("populates fields and saves status changes", async () => {
    vi.mocked(caseStudiesApi.update).mockResolvedValue({
      ...caseStudy,
      status: "published",
    });
    render(<CaseStudyForm caseStudy={caseStudy} />);
    expect(screen.getByLabelText(/^Title/)).toHaveValue("Platform redesign");
    expect(
      screen.getByRole("textbox", { name: "Tech stack" }),
    ).toHaveValue("Python, FastAPI");
    expect(screen.getByRole("textbox", { name: "Case Study content editor" })).toHaveTextContent("Existing case study body");
    expect(screen.queryByText("Structured content (JSON)")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Status/), {
      target: { value: "published" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() =>
      expect(caseStudiesApi.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ status: "published", content: caseStudy.content }),
      ),
    );
    expect(await screen.findByText("Case Study changes saved.")).toBeInTheDocument();
  });

  it.each([
    ["validation", "Backend says invalid"],
    ["permission", "permission"],
    ["service_unavailable", "temporarily unavailable"],
    ["network", "could not be reached"],
  ] as const)("shows safe %s save failures", async (kind, expected) => {
    vi.mocked(caseStudiesApi.update).mockRejectedValue(
      new ApiError({
        kind,
        message: kind === "validation" ? "Backend says invalid" : "safe",
      }),
    );
    render(<CaseStudyForm caseStudy={caseStudy} />);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalled());
    expect(await screen.findByText(new RegExp(expected, "i"))).toBeInTheDocument();
  });

  it("prevents duplicate save submission while pending", async () => {
    vi.mocked(caseStudiesApi.update).mockReturnValue(new Promise(() => {}));
    render(<CaseStudyForm caseStudy={caseStudy} />);
    const button = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(button);
    expect(await screen.findByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
    expect(caseStudiesApi.update).toHaveBeenCalledTimes(1);
  });
});


describe("Content slug and service targeting", () => {
  beforeEach(() => vi.clearAllMocks());

  it("generates a slug until the admin manually changes it", () => {
    render(<CaseStudyForm />);
    const title = document.getElementById("caseStudyTitle")!;
    const slug = document.getElementById("caseStudySlug")!;
    fireEvent.change(title, { target: { value: "How We Helped ABC" } });
    expect(slug).toHaveValue("how-we-helped-abc");
    fireEvent.change(title, { target: { value: "How We Helped XYZ" } });
    expect(slug).toHaveValue("how-we-helped-xyz");
    fireEvent.change(slug, { target: { value: "custom-public-url" } });
    fireEvent.change(title, { target: { value: "Another title" } });
    expect(slug).toHaveValue("custom-public-url");
  });

  it("keeps an existing slug stable on title edits and allows manual editing", () => {
    render(<CaseStudyForm caseStudy={caseStudy} />);
    const title = document.getElementById("caseStudyTitle")!;
    const slug = document.getElementById("caseStudySlug")!;
    expect(slug).toHaveValue(caseStudy.slug);
    fireEvent.change(title, { target: { value: "Changed title" } });
    expect(slug).toHaveValue(caseStudy.slug);
    fireEvent.change(slug, { target: { value: "changed-manually" } });
    expect(slug).toHaveValue("changed-manually");
  });

  it("defaults to no targeting and does not offer All Services", () => {
    render(<CaseStudyForm />);
    expect(screen.getAllByRole("checkbox").filter((box) => box.id.startsWith("case-study-service-"))).toHaveLength(5);
    expect(screen.queryByLabelText("All Services")).not.toBeInTheDocument();
    expect(screen.getByText("No sub-services selected.")).toBeInTheDocument();
  });

  it("hydrates existing services and sub-services, including unknown keys", () => {
    render(<CaseStudyForm caseStudy={{ ...caseStudy, related_services: ["cloud_foundations", "data_engineering"], related_sub_services: ["cloud_cost_optimization", "legacy_custom_key"] }} />);
    expect(screen.getByLabelText("Cloud Foundations")).toBeChecked();
    expect(screen.getByLabelText("Data Engineering")).toBeChecked();
    expect(screen.getByLabelText("Analytics & BI")).not.toBeChecked();
    expect(screen.getByLabelText("Cloud Cost Optimization")).toBeChecked();
    expect(screen.getByRole("button", { name: "Remove Legacy Custom Key" })).toBeInTheDocument();
  });

  it("shows only the selected services' sub-services and keeps selected ones", () => {
    render(<CaseStudyForm />);
    expect(screen.getByLabelText("AI Agents")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Analytics & BI"));
    expect(screen.queryByLabelText("AI Agents")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("BI Consulting"));
    fireEvent.click(screen.getByLabelText("Analytics & BI"));
    fireEvent.click(screen.getByLabelText("AI Solutions"));
    expect(screen.getByLabelText("BI Consulting")).toBeChecked();
  });

  it("edits selections, preserves unknown sub-services, and PATCHes arrays only", async () => {
    vi.mocked(caseStudiesApi.update).mockResolvedValue(caseStudy);
    render(<CaseStudyForm caseStudy={{ ...caseStudy, related_services: ["data_engineering"], related_sub_services: ["legacy_custom_key"] }} />);
    fireEvent.click(screen.getByLabelText("Cloud Foundations"));
    fireEvent.click(screen.getByLabelText("Cloud Cost Optimization"));
    fireEvent.click(screen.getByRole("button", { name: "Remove Data Engineering" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalled());
    const payload = vi.mocked(caseStudiesApi.update).mock.calls[0]![1];
    expect(payload).toMatchObject({ related_services: ["cloud_foundations"], related_sub_services: ["legacy_custom_key", "cloud_cost_optimization"] });
    expect(payload).not.toHaveProperty("related_service");
  });

  it("sends empty arrays when all selections are cleared", async () => {
    vi.mocked(caseStudiesApi.update).mockResolvedValue(caseStudy);
    render(<CaseStudyForm caseStudy={{ ...caseStudy, related_services: ["ai_solutions"], related_sub_services: ["ai_agents"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove AI Solutions" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove AI Agents" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(caseStudiesApi.update).toHaveBeenCalled());
    expect(vi.mocked(caseStudiesApi.update).mock.calls[0]![1]).toMatchObject({ related_services: [], related_sub_services: [] });
  });

  it("shows backend 422 targeting errors without resubmitting", async () => {
    vi.mocked(caseStudiesApi.update).mockRejectedValue(new ApiError({ kind: "validation", status: 422, message: "Invalid input.", validationIssues: [{ location: ["body", "related_services", 0], message: "Unsupported service.", type: "value_error" }] }));
    render(<CaseStudyForm caseStudy={{ ...caseStudy, related_services: ["cloud_foundations"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(await screen.findByText("Unsupported service.")).toBeInTheDocument();
    expect(caseStudiesApi.update).toHaveBeenCalledTimes(1);
  });
});
