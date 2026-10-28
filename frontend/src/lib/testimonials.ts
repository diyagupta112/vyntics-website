export type Testimonial = { id: string; quote: string; author_name: string; author_role: string | null; company_name: string | null; company_logo_url: string | null; display_order: number };

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
    const response = await fetch(`${base}/testimonials`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Request failed");
    const payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error("Invalid response");
    return payload.data.filter((item: Testimonial) => item && typeof item.id === "string" && typeof item.quote === "string" && typeof item.author_name === "string");
  } catch { return []; }
}
