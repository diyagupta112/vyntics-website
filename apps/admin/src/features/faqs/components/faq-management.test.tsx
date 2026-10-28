import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { faqsApi } from "../api/faqs";
import { faqFixture } from "../test-fixtures";
import { faqPageOptions } from "../lib/page-options";
import { FAQList } from "./faq-list";
import { FAQForm } from "./faq-form";
import { FAQEditor } from "./faq-editor";
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/faqs", () => ({ faqsApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } }));
beforeEach(() => { vi.resetAllMocks(); vi.mocked(faqsApi.list).mockResolvedValue([]); });

function fillCreate() {
  fireEvent.change(screen.getByLabelText(/^Page/), { target: { value: "services/cloud-foundations" } });
  fireEvent.change(screen.getByLabelText(/^Question/), { target: { value: "New question?" } });
  fireEvent.change(screen.getByLabelText(/^Answer/), { target: { value: "New answer." } });
}

describe("FAQ list and page filter", () => {
  it("renders loading, friendly page labels and active/inactive cards", async () => {
    vi.mocked(faqsApi.list).mockResolvedValue([faqFixture, { ...faqFixture, id: "faq-2", question: "Inactive question?", is_active: false }]);
    render(<FAQList />);
    expect(screen.getByRole("status", { name: "Loading FAQs" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: faqFixture.question })).toBeInTheDocument();
    expect(screen.getAllByText("Cloud Foundations").some(node => node.tagName === "P")).toBe(true);
    expect(screen.getByText("Active")).toBeInTheDocument(); expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Edit ${faqFixture.question}` })).toHaveAttribute("href", `/faqs/${faqFixture.id}/edit`);
    expect(screen.getByRole("heading", { name: faqFixture.question }).closest("a")).toBeNull();
    expect(faqsApi.list).toHaveBeenCalledWith(undefined, expect.any(AbortSignal), undefined);
  });
  it("shows empty/error states and retry", async () => {
    vi.mocked(faqsApi.list).mockRejectedValueOnce(new ApiError({ kind: "network", message: "private" })).mockResolvedValueOnce([]);
    render(<FAQList />);
    expect(await screen.findByText("Unable to load faqs.")).toBeInTheDocument();
    expect(screen.queryByText("private")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(await screen.findByText("No FAQs yet.")).toBeInTheDocument();
  });
  it.each(faqPageOptions)("filters $label using the stable key and resets All Pages", async ({ value, label }) => {
    render(<FAQList />); await screen.findByText("No FAQs yet.");
    fireEvent.change(screen.getByLabelText("Page"), { target: { value } });
    await waitFor(() => expect(faqsApi.list).toHaveBeenLastCalledWith(value, expect.any(AbortSignal), undefined));
    expect(await screen.findByText(`No FAQs for ${label}.`)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Page"), { target: { value: "" } });
    await waitFor(() => expect(faqsApi.list).toHaveBeenLastCalledWith(undefined, expect.any(AbortSignal), undefined));
  });
  it("filters by Page then Sub-page, disables Sub-page for All Pages, and clears an incompatible Sub-page", async () => {
    render(<FAQList />); await screen.findByText("No FAQs yet.");
    expect(screen.getByLabelText("Sub-page")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Page"), { target: { value: "services/ai-solutions" } });
    await waitFor(() => expect(faqsApi.list).toHaveBeenLastCalledWith("services/ai-solutions", expect.any(AbortSignal), undefined));
    expect(screen.getByLabelText("Sub-page")).toBeEnabled();
    expect(within(screen.getByLabelText("Sub-page")).queryByRole("option", { name: "Cloud Cost Optimization" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Sub-page"), { target: { value: "rag-knowledge-assistants" } });
    await waitFor(() => expect(faqsApi.list).toHaveBeenLastCalledWith("services/ai-solutions", expect.any(AbortSignal), "rag-knowledge-assistants"));
    expect(await screen.findByText("No FAQs for AI Solutions / RAG & Knowledge Assistants.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Page"), { target: { value: "services/data-engineering" } });
    await waitFor(() => expect(faqsApi.list).toHaveBeenLastCalledWith("services/data-engineering", expect.any(AbortSignal), undefined));
    expect(screen.getByLabelText("Sub-page")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("Page"), { target: { value: "" } });
    await waitFor(() => expect(faqsApi.list).toHaveBeenLastCalledWith(undefined, expect.any(AbortSignal), undefined));
    expect(screen.getByLabelText("Sub-page")).toBeDisabled();
  });
  it("discards stale responses after changing the page filter", async () => {
    let finish: (items: typeof faqFixture[]) => void = () => {};
    vi.mocked(faqsApi.list).mockReturnValueOnce(new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce([]);
    render(<FAQList />);
    fireEvent.change(screen.getByLabelText("Page"), { target: { value: "services/data-engineering" } });
    await screen.findByText("No FAQs for Data Engineering.");
    await act(async () => { finish([faqFixture]); });
    expect(screen.queryByText(faqFixture.question)).not.toBeInTheDocument();
  });
  it("uses shared delete confirmation, cancellation, successful delete and safe delete failures", async () => {
    vi.mocked(faqsApi.list).mockResolvedValue([faqFixture]);
    vi.mocked(faqsApi.delete).mockRejectedValueOnce(new ApiError({ kind: "network", message: "private" })).mockResolvedValueOnce(undefined);
    render(<FAQList />); await screen.findByText(faqFixture.question);
    fireEvent.click(screen.getByRole("button", { name: `Delete ${faqFixture.question}` }));
    expect(screen.getByRole("dialog")).toHaveTextContent("cannot be undone");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(faqsApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: `Delete ${faqFixture.question}` }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    expect(await screen.findByText(/backend could not be reached/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete Permanently" }));
    await waitFor(() => expect(faqsApi.delete).toHaveBeenLastCalledWith(faqFixture.id));
    expect(await screen.findByText("No FAQs yet.")).toBeInTheDocument();
  });
});

describe("FAQ create/edit", () => {
  it("requires page, question and answer", () => {
    render(<FAQForm />); fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    for (const label of ["Page", "Question", "Answer"]) expect(screen.getByText(`${label} is required.`)).toBeInTheDocument();
    expect(faqsApi.create).not.toHaveBeenCalled();
  });
  it("creates with a stable key, integer order and inactive state", async () => {
    vi.mocked(faqsApi.create).mockResolvedValue(faqFixture); render(<FAQForm />); fillCreate();
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/^Active/), { target: { value: "false" } });
    fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    await waitFor(() => expect(faqsApi.create).toHaveBeenCalledWith({ page: "services/cloud-foundations", sub_page: null, question: "New question?", answer: "New answer.", display_order: 3, is_active: false }));
    expect(push).toHaveBeenCalledWith(`/faqs/${faqFixture.id}/edit?created=1`);
  });
  it("loads friendly page labels on edit and submits reassignment", async () => {
    vi.mocked(faqsApi.update).mockResolvedValue({ ...faqFixture, page: "services/ai-solutions" }); render(<FAQForm item={faqFixture} />);
    expect(screen.getByLabelText(/^Page/)).toHaveDisplayValue("Cloud Foundations");
    expect(screen.getByLabelText(/^Question/)).toHaveValue(faqFixture.question);
    expect(screen.getByLabelText(/^Answer/)).toHaveValue(faqFixture.answer);
    fireEvent.change(screen.getByLabelText(/^Page/), { target: { value: "services/ai-solutions" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(faqsApi.update).toHaveBeenCalledWith(faqFixture.id, expect.objectContaining({ page: "services/ai-solutions" })));
    expect(await screen.findByText("FAQ changes saved.")).toBeInTheDocument();
  });
  it("preserves valid unknown page keys without treating the five options as an enum", async () => {
    const item = { ...faqFixture, page: "company/future-page" }; vi.mocked(faqsApi.update).mockResolvedValue(item);
    render(<FAQForm item={item} />); expect(screen.getByLabelText(/^Page/)).toHaveValue(item.page);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(faqsApi.update).toHaveBeenCalledWith(item.id, expect.objectContaining({ page: item.page })));
  });
  it("shows backend page validation through the field UI and preserves entered content", async () => {
    vi.mocked(faqsApi.create).mockRejectedValue(new ApiError({ kind: "validation", status: 422, message: "Page not accepted", validationIssues: [{ location: ["body", "page"], message: "Use a valid page key" }] }));
    render(<FAQForm />); fillCreate(); fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    expect(await screen.findByText("Use a valid page key")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Answer/)).toHaveValue("New answer.");
  });
  it("creates a main-page FAQ with sub_page null and disables Sub-page without a page", async () => {
    vi.mocked(faqsApi.create).mockResolvedValue(faqFixture); render(<FAQForm />);
    expect(screen.getByLabelText("Sub-page")).toBeDisabled();
    fillCreate();
    expect(screen.getByLabelText("Sub-page")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    await waitFor(() => expect(faqsApi.create).toHaveBeenCalledWith(expect.objectContaining({ page: "services/cloud-foundations", sub_page: null })));
  });
  it("offers configured sub-pages, submits the bare key, and clears it when the page changes", async () => {
    vi.mocked(faqsApi.create).mockResolvedValue(faqFixture); render(<FAQForm />); fillCreate();
    const sub = screen.getByLabelText("Sub-page");
    expect(within(sub).getByRole("option", { name: "Cloud Cost Optimization" })).toHaveValue("cloud-cost-optimization");
    expect(within(sub).queryByRole("option", { name: "AI Agents" })).not.toBeInTheDocument();
    fireEvent.change(sub, { target: { value: "cloud-cost-optimization" } });
    fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    await waitFor(() => expect(faqsApi.create).toHaveBeenCalledWith(expect.objectContaining({ page: "services/cloud-foundations", sub_page: "cloud-cost-optimization" })));
    fireEvent.change(screen.getByLabelText(/^Page/), { target: { value: "services/ai-solutions" } });
    expect(screen.getByLabelText("Sub-page")).toHaveValue("");
    expect(within(screen.getByLabelText("Sub-page")).getByRole("option", { name: "AI Agents" })).toBeInTheDocument();
  });
  it("disables Sub-page for a page without configured sub-pages", () => {
    render(<FAQForm item={{ ...faqFixture, page: "company/future-page" }} />);
    expect(screen.getByLabelText("Sub-page")).toBeDisabled();
  });
  it("hydrates an existing sub-page and clears it only on explicit change", async () => {
    vi.mocked(faqsApi.update).mockResolvedValue(faqFixture);
    render(<FAQForm item={{ ...faqFixture, sub_page: "devops-reliability" }} />);
    expect(screen.getByLabelText("Sub-page")).toHaveValue("devops-reliability");
    fireEvent.change(screen.getByLabelText("Sub-page"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(faqsApi.update).toHaveBeenCalledWith(faqFixture.id, expect.objectContaining({ sub_page: null })));
  });
  it("preserves an unknown existing sub-page on save", async () => {
    vi.mocked(faqsApi.update).mockResolvedValue(faqFixture);
    render(<FAQForm item={{ ...faqFixture, sub_page: "some-new-page" }} />);
    expect(screen.getByLabelText("Sub-page")).toHaveValue("some-new-page");
    expect(screen.getByRole("option", { name: "some-new-page (existing)" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Question/), { target: { value: "Edited?" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(faqsApi.update).toHaveBeenCalledWith(faqFixture.id, expect.objectContaining({ page: "services/cloud-foundations", sub_page: "some-new-page" })));
  });
  it("shows the sub-page in the list", async () => {
    vi.mocked(faqsApi.list).mockResolvedValue([{ ...faqFixture, sub_page: "cloud-cost-optimization" }]);
    render(<FAQList />);
    expect(await screen.findByText("Cloud Foundations / Cloud Cost Optimization")).toBeInTheDocument();
  });
  it("starts with a blank order, omits it on create, and rejects 0", async () => {
    vi.mocked(faqsApi.create).mockResolvedValue(faqFixture); render(<FAQForm />); fillCreate();
    const order = screen.getByLabelText(/^Display order/);
    expect(order).toHaveValue(null);
    expect(screen.getByText("Leave blank to add this item to the end.")).toBeInTheDocument();
    fireEvent.change(order, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    expect(await screen.findByText("Display order must be a whole number of 1 or more.")).toBeInTheDocument();
    expect(faqsApi.create).not.toHaveBeenCalled();
    fireEvent.change(order, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Create FAQ" }));
    await waitFor(() => expect(faqsApi.create).toHaveBeenCalledTimes(1));
    expect(vi.mocked(faqsApi.create).mock.calls[0]![0]).not.toHaveProperty("display_order");
  });
  it("shows a backend display order error without retrying or changing the value", async () => {
    vi.mocked(faqsApi.update).mockRejectedValue(new ApiError({ kind: "validation", status: 422, message: "Invalid input.", validationIssues: [{ location: ["body", "display_order"], message: "Position is not allowed.", type: "value_error" }] }));
    render(<FAQForm item={{ ...faqFixture, display_order: 4 }} />);
    expect(screen.getByLabelText(/^Display order/)).toHaveValue(4);
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(await screen.findByText("Position is not allowed.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Display order/)).toHaveValue(9);
    expect(faqsApi.update).toHaveBeenCalledTimes(1);
  });
  it("loads Admin detail and handles missing records safely", async () => {
    vi.mocked(faqsApi.get).mockRejectedValueOnce(new ApiError({ kind: "not_found", status: 404, message: "private" })).mockResolvedValueOnce(faqFixture);
    render(<FAQEditor id={faqFixture.id} />);
    expect(screen.getByRole("status", { name: "Loading FAQ" })).toBeInTheDocument();
    expect(await screen.findByText("This record no longer exists.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(await screen.findByLabelText(/^Page/)).toHaveDisplayValue("Cloud Foundations");
    expect(faqsApi.get).toHaveBeenCalledWith(faqFixture.id);
  });
});
