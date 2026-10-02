import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiAuthenticationError, ApiError } from "@/lib/api/errors";
import { auditLogsApi } from "../api/audit-logs";
import type { AuditLogDetail, AuditLogPage } from "../types";
import { AuditLogsPage } from "./audit-logs-page";

vi.mock("../api/audit-logs", () => ({
  auditLogsApi: { get: vi.fn(), list: vi.fn() },
}));

const item = {
  id: "audit-1",
  actor_id: "admin-1",
  actor_email: "superadmin@vyntics.com",
  action: "update",
  resource_type: "case_study",
  resource_id: "resource-1",
  created_at: "2026-10-01T08:30:00Z",
};

const page: AuditLogPage = {
  items: [item],
  page: 1,
  page_size: 25,
  total: 26,
};

const detail: AuditLogDetail = {
  ...item,
  context: {
    changed_fields: ["status", "published_at"],
    status: "published",
    previous: null,
    successful: true,
  },
};

describe("AuditLogsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows loading and renders real response fields in a compact table", async () => {
    let resolveList: ((value: AuditLogPage) => void) | undefined;
    vi.mocked(auditLogsApi.list).mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    render(<AuditLogsPage />);
    expect(screen.getByRole("status", { name: "Loading Audit Logs" })).toBeInTheDocument();

    resolveList?.(page);
    expect(await screen.findByText("superadmin@vyntics.com")).toBeInTheDocument();
    expect(screen.getAllByText("Case Study")).toHaveLength(2);
    expect(screen.getByText("resource-1")).toBeInTheDocument();
    expect(screen.queryByText("changed_fields")).not.toBeInTheDocument();
  });

  it("renders the empty state", async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue({
      items: [], page: 1, page_size: 25, total: 0,
    });
    render(<AuditLogsPage />);
    expect(await screen.findByText("No audit logs yet.")).toBeInTheDocument();
  });

  it.each([
    [new ApiAuthenticationError(401), /session has expired/i],
    [new ApiError({ kind: "permission", message: "private backend detail", status: 403 }), /only to superadmins/i],
  ])("handles protected API denial safely", async (failure, message) => {
    vi.mocked(auditLogsApi.list).mockRejectedValue(failure);
    render(<AuditLogsPage />);
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByText("private backend detail")).not.toBeInTheDocument();
  });

  it("renders a retryable safe error", async () => {
    vi.mocked(auditLogsApi.list)
      .mockRejectedValueOnce(new ApiError({ kind: "network", message: "private network detail" }))
      .mockResolvedValueOnce(page);
    render(<AuditLogsPage />);

    expect(await screen.findByText(/backend could not be reached/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("superadmin@vyntics.com")).toBeInTheDocument();
  });

  it("applies action, resource, and date filters through the API", async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue(page);
    render(<AuditLogsPage />);
    await screen.findByText("superadmin@vyntics.com");
    expect(screen.getAllByText("Select date and time")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Action"), { target: { value: "update" } });
    fireEvent.change(screen.getByLabelText("Resource type"), {
      target: { value: "case_study" },
    });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-10-01T10:00" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-10-02T10:00" },
    });
    expect(screen.queryByText("Select date and time")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() =>
      expect(auditLogsApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({
          action: "update",
          resourceType: "case_study",
          from: new Date("2026-10-01T10:00").toISOString(),
          to: new Date("2026-10-02T10:00").toISOString(),
          page: 1,
          pageSize: 25,
        }),
      ),
    );
  });

  it("requests the next backend page and a changed page size", async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue(page);
    render(<AuditLogsPage />);
    await screen.findByText("Page 1 of 2 · 26 audit logs");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(auditLogsApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, pageSize: 25 }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Rows per page"), {
      target: { value: "50" },
    });
    await waitFor(() =>
      expect(auditLogsApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, pageSize: 50 }),
      ),
    );
  });

  it("fetches and displays complete structured detail", async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue(page);
    vi.mocked(auditLogsApi.get).mockResolvedValue(detail);
    render(<AuditLogsPage />);

    fireEvent.click(await screen.findByRole("button", {
      name: "View details for audit log audit-1",
    }));

    const dialog = screen.getByRole("dialog", { name: "Audit Log Details" });
    expect(await within(dialog).findByText("published_at")).toBeInTheDocument();
    expect(within(dialog).getByText("published")).toBeInTheDocument();
    expect(within(dialog).getByText("None")).toBeInTheDocument();
    expect(auditLogsApi.get).toHaveBeenCalledWith("audit-1");
  });
});
