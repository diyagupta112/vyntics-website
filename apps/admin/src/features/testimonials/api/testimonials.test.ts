import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { testimonialFixture } from "../test-fixtures";
import { testimonialsApi } from "./testimonials";
vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
describe("Testimonial API contract", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uses plain-array Admin reads and existing mutation paths", async () => {
    const rows = [testimonialFixture]; vi.mocked(apiClient.get).mockResolvedValue(rows);
    expect(await testimonialsApi.list()).toBe(rows);
    expect(apiClient.get).toHaveBeenCalledWith("/admin/testimonials", { signal: undefined });
    await testimonialsApi.get("id/unsafe"); expect(apiClient.get).toHaveBeenCalledWith("/admin/testimonials/id%2Funsafe");
    const payload = { quote: "Quote", author_name: "Name", author_role: null, company_name: null, company_logo_url: null, display_order: 1, is_active: true };
    await testimonialsApi.create(payload); expect(apiClient.post).toHaveBeenCalledWith("/testimonials", { json: payload });
    await testimonialsApi.update("id", { is_active: false }); expect(apiClient.patch).toHaveBeenCalledWith("/testimonials/id", { json: { is_active: false } });
    await testimonialsApi.delete("id"); expect(apiClient.delete).toHaveBeenCalledWith("/testimonials/id");
  });
});
