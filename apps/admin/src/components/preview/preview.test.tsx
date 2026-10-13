import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyBlogForm } from "@/features/blogs/lib/blog-form";
import { emptyCaseStudyForm } from "@/features/case-studies/lib/case-study-form";
import { blogSnapshot, caseStudySnapshot } from "./snapshot";
import { trustedMessage } from "./messages";
import { PreviewDialog } from "./preview-dialog";
import { PreviewAction } from "./preview-action";
import { BlogPreview } from "./blog-preview";
import { CaseStudyPreview } from "./case-study-preview";
const id = "7c202ddd-5ce5-4235-a85c-80d3bdbfd626";
const snapshot = blogSnapshot({ ...emptyBlogForm, title: "Unsaved title" });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
function message(frame: HTMLIFrameElement, type: string, extra = {}) {
  fireEvent(window, new MessageEvent("message", { origin: window.location.origin, source: frame.contentWindow, data: { type, instanceId: id, ...extra } }));
}
describe("Preview messaging and dialog", () => {
  it("only sends data after a trusted ready handshake and restores focus on close", async () => {
    const { rerender } = render(<button>Preview trigger</button>);
    const trigger = screen.getByRole("button"); trigger.focus();
    const close = vi.fn();
    rerender(<><button>Preview trigger</button><PreviewDialog snapshot={snapshot} instanceId={id} onClose={close} /></>);
    expect(screen.getByRole("dialog", { name: "Blog Preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close Preview" })).toHaveFocus();
    const frame = screen.getByTitle("Blog page preview") as HTMLIFrameElement;
    const post = vi.spyOn(frame.contentWindow!, "postMessage");
    fireEvent.load(frame);
    expect(post).not.toHaveBeenCalled();
    fireEvent(window, new MessageEvent("message", { origin: "https://evil.test", source: frame.contentWindow, data: { type: "vyntics-preview/ready", instanceId: id } }));
    message(frame, "vyntics-preview/ready", { instanceId: "wrong-instance" });
    expect(post).not.toHaveBeenCalled();
    message(frame, "vyntics-preview/ready");
    expect(post).toHaveBeenCalledWith({ type: "vyntics-preview/snapshot", instanceId: id, snapshot }, window.location.origin);
    message(frame, "vyntics-preview/rendered");
    expect(screen.queryByText("Loading Preview…")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close Preview" }));
    expect(close).toHaveBeenCalledOnce();
    rerender(<button>Preview trigger</button>);
    expect(screen.getByRole("button")).toHaveFocus();
  });
  it("rejects malformed messages, unrelated sources, and mismatched IDs", () => {
    const source = window;
    const data = { type: "vyntics-preview/snapshot", instanceId: id, snapshot };
    expect(trustedMessage(new MessageEvent("message", { source, origin: location.origin, data }), source, location.origin, id)).toBe(true);
    for (const invalid of [{ ...data, snapshot: {} }, { ...data, type: "unknown" }, { ...data, instanceId: "wrong" }, null]) expect(trustedMessage(new MessageEvent("message", { source, origin: location.origin, data: invalid }), source, location.origin, id)).toBe(false);
    expect(trustedMessage(new MessageEvent("message", { origin: location.origin, data }), source, location.origin, id)).toBe(false);
  });
  it("shows a retryable handshake timeout", () => {
    vi.useFakeTimers(); render(<PreviewDialog snapshot={snapshot} instanceId={id} onClose={vi.fn()} />);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("alert")).toHaveTextContent("Preview could not be loaded");
    fireEvent.click(screen.getByRole("button", { name: "Retry Preview" }));
    expect(screen.getByText("Loading Preview…")).toBeInTheDocument();
  });
  it("opening and closing Preview does not submit its parent form or change values", () => {
    const submit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<form onSubmit={submit}><input aria-label="Draft title" defaultValue="Keep this" /><PreviewAction build={() => snapshot} /></form>);
    fireEvent.change(screen.getByLabelText("Draft title"), { target: { value: "Unsaved" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    fireEvent.click(screen.getByRole("button", { name: "Close Preview" }));
    expect(submit).not.toHaveBeenCalled(); expect(screen.getByLabelText("Draft title")).toHaveValue("Unsaved");
  });
  it("reports malformed JSON without opening a dialog", () => {
    render(<PreviewAction build={() => blogSnapshot({ ...emptyBlogForm, content: "invalid" })} />);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.getByRole("alert")).toHaveTextContent("invalid JSON");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
describe("Public presentation parity", () => {
  it("shows draft metadata and current Blog public heading/mark/video limitations", () => {
    render(<BlogPreview snapshot={blogSnapshot({ ...emptyBlogForm, author: "Author", title: "New title", category: "AI", excerpt: "Excerpt", readTime: "3", content: JSON.stringify({ type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Heading" }] }, { type: "paragraph", content: [{ type: "text", text: "Bold text", marks: [{ type: "bold" }] }] }, { type: "video", attrs: { provider: "youtube", video_id: "dQw4w9WgXcQ" } }] }) })} />);
    expect(screen.getByText("Not published")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("Bold text").closest("strong")).toBeNull();
    expect(document.querySelector("iframe")).toBeNull();
  });
  it("renders Case Study hero, authored headings/marks, timeline, and technology", async () => {
    const content = { type: "doc", content: [{ type: "video", attrs: { provider: "youtube", video_id: "dQw4w9WgXcQ" } }, { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Challenge" }] }, { type: "paragraph", content: [{ type: "text", text: "Strong", marks: [{ type: "bold" }] }] }] };
    render(<CaseStudyPreview instanceId={id} snapshot={caseStudySnapshot({ ...emptyCaseStudyForm, title: "Work", clientName: "Client", tags: "AI, RAG", techStack: "Python, FastAPI", content: JSON.stringify(content) })} />);
    expect(screen.getByTitle("Work product demonstration")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(screen.getByText("Strong").closest("strong")).not.toBeNull();
    expect(screen.getByText("AI, RAG")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Challenge" })).toHaveAttribute("href", `#preview-${id}-0`);
    await waitFor(() => expect(document.querySelectorAll("iframe")).toHaveLength(1));
  });
});
