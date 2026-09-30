export type CareerListItem = {
  id: string;
  slug: string;
  title: string;
  location: string;
  employment_type: string;
  department: string;
  experience: string;
  short_description: string;
  published_at: string;
};

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type Career = CareerListItem & {
  description: JsonObject;
  responsibilities: JsonObject;
  requirements: JsonObject;
  nice_to_have: JsonObject;
  benefits: JsonObject;
};

export type CareersResult =
  | { status: "success"; careers: CareerListItem[] }
  | { status: "error" };

export type CareerResult =
  | { status: "success"; career: Career }
  | { status: "not-found" }
  | { status: "error" };

function apiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) return value.every(isJsonValue);
  return isObject(value) && Object.values(value).every(isJsonValue);
}

function isJsonObject(value: unknown): value is JsonObject {
  return isObject(value) && Object.values(value).every(isJsonValue);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isCareerListItem(value: unknown): value is CareerListItem {
  if (!isObject(value)) return false;

  return (
    isString(value.id) &&
    isString(value.slug) &&
    isString(value.title) &&
    isString(value.location) &&
    isString(value.employment_type) &&
    isString(value.department) &&
    isString(value.experience) &&
    isString(value.short_description) &&
    isString(value.published_at)
  );
}

function isCareer(value: unknown): value is Career {
  if (!isCareerListItem(value) || !isObject(value)) return false;
  const record = value as Record<string, unknown>;

  return (
    isJsonObject(record.description) &&
    isJsonObject(record.responsibilities) &&
    isJsonObject(record.requirements) &&
    isJsonObject(record.nice_to_have) &&
    isJsonObject(record.benefits)
  );
}

export async function getCareers(): Promise<CareersResult> {
  try {
    const response = await fetch(`${apiBaseUrl()}/careers`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "error" };

    const payload: unknown = await response.json();
    if (!isObject(payload) || !Array.isArray(payload.data)) {
      return { status: "error" };
    }

    const careers = payload.data.filter(isCareerListItem);
    if (careers.length !== payload.data.length) return { status: "error" };
    return { status: "success", careers };
  } catch {
    return { status: "error" };
  }
}

export async function getCareer(slug: string): Promise<CareerResult> {
  try {
    const response = await fetch(
      `${apiBaseUrl()}/careers/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error" };

    const payload: unknown = await response.json();
    return isCareer(payload)
      ? { status: "success", career: payload }
      : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
