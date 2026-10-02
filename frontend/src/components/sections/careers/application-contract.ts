export const NOTICE_PERIOD_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "15_days", label: "15 Days" },
  { value: "30_days", label: "30 Days" },
  { value: "60_days", label: "60 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "other", label: "Other" },
] as const;

export type NoticePeriod = (typeof NOTICE_PERIOD_OPTIONS)[number]["value"];
export type ApplicationField =
  | "name"
  | "email"
  | "phone"
  | "experience"
  | "currently_working"
  | "current_company"
  | "notice_period"
  | "resume";
export type FieldErrors = Partial<Record<ApplicationField, string>>;

export type ProfessionalFieldsInput = {
  experienceYears: string;
  experienceMonths: string;
  currentlyWorking: boolean;
  currentCompany: string;
  noticePeriod: string;
};

export type ProfessionalFieldsPayload = {
  experience_years: number;
  experience_months: number;
  currently_working: boolean;
  current_company: string | null;
  notice_period: NoticePeriod;
};

export function isNoticePeriod(value: string): value is NoticePeriod {
  return NOTICE_PERIOD_OPTIONS.some((option) => option.value === value);
}

export function readProfessionalFields(formData: FormData): ProfessionalFieldsInput {
  return {
    experienceYears: String(formData.get("experience_years") ?? "").trim(),
    experienceMonths: String(formData.get("experience_months") ?? "").trim(),
    currentlyWorking: formData.get("currently_working") === "true",
    currentCompany: String(formData.get("current_company") ?? ""),
    noticePeriod: String(formData.get("notice_period") ?? ""),
  };
}

export function validateProfessionalFields(input: ProfessionalFieldsInput): FieldErrors {
  const errors: FieldErrors = {};
  const validYears = /^\d+$/.test(input.experienceYears);
  const validMonths = /^\d+$/.test(input.experienceMonths);

  if (!input.experienceYears || !input.experienceMonths) {
    errors.experience = "Enter your experience in years and months.";
  } else if (!validYears || !validMonths) {
    errors.experience = "Use whole, non-negative numbers for experience.";
  } else if (Number(input.experienceMonths) > 11) {
    errors.experience = "Months must be between 0 and 11.";
  }

  if (!input.noticePeriod) {
    errors.notice_period = "Select your notice period.";
  } else if (!isNoticePeriod(input.noticePeriod)) {
    errors.notice_period = "Select a valid notice period.";
  }

  if (input.currentlyWorking && input.currentCompany.trim().length > 200) {
    errors.current_company = "Keep the company name within 200 characters.";
  }

  return errors;
}

export function createProfessionalPayload(input: ProfessionalFieldsInput): ProfessionalFieldsPayload {
  return {
    experience_years: Number(input.experienceYears),
    experience_months: Number(input.experienceMonths),
    currently_working: input.currentlyWorking,
    current_company: input.currentlyWorking ? input.currentCompany.trim() || null : null,
    notice_period: input.noticePeriod as NoticePeriod,
  };
}

export function applyProfessionalPayload(formData: FormData, payload: ProfessionalFieldsPayload) {
  formData.set("experience_years", String(payload.experience_years));
  formData.set("experience_months", String(payload.experience_months));
  formData.set("currently_working", String(payload.currently_working));
  formData.set("notice_period", payload.notice_period);
  if (payload.current_company === null) formData.delete("current_company");
  else formData.set("current_company", payload.current_company);
}

export function mapApplicationValidationErrors(payload: unknown): FieldErrors {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) return {};
  const detail = payload.detail;
  if (typeof detail === "string") {
    return detail.toLowerCase().includes("resume")
      ? { resume: "Choose a valid PDF, DOC, or DOCX file." }
      : {};
  }
  if (!Array.isArray(detail)) return {};

  const errors: FieldErrors = {};
  for (const issue of detail) {
    if (!issue || typeof issue !== "object" || !("loc" in issue) || !Array.isArray(issue.loc)) continue;
    const backendField = [...issue.loc].reverse().find((part): part is string => typeof part === "string");
    if (backendField === "experience_years" || backendField === "experience_months") {
      errors.experience = "Enter valid experience in years and months.";
    } else if (backendField === "currently_working") {
      errors.currently_working = "Choose whether you are currently working.";
    } else if (backendField === "current_company") {
      errors.current_company = "Enter a valid company name of up to 200 characters.";
    } else if (backendField === "notice_period") {
      errors.notice_period = "Select a valid notice period.";
    } else if (backendField === "name" || backendField === "email" || backendField === "phone" || backendField === "resume") {
      errors[backendField] = backendField === "resume"
        ? "Choose a valid PDF, DOC, or DOCX file."
        : `Enter a valid ${backendField === "phone" ? "phone number" : backendField}.`;
    }
  }
  return errors;
}
