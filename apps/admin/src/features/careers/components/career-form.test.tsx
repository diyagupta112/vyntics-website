import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { careersApi } from "../api/careers";
import type { Career } from "../types";
import { CareerForm } from "./career-form";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));
vi.mock("../api/careers", () => ({
  careersApi: { create: vi.fn(), update: vi.fn() },
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
  description: { type: "doc" },
  responsibilities: { items: ["Build"] },
  requirements: { items: ["Experience"] },
  nice_to_have: {},
  benefits: {},
  published_at: "2026-09-29T00:00:00Z",
};

function fillCreateForm() {
  fireEvent.change(screen.getByLabelText(/^Title/), {
    target: { value: "Senior Engineer" },
  });
  fireEvent.change(screen.getByLabelText(/^Slug/), {
    target: { value: "senior-engineer" },
  });
  fireEvent.change(screen.getByLabelText(/^Department/), {
    target: { value: "Engineering" },
  });
  fireEvent.change(screen.getByLabelText(/^Location/), {
    target: { value: "Remote" },
  });
  fireEvent.change(screen.getByLabelText(/^Employment type/), {
    target: { value: "Full-time" },
  });
  fireEvent.change(screen.getByLabelText(/^Experience/), {
    target: { value: "5+ years" },
  });
  fireEvent.change(screen.getByLabelText(/^Short description/), {
    target: { value: "Build reliable products." },
  });
}

describe("CareerForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates required fields and structured objects", async () => {
    render(<CareerForm />);
    fireEvent.change(screen.getByLabelText(/^Description \(JSON\)/), {
      target: { value: "[]" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Career" }));

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Description must be a valid JSON object."),
    ).toBeInTheDocument();
    expect(careersApi.create).not.toHaveBeenCalled();
  });

  it("creates a Career and opens its edit route", async () => {
    vi.mocked(careersApi.create).mockResolvedValue(career);
    render(<CareerForm />);
    fillCreateForm();
    fireEvent.click(screen.getByRole("button", { name: "Create Career" }));

    await waitFor(() => expect(careersApi.create).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith(
      "/careers/senior-engineer/edit?created=1",
    );
  });

  it("saves changes and follows a changed slug", async () => {
    const saved = { ...career, slug: "lead-engineer", title: "Lead Engineer" };
    vi.mocked(careersApi.update).mockResolvedValue(saved);
    render(<CareerForm career={career} />);

    fireEvent.change(screen.getByLabelText(/^Title/), {
      target: { value: "Lead Engineer" },
    });
    fireEvent.change(screen.getByLabelText(/^Slug/), {
      target: { value: "lead-engineer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(careersApi.update).toHaveBeenCalledWith(
        "career-1",
        expect.objectContaining({ title: "Lead Engineer", slug: "lead-engineer" }),
      ),
    );
    expect(await screen.findByText("Career changes saved.")).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/careers/lead-engineer/edit");
  });

  it("disables the save action while a request is pending", async () => {
    let resolveUpdate: (value: Career) => void = () => undefined;
    vi.mocked(careersApi.update).mockReturnValue(
      new Promise<Career>((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    render(<CareerForm career={career} />);

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    const saving = await screen.findByRole("button", { name: "Saving…" });
    expect(saving).toBeDisabled();

    resolveUpdate(career);
    expect(
      await screen.findByText("Career changes saved."),
    ).toBeInTheDocument();
  });

  it("maps backend field validation without exposing internals", async () => {
    vi.mocked(careersApi.update).mockRejectedValue(
      new ApiError({
        kind: "validation",
        message: "Review the highlighted fields.",
        validationIssues: [
          { location: ["body", "location"], message: "Invalid location" },
        ],
      }),
    );
    render(<CareerForm career={career} />);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Invalid location")).toBeInTheDocument();
    expect(
      screen.getByText("Review the highlighted fields."),
    ).toBeInTheDocument();
  });
});
