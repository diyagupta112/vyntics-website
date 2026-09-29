import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { careersApi } from "../api/careers";
import type { Career } from "../types";
import { CareerEditor } from "./career-editor";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("../api/careers", () => ({
  careersApi: { getBySlug: vi.fn(), update: vi.fn() },
}));

const career: Career = {
  id: "career-1",
  slug: "senior-engineer",
  title: "Senior Engineer",
  location: "Remote",
  employment_type: "Full-time",
  department: "Engineering",
  experience: "5+ years",
  short_description: "Build reliable products.",
  description: {},
  responsibilities: {},
  requirements: {},
  nice_to_have: {},
  benefits: {},
  published_at: "2026-09-29T00:00:00Z",
};

describe("CareerEditor", () => {
  it("loads by slug and renders immutable publication context", async () => {
    vi.mocked(careersApi.getBySlug).mockResolvedValue(career);
    render(<CareerEditor careerSlug="senior-engineer" />);

    expect(await screen.findByRole("heading", { name: "Senior Engineer" })).toBeInTheDocument();
    expect(careersApi.getBySlug).toHaveBeenCalledWith("senior-engineer");
    expect(screen.getByText(/managed by the backend/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/published at/i)).not.toBeInTheDocument();
  });

  it("shows a not-found state", async () => {
    vi.mocked(careersApi.getBySlug).mockRejectedValue(
      new ApiError({ kind: "not_found", message: "safe" }),
    );
    render(<CareerEditor careerSlug="missing" />);

    expect(await screen.findByText("Career unavailable")).toBeInTheDocument();
    expect(screen.getByText("This Career no longer exists.")).toBeInTheDocument();
  });
});
