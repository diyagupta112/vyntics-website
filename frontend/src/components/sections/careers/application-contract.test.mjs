import assert from "node:assert/strict";
import test from "node:test";
import {
  NOTICE_PERIOD_OPTIONS,
  applyProfessionalPayload,
  createProfessionalPayload,
  mapApplicationValidationErrors,
  readProfessionalFields,
  validateProfessionalFields,
} from "./application-contract.ts";

const validInput = {
  experienceYears: "3",
  experienceMonths: "6",
  currentlyWorking: false,
  currentCompany: "",
  noticePeriod: "30_days",
};

test("exposes the exact notice-period values and human-readable labels", () => {
  assert.deepEqual(NOTICE_PERIOD_OPTIONS, [
    { value: "immediate", label: "Immediate" },
    { value: "15_days", label: "15 Days" },
    { value: "30_days", label: "30 Days" },
    { value: "60_days", label: "60 Days" },
    { value: "90_days", label: "90 Days" },
    { value: "other", label: "Other" },
  ]);
});

test("accepts valid experience", () => {
  assert.equal(validateProfessionalFields(validInput).experience, undefined);
});

test("accepts zero experience", () => {
  assert.equal(validateProfessionalFields({ ...validInput, experienceYears: "0", experienceMonths: "0" }).experience, undefined);
});

test("rejects missing experience", () => {
  assert.match(validateProfessionalFields({ ...validInput, experienceYears: "" }).experience ?? "", /years and months/);
});

test("rejects negative experience", () => {
  assert.match(validateProfessionalFields({ ...validInput, experienceYears: "-1" }).experience ?? "", /whole/);
});

test("rejects fractional experience", () => {
  assert.match(validateProfessionalFields({ ...validInput, experienceMonths: "1.5" }).experience ?? "", /whole/);
});

test("rejects twelve experience months", () => {
  assert.match(validateProfessionalFields({ ...validInput, experienceMonths: "12" }).experience ?? "", /0 and 11/);
});

test("requires notice period", () => {
  assert.match(validateProfessionalFields({ ...validInput, noticePeriod: "" }).notice_period ?? "", /Select/);
});

test("rejects an unsupported notice period", () => {
  assert.match(validateProfessionalFields({ ...validInput, noticePeriod: "45_days" }).notice_period ?? "", /valid/);
});

test("creates numeric experience values", () => {
  const payload = createProfessionalPayload(validInput);
  assert.equal(payload.experience_years, 3);
  assert.equal(payload.experience_months, 6);
});

test("preserves currently working as a boolean", () => {
  assert.equal(createProfessionalPayload({ ...validInput, currentlyWorking: true }).currently_working, true);
  assert.equal(createProfessionalPayload(validInput).currently_working, false);
});

test("trims a current company", () => {
  assert.equal(createProfessionalPayload({ ...validInput, currentlyWorking: true, currentCompany: "  Vyntics  " }).current_company, "Vyntics");
});

test("normalizes a blank current company to null", () => {
  assert.equal(createProfessionalPayload({ ...validInput, currentlyWorking: true, currentCompany: "   " }).current_company, null);
});

test("normalizes current company to null when not working", () => {
  assert.equal(createProfessionalPayload({ ...validInput, currentCompany: "Ignored Company" }).current_company, null);
});

test("rejects a current company longer than the backend maximum", () => {
  assert.match(validateProfessionalFields({ ...validInput, currentlyWorking: true, currentCompany: "x".repeat(201) }).current_company ?? "", /200/);
});

test("reads unchecked currently working as false", () => {
  const formData = new FormData();
  formData.set("experience_years", "2");
  formData.set("experience_months", "4");
  formData.set("notice_period", "immediate");
  assert.equal(readProfessionalFields(formData).currentlyWorking, false);
});

test("writes machine values to multipart form data", () => {
  const formData = new FormData();
  applyProfessionalPayload(formData, createProfessionalPayload({ ...validInput, currentlyWorking: true, currentCompany: " Vyntics " }));
  assert.equal(formData.get("experience_years"), "3");
  assert.equal(formData.get("experience_months"), "6");
  assert.equal(formData.get("currently_working"), "true");
  assert.equal(formData.get("notice_period"), "30_days");
  assert.equal(formData.get("current_company"), "Vyntics");
});

test("omits a null current company from multipart form data", () => {
  const formData = new FormData();
  formData.set("current_company", "stale");
  applyProfessionalPayload(formData, createProfessionalPayload(validInput));
  assert.equal(formData.has("current_company"), false);
});

test("maps backend validation errors to safe form messages", () => {
  const errors = mapApplicationValidationErrors({
    detail: [
      { loc: ["body", "experience_months"], msg: "Input should be less than or equal to 11" },
      { loc: ["body", "notice_period"], msg: "Input should be valid" },
      { loc: ["body", "email"], msg: "value is not a valid email address" },
    ],
  });
  assert.ok(errors.experience);
  assert.ok(errors.notice_period);
  assert.ok(errors.email);
});

test("maps resume validation strings without exposing backend detail", () => {
  assert.equal(mapApplicationValidationErrors({ detail: "resume has an invalid signature" }).resume, "Choose a valid PDF, DOC, or DOCX file.");
});
