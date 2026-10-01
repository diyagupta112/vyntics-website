import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { teamMembersApi } from "../api/team-members";
import { teamMemberFixture as member } from "../test-fixtures";
import { TeamMemberCreateWizard } from "./team-member-create-wizard";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/team-members", () => ({ teamMembersApi: { create: vi.fn(), update: vi.fn(), uploadPhoto: vi.fn(), deletePhoto: vi.fn() } }));

function fillMember() {
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Asha Patel" } });
  fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "Design Director" } });
  fireEvent.change(screen.getByLabelText(/^Biography/), { target: { value: "Full biography" } });
  fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText(/^LinkedIn URL/), { target: { value: "https://linkedin.com/in/asha" } });
}

describe("TeamMemberCreateWizard", () => {
  beforeEach(() => vi.clearAllMocks());
  it("creates once, uses PATCH after Back, uploads the photo, and finishes", async () => {
    const created = { ...member, photo_url: null };
    vi.mocked(teamMembersApi.create).mockResolvedValue(created);
    vi.mocked(teamMembersApi.update).mockResolvedValue({ ...created, role: "VP Design" });
    vi.mocked(teamMembersApi.uploadPhoto).mockResolvedValue({ ...created, role: "VP Design", photo_url: "https://example.com/photo.jpg" });
    render(<TeamMemberCreateWizard />);
    expect(screen.getByRole("heading", { name: "Add Team Member Details" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    fillMember(); fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByRole("heading", { name: "Add Photo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "VP Design" } });
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(teamMembersApi.update).toHaveBeenCalledWith("member-1", expect.objectContaining({ role: "VP Design" })));
    expect(teamMembersApi.create).toHaveBeenCalledTimes(1);
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Choose Team Member photo"), { target: { files: [file] } });
    await waitFor(() => expect(teamMembersApi.uploadPhoto).toHaveBeenCalledWith("member-1", file));
    fireEvent.click(screen.getByRole("button", { name: "Save & Finish" }));
    expect(push).toHaveBeenCalledWith("/team/member-1/edit?created=1");
  });
});
