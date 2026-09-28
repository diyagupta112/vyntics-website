import { getSafeRedirectPath } from "./redirect";

describe("getSafeRedirectPath", () => {
  it("accepts internal paths", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
  });

  it.each([null, "https://malicious.example", "//malicious.example"])(
    "rejects an unsafe redirect value",
    (value) => {
      expect(getSafeRedirectPath(value)).toBe("/dashboard");
    },
  );
});
