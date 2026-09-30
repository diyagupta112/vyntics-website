import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "./client";
import { ApiAuthenticationError, ApiError } from "./errors";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/config/public-env", () => ({
  getPublicEnvironment: () => ({
    apiBaseUrl: "https://api.example.test",
    supabaseAnonKey: "public-key",
    supabaseUrl: "https://project.example.test",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({ auth: { getSession: mocks.getSession } }),
}));

function response(body: unknown, status = 200, contentType = "application/json") {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": contentType },
  });
}

async function expectApiError(promise: Promise<unknown>, kind: ApiError["kind"], status?: number) {
  try {
    await promise;
    throw new Error("Expected the API request to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe(kind);
    expect((error as ApiError).status).toBe(status);
    return error as ApiError;
  }
}

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "current-access-token" } },
      error: null,
    });
  });

  it("performs an authenticated GET and parses its JSON response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({ items: [{ id: "one" }] }),
    );

    await expect(apiClient.get<{ items: Array<{ id: string }> }>("/admin/items")).resolves.toEqual({
      items: [{ id: "one" }],
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.test/admin/items");
    expect(request?.method).toBe("GET");
    expect(new Headers(request?.headers).get("Authorization")).toBe(
      "Bearer current-access-token",
    );
  });

  it("fails with a typed authentication error before fetch when no session exists", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(apiClient.get("/admin/items")).rejects.toBeInstanceOf(ApiAuthenticationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends JSON bodies and headers for each mutation method", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => response({ updated: true }));

    for (const method of ["post", "patch", "put"] as const) {
      await apiClient[method]("/items", { json: { title: method } });
    }

    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [index, method] of ["POST", "PATCH", "PUT"].entries()) {
      const request = fetchMock.mock.calls[index][1];
      expect(request?.method).toBe(method);
      expect(request?.body).toBe(JSON.stringify({ title: method.toLowerCase() }));
      expect(new Headers(request?.headers).get("Content-Type")).toBe("application/json");
    }
  });

  it("supports an empty 204 DELETE response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiClient.delete("/items/one")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("returns a successful non-JSON response without crashing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("plain response", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    await expect(apiClient.get<string>("/plain")).resolves.toBe("plain response");
  });

  it.each([
    [401, "authentication"],
    [403, "permission"],
    [404, "not_found"],
    [409, "conflict"],
    [503, "service_unavailable"],
  ] as const)("maps HTTP %s to a typed %s error", async (status, kind) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response({ detail: "provider detail" }, status));
    await expectApiError(apiClient.get("/items"), kind, status);
  });

  it("preserves safe FastAPI 422 validation details", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response(
        {
          detail: [
            {
              type: "string_too_short",
              loc: ["body", "title"],
              msg: "String should have at least 3 characters",
              input: "sensitive input is intentionally discarded",
            },
          ],
        },
        422,
      ),
    );

    const error = await expectApiError(apiClient.post("/items", { json: {} }), "validation", 422);
    expect(error.validationIssues).toEqual([
      {
        type: "string_too_short",
        location: ["body", "title"],
        message: "String should have at least 3 characters",
      },
    ]);
    expect(error).not.toHaveProperty("input");
  });

  it("distinguishes a network failure from an HTTP response", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("connection refused"));
    await expectApiError(apiClient.get("/items"), "network");
  });

  it("handles an unexpected non-JSON error without exposing its body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("internal upstream stack trace", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const error = await expectApiError(apiClient.get("/items"), "unexpected", 500);
    expect(error.message).toBe("The request could not be completed.");
    expect(error.message).not.toContain("stack trace");
  });

  it("rejects absolute and protocol-relative request paths", async () => {
    await expectApiError(apiClient.get("https://outside.example/items"), "unexpected");
    await expectApiError(apiClient.get("//outside.example/items"), "unexpected");
  });
});
