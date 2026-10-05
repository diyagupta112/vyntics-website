import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { badgesApi } from "../api/badges";
import { badgeFixture } from "../test-fixtures";
import { BadgeEditor } from "./badge-editor";
import { LogoControl, validateBadgeLogo } from "./logo-control";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/badges", () => ({ badgesApi: { get: vi.fn(), update: vi.fn(), delete: vi.fn(), uploadLogo: vi.fn(), deleteLogo: vi.fn() } }));

describe("Badge management", () => {
  beforeEach(() => vi.clearAllMocks());
  it("loads populated fields and saves metadata", async () => {
    vi.mocked(badgesApi.get).mockResolvedValue(badgeFixture);
    vi.mocked(badgesApi.update).mockResolvedValue({ ...badgeFixture, display_order: 7, is_active: false });
    render(<BadgeEditor badgeId={badgeFixture.id} />);
    expect(screen.getByRole("status", { name: "Loading Badge" })).toBeInTheDocument();
    expect(await screen.findByDisplayValue(badgeFixture.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(badgeFixture.description!)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText(/^Active/), { target: { value: "false" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(badgesApi.update).toHaveBeenCalledWith(badgeFixture.id, expect.objectContaining({ display_order: 7, is_active: false })));
    expect(await screen.findByText("Badge changes saved.")).toBeInTheDocument();
  });
  it("replaces and removes the managed logo", async () => {
    vi.mocked(badgesApi.uploadLogo).mockResolvedValue({ ...badgeFixture, logo_url: "https://example.com/replaced.webp" });
    vi.mocked(badgesApi.deleteLogo).mockResolvedValue(undefined);
    const onChanged = vi.fn();
    const { rerender } = render(<LogoControl badge={badgeFixture} onChanged={onChanged} />);
    const file = new File(["image"], "logo.webp", { type: "image/webp" });
    fireEvent.change(screen.getByLabelText("Choose Badge logo"), { target: { files: [file] } });
    await waitFor(() => expect(badgesApi.uploadLogo).toHaveBeenCalledWith(badgeFixture.id, file));
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ logo_url: "https://example.com/replaced.webp" }));
    rerender(<LogoControl badge={badgeFixture} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Logo" }));
    await waitFor(() => expect(badgesApi.deleteLogo).toHaveBeenCalledWith(badgeFixture.id));
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ logo_url: null }));
  });
  it("requires confirmation before permanent deletion", async () => {
    vi.mocked(badgesApi.get).mockResolvedValue(badgeFixture);
    vi.mocked(badgesApi.delete).mockResolvedValue(undefined);
    render(<BadgeEditor badgeId={badgeFixture.id} />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete Permanently" }));
    let dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("managed logo");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(badgesApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(badgesApi.delete).toHaveBeenCalledWith(badgeFixture.id));
    expect(push).toHaveBeenCalledWith("/badges?deleted=1");
  });
  it("shows safe edit loading and mutation errors", async () => {
    vi.mocked(badgesApi.get).mockRejectedValue(new ApiError({ kind: "not_found", message: "secret" }));
    render(<BadgeEditor badgeId="missing" />);
    expect(await screen.findByText("Badge unavailable")).toBeInTheDocument();
    expect(screen.getByText("This Badge no longer exists.")).toBeInTheDocument();
  });
  it("validates logo file size and type before upload", () => {
    expect(validateBadgeLogo(new File([], "empty.png", { type: "image/png" }))).toMatch(/non-empty/);
    expect(validateBadgeLogo(new File(["image"], "logo.svg", { type: "image/svg+xml" }))).toMatch(/JPEG/);
    expect(validateBadgeLogo(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }))).toMatch(/5 MB/);
    expect(validateBadgeLogo(new File(["image"], "logo.jpg", { type: "image/jpeg" }))).toBeUndefined();
  });
});
