import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { testimonialsApi } from "../api/testimonials";
import { testimonialFixture } from "../test-fixtures";
import { TestimonialList } from "./testimonial-list";
import { TestimonialForm } from "./testimonial-form";
import { TestimonialEditor } from "./testimonial-editor";
vi.mock("next/image", () => ({ default: "img" }));
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/testimonials", () => ({ testimonialsApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), uploadLogo: vi.fn(), deleteLogo: vi.fn(), delete: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
describe("Testimonial management", () => {
  it("renders loading, customer attribution and active/inactive cards", async () => {
    vi.mocked(testimonialsApi.list).mockResolvedValue([testimonialFixture, { ...testimonialFixture, id: "second", author_name: "Other Author", is_active: false }]); render(<TestimonialList />);
    expect(screen.getByRole("status", { name: "Loading Testimonials" })).toBeInTheDocument();
    expect(await screen.findByText(testimonialFixture.author_name)).toBeInTheDocument();
    expect(screen.getAllByText(testimonialFixture.quote)).toHaveLength(2);
    expect(screen.getByText("Active")).toBeInTheDocument(); expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getAllByText("Engineering Lead · Example Company")).toHaveLength(2);
    expect(screen.getByRole("link", { name: `Edit ${testimonialFixture.author_name}` })).toHaveAttribute("href", `/testimonials/${testimonialFixture.id}/edit`);
  });
  it("renders empty and safe retryable error states", async () => {
    vi.mocked(testimonialsApi.list).mockRejectedValueOnce(new ApiError({ kind: "network", message: "private" })).mockResolvedValueOnce([]);
    render(<TestimonialList />); expect(await screen.findByText("Unable to load testimonials.")).toBeInTheDocument();
    expect(screen.queryByText("private")).not.toBeInTheDocument(); fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(await screen.findByText("No testimonials yet.")).toBeInTheDocument();
  });
  it("confirms deletion and never deletes on cancellation", async () => {
    vi.mocked(testimonialsApi.list).mockResolvedValue([testimonialFixture]); vi.mocked(testimonialsApi.delete).mockResolvedValue(undefined);
    render(<TestimonialList />); await screen.findByText(testimonialFixture.author_name);
    fireEvent.click(screen.getByRole("button", { name: `Delete ${testimonialFixture.author_name}` }));
    expect(screen.getByRole("dialog")).toHaveTextContent("cannot be undone");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" })); expect(testimonialsApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: `Delete ${testimonialFixture.author_name}` })); fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(testimonialsApi.delete).toHaveBeenCalledWith(testimonialFixture.id)); expect(await screen.findByText("No testimonials yet.")).toBeInTheDocument();
  });
  it("validates required quote and author name", () => {
    render(<TestimonialForm />); fireEvent.click(screen.getByRole("button", { name: "Create Testimonial" }));
    expect(screen.getByText("Quote is required.")).toBeInTheDocument(); expect(screen.getByText("Author name is required.")).toBeInTheDocument(); expect(testimonialsApi.create).not.toHaveBeenCalled();
  });
  it("creates with nullable optionals, editable order and active state", async () => {
    vi.mocked(testimonialsApi.create).mockResolvedValue(testimonialFixture); render(<TestimonialForm />);
    fireEvent.change(screen.getByLabelText(/^Quote/), { target: { value: " Quote " } }); fireEvent.change(screen.getByLabelText(/^Author name/), { target: { value: " Name " } });
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "4" } }); fireEvent.change(screen.getByLabelText(/^Active/), { target: { value: "false" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Testimonial" }));
    await waitFor(() => expect(testimonialsApi.create).toHaveBeenCalledWith({ quote: "Quote", author_name: "Name", author_role: null, company_name: null, company_logo_url: null, display_order: 4, is_active: false }));
    expect(push).toHaveBeenCalledWith(`/testimonials/${testimonialFixture.id}/edit?created=1`);
  });
  it("loads and updates all existing optional values", async () => {
    vi.mocked(testimonialsApi.update).mockResolvedValue({ ...testimonialFixture, quote: "Changed quote" }); render(<TestimonialForm item={testimonialFixture} />);
    expect(screen.getByLabelText("Author role")).toHaveValue(testimonialFixture.author_role);
    expect(screen.getByLabelText("Company name")).toHaveValue(testimonialFixture.company_name);
    expect(screen.getByAltText("Testimonial company logo")).toHaveAttribute("src", testimonialFixture.company_logo_url);
    fireEvent.change(screen.getByLabelText(/^Quote/), { target: { value: "Changed quote" } }); fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(testimonialsApi.update).toHaveBeenCalledWith(testimonialFixture.id, expect.objectContaining({ quote: "Changed quote", author_role: testimonialFixture.author_role, company_name: testimonialFixture.company_name })));
    expect(await screen.findByText("Testimonial changes saved.")).toBeInTheDocument();
  });
  it("loads Admin detail and uses shared editor deletion", async () => {
    vi.mocked(testimonialsApi.get).mockResolvedValue(testimonialFixture); vi.mocked(testimonialsApi.delete).mockResolvedValue(undefined);
    render(<TestimonialEditor id={testimonialFixture.id} />); expect(screen.getByRole("status", { name: "Loading Testimonial" })).toBeInTheDocument();
    expect(await screen.findByLabelText(/^Quote/)).toHaveValue(testimonialFixture.quote);
    expect(testimonialsApi.get).toHaveBeenCalledWith(testimonialFixture.id);
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/testimonials?deleted=1"));
    expect(testimonialsApi.deleteLogo).not.toHaveBeenCalled();
  });
  it.each(["authentication", "permission", "not_found", "service_unavailable", "network", "unexpected"] as const)("shows safe %s errors", async kind => {
    vi.mocked(testimonialsApi.update).mockRejectedValue(new ApiError({ kind, message: "private" })); render(<TestimonialForm item={testimonialFixture} />);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" })); await screen.findByRole("alert"); expect(screen.queryByText("private")).not.toBeInTheDocument();
  });
});
