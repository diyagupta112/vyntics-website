import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { teamMembersApi } from "../api/team-members";
import { teamMemberFixture as member } from "../test-fixtures";
import { TeamMemberList } from "./team-member-list";
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/team-members", () => ({ teamMembersApi: { list: vi.fn() } }));
describe("TeamMemberList", () => {
  beforeEach(() => vi.clearAllMocks());
  it("renders accessible image-led cards without biographies", async () => {
    vi.mocked(teamMembersApi.list).mockResolvedValue([member]); render(<TeamMemberList />);
    expect(screen.getByRole("status", { name: "Loading Team Members" })).toBeInTheDocument();
    const link = await screen.findByRole("link", { name: "Open Asha Patel for editing" }); expect(link).toHaveAttribute("href", "/team/member-1/edit");
    expect(screen.getByRole("img", { name: "Photo of Asha Patel" })).toBeInTheDocument(); expect(screen.getByText("Design Director")).toBeInTheDocument(); expect(screen.queryByText(member.bio)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create New Team Member" })).toBeInTheDocument();
  });
  it("renders empty and safe error states", async () => {
    vi.mocked(teamMembersApi.list).mockResolvedValueOnce([]); const { unmount } = render(<TeamMemberList />); expect(await screen.findByText("No Team Members yet")).toBeInTheDocument(); unmount();
    vi.mocked(teamMembersApi.list).mockRejectedValue(new ApiError({ kind: "network", message: "safe" })); render(<TeamMemberList />); expect(await screen.findByText(/backend could not be reached/i)).toBeInTheDocument();
  });
});
