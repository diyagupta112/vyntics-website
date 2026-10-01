import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompactImagePreview } from "./compact-image-preview";

vi.mock("next/image", () => ({ default: "img" }));

describe("CompactImagePreview", () => {
  it("renders a compact empty state without an image action", () => {
    render(
      <CompactImagePreview
        alt="Cover for Example"
        emptyText="No cover image uploaded"
        imageUrl={null}
        label="Blog cover image"
      />,
    );

    expect(screen.getByText("No cover image uploaded")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View Blog cover image" })).not.toBeInTheDocument();
  });

  it("opens an accessible viewer and closes it with its close action", () => {
    render(
      <CompactImagePreview
        alt="Cover for Example"
        emptyText="No cover image uploaded"
        imageUrl="https://example.com/cover.jpg"
        label="Blog cover image"
      />,
    );

    const trigger = screen.getByRole("button", { name: "View Blog cover image" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog", { name: "Blog cover image" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close image viewer" })).toHaveFocus();
    expect(screen.getAllByAltText("Cover for Example")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and restores focus to the preview", () => {
    render(
      <CompactImagePreview
        alt="Photo of Ada"
        emptyText="No photo uploaded"
        imageUrl="https://example.com/ada.jpg"
        label="Team Member photo"
      />,
    );

    const trigger = screen.getByRole("button", { name: "View Team Member photo" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
