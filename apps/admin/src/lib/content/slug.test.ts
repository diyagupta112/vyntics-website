import { describe, expect, it } from "vitest";
import { slugFromTitle } from "./slug";

describe("shared slug generation", () => {
  it.each([
    ["How We Helped ABC Scale Their Data Platform", "how-we-helped-abc-scale-their-data-platform"],
    ["  HELLO   WORLD  ", "hello-world"],
    ["Hello!!! World?", "hello-world"],
    ["---Hello---World---", "hello-world"],
    ["Team’s Café & CRM", "teams-cafe-crm"],
    ["", ""],
  ])("normalizes %s", (title, expected) => expect(slugFromTitle(title)).toBe(expected));
});
