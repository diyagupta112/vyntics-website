import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { testimonialsApi } from "../api/testimonials";
import { testimonialFixture as item } from "../test-fixtures";
import { TestimonialForm } from "./testimonial-form";
import { CompanyLogoControl, validateCompanyLogo } from "./company-logo-control";
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("../api/testimonials", () => ({ testimonialsApi: { create: vi.fn(), update: vi.fn(), uploadLogo: vi.fn(), deleteLogo: vi.fn() } }));
const file = new File(["image"], "logo.png", { type: "image/png" });
beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:logo");
  URL.revokeObjectURL = vi.fn();
});
function fill() {
  fireEvent.change(screen.getByLabelText(/^Quote/), { target: { value: "A great partner" } });
  fireEvent.change(screen.getByLabelText(/^Author name/), { target: { value: "Customer" } });
}
function select() { fireEvent.change(screen.getByLabelText("Choose company logo"), { target: { files: [file] } }); }

describe("Company logo management", () => {
  it("renders an empty form and creates without a logo", async () => {
    vi.mocked(testimonialsApi.create).mockResolvedValue({ ...item, company_logo_url: null });
    render(<TestimonialForm />);
    expect(screen.getByText("No company logo uploaded")).toBeInTheDocument();
    fill(); fireEvent.click(screen.getByRole("button", { name: "Create Testimonial" }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(testimonialsApi.uploadLogo).not.toHaveBeenCalled();
    expect(testimonialsApi.create).toHaveBeenCalledWith(expect.objectContaining({ company_logo_url: null }));
  });
  it("creates first, uploads using the returned ID, and exposes the returned record", async () => {
    const events: string[] = [];
    const uploaded = { ...item, company_logo_url: "https://example.com/uploaded.png" };
    vi.mocked(testimonialsApi.create).mockImplementation(async () => { events.push("create"); return item; });
    vi.mocked(testimonialsApi.uploadLogo).mockImplementation(async () => { events.push("upload"); return uploaded; });
    const onCreated = vi.fn();
    const { unmount } = render(<TestimonialForm onCreated={onCreated} />);
    fill(); select();
    expect(testimonialsApi.uploadLogo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Create Testimonial" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(uploaded));
    expect(events).toEqual(["create", "upload"]);
    expect(testimonialsApi.uploadLogo).toHaveBeenCalledWith(item.id, file);
    expect(screen.getByAltText("Testimonial company logo")).toHaveAttribute("src", uploaded.company_logo_url);
    unmount(); expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:logo");
  });
  it("retains a created record after upload failure and retries without a second POST", async () => {
    vi.mocked(testimonialsApi.create).mockResolvedValue({ ...item, company_logo_url: null });
    vi.mocked(testimonialsApi.uploadLogo).mockRejectedValueOnce(new ApiError({ kind: "validation", message: "Invalid image bytes", status: 422 })).mockResolvedValueOnce(item);
    render(<TestimonialForm />); fill(); select();
    fireEvent.click(screen.getByRole("button", { name: "Create Testimonial" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Testimonial created, but the company logo upload failed.");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid image bytes");
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry Logo Upload" }));
    expect(await screen.findByText("Company logo uploaded.")).toBeInTheDocument();
    expect(testimonialsApi.create).toHaveBeenCalledTimes(1);
  });
  it("replaces an external logo independently and preserves unsaved editorial fields", async () => {
    vi.mocked(testimonialsApi.uploadLogo).mockResolvedValue({ ...item, company_logo_url: "https://example.com/new.png" });
    render(<TestimonialForm item={item} />);
    expect(screen.getByAltText("Testimonial company logo")).toHaveAttribute("src", item.company_logo_url);
    fireEvent.change(screen.getByLabelText(/^Quote/), { target: { value: "Unsaved quote" } });
    select();
    expect(await screen.findByText("Company logo replaced.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Quote/)).toHaveValue("Unsaved quote");
    expect(testimonialsApi.update).not.toHaveBeenCalled();
  });
  it.each(["upload", "remove"] as const)("locks duplicate/conflicting actions during %s", async (operation) => {
    let resolve!: (value: typeof item | undefined) => void;
    const promise = new Promise<typeof item | undefined>((done) => { resolve = done; });
    if (operation === "upload") vi.mocked(testimonialsApi.uploadLogo).mockReturnValue(promise as Promise<typeof item>);
    else vi.mocked(testimonialsApi.deleteLogo).mockReturnValue(promise as Promise<void>);
    const changed = vi.fn();
    render(<CompanyLogoControl item={item} onSelected={vi.fn()} onChanged={changed} onBusyChange={vi.fn()} />);
    if (operation === "upload") { select(); select(); }
    else { const remove = screen.getByRole("button", { name: "Remove Logo" }); fireEvent.click(remove); fireEvent.click(remove); }
    expect(screen.getByRole("button", { name: operation === "upload" ? "Uploading…" : "Removing…" })).toBeDisabled();
    expect(screen.getByLabelText("Choose company logo")).toBeDisabled();
    expect(operation === "upload" ? testimonialsApi.uploadLogo : testimonialsApi.deleteLogo).toHaveBeenCalledTimes(1);
    resolve(operation === "upload" ? item : undefined);
    await waitFor(() => expect(changed).toHaveBeenCalled());
    if (operation === "remove") expect(changed).toHaveBeenCalledWith({ ...item, company_logo_url: null });
  });
  it.each(["upload", "remove"] as const)("displays backend %s errors without changing the logo", async (operation) => {
    const failure = new ApiError({ kind: "validation", message: "Backend logo validation failed", status: 422 });
    vi.mocked(testimonialsApi.uploadLogo).mockRejectedValue(failure);
    vi.mocked(testimonialsApi.deleteLogo).mockRejectedValue(failure);
    const changed = vi.fn();
    render(<CompanyLogoControl item={item} onSelected={vi.fn()} onChanged={changed} onBusyChange={vi.fn()} />);
    if (operation === "upload") select(); else fireEvent.click(screen.getByRole("button", { name: "Remove Logo" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Backend logo validation failed");
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByAltText("Testimonial company logo")).toHaveAttribute("src", item.company_logo_url);
  });
  it("validates image type, nonempty files, and the 5 MiB size limit", () => {
    expect(validateCompanyLogo(file)).toBeUndefined();
    expect(validateCompanyLogo(new File([], "logo.png", { type: "image/png" }))).toMatch(/non-empty/);
    expect(validateCompanyLogo(new File(["x"], "logo.svg", { type: "image/svg+xml" }))).toMatch(/JPEG/);
    expect(validateCompanyLogo(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "logo.png", { type: "image/png" }))).toMatch(/5 MiB/);
  });
});
