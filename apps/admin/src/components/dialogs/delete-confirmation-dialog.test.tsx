import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

describe("DeleteConfirmationDialog", () => {
  it("identifies the resource, cancels safely, and requires explicit permanent deletion", () => {
    const onCancel = vi.fn(); const onConfirm = vi.fn();
    render(<DeleteConfirmationDialog busy={false} itemName="Example Blog" onCancel={onCancel} onConfirm={onConfirm} resourceLabel="Blog" />);
    const dialog = screen.getByRole("dialog", { name: "Delete Blog?" });
    expect(dialog).toHaveTextContent("permanently delete “Example Blog”");
    expect(dialog).toHaveTextContent("cannot be undone");
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("disables both actions and displays errors while deletion is busy", () => {
    render(<DeleteConfirmationDialog busy error="Deletion failed." itemName="Example" onCancel={vi.fn()} onConfirm={vi.fn()} resourceLabel="Career" />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Deletion failed.");
  });
});
