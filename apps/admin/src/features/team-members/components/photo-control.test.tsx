import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { teamMembersApi } from "../api/team-members";
import { teamMemberFixture as member } from "../test-fixtures";
import { PhotoControl, validateTeamPhoto } from "./photo-control";
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/team-members", () => ({ teamMembersApi: { uploadPhoto: vi.fn(), deletePhoto: vi.fn() } }));
describe("PhotoControl", () => {
  beforeEach(() => vi.clearAllMocks());
  it("validates empty, oversized, and mismatched files", () => {
    expect(validateTeamPhoto(new File([], "photo.jpg", { type: "image/jpeg" }))).toMatch(/non-empty/);
    expect(validateTeamPhoto(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "photo.jpg", { type: "image/jpeg" }))).toMatch(/5 MB/);
    expect(validateTeamPhoto(new File(["x"], "photo.pdf", { type: "application/pdf" }))).toMatch(/JPEG/);
  });
  it("uploads/replaces and deletes through FastAPI", async () => {
    const updated = { ...member, photo_url: "https://example.com/new.webp" }; vi.mocked(teamMembersApi.uploadPhoto).mockResolvedValue(updated); vi.mocked(teamMembersApi.deletePhoto).mockResolvedValue(undefined); const changed = vi.fn(); render(<PhotoControl member={member} onChanged={changed}/>);
    const file = new File(["image"], "photo.webp", { type: "image/webp" }); fireEvent.change(screen.getByLabelText("Choose Team Member photo"), { target: { files: [file] } }); await waitFor(() => expect(teamMembersApi.uploadPhoto).toHaveBeenCalledWith("member-1", file)); expect(changed).toHaveBeenCalledWith(updated);
    fireEvent.click(screen.getByRole("button", { name: "Remove photo" })); await waitFor(() => expect(teamMembersApi.deletePhoto).toHaveBeenCalledWith("member-1"));
  });
});
