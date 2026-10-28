import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { lifeAtVynticsApi } from "../api/life-at-vyntics";
import { lifeFixture } from "../test-fixtures";
import { ImageControl, validateLifeImage } from "./image-control";
import { LifeCreate } from "./life-create";
import { LifeEditor } from "./life-editor";

const push = vi.fn();
vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../api/life-at-vyntics", () => ({ lifeAtVynticsApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), uploadImage: vi.fn(), deleteImage: vi.fn() } }));

const png = () => new File(["image"], "a.png", { type: "image/png" });
const chooseImage = (file: File) => fireEvent.change(screen.getByLabelText(/^Image/), { target: { files: [file] } });
const created = { ...lifeFixture, image_url: null, display_order: 4 };

describe("Life at Vyntics create", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(lifeAtVynticsApi.list).mockResolvedValue([lifeFixture, lifeFixture, lifeFixture]); });
  it("shows only image and a blank order, without calculating a position", () => {
    render(<LifeCreate />);
    expect(screen.getByLabelText(/^Display order/)).toHaveValue(null);
    expect(lifeAtVynticsApi.list).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/Title|Description|Active/)).toBeNull();
  });
  it("creates with the order, then uploads using the returned id", async () => {
    vi.mocked(lifeAtVynticsApi.create).mockResolvedValue(created);
    vi.mocked(lifeAtVynticsApi.uploadImage).mockResolvedValue(lifeFixture);
    render(<LifeCreate />);
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "1" } });
    const file = png();
    chooseImage(file);
    fireEvent.click(screen.getByRole("button", { name: "Add Image" }));
    await waitFor(() => expect(lifeAtVynticsApi.uploadImage).toHaveBeenCalledWith("life-1", file));
    expect(lifeAtVynticsApi.create).toHaveBeenCalledWith({ display_order: 1 });
    expect(lifeAtVynticsApi.update).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/life-at-vyntics");
  });
  it("omits the order when blank and validates order and image before any request", async () => {
    vi.mocked(lifeAtVynticsApi.list).mockRejectedValue(new Error("x"));
    vi.mocked(lifeAtVynticsApi.create).mockResolvedValue(created);
    vi.mocked(lifeAtVynticsApi.uploadImage).mockResolvedValue(lifeFixture);
    render(<LifeCreate />);
    fireEvent.click(screen.getByRole("button", { name: "Add Image" }));
    expect(await screen.findByText("Choose an image to upload.")).toBeInTheDocument();
    for (const bad of ["0", "-2", "1.5"]) {
      fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: bad } });
      chooseImage(png());
      fireEvent.click(screen.getByRole("button", { name: "Add Image" }));
      expect(await screen.findByText(/whole number of 1 or more/)).toBeInTheDocument();
    }
    expect(lifeAtVynticsApi.create).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Image" }));
    await waitFor(() => expect(lifeAtVynticsApi.create).toHaveBeenCalledWith({}));
  });
  it("shows backend order validation on the field and creates nothing else", async () => {
    vi.mocked(lifeAtVynticsApi.create).mockRejectedValue(new ApiError({ kind: "validation", message: "Invalid input.", validationIssues: [{ location: ["body", "display_order"], message: "Order is bad.", type: "value_error" }] }));
    render(<LifeCreate />);
    chooseImage(png());
    fireEvent.change(screen.getByLabelText(/^Display order/), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Image" }));
    expect(await screen.findByText("Order is bad.")).toBeInTheDocument();
    expect(lifeAtVynticsApi.uploadImage).not.toHaveBeenCalled();
  });
  it("keeps the created record when the upload fails and retries only the upload", async () => {
    vi.mocked(lifeAtVynticsApi.create).mockResolvedValue(created);
    vi.mocked(lifeAtVynticsApi.uploadImage).mockRejectedValueOnce(new ApiError({ kind: "validation", message: "Unsupported image content." })).mockResolvedValueOnce(lifeFixture);
    render(<LifeCreate />);
    chooseImage(png());
    fireEvent.click(screen.getByRole("button", { name: "Add Image" }));
    expect(await screen.findByText(/created at position 4, but the image could not be uploaded/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Upload Image" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/life-at-vyntics"));
    expect(lifeAtVynticsApi.create).toHaveBeenCalledTimes(1);
    expect(lifeAtVynticsApi.create).toHaveBeenCalledWith({});
    expect(lifeAtVynticsApi.uploadImage).toHaveBeenCalledTimes(2);
  });
});

describe("Life at Vyntics edit", () => {
  beforeEach(() => vi.clearAllMocks());
  it("PATCHes only display_order and shows the backend-stored position", async () => {
    vi.mocked(lifeAtVynticsApi.get).mockResolvedValueOnce(lifeFixture).mockResolvedValueOnce({ ...lifeFixture, display_order: 5 });
    vi.mocked(lifeAtVynticsApi.update).mockResolvedValue({ ...lifeFixture, display_order: 5 });
    render(<LifeEditor itemId="life-1" />);
    expect(screen.getByRole("status", { name: "Loading Life at Vyntics image" })).toBeInTheDocument();
    expect(await screen.findByLabelText(/^Position/)).toHaveValue(2);
    expect(screen.queryByLabelText(/Title|Description|Active/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/^Position/), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Order" }));
    await waitFor(() => expect(lifeAtVynticsApi.update).toHaveBeenCalledWith("life-1", { display_order: 9 }));
    expect(Object.keys(vi.mocked(lifeAtVynticsApi.update).mock.calls[0]![1])).toEqual(["display_order"]);
    expect(await screen.findByText("Display order saved.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Position/)).toHaveValue(5);
    expect(lifeAtVynticsApi.get).toHaveBeenCalledTimes(2);
  });
  it("does not request anything for an unchanged or invalid order", async () => {
    vi.mocked(lifeAtVynticsApi.get).mockResolvedValue(lifeFixture);
    render(<LifeEditor itemId="life-1" />);
    await screen.findByLabelText(/^Position/);
    fireEvent.click(screen.getByRole("button", { name: "Save Order" }));
    fireEvent.change(screen.getByLabelText(/^Position/), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Order" }));
    expect(await screen.findByText(/whole number of 1 or more/)).toBeInTheDocument();
    expect(lifeAtVynticsApi.update).not.toHaveBeenCalled();
  });
  it("shows backend order errors and failures", async () => {
    vi.mocked(lifeAtVynticsApi.get).mockResolvedValue(lifeFixture);
    vi.mocked(lifeAtVynticsApi.update).mockRejectedValue(new ApiError({ kind: "validation", message: "Invalid input.", validationIssues: [{ location: ["body", "display_order"], message: "Order is bad.", type: "value_error" }] }));
    render(<LifeEditor itemId="life-1" />);
    await screen.findByLabelText(/^Position/);
    fireEvent.change(screen.getByLabelText(/^Position/), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Order" }));
    expect(await screen.findAllByText("Order is bad.")).not.toHaveLength(0);
    expect(screen.getByText("Order was not saved")).toBeInTheDocument();
  });
  it("shows a load error", async () => {
    vi.mocked(lifeAtVynticsApi.get).mockRejectedValue(new ApiError({ kind: "not_found", message: "secret" }));
    render(<LifeEditor itemId="missing" />);
    expect(await screen.findByText("This Life at Vyntics image no longer exists.")).toBeInTheDocument();
  });
  it("confirms before permanent deletion, which is separate from image removal", async () => {
    vi.mocked(lifeAtVynticsApi.get).mockResolvedValue(lifeFixture);
    vi.mocked(lifeAtVynticsApi.delete).mockResolvedValue(undefined);
    render(<LifeEditor itemId="life-1" />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete Permanently" }));
    expect(lifeAtVynticsApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Delete Permanently" })[1]!);
    await waitFor(() => expect(lifeAtVynticsApi.delete).toHaveBeenCalledWith("life-1"));
    expect(lifeAtVynticsApi.deleteImage).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/life-at-vyntics?deleted=1");
  });
});

describe("ImageControl", () => {
  beforeEach(() => vi.clearAllMocks());
  it("replaces and removes the image without touching the record or order", async () => {
    vi.mocked(lifeAtVynticsApi.uploadImage).mockResolvedValue({ ...lifeFixture, image_url: "https://example.com/new.webp" });
    vi.mocked(lifeAtVynticsApi.deleteImage).mockResolvedValue(undefined);
    const onChanged = vi.fn();
    render(<ImageControl item={lifeFixture} onChanged={onChanged} />);
    const file = new File(["image"], "a.webp", { type: "image/webp" });
    fireEvent.change(screen.getByLabelText("Choose Life at Vyntics image"), { target: { files: [file] } });
    await waitFor(() => expect(lifeAtVynticsApi.uploadImage).toHaveBeenCalledWith("life-1", file));
    expect(await screen.findByText("Image replaced.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Image" }));
    await waitFor(() => expect(lifeAtVynticsApi.deleteImage).toHaveBeenCalledWith("life-1"));
    expect(onChanged).toHaveBeenLastCalledWith(expect.objectContaining({ image_url: null, display_order: 2 }));
    expect(lifeAtVynticsApi.delete).not.toHaveBeenCalled();
    expect(lifeAtVynticsApi.update).not.toHaveBeenCalled();
  });
  it("shows backend rejection and removal failures", async () => {
    vi.mocked(lifeAtVynticsApi.uploadImage).mockRejectedValue(new ApiError({ kind: "validation", message: "Unsupported image content." }));
    vi.mocked(lifeAtVynticsApi.deleteImage).mockRejectedValue(new ApiError({ kind: "service_unavailable", message: "x" }));
    render(<ImageControl item={lifeFixture} onChanged={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Choose Life at Vyntics image"), { target: { files: [png()] } });
    expect(await screen.findByText("Unsupported image content.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Image" }));
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
  });
  it("validates type and size client-side", () => {
    expect(validateLifeImage(new File([], "e.png", { type: "image/png" }))).toMatch(/non-empty/);
    expect(validateLifeImage(new File(["x"], "a.svg", { type: "image/svg+xml" }))).toMatch(/JPEG/);
    expect(validateLifeImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "a.png", { type: "image/png" }))).toMatch(/5 MB/);
    expect(validateLifeImage(new File(["x"], "a.jpg", { type: "image/jpeg" }))).toBeUndefined();
  });
});
