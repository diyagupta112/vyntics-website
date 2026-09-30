import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { blogsApi } from "../api/blogs";
import { BlogEditor } from "./blog-editor";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../api/blogs", () => ({ blogsApi: { get: vi.fn(), update: vi.fn(), uploadCover: vi.fn(), deleteCover: vi.fn() } }));

describe("BlogEditor", () => {
  it("shows a not-found state", async () => {
    vi.mocked(blogsApi.get).mockRejectedValue(new ApiError({ kind: "not_found", message: "safe" }));
    render(<BlogEditor blogId="missing" />);
    expect(await screen.findByText("Blog unavailable")).toBeInTheDocument();
    expect(screen.getByText("This Blog no longer exists.")).toBeInTheDocument();
  });
});
