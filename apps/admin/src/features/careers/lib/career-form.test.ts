import { describe, expect, it } from "vitest";
import {
  emptyCareerForm,
  toCreateRequest,
  validateCareerForm,
  type CareerFormValues,
} from "./career-form";

const validValues: CareerFormValues = {
  title: "  Senior Engineer  ",
  slug: " senior-engineer ",
  location: " Remote ",
  employmentType: " Full-time ",
  department: " Engineering ",
  experience: " 5+ years ",
  shortDescription: " Build reliable products. ",
  description: '{"type":"doc"}',
  responsibilities: '{"items":["Build"]}',
  requirements: '{"items":["Experience"]}',
  niceToHave: "{}",
  benefits: "{}",
};

describe("Career form helpers", () => {
  it("requires text fields and JSON objects", () => {
    const errors = validateCareerForm({
      ...emptyCareerForm,
      description: "[]",
      responsibilities: "invalid",
    });

    expect(errors.title).toBe("Title is required.");
    expect(errors.description).toMatch(/JSON object/);
    expect(errors.responsibilities).toMatch(/JSON object/);
  });

  it("builds the exact backend-controlled create payload", () => {
    expect(toCreateRequest(validValues)).toEqual({
      title: "Senior Engineer",
      slug: "senior-engineer",
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
    });
  });
});
