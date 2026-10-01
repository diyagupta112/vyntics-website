import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { teamMembersApi } from "../api/team-members";
import { teamMemberFixture as member } from "../test-fixtures";
import { TeamMemberEditor } from "./team-member-editor";
import { TeamMemberForm } from "./team-member-form";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/team-members", () => ({ teamMembersApi: { get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), uploadPhoto: vi.fn(), deletePhoto: vi.fn() } }));

function fillRequired() {
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Asha Patel" } });
  fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "Design Director" } });
  fireEvent.change(screen.getByLabelText(/^Biography/), { target: { value: "Full biography" } });
  fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText(/^LinkedIn URL/), { target: { value: "https://linkedin.com/in/asha" } });
  fireEvent.change(screen.getByLabelText(/^Member type/), { target: { value: "leadership" } });
}

describe("Team Member management", () => {
  beforeEach(() => vi.clearAllMocks());
  it("validates then creates and opens the new member", async () => {
    vi.mocked(teamMembersApi.create).mockResolvedValue(member); render(<TeamMemberForm />); fireEvent.click(screen.getByRole("button", { name: "Create Team Member" })); expect(await screen.findByText("Name is required.")).toBeInTheDocument(); fillRequired(); fireEvent.click(screen.getByRole("button", { name: "Create Team Member" })); await waitFor(() => expect(teamMembersApi.create).toHaveBeenCalledWith(expect.objectContaining({ member_type: "leadership", display_order: 3, photo_url: null }))); expect(push).toHaveBeenCalledWith("/team/member-1/edit?created=1");
  });
  it("loads complete details and saves changes", async () => {
    vi.mocked(teamMembersApi.get).mockResolvedValue(member); vi.mocked(teamMembersApi.update).mockResolvedValue({ ...member, role: "VP Design" }); render(<TeamMemberEditor teamMemberId="member-1"/>); expect(await screen.findByDisplayValue(member.bio)).toBeInTheDocument(); fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "VP Design" } }); fireEvent.click(screen.getByRole("button", { name: "Save Changes" })); await waitFor(() => expect(teamMembersApi.update).toHaveBeenCalledWith("member-1", expect.objectContaining({ role: "VP Design" }))); expect(await screen.findByText("Team Member changes saved.")).toBeInTheDocument();
  });
  it("deletes from the detail experience and handles failures", async () => {
    vi.mocked(teamMembersApi.get).mockResolvedValue(member); vi.mocked(teamMembersApi.delete).mockResolvedValue(undefined); render(<TeamMemberEditor teamMemberId="member-1"/>); await screen.findByRole("heading", { name: "Asha Patel" }); fireEvent.click(screen.getByRole("button", { name: "Delete Team Member" })); const dialog = screen.getByRole("dialog"); fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" })); await waitFor(() => expect(teamMembersApi.delete).toHaveBeenCalledWith("member-1")); expect(push).toHaveBeenCalledWith("/team?deleted=1");
  });
  it("keeps delete confirmation open on API failure", async () => {
    vi.mocked(teamMembersApi.get).mockResolvedValue(member); vi.mocked(teamMembersApi.delete).mockRejectedValue(new ApiError({ kind: "service_unavailable", message: "safe" })); render(<TeamMemberEditor teamMemberId="member-1"/>); await screen.findByRole("heading", { name: "Asha Patel" }); fireEvent.click(screen.getByRole("button", { name: "Delete Team Member" })); const dialog = screen.getByRole("dialog"); fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" })); expect(await within(dialog).findByText(/temporarily unavailable/i)).toBeInTheDocument();
  });
});
