import { describe, expect, it } from "vitest";
import { truncateText } from "./truncate";

describe("truncateText", () => {
  it("keeps short text unchanged and consistently truncates long text", () => {
    expect(truncateText("Short message", 20)).toBe("Short message");
    expect(truncateText("A message that is much too long", 20)).toBe(
      "A message that is...",
    );
  });
});
