import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadFile } from "./download";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("downloadFile", () => {
  it.each([
    ['attachment; filename="backend.xlsx"', "backend.xlsx"],
    ["attachment; filename*=UTF-8''Career%20Applicants.xlsx", "Career Applicants.xlsx"],
    [null, "fallback.xlsx"],
  ])("downloads using the filename and releases its object URL", (disposition, expected) => {
    vi.useFakeTimers();
    const create = vi.fn(() => "blob:download");
    const revoke = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe(expected);
      expect(this.href).toBe("blob:download");
      expect(this.isConnected).toBe(true);
    });
    const blob = new Blob(["workbook"]);
    downloadFile({ blob, disposition }, "fallback.xlsx");
    expect(create).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download]')).toBeNull();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith("blob:download");
  });
});
