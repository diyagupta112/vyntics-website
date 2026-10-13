import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyBlogForm } from "@/features/blogs/lib/blog-form";
import { PreviewDocument } from "./preview-document";
import { blogSnapshot } from "./snapshot";
const id = "7c202ddd-5ce5-4235-a85c-80d3bdbfd626";
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams({ instance: id }) }));
afterEach(() => vi.restoreAllMocks());
describe("Authenticated preview document receiver", () => {
  it("shows a useful empty state when opened without a parent snapshot", () => {
    render(<PreviewDocument />);
    expect(screen.getByRole("heading", { name: "No preview available" })).toBeInTheDocument();
  });
  it("handshakes, ignores invalid snapshots, and renders only the trusted parent's data", async () => {
    const parent = { postMessage: vi.fn() } as unknown as Window;
    vi.spyOn(window, "parent", "get").mockReturnValue(parent);
    render(<PreviewDocument />);
    expect(parent.postMessage).toHaveBeenCalledWith({ type: "vyntics-preview/ready", instanceId: id }, location.origin);
    const snapshot = blogSnapshot({ ...emptyBlogForm, title: "Unsaved from parent" });
    for (const [origin, source, data] of [["https://evil.test", parent, snapshot], [location.origin, window, snapshot], [location.origin, parent, {}]] as const) {
      fireEvent(window, new MessageEvent("message", { origin, source, data: { type: "vyntics-preview/snapshot", instanceId: id, snapshot: data } }));
    }
    expect(screen.queryByText("Unsaved from parent")).not.toBeInTheDocument();
    fireEvent(window, new MessageEvent("message", { origin: location.origin, source: parent, data: { type: "vyntics-preview/snapshot", instanceId: id, snapshot } }));
    expect(screen.getByRole("heading", { name: "Unsaved from parent" })).toBeInTheDocument();
    expect(screen.getByText("Not published")).toBeInTheDocument();
    await waitFor(() => expect(parent.postMessage).toHaveBeenCalledWith({ type: "vyntics-preview/rendered", instanceId: id }, location.origin));
    fireEvent.keyDown(screen.getByRole("heading", { name: "Unsaved from parent" }), { key: "Escape" });
    expect(parent.postMessage).toHaveBeenCalledWith({ type: "vyntics-preview/close", instanceId: id }, location.origin);
  });
});
