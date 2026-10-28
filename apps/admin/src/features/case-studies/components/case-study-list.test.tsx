import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { caseStudiesApi } from "../api/case-studies";
import type { CaseStudy } from "../types";
import { CaseStudyList } from "./case-study-list";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/case-studies", () => ({
  caseStudiesApi: { list: vi.fn(), delete: vi.fn() },
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
  tags: ["API"],
  content: { type: "doc" },
  featured: false,
  status: "published",
  published_at: "2026-09-28T00:00:00Z",
  created_at: "2026-09-28T00:00:00Z",
  updated_at: "2026-09-28T00:00:00Z",
};

describe("CaseStudyList", () => {
  beforeEach(() => vi.clearAllMocks());
  it("opens saved-card Preview without following the edit link and restores focus", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValue([caseStudy]);
    const cardClick = vi.fn();
    render(<div onClick={cardClick}><CaseStudyList /></div>);
    const preview = await screen.findByRole("button", { name: `Preview ${caseStudy.title}` });
    const edit = screen.getByRole("link", { name: `Edit ${caseStudy.title}` });
    expect(edit).toHaveAttribute("href", "/case-studies/1/edit");
    expect(edit).not.toContainElement(preview);
    const navigation = vi.fn((event: Event) => event.preventDefault());
    edit.addEventListener("click", navigation);
    preview.focus();
    fireEvent.click(preview);
    expect(navigation).not.toHaveBeenCalled();
    expect(cardClick).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Case Study Preview" })).toBeInTheDocument();
    expect(screen.getByText("Saved record preview · no changes are made")).toBeInTheDocument();
    const frame = screen.getByTitle("Case Study page preview") as HTMLIFrameElement;
    const instanceId = new URL(frame.src).searchParams.get("instance");
    const post = vi.spyOn(frame.contentWindow!, "postMessage");
    fireEvent(window, new MessageEvent("message", { source: frame.contentWindow, origin: location.origin, data: { type: "vyntics-preview/ready", instanceId } }));
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ snapshot: expect.objectContaining({ title: caseStudy.title, content: caseStudy.content, cover: caseStudy.cover_image_url }) }), location.origin);
    fireEvent.click(screen.getByRole("button", { name: "Close Preview" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(preview).toHaveFocus();
    fireEvent.click(edit);
    expect(navigation).toHaveBeenCalledOnce();
    expect(caseStudiesApi.delete).not.toHaveBeenCalled();
  });


  it("shows loading then renders an image-led Case Study record", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValue([caseStudy]);
    render(<CaseStudyList />);
    expect(
      screen.getByRole("status", { name: "Loading Case Studies" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Platform redesign")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Cover for Platform redesign" }),
    ).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByText("Example Client")).toBeInTheDocument();
    expect(screen.queryByText("A concise result summary.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Platform redesign" })).toHaveAttribute(
      "href",
      "/case-studies/1/edit",
    );
    expect(
      screen.getByRole("button", { name: "Delete Platform redesign" }).className,
    ).toMatch(/destructive/);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders the empty state", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValue([]);
    render(<CaseStudyList />);
    expect(await screen.findByText("No Case Studies yet")).toBeInTheDocument();
  });

  it.each([
    ["authentication", "session has expired"],
    ["permission", "permission to manage Case Studies"],
    ["network", "backend could not be reached"],
  ] as const)("renders safe %s errors", async (kind, expected) => {
    vi.mocked(caseStudiesApi.list).mockRejectedValue(
      new ApiError({ kind, message: "safe" }),
    );
    render(<CaseStudyList />);
    expect(await screen.findByText(new RegExp(expected, "i"))).toBeInTheDocument();
  });

  it("confirms and completes permanent deletion", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValue([caseStudy]);
    vi.mocked(caseStudiesApi.delete).mockResolvedValue(undefined);
    render(<CaseStudyList />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Platform redesign" }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("permanently delete");
    fireEvent.click(
      screen.getByRole("button", { name: "Delete Permanently" }),
    );
    await waitFor(() => expect(caseStudiesApi.delete).toHaveBeenCalledWith("1"));
    await waitFor(() =>
      expect(screen.queryByText("Platform redesign")).not.toBeInTheDocument(),
    );
  });

  it("keeps the confirmation open when deletion fails", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValue([caseStudy]);
    vi.mocked(caseStudiesApi.delete).mockRejectedValue(
      new ApiError({ kind: "service_unavailable", message: "safe" }),
    );
    render(<CaseStudyList />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Platform redesign" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete Permanently" }),
    );
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("CaseStudyList service filters", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requests the backend with service and sub-service, never a sub-service alone, and clears an incompatible one", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValue([]);
    render(<CaseStudyList />);
    await waitFor(() => expect(caseStudiesApi.list).toHaveBeenLastCalledWith({ service: "", subService: "" }));
    expect(screen.getByLabelText("Sub-service")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Service"), { target: { value: "ai_solutions" } });
    await waitFor(() => expect(caseStudiesApi.list).toHaveBeenLastCalledWith({ service: "ai_solutions", subService: "" }));
    expect(within(screen.getByLabelText("Sub-service")).queryByRole("option", { name: "Cloud Cost Optimization" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Sub-service"), { target: { value: "rag_knowledge_assistants" } });
    await waitFor(() => expect(caseStudiesApi.list).toHaveBeenLastCalledWith({ service: "ai_solutions", subService: "rag_knowledge_assistants" }));
    expect(await screen.findByText("No Case Studies match this filter")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Service"), { target: { value: "data_engineering" } });
    await waitFor(() => expect(caseStudiesApi.list).toHaveBeenLastCalledWith({ service: "data_engineering", subService: "" }));
    expect(screen.getByLabelText("Sub-service")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("Service"), { target: { value: "" } });
    await waitFor(() => expect(caseStudiesApi.list).toHaveBeenLastCalledWith({ service: "", subService: "" }));
    expect(screen.getByLabelText("Sub-service")).toBeDisabled();
  });
  it("shows records returned for a membership filter and keeps the filter on an empty result", async () => {
    vi.mocked(caseStudiesApi.list).mockResolvedValueOnce([]).mockResolvedValueOnce([{ ...caseStudy, related_services: ["ai_solutions", "data_engineering"] }]);
    render(<CaseStudyList />);
    fireEvent.change(await screen.findByLabelText("Service"), { target: { value: "data_engineering" } });
    expect(await screen.findByRole("heading", { name: caseStudy.title })).toBeInTheDocument();
    expect(screen.getByLabelText("Service")).toHaveValue("data_engineering");
  });
});
