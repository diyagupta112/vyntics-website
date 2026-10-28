import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { faqPageOptions } from "../lib/page-options";
import { faqFixture } from "../test-fixtures";
import { faqsApi } from "./faqs";
vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
describe("FAQ API contract", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uses the plain-array Admin response without an envelope wrapper", async () => {
    const rows = [faqFixture]; vi.mocked(apiClient.get).mockResolvedValue(rows);
    expect(await faqsApi.list()).toBe(rows);
    expect(apiClient.get).toHaveBeenCalledWith("/admin/faqs", { signal: undefined });
  });
  it.each(faqPageOptions)("filters $label with its stable key", async ({ value }) => {
    await faqsApi.list(value);
    const path = vi.mocked(apiClient.get).mock.calls[0][0];
    const url = new URL(path, "https://api.example.com");
    expect(url.pathname).toBe("/admin/faqs"); expect(url.searchParams.get("page")).toBe(value);
  });
  it("sends sub_page only together with page", async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await faqsApi.list("services/ai-solutions", undefined, "ai-agents");
    expect(apiClient.get).toHaveBeenLastCalledWith("/admin/faqs?page=services%2Fai-solutions&sub_page=ai-agents", { signal: undefined });
    await faqsApi.list(undefined, undefined, "ai-agents");
    expect(apiClient.get).toHaveBeenLastCalledWith("/admin/faqs", { signal: undefined });
  });
  it("uses existing detail and mutation routes with encoded ids", async () => {
    await faqsApi.get("id/unsafe"); expect(apiClient.get).toHaveBeenCalledWith("/admin/faqs/id%2Funsafe");
    const payload = { page: faqFixture.page, sub_page: null, question: faqFixture.question, answer: faqFixture.answer, display_order: 1, is_active: false };
    await faqsApi.create(payload); expect(apiClient.post).toHaveBeenCalledWith("/faqs", { json: payload });
    await faqsApi.update("id", { page: "services/ai-solutions" }); expect(apiClient.patch).toHaveBeenCalledWith("/faqs/id", { json: { page: "services/ai-solutions" } });
    await faqsApi.delete("id"); expect(apiClient.delete).toHaveBeenCalledWith("/faqs/id");
  });
});
